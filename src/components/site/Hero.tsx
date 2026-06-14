import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
    <section className="relative h-screen min-h-[900px] overflow-hidden">

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

      <div className="relative z-10 h-full container mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-12 h-full items-center">

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

                <p className="mt-8 text-lg md:text-xl text-white/80 leading-relaxed max-w-xl">
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
              className="flex flex-wrap gap-4 mt-10"
            >
              <Link to="/destinations">
                <Button className="rounded-full h-14 px-8 bg-yellow-400 text-black hover:bg-yellow-300 text-base font-semibold">
                  Explore Trips
                </Button>
              </Link>

              <Link to="/about">
                <Button
                  variant="outline"
                  className="rounded-full h-14 px-8 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20"
                >
                  <Play className="mr-2 h-4 w-4" />
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
              className="mt-10 max-w-2xl relative"
            >
              <div className="flex items-center rounded-[40px] bg-white/10 backdrop-blur-2xl border border-white/20 p-2 shadow-2xl">

                <Search className="ml-4 text-white/70 h-5 w-5" />

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
                  className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-white/50 outline-none"
                />

                <Button
                  onClick={() => searchDestination()}
                  className="rounded-full px-6 h-12 bg-yellow-400 text-black hover:bg-yellow-300 font-semibold"
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
              className="flex items-center gap-3 mt-12"
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

          {/* RIGHT SIDE CARD STACK */}
          <div className="hidden lg:flex justify-end items-center">
            <div className="relative w-[780px] h-[720px] translate-x-[100px] translate-y-[80px]">


              {currentSlide.cards.map((card, index) => (
                <motion.div
                  key={`${currentSlide.id}-${card.title}`}
                  initial={{
                    opacity: 0,
                    x: 100,
                  }}
                  animate={{
                    opacity: 1,
                    x: index * 140,
                    scale: 1 - index * 0.08,
                    rotate: index * 2,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="absolute top-0"
                  style={{
                    zIndex: 20 - index,
                  }}
                >
                  <div className="w-[410px] h-[555px] rounded-[30px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)]">

                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t rounded-[30px] from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-6 left-6">
                      <h3 className="text-white font-bold text-2xl">
                        {card.title}
                      </h3>

                      <p className="text-white/70 text-sm mt-1">
                        Explore Now
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white focus:outline-none"
        >
          <span className="text-xs tracking-[4px] uppercase mb-3">Scroll</span>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            <ChevronDown size={22} />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}