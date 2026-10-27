# Gamber Valley — Brand Website (pitch build)

Cinematic website for Gamber Valley Indian Single Malt Whisky, crafted by Alcobrew Distilleries India Limited in the spirit of Solan, Himachal Pradesh. *Born of Altitude. Refined by Attitude.*

Next.js 16.4 (App Router) · React 19.3 · GSAP 3.13 + ScrollTrigger + SplitText · Three.js r180 / React Three Fiber / Drei · Lenis.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck  # needs generated route types: run dev or build once first
npm test           # starts a temporary production server; run build first
node scripts/bake-assets.mjs   # regenerate emblem, fallbacks and label textures
node scripts/render-scenes.mjs # re-render the Himalayan scenes (needs `npm run dev` running and Chrome)
```

## Pages

| Route | Contents |
| --- | --- |
| `/` | Hero → Our Origin → Bottle Collection → Individual Bottle Showcase (Private Edition I) → Contact |
| `/story` | Our Story: four chapters (Solan, the monal, the rhododendron, the attitude) and the Philosophy section with the emblem |
| `/craft` | Our Craft: copper, barley and oak scenes with liquid-edge wipes and hotspots |
| `/whisky` | Our Whisky: the collection, then a dedicated 3D showcase for each expression |
| `/contact` | Contact: company and origin, enquiry form |
| `/collection` | Permanent redirect to `/whisky` |
| `/terms`, `/privacy`, `/responsible-drinking` | Preview notices, readable before age confirmation |

All copy and product data live in `src/content/site.ts`. Facts come from the brand; anything unconfirmed carries `verified: false` and a visible “Pending verification” tag. ABV, age statements and cask details are deliberately absent until verified.

## Sections and scroll choreography

| Section | File | Desktop | Phone / reduced motion |
| --- | --- | --- | --- |
| Hero | `sections/Hero.tsx` | Pinned dolly through five parallax ridges | Shorter parallax / fade |
| Origin / Story | `sections/Story.tsx` (takes `content`) | Pinned valley, chapters set in type | Sticky valley, chapters scroll over |
| Collection | `sections/Collection.tsx` | Two cards over one shared 3D scene; selection re-tints the room and lights the bottle | Same, stacked above the details |
| Showcase | `sections/BottleFeature.tsx` (takes `expression`) | Pinned: rise → turn → glide left with label close-up → glide right with cap close-up → ascend | Settled 3D bottle, drag to turn, stacked copy |
| Craft | `sections/Craft.tsx` | Pinned liquid-edge wipes between three scenes | Stacked scenes |
| Contact | `sections/Contact.tsx` | Closing landscape; compact invitation, or the form on `/contact` | Same, single column |

Scenes are authored with `useScene` (`src/animation`), which scopes, reverts and re-sorts pins into DOM order. Reveals that may be built while their layout is still hidden use `fromTo` with an explicit visible end state.

## 3D bottles (`src/three`)

Both bottles are modelled from the reference photographs, not generic shapes:

- `bottles/loft.ts` — a superellipse loft: each height has its own width, depth and squareness, which builds the flat Private Edition I decanter, the square-shouldered Vault Series bottle and round necks alike. Labels are surface-hugging patches.
- `bottles/designs.ts` — dimensions measured from the references (`scripts/measure-assets.mjs`). Hidden depths are marked as assumptions in comments.
- `bottles/GamberBottle.tsx` — glass, gradient liquid, real-artwork labels, the gold emblem decal, Private Edition I’s gold neck band, cork and flared stopper, and The Vault Series’ rose lattice capsule. If an expression is given a `model` (GLB), it replaces the procedural bottle.
- `Bottle.tsx` / `BottleStage.tsx` — the showcase choreography driven by scroll progress, close-ups, drag/touch rotation (`useDragRotate.ts`) and studio lighting tinted per expression.
- `CollectionStage.tsx` — both bottles in a single WebGL context, fitted to their cards every frame.
- `useTransmissionBackdrop.ts` — works around three.js clearing the refraction buffer to white on transparent canvases (otherwise clear glass reads milky).

Performance: canvases mount only when near the viewport and render only while visible; DPR is capped; `useQuality` drops to lighter glass and geometry on modest devices. Without WebGL2 (or after a GPU failure) the reference photographs stand in, driven by the same 2D choreography.

## Himalayan scenes

The age gate and the hero use a procedural Himalayan range (`src/three/himalaya`: shared terrain and light, the gate frames, the hero’s depth layers). It is rendered **ahead of time** by `scripts/render-scenes.mjs` (through the development-only page `/dev/scenes`) into `public/media/scenes/{landscape,portrait}`, so visitors download small images instead of computing anything: the gate appears with the first paint and the gate → hero transition is plain image crossfades. Re-run the script after changing the terrain, light or layer code.

## Brand assets

`public/media/brand` and `public/media/bottle` hold the supplied originals. `scripts/bake-assets.mjs` derives everything the site loads: the emblem (without its tagline line), the favicon, lightweight fallback photographs, and label textures (the Private Edition I label flattened from perspective, its neck band unrolled, the Vault label cut along its shaped edge, the capsule signature).

## Contact form

The enquiry form validates locally. It sends nothing unless `NEXT_PUBLIC_ENQUIRY_ENDPOINT` is set at build time; then it POSTs JSON (`name`, `email`, `type`, `message`) and confirms only on a 2xx response. Until then it says plainly that enquiries are not sent or stored. Connecting an endpoint requires updating the privacy notice.

## Before launch

- Supply company contact details (none are shown or invented), approved terms and privacy policies, and the brand’s responsibility statement.
- Verify the craft hotspot details (still tagged pending), and supply distillery photography for the craft scenes (`media` per scene in `site.ts`).
- Optional: accurate GLB models to replace the procedural bottles.
- Confirm label artwork: the Private Edition I neck band reads “CRAFTED IN HIMALCHAL, INDIA”; the emblem and neck band show “2002”, which the site copy does not use as a date.
- Remove `robots: noindex` in `src/app/layout.tsx`.

## Alcohol-marketing compliance notes (for legal review)

Concept-stage notes, not legal advice. Confirm with counsel for every market.

- **Age gate:** first visit; “remember me” is opt-in (otherwise session-only). Consider a date-of-birth and location gate if counsel requires it.
- **India:** direct and surrogate liquor advertising is restricted (Cable TV Networks Rules, ASCI code, CCPA guidelines), and some states prohibit alcohol. The site avoids price, purchase or “buy now” CTAs, health or performance claims, and any appeal to minors.
- **Responsibility messaging** appears in the gate, the footer and the menu.
