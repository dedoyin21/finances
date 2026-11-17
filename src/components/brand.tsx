import Link from "next/link";
import { Sprout } from "lucide-react";

export function Brand({ href = "/" }: { href?: string }) {
  return <Link href={href} aria-label="Kobo home" className="inline-flex w-fit items-center gap-2.5 text-forest">
    <span className="flex size-9 items-center justify-center rounded-xl bg-forest text-[#d4e9aa]"><Sprout size={24} strokeWidth={1.7} aria-hidden="true" /></span>
    <span className="text-[28px] font-bold tracking-[-1.5px]">kobo<span className="text-[#78974e]">.</span></span>
  </Link>;
}
