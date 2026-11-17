import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto max-w-lg px-6 py-28"><p className="mb-4 text-xs text-[#859078]">404</p><h1 className="editorial text-4xl">This page isn’t here.</h1><Link href="/" className="mt-7 inline-block text-sm underline underline-offset-4">Back to Kobo</Link></main>;
}
