# Gamber Valley — Immersive Website Concept

Cinematic concept site for Gamber Valley Indian Single Malt Whisky.
Next.js 16.4 (App Router) · React 19.3 · GSAP 3.13 + ScrollTrigger + SplitText · Three.js / React Three Fiber / Drei · Lenis.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run typecheck
npm test          # starts a temporary production server; run build first
```

## Experience map (homepage)

| Scene | File | Desktop | Phone / reduced motion |
| --- | --- | --- | --- |
| Age gate | `components/AgeGate.tsx` | Modal; page is `inert` until confirmed | same |
| Hero, "Born in the Himalayas" | `sections/Hero.tsx` | Pinned camera dolly through 5 parallax ridges, fog flood, pointer parallax | Shorter un-pinned parallax / static |
| Bottle | `sections/BottleFeature.tsx`, `three/*` | Pinned; 3D bottle rises from the fog, turns, glides left/right, ascends | SVG bottle + stacked copy |
| Our Story | `sections/Story.tsx` | Pinned; camera trucks across the valley; 3 chapters set in type | Sticky valley, chapters scroll over it |
| Craftsmanship | `sections/Craft.tsx` | Pinned; liquid-edge wipes between 3 scenes, camera push, hotspots | Stacked scenes, liquid reveal on enter |
| Collection | `sections/Collection.tsx` | Pinned horizontal track; selection re-tints the room | Native swipe carousel |
| Closing | `sections/Closing.tsx` | Ridges settle as you arrive | same |

Inner routes (`/story`, `/craft`, `/collection`) reuse the same sections behind a `PageIntro`.

## Animation system (`src/animation`)

- `useScene(ref, (conditions, root) => …)` is the only way scenes are authored. It wraps `useGSAP` and `gsap.matchMedia`, so every scene is scoped, reverts on unmount, rebuilds on breakpoint or reduced-motion changes, and gets `{ motion, reduce, desktop, mobile, fine }`. After any scene changes, triggers are re-sorted into DOM order and refreshed, so pins never overlap.
- `EASE.silk / rise / drift` are the only three eases used.
- Components: `SplitReveal` (masked chars, words or lines), `Reveal`, `Parallax`, `Magnetic`, `liquidClip()`.
- Site chrome: `Cursor` (fine pointers only, `data-cursor="Label"` opt-in), `TransitionProvider` / `TransitionLink` (ridge wipe with a brief Three.js camera push through layered ridges on capable desktops; back and forward stay native), `Nav` (hide on scroll, native modal menu with focus containment).
- `SmoothScroll`: Lenis smooths the wheel only. Native scroll position, keyboard, find-in-page and history restoration are preserved. It is disabled on touch devices and for reduced motion.

Development uses `.next-dev`, while production uses `.next`, so their manifests do not overwrite one another. Builds use `next/font/google` and need access to Google Fonts. `npm test` exercises all seven routes and 404 handling against a real production server. Browser interaction and GPU checks remain separate from these HTTP tests.

The `/terms`, `/privacy`, and `/responsible-drinking` pages are available before age confirmation. They describe the preview and its actual storage behavior; the brand must still supply approved operator details and launch policies. `noindex` remains enabled, and production assets and unverified claims remain explicitly marked.

## Placeholders to replace

Everything that is not real brand material is visibly labelled on the page.

| Placeholder | Where | Replace with |
| --- | --- | --- |
| Procedural mountain ridges | `components/landscape` | Masked photo plates per layer (keep `data-layer` / `data-depth`) |
| Lathe-built 3D bottle and canvas label | `three/Bottle.tsx`, `three/profile.ts` | Final bottle GLB (Draco/Meshopt compressed, about 2 MB or less) |
| SVG bottle | `components/BottleSVG.tsx` | Product renders (AVIF/WebP) |
| Craft illustrations | `components/craft/CraftArt.tsx` | Set `media` per scene in `content/site.ts` (image or MP4/WebM) |
| Expressions I–IV | `content/site.ts` → `collection` | Real names, notes and specs; add `model` for GLB rotation |
| Mountain mark logo | `components/MountainMark.tsx` | Official logo SVG |

All copy lives in `src/content/site.ts`. Claims with `verified: false` show a "Pending verification" tag until the brand confirms them.

## Alcohol-marketing compliance notes (for legal review)

These are concept-stage notes, not legal advice. Confirm each one with counsel for every market the site targets.

- **Age gate:** shown on first visit; "remember me" is opt-in (otherwise session-only). Legal drinking age differs by Indian state and by country, so consider a DOB plus location gate if counsel requires it.
- **India:** direct and surrogate liquor advertising is restricted (Cable TV Networks Rules, ASCI code, CCPA guidelines on surrogate ads), and some states prohibit alcohol. The site therefore avoids price, purchase or "buy now" CTAs, health or performance claims, and any appeal to minors. Geo-messaging or blocking for prohibition states may be required.
- **Responsibility messaging** appears in the gate, the footer and the menu. Wording should follow the brand's chosen code (e.g. ASCI, Portman Group, DISCUS for export markets).
- `robots: noindex` is set while the site is a concept. Remove it at launch.

## Performance and accessibility

- The WebGL canvas loads lazily (`next/dynamic`, `ssr:false`), renders only while on screen, caps DPR at 1.75, and uses procedural lighting with no HDR download. Low-power devices get a non-transmissive glass material.
- Landscapes are single SVG paths per layer, animated with transforms only.
- Reduced motion turns pins and scrubs into simple fades and turns off Lenis and the ambient drift. Hotspots, menu and gate are keyboard operable with Escape to close; a skip link and semantic headings are included; collection cards scroll the pinned track into view on keyboard focus.
