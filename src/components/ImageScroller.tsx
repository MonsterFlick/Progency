"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";

export interface ImageScrollerItem {
  title: string;
  category: string;
  image: string;
  video?: string | null;
}

export interface ImageScrollerProps {
  items?: ImageScrollerItem[];
}

export const defaultImageScrollerItems: ImageScrollerItem[] = [
  {
    title: "A CLUB BUSINESSMAN",
    category: "YOUTUBE THUMBNAIL / BRANDING",
    image: "/assets/images/thumbnails/a_club_businessman.png",
    video: null,
  },
  {
    title: "A CLUB COUNTRY",
    category: "YOUTUBE THUMBNAIL / BRANDING",
    image: "/assets/images/thumbnails/a_club_country.png",
    video: null,
  },
  {
    title: "YEMEN CRISIS",
    category: "CINEMATIC DOCUMENTARY",
    image: "/assets/images/video_posters/yemen_crisis_thumb.jpg",
    video: "/assets/videos/yemen_crisis.mp4",
  },
  {
    title: "GAMING MONTAGE",
    category: "HIGH ENERGY VIDEO EDIT",
    image: "/assets/images/thumbnails/montage.jpg",
    video: null,
  },
  {
    title: "PODCAST PREVIEW",
    category: "STUDIO PODCAST PRODUCTION",
    image: "/assets/images/video_posters/podcast_preview_thumb.jpg",
    video: "/assets/videos/podcast_preview.mp4",
  },
  {
    title: "ZARA REMAKE",
    category: "KINETIC MOTION TYPOGRAPHY",
    image: "/assets/images/thumbnails/zara_remake.png",
    video: null,
  },
  {
    title: "FREEFLOW LOGO",
    category: "3D LOGO ANIMATION & IDENTITY",
    image: "/assets/images/video_posters/freeflow_logo_thumb.jpg",
    video: "/assets/videos/freeflow_logo.mp4",
  },
  {
    title: "HALLOW FACE",
    category: "VISUAL MOTION ARTWORK",
    image: "/assets/images/thumbnails/hallow_face.png",
    video: null,
  },
];

export default function ImageScroller({
  items = defaultImageScrollerItems,
}: ImageScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dockPos, setDockPos] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });
  const dragOffset = useRef({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (latest) => {
      const total = items.length;
      if (total === 0) return;
      const nextIndex = Math.min(Math.floor(latest * total), total - 1);
      setActiveIndex(nextIndex);
    });
    return () => unsub();
  }, [scrollYProgress, items.length]);

  // Dock dragging
  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      const dock = dockRef.current;
      if (!dock) return;
      const dockW = dock.offsetWidth;
      const dockH = dock.offsetHeight;
      const newX = Math.max(
        16,
        Math.min(window.innerWidth - dockW - 16, e.clientX - dragOffset.current.x)
      );
      const newY = Math.max(
        16,
        Math.min(window.innerHeight - dockH - 16, e.clientY - dragOffset.current.y)
      );
      setDockPos({ x: newX, y: newY });
    };
    const handleUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent) => {
    const dock = dockRef.current;
    if (!dock) return;
    const rect = dock.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
    document.body.style.userSelect = "none";
  };

  const handleThumbClick = (index: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const sectionHeight = window.innerHeight;
    const scrollTarget = containerTop + index * sectionHeight;
    window.scrollTo({ top: scrollTarget, behavior: "smooth" });
  };

  const scrollHeight = useMemo(() => Math.max(items.length * 100, 100), [items.length]);

  return (
    <div
      ref={containerRef}
      data-image-scroller-section="true"
      className="relative w-full bg-white text-white overflow-clip"
      style={{ height: `${scrollHeight}vh` }}
    >
      {/* Apple-style floating rounded card window with margin */}
      <div
        ref={stickyRef}
        className="sticky top-10 mx-auto w-[calc(100%-108px)] max-w-[1360px] h-[calc(100vh-80px)] rounded-[36px] overflow-hidden bg-black shadow-[0_35px_90px_rgba(0,0,0,0.28),0_12px_35px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.08)]"
      >
        {/* Full-bleed background media */}
        {items.map((item, idx) => {
          const isActive = activeIndex === idx;
          return (
            <motion.div
              key={item.title}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: idx === 0 ? 1 : 0 }}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{
                pointerEvents: isActive ? "auto" : "none",
                zIndex: isActive ? 1 : 0,
              }}
            >
              {item.video ? (
                <video
                  src={item.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center"
                  draggable={false}
                />
              )}
              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60 pointer-events-none" />
            </motion.div>
          );
        })}

        {/* Centered Typography */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none select-none">
          {items.map((item, idx) => {
            const isActive = activeIndex === idx;
            return (
              <motion.div
                key={item.title}
                className="absolute flex flex-col items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 20,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/70 uppercase mb-3 drop-shadow">
                  {item.category}
                </p>
                <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
                  {item.title}
                </h2>
              </motion.div>
            );
          })}
        </div>

        {/* Draggable Dock */}
        <div
          ref={dockRef}
          className="fixed z-30 select-none"
          style={
            dockPos.x !== null && dockPos.y !== null
              ? {
                  left: `${dockPos.x}px`,
                  top: `${dockPos.y}px`,
                  cursor: isDragging ? "grabbing" : "grab",
                }
              : {
                  bottom: "28px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  cursor: isDragging ? "grabbing" : "grab",
                }
          }
        >
          {/* Drag Handle */}
          <div
            onMouseDown={handleDragStart}
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-10 h-3.5 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-md flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors shadow-md"
            title="Drag to reposition dock"
          >
            <div className="w-5 h-1 rounded-full bg-white/90" />
          </div>

          {/* Floating Glassmorphism Dock */}
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {items.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={item.title}
                  onClick={() => handleThumbClick(idx)}
                  type="button"
                  className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden focus:outline-none transition-transform duration-200"
                  style={{
                    transform: isActive ? "scale(1.08)" : "scale(1)",
                    opacity: isActive ? 1 : 0.6,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {isActive && (
                    <motion.div
                      layoutId="thumb-outline"
                      className="absolute inset-0 rounded-xl border-2 border-white pointer-events-none shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
