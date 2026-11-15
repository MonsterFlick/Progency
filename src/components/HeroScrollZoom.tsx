"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import CloudSky from "@/components/CloudSky";
import SmokyText from "@/components/SmokyText";
import LineCursor from "@/components/LineCursor";

export default function HeroScrollZoom() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Exact coordinates of the letter 'G' in unscaled screen coordinates
  const [gPos, setGPos] = useState<{ x: number; y: number } | null>(null);

  // Measure the unscaled screen position of the letter 'G'
  const measureG = useCallback(() => {
    // Only measure when at rest or near the top to capture exact unscaled layout coordinates
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

  // Measure on mount and on resize
  useEffect(() => {
    measureG();
    const t1 = setTimeout(measureG, 50);
    const t2 = setTimeout(measureG, 250);
    const t3 = setTimeout(measureG, 800);

    if (document.fonts) {
      document.fonts.ready.then(measureG);
    }

    const onResize = () => {
      if (window.scrollY === 0) {
        measureG();
      }
    };

    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", onResize);
    };
  }, [measureG]);

  // Scroll handler using requestAnimationFrame
  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / totalScrollable));

      setProgress((prev) => {
        if (Math.abs(prev - p) > 0.0003) {
          return p;
        }
        return prev;
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Viewport dimensions
  const vpW = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vpH = typeof window !== "undefined" ? window.innerHeight : 900;
  const centerX = vpW / 2;
  const centerY = vpH / 2;

  // Exact target position of letter 'G':
  // If not yet measured, 'G' in "PROGENCY" (8 letters) sits ~4% to the left of the screen center
  const targetGx = gPos?.x ?? centerX - vpW * 0.038;
  const targetGy = gPos?.y ?? centerY;

  // Smooth zoom scale accelerating straight into the letter 'G'
  // Starts at 1, reaches ~17 at p=0.5, and reaches ~90+ at p=1
  const scale = 1 + Math.pow(progress, 2.4) * 88;

  // Pan shift to glide the letter 'G' directly into the dead-center of the screen as it grows
  const panProgress = Math.pow(progress, 0.85);
  const translateX = (centerX - targetGx) * panProgress;
  const translateY = (centerY - targetGy) * panProgress;

  // Atmospheric opacities
  // Sky background fades out as we plunge inside the G
  const skyOpacity = Math.max(0, 1 - Math.pow(progress / 0.84, 2.5));

  // Cursor ribbon trails fade out on zoom
  const cursorOpacity = Math.max(0, 1 - progress * 2.2);

  // Radial white light burst blossoms from inside the G (progress 0.45 -> 0.85)
  const lightBurstOpacity = Math.max(0, Math.min(1, (progress - 0.45) / 0.38));

  // Pure solid white overlay reaches 100% by progress >= 0.92
  const solidWhiteOpacity = Math.max(0, Math.min(1, (progress - 0.68) / 0.24));

  // Scroll hint fades out immediately on first scroll
  const hintOpacity = Math.max(0, 1 - progress * 8);

  return (
    <div ref={trackRef} className="relative w-full h-[320vh] bg-white">
      {/* Sticky Fullscreen Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#076bdc]">
        {/* Interactive WebGL Cloud Sky Background */}
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
            clouds={{ softness: 170, shadow: 60, cirrus: 50 }}
            sun={{ x: 75, y: 90, glow: "rgba(255, 255, 255, 0.95)" }}
            pointer={{ wind: 240, damping: 45, parallax: 260 }}
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
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{
            transformOrigin: `${targetGx}px ${targetGy}px`,
            transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
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
              forceVisible={progress > 0.01}
              font={{
                fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(3.5rem, 13vw, 10rem)",
                letterSpacing: "0.16em",
                textAlign: "center",
                textTransform: "uppercase",
              }}
            />
          </div>
        </div>

        {/* Interactive Silk Ribbon Trails Cursor Overlay */}
        <div
          className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-150"
          style={{ opacity: cursorOpacity }}
        >
          <LineCursor
            colors={["#FFFFFF", "#7DD3FC", "#BAE6FD", "#E0F2FE", "#38BDF8"]}
            colorShift={1.5}
            opacity={45}
            thickness={1.8}
            trails={50}
            trailLength={26}
            label={false}
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

        {/* Pure Solid White Full-Screen Overlay */}
        <div
          className="absolute inset-0 z-30 pointer-events-none bg-white transition-opacity duration-75"
          style={{
            opacity: solidWhiteOpacity,
          }}
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
