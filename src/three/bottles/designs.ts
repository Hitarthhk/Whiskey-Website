import { Color } from "three";
import type { ExpressionId } from "@/content/site";
import { cornerInset, curve, loft, sample, smoothstep, type Ring, type Section } from "./loft";

/**
 * Geometry for the two Gamber Valley bottles, measured from the supplied
 * reference photographs (see scripts/measure-assets.mjs). Units: the Vault
 * Series stands 2.74 tall; Private Edition I is proportioned from its label,
 * neck band and stopper. Each bottle stands on y = 0, centred on x/z.
 *
 * Where a photograph shows only one view, the hidden dimension is an
 * assumption and is marked as such.
 */

export type Placement = { width: number; y0: number; y1: number; offset: number };

export type BottleDesign = {
  id: ExpressionId;
  height: number;
  width: number;
  /** Uniform scale that frames each bottle at a similar visual weight. */
  display: number;
  section: (y: number) => Section;
  glass: (segments: number) => ReturnType<typeof loft>;
  liquid: (segments: number) => ReturnType<typeof loft>;
  label: Placement & { src: string };
  emblem: Placement;
  /** Heights the camera visits for close-ups. */
  focus: { label: number; cap: number };
  /** Rim and fill light tints drawn from the expression’s visual theme. */
  light: { key: string; rim: string; fill: string };
};

// ───────────────────────── Private Edition I ─────────────────────────
// A flat, pillowed decanter: rounded-rectangle front, softly rounded sides,
// gold neck band, ribbed glass collar over a cork, flared glass stopper.
const PE = { H: 1.12, a: 0.78, b: 0.3, r: 0.22, rb: 0.1, n: 4 };
// Depth (front-to-back) is not visible straight on; 0.6 is an assumption
// consistent with the side face seen in the three-quarter reference.

export const peSection = (y: number): Section => {
  const d = Math.min(y, PE.H - y);
  return { y, a: PE.a - cornerInset(d, PE.r), b: PE.b - cornerInset(d, PE.rb), n: PE.n };
};
const peLiquidSection = (y: number): Section => {
  const d = Math.min(y - 0.06, PE.H - 0.07 - y);
  return { y, a: PE.a - 0.035 - cornerInset(d, PE.r - 0.03), b: PE.b - 0.035 - cornerInset(d, PE.rb - 0.03), n: PE.n };
};
const cosSpaced = (radius: number, steps: number) => Array.from({ length: steps + 1 }, (_, k) => radius * (1 - Math.cos((k / steps) * (Math.PI / 2))));
const round = (y: number, r: number): Ring => ({ y, a: r, b: r, n: 2 });

function peGlass(segments: number) {
  const H = PE.H;
  const ends = cosSpaced(PE.r, 10);
  const ys = [...ends, ...[0.35, 0.5, 0.62, 0.75], ...ends.map((d) => H - d).reverse()];
  const body: Ring[] = [...new Set(ys.map((y) => +y.toFixed(5)))].sort((a, b) => a - b).map(peSection);
  body[body.length - 1] = { ...body[body.length - 1], crease: true };
  const collar: Ring[] = Array.from({ length: 21 }, (_, i) => {
    const t = i / 20;
    const ridge = Math.pow(Math.max(0, Math.sin(t * Math.PI * 4)), 0.7);
    return round(H + 0.27 + t * 0.17, 0.184 + ridge * 0.014);
  });
  const stopper: Ring[] = [
    round(H + 0.455, 0.152),
    round(H + 0.48, 0.156),
    round(H + 0.52, 0.178),
    round(H + 0.555, 0.214),
    round(H + 0.585, 0.25),
    { ...round(H + 0.603, 0.262), crease: true },
    { ...round(H + 0.622, 0.256), crease: true },
    round(H + 0.626, 0.236),
  ];
  return loft(
    [...body, { ...round(H, 0.18), crease: true }, round(H + 0.02, 0.18), round(H + 0.27, 0.18), ...collar, ...stopper],
    { segments },
  );
}

// Amber that glows lower in the decanter and deepens toward the shoulder.
const peAmber = new Color("#c0661a"), peDeep = new Color("#6e2a06");
function peLiquid(segments: number) {
  return loft(sample(peLiquidSection, 0.06, PE.H - 0.07, 28), { segments, color: (y) => peAmber.clone().lerp(peDeep, smoothstep(0.1, PE.H, y)) });
}

