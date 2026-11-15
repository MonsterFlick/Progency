import HeroScrollZoom from "@/components/HeroScrollZoom";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-white selection:bg-sky-200">
      {/* Hero Zoom Track into Letter 'G' -> Transitions to White Screen */}
      <HeroScrollZoom />

      {/* Solid White Canvas Section (Ready for your next instructions) */}
      <section
        id="next-section"
        className="relative z-30 min-h-screen w-full bg-white flex flex-col items-center justify-center px-6 py-24 text-slate-900"
      >
        {/* White canvas container ready for your next components & sections */}
      </section>
    </main>
  );
}
