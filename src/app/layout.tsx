import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Kobo — A little clarity for your money", template: "%s | Kobo" },
  description: "A personal finance tracker for life in Nigeria. Understand your income, spending, and budgets in naira.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-NG"><body>{children}</body></html>;
}
