import { motion } from "framer-motion";
import {
  Users,
  Globe2,
  BadgeIndianRupee,
  Headphones,
} from "lucide-react";

import * as CountUpModule from "react-countup";

const CountUp = (CountUpModule as any).default ?? (CountUpModule as any);


const items = [
  {
    icon: Users,
    value: 5000,
    suffix: "+",
    label: "Happy Travelers",
  },
  {
    icon: Globe2,
    value: 100,
    suffix: "+",
    label: "Destinations",
  },
  {
    icon: BadgeIndianRupee,
    value: 100,
    suffix: "%",
    label: "Best Price Guarantee",
  },
  {
    icon: Headphones,
    value: 24,
    suffix: "/7",
    label: "Support",
  },
];

export function Highlights() {
  return (
    <section id="highlights" className="hidden lg:block py-6 relative overflow-hidden">

      <div className="container mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-x-8 lg:gap-x-12 gap-y-8 relative z-10">
        {items.map((it, i) => {
          const Icon = it.icon;

          return (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
             className="
             relative
             rounded-2xl
             p-1
             text-center
             group
             hover:-translate-y-2
             transition-all
             duration-500
            "
            >
              {/* VERTICAL DIVIDER (between items, like JustWravel reference) */}
              {i !== 0 && (
                <span
                  className="hidden lg:block absolute left-[-1.5rem] top-1/2 -translate-y-1/2 h-12 w-px bg-white/15"
                  aria-hidden="true"
                />
              )}

              {/* ICON */}
              <div
                className="
                  inline-flex
                  h-11
                  w-11
                  md:h-12
                  md:w-12
                  items-center
                  justify-center
                  rounded-xl
                  text-white
                  mb-3
                  group-hover:scale-110
                  transition-transform
                  duration-500
                  shadow-[0_8px_18px_rgba(208,35,44,0.35)]
                  bg-gradient-to-br
                  from-[#D0232C]
                  via-[#ff4d57]
                  to-[#ffb199]
                "
              >
                <Icon className="h-5 w-5 md:h-5.5 md:w-5.5" />
              </div>

              {/* COUNT */}
              <div className="text-xl md:text-2xl lg:text-3xl font-extrabold text-[#D0232C] leading-none">
                <CountUp
                  start={0}
                  end={it.value}
                  duration={3}
                  separator=","
                  enableScrollSpy
                  scrollSpyDelay={0}
                />
                {it.suffix}
              </div>

              {/* LABEL */}
              <div className="text-[10px] md:text-xs text-zinc-400 mt-2 tracking-[0.14em] uppercase font-semibold">
                {it.label}
              </div>

              {/* BOTTOM GLOW LINE */}
              <div className="mt-3 h-[2px] w-10 mx-auto rounded-full bg-gradient-to-r from-[#D0232C] via-[#ff4d57] to-[#ffb199] opacity-80" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}