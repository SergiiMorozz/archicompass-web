import Link from "next/link";

const heroImage =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=80";

const featuredProjects = [
  ["Japandi Apartment", "Krakow, Poland", "Residential", heroImage],
  [
    "Warm Minimalist Home",
    "Warsaw, Poland",
    "Residential",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
  ],
  [
    "Industrial Loft",
    "Lodz, Poland",
    "Industrial",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
  ],
  [
    "Boutique Office",
    "Gdansk, Poland",
    "Commercial",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=80",
  ],
];

export default function Home() {
  return (
    <main>
      <section
        className="relative min-h-[720px] overflow-hidden bg-foreground text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f172a]/90 via-[#1f172a]/62 to-[#1f172a]/20" />
        <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-20 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold leading-[0.98] tracking-tight sm:text-7xl">
              Find Your Perfect
              <span className="block text-[#8f5be8]">Interior Designer</span>
              <span className="block">& Architect</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
              Connect with top-rated professionals for your dream space transformation.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ai-style-finder"
                className="rounded-xl bg-primary px-6 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:opacity-95"
              >
                Discover Your Style with AI
              </Link>
              <Link
                href="/designers"
                className="rounded-xl border border-white/55 bg-white/10 px-6 py-4 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
              >
                Find a Designer
              </Link>
            </div>

            <Link
              href="/get-started"
              className="mt-5 inline-flex text-sm font-medium text-white/75 underline-offset-4 hover:text-white hover:underline"
            >
              Are you a designer or architect? Join as a Pro
            </Link>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/78">
              <span>Verified portfolios</span>
              <span>Direct contact</span>
              <span>Free to browse</span>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-6">
              {[
                ["2,500+", "Designers"],
                ["15,000+", "Projects"],
                ["98%", "Satisfaction"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="text-3xl font-bold">{value}</div>
                  <div className="mt-1 text-sm text-white/65">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-3">
          {[
            ["1", "Browse & Filter", "Explore verified portfolios by style, budget, and location."],
            ["2", "Message Pros", "Contact one to three designers directly, without middlemen."],
            ["3", "Get Quotes", "Receive availability and pricing within 24 to 48 hours."],
          ].map(([number, title, copy]) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-line bg-background p-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft font-bold text-primary">
                {number}
              </div>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
            <p className="mt-2 text-muted">Real work from professionals on ArchiCompass.</p>
          </div>
          <Link href="/inspiration" className="text-sm font-semibold text-primary hover:underline">
            View all projects
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["Warsaw", "Apartment", "Minimalism", "Modern Loft", "Japandi", "Luxury"].map((chip) => (
            <Link
              key={chip}
              href="/designers"
              className="rounded-full border border-line bg-card px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary"
            >
              {chip}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featuredProjects.map(([title, location, category, image]) => (
            <article
              key={title}
              className="group relative min-h-[310px] overflow-hidden rounded-2xl bg-foreground text-white shadow-sm"
              style={{
                backgroundImage: `url(${image})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f172a]/82 via-[#1f172a]/25 to-transparent transition group-hover:from-[#1f172a]/90" />
              <div className="relative flex h-full min-h-[310px] flex-col justify-end p-5">
                <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                  {category}
                </span>
                <h3 className="mt-3 text-xl font-bold">{title}</h3>
                <p className="mt-1 text-sm text-white/75">{location}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              For Designers & Architects
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight">
              Grow your design business with qualified leads.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-white/75">
              Create a beautiful profile, show your portfolio, and get discovered by
              clients who are already looking for a professional.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/get-started"
                className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-primary"
              >
                Join as a Pro
              </Link>
              <Link
                href="/services"
                className="rounded-xl border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Learn more
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Free to join during beta",
              "No commission on projects",
              "Direct client messaging",
              "Portfolio analytics coming soon",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-white/10 p-5 text-sm font-medium backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
