"use client";

import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { WebGLBoundary } from "../WebGLBoundary";
import { EASE, gsap, useMotion } from "@/animation";
import { Emblem } from "../Emblem";
import styles from "./Transition.module.css";

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });
const TransitionTerrain = dynamic(() => import("@/three/TransitionTerrain"), { ssr: false });
export const usePageTransition = () => useContext(TransitionContext);

/**
 * Mountain-ridge wipe between routes. The ridge panel rises to cover the page,
 * the route changes underneath, then it continues upward to reveal the new page.
 * Back/forward navigation is never intercepted — it stays instant and native.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { reduced, ready, webgl, mobile, touch } = useMotion();
  const [active, setActive] = useState(false);
  const progress = useRef(0);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const pending = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string) => {
      if (busy.current || href === pathname) return;
      const el = panel.current;
      if (!el) return router.push(href);
      busy.current = true;
      setActive(true);
      progress.current = 0;
      gsap.to(progress, { current: 0.5, duration: reduced ? 0.2 : 1.1, ease: EASE.silk });
      pending.current = href;
      watchdog.current = setTimeout(() => {
        if (panel.current) {
          gsap.killTweensOf(panel.current);
          gsap.set(panel.current, { display: "none" });
        }
        gsap.killTweensOf(progress);
        pending.current = null;
        busy.current = false;
        setActive(false);
      }, 8000);
      gsap.killTweensOf(el.querySelector("[data-mark]"));
      gsap.set(el, { display: "block", yPercent: reduced ? 0 : 100, opacity: reduced ? 0 : 1 });
      gsap.to(el, {
        yPercent: 0,
        opacity: 1,
        duration: reduced ? 0.25 : 1,
        ease: EASE.silk,
        onComplete: () => router.push(href),
      });
      gsap.fromTo(el.querySelector("[data-mark]"), { autoAlpha: 0, y: reduced ? 0 : 20 }, { autoAlpha: 1, y: 0, delay: reduced ? 0 : 0.5, duration: reduced ? 0.2 : 0.8 });
    },
    [pathname, reduced, router],
  );

  useEffect(() => {
    const el = panel.current;
    if (!el || !pending.current) return;
    if (watchdog.current) clearTimeout(watchdog.current);
    pending.current = null;
    window.scrollTo(0, 0);
    gsap.to(el.querySelector("[data-mark]"), { autoAlpha: 0, duration: 0.4 });
    gsap.to(progress, { current: 1, duration: 1.1, ease: EASE.silk });
    gsap.to(el, {
      yPercent: reduced ? 0 : -100,
      opacity: reduced ? 0 : 1,
      duration: reduced ? 0.25 : 1.1,
      delay: 0.15,
      ease: EASE.silk,
      onComplete: () => {
        gsap.set(el, { display: "none" });
        busy.current = false;
        setActive(false);
        document.getElementById("main")?.focus({ preventScroll: true });
      },
    });
  // Navigation completion depends on the route, not a preference changing mid-wipe.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => () => {
    if (watchdog.current) clearTimeout(watchdog.current);
    gsap.killTweensOf(progress);
    if (panel.current) {
      gsap.killTweensOf(panel.current);
      gsap.killTweensOf(panel.current.querySelector("[data-mark]"));
    }
  }, []);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div ref={panel} className={styles.panel} aria-hidden="true">
        <svg className={`${styles.ridge} ${styles.top}`} viewBox="0 0 1600 160" preserveAspectRatio="none">
          <path d="M0 160 L0 120 L140 70 L260 110 L420 30 L520 80 L640 50 L800 0 L930 60 L1060 40 L1200 100 L1330 50 L1480 90 L1600 60 L1600 160 Z" />
        </svg>
        <div className={styles.fill}>
          {active && ready && webgl && !reduced && !mobile && !touch && (
            <div className={styles.terrain}><WebGLBoundary fallback={null}><TransitionTerrain progress={progress} /></WebGLBoundary></div>
          )}
          <div data-mark className={styles.mark}>
            <Emblem />
          </div>
        </div>
        <svg className={`${styles.ridge} ${styles.bottom}`} viewBox="0 0 1600 160" preserveAspectRatio="none">
          <path d="M0 0 L1600 0 L1600 60 L1460 110 L1320 70 L1180 140 L1040 90 L900 120 L760 60 L600 130 L460 80 L320 120 L160 70 L0 110 Z" />
        </svg>
      </div>
    </TransitionContext.Provider>
  );
}
