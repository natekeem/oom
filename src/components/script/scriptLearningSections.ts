import type { TrainingLevelId } from "../../training/types";

export type ScriptLearningSectionId = "open" | "scene" | "close";

export type ScriptLearningSegment = {
  kind: "core" | "optional";
  text: string;
};

export type ScriptLearningSection = {
  id: ScriptLearningSectionId;
  number: "①" | "②" | "③";
  koreanLabel: string;
  englishLabel: "OPEN" | "SCENE" | "CLOSE";
  functionLabels: string[];
  segments: ScriptLearningSegment[];
};

type SentenceRecord = {
  paragraphIndex: number;
  text: string;
};

export const SCRIPT_STRUCTURE_NOTE =
  "실제 문단 수를 뜻하는 규칙이 아니라, 말할 순서를 기억하기 위한 3단 구조입니다.";

const sectionMeta: Record<
  ScriptLearningSectionId,
  Omit<ScriptLearningSection, "segments">
> = {
  open: {
    id: "open",
    number: "①",
    koreanLabel: "시작 · 서론",
    englishLabel: "OPEN",
    functionLabels: ["ANSWER", "짧은 FRAME"],
  },
  scene: {
    id: "scene",
    number: "②",
    koreanLabel: "핵심 장면 · 본론",
    englishLabel: "SCENE",
    functionLabels: ["SCENE", "ACTION", "DETAILS"],
  },
  close: {
    id: "close",
    number: "③",
    koreanLabel: "마무리 · 결론",
    englishLabel: "CLOSE",
    functionLabels: ["RESULT", "FEELING", "CHANGE / MEANING · 질문에 맞을 때"],
  },
};

function splitSentences(text: string): string[] {
  return (
    text
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? []
  );
}

export function splitScriptParagraphs(text: string): string[] {
  return text.trim().split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

export function normalizeScriptText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function getSentenceRecords(text: string): SentenceRecord[] {
  return splitScriptParagraphs(text).flatMap((paragraph, paragraphIndex) =>
    splitSentences(paragraph).map((sentence) => ({ paragraphIndex, text: sentence }))
  );
}

function getSectionId(
  record: SentenceRecord,
  index: number,
  records: SentenceRecord[],
  paragraphCount: number
): ScriptLearningSectionId {
  if (paragraphCount >= 3) {
    if (record.paragraphIndex === 0) return "open";
    if (record.paragraphIndex === paragraphCount - 1) return "close";
    return "scene";
  }

  if (index === 0) return "open";
  if (index === records.length - 1) return "close";
  return "scene";
}

const dependentOpening = /^(?:and|but|so|because|that|this|these|those|it|they|he|she|after that|since then|as a result|then|the thing is|what i(?:'m| am)|i mean|you know|actually)\b/i;
const dependentFollowUp = /^(?:and|but|so|because|that|this|these|those|it|they|he|she|after that|since then|as a result|then)\b/i;
const expansionCue = /^(?:for example|sometimes|recently|once|later|in the evening|on the way home|a few weeks ago|during|the weather|the venue|the gallery|the pictures|we even)\b/i;

function optionalScore(record: SentenceRecord, next?: SentenceRecord): number {
  const words = record.text.split(/\s+/).filter(Boolean).length;
  if (words < 7 || words > 34) return -1;
  if (dependentOpening.test(record.text)) return -1;
  if (next && dependentFollowUp.test(next.text)) return -1;
  return expansionCue.test(record.text) ? 2 : 1;
}

function getOptionalIndexes(
  records: SentenceRecord[],
  sectionIds: ScriptLearningSectionId[],
  levelId: TrainingLevelId
): Set<number> {
  if (levelId === "foundation") return new Set();

  const maximum = levelId === "intermediate" ? 1 : 2;
  const sceneIndexes = records
    .map((_, index) => index)
    .filter((index) => sectionIds[index] === "scene");

  if (sceneIndexes.length < 3) return new Set();

  const candidates = sceneIndexes.slice(1, -1)
    .map((index) => ({ index, score: optionalScore(records[index], records[index + 1]) }))
    .filter((candidate) => candidate.score >= 2)
    .sort((a, b) => b.score - a.score || b.index - a.index);

  const selected = new Set<number>();
  for (const candidate of candidates) {
    if (selected.size >= maximum) break;
    if (sceneIndexes.length - selected.size <= 2) break;
    if (selected.size > 0 && ![...selected].some((index) => Math.abs(index - candidate.index) === 1)) continue;
    selected.add(candidate.index);
  }
  return selected;
}

/**
 * Derives the learner-facing OPEN / SCENE / CLOSE order without rewriting the
 * authored source. Three-paragraph scripts retain their paragraph rhythm;
 * one- and two-paragraph scripts use sentence function for the boundaries.
 */
export function deriveScriptLearningSections(
  text: string,
  levelId: TrainingLevelId = "advanced"
): ScriptLearningSection[] {
  const paragraphs = splitScriptParagraphs(text);
  const records = getSentenceRecords(text);
  const fallbackRecords = records.length >= 3
    ? records
    : [
        { paragraphIndex: 0, text: records[0]?.text ?? text.trim() },
        { paragraphIndex: 0, text: records[1]?.text ?? "말할 핵심 장면을 한 가지 덧붙입니다." },
        { paragraphIndex: 0, text: records[2]?.text ?? "결과나 느낌으로 답을 마무리합니다." },
      ];
  const sectionIds = fallbackRecords.map((record, index) =>
    getSectionId(record, index, fallbackRecords, paragraphs.length)
  );
  const optionalIndexes = getOptionalIndexes(fallbackRecords, sectionIds, levelId);

  return (["open", "scene", "close"] as const).map((id) => ({
    ...sectionMeta[id],
    segments: fallbackRecords.flatMap((record, index) =>
      sectionIds[index] === id
        ? [{ kind: optionalIndexes.has(index) ? "optional" as const : "core" as const, text: record.text }]
        : []
    ),
  }));
}

export function getCoreScriptText(sections: ScriptLearningSection[]): string {
  return sections
    .flatMap((section) => section.segments)
    .filter((segment) => segment.kind === "core")
    .map((segment) => segment.text)
    .join(" ");
}
