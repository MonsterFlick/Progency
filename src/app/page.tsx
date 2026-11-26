import HeroScrollZoom from "@/components/HeroScrollZoom";
import { OurWorkHero } from "@/components/OurWorkHero";
import { InquiryEndSection, InquiryFloatingTrigger } from "@/components/ProjectInquiry";

export default function Home() {
  return (
    <main className="relative w-full bg-white selection:bg-sky-200">
      {/* Stage 0: Cloud Sky & Letter 'G' Zoom Transition */}
      <HeroScrollZoom />

      {/* Section 1: OUR WORK — Landscape Motion, Technology, Podcast & Doc, Social Media */}
      <div id="our-work" className="relative z-10 -mt-[100vh]">
        <OurWorkHero />
      </div>

      {/* Section 2: Project Inquiry (Discord Webhook via PODIE Onboarding Setup) */}
      <InquiryEndSection />

      {/* Persistent Side Trigger + Popup */}
      <InquiryFloatingTrigger />
    </main>
  );
}
