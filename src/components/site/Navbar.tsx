import { useEffect, useState } from "react";
import { Menu, X, User, UserCircle, LayoutDashboard, LogOut, Search } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";


import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "@tanstack/react-router";

import plane from "@/assets/flight.png";
import { Logo } from "@/components/site/Logo";

const links: { href: string; label: string }[] = [
  { href: "/about", label: "About" },
  { href: "/packages", label: "Packages" },
  { href: "/destinations", label: "Destinations" },
  { href: "/best-seller", label: "Best seller" },
  { href: "/contact/page", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);
  const [showPlane, setShowPlane] = useState(false);
  const [crossHoverTick, setCrossHoverTick] = useState(0);


  const { user, initials, fullName, isAdmin, isStaff, signOut, openAuthModal } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAction = (callbackAction: () => void) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setShowPlane(true);
    setOpen(false);

    setTimeout(() => {
      callbackAction();

      setIsAnimating(false);
      setShowPlane(false);
    }, 1800);
  };

  return (
    <header className="fixed inset-x-0 top-0 lg:top-4 z-50 transition-all duration-500">
      {/* PREMIUM PLANE ANIMATION */}
      <style>{`
        @keyframes planeZoomToFace {
          0% {
            transform: translate(-50%, -50%) scale(0.2) rotate(-25deg);
            opacity: 0;
            filter: blur(8px);
          }

          15% {
            opacity: 1;
            filter:
              blur(0px)
              drop-shadow(0 18px 28px rgba(0,0,0,0.45));
          }

          40% {
            transform: translate(-50%, -50%) scale(1) rotate(-10deg);
            opacity: 1;
          }

          65% {
            transform: translate(-50%, -50%) scale(2.5) rotate(0deg);
            opacity: 1;
          }

          100% {
            transform: translate(-50%, -50%) scale(18) rotate(8deg);
            opacity: 0;
            filter: blur(16px);
          }
        }

        .animate-plane-flash {
          animation: planeZoomToFace 1.8s cubic-bezier(0.22, 1, 0.36, 1)
            forwards;

          will-change: transform, opacity;
        }
      `}</style>

      {/* PLANE OVERLAY */}
      {showPlane && (
        <div className="fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-md z-[9999] pointer-events-none flex items-center justify-center overflow-hidden">
          <img
            src={plane}
            alt="Plane"
            className="absolute top-1/2 left-1/2 w-64 md:w-96 h-auto select-none animate-plane-flash"
          />
        </div>
      )}

      {/* WHITE BACKGROUND PANEL behind nav links/logo/CTA */}
      <div className="absolute inset-x-0 -top-4 z-0 pointer-events-none">
        <div className="h-24 md:h-24 w-full bg-white" />
      </div>

      {/* MAIN NAVBAR */}
      <div className="container mx-auto relative z-10 flex justify-between px-4 lg:px-6 items-center lg:items-start py-0 lg:py-7 lg:transform lg:-translate-y-0">
        {/* LOGO */}
        <Link
          to="/"
          disabled={isAnimating}
          className="flex items-center gap-2 overflow-visible -mt-6 lg:-mt-47 -ml-2 lg:-ml-4 md:-ml-6"
        >
          <div className="hidden lg:contents">
            <Logo size="lg" />
          </div>
          <div className="contents lg:hidden">
            <div className="transform scale-[2.35] origin-left translate-y-3">
              <Logo size="md" />
            </div>
          </div>

        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex absolute left-1/2 top-6 -translate-x-[72%] items-center gap-8 z-20 -ml-4">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              onClick={() => setOpen(false)}
              className={`
                text-[17px]
                font-semithin
                tracking-wide
                transition-all
                duration-300
                hover:text-primary
                hover:scale-105
                border-none
                bg-transparent
                cursor-pointer
                inline-flex
                items-center
                ${scrolled ? "text-foreground" : "text-black"}
              `}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex items-center gap-8 -mt-4 -ml-14">
          {/* Call Us */}
          <div className="-ml-8 flex items-center gap-3">
            <a
              href="tel:+917005630063"
              className="inline-flex items-center gap-2 rounded-full"
              aria-label="Call Us"
            >
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-xl shadow-soft border border-white/30">
                {/* corner edge shadow */}
                <span className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-black/20 blur-md" />
                <span className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.77.64 2.61a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.48-1.48a2 2 0 0 1 2.11-.45c.84.3 1.71.52 2.61.64A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
              </span>
              <span className="text-black font-semibold text-base">Call Us</span>
            </a>
            <a
              href="tel:+917005630063"
              className="inline-flex items-center gap-2 text-black font-semibold hover:opacity-90"
              aria-label="Call +917005630063"
            >
              +917005630063
            </a>
          </div>

          {/* Search button (opens /search) */}
          <Link
            to="/search"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#FFEA00] to-[#F4A300] text-white shadow-elegant transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(244,163,0,0.35)]"
            aria-label="Search"
          >
            {/* corner edge shadow */}
            <span
              className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-black/20 blur-md"
              aria-hidden="true"
            />
            <Search className="relative h-5 w-5" />
          </Link>

          {/* USER MENU */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={isAnimating}
                  className="ml-1 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-gold text-white font-bold text-sm shadow-elegant hover:scale-105 transition-transform flex items-center justify-center ring-2 ring-white/40 mt-0 lg:mt-1"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-semibold truncate">{fullName || "Traveler"}</div>

                  <div className="text-xs text-muted-foreground truncate font-normal">
                    {user.email}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {isAdmin && (
                  <DropdownMenuItem
                    onSelect={() => navigate({ to: "/admin" })}
                    disabled={isAnimating}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}

                {isStaff && (
                  <DropdownMenuItem
                    onSelect={() => navigate({ to: "/staff1" })}
                    disabled={isAnimating}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Staff Panel
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onSelect={() => navigate({ to: "/profile" })}
                  disabled={isAnimating}
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={() => signOut()} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              disabled={isAnimating}
              onClick={() => handleAction(() => openAuthModal("login"))}
              className={`relative overflow-hidden rounded-full h-10 px-4 text-lg font-bold mt-0 -lg:mt-1 
              bg-gradient-to-l from-[#D62828] via-[#FF4D4D] to-[#D62828] text-white shadow-soft 
                hover:shadow-elegant hover:-translate-y-0.5 transition-all duration-300 
                after:content-[''] after:absolute after:left-0 after:top-0 after:h-full after:w-full after:opacity-0 after:bg-gradient-to-r after:from-white/20 after:to-white/0 after:translate-x-[-100%] hover:after:opacity-100 hover:after:translate-x-[0%] after:transition-transform after:duration-500 
              `}
            >
              {/* corner edge shadow */}
              <span
                className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-black/20 blur-md"
                aria-hidden="true"
              />
              <User className="relative h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] lg:hidden"
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  duration: 0.45,
                  ease: "easeOut",
                }}
                className=" fixed inset-y-0 right-0 h-screen w-full bg-white/10 backdrop-blur-3xl shadow-[0_8px_50px_rgba(0,0,0,0.35)] z-[100] lg:hidden overflow-hidden" 
              >
                <div className="flex h-full flex-col">
                  <div className="scale-[2.35] origin-left -px-8 -pt-12">
                    <Logo size="lg" />
                  </div>

                  <div className="flex flex-col mt-10 px-8">
                    {links.map((l, index) => (
                    <motion.div
                      key={l.label}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.08,
                      }}
                    >
                        <Link
                          to={l.href}
                          onClick={() => setOpen(false)}
                          className="block py-5 text-3xl font-bold text-white border-b border-white/10 hover:text-yellow-400 transition-colors"
                        >
                          {l.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mobile Login at bottom of drawer */}
                  <div className="mt-auto px-8 pb-10">
                    {user ? null : (
                      <Button
                        disabled={isAnimating}
                        onClick={() => handleAction(() => openAuthModal("login"))}
                        className="w-full justify-center relative overflow-hidden rounded-2xl h-12 text-lg font-bold bg-white/95 text-black shadow-soft mt-3"
                      >
                        <span className="relative inline-flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Login
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>


        {/* Mobile Buttons */}
        <div className="fixed right-4 top-6 z-[110] flex items-center gap-2 lg:hidden">
          {user ? (
            <button
              disabled={isAnimating}
              onClick={() => handleAction(() => navigate({ to: "/profile" }))}
              className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-gold text-white font-bold text-sm shadow-elegant hover:scale-105 transition-transform flex items-center justify-center"
            >
              {initials}
            </button>
          ) : null}

          <button
            onClick={() => setOpen(!open)}
            onMouseEnter={() => {
              if (open) {
                // retrigger animation once per hover over the close (cross)
                setCrossHoverTick((v) => v + 1);
              }
            }}
            className="relative h-10 w-10 rounded-lg bg-white shadow-lg flex items-center justify-center"
            aria-label="Toggle Menu"
          >
            {/* Animated hamburger -> cross (mobile only) */}
            <span className="sr-only">Toggle Menu</span>
            <span
              className="absolute inset-0 rounded-lg bg-white transition-all duration-300"
              aria-hidden="true"
            />

            <span className="relative h-6 w-6">
              <span
                key={`line1-${crossHoverTick}`}
                className={`absolute left-0 top-1/2 w-full h-[2px] bg-black rounded-full origin-center transition-all duration-300 ease-out ${
                  open ? "rotate-45" : "rotate-0 translate-y-[-6px]"
                }`}
              />
              <span
                key={`line2-${crossHoverTick}`}
                className={`absolute left-0 top-1/2 w-full h-[2px] bg-black rounded-full origin-center transition-all duration-300 ease-out ${
                  open ? "-rotate-45" : "rotate-0 translate-y-[6px]"
                }`}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}