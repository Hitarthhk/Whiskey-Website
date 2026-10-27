"use client";

import { Clone, useGLTF, useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { CanvasTexture, DoubleSide, SRGBColorSpace, type Texture } from "three";
import type { Expression } from "@/content/site";
import { designs, PE_PARTS, VAULT_PARTS, type BottleDesign } from "./designs";
import { frontPatch } from "./loft";

export type Quality = "high" | "low";
const EMBLEM = "/media/textures/emblem-gold.webp";

/**
 * A Gamber Valley bottle, modelled from the reference photographs. Labels,
 * the emblem and the neck band use the real printed artwork; everything else
 * is geometry and materials. An accurate GLB, when supplied, takes over.
 */
export function GamberBottle({ expression, quality }: { expression: Expression; quality: Quality }) {
  if (expression.model) return <GLBBottle src={expression.model} />;
  const design = designs[expression.id];
  return expression.id === "private-edition-i" ? <PrivateEditionI design={design} quality={quality} /> : <VaultSeries design={design} quality={quality} />;
}

function GLBBottle({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  return <Clone object={scene} />;
}

function useGeometry(design: BottleDesign, quality: Quality) {
  const segments = quality === "high" ? 128 : 64;
  const glass = useMemo(() => design.glass(segments), [design, segments]);
  const liquid = useMemo(() => design.liquid(segments), [design, segments]);
  const label = useMemo(() => frontPatch(design.section, design.label), [design]);
  const emblem = useMemo(() => frontPatch(design.section, design.emblem), [design]);
  useEffect(() => () => [glass, liquid, label, emblem].forEach((g) => g.dispose()), [glass, liquid, label, emblem]);
  return { glass, liquid, label, emblem };
}

function prepare(...textures: Texture[]) {
  textures.forEach((t) => {
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
  });
}

function Glass({ geometry, quality, tint = "#eef3ec" }: { geometry: ReturnType<BottleDesign["glass"]>; quality: Quality; tint?: string }) {
  return (
    <mesh geometry={geometry} renderOrder={2}>
      {quality === "high" ? (
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.5}
          roughness={0.02}
          ior={1.5}
          color={tint}
          attenuationColor={tint}
          attenuationDistance={3}
          clearcoat={1}
          clearcoatRoughness={0.03}
          specularIntensity={0.9}
          envMapIntensity={0.55}
        />
      ) : (
        <meshPhysicalMaterial transparent opacity={0.22} roughness={0.04} metalness={0.1} clearcoat={1} envMapIntensity={1.6} color={tint} depthWrite={false} />
      )}
    </mesh>
  );
}

/**
 * Gold printed straight onto the glass. Printed surfaces render in the
 * transparent pass so the glass’s refraction pass does not show a ghost of them.
 */
function Emblem({ geometry, map }: { geometry: ReturnType<typeof frontPatch>; map: Texture }) {
  return (
    <mesh geometry={geometry} renderOrder={4}>
      <meshStandardMaterial map={map} transparent depthWrite={false} alphaTest={0.45} metalness={0.7} roughness={0.3} envMapIntensity={1.2} emissive="#7a5514" emissiveMap={map} emissiveIntensity={0.45} />
    </mesh>
  );
}

// ───────────────────────── Private Edition I ─────────────────────────

/** Gold neck band: the printed front (unrolled from the reference) on brushed gold. */
function useNeckBand(strip: Texture) {
  const texture = useMemo(() => {
    const { r, y0, y1 } = PE_PARTS.neck;
    const w = 2048, h = Math.round((w * (y1 - y0)) / (2 * Math.PI * r));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const gold = ctx.createLinearGradient(0, 0, 0, h);
    gold.addColorStop(0, "#b8913f");
    gold.addColorStop(0.5, "#d9b764");
    gold.addColorStop(1, "#a9822f");
    ctx.fillStyle = gold;
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 3) {
      ctx.fillStyle = `rgba(255,240,200,${0.02 + ((x * 7919) % 13) / 400})`;
      ctx.fillRect(x, 0, 1, h);
    }
    const img = strip.image as CanvasImageSource;
    const span = (156 / 360) * w;
    ctx.drawImage(img, w / 2 - span / 2, 0, span, h);
    const t = new CanvasTexture(canvas);
    prepare(t);
    return t;
  }, [strip]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function PrivateEditionI({ design, quality }: { design: BottleDesign; quality: Quality }) {
  const geo = useGeometry(design, quality);
  const [label, emblem, strip] = useTexture([design.label.src, EMBLEM, "/media/textures/pe-neckband.webp"]);
  useMemo(() => prepare(label, emblem), [label, emblem]);
  const band = useNeckBand(strip);
  const { neck, cork, liquidNeck } = PE_PARTS;

  return (
    <group>
      <mesh geometry={geo.liquid} renderOrder={1}>
        <meshPhysicalMaterial vertexColors emissive="#4a1a03" emissiveIntensity={0.5} roughness={0.16} clearcoat={0.6} envMapIntensity={0.6} />
      </mesh>
      <mesh position={[0, (liquidNeck.y0 + liquidNeck.y1) / 2, 0]} renderOrder={1}>
        <cylinderGeometry args={[liquidNeck.r, liquidNeck.r, liquidNeck.y1 - liquidNeck.y0, 32]} />
        <meshPhysicalMaterial color="#8a400c" emissive="#4a1c05" emissiveIntensity={0.3} roughness={0.15} />
      </mesh>
      <mesh position={[0, (cork.y0 + cork.y1) / 2, 0]} renderOrder={1}>
        <cylinderGeometry args={[cork.r, cork.r, cork.y1 - cork.y0, 32]} />
        <meshStandardMaterial color="#b88a58" roughness={0.92} />
      </mesh>
      <Glass geometry={geo.glass} quality={quality} />
      <mesh geometry={geo.label} renderOrder={3}>
        <meshStandardMaterial map={label} transparent roughness={0.42} metalness={0.18} envMapIntensity={1.2} />
      </mesh>
      <Emblem geometry={geo.emblem} map={emblem} />
      <mesh position={[0, (neck.y0 + neck.y1) / 2, 0]} renderOrder={3}>
        <cylinderGeometry args={[neck.r, neck.r, neck.y1 - neck.y0, 96, 1, true, -Math.PI, Math.PI * 2]} />
        <meshStandardMaterial map={band} transparent metalness={0.55} roughness={0.36} envMapIntensity={1.4} />
      </mesh>
    </group>
  );
}

// ───────────────────────── The Vault Series ─────────────────────────

const ROSE = "#dfa29f";
const LATTICE = "rgba(182, 64, 92, 0.6)";
const GOLD_RULE = "#c69a4a";

function lattice(ctx: CanvasRenderingContext2D, w: number, y0: number, y1: number, step = 46) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y0, w, y1 - y0);
  ctx.clip();
  ctx.strokeStyle = LATTICE;
  ctx.lineWidth = 2;
  for (let x = -(y1 - y0); x < w + (y1 - y0); x += step) {
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x + (y1 - y0), y1);
    ctx.moveTo(x, y1);
    ctx.lineTo(x + (y1 - y0), y0);
    ctx.stroke();
  }
  ctx.restore();
}

