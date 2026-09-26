import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "./AdminLayout";
import { requestAdminApi } from "./adminApi";
import { useAdminAccess } from "./useAdminAccess";
import { AI_FEATURES, type AiFeature } from "../../../shared/ai/features";

const featureLabels: Record<AiFeature, string> = {
  answer_feedback: "답변 피드백",
  script_rewrite: "스크립트 변형",
  roleplay_question: "롤플레이 질문 생성",
};

export interface AiOverview {
  today: {
    calls: number;
    succeeded: number;
    failed: number;
    users: number;
    inputTokens: number | null;
    outputTokens: number | null;
    cost: number | null;
    unknownCost: number;
    blocked: number;
    avgLatency: number | null;
    p95Latency: number | null;
  };
  days: { day: string; calls: number; cost: number | null }[];
  models: { model: string; calls: number; cost: number | null }[];
  features: { feature: string; calls: number }[];
  failures: {
    request_id: string;
    model: string;
    error_code: string;
    created_at: string;
  }[];
  users: { user_id: string; display_name?: string | null; calls: number }[];
}
export interface AiSettings {
  runtime: {
    managed_ai_enabled: boolean;
    default_model: string;
    requests_per_minute: number;
  };
  limits: { plan: "free" | "pro"; feature: AiFeature; limit_count: number; enabled: boolean }[];
  models: {
    model: string;
    enabled: boolean;
    input_cost_per_million_microusd: number;
    output_cost_per_million_microusd: number;
    pricing_note: string;
  }[];
}
export interface AiUsage {
  records: {
    request_id: string;
    user_id: string;
    display_name?: string | null;
    status: string;
    feature: AiFeature;
    model: string;
    effective_plan: string;
    input_tokens: number | null;
    output_tokens: number | null;
    thought_tokens?: number | null;
    cached_input_tokens?: number | null;
    estimated_cost_microusd: number | null;
    created_at: string;
    error_code: string | null;
  }[];
  page: number;
  total: number;
  totalPages: number;
}
const inputClass =
  "mt-1 h-10 w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
const cost = (v: number | null) =>
  v === null
    ? "미집계"
    : new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 4,
      }).format(v / 1000000);
const number = (v: number | null) =>
  v === null ? "미집계" : Math.round(v).toLocaleString();
