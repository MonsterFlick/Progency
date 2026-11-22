"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Sparkles,
  ExternalLink,
  Terminal,
  Activity,
  Layers,
  Maximize2,
} from "lucide-react";

export interface ProjectData {
  id: string;
  number: string;
  name: string;
  client: string;
  category: string;
  tagline: string;
  description: string;
  metrics: { label: string; value: string }[];
  tech: string[];
  poster: string;
  video: string;
  accent: string;
  glowHex: number;
}

export const HOLO_PROJECTS: ProjectData[] = [
  {
    id: "alphatech",
    number: "01",
    name: "AlphaTech Nutrition",
    client: "AlphaTech Inc.",
    category: "High-Converting E-Commerce",
    tagline: "Dynamic Supplement Storefront & Onboarding Portal",
    description:
      "Engineered with Next.js 16, TypeScript, and a responsive one-tap checkout flow. Features real-time flavor/size variant switching, dynamic stock matrix, and a streamlined distributor portal.",
    metrics: [
      { label: "LIGHTHOUSE", value: "99/100" },
      { label: "LOAD SPEED", value: "0.42s" },
      { label: "CONVERSION", value: "+38%" },
    ],
    tech: ["Next.js 16", "TypeScript", "Tailwind CSS", "WhatsApp API", "Edge CDN"],
    poster: "/media/tech-showcase/alphatech_poster.webp",
    video: "/media/tech-showcase/alphatech_landscape_1920x1080.mp4",
    accent: "#f59e0b",
    glowHex: 0xf59e0b,
  },
  {
    id: "fertisure",
    number: "02",
    name: "FertiSure MedTech",
    client: "Hemant Surgical Industries Ltd.",
    category: "Global Precision MedTech Platform",
    tagline: "Next-Gen IVF & Embryology Lab Systems",
    description:
      "High-precision international catalog presenting ISO/CE certified medical systems across 30+ countries. Engineered with fluid dynamic filtering, instant RFQ quote workflows, and multi-region routing.",
    metrics: [
      { label: "GLOBAL REACH", value: "30+ Countries" },
      { label: "PERFORMANCE", value: "100/100" },
      { label: "TIME TO QUOTE", value: "< 60s" },
    ],
    tech: ["Next.js", "React 19", "Motion UI", "Custom CMS", "Vercel Edge"],
    poster: "/media/tech-showcase/fertisure_poster.webp",
    video: "/media/tech-showcase/fertisure_landscape_1920x1080.mp4",
    accent: "#06b6d4",
    glowHex: 0x06b6d4,
  },
  {
    id: "nonudes",
    number: "03",
    name: "NoNudes Flagship",
    client: "NoNudes Apparel",
    category: "Kinetic Dark-Mode Streetwear",
    tagline: "Editorial Attitude & Frictionless Obsidian Commerce",
    description:
      "Signature dark-mode editorial flagship featuring split-flap kinetic brand reveals, oversized typography, micro-interactions, and a frictionless zero-latency bag and checkout experience.",
    metrics: [
      { label: "FRAME RATE", value: "60 FPS" },
      { label: "CLS SCORE", value: "0.000" },
      { label: "ENGAGEMENT", value: "+54%" },
    ],
    tech: ["Next.js", "Kinetic Motion", "Tailwind CSS", "E-Commerce", "Web Audio"],
    poster: "/media/tech-showcase/nonudes_poster.webp",
    video: "/media/tech-showcase/nonudes_landscape_1920x1080.mp4",
    accent: "#c084fc",
    glowHex: 0xc084fc,
  },
];

const CARD_SPACING = Math.PI / 4.4; // Arc angle between cards (~41 degrees)
const RADIUS = 3.4; // Cylinder radius for arc layout

export interface SpatialHoloCarouselProps {
  onOpenReel: (videoUrl: string) => void;
}

