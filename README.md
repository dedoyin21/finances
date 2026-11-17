# Kobo

A personal finance tracker foundation for Nigerian users, built with Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres, and Recharts. This step provides email/password accounts, protected routes, the database schema, and a read-only overview of your records. Transaction/category/budget editing is for the next step.

## 1. Install

Use Node.js 22.18+ (Node 24 LTS recommended) and npm. From this directory:

```bash
npm ci
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`. The committed lockfile pins the installed dependency versions.

## 2. Create your Supabase project and run the SQL

Create a project at [Supabase](https://supabase.com/dashboard). In **SQL Editor**, run the complete contents of [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql). Run it once in a fresh project; it is a versioned migration, not a repeatable seed. You can also apply it using the Supabase CLI migration workflow.

The migration creates:

| Table | Columns |
| --- | --- |
| `categories` | `id`, `user_id`, `name`, `type` (`income` or `expense`) |
| `transactions` | `id`, `user_id`, `category_id`, `amount`, `type`, `note`, `date`, `created_at` |
| `budgets` | `id`, `user_id`, `category_id`, `month`, `limit_amount` |

`amount` and `limit_amount` use Postgres `bigint`, an integer type, to avoid the low ceiling of a 32-bit integer. **₦1,250.50 is stored as `125050` kobo.** Values must be positive and at most `Number.MAX_SAFE_INTEGER` kobo; the transaction type indicates whether money is income or expense. The app sums amounts with `BigInt` and formats NGN with `en-NG`; charts use naira numbers, with exact totals available below the chart.

Every row belongs to `auth.users`, defaults `user_id` to `auth.uid()`, and is deleted when its account is deleted. RLS policies restrict SELECT, INSERT, UPDATE, and DELETE to the owning authenticated user, including checks that prevent transferring ownership on UPDATE. Anonymous users have no table privileges. A composite foreign key prevents transactions and budgets from referencing another user's category. Transaction/category types must match. Referenced categories cannot be deleted until their transactions and budgets are removed.

Category names are unique per user/type, ignoring surrounding spaces and letter case. Budgets use the first day of a month (`2026-11-01`), with one budget per user/category/month. A budget can reference an income or expense category; no automatic categories or budgets are created. Dates are calendar dates, and the app uses **Africa/Lagos** for the current month and default transaction date; `created_at` is a timezone-aware timestamp.

## 3. Set environment variables

Copy [.env.example](.env.example) to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

For macOS/Linux: `cp .env.example .env.local`.

Fill in the project URL and **publishable** API key from your Supabase project's connection/API settings:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

This project uses the current publishable-key naming. A legacy `anon` key also works as the value of `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never put a Supabase secret or `service_role` key here: those keys bypass RLS. `.env.local` is ignored by Git. Restart Next.js after changing environment values. Public variables are included in the browser build; use the correct values when building for production.

## 4. Configure email/password auth and confirmation

In Supabase **Authentication**:

1. Enable the **Email** provider with email/password signups. Keep **Confirm email** enabled for the normal flow. Set the minimum password length to at least 8 to match the form; Supabase remains the authority on password policy.
2. Under **URL Configuration**, set **Site URL** to `http://localhost:3000` and add `http://localhost:3000/auth/confirm` to allowed redirect URLs. When hosting later, replace the Site URL with your actual HTTPS origin and allow that origin's `/auth/confirm` URL. Supabase's Site URL controls the confirmation template destination.
3. Under **Email Templates → Confirm signup**, replace the confirmation link with this server-side token-hash link:

   ```html
   <h2>Confirm your Kobo account</h2>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm email</a></p>
   ```

4. Save the template. Test with an email address your Supabase project's mail configuration can deliver to. For delivery failures or throttling, inspect Supabase Auth logs and your SMTP configuration. You can disable confirmation temporarily in a development project to test immediate signup/login without email; re-enable it to test the complete confirmation flow.

The confirmation handler verifies the token hash, sets session cookies, and redirects to `/dashboard`. Invalid, expired, or already-used links return to `/login` with an explanation. If confirmation is disabled, signup immediately redirects to the dashboard.

## 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase configuration, the login/signup screens show a setup notice and disable submission. Protected pages still redirect to login.

| Route | Behavior |
| --- | --- |
| `/` | Redirects to `/dashboard` and then `/login` if signed out |
| `/signup` | Email/password registration, confirmation state, validation and submission feedback |
| `/login` | Email/password login, validation and safe return to a protected dashboard URL |
| `/auth/confirm` | Verifies email confirmation and creates the cookie session |
| `/dashboard` | Protected overview; real database totals, six-month chart, and recent transactions |
| `/logout` | Protected confirmation screen; its button submits a POST Server Action to sign out of this device |

The sidebar's Log out link opens the confirmation screen; simply visiting/prefetching `/logout` does not end a session. Authenticated visits to login/signup redirect to the dashboard. Passwords are submitted to Supabase Auth and are never stored in the public finance tables.

`src/proxy.ts` refreshes cookies and checks verified claims. The protected layout and page also call `getUser()` through `requireUser()` to validate against Supabase Auth. Database access uses the publishable key and the user's session, so RLS applies on the server and in the browser. A layout alone does not secure future Server Actions or API handlers: call `requireUser()` there too, and retain RLS.

## 6. Test

Run the automated checks:

```bash
npm test
npm run typecheck
npm run build
```

The tests run the actual SQL migration in an in-memory Postgres instance (PGlite). They emulate Supabase's `auth.users`, `auth.uid()`, and API roles, then execute queries as two authenticated users and an anonymous role. They cover own-row CRUD, invisible cross-user reads/updates/deletes, forged ownership, ownership changes, cross-user category references, matching transaction types, money bounds, unique category/budget constraints, and anonymous access. Other tests cover redirect injection, server credential validation, exact kobo formatting, and Nigerian month boundaries. These do not require Supabase credentials and do not contact a live project.

Test the real Supabase integration manually after steps 2–5:

1. Open `/dashboard` in a private browser window. It must redirect to `/login?next=%2Fdashboard`. Opening `/logout` while signed out must also redirect.
2. Create **user A** at `/signup`. Try malformed email, a short password, and non-matching confirmation; each should fail. With confirmation enabled, a valid signup should show the inbox notice and no protected content. Follow the email link; you should reach the dashboard. Try the same link again; it should show the confirmation error. With confirmation disabled, signup should enter the dashboard immediately.
3. Check the dashboard: a fresh account has zero totals, no activity, and no invented transactions. Reload to verify that cookies preserve the session. Visit `/login` while signed in; it should return to `/dashboard`.
4. Open `/logout`, then go back without submitting: you should remain signed in. Return and click **Log out of this device**. You should reach login with a logged-out message. Refresh or revisit `/dashboard`; it must require login. Try a wrong password, then log in with the correct password.
5. Create **user B** in another browser profile/private window, and confirm its email. In SQL Editor, use the fixture below for A. Reload both overviews. Only A should show the new records. SQL Editor normally runs with elevated privileges and **bypasses RLS**, so it is suitable for creating this fixture, not for checking user permissions. Automated tests execute under the restricted roles explicitly.
6. To confirm API isolation on the live project, use `@supabase/supabase-js` with the publishable key, sign in separately as A and B using `auth.signInWithPassword`, and call `from(table).select('*')` for each of the three tables. Each client must see only its own rows. As B, attempting to insert `user_id: A_ID` must fail; updating/deleting A's row ID must return zero rows; referencing A's category with `user_id: B_ID` must fail. Repeat as A against B. Do not use a service key for these checks.
7. If running with a short development JWT lifetime, leave the tab idle until expiry, then reload and navigate. A valid refresh session should keep you signed in. After signing out, it must not restore access.

Optional dashboard fixture (replace the UUID with user A's ID from **Authentication → Users**, and run once). This writes two categories, two transactions, and one budget to the selected account:

```sql
do $$
declare
  owner_id uuid := 'REPLACE_WITH_USER_A_UUID';
  salary_id uuid;
  food_id uuid;
  today_ng date := (now() at time zone 'Africa/Lagos')::date;
begin
  insert into public.categories (user_id, name, type)
    values (owner_id, 'Salary', 'income') returning id into salary_id;
  insert into public.categories (user_id, name, type)
    values (owner_id, 'Food', 'expense') returning id into food_id;
  insert into public.transactions (user_id, category_id, amount, type, note, date)
    values (owner_id, salary_id, 35000000, 'income', 'Monthly salary', today_ng),
           (owner_id, food_id, 125050, 'expense', 'Groceries', today_ng);
  insert into public.budgets (user_id, category_id, month, limit_amount)
    values (owner_id, food_id, date_trunc('month', today_ng)::date, 5000000);
end $$;
```

A's current-month overview should show **₦350,000.00 income**, **₦1,250.50 expenses**, **₦348,749.50 net**, two categories and one budget. B's fresh account should remain empty.

## Project map

```text
src/app/(auth)/             Login, signup, logout pages
src/app/auth/              Server Actions and email confirmation handler
src/app/dashboard/         Protected layout and database-backed overview
src/components/            Auth UI, branding and Recharts chart
src/lib/auth/              Session validation and credential/redirect helpers
src/lib/supabase/          Typed browser/server clients and session proxy
src/lib/database.types.ts  Schema types (keep aligned with migrations)
supabase/migrations/       SQL to run in Supabase
tests/                     PostgreSQL isolation and security/formatting tests
```

## References

- [Next.js App Router setup](https://nextjs.org/docs/app/getting-started/installation)
- [Supabase SSR clients and session refresh](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase Next.js confirmation flow](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Tailwind CSS with PostCSS](https://tailwindcss.com/docs/installation/using-postcss)
