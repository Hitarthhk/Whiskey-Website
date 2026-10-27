// Bakes web-ready assets from the supplied brand originals in public/media.
//   node scripts/bake-assets.mjs
// Outputs: the UI emblem, lightweight fallback photographs, and the label
// textures for the 3D bottles (taken from the real artwork, so typography and
// emblems stay exactly as printed). Coordinates were measured from the
// originals with scripts/measure-assets.mjs.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = {
  pe: "public/media/bottle/Gamber Valley Amber Whisky Decanter.png",
  vault: "public/media/bottle/Gamber Valley Whisky Bottle Cutout.png",
  emblem: "public/media/brand/Gamber Valley Golden Emblem.png",
};
const OUT = { brand: "public/media/brand", bottles: "public/media/bottles", tex: "public/media/textures" };

async function raw(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const sample = (x, y) => {
    // Bilinear RGBA sample, clamped to the image.
    x = Math.max(0, Math.min(info.width - 1.001, x));
    y = Math.max(0, Math.min(info.height - 1.001, y));
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const out = [0, 0, 0, 0];
    for (const [dx, dy, w] of [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]]) {
      const i = ((y0 + dy) * info.width + (x0 + dx)) * 4;
      for (let c = 0; c < 4; c++) out[c] += data[i + c] * w;
    }
    return out;
  };
  return { ...info, data, sample };
}

const write = (buf, w, h, file, opts = {}) =>
  sharp(Buffer.from(buf), { raw: { width: w, height: h, channels: 4 } })[opts.webp ? "webp" : "png"](opts.webp ? { quality: 88 } : { compressionLevel: 9 }).toFile(file);

/** Flatten a perspective quadrilateral (tl, tr, br, bl) into a w×h rectangle. */
async function unwarp(img, [tl, tr, br, bl], w, h, file) {
  const buf = new Uint8ClampedArray(w * h * 4);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const u = (i + 0.5) / w, v = (j + 0.5) / h;
    const top = [tl[0] + (tr[0] - tl[0]) * u, tl[1] + (tr[1] - tl[1]) * u];
    const bot = [bl[0] + (br[0] - bl[0]) * u, bl[1] + (br[1] - bl[1]) * u];
    const p = img.sample(top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v);
    buf.set([p[0], p[1], p[2], 255], (j * w + i) * 4);
  }
  await write(buf, w, h, file, { webp: true });
}

/**
 * Unroll part of a cylinder (neck band, capsule band) into a flat strip from
 * `from` to `to` degrees around its axis (0 = facing the camera), feathering
 * the edges so it blends into the procedural remainder of the band.
 */
async function unroll(img, { cx, r, top, bottom }, [from, to], w, file, feather = 0.05) {
  const h = Math.round(bottom - top);
  const buf = new Uint8ClampedArray(w * h * 4);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const theta = ((from + ((i + 0.5) / w) * (to - from)) * Math.PI) / 180;
    const p = img.sample(cx + r * Math.sin(theta), top + j);
    const edge = feather ? Math.min(i, w - 1 - i) / (w * feather) : 1;
    buf.set([p[0], p[1], p[2], p[3] * Math.min(1, edge)], (j * w + i) * 4);
  }
  await write(buf, w, h, file, { webp: true });
}

/** Cut the Vault label out along its shaped top edge (pink paper vs. liquid). */
async function cutLabel(img, [x0, y0, x1, y1], file) {
  const w = x1 - x0, h = y1 - y0;
  const buf = new Uint8ClampedArray(w * h * 4);
  const paper = ([r, g, b]) => r > 190 && g > 150 && b > 145 && r - b < 75;
  // A run of paper pixels, so stray highlights in the liquid are not mistaken for the edge.
  const run = (i, j, step) => [0, 1, 2, 3].every((k) => paper(img.sample(x0 + i, y0 + j + k * step)));
  const edges = [];
  for (let i = 0; i < w; i++) {
    let top = 0, bottom = h - 1;
    while (top < h - 4 && !run(i, top, 1)) top++;
    while (bottom > top + 4 && !run(i, bottom, -1)) bottom--;
    edges.push([top, bottom]);
  }
  // Median across neighbouring columns removes narrow glints but keeps the label’s wave.
  const median = (k, i) => edges.slice(Math.max(0, i - 12), i + 13).map((e) => e[k]).sort((a, b) => a - b)[12] ?? edges[i][k];
  for (let i = 0; i < w; i++) {
    const top = median(0, i), bottom = median(1, i);
    for (let j = 0; j < h; j++) {
      const p = img.sample(x0 + i, y0 + j);
      const a = j < top - 0.5 || j > bottom + 0.5 ? 0 : 255;
      buf.set([p[0], p[1], p[2], a], (j * w + i) * 4);
    }
  }
  await write(buf, w, h, file, { webp: true });
}

await Promise.all(Object.values(OUT).map((d) => mkdir(d, { recursive: true })));
const pe = await raw(SRC.pe);
const vault = await raw(SRC.vault);

// Emblem without the tagline beneath it (rows 0–797), for the UI, the favicon and decals.
const mark = await sharp(await sharp(SRC.emblem).extract({ left: 0, top: 0, width: 1648, height: 798 }).png().toBuffer()).trim().png().toBuffer();
await sharp(mark).resize({ width: 512 }).webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT.brand}/gamber-valley-emblem.webp`);
await sharp(mark).resize({ width: 512 }).webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT.tex}/emblem-gold.webp`);
await sharp(mark).resize({ width: 256, height: 256, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile("src/app/icon.png");

// Fallback photographs (no WebGL / GPU failure only), trimmed and compressed.
await sharp(SRC.pe).trim().resize({ width: 900 }).webp({ quality: 82 }).toFile(`${OUT.bottles}/private-edition-i.webp`);
await sharp(SRC.vault).trim().resize({ height: 1200 }).webp({ quality: 82 }).toFile(`${OUT.bottles}/the-vault-series.webp`);

// Private Edition I: green front label (gold rule included), flattened.
const grow = 4;
await unwarp(pe, [[267 - grow, 799 - grow], [911 + grow, 884 - grow], [910 + grow, 1079 + grow], [274 - grow, 982 + grow]], 1200, 352, `${OUT.tex}/pe-label.webp`);
// Private Edition I: gold neck band, unrolled across its visible front.
await unroll(pe, { cx: 641, r: 116, top: 274, bottom: 430 }, [-78, 78], 720, `${OUT.tex}/pe-neckband.webp`, 0.04);
// The Vault Series: rose label with its shaped top edge.
await cutLabel(vault, [362, 768, 652, 1312], `${OUT.tex}/vault-label.webp`);
// The Vault Series: the gold signature flourish on the capsule band.
await unroll(vault, { cx: 512, r: 90, top: 90, bottom: 142 }, [2, 76], 300, `${OUT.tex}/vault-signature.webp`, 0.06);

const size = (f) => sharp(f).metadata().then((m) => [m.width, m.height]);
for (const f of [`${OUT.brand}/gamber-valley-emblem.webp`, `${OUT.bottles}/private-edition-i.webp`, `${OUT.bottles}/the-vault-series.webp`, ...["emblem-gold", "pe-label", "pe-neckband", "vault-label", "vault-signature"].map((n) => `${OUT.tex}/${n}.webp`)])
  console.log(f, await size(f));
