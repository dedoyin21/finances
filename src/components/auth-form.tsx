"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LoaderCircle, Mail } from "lucide-react";
import { login, signup } from "@/app/auth/actions";
import type { AuthState } from "@/lib/auth/validation";

export function AuthForm({ mode, configured, next = "/dashboard", message }: { mode: "login" | "signup"; configured: boolean; next?: string; message?: string }) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState<AuthState, FormData>(isSignup ? signup : login, {});
  const [visible, setVisible] = useState(false);

  if (state.success) return <div role="status" className="space-y-5 rounded-xl border border-[#ceddbb] bg-[#f2f6e9] p-6"><CheckCircle2 className="text-[#5c7a3c]" size={28} aria-hidden="true" /><h3 className="text-lg font-semibold">Check your email</h3><p className="text-sm leading-6 text-[#5c6d58]">{state.success}</p><Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">Back to log in <ArrowRight size={15} aria-hidden="true" /></Link></div>;

  return <>
    {!configured && <div role="status" className="mb-6 rounded-lg border border-[#e5d8ad] bg-[#fcf8ea] p-4 text-xs leading-5 text-[#776631]">Connect your Supabase project to get started. Copy <code>.env.example</code> to <code>.env.local</code>, add your project URL and publishable key, then restart the app. Setup steps are in <code>README.md</code>.</div>}
    {message && <p role="status" className="mb-5 rounded-lg border border-[#dbe3cf] bg-[#f1f5e9] px-4 py-3 text-sm leading-6">{message}</p>}
    <form action={action}>
      <input type="hidden" name="next" value={next} />
      <fieldset disabled={pending || !configured} className="space-y-5 disabled:opacity-70">
        <div><label htmlFor="email" className="mb-2 block text-[13px] font-semibold">Email address</label><div className="relative"><input className="field pr-11" id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required aria-describedby={state.error ? "auth-error" : undefined} /><Mail size={17} className="pointer-events-none absolute right-4 top-3.5 text-[#98a18f]" aria-hidden="true" /></div></div>
        <div><label htmlFor="password" className="mb-2 block text-[13px] font-semibold">Password</label><div className="relative"><input className="field pr-12" id="password" name="password" type={visible ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} placeholder={isSignup ? "Create a strong password" : "Enter your password"} minLength={isSignup ? 8 : 1} maxLength={128} required aria-describedby={isSignup ? "password-hint" : undefined} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute right-1 top-0.5 flex size-11 items-center justify-center rounded-lg text-[#8a9582]">{visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div>{isSignup && <p id="password-hint" className="mt-2 text-xs text-[#849078]">At least 8 characters. Make it something only you know.</p>}</div>
        {isSignup && <div><label htmlFor="confirmPassword" className="mb-2 block text-[13px] font-semibold">Confirm password</label><input className="field" id="confirmPassword" name="confirmPassword" type={visible ? "text" : "password"} autoComplete="new-password" placeholder="Enter your password again" minLength={8} maxLength={128} required /></div>}
        {state.error && <p id="auth-error" role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-800">{state.error}</p>}
        <button type="submit" className="primary-button mt-7">{pending ? <><LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> {isSignup ? "Creating account…" : "Logging in…"}</> : <>{isSignup ? "Create your account" : "Log in"}<ArrowRight size={17} aria-hidden="true" /></>}</button>
      </fieldset>
    </form>
    <p className="mt-7 text-center text-[13px] text-[#818b79]">{isSignup ? "Already have an account?" : "New to Kobo?"} <Link className="ml-1 font-semibold text-forest underline decoration-[#bdcba9] underline-offset-4 hover:decoration-forest" href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create an account"}</Link></p>
    <div className="mt-9 border-t border-[#e9ece3] pt-5 text-center text-[11px] leading-5 text-[#929a8b]">A little intention goes a long way.<br />Your next chapter starts with one naira.</div>
  </>;
}
