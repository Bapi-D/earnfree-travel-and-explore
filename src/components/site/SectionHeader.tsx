export function SectionHeader({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "center" | "left";
}) {
  const isCenter = align === "center";
  return (
    <div className={`max-w-2xl mb-16 ${isCenter ? "mx-auto text-center" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="text-4xl md:text-5xl lg:text-6xl mt-4">
        {title}{" "}
        {highlight && <span className="italic font-light text-gradient-primary">{highlight}</span>}
      </h2>
      <div className={`divider-gold mt-6 ${isCenter ? "mx-auto" : ""}`} />
      {description && (
        <p className="text-muted-foreground mt-5 text-lg leading-relaxed">{description}</p>
      )}
    </div>
  );
}
