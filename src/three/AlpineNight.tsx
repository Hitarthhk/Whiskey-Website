"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { himalayaGLSL } from "./himalaya/glsl";
import { HalfFloatType, LinearFilter, Mesh, OrthographicCamera, PlaneGeometry, Scene as ThreeScene, ShaderMaterial, Vector2, WebGLRenderTarget } from "three";

/**
 * The gateway: a Himalayan night rendered procedurally. Ridged snow peaks
 * rise beyond dark forested foothills; moonlight catches the snow, a faint
 * cloud veil sits high and low mist drifts in the valleys. `dawn` (0→1)
 * brings the same range to the hero’s morning light for the entry transition.
 *
 * The terrain never moves, so the expensive raymarch runs only twice — once
 * lit by the moon, once by first light — into textures. Each frame merely
 * blends them by `dawn` and adds the drifting mist and clouds.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

/** Static pass: lit terrain and sky. Alpha stores ray distance (1 = sky). */
const terrainFragment = himalayaGLSL + /* glsl */ `
  uniform float uDawn;
  uniform float uSteps;
  float terrain(vec2 p, int oct) { return terrainBase(p, oct); }

  void main() {
    vec3 rd = rayDir();
    float t;
    float hit = march(RO, rd, uSteps, t);
    vec3 col = mix(nightSky(rd), morningSky(rd), uDawn);
    if (hit > 0.5) {
      vec3 p = RO + rd * t;
      col = shade(p, normalAt(p.xz, t), uDawn);
      col = mix(col, hazeColour(uDawn), clamp(1.0 - exp(-t * 0.018), 0.0, 1.0));
    }
    gl_FragColor = vec4(col, hit > 0.5 ? t / FAR : 1.0);
  }
`;

/** Per-frame pass: blend night and first light, add drifting mist and clouds. */
const compositeFragment = himalayaGLSL + /* glsl */ `
  uniform sampler2D tNight;
  uniform sampler2D tDawn;
  uniform float uDawn;
  uniform float uTime;
  float terrain(vec2 p, int oct) { return terrainBase(p, oct); }

  void main() {
    vec3 rd = rayDir();
    vec4 night = texture2D(tNight, vUv);
    vec3 col = mix(night.rgb, texture2D(tDawn, vUv).rgb, uDawn);
    if (night.a < 0.999) {
      // Low mist pooling in the valleys, drifting slowly.
      float t = night.a * FAR;
      vec3 p = RO + rd * t;
      float low = exp(-max(p.y - 0.9, 0.0) * 1.4) * smoothstep(3.0, 16.0, t)
                * (0.4 + 0.6 * fbm(p.xz * 0.12 + vec2(uTime * 0.012, uTime * 0.004)));
      vec3 mistCol = mix(vec3(0.11, 0.14, 0.17), vec3(0.78, 0.80, 0.80), uDawn);
      col = mix(col, mistCol, clamp(low * 0.55, 0.0, 0.6));
    } else if (rd.y > 0.0) {
      // A faint, slow cloud veil high above the range.
      vec2 cp = rd.xz / (rd.y + 0.08) * 1.6 + vec2(uTime * 0.004, 0.0);
      float cl = smoothstep(0.52, 0.85, fbm(cp));
      col = mix(col, mix(vec3(0.16, 0.20, 0.25), vec3(0.95, 0.93, 0.88), uDawn), cl * 0.22 * smoothstep(0.0, 0.25, rd.y));
    }
    // Gentle vignette and dithering against banding in the dark gradients.
    vec2 q = vUv - 0.5;
    col *= 1.0 - dot(q, q) * 0.55;
    col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
    gl_FragColor = vec4(pow(max(col, 0.0), vec3(0.95)), 1.0);
  }
`;

type Props = {
  /** 0 = midnight, 1 = first light. Read every frame; tween it freely. */
  dawn: RefObject<number>;
  /** Slow mist and cloud drift. Off for reduced motion (static frame). */
  animate: boolean;
  quality: "high" | "low";
  onReady?: () => void;
};

