"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

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
}

/**
 * Procedurally generates an ultra-fine radial micro-groove bump texture for authentic vinyl sheen.
 * Used in showcase mode only — deckMode uses the vinyl PNG directly.
 */
function createVinylGrooveTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 1024, 1024);

    const cx = 512;
    const cy = 512;

    for (let r = 180; r < 500; r += 1.2) {
      const alpha = 0.08 + Math.sin(r * 12) * 0.06;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = Math.random() > 0.5 ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;
      ctx.lineWidth = 0.8 + Math.random() * 0.8;
      ctx.stroke();
    }

    for (let r = 150; r < 180; r += 4) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
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
}: VinylCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  const stateRef = useRef({
    isPlaying,
    speed,
    rotation: 0,
    angularVelocity: 0,
    isDragging: false,
    dragStartAngle: 0,
    lastAngle: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    currentTiltX: 0,
    currentTiltY: 0,
    isVisible: true,
    reducedMotion: false,
  });

  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.speed = speed;
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
      if (!gl) { setHasWebGL(false); return; }
    } catch { setHasWebGL(false); return; }

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 300;

    // ═══════════════════════════════════════════════════════════════
    //  SCENE + RENDERER (shared by both modes)
    // ═══════════════════════════════════════════════════════════════
    const scene = new THREE.Scene();
    const VINYL_RADIUS = 1.48;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

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
      //  DECK MODE: Flat textured circle with the vinyl PNG
      //  OrthographicCamera looking along -Z at a CircleGeometry
      //  in the XY plane. The vinyl PNG IS the texture — no
      //  procedural grooves needed since the PNG has the full design.
      // ═════════════════════════════════════════════════════════════
      const frustumHalf = VINYL_RADIUS * 1.02; // 2% padding
      const aspect = width / height;
      camera = new THREE.OrthographicCamera(
        -frustumHalf * aspect,
         frustumHalf * aspect,
         frustumHalf,
        -frustumHalf,
         0.1, 50
      );
      camera.position.set(0, 0, 5);
      // Default lookAt is along -Z toward origin — exactly what we need

      // Single soft ambient light — MeshBasicMaterial doesn't use lights,
      // but we add one in case of future material upgrades
      const ambient = new THREE.AmbientLight(0xffffff, 1.0);
      scene.add(ambient);

      // Vinyl disc — flat circle textured with the actual vinyl PNG
      const discGeo = new THREE.CircleGeometry(VINYL_RADIUS, 64);
      const discMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        side: THREE.FrontSide,
      });

      // Load the vinyl PNG as the disc texture
      textureLoader.load(
        coverUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          discMat.map = tex;
          discMat.needsUpdate = true;
          disposables.push(tex);
        },
        undefined,
        () => {
          // Fallback: dark vinyl appearance if texture fails
          discMat.color.setHex(0x111111);
          discMat.needsUpdate = true;
        }
      );

      const disc = new THREE.Mesh(discGeo, discMat);
      scene.add(disc);
      disposables.push(discGeo, discMat);

      spinTarget = disc;
      spinAxis = "z"; // CircleGeometry is in XY plane, spin around Z

    } else {
      // ═════════════════════════════════════════════════════════════
      //  SHOWCASE MODE: Full procedural 3D vinyl with grooves,
      //  label, clearcoat — PerspectiveCamera with parallax tilt
      // ═════════════════════════════════════════════════════════════
      camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(0, 0, 4.2);

      // Dramatic Noir rim lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
      dirLight.position.set(2, 4, 3);
      scene.add(dirLight);
      dirLightRef = dirLight;

      const cyanRimLight = new THREE.PointLight(0x00d9ff, 3.0, 10);
      cyanRimLight.position.set(-2.5, -2.5, 1.8);
      scene.add(cyanRimLight);

      const warmFillLight = new THREE.PointLight(0xff9944, 1.2, 10);
      warmFillLight.position.set(2.8, -1.8, 1.5);
      scene.add(warmFillLight);

      // Vinyl group with isometric tilt
      const vinylGroup = new THREE.Group();
      scene.add(vinylGroup);
      vinylGroup.rotation.x = THREE.MathUtils.degToRad(18);
      vinylGroup.rotation.y = THREE.MathUtils.degToRad(-10);

      const grooveTexture = createVinylGrooveTexture();
      disposables.push(grooveTexture);

      const vinylMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0c,
        roughness: 0.22,
        metalness: 0.1,
        bumpMap: grooveTexture,
        bumpScale: 0.003,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        reflectivity: 0.9,
      });
      disposables.push(vinylMaterial);

      const vinylGeo = new THREE.CylinderGeometry(VINYL_RADIUS, VINYL_RADIUS, 0.024, 64);
      const vinylMesh = new THREE.Mesh(vinylGeo, vinylMaterial);
      vinylGroup.add(vinylMesh);
      disposables.push(vinylGeo);

      const centerHoleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.026, 32);
      const centerHoleMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const centerHole = new THREE.Mesh(centerHoleGeo, centerHoleMat);
      vinylGroup.add(centerHole);
      disposables.push(centerHoleGeo, centerHoleMat);

      const labelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.025, 48);
      const labelMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.45,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });

      textureLoader.load(
        coverUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          labelMat.map = tex;
          labelMat.needsUpdate = true;
          disposables.push(tex);
        },
        undefined,
        () => {
          labelMat.color.setHex(0x1a1a1a);
          labelMat.needsUpdate = true;
        }
      );

      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      vinylGroup.add(labelMesh);
      disposables.push(labelGeo, labelMat);

      spinTarget = vinylGroup;
      spinAxis = "y";
    }

    // ═══════════════════════════════════════════════════════════════
    //  INTERSECTION OBSERVER — pause when offscreen
    // ═══════════════════════════════════════════════════════════════
    let animationFrameId: number;
    let lastTime = performance.now();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          stateRef.current.isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // ═══════════════════════════════════════════════════════════════
    //  RENDER LOOP — 60 FPS
    // ═══════════════════════════════════════════════════════════════
    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!stateRef.current.isVisible) return;

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const state = stateRef.current;

      // Rotation physics
      if (state.isDragging) {
        // Dragging overrides playback
      } else if (state.isPlaying) {
        const targetVelocity = 3.49 * state.speed; // 33⅓ RPM
        state.angularVelocity = THREE.MathUtils.lerp(state.angularVelocity, targetVelocity, delta * 4);
      } else {
        state.angularVelocity = THREE.MathUtils.lerp(state.angularVelocity, 0, delta * 3.5);
      }

      state.rotation += state.angularVelocity * delta;

      // Apply spin to the correct axis
      if (spinAxis === "z") {
        spinTarget.rotation.z = state.rotation;
      } else {
        // In showcase mode, spin individual meshes on Y (group has tilt)
        spinTarget.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.rotation.y = state.rotation;
          }
        });
      }

      // Parallax tilt (showcase mode only)
      if (!state.reducedMotion && !deckMode) {
        state.currentTiltX = THREE.MathUtils.lerp(state.currentTiltX, state.targetTiltX, delta * 5);
        state.currentTiltY = THREE.MathUtils.lerp(state.currentTiltY, state.targetTiltY, delta * 5);

        spinTarget.rotation.x = THREE.MathUtils.degToRad(18) + state.currentTiltY * 0.35;
        spinTarget.rotation.y = THREE.MathUtils.degToRad(-10) + state.currentTiltX * 0.35;

        if (dirLightRef) {
          dirLightRef.position.x = 2 + state.currentTiltX * 2;
          dirLightRef.position.y = 4 + state.currentTiltY * 2;
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(render);

    // ═══════════════════════════════════════════════════════════════
    //  RESIZE OBSERVER — catches 0→real dimension layout
    // ═══════════════════════════════════════════════════════════════
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          if (camera instanceof THREE.OrthographicCamera) {
            const frustumHalf = VINYL_RADIUS * 1.02;
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
        }
      }
    });
    resizeObserver.observe(container);

    // ═══════════════════════════════════════════════════════════════
    //  INTERACTIVE DRAG / SCRATCH PHYSICS
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
      setIsDragging(true);
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
      }

      if (stateRef.current.isDragging) {
        const currentAngle = getAngleFromCenter(clientX, clientY);
        let angleDelta = currentAngle - stateRef.current.lastAngle;
        if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
        if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;

        stateRef.current.rotation += angleDelta;
        stateRef.current.angularVelocity = angleDelta / 0.016;
        stateRef.current.lastAngle = currentAngle;
        onInteract?.(stateRef.current.angularVelocity);
      }
    };

    const handlePointerUp = () => {
      if (stateRef.current.isDragging) {
        stateRef.current.isDragging = false;
        setIsDragging(false);
      }
    };

    const handlePointerLeave = () => {
      stateRef.current.targetTiltX = 0;
      stateRef.current.targetTiltY = 0;
      handlePointerUp();
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    domElement.addEventListener("mouseleave", handlePointerLeave);
    domElement.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    // ═══════════════════════════════════════════════════════════════
    //  CLEANUP — prevent WebGL context leaks
    // ═══════════════════════════════════════════════════════════════
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      resizeObserver.disconnect();

      domElement.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      domElement.removeEventListener("mouseleave", handlePointerLeave);
      domElement.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);

      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [coverUrl, interactive, enableParallax, deckMode, onInteract]);

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
        <img
          src={coverUrl}
          alt="Vinyl record"
          className={cn(
            "w-full h-full object-cover rounded-full",
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
      className={cn(
        "relative select-none touch-none cursor-grab active:cursor-grabbing",
        className
      )}
      style={{
        width: size ? `${size}px` : "100%",
        height: size ? `${size}px` : "100%",
        willChange: "transform",
      }}
    >
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
