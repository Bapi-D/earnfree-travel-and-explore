import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PackageCard } from "./PackageCard";
import { SectionHeader } from "./SectionHeader";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { getFirestorePackages } from "@/lib/firebase-data";

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

  const { data: packages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: () => getFirestorePackages(),
  });

  const effectivePackages = packages;

  const list =
    filter === "All"
      ? effectivePackages
      : effectivePackages.filter(
          (p) => p.category === filter
        );

  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <section
      id="packages"
      className="section bg-background relative overflow-hidden"
    >
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
        ref={ref}
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
          {list.map((p, i) => (
            <PackageCard
              key={p.id}
              pkg={p}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}