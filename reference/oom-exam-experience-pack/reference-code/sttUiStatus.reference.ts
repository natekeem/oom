export type SttUiStatus =
  | "unconfigured"
  | "ready"
  | "transcribing"
  | "success"
  | "error";

export function deriveSttUiStatus(args: {
  endpoint?: string;
  isTranscribing: boolean;
  transcript: string;
  error?: string | null;
}): SttUiStatus {
  if (!args.endpoint?.trim()) return "unconfigured";
  if (args.isTranscribing) return "transcribing";
  if (args.error) return "error";
  if (args.transcript.trim()) return "success";
  return "ready";
}
