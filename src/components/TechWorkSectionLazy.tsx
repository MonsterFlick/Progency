"use client";

import dynamic from "next/dynamic";

const TechWorkShowcase = dynamic(
  () =>
    import("@/components/TechWorkShowcase").then((m) => m.TechWorkShowcase),
  {
    ssr: false,
    loading: () => (
      <section
        id="tech-work"
        className="relative w-full bg-[#060608]"
        style={{ height: "340vh" }}
      />
    ),
  }
);

export default function TechWorkSectionLazy() {
  return <TechWorkShowcase />;
}
