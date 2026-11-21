export const motionTransitions = {
  springGentle: {
    type: "spring" as const,
    stiffness: 180,
    damping: 24,
  },
  springSnappy: {
    type: "spring" as const,
    stiffness: 260,
    damping: 20,
  },
  easeOutCubic: {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
};

export default motionTransitions;
