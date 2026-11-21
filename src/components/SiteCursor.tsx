"use client";

import React from "react";
import LineCursor from "@/components/LineCursor";

const CURSOR_COLORS = ["#FFFFFF", "#7DD3FC", "#BAE6FD", "#E0F2FE", "#38BDF8"];

export function SiteCursor() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <LineCursor
        colors={CURSOR_COLORS}
        colorShift={1.5}
        opacity={45}
        thickness={1.8}
        trails={20}
        trailLength={16}
        label={false}
      />
    </div>
  );
}

export default SiteCursor;
