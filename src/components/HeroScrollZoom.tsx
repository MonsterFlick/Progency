"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import CloudSky from "@/components/CloudSky";
import SmokyText from "@/components/SmokyText";
import { Meteors } from "@/components/ui/meteors";
import { FlowField } from "@/components/ui/flow-field";
import { IntroLoader } from "@/components/IntroLoader";
import { InkBackground } from "@/components/ui/ink-background";
import { Sparkles, Wind } from "lucide-react";

// Hoisted constant props so React.memo prevents wasted re-renders
const CLOUDS_CONFIG = { softness: 170, shadow: 60, cirrus: 50 };
const SUN_CONFIG = { x: 75, y: 90, glow: "rgba(255, 255, 255, 0.95)" };
const POINTER_CONFIG = { wind: 240, damping: 45, parallax: 260 };
const HERO_FONT: React.CSSProperties = {
  fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif",
  fontWeight: 800,
  fontSize: "clamp(3.5rem, 13vw, 10rem)",
  letterSpacing: "0.16em",
  textAlign: "center",
  textTransform: "uppercase",
};

export default function HeroScrollZoom() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyViewportRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const meteorsRef = useRef<HTMLDivElement>(null);
  const lightBurstRef = useRef<HTMLDivElement>(null);
  const solidWhiteRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // Intro completion and auto-scroll tracking
  const [introDone, setIntroDone] = useState(false);
  const [skyPaused, setSkyPaused] = useState(false);
  const skyPausedRef = useRef(false);
  const [inkPaused, setInkPaused] = useState(false);
  const inkPausedRef = useRef(false);
  const [heroEffect, setHeroEffect] = useState<"meteors" | "wind">("meteors");

  // Exact coordinates of the letter 'G' in unscaled screen coordinates
  const gPosRef = useRef<{ x: number; y: number } | null>(null);
  const cachedScrollableRef = useRef(1);

  const measureG = useCallback(() => {
    const gEl = document.getElementById("hero-letter-g");
    if (!gEl) return;

    const rect = gEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      gPosRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.52,
      };
    }
  }, []);

  const updateCachedMetrics = useCallback(() => {
    measureG();
    if (trackRef.current) {
      const vh = window.innerHeight || 800;
      cachedScrollableRef.current = Math.max(1, trackRef.current.offsetHeight - vh);
    }
  }, [measureG]);

  useEffect(() => {
    let rafId = requestAnimationFrame(updateCachedMetrics);

    if (document.fonts) {
      document.fonts.ready.then(() => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateCachedMetrics);
      });
    }

    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateCachedMetrics);
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [updateCachedMetrics]);

  // High-performance 120fps direct-DOM scroll update (zero layout thrashing, zero reflows)
  const applyScrollTransform = useCallback(() => {
    const totalScrollable = cachedScrollableRef.current;
    const scrolled = window.scrollY;
    const p = Math.max(0, Math.min(1, scrolled / totalScrollable));

    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const centerX = vpW / 2;
    const centerY = vpH / 2;
    const targetGx = gPosRef.current?.x ?? (centerX - vpW * 0.038);
    const targetGy = gPosRef.current?.y ?? centerY;

    const zoomP = Math.min(1, p / 0.85);
    const scale = 1 + Math.pow(zoomP, 2.35) * 86;
    const panProgress = Math.pow(zoomP, 0.85);
    const translateX = (centerX - targetGx) * panProgress;
    const translateY = (centerY - targetGy) * panProgress;

    const skyOpacity = Math.max(0, 1 - Math.pow(p / 0.72, 2.4));
    const lightBurstOpacity = Math.max(0, Math.min(1, (p - 0.36) / 0.3));
    const solidWhiteOpacity = Math.max(0, Math.min(1, (p - 0.52) / 0.22));
    const stageFadeOut = Math.max(0, Math.min(1, 1 - (p - 0.76) / 0.22));
    const hintOpacity = Math.max(0, 1 - p * 9);

    // Direct GPU transform update with zero filter compositing overhead
    if (zoomContainerRef.current) {
      zoomContainerRef.current.style.transformOrigin = `${targetGx.toFixed(1)}px ${targetGy.toFixed(1)}px`;
      zoomContainerRef.current.style.transform = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
    }

    if (skyRef.current) {
      skyRef.current.style.opacity = `${skyOpacity.toFixed(3)}`;
    }
    if (mistRef.current) {
      mistRef.current.style.opacity = `${skyOpacity.toFixed(3)}`;
    }
    if (meteorsRef.current) {
      meteorsRef.current.style.opacity = `${skyOpacity.toFixed(3)}`;
    }
    if (lightBurstRef.current) {
      lightBurstRef.current.style.opacity = `${lightBurstOpacity.toFixed(3)}`;
    }
    if (solidWhiteRef.current) {
      solidWhiteRef.current.style.opacity = `${solidWhiteOpacity.toFixed(3)}`;
    }
    if (stickyViewportRef.current) {
      stickyViewportRef.current.style.opacity = `${stageFadeOut.toFixed(3)}`;
      stickyViewportRef.current.style.visibility = stageFadeOut <= 0.005 ? "hidden" : "visible";
    }
    if (hintRef.current) {
      hintRef.current.style.opacity = `${hintOpacity.toFixed(3)}`;
      hintRef.current.style.display = hintOpacity <= 0.01 ? "none" : "flex";
    }

    // Only update state when transition boundary crosses (eliminates 120fps React re-render churn)
    const shouldPauseSky = stageFadeOut <= 0.01 || skyOpacity <= 0.01;
    if (shouldPauseSky !== skyPausedRef.current) {
      skyPausedRef.current = shouldPauseSky;
      setSkyPaused(shouldPauseSky);
    }

    const shouldPauseInk = p > 0.08;
    if (shouldPauseInk !== inkPausedRef.current) {
      inkPausedRef.current = shouldPauseInk;
      setInkPaused(shouldPauseInk);
    }
  }, []);

  // Passive RAF-synced scroll listener
  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      rafId = 0;
      applyScrollTransform();
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    applyScrollTransform();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [applyScrollTransform]);

  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
    updateCachedMetrics();
  }, [updateCachedMetrics]);

  return (
    <>
      {/* Multilingual Intro Welcome Sequence */}
      <IntroLoader onComplete={handleIntroComplete} />

      <div
        ref={trackRef}
        className="relative z-30 w-full h-[220vh] pointer-events-none"
      >
        {/* Sticky Fullscreen Intro Viewport */}
        <div
          ref={stickyViewportRef}
          className="sticky top-0 h-screen w-full overflow-hidden bg-[#076bdc] will-change-[transform,opacity]"
        >
          {/* Interactive WebGL Cloud Sky Background */}
          <div
            ref={skyRef}
            className="absolute inset-0 z-0 transition-opacity duration-75"
            style={{ opacity: 1 }}
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
              paused={skyPaused}
            />
          </div>

          {/* Atmospheric Cloud Mist Halo */}
          <div
            ref={mistRef}
            className="absolute inset-0 z-[5] pointer-events-none flex items-center justify-center transition-opacity duration-75"
            style={{ opacity: 1 }}
          >
            <div
              className="w-[85vw] max-w-5xl h-64 rounded-full blur-3xl opacity-70"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.25) 0%, rgba(195, 230, 255, 0.12) 45%, transparent 75%)",
              }}
            />
          </div>

          {/* Background Ambient Effect — Meteors or Wind FlowField */}
          <div
            ref={meteorsRef}
            className="absolute inset-0 z-[6] pointer-events-none transition-opacity duration-75 overflow-hidden text-sky-200/80"
            style={{ opacity: 1 }}
          >
            {heroEffect === "meteors" ? (
              <Meteors
                number={20}
                color="#E0F2FE"
                trailColor="#38BDF8"
                tailLength={65}
                angle={215}
                minDelay={0.3}
                maxDelay={1.5}
                minDuration={3}
                maxDuration={7}
              />
            ) : (
              <FlowField
                density={0.65}
                speed={1.0}
                interactive={true}
                className="text-sky-200/80"
              />
            )}
          </div>

          {/* Top-Right Ambient Effect Toggle Button */}
          <div className="absolute top-6 right-6 z-30 pointer-events-auto flex items-center">
            <button
              type="button"
              onClick={() => setHeroEffect((prev) => (prev === "meteors" ? "wind" : "meteors"))}
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 hover:bg-black/50 border border-white/20 hover:border-white/40 text-white text-xs font-medium backdrop-blur-md transition-all shadow-lg active:scale-95 cursor-pointer"
              aria-label={`Toggle background effect (currently ${heroEffect})`}
            >
              {heroEffect === "meteors" ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-sky-300 transition-transform group-hover:rotate-12" />
                  <span>Meteors</span>
                </>
              ) : (
                <>
                  <Wind className="w-3.5 h-3.5 text-sky-300 transition-transform group-hover:translate-x-0.5" />
                  <span>Wind</span>
                </>
              )}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/75 group-hover:bg-white/20 transition-colors">
                {heroEffect === "meteors" ? "Switch to Wind" : "Switch to Meteors"}
              </span>
            </button>
          </div>

          {/* Hero Text Zoom Container - Hardware accelerated, zooms directly into 'G' with 0 lag */}
          <div
            ref={zoomContainerRef}
            suppressHydrationWarning
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none [contain:layout_style_paint] [will-change:transform]"
            style={{
              transformOrigin: "center center",
              transform: "translate3d(0px, 0px, 0) scale(1)",
            }}
          >
            <div className="relative w-full max-w-7xl h-[34vh] min-h-[190px] max-h-[320px] px-4 flex items-center justify-center pointer-events-auto cursor-pointer">
              {/* Fluid Ink Simulation Canvas (Mouse interactive fluid stir, curl, and gather) */}
              <div className="absolute inset-0 pointer-events-auto z-10">
                <InkBackground
                  text="PROGENCY"
                  transparentPaper={true}
                  paused={inkPaused}
                  accent="#7DD3FC"
                  fontFamily="var(--font-geist-sans), Inter, system-ui, sans-serif"
                  fontWeight={800}
                  letterSpacing="0.16em"
                  textTransform="uppercase"
                  className="w-full h-full min-h-0"
                />
              </div>

              {/* Exact Original PROGENCY Text with Letter 'G' Zoom Target */}
              <div className="relative z-20 pointer-events-none w-full flex items-center justify-center">
                <SmokyText
                  text="PROGENCY"
                  color="#FFFFFF"
                  intensity={12}
                  position="bottomLeft"
                  animationMode="singleLine"
                  appearTrigger={introDone ? "default" : "default"}
                  forceVisible={true}
                  font={HERO_FONT}
                />
              </div>
            </div>
          </div>

          {/* Radiant White Light Burst Blooming Inside 'G' */}
          <div
            ref={lightBurstRef}
            className="absolute inset-0 z-25 pointer-events-none"
            style={{
              opacity: 0,
              background:
                "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 35%, rgba(255, 255, 255, 0.4) 65%, transparent 100%)",
            }}
          />

          {/* Pure Solid White Transition Screen */}
          <div
            ref={solidWhiteRef}
            className="absolute inset-0 z-30 pointer-events-none bg-white"
            style={{ opacity: 0 }}
          />

          {/* Gentle Scroll Hint */}
          <div
            ref={hintRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-300"
            style={{ opacity: 1 }}
          >
            <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-white/80 drop-shadow-sm">
              Scroll to explore
            </span>
            <div className="w-5 h-8 rounded-full border border-white/40 flex items-start justify-center p-1 shadow-sm">
              <div className="w-1 h-2 rounded-full bg-white animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
