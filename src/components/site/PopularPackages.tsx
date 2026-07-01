import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PackageCard } from "./PackageCard";
import { SectionHeader } from "./SectionHeader";
import { BestSellerCard } from "./PackageCard";
import type { Package } from "@/data/packages";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { getFirestorePackages } from "@/lib/firebase-data";
import { bestSellerPackages } from "@/data/bestseller";
import { PromoBannerCarousel } from "./Promobannercarousel";

const filters = [
  "All",
  "Domestic",
  "International",
  "Group",
  "Honeymoon",
  "Adventure",
] as const;

export function PopularPackages() {
  const [filter, setFilter] =
    useState<(typeof filters)[number]>("All");

  const { data: packages = [] } = useQuery<Package[]>({
    queryKey: ["packages"],
    queryFn: () => getFirestorePackages(),
  });

  const list: Package[] =
    filter === "All"
      ? packages
      : packages.filter((p: Package) => p.category === (filter as Package["category"]));

  const desktopRef = useScrollReveal<HTMLDivElement>();

  // ---- mobile/tablet carousel state ----
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width + 16; // gap-4
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, bestSellerPackages.length - 1));
  }, []);

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width + 16;
    el.scrollTo({ left: index * cardWidth, behavior: "smooth" });
  };

  return (
    <section id="packages" className="relative overflow-hidden">
      {/* ============ DESKTOP (lg and up) — untouched original ============ */}
      <div className="hidden lg:block section bg-background relative overflow-hidden">
        {/* Premium Grid Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(220,38,38,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220,38,38,0.12) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Glow Effects */}
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl z-0" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-gold/10 blur-3xl z-0" />

        {/* Decorative Dots */}
        <div className="absolute top-20 left-12 h-2 w-2 rounded-full bg-primary/40 z-0" />
        <div className="absolute top-40 right-20 h-3 w-3 rounded-full bg-gold/40 z-0" />
        <div className="absolute bottom-24 left-1/3 h-2 w-2 rounded-full bg-primary/30 z-0" />
        <div className="absolute bottom-16 right-1/4 h-2 w-2 rounded-full bg-gold/30 z-0" />

        <div
          className="container relative z-10 mx-auto px-6 lg:px-10"
          ref={desktopRef}
        >
          <div data-reveal>
            <SectionHeader
              eyebrow="Best sellers"
              title="Signature"
              highlight="journeys"
              description="Hand-picked itineraries our travelers fall in love with — every detail curated to perfection."
            />
          </div>

          <div
            data-reveal
            className="flex flex-wrap justify-center gap-2 mb-14"
          >
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  filter === f
                    ? "bg-charcoal text-white shadow-elegant"
                    : "bg-white/90 backdrop-blur-sm text-charcoal border border-border hover:border-primary/40 hover:shadow-soft"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7"
          >
            {list.map((p: Package, i: number) => (
              <PackageCard key={p.id} pkg={p} index={i} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* ============ MOBILE & TABLET (below lg) — new Best Sellers carousel ============ */}
      <div className="lg:hidden bg-white relative py-10">
        <div className="px-6">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-primary mb-1">
            Best sellers
          </p>
          <h2 className="text-center text-2xl xs:text-3xl font-display font-bold text-charcoal">
            Trending Packages
          </h2>
        </div>

        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 px-6 mt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {bestSellerPackages.map((pkg, i) => (
            <BestSellerCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>

        {/* Dot pagination */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {bestSellerPackages.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to package ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? "w-6 bg-primary"
                  : "w-2 bg-charcoal/20 hover:bg-charcoal/40"
              }`}
            />
          ))}
        </div>

        {/* Promo banners carousel */}
        <div className="mt-8 px-6">
          <PromoBannerCarousel />
        </div>
      </div>
    </section>
  );
}