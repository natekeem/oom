import { Clipboard, Highlighter, ListTree, LoaderCircle, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { callInternalLlm } from "../../lib/llm";
import { cn } from "../../lib/utils";
import type { LlmSettings, ScriptItem } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { MemoryModeToggle, type MemoryMode } from "./MemoryModeToggle";
import { TtsControls } from "./TtsControls";

type ScriptDetailProps = {
  script: ScriptItem;
  settings: LlmSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
};

const allFillers = [
  "You know",
  "I mean",
  "Actually",
  "To be honest",
  "What I'm trying to say is",
  "Let me think",
  "That's a tough question",
  "The thing is",
  "It was really memorable",
];

function HighlightedText({ text, active }: { text: string; active: boolean }) {
  const parts = useMemo(() => text.split(new RegExp(`(${allFillers.map((filler) => filler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi")), [text]);
  if (!active) return <>{text}</>;

  return (
    <>
      {parts.map((part, index) => {
        const isFiller = allFillers.some((filler) => filler.toLowerCase() === part.toLowerCase());
        return isFiller ? <mark className="rounded bg-amber-100 px-1 py-0.5 text-zinc-950 dark:bg-amber-400 dark:text-zinc-950" key={`${part}-${index}`}>{part}</mark> : <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

const paragraphStyles = [
  {
    label: "INTRO",
    description: "장면 열기",
    className: "bg-indigo-50/60 dark:bg-indigo-950/25",
    badgeClassName: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
  },
  {
    label: "MAIN",
    description: "구체 활동",
    className: "bg-emerald-50/60 dark:bg-emerald-950/25",
    badgeClassName: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  },
  {
    label: "FINISH",
    description: "느낌과 마무리",
    className: "bg-amber-50/60 dark:bg-amber-950/25",
    badgeClassName: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  },
] as const;

function StructuredScript({ script, fillersVisible, structureVisible }: { script: ScriptItem; fillersVisible: boolean; structureVisible: boolean }) {
  const paragraphs = script.englishScript.trim().split(/\n\s*\n/).filter(Boolean);

  return (
    <div className={structureVisible ? "space-y-3" : "space-y-4"}>
      {paragraphs.map((paragraph, index) => {
        const style = index === 0 ? paragraphStyles[0] : index === paragraphs.length - 1 ? paragraphStyles[2] : paragraphStyles[1];
        if (!structureVisible) return <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-200" key={`${style.label}-${index}`}><HighlightedText active={fillersVisible} text={paragraph} /></p>;
        return (
          <section className={`rounded-md p-4 ${style.className}`} key={`${style.label}-${index}`}>
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded px-2 py-1 text-[11px] font-bold tracking-[0.12em] ${style.badgeClassName}`}>{style.label}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{style.description}</span>
            </div>
            <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-200"><HighlightedText active={fillersVisible} text={paragraph} /></p>
          </section>
        );
      })}
    </div>
  );
}

