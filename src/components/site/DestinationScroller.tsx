import { useMemo } from "react";
import { heroSlides } from "@/data/heroData";

interface DestinationItem {
  title: string;
  image: string;
}

// Flatten every slide's card list into one pool so the right-side rail always
// has enough variety to scroll continuously, independent of the active hero slide.
function useDestinationPool(): DestinationItem[] {
  return useMemo(() => {
    const seen = new Set<string>();
    const pool: DestinationItem[] = [];

    heroSlides.forEach((slide) => {
      slide.cards.forEach((card) => {
        const key = `${card.title}-${card.image}`;
        if (!seen.has(key)) {
          seen.add(key);
          pool.push(card);
        }
      });
    });

    return pool;
  }, []);
}

function DestinationCard({ item }: { item: DestinationItem }) {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_45px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-4 p-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-white font-bold text-lg leading-tight truncate">
            {item.title}
          </h3>
          <p className="text-white/60 text-sm mt-1">Explore Now</p>
        </div>
      </div>
    </div>
  );
}

export function DestinationScroller() {
  const destinations = useDestinationPool();

  // Duplicate the list so the marquee can loop seamlessly at -50%.
  const trackItems = [...destinations, ...destinations];

  return (
    <div className="relative w-full max-w-xs lg:max-w-sm h-full max-h-[60vh] lg:max-h-[65vh] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
      <style>{`
        @keyframes destinationScrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        .destination-track {
          animation: destinationScrollUp 28s linear infinite;
        }

        .destination-track:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .destination-track {
            animation: none;
          }
        }
      `}</style>

      <div className="destination-track flex flex-col gap-5">
        {trackItems.map((item, index) => (
          <DestinationCard key={`${item.title}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}