import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OomWavePlayer } from "./components/audio/OomWavePlayer";

const waveMocks = vi.hoisted(() => ({
  create: vi.fn(),
  destroy: vi.fn(),
  stop: vi.fn(),
  setTime: vi.fn(),
  play: vi.fn().mockResolvedValue(undefined),
  playPause: vi.fn().mockResolvedValue(undefined),
  setOptions: vi.fn(),
  handlers: {} as Record<string, (...args: never[]) => void>,
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
      setOptions: waveMocks.setOptions,
      on: (event: string, handler: (...args: never[]) => void) => {
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
    expect(waveMocks.create).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "영어 스크립트 재생" }));
    expect(onRequestPlay).toHaveBeenCalledOnce();
  });

  it("mounts actual Blob audio with non-seekable compact exam policy and cleans up", () => {
    const blob = new Blob(["audio"], { type: "audio/wav" });
    const { unmount } = render(
      <OomWavePlayer blob={blob} controls={false} variant="exam" />,
    );

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(waveMocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "blob:wave-test",
        height: 34,
        barWidth: 2,
        barGap: 2,
        interact: false,
        dragToSeek: false,
      }),
    );

    unmount();
    expect(waveMocks.destroy).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:wave-test");
  });

  it("enables script seeking and replaces the WaveSurfer instance when Blob changes", () => {
    const first = new Blob(["first"], { type: "audio/wav" });
    const second = new Blob(["second"], { type: "audio/wav" });
    const { rerender, unmount } = render(<OomWavePlayer blob={first} variant="script" />);

    expect(waveMocks.create).toHaveBeenLastCalledWith(
      expect.objectContaining({ interact: true, dragToSeek: true, height: 54 }),
    );

    rerender(<OomWavePlayer blob={second} variant="script" />);
    expect(waveMocks.destroy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(waveMocks.create).toHaveBeenCalledTimes(2);

    rerender(<OomWavePlayer blob={null} shellState="idle" variant="script" />);
    expect(screen.getByText("0:00 / 0:00")).toBeInTheDocument();

    unmount();
    expect(waveMocks.destroy).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });
});
