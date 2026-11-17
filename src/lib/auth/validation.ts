export type AuthState = { error?: string; success?: string };

export function readCredentials(formData: FormData, signup = false) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." } as const;
  }
  if (!password || password.length > 128) {
    return { error: "Enter a password with no more than 128 characters." } as const;
  }
  if (signup && password.length < 8) {
    return { error: "Choose a password with at least 8 characters." } as const;
  }
  if (signup && password !== formData.get("confirmPassword")) {
    return { error: "Your passwords do not match." } as const;
  }
  return { email, password } as const;
}

// Only allow destinations under our protected dashboard; reject external redirects.
export function safeNext(value: unknown) {
  if (typeof value !== "string" || /[\\\u0000-\u0020]/.test(value)) return "/dashboard";
  try {
    const url = new URL(value, "https://kobo.invalid");
    if (!value.startsWith("/") || url.origin !== "https://kobo.invalid") return "/dashboard";
    if (url.pathname !== "/dashboard" && !url.pathname.startsWith("/dashboard/")) return "/dashboard";
    return url.pathname + url.search;
  } catch {
    return "/dashboard";
  }
}
