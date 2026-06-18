import logo from "@/assets/logo.png";

type LogoProps = {
  size?: "sm" | "md" | "lg";
};

// Explicit pixel heights per breakpoint — inline styles so nothing in the
// cascade (utility classes, resets, parent overflow rules) can shrink this.
const PIXEL_HEIGHTS: Record<NonNullable<LogoProps["size"]>, { base: number; sm?: number; md?: number; lg?: number }> = {
  sm: { base: 76, sm: 164 },
  md: { base: 100, sm: 126, md: 308 },
  lg: { base: 80, md: 96, lg: 105 },
};

export function Logo({ size = "md" }: LogoProps) {
  const h = PIXEL_HEIGHTS[size];

  return (
    <div className="earnfree-logo flex items-center justify-start">
      <style>{`
        .earnfree-logo img {
          height: ${h.base}px;
        }
        ${h.sm ? `@media (min-width: 640px) { .earnfree-logo img { height: ${h.sm}px; } }` : ""}
        ${h.md ? `@media (min-width: 768px) { .earnfree-logo img { height: ${h.md}px; } }` : ""}
        ${h.lg ? `@media (min-width: 1024px) { .earnfree-logo img { height: ${h.lg}px; } }` : ""}
      `}</style>

      <img
        src={logo}
        alt="Earnfree Travel & Explore"
        className="w-auto object-contain max-w-none"
      />
    </div>
  );
}