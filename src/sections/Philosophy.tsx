import { Reveal, SplitReveal } from "@/animation";
import { Emblem } from "@/components/Emblem";
import { brand } from "@/content/site";
import styles from "./Philosophy.module.css";

const pillars: Record<string, string> = {
  Patience: "The valley sets the pace. Nothing is hurried.",
  Craftsmanship: "Every stage is given the care and time it asks for.",
  Authenticity: "An Indian single malt inspired by the landscape and heritage of Solan.",
};

/** The brand’s philosophy and identity, set beside the emblem. */
export function Philosophy() {
  return (
    <section className={styles.section} aria-labelledby="philosophy-title">
      <Reveal className={styles.mark}>
        <Emblem className={styles.emblem} label={`${brand.name} emblem: two Himalayan monals beneath a rhododendron`} />
        <p className={styles.caption}>The {brand.identity}</p>
      </Reveal>
      <div className={styles.copy}>
        <p className="eyebrow">Our Philosophy</p>
        <SplitReveal id="philosophy-title" as="h2" type="words" className={`display ${styles.title}`}>
          {brand.tagline}
        </SplitReveal>
        <Reveal as="div" className={styles.pillars} stagger={0.12}>
          {brand.philosophy.map((p) => (
            <div key={p} data-reveal className={styles.pillar}>
              <h3 className="display">{p}</h3>
              <p>{pillars[p]}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
