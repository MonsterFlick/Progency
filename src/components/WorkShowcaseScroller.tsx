"use client";

import React, { useEffect, useRef, useState } from "react";

interface ShowcaseItem {
  title: string;
  category: string;
  image: string;
  dockImage: string;
  video: string | null;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    title: "A CLUB BUSINESSMAN",
    category: "YOUTUBE THUMBNAIL / BRANDING",
    image: "/assets/images/optimized/a_club_businessman.webp",
    dockImage: "/assets/images/optimized/dock/a_club_businessman.webp",
    video: null,
  },
  {
    title: "A CLUB COUNTRY",
    category: "YOUTUBE THUMBNAIL / BRANDING",
    image: "/assets/images/optimized/a_club_country.webp",
    dockImage: "/assets/images/optimized/dock/a_club_country.webp",
    video: null,
  },
  {
    title: "YEMEN CRISIS",
    category: "CINEMATIC DOCUMENTARY",
    image: "/assets/images/optimized/dock/yemen_crisis_thumb.webp",
    dockImage: "/assets/images/optimized/dock/yemen_crisis_thumb.webp",
    video: "/assets/videos/yemen_crisis.mp4",
  },
  {
    title: "GAMING MONTAGE",
    category: "HIGH ENERGY VIDEO EDIT",
    image: "/assets/images/optimized/montage.webp",
    dockImage: "/assets/images/optimized/dock/montage.webp",
    video: null,
  },
  {
    title: "PODCAST PREVIEW",
    category: "STUDIO PODCAST PRODUCTION",
    image: "/assets/images/optimized/dock/podcast_preview_thumb.webp",
    dockImage: "/assets/images/optimized/dock/podcast_preview_thumb.webp",
    video: "/assets/videos/podcast_preview.mp4",
  },
  {
    title: "ZARA REMAKE",
    category: "KINETIC MOTION TYPOGRAPHY",
    image: "/assets/images/optimized/zara_remake.webp",
    dockImage: "/assets/images/optimized/dock/zara_remake.webp",
    video: null,
  },
  {
    title: "FREEFLOW LOGO",
    category: "3D LOGO ANIMATION & IDENTITY",
    image: "/assets/images/optimized/dock/freeflow_logo_thumb.webp",
    dockImage: "/assets/images/optimized/dock/freeflow_logo_thumb.webp",
    video: "/assets/videos/freeflow_logo.mp4",
  },
  {
    title: "HALLOW FACE",
    category: "VISUAL MOTION ARTWORK",
    image: "/assets/images/optimized/hallow_face.webp",
    dockImage: "/assets/images/optimized/dock/hallow_face.webp",
    video: null,
  },
];

const SCROLL_PER_ITEM = 400;
const TOTAL_SCROLL_RUNWAY = (SHOWCASE_ITEMS.length - 1) * SCROLL_PER_ITEM; // 2800px

