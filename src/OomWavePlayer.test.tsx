import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  OOM_IDLE_WAVEFORM_PEAKS,
  OomWavePlayer,
} from "./components/audio/OomWavePlayer";

const waveMocks = vi.hoisted(() => ({
  create: vi.fn(),
  destroy: vi.fn(),
  stop: vi.fn(),
  setTime: vi.fn(),
  play: vi.fn().mockResolvedValue(undefined),
  playPause: vi.fn().mockResolvedValue(undefined),
  load: vi.fn().mockResolvedValue(undefined),
  setPlaybackRate: vi.fn(),
  setOptions: vi.fn(),
  handlers: {} as Record<string, (...args: unknown[]) => void>,
}));

vi.mock("wavesurfer.js", () => ({
  default: {
    create: waveMocks.create,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  waveMocks.handlers = {};
  waveMocks.create.mockImplementation(() => {
    return {
      destroy: waveMocks.destroy,
      stop: waveMocks.stop,
      setTime: waveMocks.setTime,
      play: waveMocks.play,
      playPause: waveMocks.playPause,
      load: waveMocks.load,
      setPlaybackRate: waveMocks.setPlaybackRate,
      setOptions: waveMocks.setOptions,
      on: (event: string, handler: (...args: unknown[]) => void) => {
        waveMocks.handlers[event] = handler;
      },
    };
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:wave-test"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
});

describe("OomWavePlayer", () => {
  it("reserves the script player shell before audio exists and delegates Play intent", async () => {
    const user = userEvent.setup();
    const onRequestPlay = vi.fn();

    render(
      <OomWavePlayer
        blob={null}
        onRequestPlay={onRequestPlay}
        shellState="idle"
        statusText="재생하면 음성을 준비합니다."
        variant="script"
      />,
    );

    expect(screen.getByTestId("oom-wave-player-script")).toHaveAttribute(
      "data-state",
      "idle",
    );
    expect(screen.getByRole("status")).toHaveTextContent("재생하면 음성을 준비합니다.");
    expect(screen.getByRole("img", { name: "음성 준비 전 안내 파형" })).toBeInTheDocument();
    expect(waveMocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        peaks: [OOM_IDLE_WAVEFORM_PEAKS],
        duration: 1,
        height: 54,
        normalize: false,
      }),
    );
    expect(screen.getByText("--:--")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "영어 스크립트 재생" }));
    expect(onRequestPlay).toHaveBeenCalledOnce();
  });

  it("mounts actual Blob audio with non-seekable compact exam policy and cleans up", async () => {
    const blob = new Blob(["audio"], { type: "audio/wav" });
    const { unmount } = render(
      <OomWavePlayer blob={blob} controls={false} variant="exam" />,
    );

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(waveMocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        height: 34,
        barWidth: 2,
        barGap: 2,
        interact: false,
        dragToSeek: false,
      }),
    );
    expect(waveMocks.setOptions).toHaveBeenCalledWith({ normalize: true });
    await waitFor(() => expect(waveMocks.load).toHaveBeenCalledWith("blob:wave-test"));

    unmount();
    expect(waveMocks.destroy).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:wave-test");
  });

  it("loads a static URL with real precomputed peaks without creating a Blob URL", async () => {
    const peaks = Array.from({ length: 256 }, (_, index) => (index + 1) / 256);
    render(
      <OomWavePlayer
        audioUrl="/generated-tts/audio/hash/heart.webm"
        precomputedDuration={12.5}
        precomputedPeaks={peaks}
        variant="script"
      />,
    );

    expect(screen.getByTestId("oom-wave-player-script")).toHaveAttribute(
      "data-source",
      "static",
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(waveMocks.setOptions).toHaveBeenCalledWith({ normalize: false });
    await waitFor(() =>
      expect(waveMocks.load).toHaveBeenCalledWith(
        "/generated-tts/audio/hash/heart.webm",
        [peaks],
        12.5,
      ),
    );
  });

  it("enables script seeking and replaces placeholder/Blob data in one WaveSurfer instance", async () => {
    const first = new Blob(["first"], { type: "audio/wav" });
    const second = new Blob(["second"], { type: "audio/wav" });
    const { rerender, unmount } = render(<OomWavePlayer blob={first} variant="script" />);
    await waitFor(() => expect(waveMocks.load).toHaveBeenCalledTimes(1));

    expect(waveMocks.create).toHaveBeenLastCalledWith(
      expect.objectContaining({ interact: true, dragToSeek: true, height: 54 }),
    );

    rerender(<OomWavePlayer blob={second} variant="script" />);
    await waitFor(() => expect(waveMocks.load).toHaveBeenCalledTimes(2));
    expect(waveMocks.destroy).not.toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(waveMocks.create).toHaveBeenCalledTimes(1);
    expect(waveMocks.load).toHaveBeenNthCalledWith(1, "blob:wave-test");
    expect(waveMocks.load).toHaveBeenNthCalledWith(2, "blob:wave-test");

    rerender(<OomWavePlayer blob={null} shellState="idle" variant="script" />);
    expect(waveMocks.load).toHaveBeenLastCalledWith(
      "",
      [OOM_IDLE_WAVEFORM_PEAKS],
      1,
    );
    expect(screen.getByText("--:--")).toBeInTheDocument();

    unmount();
    expect(waveMocks.destroy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it("changes playback rate with pitch preservation without restarting or losing time", () => {
    const blob = new Blob(["audio"], { type: "audio/wav" });
    const { rerender } = render(
      <OomWavePlayer blob={blob} playbackRate={0.95} variant="script" />,
    );

    act(() => {
      waveMocks.handlers.ready?.(30);
      waveMocks.handlers.play?.();
      waveMocks.handlers.timeupdate?.(12.5);
    });
    expect(screen.getByText("0:12 / 0:30")).toBeInTheDocument();

    waveMocks.setPlaybackRate.mockClear();
    waveMocks.stop.mockClear();
    waveMocks.setTime.mockClear();
    waveMocks.play.mockClear();
    waveMocks.load.mockClear();
    vi.mocked(URL.createObjectURL).mockClear();

    rerender(<OomWavePlayer blob={blob} playbackRate={1} variant="script" />);

    expect(waveMocks.setPlaybackRate).toHaveBeenCalledWith(1, true);
    expect(waveMocks.stop).not.toHaveBeenCalled();
    expect(waveMocks.setTime).not.toHaveBeenCalled();
    expect(waveMocks.play).not.toHaveBeenCalled();
    expect(waveMocks.load).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(screen.getByText("0:12 / 0:30")).toBeInTheDocument();
  });
});
