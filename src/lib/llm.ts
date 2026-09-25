import type { LlmMessage, LlmSettings } from "../types";

function buildBody(settings: LlmSettings, messages: LlmMessage[]) {
  if (settings.mode === "custom") {
    if (!settings.customBodyTemplate?.trim()) {
      throw new Error("Custom JSON 모드에는 Request Body Template이 필요합니다.");
    }

    const system = messages.find((message) => message.role === "system")?.content ?? "";
    const user = messages.filter((message) => message.role === "user").map((message) => message.content).join("\n\n");
    const parsed = [
      ["{model}", JSON.stringify(settings.model ?? "")],
      ["{messages}", JSON.stringify(messages)],
      ["{system}", JSON.stringify(system)],
      ["{user}", JSON.stringify(user)],
    ].reduce((template, [token, value]) => template.split(token).join(value), settings.customBodyTemplate);

    try {
      return JSON.parse(parsed) as Record<string, unknown>;
    } catch {
      throw new Error("Custom JSON Template 형식이 올바르지 않습니다. 문자열 토큰에는 따옴표를 추가하지 마세요.");
    }
  }

  if (settings.mode === "generic") {
    return { model: settings.model || undefined, messages, temperature: 0.4 };
  }

  return { model: settings.model || undefined, messages, temperature: 0.4 };
}

function extractText(payload: unknown) {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return "응답 형식을 읽을 수 없습니다.";

  const response = payload as Record<string, unknown>;
  const choices = response.choices;
  if (Array.isArray(choices) && choices[0] && typeof choices[0] === "object") {
    const firstChoice = choices[0] as Record<string, unknown>;
    const message = firstChoice.message as Record<string, unknown> | undefined;
    if (typeof message?.content === "string") return message.content;
    if (typeof firstChoice.text === "string") return firstChoice.text;
  }
  if (typeof response.content === "string") return response.content;
  if (typeof response.message === "string") return response.message;
  if (typeof response.output_text === "string") return response.output_text;
  if (typeof response.text === "string") return response.text;

  return JSON.stringify(payload, null, 2);
}

export async function callInternalLlm(settings: LlmSettings, messages: LlmMessage[]): Promise<string> {
  if (!settings.endpoint.trim()) {
    throw new Error("AI 설정에서 API Endpoint URL을 입력해 주세요.");
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (settings.apiKey?.trim() && settings.authType === "bearer") {
    headers.Authorization = `Bearer ${settings.apiKey.trim()}`;
  }
  if (settings.apiKey?.trim() && settings.authType === "x-api-key") {
    headers["x-api-key"] = settings.apiKey.trim();
  }

  let response: Response;
  try {
    response = await fetch(settings.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(buildBody(settings, messages)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "네트워크 요청에 실패했습니다.";
    throw new Error(`LLM 요청에 실패했습니다: ${message}`, { cause: error });
  }

  const raw = await response.text();
  let payload: unknown = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    // Plain text responses are also accepted for internal adapters.
  }

  if (!response.ok) {
    throw new Error(`LLM 요청이 ${response.status}로 실패했습니다. 연결 설정을 확인해 주세요.`);
  }

  return extractText(payload);
}
