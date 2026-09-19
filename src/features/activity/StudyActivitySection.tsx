import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { discoveredCourses, resolveTrainingContext } from "../../training/courseRegistry";
import { TRAINING_LEVELS } from "../../training/levels";
import { getRecentActivities, type ActivityEvent } from "./activityRepository";

const labels = { survey_completed: "서베이 준비", universal_script_completed: "만능 스크립트", roleplay_completed: "롤플레이" };
function contentLabel(event: ActivityEvent) {
  const course = discoveredCourses.find(item => item.id === event.course_id);
  const level = TRAINING_LEVELS.find(item => item.id === event.level_id);
  if (!course || !level) return "이전 학습 콘텐츠";
  const context = resolveTrainingContext(course.id, level.id);
  const content = event.activity_type === "survey_completed" ? "추천 조합 익히기"
    : [...context.storylines, ...context.roleplays].find(item => item.id === event.content_id)?.title ?? "이전 학습 콘텐츠";
  return `${course.title} · ${level.displayName} · ${content}`;
}

export function StudyActivitySection() {
  const auth = useAuth();
  const userId = auth.status === "authenticated" ? auth.user?.id : undefined;
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ userId?: string; events: ActivityEvent[]; status: string }>({ events: [], status: "loading" });
  useEffect(() => {
    let active = true;
    if (!userId) return;
    void getRecentActivities(userId).then(events => {
      if (active) setResult({ userId, events, status: "success" });
    }).catch(() => { if (active) setResult({ userId, events: [], status: "error" }); });
    return () => { active = false; };
  }, [userId, retry]);
  if (!userId) return null;
  const status = result.userId === userId ? result.status : "loading";
  const events = result.userId === userId ? result.events : [];
  return <section aria-label="학습 활동" className="space-y-4">
    <div><h2 className="text-lg font-bold text-zinc-950 dark:text-white">최근 학습 활동</h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">서베이와 스크립트, 롤플레이의 학습 완료 기록입니다. 최근 20개까지 표시합니다.</p></div>
    <Card className="p-5 sm:p-6">
      {status === "loading" ? <p role="status" className="text-sm">학습 활동을 불러오는 중…</p>
        : status === "error" ? <div role="alert" className="space-y-3"><p className="text-sm">학습 활동을 불러오지 못했어요. 다른 학습 기능은 계속 이용할 수 있어요.</p><Button size="sm" variant="secondary" onClick={() => { setResult({ userId, events: [], status: "loading" }); setRetry(value => value + 1); }}>활동 다시 불러오기</Button></div>
        : !events.length ? <p className="text-sm text-zinc-500 dark:text-zinc-400">아직 완료한 학습 활동이 없어요. 학습 후 완료를 누르면 여기에 표시됩니다.</p>
        : <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">{events.map(event => <li key={event.id} className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
          <div className="min-w-0 space-y-1"><p className="text-sm font-semibold">{labels[event.activity_type]}</p><p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{contentLabel(event)}</p><time dateTime={event.occurred_at} className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(event.occurred_at).toLocaleString("ko-KR")}</time></div><Badge tone="emerald">학습 완료</Badge>
        </li>)}</ul>}
    </Card>
  </section>;
}
