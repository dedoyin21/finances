import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const alice = "00000000-0000-4000-8000-000000000001";
const bob = "00000000-0000-4000-8000-000000000002";
const catA = "00000000-0000-4000-8000-000000000011";
const catB = "00000000-0000-4000-8000-000000000012";
const txA = "00000000-0000-4000-8000-000000000021";
const txB = "00000000-0000-4000-8000-000000000022";
const budgetA = "00000000-0000-4000-8000-000000000031";
const budgetB = "00000000-0000-4000-8000-000000000032";
const tables = ["categories", "transactions", "budgets"] as const;

test("migration enforces ownership, CRUD policies, category references and money constraints", async (t) => {
  const db = new PGlite();
  try {
    // Emulate only Supabase's auth identity plumbing. The app migration is unmodified.
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
      $$;
      grant usage on schema auth to anon, authenticated;
      insert into auth.users (id) values ('${alice}'), ('${bob}');
    `);
    await db.exec(await readFile(new URL("../supabase/migrations/001_initial_schema.sql", import.meta.url), "utf8"));

    async function asUser(id: string) {
      await db.exec("reset role; set role authenticated;");
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
    }
    async function denied(sql: string, code = "42501") {
      await assert.rejects(db.exec(sql), (error: unknown) => (error as { code?: string }).code === code);
    }

    await t.test("each user can create rows with default ownership", async () => {
      for (const [user, category, transaction, budget] of [[alice, catA, txA, budgetA], [bob, catB, txB, budgetB]]) {
        await asUser(user);
        await db.exec(`
          insert into public.categories (id, name, type) values ('${category}', 'Food', 'expense');
          insert into public.transactions (id, category_id, amount, type, note, date)
            values ('${transaction}', '${category}', 125050, 'expense', 'Lunch', '2026-11-17');
          insert into public.budgets (id, category_id, month, limit_amount)
            values ('${budget}', '${category}', '2026-11-01', 5000000);
        `);
      }
    });

    await t.test("both users can read and update only their own rows", async () => {
      for (const [user, other] of [[alice, bob], [bob, alice]]) {
        await asUser(user);
        for (const table of tables) {
          const visible = await db.query<{ user_id: string }>(`select user_id from public.${table}`);
          assert.deepEqual(visible.rows, [{ user_id: user }]);
          const hidden = await db.query(`select * from public.${table} where user_id = '${other}'`);
          assert.equal(hidden.rows.length, 0);
          const updated = await db.query(`update public.${table} set user_id = user_id where user_id = '${user}' returning id`);
          assert.equal(updated.rows.length, 1);
          const blocked = await db.query(`update public.${table} set user_id = user_id where user_id = '${other}' returning id`);
          assert.equal(blocked.rows.length, 0);
          const deleted = await db.query(`delete from public.${table} where user_id = '${other}' returning id`);
          assert.equal(deleted.rows.length, 0);
          await denied(`update public.${table} set user_id = '${other}' where user_id = '${user}'`);
        }
      }
    });

    await t.test("inserts cannot spoof another user's ID on any table", async () => {
      await asUser(alice);
      await denied(`insert into public.categories (user_id, name, type) values ('${bob}', 'Spoof', 'expense')`);
      await denied(`insert into public.transactions (user_id, category_id, amount, type) values ('${bob}', '${catB}', 100, 'expense')`);
      await denied(`insert into public.budgets (user_id, category_id, month, limit_amount) values ('${bob}', '${catB}', '2026-12-01', 100)`);
    });

    await t.test("category references enforce ownership and transaction type on insert and update", async () => {
      await asUser(alice);
      await denied(`insert into public.transactions (category_id, amount, type) values ('${catB}', 100, 'expense')`, "23503");
      await denied(`insert into public.budgets (category_id, month, limit_amount) values ('${catB}', '2026-12-01', 100)`, "23503");
      await denied(`update public.transactions set category_id = '${catB}' where id = '${txA}'`, "23503");
      await denied(`update public.budgets set category_id = '${catB}' where id = '${budgetA}'`, "23503");
      await denied(`insert into public.transactions (category_id, amount, type) values ('${catA}', 100, 'income')`, "23503");
      await denied(`delete from public.categories where id = '${catA}'`, "23503");
    });

    await t.test("money, names, month boundaries and unique budgets are constrained", async () => {
      for (const amount of [0, -100, "9007199254740992"]) {
        await denied(`insert into public.transactions (category_id, amount, type) values ('${catA}', ${amount}, 'expense')`, "23514");
        await denied(`insert into public.budgets (category_id, month, limit_amount) values ('${catA}', '2026-12-01', ${amount})`, "23514");
      }
      await denied("insert into public.categories (name, type) values ('   ', 'expense')", "23514");
      await denied("insert into public.categories (name, type) values (' FOOD ', 'expense')", "23505");
      await denied(`insert into public.budgets (category_id, month, limit_amount) values ('${catA}', '2026-12-17', 100)`, "23514");
      await denied(`insert into public.budgets (category_id, month, limit_amount) values ('${catA}', '2026-11-01', 100)`, "23505");
    });

    await t.test("anonymous requests and authenticated requests with no user have no access", async () => {
      await db.exec("reset role; set role anon;");
      for (const table of tables) await denied(`select * from public.${table}`);
      await asUser("");
      for (const table of tables) assert.equal((await db.query(`select * from public.${table}`)).rows.length, 0);
      await denied("insert into public.categories (name, type) values ('No identity', 'expense')");
    });

    await t.test("users can delete their own child rows and then categories", async () => {
      for (const user of [alice, bob]) {
        await asUser(user);
        for (const table of ["transactions", "budgets", "categories"]) {
          const result = await db.query(`delete from public.${table} returning id`);
          assert.equal(result.rows.length, 1);
        }
      }
      await db.exec("reset role");
      for (const table of tables) assert.equal((await db.query(`select * from public.${table}`)).rows.length, 0);
    });

    await t.test("account deletion cascades to all three tables without foreign key conflicts", async () => {
      await asUser(alice);
      await db.exec(`
        insert into public.categories (id, name, type) values ('${catA}', 'Transport', 'expense');
        insert into public.transactions (category_id, amount, type) values ('${catA}', 100, 'expense');
        insert into public.budgets (category_id, month, limit_amount) values ('${catA}', '2026-11-01', 100);
      `);
      await db.exec(`reset role; delete from auth.users where id = '${alice}';`);
      for (const table of tables) assert.equal((await db.query(`select * from public.${table}`)).rows.length, 0);
    });
  } finally {
    await db.close();
  }
});