const date = (v: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(v));
export function AdminAiView() {
  const { user } = useAuth();
  return <AdminAiSession key={user?.id || "anonymous"} />;
}
function AdminAiSession() {
  const { role } = useAdminAccess();
  const [overview, setOverview] = useState<AiOverview | null>(null);
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState("");
  const [usageError, setUsageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [usageLoading, setUsageLoading] = useState(true);
  useEffect(() => {
    let active = true;
    void Promise.all([
      requestAdminApi<AiOverview>("/ai/overview"),
      requestAdminApi<AiSettings>("/ai/settings"),
    ])
      .then(([o, s]) => {
        if (active) {
          setOverview(o);
          setSettings(s);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("AI 운영 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  useEffect(() => {
    let active = true;
    void requestAdminApi<AiUsage>("/ai/usage", { ...applied, page })
      .then((data) => {
        if (active) {
          setUsage(data);
          setUsageError("");
        }
      })
      .catch(() => {
        if (active)
          setUsageError(
            "사용 기록을 불러오지 못했습니다. 필터 값을 확인해 주세요.",
          );
      })
      .finally(() => {
        if (active) setUsageLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision, applied, page]);
  const refresh = () => {
    setLoading(true);
    setUsageLoading(true);
    setRevision((v) => v + 1);
  };
  const t = overview?.today;
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">AI 운영</h2>
            <p className="mt-1 text-xs text-zinc-500">
              오늘 00:00 KST 기준 · 7일 추이는 오늘 포함 · 예상 API 비용은 실제
              청구 금액과 다를 수 있습니다.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={refresh}>
            새로고침
          </Button>
        </div>
        {loading ? (
          <p role="status" className="py-8 text-sm text-zinc-500">
            AI 운영 정보를 불러오는 중...
          </p>
        ) : error ? (
          <Card className="p-5">
            <p role="alert">{error}</p>
            <Button className="mt-3" onClick={refresh}>
              다시 시도
            </Button>
          </Card>
        ) : t && overview ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {[
                ["오늘 AI 호출", number(t.calls)],
                [
                  "성공률",
                  t.succeeded + t.failed
                    ? `${Math.round((t.succeeded / (t.succeeded + t.failed)) * 100)}%`
                    : "—",
                ],
                ["오늘 AI 사용자", number(t.users)],
                [
                  "입력 / 출력 토큰",
                  `${number(t.inputTokens)} / ${number(t.outputTokens)}`,
                ],
                ["예상 API 비용", cost(t.cost)],
                ["Quota 차단", number(t.blocked)],
              ].map(([label, value]) => (
                <Card className="min-w-0 p-4" key={label}>
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className="mt-3 break-words text-xl font-semibold">
                    {value}
                  </p>
                </Card>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              성공 {t.succeeded} · 실패 {t.failed} · 비용 미집계 {t.unknownCost}
              건 · 평균 {number(t.avgLatency)}ms / p95 {number(t.p95Latency)}ms
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <Trend
                title="7일 AI 호출 추이"
                days={overview.days}
                metric="calls"
              />
              <Trend
                title="7일 예상 비용 추이 · USD"
                days={overview.days}
                metric="cost"
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="space-y-3 p-5">
                <h3 className="text-sm font-semibold">
                  모델 / 기능별 사용 · 7일
                </h3>
                {overview.models.map((m) => (
                  <p key={m.model} className="break-all text-xs leading-6">
                    {m.model}
                    <br />
                    {m.calls}건 · {cost(m.cost)}
                  </p>
                ))}
                {overview.features.map((f) => (
                  <p className="text-xs" key={f.feature}>
                    {featureLabels[f.feature as AiFeature] ?? f.feature} · {f.calls}건
                  </p>
                ))}
                {!overview.models.length ? (
                  <p className="text-xs text-zinc-500">
                    아직 사용 기록이 없습니다.
                  </p>
                ) : null}
              </Card>
              <Card className="space-y-3 p-5">
                <h3 className="text-sm font-semibold">최근 실패 · 최대 10건</h3>
                {overview.failures.length ? (
                  overview.failures.map((f) => (
                    <p
                      key={f.request_id}
                      className="break-all text-xs leading-6"
                    >
                      {date(f.created_at)} · {f.error_code}
                      <br />
                      <span className="text-zinc-500">{f.model}</span>
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">최근 실패가 없습니다.</p>
                )}
              </Card>
              <Card className="space-y-3 p-5">
                <h3 className="text-sm font-semibold">
                  사용량 상위 사용자 · 7일
                </h3>
                {overview.users.length ? (
                  overview.users.map((u) => (
                    <p key={u.user_id} className="break-all text-xs leading-6">
                      {u.display_name || "이름 없음"} · {u.calls}회 <span className="text-zinc-500">{u.user_id.slice(0, 8)}…</span>
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">
                    아직 사용 기록이 없습니다.
                  </p>
                )}
              </Card>
            </div>
          </>
        ) : null}
        {settings && !loading ? (
          <SettingsForm
            key={revision}
            settings={settings}
            canEdit={role === "owner" || role === "admin"}
            onSaved={refresh}
          />
        ) : null}
        <Card className="space-y-4 p-5">
          <h3 className="text-sm font-semibold">AI 사용 기록</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setUsageLoading(true);
              setPage(1);
              setApplied({ ...filters });
            }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              ["from", "시작일"],
              ["to", "종료일"],
              ["user", "사용자 UUID"],
            ].map(([key, label]) => (
              <label className="text-xs text-zinc-500" key={key}>
                {label}
                <input
                  className={inputClass}
                  type={key === "user" ? "text" : "date"}
                  value={filters[key] || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, [key]: e.target.value })
                  }
                />
              </label>
            ))}
            {[
              [
                "status",
                "상태",
                ["reserved", "succeeded", "failed", "quota_blocked"],
              ],
              ["plan", "플랜", ["free", "pro"]],
              ["feature", "기능", [...AI_FEATURES]],
              ["model", "모델", settings?.models.map((m) => m.model) || []],
            ].map(([key, label, options]) => (
              <label key={key as string} className="text-xs text-zinc-500">
                {label as string}
                <select
                  className={inputClass}
                  value={filters[key as string] || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, [key as string]: e.target.value })
                  }
                >
                  <option value="">전체</option>
                  {(options as string[]).map((o) => (
                    <option key={o} value={o}>{key === "feature" ? featureLabels[o as AiFeature] : o}</option>
                  ))}
                </select>
              </label>
            ))}
            <div className="flex items-end gap-2">
              <Button type="submit" size="md">
                조회
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setFilters({});
                  setApplied({});
                  setPage(1);
                  setUsageLoading(true);
                }}
              >
                초기화
              </Button>
            </div>
          </form>
          {usageLoading ? (
            <p role="status" className="text-sm">
              사용 기록을 불러오는 중...
            </p>
          ) : usageError ? (
            <p role="alert" className="text-sm">
              {usageError}
            </p>
          ) : usage?.records.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-500">
                  <tr>
                    {[
                      "시각 (KST)",
                      "사용자 / 모델",
                      "상태",
                      "입력 / 출력 / Thinking",
                      "예상 API 비용",
                    ].map((h) => (
                      <th className="whitespace-nowrap p-3" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usage.records.map((r) => (
                    <tr
                      className="border-t border-zinc-100 dark:border-zinc-800"
                      key={r.request_id}
                    >
                      <td className="whitespace-nowrap p-3">
                        {date(r.created_at)}
                      </td>
                      <td className="p-3">
                        <p>{r.display_name || "이름 없음"}</p><p className="font-mono text-zinc-500" title={r.user_id}>{r.user_id.slice(0, 8)}…</p>
                        <p className="mt-1 text-zinc-500">
                          {featureLabels[r.feature]} · {r.model} · {r.effective_plan.toUpperCase()}
                        </p>
                      </td>
                      <td className="p-3">
                        <Badge
                          tone={
                            r.status === "succeeded"
                              ? "emerald"
                              : r.status === "failed"
                                ? "amber"
                                : "default"
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap p-3">
                        {number(r.input_tokens)} / {number(r.output_tokens)} / {number(r.thought_tokens ?? null)}
                        <p className="text-[10px] text-zinc-500">캐시 입력 {number(r.cached_input_tokens ?? null)}</p>
                      </td>
                      <td className="p-3">{cost(r.estimated_cost_microusd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-zinc-500">
              조건에 맞는 사용 기록이 없습니다.
            </p>
          )}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span>
              {usage?.total || 0}건 · {page}페이지
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1 || usageLoading}
                onClick={() => {
                  setUsageLoading(true);
                  setPage((p) => p - 1);
                }}
              >
                이전
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!usage || page >= usage.totalPages || usageLoading}
                onClick={() => {
                  setUsageLoading(true);
                  setPage((p) => p + 1);
                }}
              >
                다음
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
function Trend({
  title,
  days,
  metric,
}: {
  title: string;
  days: AiOverview["days"];
  metric: "calls" | "cost";
}) {
  const max = Math.max(1, ...days.map((d) => d[metric] || 0));
  return (
    <Card className="min-w-0 p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div
        className="mt-5 flex h-36 items-end gap-2"
        role="img"
        aria-label={days
          .map((d) => `${d.day}: ${metric === "cost" ? cost(d.cost) : d.calls}`)
          .join(", ")}
      >
        {days.map((d) => (
          <div
            key={d.day}
            className="flex h-full min-w-0 flex-1 flex-col justify-end text-center"
          >
            <span className="mb-1 truncate text-[10px] text-zinc-500">
              {metric === "cost" ? d.cost === null ? "—" : (d.cost / 1000000).toFixed(4) : d.calls}
            </span>
            <div
              className="mx-auto w-full max-w-12 rounded-t bg-indigo-500/70 dark:bg-indigo-400/60"
              style={{
                height: `${Math.max(2, ((d[metric] || 0) / max) * 90)}px`,
              }}
            />
            <span className="mt-2 text-[10px] text-zinc-500">
              {d.day.slice(5, 10)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
function SettingsForm({
  settings,
  canEdit,
  onSaved,
}: {
  settings: AiSettings;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const [enabled, setEnabled] = useState(settings.runtime.managed_ai_enabled);
  const [model, setModel] = useState(settings.runtime.default_model);
  const initialLimits = () => Object.fromEntries(AI_FEATURES.map((feature) => [
    feature,
    {
      free: settings.limits.find((limit) => limit.plan === "free" && limit.feature === feature)?.limit_count ?? 0,
      pro: settings.limits.find((limit) => limit.plan === "pro" && limit.feature === feature)?.limit_count ?? 0,
    },
  ])) as Record<AiFeature, { free: number; pro: number }>;
  const [limits, setLimits] = useState(initialLimits);
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const valid =
    Object.values(limits).flatMap((item) => [item.free, item.pro]).every((n) => Number.isInteger(n) && n >= 0 && n <= 1000) &&
    settings.models.some((m) => m.model === model && m.enabled);
  const save = async () => {
    if (lock.current || !valid || !canEdit) return;
    lock.current = true;
    setSaving(true);
    try {
      await requestAdminApi("/ai/settings", undefined, {
        enabled,
        model,
        limits,
      });
      window.dispatchEvent(new Event("oom-ai-changed"));
      onSaved();
    } catch {
      setError("변경 내용을 저장하지 못했습니다.");
    } finally {
      lock.current = false;
      setSaving(false);
      setConfirm(false);
    }
  };
  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-semibold">AI 운영 설정</h3>
        <Badge
          tone={settings.runtime.managed_ai_enabled ? "emerald" : "default"}
        >
          {settings.runtime.managed_ai_enabled ? "운영 중" : "OFF"}
        </Badge>
      </div>
      <p className="text-xs text-zinc-500">
        FREE는 현재 기본 정책입니다. PRO 한도는 미래 설정이며 구독·구매 기능은
        준비 중입니다. 요청 제한: 분당 {settings.runtime.requests_per_minute}회.
      </p>
      <fieldset
        disabled={!canEdit || saving}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2"><label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              setEnabled(e.target.checked);
              setConfirm(false);
            }}
          />
          Managed AI ON
        </label>
        <label className="text-xs">
          기본 Gemini 모델
          <select
            className={inputClass}
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setConfirm(false);
            }}
          >
            {settings.models
              .filter((m) => m.enabled)
              .map((m) => (
                <option key={m.model}>{m.model}</option>
              ))}
          </select>
        </label></div>
        <div className="grid gap-3">
          {AI_FEATURES.map((feature) => (
            <div className="grid gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800 sm:grid-cols-[1fr_160px_160px]" key={feature}>
              <p className="self-center text-sm font-semibold">{featureLabels[feature]}</p>
              {(["free", "pro"] as const).map((plan) => (
                <label className="text-xs" key={plan}>
                  {plan === "free" ? "FREE 하루 한도" : "향후 PRO 하루 한도"}
                  <input className={inputClass} type="number" min="0" max="1000"
                    value={Number.isNaN(limits[feature][plan]) ? "" : limits[feature][plan]}
                    onChange={(event) => {
                      const value = event.target.value === "" ? NaN : Number(event.target.value);
                      setLimits((current) => ({ ...current, [feature]: { ...current[feature], [plan]: value } }));
                      setConfirm(false);
                    }} />
                </label>
              ))}
            </div>
          ))}
        </div>
      </fieldset>
      <details className="text-xs text-zinc-500">
        <summary className="cursor-pointer">예상 비용 산정 기준</summary>
        {settings.models.map((m) => (
          <p key={m.model} className="mt-2 break-words leading-6">
            {m.model} · 100만 토큰 입력{" "}
            {cost(m.input_cost_per_million_microusd)} / 출력{" "}
            {cost(m.output_cost_per_million_microusd)}
            <br />
            {m.pricing_note}
          </p>
        ))}
      </details>
      {!valid ? (
        <p role="alert" className="text-xs text-amber-600">
          한도는 0~1000의 정수로 입력해 주세요.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-amber-600">
          {error}
        </p>
      ) : null}
      {canEdit ? (
        confirm ? (
          <div className="space-y-3 rounded-md bg-amber-50 p-4 text-sm dark:bg-amber-950/40">
            <p>
              AI {enabled ? "ON" : "OFF"} · 기능별 한도 · {model}로 변경할까요? 적용 즉시 이후 요청에 반영되며 감사 로그에
              기록됩니다.
            </p>
            <div className="flex gap-2">
              <Button disabled={saving} onClick={() => void save()}>
                {saving ? "저장 중..." : "변경 확정"}
              </Button>
              <Button
                variant="secondary"
                disabled={saving}
                onClick={() => setConfirm(false)}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" disabled={!valid} onClick={() => setConfirm(true)}>
            변경 내용 확인
          </Button>
        )
      ) : (
        <p className="text-xs text-zinc-500">
          운영 지원 권한은 조회만 가능합니다.
        </p>
      )}
      <p className="text-xs leading-5 text-zinc-500">Managed AI OFF는 OOM 관리형 요청만 차단합니다. 브라우저에서 직접 호출하는 사용자 지정 API와 STT는 영향을 받지 않습니다.</p>
    </Card>
  );
}
