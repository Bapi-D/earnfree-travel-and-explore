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
    <section id="highlights" className="py-24 bg-background relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#D0232C]/10 blur-3xl rounded-full" />

      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#D0232C]/10 blur-3xl rounded-full" />

      <div className="container mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
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
                rounded-2xl
                p-5 md:p-6
                text-center
                group
                hover:-translate-y-2
                transition-all
                duration-500
                border
                border-white/20
                bg-white/75
                backdrop-blur-xl
                shadow-[0_12px_45px_rgba(0,0,0,0.08)]
              "
            >
              {/* ICON */}
              <div
                className="
                  inline-flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  text-white
                  mb-6
                  group-hover:scale-110
                  transition-transform
                  duration-500
                  shadow-[0_10px_25px_rgba(208,35,44,0.35)]
                  bg-gradient-to-br
                  from-[#D0232C]
                  via-[#ff4d57]
                  to-[#ffb199]
                "
              >
                <Icon className="h-7 w-7" />
              </div>

              {/* COUNT */}
              <div className="text-3xl md:text-5xl font-extrabold text-[#D0232C] leading-none">
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
              <div className="text-xs md:text-sm text-zinc-500 mt-3 tracking-[0.18em] uppercase font-semibold">
                {it.label}
              </div>

              {/* BOTTOM GLOW LINE */}
              <div className="mt-5 h-[3px] w-16 mx-auto rounded-full bg-gradient-to-r from-[#D0232C] via-[#ff4d57] to-[#ffb199] opacity-80" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}