"use client";

import React, { useState } from "react";
import SpatialHoloCarousel from "@/components/SpatialHoloCarousel";
import ShutterSlider, {
  type ShutterSlide,
} from "@/components/podie/tween-ui--shutter-slider/author/1/shutter-slider";
import { ExternalLink, Terminal, Sparkles, Orbit, Sliders } from "lucide-react";

const TECH_SLIDES: ShutterSlide[] = [
  {
    heading: "AlphaTech",
    image: "/media/tech-showcase/alphatech_poster.webp",
    imageAlt: "AlphaTech Nutrition Storefront",
    description:
      "A high-converting sports nutrition storefront built for AlphaTech Nutrition. Features a dynamic hero showcase, full supplement catalog with flavor and size filters, dedicated distributor onboarding portal, and one-tap WhatsApp checkout.",
    caption: "E-Commerce Platform • Next.js & TypeScript",
  },
  {
    heading: "FertiSure",
    image: "/media/tech-showcase/fertisure_poster.webp",
    imageAlt: "FertiSure MedTech Platform",
    description:
      "A precision medical technology web platform engineered for Hemant Surgical Industries Limited to present next-generation IVF and embryology lab systems across 30+ countries with fluid catalog exploration and instant quote workflows.",
    caption: "MedTech Platform • Global Healthcare",
  },
  {
    heading: "NoNudes",
    image: "/media/tech-showcase/nonudes_poster.webp",
    imageAlt: "NoNudes Streetwear Flagship",
    description:
      "An unapologetic dark-mode streetwear flagship built around bold editorial attitude. Combines signature split-flap brand intro, kinetic oversized typography, and a frictionless obsidian shopping experience.",
    caption: "Streetwear Flagship • Kinetic Motion",
  },
];

const PROJECT_META = [
  {
    name: "AlphaTech",
    category: "High-Performance E-Commerce",
    tech: ["Next.js 16", "TypeScript", "Tailwind CSS", "WhatsApp API"],
    video: "/media/tech-showcase/alphatech_landscape_1920x1080.mp4",
  },
  {
    name: "FertiSure",
    category: "Precision MedTech Platform",
    tech: ["Next.js", "React 19", "Motion UI", "Custom CMS"],
    video: "/media/tech-showcase/fertisure_landscape_1920x1080.mp4",
  },
  {
    name: "NoNudes",
    category: "Editorial Streetwear Flagship",
    tech: ["Next.js", "Kinetic Motion", "Tailwind CSS", "E-Commerce"],
    video: "/media/tech-showcase/nonudes_landscape_1920x1080.mp4",
  },
];

export function TechWorkShowcase() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"spatial" | "shutter">("spatial");

  // Close modal on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveVideo(null);
      }
    };
    if (activeVideo) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [activeVideo]);

  return (
    <section
      id="tech-work"
      className="dark relative w-full bg-[#070709] text-[#f4f1ea] border-t border-white/5 pt-20 pb-28 overflow-hidden select-none"
      aria-label="Engineering and Tech Work"
    >
      {/* Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-30"
      >
        <div className="absolute top-1/4 -left-40 h-[650px] w-[650px] rounded-full bg-cyan-600/15 blur-[160px]" />
        <div className="absolute bottom-1/4 -right-40 h-[650px] w-[650px] rounded-full bg-amber-500/10 blur-[160px]" />
      </div>

      {/* Main Full-Bleed Content Wrapper */}
      <div className="relative w-full px-6 md:px-14 lg:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-widest uppercase text-neutral-300 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Production Engineering & Systems
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium tracking-tight text-white font-sans">
              Tech Work & Systems
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* View Mode Switcher Pill */}
            <div className="inline-flex items-center p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("spatial")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  viewMode === "spatial"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Orbit className="h-3.5 w-3.5" />
                <span>3D SPATIAL DECK</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("shutter")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  viewMode === "shutter"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10 font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>SHUTTER SLIDER</span>
              </button>
            </div>

            <p className="max-w-xs text-xs leading-relaxed text-neutral-400 font-sans hidden lg:block">
              Explore our real-time 3D spatial project gallery or view the kinetic shutter architecture.
            </p>
          </div>
        </div>

        {/* View Mode 1: 3D Spatial Holographic Carousel - Unboxed Edge-to-Edge */}
        <div className={`mt-8 w-full ${viewMode === "spatial" ? "block" : "hidden"}`}>
          <SpatialHoloCarousel onOpenReel={setActiveVideo} />
        </div>

        {/* View Mode 2: PODIE Tween-UI Shutter Slider Component - Unboxed */}
        <div className={`mt-8 w-full ${viewMode === "shutter" ? "block" : "hidden"}`}>
          <ShutterSlider
            slides={TECH_SLIDES}
            autoplay={7}
            className="dark bg-transparent text-[#f4f1ea] py-14 md:py-20"
          />
        </div>

        {/* Project Technical Architecture Badges - Full Bleed Edge-to-Edge */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROJECT_META.map((item) => (
              <div
                key={item.name}
                className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-semibold text-white tracking-wide">
                        {item.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveVideo(item.video)}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-mono tracking-wider cursor-pointer group-hover:translate-x-0.5 duration-200"
                    >
                      <span>PLAY REEL</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    {item.category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-neutral-400 border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Reel Modal */}
        {activeVideo && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            onClick={() => setActiveVideo(null)}
          >
            <div
              className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#111115] border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs font-mono tracking-wider text-neutral-300">
                      PROJECT VIDEO REEL
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 ml-2">
                    {PROJECT_META.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setActiveVideo(p.video)}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${activeVideo === p.video
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                            : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                          }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="px-2.5 py-1 text-xs font-mono text-neutral-300 hover:text-white bg-white/10 hover:bg-white/20 rounded cursor-pointer transition-colors"
                >
                  CLOSE [ESC]
                </button>
              </div>
              <div className="relative aspect-video w-full bg-black">
                <video
                  src={activeVideo}
                  autoPlay
                  controls
                  playsInline
                  className="size-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
    </section>
  );
}

export default TechWorkShowcase;
