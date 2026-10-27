"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EASE, gsap, ScrollTrigger, useMotion } from "@/animation";
import { useScrollLock } from "./useScrollLock";
import { brand, nav } from "@/content/site";
import { MountainMark } from "./MountainMark";
import { TransitionLink } from "./transition/TransitionLink";
import styles from "./Nav.module.css";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { reduced } = useMotion();
  useScrollLock(open || menuVisible);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    if (open) el.dataset.hidden = "false";
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const hide = self.direction === 1 && self.scroll() > 200;
        el.dataset.hidden = String(hide && !open);
        el.dataset.solid = String(self.scroll() > 40);
      },
    });
    return () => st.kill();
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  // Menu open / close choreography.
  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    if (open) {
      setMenuVisible(true);
      if (!el.open) el.showModal();
      gsap.set(el, { display: "grid" });
      if (reduced) {
        gsap.set(el, { clipPath: "inset(0 0 0% 0)" });
        gsap.set(q("[data-menu-link]"), { yPercent: 0 });
        gsap.set(q("[data-menu-meta]"), { autoAlpha: 1 });
        gsap.set(q("[data-menu-ridge] path"), { strokeDashoffset: 0 });
        (el.querySelector("a") as HTMLElement | null)?.focus({ preventScroll: true });
        return;
      }
      const tl = gsap.timeline();
      tl.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduced ? 0.2 : 1, ease: EASE.silk })
        .fromTo(q("[data-menu-link]"), { yPercent: 110 }, { yPercent: 0, stagger: 0.07, duration: 1.1 }, "-=0.45")
        .fromTo(q("[data-menu-meta]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, "-=0.8")
        .fromTo(q("[data-menu-ridge] path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, ease: EASE.drift }, 0.3);
      (el.querySelector("a") as HTMLElement | null)?.focus({ preventScroll: true });
      return () => {
        tl.kill();
      };
    }
    const closing = gsap.to(el, {
      clipPath: "inset(100% 0 0% 0)",
      duration: reduced ? 0.2 : 0.8,
      ease: EASE.silk,
      onComplete: () => {
        gsap.set(el, { display: "none" });
        setMenuVisible(false);
        if (el.open) {
          el.close();
          toggle.current?.focus({ preventScroll: true });
        }
      },
    });
    return () => { closing.kill(); };
  }, [open, reduced]);

  return (
    <>
      <header ref={header} className={styles.header} data-hidden="false" data-solid="false">
        <TransitionLink href="/" className={styles.logo} aria-label={`${brand.name} — home`}>
          <MountainMark className={styles.mark} />
          <span>{brand.name}</span>
        </TransitionLink>
        <nav className={styles.inline} aria-label="Primary">
          {nav.slice(1).map((item) => (
            <TransitionLink key={item.href} href={item.href} className={styles.link} aria-current={pathname === item.href ? "page" : undefined}>
              <span data-text={item.label}>{item.label}</span>
            </TransitionLink>
          ))}
        </nav>
        <button
          ref={toggle}
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="visually-hidden">{open ? "Close menu" : "Open menu"}</span>
          <span className={styles.bars} data-open={open} aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </header>

      <dialog ref={menu} id="site-menu" className={styles.menu} aria-label="Site menu" onCancel={(e) => { e.preventDefault(); setOpen(false); }}>
        <button className={styles.menuClose} onClick={() => setOpen(false)} aria-label="Close menu">Close <span aria-hidden="true">×</span></button>
        <svg data-menu-ridge className={styles.ridge} viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength={1} d="M0 260 L180 170 L300 220 L470 90 L600 160 L760 40 L900 150 L1050 100 L1200 190 L1360 80 L1600 230" />
        </svg>
        <nav aria-label="Menu">
          <ul className={styles.menuList}>
            {nav.map((item, i) => (
              <li key={item.href} className={styles.menuItem}>
                <TransitionLink href={item.href} data-menu-link className={styles.menuLink} onClick={() => setOpen(false)}>
                  <span className={styles.menuIndex}>0{i + 1}</span>
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>
        <div data-menu-meta className={styles.menuMeta}>
          <p className="eyebrow">{brand.category}</p>
          <p>{brand.responsibility}</p>
        </div>
      </dialog>
    </>
  );
}
