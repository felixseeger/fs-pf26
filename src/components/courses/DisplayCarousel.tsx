'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import type { ACFImage } from '@/types/wordpress';

/**
 * Vertex shader for the display screen
 * Passes UV coordinates to the fragment shader
 */
const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader for CRT display effect
 * Includes glitch effect, scanlines, chromatic aberration, and vignette
 */
const fragmentShader = `
  uniform sampler2D map;
  uniform float imageAspect, planeAspect, glitchIntensity, time;
  uniform vec2 iResolution;
  varying vec2 vUv;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  vec2 coverUV(vec2 uv) {
    if (planeAspect > imageAspect) {
      float s = imageAspect / planeAspect;
      uv.y = uv.y * s + (1.0 - s) * 0.5;
    } else {
      float s = planeAspect / imageAspect;
      uv.x = uv.x * s + (1.0 - s) * 0.5;
    }
    return uv;
  }

  void main() {
    vec2 uv = vUv;
    float gi = glitchIntensity;

    // Glitch displacement
    uv.x += (hash(floor(uv.y * 20.0 + time * 80.0) + time * 7.0) - 0.5) * 2.0 * gi * 0.15;
    uv.y += (hash(floor(time * 50.0)) - 0.5) * gi * 0.06;

    float rs = 0.001 + gi * 0.025;

    // Chromatic aberration
    vec3 col;
    col.r = texture2D(map, coverUV(vec2(uv.x + rs, uv.y + rs))).r + 0.05;
    col.g = texture2D(map, coverUV(vec2(uv.x, uv.y - rs * 2.0))).g + 0.05;
    col.b = texture2D(map, coverUV(vec2(uv.x - rs * 2.0, uv.y))).b + 0.05;

    col.r += 0.08 * texture2D(map, coverUV(vec2(uv.x + 0.026, uv.y - 0.026))).r;
    col.g += 0.05 * texture2D(map, coverUV(vec2(uv.x - 0.022, uv.y - 0.022))).g;
    col.b += 0.08 * texture2D(map, coverUV(vec2(uv.x - 0.022, uv.y - 0.018))).b;

    // Color correction and bloom
    col = clamp(col * 0.93 + 0.07 * col * col, 0.0, 1.0);
    
    // Vignette effect
    col *= vec3(pow(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.12));
    col *= vec3(0.95, 1.05, 0.95) * 2.5;
    
    // Scanlines
    col *= vec3(0.6 + 0.4 * pow(clamp(0.35 + 0.35 * sin(uv.y * iResolution.y * 1.5), 0.0, 1.0), 1.2));
    
    // Pixel grid
    col *= 1.0 - 0.65 * vec3(clamp((mod(vUv.x * iResolution.x, 2.0) - 1.0) * 2.0, 0.0, 1.0));
    
    // Glitch noise
    col += vec3(hash(uv.x * 100.0 + uv.y * 1000.0 + time * 300.0) * gi * 0.3);

    gl_FragColor = vec4(col, 1.0);
  }
`;

interface DisplayCarouselProps {
  /** Array of image URLs or ACFImage objects from WordPress */
  images: Array<string | ACFImage>;
  /** Optional default/fallback image URL */
  defaultImage?: string;
  /** Optional 3D monitor model GLB path (defaults to /monitor.glb) */
  modelPath?: string;
  /** Optional container class name */
  className?: string;
}

/**
 * DisplayCarousel Component
 * Renders a 3D CRT monitor displaying course gallery images with glitch effects
 * Fetches images from WordPress course ACF gallery field
 */
