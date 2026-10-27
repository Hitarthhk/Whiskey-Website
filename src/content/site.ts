/**
 * All brand copy lives here so it can be edited without touching components.
 *
 * Everything below comes from information supplied by the brand. `verified:
 * false` marks any statement that reads as a production claim the brand has
 * not yet confirmed; those render with a visible "pending verification" tag.
 * No dates, awards, specifications or contact details have been invented —
 * ABV, age statements and cask details stay out of the interface until
 * verified.
 */

export type Claim = { text: string; verified: boolean };

export const brand = {
  name: "Gamber Valley",
  company: "Alcobrew Distilleries India Limited",
  category: "Indian Single Malt Whisky",
  tagline: "Born of Altitude. Refined by Attitude.",
  origin: "Solan, Himachal Pradesh, India",
  originShort: "Solan, Himachal Pradesh",
  philosophy: ["Patience", "Craftsmanship", "Authenticity"],
  identity: "Himalayan monal and rhododendron",
  emblem: { src: "/media/brand/gamber-valley-emblem.webp", width: 512, height: 640 },
  responsibility: "Enjoy responsibly. For adults of legal drinking age only.",
};

export const hero = {
  eyebrow: `${brand.category} · ${brand.originShort}`,
  headline: ["Born of Altitude.", "Refined by Attitude."] as const,
  sub: "An Indian single malt inspired by the Himalayan landscape and heritage of Solan.",
};

export type Chapter = { numeral: string; title: string; body: Claim };
export type ChapterSet = { intro: string; chapters: Chapter[] };

/** Homepage: the short origin story. */
export const origin: ChapterSet = {
  intro: "Our Origin",
  chapters: [
    {
      numeral: "I",
      title: "The Foothills",
      body: { text: "Gamber Valley begins in Solan, in the Himalayan foothills of Himachal Pradesh — a landscape of ridgelines, pine and mountain light.", verified: true },
    },
    {
      numeral: "II",
      title: "The Emblem",
      body: { text: "The Himalayan monal and the rhododendron stand at the heart of our identity: two emblems of the mountains that inspire every bottle.", verified: true },
    },
    {
      numeral: "III",
      title: "The Philosophy",
      body: { text: "Patience, craftsmanship and authenticity. The valley sets the pace, and the whisky is ready only when it is ready.", verified: true },
    },
  ],
};

