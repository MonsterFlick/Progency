"use client";

import * as React from "react";
import { motion, type Transition } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PerspectiveCarouselItem {
  src: string;
  title: string;
  alt?: string;
  category?: string;
  video?: string;
}

export interface PerspectiveCarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: PerspectiveCarouselItem[];
  activeIndex?: number;
  continuousIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onItemClick?: (item: PerspectiveCarouselItem, index: number) => void;
  loop?: boolean;
  slideWidth?: number;
  rotationStep?: number;
  inactiveScale?: number;
  transition?: Transition;
  showControls?: boolean;
  showDots?: boolean;
  viewportClassName?: string;
  slideClassName?: string;
  imageClassName?: string;
  labelClassName?: string;
  controlsClassName?: string;
}

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  bounce: 0.12,
  duration: 0.8,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function PerspectiveCarousel({
  items,
  activeIndex,
  continuousIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  onItemClick,
  loop = false,
  slideWidth = 280,
  rotationStep = 48,
  inactiveScale = 0.82,
  transition = DEFAULT_TRANSITION,
  showControls = true,
  showDots = true,
  viewportClassName,
  slideClassName,
  imageClassName,
  labelClassName,
  controlsClassName,
  className,
  onKeyDown,
  tabIndex,
  ...props
}: PerspectiveCarouselProps) {
  const maxIndex = Math.max(0, items.length - 1);
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(() =>
    clamp(defaultActiveIndex, 0, maxIndex)
  );

  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // If continuousIndex is supplied (scroll-driven), use it for position and rotation
  const isContinuous = continuousIndex !== undefined;
  const currentPosition = isContinuous
    ? clamp(continuousIndex, 0, maxIndex)
    : clamp(activeIndex ?? uncontrolledIndex, 0, maxIndex);

  const integerActiveIndex = Math.round(currentPosition);

  const safeSlideWidth = Math.max(96, slideWidth);
  const safeInactiveScale = clamp(inactiveScale, 0.5, 1);

  const selectSlide = React.useCallback(
    (nextIndex: number) => {
      if (!items.length) {
        return;
      }

      const resolvedIndex = loop
        ? (nextIndex + items.length) % items.length
        : clamp(nextIndex, 0, maxIndex);

      if (activeIndex === undefined) {
        setUncontrolledIndex(resolvedIndex);
      }

      onActiveIndexChange?.(resolvedIndex);
    },
    [activeIndex, items.length, loop, maxIndex, onActiveIndexChange]
  );

  const handleCardClick = (index: number) => {
    if (index === integerActiveIndex && onItemClick) {
      onItemClick(items[index], index);
    } else {
      selectSlide(index);
    }
  };

  if (!items.length) {
    return null;
  }

  const isPreviousDisabled = !loop && integerActiveIndex === 0;
  const isNextDisabled = !loop && integerActiveIndex === maxIndex;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectSlide(integerActiveIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectSlide(integerActiveIndex + 1);
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (onItemClick) {
        onItemClick(items[integerActiveIndex], integerActiveIndex);
      }
    }
  };

  // During continuous scroll, use tight linear or light spring for zero lag
  const activeTransition = isContinuous
    ? { type: "tween" as const, ease: "linear" as const, duration: 0.1 }
    : transition;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Perspective image carousel"
      tabIndex={tabIndex ?? 0}
      onKeyDown={handleKeyDown}
      className={cn("relative isolate h-full w-full overflow-hidden select-none", className)}
      {...props}
    >
      <div
        className={cn("absolute inset-0 overflow-hidden flex items-center justify-center", viewportClassName)}
        style={{ perspective: "1200px" }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 flex w-fit -translate-y-1/2 items-center"
          animate={{ x: -(currentPosition * safeSlideWidth + safeSlideWidth / 2) }}
          transition={activeTransition}
        >
          {items.map((item, index) => {
            const distance = Math.abs(currentPosition - index);
            const isActive = distance < 0.5;
            const isPreviewing = (isActive || hoveredIndex === index) && !!item.video;

            // Interpolate rotation and scale
            const rotY = (currentPosition - index) * rotationStep;
            const dynamicScale = Math.max(
              safeInactiveScale,
              1 - distance * (1 - safeInactiveScale)
            );

            return (
              <div
                key={`${item.src}-${index}`}
                className="shrink-0"
                style={{ width: safeSlideWidth, perspective: "1200px" }}
              >
                <motion.div
                  className={cn(
                    "flex w-full flex-col items-center gap-3 will-change-transform",
                    slideClassName
                  )}
                  animate={{
                    rotateY: rotY,
                    scale: isContinuous ? dynamicScale : isActive ? 1 : safeInactiveScale,
                  }}
                  transition={activeTransition}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <button
                    type="button"
                    aria-label={`Show ${item.title}`}
                    aria-current={isActive ? "true" : undefined}
                    className="group relative aspect-[9/16] w-full cursor-pointer focus:outline-none overflow-hidden rounded-2xl"
                    onClick={() => handleCardClick(index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Base Poster Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt={item.alt ?? item.title}
                      draggable={false}
                      className={cn(
                        "h-full w-full select-none rounded-2xl object-cover shadow-2xl transition-all duration-300",
                        isActive ? "ring-1 ring-[rgba(244,241,234,0.3)]" : "opacity-70",
                        imageClassName
                      )}
                    />

                    {/* Live Video Preview (Plays seamlessly on active or hovered card) */}
                    {isPreviewing && (
                      <video
                        src={item.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover rounded-2xl z-10"
                      />
                    )}

                    {/* Gradient vignette for text contrast */}
                    <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl bg-gradient-to-t from-black/90 via-transparent to-black/20" />

                    {/* Simple white text, NO chip, toward left corner, bit big */}
                    <div className="absolute bottom-4 left-4 z-30 flex flex-col items-start text-left pointer-events-none pr-4">
                      <span className="text-white text-base sm:text-lg font-bold tracking-tight uppercase leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                        {item.title}
                      </span>
                      {item.category && (
                        <span className="text-white/80 text-[11px] font-mono tracking-wider uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] mt-1">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </button>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {showControls && (
        <div
          className={cn(
            "absolute inset-x-4 bottom-5 z-20 mx-auto flex w-fit items-center justify-center gap-3 rounded-full border border-[rgba(244,241,234,0.14)] bg-[#0a0a0b]/80 px-2 text-[#f4f1ea] shadow-sm backdrop-blur-md",
            controlsClassName
          )}
        >
          <button
            type="button"
            aria-label="Show previous slide"
            disabled={isPreviousDisabled}
            className="inline-flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
            onClick={() => selectSlide(integerActiveIndex - 1)}
          >
            <ChevronLeft className="size-4" />
          </button>

          {showDots && (
            <div className="flex items-center justify-center gap-1.5">
              {items.map((item, index) => (
                <button
                  key={`${item.title}-${index}`}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${item.title}`}
                  aria-current={integerActiveIndex === index ? "true" : undefined}
                  className={cn(
                    "h-1.5 rounded-full transition-[width,opacity] duration-300 cursor-pointer",
                    integerActiveIndex === index ? "w-6 bg-[#f4f1ea] opacity-100" : "w-1.5 bg-[#f4f1ea] opacity-25"
                  )}
                  onClick={() => selectSlide(index)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            aria-label="Show next slide"
            disabled={isNextDisabled}
            className="inline-flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
            onClick={() => selectSlide(integerActiveIndex + 1)}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default PerspectiveCarousel;
