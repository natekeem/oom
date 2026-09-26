// Real independent PostgreSQL connections, against a disposable DB with migrations applied.
// AI_TEST_DATABASE_URL and PG_MODULE (optional installed pg package path) are required.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
const { Client } = createRequire(import.meta.url)(
  process.env.PG_MODULE || "pg",
);
if (
  !process.env.AI_TEST_DATABASE_URL ||
  process.env.AI_TEST_ALLOW_DISPOSABLE !== "yes"
)
  throw new Error(
    "Set AI_TEST_DATABASE_URL and AI_TEST_ALLOW_DISPOSABLE=yes for a disposable DB only",
  );
const clients = await Promise.all(
  Array.from({ length: 3 }, async () => {
    const c = new Client({
      connectionString: process.env.AI_TEST_DATABASE_URL,
    });
    await c.connect();
    return c;
  }),
);
const [setup, a, b] = clients;
const user = randomUUID();
let original;
try {
  original = (
    await setup.query(
      "select managed_ai_enabled,requests_per_minute,(select limit_count from public.ai_plan_limits where plan='free' and feature='answer_feedback') free_limit from public.ai_runtime_settings where id",
    )
  ).rows[0];
  await setup.query(
    "insert into auth.users(id,raw_user_meta_data) values($1,'{}')",
    [user],
  );
  await setup.query(
    "update public.ai_runtime_settings set managed_ai_enabled=true,requests_per_minute=60",
  );
  await setup.query(
    "update public.ai_plan_limits set limit_count=1 where plan='free'",
  );
  // Hold the same user lock to ensure both requests contend, rather than accidentally run serially.
  await setup.query("begin");
  await setup.query("select pg_advisory_xact_lock(hashtextextended($1,3101))", [
    user,
  ]);
  const reserve = (c) =>
    c.query("select public.reserve_ai_usage($1,$2,$3,'answer_feedback','opic_answer_feedback_v1') result", [
      user,
      randomUUID(),
      "a".repeat(64),
    ]);
  const first = reserve(a),
    second = reserve(b);
  await new Promise((resolve) => setTimeout(resolve, 150));
  const waiting = await setup.query(
    "select count(*)::int n from pg_locks where locktype='advisory' and not granted",
  );
  assert.ok(waiting.rows[0].n >= 2, "both requests actually waiting for lock");
  await setup.query("commit");
  const result = await Promise.all([first, second]);
  assert.deepEqual(result.map((r) => r.rows[0].result.code).sort(), [
    "DAILY_QUOTA_EXCEEDED",
    "RESERVED",
  ]);
  const q = (await setup.query("select public.ai_quota($1,'answer_feedback') q", [user])).rows[0]
    .q;
  assert.equal(q.reserved, 1);
  assert.equal(q.remaining, 0);
  console.log(
    "PASS: actual concurrent last-slot contention: exactly one reserved, one rejected; reserved=1",
  );
} finally {
  await setup.query("rollback");
  await setup.query("delete from auth.users where id=$1", [user]);
  if (original) {
    await setup.query(
      "update public.ai_runtime_settings set managed_ai_enabled=$1,requests_per_minute=$2",
      [original.managed_ai_enabled, original.requests_per_minute],
    );
    await setup.query(
      "update public.ai_plan_limits set limit_count=$1 where plan='free'",
      [original.free_limit],
    );
  }
  await Promise.all(clients.map((c) => c.end()));
}
