import Link from "next/link";

const heroImage =
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=80";

const services = [
  "Plumbing",
  "Electrical",
  "Painting",
  "Flooring",
  "Carpentry",
  "HVAC",
  "Kitchen Remodeling",
  "Bathroom Remodeling",
];

export default function ServicesPage() {
  return (
    <main>
      <section
        className="relative bg-foreground px-4 py-24 text-white sm:px-6"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-[#1f172a]/72" />
        <div className="relative mx-auto max-w-7xl">
          <h1 className="text-5xl font-bold tracking-tight">Services</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            Explore trusted professionals for home improvement and implementation needs.
          </p>
          <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <div className="flex-1 rounded-xl bg-white px-4 py-4 text-sm text-muted">
              Search for services or professionals
            </div>
            <Link href="/services" className="rounded-xl bg-primary px-6 py-4 text-center text-sm font-semibold text-white">
              Search Now
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold">Filters</h2>
          <div className="mt-6">
            <div className="text-sm font-semibold">Service Type</div>
            <div className="mt-3 grid gap-3">
              {services.map((service) => (
                <label key={service} className="flex items-center gap-3 text-sm text-muted">
                  <span className="h-4 w-4 rounded-full border border-line" />
                  {service}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Home Improvement Services</h2>
              <p className="mt-1 text-muted">Service marketplace will come after designer profiles.</p>
            </div>
          </div>

          <article className="mt-8 max-w-md overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            <div className="grid h-56 place-items-center bg-[#4a90e2] text-7xl font-bold text-white">
              SE
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-bold">Service Provider</h3>
                <span className="text-sm font-semibold text-primary">4.5</span>
              </div>
              <p className="mt-2 text-sm text-muted">Electrical, lighting, and smart home support.</p>
              <Link href="/services" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
                View Profile
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
