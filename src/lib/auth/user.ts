import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const getUser = cache(async () => {
  if (!getSupabaseConfig()) return null;
  const supabase = await createClient();
  // Check the current account with the Auth server instead of trusting cookie contents.
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
