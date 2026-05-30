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

  const style: Record<string, any> = {
    height: `${dims.h}px`,
    width: `${dims.w}px`,
  };

  return (
    <div className="overflow-hidden" style={style}>
      <img src={logo} alt="Earnfree Travel & Explore" className="h-full w-auto object-contain" />
    </div>
  );
}
