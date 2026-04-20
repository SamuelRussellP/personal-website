import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { ExperiencePageClient } from "@/components/experience/page-client";

export const metadata: Metadata = {
  title: "Experience - Samuel Russell Prajasantosa",
  description:
    "A cinematic, lightweight interactive route built with scroll choreography, pointer response, and a restrained Three.js scene.",
  openGraph: {
    title: "Experience - Samuel Russell Prajasantosa",
    description:
      "A cinematic, lightweight interactive route built with scroll choreography, pointer response, and a restrained Three.js scene.",
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
