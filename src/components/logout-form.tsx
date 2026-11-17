"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogOut, LoaderCircle } from "lucide-react";
import { logout } from "@/app/auth/actions";
import type { AuthState } from "@/lib/auth/validation";

export function LogoutForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(logout, {});
  return <form action={action} className="space-y-4">{state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}<button disabled={pending} className="primary-button" type="submit">{pending ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <LogOut size={17} aria-hidden="true" />}{pending ? "Logging out…" : "Log out of this device"}</button><Link href="/dashboard" className="block rounded-lg border border-[#dce2d5] px-5 py-3 text-center text-sm hover:bg-[#f0f4e8]">Back to your overview</Link></form>;
}
