import { useEffect, useState } from "react";
import { Menu, X, User, UserCircle, LayoutDashboard, LogOut } from "lucide-react";

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

  const {
    user,
    initials,
    fullName,
    isAdmin,
    isStaff,
    signOut,
    openAuthModal,
  } = useAuth();

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

      {/* GLASS BACKGROUND */}
      <div className="absolute inset-0 flex items-start justify-center pointer-events-none top-3 md:top-4">
        <div
          className={`h-22 md:h-22 w-[calc(100%-1.5rem)] md:w-[calc(100%-4rem)] transition-all duration-500 ${
            scrolled
              ? "rounded-[1.5rem] bg-white/60 backdrop-blur-xl shadow-soft border border-white/60"
              : "bg-transparent"
          }`}
        />
      </div>

      {/* MAIN NAVBAR */}
      <div className="container mx-auto relative z-10 flex justify-between px-4 lg:px-6 items-center lg:items-start py-0 lg:py-7 lg:transform lg:-translate-y-0">
        {/* LOGO */}
        <Link
          to="/"
          disabled={isAnimating}
          className={`flex items-center gap-2 overflow-hidden -mt-31 lg:-mt-36 -ml-8 lg:-ml-10 md:-ml-12`}
        >
          <Logo size="md" />
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex absolute left-1/2 top-12 -translate-x-1/2 items-center gap-8 z-20">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              onClick={() => setOpen(false)}
              className={`
                text-[17px]
                font-bold
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
                ${
                  scrolled
                    ? "text-foreground"
                    : "text-black"
                }
              `}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex items-center gap-3">
          {/* USER MENU */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={isAnimating}
                  className="ml-1 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-gold text-white font-bold text-sm shadow-elegant hover:scale-105 transition-transform flex items-center justify-center ring-2 ring-white/40 mt-0 lg:mt-4"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56"
              >
                <DropdownMenuLabel>
                  <div className="font-semibold truncate">
                    {fullName || "Traveler"}
                  </div>

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

                <DropdownMenuItem
                  onSelect={() => signOut()}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              disabled={isAnimating}
              onClick={() =>
                handleAction(() =>
                  openAuthModal("login")
                )
              }
              className={`bg-charcoal text-white hover:bg-charcoal/90 rounded-full h-10 px-4 text-lg font-bold mt-0 lg:mt-4`} 
            >
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}

          {/* BOOK BUTTON */}
          <Button
            disabled={isAnimating}
            onClick={() => handleAction(() => navigate({ to: "/contact/page" }))}
            className={`bg-yellow-400 text-charcoal rounded-full px-5 py-2 h-10 text-lg font-bold shadow-elegant hover:bg-yellow-500 hover:scale-105 transition-all duration-300 mt-0 lg:mt-4`}
          >
            Book Now
          </Button>
        </div>

        {/* MOBILE MENU BUTTON */}
        {/* MOBILE ACTIONS (visible on small screens) - fixed to viewport top-left */}
        <div className="fixed right-18 top-10 z-[80] flex items-center gap-2 lg:hidden">
          {user ? (
            <button
              disabled={isAnimating}
              onClick={() => handleAction(() => navigate({ to: "/profile" }))}
              className="ml-1 h-9 w-9 rounded-full bg-gradient-to-br from-primary to-gold text-white font-bold text-sm shadow-elegant hover:scale-105 transition-transform flex items-center justify-center z-50"
            >
              {initials}
            </button>
          ) : null}

          <button
            className={`ml-0 h-9 w-9 rounded-md p-2 flex items-center justify-center bg-white/95 shadow-md ring-1 ring-black/5 transition-all duration-300 ${
              scrolled ? "text-foreground" : "text-black"
            } font-bold z-50`}
            onClick={() => !isAnimating && setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" strokeWidth={2.8} /> : <Menu className="h-6 w-6" strokeWidth={2.8} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="lg:hidden fixed inset-x-0 top-20 z-[60] bg-white/95 backdrop-blur-xl border-t border-border px-4 py-4 space-y-2 shadow-2xl rounded-b-3xl">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              onClick={() => setOpen(false)}
              className={`
                block
                w-full
                text-left
                py-3
                text-lg
                font-bold
                transition-all
                duration-300
                hover:text-primary
                hover:translate-x-2
                border-none
                bg-transparent
                ${
                  scrolled
                    ? "text-foreground"
                    : "text-black"
                }
              `}
            >
              {l.label}
            </Link>
          ))}

          <div className="flex gap-2 pt-3">
            {user ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleAction(() => navigate({ to: "/profile" }))}
                  className="flex-1 rounded-full"
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button onClick={() => signOut()} className="flex-1 bg-charcoal rounded-full">
                  Logout ({initials})
                </Button>
              </>
            ) : (
              <Button
                disabled={isAnimating}
                onClick={() =>
                  handleAction(() =>
                    openAuthModal("login")
                  )
                }
                className="flex-1 bg-primary"
              >
                Login / Sign up
              </Button>
            )}
          </div>

          <div className="pt-3">
            <Button
              onClick={() => handleAction(() => navigate({ to: "/contact/page" }))}
              className="w-full bg-yellow-400 text-charcoal rounded-full"
            >
              Book Now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}