import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import bali from "@/assets/pkg-bali.jpg";
import dubai from "@/assets/pkg-dubai.jpg";
import nepal from "@/assets/pkg-nepal.jpg";
import thailand from "@/assets/pkg-thailand.jpg";
import kashmir from "@/assets/pkg-kashmir.jpg";
import goa from "@/assets/pkg-goa.jpg";

const imgs = [
  { src: bali, label: "Bali", className: "row-span-2" },
  { src: dubai, label: "Dubai", className: "" },
  { src: nepal, label: "Nepal", className: "" },
  { src: thailand, label: "Thailand", className: "row-span-2" },
  { src: kashmir, label: "Kashmir", className: "" },
  { src: goa, label: "Goa", className: "" },
];

export function Gallery() {
  return (
    <section className="section bg-background relative overflow-hidden">
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

      {/* Glow Effects */}
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl z-0" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-gold/10 blur-3xl z-0" />

      {/* Decorative Dots */}
      <div className="absolute top-24 left-20 h-2 w-2 rounded-full bg-primary/40 z-0" />
      <div className="absolute top-40 right-24 h-3 w-3 rounded-full bg-gold/40 z-0" />
      <div className="absolute bottom-32 left-1/3 h-2 w-2 rounded-full bg-primary/30 z-0" />
      <div className="absolute bottom-20 right-1/4 h-2 w-2 rounded-full bg-gold/30 z-0" />

      <div className="container relative z-10 mx-auto px-6 lg:px-10">
        <SectionHeader
          eyebrow="Wanderlust"
          title="Moments from"
          highlight="our travelers"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
          {imgs.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`relative rounded-2xl overflow-hidden group ${img.className}`}
            >
              <img
                src={img.src}
                alt={img.label}
                loading="lazy"
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-bold text-lg">
                  {img.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}