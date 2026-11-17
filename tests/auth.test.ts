import test from "node:test";
import assert from "node:assert/strict";
import { readCredentials, safeNext } from "../src/lib/auth/validation.ts";

test("login redirects stay inside the protected dashboard", () => {
  assert.equal(safeNext("/dashboard?month=2026-11"), "/dashboard?month=2026-11");
  assert.equal(safeNext("/dashboard/settings"), "/dashboard/settings");
  for (const input of [undefined, ["/dashboard"], "https://evil.example", "//evil.example/dashboard", "/\\evil.example", "/dashboard/../../login", "/dashboardish", "/logout", "/dashboard\n", "javascript:alert(1)"]) {
    assert.equal(safeNext(input), "/dashboard", String(input));
  }
});

function credentials(email: string, password: string, confirmPassword = password) {
  const form = new FormData();
  form.set("email", email);
  form.set("password", password);
  form.set("confirmPassword", confirmPassword);
  return form;
}

test("server validation rejects malformed signup and preserves password whitespace", () => {
  assert.ok(readCredentials(credentials("not-email", "password123"), true).error);
  assert.ok(readCredentials(credentials("you@example.com", "short"), true).error);
  assert.ok(readCredentials(credentials("you@example.com", "password123", "mismatch"), true).error);
  assert.ok(readCredentials(credentials("you@example.com", "x".repeat(129)), true).error);
  assert.deepEqual(readCredentials(credentials(" you@example.com ", " password123 "), true), { email: "you@example.com", password: " password123 " });
  // Existing accounts may have a shorter password; don't impose signup rules at login.
  assert.equal(readCredentials(credentials("you@example.com", "short")).password, "short");
});
