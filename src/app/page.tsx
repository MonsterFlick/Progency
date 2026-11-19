import HeroScrollZoom from "@/components/HeroScrollZoom";
import { OurWorkHero } from "@/components/OurWorkHero";
import { WorkShowcaseScroller } from "@/components/WorkShowcaseScroller";
import TechWorkSectionLazy from "@/components/TechWorkSectionLazy";

export default function Home() {
  return (
    <main className="relative w-full bg-white selection:bg-sky-200">
      {/* Stage 0: Cloud Sky & Letter 'G' Zoom Transition */}
      <HeroScrollZoom />

      {/* Section 1: OUR WORK — 15 Pure Vertical Editorial Cards (overlaps final white bloom cleanly) */}
      <div className="relative z-10 -mt-[100vh]">
        <OurWorkHero />
      </div>

      {/* Section 2: Apple-Style Floating Rounded Cinema Showcase */}
      <WorkShowcaseScroller />

      {/* Section 3: Fullscreen Horizontal 3D Tech Work Reel (dynamically code-split) */}
      <TechWorkSectionLazy />
    </main>
  );
}
