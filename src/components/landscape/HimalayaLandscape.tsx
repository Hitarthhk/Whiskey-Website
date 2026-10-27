"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { gsap, useMotion, useScene } from "@/animation";
import type { HimalayaBake } from "@/three/himalaya/bake";
import { Landscape } from "./Landscape";
import { dawn } from "./palettes";
import styles from "./Himalaya.module.css";

/** Far → near. Depths drive the hero’s scroll parallax; fog sits behind the next layer. */
const LAYERS = [
  { depth: 0, fog: 0.5, fogBottom: 34 },
  { depth: 0.25, fog: 0.38, fogBottom: 24 },
  { depth: 0.5, fog: 0.3, fogBottom: 14 },
  { depth: 0.75 },
  { depth: 1 },
];

// Bakes are kept for the session so returning to the hero is instant.
const cache = new Map<string, HimalayaBake>();

/**
 * Procedural Himalayan valley for the hero, in independent layers: sky,
 * distant snow peaks, middle ridges, forested ridges, foothills with their
 * treeline, foreground pines, fog bands, clouds and a sunlight overlay. It
 * exposes the same hooks as <Landscape> ([data-sky], [data-sun], [data-cloud],
 * [data-layer][data-depth] › [data-layer-inner], [data-fog]) so existing scroll
 * choreography drives it unchanged. Without WebGL the illustrated landscape
 * stands in.
 */
export function HimalayaLandscape({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const slots = useRef<Record<string, HTMLElement | null>>({});
  const { ready, webgl, mobile } = useMotion();
  const [baked, setBaked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!ready || !webgl || !el) return;
    let cancelled = false;
    let current = "";
    const run = async () => {
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.25);
      const w = Math.min(2600, Math.round(el.clientWidth * 1.12 * dpr));
      const h = Math.min(1600, Math.round(el.clientHeight * dpr));
      const key = `${w}x${h}`;
      if (!w || !h || key === current) return;
      current = key;
      const { bakeHimalaya } = await import("@/three/himalaya/bake");
      const bake = cache.get(key) ?? (await bakeHimalaya(w, h, mobile ? "low" : "high"));
      cache.set(key, bake);
      if (cancelled || key !== current) return;
      const put = (slot: string, canvas: HTMLCanvasElement) => slots.current[slot]?.replaceChildren(canvas);
      put("sky", bake.sky);
      bake.layers.forEach((c, i) => put(`layer${i}`, c));
      bake.fog.forEach((c, i) => put(`fog${i}`, c));
      bake.clouds.forEach((c, i) => put(`cloud${i}`, c));
      setBaked(true);
    };
    run();
    // Re-bake only after a substantial resize (orientation change, window snap).
    let timer = 0;
    const resize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const [cw, ch] = current.split("x").map(Number);
        const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.25);
        const nw = el.clientWidth * 1.12 * dpr, nh = el.clientHeight * dpr;
        if (Math.abs(nw - cw) / cw > 0.2 || Math.abs(nh - ch) / ch > 0.2) run();
      }, 500);
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("resize", resize);
    };
  }, [ready, webgl, mobile]);

  // Ambient life: clouds and fog drift on their own, and the sunlight breathes.
  useScene(ref, ({ motion }, root) => {
    if (!motion) return;
    root.querySelectorAll<HTMLElement>("[data-cloud]").forEach((el, i) => {
      gsap.fromTo(el, { xPercent: -6 - i * 6 }, { xPercent: -26 + i * 4, duration: 110 + i * 40, ease: "none", repeat: -1, yoyo: true });
    });
    root.querySelectorAll<HTMLElement>("[data-fog-drift]").forEach((el, i) => {
      gsap.to(el, { xPercent: i % 2 ? -5 : 5, duration: 26 + i * 6, ease: "sine.inOut", repeat: -1, yoyo: true });
    });
    gsap.to(root.querySelector("[data-light]"), { opacity: 0.55, xPercent: 3, duration: 14, ease: "sine.inOut", repeat: -1, yoyo: true });
  });

  if (ready && !webgl) return <Landscape palette={dawn} id="hero" className={className} />;

  return (
    <div ref={ref} className={`${styles.landscape} ${className ?? ""}`} data-baked={baked} aria-hidden="true">
      <div className={styles.sky} data-sky ref={(el) => { slots.current.sky = el; }} />
      <div className={styles.sun} data-sun />
      <div className={styles.clouds}>
        {[0, 1].map((i) => (
          <span key={i} data-cloud className={styles.cloud} data-index={i} ref={(el) => { slots.current[`cloud${i}`] = el; }} />
        ))}
      </div>
      {LAYERS.map((l, i) => (
        <Fragment key={i}>
          <div className={styles.layer} data-layer data-depth={l.depth} style={{ zIndex: i * 2 + 2 }}>
            <div data-layer-inner className={styles.inner} ref={(el) => { slots.current[`layer${i}`] = el; }} />
          </div>
          {l.fog !== undefined && (
            <div className={styles.fog} data-fog data-depth={l.depth} style={{ zIndex: i * 2 + 3, opacity: l.fog, bottom: `${l.fogBottom}%` }}>
              <span data-fog-drift className={styles.fogBand} ref={(el) => { slots.current[`fog${i}`] = el; }} />
            </div>
          )}
        </Fragment>
      ))}
      <div className={styles.light} data-light />
    </div>
  );
}
