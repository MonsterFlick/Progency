"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Volume2,
  VolumeX,
  RotateCw,
  Play,
  Square,
  Sparkles,
  Maximize2,
  Activity,
  Cpu,
  Layers,
  ExternalLink,
  Film,
  Tv,
} from "lucide-react";

// Color Themes for the Synthesizer Console
export interface SynthTheme {
  id: string;
  name: string;
  primary: string;
  glow: number; // Hex number for Three.js
  accentHex: string;
  bgRgba: string;
}

export const SYNTH_THEMES: SynthTheme[] = [
  {
    id: "cyan",
    name: "Cyber Cyan",
    primary: "#00f0ff",
    glow: 0x00f0ff,
    accentHex: "#38bdf8",
    bgRgba: "rgba(0, 240, 255, 0.15)",
  },
  {
    id: "amber",
    name: "Amber Core",
    primary: "#f59e0b",
    glow: 0xffaa00,
    accentHex: "#fbbf24",
    bgRgba: "rgba(245, 158, 11, 0.15)",
  },
  {
    id: "emerald",
    name: "Matrix Emerald",
    primary: "#10b981",
    glow: 0x10b981,
    accentHex: "#34d399",
    bgRgba: "rgba(16, 185, 129, 0.15)",
  },
  {
    id: "violet",
    name: "Hyper Violet",
    primary: "#c084fc",
    glow: 0xd946ef,
    accentHex: "#e879f9",
    bgRgba: "rgba(217, 70, 239, 0.15)",
  },
];

// Showcase Projects linked to the Screen
export interface ShowcaseProject {
  id: string;
  name: string;
  tagline: string;
  video: string;
}

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: "alphatech",
    name: "AlphaTech Nutrition",
    tagline: "High-Performance E-Commerce Storefront",
    video: "/media/tech-showcase/alphatech_landscape_1920x1080.mp4",
  },
  {
    id: "fertisure",
    name: "FertiSure MedTech",
    tagline: "Precision Embryology Web Platform",
    video: "/media/tech-showcase/fertisure_landscape_1920x1080.mp4",
  },
  {
    id: "nonudes",
    name: "NoNudes Flagship",
    tagline: "Editorial Dark-Mode Streetwear Experience",
    video: "/media/tech-showcase/nonudes_landscape_1920x1080.mp4",
  },
];

// Synth musical notes (Minor Pentatonic / Dorian scale)
interface SynthPad {
  id: number;
  label: string;
  note: string;
  freq: number;
  key: string;
}

const SYNTH_PADS: SynthPad[] = [
  { id: 0, label: "PAD 1", note: "C3", freq: 130.81, key: "1" },
  { id: 1, label: "PAD 2", note: "Eb3", freq: 155.56, key: "2" },
  { id: 2, label: "PAD 3", note: "F3", freq: 174.61, key: "3" },
  { id: 3, label: "PAD 4", note: "G3", freq: 196.0, key: "4" },
  { id: 4, label: "PAD 5", note: "Bb3", freq: 233.08, key: "5" },
  { id: 5, label: "PAD 6", note: "C4", freq: 261.63, key: "6" },
  { id: 6, label: "PAD 7", note: "Eb4", freq: 311.13, key: "7" },
  { id: 7, label: "PAD 8", note: "F4", freq: 349.23, key: "8" },
];