export const privateEdition: BottleDesign = {
  id: "private-edition-i",
  height: PE.H + 0.626,
  width: PE.a * 2,
  display: 1.32,
  section: peSection,
  glass: peGlass,
  liquid: peLiquid,
  label: { src: "/media/textures/pe-label.webp", width: 1.06, y0: 0.22, y1: 0.531, offset: 0.0025 },
  emblem: { width: 0.29, y0: 0.585, y1: 0.947, offset: 0.003 },
  focus: { label: 0.42, cap: PE.H + 0.32 },
  light: { key: "#ffe2b0", rim: "#2f8a64", fill: "#c9a45c" },
};
export const PE_PARTS = {
  neck: { r: 0.187, y0: PE.H + 0.012, y1: PE.H + 0.268 },
  cork: { r: 0.15, y0: PE.H + 0.24, y1: PE.H + 0.45 },
  liquidNeck: { r: 0.15, y0: PE.H - 0.08, y1: PE.H + 0.18 },
};

// ───────────────────────── The Vault Series ─────────────────────────
// A tall bottle with a square body, an S-curved shoulder flowing into a round
// neck with a bulge ring, a thick clear base and a rose capsule.
const PX = 2.75 / 1495; // reference pixels → units
const V = { body: 1.784, a: 201.5 * PX, ratio: 0.86, n: 8, base: 0.06 };
// The body’s depth is hidden in the front view; 0.86 × its width is an
// assumption that keeps the square character visible as it turns.
const shoulder = curve(
  ([[540, 201.5], [525, 199.5], [510, 193], [495, 182], [480, 159], [465, 120.5], [450, 93.5], [435, 87], [420, 88.5], [405, 92.5],
    [390, 95.5], [375, 94], [360, 90.5], [345, 87], [330, 84], [315, 81], [300, 79], [285, 77], [270, 76]] as [number, number][])
    .map(([py, hw]) => [(1510 - py) * PX, hw * PX] as [number, number]),
);

export const vaultSection = (y: number): Section => {
  if (y <= V.body) {
    const inset = cornerInset(y, V.base);
    return { y, a: V.a - inset, b: V.a * V.ratio - inset, n: V.n };
  }
  const hw = shoulder(y);
  const t = smoothstep(V.body + 0.02, 1.96, y);
  return { y, a: hw, b: hw * (V.ratio + (1 - V.ratio) * t), n: V.n + (2 - V.n) * t };
};
const vaultLiquidSection = (y: number): Section => {
  const s = vaultSection(y);
  return { ...s, a: s.a - 0.022, b: s.b - 0.022 };
};

function vaultGlass(segments: number) {
  const rings: Ring[] = [
    ...cosSpaced(V.base, 8).map(vaultSection),
    ...sample(vaultSection, 0.2, V.body, 8),
    ...sample(vaultSection, V.body + 0.014, 2.3, 34),
  ];
  return loft(rings, { segments });
}

// Warm amber at the base deepening to burgundy at the shoulder, as in the reference.
const amber = new Color("#c4661c"), red = new Color("#86202a"), burgundy = new Color("#4a0d18");
function vaultLiquid(segments: number) {
  const colour = (y: number) => {
    const t = smoothstep(0.2, 1.7, y);
    return t < 0.5 ? amber.clone().lerp(red, t * 2) : red.clone().lerp(burgundy, (t - 0.5) * 2);
  };
  return loft([...sample(vaultLiquidSection, 0.19, V.body, 10), ...sample(vaultLiquidSection, V.body + 0.014, 2.17, 16)], { segments, color: colour });
}

export const vaultSeries: BottleDesign = {
  id: "the-vault-series",
  height: 2.742,
  width: V.a * 2,
  display: 1,
  section: vaultSection,
  glass: vaultGlass,
  liquid: vaultLiquid,
  label: { src: "/media/textures/vault-label.webp", width: 290 * PX, y0: (1510 - 1312) * PX, y1: (1510 - 768) * PX, offset: 0.002 },
  emblem: { width: 0.29, y0: (1510 - 784) * PX, y1: (1510 - 784) * PX + 0.3625, offset: 0.0035 },
  focus: { label: 0.86, cap: 2.5 },
  light: { key: "#ffd9b0", rim: "#c9707f", fill: "#c27a2c" },
};
export const VAULT_PARTS = {
  lower: { r: 0.137, y0: 2.27, y1: 2.502 },
  upper: { r: 0.168, y0: 2.502, y1: 2.715 },
  top: 2.742,
};

export const designs: Record<ExpressionId, BottleDesign> = {
  "private-edition-i": privateEdition,
  "the-vault-series": vaultSeries,
};
