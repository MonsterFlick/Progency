"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Loader2, MessageSquare, X } from "lucide-react";
import { OnboardingSetup } from "@/components/podie/watermelon--onboarding-setup/author/1/watermelon--onboarding-setup-author-1-original";

const FOCUS_OPTIONS = [
  { id: "motion", label: "Motion Design" },
  { id: "technology", label: "Technology & Web" },
  { id: "podcast-doc", label: "Podcast & Doc" },
  { id: "social", label: "Social Media" },
  { id: "campaign", label: "Full Campaign" },
];

const COUNTRY_CODES = [
  "+91 (IN)",
  "+1 (US / CA)",
  "+44 (UK)",
  "+971 (UAE)",
  "+65 (SG)",
  "+61 (AU)",
  "+49 (DE)",
  "+81 (JP)",
];

const FOCUS_IMAGES: Record<string, string> = {
  motion: "/assets/images/video_posters/freeflow_logo_thumb.jpg",
  technology: "/media/tech-showcase/fertisure_poster.webp",
  "podcast-doc": "/assets/images/video_posters/yemen_crisis_thumb.jpg",
  social: "/assets/images/optimized/a_club_businessman.webp",
  campaign: "/assets/images/optimized/zara_remake.webp",
};

const cardSpring = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.7,
} as const;

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

interface ProjectInquiryFlowProps {
  source: "side-popup" | "end-section";
  onClose?: () => void;
}

