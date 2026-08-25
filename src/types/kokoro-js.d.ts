declare module "kokoro-js" {
  export type KokoroProgress = {
    status?: string;
    file?: string;
    progress?: number;
    loaded?: number;
    total?: number;
  };

  export type KokoroVoiceId =
    | "af_heart"
    | "af_bella"
    | "af_sarah"
    | "af_sky";

  export type KokoroRawAudio = {
    audio: Float32Array;
    sampling_rate: number;
    toBlob: () => Blob;
  };

  export type KokoroStreamChunk = {
    text: string;
    phonemes: string;
    audio: KokoroRawAudio;
  };

  export class TextSplitterStream {
    push(...texts: string[]): void;
    close(): void;
    flush(): void;
    readonly sentences: string[];
    [Symbol.asyncIterator](): AsyncGenerator<string, void, void>;
  }

  export class KokoroTTS {
    static from_pretrained(
      modelId: string,
      options?: {
        dtype?: "fp32" | "fp16" | "q8" | "q4" | "q4f16";
        device?: "wasm" | "webgpu" | "cpu" | null;
        progress_callback?: (payload: KokoroProgress) => void;
      },
    ): Promise<KokoroTTS>;

    generate(
      text: string,
      options?: { voice?: KokoroVoiceId; speed?: number },
    ): Promise<KokoroRawAudio>;

    stream(
      text: string | TextSplitterStream,
      options?: {
        voice?: KokoroVoiceId;
        speed?: number;
        split_pattern?: RegExp;
      },
    ): AsyncGenerator<KokoroStreamChunk, void, void>;

    model?: {
      dispose?: () => Promise<void> | void;
    };
  }
}
