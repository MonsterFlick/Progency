"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { X } from "lucide-react";

interface ShowcaseItem {
  title: string;
  category: string;
  image: string;
  dockImage: string;
  video: string | null;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    title: "A CLUB BUSINESSMAN",
    category: "YOUTUBE THUMBNAIL / BRANDING",
    image: "/assets/images/optimized/a_club_businessman.webp",
    dockImage: "/assets/images/optimized/dock/a_club_businessman.webp",
    video: null,
  },
  {
    title: "A CLUB COUNTRY",
    category: "YOUTUBE THUMBNAIL / BRANDING",
    image: "/assets/images/optimized/a_club_country.webp",
    dockImage: "/assets/images/optimized/dock/a_club_country.webp",
    video: null,
  },
  {
    title: "YEMEN CRISIS",
    category: "CINEMATIC DOCUMENTARY",
    image: "/assets/images/video_posters/yemen_crisis_thumb.jpg",
    dockImage: "/assets/images/optimized/dock/yemen_crisis_thumb.webp",
    video: "/assets/videos/yemen_crisis.mp4",
  },
  {
    title: "GAMING MONTAGE",
    category: "HIGH ENERGY VIDEO EDIT",
    image: "/assets/images/optimized/montage.webp",
    dockImage: "/assets/images/optimized/dock/montage.webp",
    video: null,
  },
  {
    title: "PODCAST PREVIEW",
    category: "STUDIO PODCAST PRODUCTION",
    image: "/assets/images/video_posters/podcast_preview_thumb.jpg",
    dockImage: "/assets/images/optimized/dock/podcast_preview_thumb.webp",
    video: "/assets/videos/podcast_preview.mp4",
  },
  {
    title: "ZARA REMAKE",
    category: "KINETIC MOTION TYPOGRAPHY",
    image: "/assets/images/optimized/zara_remake.webp",
    dockImage: "/assets/images/optimized/dock/zara_remake.webp",
    video: null,
  },
  {
    title: "FREEFLOW LOGO",
    category: "3D LOGO ANIMATION & IDENTITY",
    image: "/assets/images/video_posters/freeflow_logo_thumb.jpg",
    dockImage: "/assets/images/optimized/dock/freeflow_logo_thumb.webp",
    video: "/assets/videos/freeflow_logo.mp4",
  },
  {
    title: "HALLOW FACE",
    category: "VISUAL MOTION ARTWORK",
    image: "/assets/images/optimized/hallow_face.webp",
    dockImage: "/assets/images/optimized/dock/hallow_face.webp",
    video: null,
  },
];

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
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
  category: string;
  v: HTMLVideoElement | null;
  img: HTMLImageElement | null;
  tex: THREE.Texture;
  geo: THREE.PlaneGeometry;
  mat: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  rect: GridCell | null;
}

