"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { EASE, gsap, ScrollTrigger, SplitText, useLenis, useMotion, useScene } from "@/animation";
import { BottleSVG } from "@/components/BottleSVG";
import { Button } from "@/components/Button";
import { collection, type Expression } from "@/content/site";
import styles from "./Collection.module.css";

const ProductModel = dynamic(() => import("@/three/ProductModel"), { ssr: false });

/**
 * Horizontal gallery. On desktop vertical scroll drives the track while the
 * details panel stays put; on phones it is a native swipe carousel.
 * Selecting a bottle re-tints the room and re-sets the details in type.
 */
export function Collection({ headingLevel = 2, showCta = true }: { headingLevel?: 1 | 2; showCta?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pin = useRef<{ st: ScrollTrigger; track: HTMLElement; distance: () => number } | null>(null);
  const lenis = useLenis();
  const { ready, reduced, mobile } = useMotion();
  const cinematic = !ready || (!reduced && !mobile);
  const exp = collection.expressions[active];
  const Heading = headingLevel === 1 ? "h1" : "h2";

  useScene(ref, ({ motion, desktop }, root) => {
    if (!(motion && desktop)) return;
    const q = gsap.utils.selector(root);
    const track = q<HTMLElement>("[data-track]")[0];
    const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: q("[data-stage]")[0],
        start: "top top",
        end: () => `+=${distance()}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    pin.current = { st: tween.scrollTrigger!, track, distance };
    // Cards drift at slightly different rates for depth.
    q<HTMLElement>("[data-card-bottle]").forEach((el, i) =>
      gsap.fromTo(el, { yPercent: 6 + (i % 2) * 4 }, { yPercent: -6, ease: "none", scrollTrigger: { trigger: q("[data-stage]")[0], start: "top top", end: () => `+=${distance()}`, scrub: true } }),
    );
    return () => (pin.current = null);
  });

  // Keyboard focus on a card scrolls the page to the point where the pinned track shows it.
  const reveal = (card: HTMLElement) => {
    const p = pin.current;
    if (!p) return;
    const li = card.parentElement as HTMLElement;
    const offset = li.offsetLeft - (p.track.clientWidth - li.offsetWidth) / 2;
    const y = p.st.start + Math.min(p.distance(), Math.max(0, offset));
    if (Math.abs(window.scrollY - y) > 2) (lenis ? lenis.scrollTo(y, { duration: 0.9 }) : window.scrollTo({ top: y }));
  };

  // Selection choreography: background tint + details re-set in type.
  useEffect(() => {
    const root = ref.current;
    const el = details.current;
    if (!root || !el) return;
    const tint = gsap.to(root, { "--accent": exp.accent, duration: reduced ? 0 : 1.4, ease: EASE.drift });
    if (reduced) return () => { tint.kill(); };
    const split = SplitText.create(el.querySelector("[data-name]"), { type: "chars", mask: "chars" });
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
        <div className={styles.glow} aria-hidden="true" style={{ background: `radial-gradient(closest-side, ${exp.liquid}33, transparent)` }} />
        <div ref={details} className={styles.details} aria-live="polite">
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
              <Button href="/story">Our Story</Button>
            </div>
          )}
        </div>

        <ul data-track className={styles.track} aria-label="Expressions">
          {collection.expressions.map((e, i) => (
            <li key={e.id} className={styles.cardItem}>
              <Card expression={e} active={i === active} onSelect={() => setActive(i)} onFocus={reveal} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Card({ expression, active, onSelect, onFocus }: { expression: Expression; active: boolean; onSelect: () => void; onFocus: (el: HTMLElement) => void }) {
  const tilt = useRef<HTMLSpanElement>(null);
  const { touch, reduced } = useMotion();

  // Pointer-driven tilt: a stand-in for model rotation until GLBs exist.
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
      onFocus={(e) => e.currentTarget.matches(":focus-visible") && onFocus(e.currentTarget)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-cursor={active ? "Selected" : "Select"}
    >
      <span className={styles.cardStage} data-card-bottle>
        {expression.model ? (
          <ProductModel src={expression.model} className={styles.model} />
        ) : (
          <span ref={tilt} className={styles.tilt}>
            <BottleSVG liquid={expression.liquid} className={styles.cardBottle} />
          </span>
        )}
      </span>
      <span className={styles.cardMeta}>
        <span className={`display ${styles.cardName}`}>{expression.name}</span>
        <span className={styles.cardSub}>{expression.descriptor}</span>
      </span>
    </button>
  );
}
