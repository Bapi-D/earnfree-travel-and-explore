import { useRef, useState, useCallback } from "react";
import { PromoBannerCard } from "./Promobannercard";
import { promoBanners } from "@/data/promoBannersData";

export function PromoBannerCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width + 16; // gap-4
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, promoBanners.length - 1));
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
    <div className="mt-8">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {promoBanners.map((banner) => (
          <PromoBannerCard key={banner.id} banner={banner} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {promoBanners.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to banner ${i + 1}`}
            onClick={() => scrollToIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === i
                ? "w-6 bg-primary"
                : "w-2 bg-charcoal/20 hover:bg-charcoal/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}