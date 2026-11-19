"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./OurWorkHero.module.css";

interface HeroTile {
  id: number;
  src: string;
  alt: string;
  r: number;
  c: number;
  mobileR: number;
  mobileC: number;
  widthPct: number;
  depth: number;
  zIndex?: number;
  mobileHidden?: boolean;
}

const HERO_TILES: HeroTile[] = [
  { id: 1, src: "/assets/images/hero_portrait/hero_tile_01.webp", alt: "Editorial Portrait 01", r: 2, c: 4, mobileR: 2, mobileC: 6, widthPct: 88, depth: 0.56 },
  { id: 2, src: "/assets/images/hero_portrait/hero_tile_02.webp", alt: "Editorial Portrait 02", r: 4, c: 1, mobileR: 4, mobileC: 2, widthPct: 86, depth: 0.88 },
  { id: 3, src: "/assets/images/hero_portrait/hero_tile_03.webp", alt: "Editorial Portrait 03", r: 3, c: 6, mobileR: 8, mobileC: 6, widthPct: 84, depth: 0.72, zIndex: 2 },
  { id: 4, src: "/assets/images/hero_portrait/hero_tile_04.webp", alt: "Editorial Portrait 04", r: 3, c: 8, mobileR: 10, mobileC: 2, widthPct: 80, depth: 1.0 },
  { id: 5, src: "/assets/images/hero_portrait/hero_tile_05.webp", alt: "Editorial Portrait 05", r: 6, c: 3, mobileR: 12, mobileC: 6, widthPct: 84, depth: 0.62, zIndex: 2 },
  { id: 6, src: "/assets/images/hero_portrait/hero_tile_06.webp", alt: "Editorial Portrait 06", r: 9, c: 2, mobileR: 14, mobileC: 2, widthPct: 82, depth: 0.94 },
  { id: 7, src: "/assets/images/hero_portrait/hero_tile_07.webp", alt: "Editorial Portrait 07", r: 9, c: 6, mobileR: 15, mobileC: 6, widthPct: 84, depth: 0.78, zIndex: 2 },
  { id: 8, src: "/assets/images/hero_portrait/hero_tile_08.webp", alt: "Editorial Portrait 08", r: 9, c: 8, mobileR: 16, mobileC: 2, widthPct: 80, depth: 1.08 },
  { id: 9, src: "/assets/images/hero_portrait/hero_tile_09.webp", alt: "Editorial Portrait 09", r: 12, c: 4, mobileR: 12, mobileC: 4, widthPct: 90, depth: 0.66, zIndex: 2, mobileHidden: true },
  { id: 10, src: "/assets/images/hero_portrait/hero_tile_10.webp", alt: "Editorial Portrait 10", r: 13, c: 1, mobileR: 13, mobileC: 1, widthPct: 84, depth: 0.98, mobileHidden: true },
  { id: 11, src: "/assets/images/hero_portrait/hero_tile_11.webp", alt: "Editorial Portrait 11", r: 14, c: 8, mobileR: 14, mobileC: 8, widthPct: 82, depth: 0.84, mobileHidden: true },
  { id: 12, src: "/assets/images/hero_portrait/hero_tile_12.webp", alt: "Editorial Portrait 12", r: 17, c: 5, mobileR: 17, mobileC: 5, widthPct: 88, depth: 0.7, mobileHidden: true },
  { id: 13, src: "/assets/images/hero_portrait/hero_tile_13.webp", alt: "Editorial Portrait 13", r: 20, c: 2, mobileR: 20, mobileC: 2, widthPct: 84, depth: 1.04, mobileHidden: true },
  { id: 14, src: "/assets/images/hero_portrait/hero_tile_14.webp", alt: "Editorial Portrait 14", r: 21, c: 6, mobileR: 21, mobileC: 5, widthPct: 88, depth: 0.8, mobileHidden: true },
  { id: 15, src: "/assets/images/hero_portrait/hero_tile_15.webp", alt: "Editorial Portrait 15", r: 22, c: 8, mobileR: 23, mobileC: 8, widthPct: 82, depth: 0.92, mobileHidden: true },
];

