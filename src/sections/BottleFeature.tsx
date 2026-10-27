"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { EASE, gsap, Reveal, SplitText, useMotion, useScene } from "@/animation";
import { BottleSVG } from "@/components/BottleSVG";
import { WebGLBoundary } from "@/components/WebGLBoundary";
import { ClaimText, PendingTag } from "@/components/Pending";
import { bottleFeature } from "@/content/site";
import styles from "./BottleFeature.module.css";

const BottleStage = dynamic(() => import("@/three/BottleStage"), { ssr: false });

/**
 * The bottle rises out of the hero's fog and is choreographed by scroll:
 * rise → turn → glide left → glide right → ascend into the story.
 * Desktop with WebGL gets the 3D bottle; everything else gets the SVG bottle
 * driven by the same timeline, or a calm stacked layout on phones.
 */
export function BottleFeature() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const { ready, reduced, mobile, webgl } = useMotion();
  const [gpuFailed, setGpuFailed] = useState(false);
  const cinematic = !ready || (!reduced && !mobile);
  const use3D = ready && cinematic && webgl && !gpuFailed;
  const [quality, setQuality] = useState<"high" | "low">("high");

  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 8;
    setQuality(cores <= 4 || window.devicePixelRatio > 2.5 ? "low" : "high");
  }, []);

  useScene(
    ref,
    ({ motion, desktop }, root) => {
      const q = gsap.utils.selector(root);
      if (!(motion && desktop)) {
        // Phones / reduced motion: the bottle rises once as it enters, highlight sweeps on scroll.
        if (motion) {
          gsap.from(q("[data-bottle-2d]"), {
            yPercent: 30,
            autoAlpha: 0,
            duration: 1.8,
            ease: EASE.rise,
            scrollTrigger: { trigger: root, start: "top 75%", once: true },
          });
          gsap.fromTo(q("[data-highlight]"), { x: 0 }, { x: 120, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true } });
        }
        return;
      }

      const steps = q<HTMLElement>("[data-step]");
      const splits = steps.map((s) => SplitText.create(s.querySelector("[data-step-title]"), { type: "lines,words", mask: "lines" }));

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=320%",
          scrub: true,
          pin: q("[data-stage]")[0],
          anticipatePin: 1,
          onUpdate: (self) => (progress.current = self.progress),
        },
      });
      tl.set({}, {}, 1); // timeline length = 1 so positions read as scroll progress

      // Fog the bottle rises out of, and the halo of light behind it.
      tl.to(q("[data-mist]"), { yPercent: 60, autoAlpha: 0, duration: 0.3 }, 0)
        .fromTo(q("[data-halo]"), { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3 }, 0.02)
        .to(q("[data-halo]"), { xPercent: -36, duration: 0.18 }, 0.32)
        .to(q("[data-halo]"), { xPercent: 36, duration: 0.18 }, 0.58)
        .to(q("[data-halo]"), { xPercent: 0, yPercent: -60, autoAlpha: 0, duration: 0.16 }, 0.84);

      // Copy beats, timed to the bottle's moves in Bottle.tsx.
      const beat = (i: number, at: number, out: number) => {
        const s = steps[i];
        tl.fromTo(s, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, at)
          .from(splits[i].lines, { yPercent: 110, stagger: 0.015, duration: 0.08, ease: EASE.rise }, at)
          .from(s.querySelectorAll("[data-step-fade]"), { autoAlpha: 0, y: 30, stagger: 0.02, duration: 0.08 }, at + 0.03)
          .to(s, { autoAlpha: 0, y: -40, duration: 0.06 }, out);
      };
      beat(0, 0.1, 0.3);
      beat(1, 0.44, 0.6);
      beat(2, 0.7, 0.86);

      // 2D bottle shares the same choreography when WebGL is unavailable.
      const flat = q("[data-bottle-2d]");
      if (flat.length) {
        tl.fromTo(flat, { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.28 }, 0)
          .to(flat, { xPercent: -70, duration: 0.18 }, 0.32)
          .to(flat, { xPercent: 70, duration: 0.18 }, 0.58)
          .to(flat, { xPercent: 0, yPercent: -120, autoAlpha: 0, duration: 0.16 }, 0.84)
          .fromTo(q("[data-highlight]"), { x: 0 }, { x: 120, duration: 1 }, 0);
      }

      return () => splits.forEach((s) => s.revert());
    },
    [use3D],
  );

  const [s0, s1, s2] = bottleFeature.steps;

  return (
    <section ref={ref} className={styles.section} data-mode={cinematic ? "cinematic" : "simple"} aria-label="The bottle">
      <div data-stage className={styles.stage}>
        <div data-mist className={styles.mist} aria-hidden="true" />
        <div data-halo className={styles.halo} aria-hidden="true" />

        <div data-step className={`${styles.step} ${styles.center}`}>
          <p data-step-fade className="eyebrow">{s0.kicker}</p>
          <h2 data-step-title className={`display ${styles.giant}`}>{s0.title}</h2>
        </div>

        <div className={styles.object}>
          {use3D ? (
            <WebGLBoundary onError={() => setGpuFailed(true)} fallback={<div className={styles.flat}><BottleSVG className={styles.svg} /></div>}>
              <BottleStage progress={progress} quality={quality} className={styles.canvas} />
            </WebGLBoundary>
          ) : (
            <div data-bottle-2d className={styles.flat}>
              <BottleSVG className={styles.svg} />
            </div>
          )}
          <span className={styles.placeholder}>
            <PendingTag>3D placeholder — awaiting product model</PendingTag>
          </span>
        </div>

        <div data-step className={`${styles.step} ${styles.right}`}>
          <p data-step-fade className="eyebrow">{s1.kicker}</p>
          <h2 data-step-title className={`display ${styles.title}`}>{s1.title}</h2>
          <div data-step-fade>
            <ClaimText claim={s1.body} className={styles.body} />
          </div>
        </div>

        <div data-step className={`${styles.step} ${styles.left}`}>
          <p data-step-fade className="eyebrow">{s2.kicker}</p>
          <h2 data-step-title className={`display ${styles.title}`}>{s2.title}</h2>
          <div data-step-fade>
            <ClaimText claim={s2.body} className={styles.body} />
          </div>
        </div>
      </div>

      {/* Stacked copy for phones and reduced motion */}
      <Reveal className={styles.stack} stagger={0.12}>
        {bottleFeature.steps.map((s) => (
          <div key={s.kicker} data-reveal className={styles.stackItem}>
            <p className="eyebrow">{s.kicker}</p>
            <h2 className={`display ${styles.title}`}>{s.title}</h2>
            <ClaimText claim={s.body} className={styles.body} />
          </div>
        ))}
      </Reveal>
    </section>
  );
}
