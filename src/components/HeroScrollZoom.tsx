"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import CloudSky from "@/components/CloudSky";
import SmokyText from "@/components/SmokyText";
import LineCursor from "@/components/LineCursor";

export default function HeroScrollZoom() {
  const trackRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Hold pause state at "OUR WORK" hero
  const HOLD_DURATION_MS = 900;
  const hasPausedRef = useRef(false);
  const pausedUntilRef = useRef(0);
  const [isScrollPaused, setIsScrollPaused] = useState(true);

  // Exact coordinates of the letter 'G' in unscaled screen coordinates
  const [gPos, setGPos] = useState<{ x: number; y: number } | null>(null);

  // Measure the unscaled screen position of the letter 'G'
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

  // Hold pause trigger: When scroll reaches the "OUR WORK" hero (progress >= 0.85),
  // hold scrolling for 900ms so top images and photo tiles complete their entrance animation in full view
  useEffect(() => {
    if (progress >= 0.85 && !hasPausedRef.current) {
      hasPausedRef.current = true;
      const unlockTime = Date.now() + HOLD_DURATION_MS;
      pausedUntilRef.current = unlockTime;
      setIsScrollPaused(true);

      // Notify portfolio iframe to hold internal scroll
      iframeRef.current?.contentWindow?.postMessage(
        { type: "HOLD_HERO_SCROLL", duration: HOLD_DURATION_MS },
        "*"
      );

      // Unlock after entrance animation finishes completely
      const timer = setTimeout(() => {
        setIsScrollPaused(false);
        iframeRef.current?.contentWindow?.postMessage({ type: "UNLOCK_SCROLL" }, "*");
      }, HOLD_DURATION_MS);

      return () => clearTimeout(timer);
    } else if (progress < 0.3) {
      // Reset pause trigger when user scrolls back up into the cloud sky
      hasPausedRef.current = false;
      setIsScrollPaused(true);
    }
  }, [progress]);

  // Wheel interceptor for the hold pause and seamless forwarding to the portfolio
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If within hold pause, absorb downward wheel so images don't rush out of sight
      if (Date.now() < pausedUntilRef.current && e.deltaY > 0) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // When at portfolio stage and unlocked, forward wheel to iframe virtual scroll
      if (progress >= 0.85 && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: "PARENT_WHEEL",
            deltaY: e.deltaY,
            deltaX: e.deltaX,
            deltaMode: e.deltaMode,
          },
          "*"
        );
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [progress]);

  // Upward scroll bridge from the portfolio iframe
  // Allows user to smoothly scroll back up into the G zoom and cloud sky
  useEffect(() => {
    const handleBridgeMessage = (e: MessageEvent) => {
      if (e.data?.type === "PERAPPELGREN_SCROLL_UP") {
        window.scrollBy({ top: e.data.deltaY, behavior: "auto" });
      }
    };
    window.addEventListener("message", handleBridgeMessage);
    return () => window.removeEventListener("message", handleBridgeMessage);
  }, []);

  // Smooth zoom and pan directly into the letter 'G'
  // Updated directly via DOM ref to guarantee 100% identical SSR/Client markup and 0 hydration mismatch
  useEffect(() => {
    if (!zoomContainerRef.current) return;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const centerX = vpW / 2;
    const centerY = vpH / 2;
    const targetGx = gPos?.x ? gPos.x : centerX - vpW * 0.038;
    const targetGy = gPos?.y ? gPos.y : centerY;
    const scale = 1 + Math.pow(progress, 2.4) * 88;
    const panProgress = Math.pow(progress, 0.85);
    const translateX = (centerX - targetGx) * panProgress;
    const translateY = (centerY - targetGy) * panProgress;

    zoomContainerRef.current.style.transformOrigin = `${targetGx}px ${targetGy}px`;
    zoomContainerRef.current.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
  }, [progress, gPos]);

  // Atmospheric opacities
  const skyOpacity = Math.max(0, 1 - Math.pow(progress / 0.84, 2.5));
  const cursorOpacity = Math.max(0, 1 - progress * 2.2);

  // Radial white light burst blossoms from inside the G (progress 0.45 -> 0.80)
  const lightBurstOpacity = Math.max(0, Math.min(1, (progress - 0.45) / 0.32));

  // Pure solid white transition layer (progress 0.62 -> 0.82)
  const solidWhiteOpacity = Math.max(0, Math.min(1, (progress - 0.62) / 0.20));

  // Portfolio Experience emerges directly on the white canvas of G (progress 0.68 -> 0.88)
  const portfolioOpacity = Math.max(0, Math.min(1, (progress - 0.68) / 0.18));

  // Scroll hint fades out immediately on first scroll
  const hintOpacity = Math.max(0, 1 - progress * 8);

  return (
    <div ref={trackRef} className="relative w-full h-[280vh] bg-white">
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
          className="absolute inset-0 z-30 pointer-events-none bg-white transition-opacity duration-75"
          style={{
            opacity: solidWhiteOpacity,
          }}
        />

        {/* OUR WORK Portfolio Experience Blooming Directly on White of 'G' */}
        <div
          className="absolute inset-0 z-40 transition-opacity duration-300"
          style={{
            opacity: portfolioOpacity,
            pointerEvents: progress >= 0.85 && !isScrollPaused ? "auto" : "none",
          }}
        >
          <iframe
            ref={iframeRef}
            src="/perappelgren"
            className="w-full h-full border-0 outline-none bg-white"
            title="Our Work Portfolio Experience"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

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