export function OurWorkHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [revealed, setRevealed] = useState(false);

  // Trigger staggered card entrance as soon as Section 1 enters view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.03 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Passive 60fps scroll driver for the OUR WORK logo shrink-to-top + multi-depth card parallax
  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const sectionH = rect.height;

      // How far Section 1 has scrolled past viewport top
      const scrolled = -rect.top;
      const maxScroll = Math.max(1, sectionH - vh);
      const p = Math.max(0, Math.min(1, scrolled / maxScroll));

      // 1. Update centered -> top-center OUR WORK logo
      if (logoRef.current) {
        // Visible once Section 1 enters screen, holds center for first 18% of scroll,
        // glides up to top-center (28px) at scale(0.5), then fades out as Section 2 enters
        const enterAlpha = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.45)));
        const exitAlpha = Math.max(0, Math.min(1, (rect.bottom - vh * 0.35) / (vh * 0.35)));
        const logoOpacity = enterAlpha * exitAlpha;

        // Hold centered briefly so top images stay framed with OUR WORK before gliding up
        const glideP = Math.max(0, Math.min(1, (p - 0.08) / 0.52));
        const easedGlide =
          glideP < 0.5
            ? 2 * glideP * glideP
            : 1 - Math.pow(-2 * glideP + 2, 2) / 2;

        const targetTopY = 28 - vh / 2;
        const translateY = targetTopY * easedGlide;
        const scale = 1 - 0.48 * easedGlide;

        logoRef.current.style.opacity = logoOpacity.toFixed(3);
        logoRef.current.style.transform = `translate(-50%, -50%) translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
      }

      // 2. Multi-depth vertical parallax on the 15 portrait cards (only while in/near viewport)
      if (rect.bottom > -vh * 0.3 && rect.top < vh * 1.3) {
        for (let i = 0; i < HERO_TILES.length; i++) {
          const tileEl = tileRefs.current[i];
          if (!tileEl) continue;
          const depth = HERO_TILES[i].depth;
          // Closer tiles (depth > 0.8) glide slightly faster upward; deeper tiles lag gracefully
          const shiftY = -(depth - 0.78) * Math.max(0, scrolled) * 0.38;
          tileEl.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0)`;
        }
      }
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      id="our-work"
      ref={sectionRef}
      aria-label="Our Work Vertical Editorial Showcase"
      className={`${styles.section} ${revealed ? styles.revealed : ""}`}
    >
      {/* Floating Centered -> Top-Center OUR WORK Title */}
      <div ref={logoRef} className={styles.logoStickyWrap} aria-hidden="true">
        <span className={styles.logoText}>OUR WORK</span>
      </div>

      {/* 15 Pure Vertical Portrait Cards in Scattered 8-Column Grid */}
      <div className={styles.gridWrap}>
        <div className={styles.grid}>
          {HERO_TILES.map((tile, idx) => (
            <div
              key={tile.id}
              ref={(el) => {
                tileRefs.current[idx] = el;
              }}
              data-mobile-hidden={tile.mobileHidden ? "true" : undefined}
              className={styles.tileSlot}
              style={
                {
                  "--r": tile.r,
                  "--c": tile.c,
                  "--mobile-r": tile.mobileR,
                  "--mobile-c": tile.mobileC,
                  width: `clamp(68px, ${tile.widthPct}%, 260px)`,
                  zIndex: tile.zIndex ?? 1,
                } as React.CSSProperties
              }
            >
              <div
                className={styles.tileInner}
                style={
                  {
                    "--delay": `${Math.min(idx, 7) * 55}ms`,
                  } as React.CSSProperties
                }
              >
                <img
                  src={tile.src}
                  alt={tile.alt}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className={styles.tileImg}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
