"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import CloudSky from "@/components/CloudSky";
import SmokyText from "@/components/SmokyText";
import LineCursor from "@/components/LineCursor";

export default function HeroScrollZoom() {
  const trackRef = useRef<HTMLDivElement>(null);
  const svgTextRef = useRef<SVGTextElement>(null);

  // Scroll progress from 0 (hero) to 1 (fully zoomed inside G and white screen)
  const [progress, setProgress] = useState(0);

  // Exact coordinates of the letter 'G' in SVG coordinate space (1920 x 1080)
  const [svgGPos, setSvgGPos] = useState<{ x: number; y: number } | null>(null);

  // Base SVG coordinate space (fixed high-resolution canvas)
  const BASE_W = 1920;
  const BASE_H = 1080;
  const CENTER_X = BASE_W / 2;
  const CENTER_Y = BASE_H / 2;

  // Measure the exact position of 'G' (index 3 in "PROGENCY") in SVG units
  const measureSvgG = useCallback(() => {
    if (!svgTextRef.current) return;

    try {
      // 1. Try standard W3C getExtentOfChar for character index 3 ('G')
      if (typeof svgTextRef.current.getExtentOfChar === "function") {
        const charRect = svgTextRef.current.getExtentOfChar(3);
        if (charRect && charRect.width > 0) {
          setSvgGPos({
            x: charRect.x + charRect.width / 2,
            y: charRect.y + charRect.height * 0.52,
          });
          return;
        }
      }

      // 2. Fallback to getBBox if getExtentOfChar is unavailable
      if (typeof svgTextRef.current.getBBox === "function") {
        const bbox = svgTextRef.current.getBBox();
        if (bbox && bbox.width > 0) {
          // 'G' is the 4th letter of 8 letters in "PROGENCY", slightly left of center
          setSvgGPos({
            x: bbox.x + bbox.width * 0.428,
            y: bbox.y + bbox.height * 0.52,
          });
        }
      }
    } catch {
      // Fallback calculation for 1920x1080
      setSvgGPos({ x: 835, y: 540 });
    }
  }, []);

  useEffect(() => {
    // Measure on mount and after fonts are guaranteed loaded
    measureSvgG();
    const t1 = setTimeout(measureSvgG, 100);
    const t2 = setTimeout(measureSvgG, 400);

    if (document.fonts) {
      document.fonts.ready.then(measureSvgG);
    }

    window.addEventListener("resize", measureSvgG);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measureSvgG);
    };
  }, [measureSvgG]);

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
        if (Math.abs(prev - p) > 0.0004) {
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

  // Compute Vector Zoom coordinates for SVG viewBox (Zero Raster Blur)
  const targetGx = svgGPos?.x ?? 835;
  const targetGy = svgGPos?.y ?? 540;

  // Exponential scale accelerating into the G
  const scale = 1 + Math.pow(progress, 2.2) * 88;

  // Viewport dimensions in SVG coordinates (shrinks from 1920x1080 down to ~21x12)
  const vbW = BASE_W / scale;
  const vbH = BASE_H / scale;

  // Camera centers onto 'G' as it zooms
  const panEase = Math.pow(progress, 0.75);
  const curCenterX = CENTER_X + (targetGx - CENTER_X) * panEase;
  const curCenterY = CENTER_Y + (targetGy - CENTER_Y) * panEase;

  const vbX = curCenterX - vbW / 2;
  const vbY = curCenterY - vbH / 2;

  // Opacity transitions
  // Initial SmokyText fades out seamlessly on scroll start as vector SVG text takes over
  const smokyOpacity = Math.max(0, 1 - progress * 15);
  const vectorSvgOpacity = Math.min(1, progress * 15);

  // Sky fades out as we plunge inside the letter
  const skyOpacity = Math.max(0, 1 - Math.pow(progress / 0.82, 2.5));

  // Cursor ribbon trails fade out on zoom
  const cursorOpacity = Math.max(0, 1 - progress * 2.2);

  // Radial light burst erupts from inside G
  const lightBurstOpacity = Math.max(0, Math.min(1, (progress - 0.5) / 0.35));

  // Pure solid white overlay reaches 100% at progress >= 0.92
  const solidWhiteOpacity = Math.max(0, Math.min(1, (progress - 0.7) / 0.22));

  // Scroll hint fades immediately
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

        {/* 1. Initial State: SmokyText (visible at rest when scroll is at top) */}
        {smokyOpacity > 0.01 && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-100"
            style={{ opacity: smokyOpacity }}
          >
            <div className="w-full px-4 flex items-center justify-center">
              <SmokyText
                text="PROGENCY"
                color="#FFFFFF"
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
                }}
              />
            </div>
          </div>
        )}

        {/* 2. Vector SVG Text Zoom (Infinite Mathematical Sharpness - Zero Blur) */}
        <div
          className="absolute inset-0 z-12 pointer-events-none"
          style={{
            opacity: progress === 0 ? 0 : 1,
          }}
        >
          <svg
            viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
            className="w-full h-full pointer-events-none overflow-visible"
            preserveAspectRatio="xMidYMid meet"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
          >
            <text
              ref={svgTextRef}
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#FFFFFF"
              style={{
                fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "128px",
                letterSpacing: "0.16em",
              }}
            >
              PROGENCY
            </text>
          </svg>
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

        {/* Scroll Hint */}
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
