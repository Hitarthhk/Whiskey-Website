/**
 * All brand copy lives here so it can be edited without touching components.
 *
 * `verified: false` marks any statement that reads as a factual production
 * claim. These render with a small "pending verification" tag and must be
 * confirmed by Gamber Valley before launch. Product names and specifications
 * are deliberately placeholders — none have been invented.
 */

export type Claim = { text: string; verified: boolean };

export const brand = {
  name: "Gamber Valley",
  category: "Indian Single Malt Whisky",
  tagline: "Born in the Himalayas",
  responsibility: "Enjoy responsibly. For adults of legal drinking age only.",
};

export const hero = {
  eyebrow: "Indian Single Malt Whisky",
  headline: "Born in the Himalayas",
  sub: "An expedition into altitude, patience and light.",
};

export const bottleFeature = {
  steps: [
    {
      kicker: "The Spirit",
      title: "Shaped by altitude",
      body: { text: "A single malt that carries the mountain air in every measure — cool nights, warm days, and time.", verified: false },
    },
    {
      kicker: "The Character",
      title: "Gold, drawn from the valley",
      body: { text: "Colour, nose and finish to be described by the master blender. Placeholder copy.", verified: false },
    },
    {
      kicker: "The Vessel",
      title: "Crafted to be kept",
      body: { text: "Bottle design shown is a conceptual 3D placeholder until final packaging assets are supplied.", verified: true },
    },
  ],
};

export const story = {
  intro: "Our Story",
  chapters: [
    {
      numeral: "I",
      title: "The Source",
      body: { text: "High above the plains, snowmelt gathers into streams that feed the valley below. Here the story begins.", verified: false },
    },
    {
      numeral: "II",
      title: "The Climate",
      body: { text: "Mountain seasons swing between extremes, and the spirit answers each one as it rests in oak.", verified: false },
    },
    {
      numeral: "III",
      title: "The Patience",
      body: { text: "Nothing here is hurried. The valley sets the pace, and the whisky is ready only when it is ready.", verified: false },
    },
  ],
};

export type Hotspot = { id: string; x: number; y: number; title: string; body: Claim };
export type CraftScene = {
  id: "copper" | "grain" | "oak";
  index: string;
  title: string;
  lede: string;
  /** Path to supplied photography / video. Empty → art-directed placeholder. */
  media?: string;
  mediaNote: string;
  hotspots: Hotspot[];
};

export const craft: { intro: string; scenes: CraftScene[] } = {
  intro: "Craftsmanship",
  scenes: [
    {
      id: "copper",
      index: "01",
      title: "Copper & Fire",
      lede: "Where wash becomes spirit.",
      mediaNote: "Placeholder — cinematic close-up of copper pot stills",
      hotspots: [
        { id: "pot", x: 38, y: 58, title: "Pot still", body: { text: "Still type, count and capacity to be confirmed by the distillery.", verified: false } },
        { id: "neck", x: 62, y: 26, title: "Swan neck", body: { text: "Neck shape influences reflux and spirit character. Specifics pending.", verified: false } },
      ],
    },
    {
      id: "grain",
      index: "02",
      title: "Malted Barley",
      lede: "The single grain at the heart of a single malt.",
      mediaNote: "Placeholder — macro photography of malted barley",
      hotspots: [
        { id: "barley", x: 46, y: 44, title: "The grain", body: { text: "Barley origin and malting details to be supplied.", verified: false } },
        { id: "water", x: 72, y: 70, title: "Mountain water", body: { text: "Water source description pending brand verification.", verified: false } },
      ],
    },
    {
      id: "oak",
      index: "03",
      title: "Oak & Time",
      lede: "The valley’s climate works on every cask.",
      mediaNote: "Placeholder — warehouse of resting oak casks",
      hotspots: [
        { id: "cask", x: 34, y: 50, title: "Cask types", body: { text: "Cask types and previous fills to be confirmed.", verified: false } },
        { id: "climate", x: 68, y: 32, title: "Maturation", body: { text: "Maturation conditions and any age statements pending verification.", verified: false } },
      ],
    },
  ],
};

export type Expression = {
  id: string;
  name: string;
  descriptor: string;
  liquid: string;
  accent: string;
  /** Path to a supplied GLB model. When present the card upgrades to real 3D rotation. */
  model?: string;
  notes: { nose: string; palate: string; finish: string };
  specs: { label: string; value: string }[];
};

const pendingNotes = {
  nose: "To be supplied by the master blender.",
  palate: "To be supplied by the master blender.",
  finish: "To be supplied by the master blender.",
};
const pendingSpecs = [
  { label: "ABV", value: "TBC" },
  { label: "Volume", value: "TBC" },
  { label: "Cask", value: "TBC" },
];

export const collection: { intro: string; expressions: Expression[] } = {
  intro: "The Collection",
  expressions: [
    { id: "exp-1", name: "Expression I", descriptor: "Name pending", liquid: "#c7852b", accent: "#173027", notes: pendingNotes, specs: pendingSpecs },
    { id: "exp-2", name: "Expression II", descriptor: "Name pending", liquid: "#a85e1c", accent: "#2a2116", notes: pendingNotes, specs: pendingSpecs },
    { id: "exp-3", name: "Expression III", descriptor: "Name pending", liquid: "#8a3f16", accent: "#2b1714", notes: pendingNotes, specs: pendingSpecs },
    { id: "exp-4", name: "Expression IV", descriptor: "Name pending", liquid: "#d39a3e", accent: "#1d2a2c", notes: pendingNotes, specs: pendingSpecs },
  ],
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/story", label: "Our Story" },
  { href: "/craft", label: "Craftsmanship" },
  { href: "/collection", label: "Collection" },
];