export function ProjectInquiryFlow({ source, onClose }: ProjectInquiryFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focus, setFocus] = useState<string>("motion");
  const [countryCode, setCountryCode] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [brief, setBrief] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reducedMotion = usePrefersReducedMotion();
  const focusLabel = FOCUS_OPTIONS.find((opt) => opt.id === focus)?.label ?? "Motion Design";
  const imageUrl = FOCUS_IMAGES[focus] ?? FOCUS_IMAGES.motion;
  const rawCode = countryCode.trim().split(" ")[0] || "";
  const dialCode = rawCode ? (rawCode.startsWith("+") ? rawCode : `+${rawCode}`) : "";
  const formattedPhone = phone.trim()
    ? `${dialCode ? `${dialCode} ` : ""}${phone.trim()}`
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg("Please enter your name and email address.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focus: focusLabel,
          phone: formattedPhone || "Not provided",
          name: name.trim(),
          email: email.trim(),
          brief: brief.trim(),
          source,
        }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Could not send inquiry. Please try again.");
        return;
      }

      setStep(3);
    } catch {
      setErrorMsg("Network error while sending inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setErrorMsg(null);
    setBrief("");
  };

  const stepTransition = reducedMotion ? { duration: 0.01 } : cardSpring;

  return (
    <div className="dark w-full">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="inquiry-step-1"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={stepTransition}
            className="w-full"
          >
            <OnboardingSetup
              title="Start a project with Progency"
              subtitle="Select your focus and phone number — we'll get right back to you."
              focusOptions={FOCUS_OPTIONS}
              selectedFocus={focus}
              onFocusChange={setFocus}
              selectLabel="Country code"
              selectPlaceholder="e.g. +91"
              selectOptions={COUNTRY_CODES}
              selectedOption={countryCode}
              onOptionChange={(val) => setCountryCode(val.split(" ")[0] || val)}
              allowCustomOption={true}
              inputLabel="Phone number"
              inputPlaceholder="e.g. 98765 43210"
              inputType="tel"
              inputValue={phone}
              onInputChange={setPhone}
              step={1}
              totalSteps={2}
              onContinue={() => {
                setErrorMsg(null);
                setStep(2);
              }}
              imageUrl={imageUrl}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="inquiry-step-2"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={stepTransition}
            className="relative flex w-full flex-col items-center justify-center"
          >
            <form
              onSubmit={handleSubmit}
              className="relative z-10 grid w-full max-w-5xl grid-cols-1 rounded-[24px] border-2 border-[#1a1a1a] bg-[#0A0A0A] shadow-xl lg:grid-cols-[1.2fr_0.8fr]"
            >
              {/* LEFT CONTENT */}
              <div className="order-2 flex flex-col lg:order-1">
                <div className="m-1.5 flex h-full flex-col rounded-[18px] bg-[#111] p-5 shadow-sm sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-[22px] font-medium text-[#EEE] sm:text-[24px]">
                        Where should we reply?
                      </h2>
                      <p className="mt-1 text-[12px] text-[#7A7A7E]">
                        Delivered directly to our studio team.
                      </p>
                    </div>
                  </div>

                  {/* Step 1 Summary Pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded-lg border border-[#F87742]/40 bg-[#2A1A14] px-2.5 py-1 text-[11px] font-medium text-[#F87742]">
                      {focusLabel}
                    </span>
                    {formattedPhone && (
                      <span className="rounded-lg border border-[#222] bg-[#161618] px-2.5 py-1 text-[11px] text-[#A1A1AA]">
                        {formattedPhone}
                      </span>
                    )}
                  </div>

                  <div className="my-5 border-t-[1.6px] border-dashed border-[#222]" />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`inquiry-name-${source}`} className="text-[13px] font-normal text-[#979799]">
                        Your name
                      </label>
                      <input
                        id={`inquiry-name-${source}`}
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        className="mt-2 h-10 w-full rounded-full border border-[#222] bg-[#111] px-5 text-[13px] text-[#EEE] outline-none transition-all placeholder:text-[#555] focus:ring-1 focus:ring-[#333]"
                      />
                    </div>

                    <div>
                      <label htmlFor={`inquiry-email-${source}`} className="text-[13px] font-normal text-[#979799]">
                        Email address
                      </label>
                      <input
                        id={`inquiry-email-${source}`}
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@brand.com"
                        className="mt-2 h-10 w-full rounded-full border border-[#222] bg-[#111] px-5 text-[13px] text-[#EEE] outline-none transition-all placeholder:text-[#555] focus:ring-1 focus:ring-[#333]"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grow">
                    <label htmlFor={`inquiry-brief-${source}`} className="text-[13px] font-normal text-[#979799]">
                      Project brief <span className="text-[#555]">(optional)</span>
                    </label>
                    <textarea
                      id={`inquiry-brief-${source}`}
                      rows={3}
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      placeholder="Scope, timeline, references, or links..."
                      className="mt-2 w-full resize-none rounded-2xl border border-[#222] bg-[#111] px-5 py-3 text-[13px] text-[#EEE] outline-none transition-all placeholder:text-[#555] focus:ring-1 focus:ring-[#333]"
                    />
                  </div>

                  {errorMsg && (
                    <p role="alert" className="mt-3 text-[12px] text-[#F87742]">
                      {errorMsg}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 p-5 pt-2 sm:px-8 sm:pb-8">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-[#8B8B8D]">
                    <span className="whitespace-nowrap">STEP 2 / 2</span>
                    <div className="ml-2 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="h-4 w-1 rounded-full bg-[#ff6a32]" />
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full items-center gap-2.5 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={submitting}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#2A2A2D] px-5 text-[13px] font-medium text-[#A1A1AA] transition-colors hover:border-[#444] hover:text-white cursor-pointer disabled:opacity-50"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </button>

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={reducedMotion ? undefined : { scale: 1.03 }}
                      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                      transition={stepTransition}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#EEE] px-7 text-[13px] font-medium text-black shadow-lg transition-all sm:flex-initial cursor-pointer disabled:opacity-60"
                    >
                      {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {submitting ? "Sending..." : "Send Inquiry"}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* RIGHT IMAGE SECTION */}
              <div className="relative order-1 h-48 overflow-hidden rounded-t-[24px] sm:h-64 md:h-auto md:min-h-full lg:order-2 lg:rounded-t-none lg:rounded-r-[24px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={focusLabel}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/20" />
              </div>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="inquiry-step-3"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={stepTransition}
            className="relative flex w-full flex-col items-center justify-center"
          >
            <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 rounded-[24px] border-2 border-[#1a1a1a] bg-[#0A0A0A] shadow-xl lg:grid-cols-[1.2fr_0.8fr]">
              <div className="order-2 flex flex-col lg:order-1">
                <div className="m-1.5 flex h-full flex-col justify-between rounded-[18px] bg-[#111] p-6 sm:p-10">
                  <div>
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F87742]/40 bg-[#2A1A14]">
                      <CheckCircle2 className="h-6 w-6 text-[#FA692E]" />
                    </div>
                    <h2 className="mt-5 text-[24px] font-medium text-[#EEE]">
                      Inquiry delivered to Discord
                    </h2>
                    <p className="mt-2 max-w-md text-[13px] leading-relaxed text-[#8F8E92]">
                      Thanks, {name}. Our team received your <span className="text-[#EEE]">{focusLabel}</span> request and will reach out via{" "}
                      <span className="text-[#EEE]">{formattedPhone || email}</span> shortly.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="h-10 rounded-full border border-[#2A2A2D] px-6 text-[13px] font-medium text-[#D4D4D8] transition-colors hover:border-[#444] hover:text-white cursor-pointer"
                    >
                      Send another
                    </button>
                    {onClose && (
                      <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-full bg-[#EEE] px-7 text-[13px] font-medium text-black transition-transform active:scale-95 cursor-pointer"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative order-1 h-48 overflow-hidden rounded-t-[24px] sm:h-64 md:h-auto md:min-h-full lg:order-2 lg:rounded-t-none lg:rounded-r-[24px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={focusLabel}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/20" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function InquiryFloatingTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const isExpanded = isHovered || isFocused;
  const triggerTransition = reducedMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 360, damping: 30, mass: 0.75 };

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* Always-Accessible Smooth Half-Tucked Circle near Top-Right Corner */}
      <div className="fixed right-0 top-5 z-40 flex items-center sm:top-6">
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label="Start a project"
          initial={false}
          animate={{ x: isExpanded ? -16 : 20 }}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          transition={triggerTransition}
          style={{
            borderColor: isExpanded ? "rgba(250, 105, 46, 0.55)" : "rgba(255, 255, 255, 0.16)",
            backgroundColor: isExpanded ? "rgba(22, 22, 26, 0.96)" : "rgba(17, 17, 20, 0.9)",
          }}
          className="relative flex h-12 items-center rounded-full border text-white shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FA692E]/70 cursor-pointer after:content-[''] after:absolute after:inset-y-0 after:-right-6 after:w-6"
        >
          <motion.span
            initial={false}
            animate={{
              width: isExpanded ? "auto" : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={triggerTransition}
            className="hidden overflow-hidden whitespace-nowrap sm:inline-flex"
          >
            <span className="pl-4 pr-1 text-[12px] font-medium tracking-tight text-white/95">
              Start Project
            </span>
          </motion.span>

          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <span
              className={`relative flex items-center justify-center transition-transform duration-200 motion-reduce:transition-none ${
                isExpanded ? "translate-x-0" : "-translate-x-1.5"
              }`}
            >
              <MessageSquare className="h-4 w-4 text-white/90" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#FA692E] ring-2 ring-[#111114]" />
            </span>
          </span>
        </motion.button>
      </div>

      {/* Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="inquiry-popup-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Project inquiry"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.22 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-3 backdrop-blur-2xl sm:p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
              transition={reducedMotion ? { duration: 0.01 } : cardSpring}
              className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[26px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close inquiry popup"
                className="fixed top-4 right-4 z-[130] flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/80 backdrop-blur-md transition-colors hover:bg-white/15 hover:text-white cursor-pointer sm:top-6 sm:right-6"
              >
                <X className="h-4 w-4" />
              </button>

              <ProjectInquiryFlow source="side-popup" onClose={() => setIsOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function InquiryEndSection() {
  return (
    <section
      id="contact"
      aria-label="Start a Project Inquiry"
      className="relative z-20 w-full border-t border-white/[0.08] bg-[#0a0a0b] px-4 py-20 pb-36 sm:px-8 sm:py-28 sm:pb-40"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <ProjectInquiryFlow source="end-section" />
      </div>
    </section>
  );
}
