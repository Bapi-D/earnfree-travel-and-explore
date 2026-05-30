import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { Mail, Phone, Globe, MapPin, ArrowUp } from "lucide-react";
import plane from "@/assets/plane.png";
import bus from "@/assets/bus.png";
import train from "@/assets/train.png";

function MovingVehicles() {
  return (
    <>
      {/* Animation CSS */}
      <style>{`
        @keyframes planeTravel {
          0% {
            transform: translateX(-220px) translateY(40px) rotate(-6deg);
          }
          20% {
            transform: translateX(15vw) translateY(0px) rotate(-3deg);
          }
          50% {
            transform: translateX(50vw) translateY(-60px) rotate(0deg);
          }
          80% {
            transform: translateX(80vw) translateY(-10px) rotate(3deg);
          }
          100% {
            transform: translateX(calc(100vw + 250px)) translateY(35px) rotate(6deg);
          }
        }

        @keyframes busTravel {
          0% {
            transform: translateX(calc(100vw + 180px));
          }
          100% {
            transform: translateX(-220px);
          }
        }

        @keyframes trainTravel {
          0% {
            transform: translateX(-450px);
          }
          100% {
            transform: translateX(calc(100vw + 450px));
          }
        }

        @keyframes roadLines {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-200px);
          }
        }

        .animate-plane-travel {
          animation: planeTravel 18s linear infinite;
          will-change: transform;
        }

        .animate-bus-travel {
          animation: busTravel 14s linear infinite;
          will-change: transform;
        }

        .animate-train-travel {
          animation: trainTravel 16s linear infinite;
          will-change: transform;
        }

        .animate-road-lines {
          animation: roadLines 6s linear infinite;
          display: flex;
          will-change: transform;
        }
      `}</style>

      {/* GROUND TRANSIT VEHICLES CONTAINER */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 overflow-hidden z-20">
        {/* Train → LEFT to RIGHT (Perfect Bridge Alignment Fixed) */}
        <img
          src={train}
          alt="Train"
          className="
            absolute
            w-[340px]
            md:w-[460px]
            h-auto
            select-none
            opacity-95
            animate-train-travel
            filter
            drop-shadow-[0_8px_10px_rgba(0,0,0,0.55)]
            z-20
          "
          style={{
            bottom: "-48px", // Lowered to snap onto the yellow track line layout seamlessly
            transform: "rotate(-0.5deg)", 
            transformOrigin: "left bottom",
            left: "0",
          }}
        />

        {/* Bus Layer Container → RIGHT to LEFT */}
        <div className="absolute inset-x-0 bottom-[-42px] h-[34px] pointer-events-none z-30">
          <img
            src={bus}
            alt="Bus"
            className="absolute w-44 md:w-56 h-auto select-none opacity-95 animate-bus-travel filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]"
            style={{
              bottom: "14px",
              right: "0",
            }}
          />
        </div>
      </div>
    </>
  );
}

function SkylineSilhouette() {
  return (
    <svg
      viewBox="0 0 1600 280"
      className="w-full h-48 md:h-64 opacity-90 transition-all duration-300"
      preserveAspectRatio="none" 
      aria-hidden
    >
      <defs>
        <linearGradient id="clean-sky-glow" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
          <stop offset="30%" stopColor="var(--primary)" stopOpacity="0.2" />
          <stop offset="70%" stopColor="var(--gold)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="clean-sky-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--gold) 85%, white)" stopOpacity="0.95" />
          <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--charcoal)" stopOpacity="0.98" />
        </linearGradient>

        <linearGradient id="clean-sky-detail" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient id="clean-bridge-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--charcoal)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#111" stopOpacity="1" />
        </linearGradient>
      </defs>

      <g>
        <rect x="0" y="244" width="1600" height="36" fill="url(#clean-sky-glow)" />

        <g fill="url(#clean-sky-fill)">
          {/* Background depth pillars */}
          <path
            d="M0 280V230H40V180H90V230H140V120H190V230H240V90H310V230H360V150H420V230H470V70H540V230H590V130H660V230H710V100H790V230H840V50H920V230H960V110H1030V230H1080V80H1150V230H1200V140H1270V230H1320V60H1400V230H1450V120H1520V160H1570V230H1600V280Z"
            opacity="0.25"
          />

          {/* Foreground urban array */}
          <path
            d="M0 280V244H25V180H75V244H115V130H175V244H215V95H285V244H325V160H395V244H435V110H505V244H545V65H625V244H665V140H735V244H775V85H855V244H895V50H975V244H1015V125H1085V244H1125V75H1205V244H1245V150H1315V244H1355V90H1435V244H1475V135H1545V244H1575V185H1600V280Z"
            opacity="0.98"
          />

          {/* 1. TAJ MAHAL */}
          <g transform="translate(545, 65)">
            <path d="M25 0 C25 -30 55 -30 55 0 Z" fill="url(#clean-sky-detail)" />
            <line x1="40" y1="-15" x2="40" y2="-32" stroke="var(--gold)" strokeWidth="1.5" />
            <circle cx="40" cy="-32" r="2.5" fill="var(--gold)" />
            <rect x="-15" y="-40" width="4" height="219" rx="1" />
            <rect x="91" y="-40" width="4" height="219" rx="1" />
          </g>

          {/* 2. COLOSSEUM */}
          <g transform="translate(895, 50)">
            <g fill="var(--charcoal)" opacity="0.5">
              <rect x="15" y="30" width="8" height="20" rx="4" />
              <rect x="31" y="30" width="8" height="20" rx="4" />
              <rect x="47" y="30" width="8" height="20" rx="4" />
              <rect x="63" y="30" width="8" height="20" rx="4" />
              <rect x="15" y="65" width="8" height="25" rx="4" />
              <rect x="31" y="65" width="8" height="25" rx="4" />
              <rect x="47" y="65" width="8" height="25" rx="4" />
              <rect x="63" y="65" width="8" height="25" rx="4" />
              <rect x="15" y="105" width="8" height="30" rx="4" />
              <rect x="31" y="105" width="8" height="30" rx="4" />
              <rect x="47" y="105" width="8" height="30" rx="4" />
              <rect x="63" y="105" width="8" height="30" rx="4" />
            </g>
          </g>

          {/* 3. PYRAMID */}
          <g transform="translate(215, 95)">
            <polygon points="35,0 0,149 70,149" />
            <polygon points="35,0 35,149 70,149" opacity="0.12" fill="white" />
          </g>

          {/* Window Slits */}
          <g fill="var(--gold)" opacity="0.35">
            <rect x="130" y="150" width="2" height="40" />
            <rect x="140" y="150" width="2" height="40" />
            <rect x="150" y="150" width="2" height="40" />
            <rect x="450" y="140" width="2" height="60" />
            <rect x="462" y="140" width="2" height="60" />
            <rect x="1140" y="110" width="2" height="50" />
            <rect x="1152" y="110" width="2" height="50" />
            <rect x="1164" y="110" width="2" height="50" />
          </g>
        </g>

        {/* BRIDGE TRACK GRAPHICS */}
        <g id="elevated-train-bridge">
          <rect x="0" y="224" width="1600" height="4" fill="url(#clean-bridge-grad)" />
          <rect x="0" y="222" width="1600" height="1.5" fill="var(--gold)" opacity="0.6" />

          <g fill="url(#clean-bridge-grad)" opacity="0.9">
            <rect x="100" y="224" width="12" height="20" />
            <rect x="380" y="224" width="12" height="20" />
            <rect x="660" y="224" width="12" height="20" />
            <rect x="940" y="224" width="12" height="20" />
            <rect x="1220" y="224" width="12" height="20" />
            <rect x="1500" y="224" width="12" height="20" />
          </g>

          <path
            d="M0 224 L30 210 L60 224 L90 210 L120 224 L150 210 L180 224 L210 210 L240 224 L270 210 L300 224 L330 210 L360 224 L390 210 L420 224 L450 210 L480 224 L510 210 L540 224 L570 210 L600 224 L630 210 L660 224 L690 210 L720 224 L750 210 L780 224 L810 210 L840 224 L870 210 L900 224 L930 210 L960 224 L990 210 L1020 224 L1050 210 L1080 224 L1110 210 L1140 224 L1170 210 L1200 224 L1230 210 L1260 224 L1290 210 L1320 224 L1350 210 L1380 224 L1410 210 L1440 224 L1470 210 L1500 224 L1530 210 L1560 224 L1590 210 L1600 224"
            fill="none"
            stroke="url(#clean-bridge-grad)"
            strokeWidth="1.5"
            opacity="0.8"
          />
          <line x1="0" y1="210" x2="1600" y2="210" stroke="url(#clean-bridge-grad)" strokeWidth="1" opacity="0.8" />
        </g>

        {/* Foreground Transition Shade Overlay */}
        <path
          d="M0 242C120 238 240 242 380 240C510 238 620 232 760 234C900 236 1020 242 1160 238C1280 234 1410 231 1600 236V280H0Z"
          fill="url(#clean-sky-glow)"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}

