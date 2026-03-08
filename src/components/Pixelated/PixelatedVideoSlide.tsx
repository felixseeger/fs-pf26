'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const GRID_SIZE = 25;
const MOUSE_RADIUS = 0.25;
const STRENGTH = 0.1;
const RELAXATION = 0.925;

export interface PixelatedVideoSlideProps {
  /** Video source URL */
  videoSrc: string;
  /** Text to display with pixelated effect (plain text, no HTML) */
  text: string;
  /** Optional class name for the container */
  className?: string;
  /** Disable mouse interaction on mobile */
  mobileBreakpoint?: number;
}

export default function PixelatedVideoSlide({
  videoSrc,
  text,
  className = '',
  mobileBreakpoint = 1000,
}: PixelatedVideoSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textSpanRef = useRef<HTMLSpanElement>(null);
  const effectRef = useRef<{
    destroy: () => void;
  } | null>(null);

  const init = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    const textContainer = textContainerRef.current;
    const textSpan = textSpanRef.current;

    if (!container || !video || !textContainer) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < mobileBreakpoint;

    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;
    let videoTexture: THREE.VideoTexture;
    let textTexture: THREE.CanvasTexture;
    let dataTexture: THREE.DataTexture;
    let planeGeometry: THREE.PlaneGeometry;
    let material: THREE.ShaderMaterial;
    let planeMesh: THREE.Mesh;
    let renderer: THREE.WebGLRenderer;
    let textPlaneMesh: THREE.Mesh;
    let textMaterial: THREE.ShaderMaterial;
    let textScene: THREE.Scene;
    let textCamera: THREE.OrthographicCamera;
    let textRenderer: THREE.WebGLRenderer;
    let textDataTexture: THREE.DataTexture;

    let isDestroyed = false;
    let time = 0;
    const mouse = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Guard against unmounted/uninitialized containers
    if (width === 0 || height === 0) {
      console.warn('PixelatedVideoSlide: Container has zero dimensions, deferring initialization');
      return;
    }

    const createDataTexture = () => {
      const size = GRID_SIZE;
      const totalSize = size * size * 4;
      const data = new Float32Array(totalSize);
      for (let i = 3; i < totalSize; i += 4) data[i] = 255;
      const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
      tex.magFilter = tex.minFilter = THREE.NearestFilter;
      return tex;
    };

    const createTextCanvas = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const dpr = Math.min(window.devicePixelRatio || 2, 2);

      const textWidth = Math.min(container.offsetWidth * 0.9, 1200);
      const textHeight = 400;
      canvas.width = textWidth * dpr;
      canvas.height = textHeight * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, textWidth, textHeight);

      const fontSize = Math.min(120, textWidth / 8);
      ctx.font = `900 ${fontSize}px var(--font-unbounded), "Unbounded", sans-serif`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, textWidth / 2, textHeight / 2);

      return canvas;
    };

    const createTextTexture = () => {
      const canvas = createTextCanvas();
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.flipY = true;
      return tex;
    };

    const updateDataTexture = (tex: THREE.DataTexture) => {
      const data = tex.image.data as Uint8ClampedArray;
      const size = GRID_SIZE;
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= RELAXATION;
        data[i + 1] *= RELAXATION;
      }
      if (Math.abs(mouse.vX) >= 0.001 || Math.abs(mouse.vY) >= 0.001) {
        const gridMouseX = size * mouse.x;
        const gridMouseY = size * (1 - mouse.y);
        const maxDist = size * MOUSE_RADIUS;
        const maxDistSq = maxDist * maxDist;
        const aspect = height / width;
        const strengthFactor = STRENGTH * 100;
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const distance = (gridMouseX - i) ** 2 / aspect + (gridMouseY - j) ** 2;
            if (distance < maxDistSq) {
              const idx = 4 * (i + size * j);
              const power = Math.min(10, maxDist / Math.sqrt(distance));
              data[idx] += strengthFactor * mouse.vX * power;
              data[idx + 1] -= strengthFactor * mouse.vY * power;
            }
          }
        }
        mouse.vX *= 0.9;
        mouse.vY *= 0.9;
      }
      tex.needsUpdate = true;
    };

    const updateAllDataTextures = () => {
      if (isMobile) return;
      if (Math.abs(mouse.vX) < 0.001 && Math.abs(mouse.vY) < 0.001) {
        mouse.vX *= 0.9;
        mouse.vY *= 0.9;
      }
      if (dataTexture) updateDataTexture(dataTexture);
      if (textDataTexture) updateDataTexture(textDataTexture);
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (isMobile) return;
      const rect = container.getBoundingClientRect();
      const newX = (e.clientX - rect.left) / rect.width;
      const newY = (e.clientY - rect.top) / rect.height;
      mouse.vX = newX - mouse.prevX;
      mouse.vY = newY - mouse.prevY;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = newX;
      mouse.y = newY;
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uDataTexture;
      uniform sampler2D uTexture;
      varying vec2 vUv;
      void main() {
        vec4 offset = texture2D(uDataTexture, vUv);
        gl_FragColor = texture2D(uTexture, vUv - 0.02 * offset.rg);
      }
    `;

    const fragmentShaderTransparent = `
      uniform sampler2D uDataTexture;
      uniform sampler2D uTexture;
      varying vec2 vUv;
      void main() {
        vec4 offset = texture2D(uDataTexture, vUv);
        vec4 color = texture2D(uTexture, vUv - 0.02 * offset.rg);
        gl_FragColor = color;
      }
    `;

    const initVideoEffect = () => {
      const videoWidth = video.videoWidth || 1920;
      const videoHeight = video.videoHeight || 1080;
      const containerAspect = width / height;
      const videoAspect = videoWidth / videoHeight;

      // Validate aspect ratios are valid numbers
      if (!isFinite(containerAspect) || !isFinite(videoAspect)) {
        console.warn('PixelatedVideoSlide: Invalid aspect ratios calculated', { containerAspect, videoAspect });
        return;
      }

      let scaleX = 1, scaleY = 1;
      if (containerAspect > videoAspect) {
        scaleY = containerAspect / videoAspect;
      } else {
        scaleX = videoAspect / containerAspect;
      }

      videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.generateMipmaps = false;
      videoTexture.wrapS = videoTexture.wrapT = THREE.ClampToEdgeWrapping;
      videoTexture.flipY = true;

      dataTexture = createDataTexture();

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
      camera.position.z = 1;

      planeGeometry = new THREE.PlaneGeometry(2 * scaleX, 2 * scaleY);
      material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          uTexture: { value: videoTexture },
          uDataTexture: { value: dataTexture },
        },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
      });

      planeMesh = new THREE.Mesh(planeGeometry, material);
      scene.add(planeMesh);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setClearColor(0x000000, 1);
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const canvas = renderer.domElement;
      canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1';
      video.style.opacity = '0';
      container.appendChild(canvas);
    };

    const initTextEffect = () => {
      if (isMobile) {
        if (textSpan) textSpan.style.opacity = '1';
        return;
      }

      if (textSpan) textSpan.style.opacity = '0';
      textTexture = createTextTexture();
      textDataTexture = createDataTexture();

      textScene = new THREE.Scene();
      textCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
      textCamera.position.z = 1;

      textMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          uTexture: { value: textTexture },
          uDataTexture: { value: textDataTexture },
        },
        vertexShader,
        fragmentShader: fragmentShaderTransparent,
        side: THREE.DoubleSide,
        transparent: true,
      });

      const textGeometry = new THREE.PlaneGeometry(2, 2);
      textPlaneMesh = new THREE.Mesh(textGeometry, textMaterial);
      textScene.add(textPlaneMesh);

      const textWidth = textContainer.offsetWidth;
      const textHeight = textContainer.offsetHeight;

      textRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      textRenderer.setClearColor(0x000000, 0);
      textRenderer.setSize(textWidth, textHeight);
      textRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const textCanvas = textRenderer.domElement;
      textCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2';
      textContainer.appendChild(textCanvas);
    }

    const render = () => {
      if (isDestroyed) return;

      time += 0.05;
      updateAllDataTextures();
      if (material) material.uniforms.time.value = time;
      if (videoTexture) videoTexture.needsUpdate = true;

      if (renderer) renderer.render(scene!, camera);
      if (textRenderer && textMaterial && textScene && textCamera) {
        textMaterial.uniforms.time.value = time;
        textRenderer.render(textScene, textCamera);
      }

      requestAnimationFrame(render);
    };

    const onVideoLoaded = () => {
      initVideoEffect();
      initTextEffect();
      if (!isMobile) container.addEventListener('mousemove', handlePointerMove);
      render();
    };

    if (video.readyState >= 2) {
      setTimeout(onVideoLoaded, 100);
    } else {
      video.addEventListener('loadeddata', () => setTimeout(onVideoLoaded, 100));
    }

    const resize = () => {
      if (!container) return;
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      
      // Guard against invalid dimensions
      if (w === 0 || h === 0) {
        console.warn('PixelatedVideoSlide resize: Container has zero dimensions');
        return;
      }
      
      if (renderer) {
        renderer.setSize(w, h);
        if (planeMesh) {
          const videoWidth = video.videoWidth || 1920;
          const videoHeight = video.videoHeight || 1080;
          const containerAspect = w / h;
          const videoAspect = videoWidth / videoHeight;
          
          // Guard against invalid aspect ratios
          if (!isFinite(containerAspect) || !isFinite(videoAspect)) {
            console.warn('PixelatedVideoSlide resize: Invalid aspect ratios', { containerAspect, videoAspect });
            return;
          }
          
          let scaleX = 1, scaleY = 1;
          if (containerAspect > videoAspect) scaleY = containerAspect / videoAspect;
          else scaleX = videoAspect / containerAspect;
          
          // Guard against invalid scale factors
          if (!isFinite(scaleX) || !isFinite(scaleY)) {
            console.warn('PixelatedVideoSlide resize: Invalid scale factors', { scaleX, scaleY });
            return;
          }
          
          planeMesh.geometry.dispose();
          planeMesh.geometry = new THREE.PlaneGeometry(2 * scaleX, 2 * scaleY);
        }
      }
    };

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 200);
    };
    window.addEventListener('resize', handleResize);

    effectRef.current = {
      destroy: () => {
        isDestroyed = true;
        container.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('resize', handleResize);
        if (video) video.style.opacity = '1';
        renderer?.dispose();
        material?.dispose();
        planeGeometry?.dispose();
        videoTexture?.dispose();
        dataTexture?.dispose();
        textRenderer?.dispose();
        textMaterial?.dispose();
        textTexture?.dispose();
        textDataTexture?.dispose();
        if (renderer?.domElement.parentElement) renderer.domElement.remove();
        if (textRenderer?.domElement.parentElement) textRenderer.domElement.remove();
      },
    };
  }, [text, videoSrc, mobileBreakpoint]);

  useEffect(() => {
    init();
    return () => {
      effectRef.current?.destroy();
    };
  }, [init]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-black ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        aria-hidden
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div className="absolute inset-0 flex items-center justify-center z-[2] pointer-events-none">
        <div
          ref={textContainerRef}
          className="relative w-[90%] max-w-5xl h-[200px] md:h-[280px] flex items-center justify-center text-center"
          aria-hidden
        >
          <span ref={textSpanRef} className="text-5xl md:text-7xl lg:text-[10rem] font-unbounded font-black leading-[0.85] text-white uppercase italic tracking-tighter opacity-0">
            {text}
          </span>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 pointer-events-none z-[3]" />
    </div>
  );
}
