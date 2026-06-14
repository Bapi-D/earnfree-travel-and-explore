import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, MapPin, Search as SearchIcon, Star, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { packages, type Package } from "@/data/packages";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: SearchPage,
});

function matchesQuery(pkg: Package, term: string) {
  const lower = term.trim().toLowerCase();
  if (!lower) return false;

  return [pkg.name, pkg.destination, pkg.category, ...pkg.highlights].some((value) =>
    value.toLowerCase().includes(lower),
  );
}

function relevanceScore(pkg: Package, term: string) {
  const lower = term.trim().toLowerCase();
  if (!lower) return 0;

  let score = 0;
  if (pkg.destination.toLowerCase() === lower) score += 5;
  if (pkg.name.toLowerCase().includes(lower)) score += 3;
  if (pkg.destination.toLowerCase().includes(lower)) score += 2;
  if (pkg.category.toLowerCase().includes(lower)) score += 1;
  if (pkg.highlights.some((highlight) => highlight.toLowerCase().includes(lower))) score += 1;
  return score;
}

function SearchPage() {
  const navigate = useNavigate();
  const { q = "" } = Route.useSearch();
  const [searchTerm, setSearchTerm] = useState(q);

  useEffect(() => {
    setSearchTerm(q);
  }, [q]);

  const results = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) return [];

    return [...packages]
      .filter((pkg) => matchesQuery(pkg, term))
      .sort((a, b) => relevanceScore(b, term) - relevanceScore(a, term));
  }, [searchTerm]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({
      to: "/search",
      search: { q: searchTerm.trim() },
    });
  };

  return (
    <div className="min-h-screen bg-[#1f2328] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-100"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(250, 204, 21, 0.12), transparent 30%),
            radial-gradient(circle at top right, rgba(255, 255, 255, 0.08), transparent 28%),
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 28px 28px, 28px 28px",
          backgroundPosition: "center",
        }}
      />

      <div className="mx-auto max-w-[1600px] px-6 py-6 md:px-8 md:py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/55">Search</p>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold">Find the right trip</h1>
          </div>

          <Link
            to="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-105 hover:bg-white/15"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        <form onSubmit={submitSearch} className="mt-6 md:mt-8">
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/60" />
            <input
              value={searchTerm}
              onChange={(event) => {
                const next = event.target.value;
                setSearchTerm(next);
                void navigate({
                  to: "/search",
                  search: { q: next.trim() },
                });
              }}
              placeholder="Search packages (min. 3 characters)..."
              className="h-14 w-full rounded-full bg-white px-14 pr-6 text-charcoal outline-none ring-0 placeholder:text-muted-foreground shadow-[0_18px_50px_rgba(0,0,0,0.22)] md:h-16"
            />
          </label>
        </form>

        <div className="mt-8 md:mt-10">
          {searchTerm.trim() ? (
            results.length > 0 ? (
              <>
                <div className="mb-5 flex items-center justify-between gap-4 text-sm text-white/70">
                  <span>
                    {results.length} package{results.length === 1 ? "" : "s"} found for “{searchTerm.trim()}”
                  </span>
                  <span>Click a card to open that package only</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {results.map((pkg, index) => (
                    <motion.article
                      key={pkg.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      whileHover={{ y: -6 }}
                      className="group overflow-hidden rounded-2xl bg-white text-charcoal shadow-[0_14px_40px_rgba(0,0,0,0.24)]"
                    >
                      <div className="block h-full">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={pkg.image}
                            alt={pkg.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                          <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-charcoal">
                            {pkg.destination}
                          </div>
                          <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-charcoal flex items-center gap-1">
                            <Star className="h-3 w-3 fill-gold text-gold" />
                            {pkg.rating}
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <div className="text-xs uppercase tracking-[0.22em] text-white/70">{pkg.category}</div>
                            <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-tight">{pkg.name}</h2>
                          </div>
                        </div>

                        <div className="space-y-3 p-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5 font-medium text-charcoal">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                              {pkg.destination}
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-medium text-charcoal">
                              <Clock3 className="h-3.5 w-3.5 text-primary" />
                              {pkg.duration}
                            </span>
                          </div>

                          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {pkg.highlights.slice(0, 2).join(" • ")}
                          </p>

                          <div className="flex items-center justify-between border-t border-black/5 pt-3">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">From</div>
                              <div className="text-lg font-bold text-charcoal">₹{pkg.price.toLocaleString("en-IN")}</div>
                            </div>

                            <Link
                              to="/search/$packageId"
                              params={{ packageId: pkg.id }}
                              search={{ q: searchTerm.trim() }}
                              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 px-3 py-2 text-xs font-semibold text-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-transform hover:-translate-y-0.5"
                            >
                              Open package
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-white/80 backdrop-blur-sm">
                <p className="text-lg font-medium text-white">No packages found for “{searchTerm.trim()}”.</p>
                <p className="mt-2 text-sm text-white/65">Try another destination, category, or package name.</p>
              </div>
            )
          ) : (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-white/75 backdrop-blur-sm">
              <p className="text-lg font-medium text-white">Type a destination like Bali, Goa, or Dubai.</p>
              <p className="mt-2 text-sm text-white/65">Matching tours will appear below as you type.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

