'use client';

import { useRef, useEffect } from 'react';

const VS_SOURCE = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`;

const FS_SOURCE = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_ego;
  uniform float u_shadow;
  uniform float u_anima;

  mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }
  vec3 palette(float t) {
    vec3 a = mix(vec3(0.5, 0.5, 0.5), vec3(0.1, 0.1, 0.1), u_shadow);
    vec3 b = mix(vec3(0.5, 0.5, 0.5), vec3(0.8, 0.2, 0.2), u_shadow);
    a = mix(a, vec3(0.5, 0.8, 0.9), u_anima * 0.5);
    vec3 c = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.8, 0.4), u_anima);
    vec3 d = vec3(0.263, 0.416, 0.557) + (u_time * 0.1);
    return a + b * cos(6.28318 * (c * t + d));
  }
  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);
    float symmetry = mix(1.0, 8.0 + floor(u_ego * 4.0), u_ego);
    if (symmetry > 1.0) {
      float angle = atan(uv.y, uv.x);
      float radius = length(uv);
      angle = mod(angle, 6.28318 / symmetry) - 3.14159 / symmetry;
      uv = vec2(cos(angle), sin(angle)) * radius;
    }
    uv += sin(uv.yx * 5.0 + u_time * 0.5) * 0.05 * u_shadow;
    uv *= rot(sin(u_time * 0.2) * 0.2 * u_anima);
    for (float i = 0.0; i < 4.0; i++) {
      uv = fract(uv * mix(1.2, 1.5, u_ego)) - 0.5;
      float rotSpeed = u_time * (0.1 + u_anima * 0.1);
      uv *= rot(rotSpeed * (i + 1.0));
      float d = length(uv) * exp(-length(uv0));
      float sharpD = abs(sin(d * 8.0 + u_time)/8.0);
      float smoothD = smin(d, sin(d * 4.0 - u_time)/4.0, 0.5);
      d = mix(smoothD, sharpD, u_ego);
      d -= (sin(d * 20.0 - u_time * 2.0) * 0.02 * u_shadow);
      vec3 col = palette(length(uv0) + i * 0.4 + u_time * 0.2);
      d = (0.008 + (0.01 * u_anima)) / d;
      finalColor += col * d;
    }
    float vignette = 1.0 - length(uv0) * 0.6;
    finalColor *= smoothstep(0.0, 1.0, vignette);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function lerp(a: number, b: number, t: number) {
  return (1 - t) * a + t * b;
}

export default function MandalaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    function compileShader(type: number, source: string): WebGLShader | null {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = compileShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const egoLoc = gl.getUniformLocation(program, 'u_ego');
    const shadowLoc = gl.getUniformLocation(program, 'u_shadow');
    const animaLoc = gl.getUniformLocation(program, 'u_anima');

    let startTime = Date.now();
    const state = { ego: 0, shadow: 0, anima: 0 };
    const current = { ego: 0, shadow: 0, anima: 0 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (resLoc) gl.uniform2f(resLoc, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    function updatePsychology(t: number) {
      if (t > 15 && t < 40) {
        state.ego = 1; state.shadow = 0; state.anima = 0;
      } else if (t >= 40 && t < 65) {
        state.ego = 0.2; state.shadow = 1; state.anima = 0;
      } else if (t >= 65 && t < 90) {
        state.ego = 0; state.shadow = 0.2; state.anima = 1;
      } else if (t >= 90) {
        state.ego = 0.6; state.shadow = 0.3; state.anima = 0.8;
      }
      current.ego = lerp(current.ego, state.ego, 0.01);
      current.shadow = lerp(current.shadow, state.shadow, 0.01);
      current.anima = lerp(current.anima, state.anima, 0.01);
      if (egoLoc) gl.uniform1f(egoLoc, current.ego);
      if (shadowLoc) gl.uniform1f(shadowLoc, current.shadow);
      if (animaLoc) gl.uniform1f(animaLoc, current.anima);
    }

    let rafId: number;
    function render() {
      const elapsed = (Date.now() - startTime) / 1000;
      if (timeLoc) gl.uniform1f(timeLoc, elapsed);
      updatePsychology(elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    }
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
      style={{ display: 'block' }}
      aria-hidden
    />
  );
}
