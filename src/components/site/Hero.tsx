import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Highlights } from "@/components/site/Highlights";
import { DestinationScroller } from "@/components/site/DestinationScroller";
import { Search, Play, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getFirestorePackages } from "@/lib/firebase-data";
import { heroSlides, AUTO_SLIDE_INTERVAL } from "@/data/heroData";

export function Hero() {
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const currentSlide = heroSlides[activeSlide];

  const { data: packages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: () => getFirestorePackages(),
  });

  const destinations = useMemo(() => {
    return Array.from(
      new Set(
        (packages as any[])
          .map((pkg) => pkg.destination)
          .filter(Boolean)
      )
    );
  }, [packages]);

  const filteredDestinations = useMemo(() => {
    if (!searchValue.trim()) return [];

    return destinations
      .filter((destination) =>
        destination
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
      .slice(0, 6);
  }, [searchValue, destinations]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1
      );
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  const searchDestination = (value?: string) => {
    const query = (value ?? searchValue).trim();
    if (!query) return;

    const normalizedQuery = query.toLowerCase();
    const exists = destinations.some((d) => d.toLowerCase() === normalizedQuery);

    if (!exists) {
      navigate({
        to: "/contact/page",
      });
      setShowSuggestions(false);
      return;
    }

    navigate({
      to: "/destinations",
      search: {
        q: query,
      } as any,
    });

    setShowSuggestions(false);
  };

  return (
    <section className="relative h-auto min-h-[640px] lg:h-screen lg:min-h-[900px] overflow-hidden">

      {/* BACKGROUND SLIDER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{
            opacity: 0,
            scale: 1.08,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 1.03,
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
          className="absolute inset-0"
        >
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover"
          />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/35" />

          {/* LUXURY GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          {/* EXTRA VIGNETTE */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* FLOATING GLOW */}
      <div className="absolute top-32 left-24 h-72 w-72 rounded-full bg-yellow-400/10 blur-[120px]" />

      <div className="relative z-10 h-auto lg:h-full container mx-auto px-6 pt-28 pb-10 lg:pt-0 lg:pb-0">

        <div className="grid lg:grid-cols-2 gap-12 h-auto lg:h-full items-center">

          {/* LEFT CONTENT */}
          <div className="max-w-2xl">

            <motion.div
              key={`badge-${currentSlide.id}`}
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-5 py-2 text-white mb-6"
            >
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Premium Travel Experiences
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.title}
                initial={{
                  opacity: 0,
                  y: 80,
                  filter: "blur(10px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  y: -40,
                }}
                transition={{
                  duration: 0.8,
                }}
              >
                <h1 className="text-white text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight">
                  {currentSlide.title}
                </h1>

                <h2 className="text-yellow-400 text-2xl md:text-3xl font-semibold mt-4">
                  {currentSlide.subtitle}
                </h2>

                <p className="mt-6 text-[14px] sm:text-base md:text-lg lg:text-xl text-white/80 leading-relaxed max-w-xl break-words overflow-hidden [text-wrap:balance]">
                  {currentSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{
                opacity: 0,
                y: 40,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
                duration: 0.6,
              }}
              className="flex flex-wrap gap-3 sm:gap-4 mt-10"
            >
              <Link to="/destinations">
                <Button className="rounded-full h-12 sm:h-14 px-5 sm:px-8 bg-yellow-400 text-black hover:bg-yellow-300 text-sm sm:text-base font-semibold">
                  Explore Trips
                </Button>
              </Link>

              <Link to="/about">
                <Button
                  variant="outline"
                  className="rounded-full h-12 sm:h-14 px-5 sm:px-8 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 text-sm sm:text-base"
                >
                  <Play className="mr-2 h-4 w-4 shrink-0" />
                  Watch Story
                </Button>
              </Link>
            </motion.div>
            {/* SEARCH BOX */}
            <motion.div
              initial={{
                opacity: 0,
                y: 40,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
                duration: 0.6,
              }}
              className="mt-8 sm:mt-10 w-full max-w-xl relative"
            >
              <div className="flex items-center rounded-full bg-white lg:bg-white/10 backdrop-blur-2xl border border-transparent lg:border-white/20 shadow-2xl w-full max-w-[330px] sm:max-w-[420px] mx-auto overflow-hidden -translate-x-3 sm:-translate-x-18">

                <Search className="ml-3 sm:ml-4 shrink-0 text-charcoal/60 lg:text-white/70 h-4 w-4 sm:h-5 sm:w-5" />

                <input
                  type="text"
                  value={searchValue}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchDestination();
                    }
                  }}
                  placeholder="Search destinations..."
                  className="flex-1 min-w-0 bg-transparent pl-2 sm:pl-3 pr-2 py-3 sm:py-3.5 text-sm sm:text-base text-charcoal lg:text-white placeholder:text-charcoal/40 lg:placeholder:text-white/50 outline-none"
                />

                <Button
                  onClick={() => searchDestination()}
                  className="shrink-0 rounded-full m-1.5 px-3.5 sm:px-6 h-9 sm:h-12 bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-xs sm:text-base"
                >
                  Search
                </Button>
              </div>

              {showSuggestions &&
                filteredDestinations.length > 0 && (
                  <div className="absolute left-0 right-0 top-[75px] overflow-hidden rounded-3xl bg-white shadow-2xl z-50">
                    {filteredDestinations.map(
                      (destination) => (
                        <button
                          key={destination}
                          onClick={() =>
                            searchDestination(destination)
                          }
                          className="block w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors"
                        >
                          {destination}
                        </button>
                      )
                    )}
                  </div>
                )}
            </motion.div>

            {/* MOBILE/TABLET CATEGORY CIRCLES (matches screenshot reference, desktop untouched) */}
            <div
              className="lg:hidden mt-8 -mx-6 px-6 pt-2 pb-1 overflow-x-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`
                .hero-category-scroll::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex items-center gap-5 w-max hero-category-scroll">
                {heroSlides.map((slide) => (
                  <Link
                    key={slide.id}
                    to="/destinations"
                    className="flex flex-col items-center gap-2 shrink-0"
                  >
                    <span className="block h-16 w-16 rounded-full overflow-hidden ring-2 ring-yellow-400/80 ring-offset-2 ring-offset-transparent">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="text-white text-xs font-semibold tracking-wide">
                      {slide.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* PAGINATION */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.6,
              }}
              className="flex items-center gap-3 mt-8 lg:mt-12"
            >
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-500 rounded-full ${
                    activeSlide === index
                      ? "w-12 h-2 bg-yellow-400"
                      : "w-2 h-2 bg-white/50"
                  }`}
                />
              ))}
            </motion.div>
          </div>

          {/* RIGHT SIDE - DESTINATIONS SCROLLING RAIL */}
          <div className="hidden lg:flex justify-end items-center h-[60vh] lg:h-[65vh] max-h-[600px]">
            <DestinationScroller />
          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => {
            document
              .getElementById("highlights")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="absolute bottom-4 lg:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white focus:outline-none"
        >
          <span className="text-xs tracking-[4px] uppercase mb-3">Scroll</span>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            <ChevronDown size={22} />
          </motion.div>
        </motion.button>

        {/* HIGHLIGHTS (desktop only — overlaid at bottom of hero) */}
        <div className="hidden lg:block absolute z-[60] left-0 right-0 bottom-[-40px] pb-0">
          <div className="mx-auto max-w-7xl px-6">
            <div className="bg-transparent">
             
              <Highlights />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}