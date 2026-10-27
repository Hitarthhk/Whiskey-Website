"use client";

import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { EASE, gsap } from "./gsap";
import { useScene } from "./useScene";

type Props = {
  children: ReactNode;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
  className?: string;
  style?: CSSProperties;
  y?: number;
  delay?: number;
  /** Stagger direct children marked with data-reveal instead of the wrapper. */
  stagger?: number;
};

/** Quiet fade-and-rise used for supporting content. */
export function Reveal({ children, as = "div", className, style, y = 40, delay = 0, stagger }: Props) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as "div";

  useScene(ref, ({ reduce }, root) => {
    const items = stagger ? root.querySelectorAll("[data-reveal]") : [root];
    gsap.from(items, {
      autoAlpha: 0,
      y: reduce ? 0 : y,
      duration: reduce ? 0.6 : 1.3,
      ease: EASE.rise,
      delay,
      stagger: stagger ?? 0,
      scrollTrigger: { trigger: root, start: "top 85%", once: true },
    });
  });

  return (
    <Tag ref={ref as RefObject<HTMLDivElement>} className={className} style={style}>
      {children}
    </Tag>
  );
}
