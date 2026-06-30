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

/* Bottom nav tabs for mobile/tablet */
const bottomNavItems = [
  {
    href: "/destinations",
    label: "Trips",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
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
    const onScroll = () => setScrolled(window.scrollY > 24);
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
    <>
      <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500">
        {/* PREMIUM PLANE ANIMATION */}
        <style>{`
          @keyframes planeZoomToFace {
            0% { transform: translate(-50%, -50%) scale(0.2) rotate(-25deg); opacity: 0; filter: blur(8px); }
            15% { opacity: 1; filter: blur(0px) drop-shadow(0 18px 28px rgba(0,0,0,0.45)); }
            40% { transform: translate(-50%, -50%) scale(1) rotate(-10deg); opacity: 1; }
            65% { transform: translate(-50%, -50%) scale(2.5) rotate(0deg); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(18) rotate(8deg); opacity: 0; filter: blur(16px); }
          }
          .animate-plane-flash {
            animation: planeZoomToFace 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            will-change: transform, opacity;
          }
          .navbar-desktop-link { font-size: 16px; line-height: 1.2; }
          @media (max-width: 1279px) { .navbar-desktop-link { font-size: 14px !important; } }
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

        {/* MAIN NAVBAR */}
        <div className="relative z-10">
          {/* Mobile/tablet: transparent at top (blue gradient from Hero shows through), solid white once scrolled */}
          <div
            className={`lg:hidden absolute inset-0 transition-colors duration-300 ${
              scrolled ? "bg-white shadow-sm" : "bg-transparent"
            }`}
            aria-hidden="true"
          />
          {/* Desktop: solid white */}
          <div className="hidden lg:block absolute h-25 inset-0 bg-white" aria-hidden="true" />

          <div className="relative container mx-auto flex justify-between px-3 lg:px-6 items-center py-2 h-[60px] lg:h-28">
            {/* LOGO */}
            <Link
              to="/"
              disabled={isAnimating}
              className="flex items-center gap-2 shrink-0"
            >
              {/* Mobile only */}
              <div className="block md:hidden h-26">
                <Logo size="sm" />
              </div>
              {/* Tablet only */}
              <div className="hidden md:block lg:hidden h-26">
                <Logo size="md" />
              </div>
              {/* Desktop */}
              <div className="hidden lg:block h-38">
                <Logo size="lg" />
              </div>
            </Link>

            {/* DESKTOP RIGHT SIDE — unchanged */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-6 flex-1 justify-end">
              <nav className="flex items-center gap-3 lg:gap-4 xl:gap-6 z-20">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className={`navbar-desktop-link ${scrolled ? "text-foreground" : "text-black"} text-[13px] lg:text-[14px] xl:text-[16px] font-semithin tracking-wide transition-all duration-300 hover:text-primary hover:scale-105 border-none bg-transparent cursor-pointer inline-flex items-center whitespace-nowrap`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="hidden xl:flex items-center gap-3">
                <a href="tel:+917005630063" className="inline-flex items-center gap-2 rounded-full" aria-label="Call Us">
                  <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-xl shadow-soft border border-white/30">
                    <span className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-black/20 blur-md" />
                    <span className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.77.64 2.61a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.48-1.48a2 2 0 0 1 2.11-.45c.84.3 1.71.52 2.61.64A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                  </span>
                  <span className="text-black font-semibold text-base">Call Us</span>
                </a>
                <a href="tel:+917005630063" className="inline-flex items-center gap-2 text-black font-semibold hover:opacity-90" aria-label="Call +917005630063">
                  +917005630063
                </a>
              </div>

              <Link
                to="/search"
                search={{ q: "" }}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#FFEA00] to-[#F4A300] text-white shadow-elegant transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(244,163,0,0.35)]"
                aria-label="Search"
              >
                <span className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-black/20 blur-md" aria-hidden="true" />
                <Search className="relative h-5 w-5" />
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button disabled={isAnimating} className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-gold text-white font-bold text-sm shadow-elegant hover:scale-105 transition-transform flex items-center justify-center ring-2 ring-white/40">
                      {initials}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="font-semibold truncate">{fullName || "Traveler"}</div>
                      <div className="text-xs text-muted-foreground truncate font-normal">{user.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem onSelect={() => navigate({ to: "/admin" })} disabled={isAnimating}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    {isStaff && (
                      <DropdownMenuItem onSelect={() => navigate({ to: "/staff1" })} disabled={isAnimating}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />Staff Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => navigate({ to: "/profile" })} disabled={isAnimating}>
                      <UserCircle className="h-4 w-4 mr-2" />Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => signOut()} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  disabled={isAnimating}
                  onClick={() => handleAction(() => openAuthModal("login"))}
                  className="relative overflow-hidden rounded-full h-10 px-4 text-base font-bold bg-gradient-to-l from-[#D62828] via-[#FF4D4D] to-[#D62828] text-white shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all duration-300 after:content-[''] after:absolute after:left-0 after:top-0 after:h-full after:w-full after:opacity-0 after:bg-gradient-to-r after:from-white/20 after:to-white/0 after:translate-x-[-100%] hover:after:opacity-100 hover:after:translate-x-[0%] after:transition-transform after:duration-500"
                >
                  <span className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-black/20 blur-md" aria-hidden="true" />
                  <User className="relative h-4 w-4 mr-2" />Login
                </Button>
              )}
            </div>

            {/* MOBILE RIGHT — Call + Hamburger only (no user avatar cluttering) */}
            <div className="flex lg:hidden items-center gap-2">
              {user && (
                <button
                  disabled={isAnimating}
                  onClick={() => handleAction(() => navigate({ to: "/profile" }))}
                  className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-gold text-white font-bold text-sm shadow-elegant hover:scale-105 transition-transform flex items-center justify-center"
                >
                  {initials}
                </button>
              )}

              {/* Call button */}
              <a
                href="tel:+917005630063"
                aria-label="Call us"
                className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.77.64 2.61a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.48-1.48a2 2 0 0 1 2.11-.45c.84.3 1.71.52 2.61.64A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>

              {/* Hamburger */}
              <button
                onClick={() => setOpen(!open)}
                onMouseEnter={() => { if (open) setCrossHoverTick((v) => v + 1); }}
                className="relative h-10 w-10 rounded-lg bg-white shadow-md flex items-center justify-center"
                aria-label="Toggle Menu"
              >
                <span className="absolute inset-0 rounded-lg bg-white transition-all duration-300" aria-hidden="true" />
                <span className="relative h-6 w-6">
                  <span key={`line1-${crossHoverTick}`} className={`absolute left-0 top-1/2 w-full h-[2px] bg-black rounded-full origin-center transition-all duration-300 ease-out ${open ? "rotate-45" : "rotate-0 translate-y-[-6px]"}`} />
                  <span key={`line2-${crossHoverTick}`} className={`absolute left-0 top-1/2 w-full h-[2px] bg-black rounded-full origin-center transition-all duration-300 ease-out ${open ? "-rotate-45" : "rotate-0 translate-y-[6px]"}`} />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
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
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="fixed inset-y-0 right-0 h-screen w-full max-w-sm bg-white/10 backdrop-blur-3xl shadow-[0_8px_50px_rgba(0,0,0,0.35)] z-[100] lg:hidden overflow-hidden"
              >
                <div className="flex h-full flex-col">
                  <div className="px-8 pt-8">
                    <Logo size="lg" />
                  </div>
                  <div className="flex flex-col mt-6 px-8 overflow-y-auto">
                    {links.map((l, index) => (
                      <motion.div
                        key={l.label}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                      >
                        <Link
                          to={l.href}
                          onClick={() => setOpen(false)}
                          className="block py-5 text-2xl sm:text-3xl font-bold text-white border-b border-white/10 hover:text-yellow-400 transition-colors"
                        >
                          {l.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-auto px-8 pb-28">
                    {!user && (
                      <Button
                        disabled={isAnimating}
                        onClick={() => handleAction(() => openAuthModal("login"))}
                        className="w-full justify-center relative overflow-hidden rounded-2xl h-12 text-lg font-bold bg-white/95 text-black shadow-soft mt-3"
                      >
                        <span className="relative inline-flex items-center gap-2">
                          <User className="h-5 w-5" />Login
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* =============================================
          BOTTOM NAV BAR — mobile/tablet only
          Matches JustWravel: Trips | Explore (center FAB) | Chat
      ============================================= */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-[80] bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        aria-label="Bottom navigation"
      >
        <div className="flex items-center justify-around h-16 px-2 relative">
          {/* WhatsApp Chat */}
          <a
            href="https://wa.me/917005630063"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-600 transition-colors min-w-[60px]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
            <span className="text-[10px] font-medium">Chat</span>
          </a>

          {/* CENTER FAB — Explore */}
          <div className="flex flex-col items-center -mt-6">
            <Link
              to="/destinations"
              className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg flex items-center justify-center border-4 border-white"
              aria-label="Explore"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="white" stroke="none" />
              </svg>
            </Link>
            <span className="text-[10px] font-medium text-gray-600 mt-1">Explore</span>
          </div>


          {/* Login/Profile */}
          {user ? (
            <button
              onClick={() => navigate({ to: "/profile" })}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors min-w-[60px]"
            >
              <span className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-gold text-white font-bold text-xs flex items-center justify-center">
                {initials}
              </span>
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors min-w-[60px]"
            >
              <User className="h-5 w-5" />
              <span className="text-[10px] font-medium">Login</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}