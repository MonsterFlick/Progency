"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./TechWorkShowcase.module.css";

export interface TechProject {
  id: string;
  indexLabel: string;
  name: string;
  domain: string;
  category: string;
  tagline: string;
  tags: string[];
  accent: string;
  auraRgb: string;
  desktopVideo: string;
  mobileVideo: string;
}

export const TECH_PROJECTS: TechProject[] = [
  {
    id: "alphatech",
    indexLabel: "01",
    name: "AlphaTech",
    domain: "alphatechnutrition.com",
    category: "E-Commerce Platform",
    tagline:
      "High-voltage sports nutrition storefront featuring interactive product showcases, distributor portal, and instant WhatsApp checkout.",
    tags: ["Next.js", "Storefront", "Responsive UI"],
    accent: "#6D28D9",
    auraRgb: "124, 58, 237",
    desktopVideo: "/media/tech-showcase/alphatech_landscape_1920x1080.mp4",
    mobileVideo: "/media/tech-showcase/alphatech_portrait_1080x1920.mp4",
  },
  {
    id: "fertisure",
    indexLabel: "02",
    name: "FertiSure",
    domain: "fertisure.in",
    category: "MedTech Platform",
    tagline:
      "Next-generation IVF and medical equipment web platform engineered for Hemant Surgical Industries Limited.",
    tags: ["Web App", "Motion System", "MedTech"],
    accent: "#0284C7",
    auraRgb: "14, 165, 233",
    desktopVideo: "/media/tech-showcase/fertisure_landscape_1920x1080.mp4",
    mobileVideo: "/media/tech-showcase/fertisure_portrait_1080x1920.mp4",
  },
  {
    id: "nonudes",
    indexLabel: "03",
    name: "NoNudes",
    domain: "nonudes.in",
    category: "Streetwear Flagship",
    tagline:
      "Dark-mode luxury streetwear experience built with split-flap brand reveals, bold editorial typography, and fluid micro-interactions.",
    tags: ["E-Commerce", "Kinetic UI", "Brand Site"],
    accent: "#B91C1C",
    auraRgb: "220, 38, 38",
    desktopVideo: "/media/tech-showcase/nonudes_landscape_1920x1080.mp4",
    mobileVideo: "/media/tech-showcase/nonudes_portrait_1080x1920.mp4",
  },
];

type ViewMode = "dual" | "desktop" | "mobile";

interface TechWorkShowcaseProps {
  active?: boolean;
  onBoundaryScrollUp?: (deltaY: number) => void;
  onReturnToWork?: () => void;
}

