import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { HydraIntro } from "@/components/hydra/intro";
import { HydraHero } from "@/components/hydra/hero";
import { HydraProblemSolution } from "@/components/hydra/problem-solution";
import { HydraHeads } from "@/components/hydra/heads";
import { HydraFlow } from "@/components/hydra/flow";
import { HydraPrinciples } from "@/components/hydra/principles";
import { HydraStack } from "@/components/hydra/stack";
import { HydraFooter } from "@/components/hydra/footer";
import { hydra } from "@/lib/data";

export const metadata: Metadata = {
  title: "Hydra — QA Validation Agent · Samuel Russell Prajasantosa",
  description: hydra.tagline,
  openGraph: {
    title: "Hydra — QA Validation Agent",
    description: hydra.tagline,
    type: "article",
  },
};

export default function HydraPage() {
  return (
    <>
      <HydraIntro />
      <Nav />
      <main id="main" className="flex-1">
        <HydraHero />
        <HydraProblemSolution />
        <HydraHeads />
        <HydraFlow />
        <HydraPrinciples />
        <HydraStack />
        <HydraFooter />
      </main>
    </>
  );
}
