import logo from "@/assets/logo.png";

type LogoProps = {
  size?: "sm" | "md" | "lg";
};

export function Logo({ size = "md" }: LogoProps) {
  const dims = {
    sm: { h: 342, w: 430 },
    md: { h: 358, w: 490 },
    lg: { h: 382, w: 470 },
  }[size];

  return (
    <div
      className="overflow-hidden earnfree-logo"
      style={{
        height: `${dims.h}px`,
        width: `${dims.w}px`,
      }}
    >
      <img
        src={logo}
        alt="Earnfree Travel & Explore"
        className="h-full w-auto object-contain"
      />
    </div>
  );
}
