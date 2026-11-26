"use client";

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

const emptySubscribe = () => () => {};

export interface WorkItem {
  title: string;
  subtext: string;
  image: string;
  video: string | null;
}

export interface WorkCategory {
  id: string;
  title: string;
  items: WorkItem[];
}

export const WORK_CATEGORIES: WorkCategory[] = [
  {
    id: "motion-design",
    title: "Motion Design",
    items: [
      {
        title: "Freeflow Logo",
        subtext: "Fluid vector morphing and kinetic brand identity reveal.",
        image: "/assets/images/video_posters/freeflow_logo_thumb.jpg",
        video: "/assets/videos/freeflow_logo.mp4",
      },
      {
        title: "Posh Motion",
        subtext: "Commercial pacing, visual rhythm, and typographic motion.",
        image: "/assets/images/video_posters/posh_video_thumb.jpg",
        video: "/assets/videos/posh_video.mp4",
      },
      {
        title: "Tatva Identity",
        subtext: "Geometric logo sting built with precision keyframing.",
        image: "/assets/images/video_posters/tatva_logo_thumb.jpg",
        video: "/assets/videos/tatva_logo.mp4",
      },
      {
        title: "Ekam Kashi",
        subtext: "Luminous brand mark reveal and minimal motion direction.",
        image: "/assets/images/video_posters/ekam_kashi_thumb.jpg",
        video: "/assets/videos/ekam_kashi_logo.mp4",
      },
      {
        title: "Salt Logo",
        subtext: "Clean corporate mark reveal with crisp typographic timing.",
        image: "/assets/images/video_posters/salt_logo_thumb.jpg",
        video: "/assets/videos/salt_logo.mp4",
      },
      {
        title: "Zara Remake",
        subtext: "Editorial kinetic typography and visual pacing study.",
        image: "/assets/images/optimized/zara_remake.webp",
        video: null,
      },
    ],
  },
  {
    id: "technology",
    title: "Technology",
    items: [
      {
        title: "FertiSure MedTech",
        subtext: "Clinical telemetry platform and encrypted patient workflows.",
        image: "/media/tech-showcase/fertisure_poster.webp",
        video: "/media/tech-showcase/fertisure_landscape_1920x1080.mp4",
      },
      {
        title: "AlphaTech Nutrition",
        subtext: "3D interactive storefront engineered for performance commerce.",
        image: "/media/tech-showcase/alphatech_poster.webp",
        video: "/media/tech-showcase/alphatech_landscape_1920x1080.mp4",
      },
    ],
  },
  {
    id: "podcast-doc",
    title: "Podcast & Doc",
    items: [
      {
        title: "Yemen Crisis",
        subtext: "Geopolitical documentary editing and narrative pacing.",
        image: "/assets/images/video_posters/yemen_crisis_thumb.jpg",
        video: "/assets/videos/yemen_crisis.mp4",
      },
      {
        title: "Podcast Preview",
        subtext: "Immersive horror audio storytelling and atmospheric cut.",
        image: "/assets/images/video_posters/podcast_preview_thumb.jpg",
        video: "/assets/videos/podcast_preview.mp4",
      },
      {
        title: "China's Population",
        subtext: "Data-led economic documentary with layered sound design.",
        image: "/assets/images/video_posters/china_population_thumb.jpg",
        video: "/assets/videos/china_population.mp4",
      },
      {
        title: "Lt. Gen. Raj Shukla",
        subtext: "Long-form defense interview with multi-camera editorial pacing.",
        image: "/assets/images/video_posters/indian_military_thumb.jpg",
        video: "/assets/videos/indian_military_podcast.mp4",
      },
      {
        title: "The Free Flow Podcast",
        subtext: "Full-length cultural dialogue edited for long-form retention.",
        image: "/assets/images/video_posters/indian_culture_dying_thumb.jpg",
        video: "/assets/videos/indian_culture_dying_podcast.mp4",
      },
    ],
  },
  {
    id: "social-media",
    title: "Social Media",
    items: [
      {
        title: "A Club Businessman",
        subtext: "High-contrast YouTube packaging and visual hierarchy.",
        image: "/assets/images/optimized/a_club_businessman.webp",
        video: null,
      },
      {
        title: "A Club Country",
        subtext: "Bold editorial thumbnail artwork engineered for click-through.",
        image: "/assets/images/optimized/a_club_country.webp",
        video: null,
      },
      {
        title: "EZSnippet Reel",
        subtext: "Fast-paced tech commentary with custom motion overlays.",
        image: "/assets/images/video_posters/ezsnippet_thumb.jpg",
        video: "/assets/videos/ezsnippet.mp4",
      },
      {
        title: "Gaming Montage",
        subtext: "High-energy key art composition and lighting direction.",
        image: "/assets/images/optimized/montage.webp",
        video: null,
      },
      {
        title: "Hallow Face",
        subtext: "Atmospheric visual manipulation and social cover art.",
        image: "/assets/images/optimized/hallow_face.webp",
        video: null,
      },
    ],
  },
];

