import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { formatTime } from "../../lib/utils";
import { Button } from "../ui/Button";

type PracticeTimerProps = {
  autoStart: boolean;
  initialSeconds?: number;
  onTimerEnd?: () => void;
};

export function PracticeTimer({
  autoStart,
  initialSeconds = 90,
  onTimerEnd,
}: PracticeTimerProps) {
  const [duration, setDuration] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          onTimerEnd?.();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, onTimerEnd]);

  const progress = duration ? ((duration - remaining) / duration) * 100 : 0;
  const selectDuration = (next: number) => {
    setDuration(next);
    setRemaining(next);
    setRunning(false);
  };

  const presetOptions = Array.from(new Set([30, 45, 60, 90, 120, initialSeconds])).sort(
    (a, b) => a - b
  );

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">답변 타이머</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            목표 시간을 정하고 실제 시험처럼 말해 보세요.
          </p>
        </div>
        <div className="flex flex-wrap rounded-md border border-zinc-200 p-1 dark:border-zinc-700">
          {presetOptions.map((time) => (
            <button
              aria-pressed={duration === time}
              className={`rounded px-2.5 py-1.5 text-xs font-medium ${
                duration === time
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              key={time}
              onClick={() => selectDuration(time)}
              type="button"
            >
              {time}s
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <p
          className={`font-mono text-5xl font-bold ${
            remaining === 0 ? "text-rose-500" : "text-zinc-950 dark:text-white"
          }`}
        >
          {formatTime(remaining)}
        </p>
        <div className="flex gap-2">
          <Button
            aria-label={running ? "타이머 일시 정지" : "타이머 시작"}
            onClick={() => setRunning((value) => !value)}
            size="icon"
            variant={running ? "secondary" : "primary"}
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            aria-label="타이머 초기화"
            onClick={() => {
              setRemaining(duration);
              setRunning(false);
            }}
            size="icon"
            variant="ghost"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        aria-label="타이머 진행률"
        className="mt-5 h-2 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800"
      >
        <div
          className={`h-full rounded transition-all duration-1000 ${
            remaining === 0 ? "bg-rose-500" : "bg-indigo-600"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {remaining === 0 ? (
        <p className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
          시간이 끝났습니다. 녹음을 듣고 핵심 장면이 충분했는지 확인해 보세요.
        </p>
      ) : null}
    </div>
  );
}

