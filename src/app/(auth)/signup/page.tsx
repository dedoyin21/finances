import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getUser } from "@/lib/auth/user";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage() {
  if (await getUser()) redirect("/dashboard");
  return <><p className="mb-4 text-[10px] font-bold tracking-[2px] text-[#839369]">EVERY NAIRA HAS A STORY</p><h2 className="editorial text-[42px] leading-tight tracking-[-1.3px]">Make room for<br />better money habits.</h2><p className="mb-8 mt-3 text-sm leading-6 text-[#7b8772]">Start fresh. Create your own space to track and plan.</p><AuthForm mode="signup" configured={!!getSupabaseConfig()} /></>;
}
