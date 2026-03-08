import React, {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  ForwardedRef,
} from "react";

// Type definitions
interface UniformValue {
  type: "uniform1f" | "uniform3fv" | "uniform1fv";
  value: number | number[] | number[][];
}

interface Uniforms {
  [key: string]: UniformValue;
}

interface ShaderRef {
  play(): void;
  pause(): void;
  fireEvent(): void;
}

interface ShaderProps {
  source: string;
  uniforms?: Uniforms;
  textures?: unknown[];
  maxFps?: number;
  initialState?: "playing" | "paused";
}

interface DottedShaderProps {
  colors?: [number, number, number][];
  opacities?: number[];
  totalSize: number;
  dotSize: number;
  shader?: string;
  center?: string[];
}

const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const Shader = forwardRef<ShaderRef, ShaderProps>(
  function Shader(props, ref: ForwardedRef<ShaderRef>) {
    const {
      source,
      uniforms = {},
      textures = [],
      maxFps = 60,
      initialState = "playing",
    } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const playStateRef = useRef<"playing" | "paused">(initialState);
    const timeRef = useRef(0);
    const eventTimeRef = useRef(0);
    const animationFrameIdRef = useRef<number | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        play() {
          playStateRef.current = "playing";
        },
        pause() {
          playStateRef.current = "paused";
        },
        fireEvent() {
          eventTimeRef.current = timeRef.current;
        },
      }),
      []
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const offscreenCanvas = document.createElement("canvas");

      const pixelRatio = Math.max(1, Math.min(window.devicePixelRatio ?? 1, 2));

      const updateCanvasSize = () => {
        canvas.width = offscreenCanvas.width = canvas.offsetWidth * pixelRatio;
        canvas.height =
          offscreenCanvas.height = canvas.offsetHeight * pixelRatio;
      };

      updateCanvasSize();

      const gl = offscreenCanvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
      });

      const ctx = canvas.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });

      if (!gl || !ctx) return;

      const createShader = (type: GLenum, source: string): WebGLShader | null => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
        gl.deleteShader(shader);
        return null;
      };

      const createProgram = (
        vertexShader: WebGLShader,
        fragmentShader: WebGLShader
      ): WebGLProgram | null => {
        const program = gl.createProgram();
        if (!program) return null;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
        return null;
      };

      const vertexShader = createShader(
        gl.VERTEX_SHADER,
        `#version 300 es
        precision highp float;
        in vec2 coordinates;
        uniform vec2 u_resolution;
        out vec2 fragCoord;
        void main(void) {
            gl_Position = vec4(coordinates, 0.0, 1.0);
            fragCoord = (coordinates + 1.0) * 0.5 * u_resolution;
            fragCoord.y = u_resolution.y - fragCoord.y;
        }`
      );

      const fragmentShader = createShader(gl.FRAGMENT_SHADER, source);
      if (!vertexShader || !fragmentShader) return;

      const program = createProgram(vertexShader, fragmentShader);
      if (!program) return;

      gl.useProgram(program);

      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const coordsLoc = gl.getAttribLocation(program, "coordinates");
      gl.enableVertexAttribArray(coordsLoc);
      gl.vertexAttribPointer(coordsLoc, 2, gl.FLOAT, false, 0, 0);

      const resolutionUniform = gl.getUniformLocation(
        program,
        "u_resolution"
      );
      const timeUniform = gl.getUniformLocation(program, "u_time");

      for (const name in uniforms) {
        const loc = gl.getUniformLocation(program, name);
        const { type, value } = uniforms[name];
        if (type === "uniform1f") gl.uniform1f(loc, value as number);
        else if (type === "uniform3fv")
          gl.uniform3fv(loc, (value as number[][]).flat() as Float32List);
        else if (type === "uniform1fv") gl.uniform1fv(loc, value as Float32List);
      }

      gl.uniform2f(
        resolutionUniform,
        canvas.width / pixelRatio,
        canvas.height / pixelRatio
      );

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.disable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);

      let startTime: number | null = null;
      let lastFrameTime = 0;
      const frameInterval = maxFps !== Infinity ? 1000 / maxFps : 0;

      function animate(currentTime: number) {
        if (!gl || !ctx) return;

        if (playStateRef.current === "paused") {
          return;
        }

        const timeInSeconds = currentTime / 1000;
        if (startTime === null) startTime = timeInSeconds;

        if (frameInterval > 0 && currentTime - lastFrameTime < frameInterval) {
          animationFrameIdRef.current = requestAnimationFrame(animate);
          return;
        }
        lastFrameTime = currentTime;

        timeRef.current = timeInSeconds - startTime;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniform1f(timeUniform, timeRef.current);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Validate canvas dimensions before drawing
        if (canvas!.width > 0 && canvas!.height > 0) {
          ctx.clearRect(0, 0, canvas!.width, canvas!.height);
          ctx.drawImage(offscreenCanvas, 0, 0);
        }

        animationFrameIdRef.current = requestAnimationFrame(animate);
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);

      const handleResize = debounce(() => {
        updateCanvasSize();
        gl?.uniform2f(
          resolutionUniform,
          canvas!.width / pixelRatio,
          canvas!.height / pixelRatio
        );
      }, 100);

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(canvas);

      return () => {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        resizeObserver.disconnect();
        if (gl) {
          gl.deleteShader(vertexShader);
          gl.deleteShader(fragmentShader);
          gl.deleteProgram(program);
          gl.deleteBuffer(buffer);
        }
      };
    }, [source, uniforms, maxFps]);

    return <canvas ref={canvasRef} aria-hidden="true" />;
  }
);

