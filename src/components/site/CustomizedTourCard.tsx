import type { DestinationCard } from "@/data/customizedTours";

export function CustomizedTourCard({ tour }: { tour: DestinationCard }) {
  return (
    <a
      href={tour.href}
      className="relative block aspect-[3/4] rounded-2xl overflow-hidden shadow-soft"
    >
      <img
        src={tour.image}
        alt={tour.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            "https://commons.wikimedia.org/wiki/Special:FilePath/Taj%20Mahal%20in%20March%202004.jpg?width=800";
        }}
      />

      {/* subtle top/bottom scrim for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/40" />

      {/* package count badge */}
      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-primary text-[10px] xs:text-[11px] font-bold">
        {tour.packageCount}
      </span>

      {/* script title + tagline */}
      <div className="absolute inset-x-3 top-[40%] text-center">
        <p className="font-serif italic font-bold text-xl xs:text-2xl text-amber-300 drop-shadow-md leading-tight">
          {tour.title}
        </p>
        <p className="text-white text-[9px] xs:text-[10px] mt-2 leading-snug drop-shadow px-1">
          {tour.tagline}
        </p>
      </div>

      {/* price box */}
      <div className="absolute inset-x-2.5 bottom-2.5 bg-white rounded-xl py-2 text-center">
        <p className="text-[9px] xs:text-[10px] text-muted-foreground font-medium">
          Starting from
        </p>
        <p className="text-sm xs:text-base font-display font-bold text-charcoal">
          ₹{tour.price.toLocaleString("en-IN")}
        </p>
      </div>
    </a>
  );
}