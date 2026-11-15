"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import CloudSky from "@/components/CloudSky";
import SmokyText from "@/components/SmokyText";
import LineCursor from "@/components/LineCursor";

export default function HeroScrollZoom() {
  const trackRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);

  // Progress from 0 (hero) to 1 (fully zoomed inside G and white screen)
  const [progress, setProgress] = useState(0);

  // Center of 'G' in unscaled viewport pixels
  const [gPos, setGPos] = useState<{ x: number; y: number } | null>(null);

  // Measure the unscaled layout position of the letter 'G'
  const measureG = useCallback(() => {
    const gEl = document.getElementById("hero-letter-g");
    if (!gEl) return;

    // Use getBoundingClientRect when scale is 1, or layout offsets
    const gRect = gEl.getBoundingClientRect();
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    // If progress is near 0, we can read directly from getBoundingClientRect
    // Otherwise, we compute based on textWrapper
    if (progress < 0.05) {
      setGPos({
        x: gRect.left + gRect.width / 2,
        y: gRect.top + gRect.height * 0.52,
      });
    } else if (textWrapperRef.current) {
      const containerRect = textWrapperRef.current.getBoundingClientRect();
      const relativeX = (gRect.left + gRect.width / 2 - containerRect.left) / (containerRect.width || 1);
      const relativeY = (gRect.top + gRect.height * 0.52 - containerRect.top) / (containerRect.height || 1);
      setGPos({
        x: vpW * relativeX,
        y: vpH * relativeY,
      });
    }
  }, [progress]);

  // Initial measurement & resize listeners
  useEffect(() => {
    // Initial measurement after render
    const timer = setTimeout(measureG, 100);
    const timer2 = setTimeout(measureG, 500); // re-check after fonts settle
    window.addEventListener("resize", measureG);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener("resize", measureG);
    };
  }, [measureG]);

  // Scroll listener using requestAnimationFrame
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
        // Only update if difference is noticeable
        if (Math.abs(prev - p) > 0.0005) {
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

  // Compute zoom transformation values
  const vpW = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vpH = typeof window !== "undefined" ? window.innerHeight : 900;
  const centerX = vpW / 2;
  const centerY = vpH / 2;

  // Default target for 'G' if not yet measured (roughly center-left for PROGENCY)
  const targetGx = gPos?.x ?? centerX - 30;
  const targetGy = gPos?.y ?? centerY;

  // Zoom scale: exponential ramp into the center of the 'G'
  // Starts at 1, reaches ~15 at p=0.6, and reaches ~90+ at p=1
  const scale = 1 + Math.pow(progress, 2.2) * 88;

  // Shift to glide the 'G' directly to the dead-center of the screen
  const shiftProgress = Math.pow(progress, 1.4);
  const translateX = (centerX - targetGx) * shiftProgress;
  const translateY = (centerY - targetGy) * shiftProgress;

  // Opacities for smooth atmospheric transitions
  // 1. Sky fades out as we get deep inside the letter
  const skyOpacity = Math.max(0, 1 - Math.pow(progress / 0.82, 2.5));

  // 2. Ribbon cursor trails fade out during zoom
  const cursorOpacity = Math.max(0, 1 - progress * 2.2);

  // 3. Radial light burst centered inside 'G' as it fills the view (progress 0.55 -> 0.90)
  const lightBurstOpacity = Math.max(
    0,
    Math.min(1, (progress - 0.5) / 0.35)
  );

  // 4. Solid white overlay reaching 100% pure white at progress >= 0.94
  const solidWhiteOpacity = Math.max(
    0,
    Math.min(1, (progress - 0.72) / 0.22)
  );

  // 5. Scroll hint fades out immediately on first scroll
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

        {/* Zoom Transform Container centered on 'G' */}
        <div
          ref={textWrapperRef}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{
            transformOrigin: `${targetGx}px ${targetGy}px`,
            transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
            willChange: "transform",
          }}
        >
          <div className="w-full px-4 flex items-center justify-center">
            <SmokyText
              text="PROGENCY"
              color="rgba(255, 255, 255, 0.97)"
              intensity={12}
              position="bottomLeft"
              animationMode="singleLine"
              appearTrigger="default"
              font={{
                fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(3.5rem, 13vw, 10rem)",
                letterSpacing: "0.16em",
                textAlign: "center",
                textTransform: "uppercase",
                filter: "drop-shadow(0 14px 30px rgba(4, 45, 100, 0.22))",
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

        {/* Radiant Light Burst Erupting From Inside 'G' */}
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

        {/* Gentle Scroll Hint (Only visible when at top) */}
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
