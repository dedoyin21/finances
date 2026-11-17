import type { Metadata } from "next";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, ChartNoAxesColumnIncreasing, CircleCheck, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { getDashboardData } from "@/lib/dashboard";
import { formatKobo, lastSixMonths, nigerianMonth } from "@/lib/money";
import { CashFlowChart } from "@/components/cash-flow-chart";

export const metadata: Metadata = { title: "Your overview" };

export default async function DashboardPage() {
  const user = await requireUser();
  const month = nigerianMonth();
  const months = lastSixMonths(month);
  const nextMonth = new Date(`${month}T00:00:00Z`);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  const { transactions, categories, budgets } = await getDashboardData(user.id, months[0].date, month, nextMonth.toISOString().slice(0, 10));
  const monthlyTotals = months.map(({ date, label }) => {
    const entries = transactions.filter((t) => t.date.startsWith(date.slice(0, 7)));
    return { month: label, income: entries.filter((t) => t.type === "income").reduce((sum, t) => sum + BigInt(t.amount), 0n), expense: entries.filter((t) => t.type === "expense").reduce((sum, t) => sum + BigInt(t.amount), 0n) };
  });
  const current = monthlyTotals[5];
  const label = new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date(`${month}T00:00:00Z`));
  const stats = [
    { label: "Income this month", amount: current.income, Icon: ArrowDownLeft, color: "bg-[#ebf2e1] text-[#63833d]" },
    { label: "Expenses this month", amount: current.expense, Icon: ArrowUpRight, color: "bg-[#f8eee3] text-[#ae8252]" },
    { label: "Net this month", amount: current.income - current.expense, Icon: Wallet, color: "bg-[#e9efed] text-[#497568]" },
  ];
  return <>
    <div className="mb-9 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-[10px] font-semibold tracking-[2px] text-[#8a9a75]">A LITTLE CLARITY, EVERY DAY</p><h1 className="editorial text-4xl tracking-[-1px] sm:text-[44px]">Your money, in view.</h1><p className="mt-3 text-sm text-[#87927b]">A little intention today. More peace of mind tomorrow.</p></div><div className="flex items-center gap-2 rounded-lg border border-[#e1e6d8] bg-white px-4 py-2.5 text-xs"><CalendarDays size={15} className="text-[#8d9b7a]" aria-hidden="true" />{label}</div></div>
    <div className="grid gap-4 md:grid-cols-3">{stats.map(({ label: title, amount, Icon, color }) => <section key={title} className="rounded-xl border border-[#e3e8da] bg-white p-6"><div className="mb-6 flex items-center justify-between gap-2"><h2 className="text-xs text-[#859078]">{title}</h2><span className={`flex size-8 items-center justify-center rounded-lg ${color}`}><Icon size={17} aria-hidden="true" /></span></div><p className="break-words text-[clamp(22px,2.1vw,32px)] font-semibold tracking-[-1px] tabular-nums">{formatKobo(amount)}</p><p className="mt-2 text-[10px] text-[#9aa38e]">NGN · Nigerian naira</p></section>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_270px]">
      <section className="min-w-0 rounded-xl border border-[#e3e8da] bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-sm font-semibold">Money in, money out</h2><p className="mt-1.5 text-xs text-[#929d87]">Your last six months at a glance</p></div><div className="flex gap-4 text-[10px] text-[#8a967e]"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#2d6750]" /> Income</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#cfdbb7]" /> Expenses</span></div></div>
        {transactions.length ? <><CashFlowChart data={monthlyTotals.map((p) => ({ month: p.month, income: Number(p.income) / 100, expense: Number(p.expense) / 100 }))} /><details className="mt-6 text-xs text-[#859078]"><summary className="cursor-pointer">View exact monthly amounts</summary><div className="mt-3 overflow-x-auto"><table className="w-full text-left"><caption className="sr-only">Income and expenses in Nigerian naira, past six months</caption><thead><tr><th className="p-2">Month</th><th className="p-2">Income</th><th className="p-2">Expenses</th></tr></thead><tbody>{monthlyTotals.map((p) => <tr key={p.month}><th className="p-2 font-normal">{p.month}</th><td className="p-2">{formatKobo(p.income)}</td><td className="p-2">{formatKobo(p.expense)}</td></tr>)}</tbody></table></div></details></> : <div className="flex min-h-[280px] flex-col items-center justify-center text-center"><span className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#f1f5e9] text-[#859d68]"><ChartNoAxesColumnIncreasing size={24} strokeWidth={1.4} aria-hidden="true" /></span><h3 className="editorial text-2xl">A fresh page.</h3><p className="mt-2 max-w-[270px] text-xs leading-6 text-[#929d87]">No transactions in the past six months.<br />Your income and spending will appear here.</p></div>}
      </section>
      <section className="rounded-xl border border-[#dae4ca] bg-[#edf3e3] p-6"><CircleCheck size={25} className="mb-5 text-[#78974e]" strokeWidth={1.5} aria-hidden="true" /><h2 className="editorial text-2xl">Your space is ready.</h2><p className="mt-3 text-xs leading-6 text-[#7d8c6c]">One place for the little things that add up. Here’s where you stand.</p><dl className="mt-7 space-y-4 text-xs"><div className="flex justify-between border-b border-[#dce5cd] pb-3"><dt className="text-[#7d8c6c]">Your categories</dt><dd className="font-semibold">{categories}</dd></div><div className="flex justify-between"><dt className="text-[#7d8c6c]">Budgets this month</dt><dd className="font-semibold">{budgets}</dd></div></dl><p className="mt-8 text-[10px] leading-5 text-[#8d9b7e]">Your records are linked to your account.<br />Only you can access them in the app.</p></section>
    </div>
    <section className="mt-6 rounded-xl border border-[#e3e8da] bg-white p-6"><h2 className="text-sm font-semibold">Recent activity</h2><p className="mt-1.5 text-xs text-[#929d87]">Past six months</p>{transactions.length ? <div className="mt-5 divide-y divide-[#edf0e7]">{transactions.slice(0, 5).map((t) => <div key={t.id} className="flex items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="truncate text-sm">{t.note || (t.type === "income" ? "Income" : "Expense")}</p><p className="mt-1 text-[11px] text-[#95a087]">{new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${t.date}T00:00:00Z`))}</p></div><p className={`shrink-0 text-sm font-medium tabular-nums ${t.type === "income" ? "text-[#628344]" : "text-[#8d765e]"}`}>{t.type === "income" ? "+" : "−"}{formatKobo(t.amount)}</p></div>)}</div> : <p className="py-10 text-center text-xs text-[#929d87]">Nothing here yet. Every money story starts somewhere.</p>}</section>
  </>;
}
