"use client";

import { useRef } from "react";
import { EASE, gsap, SplitText, useMotion, useScene } from "@/animation";
import { Landscape } from "@/components/landscape/Landscape";
import { dusk } from "@/components/landscape/palettes";
import { ClaimText } from "@/components/Pending";
import { story } from "@/content/site";
import styles from "./Story.module.css";

/**
 * Chapter-based story. On desktop the valley is held in frame while the
 * camera trucks sideways and each chapter is set in type, then cleared.
 * On phones the valley stays as a sticky backdrop and chapters scroll over it.
 */
export function Story({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const ref = useRef<HTMLElement>(null);
  const { ready, reduced, mobile } = useMotion();
  const cinematic = !ready || (!reduced && !mobile);
  const Heading = headingLevel === 1 ? "h1" : "h2";

  useScene(ref, ({ motion, desktop }, root) => {
    const q = gsap.utils.selector(root);
    const chapters = q<HTMLElement>("[data-chapter]");

    if (!(motion && desktop)) {
      chapters.forEach((c) =>
        gsap.from(c.querySelectorAll("[data-chapter-item]"), {
          autoAlpha: 0,
          y: motion ? 40 : 0,
          stagger: 0.12,
          duration: 1.2,
          scrollTrigger: { trigger: c, start: "top 70%", once: true },
        }),
      );
      return;
    }

    const splits = chapters.map((c) => SplitText.create(c.querySelector("[data-chapter-title]"), { type: "chars,words", mask: "chars" }));
    const bodies = chapters.map((c) => SplitText.create(c.querySelector("[data-chapter-body] p"), { type: "lines", mask: "lines" }));

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: root, start: "top top", end: "+=300%", scrub: 1, pin: true, anticipatePin: 1 },
    });
    tl.set({}, {}, 1);

    // Camera trucks right across the valley: near layers travel further.
    q<HTMLElement>("[data-layer]").forEach((el) => {
      const d = Number(el.dataset.depth);
      tl.fromTo(el, { xPercent: d * 4 }, { xPercent: -d * 9, scale: 1 + d * 0.08, duration: 1 }, 0);
    });
    tl.fromTo(q("[data-fog]"), { xPercent: 6 }, { xPercent: -14, duration: 1 }, 0)
      .fromTo(q("[data-sweep]"), { xPercent: -120 }, { xPercent: 120, duration: 1 }, 0)
      .fromTo(q("[data-sun]"), { yPercent: -10 }, { yPercent: 20, autoAlpha: 0.5, duration: 1 }, 0)
      .fromTo(q("[data-progress]"), { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);

    const span = 1 / chapters.length;
    chapters.forEach((c, i) => {
      const at = i * span + 0.02;
      const out = (i + 1) * span - 0.05;
      tl.set(c, { autoAlpha: 1 }, at)
        .from(c.querySelector("[data-chapter-numeral]"), { autoAlpha: 0, scale: 0.85, duration: span * 0.4 }, at)
        .from(splits[i].chars, { yPercent: 120, stagger: span * 0.01, duration: span * 0.3, ease: EASE.rise }, at + 0.01)
        .from(bodies[i].lines, { yPercent: 110, stagger: span * 0.04, duration: span * 0.3, ease: EASE.rise }, at + span * 0.15)
        .to(q("[data-tick]")[i], { color: "var(--gold-bright)", duration: 0.01 }, at);
      if (i < chapters.length - 1) {
        tl.to(c, { autoAlpha: 0, yPercent: -8, duration: span * 0.18 }, out).to(q("[data-tick]")[i], { color: "var(--ivory-45)", duration: 0.01 }, out);
      }
    });

    return () => [...splits, ...bodies].forEach((s) => s.revert());
  });

  return (
    <section ref={ref} className={styles.section} data-mode={cinematic ? "cinematic" : "simple"} aria-labelledby="story-title">
      <div data-stage className={styles.stage}>
        <Landscape palette={dusk} id="story" />
        <div data-sweep className={styles.sweep} aria-hidden="true" />
        <div className={styles.shade} aria-hidden="true" />
        <Heading id="story-title" className={`eyebrow ${styles.label}`}>
          {story.intro}
        </Heading>
        <ol className={styles.ticks} aria-hidden="true">
          <span data-progress className={styles.progress} />
          {story.chapters.map((c) => (
            <li key={c.numeral} data-tick>
              {c.numeral}
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.chapters}>
        {story.chapters.map((c) => (
          <article key={c.numeral} data-chapter className={styles.chapter}>
            <span data-chapter-numeral data-chapter-item className={`display ${styles.numeral}`} aria-hidden="true">
              {c.numeral}
            </span>
            <h3 data-chapter-title data-chapter-item className={`display ${styles.title}`}>
              {c.title}
            </h3>
            <div data-chapter-body data-chapter-item>
              <ClaimText claim={c.body} className={styles.body} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
