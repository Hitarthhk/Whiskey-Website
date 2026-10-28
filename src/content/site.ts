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

/** A chapter heading: the plain lead-in, then the phrase set in italic. */
export type StoryHeading = { numeral: string; label: string; lead: string; emphasis: string };
export type Quote = { text: string; name: string; role: string };
export type EmblemPartId = "flower" | "monals" | "tails" | "wordmark";
/** Ellipses over the emblem image (fractions of its width/height). */
export type EmblemRegion = { cx: number; cy: number; rx: number; ry: number };
export type EmblemPart = { id: EmblemPartId; index: string; title: string; body: Claim; regions: EmblemRegion[] };
export type Principle = { index: string; title: string; body: string };

/** Our Story page: supplied by the brand. Facts flagged for editorial review
 * are listed in docs/assets/our-story.md; two emblem descriptions are drafts
 * and render with the pending tag until approved. */
export const ourStory = {
  opening: {
    eyebrow: "Our Story",
    title: "Rooted in Solan",
    lede: "Our story is rooted in Solan, Himachal Pradesh, where the Himalayan foothills rise above the plains and the seasons are written in the hills.",
  },
  valley: {
    heading: { numeral: "I", label: "The Valley", lead: "Solan, in the", emphasis: "Shivalik foothills." } satisfies StoryHeading,
    body: [
      "Solan lies in the lower Himalaya of Himachal Pradesh, where the Shivalik range — the outermost foothills — begins to climb toward the snow.",
      "The distillery stands on the banks of the River Gamber, which gives the valley and the whisky their name. Pine-covered ridges rise on every side; summers are warm, winters cold and clear.",
    ],
  },
  beginning: {
    heading: { numeral: "II", label: "The Beginning", lead: "Built to last,", emphasis: "not to spike." } satisfies StoryHeading,
    body: [
      `Gamber Valley is the single malt of ${brand.company}, and the company's first step into luxury spirits. It was conceived as an Indian single malt with a clear sense of where it comes from — distilled, matured and bottled in one place.`,
      "The house is in no hurry. The first expressions have been released in a small number of states, with others to follow in phases.",
    ],
    quotes: [
      { text: "Every generation has a window to build something that outlasts it.", name: "Romesh Pandita", role: "Chairman & Managing Director, Alcobrew Distilleries India" },
      { text: "A brand built to last, not to spike.", name: "Ashutosh Rajput", role: "Chief Operating Officer, Alcobrew Distilleries India" },
    ] satisfies Quote[],
  },
  landscape: {
    heading: { numeral: "III", label: "The Landscape", lead: "Ridge, cloud,", emphasis: "forest, snow." } satisfies StoryHeading,
    /** The supplied paragraph, set one statement per scene. */
    statements: [
      { figure: "20–33°C", caption: "Summer days", text: "Summer days in Solan reach 20 to 33°C;" },
      { figure: "0–5°C", caption: "Winter nights", text: "winter nights fall to between 0 and 5°C." },
      { figure: "Barley & water", caption: "From the plains and the mountains", text: "Six-row barley comes from Rajasthan and Haryana, two-row from abroad, and the water from the mountains." },
    ],
  },
  emblem: {
    heading: { numeral: "IV", label: "The Emblem", lead: "A pair of monals,", emphasis: "crowned by a flower." } satisfies StoryHeading,
    body: "The Himalayan monal is a pheasant of the high forests and meadows, its plumage iridescent copper, emerald and violet. It inspired the Gamber Valley emblem. Explore its parts below.",
    parts: [
      { id: "flower", index: "01", title: "The Flower",
        body: { text: "Above the monals blooms the rhododendron, a flower of the high slopes and the second emblem of the Gamber Valley identity.", verified: true },
        regions: [{ cx: 0.5, cy: 0.17, rx: 0.21, ry: 0.19 }] },
      { id: "monals", index: "02", title: "Twin Monals",
        body: { text: "Two Himalayan monals, facing one another, their crests raised.", verified: true },
        regions: [{ cx: 0.19, cy: 0.55, rx: 0.2, ry: 0.27 }, { cx: 0.81, cy: 0.55, rx: 0.2, ry: 0.27 }] },
      { id: "tails", index: "03", title: "Crossed Tails",
        body: { text: "Beneath the pair, the monals' long tails sweep down and cross, closing the emblem at its base.", verified: false },
        regions: [{ cx: 0.5, cy: 0.83, rx: 0.33, ry: 0.17 }] },
      { id: "wordmark", index: "04", title: "The Wordmark",
        body: { text: "The name Gamber Valley is set between the two birds, beneath the flower.", verified: false },
        regions: [{ cx: 0.5, cy: 0.49, rx: 0.26, ry: 0.085 }] },
    ] satisfies EmblemPart[],
  },
  philosophy: {
    heading: { numeral: "V", label: "The Philosophy", lead: "Place, craft,", emphasis: "patience, identity" } satisfies StoryHeading,
    principles: [
      { index: "01", title: "Place", body: "Single malt can be made anywhere. This one could only have been made here." },
      { index: "02", title: "Craft", body: "Few ingredients, many decisions. Copper, wood and water handled with care." },
      { index: "03", title: "Patience", body: "The climate moves quickly. The judgement about when a whisky is ready does not." },
      { index: "04", title: "Identity", body: "An Indian single malt that does not borrow its story from anywhere else." },
    ] satisfies Principle[],
  },
  closing: { eyebrow: "The Ascent Continues", title: "Some places cannot be hurried." },
};

