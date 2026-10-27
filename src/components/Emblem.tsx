import { brand } from "@/content/site";

/** The official Gamber Valley emblem: two Himalayan monals beneath a rhododendron. */
export function Emblem({ className, label }: { className?: string; label?: string }) {
  const { src, width, height } = brand.emblem;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={width} height={height} alt={label ?? ""} aria-hidden={label ? undefined : true} className={className} style={{ height: "auto" }} decoding="async" />
  );
}
