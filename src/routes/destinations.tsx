import { createFileRoute } from "@tanstack/react-router";
import { SectionPageLayout } from "@/components/site/SectionPageLayout";
import { DestinationsShowcase } from "@/components/site/DestinationsShowcase";

export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { title: "Destinations — Earnfree Travel & Explore" },
      {
        name: "description",
        content:
          "Explore premium destination cards with curated photos, trip details, and starting prices.",
      },
    ],
  }),
  component: DestinationsPage,
});

function DestinationsPage() {
  return (
    <SectionPageLayout>
      <DestinationsShowcase />
    </SectionPageLayout>
  );
}