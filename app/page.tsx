import Link from "next/link";

const heroImage =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=80";

const betaSignals = [
  ["Poland", "Beta launch"],
  ["Available now", "AI brief builder"],
  ["Free", "For early professionals"],
  ["0%", "Commission during beta"],
];

const briefOutputs = [
  ["Style direction", "A useful name for the look, plus the visual cues behind it."],
  ["Colors and materials", "A practical palette designers can immediately understand."],
  ["Scope and constraints", "Room type, support level, budget, location, and priorities."],
  ["Matching signals", "The specialties and project fit to look for in a professional."],
];

export default function Home() {
  return (
    <main>
      <section
        className="relative min-h-[680px] overflow-hidden bg-foreground text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f172a]/92 via-[#1f172a]/68 to-[#1f172a]/25" />
        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-4 py-20 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur">
              AI-powered project brief and designer matching
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
              Turn your inspiration into a designer-ready brief.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
              Upload references, define your project, and find professionals who match
              your style, budget, and scope.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/project-compass"
                className="rounded-xl bg-primary px-6 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:opacity-95"
              >
                Build Your Project Brief
              </Link>
              <Link
                href="/designers"
                className="rounded-xl border border-white/55 bg-white/10 px-6 py-4 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
              >
                Browse Designers
              </Link>
            </div>

            <p className="mt-5 text-sm text-white/72">
              Free during beta. No commission. Built for interior projects in Poland.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-card">
        <div className="mx-auto grid max-w-7xl gap-px bg-line px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {betaSignals.map(([value, label]) => (
            <div key={label} className="bg-card px-5 py-7">
              <div className="text-2xl font-bold text-primary">{value}</div>
              <div className="mt-1 text-sm text-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-primary">How it works</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight">
            From saved references to a useful first conversation.
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted">
            ArchiCompass helps you understand the project before asking a designer for
            a quote.
          </p>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {[
            ["1", "Upload your references", "Add rooms, details, and moods you like. AI looks for recurring style signals."],
            ["2", "Build a clear brief", "Combine the visual analysis with project type, scope, budget, and location."],
            ["3", "Match and send", "Compare relevant professionals and send a useful brief instead of a vague message."],
          ].map(([number, title, copy]) => (
            <article key={title} className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft font-bold text-primary">
                {number}
              </div>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">The useful output</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              More than a style label.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              Project Compass turns a moodboard into decisions a professional can act
              on, while keeping your budget and required level of support in view.
            </p>
            <Link
              href="/project-compass"
              className="mt-7 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              Try Project Compass
            </Link>
          </div>

          <div className="rounded-lg border border-line bg-background p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <div className="text-xs font-semibold uppercase text-muted">Example output</div>
                <div className="mt-1 text-2xl font-bold">Warm Japandi apartment</div>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                AI-assisted
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {briefOutputs.map(([title, copy]) => (
                <div key={title}>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-white/65">
              For designers and architects
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight">
              Meet clients who already understand their project.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-white/78">
              Show your portfolio and receive structured requests with references,
              scope, budget signals, and project goals.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/get-started"
                className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-primary"
              >
                Join the Beta
              </Link>
              <Link
                href="/designers"
                className="rounded-xl border border-white/35 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                View Example Profiles
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Free to join during beta",
              "No commission on projects",
              "Structured client briefs",
              "Direct project conversations",
            ].map((item) => (
              <div key={item} className="rounded-lg bg-white/10 p-5 text-sm font-medium backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
