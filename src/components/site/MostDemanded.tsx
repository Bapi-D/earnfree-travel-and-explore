import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";

// ─── Static trip data — own images, not from Firestore ───────────────────────
const ALL_TRIPS = [
  {
    id: 1,
    title: "Manali",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=600&fit=crop",
    duration: "4N/5D",
    route: "Manali To Manali",
    originalPrice: 12000,
    price: 11000,
    months: ["Jun", "Jul", "Aug", "Sep"],
    international: false,
  },
  {
    id: 2,
    title: "Ladakh",
    image: "https://images.unsplash.com/photo-1589793907316-f94025b46850?w=600&h=600&fit=crop",
    duration: "7N/8D",
    route: "Leh To Leh",
    originalPrice: 32000,
    price: 29500,
    months: ["Jul", "Aug", "Sep"],
    international: false,
  },
  {
    id: 3,
    title: "Backpacking Trip | 8 Days",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&h=600&fit=crop",
    duration: "7N/8D",
    route: "Delhi To Delhi",
    originalPrice: 28000,
    price: 25000,
    months: ["Jun", "Jul", "Aug", "Oct"],
    international: false,
  },
  {
    id: 4,
    title: "Nubra-Turtuk-Hanle | 9 Days",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
    duration: "8N/9D",
    route: "Leh To Leh",
    originalPrice: 36000,
    price: 31500,
    months: ["Jul", "Aug", "Sep", "Oct"],
    international: false,
  },
  {
    id: 5,
    title: "Spiti Valley Explorer | 9 Days",
    image: "https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=600&h=600&fit=crop",
    duration: "8N/9D",
    route: "Manali To Shimla",
    originalPrice: 22000,
    price: 19500,
    months: ["Jun", "Jul", "Aug", "Sep"],
    international: false,
  },
  {
    id: 6,
    title: "Kedarnath-Badrinath Char Dham Yatra",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&h=600&fit=crop",
    duration: "6N/7D",
    route: "Haridwar To Haridwar",
    originalPrice: 18000,
    price: 15999,
    months: ["Jun", "Jul", "Aug", "Sep", "Oct"],
    international: false,
  },
  {
    id: 7,
    title: "Bali Beaches & Temples | 6 Days",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=600&fit=crop",
    duration: "5N/6D",
    route: "Mumbai To Mumbai",
    originalPrice: 55000,
    price: 48999,
    months: ["Jun", "Jul", "Aug", "Sep", "Oct"],
    international: true,
  },
  {
    id: 8,
    title: "Thailand Island Hopping | 7 Days",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=600&fit=crop",
    duration: "6N/7D",
    route: "Delhi To Delhi",
    originalPrice: 62000,
    price: 54999,
    months: ["Jun", "Aug", "Sep", "Oct"],
    international: true,
  },
  {
    id: 9,
    title: "Dubai Luxury & Desert Safari",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=600&fit=crop",
    duration: "4N/5D",
    route: "Mumbai To Mumbai",
    originalPrice: 75000,
    price: 64999,
    months: ["Jun", "Oct", "Nov", "Dec"],
    international: true,
  },
  {
    id: 10,
    title: "Singapore City Explorer | 5 Days",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=600&fit=crop",
    duration: "4N/5D",
    route: "Chennai To Chennai",
    originalPrice: 58000,
    price: 49999,
    months: ["Jul", "Aug", "Sep", "Nov"],
    international: true,
  },
  {
    id: 11,
    title: "Nepal Himalaya Base Camp Trek",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=600&fit=crop",
    duration: "10N/11D",
    route: "Kathmandu To Kathmandu",
    originalPrice: 45000,
    price: 39999,
    months: ["Oct", "Nov", "Mar", "Apr"],
    international: true,
  },
  {
    id: 12,
    title: "Bhutan Kingdom Discovery | 6 Days",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    duration: "5N/6D",
    route: "Paro To Paro",
    originalPrice: 52000,
    price: 44999,
    months: ["Sep", "Oct", "Nov", "Mar"],
    international: true,
  },
];

const MONTHS = ["All", "Jun", "Jul", "Aug", "Sep", "Oct"];
const MORE_MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

