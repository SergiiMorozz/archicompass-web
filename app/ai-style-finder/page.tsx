export default function Page() {
  return (
    <main className="px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-2xl text-primary">
          AI
        </div>
        <h1 className="mt-5 text-center text-3xl font-bold">AI Style Finder</h1>
        <p className="mx-auto mt-3 max-w-xl text-center leading-7 text-muted">
          Upload photos of interiors you love, and we will match you with designers
          who specialize in your style.
        </p>

        <div className="mt-8">
          <div className="text-sm font-semibold">Reference Images (up to 5)</div>
          <button className="mt-3 grid h-32 w-32 place-items-center rounded-2xl border border-dashed border-line bg-background text-sm font-semibold text-muted">
            Add
          </button>
          <p className="mt-3 text-sm text-muted">
            Upload photos of rooms, furniture, or styles you are inspired by.
          </p>
        </div>

        <label className="mt-7 block text-sm font-semibold">
          Your Location (optional)
          <input
            placeholder="e.g., Warsaw, Poland"
            className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary"
          />
        </label>

        <button className="mt-6 w-full rounded-xl bg-primary px-5 py-4 text-sm font-semibold text-white opacity-60">
          Analyze My Style
        </button>
      </section>
    </main>
  );
}
