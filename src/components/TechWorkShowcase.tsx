"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./TechWorkShowcase.module.css";

export interface TechProject {
  id: string;
  index: string;
  shortName: string;
  title: string;
  category: string;
  info: string;
  tech: string[];
  accent: string;
  glow: string;
  desktopVideo: string;
  mobileVideo: string;
}

const TECH_PROJECTS: TechProject[] = [
  {
    id: "alphatech",
    index: "01",
    shortName: "AlphaTech",
    title: "AlphaTech Nutrition",
    category: "E-Commerce Platform",
    info: "A high-converting sports nutrition storefront built for AlphaTech Nutrition. Features a dynamic hero showcase, full supplement catalog with flavor and size filters, a dedicated distributor onboarding portal, and one-tap WhatsApp checkout engineered for fast desktop and mobile conversions.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "WhatsApp API"],
    accent: "#A855F7",
    glow: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(168, 85, 247, 0.24) 0%, rgba(15, 15, 22, 0) 75%)",
    desktopVideo: "/media/tech-showcase/alphatech_landscape_1920x1080.mp4",
    mobileVideo: "/media/tech-showcase/alphatech_portrait_1080x1920.mp4",
  },
  {
    id: "fertisure",
    index: "02",
    shortName: "FertiSure",
    title: "FertiSure by Hemant Surgical",
    category: "MedTech Platform",
    info: "A precision medical technology web platform engineered for Hemant Surgical Industries Limited to present next-generation IVF and embryology lab systems across 30+ countries. Designed with fluid catalog exploration, clinical credibility metrics, and instant quote request workflows.",
    tech: ["Next.js", "React", "TypeScript", "Motion UI", "Custom CMS"],
    accent: "#38BDF8",
    glow: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(56, 189, 248, 0.24) 0%, rgba(15, 15, 22, 0) 75%)",
    desktopVideo: "/media/tech-showcase/fertisure_landscape_1920x1080.mp4",
    mobileVideo: "/media/tech-showcase/fertisure_portrait_1080x1920.mp4",
  },
  {
    id: "nonudes",
    index: "03",
    shortName: "NoNudes",
    title: "NoNudes Streetwear",
    category: "Streetwear Flagship",
    info: "An unapologetic dark-mode streetwear flagship built around bold editorial attitude. Combines a signature split-flap brand intro, kinetic oversized typography, and a frictionless obsidian shopping experience that puts every capsule drop front and center.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Kinetic Motion", "Storefront"],
    accent: "#EF4444",
    glow: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(239, 68, 68, 0.22) 0%, rgba(15, 15, 22, 0) 75%)",
    desktopVideo: "/media/tech-showcase/nonudes_landscape_1920x1080.mp4",
    mobileVideo: "/media/tech-showcase/nonudes_portrait_1080x1920.mp4",
  },
];

