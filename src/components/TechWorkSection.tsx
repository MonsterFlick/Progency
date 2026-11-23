"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  CylinderCarousel,
  type CylinderCarouselItem,
} from "@/components/ui/cylinder-carousel";

export interface TechProject {
  id: "fertisure" | "alphatech";
  title: string;
  category: string;
  tech: string;
  video: string;
  poster: string;
  perspectiveText: string;
}

const TECH_PROJECTS: TechProject[] = [
  {
    id: "fertisure",
    title: "FERTISURE MEDTECH",
    category: "CLINICAL PLATFORM",
    tech: "NEXT.JS 16 • FASTAPI • CLINICAL AI",
    video: "/media/tech-showcase/fertisure_landscape_1920x1080.mp4",
    poster: "/media/tech-showcase/fertisure_poster.webp",
    perspectiveText:
      "FERTISURE MEDTECH • ADVANCED CLINICAL TELEMETRY • ENCRYPTED PATIENT PORTALS • REAL-TIME LABORATORY DATA PIPELINES • REGULATORY HIPAA COMPLIANCE • ULTRA-SECURE MEDICAL WORKFLOWS",
  },
  {
    id: "alphatech",
    title: "ALPHATECH NUTRITION",
    category: "PERFORMANCE COMMERCE",
    tech: "NEXT.JS 16 • THREE.JS • EDGE COMMERCE",
    video: "/media/tech-showcase/alphatech_landscape_1920x1080.mp4",
    poster: "/media/tech-showcase/alphatech_poster.webp",
    perspectiveText:
      "ALPHATECH NUTRITION • HIGH-CONVERTING SPORTS COMMERCE • 3D INTERACTIVE SUPPLEMENT SHOWCASE • ULTRA-FAST PRODUCT CATALOG • EDGE PRE-FETCH CHECKOUT • LIGHTNING FAST DIGITAL STOREFRONT",
  },
];

// 4-sided rotating cylinder alternating between FertiSure and AlphaTech
const CYLINDER_ITEMS: CylinderCarouselItem[] = [
  {
    id: "fertisure-1",
    projectId: "fertisure",
    title: "FERTISURE MEDTECH",
    src: "/media/tech-showcase/fertisure_poster.webp",
    tech: "MEDTECH / CLINICAL",
    category: "HEALTHCARE",
  },
  {
    id: "alphatech-1",
    projectId: "alphatech",
    title: "ALPHATECH NUTRITION",
    src: "/media/tech-showcase/alphatech_poster.webp",
    tech: "SPORTS / COMMERCE",
    category: "PERFORMANCE",
  },
  {
    id: "fertisure-2",
    projectId: "fertisure",
    title: "FERTISURE MEDTECH",
    src: "/media/tech-showcase/fertisure_poster.webp",
    tech: "CLINICAL TELEMETRY",
    category: "HEALTHCARE",
  },
  {
    id: "alphatech-2",
    projectId: "alphatech",
    title: "ALPHATECH NUTRITION",
    src: "/media/tech-showcase/alphatech_poster.webp",
    tech: "DIGITAL STOREFRONT",
    category: "PERFORMANCE",
  },
];

