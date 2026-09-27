export type SttUiStatus =
  | "unconfigured"
  | "login_required"
  | "ready"
  | "transcribing"
  | "success"
  | "edited"
  | "error";

export function deriveSttUiStatus(args: {
  endpoint?: string;
  isLoggedIn?: boolean;
  hasCustomStt?: boolean;
  isTranscribing: boolean;
  transcript: string;
  isEdited?: boolean;
  error?: string | null;
}): SttUiStatus {
  if (args.isTranscribing) return "transcribing";
  if (args.error) return "error";

  if (args.transcript.trim()) {
    return args.isEdited ? "edited" : "success";
  }

  const customActive = Boolean(args.endpoint?.trim() || args.hasCustomStt);
  if (customActive) return "ready";

  if (args.isLoggedIn) return "ready";

  return "login_required";
}
