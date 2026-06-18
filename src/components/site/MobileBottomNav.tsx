import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { Compass } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function MobileBottomNav() {
  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-border bg-white/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] h-14"
      aria-label="Quick actions"
    >
      <div className="relative flex items-center justify-between px-8 py-2.5">
        {/* CALL */}
        <a
          href="tel:+917005630063"
          className="flex flex-col items-center gap-1 text-charcoal/70 hover:text-primary transition-colors"
          aria-label="Call us"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/60">
            <FaPhoneAlt className="h-5 w-5" />
          </span>
        </a>

        {/* EXPLORE - elevated center button */}
        <Link
          to="/destinations"
          className="absolute left-1/2 -translate-x-1/2 -top-7 flex flex-col items-center gap-1"
          aria-label="Explore destinations"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#D0232C] via-[#ff4d57] to-[#ffb199] text-white shadow-[0_10px_25px_rgba(208,35,44,0.45)] ring-4 ring-white">
            <Compass className="h-6 w-6" />
          </span>
          <span className="text-[11px] font-semibold text-charcoal">Explore</span>
        </Link>

        {/* WHATSAPP */}
        <a
          href="https://api.whatsapp.com/send?phone=917005630063"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 text-charcoal/70 hover:text-[oklch(0.7_0.17_150)] transition-colors"
          aria-label="Chat on WhatsApp"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60">
            <FaWhatsapp className="h-6 w-6" />
          </span>
        </a>
      </div>
    </nav>
  );
}