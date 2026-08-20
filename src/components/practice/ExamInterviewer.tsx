import { Volume2 } from "lucide-react";

export type ExamInterviewerProps = {
  src?: string;
  name?: string;
  recording?: boolean;
  isSpeaking?: boolean;
  annotationBadge?: string | number;
};

/**
 * Visual interviewer component (EVA).
 * Used in STEP 6 practice shell and /exam-guide/screen/ guide view.
 */
export function ExamInterviewer({
  src = "/assets/exam/eva-interviewer.png",
  name = "EVA",
  recording = false,
  isSpeaking = false,
  annotationBadge,
}: ExamInterviewerProps) {
  return (
    <section
      aria-label="가상 인터뷰어 영역"
      className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-white shadow-md"
    >
      {annotationBadge !== undefined ? (
        <div className="absolute left-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full bg-indigo-600 text-xs font-black text-white shadow-lg ring-2 ring-white">
          {annotationBadge}
        </div>
      ) : null}

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
        <img
          alt="가상 인터뷰어 EVA"
          className="h-full w-full object-cover object-top"
          src={src}
        />

        {recording ? (
          <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
            Recording
          </div>
        ) : isSpeaking ? (
          <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-400" />
            Playing
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/90 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="mt-0.5 text-[11px] text-zinc-400">Virtual Interviewer</p>
        </div>
        <Volume2 aria-hidden="true" className="h-4 w-4 text-zinc-400" />
      </div>
    </section>
  );
}
