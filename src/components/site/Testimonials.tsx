import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

const TRUSTINDEX_SCRIPT_SRC =
  "https://cdn.trustindex.io/loader.js?307b78d720b39665e1460108437";

const GOOGLE_REVIEW_URL =
  "https://www.google.com/search?kgmid=%2Fg%2F11qvg72x1x&hl=en-IN&q=Earnfree%20Travel%20And%20Explore&shem=rimspwouoe&shndl=30&source=sh%2Fx%2Floc%2Fosrp%2Fm5%2F4&kgs=ba69341f2713673c";

export function Testimonials() {
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadWidget, setShouldLoadWidget] = useState(false);

  useEffect(() => {
    const widgetRoot = widgetRef.current;

    if (!widgetRoot || shouldLoadWidget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadWidget(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(widgetRoot);

    return () => observer.disconnect();
  }, [shouldLoadWidget]);

  useEffect(() => {
    const widgetRoot = widgetRef.current;

    if (!widgetRoot || !shouldLoadWidget || widgetRoot.querySelector(`script[src="${TRUSTINDEX_SCRIPT_SRC}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.defer = true;
    script.async = true;
    script.src = TRUSTINDEX_SCRIPT_SRC;
    widgetRoot.appendChild(script);

    return () => {
      script.remove();
    };
  }, [shouldLoadWidget]);

  return (
    <section className="section bg-charcoal text-white relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[420px] w-[420px] rounded-full bg-gold/10 blur-3xl" />

      <div className="container mx-auto px-6 text-center relative">
        <span className="eyebrow">Loved on Google</span>
        <h2 className="text-4xl md:text-5xl lg:text-6xl mt-4">
          Real reviews from{" "}
          <span className="italic font-light text-gradient-gold">real travelers</span>
        </h2>
        <div className="divider-gold mt-6 mx-auto" />

        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-gold text-white text-sm font-semibold shadow-elegant hover:scale-105 transition-transform"
          >
            Review Us on Google <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="relative mt-14 px-6">
        <div
          ref={widgetRef}
          className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-elegant"
        >
        </div>
      </div>
    </section>
  );
}
