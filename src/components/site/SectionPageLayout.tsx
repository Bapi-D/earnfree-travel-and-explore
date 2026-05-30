import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingActions } from "./FloatingActions";

type SectionPageLayoutProps = {
  children: ReactNode;
};

export function SectionPageLayout({ children }: SectionPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-12 sm:pt-16">{children}</main>
      <Footer />
      <FloatingActions />
    </div>
  );
}