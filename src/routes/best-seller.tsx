import { createFileRoute } from "@tanstack/react-router";
import { SectionPageLayout } from "@/components/site/SectionPageLayout";
import { PopularPackages } from "@/components/site/PopularPackages";

export const Route = createFileRoute("/best-seller")({
  head: () => ({
    meta: [
      { title: "Best Seller Trips — Earnfree Travel & Explore" },
      {
        name: "description",
        content:
          "See the most loved journeys and signature itineraries from Earnfree Travel & Explore.",
      },
    ],
  }),
  component: BestSellerPage,
});

function BestSellerPage() {
  return (
    <SectionPageLayout>
      <PopularPackages />
    </SectionPageLayout>
  );
}