import { useRef, useState, useCallback, useMemo } from "react";
import { CustomizedTourCard } from "./CustomizedTourCard";
import { internationalTours, indiaTours } from "@/data/customizedTours";

type Tab = "International" | "India";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function CustomizedToursMobile() {
  const [tab, setTab] = useState<Tab>("International");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const list = tab === "International" ? internationalTours : indiaTours;
  const pages = useMemo(() => chunk(list, 4), [list]);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const page = el.children[0] as HTMLElement | undefined;
    if (!page) return;
    const pageWidth = page.getBoundingClientRect().width;
    const index = Math.round(el.scrollLeft / pageWidth);
    setActiveIndex(Math.min(index, pages.length - 1));
  }, [pages.length]);

  const switchTab = (next: Tab) => {
    setTab(next);
    setActiveIndex(0);
    scrollerRef.current?.scrollTo({ left: 0, behavior: "auto" });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const page = el.children[0] as HTMLElement | undefined;
    if (!page) return;
    const pageWidth = page.getBoundingClientRect().width;
    el.scrollTo({ left: index * pageWidth, behavior: "smooth" });
  };

  return (
    <div className="lg:hidden bg-white relative py-10">
      <h2 className="text-center text-2xl xs:text-3xl font-display font-bold text-charcoal px-6">
        Customized Tours
      </h2>

      {/* Toggle */}
      <div className="flex justify-center mt-6 px-6">
        <div className="inline-flex rounded-full bg-sky-100 p-1">
          {(["International", "India"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                tab === t
                  ? "bg-primary text-white shadow-soft"
                  : "text-charcoal/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Paginated 2x2 grid */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth mt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {pages.map((page, pageIndex) => (
          <div
            key={pageIndex}
            className="w-full flex-shrink-0 snap-center grid grid-cols-2 gap-4 px-6"
          >
            {page.map((tour) => (
              <CustomizedTourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ))}
      </div>

      {/* Dot pagination */}
      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {pages.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to page ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? "w-6 bg-primary"
                  : "w-2 bg-charcoal/20 hover:bg-charcoal/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}