import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Db } from "@/lib/server/db";
import { accessFrom, GRACE_DAYS, type EntitlementRow } from "@/lib/server/entitlements";
import { hmacHex, verifyPaddle, verifyStripe } from "@/lib/payments/signing";
import { SignatureError, type BillingEvent } from "@/lib/payments/types";
import { paddleEvents } from "@/lib/payments/paddle";
import { stripeEvents } from "@/lib/payments/stripe";
import { getIndex } from "@/lib/content/server";

// Pro subscriptions (REDESIGN.md 8): who has Pro, webhook signatures, idempotent webhooks,
// and server-side gating: a free learner gets a 403 for a Pro project's content.

const DAY = 86_400_000;
let signedIn: { id: string; email: string } | null = null;
vi.mock("@/lib/server/auth", async (orig) => ({ ...(await orig<typeof import("@/lib/server/auth")>()), getSessionUser: async () => signedIn }));

let db: Db;
let free: string;
let pro: string;
let lapsed: string;

beforeAll(async () => {
  process.env.PPC_DB_DIR = "memory";
  const mod = await import("@/lib/server/db");
  mod.resetDbForTests();
  db = await mod.getDb();
  const make = (who: string) => db.asService(async (q) => (await q<{ id: string }>("insert into auth.users (email) values ($1) returning id", [`${who}@x.test`]))[0]!.id);
  free = await make("free");
  pro = await make("pro");
  lapsed = await make("lapsed");
});

const row = (over: Partial<EntitlementRow>): EntitlementRow => ({ user_id: "u", plan: "pro-monthly", status: "active", current_period_end: new Date(Date.now() + 10 * DAY).toISOString(), provider: "sandbox", provider_customer_id: null, provider_subscription_id: null, ...over });

describe("who has Pro", () => {
  it("is free with no entitlement and no seat", () => {
    expect(accessFrom(null, null).pro).toBe(false);
  });
  it("keeps Pro for seven days after a failed payment, with the grace flag", () => {
    const now = Date.now();
    const pastDue = row({ status: "past_due", current_period_end: new Date(now - 2 * DAY).toISOString() });
    expect(accessFrom(pastDue, null, now)).toMatchObject({ pro: true, grace: true });
    expect(accessFrom(pastDue, null, now + (GRACE_DAYS + 1) * DAY).pro).toBe(false);
  });
  it("keeps Pro until the end of a paid period after cancelling", () => {
    const now = Date.now();
    const cancelled = row({ status: "canceled", current_period_end: new Date(now + 3 * DAY).toISOString() });
    expect(accessFrom(cancelled, null, now).pro).toBe(true);
    expect(accessFrom(cancelled, null, now + 4 * DAY).pro).toBe(false);
  });
  it("gives Pro for a founding membership and for a classroom seat", () => {
    expect(accessFrom(row({ plan: "founder", current_period_end: null }), null)).toMatchObject({ pro: true, via: "founder" });
    expect(accessFrom(null, new Date(Date.now() + DAY).toISOString())).toMatchObject({ pro: true, via: "seat" });
    expect(accessFrom(null, new Date(Date.now() - DAY).toISOString()).pro).toBe(false);
  });
});

describe("webhook signatures", () => {
  const body = JSON.stringify({ hello: "world" });
  const ts = Math.floor(Date.now() / 1000);
  it("accepts a correct Paddle signature and refuses a wrong or stale one", () => {
    expect(() => verifyPaddle("s3cret", `ts=${ts};h1=${hmacHex("s3cret", `${ts}:${body}`)}`, body)).not.toThrow();
    expect(() => verifyPaddle("s3cret", `ts=${ts};h1=${hmacHex("other", `${ts}:${body}`)}`, body)).toThrow(SignatureError);
    expect(() => verifyPaddle("s3cret", `ts=${ts - 3600};h1=${hmacHex("s3cret", `${ts - 3600}:${body}`)}`, body)).toThrow(SignatureError);
    expect(() => verifyPaddle("s3cret", null, body)).toThrow(SignatureError);
  });
  it("accepts a correct Stripe signature among several", () => {
    const good = hmacHex("whsec", `${ts}.${body}`);
    expect(() => verifyStripe("whsec", `t=${ts},v1=deadbeef,v1=${good}`, body)).not.toThrow();
    expect(() => verifyStripe("whsec", `t=${ts},v1=deadbeef`, body)).toThrow(SignatureError);
  });
});

