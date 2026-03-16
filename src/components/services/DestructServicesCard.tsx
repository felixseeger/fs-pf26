'use client';

import { useRef, useCallback, useEffect, type ReactNode } from 'react';
import Matter from 'matter-js';
import gsap from 'gsap';

const { Engine, World, Bodies, Body } = Matter;

interface DestructServicesCardProps {
  children: ReactNode;
  deliverables: string[];
  className?: string;
}

function getTagDimensions(label: string): { width: number; height: number } {
  if (typeof document === 'undefined') return { width: 80, height: 28 };
  const ghost = document.createElement('div');
  ghost.className = 'destruct-tag destruct-tag-measure';
  ghost.textContent = label;
  ghost.style.visibility = 'hidden';
  ghost.style.position = 'absolute';
  ghost.style.whiteSpace = 'nowrap';
  document.body.appendChild(ghost);
  const width = ghost.offsetWidth;
  const height = ghost.offsetHeight;
  ghost.remove();
  return { width, height };
}

export default function DestructServicesCard({
  children,
  deliverables,
  className = '',
}: DestructServicesCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagsContainerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const tagElementsRef = useRef<HTMLDivElement[]>([]);
  const tagBodiesRef = useRef<Matter.Body[]>([]);
  const tagSizesRef = useRef<{ width: number; height: number }[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const isHoveredRef = useRef(false);
  const dropTimerRef = useRef<gsap.core.Tween | null>(null);

  const cleanup = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (engineRef.current) {
      Engine.clear(engineRef.current);
      engineRef.current = null;
    }
    if (tagsContainerRef.current?.parentNode) {
      tagsContainerRef.current.remove();
      tagsContainerRef.current = null;
    }
    tagElementsRef.current = [];
    tagBodiesRef.current = [];
    if (dropTimerRef.current) {
      dropTimerRef.current.kill();
      dropTimerRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    const container = containerRef.current;
    if (!container || deliverables.length === 0) return;

    isHoveredRef.current = true;
    const rect = container.getBoundingClientRect();
    const tagSizes = deliverables.map((l) => getTagDimensions(l));
    tagSizesRef.current = tagSizes;

    dropTimerRef.current = gsap.delayedCall(0.2, () => {
      if (!isHoveredRef.current || !container) return;

      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'destruct-tags-container';
      tagsContainer.setAttribute('aria-hidden', 'true');
      container.appendChild(tagsContainer);
      tagsContainerRef.current = tagsContainer;

      const engine = Engine.create({ gravity: { x: 0, y: 2 } });
      engineRef.current = engine;

      const w = rect.width;
      const h = rect.height;
      const wallThickness = 20;
      const floorOffset = 25;

      const floor = Bodies.rectangle(
        w / 2,
        h - floorOffset + wallThickness / 2,
        w * 3,
        wallThickness,
        { isStatic: true }
      );
      const leftWall = Bodies.rectangle(
        -wallThickness / 2,
        h / 2,
        wallThickness,
        h * 3,
        { isStatic: true }
      );
      const rightWall = Bodies.rectangle(
        w + wallThickness / 2,
        h / 2,
        wallThickness,
        h * 3,
        { isStatic: true }
      );
      World.add(engine.world, [floor, leftWall, rightWall]);

      const tagElements: HTMLDivElement[] = [];
      const tagBodies: Matter.Body[] = [];

      deliverables.forEach((label, i) => {
        const tagEl = document.createElement('div');
        tagEl.className = 'destruct-tag';
        tagEl.textContent = label;
        tagsContainer.appendChild(tagEl);

        const tw = tagSizes[i].width;
        const th = tagSizes[i].height;

        const startX = w * 0.25 + Math.random() * w * 0.5;
        const startY = -(th / 2) - i * 5;
        const angle = (Math.random() - 0.5) * 0.4;

        const body = Bodies.rectangle(startX, startY, tw, th, {
          chamfer: { radius: th / 2 },
          restitution: 0.15,
          friction: 0.6,
          density: 0.002,
        });
        Body.setAngle(body, angle);
        Body.applyForce(body, body.position, { x: (Math.random() - 0.5) * 0.02, y: -0.02 });
        World.add(engine.world, body);

        gsap.to(tagEl, {
          opacity: 1,
          duration: 0.3,
          delay: i * 0.04,
          ease: 'power2.out',
        });

        tagElements.push(tagEl);
        tagBodies.push(body);
      });

      tagElementsRef.current = tagElements;
      tagBodiesRef.current = tagBodies;

      const update = () => {
        if (!engineRef.current || !isHoveredRef.current) return;
        Engine.update(engineRef.current, 1000 / 60);
        for (let i = 0; i < tagElements.length; i++) {
          const body = tagBodies[i];
          const el = tagElements[i];
          const tw = tagSizes[i].width;
          const th = tagSizes[i].height;
          el.style.transform = `translate(${body.position.x - tw / 2}px, ${body.position.y - th / 2}px) rotate(${body.angle}rad)`;
        }
        rafIdRef.current = requestAnimationFrame(update);
      };
      rafIdRef.current = requestAnimationFrame(update);
    });
  }, [deliverables]);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    if (dropTimerRef.current) {
      dropTimerRef.current.kill();
      dropTimerRef.current = null;
    }

    const elements = tagElementsRef.current;
    if (elements.length > 0) {
      gsap.to(elements, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
        onComplete: cleanup,
      });
    } else {
      cleanup();
    }
  }, [cleanup]);

  useEffect(() => cleanup, [cleanup]);

  return (
    <div
      ref={containerRef}
      className={`destruct-services-card relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
