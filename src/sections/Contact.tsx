"use client";

import { useRef } from "react";
import { gsap, SplitReveal, useScene } from "@/animation";
import { Button } from "@/components/Button";
import { Landscape } from "@/components/landscape/Landscape";
import { dawn } from "@/components/landscape/palettes";
import { brand, contact } from "@/content/site";
import styles from "./Contact.module.css";

/**
 * Contact, framed by the closing range at first light. The compact variant
 * closes the homepage with an invitation; the full variant hosts the
 * enquiry form on the Contact page.
 */
export function Contact({ title = contact.heading, children }: { title?: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const full = Boolean(children);

  // Ridges settle as the visitor arrives — the same move as the closing frame.
  useScene(ref, ({ motion }, root) => {
    if (!motion) return;
    const q = gsap.utils.selector(root);
    q<HTMLElement>("[data-layer]").forEach((el) => {
      const d = Number(el.dataset.depth);
      gsap.fromTo(el, { yPercent: d * 18 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom bottom", scrub: true } });
    });
  });

  return (
    <section ref={ref} className={styles.section} data-variant={full ? "full" : "compact"} aria-labelledby="contact-title">
      <Landscape palette={dawn} id="contact" clouds={false} />
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className="eyebrow">{contact.intro}</p>
          <SplitReveal id="contact-title" as="h2" type="words" className={`display ${styles.title}`}>
            {title}
          </SplitReveal>
          <p className={styles.lede}>{contact.lede}</p>
          <dl className={styles.facts}>
            <div>
              <dt>Crafted by</dt>
              <dd>{brand.company}</dd>
            </div>
            <div>
              <dt>Origin</dt>
              <dd>{brand.origin}</dd>
            </div>
          </dl>
          <p className={styles.pending}>{contact.pendingDetails}</p>
          {!full && (
            <div className={styles.ctas}>
              <Button href="/contact" variant="solid" cursor="Write">
                Make an Enquiry
              </Button>
              <Button href="/whisky">Our Whisky</Button>
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
