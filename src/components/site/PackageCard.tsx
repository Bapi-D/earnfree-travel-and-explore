import { motion } from "framer-motion";
import { Star, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import type { Package } from "@/data/packages";

import { Link } from "@tanstack/react-router";


export function PackageCard({ pkg, index = 0 }: { pkg: Package; index?: number }) {
  const { requireAuth } = useAuth();

  const handleBook = () =>
    requireAuth(() => {
      const el = document.getElementById("enquiry");
      el?.scrollIntoView({ behavior: "smooth" });
    });

  return (
    <Link
      to="/package/$packageId"
      params={{ packageId: pkg.id }}
      className="block"
    >
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        whileHover={{ y: -6 }}
        className="group rounded-3xl overflow-hidden bg-card border border-border/60 shadow-soft hover:shadow-elegant transition-all duration-500 flex flex-col"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={pkg.image}
            alt={pkg.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full glass-dark text-white text-[11px] font-semibold tracking-wider uppercase">
            {pkg.category}
          </div>
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-white/95 text-charcoal text-xs font-bold flex items-center gap-1 shadow-soft">
            <Star className="h-3 w-3 fill-gold text-gold" /> {pkg.rating}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-medium">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {pkg.destination}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {pkg.duration}
            </span>
          </div>
        </div>

        <div className="p-7 flex flex-col gap-4 flex-1">
          <h3 className="text-xl font-bold leading-tight">{pkg.name}</h3>

          <ul className="text-sm text-muted-foreground space-y-1.5 flex-1">
            {pkg.highlights.slice(0, 3).map((h) => (
              <li key={h} className="flex gap-2">
                <span className="text-gold">◆</span>
                {h}
              </li>
            ))}
          </ul>

          <div className="flex items-end justify-between pt-4 border-t border-border/60">
            <div>
              <div className="text-[11px] text-muted-foreground tracking-widest uppercase">From</div>
              <div className="text-2xl font-bold text-charcoal font-display">
                ₹{pkg.price.toLocaleString("en-IN")}
              </div>
            </div>

            <Button
              onClick={handleBook}
              className="rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] hover:opacity-90 shadow-elegant"
            >
              Book Now
            </Button>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}