export function ScriptDetail({ script, settings, onToast }: ScriptDetailProps) {
  const [memoryMode, setMemoryMode] = useState<MemoryMode>("full");
  const [fillersVisible, setFillersVisible] = useState(false);
  const [structureVisible, setStructureVisible] = useState(false);
  const [revealBlind, setRevealBlind] = useState(false);
  const [variation, setVariation] = useState("");
  const [variationLoading, setVariationLoading] = useState(false);

  const copyScript = async () => {
    try {
      if (!navigator.clipboard) throw new Error("클립보드 권한이 없습니다.");
      await navigator.clipboard.writeText(script.englishScript);
      onToast("영어 스크립트를 복사했습니다.", "연습 노트나 메신저에 바로 붙여 넣을 수 있습니다.", "success");
    } catch (error) {
      onToast("복사하지 못했습니다.", error instanceof Error ? error.message : "브라우저 권한을 확인해 주세요.", "error");
    }
  };

  const createVariation = async () => {
    if (!settings.endpoint.trim()) {
      onToast("AI 설정이 필요합니다.", "AI 피드백 / 설정에서 Endpoint를 저장한 뒤 다시 시도해 주세요.", "info");
      return;
    }
    setVariationLoading(true);
    try {
      const result = await callInternalLlm(settings, [
        { role: "system", content: "You are an OPIc English speaking coach. Return natural, spoken English. Keep vocabulary accessible for IM3 to AL." },
        { role: "user", content: `Rewrite the OPIc script below naturally. Keep the original topic and core nouns, avoid difficult words, retain a few natural filler phrases, and return: 1) a 60-90 second English script, 2) three short bullet points for what changed.\n\nTitle: ${script.title}\nKeywords: ${script.keywords.join(", ")}\n\nOriginal script:\n${script.englishScript}` },
      ]);
      setVariation(result);
      onToast("자연스러운 변형을 만들었습니다.", "원본과 비교해 내 표현으로 바꿔 보세요.", "success");
    } catch (error) {
      onToast("AI 변형에 실패했습니다.", error instanceof Error ? error.message : "설정과 CORS 정책을 확인해 주세요.", "error");
    } finally {
      setVariationLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="border-b border-zinc-100 px-5 py-5 dark:border-zinc-800 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{script.group}</p>
              <h2 className="mt-1 text-xl font-bold text-zinc-950 dark:text-white sm:text-2xl">{script.title}</h2>
            </div>
            <Badge tone="indigo">목표 {script.goalLevel}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{script.surveyBadges.map((badge) => <Badge key={badge}>{badge}</Badge>)}</div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <section>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">핵심 전략</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{script.strategy}</p>
            </section>
            <section>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">커버 가능한 질문</h3>
              <ul className="mt-2 space-y-2">{script.covers.map((cover) => <li className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-300" key={cover}><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{cover}</li>)}</ul>
            </section>
          </div>
          <aside className="rounded-md bg-zinc-50 p-4 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">KEYWORDS</p>
            <div className="mt-3 flex flex-wrap gap-2">{script.keywords.map((keyword) => <Badge key={keyword} tone="emerald">{keyword}</Badge>)}</div>
            <p className="mt-5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">예상 질문</p>
            <div className="mt-2 space-y-2">{script.expectedQuestions.map((question) => <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-300" key={question}>“{question}”</p>)}</div>
          </aside>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">암기 모드</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">전체 문장부터 키워드 회상까지 단계적으로 줄여 보세요.</p>
          </div>
          <MemoryModeToggle mode={memoryMode} onChange={setMemoryMode} />
        </div>

        {memoryMode === "full" ? <div className="mt-5 rounded-md border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950"><p className="text-sm leading-6 text-indigo-900 dark:text-indigo-100">{script.koreanSummary}</p></div> : null}
        {memoryMode === "keywords" ? (
          <div className="mt-5 rounded-md border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">KEYWORD PROMPTS</p>
            <div className="mt-3 flex flex-wrap gap-2">{script.keywords.map((keyword) => <Badge key={keyword} tone="emerald">{keyword}</Badge>)}</div>
            <p className="mt-4 text-xs leading-5 text-emerald-800 dark:text-emerald-200">키워드를 순서대로 연결해 자신만의 문장으로 말해 보세요.</p>
          </div>
        ) : (
          <section className="mt-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2"><h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">영어 스크립트</h3><Badge tone="amber">60-90 sec</Badge></div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300"><input checked={structureVisible} className="accent-indigo-600" onChange={(event) => setStructureVisible(event.target.checked)} type="checkbox" /><ListTree className="h-3.5 w-3.5" />문단 구조 보기</label>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300"><input checked={fillersVisible} className="accent-indigo-600" onChange={(event) => setFillersVisible(event.target.checked)} type="checkbox" /><Highlighter className="h-3.5 w-3.5" />Filler 강조</label>
              </div>
            </div>
            <button aria-label="블라인드 스크립트 보기" className="w-full text-left" onClick={() => memoryMode === "blind" && setRevealBlind((value) => !value)} onMouseEnter={() => memoryMode === "blind" && setRevealBlind(true)} onMouseLeave={() => memoryMode === "blind" && setRevealBlind(false)} type="button">
              <div className={cn("rounded-md border border-zinc-200 bg-zinc-50 p-3 transition-all dark:border-zinc-800 dark:bg-zinc-950 sm:p-4", memoryMode === "blind" && !revealBlind && "select-none blur-md")}><StructuredScript fillersVisible={fillersVisible} script={script} structureVisible={structureVisible} /></div>
            </button>
            {memoryMode === "blind" ? <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Hover 또는 클릭하면 잠깐 확인할 수 있습니다.</p> : null}
          </section>
        )}

        <div className="mt-5 flex flex-col gap-4 border-t border-zinc-100 pt-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <TtsControls onError={(message) => onToast("TTS 오류", message, "error")} text={script.englishScript} />
          <div className="flex flex-wrap gap-2">
            <Button aria-label="영어 스크립트 복사" onClick={copyScript} size="sm" variant="secondary"><Clipboard className="h-3.5 w-3.5" />복사</Button>
            <Button aria-label="AI로 자연스럽게 스크립트 변형" disabled={variationLoading} onClick={createVariation} size="sm"><Sparkles className="h-3.5 w-3.5" />{variationLoading ? "변형 중" : "AI로 자연스럽게 변형"}</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Point Notes</h3>
          <ul className="mt-3 space-y-3">{script.pointNotes.map((note) => <li className="flex gap-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300" key={note}><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />{note}</li>)}</ul>
        </Card>
        {variation ? <Card className="p-5"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-500" /><h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">AI 변형 결과</h3></div><pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-zinc-600 dark:text-zinc-300">{variation}</pre></Card> : <Card className="p-5"><div className="flex items-center gap-2"><LoaderCircle className="h-4 w-4 text-zinc-400" /><h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">내 표현으로 한 번 더</h3></div><p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">원문을 그대로 암기하기보다, 등장인물이나 장소를 내 경험에 맞게 한두 개 바꿔 말해 보세요.</p></Card>}
      </div>
    </div>
  );
}
