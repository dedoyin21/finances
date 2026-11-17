import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Transaction } from "@/lib/database.types";

export async function getDashboardData(userId: string, from: string, month: string, until: string) {
  const supabase = await createClient();
  async function allTransactions() {
    const rows: Transaction[] = [];
    // Supabase caps a response at 1,000 rows by default; don't silently truncate totals.
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase.from("transactions").select("*").eq("user_id", userId)
        .gte("date", from).lt("date", until).order("date", { ascending: false }).order("id").range(offset, offset + 999);
      if (error) throw new Error("Unable to load transactions. Check the Supabase connection and apply the database migration.");
      rows.push(...data);
      if (data.length < 1000) return rows;
    }
  }
  const [transactions, categoryResult, budgetResult] = await Promise.all([
    allTransactions(),
    supabase.from("categories").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("budgets").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("month", month),
  ]);
  if (categoryResult.error || budgetResult.error) throw new Error("Unable to load your overview. Check the Supabase connection and apply the database migration.");
  return { transactions, categories: categoryResult.count ?? 0, budgets: budgetResult.count ?? 0 };
}
