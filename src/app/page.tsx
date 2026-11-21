import HeroScrollZoom from "@/components/HeroScrollZoom";
import { OurWorkHero } from "@/components/OurWorkHero";
import TechWorkSectionLazy from "@/components/TechWorkSectionLazy";

export default function Home() {
  return (
    <main className="relative w-full bg-white selection:bg-sky-200">
      {/* Stage 0: Cloud Sky & Letter 'G' Zoom Transition */}
      <HeroScrollZoom />

      {/* Section 1: OUR WORK — 3D Spiral Ribbon & Final Grid Showcase */}
      <div className="relative z-10 -mt-[100vh]">
        <OurWorkHero />
      </div>

      {/* Section 2: Tech Work Reel powered by PODIE Shutter Slider */}
      <TechWorkSectionLazy />
    </main>
  );
}
