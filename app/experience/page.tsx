import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ExperiencePageClient } from "@/components/experience/page-client";

export const metadata: Metadata = {
  title: "Experience — Samuel Russell Prajasantosa",
  description:
    "A career in four chapters. Jakarta-born, Malaysia-trained, now leading QA remote from Berlin. Scroll-driven, cinematic.",
  openGraph: {
    title: "Experience — Samuel Russell Prajasantosa",
    description:
      "A career in four chapters. Jakarta-born, Malaysia-trained, now leading QA remote from Berlin.",
    type: "website",
    url: "/experience",
  },
};

export default function ExperiencePage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1">
        <ExperiencePageClient />
      </main>
    </>
  );
}
