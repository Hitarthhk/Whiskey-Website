"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { EASE, gsap, useMotion } from "@/animation";
import { useScrollLock } from "./useScrollLock";
import { brand, informationPages } from "@/content/site";
import { Emblem } from "./Emblem";
import { ScenePicture } from "./landscape/ScenePicture";
import styles from "./AgeGate.module.css";

const KEY = "gv-age-verified";
type Status = "checking" | "pending" | "denied" | "entered";

const GateContext = createContext(false);
/** True once the visitor has passed the age gate — intro animations wait for it. */
export const useEntered = () => useContext(GateContext);

function readVerified() {
  try {
    return localStorage.getItem(KEY) === "1" || sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Age-gate concept. Content is rendered (for SEO and no-JS) but kept inert and
 * covered until the visitor confirms. Final wording, legal age by market and
 * any geo-restriction logic must be confirmed with the brand's legal team.
 */
export function AgeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const informationPage = informationPages.includes(pathname);
  const [status, setStatus] = useState<Status>("checking");
  const [remember, setRemember] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const yesBtn = useRef<HTMLButtonElement>(null);
  const { reduced } = useMotion();
  const confirming = useRef(false);

  useEffect(() => {
    setStatus(readVerified() ? "entered" : "pending");
  }, []);

  const locked = status !== "entered" && !informationPage;
  useScrollLock(locked);

  useEffect(() => {
    if (status === "entered" && confirming.current) document.getElementById("main")?.focus({ preventScroll: true });
    if (status === "denied") root.current?.querySelector<HTMLElement>("#gate-title")?.focus({ preventScroll: true });
  }, [status]);

  useEffect(() => {
    if (!locked || status !== "pending" || !panel.current) return;
    const q = gsap.utils.selector(panel.current);
    if (reduced) { yesBtn.current?.focus({ preventScroll: true }); return; }
    const tl = gsap.timeline({ delay: 0.2 });
    tl.from(q("[data-gate-mark]"), { autoAlpha: 0, y: 20, duration: 1.6 })
      .from(q("[data-gate-item]"), { autoAlpha: 0, y: 24, stagger: 0.08, duration: 1.2 }, "-=1.1");
    yesBtn.current?.focus({ preventScroll: true });
    return () => {
      tl.revert();
    };
  }, [status, reduced, locked]);

  useEffect(() => {
    if (!locked) return;
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !root.current) return;
      const items = Array.from(root.current.querySelectorAll<HTMLElement>("button, input, a[href]"));
      const first = items[0], last = items[items.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !root.current.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !root.current.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [locked]);

  const confirm = () => {
    if (confirming.current) return;
    confirming.current = true;
    try {
      (remember ? localStorage : sessionStorage).setItem(KEY, "1");
    } catch {
      /* storage blocked — the visitor is simply asked again next time */
    }
    const el = root.current;
    if (!el || reduced) return setStatus("entered");
    // The question fades, the range brightens toward first light, then the
    // gateway dissolves into the hero waiting beneath it.
    gsap
      .timeline({ onComplete: () => setStatus("entered") })
      .to(el.querySelector("[data-gate-panel]"), { autoAlpha: 0, y: -24, duration: 0.8, ease: EASE.silk })
      .to(el.querySelector("[data-gate-dawn]"), { opacity: 1, duration: 2.2, ease: EASE.drift }, 0.35)
      .to(el.querySelector("[data-gate-scene]"), { scale: 1.06, duration: 3, ease: EASE.drift }, 0.35)
      .to(el, { autoAlpha: 0, duration: 1.1, ease: EASE.silk }, 2.1);
  };

  return (
    <GateContext.Provider value={status === "entered"}>
      <div inert={locked || undefined}>{children}</div>
      {locked && (
        <div ref={root} className={styles.gate} role="dialog" aria-modal="true" aria-labelledby="gate-title">
          {/* Pre-rendered midnight and first light (scripts/render-scenes.mjs): in the
              server HTML, so they load with the page; entry crossfades to dawn. */}
          <div data-gate-scene className={styles.scene} aria-hidden="true">
            <ScenePicture name="gate-night" priority />
            <div data-gate-dawn className={styles.dawn}>
              <ScenePicture name="gate-dawn" />
            </div>
            <div className={styles.mist}>
              <ScenePicture name="hero-fog-2" />
            </div>
          </div>
          <div className={styles.veil} aria-hidden="true" />
          {status !== "checking" && (
            <div ref={panel} className={styles.panel} data-gate-panel>
              <div data-gate-mark className={styles.mark}>
                <Emblem />
                <span className={styles.word}>{brand.name}</span>
              </div>

              {status === "pending" ? (
                <>
                  <p data-gate-item className="eyebrow">
                    {brand.category}
                  </p>
                  <h1 id="gate-title" data-gate-item className={`display ${styles.title}`}>
                    Are you of legal drinking age in your place of residence?
                  </h1>
                  <div data-gate-item className={styles.actions}>
                    <button ref={yesBtn} className={styles.btn} onClick={confirm}>
                      Yes, I am
                    </button>
                    <button className={`${styles.btn} ${styles.ghost}`} onClick={() => setStatus("denied")}>
                      No
                    </button>
                  </div>
                  <label data-gate-item className={styles.remember}>
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    Remember me on this device (do not tick on shared devices)
                  </label>
                  <p data-gate-item className={styles.legal}>
                    By entering you confirm you meet the minimum legal drinking age where you live.
                    Review our <a href="/terms">Terms</a> and <a href="/privacy">Privacy notice</a>. {brand.responsibility}
                  </p>
                </>
              ) : (
                <>
                  <h1 id="gate-title" tabIndex={-1} className={`display ${styles.title}`}>
                    Thank you for your honesty.
                  </h1>
                  <p className={styles.legal}>
                    This site is only for adults of legal drinking age. Please come back when you are able to join us.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </GateContext.Provider>
  );
}