interface CameraPreset {
  name: string;
  pos: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: CameraPreset[] = [
  { name: "Perspective", pos: [1.3, 1.15, 1.55], target: [0, -0.05, 0] },
  { name: "Screen Close-Up", pos: [0.0, 0.68, 0.34], target: [0, 0.395, -0.024] },
  { name: "Top Deck", pos: [0.0, 1.85, 0.35], target: [0, -0.05, 0] },
  { name: "Front Sliders", pos: [0.0, 0.65, 1.7], target: [0, 0.05, 0] },
];

export interface TechSynthConsoleProps {
  onOpenReel?: (videoUrl: string) => void;
  isReelActive?: boolean;
}

export default function TechSynthConsole({
  onOpenReel,
  isReelActive = false,
}: TechSynthConsoleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeTheme, setActiveTheme] = useState<SynthTheme>(SYNTH_THEMES[0]);
  const [activeProject, setActiveProject] = useState<ShowcaseProject>(SHOWCASE_PROJECTS[0]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isArpeggiating, setIsArpeggiating] = useState(false);
  const [activePadIndex, setActivePadIndex] = useState<number | null>(null);
  const [isHoveringScreen, setIsHoveringScreen] = useState(false);
  const [isZoomingToScreen, setIsZoomingToScreen] = useState(false);
  const [lastTelemetry, setLastTelemetry] = useState<string>("READY • 44.1kHz • 24-BIT");

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const buttonsMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Audio wave visualization metrics
  const waveEnergyRef = useRef<number>(0.2);

  // Camera lerp animation
  const camLerpRef = useRef<{
    active: boolean;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    progress: number;
    speed: number;
    onComplete?: () => void;
  } | null>(null);

