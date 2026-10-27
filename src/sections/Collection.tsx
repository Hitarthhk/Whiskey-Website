"use client";

import { useEffect, useRef, useState } from "react";
import { EASE, gsap, SplitText, useMotion, useScene } from "@/animation";
import { BottleSVG } from "@/components/BottleSVG";
import { Button } from "@/components/Button";
import { collection, type Expression } from "@/content/site";
import styles from "./Collection.module.css";

/**
 * Two-bottle presentation. The pair stands side by side next to a details
 * panel; selecting a bottle re-tints the room, highlights it and re-sets the
 * details in type. With two expressions there is no horizontal overflow, so
 * the section scrolls naturally instead of pinning a track.
 */
export function Collection({ headingLevel = 2, showCta = true }: { headingLevel?: 1 | 2; showCta?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { ready, reduced, mobile } = useMotion();
  const cinematic = !ready || (!reduced && !mobile);
  const exp = collection.expressions[active];
  const Heading = headingLevel === 1 ? "h1" : "h2";

  // Arrival: the pair rises into place, then drifts gently with scroll for depth.
  useScene(ref, ({ motion }, root) => {
    if (!motion) return;
    const q = gsap.utils.selector(root);
    const stage = q("[data-stage]")[0];
    gsap.from(q("[data-card-item]"), {
      yPercent: 14,
      autoAlpha: 0,
      stagger: 0.14,
      duration: 1.4,
      ease: EASE.rise,
      scrollTrigger: { trigger: stage, start: "top 70%", once: true },
    });
    q<HTMLElement>("[data-card-bottle]").forEach((el, i) =>
      gsap.fromTo(el, { yPercent: 5 + i * 3 }, { yPercent: -5, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true } }),
    );
  });

  // Selection choreography: background tint + details re-set in type.
  useEffect(() => {
    const root = ref.current;
    const el = details.current;
    if (!root || !el) return;
    const tint = gsap.to(root, { "--accent": exp.accent, duration: reduced ? 0 : 1.4, ease: EASE.drift });
    if (reduced) return () => { tint.kill(); };
    const split = SplitText.create(el.querySelector("[data-name]"), { type: "words,chars", mask: "chars" });
    const tl = gsap.timeline();
    tl.from(split.chars, { yPercent: 110, stagger: 0.03, duration: 1.1 })
      .from(el.querySelectorAll("[data-detail]"), { autoAlpha: 0, y: 18, stagger: 0.06, duration: 0.9 }, 0.15);
    return () => {
      tl.revert();
      split.revert();
      tint.kill();
    };
  }, [active, exp.accent, reduced]);

  return (
    <section ref={ref} className={styles.section} data-mode={cinematic ? "cinematic" : "simple"} aria-labelledby="collection-title">
      <div data-stage className={styles.stage}>
        <div className={styles.glow} aria-hidden="true" style={{ background: `radial-gradient(closest-side, ${exp.liquid}40, transparent)` }} />
        <div ref={details} className={styles.details}>
          <p className="eyebrow">{collection.intro}</p>
          <Heading id="collection-title" className="visually-hidden">
            {collection.heading}
          </Heading>
          <h3 key={exp.id} data-name className={`display ${styles.name}`}>
            {exp.name}
          </h3>
          <p data-detail className={styles.descriptor}>
            {exp.descriptor}
          </p>
          <dl data-detail className={styles.notes}>
            {(["nose", "palate", "finish"] as const).map((k) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{exp.notes[k]}</dd>
              </div>
            ))}
          </dl>
          {showCta && (
            <div data-detail className={styles.ctas}>
              <Button href="/whisky" variant="solid">Discover</Button>
              <Button href="/contact">Enquire</Button>
            </div>
          )}
          <p className="visually-hidden" aria-live="polite">
            {exp.name} selected
          </p>
        </div>

        <div className={styles.pair}>
          <ul data-track className={styles.track} aria-label="Expressions">
            {collection.expressions.map((e, i) => (
              <li key={e.id} data-card-item className={styles.cardItem}>
                <Card expression={e} active={i === active} onSelect={() => setActive(i)} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Card({ expression, active, onSelect }: { expression: Expression; active: boolean; onSelect: () => void }) {
  const tilt = useRef<HTMLSpanElement>(null);
  const { touch, reduced } = useMotion();

  const onMove = (e: React.PointerEvent) => {
    if (touch || reduced || !tilt.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    gsap.to(tilt.current, { rotateY: nx * 28, rotateX: 4, duration: 0.8, ease: "power3" });
    gsap.to(tilt.current.querySelector("[data-highlight]"), { x: 60 + nx * 90, duration: 0.8, ease: "power3" });
  };
  const onLeave = () => tilt.current && gsap.to(tilt.current, { rotateY: 0, rotateX: 0, duration: 1.2, ease: "elastic.out(1,0.5)" });

  return (
    <button

      className={styles.card}
      data-active={active}
      aria-pressed={active}
      onClick={onSelect}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-cursor={active ? "Selected" : "Select"}
    >
      <span className={styles.cardStage} data-card-bottle>
        <span ref={tilt} className={styles.tilt}>
          <BottleSVG liquid={expression.liquid} className={styles.cardBottle} />
        </span>
      </span>
      <span className={styles.cardMeta}>
        <span className={`display ${styles.cardName}`}>{expression.name}</span>
        <span className={styles.cardSub}>{expression.descriptor}</span>
      </span>
    </button>
  );
}
