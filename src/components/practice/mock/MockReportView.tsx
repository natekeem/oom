import { ArrowLeft, Download, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import type { MockAttempt } from "./mockSessionTypes";
import { downloadMockReportHtml, type MockDiagnosticReport } from "./mockReport";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function MockReportView({
  attempts,
  report,
  onBack,
  onRestart,
}: {
  attempts: MockAttempt[];
  report: MockDiagnosticReport;
  onBack: () => void;
  onRestart: () => void;
}) {
  const metrics = [
    ["완료율", `${report.completionRate}%`],
    ["목표 시간 적합", `${report.timingRate}%`],
    ["녹음", `${report.recordingRate}%`],
    ["STT", `${report.transcriptRate}%`],
    ["AI 피드백", `${report.feedbackRate}%`],
  ];

  return (
    <div className="space-y-5" data-mock-phase="report">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button onClick={onBack} variant="secondary"><ArrowLeft className="h-4 w-4" /> 전체 답변 복기</Button>
        <Button onClick={() => downloadMockReportHtml(report, attempts)}><Download className="h-4 w-4" /> HTML 내려받기</Button>
      </div>

      <Card className="overflow-hidden border-indigo-200 p-0 dark:border-indigo-900">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6 dark:from-indigo-950/70 dark:via-zinc-950 dark:to-emerald-950/40 sm:p-8">
          <Badge tone="indigo">OOM 비공식 종합 진단</Badge>
          <h1 className="mt-4 text-2xl font-black text-zinc-950 dark:text-white sm:text-3xl">실전 모의고사 예상 점수·진단 Report</h1>
          <div className="mt-6 flex flex-wrap items-end gap-6">
            <div>
              <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">OOM 훈련 진단 점수</p>
              <p className="mt-1 text-5xl font-black text-indigo-700 dark:text-indigo-300">{report.diagnosticScore}<span className="text-lg text-zinc-400"> / 100</span></p>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">예상 등급 범위</p>
              <p className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">{report.estimatedRange}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{report.evidenceLabel}</p>
            </div>
          </div>
          <div className="mt-7 grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
            {metrics.map(([label, value]) => (
              <div className="rounded-lg border border-white/80 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/80" key={label}>
                <p className="text-[11px] font-semibold text-zinc-500">{label}</p>
                <p className="mt-1 text-lg font-black text-zinc-950 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="text-base font-black text-emerald-800 dark:text-emerald-300">잘한 점</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
            {report.strengths.map((item) => <li className="flex gap-2" key={item}><span className="text-emerald-500">●</span><span>{item}</span></li>)}
          </ul>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="text-base font-black text-indigo-800 dark:text-indigo-300">다음 훈련</h2>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
            {report.actions.map((item, index) => <li className="flex gap-2" key={item}><span className="font-black text-indigo-500">{index + 1}.</span><span>{item}</span></li>)}
          </ol>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-zinc-950 dark:text-white">전체 문항 진단 근거</h2>
            <p className="mt-1 text-xs text-zinc-500">본시험 {formatDuration(report.totalTestSeconds)} · 답변 합계 {formatDuration(report.totalAnswerSeconds)} · 평균 {formatDuration(report.averageAnswerSeconds)}</p>
          </div>
          <Button onClick={onRestart} size="sm" variant="secondary"><RefreshCw className="h-4 w-4" /> 새 모의고사</Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"><tr><th className="p-3">문항</th><th className="p-3">주제와 실제 질문</th><th className="p-3">발화</th><th className="p-3">녹음</th><th className="p-3">STT</th><th className="p-3">AI</th></tr></thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="p-3 font-bold text-indigo-700 dark:text-indigo-300">S{attempt.session} · Q{attempt.sessionIndex + 1}</td>
                  <td className="max-w-md p-3"><p className="font-bold text-zinc-900 dark:text-white">{attempt.question.group}</p><p className="mt-1 leading-5 text-zinc-600 dark:text-zinc-300">{attempt.question.prompt}</p></td>
                  <td className="p-3 font-mono">{formatDuration(attempt.durationSeconds)}</td>
                  <td className="p-3">{attempt.recording ? "있음" : "타이머"}</td>
                  <td className="p-3">{attempt.transcript.trim() ? "완료" : "미완료"}</td>
                  <td className="p-3">{attempt.feedback.trim() ? "완료" : "미완료"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><p>{report.disclaimer}</p>
      </div>
    </div>
  );
}
