import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/user";
import { LogoutForm } from "@/components/logout-form";

export const metadata: Metadata = { title: "Log out" };

export default async function LogoutPage() {
  await requireUser();
  return <><p className="mb-4 text-[10px] font-bold tracking-[2px] text-[#839369]">UNTIL NEXT TIME</p><h2 className="editorial text-[42px] leading-tight tracking-[-1.3px]">All done for now?</h2><p className="mb-8 mt-3 text-sm leading-6 text-[#7b8772]">Your records will be here when you get back. Log out to end your session on this device.</p><LogoutForm /></>;
}
