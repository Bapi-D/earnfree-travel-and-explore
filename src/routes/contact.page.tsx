import { createFileRoute } from "@tanstack/react-router";
import { SectionPageLayout } from "@/components/site/SectionPageLayout";
import { Enquiry } from "@/components/site/Enquiry";

export const Route = createFileRoute("/contact/page")({
  head: () => ({
    meta: [
      { title: "Contact — Earnfree Travel & Explore" },
      {
        name: "description",
        content:
          "Contact Earnfree Travel & Explore to request a quote or plan your next trip.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SectionPageLayout>
      <Enquiry />
    </SectionPageLayout>
  );
}