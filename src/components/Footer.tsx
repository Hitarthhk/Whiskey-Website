import { brand, nav } from "@/content/site";
import { Emblem } from "./Emblem";
import { TransitionLink } from "./transition/TransitionLink";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <Emblem className={styles.mark} />
          <p className={`display ${styles.word}`}>{brand.name}</p>
          <p className="eyebrow">{brand.category}</p>
        </div>
        <nav aria-label="Footer" className={styles.links}>
          {nav.map((n) => (
            <TransitionLink key={n.href} href={n.href}>
              {n.label}
            </TransitionLink>
          ))}
        </nav>
      </div>
      <div className={styles.responsible}>
        <p>{brand.responsibility}</p>
        <p>Do not share this content with anyone under the legal drinking age. Never drink and drive.</p>
      </div>
      <div className={styles.legal}>
        <span>
          © {new Date().getFullYear()} {brand.company}. {brand.name} concept preview — 3D bottles are renderings built from reference photography, craft scenes are illustrations, and details marked pending await verification.
        </span>
        <span className={styles.legalLinks}>
          <TransitionLink href="/terms">Terms</TransitionLink>
          <TransitionLink href="/privacy">Privacy</TransitionLink>
          <TransitionLink href="/responsible-drinking">Responsible Drinking</TransitionLink>
        </span>
      </div>
    </footer>
  );
}