interface GridCardMeta extends WorkItem {
  categoryIndex: number;
  itemIndex: number;
  categoryTitle: string;
}

// 4x2 Grid order: Horizontal left+right pairs per category
// Row 0: Motion Design (0, 1) | Technology (2, 3)
// Row 1: Podcast & Doc (4, 5) | Social Media (6, 7)
const SHOWCASE_GRID_ITEMS: GridCardMeta[] = WORK_CATEGORIES.flatMap((cat, catIdx) =>
  cat.items.slice(0, 2).map((item, itemIdx) => ({
    ...item,
    categoryIndex: catIdx,
    itemIndex: itemIdx,
    categoryTitle: cat.title,
  }))
);

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const out = (t: number) => 1 - Math.pow(1 - t, 3);
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

interface GridCell {
  x: number;
  y: number;
  w: number;
  h: number;
  vw: number;
  vh: number;
  c: number;
  r: number;
}

interface CardItem {
  i: number;
  title: string;
  categoryTitle: string;
  categoryIndex: number;
  itemIndex: number;
  v: HTMLVideoElement | null;
  posterImg: HTMLImageElement;
  posterTex: THREE.Texture;
  videoTex: THREE.VideoTexture | null;
  geo: THREE.PlaneGeometry;
  mat: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  rect: GridCell | null;
  cleanupVideo?: () => void;
}

interface PreviewSelection {
  categoryIndex: number;
  itemIndex: number;
}

