import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getSttConnection,
  hasCustomSttConfiguration,
  resolveSttProvider,
} from "../providerResolver";
import { formatSttErrorMessage, SttError, toSttError } from "../errors";
import { runStt } from "../runStt";
import type { SttSettings } from "../../../types";

// Mock executeManagedStt
const mockManagedStt = vi.fn();
vi.mock("../managedSttProvider", () => ({
  executeManagedStt: (...args: unknown[]) => mockManagedStt(...args),
  getManagedSttQuota: vi.fn(),
}));

// Mock transcribeAudio from lib/stt
const mockTranscribeAudio = vi.fn();
vi.mock("../../../lib/stt", () => ({
  transcribeAudio: (...args: unknown[]) => mockTranscribeAudio(...args),
  executeCustomStt: (...args: unknown[]) => mockTranscribeAudio(...args),
}));

describe("STT Provider Resolver & Precedence", () => {
  it("recognizes configured custom STT endpoints", () => {
    expect(hasCustomSttConfiguration({ endpoint: "https://stt.example.com", autoTranscribe: false })).toBe(true);
    expect(hasCustomSttConfiguration({ endpoint: "   ", autoTranscribe: false })).toBe(false);
    expect(hasCustomSttConfiguration(null)).toBe(false);
    expect(hasCustomSttConfiguration(undefined)).toBe(false);
  });

  it("prioritizes custom STT over everything else", () => {
    const customSettings: SttSettings = {
      endpoint: "https://stt.example.com",
      preferLocalOnDevice: true,
      autoTranscribe: false,
    };

    // Even if local mode requested, custom STT wins
    expect(resolveSttProvider({ customSettings, preferLocalOnDevice: true })).toBe("custom");
  });

  it("falls back to managed STT when no custom endpoint and no local support", () => {
    const emptySettings: SttSettings = {
      endpoint: "",
      preferLocalOnDevice: false,
      autoTranscribe: false,
    };

    expect(resolveSttProvider({ customSettings: emptySettings })).toBe("managed");
    expect(resolveSttProvider()).toBe("managed");
  });

  it("resolves connection status correctly", () => {
    const customConn = getSttConnection({ endpoint: "https://api.com", autoTranscribe: false });
    expect(customConn.source).toBe("custom");
    expect(customConn.label).toBe("사용자 지정 STT API");
    expect(customConn.badgeTone).toBe("amber");

    const managedConn = getSttConnection({ endpoint: "", autoTranscribe: false });
    expect(managedConn.source).toBe("managed");
    expect(managedConn.label).toBe("OOM 관리형 STT");
    expect(managedConn.badgeTone).toBe("indigo");
  });
});

describe("STT Error Taxonomy & Localization", () => {
  it("formats known error codes with friendly Korean messages", () => {
    const loginErr = new SttError("LOGIN_REQUIRED");
    expect(formatSttErrorMessage(loginErr)).toContain("로그인");

    const quotaErr = new SttError("DAILY_STT_QUOTA_EXCEEDED");
    expect(formatSttErrorMessage(quotaErr)).toContain("훈련 시간");

    const killSwitchErr = new SttError("STT_DISABLED");
    expect(formatSttErrorMessage(killSwitchErr)).toContain("점검 중입니다");

    const emptyErr = new SttError("EMPTY_TRANSCRIPT");
    expect(formatSttErrorMessage(emptyErr)).toContain("인식된 텍스트가 없습니다");
  });

  it("converts unknown errors to SttError safely", () => {
    const unknown = new Error("Network timeout");
    const converted = toSttError(unknown);
    expect(converted).toBeInstanceOf(SttError);
    expect(converted.code).toBe("SERVER_ERROR");
    expect(formatSttErrorMessage(unknown)).toBe("Network timeout");
  });
});

describe("runStt execution entrypoint", () => {
  const dummyBlob = new Blob(["fake audio"], { type: "audio/webm" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes to custom STT when endpoint is configured without contacting managed backend", async () => {
    mockTranscribeAudio.mockResolvedValueOnce("Hello from custom STT");

    const result = await runStt({
      blob: dummyBlob,
      mimeType: "audio/webm",
      durationSeconds: 15,
      source: "quick_practice",
      customSettings: {
        endpoint: "https://my-stt.example.com",
        apiKey: "sk-123",
        autoTranscribe: false,
      },
    });

    expect(result.providerSource).toBe("custom");
    expect(result.transcript).toBe("Hello from custom STT");
    expect(result.durationMs).toBe(15000);
    expect(mockTranscribeAudio).toHaveBeenCalledTimes(1);
    expect(mockManagedStt).not.toHaveBeenCalled();
  });

  it("routes to managed STT when no custom settings are present", async () => {
    mockManagedStt.mockResolvedValueOnce({
      providerSource: "managed",
      result: {
        transcript: "I love going to the park um every weekend.",
        language: "en-US",
        durationMs: 12000,
      },
      quota: {
        plan: "free",
        limitMs: 600000,
        usedMs: 12000,
        reservedMs: 0,
        remainingMs: 588000,
        resetsAt: "2026-09-27T00:00:00+09:00",
        enabled: true,
      },
      requestId: "req-123",
    });

    const result = await runStt({
      blob: dummyBlob,
      mimeType: "audio/webm",
      durationSeconds: 12,
      source: "quick_practice",
    });

    expect(result.providerSource).toBe("managed");
    expect(result.transcript).toBe("I love going to the park um every weekend.");
    expect(result.language).toBe("en-US");
    expect(result.quota?.remainingMs).toBe(588000);
    expect(mockManagedStt).toHaveBeenCalledTimes(1);
    expect(mockTranscribeAudio).not.toHaveBeenCalled();
  });

  it("does not fall back between providers on failure (No silent fallback)", async () => {
    mockTranscribeAudio.mockRejectedValueOnce(
      new SttError("CUSTOM_STT_FAILED", "Custom server 500", 502)
    );

    await expect(
      runStt({
        blob: dummyBlob,
        mimeType: "audio/webm",
        durationSeconds: 10,
        source: "quick_practice",
        customSettings: { endpoint: "https://failing-stt.com", autoTranscribe: false },
      })
    ).rejects.toThrow("Custom server 500");

    // Must NOT have attempted managed STT
    expect(mockManagedStt).not.toHaveBeenCalled();
  });
});