/** Rose capsule: diamond lattice, gold rules, the printed band and signature on the front. */
function useCapsule(signature: Texture) {
  const textures = useMemo(() => {
    const make = (r: number, height: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) => {
      const w = 2048, h = Math.round((w * height) / (2 * Math.PI * r));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = ROSE;
      ctx.fillRect(0, 0, w, h);
      draw(ctx, w, h);
      const t = new CanvasTexture(canvas);
      prepare(t);
      return t;
    };
    const { upper, lower } = VAULT_PARTS;
    const lowerTex = make(lower.r, lower.y1 - lower.y0, (ctx, w, h) => lattice(ctx, w, 0, h));
    const upperTex = make(upper.r, upper.y1 - upper.y0, (ctx, w, h) => {
      const row = (y: number) => ((upper.y1 - y) / (upper.y1 - upper.y0)) * h;
      lattice(ctx, w, 0, row(2.636));
      ctx.fillStyle = GOLD_RULE;
      [row(2.634), row(2.62), row(2.528), row(2.508)].forEach((y) => ctx.fillRect(0, y, w, 4));
      // Printed band, front only — as photographed.
      const font = getComputedStyle(document.body).getPropertyValue("--font-manrope").trim() || "Arial, sans-serif";
      ctx.fillStyle = "#c0405a";
      ctx.font = `600 40px ${font}`;
      if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "2px";
      ctx.textBaseline = "middle";
      const x = w * 0.3;
      ctx.fillText("CRAFTED BY THE", x, row(2.59));
      ctx.fillText("NEXT GENERATION", x, row(2.55));
      const img = signature.image as CanvasImageSource;
      ctx.drawImage(img, w * 0.506, row(2.618), w * 0.205, row(2.522) - row(2.618));
      // Small gold diamond on the crown, front centre.
      const cy = row(2.7), cx = w / 2;
      ctx.fillStyle = "#d4a84f";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 12);
      ctx.lineTo(cx + 9, cy);
      ctx.lineTo(cx, cy + 12);
      ctx.lineTo(cx - 9, cy);
      ctx.fill();
    });
    return { lowerTex, upperTex };
  }, [signature]);
  useEffect(() => () => { textures.lowerTex.dispose(); textures.upperTex.dispose(); }, [textures]);
  return textures;
}

