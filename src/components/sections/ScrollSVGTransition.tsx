'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SVGPathConfig {
  id: string;
  d: string;
  stroke: string;
}

interface SVGRowConfig {
  paths: SVGPathConfig[];
}

export default function ScrollSVGTransition() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spacerRef.current || !overlayRef.current) return;

    let timeoutId: number;

    try {
      // Defer all operations to after React's render cycle
      timeoutId = requestAnimationFrame(() => {
        if (!spacerRef.current || !overlayRef.current) return;

        // Start overlay hidden
        gsap.set(overlayRef.current, { autoAlpha: 0 });

        try {
          // Adjust viewBox for curves
          const curveSvgs = overlayRef.current!.querySelectorAll('.svg-container-2 svg');
          curveSvgs.forEach((svg) => {
            const viewBox = svg.getAttribute('viewBox');
            if (!viewBox) return;
            const [x, y, width, height] = viewBox.split(' ').map(Number);
            svg.setAttribute('viewBox', `${x} ${y - 10} ${width} ${height + 20}`);
          });
        } catch (e) {
          console.warn('Error adjusting viewBox:', e);
        }

        try {
          // Initialize stroke dash arrays
          const paths = overlayRef.current?.querySelectorAll('.svg-row svg path');
          if (paths) {
            paths.forEach((path) => {
              const svgPath = path as SVGPathElement;
              if (svgPath && typeof svgPath.getTotalLength === 'function') {
                const pathLength = svgPath.getTotalLength();
                svgPath.style.strokeDasharray = String(pathLength);
                svgPath.style.strokeDashoffset = String(pathLength);
              }
            });
          }
        } catch (e) {
          console.warn('Error initializing stroke dash:', e);
        }

        // Set up animations after DOM initialization
        const tl = gsap.timeline();

        // Fade in the overlay at the start
        tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.3 }, 0);

        try {
          // ScrollTrigger uses the spacer div as trigger (no pin needed, overlay is already fixed)
          ScrollTrigger.create({
            trigger: spacerRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1,
            animation: tl,
          });
        } catch (e) {
          console.warn('Error creating ScrollTrigger:', e);
        }

        try {
          // Stroke reveal order
          const strokeRevealOrder = [
            'svg-top-1',
            'svg-bottom-1',
            'svg-middle-1',
            'svg-top-2',
            'svg-bottom-2',
            'svg-middle-2',
            'svg-top-3',
            'svg-middle-3',
            'svg-bottom-3',
          ];

          strokeRevealOrder.forEach((id, index) => {
            const paths = overlayRef.current?.querySelectorAll(`#${id} path`);
            if (paths && paths.length > 0) {
              tl.to(
                paths,
                {
                  strokeDashoffset: 0,
                  duration: 1.5,
                  ease: 'power2.out',
                },
                0.3 + index * 0.3
              );
            }
          });
        } catch (e) {
          console.warn('Error setting up stroke reveals:', e);
        }

        try {
          // Curve animations
          const curveStrokeOrder = ['svg-curve-1', 'svg-curve-2'];
          const curveStartTime = 0.3 + 5 * 0.3 + 0.3;

          curveStrokeOrder.forEach((id, index) => {
            const paths = overlayRef.current?.querySelectorAll(`#${id} path`);
            if (paths && paths.length > 0) {
              const svgPath = paths[0] as SVGPathElement;
              const pathLength = svgPath && typeof svgPath.getTotalLength === 'function' ? svgPath.getTotalLength() : 0;
              const curveStartAt = curveStartTime + index * 1;

              tl.to(
                paths,
                {
                  strokeDashoffset: 0,
                  duration: 1,
                  ease: 'power2.out',
                },
                curveStartAt
              );

              tl.to(
                paths,
                {
                  strokeDashoffset: -pathLength,
                  duration: 1.5,
                  ease: 'power2.inOut',
                },
                curveStartAt + 1
              );
            }
          });
        } catch (e) {
          console.warn('Error setting up curve animations:', e);
        }

        try {
          // Slide out SVG rows
          const svgRows = overlayRef.current?.querySelectorAll('.svg-container .svg-row');
          if (svgRows && svgRows.length > 0) {
            tl.to(
              svgRows,
              {
                xPercent: 100,
                duration: 2,
                ease: 'power3.inOut',
                stagger: 0.15,
              },
              '>-0.5'
            );
          }
        } catch (e) {
          console.warn('Error setting up row slide animations:', e);
        }

        // Fade out the overlay at the end
        tl.to(overlayRef.current, { autoAlpha: 0, duration: 0.5 }, '>');
      });
    } catch (e) {
      console.error('Error in ScrollSVGTransition setup:', e);
    }

    return () => {
      cancelAnimationFrame(timeoutId);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
    {/* Spacer div in normal document flow — controls scroll distance */}
    <div ref={spacerRef} className="scroll-svg-spacer" />

    {/* Fixed overlay — the visual SVG animation layer */}
    <div ref={overlayRef} className="scroll-svg-transition">
      <section className="intro-section">
        <div className="svg-container">
          {/* Top row */}
          <div className="svg-row">
            <svg width="3360" height="360" viewBox="0 0 3360 360" fill="none" xmlns="http://www.w3.org/2000/svg" id="svg-top-1">
              <path d="M180 180H3180" stroke="#AAE87B" strokeWidth="360" strokeMiterlimit="3.8637" strokeLinecap="round" />
            </svg>
            <svg width="3360" height="360" viewBox="0 0 3360 360" fill="none" xmlns="http://www.w3.org/2000/svg" id="svg-top-2">
              <path d="M180 180H3180" stroke="#5F7D97" strokeWidth="360" strokeMiterlimit="3.8637" strokeLinecap="round" />
            </svg>
            <svg width="3360" height="360" viewBox="0 0 3360 360" fill="none" xmlns="http://www.w3.org/2000/svg" id="svg-top-3">
              <path d="M180 180H3180" stroke="#011627" strokeWidth="360" strokeMiterlimit="3.8637" strokeLinecap="round" />
            </svg>
          </div>

          {/* Middle row */}
          <div className="svg-row">
            <svg width="3360" height="360" viewBox="0 0 3360 360" fill="none" xmlns="http://www.w3.org/2000/svg" id="svg-middle-1">
              <path d="M180 180H3180" stroke="#C0C7D1" strokeWidth="360" strokeMiterlimit="3.8637" strokeLinecap="round" />
            </svg>
            <svg width="3360" height="360" viewBox="0 0 3360 360" fill="none" xmlns="http://www.w3.org/2000/svg" id="svg-middle-2">
              <path d="M180 180H3180" stroke="#5F7D97" strokeWidth="360" strokeMiterlimit="3.8637" strokeLinecap="round" />
            </svg>
            <svg width="3360" height="360" viewBox="0 0 3360 360" fill="none" xmlns="http://www.w3.org/2000/svg" id="svg-middle-3">
              <path d="M180 180H3180" stroke="#FEC97D" strokeWidth="360" strokeMiterlimit="3.8637" strokeLinecap="round" />
            </svg>
          </div>

          {/* Bottom row */}
          <div className="svg-row">
            <svg width="3360" height="360" viewBox="0 0 3360 360" fill="none" xmlns="http://www.w3.org/2000/svg" id="svg-bottom-1">
              <path d="M180 180H3180" stroke="#AAE87B" strokeWidth="360" strokeMiterlimit="3.8637" strokeLinecap="round" />
            </svg>
            <svg width="3360" height="360" viewBox="0 0 3360 360" fill="none" xmlns="http://www.w3.org/2000/svg" id="svg-bottom-2">
              <path d="M180 180H3180" stroke="#FEC97D" strokeWidth="360" strokeMiterlimit="3.8637" strokeLinecap="round" />
            </svg>
            <svg width="3360" height="360" viewBox="0 0 3360 360" fill="none" xmlns="http://www.w3.org/2000/svg" id="svg-bottom-3">
              <path d="M180 180H3180" stroke="#C0C7D1" strokeWidth="360" strokeMiterlimit="3.8637" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Curve container */}
        <div className="svg-container-2">
          <div className="svg-row" />

          <div className="svg-row">
            <svg width="2248" height="1112" viewBox="0 0 2248 1112" fill="none" xmlns="http://www.w3.org/2000/svg" id="svg-curve-1">
              <path d="M180 180.538C1512.01 180.54 1718.64 133.099 2067.5 931.594" stroke="#AAE87B" strokeWidth="360" strokeMiterlimit="3.8637" strokeLinecap="round" />
            </svg>
            <svg width="2248" height="1112" viewBox="0 0 2248 1112" fill="none" xmlns="http://www.w3.org/2000/svg" id="svg-curve-2">
              <path d="M180 180.538C1512.01 180.54 1718.64 133.099 2067.5 931.594" stroke="#FEC97D" strokeWidth="360" strokeMiterlimit="3.8637" strokeLinecap="round" />
            </svg>
          </div>

          <div className="svg-row" />
        </div>
      </section>
    </div>
    </>
  );
}
