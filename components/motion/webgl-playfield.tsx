'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

const VERTEX_SHADER = `
attribute vec2 a_position;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_aspect;
varying float v_energy;

void main() {
  vec2 p = a_position;
  vec2 pointer = u_pointer;
  pointer.x *= u_aspect;
  vec2 corrected = vec2(p.x * u_aspect, p.y);
  float distanceToPointer = distance(corrected, pointer);
  float influence = smoothstep(0.55, 0.0, distanceToPointer);
  float wave = sin((p.x * 7.0) + u_time * 0.9) * cos((p.y * 6.0) - u_time * 0.7);
  p.y += wave * 0.012;
  p += normalize(p - u_pointer + vec2(0.0001)) * influence * 0.045;
  v_energy = influence + (wave + 1.0) * 0.12;
  gl_Position = vec4(p, 0.0, 1.0);
  gl_PointSize = 2.0 + influence * 5.0;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying float v_energy;

void main() {
  vec2 point = gl_PointCoord - 0.5;
  if (length(point) > 0.5) discard;
  vec3 green = vec3(0.082, 0.502, 0.239);
  vec3 lime = vec3(0.639, 0.902, 0.208);
  vec3 color = mix(green, lime, clamp(v_energy, 0.0, 1.0));
  float alpha = 0.18 + clamp(v_energy, 0.0, 1.0) * 0.65;
  gl_FragColor = vec4(color, alpha);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
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

export function WebGLPlayfield({
  children,
  className,
  canvasClassName,
  contentClassName,
}: {
  children?: ReactNode;
  className?: string;
  canvasClassName?: string;
  contentClassName?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    if (!gl) return;
    const activeCanvas: HTMLCanvasElement = canvas;
    const activeGl: WebGLRenderingContext = gl;

    const vertexShader = createShader(activeGl, activeGl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = createShader(activeGl, activeGl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const columns = 42;
    const rows = 26;
    const points: number[] = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        points.push((column / (columns - 1)) * 2 - 1, (row / (rows - 1)) * 2 - 1);
      }
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const pointerUniform = gl.getUniformLocation(program, 'u_pointer');
    const timeUniform = gl.getUniformLocation(program, 'u_time');
    const aspectUniform = gl.getUniformLocation(program, 'u_aspect');
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let frame = 0;
    let visible = true;

    function resize() {
      const bounds = activeCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      activeCanvas.width = Math.max(1, Math.round(bounds.width * dpr));
      activeCanvas.height = Math.max(1, Math.round(bounds.height * dpr));
      activeGl.viewport(0, 0, activeCanvas.width, activeCanvas.height);
    }

    function onPointerMove(event: PointerEvent) {
      const bounds = activeCanvas.getBoundingClientRect();
      target.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      target.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(activeCanvas);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(activeCanvas);
    activeCanvas.parentElement?.addEventListener('pointermove', onPointerMove);
    resize();

    const start = performance.now();
    function render(now: number) {
      frame = window.requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      pointer.x += (target.x - pointer.x) * 0.055;
      pointer.y += (target.y - pointer.y) * 0.055;
      activeGl.clearColor(0, 0, 0, 0);
      activeGl.clear(activeGl.COLOR_BUFFER_BIT);
      activeGl.uniform2f(pointerUniform, pointer.x, pointer.y);
      activeGl.uniform1f(timeUniform, (now - start) / 1000);
      activeGl.uniform1f(
        aspectUniform,
        activeCanvas.width / Math.max(activeCanvas.height, 1),
      );
      activeGl.drawArrays(activeGl.POINTS, 0, points.length / 2);
    }
    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      activeCanvas.parentElement?.removeEventListener('pointermove', onPointerMove);
      activeGl.deleteBuffer(buffer);
      activeGl.deleteProgram(program);
      activeGl.deleteShader(vertexShader);
      activeGl.deleteShader(fragmentShader);
    };
  }, [reduceMotion]);

  return (
    <div className={cn('relative isolate overflow-hidden', className)}>
      <div className="pitch-grid pointer-events-none absolute inset-0 opacity-70" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn('pointer-events-none absolute inset-0 h-full w-full', canvasClassName)}
      />
      <div className={cn('relative z-10', contentClassName)}>{children}</div>
    </div>
  );
}
