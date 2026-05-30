import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PackageCard } from "./PackageCard";
import { SectionHeader } from "./SectionHeader";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { getFirestorePackages } from "@/lib/firebase-data";

const filters = ["All", "Domestic", "International", "Group", "Honeymoon", "Adventure"] as const;

export function PopularPackages() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const { data: packages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: () => getFirestorePackages(),
  });

  const effectivePackages = packages;
  const list = filter === "All" ? effectivePackages : effectivePackages.filter((p) => p.category === filter);
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <section id="packages" className="section bg-background">
      <div className="container mx-auto px-6 lg:px-10" ref={ref}>
        <div data-reveal>
          <SectionHeader
            eyebrow="Best sellers"
            title="Signature"
            highlight="journeys"
            description="Hand-picked itineraries our travelers fall in love with — every detail curated to perfection."
          />
        </div>

        <div data-reveal className="flex flex-wrap justify-center gap-2 mb-14">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                filter === f
                  ? "bg-charcoal text-white shadow-elegant"
                  : "bg-white text-charcoal border border-border hover:border-primary/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {list.map((p, i) => (
            <PackageCard key={p.id} pkg={p} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
