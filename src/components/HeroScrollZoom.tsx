"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import CloudSky from "@/components/CloudSky";
import SmokyText from "@/components/SmokyText";
import LineCursor from "@/components/LineCursor";

// Hoisted constant props so React.memo prevents wasted re-renders during scroll
const CLOUDS_CONFIG = { softness: 170, shadow: 60, cirrus: 50 };
const SUN_CONFIG = { x: 75, y: 90, glow: "rgba(255, 255, 255, 0.95)" };
const POINTER_CONFIG = { wind: 240, damping: 45, parallax: 260 };
const CURSOR_COLORS = ["#FFFFFF", "#7DD3FC", "#BAE6FD", "#E0F2FE", "#38BDF8"];
const HERO_FONT: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif",
  fontWeight: 800,
  fontSize: "clamp(3.5rem, 13vw, 10rem)",
  letterSpacing: "0.16em",
  textAlign: "center",
  textTransform: "uppercase",
  filter: "drop-shadow(0 14px 30px rgba(4, 45, 100, 0.22))",
};

export default function HeroScrollZoom() {
  const trackRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Exact coordinates of the letter 'G' in unscaled screen coordinates
  const [gPos, setGPos] = useState<{ x: number; y: number } | null>(null);

  const measureG = useCallback(() => {
    const gEl = document.getElementById("hero-letter-g");
    if (!gEl) return;

    const rect = gEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setGPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.52,
      });
    }
  }, []);

  useEffect(() => {
    let rafId = requestAnimationFrame(measureG);

    if (document.fonts) {
      document.fonts.ready.then(() => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(measureG);
      });
    }

    const onResize = () => {
      if (window.scrollY === 0) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(measureG);
      }
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [measureG]);

  // Passive 60fps scroll listener
  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      rafId = 0;
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / totalScrollable));

      setProgress((prev) => (Math.abs(prev - p) > 0.0005 ? p : prev));
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Direct DOM transform for the letter 'G' zoom (100% SSR/Client hydration-safe)
  useEffect(() => {
    if (!zoomContainerRef.current) return;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const centerX = vpW / 2;
    const centerY = vpH / 2;
    const targetGx = gPos?.x ? gPos.x : centerX - vpW * 0.038;
    const targetGy = gPos?.y ? gPos.y : centerY;
    const zoomP = Math.min(1, progress / 0.85);
    const scale = 1 + Math.pow(zoomP, 2.35) * 86;
    const panProgress = Math.pow(zoomP, 0.85);
    const translateX = (centerX - targetGx) * panProgress;
    const translateY = (centerY - targetGy) * panProgress;

    zoomContainerRef.current.style.transformOrigin = `${targetGx}px ${targetGy}px`;
    zoomContainerRef.current.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
  }, [progress, gPos]);

  // Stage opacities: Sky -> Radiant White Bloom -> Dissolve cleanly into Section 1 (OUR WORK)
  const skyOpacity = Math.max(0, 1 - Math.pow(progress / 0.72, 2.4));
  const cursorOpacity = Math.max(0, 1 - progress * 2.6);
  const lightBurstOpacity = Math.max(0, Math.min(1, (progress - 0.36) / 0.3));
  const solidWhiteOpacity = Math.max(0, Math.min(1, (progress - 0.52) / 0.22));
  const stageFadeOut = Math.max(0, Math.min(1, 1 - (progress - 0.76) / 0.22));
  const hintOpacity = Math.max(0, 1 - progress * 9);

  return (
    <div
      ref={trackRef}
      className="relative z-30 w-full h-[220vh] pointer-events-none"
    >
      {/* Sticky Fullscreen Intro Viewport */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#076bdc]"
        style={{
          opacity: stageFadeOut,
          visibility: stageFadeOut <= 0.005 ? "hidden" : "visible",
        }}
      >
        {/* Interactive WebGL Cloud Sky Background (pauses automatically when scrolled past) */}
        <div
          className="absolute inset-0 z-0 transition-opacity duration-150"
          style={{ opacity: skyOpacity }}
        >
          <CloudSky
            className="w-full h-full min-h-screen"
            background="#076bdc"
            baseColor="#c0deff"
            accentColor="#FFFFFF"
            density={75}
            speed={55}
            size={135}
            clouds={CLOUDS_CONFIG}
            sun={SUN_CONFIG}
            pointer={POINTER_CONFIG}
            paused={skyOpacity <= 0.01 || stageFadeOut <= 0.01}
          />
        </div>

        {/* Atmospheric Cloud Mist Halo */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none flex items-center justify-center transition-opacity duration-150"
          style={{ opacity: skyOpacity }}
        >
          <div
            className="w-[85vw] max-w-5xl h-64 rounded-full blur-3xl opacity-70"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.25) 0%, rgba(195, 230, 255, 0.12) 45%, transparent 75%)",
            }}
          />
        </div>

        {/* Hero Text Zoom Container - Scales and Zooms directly into the letter 'G' */}
        <div
          ref={zoomContainerRef}
          suppressHydrationWarning
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{
            transformOrigin: "center center",
            transform: "translate3d(0px, 0px, 0) scale(1)",
          }}
        >
          <div className="w-full px-4 flex items-center justify-center">
            <SmokyText
              text="PROGENCY"
              color="#FFFFFF"
              intensity={12}
              position="bottomLeft"
              animationMode="singleLine"
              appearTrigger="default"
              forceVisible={progress > 0.02}
              font={HERO_FONT}
            />
          </div>
        </div>

        {/* Interactive Silk Ribbon Trails Cursor Overlay */}
        <div
          className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-150"
          style={{ opacity: cursorOpacity }}
        >
          <LineCursor
            colors={CURSOR_COLORS}
            colorShift={1.5}
            opacity={45}
            thickness={1.8}
            trails={40}
            trailLength={24}
            label={false}
            paused={cursorOpacity <= 0.01 || stageFadeOut <= 0.01}
          />
        </div>

        {/* Radiant White Light Burst Blooming Inside 'G' */}
        <div
          className="absolute inset-0 z-25 pointer-events-none"
          style={{
            opacity: lightBurstOpacity,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 35%, rgba(255, 255, 255, 0.4) 65%, transparent 100%)",
          }}
        />

        {/* Pure Solid White Transition Screen */}
        <div
          className="absolute inset-0 z-30 pointer-events-none bg-white"
          style={{ opacity: solidWhiteOpacity }}
        />

        {/* Gentle Scroll Hint */}
        {hintOpacity > 0.02 && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-300"
            style={{ opacity: hintOpacity }}
          >
            <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-white/80 drop-shadow-sm">
              Scroll to explore
            </span>
            <div className="w-5 h-8 rounded-full border border-white/40 flex items-start justify-center p-1 shadow-sm">
              <div className="w-1 h-2 rounded-full bg-white animate-bounce" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