export default function SpatialHoloCarousel({ onOpenReel }: SpatialHoloCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cardGroupsRef = useRef<THREE.Group[]>([]);
  const screenMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const edgeLineRef = useRef<THREE.LineSegments[]>([]);
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Angular physics values
  const currentAngleRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);
  const dragVelocityRef = useRef<number>(0);
  const activeIndexRef = useRef<number>(0);
  activeIndexRef.current = activeIndex;

  // Mouse coordinate for subtle parallax tilt
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

  // Change active slide smoothly
  const goToSlide = useCallback((newIndex: number) => {
    const total = HOLO_PROJECTS.length;
    const clamped = Math.max(0, Math.min(total - 1, newIndex));
    setActiveIndex(clamped);
    targetAngleRef.current = -clamped * CARD_SPACING;
  }, []);

  const goNext = useCallback(() => {
    goToSlide((activeIndexRef.current + 1) % HOLO_PROJECTS.length);
  }, [goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide(
      (activeIndexRef.current - 1 + HOLO_PROJECTS.length) % HOLO_PROJECTS.length
    );
  }, [goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "Enter" || e.key === " ") {
        onOpenReel(HOLO_PROJECTS[activeIndexRef.current].video);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onOpenReel]);

  // Main Three.js setup
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.15, 4.4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirKeyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirKeyLight.position.set(3, 4, 3);
    scene.add(dirKeyLight);

    const dirFillLight = new THREE.DirectionalLight(0x4080ff, 0.6);
    dirFillLight.position.set(-3, 2, -2);
    scene.add(dirFillLight);

    // Dynamic accent point light placed beneath center card
    const pointLight = new THREE.PointLight(HOLO_PROJECTS[0].glowHex, 2.8, 5);
    pointLight.position.set(0, -1.2, 0.5);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 5. Floating atmospheric particle dust
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 0.5;
      particleScales[i] = Math.random() * 0.5 + 0.5;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Floor grid plate
    const gridGeo = new THREE.PlaneGeometry(16, 16, 24, 24);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x111625,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -1.5;
    scene.add(gridMesh);

    // 7. Texture Loader & 3D Glass Cards Creation
    const texLoader = new THREE.TextureLoader();
    const cardGroups: THREE.Group[] = [];
    const screenMaterials: THREE.MeshStandardMaterial[] = [];
    const edgeLines: THREE.LineSegments[] = [];

    // Card dimensions
    const CARD_W = 2.45;
    const CARD_H = 1.48;
    const CARD_D = 0.05;

    HOLO_PROJECTS.forEach((proj, idx) => {
      const cardGroup = new THREE.Group();
      cardGroup.name = `Card_${idx}`;

      // A. Obsidian Backing Chassis
      const chassisGeo = new THREE.BoxGeometry(CARD_W, CARD_H, CARD_D);
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x090a0f,
        roughness: 0.25,
        metalness: 0.88,
      });
      const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
      cardGroup.add(chassisMesh);

      // B. Display Screen with Project Poster
      const screenGeo = new THREE.PlaneGeometry(CARD_W - 0.08, CARD_H - 0.08);
      const screenTex = texLoader.load(proj.poster);
      screenTex.colorSpace = THREE.SRGBColorSpace;
      screenTex.generateMipmaps = true;

      const screenMat = new THREE.MeshStandardMaterial({
        map: screenTex,
        roughness: 0.28,
        metalness: 0.15,
        emissive: new THREE.Color(proj.glowHex),
        emissiveMap: screenTex,
        emissiveIntensity: 0.18,
      });
      screenMaterials.push(screenMat);

      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.z = CARD_D / 2 + 0.002;
      screenMesh.name = `Screen_${idx}`;
      cardGroup.add(screenMesh);

      // C. Holographic Glowing Wireframe Bezel
      const edges = new THREE.EdgesGeometry(chassisGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: proj.glowHex,
        transparent: true,
        opacity: idx === 0 ? 0.85 : 0.25,
        linewidth: 2,
      });
      const lineMesh = new THREE.LineSegments(edges, edgeMat);
      edgeLines.push(lineMesh);
      cardGroup.add(lineMesh);

      // Initial placement along the cylindrical arc
      const angle = idx * CARD_SPACING;
      cardGroup.position.set(
        Math.sin(angle) * RADIUS,
        0,
        Math.cos(angle) * RADIUS - RADIUS
      );
      cardGroup.rotation.y = angle * 0.82;

      scene.add(cardGroup);
      cardGroups.push(cardGroup);
    });

    cardGroupsRef.current = cardGroups;
    screenMaterialsRef.current = screenMaterials;
    edgeLineRef.current = edgeLines;

    // 8. Raycaster for clicking & hovering cards
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isPointerDown = false;
    let startX = 0;
    let prevDragX = 0;
    let hasMoved = false;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isPointerDown = true;
      hasMoved = false;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      startX = clientX;
      prevDragX = clientX;
      dragVelocityRef.current = 0;
      setIsDragging(true);
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (isPointerDown) {
        const deltaX = clientX - prevDragX;
        prevDragX = clientX;
        if (Math.abs(clientX - startX) > 8) {
          hasMoved = true;
        }

        // Apply drag directly to target angle
        const angularDelta = (deltaX / container.clientWidth) * (Math.PI / 1.8);
        targetAngleRef.current += angularDelta;
        dragVelocityRef.current = angularDelta;
      }

      // Compute normalized mouse position for hover parallax
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(mouse.x, mouse.y);

      // Hover Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        cardGroups.flatMap((g) => g.children),
        false
      );

      if (intersects.length > 0) {
        let parent = intersects[0].object.parent;
        const matchedIdx = cardGroups.findIndex((g) => g === parent);
        if (matchedIdx !== -1) {
          setHoveredCardIndex(matchedIdx);
          canvas.style.cursor = "pointer";
          return;
        }
      }
      setHoveredCardIndex(null);
      canvas.style.cursor = isPointerDown ? "grabbing" : "grab";
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      setIsDragging(false);

      if (!hasMoved) {
        // Pure click/tap: find which card was clicked
        const rect = canvas.getBoundingClientRect();
        const clientX =
          "changedTouches" in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
        const clientY =
          "changedTouches" in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          cardGroups.flatMap((g) => g.children),
          false
        );

        if (intersects.length > 0) {
          const parent = intersects[0].object.parent;
          const clickedIdx = cardGroups.findIndex((g) => g === parent);
          if (clickedIdx !== -1) {
            if (clickedIdx === activeIndexRef.current) {
              // Clicked center active card: open video reel!
              onOpenReel(HOLO_PROJECTS[clickedIdx].video);
            } else {
              // Clicked side card: bring to center!
              goToSlide(clickedIdx);
            }
          }
          return;
        }
      }

      // Drag released: snap to closest card
      const nearestSlide = Math.round(-targetAngleRef.current / CARD_SPACING);
      const clamped = Math.max(0, Math.min(HOLO_PROJECTS.length - 1, nearestSlide));
      setActiveIndex(clamped);
      targetAngleRef.current = -clamped * CARD_SPACING;
    };

    // Wheel listener for smooth scrolling through cards
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || Math.abs(e.deltaY) > 20) {
        const delta = (e.deltaX || e.deltaY) * 0.0012;
        targetAngleRef.current -= delta;
        const nearestSlide = Math.round(-targetAngleRef.current / CARD_SPACING);
        const clamped = Math.max(0, Math.min(HOLO_PROJECTS.length - 1, nearestSlide));
        setActiveIndex(clamped);
      }
    };

    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("mouseup", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: true });
    canvas.addEventListener("touchstart", handlePointerDown, { passive: true });
    canvas.addEventListener("touchmove", handlePointerMove, { passive: true });
    canvas.addEventListener("touchend", handlePointerUp, { passive: true });

    // 9. Animation Render Loop with Spring Physics
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth dampening towards target angle
      currentAngleRef.current +=
        (targetAngleRef.current - currentAngleRef.current) * Math.min(1, delta * 9);

      // Gently orbit floating particle field
      particles.rotation.y += delta * 0.02;
      particles.rotation.x += delta * 0.008;

      // Update light color to match active card
      if (pointLightRef.current) {
        const activeProj = HOLO_PROJECTS[activeIndexRef.current];
        pointLightRef.current.color.lerp(new THREE.Color(activeProj.glowHex), delta * 4);
      }

      // Position each card along the dynamic spatial arc
      cardGroups.forEach((group, idx) => {
        const relAngle = currentAngleRef.current + idx * CARD_SPACING;
        const isCenter = Math.abs(relAngle) < CARD_SPACING * 0.45;
        const distFromCenter = Math.abs(relAngle);

        // Cylindrical arc placement
        const xPos = Math.sin(relAngle) * RADIUS;
        const zPos = Math.cos(relAngle) * RADIUS - RADIUS;
        const targetRotY = relAngle * 0.82;

        group.position.x = xPos;
        group.position.z = zPos;
        group.rotation.y = targetRotY;

        // Subtle mouse parallax tilt on the active card
        if (isCenter) {
          group.rotation.x = -mouseRef.current.y * 0.08;
          group.rotation.y = targetRotY + mouseRef.current.x * 0.08;
          group.scale.set(1.05, 1.05, 1.05);
        } else {
          group.rotation.x = 0;
          const sideScale = Math.max(0.85, 1.0 - distFromCenter * 0.16);
          group.scale.set(sideScale, sideScale, sideScale);
        }

        // Screen brightness and wireframe glow
        const screenMat = screenMaterials[idx];
        const edgeMesh = edgeLines[idx];
        if (screenMat && edgeMesh) {
          const edgeMat = edgeMesh.material as THREE.LineBasicMaterial;
          if (isCenter) {
            screenMat.emissiveIntensity = 0.32;
            edgeMat.opacity = 0.95;
          } else {
            screenMat.emissiveIntensity = 0.08;
            edgeMat.opacity = 0.22;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    resizeObserver.observe(container);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("mouseup", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("touchstart", handlePointerDown);
      canvas.removeEventListener("touchmove", handlePointerMove);
      canvas.removeEventListener("touchend", handlePointerUp);

      renderer.dispose();
      scene.clear();
    };
  }, [goToSlide, onOpenReel]);

  const activeProject = HOLO_PROJECTS[activeIndex];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-[#07080d] shadow-2xl select-none">
      {/* Top Holographic Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#0a0c14]/85 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
            <span
              className="h-2 w-2 rounded-full animate-ping"
              style={{ backgroundColor: activeProject.accent }}
            />
            <span className="text-white font-medium">3D SPATIAL REEL DECK</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>{activeProject.number} // 03</span>
            <span>•</span>
            <span className="text-neutral-200 tracking-wide font-semibold">
              {activeProject.client}
            </span>
          </div>
        </div>

        {/* Project Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
          {HOLO_PROJECTS.map((proj, idx) => {
            const isCurrent = activeIndex === idx;
            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-white text-black font-semibold shadow-lg"
                    : "text-neutral-400 hover:text-white"
                }`}
                style={{
                  backgroundColor: isCurrent ? proj.accent : undefined,
                  color: isCurrent ? "#05070a" : undefined,
                }}
              >
                <span>{proj.number} {proj.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-[420px] sm:h-[480px] md:h-[540px] cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Hint Pill */}
        <div className="pointer-events-none absolute top-4 left-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-neutral-400">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Drag or swipe to orbit • Click center card to expand reel</span>
        </div>

        {/* Floating Center Card Action CTA */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenReel(activeProject.video)}
            className="group flex items-center gap-2.5 px-6 py-2.5 rounded-full font-mono text-xs font-semibold tracking-wider text-black transition-all shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
            style={{
              backgroundColor: activeProject.accent,
              boxShadow: `0 0 28px ${activeProject.accent}55`,
            }}
          >
            <Play className="h-3.5 w-3.5 fill-current transition-transform group-hover:scale-110" />
            <span>PLAY SHOWCASE REEL [{activeProject.number}]</span>
          </button>
        </div>

        {/* Prev / Next Circular Navigation Arrows */}
        <div className="absolute inset-y-0 left-4 z-10 flex items-center pointer-events-none">
          <button
            type="button"
            onClick={goPrev}
            className="pointer-events-auto h-11 w-11 rounded-full bg-black/70 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-90"
            title="Previous Project (Left Arrow)"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute inset-y-0 right-4 z-10 flex items-center pointer-events-none">
          <button
            type="button"
            onClick={goNext}
            className="pointer-events-auto h-11 w-11 rounded-full bg-black/70 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-90"
            title="Next Project (Right Arrow)"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Active Project Engineering Telemetry Dock */}
      <div className="p-6 md:p-8 bg-[#090b12] border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Project Overview */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs font-mono font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${activeProject.accent}15`,
                  color: activeProject.accent,
                  border: `1px solid ${activeProject.accent}33`,
                }}
              >
                {activeProject.category}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                CLIENT: {activeProject.client}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
              {activeProject.name}
            </h3>

            <p className="text-sm leading-relaxed text-neutral-300 font-sans mb-4">
              {activeProject.description}
            </p>

            {/* Tech stack badges */}
            <div className="flex flex-wrap gap-1.5">
              {activeProject.tech.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/5 border border-white/10 text-neutral-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Performance Telemetry Metrics */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3">
            {activeProject.metrics.map((m) => (
              <div
                key={m.label}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between"
              >
                <span className="text-[10px] font-mono text-neutral-400 tracking-wider">
                  {m.label}
                </span>
                <span
                  className="text-lg md:text-xl font-bold font-mono tracking-tight mt-1"
                  style={{ color: activeProject.accent }}
                >
                  {m.value}
                </span>
              </div>
            ))}

            <div className="col-span-3 mt-1 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>Production Architecture Verified</span>
              </span>

              <button
                type="button"
                onClick={() => onOpenReel(activeProject.video)}
                className="inline-flex items-center gap-1 text-white hover:underline cursor-pointer"
              >
                <span>Watch Case Study</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
