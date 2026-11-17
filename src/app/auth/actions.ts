"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { readCredentials, safeNext, type AuthState } from "@/lib/auth/validation";

const setupError = "Account access is not configured yet. Please complete the Supabase setup in README.md.";

export async function login(_previous: AuthState, formData: FormData): Promise<AuthState> {
  if (!getSupabaseConfig()) return { error: setupError };
  const credentials = readCredentials(formData);
  if (credentials.error) return { error: credentials.error };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: credentials.email!, password: credentials.password! });
    if (error) {
      if (error.code === "email_not_confirmed") return { error: "Check your inbox and confirm your email before logging in." };
      if (error.status === 429) return { error: "Too many attempts. Please wait a little and try again." };
      return { error: "We couldn't log you in. Check your email and password and try again." };
    }
  } catch {
    return { error: "We couldn't reach the sign-in service. Please try again." };
  }
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signup(_previous: AuthState, formData: FormData): Promise<AuthState> {
  if (!getSupabaseConfig()) return { error: setupError };
  const credentials = readCredentials(formData, true);
  if (credentials.error) return { error: credentials.error };
  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email: credentials.email!, password: credentials.password! });
    if (error) {
      if (error.status === 429) return { error: "Too many attempts. Please wait a little and try again." };
      return { error: "We couldn't create your account. Please try again or log in if you already have an account." };
    }
    signedIn = !!data.session;
  } catch {
    return { error: "We couldn't reach the sign-up service. Please try again." };
  }
  if (signedIn) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }
  return { success: "Check your inbox. If this address can be registered, you'll receive an email to confirm your account. Already registered? Log in instead." };
}

export async function logout(_previous: AuthState, _formData: FormData): Promise<AuthState> {
  if (!getSupabaseConfig()) redirect("/login");
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { error: "We couldn't log you out. Please try again." };
  } catch {
    return { error: "We couldn't reach the sign-in service. Please try again." };
  }
  revalidatePath("/", "layout");
  redirect("/login?message=logged-out");
}
