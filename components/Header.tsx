import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold">
          ArchiCompass
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/ai-style-finder" className="hover:underline">
            AI Style Finder
          </Link>
          <Link href="/designers" className="hover:underline">
            Designers
          </Link>
          <Link href="/health" className="hover:underline">
            Health
          </Link>
          <Link href="/login" className="hover:underline">
            Sign in
          </Link>

          <Link
            href="/get-started"
            className="rounded-full bg-black px-4 py-2 text-white hover:opacity-90"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
