import HeroScrollZoom from "@/components/HeroScrollZoom";
import { OurWorkHero } from "@/components/OurWorkHero";
import TechWorkSectionLazy from "@/components/TechWorkSectionLazy";

export default function Home() {
  return (
    <main className="relative w-full bg-white selection:bg-sky-200">
      {/* Stage 0: Cloud Sky & Letter 'G' Zoom Transition */}
      <HeroScrollZoom />

      {/* Section 1: OUR WORK — 3D Spiral Ribbon & Final Grid Showcase */}
      <div id="our-work" className="relative z-10 -mt-[100vh]">
        <OurWorkHero />
      </div>

      {/* Section 2: Tech Work Reel powered by PODIE Shutter Slider */}
      <TechWorkSectionLazy />

      {/* Section 3: Contact & Collaboration */}
      <footer
        id="contact"
        className="relative z-20 w-full bg-[#050507] text-white border-t border-white/10 px-6 py-20 pb-32 md:px-12"
      >
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-widest uppercase text-neutral-300 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Available for Q1/Q2 Projects
            </div>
            <h3 className="text-3xl md:text-5xl font-medium tracking-tight">
              Let&apos;s build something iconic.
            </h3>
            <p className="mt-2 text-sm text-neutral-400 max-w-md">
              Creative production, motion design, and high-performance digital web platforms.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a
              href="mailto:hello@progency.studio"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
            >
              Start a Project
            </a>
            <a
              href="#hero"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
            >
              Back to Top ↑
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-mono">
          <span>© 2026 PROGENCY. All rights reserved.</span>
          <span>Tokyo • New York • Worldwide</span>
        </div>
      </footer>
    </main>
  );
}
