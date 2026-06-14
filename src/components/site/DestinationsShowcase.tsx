import { motion } from "framer-motion";
import { ArrowRight, Clock3, MapPinned, Star, Sparkles, Globe2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getFirestorePackages } from "@/lib/firebase-data";
import { PackageCard } from "./PackageCard";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./SectionHeader";
import { packages } from "@/data/packages";
import { getFirestoreDestinations, type FirestoreDestinationRow } from "@/lib/firebase-data";
import { PUBLIC_DESTINATIONS } from "@/data/destinations";

const categoryColor: Record<string, string> = {
  Honeymoon: "bg-pink-500/10 text-pink-700",
  International: "bg-sky-500/10 text-sky-700",
  Domestic: "bg-amber-500/10 text-amber-700",
  Adventure: "bg-emerald-500/10 text-emerald-700",
  Group: "bg-violet-500/10 text-violet-700",
};

function mapFirestoreDestination(row: FirestoreDestinationRow): DestinationCard {
  return {
    name: row.name,
    region: row.region,
    vibe: row.vibe,
    description: row.description,
    image: row.image_url,
    category: row.category,
    packageCount: row.package_count,
    minPrice: row.min_price,
    bestSeason: row.best_season,
    duration: row.duration,
    highlights: row.highlights?.slice(0, 3) ?? [],
  };
}

type DestinationCard = typeof PUBLIC_DESTINATIONS[number];

export function DestinationsShowcase() {
  const { data: destinationRows = [] } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => getFirestoreDestinations(),
    staleTime: 60_000,
    retry: false,
  });

  // If a search query is present, show matching packages instead of the full destination grid.
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const q = params.get("q")?.trim();

  const { data: packagesData = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: () => getFirestorePackages(),
    staleTime: 60_000,
    retry: false,
  });

  if (q) {
    const lower = q.toLowerCase();
    const matches = packagesData.filter((p) => p.destination.toLowerCase() === lower);


    return (
      <section className="section bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-10 relative">
          <div className="mb-8">
            <span className="eyebrow">Search</span>
            <h2 className="mt-2 text-3xl md:text-4xl">Results for "{q}"</h2>
            <p className="text-muted-foreground mt-2">Showing matching trips.</p>
          </div>

          {matches.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((p, i) => (
                <PackageCard key={p.id} pkg={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-8 text-center">
              <p className="text-lg text-muted-foreground">No trips found for "{q}".</p>
              <div className="mt-4">
                <Link to="/contact/page" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] px-6 py-3 text-sm font-semibold text-white">
                  Contact us for a custom plan
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  const destinationCards = destinationRows.length > 0
    ? destinationRows.map(mapFirestoreDestination)
    : PUBLIC_DESTINATIONS;

  return (
    <section className="section bg-background relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

      <div className="container mx-auto px-6 lg:px-10 relative">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <span className="eyebrow">Destinations</span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl">
              Discover our <span className="italic font-light text-gradient-primary">signature</span> places
            </h2>
            <div className="divider-gold mt-6" />
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Explore destinations shaped like premium travel cards, with rich imagery, trip details, and clear starting prices.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-3 text-sm font-semibold text-charcoal">
                <Globe2 className="h-4 w-4 text-primary" />
                Curated destinations
              </div>
                <div className="mt-3 text-3xl font-display font-bold text-charcoal">{destinationCards.length}</div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-3 text-sm font-semibold text-charcoal">
                <Sparkles className="h-4 w-4 text-primary" />
                Travel styles
              </div>
              <div className="mt-3 text-3xl font-display font-bold text-charcoal">6</div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-3 text-sm font-semibold text-charcoal">
                <MapPinned className="h-4 w-4 text-primary" />
                Best starting price
              </div>
              <div className="mt-3 text-3xl font-display font-bold text-charcoal">
                ₹{Math.min(...destinationCards.map((card) => card.minPrice)).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {destinationCards.map((card, index) => (
            <motion.article
              key={card.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft transition-all duration-500 hover:shadow-elegant"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={card.image}
                  alt={card.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-charcoal shadow-soft">
                    {card.vibe}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${categoryColor[card.category] ?? "bg-white/90 text-charcoal"}`}>
                    {card.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-white/75">{card.region}</div>
                    <h3 className="mt-1 text-2xl font-bold">{card.name}</h3>
                  </div>
                  <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
                    {card.packageCount} trip{card.packageCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border bg-secondary/30 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Best season</div>
                    <div className="mt-1 text-sm font-semibold text-charcoal">{card.bestSeason}</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-secondary/30 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">From</div>
                    <div className="mt-1 text-sm font-semibold text-charcoal">₹{card.minPrice.toLocaleString("en-IN")}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-medium text-charcoal">
                    <Clock3 className="h-3.5 w-3.5" />
                    {card.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-medium text-charcoal">
                    <Star className="h-3.5 w-3.5 text-gold" />
                    Featured route
                  </span>
                </div>

                <ul className="space-y-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                  {card.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2">
                      <span className="text-gold">◆</span>
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-5">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Available trips</div>
                    <div className="text-lg font-bold text-charcoal">{card.packageCount} curated option{card.packageCount === 1 ? "" : "s"}</div>
                  </div>
                  <Button asChild className="rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] shadow-elegant hover:opacity-90">
                    <Link to="/options">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
