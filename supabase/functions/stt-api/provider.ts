export interface SttProviderResult {
  transcript: string;
  language?: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
}

export interface SttProvider {
  transcribe(
    audioBytes: Uint8Array,
    mimeType: string,
    model: string,
    signal?: AbortSignal
  ): Promise<SttProviderResult>;
}

export class SttProviderError extends Error {
  readonly code:
    | "PROVIDER_TIMEOUT"
    | "PROVIDER_UNAVAILABLE"
    | "EMPTY_TRANSCRIPT"
    | "UNSUPPORTED_AUDIO_FORMAT"
    | "SERVER_ERROR";
  readonly details?: unknown;

  constructor(
    code:
      | "PROVIDER_TIMEOUT"
      | "PROVIDER_UNAVAILABLE"
      | "EMPTY_TRANSCRIPT"
      | "UNSUPPORTED_AUDIO_FORMAT"
      | "SERVER_ERROR",
    message?: string,
    details?: unknown
  ) {
    super(message || code);
    this.name = "SttProviderError";
    this.code = code;
    this.details = details;
  }
}

const OPIC_VOCABULARY_BIAS = ["OPIc", "AL", "IH", "IM1", "IM2", "IM3"];

export function geminiSttProvider(apiKey: string): SttProvider {
  return {
    async transcribe(
      audioBytes: Uint8Array,
      mimeType: string,
      model: string,
      signal?: AbortSignal
    ): Promise<SttProviderResult> {
      if (!apiKey) {
        throw new SttProviderError("SERVER_ERROR", "GEMINI_API_KEY is not configured on the server.");
      }

      // Step 1: Upload audio to Gemini Files API
      let fileUri = "";
      let fileName = "";
      const uploadTimeout = AbortSignal.timeout(35000);
      const combinedSignal = signal
        ? AbortSignal.any([signal, uploadTimeout])
        : uploadTimeout;

      try {
        const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "X-Goog-Upload-Protocol": "media",
            "X-Goog-Upload-Header-Content-Length": audioBytes.byteLength.toString(),
            "X-Goog-Upload-Header-Content-Type": mimeType,
            "Content-Type": mimeType,
          },
          body: audioBytes,
          signal: combinedSignal,
        });

        if (!uploadResponse.ok) {
          const status = uploadResponse.status;
          if (status === 400 || status === 415) {
            throw new SttProviderError("UNSUPPORTED_AUDIO_FORMAT", `Audio format rejected: ${status}`);
          }
          throw new SttProviderError("PROVIDER_UNAVAILABLE", `Files API error ${status}`);
        }

        const uploadData = (await uploadResponse.json()) as { file?: { name?: string; uri?: string } };
        fileName = uploadData.file?.name ?? "";
        fileUri = uploadData.file?.uri ?? "";

        if (!fileUri) {
          throw new SttProviderError("PROVIDER_UNAVAILABLE", "Failed to retrieve uploaded file URI.");
        }
      } catch (err) {
        if (err instanceof SttProviderError) throw err;
        if (combinedSignal.aborted) {
          throw new SttProviderError("PROVIDER_TIMEOUT", "Audio upload timed out.");
        }
        throw new SttProviderError("PROVIDER_UNAVAILABLE", "Failed to reach Gemini Files API.");
      }

      // Step 2: Call Interactions API with gemini-3.5-transcribe and verbatim mode
      try {
        const interactionsUrl = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`;
        const requestPayload = {
          model,
          input: [
            {
              type: "audio",
              uri: fileUri,
              mime_type: mimeType,
            },
          ],
          generation_config: {
            transcription_config: {
              mode: "verbatim",
              language_code: "en-US",
              custom_vocabulary: OPIC_VOCABULARY_BIAS,
            },
          },
        };

        const response = await fetch(interactionsUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
          signal: combinedSignal,
        });

        if (!response.ok) {
          const status = response.status;
          if (status === 504 || status === 408) {
            throw new SttProviderError("PROVIDER_TIMEOUT", "Gemini transcription timed out.");
          }
          if (status >= 500) {
            throw new SttProviderError("PROVIDER_UNAVAILABLE", `Gemini returned ${status}`);
          }
          throw new SttProviderError("PROVIDER_UNAVAILABLE", `Gemini error ${status}`);
        }

        const data = (await response.json()) as Record<string, unknown>;

        // Extract transcript text flexibly
        let transcript = "";

        // Check 1: candidates[0].content.parts[0].audioTranscription.text
        const candidates = data.candidates as Array<{
          content?: {
            parts?: Array<{
              audioTranscription?: { text?: string };
              text?: string;
            }>;
          };
        }> | undefined;

        if (Array.isArray(candidates) && candidates.length > 0) {
          const parts = candidates[0]?.content?.parts;
          if (Array.isArray(parts) && parts.length > 0) {
            transcript = parts[0]?.audioTranscription?.text || parts[0]?.text || "";
          }
        }

        // Check 2: direct output_text / transcript / text
        if (!transcript) {
          if (typeof data.output_text === "string") transcript = data.output_text;
          else if (typeof data.transcript === "string") transcript = data.transcript;
          else if (typeof data.text === "string") transcript = data.text;
        }

        transcript = transcript.trim();
        if (!transcript) {
          throw new SttProviderError("EMPTY_TRANSCRIPT", "Gemini returned an empty transcript.");
        }

        // Extract usage tokens if provided
        const usage = data.usageMetadata as {
          promptTokenCount?: number;
          candidatesTokenCount?: number;
        } | undefined;

        return {
          transcript,
          language: "en-US",
          inputTokens: usage?.promptTokenCount ?? null,
          outputTokens: usage?.candidatesTokenCount ?? null,
        };
      } catch (err) {
        if (err instanceof SttProviderError) throw err;
        if (combinedSignal.aborted) {
          throw new SttProviderError("PROVIDER_TIMEOUT", "Transcription processing timed out.");
        }
        throw new SttProviderError("PROVIDER_UNAVAILABLE", "Failed to call Gemini transcribe.");
      } finally {
        // Step 3: Temporary provider file cleanup (delete file immediately, never expose URI)
        if (fileName) {
          const cleanFileName = fileName.replace(/^\/+/, "");
          fetch(`https://generativelanguage.googleapis.com/v1beta/${cleanFileName}?key=${apiKey}`, {
            method: "DELETE",
          }).catch(() => {
            // Ignore delete error; files auto-expire in 48 hours anyway
          });
        }
      }
    },
  };
}
