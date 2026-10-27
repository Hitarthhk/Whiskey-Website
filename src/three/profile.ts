/**
 * Conceptual bottle silhouette shared by the WebGL bottle (lathe) and the
 * SVG fallback. Replace with the real bottle GLB once packaging is final.
 * Units: [radius, height] — total height ≈ 2.75.
 */
export const GLASS_PROFILE: [number, number][] = [
  [0, 0],
  [0.4, 0],
  [0.44, 0.025],
  [0.46, 0.09],
  [0.46, 1.5],
  [0.452, 1.6],
  [0.41, 1.74],
  [0.31, 1.87],
  [0.21, 1.96],
  [0.165, 2.05],
  [0.155, 2.38],
  [0.175, 2.4],
  [0.178, 2.48],
  [0.15, 2.5],
];

export const LIQUID_PROFILE: [number, number][] = [
  [0, 0.06],
  [0.41, 0.06],
  [0.435, 0.11],
  [0.435, 1.5],
  [0.428, 1.6],
  [0.39, 1.72],
  [0, 1.72],
];

export const LABEL = { bottom: 0.48, top: 1.3, radius: 0.463, arc: 2.2 };
export const CAP = { radius: 0.2, height: 0.34, base: 2.44 };
export const BOTTLE_HEIGHT = CAP.base + CAP.height;
