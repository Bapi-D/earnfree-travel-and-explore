import { motion } from "framer-motion";
import { Heart, Mountain, Briefcase, GraduationCap, Church, Users } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const cats = [
  { icon: Users, title: "Family Tours", desc: "Memories that last generations." },
  { icon: Heart, title: "Honeymoon", desc: "Romantic escapes for couples." },
  { icon: Mountain, title: "Adventure", desc: "Trekking, rafting, paragliding." },
  { icon: Briefcase, title: "Corporate Trips", desc: "Curated MICE & off-sites." },
  { icon: GraduationCap, title: "Student Tours", desc: "Educational group travel." },
  { icon: Church, title: "Pilgrimage", desc: "Sacred journeys, done right." },
];

export function Categories() {
  return (
    <section className="section bg-secondary relative overflow-hidden">
      {/* decorative gradient blobs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

      <div className="container mx-auto px-6 lg:px-10 relative">
        <SectionHeader eyebrow="Explore" title="Travel" highlight="categories" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-3xl p-8 glass-card cursor-pointer"
              >
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-primary/10 to-gold/10 group-hover:from-primary/20 group-hover:to-gold/20 transition-colors" />
                <div className="relative">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.62_0.21_30)] text-white shadow-elegant mb-5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">{c.title}</h3>
                  <p className="text-muted-foreground mt-2">{c.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
