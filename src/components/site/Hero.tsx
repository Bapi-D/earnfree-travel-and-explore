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

// Classify destinations — adjust these to match your actual data
const INTERNATIONAL_DESTINATIONS = [
  "thailand", "bali", "dubai", "singapore", "europe", "maldives",
  "bhutan", "nepal", "sri lanka", "vietnam", "malaysia", "japan",
  "turkey", "greece", "switzerland",
];

function isInternational(destination: string) {
  return INTERNATIONAL_DESTINATIONS.some((d) =>
    destination.toLowerCase().includes(d)
  );
}

// Extra destination circles added on top of the user's own dataset, purely for visual richness
// in the mobile circle row (so it feels full and clearly horizontally swipeable). Not tied to
// Firestore packages — these are static/illustrative.
const EXTRA_DESTINATIONS = [
  { id: "extra-kerala", title: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=300&h=300&fit=crop", international: false },
  { id: "extra-manali", title: "Manali", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&h=300&fit=crop", international: false },
  { id: "extra-ladakh", title: "Ladakh", image: "https://images.unsplash.com/photo-1589793907316-f94025b46850?w=300&h=300&fit=crop", international: false },
  { id: "extra-rajasthan", title: "Rajasthan", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=300&h=300&fit=crop", international: false },
  { id: "extra-bali", title: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&h=300&fit=crop", international: true },
  { id: "extra-dubai", title: "Dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300&h=300&fit=crop", international: true },
  { id: "extra-singapore", title: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=300&h=300&fit=crop", international: true },
  { id: "extra-bhutan", title: "Bhutan", image: "https://images.unsplash.com/photo-1553856622-d8c7a5c5c5e3?w=300&h=300&fit=crop", international: true },
];

export function Hero() {
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<"domestic" | "international">("domestic");

  const currentSlide = heroSlides[activeSlide];

  const { data: packages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: () => getFirestorePackages(),
  });

  const destinations = useMemo(() => {
    return Array.from(
      new Set(
        (packages as any[]).map((pkg) => pkg.destination).filter(Boolean)
      )
    );
  }, [packages]);

  // Filter slides/destinations by tab
  const filteredSlides = useMemo(() => {
    return heroSlides.filter((slide) =>
      activeTab === "international"
        ? isInternational(slide.title)
        : !isInternational(slide.title)
    );
  }, [activeTab]);

  // Shown circles — fall back to all slides if filter returns nothing
  const circleSlides = filteredSlides.length >= 4 ? filteredSlides : heroSlides;

  // Extra static circles filtered to match the active tab, appended after the real dataset
  const extraCircles = useMemo(() => {
    return EXTRA_DESTINATIONS.filter((d) =>
      activeTab === "international" ? d.international : !d.international
    );
  }, [activeTab]);

  const filteredDestinations = useMemo(() => {
    if (!searchValue.trim()) return [];
    return destinations
      .filter((d) => d.toLowerCase().includes(searchValue.toLowerCase()))
      .slice(0, 6);
  }, [searchValue, destinations]);

  // Packages filtered by active tab (domestic/international), capped to 4 for the grid
  const displayPackages = useMemo(() => {
    const list = (packages as any[]).filter((pkg) => {
      const dest = (pkg.destination || "").toString();
      return activeTab === "international" ? isInternational(dest) : !isInternational(dest);
    });
    return list.slice(0, 4);
  }, [packages, activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1
      );
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // When tab changes, jump to first matching slide
  useEffect(() => {
    if (circleSlides.length > 0) {
      const idx = heroSlides.findIndex((s) => s.id === circleSlides[0].id);
      if (idx !== -1) setActiveSlide(idx);
    }
  }, [activeTab]);

  const goToSlide = (index: number) => setActiveSlide(index);

  const searchDestination = (value?: string) => {
    const query = (value ?? searchValue).trim();
    if (!query) return;
    const normalizedQuery = query.toLowerCase();
    const exists = destinations.some((d) => d.toLowerCase() === normalizedQuery);
    if (!exists) {
      navigate({ to: "/contact/page" });
      setShowSuggestions(false);
      return;
    }
    navigate({ to: "/destinations", search: { q: query } as any });
    setShowSuggestions(false);
  };

  return (
    <section className="relative h-auto lg:h-screen lg:min-h-[900px] overflow-hidden">

      {/* =============================================
          DESKTOP BACKGROUND SLIDER (lg+ only)
      ============================================= */}
      <div className="hidden lg:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute top-32 left-24 h-72 w-72 rounded-full bg-yellow-400/10 blur-[120px]" />
      </div>

      {/* =============================================
          MOBILE / TABLET — plain white + blue gradient top
      ============================================= */}
      <div className="lg:hidden relative z-10 flex flex-col min-h-screen bg-white">

        {/* Blue gradient — full top zone including behind navbar */}
        <div
          className="absolute top-0 left-0 right-0 z-0"
          style={{
            height: "220px",
            background: "linear-gradient(180deg, #1a6fc4 0%, #2196F3 55%, #64B5F6 85%, #ffffff 100%)",
            borderBottomLeftRadius: "0px",
            borderBottomRightRadius: "0px",
          }}
          aria-hidden="true"
        />

        {/* Search bar — sits in the blue zone */}
        <div className="relative z-10 px-4 pt-[68px] pb-3">
          <div className="relative flex items-center bg-white rounded-full shadow-md overflow-hidden h-12">
            <Search className="ml-4 shrink-0 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchValue}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => e.key === "Enter" && searchDestination()}
              placeholder={`Explore Best Itineraries For ${currentSlide.title}`}
              className="flex-1 min-w-0 bg-transparent pl-2 pr-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none"
            />
            <button
              onClick={() => searchDestination()}
              className="shrink-0 m-1.5 h-9 w-9 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4 text-black" />
            </button>
          </div>

          {showSuggestions && filteredDestinations.length > 0 && (
            <div className="absolute left-4 right-4 top-[112px] overflow-hidden rounded-2xl bg-white shadow-2xl z-50">
              {filteredDestinations.map((destination) => (
                <button
                  key={destination}
                  onClick={() => searchDestination(destination)}
                  className="block w-full px-5 py-3.5 text-left text-sm hover:bg-gray-100 transition-colors"
                >
                  {destination}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stat badges */}
        <div className="relative z-10 px-4 pb-4 flex gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm flex-1">
            <span className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <svg key={s} className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </span>
            <span className="text-xs font-bold text-gray-800">4.9 Star Rating</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm flex-1">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#f09433" />
                  <stop offset="25%" stopColor="#e6683c" />
                  <stop offset="50%" stopColor="#dc2743" />
                  <stop offset="75%" stopColor="#cc2366" />
                  <stop offset="100%" stopColor="#bc1888" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad)" />
              <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
            </svg>
            <span className="text-xs font-bold text-gray-800">316K Followers</span>
          </div>
        </div>

        {/* Hero promo banner */}
        <div className="relative z-10 mx-4 rounded-2xl overflow-hidden h-48 mb-4 shadow-lg">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide.id + "-banner"}
              src={currentSlide.image}
              alt={currentSlide.title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.title + "-text"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-white text-2xl font-black leading-tight tracking-tight uppercase drop-shadow-lg">
                  {currentSlide.title}
                </h2>
                <p className="text-white/90 text-xs mt-0.5 font-semibold drop-shadow">
                  {currentSlide.subtitle}
                </p>
                <p className="text-yellow-300 text-[11px] font-bold mt-1 drop-shadow">
                  Get Discount up to ₹7000*
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-400 rounded-full ${
                  activeSlide === index ? "w-6 h-1.5 bg-yellow-400" : "w-1.5 h-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
          <Link
            to="/destinations"
            className="absolute bottom-2.5 right-3 text-white/80 text-[10px] font-semibold underline underline-offset-2"
          >
            Explore All Packages
          </Link>
        </div>

        {/* Category circles */}
        <div
          className="relative z-10 px-4 pb-5 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.hero-mobile-cats::-webkit-scrollbar{display:none}`}</style>
          <div className="flex gap-5 w-max hero-mobile-cats">
            {circleSlides.map((slide) => {
              const globalIdx = heroSlides.findIndex((s) => s.id === slide.id);
              const isActive = activeSlide === globalIdx;
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(globalIdx)}
                  className="flex flex-col items-center gap-1.5 shrink-0 bg-transparent border-none p-0"
                >
                  <span
                    className="block h-[64px] w-[64px] rounded-full p-[2.5px]"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #f4a300, #ffea00)"
                        : "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                    }}
                  >
                    <span className="block h-full w-full rounded-full overflow-hidden border-2 border-white">
                      <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                    </span>
                  </span>
                  <span className="text-gray-700 text-[10px] font-bold tracking-wide uppercase">
                    {slide.title}
                  </span>
                </button>
              );
            })}

            {/* Extra curated destination circles (not from Firestore) — purely visual, links to /destinations */}
            {extraCircles.map((dest) => (
              <Link
                key={dest.id}
                to="/destinations"
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <span
                  className="block h-[64px] w-[64px] rounded-full p-[2.5px]"
                  style={{
                    background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  }}
                >
                  <span className="block h-full w-full rounded-full overflow-hidden border-2 border-white">
                    <img src={dest.image} alt={dest.title} className="h-full w-full object-cover" />
                  </span>
                </span>
                <span className="text-gray-700 text-[10px] font-bold tracking-wide uppercase">
                  {dest.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Domestic / International pill toggle — JustWravel style, centered */}
        <div className="relative z-10 px-4 pb-6 flex justify-center">
          <div
            className="inline-flex items-center p-1 rounded-full"
            style={{ background: "#e8f0fe" }}
          >
            <button
              onClick={() => setActiveTab("domestic")}
              className="relative px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none"
              style={{
                background: activeTab === "domestic" ? "#1a6fc4" : "transparent",
                color: activeTab === "domestic" ? "#ffffff" : "#1a6fc4",
                boxShadow: activeTab === "domestic" ? "0 2px 8px rgba(26,111,196,0.25)" : "none",
              }}
            >
              Domestic
            </button>
            <button
              onClick={() => setActiveTab("international")}
              className="relative px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none"
              style={{
                background: activeTab === "international" ? "#1a6fc4" : "transparent",
                color: activeTab === "international" ? "#ffffff" : "#1a6fc4",
                boxShadow: activeTab === "international" ? "0 2px 8px rgba(26,111,196,0.25)" : "none",
              }}
            >
              International
            </button>
          </div>
        </div>

        {/* Package cards grid — switches content based on Domestic/International tab */}
        <div className="relative z-10 px-4 pb-8">
          {displayPackages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {displayPackages.map((pkg: any, idx: number) => {
                return (
                  <Link
                    key={pkg.id || idx}
                    to="/packages"
                    className="block rounded-2xl overflow-hidden shadow-md bg-white"
                  >
                    {/* Image — title overlaid bottom-left exactly like reference */}
                    <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
                      <img
                        src={pkg.image || pkg.coverImage || pkg.images?.[0] || currentSlide.image}
                        alt={pkg.title || pkg.name || pkg.destination}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* gradient only at bottom for title readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Title — bottom-left, bold white, exactly like reference */}
                      <div className="absolute bottom-2 left-2.5 right-2.5">
                        <p className="text-white text-[12px] font-bold leading-tight line-clamp-2 drop-shadow">
                          {pkg.title || pkg.name || pkg.destination}
                        </p>
                      </div>
                    </div>

                    {/* White info section below image — duration + destination + price */}
                    <div className="px-2.5 pt-2 pb-3 bg-white">
                      {/* Duration + destination row with icons */}
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1.5 flex-wrap">
                        {pkg.duration && (
                          <span className="flex items-center gap-0.5">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-2.5 w-2.5 shrink-0">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3 3" />
                            </svg>
                            {pkg.duration}
                          </span>
                        )}
                        {pkg.destination && (
                          <span className="flex items-center gap-0.5 min-w-0">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-2.5 w-2.5 shrink-0">
                              <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
                              <circle cx="12" cy="9" r="2" />
                            </svg>
                            <span className="truncate">{pkg.destination}</span>
                          </span>
                        )}
                      </div>

                      {/* Price — clean bold, no strikethrough, matching reference */}
                      <p className="text-[15px] font-bold text-gray-900">
                        ₹{(pkg.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm py-8">
              No {activeTab} packages available right now.
            </div>
          )}

          {/* View All button */}
          <div className="flex justify-center mt-5">
            <Link to="/destinations">
              <Button className="rounded-full h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md inline-flex items-center gap-2">
                View All
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* =============================================
          DESKTOP LAYOUT — completely unchanged
      ============================================= */}
      <div className="hidden lg:block relative z-10 h-full container mx-auto px-6 pt-0 pb-0">
        <div className="grid lg:grid-cols-2 gap-12 h-full items-center">
          <div className="max-w-2xl">
            <motion.div
              key={`badge-${currentSlide.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-5 py-2 text-white mb-6"
            >
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Premium Travel Experiences
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.title}
                initial={{ opacity: 0, y: 80, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8 }}
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
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <Link to="/destinations">
                <Button className="rounded-full h-14 px-8 bg-yellow-400 text-black hover:bg-yellow-300 text-base font-semibold">
                  Explore Trips
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => (window.location.href = "/about")}
                className="rounded-full"
              >
                <Button variant="outline" className="rounded-full h-14 px-8 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 text-base">
                  <Play className="mr-2 h-4 w-4 shrink-0" />
                  Watch Story
                </Button>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-10 w-full max-w-xl relative"
            >
              <div className="flex items-center rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl w-full max-w-[420px] overflow-hidden">
                <Search className="ml-4 shrink-0 text-white/70 h-5 w-5" />
                <input
                  type="text"
                  value={searchValue}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => { setSearchValue(e.target.value); setShowSuggestions(true); }}
                  onKeyDown={(e) => e.key === "Enter" && searchDestination()}
                  placeholder="Search destinations..."
                  className="flex-1 min-w-0 bg-transparent pl-3 pr-2 py-3.5 text-base text-white placeholder:text-white/50 outline-none"
                />
                <Button
                  onClick={() => searchDestination()}
                  className="shrink-0 rounded-full m-1.5 px-6 h-12 bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-base"
                >
                  Search
                </Button>
              </div>
              {showSuggestions && filteredDestinations.length > 0 && (
                <div className="absolute left-0 right-0 top-[75px] overflow-hidden rounded-3xl bg-white shadow-2xl z-50">
                  {filteredDestinations.map((destination) => (
                    <button key={destination} onClick={() => searchDestination(destination)} className="block w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors">
                      {destination}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 mt-12"
            >
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-500 rounded-full ${activeSlide === index ? "w-12 h-2 bg-yellow-400" : "w-2 h-2 bg-white/50"}`}
                />
              ))}
            </motion.div>
          </div>

          <div className="hidden lg:flex justify-end items-center h-[60vh] lg:h-[65vh] max-h-[600px]">
            <DestinationScroller />
          </div>
        </div>

        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => document.getElementById("highlights")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white focus:outline-none"
        >
          <span className="text-xs tracking-[4px] uppercase mb-3">Scroll</span>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ChevronDown size={22} />
          </motion.div>
        </motion.button>

        <div className="absolute z-[60] left-0 right-0 bottom-[-40px] pb-0">
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