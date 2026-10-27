import type { Expression } from "@/content/site";
import styles from "./ProductImage.module.css";

/**
 * Reference photograph of a bottle — the lightweight fallback when WebGL is
 * unavailable. A sheen masked to the bottle’s own silhouette carries
 * [data-highlight], so the existing highlight sweeps still apply.
 */
export function ProductImage({ expression, className }: { expression: Expression; className?: string }) {
  const { src, alt, width, height } = expression.image;
  const mask = { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` };
  return (
    <span className={`${styles.wrap} ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" className={styles.img} />
      <span className={styles.sheen} style={mask} aria-hidden="true">
        <span data-highlight className={styles.bar} />
      </span>
    </span>
  );
}