function VaultSeries({ design, quality }: { design: BottleDesign; quality: Quality }) {
  const geo = useGeometry(design, quality);
  const [label, emblem, signature] = useTexture([design.label.src, EMBLEM, "/media/textures/vault-signature.webp"]);
  useMemo(() => prepare(label, emblem), [label, emblem]);
  const { lowerTex, upperTex } = useCapsule(signature);
  const { lower, upper, top } = VAULT_PARTS;

  return (
    <group>
      <mesh geometry={geo.liquid} renderOrder={1}>
        <meshPhysicalMaterial vertexColors emissive="#3a0a12" emissiveIntensity={0.3} roughness={0.12} clearcoat={1} envMapIntensity={1.1} />
      </mesh>
      <Glass geometry={geo.glass} quality={quality} tint="#f3eeec" />
      <mesh geometry={geo.label} renderOrder={3}>
        <meshStandardMaterial map={label} transparent alphaTest={0.5} roughness={0.6} envMapIntensity={1} />
      </mesh>
      <Emblem geometry={geo.emblem} map={emblem} />
      {/* Capsule */}
      <mesh position={[0, (lower.y0 + lower.y1) / 2, 0]}>
        <cylinderGeometry args={[lower.r, lower.r, lower.y1 - lower.y0, 96, 1, true, -Math.PI, Math.PI * 2]} />
        <meshStandardMaterial map={lowerTex} roughness={0.5} />
      </mesh>
      <mesh position={[0, lower.y1, 0]} rotation-x={Math.PI / 2}>
        <ringGeometry args={[lower.r, upper.r, 96]} />
        <meshStandardMaterial color={ROSE} roughness={0.5} side={DoubleSide} />
      </mesh>
      <mesh position={[0, (upper.y0 + upper.y1) / 2, 0]}>
        <cylinderGeometry args={[upper.r, upper.r, upper.y1 - upper.y0, 96, 1, true, -Math.PI, Math.PI * 2]} />
        <meshStandardMaterial map={upperTex} roughness={0.45} />
      </mesh>
      {/* Flat crown with a softly rounded edge. */}
      <mesh position={[0, upper.y1, 0]} scale={[1, (top - upper.y1) / upper.r, 1]}>
        <sphereGeometry args={[upper.r, 96, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={ROSE} roughness={0.45} />
      </mesh>
    </group>
  );
}
