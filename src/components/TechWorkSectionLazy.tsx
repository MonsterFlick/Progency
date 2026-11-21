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
        className="relative w-full min-h-[800px] bg-[#070709]"
      />
    ),
  }
);

export default function TechWorkSectionLazy() {
  return <TechWorkShowcase />;
}