describe("provider events", () => {
  it("reads a Paddle subscription event", () => {
    const [e] = paddleEvents({ event_id: "evt_1", event_type: "subscription.updated", occurred_at: "2026-10-01T00:00:00Z", data: { id: "sub_1", status: "past_due", customer_id: "ctm_1", current_billing_period: { ends_at: "2026-11-01T00:00:00Z" }, custom_data: { user_id: "u1", plan: "pro-yearly" } } });
    expect(e).toMatchObject({ kind: "subscription", userId: "u1", plan: "pro-yearly", status: "past_due", periodEnd: "2026-11-01T00:00:00Z", subscriptionId: "sub_1" });
  });
  it("reads a Stripe subscription being deleted as cancelled", () => {
    const [e] = stripeEvents({ id: "evt_2", type: "customer.subscription.deleted", created: 1_790_000_000, data: { object: { id: "sub_2", status: "canceled", customer: "cus_2", current_period_end: 1_790_500_000, metadata: { user_id: "u2", plan: "pro-monthly" } } } });
    expect(e).toMatchObject({ kind: "subscription", userId: "u2", status: "canceled", customerId: "cus_2" });
  });
});

describe("applying webhooks", () => {
  const ev = (over: Partial<BillingEvent>): BillingEvent => ({ id: `e_${Math.random()}`, type: "subscription.created", kind: "subscription", userId: pro, plan: "pro-monthly", status: "active", periodEnd: new Date(Date.now() + 30 * DAY).toISOString(), customerId: "c", subscriptionId: "s", occurredAt: new Date().toISOString(), ...over });

  it("applies an event once, however many times it's delivered", async () => {
    const { applyEvents } = await import("@/lib/payments/apply");
    const { getAccess } = await import("@/lib/server/entitlements");
    const e = ev({ id: "evt_once" });
    expect(await applyEvents(db, "sandbox", [e])).toMatchObject({ applied: 1 });
    expect(await applyEvents(db, "sandbox", [e])).toMatchObject({ applied: 0, duplicates: 1 });
    expect((await getAccess(db, pro)).pro).toBe(true);
  });

  it("ignores an older event that arrives late", async () => {
    const { applyEvents } = await import("@/lib/payments/apply");
    const { getAccess } = await import("@/lib/server/entitlements");
    await applyEvents(db, "sandbox", [ev({ userId: lapsed, occurredAt: new Date(Date.now()).toISOString(), status: "expired", periodEnd: new Date(Date.now() - DAY).toISOString() })]);
    const late = await applyEvents(db, "sandbox", [ev({ userId: lapsed, occurredAt: new Date(Date.now() - 60_000).toISOString(), status: "active" })]);
    expect(late.skipped).toBe(1);
    expect((await getAccess(db, lapsed)).pro).toBe(false);
  });
});

describe("server-side gating", () => {
  const acts = getIndex().acts;
  const proAct = acts[1]!;
  const proJobs = proAct.jobs.filter((j) => j.status === "written" && !j.sidequest && !j.placementFor);
  const firstPro = proJobs[0]!;
  const laterPro = proJobs[1]!;
  const freeJob = acts[0]!.jobs.find((j) => j.status === "written")!;

  async function content(jobId: string) {
    const { GET } = await import("@/app/api/content/jobs/[jobId]/route");
    return GET(new Request(`http://localhost/api/content/jobs/${jobId}`), { params: Promise.resolve({ jobId }) });
  }
  async function tests(key: string) {
    const { GET } = await import("@/app/api/tests/route");
    return GET(new Request(`http://localhost/api/tests?key=${encodeURIComponent(key)}`));
  }

  it("gives a free learner a 403 for a Pro project's content and tests", async () => {
    signedIn = { id: free, email: "free@x.test" };
    expect((await content(laterPro.id)).status).toBe(403);
    const job = (await import("@/lib/content/server")).getJob(laterPro.id)!;
    const checkable = job.steps.find((s) => "visibleTests" in s)!;
    expect((await tests(`${laterPro.id}/${checkable.id}`)).status).toBe(403);
  });

  it("gives a free learner only the Ask of an Act's first Pro project, as a preview", async () => {
    signedIn = { id: free, email: "free@x.test" };
    const res = await content(firstPro.id);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { job: { steps: { type: string }[] }; preview: boolean };
    expect(body.preview).toBe(true);
    expect(body.job.steps.map((s) => s.type)).toEqual(["ask"]);
  });

  it("gives signed-out visitors a 403 too, and everyone the free Act", async () => {
    signedIn = null;
    expect((await content(laterPro.id)).status).toBe(403);
    expect((await content(freeJob.id)).status).toBe(200);
  });

  it("opens Pro projects with Pro", async () => {
    signedIn = { id: pro, email: "pro@x.test" };
    expect((await content(laterPro.id)).status).toBe(200);
  });

  it("keeps a lapsed learner's own started projects open", async () => {
    await db.asUser(lapsed, (q) => q("insert into public.job_progress (user_id, job_id, status, time_spent_seconds, updated_at) values ($1, $2, 'in-progress', 60, $3)", [lapsed, laterPro.id, Date.now()]));
    signedIn = { id: lapsed, email: "lapsed@x.test" };
    expect((await content(laterPro.id)).status).toBe(200);
    expect((await content(proJobs[2]!.id)).status).toBe(403);
  });

  it("counts code a lapsed learner saved in a project as theirs, even with no step done", async () => {
    const job = proJobs[3]!;
    await db.asUser(lapsed, (q) => q("insert into public.code_files (user_id, job_id, step_id, filename, content, updated_at) values ($1, $2, 'make', 'main.py', 'print(1)', $3)", [lapsed, job.id, Date.now()]));
    signedIn = { id: lapsed, email: "lapsed@x.test" };
    expect((await content(job.id)).status).toBe(200);
  });
});

