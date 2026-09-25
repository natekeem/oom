// Deterministic browser QA. No real login, DB writes or paid provider calls.
// Start Vite on 4173 with VITE_SUPABASE_URL=https://oom-ai-qa.invalid and
// VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_qa_fixture_only.
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
fs.mkdirSync(".tmp/ai-qa", { recursive: true });
const assert = require("node:assert/strict");
const uid = "41000000-0000-4000-a000-000000000001";
const user = {
  id: uid,
  aud: "authenticated",
  role: "authenticated",
  email: "qa@example.invalid",
  user_metadata: { name: "QA fixture" },
  app_metadata: { provider: "google" },
  created_at: "2026-09-21T00:00:00Z",
};
const token =
  Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  ) +
  "." +
  Buffer.from(
    JSON.stringify({ sub: uid, role: "authenticated", exp: 4102444800 }),
  ).toString("base64url") +
  ".fixture";
const feedback = {
  schemaVersion: 1,
  overallSummary:
    "장소와 경험을 연결해 질문에 잘 답했어요. 과거 시제를 일정하게 유지하면 더 자연스러워져요.",
  strengths: ["주말에 공원을 찾은 이유와 구체적인 장면이 잘 드러나요."],
  improvements: [
    {
      issue: "과거 경험에서는 시제를 맞춰 주세요.",
      whyItMatters: "듣는 사람이 시간의 흐름을 따라가기 쉬워져요.",
      suggestion: "I go 대신 I went를 사용해 보세요.",
    },
  ],
  retryTip: "마지막에 그날의 느낌을 한 문장 더해 보세요.",
  dimensions: {
    relevance: 4,
    organization: 3,
    specificity: 4,
    naturalness: 3,
    languageControl: 3,
  },
  improvedAnswer:
    "Last weekend, I visited a small park near my home. I walked along the quiet path and enjoyed the fresh air. It helped me relax after a busy week.",
};
const settings = {
  runtime: {
    managed_ai_enabled: true,
    default_model: "gemini-3.5-flash-lite",
    requests_per_minute: 5,
  },
  limits: [
    { plan: "free", limit_count: 3 },
    { plan: "pro", limit_count: 30 },
  ],
  models: [
    {
      model: "gemini-3.5-flash-lite",
      enabled: true,
      input_cost_per_million_microusd: 300000,
      output_cost_per_million_microusd: 2500000,
      pricing_note: "QA fixture · Standard text pricing",
    },
  ],
};
const days = Array.from({ length: 7 }, (_, i) => ({
  day: `2026-09-${15 + i}`,
  calls: [5, 8, 4, 10, 12, 7, 3][i],
  cost: [1200, 1900, 800, 2500, 2900, 1800, 700][i],
}));
const overview = {
  today: {
    calls: 3,
    succeeded: 2,
    failed: 1,
    users: 2,
    inputTokens: 1840,
    outputTokens: 2210,
    cost: 700,
    unknownCost: 0,
    blocked: 1,
    avgLatency: 2310,
    p95Latency: 3100,
  },
  days,
  models: [{ model: "gemini-3.5-flash-lite", calls: 49, cost: 11800 }],
  features: [{ feature: "answer_feedback", calls: 49 }],
  failures: [
    {
      request_id: uid,
      model: "gemini-3.5-flash-lite",
      error_code: "PROVIDER_TIMEOUT",
      created_at: "2026-09-21T06:00:00Z",
    },
  ],
  users: [{ user_id: uid, display_name: "QA fixture", calls: 3 }],
};
(async () => {
  const b = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
  let captures = 0;
  const page = await b.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  let mode = "success",
    used = 0,
    delay = 0,
    posts = 0;
  await page.addInitScript(
    ({ user, token }) => {
      localStorage.setItem(
        "oom-training-selection-v1",
        JSON.stringify({
          courseId: "course-1",
          levelId: "advanced",
          selectedAt: new Date().toISOString(),
        }),
      );
      localStorage.setItem(
        "sb-oom-ai-qa-auth-token",
        JSON.stringify({
          access_token: token,
          refresh_token: "fixture",
          expires_at: 4102444800,
          expires_in: 3600,
          token_type: "bearer",
          user,
        }),
      );
    },
    { user, token },
  );
  const quota = () => ({
    feature: "answer_feedback",
    plan: "free",
    limit: 3,
    used,
    reserved: 0,
    remaining: Math.max(0, 3 - used),
    resetsAt: "2026-09-22T00:00:00+09:00",
    enabled: mode !== "disabled",
  });
  await page.route("https://oom-ai-qa.invalid/**", async (route) => {
    const u = new URL(route.request().url());
    const path = u.pathname;
    let data = {},
      status = 200;
    if (path.includes("/auth/v1")) data = user;
    else if (path.includes("/rest/v1/profiles"))
      data = {
        id: uid,
        display_name: "QA fixture",
        avatar_url: null,
        plan: "free",
        created_at: "2026-09-21T00:00:00Z",
        updated_at: "2026-09-21T00:00:00Z",
      };
    else if (path.includes("/rest/v1/learning_sessions")) {
      data = { id: uid, user_id: uid, mode: "quick_practice", status: "in_progress", question_count: 0, answered_count: 0, started_at: new Date().toISOString(), completed_at: null };
      if (route.request().method() === "PATCH") {
        const patch = route.request().postDataJSON();
        assert.equal(patch.status, "completed"); assert.equal(patch.answered_count, 1); assert.ok(patch.completed_at);
      }
    }
    else if (path.includes("/rest/v1/learning_attempts")) data = { id: uid };
    else if (path.includes("/rest/v1/")) data = [];
    else if (path.endsWith("/admin-api/me"))
      data = {
        userId: uid,
        role: "owner",
        displayName: "QA fixture",
        avatarUrl: null,
      };
    else if (path.endsWith("/admin-api/ai/overview")) data = overview;
    else if (path.endsWith("/admin-api/ai/settings")) data = settings;
    else if (path.endsWith("/admin-api/ai/usage"))
      data = {
        records: [
          {
            request_id: uid,
            user_id: uid,
            status: "succeeded",
            model: "gemini-3.5-flash-lite",
            effective_plan: "free",
            input_tokens: 840,
            output_tokens: 900,
            thought_tokens: 100,
            cached_input_tokens: 200,
            display_name: "QA fixture",
            estimated_cost_microusd: 2502,
            created_at: "2026-09-21T06:00:00Z",
          },
        ],
        total: 1,
        totalPages: 1,
        page: 1,
      };
    else if (path.endsWith("/admin-api/overview"))
      data = {
        metrics: {
          totalUsers: 2,
          newUsersToday: 1,
          newUsers7d: 2,
          activeLearners24h: 2,
          activeLearners7d: 2,
          learningSessions7d: 3,
          learningActivities7d: 4,
          learningSessionsToday: 1,
          learningActivitiesToday: 2,
          usersWithPreferences: 2,
        },
        recentUsers: [],
        recentLearningActivity: [],
      };
    else if (path.endsWith("/admin-api/users"))
      data = { users: [{ id: uid, displayName: "QA fixture", email: "qa@example.invalid", avatarUrl: null, joinedAt: "2026-09-21T00:00:00Z", lastSignInAt: null, planDisplay: "FREE", hasLearningPreferences: true, learningSessionCount: 2, learningActivityCount: 1, lastLearningAt: null }], total: 1, totalPages: 1, page: 1, pageSize: 20 };
    else if (path.endsWith("/admin-api/learning")) data = { records: [{ id: uid, userId: uid, userDisplayName: "QA fixture", type: "session", modeOrType: "quick_practice", targetLevel: "advanced", status: "completed", questionCount: 1, answeredCount: 1, timestamp: "2026-09-21T00:00:00Z" }], total: 1, page: 1, totalPages: 1, pageSize: 20 };
    else if (path.endsWith("/ai-api/quota")) data = quota();
    else if (path.endsWith("/ai-api/feedback")) {
      posts++;
      assert.equal(route.request().postDataJSON().learningAttemptId, uid);
      if (delay) await new Promise((r) => setTimeout(r, delay));
      if (mode === "error") {
        status = 503;
        data = {
          error: { code: "PROVIDER_UNAVAILABLE" },
          terminal: true,
          quotaConsumed: false,
          quota: quota(),
        };
      } else {
        used++;
        data = { feedback, quota: quota() };
      }
    }
    await route.fulfill({
      status,
      contentType: "application/json",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify(data),
    });
  });
  const shot = async (name) => {
    await page.screenshot({
      path: ".tmp/ai-qa/" + name + ".png",
      fullPage: true,
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "overflow " + name,
    );
    captures++;
  };
  const visit = async (route) => {
    await page.goto("http://localhost:4173" + route);
    await page.waitForTimeout(500);
  };
  for (const route of ["/admin/", "/admin/users/", "/mypage/"]) {
    await visit(route);
    await shot("reference-auth-" + route.replaceAll("/", ""));
  }
  for (const width of [1440, 1920, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : width === 1920 ? 1080 : 1000 });
    for (const theme of ["dark", "light"]) {
      await page.evaluate((t) => localStorage.setItem("oom-theme", t), theme);
      for (const route of ["/ai-settings/", "/admin/", "/admin/users/", "/admin/learning/", "/admin/ai/"]) {
        await visit(route);
        const expected = ["/admin/users/", "/admin/learning/", "/admin/ai/"].includes(route) ? "wide" : "default";
        assert.equal(await page.locator("[data-page-width]").getAttribute("data-page-width"), expected);
        if (width === 1920) assert.equal(Math.round((await page.locator("[data-page-width]").boundingBox()).width), expected === "wide" ? 1440 : 1280);
        await shot(`after-${width}-${theme}-${route.replaceAll("/", "")}`);
      }
      await visit("/practice/quick/");
      await page
        .getByRole("button", { name: "답변 시작", exact: true })
        .click();
      await page
        .getByRole("button", { name: "타이머만 시작", exact: true })
        .click();
      await page
        .getByRole("button", { name: "답변 종료", exact: true })
        .click();
      await page.locator("#answer-review").scrollIntoViewIfNeeded();
      const dismiss = page.getByRole("button", { name: "알림 닫기" });
      if (await dismiss.count()) await dismiss.click();
      await shot(`quick-${width}-${theme}-empty`);
      await page
        .getByRole("textbox", { name: "내 답변 Transcript 입력 및 수정" })
        .fill(
          "Last weekend I go to a park near my home. I walked on a quiet path and felt relaxed.",
        );
      used = 0;
      mode = "success";
      delay = 1200;
      await page
        .getByRole("button", { name: "AI 피드백 받기", exact: true })
        .click();
      await shot(`quick-${width}-${theme}-loading`);
      await page.getByText(feedback.overallSummary).waitFor();
      await shot(`quick-${width}-${theme}-success`);
      await page
        .getByRole("textbox", { name: "내 답변 Transcript 입력 및 수정" })
        .fill("I visited the park yesterday. It was quiet.");
      mode = "error";
      delay = 0;
      await page
        .getByRole("button", { name: "AI 피드백 받기", exact: true })
        .click();
      await page.getByRole("alert").filter({ hasText: "이번 요청" }).waitFor();
      await shot(`quick-${width}-${theme}-error`);
      used = 3;
      await page.evaluate(() =>
        window.dispatchEvent(new Event("oom-ai-changed")),
      );
      await page.getByText(/오늘 무료 AI 피드백을 모두/).waitFor();
      await shot(`quick-${width}-${theme}-quota`);
      await page.getByRole("button", { name: "연습 종료", exact: true }).click();
      await page.getByRole("heading", { name: "오늘 연습을 마쳤어요." }).waitFor();
      assert.equal(await page.evaluate(() => document.activeElement?.textContent), "오늘 연습을 마쳤어요.");
      await shot(`quick-${width}-${theme}-summary`);
      assert.ok(await page.getByText(/1문제 연습/).count());
      used = 0;
      mode = "success";
    }
  }
  await visit("/ai-settings/");
  await page.getByRole("radio", { name: "OOM 관리형 AI · 권장" }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.evaluate(() => localStorage.getItem("oom-ai-feedback-mode")), "custom");
  await page.getByLabel("API Key 또는 Authorization Token").pressSequentially("synthetic-qa-secret");
  await page.getByLabel("API Key 또는 Authorization Token").press("Tab");
  await page.getByRole("button", { name: "설정 저장하기" }).click();
  assert.ok(!(await page.evaluate(() => localStorage.getItem("oom-llm-settings"))).includes("synthetic-qa-secret"));
  assert.equal(await page.evaluate(() => sessionStorage.getItem("oom-llm-settings:key")), "synthetic-qa-secret");
  await page.getByRole("checkbox", { name: "이 기기에 API Key 저장", exact: true }).first().check();
  await page.getByRole("button", { name: "설정 저장하기" }).click();
  assert.ok((await page.evaluate(() => localStorage.getItem("oom-llm-settings"))).includes("synthetic-qa-secret"));
  await page.getByRole("checkbox", { name: "이 기기에 API Key 저장", exact: true }).first().uncheck();
  await page.getByRole("button", { name: "설정 저장하기" }).click();
  assert.ok(!(await page.evaluate(() => localStorage.getItem("oom-llm-settings"))).includes("synthetic-qa-secret"));
  await shot("custom-settings-mobile");
  await visit("/practice/quick/");
  await page.getByRole("button", { name: "답변 시작", exact: true }).click();
  await page.getByRole("button", { name: "타이머만 시작", exact: true }).click();
  await page.getByRole("button", { name: "답변 종료", exact: true }).click();
  await page.getByText("사용자 지정 LLM 설정이 필요합니다.").waitFor();
  assert.equal(await page.getByRole("button", { name: "AI 피드백 받기", exact: true }).count(), 0);
  await shot("custom-missing-mobile");
  await b.close();
  console.log("VISUAL QA PASS", captures, "screenshots, feedback posts", posts);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
