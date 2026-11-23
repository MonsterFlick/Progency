"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface CylinderCarouselItem {
  id: string;
  projectId?: string;
  title: string;
  src: string;
  tech?: string;
  category?: string;
  alt?: string;
}

export interface CylinderCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  items: CylinderCarouselItem[];
  activeId?: string;
  onItemClick?: (item: CylinderCarouselItem, index: number) => void;
  containerClassName?: string;
  cardClassName?: string;
  animationDuration?: number; // in seconds
  cardWidth?: number; // in pixels
  cardAspectRatio?: string; // e.g. "16/10" or "7/10"
}

export const CylinderCarousel = React.forwardRef<HTMLDivElement, CylinderCarouselProps>(
  (
    {
      items,
      activeId,
      onItemClick,
      className,
      containerClassName,
      cardClassName,
      animationDuration = 36,
      cardWidth = 240,
      cardAspectRatio = "16/10",
      ...props
    },
    ref
  ) => {
    const N = items.length;

    // Calculate exact cylindrical radius in pixels for universal browser support
    const radius = useMemo(() => {
      if (N <= 1) return 200;
      const angle = (2 * Math.PI) / N;
      return Math.round((cardWidth / 2) / Math.tan(angle / 2) + 24);
    }, [N, cardWidth]);

    const customStyle = {
      "--n": N,
      "--w": `${cardWidth}px`,
      "--r": `${radius}px`,
      "--ba": `${360 / N}deg`,
      "--anim-dur": `${animationDuration}s`,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={cn(
          "group/cylinder relative w-full h-full min-h-[420px] grid place-items-center overflow-hidden select-none",
          className
        )}
        style={{
          perspective: "1100px",
          maskImage: "linear-gradient(90deg, transparent, #000 15% 85%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 15% 85%, transparent)",
        }}
        {...props}
      >
        <div
          className={cn(
            "grid place-items-center [transform-style:preserve-3d] group-hover/cylinder:[animation-play-state:paused]",
            containerClassName
          )}
          style={{
            ...customStyle,
            animation: "cylinder-spin var(--anim-dur) linear infinite",
          }}
        >
          <style>
            {`
              @keyframes cylinder-spin {
                from { transform: rotateY(0deg); }
                to { transform: rotateY(360deg); }
              }
            `}
          </style>

          {items.map((item, i) => {
            const isActive = activeId === item.id || (Boolean(item.projectId) && activeId === item.projectId);

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${item.title}`}
                onClick={() => onItemClick?.(item, i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onItemClick?.(item, i);
                  }
                }}
                className={cn(
                  "[grid-area:1/1] relative cursor-pointer overflow-hidden rounded-2xl [backface-visibility:hidden] transition-all duration-300",
                  "border border-white/20 bg-neutral-900/80 shadow-[0_16px_40px_rgba(0,0,0,0.85)]",
                  "hover:scale-105 hover:border-amber-400/80 hover:shadow-[0_20px_50px_rgba(245,158,11,0.25)]",
                  isActive && "ring-2 ring-amber-400 border-amber-400 scale-[1.03]",
                  cardClassName
                )}
                style={
                  {
                    width: "var(--w)",
                    aspectRatio: cardAspectRatio,
                    transform: `rotateY(calc(${i} * var(--ba))) translateZ(var(--r))`,
                  } as React.CSSProperties
                }
              >
                {/* Poster / Thumbnail image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt || item.title}
                  draggable={false}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/20 pointer-events-none" />

                {/* Card Title & Category toward left corner: simple white text, no chip, bit big */}
                <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none text-left">
                  {item.tech && (
                    <span className="block text-[10px] font-mono tracking-widest uppercase text-white/80 font-medium mb-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                      {item.tech}
                    </span>
                  )}
                  <h4 className="text-sm sm:text-base font-bold tracking-tight text-white uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] line-clamp-1">
                    {item.title}
                  </h4>
                </div>

                {/* Active Indicator Badge */}
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-mono font-bold tracking-wider shadow">
                    ACTIVE
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CylinderCarousel.displayName = "CylinderCarousel";