describe("classroom seats", () => {
  it("gives Pro to learners who join, until the seats run out", async () => {
    const { applyEvents, claimSeat } = await import("@/lib/payments/apply");
    const { getAccess } = await import("@/lib/server/entitlements");
    const make = (who: string) => db.asService(async (q) => (await q<{ id: string }>("insert into auth.users (email) values ($1) returning id", [`${who}@x.test`]))[0]!.id);
    const teacher = await make("seat-teacher");
    const [s1, s2] = [await make("seat-1"), await make("seat-2")];
    const classId = await db.asService(async (q) => {
      await q("insert into public.profiles (id, display_name, role, updated_at) values ($1, 'T', 'teacher', 1)", [teacher]);
      return (await q<{ id: string }>("insert into public.classes (teacher_id, name, join_code) values ($1, 'Year 9', 'BCDFGH') returning id", [teacher]))[0]!.id;
    });
    await applyEvents(db, "sandbox", [{ id: "seats_1", type: "subscription.created", kind: "seats", userId: teacher, plan: "classroom", status: "active", periodEnd: new Date(Date.now() + 300 * DAY).toISOString(), customerId: "c", subscriptionId: "seatsub_1", seats: 1, classId, occurredAt: new Date().toISOString() }]);
    expect(await claimSeat(db, s1, classId)).toBe(true);
    expect(await claimSeat(db, s2, classId)).toBe(false);
    expect((await getAccess(db, s1))).toMatchObject({ pro: true, via: "seat" });
    expect((await getAccess(db, s2)).pro).toBe(false);
  });
});

describe("funnel", () => {
  it("records subscribe and cancel from webhooks, and counts people per week", async () => {
    const { applyEvents } = await import("@/lib/payments/apply");
    const { totalFunnel, weeklyFunnel, recordFunnel } = await import("@/lib/server/funnel");
    const who = await db.asService(async (q) => (await q<{ id: string }>("insert into auth.users (email) values ('funnel@x.test') returning id"))[0]!.id);
    await recordFunnel(db, "visit-landing", { visitor: "visitor-aaaa-1" });
    await recordFunnel(db, "visit-landing", { visitor: "visitor-aaaa-1" });
    const base = { type: "subscription.updated", kind: "subscription" as const, userId: who, plan: "pro-monthly" as const, customerId: "c", subscriptionId: "s", periodEnd: new Date(Date.now() + DAY).toISOString() };
    await applyEvents(db, "sandbox", [{ ...base, id: "f1", status: "active", occurredAt: new Date(Date.now() - 2000).toISOString() }]);
    await applyEvents(db, "sandbox", [{ ...base, id: "f2", status: "canceled", occurredAt: new Date().toISOString() }]);
    const total = await totalFunnel(db);
    expect(total["visit-landing"]).toBe(1);
    expect(total.subscribe).toBeGreaterThanOrEqual(1);
    expect(total.cancel).toBeGreaterThanOrEqual(1);
    expect((await weeklyFunnel(db))[0]!.counts["visit-landing"]).toBe(1);
  });
});
