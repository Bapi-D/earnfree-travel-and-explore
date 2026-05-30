import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Send } from "lucide-react";
import { createFirestoreEnquiry } from "@/lib/firebase-data";

export function Enquiry() {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    destination: "",
    travelDate: "",
    travelers: "2",
    message: "",
  });

  const submitEnquiry = useMutation({
    mutationFn: async () => {
      setSubmitError(null);
      await createFirestoreEnquiry({
        customer_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        destination: formData.destination.trim(),
        status: "pending",
        assigned_staff_number: 0,
        travelers: formData.travelers ? Number(formData.travelers) : null,
        travel_date: formData.travelDate || null,
        message: formData.message.trim() || null,
      });
    },
    onSuccess: async () => {
      setSent(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        destination: "",
        travelDate: "",
        travelers: "2",
        message: "",
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-enquiries"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => {
      setSent(false);
      setSubmitError(error instanceof Error ? error.message : "Failed to send enquiry");
    },
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setSent(false);
    setFormData((current) => ({ ...current, [field]: value }));
  };

  return (
    <section id="enquiry" className="section bg-secondary">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="rounded-[2.5rem] overflow-hidden grid lg:grid-cols-5 shadow-elegant">
          <div className="lg:col-span-2 bg-gradient-to-br from-primary via-[oklch(0.5_0.21_27)] to-charcoal text-primary-foreground p-12 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
            <span className="eyebrow text-gold relative">Get in touch</span>
            <h2 className="text-4xl md:text-5xl mt-3 leading-tight relative">
              Plan your dream trip with us
            </h2>
            <p className="mt-4 text-white/85">
              Share your travel preferences and our expert will get back within 5 min with a
              personalised quote.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold shrink-0" /> Free, no-obligation quote
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold shrink-0" /> Customisable itinerary
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold shrink-0" /> 24/7 on-trip support
              </li>
            </ul>
          </div>
          <motion.form
            onSubmit={(e) => {
              e.preventDefault();
              submitEnquiry.mutate();
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-background p-8 md:p-10 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Field
              label="Full name"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(value) => updateField("fullName", value)}
              required
            />
            <Field
              label="Email"
              type="email"
              placeholder="you@email.com"
              value={formData.email}
              onChange={(value) => updateField("email", value)}
              required
            />
            <Field
              label="Phone"
              placeholder="+91 99999 99999"
              value={formData.phone}
              onChange={(value) => updateField("phone", value)}
              required
            />
            <Field
              label="Destination"
              placeholder="Nepal, Bali, Dubai..."
              value={formData.destination}
              onChange={(value) => updateField("destination", value)}
              required
            />
            <Field
              label="Travel date"
              type="date"
              value={formData.travelDate}
              onChange={(value) => updateField("travelDate", value)}
            />
            <Field
              label="Travelers"
              type="number"
              placeholder="2"
              value={formData.travelers}
              onChange={(value) => updateField("travelers", value)}
              min={1}
            />
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-medium">Message</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => updateField("message", e.target.value)}
                className="rounded-xl border border-input bg-secondary/50 px-4 py-3 outline-none focus:border-primary transition-colors"
                placeholder="Tell us about your trip..."
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between gap-4">
              <div className="min-h-6">
                {sent ? (
                  <p className="text-sm text-primary font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Thanks for reaching out. We’ll connect with you shortly.
                  </p>
                ) : submitError ? (
                  <p className="text-sm text-destructive font-medium">{submitError}</p>
                ) : null}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={submitEnquiry.isPending}
                className="bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] rounded-full px-7"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitEnquiry.isPending ? "Sending…" : "Submit Enquiry"}
              </Button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  onChange,
  ...props
}: { label: string; onChange: (value: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-input bg-secondary/50 px-4 py-3 outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}
