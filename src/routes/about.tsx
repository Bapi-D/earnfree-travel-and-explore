import { createFileRoute } from "@tanstack/react-router";
import { SectionPageLayout } from "@/components/site/SectionPageLayout";
import { About } from "@/components/site/About";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Earnfree Travel & Explore" },
      {
        name: "description",
        content:
          "Learn about Earnfree Travel & Explore, our values, and the travel experience we create for every journey.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SectionPageLayout>
      <About />
    </SectionPageLayout>
  );
}