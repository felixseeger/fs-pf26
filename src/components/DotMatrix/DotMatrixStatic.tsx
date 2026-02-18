import React from "react";

interface DotMatrixStaticProps {
  color?: string;
  dotSize?: number;
  spacing?: number;
  opacity?: number;
  className?: string;
}

/**
 * Static (CSS-only, no canvas/WebGL) version of DotMatrix.
 * Safe for server components and static export. Renders an SVG pattern
 * that covers the parent element.
 */
const DotMatrixStatic = ({
  color = "#61dafb",
  dotSize = 2,
  spacing = 20,
  opacity = 0.35,
  className = "",
}: DotMatrixStaticProps) => {
  const patternId = `dot-pattern-static`;
  const gap = spacing;

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={gap}
          height={gap}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={gap / 2}
            cy={gap / 2}
            r={dotSize / 2}
            fill={color}
            opacity={opacity}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
};

export default DotMatrixStatic;
