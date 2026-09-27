import { useEffect, useRef, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { requestAdminApi } from "./adminApi";

export interface SttOverview {
  today: {
    calls: number;
    succeeded: number;
    failed: number;
    users: number;
    durationMs?: number | null;
    audioDurationMs?: number | null;
    audioMinutes?: number | null;
    cost: number | null;
    unknownCost: number;
    blocked: number;
    avgLatency: number | null;
    p95Latency: number | null;
  } | null;
  days: {
    day: string;
    calls: number;
    durationMs?: number | null;
    audioDurationMs?: number | null;
    minutes?: number | null;
    cost: number | null;
  }[];
  models: {
    model: string;
    calls: number;
    durationMs?: number | null;
    audioDurationMs?: number | null;
    cost: number | null;
  }[];
  sources: { source: string; calls: number }[];
  failures: {
    request_id: string;
    model: string;
    error_code: string;
    created_at: string;
  }[];
  users: {
    user_id: string;
    display_name?: string | null;
    calls: number;
    durationMs?: number | null;
    audioDurationMs?: number | null;
  }[];
}

export interface SttRuntimeData {
  managed_stt_enabled: boolean;
  default_provider?: string;
  default_model: string;
  requests_per_minute: number;
  daily_limit_ms_free?: number;
  daily_limit_ms_pro?: number;
  updated_at?: string;
}

export interface SttModelData {
  provider: string;
  model: string;
  enabled: boolean;
  input_cost_per_million_microusd?: number;
  output_cost_per_million_microusd?: number;
  estimated_cost_per_second_microusd?: number;
  cost_per_minute_microusd?: number;
  pricing_note?: string;
}

export interface SttLimitData {
  plan: "free" | "pro";
  limit_duration_ms: number;
  enabled: boolean;
}

export interface SttSettingsData {
  runtime: SttRuntimeData;
  models: SttModelData[];
  limits: SttLimitData[];
}

export interface SttUsageRecord {
  request_id: string;
  user_id: string;
  display_name?: string | null;
  status: string;
  model: string;
  effective_plan: string;
  duration_ms: number | null;
  estimated_cost_microusd: number | null;
  audio_format: string | null;
  created_at: string;
  error_code: string | null;
}

export interface SttUsage {
  records: SttUsageRecord[];
  page: number;
  total: number;
  totalPages: number;
}

export function normalizeSttOverview(raw: unknown): SttOverview {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const rawToday =
    data.today && typeof data.today === "object"
      ? (data.today as Record<string, unknown>)
      : null;

  const today = rawToday
    ? {
        calls: Number(rawToday.calls) || 0,
        succeeded: Number(rawToday.succeeded) || 0,
        failed: Number(rawToday.failed) || 0,
        users: Number(rawToday.users) || 0,
        durationMs:
          typeof rawToday.audioDurationMs === "number"
            ? rawToday.audioDurationMs
            : typeof rawToday.durationMs === "number"
            ? rawToday.durationMs
            : 0,
        audioDurationMs:
          typeof rawToday.audioDurationMs === "number"
            ? rawToday.audioDurationMs
            : typeof rawToday.durationMs === "number"
            ? rawToday.durationMs
            : 0,
        audioMinutes:
          typeof rawToday.audioMinutes === "number"
            ? rawToday.audioMinutes
            : typeof rawToday.audioDurationMs === "number"
            ? Math.round((rawToday.audioDurationMs / 60000) * 10) / 10
            : null,
        cost: typeof rawToday.cost === "number" ? rawToday.cost : null,
        unknownCost: Number(rawToday.unknownCost) || 0,
        blocked: Number(rawToday.blocked) || 0,
        avgLatency: typeof rawToday.avgLatency === "number" ? rawToday.avgLatency : null,
        p95Latency: typeof rawToday.p95Latency === "number" ? rawToday.p95Latency : null,
      }
    : null;

  const days = Array.isArray(data.days)
    ? data.days.map((d: Record<string, unknown>) => ({
        day: String(d.day || ""),
        calls: Number(d.calls) || 0,
        durationMs:
          typeof d.audioDurationMs === "number"
            ? d.audioDurationMs
            : typeof d.durationMs === "number"
            ? d.durationMs
            : null,
        audioDurationMs:
          typeof d.audioDurationMs === "number"
            ? d.audioDurationMs
            : typeof d.durationMs === "number"
            ? d.durationMs
            : null,
        minutes:
          typeof d.minutes === "number"
            ? d.minutes
            : typeof d.audioDurationMs === "number"
            ? Math.round((d.audioDurationMs / 60000) * 10) / 10
            : null,
        cost: typeof d.cost === "number" ? d.cost : null,
      }))
    : [];

  const models = Array.isArray(data.models)
    ? data.models.map((m: Record<string, unknown>) => ({
        model: String(m.model || ""),
        calls: Number(m.calls) || 0,
        durationMs:
          typeof m.audioDurationMs === "number"
            ? m.audioDurationMs
            : typeof m.durationMs === "number"
            ? m.durationMs
            : null,
        audioDurationMs:
          typeof m.audioDurationMs === "number"
            ? m.audioDurationMs
            : typeof m.durationMs === "number"
            ? m.durationMs
            : null,
        cost: typeof m.cost === "number" ? m.cost : null,
      }))
    : [];

  const sources = Array.isArray(data.sources)
    ? data.sources.map((s: Record<string, unknown>) => ({
        source: String(s.source || ""),
        calls: Number(s.calls) || 0,
      }))
    : [];

  const failures = Array.isArray(data.failures)
    ? data.failures.map((f: Record<string, unknown>) => ({
        request_id: String(f.request_id || ""),
        model: String(f.model || ""),
        error_code: String(f.error_code || ""),
        created_at: String(f.created_at || ""),
      }))
    : [];

  const users = Array.isArray(data.users)
    ? data.users.map((u: Record<string, unknown>) => ({
        user_id: String(u.user_id || ""),
        display_name: u.display_name ? String(u.display_name) : null,
        calls: Number(u.calls) || 0,
        durationMs:
          typeof u.audioDurationMs === "number"
            ? u.audioDurationMs
            : typeof u.durationMs === "number"
            ? u.durationMs
            : 0,
        audioDurationMs:
          typeof u.audioDurationMs === "number"
            ? u.audioDurationMs
            : typeof u.durationMs === "number"
            ? u.durationMs
            : 0,
      }))
    : [];

  return {
    today,
    days,
    models,
    sources,
    failures,
    users,
  };
}

export function normalizeSttSettings(raw: unknown): SttSettingsData {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const rawRuntime =
    data.runtime && typeof data.runtime === "object"
      ? (data.runtime as Record<string, unknown>)
      : {};

  const runtime: SttRuntimeData = {
    managed_stt_enabled: Boolean(rawRuntime.managed_stt_enabled),
    default_provider: String(rawRuntime.default_provider || "gemini"),
    default_model: String(rawRuntime.default_model || "gemini-3.5-transcribe"),
    requests_per_minute: Number(rawRuntime.requests_per_minute) || 5,
    daily_limit_ms_free:
      typeof rawRuntime.daily_limit_ms_free === "number" ? rawRuntime.daily_limit_ms_free : 600000,
    daily_limit_ms_pro:
      typeof rawRuntime.daily_limit_ms_pro === "number" ? rawRuntime.daily_limit_ms_pro : 3600000,
    updated_at: rawRuntime.updated_at ? String(rawRuntime.updated_at) : undefined,
  };

  const models: SttModelData[] = Array.isArray(data.models)
    ? data.models.map((m: Record<string, unknown>) => {
        const secCost =
          typeof m.estimated_cost_per_second_microusd === "number"
            ? m.estimated_cost_per_second_microusd
            : 83;
        const minCost =
          typeof m.cost_per_minute_microusd === "number"
            ? m.cost_per_minute_microusd
            : secCost * 60;
        return {
          provider: String(m.provider || "gemini"),
          model: String(m.model || ""),
          enabled: Boolean(m.enabled ?? true),
          input_cost_per_million_microusd:
            typeof m.input_cost_per_million_microusd === "number"
              ? m.input_cost_per_million_microusd
              : 2000000,
          output_cost_per_million_microusd:
            typeof m.output_cost_per_million_microusd === "number"
              ? m.output_cost_per_million_microusd
              : 12000000,
          estimated_cost_per_second_microusd: secCost,
          cost_per_minute_microusd: minCost,
          pricing_note: String(m.pricing_note || ""),
        };
      })
    : [];

  const rawLimits = Array.isArray(data.limits) ? (data.limits as Record<string, unknown>[]) : null;
  const limits: SttLimitData[] = rawLimits
    ? rawLimits.map((l) => ({
        plan: (l.plan === "pro" ? "pro" : "free") as "free" | "pro",
        limit_duration_ms: Number(l.limit_duration_ms) || (l.plan === "pro" ? 3600000 : 600000),
        enabled: Boolean(l.enabled ?? true),
      }))
    : [
        {
          plan: "free",
          limit_duration_ms: runtime.daily_limit_ms_free ?? 600000,
          enabled: true,
        },
        {
          plan: "pro",
          limit_duration_ms: runtime.daily_limit_ms_pro ?? 3600000,
          enabled: true,
        },
      ];

  return {
    runtime,
    models,
    limits,
  };
}

export function normalizeSttUsage(raw: unknown): SttUsage {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const records = Array.isArray(data.records)
    ? data.records.map((r: Record<string, unknown>) => ({
        request_id: String(r.request_id || ""),
        user_id: String(r.user_id || ""),
        display_name: r.display_name ? String(r.display_name) : null,
        status: String(r.status || "reserved"),
        model: String(r.model || ""),
        effective_plan: String(r.effective_plan || "free"),
        duration_ms:
          typeof r.audio_duration_ms === "number"
            ? r.audio_duration_ms
            : typeof r.duration_ms === "number"
            ? r.duration_ms
            : null,
        estimated_cost_microusd:
          typeof r.estimated_cost_microusd === "number" ? r.estimated_cost_microusd : null,
        audio_format: r.audio_format ? String(r.audio_format) : null,
        created_at: String(r.created_at || ""),
        error_code: r.error_code ? String(r.error_code) : null,
      }))
    : [];

  return {
    records,
    page: Number(data.page) || 1,
    total: Number(data.total) || 0,
    totalPages: Number(data.totalPages) || 1,
  };
}

const inputClass =
  "mt-1 h-10 w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

const cost = (v: number | null | undefined) =>
  v === null || v === undefined
    ? "미집계"
    : new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 4,
      }).format(v / 1000000);

