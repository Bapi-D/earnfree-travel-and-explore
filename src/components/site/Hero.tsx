import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Plane, Minus, Plus } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import bali from "@/assets/pkg-bali.jpg";
import nepal from "@/assets/pkg-nepal.jpg";
import thailand from "@/assets/pkg-thailand.jpg";
import goa from "@/assets/pkg-goa.jpg";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
 
import { getFirestorePackages } from "@/lib/firebase-data";

export function Hero() {
  const { data: packages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: () => getFirestorePackages(),
  });

  const uniqueDestinations = useMemo(
    () => Array.from(new Set(packages.map((pkg) => pkg.destination))).sort(),
    [packages],
  );

  const [destination, setDestination] = useState("Bali");
  const [travelDate, setTravelDate] = useState<Date | undefined>(undefined);
  const [days, setDays] = useState(5);
  const [people, setPeople] = useState(2);
  const navigate = useNavigate();

  const dateLabel = travelDate
    ? travelDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Select date";

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-28 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-white p-4 md:p-6 lg:p-10">
        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem]">
          <img
            src={hero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400/40 via-sky-500/25 to-sky-300/15" />
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <h1 className="hero-caption mt-15 text-5xl md:text-6xl lg:text-[5.25rem] leading-[0.9] font-extrabold">
            Explore the World &
            <br />
            <span className="italic text-yellow-400">Earn Every</span>
            <span className="block text-white">Memory</span>
          </h1>
          <p className="hero-body mt-14 text-lg md:text-xl max-w-xl font-light leading-relaxed">
            From the Himalayas to Southeast Asia — your journey starts here.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Link
              to="/destinations"
              className="inline-flex h-16 items-center justify-center rounded-full bg-yellow-400 px-10 text-lg font-semibold text-charcoal shadow-gold transition-colors hover:bg-yellow-500 mt-1"
            >
              Explore Trips
            </Link>
            <Link
              to="/about"
              className="inline-flex h-16 items-center justify-center rounded-full glass-dark text-white border-white/30 hover:bg-white hover:text-charcoal px-8 text-lg font-semibold mt-1"
            >
              Our Story
            </Link>
          </div>
        </motion.div>
        {/* Right-side stacked cards (visual) */}
        <div className="hidden lg:block absolute right-12 top-44 w-[720px] z-10">
          <div className="relative w-full h-[560px]">
            <div
              className="absolute top-0 left-16 w-[320px] rounded-3xl overflow-hidden shadow-2xl transform -rotate-1 floating-img"
              style={{ animationDelay: "0s" }}
            >
              <img src={bali} alt="Bali" className="w-full h-80 object-cover" />
            </div>
            <div
              className="absolute top-18 left-52 w-[320px] rounded-3xl overflow-hidden shadow-2xl transform rotate-1 floating-img"
              style={{ animationDelay: "0.12s" }}
            >
              <img src={nepal} alt="Manali" className="w-full h-80 object-cover" />
            </div>
            <div
              className="absolute top-36 left-8 w-[320px] rounded-3xl overflow-hidden shadow-2xl transform -rotate-1 floating-img"
              style={{ animationDelay: "0.24s" }}
            >
              <img src={thailand} alt="Maldives" className="w-full h-80 object-cover" />
            </div>
            <div
              className="absolute top-54 left-48 w-[320px] rounded-3xl overflow-hidden shadow-2xl transform rotate-1 floating-img"
              style={{ animationDelay: "0.36s" }}
            >
              <img src={goa} alt="Tokyo" className="w-full h-80 object-cover" />
            </div>

            <div
              className="absolute bottom-[-28px] left-1/2 -translate-x-1/2 bg-yellow-400 text-charcoal rounded-full px-4 py-2 shadow-gold floating-img"
              style={{ animationDelay: "0.18s" }}
            >
              5K+ Happy Travelers
            </div>
          </div>
        </div>

        {/* Booking module — glass */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 max-w-5xl"
        >
          <div className="glass-card rounded-3xl overflow-hidden">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = destination.trim();
                if (!q) return;
                const lower = q.toLowerCase();
                if (packages.length === 0) {
                  // If packages haven't loaded yet, open destinations and let that page fetch/handle the query
                  navigate({ to: `/destinations?q=${encodeURIComponent(q)}` });
                  return;
                }

                const match = packages.find(
                  (p) => p.destination.toLowerCase() === lower || p.name.toLowerCase().includes(lower),
                );

                if (match) {
                  navigate({ to: `/destinations?q=${encodeURIComponent(q)}` });
                } else {
                  navigate({ to: `/contact/page?q=${encodeURIComponent(q)}` });
                }
              }}
              className="p-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
            >
              <div className="flex h-16 w-full items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-5 text-charcoal focus-within:border-primary md:col-span-2 xl:col-span-1">
                <div className="min-w-0 flex-1">
                  <label
                    className="text-xs uppercase tracking-widest text-muted-foreground"
                    htmlFor="destination"
                  >
                    Destination
                  </label>
                  <input
                    id="destination"
                    list="destination-options"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
                    placeholder="Choose or type destination"
                  />
                  <datalist id="destination-options">
                    {uniqueDestinations.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>

              <label className="flex h-16 w-full items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-5 text-charcoal focus-within:border-primary">
                <div className="min-w-0 flex-1">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    When to go
                  </div>
                  <input
                    type="date"
                    value={travelDate ? travelDate.toISOString().slice(0, 10) : ""}
                    onChange={(e) =>
                      setTravelDate(
                        e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined,
                      )
                    }
                    className="w-full bg-transparent text-sm font-semibold outline-none [color-scheme:light]"
                  />
                </div>
              </label>

              <div className="flex h-16 items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/80 px-5 text-charcoal">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Days
                  </div>
                  <div className="text-sm font-semibold">{days} Days</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDays((value) => Math.max(1, value - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:bg-secondary"
                    aria-label="Decrease days"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDays((value) => value + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:bg-secondary"
                    aria-label="Increase days"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex h-16 items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/80 px-5 text-charcoal">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    People
                  </div>
                  <div className="text-sm font-semibold">
                    {people}
                    {people > 1 ? "" : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPeople((value) => Math.max(1, value - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:bg-secondary"
                    aria-label="Decrease people"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeople((value) => value + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:bg-secondary"
                    aria-label="Increase people"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] rounded-2xl px-10 h-16 font-semibold xl:col-span-1"
              >
                Search
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Search results are handled on the destinations/contact pages */}
      </div>
    </section>
  );
}
