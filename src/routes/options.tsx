import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, MapPinned, Sparkles, Users2, CalendarDays } from "lucide-react";
import { SectionPageLayout } from "@/components/site/SectionPageLayout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { packages } from "@/data/packages";

const options = [
  {
    title: "Travel categories",
    description: "Browse family tours, honeymoons, adventure trips, group departures, and more.",
    href: "/packages",
    icon: Compass,
    accent: "from-primary to-[oklch(0.62_0.21_30)]",
    stat: "6 categories",
  },
  {
    title: "Destination showcase",
    description: "Explore premium destination cards with photos, price cues, and season tips.",
    href: "/destinations",
    icon: MapPinned,
    accent: "from-sky-500 to-cyan-500",
    stat: "Curated cards",
  },
  {
    title: "Best sellers",
    description: "See the most loved journeys and signature itineraries from our travelers.",
    href: "/best-seller",
    icon: Sparkles,
    accent: "from-gold to-amber-400",
    stat: "Top itineraries",
  },
  {
    title: "Plan a trip",
    description: "Send your dates and preferences to get a tailored quote from the team.",
    href: "/contact/page",
    icon: Users2,
    accent: "from-emerald-500 to-teal-500",
    stat: "Quick response",
  },
];

export const Route = createFileRoute("/options")({
  head: () => ({
    meta: [
      { title: "Explore Options — Earnfree Travel & Explore" },
      {
        name: "description",
        content: "Choose a travel path: categories, destinations, best sellers, or request a custom plan.",
      },
    ],
  }),
  component: OptionsPage,
});

function OptionsPage() {
  const featuredImages = [
    packages.find((pkg) => pkg.destination === "Bali")?.image,
    packages.find((pkg) => pkg.destination === "Dubai")?.image,
    packages.find((pkg) => pkg.destination === "Kashmir")?.image,
  ].filter(Boolean) as string[];

  return (
    <SectionPageLayout>
      <section className="section bg-background relative overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

        <div className="container mx-auto px-6 lg:px-10 relative">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="eyebrow">Explore</span>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl">
                Travel <span className="italic font-light text-gradient-primary">options</span> made simple
              </h1>
              <div className="divider-gold mt-6" />
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Pick the route that fits your trip. Each option below matches the visual language of the site with premium cards, soft shadows, and clear next steps.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Trips</div>
                  <div className="mt-2 text-3xl font-display font-bold text-charcoal">{packages.length}</div>
                </div>
                <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Styles</div>
                  <div className="mt-2 text-3xl font-display font-bold text-charcoal">6</div>
                </div>
                <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Support</div>
                  <div className="mt-2 text-3xl font-display font-bold text-charcoal">24/7</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {featuredImages.map((image, index) => (
                <div
                  key={image}
                  className={`overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(0,0,0,0.08)] ${index === 1 ? "lg:translate-x-8" : ""}`}
                >
                  <img src={image} alt="Featured travel destination" className="h-56 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {options.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.title}
                  className="group overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant"
                >
                  <div className={`h-2 bg-gradient-to-r ${option.accent}`} />
                  <div className="space-y-5 p-6">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${option.accent} text-white shadow-elegant`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{option.stat}</div>
                      <h2 className="mt-2 text-2xl font-bold text-charcoal">{option.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{option.description}</p>
                    </div>
                    <Link
                      to={option.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1"
                    >
                      Open page
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
              <SectionHeader
                eyebrow="Featured"
                title="Popular"
                highlight="categories"
                description="A quick starting point for travelers who want to jump directly into the right section."
                align="left"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Family tours",
                  "Honeymoon escapes",
                  "Adventure trips",
                  "Group departures",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-border bg-background px-4 py-4 text-sm font-medium text-charcoal shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-3 text-sm font-semibold text-charcoal">
                <CalendarDays className="h-4 w-4 text-primary" />
                Need help choosing?
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Share your dates and destination preferences. We’ll help you move from browsing to booking without adding friction.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/contact/page"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] px-5 py-3 text-sm font-semibold text-white shadow-elegant"
                >
                  Contact us
                </Link>
                <Link
                  to="/destinations"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-charcoal"
                >
                  View destinations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SectionPageLayout>
  );
}
