import { ArrowDownLeft, ArrowUpRight, Check, LockKeyhole, Sprout } from "lucide-react";
import { Brand } from "./brand";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh lg:grid lg:grid-cols-[46%_54%]">
    <aside className="auth-art relative hidden min-h-dvh flex-col overflow-hidden px-12 py-10 lg:flex xl:px-16">
      <Brand href="/login" />
      <div className="relative mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-14">
        <div className="mb-7 flex w-fit items-center gap-2 rounded-full border border-[#bac8a8] bg-[#f5f7ee] px-3 py-1.5 text-[10px] font-bold tracking-[1.5px]">
          <span className="flex h-3 w-4 overflow-hidden rounded-[2px]" aria-hidden="true"><span className="w-1/3 bg-[#248253]" /><span className="w-1/3 bg-white" /><span className="w-1/3 bg-[#248253]" /></span>
          MADE FOR LIFE IN NIGERIA
        </div>
        <h1 className="editorial max-w-[420px] text-[clamp(44px,4.3vw,66px)] leading-[1.07] tracking-[-2px]">Small steps.<br />Better money<br /><em className="text-[#628249]">habits.</em></h1>
        <p className="mt-6 max-w-[320px] text-[15px] leading-7 text-[#5c6d58]">From your first salary to your next big goal. Make every naira make sense.</p>
        <div className="relative mt-12 max-w-[360px] pb-7 pr-5" aria-label="Illustrative monthly balance card">
          <div className="art-card relative rounded-2xl border border-white/90 bg-[#fffffff2] p-6">
            <div className="flex items-center justify-between text-xs text-[#7b8676]"><span>A little clarity, every day</span><Sprout size={17} className="text-[#6b8c4c]" aria-hidden="true" /></div>
            <div className="mt-4 text-[30px] font-semibold tracking-[-1px]">Your money, in view.</div>
            <div className="mt-6 flex h-[74px] items-end gap-2" aria-hidden="true">{[30, 44, 38, 53, 45, 62, 57, 74, 66, 84, 78, 100].map((height, i) => <div key={i} className={`flex-1 rounded-t-[4px] ${i > 8 ? "bg-[#759953]" : "bg-[#e4ecd9]"}`} style={{ height: `${height}%` }} />)}</div>
            <div className="mt-3 flex justify-between text-[10px] text-[#8b9485]"><span>ONE DAY AT A TIME</span><span>ILLUSTRATION</span></div>
          </div>
          <div className="art-card absolute -right-1 bottom-0 flex items-center gap-2.5 rounded-xl border border-[#e7ecdF] bg-white px-4 py-3"><span className="flex size-7 items-center justify-center rounded-full bg-[#edf3e4] text-[#628249]"><Check size={15} aria-hidden="true" /></span><span className="text-xs font-medium">A fresh start for your finances</span></div>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#5c6d58]"><span className="flex items-center gap-1.5"><ArrowDownLeft size={15} aria-hidden="true" /> Track income</span><span className="flex items-center gap-1.5"><ArrowUpRight size={15} aria-hidden="true" /> Understand spending</span></div>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-[#728268]"><LockKeyhole size={13} aria-hidden="true" /> Your account. Your records. Your peace of mind.</div>
    </aside>
    <main id="main" className="relative flex min-h-dvh flex-col px-6 py-7 sm:px-12 lg:px-16 lg:py-10">
      <div className="flex items-center justify-between"><div className="lg:hidden"><Brand href="/login" /></div><div className="ml-auto flex items-center gap-2 text-[11px] text-[#7c8678]"><span className="size-1.5 rounded-full bg-[#73954c]" /> A fresh perspective on your money</div></div>
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12 sm:py-16">{children}</div>
      <footer className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#8a9284]"><span>© {new Date().getFullYear()} Kobo</span><span className="flex items-center gap-1.5"><LockKeyhole size={12} aria-hidden="true" /> Private by design · NGN by default</span></footer>
    </main>
  </div>;
}
