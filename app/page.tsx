export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center justify-between">
        </div>

        <h1 className="mt-16 text-5xl font-bold leading-tight">
          Find your perfect interior designer & architect
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-600">
          Connect with top-rated professionals for your dream space transformation.
        </p>

        <div className="mt-8 flex gap-4">
          <a className="rounded-xl bg-purple-600 px-6 py-3 text-white" href="/ai-style-finder">
            AI Style Finder
          </a>
          <a className="rounded-xl border border-zinc-300 px-6 py-3" href="/designers">
            Find a Designer
          </a>
        </div>
      </div>
    </main>
  );
}
