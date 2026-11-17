import test from "node:test";
import assert from "node:assert/strict";
import { formatKobo, lastSixMonths, nigerianMonth } from "../src/lib/money.ts";

test("naira formatting keeps integer kobo exact, including sums over the JS safe limit", () => {
  assert.equal(formatKobo(125050), "₦1,250.50");
  assert.equal(formatKobo(1), "₦0.01");
  assert.equal(formatKobo(-1), "−₦0.01");
  assert.equal(formatKobo(0), "₦0.00");
  assert.equal(formatKobo(18014398509481982n), "₦180,143,985,094,819.82");
  assert.throws(() => formatKobo(0.1));
  assert.throws(() => formatKobo(Number.MAX_SAFE_INTEGER + 1));
});

test("month boundaries use Lagos and the six-month range crosses years", () => {
  assert.equal(nigerianMonth(new Date("2026-10-31T23:30:00Z")), "2026-11-01");
  assert.deepEqual(lastSixMonths("2026-02-01").map((m) => m.date), ["2025-09-01", "2025-10-01", "2025-11-01", "2025-12-01", "2026-01-01", "2026-02-01"]);
});