const quad = () => new Mesh(new PlaneGeometry(2, 2));

function Scene({ dawn, animate, quality, onReady }: Props) {
  const { gl, size, invalidate } = useThree();
  const dirty = useRef(true);

  const parts = useMemo(() => {
    const uRes = { value: new Vector2(1, 1) };
    const terrain = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: terrainFragment,
      uniforms: { uRes, uDawn: { value: 0 }, uSteps: { value: quality === "high" ? 240 : 140 } },
      depthTest: false,
      depthWrite: false,
    });
    const target = () => new WebGLRenderTarget(1, 1, { type: HalfFloatType, minFilter: LinearFilter, magFilter: LinearFilter, depthBuffer: false });
    const night = target(), first = target();
    const composite = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: compositeFragment,
      uniforms: { uRes, tNight: { value: night.texture }, tDawn: { value: first.texture }, uDawn: { value: 0 }, uTime: { value: 0 } },
      depthTest: false,
      depthWrite: false,
    });
    const terrainScene = new ThreeScene().add(Object.assign(quad(), { material: terrain, frustumCulled: false }));
    const compositeScene = new ThreeScene().add(Object.assign(quad(), { material: composite, frustumCulled: false }));
    return { uRes, terrain, composite, night, first, terrainScene, compositeScene, camera: new OrthographicCamera() };
  }, [quality]);

  useEffect(
    () => () => {
      [parts.terrain, parts.composite, parts.night, parts.first].forEach((d) => d.dispose());
      [parts.terrainScene, parts.compositeScene].forEach((s) => s.traverse((o) => (o as Mesh).geometry?.dispose()));
    },
    [parts],
  );

  // Re-light the range whenever the drawing buffer changes size.
  useEffect(() => {
    const buffer = gl.getDrawingBufferSize(new Vector2());
    parts.uRes.value.copy(buffer);
    parts.night.setSize(buffer.x, buffer.y);
    parts.first.setSize(buffer.x, buffer.y);
    dirty.current = true;
    invalidate();
  }, [size, gl, parts, invalidate]);

  // Rendering is taken over here (priority 1): bake both lightings when needed, then composite.
  useFrame(() => {
    if (dirty.current) {
      dirty.current = false;
      for (const [rt, light] of [[parts.night, 0], [parts.first, 1]] as const) {
        parts.terrain.uniforms.uDawn.value = light;
        gl.setRenderTarget(rt);
        gl.render(parts.terrainScene, parts.camera);
      }
      gl.setRenderTarget(null);
    }
    gl.render(parts.compositeScene, parts.camera);
  }, 1);

  // ~24 fps is plenty for mist that barely moves.
  useEffect(() => {
    const start = performance.now();
    let lastDawn = -1, frames = 0;
    const id = window.setInterval(() => {
      const d = dawn.current ?? 0;
      if (!animate && d === lastDawn && frames > 0) return;
      if (animate) parts.composite.uniforms.uTime.value = (performance.now() - start) / 1000;
      parts.composite.uniforms.uDawn.value = d;
      lastDawn = d;
      invalidate();
      // Ready once the first frame has reached the screen.
      if (++frames === 1) requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    }, 1000 / 24);
    return () => window.clearInterval(id);
  }, [animate, dawn, parts, invalidate, onReady]);

  return null;
}

export default function AlpineNight(props: Props & { className?: string }) {
  // Rendered below device resolution: the scene is soft and atmospheric by nature.
  const scale = props.quality === "high" ? 0.75 : 0.55;
  return (
    <Canvas
      className={props.className}
      frameloop="demand"
      dpr={typeof window === "undefined" ? scale : Math.min(window.devicePixelRatio, 1.5) * scale}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <Scene {...props} />
    </Canvas>
  );
}