export function MostDemanded() {
  const [activeMonth, setActiveMonth] = useState("All");
  const [international, setInternational] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMoreDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isMoreMonth = MORE_MONTHS.includes(activeMonth);

  const filteredTrips = ALL_TRIPS.filter((trip) => {
    const matchesInternational = trip.international === international;
    const matchesMonth = activeMonth === "All" || trip.months.includes(activeMonth);
    return matchesInternational && matchesMonth;
  });

  return (
    <section id="most-demanded" className="bg-white pt-6 pb-10 px-4">

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[22px] font-black text-gray-900 leading-tight">
          Upcoming Trips
        </h2>

        {/* International toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-gray-600">International</span>
          <button
            onClick={() => {
              setInternational((v) => !v);
              setActiveMonth("All");
            }}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 flex items-center ${
              international ? "bg-blue-600" : "bg-gray-200"
            }`}
            aria-label="Toggle international trips"
          >
            <span
              className={`absolute flex items-center justify-center h-7 w-10 rounded-full bg-white shadow-md transition-transform duration-300 ${
                international ? "translate-x-4" : "translate-x-0"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                  fill={international ? "#2563eb" : "#9ca3af"}
                />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Month filter tabs */}
      <div
        className="overflow-x-auto pb-1 mb-5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`.month-scroll::-webkit-scrollbar{display:none}`}</style>
        <div className="flex items-end gap-0.5 min-w-max month-scroll">
          {MONTHS.map((month) => {
            const isActive = activeMonth === month && !isMoreMonth;
            return (
              <button
                key={month}
                onClick={() => { setActiveMonth(month); setShowMoreDropdown(false); }}
                className="relative px-3 py-1.5 text-[14px] font-semibold transition-colors whitespace-nowrap"
                style={{ color: isActive ? "#2563eb" : "#6b7280" }}
              >
                {month}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}

          {/* More dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setShowMoreDropdown((v) => !v)}
              className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                isMoreMonth ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
              }`}
            >
              {isMoreMonth ? activeMonth : "More"}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`h-3.5 w-3.5 transition-transform duration-200 ${showMoreDropdown ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showMoreDropdown && (
              <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-2xl z-50 py-2 min-w-[110px] border border-gray-100">
                {MORE_MONTHS.map((month) => (
                  <button
                    key={month}
                    onClick={() => { setActiveMonth(month); setShowMoreDropdown(false); }}
                    className={`block w-full text-left px-5 py-3 text-[15px] font-medium transition-colors hover:bg-gray-50 ${
                      activeMonth === month ? "text-blue-600 font-semibold" : "text-gray-700"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards grid */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5">
          {filteredTrips.map((trip) => (
            <Link key={trip.id} to="/destinations" className="block">
              {/* Square image with overlaid duration + route */}
              <div
                className="relative w-full rounded-xl overflow-hidden mb-2"
                style={{ aspectRatio: "1 / 1" }}
              >
                <img
                  src={trip.image}
                  alt={trip.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Bottom gradient + info overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-10 bg-gradient-to-t from-black/75 to-transparent">
                  <div className="flex items-center gap-1 text-white text-[10px] font-semibold mb-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="h-2.5 w-2.5 shrink-0">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                    {trip.duration}
                  </div>
                  <div className="flex items-center gap-1 text-white text-[10px] font-semibold">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="h-2.5 w-2.5 shrink-0">
                      <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
                      <circle cx="12" cy="9" r="2" />
                    </svg>
                    {trip.route}
                  </div>
                </div>
              </div>

              {/* Title + price below the image */}
              <p className="text-[12px] font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2 px-0.5">
                {trip.title}
              </p>
              <div className="flex items-baseline gap-1.5 px-0.5">
                <span className="text-[11px] text-gray-400 line-through">
                  ₹{trip.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-[14px] font-bold text-gray-900">
                  ₹ {trip.price.toLocaleString("en-IN")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-sm">
          No trips available for {activeMonth === "All" ? "this selection" : activeMonth}.
        </div>
      )}

      {/* View All */}
      <div className="flex justify-center mt-8">
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold px-8 py-3 shadow-md transition-colors"
        >
          View All
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}