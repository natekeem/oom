import { TRAINING_LEVELS } from "../../../training/levels";
import type { MockAttempt } from "./mockSessionTypes";

export type MockTrainingReport = {
  generatedAt: string;
  completionRate: number;
  timingRate: number;
  recordingRate: number;
  transcriptRate: number;
  feedbackRate: number;
  averageAnswerSeconds: number;
  totalAnswerSeconds: number;
  totalTestSeconds: number;
  strengths: string[];
  actions: string[];
  disclaimer: string;
};

function ratio(value: number, total: number) {
  return total > 0 ? value / total : 0;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

export function createMockTrainingReport({
  attempts,
  totalQuestions,
  totalTestSeconds,
}: {
  attempts: MockAttempt[];
  totalQuestions: number;
  totalTestSeconds: number;
}): MockTrainingReport {
  const totalAnswerSeconds = attempts.reduce((sum, attempt) => sum + attempt.durationSeconds, 0);
  const completionRate = ratio(attempts.length, totalQuestions);
  const recordingRate = ratio(attempts.filter((attempt) => attempt.recording).length, attempts.length);
  const transcriptRate = ratio(attempts.filter((attempt) => attempt.transcript.trim()).length, attempts.length);
  const feedbackRate = ratio(attempts.filter((attempt) => attempt.feedback.trim()).length, attempts.length);
  const timingRate = ratio(
    attempts.filter((attempt) => {
      const level = TRAINING_LEVELS.find((candidate) => candidate.id === attempt.question.sourceLevelId);
      if (!level) return false;
      const [minimum, maximum] = level.targetSeconds;
      return attempt.durationSeconds >= Math.round(minimum * 0.75) && attempt.durationSeconds <= Math.round(maximum * 1.25);
    }).length,
    attempts.length,
  );
  const strengths: string[] = [];
  const actions: string[] = [];

  if (completionRate >= 0.9) strengths.push("두 Session을 끝까지 이어가며 시험 흐름을 안정적으로 완주했습니다.");
  if (timingRate >= 0.7) strengths.push("대부분의 답변이 선택한 난이도의 OOM 목표 발화 시간대에 들어왔습니다.");
  if (recordingRate >= 0.8) strengths.push("대부분의 문항에 실제 녹음 근거가 남아 반복 복기가 가능합니다.");
  if (attempts.some((attempt) => attempt.question.kind === "roleplay")) strengths.push("일반 질문과 Roleplay를 모두 경험해 대응 범위를 넓혔습니다.");
  if (strengths.length === 0) strengths.push("모의고사 응답 기록을 남겨 다음 훈련의 기준점을 만들었습니다.");

  if (completionRate < 0.9) actions.push("무응답 문항을 줄이는 것을 먼저 목표로 두고 두 Session 완주를 다시 시도하세요.");
  if (timingRate < 0.7) actions.push("짧은 답변은 장면 한 가지를 더하고, 긴 답변은 OPEN·SCENE·CLOSE 순서로 압축하세요.");
  if (transcriptRate < 0.6) actions.push("대표 답변부터 STT로 전사하고 실제 질문에 직접 답했는지 확인하세요.");
  if (feedbackRate < 0.35) actions.push("STT를 수정한 답변에 AI 피드백을 받아 KEEP·FIX·RETRY 한 가지씩 남기세요.");
  actions.push("발음과 억양은 transcript만으로 채점하지 않으므로 실제 녹음을 직접 들으며 별도로 점검하세요.");

  return {
    generatedAt: new Date().toISOString(),
    completionRate: clampPercent(completionRate),
    timingRate: clampPercent(timingRate),
    recordingRate: clampPercent(recordingRate),
    transcriptRate: clampPercent(transcriptRate),
    feedbackRate: clampPercent(feedbackRate),
    averageAnswerSeconds: attempts.length ? Math.round(totalAnswerSeconds / attempts.length) : 0,
    totalAnswerSeconds,
    totalTestSeconds,
    strengths,
    actions,
    disclaimer: "이 리포트는 완료율·목표 발화시간·녹음·STT·AI 복기 여부를 정리한 훈련 기록입니다. 공식 OPIc 점수나 등급을 예측하지 않으며, transcript만으로 발음·억양을 평가하지 않습니다.",
  };
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function buildMockReportHtml(report: MockTrainingReport, attempts: MockAttempt[]) {
  const metric = (label: string, value: string) => `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
  const questionRows = attempts.map((attempt) => `
    <tr>
      <td>Session ${attempt.session} · Q${attempt.sessionIndex + 1}</td>
      <td><strong>${escapeHtml(attempt.question.group)}</strong><br>${escapeHtml(attempt.question.prompt)}</td>
      <td>${escapeHtml(formatDuration(attempt.durationSeconds))}</td>
      <td>${attempt.recording ? "있음" : "타이머"}</td>
      <td>${attempt.transcript.trim() ? "완료" : "미완료"}</td>
      <td>${attempt.feedback.trim() ? "완료" : "미완료"}</td>
    </tr>`).join("");
  const list = (items: string[]) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OOM 모의고사 훈련 리포트</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f4f4f5;color:#18181b;font-family:Inter,Pretendard,"Noto Sans KR",sans-serif;line-height:1.6}.page{max-width:1080px;margin:0 auto;padding:40px 24px}.hero,.panel{background:#fff;border:1px solid #d4d4d8;border-radius:16px;padding:28px;margin-bottom:18px}.eyebrow{color:#4f46e5;font-size:12px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.muted{color:#71717a;font-size:13px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:24px}.metric{background:#f4f4f5;border-radius:10px;padding:14px}.metric span{display:block;color:#71717a;font-size:11px}.metric strong{font-size:20px}.columns{display:grid;grid-template-columns:1fr 1fr;gap:18px}.panel h2{margin:0 0 12px;font-size:18px}li{margin:8px 0}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:10px;border-bottom:1px solid #e4e4e7;text-align:left;vertical-align:top}th{background:#f4f4f5}.notice{border-left:4px solid #f59e0b;background:#fffbeb;padding:14px 16px;font-size:12px;color:#78350f}@media(max-width:760px){.metrics{grid-template-columns:repeat(2,1fr)}.columns{grid-template-columns:1fr}.page{padding:20px 12px}.hero,.panel{padding:20px}table{display:block;overflow-x:auto}}
</style></head><body><main class="page">
<section class="hero"><p class="eyebrow">OOM Full Mock Training Report</p><h1>OOM 모의고사 훈련 리포트</h1><p class="muted">시험 결과를 예측하는 점수가 아니라, 이번 세션에서 남긴 훈련 행동을 정리한 기록입니다.</p>
<div class="metrics">${metric("완료율", `${report.completionRate}%`)}${metric("목표 발화시간 적합률", `${report.timingRate}%`)}${metric("녹음 기록률", `${report.recordingRate}%`)}${metric("STT 복기율", `${report.transcriptRate}%`)}${metric("AI 피드백 복기율", `${report.feedbackRate}%`)}${metric("총 답변 시간", formatDuration(report.totalAnswerSeconds))}${metric("평균 답변 시간", formatDuration(report.averageAnswerSeconds))}</div></section>
<div class="columns"><section class="panel"><h2>잘한 점</h2><ul>${list(report.strengths)}</ul></section><section class="panel"><h2>다음 훈련</h2><ol>${list(report.actions)}</ol></section></div>
<section class="panel"><h2>전체 문항 근거</h2><p class="muted">본시험 ${escapeHtml(formatDuration(report.totalTestSeconds))} · 답변 합계 ${escapeHtml(formatDuration(report.totalAnswerSeconds))} · 평균 ${escapeHtml(formatDuration(report.averageAnswerSeconds))}</p><table><thead><tr><th>문항</th><th>주제와 실제 질문</th><th>발화</th><th>녹음</th><th>STT</th><th>AI</th></tr></thead><tbody>${questionRows}</tbody></table></section>
<p class="notice">${escapeHtml(report.disclaimer)}</p><p class="muted">생성 시각: ${escapeHtml(new Date(report.generatedAt).toLocaleString("ko-KR"))}</p>
</main></body></html>`;
}

export function downloadMockReportHtml(report: MockTrainingReport, attempts: MockAttempt[]) {
  const blob = new Blob([buildMockReportHtml(report, attempts)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `oom-full-mock-report-${report.generatedAt.slice(0, 10)}.html`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
