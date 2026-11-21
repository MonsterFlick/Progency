"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

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
    image: "/assets/images/optimized/dock/yemen_crisis_thumb.webp",
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
    image: "/assets/images/optimized/dock/podcast_preview_thumb.webp",
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
    image: "/assets/images/optimized/dock/freeflow_logo_thumb.webp",
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
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null);
  const l2Ref = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const pagerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

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

      // Headline runs right across the page in opposite directions
      const rise = 1 - out(span(pp, 0, 0.12));
      const run = mix(-50, 76, span(pp, 0, 0.58));
      if (l1Ref.current) l1Ref.current.style.transform = `translate3d(${run.toFixed(2)}vw,${(rise * 34).toFixed(2)}vh,0)`;
      if (l2Ref.current) l2Ref.current.style.transform = `translate3d(${(-run).toFixed(2)}vw,${(rise * 34).toFixed(2)}vh,0)`;

      const capA = 1 - span(pp, 0.52, 0.57);
      if (capRef.current) {
        capRef.current.style.opacity = `${capA.toFixed(3)}`;
        capRef.current.style.transform = `translate(-50%,calc(-50% + ${(rise * 34).toFixed(2)}vh))`;
      }

      const intro = 1 - span(pp, 0, 0.05);
      const introStr = `${intro.toFixed(3)}`;
      if (hintRef.current) hintRef.current.style.opacity = introStr;
      if (pagerRef.current) pagerRef.current.style.opacity = introStr;
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

      renderer.render(scene, camera);
    }

    /* ---------- hover ---------- */
    const nameEl = nameRef.current;
    const handlePointerMove = (e: PointerEvent) => {
      let hit: CardItem | null = null;
      if (p > 0.86) {
        const nx = e.clientX / W - 0.5;
        const ny = 0.5 - e.clientY / H;
        for (const c of cards) {
          const g = c.rect;
          if (!g) continue;
          const x = nx * g.vw;
          const y = ny * g.vh;
          if (Math.abs(x - g.x) < g.w / 2 && Math.abs(y - g.y) < g.h / 2) hit = c;
        }
      }
      if (nameEl) {
        nameEl.style.opacity = hit ? "1" : "0";
        if (hit) {
          nameEl.innerHTML = `<div><div style="font-weight:600;font-size:12px;color:#fff">${hit.title}</div><div style="font-size:10px;color:rgba(255,255,255,0.65);letter-spacing:0.08em;margin-top:2px">${hit.category}</div></div>`;
          nameEl.style.transform = `translate(${e.clientX + 14}px,${e.clientY + 16}px)`;
        }
      }
    };

    stage.addEventListener("pointermove", handlePointerMove);

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
          left: 0;
          right: 0;
          font-weight: 400;
          font-size: clamp(40px, 6.7vw, 130px);
          line-height: 1;
          letter-spacing: -0.055em;
          white-space: nowrap;
          text-align: center;
          will-change: transform;
          color: var(--ink);
        }
        #vante-l1 {
          top: calc(50% - 0.98em);
        }
        #vante-l2 {
          top: calc(50% + 0.03em);
        }
        #vante-l1 span, #vante-l2 span {
          display: inline-block;
        }
        #vante-l1 span {
          margin-right: 15vw;
        }
        #vante-l2 span {
          margin-left: 15vw;
        }
        #vante-cap {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 15em;
          text-align: center;
          font-size: clamp(9px, 0.74vw, 13px);
          font-weight: 500;
          line-height: 1.3;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: var(--ink);
          pointer-events: none;
        }
        #vante-gl {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        .vante-top {
          position: absolute;
          left: 32px;
          right: 32px;
          top: 26px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          pointer-events: none;
          z-index: 10;
        }
        .vante-acts {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 7px;
          pointer-events: auto;
        }
        #vante-pager {
          display: flex;
          margin: -26px 0 0 28px;
          pointer-events: auto;
        }
        #vante-pager span {
          display: grid;
          place-items: center;
          width: 44px;
          height: 50px;
          border: 1px solid var(--line);
          border-top: 0;
          margin-left: -1px;
          font: 400 11px 'IBM Plex Mono', monospace;
          color: var(--mid);
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
        .vante-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 19px;
          font-weight: 600;
          letter-spacing: 0.09em;
          color: var(--ink);
        }
        .vante-logo svg {
          width: 22px;
          height: 18px;
          fill: var(--ink);
        }
        .vante-acts a {
          display: flex;
          align-items: center;
          gap: 9px;
          height: 32px;
          padding: 0 15px;
          border: 1px solid rgba(244, 241, 234, 0.55);
          border-radius: 99px;
          color: var(--ink);
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.06em;
          transition: background 0.2s, color 0.2s;
        }
        .vante-acts a:hover {
          background: var(--ink);
          color: var(--bg);
        }
        .vante-acts a i {
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          font-style: normal;
        }
        .vante-acts a b {
          display: block;
          width: 13px;
          height: 7px;
          border-top: 1px solid currentColor;
          border-bottom: 1px solid currentColor;
        }
        #vante-hint {
          position: absolute;
          left: 50%;
          top: 33px;
          transform: translateX(-50%);
          font: 400 11.5px 'IBM Plex Mono', monospace;
          letter-spacing: 0.06em;
          color: var(--ink);
          padding-bottom: 6px;
          border-bottom: 1px solid var(--line);
          pointer-events: none;
          z-index: 10;
        }
        .vante-bot {
          position: absolute;
          left: 32px;
          right: 32px;
          bottom: 26px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          font-size: 12.5px;
          line-height: 1.35;
          pointer-events: none;
          z-index: 10;
        }
        .vante-bot p {
          color: var(--ink);
          max-width: 21em;
        }
        .vante-bot .vante-mid {
          font: 400 11.5px 'IBM Plex Mono', monospace;
          letter-spacing: 0.06em;
        }
        .vante-bot .vante-mid s {
          text-decoration: none;
          color: var(--mid);
          margin: 0 0.9em;
        }
        .vante-bot .vante-r {
          justify-self: end;
          display: flex;
          gap: 12px;
          align-items: center;
          font: 400 11.5px 'IBM Plex Mono', monospace;
          letter-spacing: 0.06em;
        }
        .vante-bot .vante-r:after {
          content: "";
          width: 22px;
          height: 1px;
          background: var(--ink);
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
          padding: 6px 11px;
          background: var(--ink);
          color: var(--bg);
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.04em;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.16s;
          white-space: nowrap;
          z-index: 20;
        }
        @media (max-width: 760px) {
          .vante-top {
            left: 18px;
            right: 18px;
            top: 18px;
          }
          .vante-bot {
            left: 18px;
            right: 18px;
            bottom: 18px;
            grid-template-columns: 1fr auto;
          }
          .vante-bot .vante-mid {
            display: none;
          }
          #vante-hint, #vante-pager {
            display: none;
          }
          .vante-bot p {
            max-width: 17em;
            font-size: 11px;
          }
        }
      `}</style>

      <div id="track" ref={trackRef} className="vante-track">
        <main className="stage vante-stage" id="stage" ref={stageRef}>
          <h1 aria-label="Craft in motion">
            <div className="hl vante-hl" id="l1" ref={l1Ref} aria-hidden="true">
              <span>CRAFT IN</span>
            </div>
            <div className="hl vante-hl" id="l2" ref={l2Ref} aria-hidden="true">
              <span>MOTION</span>
            </div>
          </h1>

          <div id="cap" ref={capRef}>
            Exploring ideas through daily design practice.
          </div>

          <div id="glow" ref={glowRef}></div>
          <div id="cross" ref={crossRef}>
            <i>+</i>
          </div>
          <div id="rule" ref={ruleRef}></div>

          <canvas id="gl" ref={canvasRef}></canvas>

          <div id="hint" ref={hintRef}>
            START A PROJECT &nbsp;→
          </div>

          <header className="top vante-top">
            <div className="logo vante-logo">
              <svg viewBox="0 0 22 18">
                <path d="M11 0l11 18h-6.200L11 9.600 6.200 18H0z" />
              </svg>
              PROGENCY
            </div>
            <div id="pager" ref={pagerRef}>
              <span>←</span>
              <span>→</span>
            </div>
            <nav className="acts vante-acts">
              <a href="#contact">
                <i></i>LET&apos;S TALK
              </a>
              <a href="#menu">
                MENU<b></b>
              </a>
            </nav>
          </header>

          <footer className="bot vante-bot">
            <p>
              Concepts, explorations and interface experiments shared openly as part of our creative
              process.
            </p>
            <div className="mid vante-mid">
              VISUALS<s>/</s>FILM<s>/</s>MUSIC<s>/</s>EXPERIMENTS
            </div>
            <div className="r vante-r">VIEW SHOWREEL</div>
          </footer>

          <div id="name" ref={nameRef}></div>
        </main>
      </div>
    </section>
  );
}

export default OurWorkHero;