export function WorkShowcaseScroller() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRefs = useRef<Array<HTMLDivElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const textRefs = useRef<Array<HTMLDivElement | null>>([]);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dockRef = useRef<HTMLDivElement>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const lastIdxRef = useRef(0);

  // Draggable dock offset (relative to bottom-center default)
  const [dockPos, setDockPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Passive 60fps scroll driver — direct DOM updates for zero latency
  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const scrolled = -rect.top;
      const maxScroll = Math.max(1, rect.height - vh);
      const progress = Math.max(0, Math.min(1, scrolled / maxScroll));

      const total = SHOWCASE_ITEMS.length;
      const newIdx = Math.max(
        0,
        Math.min(total - 1, Math.floor(progress * total))
      );
      const inView = rect.top < vh * 0.7 && rect.bottom > vh * 0.3;

      for (let i = 0; i < total; i++) {
        const isAct = i === newIdx;
        const mEl = mediaRefs.current[i];
        if (mEl) {
          mEl.style.opacity = isAct ? "1" : "0";
          mEl.style.pointerEvents = isAct ? "auto" : "none";
          mEl.style.zIndex = isAct ? "1" : "0";
        }

        const vid = videoRefs.current[i];
        if (vid) {
          if (isAct && inView) {
            if (vid.paused) vid.play().catch(() => {});
          } else if (!vid.paused) {
            vid.pause();
          }
        }

        const tEl = textRefs.current[i];
        if (tEl) {
          tEl.style.opacity = isAct ? "1" : "0";
          tEl.style.transform = isAct ? "translateY(0)" : "translateY(24px)";
        }

        const thEl = thumbRefs.current[i];
        if (thEl) {
          thEl.style.transform = isAct ? "scale(1.08)" : "scale(1)";
          thEl.style.opacity = isAct ? "1" : "0.55";
          const outline = thEl.querySelector<HTMLDivElement>(
            '[data-thumb-outline="true"]'
          );
          if (outline) {
            outline.style.display = isAct ? "block" : "none";
          }
        }
      }

      if (newIdx !== lastIdxRef.current) {
        lastIdxRef.current = newIdx;
        setActiveIdx(newIdx);
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

  // Dragging logic for the floating dock
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent) => {
      const dock = dockRef.current;
      const parent = dock?.parentElement;
      if (!dock || !parent) return;
      const pRect = parent.getBoundingClientRect();
      const maxX = Math.max(16, pRect.width - dock.offsetWidth - 16);
      const maxY = Math.max(16, pRect.height - dock.offsetHeight - 16);
      const nx = Math.max(16, Math.min(maxX, e.clientX - pRect.left - dragOffset.current.x));
      const ny = Math.max(16, Math.min(maxY, e.clientY - pRect.top - dragOffset.current.y));
      setDockPos({ x: nx, y: ny });
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
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setIsDragging(true);
    document.body.style.userSelect = "none";
  };

  const handleThumbClick = (idx: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const maxScroll = Math.max(1, section.offsetHeight - window.innerHeight);
    const targetY =
      sectionTop +
      (idx + 0.15) * (maxScroll / SHOWCASE_ITEMS.length);
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <section
      id="work-showcase"
      ref={sectionRef}
      aria-label="Selected Motion & Design Showcase"
      className="relative w-full bg-white text-white"
      style={{ height: `calc(${TOTAL_SCROLL_RUNWAY}px + 100vh)` }}
    >
      {/* Native Sticky Apple-Style Floating Rounded Cinema Window */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-4 sm:px-8 md:px-[54px] py-6 md:py-[40px] bg-white">
        <div
          className="relative w-full h-full max-w-[1360px] rounded-[28px] md:rounded-[36px] overflow-hidden bg-black"
          style={{
            boxShadow:
              "0 35px 90px rgba(0,0,0,0.28), 0 12px 35px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)",
          }}
        >
          {/* Media Layers */}
          <div className="absolute inset-0 w-full h-full">
            {SHOWCASE_ITEMS.map((item, idx) => {
              const isAct = activeIdx === idx;
              return (
                <div
                  key={item.title}
                  ref={(el) => {
                    mediaRefs.current[idx] = el;
                  }}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1)",
                    opacity: isAct ? 1 : 0,
                    pointerEvents: isAct ? "auto" : "none",
                    zIndex: isAct ? 1 : 0,
                  }}
                >
                  {item.video ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[idx] = el;
                      }}
                      src={item.video}
                      preload="none"
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover object-center block"
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="w-full h-full object-cover object-center block"
                    />
                  )}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Center Title Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center w-full flex flex-col items-center justify-center pointer-events-none select-none px-6">
            {SHOWCASE_ITEMS.map((item, idx) => {
              const isAct = activeIdx === idx;
              return (
                <div
                  key={item.title}
                  ref={(el) => {
                    textRefs.current[idx] = el;
                  }}
                  className="absolute flex flex-col items-center justify-center pointer-events-none"
                  style={{
                    transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                    opacity: isAct ? 1 : 0,
                    transform: isAct ? "translateY(0)" : "translateY(24px)",
                  }}
                >
                  <p
                    className="text-[11px] sm:text-[13px] font-semibold tracking-[0.25em] text-white/85 uppercase mb-3"
                    style={{ textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}
                  >
                    {item.category}
                  </p>
                  <h2
                    className="font-black tracking-[-0.03em] text-white uppercase m-0 leading-[1.1]"
                    style={{
                      fontSize: "clamp(1.8rem, 5vw, 4.2rem)",
                      textShadow:
                        "0 4px 30px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.8)",
                    }}
                  >
                    {item.title}
                  </h2>
                </div>
              );
            })}
          </div>

          {/* Floating Draggable Frosted Glass Dock */}
          <div
            ref={dockRef}
            className="z-30 select-none"
            style={
              dockPos
                ? {
                    position: "absolute",
                    left: `${dockPos.x}px`,
                    top: `${dockPos.y}px`,
                    cursor: isDragging ? "grabbing" : "grab",
                  }
                : {
                    position: "absolute",
                    bottom: "24px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    cursor: isDragging ? "grabbing" : "grab",
                  }
            }
          >
            <div
              onMouseDown={handleDragStart}
              title="Drag to reposition dock"
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-[38px] h-3 rounded-md flex items-center justify-center cursor-grab"
              style={{
                background: "rgba(255,255,255,0.45)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              <div className="w-5 h-[3px] rounded-sm bg-white/90" />
            </div>

            <div
              className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-2 rounded-[20px] max-w-[90vw] overflow-x-auto"
              style={{
                background: "rgba(18,18,18,0.75)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.65)",
              }}
            >
              {SHOWCASE_ITEMS.map((item, idx) => {
                const isAct = activeIdx === idx;
                return (
                  <button
                    key={item.title}
                    type="button"
                    ref={(el) => {
                      thumbRefs.current[idx] = el;
                    }}
                    onClick={() => handleThumbClick(idx)}
                    aria-label={`Jump to ${item.title}`}
                    className="relative w-11 h-11 sm:w-[54px] sm:h-[54px] min-w-11 sm:min-w-[54px] rounded-xl overflow-hidden cursor-pointer border-0 p-0 bg-transparent"
                    style={{
                      transform: isAct ? "scale(1.08)" : "scale(1)",
                      opacity: isAct ? 1 : 0.55,
                      transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    <img
                      src={item.dockImage}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover block pointer-events-none"
                    />
                    <div
                      data-thumb-outline="true"
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        display: isAct ? "block" : "none",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 12px rgba(255,255,255,0.8)",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
