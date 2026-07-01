import { motion } from "framer-motion";
import { MapPin, Clock, CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { BestSellerPackage } from "@/data/bestseller";
import type { Package } from "@/data/packages";

export function BestSellerCard({
  pkg,
  index = 0,
}: {
  pkg: BestSellerPackage;
  index?: number;
}) {
  const { requireAuth } = useAuth();

  const handleBook = () =>
    requireAuth(() => {
      const el = document.getElementById("enquiry");
      el?.scrollIntoView({ behavior: "smooth" });
    });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      onClick={handleBook}
      role="button"
      tabIndex={0}
      className="group relative flex-shrink-0 snap-center w-[82%] xs:w-[78%] sm:w-[48%] md:w-[42%] rounded-3xl overflow-hidden shadow-elegant cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-charcoal">
        <img
          src={pkg.image}
          alt={pkg.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://picsum.photos/seed/travel-fallback/800/1000";
          }}
          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
        />

        {/* Top scrim for title legibility */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-charcoal/70 via-charcoal/10 to-transparent" />

        {/* Bottom scrim for meta legibility */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-charcoal/90 via-charcoal/50 to-transparent" />

        {/* Optional top-right tag */}
        {pkg.tag && (
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-white/90 text-charcoal text-[11px] font-bold tracking-wide shadow-soft">
            {pkg.tag}
          </div>
        )}

        {/* Stacked bold title over image */}
        <div className="absolute top-5 left-5 right-5">
          <h3 className="text-white font-display font-extrabold uppercase leading-[1.05] text-2xl xs:text-3xl tracking-tight drop-shadow-sm">
            {pkg.titleLine1}
          </h3>
          <p className="text-white/90 font-semibold uppercase text-xs xs:text-sm tracking-wide mt-1">
            {pkg.titleLine2}
          </p>
        </div>

        {/* Bottom content overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-2.5">
          <p className="text-white text-sm font-semibold leading-snug line-clamp-2">
            {pkg.name}
          </p>

          <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-charcoal text-xs font-semibold">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {pkg.route}
          </span>

          <div className="flex items-center gap-4 text-white/90 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {pkg.duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {pkg.dateRange}
            </span>
          </div>

          <div className="text-white font-display font-bold text-xl pt-1">
            ₹{pkg.price.toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function PackageCard({ pkg, index = 0 }: { pkg: Package; index?: number }) {
  const { requireAuth } = useAuth();

  const handleBook = () =>
    requireAuth(() => {
      const el = document.getElementById("enquiry");
      el?.scrollIntoView({ behavior: "smooth" });
    });

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleBook}
      className="group rounded-2xl overflow-hidden border border-border bg-card shadow-soft"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-charcoal">
        <img
          src={pkg.image}
          alt={pkg.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://picsum.photos/seed/travel-fallback/800/450";
          }}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-4">
        <h4 className="text-lg font-semibold text-charcoal">{pkg.name}</h4>
        <div className="text-sm text-muted-foreground">{pkg.duration} • {pkg.destination}</div>
        <div className="mt-2 text-primary font-bold">₹{pkg.price.toLocaleString("en-IN")}</div>
      </div>
    </article>
  );
}