export function TechWorkSection() {
  const [selectedProjectId, setSelectedProjectId] = useState<"fertisure" | "alphatech">("fertisure");
  const targetRef = useRef<HTMLDivElement | null>(null);

  // Skiper 28 Scroll-Driven 3D Perspective Animation
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Well-bounded translation so text stays seamlessly within viewport bounds
  const yMotionValue = useTransform(scrollYProgress, [0, 1], [140, -100]);
  const transform = useMotionTemplate`rotateX(28deg) translateY(${yMotionValue}px) translateZ(10px)`;

  const currentProject =
    TECH_PROJECTS.find((p) => p.id === selectedProjectId) ?? TECH_PROJECTS[0];

  // Toggle between FertiSure and AlphaTech
  const handleToggleProject = useCallback(() => {
    setSelectedProjectId((prev) => (prev === "fertisure" ? "alphatech" : "fertisure"));
  }, []);

  // When text reaches end of scroll, loop back to start and advance to next project preview
  useEffect(() => {
    let isRewinding = false;
    return scrollYProgress.on("change", (progress) => {
      if (progress > 0.97 && !isRewinding) {
        isRewinding = true;
        handleToggleProject();
        if (targetRef.current) {
          const top = targetRef.current.offsetTop;
          window.scrollTo({ top, behavior: "smooth" });
        }
        setTimeout(() => {
          isRewinding = false;
        }, 1200);
      }
    });
  }, [scrollYProgress, handleToggleProject]);

  return (
    <div
      id="tech-work"
      ref={targetRef}
      className="relative z-0 h-[300vh] w-full bg-[#0a0a0b] text-white select-none overflow-x-hidden"
    >
      {/* Subtle indicator at top of track */}
      <div className="absolute left-1/2 top-[5%] grid -translate-x-1/2 content-start justify-items-center gap-3 text-center text-white/50 pointer-events-none z-20">
        <span className="relative max-w-[14ch] text-[10px] font-mono uppercase tracking-widest opacity-40 after:absolute after:left-1/2 after:top-full after:h-8 after:w-px after:bg-gradient-to-b after:from-white/40 after:to-transparent after:content-['']">
          scroll to explore
        </span>
      </div>

      {/* Seamless Sticky Fullscreen Stage (Height strictly capped to 100vh with no overflow) */}
      <div
        className="sticky top-0 h-screen h-[100svh] max-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-transparent px-4 py-3"
        style={{
          transformStyle: "preserve-3d",
          perspective: "200px",
        }}
      >
        {/* Apple-Like Smaller Video (Sized cleanly to stay within viewport) */}
        <div className="relative w-full max-w-xl md:max-w-2xl aspect-video max-h-[36vh] rounded-2xl md:rounded-3xl flex items-center justify-center mb-2 z-20 shrink-0">
          {/* Apple-Style Ambient Blurred Background Glow (Duplicate video behind with heavy blur) */}
          <div
            className="absolute inset-0 -z-10 scale-110 rounded-2xl md:rounded-3xl opacity-70 blur-3xl overflow-hidden pointer-events-none transition-all duration-700"
            aria-hidden="true"
          >
            <video
              key={`blur-${currentProject.id}`}
              src={currentProject.video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-125 filter blur-3xl"
            />
          </div>

          {/* Clean Floating Apple-Style Video with Rounded Corners */}
          <video
            key={`vid-${currentProject.id}`}
            src={currentProject.video}
            autoPlay
            loop
            muted
            playsInline
            controls
            className="w-full h-full object-cover rounded-2xl md:rounded-3xl shadow-[0_28px_80px_rgba(0,0,0,0.95)] border border-white/15"
          />
        </div>

        {/* Skiper 28 Perspective 3D Scroll Text (Bridges between video and cylinder without overflowing) */}
        <div
          className="relative w-full max-w-3xl flex items-center justify-center pointer-events-none my-1 shrink-0 overflow-hidden h-[85px] sm:h-[105px]"
          style={{
            transformStyle: "preserve-3d",
            perspective: "200px",
          }}
        >
          <motion.div
            style={{
              transformStyle: "preserve-3d",
              transform,
            }}
            className="w-full text-center text-2xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-[#ff5800] uppercase leading-tight select-none opacity-90 drop-shadow-[0_10px_20px_rgba(255,88,0,0.35)]"
          >
            {currentProject.perspectiveText}
            <div className="absolute bottom-0 left-0 h-[20vh] w-full bg-gradient-to-b from-transparent to-[#0a0a0b] pointer-events-none" />
          </motion.div>
        </div>

        {/* 3D Cylinder Carousel (Click FertiSure or AlphaTech to preview) */}
        <div className="w-full max-w-3xl mt-1 z-20 flex items-center justify-center shrink-0">
          <CylinderCarousel
            items={CYLINDER_ITEMS}
            activeId={currentProject.id}
            cardWidth={150}
            cardAspectRatio="16/10"
            animationDuration={22}
            className="min-h-[110px] h-[110px]"
            onItemClick={(item) => {
              if (item.projectId === "fertisure" || item.projectId === "alphatech") {
                setSelectedProjectId(item.projectId);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default TechWorkSection;
