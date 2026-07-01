import { SectionPageLayout } from "@/components/site/SectionPageLayout";

export default function AboutDisabled() {
  return (
    <SectionPageLayout>
      <div className="prose mx-auto py-12 text-center">
        <h1>About (Disabled)</h1>
        <p>This About page has been removed from the main site.</p>
        <p>
          Use the navbar link for reference; the full About page was moved to
          <code>src/disabled-routes/about.tsx</code> for safekeeping.
        </p>
        <a href="/" className="text-primary underline">
          Return home
        </a>
      </div>
    </SectionPageLayout>
  );
}