export function OurWorkHero() {
  const [previewSelection, setPreviewSelection] = useState<PreviewSelection | null>(null);
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const gridLabelsRef = useRef<HTMLDivElement>(null);
  const cardLabelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const groupOverlayRef = useRef<HTMLDivElement>(null);
  const groupBoxRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeCategory = previewSelection ? WORK_CATEGORIES[previewSelection.categoryIndex] : null;
  const activeItem =
    previewSelection && activeCategory ? activeCategory.items[previewSelection.itemIndex] : null;

  const stepCategory = useCallback((delta: number) => {
    setPreviewSelection((prev) => {
      if (!prev) return prev;
      const nextCat = (prev.categoryIndex + delta + WORK_CATEGORIES.length) % WORK_CATEGORIES.length;
      return { categoryIndex: nextCat, itemIndex: 0 };
    });
  }, []);

  const stepItemInCategory = useCallback((delta: number) => {
    setPreviewSelection((prev) => {
      if (!prev) return prev;
      const cat = WORK_CATEGORIES[prev.categoryIndex];
      const nextItem = (prev.itemIndex + delta + cat.items.length) % cat.items.length;
      return { categoryIndex: prev.categoryIndex, itemIndex: nextItem };
    });
  }, []);

  // Keyboard navigation inside Apple-style big preview modal
  useEffect(() => {
    if (!previewSelection) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewSelection(null);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepCategory(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepCategory(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        stepItemInCategory(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        stepItemInCategory(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewSelection, stepCategory, stepItemInCategory]);

  useEffect(() => {
    const canvasHost = canvasHostRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!canvasHost || !track || !stage) return;

    let disposed = false;

    // Create a fresh canvas per mount so HMR / StrictMode never reuses a stale WebGL context
    canvasHost.replaceChildren();
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvasHost.appendChild(canvas);

    /* ---------- renderer & camera ---------- */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x0a0a0b, 1);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    const scene = new THREE.Scene();
    const FOV = 35;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

    /* ---------- ribbon path ---------- */
    let path: THREE.CatmullRomCurve3;
    let PATH_L = 1;
    const SAMPLES = 1200;
    const pathP: THREE.Vector3[] = [];
    const pathT: THREE.Vector3[] = [];
    const PH0 = -1.5;
    const PH1 = Math.PI * 2 + 1.35;

    function buildPath() {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 160; i++) {
        const t = i / 160;
        const ph = mix(PH0, PH1, t);
        const cs = Math.cos(ph);
        const u = 2 * t - 1;
        const depth = cs > 0 ? 7.6 + 16.4 * Math.pow(cs, 0.9) : 7.6 + 2.2 * cs;
        const edge = 0.84 + 0.5 * span(0.14 - t, 0, 0.14) + 0.8 * span(t, 0.84, 1);
        pts.push(
          new THREE.Vector3(
            edge * Math.sin(ph) * depth * 0.561,
            0.5 * Math.sign(u) * Math.pow(Math.abs(u), 1.4) * depth * 0.63,
            -depth
          )
        );
      }
      path = new THREE.CatmullRomCurve3(pts, false, "centripetal");
      path.arcLengthDivisions = 1500;
      PATH_L = path.getLength();
      pathP.length = 0;
      pathT.length = 0;
      for (let i = 0; i <= SAMPLES; i++) {
        const u = i / SAMPLES;
        pathP.push(path.getPointAt(u));
        pathT.push(path.getTangentAt(u));
      }
    }

    const at = (s: number, outP: THREE.Vector3, outT: THREE.Vector3) => {
      const f = clamp(s / PATH_L) * SAMPLES;
      const i = Math.min(SAMPLES - 1, f | 0);
      const a = f - i;
      outP.lerpVectors(pathP[i], pathP[i + 1], a);
      outT.lerpVectors(pathT[i], pathT[i + 1], a).normalize();
    };

    /* ---------- cards ---------- */
    const CARD_W = 2.1;
    const CARD_H = 1.32;
    const GAP = 0.03;
    const STEP = CARD_W + GAP;
    const NX = 28;
    const NY = 3;

    const vs = `
      varying vec2 vUv;
      void main(){
        vUv=uv;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
      }
    `;

    const fs = `
      uniform sampler2D map;
      uniform vec2 cover;
      uniform float aspect,ready,radius;
      varying vec2 vUv;
      void main(){
        vec2 q=(abs(vUv-.5)-.5)*vec2(aspect,1.)+radius;
        float d=length(max(q,0.))+min(max(q.x,q.y),0.)-radius;
        float px=fwidth(d),a=1.-smoothstep(-px,px,d);
        if(a<.01)discard;
        vec2 uv=vUv;
        if(!gl_FrontFacing)uv.x=1.-uv.x;
        vec3 c=mix(vec3(.075),texture2D(map,(uv-.5)*cover+.5).rgb,ready);
        float edge=smoothstep(-.012-px,-.012,d);
        gl_FragColor=vec4(mix(c,vec3(1.),edge*.04),a);
      }
    `;

    const cards: CardItem[] = SHOWCASE_GRID_ITEMS.map((item, i) => {
      const posterImg = new Image();
      posterImg.crossOrigin = "anonymous";
      const posterTex = new THREE.Texture(posterImg);
      posterTex.colorSpace = THREE.SRGBColorSpace;
      posterTex.minFilter = THREE.LinearFilter;
      posterTex.magFilter = THREE.LinearFilter;
      posterTex.generateMipmaps = false;

      let v: HTMLVideoElement | null = null;
      let videoTex: THREE.VideoTexture | null = null;

      if (item.video) {
        v = document.createElement("video");
        Object.assign(v, {
          crossOrigin: "anonymous",
          muted: true,
          loop: true,
          playsInline: true,
          preload: "metadata",
          src: item.video,
        });
        v.setAttribute("playsinline", "");
        videoTex = new THREE.VideoTexture(v);
        videoTex.colorSpace = THREE.SRGBColorSpace;
        videoTex.minFilter = THREE.LinearFilter;
        videoTex.magFilter = THREE.LinearFilter;
        videoTex.generateMipmaps = false;
      }

      const geo = new THREE.PlaneGeometry(1, 1, NX, NY);
      const mat = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          map: { value: posterTex },
          cover: { value: new THREE.Vector2(1, 1) },
          aspect: { value: CARD_W / CARD_H },
          ready: { value: 0 },
          radius: { value: 0.018 },
        },
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      scene.add(mesh);

      let videoReady = false;
      let cleanupVideo: (() => void) | undefined;

      posterImg.onload = () => {
        if (disposed) return;
        posterTex.needsUpdate = true;
        if (!videoReady) {
          const va = (posterImg.naturalWidth || posterImg.width || 16) / (posterImg.naturalHeight || posterImg.height || 9);
          const ca = CARD_W / CARD_H;
          mat.uniforms.cover.value.set(va > ca ? ca / va : 1, va > ca ? 1 : va / ca);
          mat.uniforms.ready.value = 1;
        }
      };
      posterImg.src = item.image;

      if (v && videoTex) {
        const vt = videoTex;
        const activateVideoTex = () => {
          if (disposed || videoReady || !v || v.readyState < 2 || v.paused || v.currentTime < 0.04) return;
          videoReady = true;
          const va = (v.videoWidth || 16) / (v.videoHeight || 9);
          const ca = CARD_W / CARD_H;
          mat.uniforms.map.value = vt;
          mat.uniforms.cover.value.set(va > ca ? ca / va : 1, va > ca ? 1 : va / ca);
          mat.uniforms.ready.value = 1;
          v.removeEventListener("timeupdate", activateVideoTex);
        };
        v.addEventListener("timeupdate", activateVideoTex);
        cleanupVideo = () => v.removeEventListener("timeupdate", activateVideoTex);
      }

      return {
        i,
        title: item.title,
        categoryTitle: item.categoryTitle,
        categoryIndex: item.categoryIndex,
        itemIndex: item.itemIndex,
        v,
        posterImg,
        posterTex,
        videoTex,
        geo,
        mat,
        mesh,
        rect: null,
        cleanupVideo,
      };
    });

    /* ---------- layout ---------- */
    const GZ = 8;
    let W = 1;
    let H = 1;
    let asp = 1;
    let cols = 4;
    let rows = 2;
    let tanH = 0.3153;

    function resize() {
      W = stage?.clientWidth || window.innerWidth;
      H = stage?.clientHeight || window.innerHeight;
      asp = W / H;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H, false);
      camera.aspect = asp;
      camera.fov = asp < 16 / 9 ? (Math.atan(0.561 / asp) * 360) / Math.PI : FOV;
      camera.updateProjectionMatrix();
      tanH = Math.tan((camera.fov * Math.PI) / 360);
      cols = asp < 0.85 ? 2 : 4;
      rows = asp < 0.85 ? 4 : 2;
    }

    window.addEventListener("resize", resize);
    resize();
    buildPath();

    function grid(i: number): GridCell {
      const vh = 2 * GZ * tanH;
      const vw = vh * asp;
      const item = SHOWCASE_GRID_ITEMS[i];
      const catIdx = item.categoryIndex;
      const slotIdx = item.itemIndex;

      if (cols === 4) {
        const gw = vw * 0.88;
        const innerGap = gw * 0.016;
        const groupGap = gw * 0.05;
        const cw = (gw - innerGap * 2 - groupGap) / 4;
        const ch = cw / (CARD_W / CARD_H);
        const rowGap = Math.max(ch * 0.40, vh * 0.105);
        const gh = ch * 2 + rowGap;

        const pairCol = catIdx % 2;
        const r = Math.floor(catIdx / 2);
        const c = pairCol * 2 + slotIdx;
        const xOffset =
          (c >= 1 ? innerGap : 0) +
          (c >= 2 ? groupGap : 0) +
          (c === 3 ? innerGap : 0);

        return {
          x: -gw / 2 + cw / 2 + c * cw + xOffset,
          y: gh / 2 - ch / 2 - r * (ch + rowGap) - vh * 0.036,
          w: cw,
          h: ch,
          vw,
          vh,
          c,
          r,
        };
      } else {
        const gw = vw * 0.88;
        const colGap = gw * 0.035;
        const cw = (gw - colGap) / 2;
        const ch = cw / (CARD_W / CARD_H);
        const rowGap = Math.max(ch * 0.42, vh * 0.075);
        const gh = ch * 4 + rowGap * 3;
        const c = slotIdx;
        const r = catIdx;
        return {
          x: -gw / 2 + cw / 2 + c * (cw + colGap),
          y: gh / 2 - ch / 2 - r * (ch + rowGap) - vh * 0.02,
          w: cw,
          h: ch,
          vw,
          vh,
          c,
          r,
        };
      }
    }

    /* ---------- scroll ---------- */
    let target = 0;
    let p = 0;
    let inView = false;
    let animId = 0;
    let trackTop = 0;
    let trackH = 1;

    function updateTrackMetrics() {
      if (!track) return;
      const rect = track.getBoundingClientRect();
      trackTop = rect.top + window.scrollY;
      trackH = Math.max(1, rect.height);
    }
    window.addEventListener("resize", updateTrackMetrics, { passive: true });
    updateTrackMetrics();

    const readScroll = () => {
      const vh = window.innerHeight || 800;
      const scrollY = window.scrollY;
      const totalScrollable = Math.max(1, trackH - vh);
      const scrolled = scrollY - trackTop;
      target = clamp(scrolled / totalScrollable, 0, 1);

      const prevInView = inView;
      inView = scrollY + vh > trackTop - 120 && scrollY < trackTop + trackH + 120;

      if (!inView && scrollY + vh <= trackTop - 120 && p !== 0) {
        target = 0;
        p = 0;
        render();
      }

      if (inView && (!prevInView || !animId)) {
        if (!animId) animId = requestAnimationFrame(loop);
      }
    };

    window.addEventListener("scroll", readScroll, { passive: true });
    readScroll();

    /* ---------- pose ---------- */
    const op = new THREE.Vector3();
    const ot = new THREE.Vector3();
    const up = new THREE.Vector3();
    const Y = new THREE.Vector3(0, 1, 0);
    const vp = new THREE.Vector3();

    function poseRibbon(c: CardItem, head: number) {
      const pos = c.geo.attributes.position as THREE.BufferAttribute;
      const centre = head - c.i * STEP;
      for (let iy = 0; iy <= NY; iy++) {
        for (let ix = 0; ix <= NX; ix++) {
          const k = iy * (NX + 1) + ix;
          const lu = ix / NX - 0.5;
          const lv = 0.5 - iy / NY;
          at(centre + lu * CARD_W, op, ot);
          up.copy(Y).addScaledVector(ot, -Y.dot(ot)).normalize();
          vp.copy(op).addScaledVector(up, lv * CARD_H);
          pos.setXYZ(k, vp.x, vp.y, vp.z);
        }
      }
      pos.needsUpdate = true;
      c.geo.computeBoundingBox();
      c.geo.computeBoundingSphere();
    }

    function poseGrid(c: CardItem, q: number) {
      const g = grid(c.i);
      const pos = c.geo.attributes.position as THREE.BufferAttribute;
      const dx = (g.c - (cols - 1) / 2) * 1.2;
      const dy = g.r < rows / 2 ? 1 : -1;
      const ox = dx * g.vw * 0.62 * (1 - q);
      const oy = dy * g.vh * (g.c === 1 ? 0.95 : 0.34) * (1 - q);
      const tilt = (1 - q) * 0.22 * (g.c - 1 || 0.5) * dy;
      const cs = Math.cos(tilt);
      const sn = Math.sin(tilt);
      for (let iy = 0; iy <= NY; iy++) {
        for (let ix = 0; ix <= NX; ix++) {
          const k = iy * (NX + 1) + ix;
          const x = (ix / NX - 0.5) * g.w;
          const y = (0.5 - iy / NY) * g.h;
          pos.setXYZ(
            k,
            g.x + ox + x * cs - y * sn,
            g.y + oy + x * sn + y * cs,
            -GZ - (1 - q) * 0.6 * Math.sin((ix / NX) * Math.PI)
          );
        }
      }
      pos.needsUpdate = true;
      c.geo.computeBoundingBox();
      c.geo.computeBoundingSphere();
      c.rect = g;
    }

    const RIB_A = 0.14;
    const RIB_B = 0.63;

    function render() {
      const pp = p;

      // Title stays DEAD-CENTER in the viewport
      const titleOpacity = 1 - span(pp, 0.62, 0.82);
      const titleScale = mix(1, 0.9, span(pp, 0, 0.65));
      if (l1Ref.current) {
        l1Ref.current.style.transform = `translate(-50%, -50%) scale(${titleScale.toFixed(3)})`;
        l1Ref.current.style.opacity = `${titleOpacity.toFixed(3)}`;
      }

      const intro = 1 - span(pp, 0, 0.05);
      const introStr = `${intro.toFixed(3)}`;
      if (crossRef.current) crossRef.current.style.opacity = introStr;
      if (glowRef.current) glowRef.current.style.opacity = introStr;

      // Ribbon, then the 4x2 grouped grid
      const pr = span(pp, RIB_A, RIB_B);
      const head = mix(0, PATH_L + cards.length * STEP, pr);

      for (const c of cards) {
        const s = head - c.i * STEP;
        const end = PATH_L - CARD_W;
        if (s < end) {
          c.mesh.visible = s > CARD_W;
          c.rect = null;
          if (c.mesh.visible) poseRibbon(c, head);
        } else if (c.i < cols * rows) {
          const st = mix(RIB_A, RIB_B, (end + c.i * STEP) / (PATH_L + cards.length * STEP));
          const q = out(span(pp, st, st + 0.13));
          c.mesh.visible = q > 0.001;
          if (c.mesh.visible) poseGrid(c, q);
        } else {
          c.mesh.visible = false;
          c.rect = null;
        }
      }

      const gridProgress = span(pp, 0.78, 0.88);

      // Once crisp HTML cards fully cover the grid, hide duplicate WebGL meshes behind them
      if (gridProgress >= 0.999) {
        for (const c of cards) {
          c.mesh.visible = false;
        }
      }

      // Position integrated group header titles cleanly above each left+right pair (no outer box)
      if (groupOverlayRef.current) {
        groupOverlayRef.current.style.opacity = `${gridProgress.toFixed(3)}`;
        if (gridProgress > 0) {
          for (let catIdx = 0; catIdx < WORK_CATEGORIES.length; catIdx++) {
            const boxEl = groupBoxRefs.current[catIdx];
            if (!boxEl) continue;

            const firstCard = cards[catIdx * 2];
            const secondCard = cards[catIdx * 2 + 1];
            const g1 = firstCard?.rect;
            const g2 = secondCard?.rect;

            if (g1 && g2) {
              const minX = Math.min(g1.x - g1.w / 2, g2.x - g2.w / 2);
              const maxX = Math.max(g1.x + g1.w / 2, g2.x + g2.w / 2);
              const maxY = Math.max(g1.y + g1.h / 2, g2.y + g2.h / 2);

              const pxLeft = (minX / g1.vw + 0.5) * W;
              const pxRight = (maxX / g1.vw + 0.5) * W;
              const pxTop = (0.5 - maxY / g1.vh) * H;
              const headerOffset = cols === 4 ? 46 : 36;

              boxEl.style.left = `${pxLeft.toFixed(1)}px`;
              boxEl.style.top = `${(pxTop - headerOffset).toFixed(1)}px`;
              boxEl.style.width = `${(pxRight - pxLeft).toFixed(1)}px`;
              boxEl.style.height = `${(headerOffset - 10).toFixed(1)}px`;
            }
          }
        }
      }

      // Position full-bleed clickable grid cards (crisp images + bottom-left white titles)
      if (gridLabelsRef.current) {
        gridLabelsRef.current.style.opacity = `${gridProgress.toFixed(3)}`;
        const interactive = gridProgress > 0.25 ? "auto" : "none";
        if (gridProgress > 0) {
          for (const c of cards) {
            const el = cardLabelsRef.current[c.i];
            if (el && c.rect) {
              const g = c.rect;
              const pxLeft = ((g.x - g.w / 2) / g.vw + 0.5) * W;
              const pxTop = (0.5 - (g.y + g.h / 2) / g.vh) * H;
              const pxWidth = (g.w / g.vw) * W;
              const pxHeight = (g.h / g.vh) * H;
              el.style.left = `${pxLeft.toFixed(1)}px`;
              el.style.top = `${pxTop.toFixed(1)}px`;
              el.style.width = `${pxWidth.toFixed(1)}px`;
              el.style.height = `${pxHeight.toFixed(1)}px`;
              el.style.pointerEvents = interactive;
            }
          }
        } else {
          for (const c of cards) {
            const el = cardLabelsRef.current[c.i];
            if (el) el.style.pointerEvents = "none";
          }
        }
      }

      if (!disposed) {
        renderer.render(scene, camera);
      }
    }

    /* ---------- 3D hover & click to preview ---------- */
    const nameEl = nameRef.current;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / W) * 2 - 1;
      mouse.y = -(e.clientY / H) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const visibleMeshes = cards.filter((c) => c.mesh.visible).map((c) => c.mesh);
      const intersects = raycaster.intersectObjects(visibleMeshes);

      let hit: CardItem | null = null;
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        hit = cards.find((c) => c.mesh === hitMesh) || null;
      }

      stage.style.cursor = hit ? "pointer" : "default";

      // Only show floating hover label during the 3D ribbon before grid labels appear
      if (nameEl) {
        const showHoverLabel = Boolean(hit) && p < 0.84;
        nameEl.style.opacity = showHoverLabel ? "1" : "0";
        if (showHoverLabel && hit) {
          nameEl.innerHTML = `
            <div style="pointer-events:none;text-align:left;">
              <div style="font-weight:600;font-size:15px;color:#ffffff;letter-spacing:-0.01em;text-shadow:0 2px 12px rgba(0,0,0,0.9);line-height:1.25;">${hit.title}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.68);margin-top:2px;text-shadow:0 1px 6px rgba(0,0,0,0.9);">${hit.categoryTitle}</div>
            </div>
          `;
          const offsetX = e.clientX > W - 200 ? -160 : 14;
          nameEl.style.transform = `translate(${e.clientX + offsetX}px,${e.clientY + 14}px)`;
        }
      }
    };

    const handleStageClick = (e: MouseEvent) => {
      mouse.x = (e.clientX / W) * 2 - 1;
      mouse.y = -(e.clientY / H) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const visibleMeshes = cards.filter((c) => c.mesh.visible).map((c) => c.mesh);
      const intersects = raycaster.intersectObjects(visibleMeshes);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const hit = cards.find((c) => c.mesh === hitMesh);
        if (hit) {
          setPreviewSelection({
            categoryIndex: hit.categoryIndex,
            itemIndex: hit.itemIndex,
          });
        }
      }
    };

    stage.addEventListener("pointermove", handlePointerMove);
    stage.addEventListener("click", handleStageClick);

    /* ---------- loop ---------- */
    function loop() {
      rafLoop();
    }

    function rafLoop() {
      if (!inView) {
        animId = 0;
        return;
      }

      p += (target - p) * 0.09;
      if (Math.abs(target - p) < 0.00005) p = target;

      for (const c of cards) {
        if (c.v) {
          if (c.mesh.visible && c.v.paused) {
            c.v.play().catch(() => {});
          } else if (!c.mesh.visible && !c.v.paused) {
            c.v.pause();
          }
        }
      }
      render();
      animId = requestAnimationFrame(rafLoop);
    }
    if (inView) {
      animId = requestAnimationFrame(rafLoop);
    }

    return () => {
      disposed = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", updateTrackMetrics);
      window.removeEventListener("scroll", readScroll);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("click", handleStageClick);

      cards.forEach((c) => {
        c.cleanupVideo?.();
        if (c.v) {
          c.v.pause();
          c.v.removeAttribute("src");
          c.v.load();
        }
        c.posterImg.onload = null;
        c.posterImg.src = "";
        c.posterTex.dispose();
        if (c.videoTex) c.videoTex.dispose();
        c.geo.dispose();
        c.mat.dispose();
      });

      scene.clear();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  const prevCategoryTitle = previewSelection
    ? WORK_CATEGORIES[(previewSelection.categoryIndex - 1 + WORK_CATEGORIES.length) % WORK_CATEGORIES.length].title
    : "";
  const nextCategoryTitle = previewSelection
    ? WORK_CATEGORIES[(previewSelection.categoryIndex + 1) % WORK_CATEGORIES.length].title
    : "";

  return (
    <section className="vante-wrapper relative w-full select-none" aria-label="Our Work Portfolio">
      <style>{`
        .vante-wrapper {
          --bg: #0a0a0b;
          --ink: #f4f1ea;
          --mid: #8d8b86;
          --line: rgba(244, 241, 234, 0.14);
          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter Tight', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .vante-track {
          height: 900vh;
          position: relative;
        }
        .vante-stage {
          position: sticky;
          top: 0;
          height: 100vh;
          height: 100svh;
          overflow: hidden;
          background: var(--bg);
        }
        .vante-hl {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-weight: 700;
          font-size: clamp(48px, 9.5vw, 150px);
          line-height: 1;
          letter-spacing: -0.04em;
          white-space: nowrap;
          text-align: center;
          will-change: transform, opacity;
          color: var(--ink);
          z-index: 2;
          pointer-events: none;
        }
        .vante-hl span {
          display: inline-block;
          margin: 0 !important;
        }
        #vante-gl {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        #vante-glow {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 42%;
          background: linear-gradient(rgba(244, 241, 234, 0.1), rgba(244, 241, 234, 0));
          pointer-events: none;
        }
        #vante-cross {
          position: absolute;
          left: 32px;
          right: 32px;
          top: 37.5%;
          height: 1px;
          background: var(--line);
          pointer-events: none;
        }
        #vante-cross i {
          position: absolute;
          left: 50%;
          top: -0.62em;
          margin-left: -0.3em;
          font: 400 13px 'IBM Plex Mono', monospace;
          font-style: normal;
          color: var(--mid);
          background: var(--bg);
          padding: 0 0.3em;
          line-height: 1.2;
        }
        #vante-name {
          position: absolute;
          left: 0;
          top: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.16s;
          white-space: nowrap;
          z-index: 30;
        }
      `}</style>

      <div id="track" ref={trackRef} className="vante-track">
        <main className="stage vante-stage" id="stage" ref={stageRef}>
          {/* Centered PROGENCY Title */}
          <h1 aria-label="Progency">
            <div className="hl vante-hl" id="vante-l1" ref={l1Ref}>
              <span>PROGENCY</span>
            </div>
          </h1>

          <div id="vante-glow" ref={glowRef}></div>
          <div id="vante-cross" ref={crossRef}>
            <i>+</i>
          </div>

          <div id="vante-gl" ref={canvasHostRef}></div>

          {/* 4x2 Integrated Category Headers (No outer box borders) */}
          <div
            ref={groupOverlayRef}
            className="pointer-events-none absolute inset-0 z-10"
            style={{ opacity: 0 }}
          >
            {WORK_CATEGORIES.map((category, catIdx) => (
              <div
                key={category.id}
                ref={(el) => {
                  groupBoxRefs.current[catIdx] = el;
                }}
                className="absolute flex items-end pointer-events-none"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewSelection({ categoryIndex: catIdx, itemIndex: 0 });
                  }}
                  className="pointer-events-auto flex w-full items-center justify-center border-b border-white/[0.10] pb-2 text-center text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-white/95 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{category.title}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Grid Cards Overlay: Crisp Images + Click Anywhere + Bold Bottom-Left White Titles */}
          <div
            ref={gridLabelsRef}
            className="pointer-events-none absolute inset-0 z-20"
            style={{ opacity: 0 }}
          >
            {SHOWCASE_GRID_ITEMS.map((item, idx) => (
              <div
                key={`${item.title}-${idx}`}
                ref={(el) => {
                  cardLabelsRef.current[idx] = el;
                }}
                className="absolute"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewSelection({
                      categoryIndex: item.categoryIndex,
                      itemIndex: item.itemIndex,
                    });
                  }}
                  aria-label={`Open ${item.title} preview`}
                  className="group relative h-full w-full overflow-hidden rounded-[10px] bg-[#0a0a0b] transition-transform duration-300 ease-out hover:scale-[1.015] cursor-pointer text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <span className="pointer-events-none absolute bottom-3 left-3.5 right-3.5 text-white text-sm sm:text-base font-semibold tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] truncate">
                    {item.title}
                  </span>
                </button>
              </div>
            ))}
          </div>

          <div id="vante-name" ref={nameRef}></div>
        </main>
      </div>

      {/* Apple-Style Minimal Big Preview Modal (Portaled above dock & floating triggers) */}
      {isClient &&
        createPortal(
          <AnimatePresence>
            {previewSelection && activeCategory && activeItem && (
              <motion.div
                key="apple-preview-modal"
                role="dialog"
                aria-modal="true"
                aria-label={`${activeCategory.title}: ${activeItem.title}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-[120] flex items-center justify-center bg-[#050507]/85 backdrop-blur-2xl p-3 sm:p-6"
                onClick={() => setPreviewSelection(null)}
              >
                {/* Minimal Top-Right Close Button */}
                <button
                  type="button"
                  onClick={() => setPreviewSelection(null)}
                  aria-label="Close preview"
                  className="fixed top-5 right-5 z-[130] flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.1] text-white/85 backdrop-blur-md ring-1 ring-white/15 transition-colors hover:bg-white/[0.18] hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex w-full max-w-[96vw] xl:max-w-[1460px] flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main Row: Left (Category) + Big Preview + Vertical Up/Down (Same Category) + Right (Category) */}
              <div className="flex w-full items-center justify-center gap-2 sm:gap-4">
                {/* Left Button: Previous Category */}
                <button
                  type="button"
                  onClick={() => stepCategory(-1)}
                  aria-label={`Previous category: ${prevCategoryTitle}`}
                  className="hidden md:flex flex-col items-center gap-2 group w-16 lg:w-20 shrink-0 cursor-pointer"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.09] text-white/75 transition-all group-hover:bg-white/[0.14] group-hover:text-white group-active:scale-95">
                    <ChevronLeft className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-medium text-white/40 group-hover:text-white/75 transition-colors text-center leading-tight">
                    {prevCategoryTitle}
                  </span>
                </button>

                {/* Big Media Stage */}
                <div className="relative w-full max-w-[min(86vw,calc(78vh*1.7778))] md:max-w-[min(78vw,calc(78vh*1.7778))] aspect-video overflow-hidden rounded-2xl sm:rounded-[22px] bg-black ring-1 ring-white/[0.12] shadow-[0_32px_90px_rgba(0,0,0,0.85)]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${activeCategory.id}-${activeItem.title}`}
                      initial={{ opacity: 0.2, scale: 0.992 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.2, scale: 0.992 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="h-full w-full flex items-center justify-center bg-black"
                    >
                      {activeItem.video ? (
                        <video
                          key={activeItem.video}
                          src={activeItem.video}
                          poster={activeItem.image}
                          autoPlay
                          controls
                          playsInline
                          loop
                          className="h-full w-full object-contain bg-black"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={activeItem.image}
                          alt={activeItem.title}
                          className="h-full w-full object-contain bg-black"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Vertical Up / Down Control: Switch Items Within Same Category */}
                <div className="hidden sm:flex flex-col items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => stepItemInCategory(-1)}
                    aria-label="Previous project in category"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.09] text-white/75 transition-all hover:bg-white/[0.14] hover:text-white active:scale-95 cursor-pointer"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col items-center gap-1.5 py-1">
                    {activeCategory.items.map((item, idx) => {
                      const isActive = idx === previewSelection.itemIndex;
                      return (
                        <button
                          key={item.title}
                          type="button"
                          aria-label={`Show ${item.title}`}
                          onClick={() =>
                            setPreviewSelection({
                              categoryIndex: previewSelection.categoryIndex,
                              itemIndex: idx,
                            })
                          }
                          className={`rounded-full transition-all cursor-pointer ${
                            isActive
                              ? "h-3.5 w-1 bg-white"
                              : "h-1 w-1 bg-white/30 hover:bg-white/60"
                          }`}
                        />
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => stepItemInCategory(1)}
                    aria-label="Next project in category"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.09] text-white/75 transition-all hover:bg-white/[0.14] hover:text-white active:scale-95 cursor-pointer"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Right Button: Next Category */}
                <button
                  type="button"
                  onClick={() => stepCategory(1)}
                  aria-label={`Next category: ${nextCategoryTitle}`}
                  className="hidden md:flex flex-col items-center gap-2 group w-16 lg:w-20 shrink-0 cursor-pointer"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.09] text-white/75 transition-all group-hover:bg-white/[0.14] group-hover:text-white group-active:scale-95">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-medium text-white/40 group-hover:text-white/75 transition-colors text-center leading-tight">
                    {nextCategoryTitle}
                  </span>
                </button>
              </div>

              {/* Minimal Editorial Footer: Little Text (Headline + Subtext) */}
              <div className="flex w-full max-w-[min(86vw,calc(78vh*1.7778))] md:max-w-[min(78vw,calc(78vh*1.7778))] flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
                <div className="text-left">
                  <p className="text-xs font-medium text-white/45">
                    {activeCategory.title}
                  </p>
                  <h2 className="mt-0.5 text-lg sm:text-xl font-medium tracking-tight text-white">
                    {activeItem.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/60 max-w-xl leading-relaxed">
                    {activeItem.subtext}
                  </p>
                </div>

                {/* Mobile / Compact Controls + Subtle Desktop Hint */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {/* Compact Left/Right Category Controls on Tablet/Mobile */}
                  <div className="flex md:hidden items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepCategory(-1)}
                      aria-label={`Previous category: ${prevCategoryTitle}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] ring-1 ring-white/10 text-white/80 hover:bg-white/[0.15] cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepCategory(1)}
                      aria-label={`Next category: ${nextCategoryTitle}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] ring-1 ring-white/10 text-white/80 hover:bg-white/[0.15] cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Compact Up/Down Item Controls on Mobile */}
                  <div className="flex sm:hidden items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepItemInCategory(-1)}
                      aria-label="Previous project in category"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] ring-1 ring-white/10 text-white/80 hover:bg-white/[0.15] cursor-pointer"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepItemInCategory(1)}
                      aria-label="Next project in category"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] ring-1 ring-white/10 text-white/80 hover:bg-white/[0.15] cursor-pointer"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="hidden md:inline-block text-[11px] text-white/35 tracking-wide">
                    ← → Category &nbsp;·&nbsp; ↑ ↓ More in {activeCategory.title}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
          document.body
        )}
    </section>
  );
}

export default OurWorkHero;
