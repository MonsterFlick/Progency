"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PerspectiveCarousel,
  type PerspectiveCarouselItem,
} from "@/components/ui/perspective-carousel";
import { X } from "lucide-react";

const VERTICAL_ITEMS: PerspectiveCarouselItem[] = [
  {
    src: "/assets/images/video_posters/shortform_poster_2.jpg",
    title: "KINETIC ARTICLE REEL 02",
    category: "TYPOGRAPHY & MOTION",
    video: "/assets/videos/shortform_podcast_hook_2.mp4",
    alt: "Podcast Kinetic Reel 02",
  },
  {
    src: "/assets/images/video_posters/shortform_poster_3.jpg",
    title: "SOUND DESIGN HOOK 03",
    category: "SHORT FORM VIDEO",
    video: "/assets/videos/shortform_podcast_hook_3.mp4",
    alt: "Podcast Sound Design 03",
  },
  {
    src: "/assets/images/video_posters/motivational_speech_portrait.jpg",
    title: "MOTIVATIONAL CINEMATIC REEL",
    category: "EDITORIAL REEL",
    video: "/assets/videos/motivational_speech.mp4",
    alt: "Motivational Speech Reel",
  },
  {
    src: "/assets/images/video_posters/posh_video_portrait.jpg",
    title: "POSH KINETIC SHOWCASE",
    category: "BRAND MOTION",
    video: "/assets/videos/posh_video.mp4",
    alt: "Posh Kinetic Showcase",
  },
  {
    src: "/assets/images/video_posters/ezsnippet_portrait.jpg",
    title: "DEV COMMENTARY REEL",
    category: "TECH COMMENTARY",
    video: "/assets/videos/ezsnippet.mp4",
    alt: "Developer Commentary Reel",
  },
  {
    src: "/assets/images/thumbnails/the_exorcist.png",
    title: "THE EXORCIST POSTER",
    category: "EDITORIAL POSTER",
    alt: "The Exorcist Editorial Poster",
  },
  {
    src: "/assets/images/hero_portrait/hero_tile_01.webp",
    title: "CYBER SAMURAI EDITORIAL",
    category: "VISUAL IDENTITY",
    alt: "Cyber Samurai Editorial Portrait",
  },
  {
    src: "/assets/images/thumbnails/ivo.png",
    title: "IVO MINIMALIST POSTER",
    category: "EDITORIAL POSTER",
    alt: "IVO Minimalist Poster",
  },
  {
    src: "/assets/images/hero_portrait/hero_tile_07.webp",
    title: "HIGH-FASHION PORTRAIT",
    category: "CREATIVE DIRECTION",
    alt: "High-Fashion Editorial",
  },
  {
    src: "/assets/images/thumbnails/fall_in_love.png",
    title: "FALL IN LOVE MONTAGE",
    category: "EDITORIAL POSTER",
    alt: "Fall in Love Montage",
  },
  {
    src: "/assets/images/video_posters/shortform_poster_1.jpg",
    title: "PODCAST DYNAMIC HOOK 01",
    category: "SHORT FORM VIDEO",
    video: "/assets/videos/shortform_podcast_hook_1.mp4",
    alt: "Podcast Dynamic Hook 01",
  },
];

export function OurWorkVertical() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [continuousIndex, setContinuousIndex] = useState<number>(0);
  const [activeVideoModal, setActiveVideoModal] = useState<PerspectiveCarouselItem | null>(null);
  const [slideWidth, setSlideWidth] = useState<number>(290);

  // Responsive slide width for tall 9:16 proportions
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlideWidth(220);
      } else if (window.innerWidth < 1024) {
        setSlideWidth(260);
      } else {
        setSlideWidth(290);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll-driven animation tracking
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!trackRef.current) return;
          const rect = trackRef.current.getBoundingClientRect();
          const trackScrollable = rect.height - window.innerHeight;

          if (trackScrollable > 0) {
            // Distance scrolled past the top of the viewport
            const scrolled = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolled / trackScrollable));
            const targetIdx = progress * (VERTICAL_ITEMS.length - 1);
            setContinuousIndex(targetIdx);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveVideoModal(null);
      }
    };
    if (activeVideoModal) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [activeVideoModal]);

  const handleCardClick = (item: PerspectiveCarouselItem) => {
    if (item.video) {
      setActiveVideoModal(item);
    }
  };

  return (
    <div
      ref={trackRef}
      className="ourwork-v-track relative w-full h-[320vh] select-none"
      aria-label="Our Work - Vertical & Editorial Showcase"
    >
      <style>{`
        .ourwork-v-track {
          --bg: #0a0a0b;
          --ink: #f4f1ea;
          --mid: #8d8b86;
          --line: rgba(244, 241, 234, 0.14);
          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter Tight', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .v-sticky-stage {
          position: sticky;
          top: 0;
          height: 100vh;
          height: 100svh;
          overflow: hidden;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      {/* Sticky Fullscreen Stage */}
      <div className="v-sticky-stage">
        {/* 3D Perspective Carousel Stage with Continuous Scroll & Live Previews */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <PerspectiveCarousel
            items={VERTICAL_ITEMS}
            continuousIndex={continuousIndex}
            onItemClick={handleCardClick}
            loop={false}
            showControls={false}
            showDots={false}
            slideWidth={slideWidth}
            rotationStep={48}
            inactiveScale={0.82}
            className="w-full h-full"
            viewportClassName="py-0"
            slideClassName="cursor-pointer"
            imageClassName="rounded-2xl border border-[rgba(244,241,234,0.18)] shadow-[0_32px_80px_rgba(0,0,0,0.95)]"
            labelClassName="text-[#f4f1ea] font-mono text-xs tracking-wider uppercase mt-3 opacity-90"
          />
        </div>
      </div>

      {/* Fullscreen Vertical Video Reel Modal */}
      {activeVideoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4"
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-[rgba(244,241,234,0.25)] bg-[#0a0a0b] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#111113] border-b border-[rgba(244,241,234,0.12)]">
              <span className="text-xs font-mono tracking-wider text-[#f4f1ea] font-medium">
                {activeVideoModal.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 9:16 Video Player */}
            <div className="relative aspect-[9/16] w-full bg-black overflow-hidden flex items-center justify-center">
              <video
                src={activeVideoModal.video}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-[#111113] border-t border-[rgba(244,241,234,0.12)] flex items-center justify-between text-[11px] font-mono text-[var(--mid)]">
              <span>{activeVideoModal.category ?? "VERTICAL MEDIA"}</span>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                CLOSE [ESC]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OurWorkVertical;
