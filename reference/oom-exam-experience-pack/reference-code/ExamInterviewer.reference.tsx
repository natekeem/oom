import { Volume2 } from "lucide-react";

type ExamInterviewerProps = {
  src?: string;
  name?: string;
  recording?: boolean;
};

/**
 * Reference component.
 * Use the generated EVA image in /public/assets/exam/eva-interviewer.png
 * or replace it with another original/licensed image.
 */
export function ExamInterviewer({
  src = "/assets/exam/eva-interviewer.png",
  name = "EVA",
  recording = false,
}: ExamInterviewerProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 text-white">
      <div className="relative aspect-[4/3] bg-zinc-800">
        <img
          alt="가상 인터뷰어"
          className="h-full w-full object-cover object-top"
          src={src}
        />
        {recording ? (
          <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Recording
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3">
        <div>
          <p className="text-sm font-bold">{name}</p>
          <p className="mt-0.5 text-[11px] text-zinc-400">Virtual Interviewer</p>
        </div>
        <Volume2 aria-hidden="true" className="h-4 w-4 text-zinc-400" />
      </div>
    </section>
  );
}
