import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getUser } from "@/lib/auth/user";
import { safeNext } from "@/lib/auth/validation";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; message?: string }> }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getUser()) redirect(next);
  const messages: Record<string, string> = {
    "logged-out": "You're logged out. See you next time.",
    "confirmation-error": "That confirmation link is invalid or has expired. Try logging in if you've already confirmed, or sign up again to request a new link.",
  };
  return <><p className="mb-4 text-[10px] font-bold tracking-[2px] text-[#839369]">YOUR MONEY, A LITTLE CLEARER</p><h2 className="editorial text-[42px] leading-tight tracking-[-1.3px]">Welcome back.</h2><p className="mb-9 mt-3 text-sm leading-6 text-[#7b8772]">Good to see you. Let’s pick up where you left off.</p><AuthForm mode="login" configured={!!getSupabaseConfig()} next={next} message={params.message ? messages[params.message] : undefined} /></>;
}
