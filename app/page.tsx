import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Journey } from "@/components/journey";
import { Thesis } from "@/components/thesis";
import { SkillsBento } from "@/components/skills-bento";
import { Contact } from "@/components/contact";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1">
        <Hero />
        <Journey />
        <Thesis />
        <SkillsBento />
        <Contact />
      </main>
    </>
  );
}