export function Footer() {
  const socials = [
    { Icon: FaFacebookF, href: "https://www.facebook.com/share/1E6u8YZryW/?mibextid=wwXIfr", label: "Facebook", color: "#1877F2" },
    { Icon: FaInstagram, href: "https://www.instagram.com/earnfree.travel?igsh=cW1wcnIxNXRidGZj&utm_source=qr", label: "Instagram", color: "#E4405F" },
    { Icon: FaYoutube, href: "#", label: "YouTube", color: "#FF0000" },
    { Icon: FaWhatsapp, href: "https://wa.me/+917005630063", label: "WhatsApp", color: "#25D366" },
  ];

  return (
    <footer className="relative w-full bg-charcoal text-white border-t border-white/10 overflow-hidden">
      {/* 3D OVERLAY PLANE CONTAINER - Highest Stacking Priority over Socials */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[480px] overflow-visible z-40">
        <img
          src={plane}
          alt="Plane"
          className="absolute w-48 md:w-64 h-auto select-none opacity-95 animate-plane-travel filter drop-shadow-[0_20px_12px_rgba(0,0,0,0.6)]"
          style={{
            bottom: "230px", 
            left: "0",
          }}
        />
      </div>

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[420px] w-[420px] rounded-full bg-gold/10 blur-3xl" />

      {/* Main Container Core - Spacing pushed up using pt-12 */}
      <div className="w-full px-4 sm:px-8 pt-12 pb-4 relative text-center">
        
        {/* Brand Label Block */}
        <div className="space-y-1 md:space-y-2 mt-0 mb-6">
          <h2 className="font-display font-bold tracking-wide text-2xl sm:text-3xl md:text-4xl leading-tight">
            EARNFREE <span className="text-gradient-gold">TRAVEL &amp; EXPLORE</span>
          </h2>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gold/60 font-semibold leading-relaxed">
            Gateway to the 7 Wonders of the World
          </p>
        </div>

        {/* Location Address Row - Perfectly aligned with nowrap text strings */}
        <p className="mt-4 text-sm sm:text-base text-white/75 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 max-w-5xl mx-auto leading-relaxed px-2 break-words">
          <span className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium">Bardowali Milan Sangha, Near Bipani Bitan,</span>
          </span>
          <span className="whitespace-nowrap font-medium text-white/90">
            Agartala, West Tripura, Tripura – 799003
          </span>
        </p>

        {/* Contact info rows */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-sm text-white/80">
          <a href="mailto:earnfree@gmail.com" className="inline-flex items-center gap-2 hover:text-gold transition-colors">
            <Mail className="h-4 w-4 text-primary" /> care@earnfreetravel.in
          </a>
          <a href="tel:+917005630063" className="inline-flex items-center gap-2 hover:text-gold transition-colors">
            <Phone className="h-4 w-4 text-primary" /> +91 70056 30063
          </a>
          <a href="www.earnfreetravel.online" className="inline-flex items-center gap-2 hover:text-gold transition-colors">
            <Globe className="h-4 w-4 text-primary" /> www.earnfreetravel.in
          </a>
        </div>

        {/* Social Icons Pill Container */}
        <div className="mt-8 inline-flex items-center gap-3 sm:gap-5 px-5 sm:px-7 py-3 rounded-full glass-dark relative z-30">
          {socials.map(({ Icon, href, label, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="group h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white inline-flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(244,163,0,0.5)]"
            >
              <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" style={{ color }} />
            </a>
          ))}
        </div>

        {/* Skyline, Bridge, Road and Animation Assembly block */}
        <div className="mt-12 relative w-full left-0 right-0">
          <SkylineSilhouette />

          {/* ROAD LAYER CONTAINER */}
          <div className="absolute bottom-[-42px] left-0 w-full z-0">
            {/* Road Main */}
            <div className="relative h-[34px] bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-t border-white/10 border-b border-black/40 shadow-[0_-6px_25px_rgba(0,0,0,0.6)]">
              {/* Asphalt Texture Overlay */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />

              {/* Road Lines */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full overflow-hidden">
                <div className="flex animate-road-lines w-max">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-12 h-[2px] bg-amber-400/90 rounded-full mx-6 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <MovingVehicles />
        </div>

        {/* Copyright Footer Sub-bar */}
        <div className="mt-4 pt-5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/55 relative z-20 max-w-7xl mx-auto">
          <p>© {new Date().getFullYear()} Earnfree Travel &amp; Explore. All rights reserved.</p>
          <p className="hidden md:block">Crafted with passion for travelers worldwide.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="h-10 w-10 rounded-full glass-dark inline-flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}