export default function DisplayCarousel({
  images,
  defaultImage = '/default.jpg',
  modelPath = '/monitor.glb',
  className = '',
}: DisplayCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const displayPlaneRef = useRef<THREE.Mesh | null>(null);
  const displayMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const monitorGroupRef = useRef<THREE.Group | null>(null);
  const glitchAnimationRef = useRef<gsap.core.Tween | null>(null);
  const glitchStateRef = useRef({ intensity: 0 });
  const textureLoaderRef = useRef(new THREE.TextureLoader());
  const textureCacheRef = useRef<Record<string, THREE.Texture>>({});
  const mouseRef = useRef({ x: 0, y: 0 });
  const lerpedMouseRef = useRef({ x: 0, y: 0 });
  const timerRef = useRef(new THREE.Timer());
  const animationIdRef = useRef<number | null>(null);

  /**
   * Navigation functions
   */
  const handleNext = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  /**
   * Initialize texture loader with CORS settings
   */
  React.useEffect(() => {
    textureLoaderRef.current.setCrossOrigin('anonymous');
  }, []);

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  /**
   * Update display image when currentIndex changes
   */
  useEffect(() => {
    if (images.length > 0) {
      const imageUrl = getImageUrl(images[currentIndex]);
      setDisplayImage(imageUrl || defaultImage);
    }
  }, [currentIndex, images]);

  /**
   * Create rounded rectangle geometry for the display screen
   */
  const createScreenGeometry = (w: number, h: number, r: number) => {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const geometry = new THREE.ShapeGeometry(shape);
    const positions = geometry.attributes.position;
    const uvs = new Float32Array(positions.count * 2);

    for (let i = 0; i < positions.count; i++) {
      uvs[i * 2] = (positions.getX(i) - x) / w;
      uvs[i * 2 + 1] = (positions.getY(i) - y) / h;
    }

    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    return geometry;
  };

  /**
   * Load texture with caching
   */
  const loadTexture = (src: string) => {
    if (textureCacheRef.current[src]) {
      return textureCacheRef.current[src];
    }

    console.log('DEBUG [DisplayCarousel loadTexture]:', { src, attemptingToLoad: true });

    const texture = textureLoaderRef.current.load(
      src,
      () => {
        console.log('DEBUG [DisplayCarousel texture loaded]:', { src, loaded: true });
        if (displayMaterialRef.current) {
          displayMaterialRef.current.uniforms.imageAspect.value =
            texture.image.width / texture.image.height;
        }
      },
      undefined,
      (error) => {
        console.error('DEBUG [DisplayCarousel texture load ERROR]:', { src, error });
      }
    );

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureCacheRef.current[src] = texture;

    return texture;
  };

  /**
   * Convert ACFImage or string to URL
   * Routes WordPress images through our CORS proxy endpoint
   */
  const getImageUrl = (image: string | ACFImage): string => {
    const url = typeof image === 'string' ? image : image.url || '';
    
    // Route WordPress images through proxy to bypass CORS restrictions
    if (url && url.includes('fs26-back.felixseeger.de')) {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  };

  /**
   * Set the displayed image with glitch transition
   */
  const setDisplayImage = (src: string) => {
    if (!displayMaterialRef.current) return;

    const texture = loadTexture(src);
    displayMaterialRef.current.uniforms.map.value = texture;

    if (glitchAnimationRef.current) {
      glitchAnimationRef.current.kill();
    }

    glitchStateRef.current.intensity = 1.0;

    glitchAnimationRef.current = gsap.to(glitchStateRef.current, {
      intensity: 0,
      duration: 0.75,
      ease: 'power3.out',
      onUpdate() {
        if (displayMaterialRef.current) {
          displayMaterialRef.current.uniforms.glitchIntensity.value =
            glitchStateRef.current.intensity;
        }
      },
    });
  };

  /**
   * Initialize Three.js scene and 3D monitor
   */
  const initializeScene = () => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      24,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.02, 0.82);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Fully transparent background
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    
    // Style canvas for proper alpha transparency rendering
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 5));

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(15, 10, -5);
    scene.add(dirLight);

    const topLight = new THREE.PointLight(0xffffff, 5, 10);
    topLight.position.set(-5, -2.5, 0);
    topLight.decay = 0.3;
    scene.add(topLight);

    // Monitor group
    const monitorGroup = new THREE.Group();
    monitorGroup.position.y = -0.03;
    monitorGroupRef.current = monitorGroup;
    scene.add(monitorGroup);

    // Load 3D monitor model
    new GLTFLoader().load(modelPath, (gltf) => {
      const model = gltf.scene;
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      model.position.sub(center);
      monitorGroup.add(model);
    });

    // Create display material
    const defaultTexture = loadTexture(getImageUrl(images[0]) || defaultImage);

    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: defaultTexture },
        imageAspect: { value: 1 },
        planeAspect: { value: 0.28 / 0.235 },
        iResolution: { value: new THREE.Vector2(512, 512) },
        glitchIntensity: { value: 0.0 },
        time: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
    });
    displayMaterialRef.current = displayMaterial;

    // Create display plane
    const displayPlane = new THREE.Mesh(createScreenGeometry(1, 1, 0.03), displayMaterial);
    displayPlane.scale.set(0.28, 0.235, 1);
    displayPlane.position.set(-0.008, 0.005, 0.041);
    displayPlane.rotation.set(-0.18, 0, 0);
    displayPlaneRef.current = displayPlane;
    monitorGroup.add(displayPlane);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      timerRef.current.update();
      if (displayMaterialRef.current) {
        displayMaterialRef.current.uniforms.time.value = timerRef.current.getElapsed();
      }

      // Smooth mouse following
      lerpedMouseRef.current.x = gsap.utils.interpolate(
        lerpedMouseRef.current.x,
        mouseRef.current.x,
        0.05
      );
      lerpedMouseRef.current.y = gsap.utils.interpolate(
        lerpedMouseRef.current.y,
        mouseRef.current.y,
        0.05
      );

      if (monitorGroup) {
        // Clamp Y rotation to +/- 90deg (180deg total range)
        const targetX = lerpedMouseRef.current.y * 0.15;
        const targetY = lerpedMouseRef.current.x * 0.3;
        monitorGroup.rotation.x = THREE.MathUtils.clamp(targetX, -Math.PI / 6, Math.PI / 6);
        monitorGroup.rotation.y = THREE.MathUtils.clamp(targetY, -Math.PI / 2, Math.PI / 2);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Adjust camera for responsive design (keeps monitor tightly framed)
    camera.position.z = Math.max(0.78, 620 / containerRef.current.clientWidth);
    camera.position.y = 0.02;

    // Event listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;

      // Normalize to [-1, 1] and clamp to avoid overshooting outside container bounds
      const clampedX = THREE.MathUtils.clamp((nx - 0.5) * 2, -1, 1);
      const clampedY = THREE.MathUtils.clamp((ny - 0.5) * 2, -1, 1);

      mouseRef.current.x = clampedX;
      mouseRef.current.y = clampedY;
    };

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  };

  /**
   * Initialize scene on component mount
   */
  useEffect(() => {
    const cleanup = initializeScene();
    return cleanup;
  }, []);

  /**
   * Update displayed image when images prop changes
   */
  useEffect(() => {
    console.log('DEBUG [DisplayCarousel useEffect - images changed]:', {
      images_length: images.length,
      images: images.map((img, i) => ({
        index: i,
        type: typeof img,
        url: typeof img === 'string' ? img : (img as any).url || 'N/A',
      })),
    });
    
    if (images.length > 0 && currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: 'clamp(320px, 58vw, 460px)' }}
    >
      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition-all duration-300 hover:bg-black/40"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition-all duration-300 hover:bg-black/40"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Bottom image list removed intentionally per design update */}

      {/* Fallback for when no images provided */}
      {images.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-600">No images available</p>
        </div>
      )}
    </div>
  );
}