export function OurWorkHero() {
  const [activePreviewModal, setActivePreviewModal] = useState<ShowcaseItem | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const gridLabelsRef = useRef<HTMLDivElement>(null);
  const cardLabelsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePreviewModal(null);
      }
    };
    if (activePreviewModal) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [activePreviewModal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!canvas || !stage || !track) return;

    /* ---------- renderer ---------- */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0, 0);
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
        // A shallow arc close to the camera, then long runs far behind it
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

    const at = (s: number, op: THREE.Vector3, ot: THREE.Vector3) => {
      const f = clamp(s / PATH_L) * SAMPLES;
      const i = Math.min(SAMPLES - 1, Math.floor(f));
      const k = f - i;
      op.lerpVectors(pathP[i], pathP[i + 1], k);
      ot.lerpVectors(pathT[i], pathT[i + 1], k).normalize();
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
        gl_FragColor=vec4(mix(c,vec3(1.),edge*.1),a);
      }
    `;

    const cards: CardItem[] = SHOWCASE_ITEMS.map((item, i) => {
      let v: HTMLVideoElement | null = null;
      let img: HTMLImageElement | null = null;
      let tex: THREE.Texture;

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
        tex = new THREE.VideoTexture(v);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
      } else {
        img = new Image();
        img.crossOrigin = "anonymous";
        tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
      }

      const geo = new THREE.PlaneGeometry(1, 1, NX, NY);
      const mat = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          map: { value: tex },
          cover: { value: new THREE.Vector2(1, 1) },
          aspect: { value: CARD_W / CARD_H },
          ready: { value: 0 },
          radius: { value: 0.018 },
        },
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      scene.add(mesh);

      if (v) {
        v.addEventListener("loadeddata", () => {
          const va = v.videoWidth / v.videoHeight;
          const ca = CARD_W / CARD_H;
          mat.uniforms.cover.value.set(va > ca ? ca / va : 1, va > ca ? 1 : va / ca);
          mat.uniforms.ready.value = 1;
        });
      } else if (img) {
        img.onload = () => {
          tex.needsUpdate = true;
          const va = (img.naturalWidth || img.width || 1) / (img.naturalHeight || img.height || 1);
          const ca = CARD_W / CARD_H;
          mat.uniforms.cover.value.set(va > ca ? ca / va : 1, va > ca ? 1 : va / ca);
          mat.uniforms.ready.value = 1;
        };
        img.src = item.image;
      }

      const c: CardItem = {
        i,
        title: item.title,
        category: item.category,
        v,
        img,
        tex,
        geo,
        mat,
        mesh,
        rect: null,
      };

      return c;
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
      W = window.innerWidth;
      H = window.innerHeight;
      asp = W / H;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H, false);
      camera.aspect = asp;
      camera.fov = asp < 16 / 9 ? (Math.atan(0.561 / asp) * 360) / Math.PI : FOV;
      camera.updateProjectionMatrix();
      tanH = Math.tan((camera.fov * Math.PI) / 360);
      cols = asp < 0.9 ? 2 : 4;
      rows = asp < 0.9 ? 4 : 2;
    }

    window.addEventListener("resize", resize);
    resize();
    buildPath();

    function grid(i: number): GridCell {
      const vh = 2 * GZ * tanH;
      const vw = vh * asp;
      const gw = vw * 0.88;
      const gap = gw * 0.015;
      const cw = (gw - gap * (cols - 1)) / cols;
      const ch = cw / (CARD_W / CARD_H);
      const gh = ch * rows + gap * 1.5 * (rows - 1);
      const c = i % cols;
      const r = Math.floor(i / cols);
      return {
        x: -gw / 2 + cw / 2 + c * (cw + gap),
        y: gh / 2 - ch / 2 - r * (ch + gap * 1.5),
        w: cw,
        h: ch,
        vw,
        vh,
        c,
        r,
      };
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
          // Keep the sheet upright, leaning a little into the turn
          up.copy(Y).addScaledVector(ot, -Y.dot(ot)).normalize();
          vp.copy(op).addScaledVector(up, lv * CARD_H);
          pos.setXYZ(k, vp.x, vp.y, vp.z);
        }
      }
      pos.needsUpdate = true;
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
      c.rect = g;
    }

    const RIB_A = 0.14;
    const RIB_B = 0.63;

    function render() {
      const pp = p;

      // Title stays DEAD-CENTER in the viewport!
      const titleOpacity = 1 - span(pp, 0.62, 0.82);
      const titleScale = mix(1, 0.9, span(pp, 0, 0.65));
      if (l1Ref.current) {
        l1Ref.current.style.transform = `translate(-50%, -50%) scale(${titleScale.toFixed(3)})`;
        l1Ref.current.style.opacity = `${titleOpacity.toFixed(3)}`;
      }
      if (capRef.current) {
        capRef.current.style.transform = `translate(-50%, calc(-50% + 4.6em)) scale(${titleScale.toFixed(3)})`;
        capRef.current.style.opacity = `${titleOpacity.toFixed(3)}`;
      }

      const intro = 1 - span(pp, 0, 0.05);
      const introStr = `${intro.toFixed(3)}`;
      if (crossRef.current) crossRef.current.style.opacity = introStr;
      if (glowRef.current) glowRef.current.style.opacity = introStr;

      if (ruleRef.current) {
        ruleRef.current.style.transform = `scaleX(${ease(span(pp, 0.72, 0.86)).toFixed(4)})`;
        ruleRef.current.style.top = "50%";
      }

      // Ribbon, then the grid
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
          // Each card flies to its slot the moment it leaves the rail
          const st = mix(RIB_A, RIB_B, (end + c.i * STEP) / (PATH_L + cards.length * STEP));
          const q = out(span(pp, st, st + 0.13));
          c.mesh.visible = q > 0.001;
          if (c.mesh.visible) poseGrid(c, q);
        } else {
          c.mesh.visible = false;
          c.rect = null;
        }
      }

      // Position asset title labels directly on the grid cards (bottom-left corner)
      if (gridLabelsRef.current) {
        const gridProgress = span(pp, 0.82, 0.94);
        gridLabelsRef.current.style.opacity = `${gridProgress.toFixed(3)}`;
        if (gridProgress > 0) {
          for (const c of cards) {
            const el = cardLabelsRef.current[c.i];
            if (el && c.rect) {
              const g = c.rect;
              // Align to bottom-left corner inside the card boundary
              const screenX = ((g.x - g.w * 0.46) / g.vw + 0.5) * W;
              const screenY = (0.5 - (g.y - g.h * 0.44) / g.vh) * H;
              el.style.left = `${screenX.toFixed(1)}px`;
              el.style.top = `${screenY.toFixed(1)}px`;
            }
          }
        }
      }

      renderer.render(scene, camera);
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

      if (nameEl) {
        nameEl.style.opacity = hit ? "1" : "0";
        if (hit) {
          nameEl.innerHTML = `
            <div style="pointer-events:none;text-align:left;">
              <div style="font-weight:700;font-size:18px;color:#ffffff;letter-spacing:0.02em;text-shadow:0 2px 14px rgba(0,0,0,0.95);line-height:1.2;text-transform:uppercase;">${hit.title}</div>
              <div style="font-size:11.5px;color:rgba(255,255,255,0.8);letter-spacing:0.06em;margin-top:3px;text-shadow:0 1px 6px rgba(0,0,0,0.95);font-family:monospace;text-transform:uppercase;">${hit.category}</div>
            </div>
          `;
          nameEl.style.transform = `translate(${e.clientX + 14}px,${e.clientY + 16}px)`;
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
          setActivePreviewModal(SHOWCASE_ITEMS[hit.i]);
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
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", updateTrackMetrics);
      window.removeEventListener("scroll", readScroll);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("click", handleStageClick);

      cards.forEach((c) => {
        if (c.v) {
          c.v.pause();
          c.v.removeAttribute("src");
          c.v.load();
        }
        if (c.img) {
          c.img.onload = null;
          c.img.src = "";
        }
        c.tex.dispose();
        c.geo.dispose();
        c.mat.dispose();
      });

      renderer.dispose();
    };
  }, []);

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
        #vante-cap {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, calc(-50% + 4.6em));
          text-align: center;
          font-size: clamp(10px, 0.8vw, 13px);
          font-weight: 500;
          font-family: 'IBM Plex Mono', monospace;
          line-height: 1.3;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--mid);
          pointer-events: none;
          z-index: 2;
          white-space: nowrap;
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
        #vante-rule {
          position: absolute;
          left: 3.5vw;
          right: 3.5vw;
          top: 50%;
          height: 1px;
          background: var(--line);
          transform-origin: left;
          transform: scaleX(0);
          pointer-events: none;
          z-index: 5;
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

          <div id="vante-cap" ref={capRef}>
            CREATIVE PRODUCTION / MOTION / 3D
          </div>

          <div id="vante-glow" ref={glowRef}></div>
          <div id="vante-cross" ref={crossRef}>
            <i>+</i>
          </div>
          <div id="vante-rule" ref={ruleRef}></div>

          <canvas id="vante-gl" ref={canvasRef}></canvas>

          {/* Grid Asset Titles Overlay - Simple white text, NO chip, toward left corner, bit big */}
          <div
            ref={gridLabelsRef}
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
            style={{ opacity: 0 }}
          >
            {SHOWCASE_ITEMS.map((item, idx) => (
              <div
                key={item.title}
                ref={(el) => {
                  cardLabelsRef.current[idx] = el;
                }}
                className="absolute flex flex-col items-start pointer-events-auto cursor-pointer select-none text-left"
                style={{ transform: "translateY(-100%)" }}
                onClick={() => setActivePreviewModal(item)}
              >
                <span className="text-white text-base sm:text-lg font-bold tracking-tight uppercase leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                  {item.title}
                </span>
                <span className="text-white/80 text-[11px] font-mono tracking-wider uppercase drop-shadow-[0_1px_5px_rgba(0,0,0,0.95)] mt-0.5">
                  {item.category}
                </span>
              </div>
            ))}
          </div>

          {/* Top navigation removed per user request */}

          <div id="vante-name" ref={nameRef}></div>
        </main>
      </div>

      {/* Fullscreen Asset Preview Modal */}
      {activePreviewModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4"
          onClick={() => setActivePreviewModal(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-[rgba(244,241,234,0.25)] bg-[#0a0a0b] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#111113] border-b border-[rgba(244,241,234,0.12)]">
              <div>
                <span className="text-sm font-semibold tracking-wide text-[#f4f1ea]">
                  {activePreviewModal.title}
                </span>
                <span className="ml-3 text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                  {activePreviewModal.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewModal(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video or Image Preview */}
            <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
              {activePreviewModal.video ? (
                <video
                  src={activePreviewModal.video}
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePreviewModal.image}
                  alt={activePreviewModal.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OurWorkHero;
