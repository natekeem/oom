import type { RoleplayQuestionResult } from "../../../shared/ai/features";
import { Badge } from "../ui/Badge";

export type PresentedRoleplayPrompt = {
  scenario?: string;
  prompt: string;
  cues?: readonly string[];
  generated?: boolean;
};

export function presentGeneratedRoleplayPrompt(
  result: RoleplayQuestionResult,
  fallbackScenario: string,
): PresentedRoleplayPrompt {
  return result.schemaVersion === 2
    ? { scenario: result.scenario, prompt: result.prompt, cues: result.cues, generated: true }
    : { scenario: fallbackScenario, prompt: result.prompt, generated: true };
}

export function RoleplayPromptPanel({ scenario, prompt, cues, generated = false }: PresentedRoleplayPrompt) {
  return (
    <section aria-label="롤플레이 연습 질문" className="mt-4 rounded-md border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">상황</p>
        <Badge tone={generated ? "indigo" : "default"}>{generated ? "AI 새 질문" : "기본 연습"}</Badge>
      </div>
      {scenario ? <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{scenario}</p> : <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">추가 상황 설명 없이 질문의 핵심 과제에 집중하세요.</p>}

      <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-300">연습 질문</h3>
        <p className="mt-2 text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100">{prompt}</p>
      </div>

      {cues?.length ? (
        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-200">핵심 체크</h3>
          <ul className="mt-2 grid gap-1.5">
            {cues.slice(0, 4).map((cue) => <li className="flex gap-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300" key={cue}><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />{cue}</li>)}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
