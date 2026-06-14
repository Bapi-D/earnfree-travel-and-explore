import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { SectionHeader } from "./SectionHeader";

const points = [
  "7+ years of experience in creating personalized trips",
  "Seamless and budget-friendly travel across destinations",
  "24×7 on-trip support so you are never alone",
  "Dedicated tour manager on every trip for smooth coordination",
];

export function About() {
  return (
    <section
      id="about"
      className="section bg-background relative overflow-hidden"
    >
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

      {/* Top Right Glow */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none z-0" />

      {/* Bottom Left Glow */}
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gold/5 blur-3xl pointer-events-none z-0" />

      {/* Decorative Dots */}
      <div className="absolute top-24 left-12 h-2 w-2 rounded-full bg-primary/40 z-0" />
      <div className="absolute top-40 right-24 h-3 w-3 rounded-full bg-gold/40 z-0" />
      <div className="absolute bottom-32 left-1/3 h-2 w-2 rounded-full bg-primary/30 z-0" />
      <div className="absolute bottom-20 right-1/4 h-2 w-2 rounded-full bg-gold/30 z-0" />

      <div className="container relative z-10 mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="aspect-square rounded-[2.5rem] glass-card p-12 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-gold/10 to-transparent" />

            <img
              src={logo}
              alt="Earnfree logo"
              className="max-w-[78%] animate-float relative"
            />
          </div>

          {/* Years Badge */}
          <div className="absolute -bottom-7 -right-4 lg:right-6 bg-gradient-to-br from-primary to-[oklch(0.62_0.21_30)] text-primary-foreground rounded-3xl px-7 py-6 shadow-elegant">
            <div className="text-4xl font-bold font-display">7+</div>
            <div className="text-sm opacity-90 tracking-wider uppercase">
              Years of Trust
            </div>
          </div>

          {/* Rating Badge */}
          <div className="absolute -top-6 -left-4 lg:left-0 glass-card rounded-2xl px-5 py-4 shadow-soft">
            <div className="text-2xl font-bold text-primary">★ 4.9</div>
            <div className="text-xs text-muted-foreground">
              500+ Reviews
            </div>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeader
            eyebrow="About Us"
            title="Your trusted partner for"
            highlight="every journey"
            align="left"
          />

          <p className="text-muted-foreground leading-relaxed text-lg -mt-8 mb-8">
            Earnfree Travel And Explore is a trusted name in the Indian travel
            industry, offering seamless and budget-friendly travel experiences
            across destinations. We specialize in creating personalized trips
            that help you explore more while spending smart. From secure
            bookings and competitive pricing to flights, hotels, and complete
            tour packages, we focus on comfort, reliability, and unforgettable
            experiences.
          </p>

          <ul className="space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground font-medium">{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}