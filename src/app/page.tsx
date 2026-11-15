import HeroScrollZoom from "@/components/HeroScrollZoom";
import PerAppelgrenPortfolio from "@/components/portfolio/PerAppelgrenPortfolio";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-white selection:bg-[#0F1118] selection:text-white">
      {/* 1. Hero Zoom Track: Clouds + Smoky 'PROGENCY' -> Plunges inside 'G' -> Flawless White Screen */}
      <HeroScrollZoom />

      {/* 2. Per Appelgren Editorial Portfolio Experience */}
      <section id="portfolio-experience" className="relative z-30 w-full bg-[#FAFAF8]">
        <PerAppelgrenPortfolio />
      </section>
    </main>
  );
}