interface SlideRefs {
  desktopRig: HTMLDivElement | null;
  mobileRig: HTMLDivElement | null;
  desktopVideo: HTMLVideoElement | null;
  mobileVideo: HTMLVideoElement | null;
  watermark: HTMLDivElement | null;
}

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function TechWorkShowcase({
  active = true,
  onBoundaryScrollUp,
  onReturnToWork,
}: TechWorkShowcaseProps) {
  const count = TECH_PROJECTS.length;
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressThumbRef = useRef<HTMLDivElement>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("dual");
  const [modal, setModal] = useState<{
    index: number;
    device: "desktop" | "mobile";
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  const activeRef = useRef(active);
  activeRef.current = active;

  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  const modalRef = useRef(modal);
  modalRef.current = modal;

  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;

  const onBoundaryScrollUpRef = useRef(onBoundaryScrollUp);
  onBoundaryScrollUpRef.current = onBoundaryScrollUp;

  const slideRefs = useRef<Array<SlideRefs>>(
    TECH_PROJECTS.map(() => ({
      desktopRig: null,
      mobileRig: null,
      desktopVideo: null,
      mobileVideo: null,
      watermark: null,
    }))
  );

  // Physics engine state (runs purely in RAF, zero React re-renders per frame)
  const engineRef = useRef({
    pos: 0,
    target: 0,
    vel: 0,
    scrollPull: 0,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    lastWheelTime: -1e9,
    lastTime: 0,
    rafId: 0,
    touchY: null as number | null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Paint all 3D device layers directly to DOM at 60fps
  const paint = useCallback(() => {
    const eng = engineRef.current;
    const mode = viewModeRef.current;
    const isLive = activeRef.current && !modalRef.current;
    const pos = eng.pos;
    const pull = eng.scrollPull;
    const mx = eng.mouseX;
    const my = eng.mouseY;
    const velTilt = clamp(eng.vel * 3.6, -10, 10);

    for (let i = 0; i < count; i++) {
      const refs = slideRefs.current[i];
      if (!refs) continue;

      const rel = clamp(i - pos, -2, 2);
      const absRel = Math.abs(rel);
      const focusW = clamp(1 - absRel, 0, 1);
      const smoothW = focusW * focusW * (3 - 2 * focusW);

      // 1. Slow background watermark numeral (0.35x parallax layer)
      if (refs.watermark) {
        const wmY = rel * 32;
        const wmScale = lerp(0.84, 1.0, smoothW) * (1 - pull * 0.06);
        refs.watermark.style.transform = `translate3d(${(-mx * 16).toFixed(1)}px, ${wmY.toFixed(2)}vh, 0) scale(${wmScale.toFixed(4)})`;
        refs.watermark.style.opacity = clamp(smoothW * 1.15 - pull * 0.25, 0, 1).toFixed(3);
      }

      // 2. Desktop Studio Display (Midground 3D layer — shrinks slightly when scrolling, then glides with 3D parallax)
      if (refs.desktopRig) {
        const showDesktop = mode === "dual" || mode === "desktop";
        if (!showDesktop) {
          refs.desktopRig.style.opacity = "0";
          refs.desktopRig.style.pointerEvents = "none";
          refs.desktopRig.style.transform =
            "translate3d(0, 0, -320px) scale(0.72)";
        } else {
          // Shift slightly left in dual mode so floating phone sits cleanly on bottom-right
          const baseShiftX = mode === "dual" ? -5.5 : 0;
          const deskY = rel * 78; // vh
          const deskZ = -Math.pow(Math.min(absRel, 1.6), 1.15) * 260 - pull * 135;
          const deskScale =
            lerp(0.74, 1.0, smoothW) * (1 - pull * 0.13);
          const deskRotX = clamp(-rel * 19 - velTilt - my * 4.5, -32, 32);
          const deskRotY = clamp(
            (mode === "dual" ? 3.5 : 0) + mx * 6.5,
            -12,
            14
          );
          const deskOpacity = clamp(1 - absRel * 0.85, 0, 1);

          refs.desktopRig.style.transform = `translate3d(calc(${baseShiftX}% + ${(mx * 10).toFixed(1)}px), calc(${deskY.toFixed(2)}vh + ${(my * 7).toFixed(1)}px), ${deskZ.toFixed(1)}px) rotateX(${deskRotX.toFixed(2)}deg) rotateY(${deskRotY.toFixed(2)}deg) scale(${deskScale.toFixed(4)})`;
          refs.desktopRig.style.opacity = deskOpacity.toFixed(3);
          refs.desktopRig.style.zIndex = String(10 + Math.round(smoothW * 10));
          refs.desktopRig.style.pointerEvents =
            smoothW > 0.65 && isLive ? "auto" : "none";
        }
      }

      // 3. Floating Foreground iPhone Frame (1.42x vertical parallax + deeper forward Z-plane!)
      if (refs.mobileRig) {
        const showMobile = mode === "dual" || mode === "mobile";
        if (!showMobile) {
          refs.mobileRig.style.opacity = "0";
          refs.mobileRig.style.pointerEvents = "none";
          refs.mobileRig.style.transform =
            "translate3d(60px, 0, -240px) scale(0.7)";
        } else {
          const mobY = rel * (mode === "dual" ? 112 : 84); // Faster foreground parallax in dual mode!
          const mobZ =
            (mode === "dual" ? 95 : 20) -
            Math.pow(Math.min(absRel, 1.6), 1.15) * 210 -
            pull * 75;
          const mobScale =
            lerp(0.76, 1.0, smoothW) * (1 - pull * 0.09);
          const mobRotX = clamp(-rel * 24 - velTilt * 1.2 - my * 6.5, -36, 36);
          const mobRotY = clamp(
            (mode === "dual" ? -8 : 0) + mx * 9.5,
            -18,
            14
          );
          const mobOpacity = clamp(1 - absRel * 0.92, 0, 1);

          refs.mobileRig.style.transform = `translate3d(${(mx * 22).toFixed(1)}px, calc(${mobY.toFixed(2)}vh + ${(my * 14).toFixed(1)}px), ${mobZ.toFixed(1)}px) rotateX(${mobRotX.toFixed(2)}deg) rotateY(${mobRotY.toFixed(2)}deg) scale(${mobScale.toFixed(4)})`;
          refs.mobileRig.style.opacity = mobOpacity.toFixed(3);
          refs.mobileRig.style.zIndex = String(25 + Math.round(smoothW * 10));
          refs.mobileRig.style.pointerEvents =
            smoothW > 0.65 && isLive ? "auto" : "none";
        }
      }

      // 4. Sync video playback cleanly (play when focused & section active, pause otherwise)
      const shouldPlayDesk =
        isLive && absRel < 0.78 && (mode === "dual" || mode === "desktop");
      if (refs.desktopVideo) {
        if (shouldPlayDesk && refs.desktopVideo.paused) {
          refs.desktopVideo.play().catch(() => {});
        } else if (!shouldPlayDesk && !refs.desktopVideo.paused) {
          refs.desktopVideo.pause();
        }
      }

      const shouldPlayMob =
        isLive && absRel < 0.78 && (mode === "dual" || mode === "mobile");
      if (refs.mobileVideo) {
        if (shouldPlayMob && refs.mobileVideo.paused) {
          refs.mobileVideo.play().catch(() => {});
        } else if (!shouldPlayMob && !refs.mobileVideo.paused) {
          refs.mobileVideo.pause();
        }
      }
    }

    // Update bottom scroll bar thumb
    if (progressThumbRef.current) {
      const pct = count > 1 ? pos / (count - 1) : 0;
      progressThumbRef.current.style.width = `${(33 + pct * 67).toFixed(1)}%`;
    }
  }, [count]);

  const wake = useCallback(() => {
    const eng = engineRef.current;
    if (eng.rafId) return;

    eng.lastTime = performance.now();

    const tick = (now: number) => {
      eng.rafId = 0;
      const dt = clamp((now - eng.lastTime) / 1000, 0, 1 / 30);
      eng.lastTime = now;

      // Snap target to nearest integer project shortly after wheel settles
      if (now - eng.lastWheelTime > 155) {
        eng.target = clamp(Math.round(eng.target), 0, count - 1);
      }

      // Critically-damped spring for smooth project scroll
      const k = 128;
      const d = 2 * Math.sqrt(k) * 0.92;
      eng.vel += (k * (eng.target - eng.pos) - d * eng.vel) * dt;
      eng.pos += eng.vel * dt;

      // Asymmetric 3D pull-back envelope:
      // Snaps up fast on scroll start (video shrinks back into 3D space),
      // eases back to 0 gracefully once next project locks in!
      const wheelPulse = now - eng.lastWheelTime < 175 ? 0.65 : 0;
      const rawPull = clamp(
        Math.max(
          wheelPulse,
          Math.abs(eng.vel) * 0.34 + Math.abs(eng.target - eng.pos) * 0.95
        ),
        0,
        1
      );
      const pullRate = rawPull > eng.scrollPull ? 16 : 5.6;
      eng.scrollPull = lerp(eng.scrollPull, rawPull, clamp(dt * pullRate, 0, 1));
      if (eng.scrollPull < 0.002 && rawPull === 0) eng.scrollPull = 0;

      // Smooth pointer 3D parallax
      eng.mouseX = lerp(eng.mouseX, eng.targetMouseX, clamp(dt * 7.5, 0, 1));
      eng.mouseY = lerp(eng.mouseY, eng.targetMouseY, clamp(dt * 7.5, 0, 1));

      // Update React active index only when crossing midpoint
      const rounded = clamp(Math.round(eng.pos), 0, count - 1);
      if (rounded !== activeIdxRef.current) {
        activeIdxRef.current = rounded;
        setActiveIdx(rounded);
      }

      paint();

      const settled =
        Math.abs(eng.target - eng.pos) < 0.0008 &&
        Math.abs(eng.vel) < 0.003 &&
        eng.scrollPull < 0.004 &&
        Math.abs(eng.targetMouseX - eng.mouseX) < 0.003 &&
        Math.abs(eng.targetMouseY - eng.mouseY) < 0.003 &&
        now - eng.lastWheelTime > 190;

      if (settled) {
        eng.pos = eng.target;
        eng.vel = 0;
        eng.scrollPull = 0;
        eng.mouseX = eng.targetMouseX;
        eng.mouseY = eng.targetMouseY;
        paint();
      } else {
        eng.rafId = requestAnimationFrame(tick);
      }
    };

    eng.rafId = requestAnimationFrame(tick);
  }, [count, paint]);

  // Repaint & play/pause cleanly whenever active, viewMode, or modal changes
  useEffect(() => {
    paint();
    if (active) {
      wake();
    }
  }, [active, viewMode, modal, paint, wake]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current.rafId) {
        cancelAnimationFrame(engineRef.current.rafId);
      }
    };
  }, []);

  // Wheel & Touch handlers on the section stage
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!activeRef.current || modalRef.current) return;

      let deltaY = e.deltaY;
      if (e.deltaMode === 1) deltaY *= 16;
      else if (e.deltaMode === 2) deltaY *= el.clientHeight || 700;

      if (Math.abs(e.deltaX) > Math.abs(deltaY)) return;

      const eng = engineRef.current;

      // At project 01 and scrolling UP -> seamlessly hand back to Section 2!
      if (eng.target <= 0.02 && eng.pos <= 0.08 && deltaY < 0) {
        if (onBoundaryScrollUpRef.current) {
          e.preventDefault();
          e.stopPropagation();
          onBoundaryScrollUpRef.current(deltaY);
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      const nextTarget = clamp(eng.target + deltaY * 0.0021, 0, count - 1);
      eng.target = nextTarget;
      eng.lastWheelTime = performance.now();
      wake();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!activeRef.current || modalRef.current) return;
      if (e.touches[0]) {
        engineRef.current.touchY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!activeRef.current || modalRef.current) return;
      const eng = engineRef.current;
      if (eng.touchY === null || !e.touches[0]) return;
      const curY = e.touches[0].clientY;
      const dy = eng.touchY - curY;
      eng.touchY = curY;

      if (eng.target <= 0.02 && eng.pos <= 0.08 && dy < -4) {
        onBoundaryScrollUpRef.current?.(dy * 2.4);
        return;
      }

      e.preventDefault();
      eng.target = clamp(eng.target + dy * 0.0045, 0, count - 1);
      eng.lastWheelTime = performance.now();
      wake();
    };

    const handleTouchEnd = () => {
      engineRef.current.touchY = null;
      wake();
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [count, wake]);

  // Modal Escape / Arrow keys
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setModal((m) =>
          m ? { ...m, index: (m.index + 1) % count } : null
        );
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setModal((m) =>
          m ? { ...m, index: (m.index - 1 + count) % count } : null
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, count]);

  const jumpToProject = useCallback(
    (idx: number) => {
      const eng = engineRef.current;
      eng.target = clamp(idx, 0, count - 1);
      eng.lastWheelTime = performance.now() - 120;
      // Trigger brief pull-back pulse even on click so 3D transition feels cohesive!
      eng.scrollPull = Math.max(eng.scrollPull, 0.55);
      wake();
    },
    [count, wake]
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    engineRef.current.targetMouseX = clamp(
      ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      -1,
      1
    );
    engineRef.current.targetMouseY = clamp(
      ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      -1,
      1
    );
    wake();
  };

  const handlePointerLeave = () => {
    engineRef.current.targetMouseX = 0;
    engineRef.current.targetMouseY = 0;
    wake();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (modal) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      jumpToProject(Math.min(count - 1, Math.round(engineRef.current.target) + 1));
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      if (Math.round(engineRef.current.target) <= 0) {
        onBoundaryScrollUp?.(-280);
      } else {
        jumpToProject(Math.max(0, Math.round(engineRef.current.target) - 1));
      }
    }
  };

  const currentProject = TECH_PROJECTS[activeIdx];
  const modalProject = modal ? TECH_PROJECTS[modal.index] : null;

  return (
    <div
      ref={sectionRef}
      className={styles.section}
      tabIndex={0}
      role="region"
      aria-label="Tech Work Interactive 3D Showcase"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
    >
      {/* Dynamic Soft Brand Ambient Aura */}
      <div
        className={styles.aura}
        style={{
          background: `radial-gradient(ellipse 68% 64% at 68% 52%, rgba(${currentProject.auraRgb}, 0.13) 0%, rgba(${currentProject.auraRgb}, 0.04) 44%, rgba(255,255,255,0) 76%)`,
        }}
      />

      {/* Subtle Architectural Grid */}
      <div className={styles.gridBg} />

      {/* Top Navigation Bar */}
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          {onReturnToWork && (
            <button
              type="button"
              onClick={onReturnToWork}
              className={styles.backBtn}
              aria-label="Back to Our Work"
            >
              ↑ Our Work
            </button>
          )}
          <div className={styles.sectionBadge}>
            <span
              className={styles.liveDot}
              style={{
                backgroundColor: currentProject.accent,
                boxShadow: `0 0 10px rgba(${currentProject.auraRgb}, 0.65)`,
              }}
            />
            <span>Tech Work</span>
          </div>
        </div>

        {/* Interactive View Mode Switcher */}
        <div className={styles.modeSwitch} role="group" aria-label="Device View">
          {(["dual", "desktop", "mobile"] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setViewMode(m)}
              className={`${styles.modeBtn} ${
                viewMode === m ? styles.modeBtnActive : ""
              }`}
            >
              {m === "dual" ? "Dual 3D" : m === "desktop" ? "Desktop" : "Mobile"}
            </button>
          ))}
        </div>
      </header>

      {/* Main Spatial Layout */}
      <div className={styles.layout}>
        {/* Left Editorial Rail */}
        <div className={styles.leftRail}>
          <div className={styles.indexRow}>
            <span
              className={styles.indexPill}
              style={{ backgroundColor: currentProject.accent }}
            >
              {currentProject.indexLabel} / 0{count}
            </span>
            <span className={styles.categoryLabel}>
              {currentProject.category}
            </span>
          </div>

          <div className={styles.titleMask}>
            <h2 key={currentProject.id} className={styles.projectTitle}>
              {currentProject.name}
            </h2>
          </div>

          <p className={styles.tagline}>{currentProject.tagline}</p>

          <div className={styles.tagRow}>
            {currentProject.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.expandBtn}
              onClick={() =>
                setModal({
                  index: activeIdx,
                  device: viewMode === "mobile" ? "mobile" : "desktop",
                })
              }
            >
              <span>Watch Fullscreen</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>

          {/* Direct Project Jump Index */}
          <nav className={styles.selectorList} aria-label="Tech Projects">
            {TECH_PROJECTS.map((proj, idx) => {
              const isSelected = idx === activeIdx;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => jumpToProject(idx)}
                  className={`${styles.selectorItem} ${
                    isSelected ? styles.selectorItemActive : ""
                  }`}
                >
                  <span>
                    {proj.indexLabel} — {proj.name}
                  </span>
                  <span className={styles.selectorBar}>
                    <span
                      className={styles.selectorBarFill}
                      style={{
                        backgroundColor: proj.accent,
                        transform: isSelected ? "scaleX(1)" : "scaleX(0)",
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right 3D Multi-Plane Video Stage */}
        <div className={styles.stage3d}>
          {/* Slow Background Parallax Numerals */}
          <div className={styles.watermarkLayer} aria-hidden="true">
            {TECH_PROJECTS.map((proj, idx) => (
              <div
                key={`wm-${proj.id}`}
                ref={(el) => {
                  slideRefs.current[idx].watermark = el;
                }}
                className={styles.watermarkNum}
              >
                {proj.indexLabel}
              </div>
            ))}
          </div>

          {/* 3D Dual-Device Video Slides */}
          {TECH_PROJECTS.map((proj, idx) => (
            <div key={proj.id} className={styles.projectSlide}>
              {/* Desktop 16:9 Studio Frame */}
              <div
                ref={(el) => {
                  slideRefs.current[idx].desktopRig = el;
                }}
                className={`${styles.desktopRig} ${
                  viewMode === "desktop" ? styles.desktopRigSolo : ""
                }`}
                onClick={() => setModal({ index: idx, device: "desktop" })}
                role="button"
                aria-label={`Watch ${proj.name} desktop showcase fullscreen`}
              >
                <div className={styles.desktopBezel}>
                  <div className={styles.browserChrome}>
                    <div className={styles.chromeDots}>
                      <span className={styles.chromeDot} />
                      <span className={styles.chromeDot} />
                      <span className={styles.chromeDot} />
                    </div>
                    <span className={styles.chromeUrl}>{proj.domain}</span>
                    <div style={{ width: 32 }} />
                  </div>
                  <div className={styles.desktopScreen}>
                    <video
                      ref={(el) => {
                        slideRefs.current[idx].desktopVideo = el;
                      }}
                      src={proj.desktopVideo}
                      className={styles.videoFill}
                      muted
                      loop
                      playsInline
                      preload="auto"
                    />
                    <div className={styles.deviceGlare} />
                  </div>
                </div>
              </div>

              {/* Floating Foreground 9:16 iPhone Frame (Higher 3D Parallax Depth) */}
              <div
                ref={(el) => {
                  slideRefs.current[idx].mobileRig = el;
                }}
                className={`${styles.mobileRig} ${
                  viewMode === "mobile" ? styles.mobileRigSolo : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setModal({ index: idx, device: "mobile" });
                }}
                role="button"
                aria-label={`Watch ${proj.name} mobile showcase fullscreen`}
              >
                <div className={styles.mobileBezel}>
                  <div className={styles.mobileScreen}>
                    <div className={styles.dynamicIsland} />
                    <video
                      ref={(el) => {
                        slideRefs.current[idx].mobileVideo = el;
                      }}
                      src={proj.mobileVideo}
                      className={styles.videoFill}
                      muted
                      loop
                      playsInline
                      preload="auto"
                    />
                    <div className={styles.deviceGlare} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Scroll Progress Indicator */}
      <div className={styles.bottomCue}>
        <span>Scroll</span>
        <div className={styles.scrollTrack}>
          <div ref={progressThumbRef} className={styles.scrollThumb} />
        </div>
        <span>
          {currentProject.indexLabel} / 0{count}
        </span>
      </div>

      {/* Fullscreen Video Cinema Lightbox Portal */}
      {mounted &&
        modal &&
        modalProject &&
        createPortal(
          <div
            className={styles.modalBackdrop}
            onClick={() => setModal(null)}
            onWheel={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${modalProject.name} Fullscreen Video`}
          >
            <div
              className={styles.modalTop}
              onClick={(e) => e.stopPropagation()}
            >
              <span>
                {modalProject.indexLabel} — {modalProject.name}
              </span>

              <div className={styles.modalToggle}>
                <button
                  type="button"
                  onClick={() =>
                    setModal((m) => (m ? { ...m, device: "desktop" } : null))
                  }
                  className={`${styles.modalToggleBtn} ${
                    modal.device === "desktop" ? styles.modalToggleBtnActive : ""
                  }`}
                >
                  Desktop 16:9
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setModal((m) => (m ? { ...m, device: "mobile" } : null))
                  }
                  className={`${styles.modalToggleBtn} ${
                    modal.device === "mobile" ? styles.modalToggleBtnActive : ""
                  }`}
                >
                  Mobile 9:16
                </button>
              </div>

              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setModal(null)}
              >
                Close ✕
              </button>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className={
                modal.device === "desktop"
                  ? styles.modalFrameDesktop
                  : styles.modalFrameMobile
              }
            >
              <video
                key={`${modalProject.id}-${modal.device}`}
                src={
                  modal.device === "desktop"
                    ? modalProject.desktopVideo
                    : modalProject.mobileVideo
                }
                className={styles.videoFill}
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
