import type { PromoBanner } from "@/data/promoBannersData";
import { SkylineBackground } from "./Skylinebackground";

export function PromoBannerCard({ banner }: { banner: PromoBanner }) {
  return (
    <a
      href={banner.ctaHref}
      className="relative flex-shrink-0 snap-center w-[88%] xs:w-[84%] sm:w-[68%] md:w-[58%] rounded-3xl overflow-hidden bg-gradient-to-b from-sky-50 to-white border border-border/60 shadow-soft"
    >
      {/* Decorative skyline + clouds */}
      <SkylineBackground className="z-0 opacity-90" />

      {/* Right-side curved accent panel behind the photo collage */}
      <div
        className={`absolute top-0 right-0 bottom-14 w-[46%] rounded-bl-[3rem] ${banner.accent} opacity-95 z-0`}
      />

      <div className="relative z-10 flex flex-col min-h-[300px] xs:min-h-[330px]">
        <div className="flex flex-1">
          {/* Left: headline + subtitle */}
          <div className="w-[54%] flex flex-col justify-start p-5 xs:p-6 pt-6">
            <h3 className="font-serif italic leading-[0.9] text-charcoal">
              <span className="block text-2xl xs:text-3xl font-bold">
                {banner.scriptTitleLine1}
              </span>
              <span className="block text-2xl xs:text-3xl font-bold">
                {banner.scriptTitleLine2}
              </span>
            </h3>

            <div
              className={`inline-block w-fit mt-4 px-3 py-2 rounded-lg ${banner.accent}`}
            >
              <p className="text-white text-[11px] xs:text-xs font-semibold leading-snug">
                {banner.subtitle}
              </p>
            </div>
          </div>

          {/* Right: photo collage over the curved accent panel */}
          <div className="relative w-[46%]">
            <img
              src={banner.images[0]}
              alt=""
              loading="lazy"
              className="absolute top-4 right-4 left-6 h-[62%] object-cover rounded-2xl border-[3px] border-white shadow-elegant"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://placehold.co/500x600/1e3a5f/ffffff?text=Photo";
              }}
            />
            <img
              src={banner.images[1]}
              alt=""
              loading="lazy"
              className="absolute bottom-3 left-1 w-[48%] h-[34%] object-cover rounded-xl border-[3px] border-white shadow-soft -rotate-2"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://placehold.co/400x400/1e3a5f/ffffff?text=Photo";
              }}
            />
            <img
              src={banner.images[2]}
              alt=""
              loading="lazy"
              className="absolute bottom-3 right-4 w-[42%] h-[34%] object-cover rounded-xl border-[3px] border-white shadow-soft rotate-2"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://placehold.co/400x400/1e3a5f/ffffff?text=Photo";
              }}
            />
          </div>
        </div>

        {/* Bottom row: price (left, on light bg) + CTA (right, on accent bg) */}
        <div className="flex items-center">
          <div className="w-[54%] px-5 xs:px-6 pb-5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              {banner.priceLabel}
            </p>
            <p className="text-lg xs:text-xl font-display font-bold text-charcoal">
              ₹{banner.price.toLocaleString("en-IN")}
              <span className="text-xs font-medium text-muted-foreground">
                {" "}
                per person
              </span>
            </p>
          </div>
          <div
            className={`w-[46%] h-14 flex items-center justify-center ${banner.accent}`}
          >
            <span className="text-white text-xs xs:text-sm font-bold uppercase tracking-wide text-center px-2">
              {banner.ctaText}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}