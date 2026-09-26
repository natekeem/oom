import type {
  AiFeature,
  AiFeatureInputMap,
  AiFeatureResultMap,
  AiProviderSource,
} from "../../../shared/ai/features";
import type { AiQuota } from "../../../shared/managed-ai/feedback";
import type { LlmSettings } from "../../types";
import { executeCustomAi } from "./customProvider";
import { executeManagedAi } from "./managedProvider";
import { resolveAiProvider } from "./providerResolver";

export interface RunAiFeatureResult<F extends AiFeature> {
  providerSource: AiProviderSource;
  result: AiFeatureResultMap[F];
  quota?: AiQuota;
  requestId: string;
}

export async function runAiFeature<F extends AiFeature>({
  feature,
  input,
  customSettings,
  requestId = crypto.randomUUID(),
  signal,
}: {
  feature: F;
  input: AiFeatureInputMap[F];
  customSettings: LlmSettings;
  requestId?: string;
  signal?: AbortSignal;
}): Promise<RunAiFeatureResult<F>> {
  const providerSource = resolveAiProvider(customSettings);
  if (providerSource === "custom") {
    return {
      providerSource,
      result: await executeCustomAi(feature, input, customSettings, signal),
      requestId,
    };
  }
  const managed = await executeManagedAi(feature, input, requestId, signal);
  return { providerSource, requestId, ...managed };
}
