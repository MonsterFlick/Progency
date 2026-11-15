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

export default function PerAppelgrenPortfolio() {
  // Navigation & Modal states
  const [activeTab, setActiveTab] = useState<"all" | "fashion" | "beauty">("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Custom cursor state
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorText, setCursorText] = useState("");
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  // Gallery slider ref
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (activeTab === "all") return true;
    return p.group.toLowerCase() === activeTab;
  });

  const currentProject = filteredProjects[activeIndex] || filteredProjects[0];

  // Mouse move for custom cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Update active slide index based on scroll position in horizontal slider
  const handleSliderScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const cardWidth = clientWidth > 768 ? 480 + 32 : 320 + 20;
    const newIdx = Math.min(
      filteredProjects.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    setActiveIndex(newIdx);
  }, [filteredProjects.length]);

  // Drag to scroll handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
  };

  const handleMouseMoveSlider = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Scroll to index
  const scrollToIndex = (idx: number) => {
    if (!sliderRef.current) return;
    const cardWidth = window.innerWidth > 768 ? 480 + 32 : 320 + 20;
    sliderRef.current.scrollTo({
      left: idx * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(idx);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAFAF8] text-[#0F1118] font-sans overflow-x-hidden selection:bg-[#0F1118] selection:text-white">
      {/* Custom Magnetic Cursor */}
      <div
        className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75 ease-out hidden md:flex items-center justify-center"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          width: isHoveringCard ? 84 : 10,
          height: isHoveringCard ? 84 : 10,
          backgroundColor: isHoveringCard ? "rgba(15, 17, 24, 0.9)" : "#0F1118",
          backdropFilter: isHoveringCard ? "blur(4px)" : "none",
        }}
      >
        {isHoveringCard && (
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white">
            {cursorText || "VIEW"}
          </span>
        )}
      </div>

      {/* Top Fixed Editorial Header */}
      <header className="fixed top-0 left-0 w-full z-40 px-6 py-5 flex items-center justify-between mix-blend-difference text-white">
        {/* Archive Button */}
        <button
          onClick={() => setIsArchiveOpen(true)}
          className="group flex items-center gap-2 text-xs font-medium tracking-[0.16em] uppercase transition-opacity hover:opacity-75"
        >
          <span>Archive</span>
          <span className="text-[10px] text-white/60">({projects.length})</span>
        </button>

        {/* Brand / Photographer Name */}
        <button
          onClick={() => {
            scrollToIndex(0);
            setIsArchiveOpen(false);
            setIsContactOpen(false);
          }}
          className="text-xs font-semibold tracking-[0.22em] uppercase transition-opacity hover:opacity-75"
        >
          Per Appelgren
        </button>

        {/* Contact / Info Button */}
        <button
          onClick={() => setIsContactOpen(true)}
          className="text-xs font-medium tracking-[0.16em] uppercase transition-opacity hover:opacity-75"
        >
          Contact
        </button>
      </header>

      {/* Main Editorial Hero Gallery Section */}
      <section className="relative min-h-screen w-full flex flex-col justify-between pt-24 pb-12 overflow-hidden">
        {/* Giant Dynamic Background Title */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
          <div
            key={currentProject?.slug}
            className="w-full text-center whitespace-nowrap text-[clamp(72px,16vw,240px)] font-normal uppercase leading-[0.8] tracking-tight text-[#0F1118]/[0.06] select-none transition-all duration-700 ease-out transform"
          >
            {currentProject?.homepageTitle || "EDITORIAL"}
          </div>
        </div>

        {/* Top Controls: Filter Pills */}
        <div className="relative z-10 w-full px-6 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {(["all", "fashion", "beauty"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setActiveIndex(0);
                  if (sliderRef.current) sliderRef.current.scrollLeft = 0;
                }}
                className={`text-xs font-semibold uppercase tracking-[0.15em] transition-all relative py-1 ${
                  activeTab === tab
                    ? "text-[#0F1118] border-b border-[#0F1118]"
                    : "text-[#0F1118]/40 hover:text-[#0F1118]"
                }`}
              >
                {tab === "all" ? `All (${projects.length})` : tab}
              </button>
            ))}
          </div>

          {/* Current Project Caption */}
          <div className="hidden lg:block text-right">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-[#0F1118]/60">
              {currentProject?.homepageCaption}
            </span>
          </div>
        </div>

        {/* Draggable Horizontal Carousel of Photography Cards */}
        <div
          ref={sliderRef}
          onScroll={handleSliderScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMoveSlider}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="relative z-10 w-full overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing px-6 md:px-16 py-8 flex items-center gap-8"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {filteredProjects.map((project, idx) => {
            const isActive = idx === activeIndex;
            return (
              <article
                key={project.slug}
                onClick={() => setSelectedProject(project)}
                onMouseEnter={() => {
                  setIsHoveringCard(true);
                  setCursorText("VIEW");
                }}
                onMouseLeave={() => {
                  setIsHoveringCard(false);
                  setCursorText("");
                }}
                className={`group relative shrink-0 transition-all duration-500 select-none ${
                  isActive ? "scale-100 opacity-100" : "scale-[0.96] opacity-80 hover:opacity-100"
                }`}
                style={{
                  width: "clamp(300px, 32vw, 480px)",
                  scrollSnapAlign: "center",
                }}
              >
                {/* Image Container with Editorial Ratio */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-200 shadow-sm transition-transform duration-700 ease-out group-hover:shadow-xl">
                  <Image
                    src={project.hero}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 320px, 480px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    priority={idx < 3}
                  />

                  {/* Top-Right Badge: Image Count */}
                  <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-medium tracking-widest text-white uppercase">
                    {project.count} photos
                  </div>

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="text-white">
                      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/80">
                        {project.group} — {project.year}
                      </p>
                      <h3 className="text-base font-semibold tracking-wide uppercase mt-1">
                        {project.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Meta info */}
                <div className="mt-4 flex items-center justify-between text-xs tracking-[0.14em] uppercase text-[#0F1118]/80">
                  <span className="font-semibold text-[#0F1118] truncate max-w-[280px]">
                    {project.homepageTitle}
                  </span>
                  <span className="text-[11px] font-mono text-[#0F1118]/50">
                    {String(idx + 1).padStart(2, "0")} / {String(filteredProjects.length).padStart(2, "0")}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Navigation Controls & Slider Indicators */}
        <div className="relative z-10 w-full px-6 max-w-7xl mx-auto flex items-center justify-between">
          {/* Arrow Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="p-3 rounded-full border border-[#0F1118]/20 hover:border-[#0F1118] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous Project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollToIndex(Math.min(filteredProjects.length - 1, activeIndex + 1))}
              disabled={activeIndex === filteredProjects.length - 1}
              className="p-3 rounded-full border border-[#0F1118]/20 hover:border-[#0F1118] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next Project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium tracking-widest text-[#0F1118]">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <div className="w-24 sm:w-40 h-[1.5px] bg-[#0F1118]/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0F1118] transition-all duration-300"
                style={{
                  width: `${((activeIndex + 1) / filteredProjects.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-mono text-[#0F1118]/40">
              {String(filteredProjects.length).padStart(2, "0")}
            </span>
          </div>

          {/* View Archive link */}
          <button
            onClick={() => setIsArchiveOpen(true)}
            className="text-xs font-semibold tracking-[0.16em] uppercase hover:underline"
          >
            Index view →
          </button>
        </div>
      </section>

      {/* ARCHIVE DRAWER / MODAL */}
      {isArchiveOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAFAF8] flex flex-col justify-between overflow-y-auto animate-in fade-in duration-300">
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-[#FAFAF8]/95 backdrop-blur-md px-6 py-6 border-b border-[#0F1118]/10 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#0F1118]">
              Project Archive ({projects.length})
            </h2>
            <button
              onClick={() => setIsArchiveOpen(false)}
              className="text-xs font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-full border border-[#0F1118]/20 hover:bg-[#0F1118] hover:text-white transition-all"
            >
              Close ✕
            </button>
          </div>

          {/* Archive Grid */}
          <div className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p, i) => (
                <div
                  key={p.slug}
                  onClick={() => {
                    setSelectedProject(p);
                    setIsArchiveOpen(false);
                  }}
                  className="group cursor-pointer flex flex-col gap-3"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-200 rounded-sm">
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
                      <h4 className="font-semibold text-[#0F1118] group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-[#0F1118]/50 mt-0.5">{p.group}</p>
                    </div>
                    <span className="font-mono text-[#0F1118]/40">{p.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTACT & ABOUT DRAWER / MODAL */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F1118] text-white flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-400">
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-[#0F1118]/95 backdrop-blur-md px-6 py-6 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60">
              Information & Contact
            </span>
            <button
              onClick={() => setIsContactOpen(false)}
              className="text-xs font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all"
            >
              Close ✕
            </button>
          </div>

          {/* Main Info Content */}
          <div className="max-w-5xl mx-auto w-full px-6 py-16 flex-1 flex flex-col gap-16">
            {/* Bio Header */}
            <div className="max-w-3xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal leading-relaxed text-white/95">
                Hi! I am Per! I`m a German-Swedish photographer based between Paris and Berlin, with over a decade of experience shooting for leading international brands and editorials.
              </h2>
              <p className="mt-6 text-base sm:text-lg text-white/70 leading-relaxed font-light">
                My work blurs between the lines of fashion and beauty, defined by bold use of colour, angles and expressions. Beyond aesthetics, my imagery creates a stage for individuality, celebrating diversity and giving talent the freedom to express themselves without boundaries.
              </p>
            </div>

            {/* Studios & Representation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t border-white/10 text-xs tracking-[0.12em] uppercase text-white/80">
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
                  PR Agent: Luise Neubert<br />
                  luise@perappelgren.de
                </p>
              </div>
            </div>

            {/* Message Form */}
            <div className="pt-10 border-t border-white/10 max-w-xl">
              <h3 className="text-lg font-semibold tracking-wide uppercase mb-6">
                Send a Message
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Thank you! Your message has been received.");
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

          {/* Footer inside drawer */}
          <div className="px-6 py-8 border-t border-white/10 text-[11px] tracking-[0.16em] uppercase text-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>Copyright © Per Appelgren. All rights reserved.</div>
            <div>Design &amp; development by Shakuro</div>
          </div>
        </div>
      )}

      {/* PROJECT SESSION FULLSCREEN LIGHTBOX / GALLERY */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#FAFAF8] overflow-y-auto flex flex-col justify-between animate-in zoom-in-95 duration-300">
          {/* Top Sticky Bar */}
          <div className="sticky top-0 z-20 bg-[#FAFAF8]/95 backdrop-blur-md px-6 py-6 border-b border-[#0F1118]/10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#0F1118]">
                {selectedProject.title}
              </h2>
              <span className="text-[11px] text-[#0F1118]/50 uppercase tracking-widest">
                {selectedProject.group} — {selectedProject.year} ({selectedProject.images.length} photographs)
              </span>
            </div>
            <button
              onClick={() => setSelectedProject(null)}
              className="text-xs font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-full border border-[#0F1118]/20 hover:bg-[#0F1118] hover:text-white transition-all"
            >
              Close ✕
            </button>
          </div>

          {/* Editorial Photo Stream */}
          <div className="max-w-4xl mx-auto w-full px-6 py-12 flex flex-col gap-12">
            {selectedProject.images.map((img, i) => (
              <div key={img.id || i} className="relative w-full aspect-[3/4] bg-zinc-200 overflow-hidden shadow-sm">
                <Image
                  src={img.src}
                  alt={img.alt || selectedProject.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 900px"
                  className="object-cover"
                  priority={i < 2}
                />
              </div>
            ))}
          </div>

          {/* Bottom Bar: Back to top / Close */}
          <div className="px-6 py-8 border-t border-[#0F1118]/10 flex items-center justify-between text-xs tracking-widest uppercase">
            <button
              onClick={() => setSelectedProject(null)}
              className="font-semibold hover:underline"
            >
              ← Back to Overview
            </button>
            <span className="text-[#0F1118]/40">
              End of session
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
