import { motion } from "framer-motion";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { SectionHeader } from "./SectionHeader";

const consultants = [
  { name: "Priya Sharma", role: "Senior Travel Expert", phone: "+919999999991", initials: "PS" },
  { name: "Rohit Verma", role: "International Tours Lead", phone: "+919999999992", initials: "RV" },
  { name: "Anjali Mehta", role: "Honeymoon Specialist", phone: "+919999999993", initials: "AM" },
  { name: "Karan Singh", role: "Group Tours Manager", phone: "+919999999994", initials: "KS" },
];

const colors = [
  "from-primary to-[oklch(0.62_0.21_30)]",
  "from-[oklch(0.78_0.17_70)] to-[oklch(0.7_0.18_50)]",
  "from-[oklch(0.55_0.21_27)] to-[oklch(0.78_0.17_70)]",
  "from-charcoal to-[oklch(0.35_0.02_270)]",
];

export function Consultants() {
  return (
    <section className="section bg-secondary">
      <div className="container mx-auto px-6 lg:px-10">
        <SectionHeader eyebrow="Talk to an Expert" title="Meet our" highlight="consultants" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {consultants.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card rounded-3xl p-8 text-center hover:-translate-y-2 transition-transform duration-500"
            >
              <div
                className={`h-24 w-24 rounded-full bg-gradient-to-br ${colors[i]} text-white text-3xl font-bold mx-auto flex items-center justify-center shadow-elegant font-display`}
              >
                {c.initials}
              </div>
              <h3 className="mt-5 font-bold text-lg">{c.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{c.role}</p>
              <div className="mt-5 flex gap-2 justify-center">
                <a
                  href={`https://wa.me/${c.phone.replace("+", "")}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[oklch(0.7_0.17_150)] text-white text-xs font-semibold hover:scale-105 transition-transform"
                >
                  <FaWhatsapp /> WhatsApp
                </a>
                <a
                  href={`tel:${c.phone}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-charcoal text-white text-xs font-semibold hover:scale-105 transition-transform"
                >
                  <FaPhoneAlt /> Call
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
