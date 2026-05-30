import { createFileRoute } from "@tanstack/react-router";
import { SectionPageLayout } from "@/components/site/SectionPageLayout";
import { Categories } from "@/components/site/Categories";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Travel Categories — Earnfree Travel & Explore" },
      {
        name: "description",
        content: "Explore travel categories such as family tours, honeymoon escapes, adventure trips, and more.",
      },
    ],
  }),
  component: PackagesPage,
});

function PackagesPage() {
  return (
    <SectionPageLayout>
      <Categories />
    </SectionPageLayout>
  );
}