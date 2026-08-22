import type {
  ScriptBlockId,
  ScriptItem,
  ScriptReplacementGuide,
} from "../../types";
import type { TrainingLevelId } from "../../training/types";
import {
  deriveScriptLearningSections,
  type ScriptLearningSectionId,
} from "./scriptLearningSections";

export type VariantAnswerSection = {
  id: ScriptLearningSectionId;
  blockId: ScriptBlockId;
  number: string;
  macroLabel: string;
  englishLabel: string;
  sourceText: string;
  transformedText: string;
  status: "keep" | "change";
  optionalTexts: string[];
};

const blockBySection: Record<ScriptLearningSectionId, ScriptBlockId> = {
  open: "answer",
  scene: "scene-action",
  close: "result",
};

export function buildVariantAnswerSections(
  script: ScriptItem,
  guide: ScriptReplacementGuide | undefined,
  levelId: TrainingLevelId
): VariantAnswerSection[] {
  return deriveScriptLearningSections(script.englishScript, levelId).map((section) => {
    const blockId = blockBySection[section.id];
    const replacement = guide?.replacements.find((item) => item.block === blockId);
    const sourceText = section.segments.map((segment) => segment.text).join(" ");
    return {
      id: section.id,
      blockId,
      number: section.number,
      macroLabel: section.koreanLabel,
      englishLabel: section.englishLabel,
      sourceText,
      transformedText: replacement?.levelExamples[levelId] ?? sourceText,
      status: replacement ? "change" : "keep",
      optionalTexts: section.segments
        .filter((segment) => segment.kind === "optional")
        .map((segment) => segment.text),
    };
  });
}

export function buildTransformedAnswer(
  script: ScriptItem,
  guide: ScriptReplacementGuide | undefined,
  levelId: TrainingLevelId
): string {
  return buildVariantAnswerSections(script, guide, levelId)
    .map((section) => section.transformedText)
    .join("\n\n");
}
