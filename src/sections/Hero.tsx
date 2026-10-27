"use client";

import { useRef } from "react";
import { EASE, gsap, SplitText, useScene } from "@/animation";
import { useEntered } from "@/components/AgeGate";
import { HimalayaLandscape } from "@/components/landscape/HimalayaLandscape";
import { hero } from "@/content/site";
import styles from "./Hero.module.css";

/**
 * Opening shot. The camera settles on the range, then scroll dollies it
 * forward: near ridges sweep past the lens, fog thickens, and the frame
 * dissolves into the mist the bottle rises from in the next scene.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const entered = useEntered();

  useScene(
    ref,
    ({ motion, desktop, fine }, root) => {
      const q = gsap.utils.selector(root);
      const layers = q<HTMLElement>("[data-layer]");
      const inners = q<HTMLElement>("[data-layer-inner]");
      const depth = (el: Element) => Number((el as HTMLElement).dataset.depth ?? 0);
      const headline = q("[data-headline]")[0] as HTMLElement;
      const copy = q("[data-intro]");

      if (!entered) {
        gsap.set([headline, copy], { autoAlpha: 0 });
        return;
      }

      // ---- Intro: camera settles, the headline is set in type ----
      if (!motion) {
        gsap.to([headline, copy], { autoAlpha: 1, duration: 0.8, stagger: 0.1 });
        return;
      }
      const split = SplitText.create(headline, { type: "words,chars", mask: "chars" });
      gsap.set(headline, { autoAlpha: 1 });
      const intro = gsap.timeline({ defaults: { ease: EASE.rise } });
      intro
        .from(inners, { yPercent: (i, el) => 4 + depth(el.parentElement!) * 10, scale: 1.08, duration: 3.2, stagger: 0.08 }, 0)
        .from(q("[data-sky]"), { autoAlpha: 0.4, duration: 3 }, 0)
        .from(q("[data-sun]"), { scale: 0.6, autoAlpha: 0, duration: 4 }, 0.3)
        .from(split.chars, { yPercent: 120, rotate: 6, duration: 1.6, stagger: 0.04 }, 0.7)
        .from(copy, { autoAlpha: 0, y: 24, duration: 1.4, stagger: 0.15 }, 1.4);

      // ---- Pointer parallax: depth-weighted, pointer devices only ----
      let removePointer = () => {};
      if (fine) {
        const movers = inners.map((el) => ({
          x: gsap.quickTo(el, "x", { duration: 1.6, ease: "power3" }),
          y: gsap.quickTo(el, "y", { duration: 1.6, ease: "power3" }),
          d: depth(el.parentElement!),
        }));
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          movers.forEach((m) => {
            m.x(-nx * (6 + m.d * 46));
            m.y(-ny * (2 + m.d * 14));
          });
        };
        window.addEventListener("pointermove", move, { passive: true });
        removePointer = () => window.removeEventListener("pointermove", move);
      }

      // ---- Scroll: travel through the landscape ----
      const travel = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: desktop
          ? { trigger: root, start: "top top", end: "+=220%", scrub: 1, pin: q("[data-stage]")[0], anticipatePin: 1 }
          : { trigger: root, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      const reach = desktop ? 1 : 0.45; // shorter, gentler move on phones
      layers.forEach((el) => {
        const d = depth(el);
        travel.to(el, { scale: 1 + (0.06 + d * d * 2.4) * reach, yPercent: d * 26 * reach, duration: 1 }, 0);
        if (d === 1) travel.to(el, { autoAlpha: 0, duration: 0.25 }, 0.6);
      });
      travel
        .to(q("[data-fog]"), { yPercent: -40, scale: 1.5, opacity: 0.95, duration: 1, stagger: 0.02 }, 0)
        .to(q("[data-sky]"), { yPercent: 8, duration: 1 }, 0)
        .to(q("[data-sun]"), { scale: 1.4, yPercent: -10, duration: 1 }, 0)
        .to(q("[data-copy]"), { yPercent: -30, autoAlpha: 0, duration: 0.35 }, 0.04)
        .to(q("[data-cue]"), { autoAlpha: 0, duration: 0.1 }, 0)
        .fromTo(q("[data-flood]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.6);

      return () => {
        removePointer();
        split.revert();
      };
    },
    [entered],
  );

  return (
    <section ref={ref} className={styles.hero} aria-labelledby="hero-title">
      <div data-stage className={styles.stage}>
        <HimalayaLandscape />
        <div className={styles.vignette} aria-hidden="true" />
        <div data-copy className={styles.copy}>
          <p data-intro className="eyebrow">
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" data-headline className={`display ${styles.title}`} style={{ visibility: "hidden" }}>
            {hero.headline[0]} <em>{hero.headline[1]}</em>
          </h1>
          <p data-intro className={`lede ${styles.sub}`}>
            {hero.sub}
          </p>
        </div>
        <div data-cue data-intro className={styles.cue} aria-hidden="true">
          <span>Scroll to begin the ascent</span>
          <i />
        </div>
        <div data-flood className={styles.flood} aria-hidden="true" />
      </div>
    </section>
  );
}