Shader.displayName = "Shader";

export const DottedShader = forwardRef<ShaderRef, DottedShaderProps>(
  function DottedShader(
    {
      colors = [[0, 0, 0]],
      opacities = [0.3, 0.3, 0.65, 0.65, 0.9, 1.0],
      totalSize,
      dotSize,
      shader,
      center,
    },
    ref: ForwardedRef<ShaderRef>
  ) {
    const processedColors = useMemo(() => {
      let cols: [number, number, number][];

      if (colors.length === 1) {
        cols = Array(6).fill(colors[0]) as [number, number, number][];
      } else if (colors.length === 2) {
        cols = [
          colors[0],
          colors[0],
          colors[0],
          colors[1],
          colors[1],
          colors[1],
        ];
      } else if (colors.length === 3) {
        cols = [
          colors[0],
          colors[0],
          colors[1],
          colors[1],
          colors[2],
          colors[2],
        ];
      } else {
        cols = colors.slice(0, 6) as [number, number, number][];
      }

      return cols.map(([r, g, b]) => [r / 255, g / 255, b / 255]);
    }, [colors]);

    const uniforms = useMemo(
      () => ({
        u_colors: { value: processedColors, type: "uniform3fv" as const },
        u_opacities: { value: opacities, type: "uniform1fv" as const },
        u_total_size: { value: totalSize, type: "uniform1f" as const },
        u_dot_size: { value: dotSize, type: "uniform1f" as const },
      }),
      [processedColors, opacities, totalSize, dotSize]
    );

    const shaderSource = useMemo(() => {
      const maxOpacities = opacities.length;
      const maxColors = processedColors.length;

      return `#version 300 es
    precision highp float;
    in vec2 fragCoord;
    uniform float u_time;
    uniform float u_opacities[${maxOpacities}];
    uniform vec3 u_colors[${maxColors}];
    uniform float u_total_size;
    uniform float u_dot_size;
    uniform vec2 u_resolution;
    out vec4 fragColor;

    const float PHI = 1.61803398874989484820459;
    
    float random(vec2 xy) {
      return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
    }

    void main() {
      vec2 st = fragCoord.xy;
      ${
        center?.includes("x")
          ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));"
          : ""
      }
      ${
        center?.includes("y")
          ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));"
          : ""
      }
      
      float opacity = step(0.0, st.x) * step(0.0, st.y);
      vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
      
      float show_offset = random(st2);
      float rand = random(st2 * floor((u_time / 5.0) + show_offset + 5.0) + 1.0);
      opacity *= u_opacities[int(rand * float(${maxOpacities}))];
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
      
      vec3 color = u_colors[int(show_offset * float(${maxColors}))];
      ${shader || ""}
      
      fragColor = vec4(color, opacity);
      fragColor.rgb *= fragColor.a;
    }`;
    }, [opacities.length, processedColors.length, center, shader]);

    return (
      <Shader ref={ref} source={shaderSource} uniforms={uniforms} maxFps={60} />
    );
  }
);

DottedShader.displayName = "DottedShader";