/** Our Story page: the fuller account. */
export const story: ChapterSet = {
  intro: "Our Story",
  chapters: [
    {
      numeral: "I",
      title: "Solan",
      body: { text: "Our story is rooted in Solan, Himachal Pradesh, where the Himalayan foothills rise above the plains and the seasons are written in the hills.", verified: true },
    },
    {
      numeral: "II",
      title: "The Monal",
      body: { text: "The Himalayan monal, crowned and iridescent, appears on every Gamber Valley bottle — a mark of the altitude we are born of.", verified: true },
    },
    {
      numeral: "III",
      title: "The Rhododendron",
      body: { text: "Above the monals blooms the rhododendron, a flower of the high slopes and the second emblem of the Gamber Valley identity.", verified: true },
    },
    {
      numeral: "IV",
      title: "The Attitude",
      body: { text: `Patience, craftsmanship and authenticity guide everything we make. Gamber Valley is crafted by ${brand.company}.`, verified: true },
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

export const craft: { intro: string; heading: string; lede: string; scenes: CraftScene[] } = {
  intro: "Our Craft",
  heading: "From fire, grain and oak",
  lede: "Patience and craftsmanship, stage by stage. Scenes are illustrated until the distillery’s own photography and verified production details are supplied.",
  scenes: [
    {
      id: "copper",
      index: "01",
      title: "Copper & Fire",
      lede: "Where wash becomes spirit.",
      mediaNote: "Illustration — distillery photography to follow",
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
      mediaNote: "Illustration — barley photography to follow",
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
      mediaNote: "Illustration — warehouse photography to follow",
      hotspots: [
        { id: "cask", x: 34, y: 50, title: "Cask types", body: { text: "Cask types and previous fills to be confirmed.", verified: false } },
        { id: "climate", x: 68, y: 32, title: "Maturation", body: { text: "Maturation conditions and any age statements pending verification.", verified: false } },
      ],
    },
  ],
};

export type ShowcaseStep = { kicker: string; title: string; body: Claim };
export type ExpressionId = "private-edition-i" | "the-vault-series";

export type Expression = {
  id: ExpressionId;
  name: string;
  /** One line drawn from the supplied tasting notes. */
  descriptor: string;
  /** Liquid tone used for 2D glows. */
  liquid: string;
  /** Room tint while this expression is selected. */
  accent: string;
  /** Visual theme supplied by the brand. */
  theme: { name: string; colors: string[] };
  /** Reference photograph: lightweight fallback when WebGL is unavailable. */
  image: { src: string; alt: string; width: number; height: number };
  /** Optional accurate GLB. When present it replaces the procedural model. */
  model?: string;
  notes: { nose: string; palate: string; finish: string };
  /** Exactly three beats — the showcase choreography is timed to them. */
  showcase: [ShowcaseStep, ShowcaseStep, ShowcaseStep];
};

const supplied = (text: string): Claim => ({ text, verified: true });

export const expressions: Expression[] = [
  {
    id: "private-edition-i",
    name: "Private Edition I",
    descriptor: "Demerara, dates and dried ginger",
    liquid: "#b5621a",
    accent: "#0f3326",
    theme: { name: "Deep emerald, antique gold and amber", colors: ["#0f3326", "#b08a43", "#b5621a"] },
    image: { src: "/media/bottles/private-edition-i.webp", alt: "Gamber Valley Private Edition I decanter", width: 900, height: 1037 },
    notes: {
      nose: "Demerara sugar, dates, honey, vanilla, eucalyptus and lavender.",
      palate: "Rich malt, dried ginger and gentle spice.",
      finish: "Gentle warmth and lingering complexity.",
    },
    showcase: [
      { kicker: "Private Edition I", title: "Born of Altitude", body: supplied("An Indian single malt inspired by the Himalayan landscape and heritage of Solan.") },
      { kicker: "The Nose", title: "Demerara, dates and honey", body: supplied("Demerara sugar, dates, honey, vanilla, eucalyptus and lavender.") },
      { kicker: "Palate & Finish", title: "Rich malt, gentle spice", body: supplied("Rich malt, dried ginger and gentle spice, settling into gentle warmth and lingering complexity.") },
    ],
  },
  {
    id: "the-vault-series",
    name: "The Vault Series",
    descriptor: "Honey, chocolate and soft vanilla",
    liquid: "#7a1f2b",
    accent: "#331219",
    theme: { name: "Deep burgundy, muted rose, warm amber and gold", colors: ["#4a1420", "#c99299", "#c27a2c", "#c9a45c"] },
    image: { src: "/media/bottles/the-vault-series.webp", alt: "Gamber Valley The Vault Series bottle", width: 329, height: 1200 },
    notes: {
      nose: "Delicate malt and soft vanilla.",
      palate: "Honey, chocolate and subtle spice.",
      finish: "Long, refined, with honey and chocolate.",
    },
    showcase: [
      { kicker: "The Vault Series", title: "Refined by Attitude", body: supplied("Patience, craftsmanship and authenticity, held in reserve.") },
      { kicker: "The Nose", title: "Delicate malt, soft vanilla", body: supplied("Delicate malt and soft vanilla.") },
      { kicker: "Palate & Finish", title: "Honey and chocolate", body: supplied("Honey, chocolate and subtle spice, with a long, refined finish of honey and chocolate.") },
    ],
  },
];

export const expressionById = (id: ExpressionId) => expressions.find((e) => e.id === id)!;

export const collection = {
  intro: "Our Whisky",
  heading: "Two expressions",
  expressions,
};

export const contact = {
  intro: "Contact",
  heading: "Write to the valley",
  lede: "For trade, press and partnership enquiries about Gamber Valley.",
  enquiryTypes: ["General enquiry", "Trade & distribution", "Press & media", "Partnerships"],
  /** No address, email or phone has been supplied — none is shown. */
  pendingDetails: "Direct contact details will be published at launch.",
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/story", label: "Our Story" },
  { href: "/craft", label: "Our Craft" },
  { href: "/whisky", label: "Our Whisky" },
  { href: "/contact", label: "Contact" },
];

/** Pages readable before age confirmation. */
export const informationPages = ["/terms", "/privacy", "/responsible-drinking"];
