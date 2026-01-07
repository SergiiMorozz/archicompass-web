export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold">ArchiCompass</div>
          <div className="flex gap-4 text-sm">
            <a href="/health" className="underline">Health</a>
            <a href="#" className="underline">Sign in</a>
            <a href="#" className="rounded-full bg-black px-4 py-2 text-white">Get Started</a>
          </div>
        </div>

        <h1 className="mt-16 text-5xl font-bold leading-tight">
          Find your perfect interior designer & architect
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-600">
          Connect with top-rated professionals for your dream space transformation.
        </p>

        <div className="mt-8 flex gap-4">
          <a className="rounded-xl bg-purple-600 px-6 py-3 text-white" href="#">
            AI Style Finder
          </a>
          <a className="rounded-xl border border-zinc-300 px-6 py-3" href="#">
            Find a Designer
          </a>
        </div>
      </div>
    </main>
  );
}