const number = (v: number | null | undefined) =>
  v === null || v === undefined ? "미집계" : Math.round(v).toLocaleString();

const formatMinutes = (ms: number | null | undefined) => {
  if (ms === null || ms === undefined) return "미집계";
  const mins = (ms / 60000).toFixed(1);
  return `${mins}분`;
};

const date = (v: string) => {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(v));
  } catch {
    return v;
  }
};

export function AdminSttSection({ canEdit }: { canEdit: boolean }) {
  const [overview, setOverview] = useState<SttOverview | null>(null);
  const [settings, setSettings] = useState<SttSettingsData | null>(null);
  const [usage, setUsage] = useState<SttUsage | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);

  const [overviewLoading, setOverviewLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [usageLoading, setUsageLoading] = useState(true);

  const [overviewError, setOverviewError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [usageError, setUsageError] = useState("");

  useEffect(() => {
    let active = true;

    requestAdminApi<unknown>("/stt/overview")
      .then((data) => {
        if (active) {
          setOverview(normalizeSttOverview(data));
          setOverviewError("");
        }
      })
      .catch(() => {
        if (active) setOverviewError("STT 운영 현황을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (active) setOverviewLoading(false);
      });

    requestAdminApi<unknown>("/stt/settings")
      .then((data) => {
        if (active) {
          setSettings(normalizeSttSettings(data));
          setSettingsError("");
        }
      })
      .catch(() => {
        if (active) setSettingsError("STT 운영 설정을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (active) setSettingsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [revision]);

  useEffect(() => {
    let active = true;
    requestAdminApi<unknown>("/stt/usage", { ...applied, page })
      .then((data) => {
        if (active) {
          setUsage(normalizeSttUsage(data));
          setUsageError("");
        }
      })
      .catch(() => {
        if (active)
          setUsageError("사용 기록을 불러오지 못했습니다. 필터 값을 확인해 주세요.");
      })
      .finally(() => {
        if (active) setUsageLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision, applied, page]);

  const refresh = () => {
    setOverviewLoading(true);
    setSettingsLoading(true);
    setUsageLoading(true);
    setRevision((v) => v + 1);
  };

  const t = overview?.today ?? {
    calls: 0,
    succeeded: 0,
    failed: 0,
    users: 0,
    audioDurationMs: 0,
    audioMinutes: 0,
    durationMs: 0,
    cost: null,
    unknownCost: 0,
    blocked: 0,
    avgLatency: null,
    p95Latency: null,
  };

  const overviewModels = overview?.models ?? [];
  const failures = overview?.failures ?? [];
  const users = overview?.users ?? [];
  const records = usage?.records ?? [];
  const settingsModels = settings?.models ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">STT 음성 인식 운영</h2>
          <p className="mt-1 text-xs text-zinc-500">
            오늘 00:00 KST 기준 · 7일 추이는 오늘 포함 · Gemini 3.5 Transcribe 기준 (예상 API 비용은 변동될 수 있습니다)
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={refresh}>
          새로고침
        </Button>
      </div>

      {overviewLoading ? (
        <p role="status" className="py-8 text-sm text-zinc-500">
          STT 운영 정보를 불러오는 중...
        </p>
      ) : overviewError ? (
        <Card className="p-5">
          <p role="alert">{overviewError}</p>
          <Button className="mt-3" onClick={refresh}>
            다시 시도
          </Button>
        </Card>
      ) : overview ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {[
              ["오늘 STT 호출", number(t.calls)],
              ["오늘 전사 시간", formatMinutes(t.audioDurationMs ?? t.durationMs)],
              [
                "성공률",
                t.succeeded + t.failed
                  ? `${Math.round((t.succeeded / (t.succeeded + t.failed)) * 100)}%`
                  : "—",
              ],
              ["오늘 STT 사용자", number(t.users)],
              ["예상 API 비용", cost(t.cost)],
              ["Quota 차단", number(t.blocked)],
            ].map(([label, value]) => (
              <Card className="min-w-0 p-4" key={label}>
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="mt-3 break-words text-xl font-semibold">{value}</p>
              </Card>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            성공 {t.succeeded} · 실패 {t.failed} · 비용 미집계 {t.unknownCost}건 · 평균{" "}
            {number(t.avgLatency)}ms / p95 {number(t.p95Latency)}ms
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            <SttTrend title="7일 STT 호출 추이" days={overview.days} metric="calls" />
            <SttTrend title="7일 예상 비용 추이 · USD" days={overview.days} metric="cost" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="space-y-3 p-5">
              <h3 className="text-sm font-semibold">모델별 사용 · 7일</h3>
              {overviewModels.map((m) => (
                <p key={m.model} className="break-all text-xs leading-6">
                  {m.model}
                  <br />
                  {m.calls}건 · {formatMinutes(m.audioDurationMs ?? m.durationMs)} · {cost(m.cost)}
                </p>
              ))}
              {!overviewModels.length ? (
                <p className="text-xs text-zinc-500">아직 사용 기록이 없습니다.</p>
              ) : null}
            </Card>

            <Card className="space-y-3 p-5">
              <h3 className="text-sm font-semibold">최근 실패 · 최대 10건</h3>
              {failures.length ? (
                failures.map((f) => (
                  <p key={f.request_id} className="break-all text-xs leading-6">
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
              <h3 className="text-sm font-semibold">사용량 상위 사용자 · 7일</h3>
              {users.length ? (
                users.map((u) => (
                  <p key={u.user_id} className="break-all text-xs leading-6">
                    {u.display_name || "이름 없음"} · {u.calls}회 ({formatMinutes(u.audioDurationMs ?? u.durationMs)}){" "}
                    <span className="text-zinc-500">{u.user_id.slice(0, 8)}…</span>
                  </p>
                ))
              ) : (
                <p className="text-xs text-zinc-500">아직 사용 기록이 없습니다.</p>
              )}
            </Card>
          </div>
        </>
      ) : null}

      {settingsLoading ? (
        <p role="status" className="py-4 text-sm text-zinc-500">
          STT 설정을 불러오는 중...
        </p>
      ) : settingsError ? (
        <Card className="p-5">
          <p role="alert">{settingsError}</p>
          <Button className="mt-3" onClick={refresh}>
            다시 시도
          </Button>
        </Card>
      ) : settings ? (
        <SttSettingsForm
          key={revision}
          settings={settings}
          canEdit={canEdit}
          onSaved={refresh}
        />
      ) : null}

      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-semibold">STT 사용 기록</h3>
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
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
              />
            </label>
          ))}
          {[
            ["status", "상태", ["reserved", "succeeded", "failed", "quota_blocked"]],
            ["plan", "플랜", ["free", "pro"]],
            ["model", "모델", settingsModels.map((m) => m.model)],
          ].map(([key, label, options]) => (
            <label key={key as string} className="text-xs text-zinc-500">
              {label as string}
              <select
                className={inputClass}
                value={filters[key as string] || ""}
                onChange={(e) => setFilters({ ...filters, [key as string]: e.target.value })}
              >
                <option value="">전체</option>
                {(options as string[]).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
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
        ) : records.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-500">
                <tr>
                  {["시각 (KST)", "사용자 / 모델", "상태", "오디오 시간 / 포맷", "예상 API 비용"].map(
                    (h) => (
                      <th className="whitespace-nowrap p-3" key={h}>
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr
                    className="border-t border-zinc-100 dark:border-zinc-800"
                    key={r.request_id}
                  >
                    <td className="whitespace-nowrap p-3">{date(r.created_at)}</td>
                    <td className="p-3">
                      <p>{r.display_name || "이름 없음"}</p>
                      <p className="font-mono text-zinc-500" title={r.user_id}>
                        {r.user_id.slice(0, 8)}…
                      </p>
                      <p className="mt-1 text-zinc-500">
                        {r.model} · {r.effective_plan.toUpperCase()}
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
                      {formatMinutes(r.duration_ms)}
                      <p className="text-[10px] text-zinc-500">{r.audio_format || "미지정"}</p>
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
              disabled={!usage || page >= (usage.totalPages || 1) || usageLoading}
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
  );
}

function SttTrend({
  title,
  days = [],
  metric,
}: {
  title: string;
  days?: SttOverview["days"];
  metric: "calls" | "cost";
}) {
  const safeDays = Array.isArray(days) ? days : [];
  const max = Math.max(1, ...safeDays.map((d) => (d ? d[metric] || 0 : 0)));
  return (
    <Card className="min-w-0 p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {!safeDays.length ? (
        <p className="mt-5 text-xs text-zinc-500">추이 데이터가 없습니다.</p>
      ) : (
        <div
          className="mt-5 flex h-36 items-end gap-2"
          role="img"
          aria-label={safeDays
            .map((d) => `${d.day}: ${metric === "cost" ? cost(d.cost) : d.calls}`)
            .join(", ")}
        >
          {safeDays.map((d) => (
            <div key={d.day} className="flex h-full min-w-0 flex-1 flex-col justify-end text-center">
              <span className="mb-1 truncate text-[10px] text-zinc-500">
                {metric === "cost" ? (d.cost === null ? "—" : (d.cost / 1000000).toFixed(4)) : d.calls}
              </span>
              <div
                className="mx-auto w-full max-w-12 rounded-t bg-emerald-500/70 dark:bg-emerald-400/60"
                style={{
                  height: `${Math.max(2, (((d ? d[metric] : 0) || 0) / max) * 90)}px`,
                }}
              />
              <span className="mt-2 text-[10px] text-zinc-500">{d.day ? d.day.slice(5, 10) : ""}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SttSettingsForm({
  settings,
  canEdit,
  onSaved,
}: {
  settings: SttSettingsData;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const runtime = settings?.runtime ?? {
    managed_stt_enabled: false,
    default_model: "gemini-3.5-transcribe",
    requests_per_minute: 5,
  };
  const models = settings?.models ?? [];
  const limits = settings?.limits ?? [];

  const [enabled, setEnabled] = useState(Boolean(runtime.managed_stt_enabled));
  const [model, setModel] = useState(
    runtime.default_model || models.find((m) => m.enabled)?.model || "gemini-3.5-transcribe"
  );

  const initialFreeMins = Math.round(
    (limits.find((l) => l.plan === "free")?.limit_duration_ms ??
      runtime.daily_limit_ms_free ??
      600000) / 60000
  );
  const initialProMins = Math.round(
    (limits.find((l) => l.plan === "pro")?.limit_duration_ms ??
      runtime.daily_limit_ms_pro ??
      3600000) / 60000
  );

  const [freeMins, setFreeMins] = useState(initialFreeMins);
  const [proMins, setProMins] = useState(initialProMins);
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);

  const enabledModels = models.filter((m) => m.enabled);
  const valid =
    Number.isInteger(freeMins) &&
    freeMins >= 0 &&
    freeMins <= 1440 &&
    Number.isInteger(proMins) &&
    proMins >= 0 &&
    proMins <= 1440 &&
    (enabledModels.length === 0 || enabledModels.some((m) => m.model === model));

  const save = async () => {
    if (lock.current || !valid || !canEdit) return;
    lock.current = true;
    setSaving(true);
    try {
      await requestAdminApi("/stt/settings", undefined, {
        enabled,
        model,
        limits: {
          free: freeMins * 60000,
          pro: proMins * 60000,
        },
      });
      window.dispatchEvent(new Event("oom-stt-changed"));
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
        <h3 className="text-sm font-semibold">STT 운영 설정</h3>
        <Badge tone={runtime.managed_stt_enabled ? "emerald" : "default"}>
          {runtime.managed_stt_enabled ? "운영 중" : "OFF"}
        </Badge>
      </div>
      <p className="text-xs text-zinc-500">
        현재 표시 플랜: FREE. PRO 한도는 미래 설정이며 유료 구독은 준비 중입니다. 요청 제한: 분당{" "}
        {runtime.requests_per_minute}회.
      </p>

      <fieldset disabled={!canEdit || saving} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => {
                setEnabled(e.target.checked);
                setConfirm(false);
              }}
            />
            Managed STT ON
          </label>
          <label className="text-xs">
            기본 Gemini STT 모델
            <select
              className={inputClass}
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setConfirm(false);
              }}
            >
              {enabledModels.map((m) => (
                <option key={m.model} value={m.model}>
                  {m.model}
                </option>
              ))}
              {enabledModels.length === 0 && (
                <option value={model}>{model}</option>
              )}
            </select>
          </label>
        </div>

        <div className="grid gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800 sm:grid-cols-2">
          <label className="text-xs">
            FREE 하루 한도 (분)
            <input
              className={inputClass}
              type="number"
              min="0"
              max="1440"
              value={Number.isNaN(freeMins) ? "" : freeMins}
              onChange={(e) => {
                setFreeMins(e.target.value === "" ? NaN : Number(e.target.value));
                setConfirm(false);
              }}
            />
            <span className="text-[10px] text-zinc-400">기본 10분 = 600,000ms</span>
          </label>
          <label className="text-xs">
            향후 PRO 하루 한도 (분)
            <input
              className={inputClass}
              type="number"
              min="0"
              max="1440"
              value={Number.isNaN(proMins) ? "" : proMins}
              onChange={(e) => {
                setProMins(e.target.value === "" ? NaN : Number(e.target.value));
                setConfirm(false);
              }}
            />
            <span className="text-[10px] text-zinc-400">기본 60분 = 3,600,000ms</span>
          </label>
        </div>
      </fieldset>

      <details className="text-xs text-zinc-500">
        <summary className="cursor-pointer">예상 비용 산정 기준</summary>
        {models.map((m) => (
          <p key={m.model} className="mt-2 break-words leading-6">
            {m.model} · 분당 {cost(m.cost_per_minute_microusd ?? (m.estimated_cost_per_second_microusd ? m.estimated_cost_per_second_microusd * 60 : null))}
            <br />
            {m.pricing_note || "Gemini 3.5 Transcribe 기준"}
          </p>
        ))}
        {!models.length && (
          <p className="mt-2">등록된 모델 정보가 없습니다.</p>
        )}
      </details>

      {!valid ? (
        <p role="alert" className="text-xs text-amber-600">
          한도는 0~1440(분)의 정수로 입력해 주세요.
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
              STT {enabled ? "ON" : "OFF"} · FREE {freeMins}분 / PRO {proMins}분 · {model}로
              변경할까요? 적용 즉시 이후 요청에 반영되며 감사 로그에 기록됩니다.
            </p>
            <div className="flex gap-2">
              <Button disabled={saving} onClick={() => void save()}>
                {saving ? "저장 중..." : "변경 확정"}
              </Button>
              <Button variant="secondary" disabled={saving} onClick={() => setConfirm(false)}>
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
        <p className="text-xs text-zinc-500">운영 지원 권한은 조회만 가능합니다.</p>
      )}

      <p className="text-xs leading-5 text-zinc-500">
        Managed STT OFF는 OOM 관리형 음성 인식 요청만 차단합니다. 브라우저에서 직접 호출하는
        사용자 지정 STT 및 기기 내 음성 인식은 영향을 받지 않습니다.
      </p>
    </Card>
  );
}
