"use client";

import React, { useState } from "react";
import ShutterSlider, {
  type ShutterSlide,
} from "@/components/podie/tween-ui--shutter-slider/author/1/shutter-slider";
import { ExternalLink, Terminal } from "lucide-react";

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
    tech: ["Next.js 16", "TypeScript", "Tailwind CSS", "WhatsApp API"],
    video: "/media/tech-showcase/alphatech_landscape_1920x1080.mp4",
  },
  {
    name: "FertiSure",
    tech: ["Next.js", "React 19", "Motion UI", "Custom CMS"],
    video: "/media/tech-showcase/fertisure_landscape_1920x1080.mp4",
  },
  {
    name: "NoNudes",
    tech: ["Next.js", "Kinetic Motion", "Tailwind CSS", "E-Commerce"],
    video: "/media/tech-showcase/nonudes_landscape_1920x1080.mp4",
  },
];

export function TechWorkShowcase() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section
      id="tech-work"
      className="dark relative w-full bg-[#070709] text-[#f4f1ea] border-t border-white/5 pt-20 pb-28 overflow-hidden select-none"
      aria-label="Engineering and Tech Work"
    >
      {/* Background ambient radial gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-40"
      >
        <div className="absolute top-1/4 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-600/15 blur-[140px]" />
        <div className="absolute bottom-1/4 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-widest uppercase text-neutral-300 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Interactive Shutter Architecture
            </div>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white font-sans">
              Tech Work & Systems
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-neutral-400 font-sans">
            Production-grade web platforms, scalable storefronts, and bespoke
            digital infrastructure engineered for speed, conversion, and motion.
          </p>
        </div>

        {/* PODIE Tween-UI Shutter Slider Component */}
        <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d11]/80 backdrop-blur-sm shadow-2xl">
          <ShutterSlider
            slides={TECH_SLIDES}
            autoplay={7}
            className="dark bg-transparent text-[#f4f1ea] py-14 md:py-20"
          />
        </div>

        {/* Project Technical Architecture Badges */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROJECT_META.map((item) => (
            <div
              key={item.name}
              className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm font-semibold text-white tracking-wide">
                      {item.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveVideo(item.video)}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-mono tracking-wider cursor-pointer"
                  >
                    <span>PLAY REEL</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
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
            <div className="flex items-center justify-between px-4 py-3 bg-[#111115] border-b border-white/10">
              <span className="text-xs font-mono tracking-wider text-neutral-400">
                PROJECT VIDEO REEL PREVIEW
              </span>
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
