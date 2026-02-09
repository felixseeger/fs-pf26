'use client';

import { useRef, useCallback, type ReactNode } from 'react';

const MAX_TILT = 12;

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export default function TiltCard({ children, className = '' }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const setRotation = useCallback((x: number, y: number) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rotateX', `${x}deg`);
    el.style.setProperty('--rotateY', `${y}deg`);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = ((e.clientX - centerX) / (rect.width / 2)) * MAX_TILT;
      const offsetY = ((e.clientY - centerY) / (rect.height / 2)) * MAX_TILT;
      setRotation(-offsetY, offsetX);
    },
    [setRotation]
  );

  const handleMouseLeave = useCallback(() => {
    setRotation(0, 0);
  }, [setRotation]);

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