export type Photo = { src: string; mobile?: string; width: number; height: number; subject: string; author?: string; license?: string; licenseUrl?: string; source?: string; conceptual?: boolean };

/** Our Story imagery. Regional photographs are from Wikimedia Commons under
 * the licences given (resized/cropped for the web; CC BY-SA adaptations stay
 * under CC BY-SA). Distillery-type images are conceptual: not the Gamber
 * Valley distillery. Generated plates are marked as such. */
export const storyPhotos = {
  opening: { src: "/media/story/opening-solan-hills.webp", mobile: "/media/story/opening-solan-hills-mobile.webp", width: 2000, height: 1205, subject: "The hills around Solan", author: "Mayankgupta954", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:The_Lovely_Solan_Hills.jpg" },
  valley: { src: "/media/story/valley-shivaliks.webp", mobile: "/media/story/valley-shivaliks-mobile.webp", width: 2000, height: 1333, subject: "The Shivaliks rising toward the Himalaya, Himachal Pradesh", author: "Timothy A. Gonsalves", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Shivaliks_Himalayas_Aerial_Dehaze_Himachal_Feb20_R16_02827.jpg" },
  stone: { src: "/media/photography/collection-midnight-vault.webp", width: 1672, height: 941, subject: "Stone and low light", conceptual: true },
  oak: { src: "/media/photography/collection-golden-heritage.webp", width: 1672, height: 941, subject: "Oak and bronze", conceptual: true },
  ridge: { src: "/media/story/landscape-ridge.webp", mobile: "/media/story/landscape-ridge-mobile.webp", width: 2000, height: 1333, subject: "Ridges of the Shivalik range at dusk", author: "Donvikro", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Shiwalik_Range.jpg" },
  cloud: { src: "/media/story/landscape-cloud.webp", mobile: "/media/story/landscape-cloud-mobile.webp", width: 2000, height: 1125, subject: "Deodar forest in monsoon cloud, Shimla", author: "RayAdvait", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0", source: "https://commons.wikimedia.org/wiki/File:Deodar_forests_of_Shimla_in_monsoon.jpg" },
  forest: { src: "/media/story/landscape-forest.webp", mobile: "/media/story/landscape-forest-mobile.webp", width: 1836, height: 1102, subject: "Deodar forest, Himachal Pradesh", author: "BhotaRohit", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Traditional_Devdar_forest_in_the_western_Himalayas_Himachal_Pradesh.jpg" },
  snow: { src: "/media/story/landscape-snow.webp", mobile: "/media/story/landscape-snow-mobile.webp", width: 2000, height: 1160, subject: "Churdhar peak from Thundal, Himachal Pradesh", author: "Jagriti Zinta", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Churdhar_Peak_seen_from_Thundal_village,_Himachal_Pradesh,_India.jpg" },
  monal: { src: "/media/story/emblem-monal.webp", mobile: "/media/story/emblem-monal-mobile.webp", width: 2000, height: 1500, subject: "A male Himalayan monal in the forest", author: "Mike Prince", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0", source: "https://commons.wikimedia.org/wiki/File:Himalayan_Monal_(43705024970).jpg" },
  crest: { src: "/media/story/emblem-crest.webp", mobile: "/media/story/emblem-crest-mobile.webp", width: 2000, height: 1328, subject: "The monal's raised crest", author: "H005", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Lophophorus_impejanus_Zoo_DU_1.jpg" },
  rhododendron: { src: "/media/story/emblem-rhododendron.webp", mobile: "/media/story/emblem-rhododendron-mobile.webp", width: 2000, height: 1333, subject: "Rhododendron arboreum in Seraj, Himachal Pradesh", author: "The Nilgiris Raju L", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Rhododendron_arboreum_in_Seraj.jpg" },
  place: { src: "/media/story/philosophy-place.webp", mobile: "/media/story/philosophy-place-mobile.webp", width: 2000, height: 1200, subject: "Sunset over the hills of Himachal Pradesh", author: "Aaryan Singh", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:A_Mountain_sunset.jpg" },
  craft: { src: "/media/story/philosophy-craft.webp", mobile: "/media/story/philosophy-craft-mobile.webp", width: 2000, height: 1028, subject: "Copper pot stills (conceptual)", author: "Thechadwix", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:ASW_Distillery_-_Atlanta%27s_hometown_whiskey_bourbon_craft_distillery.jpg", conceptual: true },
  patience: { src: "/media/story/philosophy-patience.webp", mobile: "/media/story/philosophy-patience-mobile.webp", width: 2000, height: 1240, subject: "Casks at rest (conceptual)", author: "sebastian.b.", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0", source: "https://commons.wikimedia.org/wiki/File:Bruichladdich_(9860712223).jpg", conceptual: true },
  twilight: { src: "/media/story/closing-twilight.webp", mobile: "/media/story/closing-twilight-mobile.webp", width: 2000, height: 1126, subject: "Twilight through deodars in the Himalaya", author: "Poojilsharma07", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Twilight_in_Himalayas.jpg" },
} satisfies Record<string, Photo>;

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
  /** Showcase room: centre and edge of its radial light. */
  stage: [string, string];
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
    stage: ["#12261d", "#0c1a14"],
    theme: { name: "Deep emerald, antique gold and amber", colors: ["#0f3326", "#b08a43", "#b5621a"] },
    image: { src: "/media/bottles/private-edition-i.webp", alt: "Gamber Valley Private Edition I decanter", width: 900, height: 1037 },
    notes: {
      nose: "Demerara sugar, moist dates, heather honey and layered vanilla, with delicate eucalyptus and lavender.",
      palate: "Richly malty and elegantly layered, with dried ginger and the softest touch of spice.",
      finish: "Gentle warmth and remarkable complexity, lingering gracefully.",
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
    stage: ["#2a1218", "#14090c"],
    theme: { name: "Deep burgundy, muted rose, warm amber and gold", colors: ["#4a1420", "#c99299", "#c27a2c", "#c9a45c"] },
    image: { src: "/media/bottles/the-vault-series.webp", alt: "Gamber Valley The Vault Series bottle", width: 329, height: 1200 },
    notes: {
      nose: "Delicate malt and soft vanilla.",
      palate: "Honey and chocolate, with a whisper of spice.",
      finish: "Long and refined, with honey and chocolate lingering softly.",
    },
    showcase: [
      { kicker: "The Vault Series", title: "Refined by Attitude", body: supplied("Patience, craftsmanship and authenticity, held in reserve.") },
      { kicker: "The Nose", title: "Delicate malt, soft vanilla", body: supplied("Delicate malt and soft vanilla.") },
      { kicker: "Palate & Finish", title: "Honey and chocolate", body: supplied("Honey, chocolate and subtle spice, with a long, refined finish of honey and chocolate.") },
    ],
  },
];

export const expressionById = (id: ExpressionId) => expressions.find((e) => e.id === id)!;

/** Approved product-led introduction for the homepage showcase only. */
export const bottleIntroduction = {
  kicker: "GAMBER VALLEY · INDIAN SINGLE MALT",
  title: "A Spirit Worth Discovering.",
  body: { text: "Discover the character of Gamber Valley through every expression.", verified: true },
};

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
