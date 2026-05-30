import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Highlights } from "@/components/site/Highlights";
import { MostDemanded } from "@/components/site/MostDemanded";

import { PopularPackages } from "@/components/site/PopularPackages";
import { About } from "@/components/site/About";
import { Categories } from "@/components/site/Categories";
import { Enquiry } from "@/components/site/Enquiry";
import { Gallery } from "@/components/site/Gallery";
import { Testimonials } from "@/components/site/Testimonials";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Earnfree Travel & Explore — Best Domestic & International Tour Packages" },
      {
        name: "description",
        content:
          "Curated holiday packages, group tours, honeymoon getaways and adventure trips. Book Nepal, Bali, Dubai, Thailand, Kashmir & more with Earnfree.",
      },
      { property: "og:title", content: "Earnfree Travel & Explore" },
      {
        property: "og:description",
        content: "Explore the world. Create memories. Premium travel packages curated for you.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <Hero />
        <Highlights />
        <MostDemanded />
        <PopularPackages />

        <About />
        <Categories />
        <Enquiry />
        <Gallery />
        <Testimonials />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
