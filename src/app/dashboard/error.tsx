"use client";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="rounded-xl border border-[#e3e8da] bg-white p-8"><h1 className="editorial text-3xl">We couldn’t load your overview.</h1><p className="my-5 max-w-lg text-sm leading-7 text-[#7d8c6c]">Please try again in a moment. If you’re setting up the app, check your Supabase connection and run the database migration in README.md.</p><button onClick={reset} className="primary-button max-w-48">Try again</button></section>;
}
