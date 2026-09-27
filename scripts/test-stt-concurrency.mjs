// Real independent PostgreSQL connections against a disposable DB with migrations applied.
// STT_TEST_DATABASE_URL and STT_TEST_ALLOW_DISPOSABLE=yes are required.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";

const { Client } = createRequire(import.meta.url)(
  process.env.PG_MODULE || "pg"
);

const databaseUrl = process.env.STT_TEST_DATABASE_URL || process.env.AI_TEST_DATABASE_URL;

if (
  !databaseUrl ||
  (process.env.STT_TEST_ALLOW_DISPOSABLE !== "yes" && process.env.AI_TEST_ALLOW_DISPOSABLE !== "yes")
) {
  console.log("Skipping STT concurrency test: STT_TEST_DATABASE_URL and STT_TEST_ALLOW_DISPOSABLE=yes required.");
  process.exit(0);
}

const clients = await Promise.all(
  Array.from({ length: 3 }, async () => {
    const c = new Client({ connectionString: databaseUrl });
    await c.connect();
    return c;
  })
);

const [setup, a, b] = clients;
const user = randomUUID();
let original;

try {
  original = (
    await setup.query(
      "select managed_stt_enabled, requests_per_minute, daily_limit_ms_free from public.stt_runtime_settings where id"
    )
  ).rows[0];

  await setup.query(
    "insert into auth.users(id, raw_user_meta_data) values($1, '{}')",
    [user]
  );

  // Set 60 seconds (60,000 ms) free daily limit
  await setup.query(
    "update public.stt_runtime_settings set managed_stt_enabled=true, requests_per_minute=60, daily_limit_ms_free=60000"
  );

  // Hold the advisory lock to ensure both connections contend concurrently
  await setup.query("begin");
  await setup.query("select pg_advisory_xact_lock(hashtextextended($1, 3201))", [user]);

  const reserve = (c) =>
    c.query(
      "select public.reserve_stt_usage($1, $2, $3, 45000, 'quick_practice') as result",
      [user, randomUUID(), "a".repeat(64)]
    );

  const first = reserve(a);
  const second = reserve(b);

  await new Promise((resolve) => setTimeout(resolve, 150));

  const waiting = await setup.query(
    "select count(*)::int as n from pg_locks where locktype='advisory' and not granted"
  );
  assert.ok(waiting.rows[0].n >= 2, "both requests are waiting for lock");

  await setup.query("commit");

  const results = await Promise.all([first, second]);
  const codes = results.map((r) => r.rows[0].result.code).sort();

  assert.deepEqual(codes, [
    "DAILY_STT_QUOTA_EXCEEDED",
    "RESERVED",
  ]);

  const q = (await setup.query("select public.stt_quota($1) as q", [user])).rows[0].q;
  assert.equal(q.reservedMs, 45000);
  assert.equal(q.remainingMs, 15000);

  console.log(
    "PASS: STT concurrent 45s reservation on 60s quota: exactly one RESERVED, one DAILY_STT_QUOTA_EXCEEDED; reservedMs=45000"
  );
} finally {
  await setup.query("rollback").catch(() => {});
  await setup.query("delete from auth.users where id=$1", [user]);
  if (original) {
    await setup.query(
      "update public.stt_runtime_settings set managed_stt_enabled=$1, requests_per_minute=$2, daily_limit_ms_free=$3",
      [original.managed_stt_enabled, original.requests_per_minute, original.daily_limit_ms_free]
    );
  }
  await Promise.all(clients.map((c) => c.end()));
}
