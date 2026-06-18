import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

export function FloatingActions() {
  return (
    <div className="hidden lg:flex fixed right-4 bottom-4 z-50 flex-col gap-3">
      {/* WhatsApp Button → Opens Direct Chat Instantly */}
      <a
        href="https://api.whatsapp.com/send?phone=917005630063"
        target="_blank"
        rel="noreferrer"
        className="h-14 w-14 rounded-full bg-[oklch(0.7_0.17_150)] text-white shadow-elegant flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="WhatsApp"
      >
        <FaWhatsapp className="h-7 w-7" />
      </a>

      {/* Call Button → Opens Dialer App Instantly */}
      <a
        href="tel:+917005630063"
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-elegant flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Call"
      >
        <FaPhoneAlt className="h-6 w-6" />
      </a>
    </div>
  );
}