"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { HalfFloatType, LinearFilter, Mesh, OrthographicCamera, PlaneGeometry, Scene as ThreeScene, ShaderMaterial, Vector2, WebGLRenderTarget } from "three";

/**
 * The gateway: a Himalayan night rendered procedurally. Ridged snow peaks
 * rise beyond dark forested foothills; moonlight catches the snow, a faint
 * cloud veil sits high and low mist drifts in the valleys. `dawn` (0→1)
 * brings the same range to first light for the entry transition.
 *
 * The terrain never moves, so the expensive raymarch runs only twice — once
 * lit by the moon, once by first light — into textures. Each frame merely
 * blends them by `dawn` and adds the drifting mist and clouds.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const common = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uRes;
  const float FAR = 160.0;

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  const mat2 M = mat2(1.6, 1.2, -1.2, 1.6);
  float fbm(vec2 p) { float h = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { h += a * noise(p); p = M * p; a *= 0.5; } return h; }

  // A long lens from the valley floor: compression makes the range loom.
  const vec3 RO = vec3(0.0, 1.7, -6.0);
  vec3 rayDir() {
    vec2 uv = (vUv * 2.0 - 1.0) * vec2(uRes.x / uRes.y, 1.0);
    vec3 fw = normalize(vec3(0.0, 4.6, 40.0) - RO);
    vec3 rt = normalize(cross(vec3(0, 1, 0), fw));
    vec3 up = cross(fw, rt);
    return normalize(uv.x * rt + uv.y * up + 2.7 * fw);
  }
`;

/** Static pass: lit terrain and sky. Alpha stores ray distance (1 = sky). */
const terrainFragment = common + /* glsl */ `
  uniform float uDawn;
  uniform float uSteps;

  // Ridged multifractal: sharp crests that read as eroded rock and snow arêtes.
  float ridged(vec2 p, int oct) {
    float h = 0.0, a = 0.5, w = 1.0;
    for (int i = 0; i < 9; i++) {
      if (i >= oct) break;
      float n = 1.0 - abs(noise(p) * 2.0 - 1.0);
      n *= n * w;
      h += a * n;
      w = clamp(n * 1.8, 0.0, 1.0);
      p = M * p;
      a *= 0.5;
    }
    return h;
  }

  // World: x right, y up, z away from the viewer. Foothills near, a high range far.
  float terrain(vec2 p, int oct) {
    float far = smoothstep(9.0, 46.0, p.y);
    float h = ridged(p * vec2(0.075, 0.06) + vec2(3.1, 0.0), oct);
    h = h * mix(2.4, 11.5, far) + far * 2.4;
    // Layered foothills: long forested ridges stepping back toward the range.
    float near = 1.0 - far;
    h += near * 0.9 * smoothstep(0.35, 1.0, sin(p.y * 0.42 + p.x * 0.05 + noise(p * 0.2) * 1.5) * 0.5 + 0.5);
    // Open the valley floor in front of the camera.
    h -= near * 1.6 * exp(-p.x * p.x * 0.01);
    return h;
  }

  vec3 normalAt(vec2 p, float t) {
    float e = 0.0025 * t + 0.002;
    float h = terrain(p, 8);
    return normalize(vec3(h - terrain(p + vec2(e, 0), 8), e, h - terrain(p + vec2(0, e), 8)));
  }

  float march(vec3 ro, vec3 rd, out float t) {
    t = 0.4;
    for (int i = 0; i < 260; i++) {
      if (float(i) >= uSteps) break;
      vec3 p = ro + rd * t;
      float d = p.y - terrain(p.xz, 6);
      if (d < 0.0018 * t) return 1.0;
      t += 0.42 * d;
      if (t > FAR) break;
    }
    return 0.0;
  }

  float shadow(vec3 ro, vec3 rd) {
    float res = 1.0, t = 0.15;
    for (int i = 0; i < 32; i++) {
      vec3 p = ro + rd * t;
      float d = p.y - terrain(p.xz, 4);
      res = min(res, 10.0 * d / t);
      if (res < 0.01) break;
      t += clamp(d, 0.08, 1.2);
    }
    return clamp(res, 0.0, 1.0);
  }

  const vec3 moonDir = vec3(-0.5508, 0.4206, 0.7210); // normalised
  const vec3 sunDir = vec3(0.3289, 0.0940, 0.9397);   // low, behind the range

  vec3 sky(vec3 rd) {
    float y = max(rd.y, 0.0);
    vec3 night = mix(vec3(0.075, 0.105, 0.135), vec3(0.018, 0.028, 0.040), pow(y, 0.55));
    vec3 day = mix(vec3(0.78, 0.60, 0.42), vec3(0.20, 0.30, 0.37), pow(y, 0.42));
    vec3 c = mix(night, day, uDawn);
    float m = max(dot(rd, moonDir), 0.0);
    c += (vec3(0.20, 0.24, 0.30) * pow(m, 1400.0) + vec3(0.035, 0.045, 0.06) * pow(m, 60.0)) * (1.0 - uDawn);
    float s = max(dot(rd, sunDir), 0.0);
    c += vec3(0.85, 0.52, 0.24) * pow(s, 5.0) * uDawn * 0.55;
    return c;
  }

  void main() {
    vec3 rd = rayDir();
    float t;
    float hit = march(RO, rd, t);
    vec3 col = sky(rd);
    if (hit > 0.5) {
      vec3 p = RO + rd * t;
      vec3 n = normalAt(p.xz, t);
      float alt = p.y + (fbm(p.xz * 0.9) - 0.5) * 1.1;
      float snow = smoothstep(3.3, 4.6, alt) * smoothstep(0.3, 0.66, n.y);
      float forest = (1.0 - smoothstep(2.0, 3.2, p.y)) * smoothstep(0.45, 0.8, n.y);
      vec3 rock = vec3(0.075, 0.085, 0.095) * (0.75 + 0.5 * fbm(p.xz * 3.0));
      vec3 alb = mix(rock, vec3(0.03, 0.045, 0.04), forest);
      alb = mix(alb, vec3(0.80, 0.85, 0.90), snow);

      vec3 L = normalize(mix(moonDir, sunDir, uDawn));
      vec3 lightCol = mix(vec3(0.46, 0.56, 0.72) * 1.75, vec3(1.0, 0.70, 0.44) * 1.7, uDawn);
      vec3 amb = mix(vec3(0.035, 0.05, 0.07), vec3(0.22, 0.27, 0.32), uDawn);
      float dif = clamp(dot(n, L), 0.0, 1.0);
      float sh = dif > 0.001 ? shadow(p + n * 0.02, L) : 0.0;
      // Snow in shadow still glows faintly with skylight; rock and forest do not.
      col = alb * (lightCol * dif * sh + amb * (0.55 + 0.45 * n.y) * (1.0 + snow * 1.8));
      // Distance haze.
      vec3 fogCol = mix(vec3(0.055, 0.08, 0.10), vec3(0.50, 0.55, 0.58), uDawn);
      col = mix(col, fogCol, clamp(1.0 - exp(-t * 0.018), 0.0, 1.0));
    }
    gl_FragColor = vec4(col, hit > 0.5 ? t / FAR : 1.0);
  }
`;

/** Per-frame pass: blend night and first light, add drifting mist and clouds. */
const compositeFragment = common + /* glsl */ `
  uniform sampler2D tNight;
  uniform sampler2D tDawn;
  uniform float uDawn;
  uniform float uTime;

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
      vec3 mistCol = mix(vec3(0.11, 0.14, 0.17), vec3(0.70, 0.70, 0.68), uDawn);
      col = mix(col, mistCol, clamp(low * 0.55, 0.0, 0.6));
    } else if (rd.y > 0.0) {
      // A faint, slow cloud veil high above the range.
      vec2 cp = rd.xz / (rd.y + 0.08) * 1.6 + vec2(uTime * 0.004, 0.0);
      float cl = smoothstep(0.52, 0.85, fbm(cp));
      col = mix(col, mix(vec3(0.16, 0.20, 0.25), vec3(0.92, 0.80, 0.68), uDawn), cl * 0.22 * smoothstep(0.0, 0.25, rd.y));
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
