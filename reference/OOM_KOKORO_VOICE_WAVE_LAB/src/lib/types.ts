export type LabMode = "exam" | "script";
export type WaveStyle = "studio" | "soft" | "voiceprint";

export type VoiceCandidate = {
  id: string;
  label: string;
  grade: string;
  note: string;
};

export type GeneratedClip = {
  key: string;
  voiceId: string;
  mode: LabMode;
  speed: number;
  text: string;
  blob: Blob;
  elapsedMs: number;
  createdAt: number;
};

export type LoadState =
  | { status: "idle"; progress: 0; detail: string }
  | { status: "loading"; progress: number; detail: string }
  | { status: "ready"; progress: 100; detail: string }
  | { status: "error"; progress: number; detail: string };
