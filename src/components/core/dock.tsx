'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from 'framer-motion';
import React, {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

const BASE_ITEM_SIZE = 38;
const DEFAULT_MAGNIFICATION = 54;
const DEFAULT_DISTANCE = 115;
const DEFAULT_PANEL_HEIGHT = 54;

export type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

export type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};

export type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

export type DocContextType = {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};

export type DockProviderProps = {
  children: React.ReactNode;
  value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within an DockProvider');
  }
  return context;
}

function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 260, damping: 20 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className='mx-2 flex max-w-full items-end overflow-visible'>
      <div
        onMouseMove={(e) => {
          mouseX.set(e.clientX);
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity);
        }}
        className={cn(
          'mx-auto flex w-fit items-center gap-2.5 rounded-full bg-neutral-950/88 px-2.5 border border-white/15 shadow-2xl backdrop-blur-xl overflow-visible',
          className
        )}
        style={{ height: panelHeight }}
        role='toolbar'
        aria-label='Application dock'
      >
        <DockProvider value={{ mouseX, spring, distance, magnification }}>
          {children}
        </DockProvider>
      </div>
    </div>
  );
}

function DockItem({ children, className, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { distance, magnification, mouseX, spring } = useDock();

  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - domRect.x - domRect.width / 2;
  });

  const sizeTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [BASE_ITEM_SIZE, magnification, BASE_ITEM_SIZE]
  );

  const size = useSpring(sizeTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center cursor-pointer overflow-visible',
        className
      )}
      tabIndex={0}
      role='button'
      aria-haspopup='true'
      onClick={onClick}
    >
      {Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return cloneElement(
            child as React.ReactElement<{
              size?: MotionValue<number>;
              isHovered?: MotionValue<number>;
            }>,
            { size, isHovered }
          );
        }
        return child;
      })}
    </motion.div>
  );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps['isHovered'] as MotionValue<number> | undefined;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'absolute -top-10 left-1/2 -translate-x-1/2 w-fit whitespace-nowrap rounded-lg border border-white/15 bg-neutral-950/95 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl backdrop-blur-md pointer-events-none z-[70]',
            className
          )}
          role='tooltip'
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const size = restProps['size'] as MotionValue<number> | undefined;

  const fallbackSize = useMotionValue(BASE_ITEM_SIZE);
  const iconSize = useTransform(size ?? fallbackSize, (val) => val * 0.48);

  return (
    <motion.div
      style={{ width: iconSize, height: iconSize }}
      className={cn('flex items-center justify-center', className)}
    >
      {children}
    </motion.div>
  );
}

export { Dock, DockIcon, DockItem, DockLabel };
