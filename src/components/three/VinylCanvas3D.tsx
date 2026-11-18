"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/**
 * The texture to load for a record. The vinyl renders are 1536px masters for big retina
 * screens; a record on a deck is drawn a couple of hundred pixels wide, so it takes a 640px
 * copy from the image optimizer instead (AVIF where the browser takes it). The showcase
 * gets the full-size copy, still through the optimizer so it arrives compressed.
 */
function textureUrl(url: string, deckMode: boolean): string {
  if (!url.startsWith("/") || url.startsWith("/_next/")) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${deckMode ? 640 : 1920}&q=85`;
}

export interface VinylCanvas3DProps {
  /** Label texture URL (album cover or center label) */
  coverUrl: string;
  /** Vinyl diameter size class or custom px size */
  size?: number;
  /** Whether the record is actively playing / rotating */
  isPlaying?: boolean;
  /** RPM speed multiplier (default: 1.0) */
  speed?: number;
  /** Enable mouse tilt parallax effect */
  enableParallax?: boolean;
  /** Enable interactive drag / scratch physics */
  interactive?: boolean;
  /** Flat deck mode for mounting inside 2D illustrated turntables */
  deckMode?: boolean;
  /** Custom class name for the wrapper container */
  className?: string;
  /** Callback fired when user scratches/spins manually */
  onInteract?: (velocity: number) => void;
  /**
   * Live platter telemetry, written every frame. A ref rather than a callback
   * because the audio engine samples this at 60fps and must not drag React
   * through a re-render to do it.
   */
  platterRef?: React.RefObject<PlatterTelemetry | null>;
  /** Fired once when the listener grabs the platter, before any movement. */
  onScratchStart?: () => void;
  /** Fired once when they let go. */
  onScratchEnd?: () => void;
}

export interface PlatterTelemetry {
  /** rad/s. 3.49 is 33 1/3 RPM. Negative means the record is running backwards. */
  angularVelocity: number;
  isDragging: boolean;
}

let sharedGrooveTexture: THREE.CanvasTexture | null = null;
let sharedDeckSheenTexture: THREE.CanvasTexture | null = null;

/**
 * Procedurally generates an ultra-fine radial micro-groove bump texture for authentic vinyl sheen.
 * Cached at module scope so 300+ canvas arc draws only run once per session.
 */
function getVinylGrooveTexture(): THREE.CanvasTexture {
  if (sharedGrooveTexture) return sharedGrooveTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 512, 512);

    const cx = 256;
    const cy = 256;

    for (let r = 90; r < 250; r += 1.1) {
      const alpha = 0.08 + Math.sin(r * 12) * 0.06;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle =
        r % 2.2 < 1.1 ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    for (let r = 74; r < 90; r += 3) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  sharedGrooveTexture = texture;
  return texture;
}

/**
 * Stationary anisotropic studio light reflection for top-down deck platters.
 * Gives spinning 2D deck platters a physical overhead booth reflection.
 */
function getDeckSheenTexture(): THREE.CanvasTexture {
  if (sharedDeckSheenTexture) return sharedDeckSheenTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, 512, 512);
    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate(-Math.PI / 5);

    const grad = ctx.createLinearGradient(0, -256, 0, 256);
    grad.addColorStop(0, "rgba(255, 255, 255, 0)");
    grad.addColorStop(0.42, "rgba(0, 217, 255, 0.04)");
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.22)");
    grad.addColorStop(0.58, "rgba(255, 220, 180, 0.05)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 248, 0, Math.PI * 2);
    ctx.fill();

    // Cut out center label area so only the vinyl grooves catch the harsh specular sweep
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(0, 0, 84, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  sharedDeckSheenTexture = texture;
  return texture;
}

export function VinylCanvas3D({
  coverUrl,
  size,
  isPlaying = false,
  speed = 1.0,
  enableParallax = true,
  interactive = true,
  deckMode = false,
  className,
  onInteract,
  platterRef,
  onScratchStart,
  onScratchEnd,
}: VinylCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  const targetMaterialRef = useRef<THREE.MeshBasicMaterial | THREE.MeshStandardMaterial | null>(null);
  const activeTextureRef = useRef<THREE.Texture | null>(null);
  const initialCoverUrlRef = useRef(coverUrl);
  const requestRenderRef = useRef<(() => void) | null>(null);

  const stateRef = useRef({
    isPlaying,
    speed,
    rotation: 0,
    angularVelocity: 0,
    isDragging: false,
    dragStartAngle: 0,
    lastAngle: 0,
    lastMoveAt: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    currentTiltX: 0,
    currentTiltY: 0,
    isVisible: true,
    reducedMotion: false,
  });

  /**
   * Callbacks live in a ref so they can change identity freely. They used to sit
   * in the scene effect's dependency array, which meant a parent passing an
   * inline arrow tore down and rebuilt the whole WebGL context on every frame
   * of a scratch.
   */
  const callbacksRef = useRef({ onInteract, onScratchStart, onScratchEnd });

  useEffect(() => {
    callbacksRef.current = { onInteract, onScratchStart, onScratchEnd };
  }, [onInteract, onScratchStart, onScratchEnd]);

  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.speed = speed;
    requestRenderRef.current?.();
  }, [isPlaying, speed]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    stateRef.current.reducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      stateRef.current.reducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // Hot-swap the vinyl/label texture when coverUrl changes WITHOUT rebuilding the WebGL context
  useEffect(() => {
    const mat = targetMaterialRef.current;
    if (!mat) return;

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl(coverUrl, deckMode),
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        if (deckMode) {
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
        }
        const prevTex = activeTextureRef.current;
        activeTextureRef.current = tex;
        mat.map = tex;
        mat.color.setHex(0xffffff);
        mat.needsUpdate = true;
        if (prevTex && prevTex !== tex) {
          prevTex.dispose();
        }
        requestRenderRef.current?.();
      },
      undefined,
      () => {
        if (!cancelled) {
          mat.color.setHex(deckMode ? 0x111111 : 0x1a1a1a);
          mat.needsUpdate = true;
          requestRenderRef.current?.();
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [coverUrl, deckMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
      if (!gl) {
        queueMicrotask(() => setHasWebGL(false));
        return;
      }
    } catch {
      queueMicrotask(() => setHasWebGL(false));
      return;
    }

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // ═══════════════════════════════════════════════════════════════
    //  SCENE + RENDERER (shared by both modes)
    // ═══════════════════════════════════════════════════════════════
    const scene = new THREE.Scene();
    const VINYL_RADIUS = 1.48;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: deckMode ? "default" : "high-performance",
    });
    const isLowCoreDevice =
      typeof navigator !== "undefined" &&
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency <= 4;
    const maxDpr = isLowCoreDevice ? 1 : deckMode ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animationFrameId);
      setHasWebGL(false);
    };
    const handleContextRestored = () => {
      setHasWebGL(true);
      scheduleRender();
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", handleContextRestored);

    const textureLoader = new THREE.TextureLoader();
    const disposables: { dispose: () => void }[] = [];

    // Track which mesh to spin in the render loop
    let spinTarget: THREE.Object3D;
    // Which axis to spin (Z for deckMode top-down, Y for showcase)
    let spinAxis: "z" | "y" = "y";

    let camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
    let dirLightRef: THREE.DirectionalLight | null = null;

    if (deckMode) {
      // ═════════════════════════════════════════════════════════════
      //  DECK MODE: Flat textured circle with edge-trimmed vinyl WebP
      //  Minimal frustum margin so the groove edge meets the strobe ring cleanly.
      // ═════════════════════════════════════════════════════════════
      const frustumHalf = VINYL_RADIUS * 1.004;
      const aspect = width / height;
      camera = new THREE.OrthographicCamera(
        -frustumHalf * aspect,
         frustumHalf * aspect,
         frustumHalf,
        -frustumHalf,
         0.1, 50
      );
      camera.position.set(0, 0, 5);

      const discGeo = new THREE.CircleGeometry(VINYL_RADIUS, 48);
      const discMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        side: THREE.FrontSide,
      });
      targetMaterialRef.current = discMat;

      // Load initial vinyl asset as the disc texture
      textureLoader.load(
        textureUrl(initialCoverUrlRef.current, deckMode),
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          const prev = activeTextureRef.current;
          activeTextureRef.current = tex;
          discMat.map = tex;
          discMat.needsUpdate = true;
          if (prev && prev !== tex) prev.dispose();
          scheduleRender();
        },
        undefined,
        () => {
          discMat.color.setHex(0x111111);
          discMat.needsUpdate = true;
          scheduleRender();
        }
      );

      const disc = new THREE.Mesh(discGeo, discMat);
      scene.add(disc);
      disposables.push(discGeo, discMat);

      // Stationary studio overhead light sheen across the spinning grooves
      const sheenGeo = new THREE.CircleGeometry(VINYL_RADIUS * 0.99, 48);
      const sheenMat = new THREE.MeshBasicMaterial({
        map: getDeckSheenTexture(),
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sheenMesh = new THREE.Mesh(sheenGeo, sheenMat);
      sheenMesh.position.z = 0.02;
      scene.add(sheenMesh);
      disposables.push(sheenGeo, sheenMat);

      spinTarget = disc;
      spinAxis = "z";

    } else {
      // ═════════════════════════════════════════════════════════════
      //  SHOWCASE MODE: Optimized procedural 3D vinyl (2-light budget)
      // ═════════════════════════════════════════════════════════════
      camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(0, 0, 4.2);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
      dirLight.position.set(2, 4, 3);
      scene.add(dirLight);
      dirLightRef = dirLight;

      const rimLight = new THREE.DirectionalLight(0x88b882, 1.4);
      rimLight.position.set(-2.5, -2.5, 1.8);
      scene.add(rimLight);

      const vinylGroup = new THREE.Group();
      scene.add(vinylGroup);
      vinylGroup.rotation.x = THREE.MathUtils.degToRad(18);
      vinylGroup.rotation.y = THREE.MathUtils.degToRad(-10);

      const grooveTexture = getVinylGrooveTexture();

      const vinylMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0c,
        roughness: 0.2,
        metalness: 0.18,
        bumpMap: grooveTexture,
        bumpScale: 0.003,
      });
      disposables.push(vinylMaterial);

      const vinylGeo = new THREE.CylinderGeometry(VINYL_RADIUS, VINYL_RADIUS, 0.024, 48);
      const vinylMesh = new THREE.Mesh(vinylGeo, vinylMaterial);
      vinylGroup.add(vinylMesh);
      disposables.push(vinylGeo);

      const centerHoleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.026, 24);
      const centerHoleMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const centerHole = new THREE.Mesh(centerHoleGeo, centerHoleMat);
      vinylGroup.add(centerHole);
      disposables.push(centerHoleGeo, centerHoleMat);

      const labelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.025, 36);
      const labelMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.45,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      targetMaterialRef.current = labelMat;

      textureLoader.load(
        textureUrl(initialCoverUrlRef.current, deckMode),
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          const prev = activeTextureRef.current;
          activeTextureRef.current = tex;
          labelMat.map = tex;
          labelMat.needsUpdate = true;
          if (prev && prev !== tex) prev.dispose();
          scheduleRender();
        },
        undefined,
        () => {
          labelMat.color.setHex(0x1a1a1a);
          labelMat.needsUpdate = true;
          scheduleRender();
        }
      );

      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      vinylGroup.add(labelMesh);
      disposables.push(labelGeo, labelMat);

      spinTarget = vinylGroup;
      spinAxis = "y";
    }

    // ═══════════════════════════════════════════════════════════════
    //  ON-DEMAND + VISIBILITY-AWARE RENDER LOOP (0% GPU burn when idle)
    // ═══════════════════════════════════════════════════════════════
    let animationFrameId = 0;
    let rafActive = false;
    let lastTime = performance.now();

    function scheduleRender() {
      if (rafActive || !stateRef.current.isVisible || document.hidden) return;
      rafActive = true;
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(render);
    }

    requestRenderRef.current = scheduleRender;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          stateRef.current.isVisible = entry.isIntersecting;
          if (entry.isIntersecting) {
            scheduleRender();
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleVisibilityChange = () => {
      if (!document.hidden) scheduleRender();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = (time: number) => {
      rafActive = false;
      if (!stateRef.current.isVisible || document.hidden) return;

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const state = stateRef.current;

      // Rotation physics
      if (state.isDragging) {
        if (time - state.lastMoveAt > 40) {
          state.angularVelocity = THREE.MathUtils.lerp(state.angularVelocity, 0, delta * 30);
        }
      } else if (state.isPlaying) {
        const targetVelocity = 3.49 * state.speed; // 33⅓ RPM
        state.angularVelocity = THREE.MathUtils.lerp(state.angularVelocity, targetVelocity, delta * 4);
      } else {
        state.angularVelocity = THREE.MathUtils.lerp(state.angularVelocity, 0, delta * 3.5);
        if (Math.abs(state.angularVelocity) < 0.002) {
          state.angularVelocity = 0;
        }
      }

      state.rotation += state.angularVelocity * delta;

      if (platterRef) {
        platterRef.current = {
          angularVelocity: state.angularVelocity,
          isDragging: state.isDragging,
        };
      }

      if (spinAxis === "z") {
        spinTarget.rotation.z = state.rotation;
      } else {
        spinTarget.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.rotation.y = state.rotation;
          }
        });
      }

      let tiltMoving = false;
      if (!state.reducedMotion && !deckMode) {
        const dx = state.targetTiltX - state.currentTiltX;
        const dy = state.targetTiltY - state.currentTiltY;
        if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
          tiltMoving = true;
          state.currentTiltX = THREE.MathUtils.lerp(state.currentTiltX, state.targetTiltX, delta * 5);
          state.currentTiltY = THREE.MathUtils.lerp(state.currentTiltY, state.targetTiltY, delta * 5);
        }

        spinTarget.rotation.x = THREE.MathUtils.degToRad(18) + state.currentTiltY * 0.35;
        spinTarget.rotation.y = THREE.MathUtils.degToRad(-10) + state.currentTiltX * 0.35;

        if (dirLightRef) {
          dirLightRef.position.x = 2 + state.currentTiltX * 2;
          dirLightRef.position.y = 4 + state.currentTiltY * 2;
        }
      }

      renderer.render(scene, camera);

      const keepSpinning =
        state.isPlaying ||
        state.isDragging ||
        Math.abs(state.angularVelocity) > 0.002 ||
        tiltMoving;

      if (keepSpinning) {
        scheduleRender();
      }
    };

    // Draw initial crisp frame
    scheduleRender();

    // ═══════════════════════════════════════════════════════════════
    //  RESIZE OBSERVER — catches 0→real dimension layout
    // ═══════════════════════════════════════════════════════════════
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          if (camera instanceof THREE.OrthographicCamera) {
            const frustumHalf = VINYL_RADIUS * 1.004;
            const aspect = w / h;
            camera.left   = -frustumHalf * aspect;
            camera.right  =  frustumHalf * aspect;
            camera.top    =  frustumHalf;
            camera.bottom = -frustumHalf;
          } else {
            (camera as THREE.PerspectiveCamera).aspect = w / h;
          }
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          scheduleRender();
        }
      }
    });
    resizeObserver.observe(container);

    // ═══════════════════════════════════════════════════════════════
    //  INTERACTIVE DRAG / SCRATCH PHYSICS (Frame-rate independent)
    // ═══════════════════════════════════════════════════════════════
    const getAngleFromCenter = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return Math.atan2(clientY - cy, clientX - cx);
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      stateRef.current.isDragging = true;
      stateRef.current.lastAngle = getAngleFromCenter(clientX, clientY);
      stateRef.current.lastMoveAt = performance.now();
      setIsDragging(true);
      callbacksRef.current.onScratchStart?.();
      scheduleRender();
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (enableParallax && container) {
        const rect = container.getBoundingClientRect();
        const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
        stateRef.current.targetTiltX = nx;
        stateRef.current.targetTiltY = ny;
        scheduleRender();
      }

      if (stateRef.current.isDragging) {
        const now = performance.now();
        const dt = Math.min(Math.max((now - stateRef.current.lastMoveAt) / 1000, 0.004), 0.05);
        const currentAngle = getAngleFromCenter(clientX, clientY);
        let angleDelta = currentAngle - stateRef.current.lastAngle;
        if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
        if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;

        stateRef.current.rotation += angleDelta;
        stateRef.current.angularVelocity = angleDelta / dt;
        stateRef.current.lastAngle = currentAngle;
        stateRef.current.lastMoveAt = now;
        callbacksRef.current.onInteract?.(stateRef.current.angularVelocity);
        scheduleRender();
      }
    };

    const handlePointerUp = () => {
      if (stateRef.current.isDragging) {
        stateRef.current.isDragging = false;
        setIsDragging(false);
        callbacksRef.current.onScratchEnd?.();
        scheduleRender();
      }
    };

    const handlePointerLeave = () => {
      stateRef.current.targetTiltX = 0;
      stateRef.current.targetTiltY = 0;
      handlePointerUp();
      scheduleRender();
    };

    // Arrow key scratching
    const KEY_SCRATCH_VELOCITY = 9;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!interactive) return;
      const direction = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (direction === 0) return;

      e.preventDefault();
      if (!stateRef.current.isDragging) {
        stateRef.current.isDragging = true;
        setIsDragging(true);
        callbacksRef.current.onScratchStart?.();
      }
      stateRef.current.angularVelocity = KEY_SCRATCH_VELOCITY * direction;
      stateRef.current.lastMoveAt = performance.now();
      callbacksRef.current.onInteract?.(stateRef.current.angularVelocity);
      scheduleRender();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") handlePointerUp();
    };

    const domElement = renderer.domElement;
    container.addEventListener("keydown", handleKeyDown);
    container.addEventListener("keyup", handleKeyUp);
    container.addEventListener("blur", handlePointerUp);
    domElement.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    domElement.addEventListener("mouseleave", handlePointerLeave);
    domElement.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      requestRenderRef.current = null;
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      domElement.removeEventListener("webglcontextlost", handleContextLost);
      domElement.removeEventListener("webglcontextrestored", handleContextRestored);

      container.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("keyup", handleKeyUp);
      container.removeEventListener("blur", handlePointerUp);
      domElement.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      domElement.removeEventListener("mouseleave", handlePointerLeave);
      domElement.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);

      targetMaterialRef.current = null;
      if (activeTextureRef.current) {
        activeTextureRef.current.dispose();
        activeTextureRef.current = null;
      }
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [interactive, enableParallax, deckMode, platterRef]);

  // Fallback for non-WebGL devices
  if (!hasWebGL) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full overflow-hidden shadow-2xl",
          className
        )}
        style={{ width: size ? `${size}px` : "100%", height: size ? `${size}px` : "100%" }}
      >
        <Image
          src={coverUrl}
          alt="Vinyl record"
          fill
          sizes="(max-width: 768px) 40vw, 340px"
          className={cn(
            "object-cover rounded-full",
            isPlaying && "animate-spin"
          )}
          style={{ animationDuration: "2s" }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "application" : undefined}
      aria-label={
        interactive
          ? "Turntable platter. Hold the left and right arrow keys to scratch the record."
          : undefined
      }
      className={cn(
        "relative select-none touch-none cursor-grab active:cursor-grabbing",
        interactive && "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan",
        className
      )}
      style={{
        width: size ? `${size}px` : "100%",
        height: size ? `${size}px` : "100%",
        willChange: "transform",
      }}
    >
      {deckMode && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[4.5%] w-[4.5%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-400/70 bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-700 shadow-sm"
        />
      )}
      {interactive && !deckMode && (
        <div
          className={cn(
            "absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-300 z-10",
            isHovered || isDragging ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="text-[10px] tracking-[0.25em] uppercase font-mono px-2.5 py-1 rounded-full bg-black/70 text-noir-cloud border border-white/10 backdrop-blur-md">
            {isDragging ? "Scratching Deck" : "Drag to Scratch"}
          </span>
        </div>
      )}
    </div>
  );
}
