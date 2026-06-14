import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Star } from "lucide-react";
import { packages } from "@/data/packages";

export const Route = createFileRoute("/search/$packageId")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: PackageDetailPage,
});

function PackageDetailPage() {
  const { packageId } = Route.useParams();
  const { q = "" } = Route.useSearch();
  const pkg = packages.find((item) => item.id === packageId);

  if (!pkg) {
  return (
    <div className="min-h-screen bg-[#1f2328] text-white">
      <div className="hidden" data-debug-packageId={packageId} data-debug-q={q} />
        <div className="mx-auto max-w-5xl px-6 py-10 md:px-8">
          <Link
            to="/search"
            search={{ q }}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Link>
          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center backdrop-blur-sm">
            <h1 className="text-3xl font-bold">Package not found</h1>
            <p className="mt-3 text-white/70">The package you selected is not available anymore.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f2328] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(250, 204, 21, 0.12), transparent 30%),
            radial-gradient(circle at top right, rgba(255, 255, 255, 0.08), transparent 28%),
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 28px 28px, 28px 28px",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 py-6 md:px-8 md:py-8">
        <Link
          to="/search"
          search={{ q }}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-sm">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute left-6 top-6 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-charcoal">
                {pkg.destination}
              </div>
              <div className="absolute right-6 top-6 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-charcoal flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                {pkg.rating}
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="text-xs uppercase tracking-[0.26em] text-white/75">
                  {pkg.category}
                </div>
                <h1 className="mt-2 text-4xl font-bold md:text-5xl">{pkg.name}</h1>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/80">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-md">
                    <MapPin className="h-4 w-4" />
                    {pkg.destination}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-md">
                    <Clock3 className="h-4 w-4" />
                    {pkg.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-sm md:p-8">
            <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-white/55">
                  Price starts from
                </div>
                <div className="mt-2 text-4xl font-bold text-white">
                  ₹{pkg.price.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="text-right text-sm text-white/65">
                <div className="text-xs uppercase tracking-[0.28em]">Rating</div>
                <div className="mt-1 text-2xl font-bold text-white">{pkg.rating}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs uppercase tracking-[0.28em] text-white/55">Highlights</div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/78">
                {pkg.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span className="text-gold">◆</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/50">
                  Destination
                </div>
                <div className="mt-1 text-base font-semibold">{pkg.destination}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/50">
                  Duration
                </div>
                <div className="mt-1 text-base font-semibold">{pkg.duration}</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact/page"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 px-5 py-3 text-sm font-semibold text-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_12px_28px_rgba(234,179,8,0.22)] transition-all hover:-translate-y-0.5 hover:scale-[1.02]"
              >
                Book this package
              </Link>
              <Link
                to="/search"
                search={{ q }}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Search more trips
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/68">
              This page shows only the package you selected, so you can review the trip details
              without extra clutter.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