  // Web Audio Context reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const arpIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Audio
  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Play synthesized sci-fi warp / screen zoom whoosh
  const playScreenZoomSound = useCallback(() => {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Resonant upward power-up swoosh
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.45);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(5000, now + 0.35);
      filter.Q.setValueAtTime(6.0, now);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.28, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch (err) {
      console.warn("Screen audio zoom sound error:", err);
    }
  }, [isAudioMuted, getAudioContext]);

  // Play synthesized retro futuristic sound
  const playSynthNote = useCallback(
    (freq: number, padId?: number, noteName?: string) => {
      waveEnergyRef.current = 1.0;
      if (padId !== undefined) {
        setActivePadIndex(padId);
        setTimeout(() => setActivePadIndex(null), 250);
      }
      setLastTelemetry(
        `TRIGGER: ${noteName || "KEY"} • ${freq.toFixed(1)} Hz • SAW/SUB FILTER`
      );

      // Emissive pulse on 3D machine buttons
      if (buttonsMatRef.current) {
        buttonsMatRef.current.emissiveIntensity = 3.6;
        const fade = () => {
          if (buttonsMatRef.current && buttonsMatRef.current.emissiveIntensity > 1.6) {
            buttonsMatRef.current.emissiveIntensity = Math.max(
              1.6,
              buttonsMatRef.current.emissiveIntensity - 0.15
            );
            requestAnimationFrame(fade);
          }
        };
        requestAnimationFrame(fade);
      }

      if (isAudioMuted) return;

      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        // Dual Oscillators: Sawtooth (Lead) + Sine (Sub)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const subOsc = ctx.createOscillator();

        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(freq, now);

        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(freq * 1.004, now); // Slight detune for thick chorus

        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(freq * 0.5, now); // 1 Octave down punch

        // Resonant Lowpass Filter
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(freq * 1.5, now);
        filter.frequency.exponentialRampToValueAtTime(
          Math.min(freq * 4.5, 4500),
          now + 0.05
        );
        filter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.35);
        filter.Q.setValueAtTime(3.8, now);

        // Amplitude Envelope (ADSR)
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.22, now + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.12);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        // Routing
        osc1.connect(filter);
        osc2.connect(filter);
        subOsc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        subOsc.start(now);

        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
        subOsc.stop(now + 0.5);
      } catch (err) {
        console.warn("Audio synthesis trigger error:", err);
      }
    },
    [isAudioMuted, getAudioContext]
  );

  // Arpeggiator loop
  useEffect(() => {
    if (!isArpeggiating) {
      if (arpIntervalRef.current) {
        clearInterval(arpIntervalRef.current);
        arpIntervalRef.current = null;
      }
      return;
    }

    const arpSequence = [0, 2, 4, 6, 7, 5, 3, 1];
    let step = 0;

    arpIntervalRef.current = setInterval(() => {
      const padIdx = arpSequence[step % arpSequence.length];
      const pad = SYNTH_PADS[padIdx];
      playSynthNote(pad.freq, pad.id, pad.note);
      step++;
    }, 190);

    return () => {
      if (arpIntervalRef.current) {
        clearInterval(arpIntervalRef.current);
        arpIntervalRef.current = null;
      }
    };
  }, [isArpeggiating, playSynthNote]);

  // Keyboard shortcut listener (keys 1 through 8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      const pad = SYNTH_PADS.find((p) => p.key === e.key);
      if (pad) {
        e.preventDefault();
        playSynthNote(pad.freq, pad.id, pad.note);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playSynthNote]);

  // Smooth camera glide
  const animateCameraTo = useCallback(
    (preset: CameraPreset, speed = 2.2, onComplete?: () => void) => {
      if (!cameraRef.current || !controlsRef.current) return;
      camLerpRef.current = {
        active: true,
        startPos: cameraRef.current.position.clone(),
        endPos: new THREE.Vector3(...preset.pos),
        startTarget: controlsRef.current.target.clone(),
        endTarget: new THREE.Vector3(...preset.target),
        progress: 0,
        speed,
        onComplete,
      };
    },
    []
  );

  // Trigger Cinematic Screen Zoom-In & Play Video Showcase
  const handleZoomAndPlayScreen = useCallback(
    (projectToPlay = activeProject) => {
      setIsZoomingToScreen(true);
      playScreenZoomSound();
      setLastTelemetry(`ENGAGING SCREEN ZOOM // ${projectToPlay.name.toUpperCase()}`);

      // Smoothly zoom camera into screen
      animateCameraTo(
        {
          name: "Screen Close-Up",
          pos: [0.0, 0.68, 0.34],
          target: [0, 0.395, -0.024],
        },
        1.8,
        () => {
          setIsZoomingToScreen(false);
          if (onOpenReel) {
            onOpenReel(projectToPlay.video);
          }
        }
      );
    },
    [activeProject, animateCameraTo, playScreenZoomSound, onOpenReel]
  );

  // When reel closes, smoothly zoom back to perspective view
  useEffect(() => {
    if (!isReelActive && cameraRef.current && controlsRef.current) {
      // Check if camera was in screen close-up
      const distToScreen = cameraRef.current.position.distanceTo(
        new THREE.Vector3(0.0, 0.68, 0.34)
      );
      if (distToScreen < 0.2) {
        animateCameraTo(CAMERA_PRESETS[0], 2.0);
      }
    }
  }, [isReelActive, animateCameraTo]);

  // Switch Theme
  const handleSelectTheme = (theme: SynthTheme) => {
    setActiveTheme(theme);
    if (buttonsMatRef.current) {
      buttonsMatRef.current.emissive.setHex(theme.glow);
      buttonsMatRef.current.emissiveIntensity = 2.2;
    }
    if (pointLightRef.current) {
      pointLightRef.current.color.setHex(theme.glow);
    }
    if (keyLightRef.current) {
      keyLightRef.current.color.setHex(theme.glow);
    }
  };

  // Main Three.js Scene Setup & Model Loading
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(1.3, 1.15, 1.55);
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

    // 4. OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.4;
    controls.maxDistance = 3.8;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.target.set(0, -0.05, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(activeTheme.glow, 1.8);
    keyLight.position.set(2, 3.5, 2.5);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const rimLight = new THREE.DirectionalLight(0x4080ff, 1.2);
    rimLight.position.set(-2.5, 2.0, -2.5);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(activeTheme.glow, 2.5, 3.5);
    pointLight.position.set(0, 0.45, 0.3);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.45);
    fillLight.position.set(0, -1, 2);
    scene.add(fillLight);

    // Floor shadow plate
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.32;
    scene.add(shadowMesh);

    // 6. 3D Dynamic Interactive Canvas Screen Mesh
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 1024;
    screenCanvas.height = 384;
    screenCanvasRef.current = screenCanvas;

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.generateMipmaps = true;
    screenTexture.minFilter = THREE.LinearMipmapLinearFilter;
    screenTextureRef.current = screenTexture;

    // Position matches the tilted upper console screen of the model
    const screenGeo = new THREE.PlaneGeometry(0.68, 0.23);
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      emissiveMap: screenTexture,
      emissive: new THREE.Color(activeTheme.glow),
      emissiveIntensity: 1.4,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.98,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.395, -0.024);
    screenMesh.rotation.x = -0.66; // Tilts with the console
    screenMesh.name = "Synth_Screen";
    scene.add(screenMesh);
    screenMeshRef.current = screenMesh;

    // 7. Raycaster for clicking Screen & Buttons
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let downPos = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      downPos = { x: clientX, y: clientY };
      isDragging = false;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      if (Math.hypot(clientX - downPos.x, clientY - downPos.y) > 6) {
        isDragging = true;
      }

      // Check hover on screen
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects([screenMesh], false);
      if (intersects.length > 0) {
        setIsHoveringScreen(true);
        canvas.style.cursor = "pointer";
      } else {
        setIsHoveringScreen(false);
        canvas.style.cursor = "grab";
      }
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      if (isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const clientX =
        "changedTouches" in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY =
        "changedTouches" in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check if user clicked on the Screen
      const screenIntersects = raycaster.intersectObject(screenMesh, false);
      if (screenIntersects.length > 0) {
        handleZoomAndPlayScreen();
        return;
      }

      // Check if user clicked on any part of the 3D Machine
      const modelIntersects = raycaster.intersectObjects(scene.children, true);
      if (modelIntersects.length > 0) {
        const hit = modelIntersects[0];

        // If clicked on upper screen area of the chassis
        if (hit.point.y > 0.28 && hit.point.z < 0.08) {
          handleZoomAndPlayScreen();
          return;
        }

        // Otherwise, user clicked keys/buttons: trigger audio synthesis!
        const normalizedX = (hit.point.x + 0.45) / 0.9;
        const padIdx = Math.min(
          SYNTH_PADS.length - 1,
          Math.max(0, Math.floor(normalizedX * SYNTH_PADS.length))
        );
        const pad = SYNTH_PADS[padIdx];
        playSynthNote(pad.freq, pad.id, `KEY ${pad.note}`);
      }
    };

    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("mouseup", handlePointerUp);
    canvas.addEventListener("touchstart", handlePointerDown, { passive: true });
    canvas.addEventListener("touchmove", handlePointerMove, { passive: true });
    canvas.addEventListener("touchend", handlePointerUp, { passive: true });

    // 8. Load GLB Model
    const loader = new GLTFLoader();
    loader.load(
      "/models/sci-fi_synth_machine.glb",
      (gltf) => {
        const model = gltf.scene;

        // Auto-center model at (0, 0, 0)
        const bbox = new THREE.Box3().setFromObject(model);
        const center = bbox.getCenter(new THREE.Vector3());
        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        // Traverse & enhance materials
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const mat = Array.isArray(mesh.material)
              ? (mesh.material[0] as THREE.MeshStandardMaterial)
              : (mesh.material as THREE.MeshStandardMaterial);

            if (mat && mat.name === "Synth_Buttons") {
              mat.emissive = new THREE.Color(activeTheme.glow);
              mat.emissiveIntensity = 1.8;
              mat.toneMapped = true;
              buttonsMatRef.current = mat;
            }

            if (mat && mat.name === "Synth_Machine") {
              mat.roughness = 0.35;
              mat.metalness = 0.85;
            }
          }
        });

        scene.add(model);
        setLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (error) => {
        console.error("Failed to load 3D synthesizer model:", error);
        setLoading(false);
      }
    );

    // 9. Render & Screen Canvas Animation Loop
    const clock = new THREE.Clock();
    let simTime = 0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      simTime += delta;

      // Update 3D Canvas Screen texture
      if (screenCanvasRef.current && screenTextureRef.current) {
        const sCtx = screenCanvasRef.current.getContext("2d");
        if (sCtx) {
          const w = screenCanvasRef.current.width;
          const h = screenCanvasRef.current.height;

          // Clear & background
          sCtx.fillStyle = "#03060a";
          sCtx.fillRect(0, 0, w, h);

          // Grid scanlines
          sCtx.strokeStyle = "rgba(255, 255, 255, 0.04)";
          sCtx.lineWidth = 1;
          for (let y = 0; y < h; y += 16) {
            sCtx.beginPath();
            sCtx.moveTo(0, y);
            sCtx.lineTo(w, y);
            sCtx.stroke();
          }

          // Top Header Bar
          sCtx.fillStyle = activeTheme.primary;
          sCtx.font = "bold 20px monospace";
          sCtx.fillText("PROGENCY WORKSTATION // V-2.6", 28, 44);

          sCtx.fillStyle = "#94a3b8";
          sCtx.font = "16px monospace";
          sCtx.fillText("STATUS: ACTIVE REEL ONLINE", 28, 70);

          // Oscilloscope / Sound Waveform animation
          sCtx.lineWidth = 2.5;
          sCtx.strokeStyle = activeTheme.primary;
          sCtx.beginPath();
          const amp = 24 + waveEnergyRef.current * 42;
          for (let x = 0; x < w; x += 6) {
            const freqVal = (x / w) * 12 + simTime * 4;
            const yOffset =
              Math.sin(freqVal) * amp * Math.cos(x * 0.02 + simTime) +
              h * 0.44;
            if (x === 0) sCtx.moveTo(x, yOffset);
            else sCtx.lineTo(x, yOffset);
          }
          sCtx.stroke();

          // Decay wave energy back to baseline
          waveEnergyRef.current = Math.max(0.15, waveEnergyRef.current - delta * 1.5);

          // Central Play Prompt Box
          const pulse = Math.sin(simTime * 5) * 0.2 + 0.8;
          sCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
          sCtx.strokeStyle = activeTheme.primary;
          sCtx.lineWidth = 2;
          sCtx.beginPath();
          sCtx.roundRect(w * 0.15, h * 0.62, w * 0.7, 95, 12);
          sCtx.fill();
          sCtx.stroke();

          // Play icon
          sCtx.fillStyle = activeTheme.primary;
          sCtx.beginPath();
          const px = w * 0.2;
          const py = h * 0.74;
          sCtx.moveTo(px, py - 18);
          sCtx.lineTo(px + 28, py);
          sCtx.lineTo(px, py + 18);
          sCtx.closePath();
          sCtx.fill();

          // Text prompt
          sCtx.fillStyle = "#ffffff";
          sCtx.font = "bold 24px monospace";
          sCtx.fillText("CLICK SCREEN TO ZOOM & PLAY SHOWCASE", px + 44, py - 6);

          sCtx.fillStyle = activeTheme.primary;
          sCtx.font = "18px monospace";
          sCtx.fillText(
            `REEL: ${activeProject.name.toUpperCase()} • ${activeProject.tagline.toUpperCase()}`,
            px + 44,
            py + 20
          );

          screenTextureRef.current.needsUpdate = true;
        }
      }

      // Camera lerp animation
      if (camLerpRef.current && camLerpRef.current.active) {
        const lerp = camLerpRef.current;
        lerp.progress += delta * lerp.speed;
        const t = Math.min(1, lerp.progress);
        const easeT = 0.5 - 0.5 * Math.cos(t * Math.PI); // easeInOutSine

        camera.position.lerpVectors(lerp.startPos, lerp.endPos, easeT);
        controls.target.lerpVectors(lerp.startTarget, lerp.endTarget, easeT);

        if (t >= 1) {
          camLerpRef.current.active = false;
          if (lerp.onComplete) {
            lerp.onComplete();
          }
        }
      } else {
        controls.autoRotate = isAutoRotate && !isHoveringScreen;
        controls.autoRotateSpeed = 1.0;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("mouseup", handlePointerUp);
      canvas.removeEventListener("touchstart", handlePointerDown);
      canvas.removeEventListener("touchmove", handlePointerMove);
      canvas.removeEventListener("touchend", handlePointerUp);

      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [
    playSynthNote,
    activeTheme,
    activeProject,
    isAutoRotate,
    isHoveringScreen,
    handleZoomAndPlayScreen,
  ]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#08080c] shadow-2xl">
      {/* Top HUD Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0d0d13]/90 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-white/5 border border-white/10 font-mono text-xs">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-white font-medium">SYS-CON//SYNTH-01</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span
              className="inline-block h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: activeTheme.primary }}
            />
            <span className="text-neutral-300">{lastTelemetry}</span>
          </div>
        </div>

        {/* Quick Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom and Play Screen Button */}
          <button
            type="button"
            onClick={() => handleZoomAndPlayScreen()}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all border cursor-pointer bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10 font-semibold"
            title="Zoom into 3D Screen and Play Video Showcase"
          >
            <Film className="h-3.5 w-3.5" />
            <span>ZOOM & PLAY SCREEN</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            type="button"
            onClick={() => {
              getAudioContext();
              setIsAudioMuted(!isAudioMuted);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors border cursor-pointer ${
              !isAudioMuted
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
            }`}
            title={isAudioMuted ? "Unmute Audio Engine" : "Mute Audio Engine"}
          >
            {!isAudioMuted ? (
              <Volume2 className="h-3.5 w-3.5" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
            <span className="hidden xs:inline">{isAudioMuted ? "MUTED" : "SYNTH ON"}</span>
          </button>

          {/* Arpeggiator Autoplay */}
          <button
            type="button"
            onClick={() => {
              getAudioContext();
              setIsArpeggiating(!isArpeggiating);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors border cursor-pointer ${
              isArpeggiating
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse"
                : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
            }`}
            title="Toggle Arpeggiator Demo"
          >
            {isArpeggiating ? (
              <Square className="h-3 w-3 fill-current" />
            ) : (
              <Play className="h-3 w-3 fill-current" />
            )}
            <span className="hidden xs:inline">ARP {isArpeggiating ? "ACTIVE" : "PLAY"}</span>
          </button>

          {/* Turntable Auto-Rotate */}
          <button
            type="button"
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors border cursor-pointer ${
              isAutoRotate
                ? "bg-white/10 border-white/20 text-white"
                : "bg-white/5 border-white/10 text-neutral-500 hover:text-white"
            }`}
            title="Toggle 360 Turntable"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isAutoRotate ? "text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">360°</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[400px] sm:h-[460px] md:h-[540px] cursor-grab active:cursor-grabbing select-none overflow-hidden"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#070709]/90 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-6 w-6 text-cyan-400 animate-pulse" />
              <span className="text-sm font-mono tracking-widest uppercase text-white font-semibold">
                Initializing 3D Synth Engine...
              </span>
            </div>
            <div className="w-48 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${Math.max(15, loadProgress)}%` }}
              />
            </div>
            <span className="mt-2 text-[10px] font-mono text-neutral-400">
              Loading 3D Meshes & PBR Shaders ({loadProgress}%)
            </span>
          </div>
        )}

        {/* Zooming in Progress Overlay banner */}
        {isZoomingToScreen && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-cyan-500/10 backdrop-blur-[1px] transition-all">
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/80 border border-cyan-400 text-cyan-300 font-mono text-sm tracking-widest uppercase animate-pulse shadow-2xl">
              <Film className="h-4 w-4" />
              <span>ZOOMING INTO CONSOLE DISPLAY...</span>
            </div>
          </div>
        )}

        {/* Floating Screen Callout Reticle (Centered above machine) */}
        {!loading && (
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div
              onClick={() => handleZoomAndPlayScreen()}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md cursor-pointer transition-all duration-200 ${
                isHoveringScreen
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20 scale-105"
                  : "bg-black/60 border-white/15 text-neutral-300 hover:text-white hover:border-white/30"
              }`}
            >
              <Tv className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-medium">
                {isHoveringScreen ? "▶ CLICK TO ZOOM & EXPAND SCREEN" : "CLICK SCREEN // PLAY REEL"}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-neutral-400 pointer-events-none">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>Tap buttons to trigger notes • Drag to rotate 360°</span>
            </div>
          </div>
        )}

        {/* Camera Preset Quick-Pills (Right side) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
          {CAMERA_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => animateCameraTo(preset)}
              className="px-2.5 py-1 rounded bg-black/60 hover:bg-white/15 border border-white/10 text-[10px] font-mono tracking-wider text-neutral-300 hover:text-white backdrop-blur-md cursor-pointer transition-all text-left flex items-center justify-between gap-2 shadow-lg"
            >
              <span>{preset.name}</span>
              <Maximize2 className="h-2.5 w-2.5 opacity-60" />
            </button>
          ))}
        </div>

        {/* Active Showcase Project Selector (Pills on screen) */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
          <span className="text-[10px] font-mono text-neutral-400 px-1.5 hidden xs:inline">
            SCREEN REEL:
          </span>
          {SHOWCASE_PROJECTS.map((proj) => (
            <button
              key={proj.id}
              type="button"
              onClick={() => {
                setActiveProject(proj);
                setLastTelemetry(`LOADED: ${proj.name.toUpperCase()} REEL`);
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-mono transition-all cursor-pointer border ${
                activeProject.id === proj.id
                  ? "bg-white/20 border-white text-white font-semibold shadow-md"
                  : "bg-white/5 border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {proj.name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Theme Color Selector Floating Bar (Left bottom) */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
          <span className="text-[10px] font-mono text-neutral-400 px-1.5 hidden xs:inline">
            CORE:
          </span>
          {SYNTH_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelectTheme(theme)}
              className={`h-6 w-6 rounded-lg transition-transform cursor-pointer border flex items-center justify-center ${
                activeTheme.id === theme.id
                  ? "scale-110 border-white shadow-md ring-2 ring-white/20"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              style={{ backgroundColor: theme.primary }}
              title={theme.name}
            />
          ))}
        </div>
      </div>

      {/* Cybernetic Step Sequencer / Keyboard Trigger Pads */}
      <div className="p-3 bg-[#0a0a0f] border-t border-white/10">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
            <Layers className="h-3.5 w-3.5 text-neutral-400" />
            <span>INTERACTIVE FREQUENCY PADS [KEYS 1-8]</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">
            DORIAN CYBER SCALE
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {SYNTH_PADS.map((pad) => {
            const isActive = activePadIndex === pad.id;
            return (
              <button
                key={pad.id}
                type="button"
                onClick={() => {
                  getAudioContext();
                  playSynthNote(pad.freq, pad.id, pad.note);
                }}
                className={`group relative flex flex-col items-center justify-center p-2 rounded-lg border font-mono transition-all duration-100 cursor-pointer ${
                  isActive
                    ? "scale-95 bg-white text-black shadow-lg"
                    : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-neutral-300"
                }`}
                style={{
                  borderColor: isActive ? activeTheme.primary : undefined,
                  boxShadow: isActive ? `0 0 16px ${activeTheme.primary}` : undefined,
                }}
              >
                <span className="text-xs font-bold tracking-wider">{pad.note}</span>
                <span className="text-[9px] opacity-60 mt-0.5">[{pad.key}]</span>
                <span className="text-[8px] opacity-40">{Math.round(pad.freq)}Hz</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Integrated Tech Project Telemetry */}
      {onOpenReel && (
        <div className="px-4 py-2.5 bg-[#07070a] border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>LINKED PRODUCTION REELS:</span>
          </div>
          <div className="flex items-center gap-3">
            {SHOWCASE_PROJECTS.map((proj, idx) => (
              <React.Fragment key={proj.id}>
                {idx > 0 && <span className="text-neutral-600">•</span>}
                <button
                  type="button"
                  onClick={() => handleZoomAndPlayScreen(proj)}
                  className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{proj.name}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
