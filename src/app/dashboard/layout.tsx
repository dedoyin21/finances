import Link from "next/link";
import { LayoutDashboard, LogOut, ShieldCheck, Sprout } from "lucide-react";
import { Brand } from "@/components/brand";
import { requireUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="min-h-dvh lg:grid lg:grid-cols-[230px_1fr]">
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-white focus:p-4">Skip to content</a>
    <aside className="flex flex-col border-b border-[#e5e9dd] bg-[#f2f5ec] p-6 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0 lg:p-7">
      <div className="flex items-center justify-between"><Brand href="/dashboard" /><Link href="/logout" className="text-sm lg:hidden">Log out</Link></div>
      <p className="mb-4 mt-12 hidden text-[9px] font-bold tracking-[2px] text-[#95a184] lg:block">YOUR SPACE</p>
      <nav aria-label="Main navigation" className="mt-5 lg:mt-0"><Link aria-current="page" href="/dashboard" className="flex items-center gap-3 rounded-lg bg-[#e2eacf] px-4 py-3 text-[13px] font-semibold"><LayoutDashboard size={17} aria-hidden="true" /> Overview</Link></nav>
      <div className="mt-auto hidden pt-12 lg:block"><div className="mb-7 rounded-xl border border-[#d9e2cc] p-4"><Sprout className="mb-3 text-[#72904e]" size={24} aria-hidden="true" /><p className="editorial text-xl">Little by little.</p><p className="mt-2 text-xs leading-5 text-[#81916f]">A clearer picture starts with showing up.</p></div><div className="border-t border-[#dce3d1] pt-5"><p className="truncate text-xs text-[#7b8970]" title={user.email}>{user.email}</p><Link href="/logout" className="mt-4 flex items-center gap-2 text-xs font-semibold"><LogOut size={15} aria-hidden="true" /> Log out</Link></div></div>
    </aside>
    <div className="min-w-0"><header className="flex items-center justify-between gap-3 border-b border-[#e9ece3] bg-white px-6 py-5 sm:px-10"><p className="text-xs text-[#8a967e]">Your space <span className="mx-3 text-[#c8d0bf]">/</span><span className="font-medium text-forest">Overview</span></p><span className="flex items-center gap-1.5 text-[10px] text-[#7d906a]"><ShieldCheck size={14} aria-hidden="true" /> Personal & private</span></header><main id="main" className="mx-auto max-w-[1300px] px-6 py-9 sm:px-10 sm:py-11">{children}</main></div>
  </div>;
}
