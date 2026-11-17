export function formatKobo(kobo: number | bigint) {
  if (typeof kobo === "number" && !Number.isSafeInteger(kobo)) throw new Error("Money must be safe integer kobo.");
  const value = BigInt(kobo);
  const absolute = value < 0n ? -value : value;
  const naira = new Intl.NumberFormat("en-NG").format(absolute / 100n);
  return `${value < 0n ? "−" : ""}₦${naira}.${String(absolute % 100n).padStart(2, "0")}`;
}

export function nigerianMonth(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit" }).formatToParts(now);
  return `${parts.find((p) => p.type === "year")!.value}-${parts.find((p) => p.type === "month")!.value}-01`;
}

export function lastSixMonths(month: string) {
  const [year, index] = month.split("-").map(Number);
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(Date.UTC(year, index - 6 + i, 1));
    return { date: date.toISOString().slice(0, 10), label: new Intl.DateTimeFormat("en-NG", { month: "short", timeZone: "UTC" }).format(date) };
  });
}
