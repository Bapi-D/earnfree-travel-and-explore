import { motion } from "framer-motion";
import {
  Heart,
  Mountain,
  Briefcase,
  GraduationCap,
  Church,
  Users,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { CustomizedToursMobile } from "./CustomizedToursMobile";
import GroupTour from "./Grouptour.tsx";

const cats = [
  {
    icon: Users,
    title: "Family Tours",
    desc: "Memories that last generations.",
  },
  {
    icon: Heart,
    title: "Honeymoon",
    desc: "Romantic escapes for couples.",
  },
  {
    icon: Mountain,
    title: "Adventure",
    desc: "Trekking, rafting, paragliding.",
  },
  {
    icon: Briefcase,
    title: "Corporate Trips",
    desc: "Curated MICE & off-sites.",
  },
  {
    icon: GraduationCap,
    title: "Student Tours",
    desc: "Educational group travel.",
  },
  {
    icon: Church,
    title: "Pilgrimage",
    desc: "Sacred journeys, done right.",
  },
];

export function Categories() {
  return (
    <>
      {/* ============ DESKTOP (lg and up) — untouched original ============ */}
      <section className="hidden lg:block section bg-secondary relative overflow-hidden">
        {/* Premium Grid Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(220,38,38,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220,38,38,0.12) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Top Left Glow */}
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl z-0" />

        {/* Bottom Right Glow */}
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-gold/10 blur-3xl z-0" />

        {/* Decorative Dots */}
        <div className="absolute top-20 left-16 h-2 w-2 rounded-full bg-primary/40 z-0" />
        <div className="absolute top-40 right-20 h-3 w-3 rounded-full bg-gold/40 z-0" />
        <div className="absolute bottom-20 left-1/4 h-2 w-2 rounded-full bg-primary/30 z-0" />
        <div className="absolute bottom-32 right-1/3 h-2 w-2 rounded-full bg-gold/30 z-0" />

        <div className="container relative z-10 mx-auto px-6 lg:px-10">
          <SectionHeader
            eyebrow="Explore"
            title="Travel"
            highlight="categories"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cats.map((c, i) => {
              const Icon = c.icon;

              return (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                  }}
                  className="group relative overflow-hidden rounded-3xl p-8 glass-card cursor-pointer border border-border/50 hover:border-primary/20 transition-all duration-500"
                >
                  {/* Card Glow */}
                  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-primary/10 to-gold/10 group-hover:from-primary/20 group-hover:to-gold/20 blur-xl transition-all duration-500" />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-gold/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.62_0.21_30)] text-white shadow-elegant mb-5">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="text-2xl font-bold">
                      {c.title}
                    </h3>

                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ MOBILE & TABLET (below lg) — Customized Tours ============ */}
      <CustomizedToursMobile />

      <GroupTour />
    </>
  );
}