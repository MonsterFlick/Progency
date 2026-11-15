"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import projectsData from "@/data/perappelgren_projects.json";

export interface ProjectImage {
  id: string;
  src: string;
  alt: string;
  index: number;
}

export interface Project {
  slug: string;
  title: string;
  showOnHomepage: boolean;
  homepageTitle: string;
  homepageCaption: string;
  group: string;
  filterSlug: string;
  filterLabel: string;
  year: number;
  count: number;
  hero: string;
  images: ProjectImage[];
}

const projects: Project[] = projectsData as Project[];

// Staggered letter ticker component for Per Appelgren header links
function StaggerText({ text }: { text: string }) {
  return (
    <span className="inline-flex overflow-hidden group">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="relative inline-block transition-transform duration-300 ease-out group-hover:-translate-y-full"
          style={{ transitionDelay: `${i * 22}ms` }}
        >
          <span className="block">{char === " " ? "\u00A0" : char}</span>
          <span className="absolute top-full left-0 block">{char === " " ? "\u00A0" : char}</span>
        </span>
      ))}
    </span>
  );
}

export default function PerAppelgrenPortfolio() {
  // Navigation & View states
  const [activeTab, setActiveTab] = useState<"all" | "fashion" | "beauty">("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeSessionImageIdx, setActiveSessionImageIdx] = useState(0);

  // Custom Cursor state
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorTarget, setCursorTarget] = useState({ x: -100, y: -100 });
  const [cursorMode, setCursorMode] = useState<"default" | "drag" | "view" | "pointer">("default");
  const [isClient, setIsClient] = useState(false);

  // Drag & Scroll Physics state
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const targetScrollPosRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const lastDragXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [cardTiltVelocity, setCardTiltVelocity] = useState(0);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    if (activeTab === "all") return true;
    return p.group.toLowerCase() === activeTab;
  });

  const currentProject = filteredProjects[activeIndex] || filteredProjects[0];

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Smooth lerped cursor animation loop
  useEffect(() => {
    let rafId = 0;
    const lerpCursor = () => {
      setCursorPos((prev) => ({
        x: prev.x + (cursorTarget.x - prev.x) * 0.22,
        y: prev.y + (cursorTarget.y - prev.y) * 0.22,
      }));
      rafId = requestAnimationFrame(lerpCursor);
    };
    rafId = requestAnimationFrame(lerpCursor);
    return () => cancelAnimationFrame(rafId);
  }, [cursorTarget]);

  // Window mouse move listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorTarget({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Physics animation loop for smooth drag & momentum
  useEffect(() => {
    let rafId = 0;

    const updatePhysics = () => {
      const container = containerRef.current;
      if (!container) return;

      const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);

      // If not dragging, apply inertia & smooth lerp towards target
      if (!isDraggingRef.current) {
        // Friction dampening
        velocityRef.current *= 0.92;
        targetScrollPosRef.current += velocityRef.current;

        // Bounce back if past bounds
        if (targetScrollPosRef.current < 0) {
          targetScrollPosRef.current += (0 - targetScrollPosRef.current) * 0.15;
          velocityRef.current = 0;
        } else if (targetScrollPosRef.current > maxScroll) {
          targetScrollPosRef.current += (maxScroll - targetScrollPosRef.current) * 0.15;
          velocityRef.current = 0;
        }
      }

      // Smooth lerp scroll position
      const diff = targetScrollPosRef.current - scrollPosRef.current;
      scrollPosRef.current += diff * 0.16;

      container.scrollLeft = scrollPosRef.current;
      setCardTiltVelocity(velocityRef.current);

      // Update active index based on center of view
      const cardWidth = window.innerWidth > 768 ? 480 + 48 : 310 + 24;
      const computedIndex = Math.min(
        filteredProjects.length - 1,
        Math.max(0, Math.round(scrollPosRef.current / cardWidth))
      );
      setActiveIndex(computedIndex);

      rafId = requestAnimationFrame(updatePhysics);
    };

    rafId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(rafId);
  }, [filteredProjects.length]);

  // Mouse Drag Events
  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    lastDragXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    setCursorMode("drag");
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const deltaX = e.clientX - lastDragXRef.current;

    targetScrollPosRef.current -= deltaX * 1.35;
    velocityRef.current = (-deltaX / dt) * 16;

    lastDragXRef.current = e.clientX;
    lastTimeRef.current = now;
  };

  const onMouseUp = () => {
    isDraggingRef.current = false;
    setCursorMode("default");
  };

  // Wheel horizontal scroll support
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      // Allow diagonal or shift-wheel to glide horizontally
      targetScrollPosRef.current += e.deltaY * 1.1;
      velocityRef.current = e.deltaY * 0.12;
    } else {
      targetScrollPosRef.current += e.deltaX * 1.1;
      velocityRef.current = e.deltaX * 0.12;
    }
  };

  // Touch drag support for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.touches[0].clientX;
    lastDragXRef.current = e.touches[0].clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const deltaX = e.touches[0].clientX - lastDragXRef.current;

    targetScrollPosRef.current -= deltaX * 1.25;
    velocityRef.current = (-deltaX / dt) * 14;

    lastDragXRef.current = e.touches[0].clientX;
    lastTimeRef.current = now;
  };

  const onTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Navigation scroll to index
  const scrollToIndex = (idx: number) => {
    const cardWidth = window.innerWidth > 768 ? 480 + 48 : 310 + 24;
    targetScrollPosRef.current = idx * cardWidth;
    setActiveIndex(idx);
  };

  // Clamp velocity for 3D drum perspective rotation
  const drumRotationY = Math.max(-18, Math.min(18, cardTiltVelocity * -0.45));
  const drumSkewX = Math.max(-6, Math.min(6, cardTiltVelocity * -0.15));

  return (
    <div
      onMouseUp={onMouseUp}
      className="relative min-h-screen w-full bg-[#FAF9F5] text-[#070912] font-sans overflow-x-hidden selection:bg-[#070912] selection:text-white"
    >
      {/* 1. Custom Interactive Magnetic Cursor */}
      {isClient && (
        <div
          className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,background-color,border-color,backdrop-filter] duration-300 ease-out hidden md:flex items-center justify-center will-change-transform"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            width: cursorMode === "view" || cursorMode === "drag" ? 82 : 10,
            height: cursorMode === "view" || cursorMode === "drag" ? 82 : 10,
            backgroundColor:
              cursorMode === "view" || cursorMode === "drag"
                ? "rgba(7, 9, 18, 0.92)"
                : "#070912",
            backdropFilter: cursorMode === "view" || cursorMode === "drag" ? "blur(4px)" : "none",
          }}
        >
          {(cursorMode === "view" || cursorMode === "drag") && (
            <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-white select-none">
              {cursorMode === "drag" ? "DRAG" : "VIEW"}
            </span>
          )}
        </div>
      )}

      {/* 2. Top Minimalist Header with Letter-Stagger Hover */}
      <header className="fixed top-0 left-0 w-full z-40 px-6 sm:px-10 py-5 flex items-center justify-between text-[#070912] bg-[#FAF9F5]/70 backdrop-blur-md border-b border-[#070912]/5">
        {/* Archive Button */}
        <button
          onClick={() => setIsArchiveOpen(true)}
          onMouseEnter={() => setCursorMode("pointer")}
          onMouseLeave={() => setCursorMode("default")}
          className="text-[11px] font-semibold tracking-[0.16em] uppercase flex items-center gap-2"
        >
          <StaggerText text="ARCHIVE" />
          <span className="text-[10px] font-mono text-[#070912]/40">({projects.length})</span>
        </button>

        {/* Center Photographer / Brand Name */}
        <button
          onClick={() => {
            scrollToIndex(0);
            setIsArchiveOpen(false);
            setIsContactOpen(false);
          }}
          onMouseEnter={() => setCursorMode("pointer")}
          onMouseLeave={() => setCursorMode("default")}
          className="text-xs sm:text-[13px] font-bold tracking-[0.24em] uppercase"
        >
          <StaggerText text="PER APPELGREN" />
        </button>

        {/* Contact Button */}
        <button
          onClick={() => setIsContactOpen(true)}
          onMouseEnter={() => setCursorMode("pointer")}
          onMouseLeave={() => setCursorMode("default")}
          className="text-[11px] font-semibold tracking-[0.16em] uppercase"
        >
          <StaggerText text="CONTACT" />
        </button>
      </header>

      {/* 3. Main Hero Gallery Stage */}
      <section
        onWheel={onWheel}
        className="relative min-h-screen w-full flex flex-col justify-between pt-24 pb-8 overflow-hidden"
      >
        {/* Massive Dynamic Typographic Backdrop */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none">
          <div
            className="w-full text-center whitespace-nowrap text-[clamp(90px,18.5vw,300px)] font-normal uppercase leading-[0.76] tracking-tight text-[#070912]/[0.05] transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `translate3d(${-cardTiltVelocity * 3.5}px, 0, 0)`,
            }}
          >
            {currentProject?.homepageTitle || "EDITORIAL"}
          </div>
        </div>

        {/* Top Control Bar: Category Filters & Project Caption */}
        <div className="relative z-10 w-full px-6 sm:px-10 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-8">
            {(["all", "fashion", "beauty"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  scrollToIndex(0);
                }}
                className={`text-xs font-semibold uppercase tracking-[0.16em] transition-all relative py-1 ${
                  activeTab === tab
                    ? "text-[#070912] border-b border-[#070912]"
                    : "text-[#070912]/40 hover:text-[#070912]"
                }`}
              >
                {tab === "all" ? `ALL (${projects.length})` : tab}
              </button>
            ))}
          </div>

          {/* Current Project Caption */}
          <div className="hidden lg:flex items-center gap-4 text-right">
            <span className="text-[11px] font-medium tracking-[0.16em] uppercase text-[#070912]/60">
              {currentProject?.homepageCaption}
            </span>
          </div>
        </div>

        {/* 4. Horizontal 3D Drum Stream / Carousel of Editorial Cards */}
        <div
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="relative z-10 w-full overflow-x-hidden no-scrollbar py-6 sm:py-10 px-6 sm:px-16 flex items-center gap-8 sm:gap-12 cursor-grab active:cursor-grabbing select-none"
          style={{ perspective: "1400px" }}
        >
          <div
            ref={trackRef}
            className="flex items-center gap-8 sm:gap-12 will-change-transform"
          >
            {filteredProjects.map((project, idx) => {
              const isActive = idx === activeIndex;

              return (
                <article
                  key={project.slug}
                  onClick={() => {
                    // Only open if not currently dragging
                    if (Math.abs(velocityRef.current) < 2) {
                      setSelectedProject(project);
                      setActiveSessionImageIdx(0);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!isDraggingRef.current) setCursorMode("view");
                  }}
                  onMouseLeave={() => {
                    if (!isDraggingRef.current) setCursorMode("default");
                  }}
                  className="group relative shrink-0 transition-transform duration-300 ease-out will-change-transform"
                  style={{
                    width: "clamp(290px, 32vw, 470px)",
                    transform: `rotateY(${drumRotationY}deg) skewX(${drumSkewX}deg)`,
                  }}
                >
                  {/* Editorial Photo Frame (1439x1919 exact ratio) */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-200 shadow-md group-hover:shadow-2xl transition-all duration-700 ease-out">
                    <Image
                      src={project.hero}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 310px, 480px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      priority={idx < 3}
                    />

                    {/* Glossy luxury light sweep overlay */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      style={{
                        background:
                          "linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0) 70%)",
                      }}
                    />

                    {/* Image count pill */}
                    <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-mono tracking-widest text-white uppercase">
                      {project.count} photos
                    </div>

                    {/* Hover Card Reveal */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <div className="text-white">
                        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/70">
                          {project.group} — {project.year}
                        </p>
                        <h3 className="text-base font-semibold tracking-wide uppercase mt-1">
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Meta */}
                  <div className="mt-4 flex items-center justify-between text-xs tracking-[0.14em] uppercase text-[#070912]/80">
                    <span className="font-semibold text-[#070912] truncate max-w-[260px]">
                      {project.homepageTitle}
                    </span>
                    <span className="text-[11px] font-mono text-[#070912]/40">
                      {String(idx + 1).padStart(2, "0")} / {String(filteredProjects.length).padStart(2, "0")}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* 5. Bottom Navigation & Slider Track Controls */}
        <div className="relative z-10 w-full px-6 sm:px-10 max-w-7xl mx-auto flex items-center justify-between">
          {/* Arrow Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="p-3 rounded-full border border-[#070912]/20 hover:border-[#070912] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous Project"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollToIndex(Math.min(filteredProjects.length - 1, activeIndex + 1))}
              disabled={activeIndex === filteredProjects.length - 1}
              className="p-3 rounded-full border border-[#070912]/20 hover:border-[#070912] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next Project"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium tracking-widest text-[#070912]">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <div className="w-24 sm:w-48 h-[1.5px] bg-[#070912]/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#070912] transition-all duration-300 ease-out"
                style={{
                  width: `${((activeIndex + 1) / filteredProjects.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-mono text-[#070912]/40">
              {String(filteredProjects.length).padStart(2, "0")}
            </span>
          </div>

          {/* Open Archive View Shortcut */}
          <button
            onClick={() => setIsArchiveOpen(true)}
            className="text-[11px] font-semibold tracking-[0.18em] uppercase hover:underline"
          >
            Index view →
          </button>
        </div>
      </section>

      {/* 6. ARCHIVE FULLSCREEN DRAWER */}
      {isArchiveOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF9F5] flex flex-col justify-between overflow-y-auto animate-in fade-in duration-300">
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-[#FAF9F5]/90 backdrop-blur-md px-6 sm:px-10 py-6 border-b border-[#070912]/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#070912]">
                Archive
              </h2>
              <span className="text-[11px] font-mono text-[#070912]/40">
                ({projects.length} Works)
              </span>
            </div>
            <button
              onClick={() => setIsArchiveOpen(false)}
              className="text-xs font-semibold tracking-[0.2em] uppercase px-5 py-2.5 rounded-full border border-[#070912]/20 hover:bg-[#070912] hover:text-white transition-all"
            >
              Close ✕
            </button>
          </div>

          {/* Archive Grid */}
          <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-12 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {projects.map((p) => (
                <div
                  key={p.slug}
                  onClick={() => {
                    setSelectedProject(p);
                    setActiveSessionImageIdx(0);
                    setIsArchiveOpen(false);
                  }}
                  className="group cursor-pointer flex flex-col gap-3"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-200">
                    <Image
                      src={p.hero}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-white font-mono uppercase tracking-widest">
                      {p.count} photos
                    </div>
                  </div>
                  <div className="flex items-start justify-between text-xs tracking-[0.14em] uppercase pt-1">
                    <div>
                      <h4 className="font-semibold text-[#070912] group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-[#070912]/50 mt-0.5">{p.group}</p>
                    </div>
                    <span className="font-mono text-[#070912]/40">{p.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. CONTACT & ABOUT DRAWER */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 bg-[#070912] text-white flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-400">
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-[#070912]/95 backdrop-blur-md px-6 sm:px-10 py-6 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50">
              Information & Contact
            </span>
            <button
              onClick={() => setIsContactOpen(false)}
              className="text-xs font-semibold tracking-[0.2em] uppercase px-5 py-2.5 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all"
            >
              Close ✕
            </button>
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto w-full px-6 sm:px-10 py-16 flex-1 flex flex-col gap-16">
            {/* Bio Header */}
            <div className="max-w-3xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal leading-relaxed text-white/95">
                Hi! I am Per! I`m a German-Swedish photographer based between Paris and Berlin, with over a decade of experience shooting for leading international brands and editorials.
              </h2>
              <p className="mt-6 text-base sm:text-lg text-white/70 leading-relaxed font-light">
                My work blurs between the lines of fashion and beauty, defined by bold use of colour, angles and expressions. Beyond aesthetics, my imagery creates a stage for individuality, celebrating diversity and giving talent the freedom to express themselves without boundaries.
              </p>
            </div>

            {/* Studios & Representation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t border-white/10 text-xs tracking-[0.14em] uppercase text-white/80">
              {/* Studio */}
              <div>
                <h4 className="text-white font-semibold mb-3">Studio</h4>
                <p className="text-white/60 leading-relaxed">
                  Meta Studio Berlin<br />
                  Köpenicker Str. 187/188<br />
                  10997 Berlin
                </p>
              </div>

              {/* Office & Direct */}
              <div>
                <h4 className="text-white font-semibold mb-3">Office</h4>
                <p className="text-white/60 leading-relaxed">
                  Per Appelgren Photography<br />
                  Rathenauplatz 17 50674 Köln
                </p>
                <div className="mt-4 flex flex-col gap-1 text-white/80">
                  <a href="tel:+4915126995494" className="hover:underline">+49 151 2699 5494</a>
                  <a href="mailto:hello@perappelgren.de" className="hover:underline">hello@perappelgren.de</a>
                </div>
              </div>

              {/* Representation & PR */}
              <div>
                <h4 className="text-white font-semibold mb-3">Representation & PR</h4>
                <p className="text-white/60 leading-relaxed">
                  SCHIERKE.HOTTAS Artist Management<br />
                  mondi@schierke.com<br />
                  +49 89 189 55 25 21
                </p>
                <p className="text-white/60 mt-4 leading-relaxed">
                  PR: Luise Neubert<br />
                  luise@perappelgren.de
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="pt-10 border-t border-white/10 max-w-xl">
              <h3 className="text-lg font-semibold tracking-wider uppercase mb-6">
                Send a Message
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Thank you! Your message has been sent to Per Appelgren.");
                  setIsContactOpen(false);
                }}
                className="flex flex-col gap-5 text-sm"
              >
                <div>
                  <input
                    type="text"
                    required
                    placeholder="NAME"
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/40 focus:border-white focus:outline-none tracking-widest text-xs uppercase"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="EMAIL"
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/40 focus:border-white focus:outline-none tracking-widest text-xs uppercase"
                  />
                </div>
                <div>
                  <textarea
                    rows={3}
                    required
                    placeholder="MESSAGE"
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/40 focus:border-white focus:outline-none tracking-widest text-xs uppercase resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-[0.2em] hover:bg-white/90 transition-all self-start"
                >
                  Send Message →
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-10 py-8 border-t border-white/10 text-[11px] tracking-[0.16em] uppercase text-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>Copyright © Per Appelgren. All rights reserved.</div>
            <div>Design &amp; development by Shakuro</div>
          </div>
        </div>
      )}

      {/* 8. PROJECT SESSION LOOKBOOK LIGHTBOX */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#FAF9F5] overflow-y-auto flex flex-col justify-between animate-in zoom-in-95 duration-300">
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-[#FAF9F5]/90 backdrop-blur-md px-6 sm:px-10 py-6 border-b border-[#070912]/10 flex items-center justify-between">
            <div>
              <h2 className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#070912]">
                {selectedProject.title}
              </h2>
              <span className="text-[10px] sm:text-[11px] font-mono text-[#070912]/50 uppercase tracking-widest">
                {selectedProject.group} — {selectedProject.year} ({selectedProject.images.length} Photographs)
              </span>
            </div>
            <button
              onClick={() => setSelectedProject(null)}
              className="text-xs font-semibold tracking-[0.2em] uppercase px-5 py-2.5 rounded-full border border-[#070912]/20 hover:bg-[#070912] hover:text-white transition-all"
            >
              Close ✕
            </button>
          </div>

          {/* Editorial Stream */}
          <div className="max-w-4xl mx-auto w-full px-6 py-12 flex flex-col gap-16">
            {selectedProject.images.map((img, i) => (
              <div
                key={img.id || i}
                className="relative w-full aspect-[3/4] bg-zinc-200 overflow-hidden shadow-sm"
              >
                <Image
                  src={img.src}
                  alt={img.alt || selectedProject.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 920px"
                  className="object-cover"
                  priority={i < 2}
                />
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="px-6 sm:px-10 py-8 border-t border-[#070912]/10 flex items-center justify-between text-xs tracking-widest uppercase">
            <button
              onClick={() => setSelectedProject(null)}
              className="font-semibold hover:underline"
            >
              ← Back to Overview
            </button>
            <span className="text-[#070912]/40 font-mono">
              End of session
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
