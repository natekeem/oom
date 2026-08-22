import type {
  LegacyScriptBlockId,
  ScriptBlockId,
  ScriptReplacementGuide,
} from "../../types";

type RawReplacement = {
  block: LegacyScriptBlockId;
  instruction: string;
  replacement: string;
};

type RawGuide = {
  summary: string;
  replacements: RawReplacement[];
  keepBlocks: LegacyScriptBlockId[];
};

const functionBlockByLegacy: Record<LegacyScriptBlockId, ScriptBlockId> = {
  opening: "answer",
  details: "scene-action",
  closing: "result",
};

const functionCueByBlock: Record<ScriptBlockId, string> = {
  answer: "질문에 직접 답하는 첫 문장을 만듭니다.",
  "scene-action": "같은 장면에서 필요한 행동과 이유만 고릅니다.",
  result: "질문 기능에 맞는 결과나 짧은 감정으로 닫습니다.",
  expansion: "시간이 남고 질문에 필요할 때만 한 가지를 확장합니다.",
};

function sentences(text: string) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) ?? [text];
}

function microExamples(text: string) {
  const parts = sentences(text);
  return {
    foundation: parts.slice(0, 1).join(" "),
    intermediate: parts.slice(0, 2).join(" "),
    advanced: parts.join(" "),
  };
}

/**
 * Converts legacy paragraph-position authoring into the learner-facing
 * function contract. No level may fall back to another level's example.
 */
export function defineReplacementGuides(raw: Record<string, RawGuide>): Record<string, ScriptReplacementGuide> {
  return Object.fromEntries(
    Object.entries(raw).map(([key, guide]) => [
      key,
      {
        summary: guide.summary,
        keepBlocks: guide.keepBlocks.map((block) => functionBlockByLegacy[block]),
        replacements: guide.replacements.map((item) => {
          const block = functionBlockByLegacy[item.block];
          return {
            block,
            instruction: item.instruction,
            replacement: item.replacement,
            functionCue: functionCueByBlock[block],
            keepFacts: ["메인 스토리의 핵심 사람·장소·사건"],
            changeFocus: item.instruction,
            dropFacts: [`${item.block}에서 질문에 직접 답하지 않는 세부 정보`],
            levelExamples: microExamples(item.replacement),
          };
        }),
      },
    ])
  );
}
