import { BufferGeometry, Color, Float32BufferAttribute } from "three";

/**
 * Cross-section of a bottle at height `y`: a superellipse with half-width `a`
 * (x), half-depth `b` (z) and exponent `n` (2 = ellipse/circle, higher =
 * squarer with rounded corners). Lofting rings of these builds the flat
 * decanter, the square shouldered bottle and their round necks alike.
 */
export type Section = { y: number; a: number; b: number; n: number };
/** A ring of the loft. `crease` starts a new shading group (sharp edge). */
export type Ring = Section & { crease?: boolean };

const sgnPow = (v: number, p: number) => Math.sign(v) * Math.pow(Math.abs(v), p);

export function sectionPoint(t: number, { a, b, n }: Section): [number, number] {
  return [a * sgnPow(Math.cos(t), 2 / n), b * sgnPow(Math.sin(t), 2 / n)];
}

/** Front surface depth of a section at x (z ≥ 0). */
export function frontZ(x: number, { a, b, n }: Section) {
  const r = Math.min(1, Math.abs(x) / a);
  return b * Math.pow(Math.max(0, 1 - Math.pow(r, n)), 1 / n);
}

type LoftOptions = {
  segments: number;
  capBottom?: boolean;
  capTop?: boolean;
  /** Optional per-height vertex colour (e.g. a liquid that deepens upward). */
  color?: (y: number) => Color;
};

/**
 * Lofts rings into a closed surface with outward normals. Rings flagged as
 * creases are duplicated so shading breaks cleanly (shoulders, stopper rims).
 */
export function loft(rings: Ring[], { segments, capBottom = true, capTop = true, color }: LoftOptions) {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const pushRing = (r: Section) => {
    const start = pos.length / 3;
    for (let j = 0; j < segments; j++) {
      const [x, z] = sectionPoint((j / segments) * Math.PI * 2, r);
      pos.push(x, r.y, z);
      if (color) { const c = color(r.y); col.push(c.r, c.g, c.b); }
    }
    return start;
  };
  const stitch = (lo: number, hi: number) => {
    for (let j = 0; j < segments; j++) {
      const j1 = (j + 1) % segments;
      const a = lo + j, b = lo + j1, c = hi + j1, d = hi + j;
      idx.push(a, c, b, a, d, c);
    }
  };
  const cap = (r: Section, up: boolean) => {
    const ring = pushRing(r);
    const centre = pos.length / 3;
    pos.push(0, r.y, 0);
    if (color) { const c = color(r.y); col.push(c.r, c.g, c.b); }
    for (let j = 0; j < segments; j++) {
      const j1 = (j + 1) % segments;
      if (up) idx.push(centre, ring + j1, ring + j);
      else idx.push(centre, ring + j, ring + j1);
    }
  };

  let prev = pushRing(rings[0]);
  for (let i = 1; i < rings.length; i++) {
    const cur = pushRing(rings[i]);
    stitch(prev, cur);
    prev = rings[i].crease && i < rings.length - 1 ? pushRing(rings[i]) : cur;
  }
  if (capBottom) cap(rings[0], false);
  if (capTop) cap(rings[rings.length - 1], true);

  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  if (color) geo.setAttribute("color", new Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/**
 * A patch that hugs the front of the loft: used for labels and printed
 * emblems so they sit flush on curved glass instead of floating.
 */
export function frontPatch(
  sectionAt: (y: number) => Section,
  { width, y0, y1, offset = 0.002, cols = 48, rows = 24 }: { width: number; y0: number; y1: number; offset?: number; cols?: number; rows?: number },
) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const y = y0 + (y1 - y0) * v;
    const s = sectionAt(y);
    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      const x = (u - 0.5) * width;
      pos.push(x, y, frontZ(x, s) + offset);
      uv.push(u, v);
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const a = r * (cols + 1) + c, b = a + 1, d = a + cols + 1, e = d + 1;
    idx.push(a, b, e, a, e, d);
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** Samples a section function into rings between y0 and y1. */
export function sample(sectionAt: (y: number) => Section, y0: number, y1: number, steps: number): Ring[] {
  return Array.from({ length: steps + 1 }, (_, i) => sectionAt(y0 + ((y1 - y0) * i) / steps));
}

/** Rounded-corner profile: how much a half-extent shrinks within `radius` of an edge. */
export function cornerInset(distance: number, radius: number) {
  if (distance >= radius) return 0;
  const d = radius - Math.max(0, distance);
  return radius - Math.sqrt(Math.max(0, radius * radius - d * d));
}

/** Piecewise-linear interpolation through [x, y] points. */
export function curve(points: [number, number][]) {
  return (x: number) => {
    if (x <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i];
      if (x <= x1) {
        const [x0, y0] = points[i - 1];
        const t = (x - x0) / (x1 - x0);
        return y0 + (y1 - y0) * t;
      }
    }
    return points[points.length - 1][1];
  };
}

export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