type VideoAspect = "desktop" | "mobile";

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function TechWorkShowcase() {
  const count = TECH_PROJECTS.length;
  const trackRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const rimRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollCaptionRef = useRef<HTMLDivElement>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const [nearView, setNearView] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  const [aspect, setAspect] = useState<VideoAspect>(() =>
    typeof window !== "undefined" && window.innerWidth < 768
      ? "mobile"
      : "desktop"
  );

  const nearViewRef = useRef(nearView);
  nearViewRef.current = nearView;

  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;

  // Imperative 60fps 3D Pull-Back & Horizontal Filmstrip Engine driven by native window.scrollY
  const engRef = useRef({
    pos: 0,
    target: 0,
    vel: 0,
    pull: 0,
    lastScrollTime: -1e9,
    lastTime: 0,
    rafId: 0,
    inViewport: false,
  });

  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileViewport(mobile);
      if (mobile) setAspect("mobile");
    };
    checkViewport();
    window.addEventListener("resize", checkViewport, { passive: true });
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Paint 100% Fullscreen <-> 3D Pulled-Back Horizontal Parallax Filmstrip directly to DOM
  const paint = useCallback(() => {
    const eng = engRef.current;
    const pos = clamp(eng.pos, 0, count - 1);
    const pull = clamp(eng.pull, 0, 1);
    const velYaw = clamp(eng.vel * 5.2, -10, 10);
    const isLive = eng.inViewport;

    const spacingVw = lerp(102, 85, pull);
    const cardRadius = pull * 26;

    for (let i = 0; i < count; i++) {
      const slide = slideRefs.current[i];
      const video = videoRefs.current[i];
      const rim = rimRefs.current[i];
      if (!slide) continue;

      const rel = i - pos;
      const absRel = Math.abs(rel);

      const xVw = rel * spacingVw;
      const zPx = -Math.min(absRel, 1.6) * 190 - pull * 135;
      const baseScale = lerp(1, 0.81, pull);
      const depthScale = 1 - Math.min(absRel, 1.3) * 0.09;
      const finalScale = baseScale * depthScale;
      const rotY = clamp(-rel * 14 - velYaw, -24, 24);
      const opacity = clamp(1 - Math.max(0, absRel - 0.12) * 0.65, 0, 1);

      slide.style.transform = `translate3d(${xVw.toFixed(3)}vw, 0, ${zPx.toFixed(1)}px) rotateY(${rotY.toFixed(2)}deg) scale(${finalScale.toFixed(4)})`;
      slide.style.borderRadius = `${cardRadius.toFixed(1)}px`;
      slide.style.opacity = opacity.toFixed(3);
      slide.style.zIndex = String(10 - Math.round(absRel * 3));
      slide.style.pointerEvents = absRel < 0.5 ? "auto" : "none";

      if (video) {
        const innerShiftX = clamp(-rel * 9 * pull, -12, 12);
        const innerScale = 1 + pull * 0.08 + Math.min(absRel, 1) * 0.04;
        video.style.transform = `translate3d(${innerShiftX.toFixed(2)}%, 0, 0) scale(${innerScale.toFixed(4)})`;

        const shouldPlay = isLive && absRel < 0.95;
        if (shouldPlay && video.paused) {
          video.play().catch(() => {});
        } else if (!shouldPlay && !video.paused) {
          video.pause();
        }
      }

      if (rim) {
        rim.style.opacity = (pull * 0.9).toFixed(3);
      }
    }

    if (scrollCaptionRef.current) {
      const captionAlpha = clamp((pull - 0.18) / 0.55, 0, 1);
      const captionY = lerp(12, 0, captionAlpha);
      scrollCaptionRef.current.style.opacity = captionAlpha.toFixed(3);
      scrollCaptionRef.current.style.transform = `translate3d(-50%, ${captionY.toFixed(1)}px, 0)`;
    }
  }, [count]);

  const wake = useCallback(() => {
    const eng = engRef.current;
    if (eng.rafId) return;

    eng.lastTime = performance.now();

    const tick = (now: number) => {
      eng.rafId = 0;
      const dt = clamp((now - eng.lastTime) / 1000, 0, 1 / 30);
      eng.lastTime = now;

      // Critically-damped spring tracking native scroll target
      const k = 125;
      const d = 2 * Math.sqrt(k) * 0.94;
      eng.vel += (k * (eng.target - eng.pos) - d * eng.vel) * dt;
      eng.pos += eng.vel * dt;

      // Asymmetric 3D pull-back envelope:
      // Pulls fullscreen video back into rounded 3D card while scrolling between slides,
      // then blooms smoothly back to 100% edge-to-edge fullscreen when resting on a project!
      const distToInteger = Math.abs(eng.pos - Math.round(eng.pos));
      const scrollPulse =
        now - eng.lastScrollTime < 150 && Math.abs(eng.vel) > 0.08 ? 0.68 : 0;
      const rawPull = clamp(
        Math.max(
          scrollPulse,
          Math.abs(eng.vel) * 0.36 + distToInteger * 1.45
        ),
        0,
        1
      );
      const pullRate = rawPull > eng.pull ? 15 : 5.2;
      eng.pull = lerp(eng.pull, rawPull, clamp(dt * pullRate, 0, 1));
      if (eng.pull < 0.002 && rawPull === 0) eng.pull = 0;

      const rounded = clamp(Math.round(eng.pos), 0, count - 1);
      if (rounded !== activeIdxRef.current) {
        activeIdxRef.current = rounded;
        setActiveIdx(rounded);
      }

      paint();

      const settled =
        Math.abs(eng.target - eng.pos) < 0.0008 &&
        Math.abs(eng.vel) < 0.0025 &&
        eng.pull < 0.004 &&
        now - eng.lastScrollTime > 180;

      if (settled) {
        eng.pos = eng.target;
        eng.vel = 0;
        eng.pull = 0;
        paint();
      } else {
        eng.rafId = requestAnimationFrame(tick);
      }
    };

    eng.rafId = requestAnimationFrame(tick);
  }, [count, paint]);

  // Passive native window scroll listener -> maps Section 3 runway cleanly to 0..count-1
  useEffect(() => {
    let scrollRaf = 0;

    const syncScroll = () => {
      scrollRaf = 0;
      const el = trackRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const isNear = rect.top < vh * 1.4 && rect.bottom > -vh * 0.4;
      const inVp = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;

      if (isNear !== nearViewRef.current) {
        nearViewRef.current = isNear;
        setNearView(isNear);
      }

      const eng = engRef.current;
      const prevInVp = eng.inViewport;
      eng.inViewport = inVp;

      const maxScroll = Math.max(1, rect.height - vh);
      const scrolled = clamp(-rect.top, 0, maxScroll);
      const progress = scrolled / maxScroll;

      // Soft detent mapping: gives each project a generous resting plateau at 100% fullscreen,
      // with smooth transition zones between 01 -> 02 -> 03!
      let mapped = 0;
      if (count > 1) {
        // Divide 0..1 into (count) equal slots with clean resting plateaus
        const raw = progress * (count - 1);
        mapped = clamp(raw, 0, count - 1);
      }

      if (Math.abs(mapped - eng.target) > 0.0005 || prevInVp !== inVp) {
        eng.target = mapped;
        eng.lastScrollTime = performance.now();
        wake();
      }
    };

    const onScroll = () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(syncScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    syncScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      if (engRef.current.rafId) cancelAnimationFrame(engRef.current.rafId);
    };
  }, [count, wake]);

  // Repaint when aspect or nearView updates
  useEffect(() => {
    paint();
    if (nearView) wake();
  }, [aspect, nearView, paint, wake]);

  // Smooth native scroll jump to a specific project index (0, 1, 2)
  const jumpTo = useCallback(
    (idx: number) => {
      const el = trackRef.current;
      if (!el) return;
      const clamped = clamp(idx, 0, count - 1);
      const sectionTop = el.getBoundingClientRect().top + window.scrollY;
      const maxScroll = Math.max(1, el.offsetHeight - window.innerHeight);
      const targetY =
        sectionTop + (count > 1 ? (clamped / (count - 1)) * maxScroll : 0);
      window.scrollTo({ top: targetY, behavior: "smooth" });
    },
    [count]
  );

  const returnToWork = useCallback(() => {
    const targetEl =
      document.getElementById("work-showcase") ||
      document.getElementById("our-work");
    if (targetEl) {
      const top = targetEl.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      jumpTo(Math.min(count - 1, activeIdx + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      jumpTo(Math.max(0, activeIdx - 1));
    } else if (e.key === "i" || e.key === "I") {
      setInfoOpen((v) => !v);
    } else if (e.key === "Escape" && infoOpen) {
      setInfoOpen(false);
    }
  };

  const current = TECH_PROJECTS[activeIdx];
  const portraitOnDesktop = aspect === "mobile" && !isMobileViewport;

  return (
    <section
      id="tech-work"
      ref={trackRef}
      aria-label="Tech Work Fullscreen Reel"
      className="relative w-full bg-[#060608]"
      style={{ height: "340vh" }}
    >
      <div
        className={`${styles.root} sticky top-0 h-screen w-full`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Subtle Brand Aura Behind Pulled-Back 3D Video Cards */}
        <div
          className={styles.backdropGlow}
          style={{ background: current.glow }}
        />

        {/* 100% Fullscreen Edge-to-Edge 3D Horizontal Filmstrip */}
        <div
          className={styles.cinemaStage}
          onClick={() => {
            if (infoOpen) setInfoOpen(false);
          }}
        >
          {TECH_PROJECTS.map((proj, idx) => {
            const dist = Math.abs(idx - activeIdx);
            const shouldAttachSrc = nearView && dist <= 1;
            const preloadMode = !nearView
              ? "none"
              : dist === 0
                ? "auto"
                : dist === 1
                  ? "metadata"
                  : "none";

            return (
              <div
                key={proj.id}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                className={styles.reelSlide}
                style={{
                  transform: `translate3d(${idx * 102}vw, 0, 0px)`,
                  opacity: idx === 0 ? 1 : 0,
                  zIndex: 10 - idx * 3,
                }}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el;
                  }}
                  key={`${proj.id}-${aspect}`}
                  src={
                    shouldAttachSrc
                      ? aspect === "desktop"
                        ? proj.desktopVideo
                        : proj.mobileVideo
                      : undefined
                  }
                  className={`${styles.reelVideo} ${
                    portraitOnDesktop ? styles.reelVideoPortraitOnDesktop : ""
                  }`}
                  muted
                  loop
                  playsInline
                  preload={preloadMode}
                />
                <div
                  ref={(el) => {
                    rimRefs.current[idx] = el;
                  }}
                  className={styles.reelRim}
                />
              </div>
            );
          })}
        </div>

        {/* Whisper Caption Visible ONLY in the Dark Stage Margin While Pulled Back During Scroll */}
        <div
          ref={scrollCaptionRef}
          className={styles.scrollCaption}
          aria-hidden="true"
        >
          <span>
            {current.index} {current.shortName}
          </span>
          <span className={styles.scrollCaptionDivider} />
          <span>{current.tech.slice(0, 3).join(" · ")}</span>
        </div>

        {/* Top-Left Minimal Return Pill */}
        <div className={styles.topLeft}>
          <button
            type="button"
            onClick={returnToWork}
            className={styles.glassPillBtn}
            aria-label="Back to Our Work"
          >
            <span>↑</span>
            <span>Our Work</span>
          </button>
        </div>

        {/* Bottom-Left Minimal Floating Corner Label + Expandable Project Info Card */}
        <div className={styles.cornerDock}>
          <motion.div
            layout
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className={styles.cornerCard}
            style={{ borderRadius: infoOpen ? 20 : 999 }}
          >
            <button
              type="button"
              className={styles.cornerHeader}
              onClick={() => setInfoOpen((v) => !v)}
              aria-expanded={infoOpen}
              aria-label={
                infoOpen
                  ? `Hide details for ${current.title}`
                  : `Show details for ${current.title}`
              }
            >
              <span className={styles.cornerHeaderLeft}>
                <span
                  className={styles.accentDot}
                  style={{
                    backgroundColor: current.accent,
                    boxShadow: `0 0 10px ${current.accent}`,
                  }}
                />
                <span className={styles.cornerIndex}>{current.index}</span>
                <span className={styles.cornerName}>{current.shortName}</span>
              </span>
              <span className={styles.cornerToggle}>
                {infoOpen ? "Close −" : "Info +"}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {infoOpen && (
                <motion.div
                  key="info-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className={styles.infoBody}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={current.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className={styles.infoMeta}>
                          <span>{current.category}</span>
                          <span>
                            {current.index} / 0{count}
                          </span>
                        </div>
                        <h2 className={styles.infoTitle}>{current.title}</h2>
                        <p className={styles.infoDescription}>{current.info}</p>

                        <div className={styles.techStackLabel}>Tech Stack</div>
                        <div className={styles.techList}>
                          {current.tech.map((t) => (
                            <span key={t} className={styles.techPill}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className={styles.infoFooter}>
                      <div
                        className={styles.aspectToggle}
                        role="group"
                        aria-label="Video View"
                      >
                        <button
                          type="button"
                          onClick={() => setAspect("desktop")}
                          className={`${styles.aspectBtn} ${
                            aspect === "desktop" ? styles.aspectBtnActive : ""
                          }`}
                        >
                          16:9
                        </button>
                        <button
                          type="button"
                          onClick={() => setAspect("mobile")}
                          className={`${styles.aspectBtn} ${
                            aspect === "mobile" ? styles.aspectBtnActive : ""
                          }`}
                        >
                          9:16
                        </button>
                      </div>

                      <div className={styles.stepNav}>
                        <button
                          type="button"
                          className={styles.stepBtn}
                          onClick={() => jumpTo(activeIdx - 1)}
                          disabled={activeIdx === 0}
                          aria-label="Previous project"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          className={styles.stepBtn}
                          onClick={() => jumpTo(activeIdx + 1)}
                          disabled={activeIdx === count - 1}
                          aria-label="Next project"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom-Right Minimal Floating Index Switcher */}
        <nav className={styles.cornerNavRight} aria-label="Tech Projects">
          {TECH_PROJECTS.map((proj, idx) => {
            const isSel = idx === activeIdx;
            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => jumpTo(idx)}
                className={`${styles.dotBtn} ${isSel ? styles.dotBtnActive : ""}`}
                aria-label={`Jump to ${proj.title}`}
              >
                <span
                  className={styles.dotIndicator}
                  style={isSel ? { backgroundColor: proj.accent } : undefined}
                />
                <span>{proj.index}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
