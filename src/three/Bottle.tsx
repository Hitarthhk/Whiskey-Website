"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { DoubleSide, Group, LatheGeometry, MathUtils, PointLight, Vector2 } from "three";
import { range } from "@/animation/useScene";
import { CAP, GLASS_PROFILE, LABEL, LIQUID_PROFILE } from "./profile";
import { createLabelTexture } from "./labelTexture";

export type Quality = "high" | "low";

const lathe = (profile: [number, number][], segments: number) =>
  new LatheGeometry(profile.map(([r, y]) => new Vector2(r, y)), segments);

const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Conceptual whisky bottle, choreographed entirely by `progress` (0→1),
 * which the owning section writes from its ScrollTrigger.
 */
export function Bottle({ progress, quality, liquid = "#9c5512" }: { progress: RefObject<number>; quality: Quality; liquid?: string }) {
  const group = useRef<Group>(null);
  const sweep = useRef<PointLight>(null);
  const pointer = useThree((s) => s.pointer);
  const viewport = useThree((s) => s.viewport);
  const segments = quality === "high" ? 96 : 48;

  const glass = useMemo(() => lathe(GLASS_PROFILE, segments), [segments]);
  const fluid = useMemo(() => lathe(LIQUID_PROFILE, segments), [segments]);
  const label = useMemo(() => createLabelTexture(liquid), [liquid]);

  useEffect(
    () => () => {
      glass.dispose();
      fluid.dispose();
      label.dispose();
    },
    [glass, fluid, label],
  );

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const p = progress.current ?? 0;
    const wide = viewport.aspect > 1;
    const side = wide ? viewport.width * 0.2 : 0;

    // 1 · rise out of the fog   2 · glide left   3 · glide right   4 · ascend out
    const rise = ease(range(p, 0, 0.28));
    const left = easeInOut(range(p, 0.32, 0.5));
    const right = easeInOut(range(p, 0.58, 0.76));
    const exit = easeInOut(range(p, 0.84, 1));

    const targetX = -side * left + 2 * side * right - side * exit;
    const targetY = MathUtils.lerp(-3.4, -0.05, rise) + exit * 3.6 + pointer.y * 0.05;
    const targetRotY = -0.5 + p * Math.PI * 2.4 + pointer.x * 0.3;
    const targetScale = MathUtils.lerp(0.86, 1, rise) * (1 - exit * 0.15);

    g.position.x = MathUtils.damp(g.position.x, targetX, 4, dt);
    g.position.y = MathUtils.damp(g.position.y, targetY, 4, dt);
    g.rotation.y = MathUtils.damp(g.rotation.y, targetRotY, 3.5, dt);
    // Lean into lateral movement like a camera-tracked object.
    g.rotation.z = MathUtils.damp(g.rotation.z, (targetX - g.position.x) * -0.18, 3, dt);
    g.rotation.x = MathUtils.damp(g.rotation.x, pointer.y * -0.06, 3, dt);
    g.scale.setScalar(MathUtils.damp(g.scale.x, targetScale, 4, dt));

    // A warm highlight travels across the glass as the bottle turns.
    if (sweep.current) {
      sweep.current.position.x = Math.sin(p * Math.PI * 3) * 2.6 + g.position.x;
      sweep.current.intensity = 6 + Math.sin(p * Math.PI * 6) * 3;
    }
  });

  const arcStart = -LABEL.arc / 2;
  return (
    <>
      <pointLight ref={sweep} position={[0, 0.6, 2.4]} color="#ffd9a0" intensity={6} distance={7} decay={1.6} />
      <group ref={group} position={[0, -3.4, 0]}>
        <group position={[0, -1.35, 0]}>
          {/* Glass */}
          <mesh geometry={glass} renderOrder={2}>
            {quality === "high" ? (
              <meshPhysicalMaterial
                transmission={1}
                thickness={0.35}
                roughness={0.04}
                ior={1.5}
                color="#e8f0e6"
                attenuationColor="#d9e6d5"
                attenuationDistance={2.5}
                clearcoat={1}
                clearcoatRoughness={0.05}
                specularIntensity={1}
                envMapIntensity={1.4}
                side={DoubleSide}
              />
            ) : (
              <meshPhysicalMaterial
                transparent
                opacity={0.28}
                roughness={0.05}
                metalness={0.1}
                clearcoat={1}
                envMapIntensity={1.6}
                color="#dfe8dc"
                depthWrite={false}
              />
            )}
          </mesh>

          {/* Whisky */}
          <mesh geometry={fluid} renderOrder={1}>
            <meshPhysicalMaterial
              color={liquid}
              emissive={liquid}
              emissiveIntensity={0.07}
              roughness={0.12}
              clearcoat={1}
              sheen={0.6}
              sheenColor="#ffcc80"
              envMapIntensity={1.2}
            />
          </mesh>

          {/* Label — conceptual artwork */}
          <mesh position={[0, (LABEL.bottom + LABEL.top) / 2, 0]} renderOrder={3}>
            <cylinderGeometry args={[LABEL.radius, LABEL.radius, LABEL.top - LABEL.bottom, 64, 1, true, arcStart, LABEL.arc]} />
            <meshStandardMaterial map={label} roughness={0.75} metalness={0} side={DoubleSide} />
          </mesh>

          {/* Neck band */}
          <mesh position={[0, 2.22, 0]}>
            <cylinderGeometry args={[0.162, 0.162, 0.1, 48, 1, true]} />
            <meshStandardMaterial color="#c9a45c" metalness={1} roughness={0.28} />
          </mesh>

          {/* Stopper */}
          <mesh position={[0, CAP.base + CAP.height / 2, 0]}>
            <cylinderGeometry args={[CAP.radius, CAP.radius * 1.04, CAP.height, 48]} />
            <meshStandardMaterial color="#b8924d" metalness={1} roughness={0.32} />
          </mesh>
          <mesh position={[0, CAP.base + CAP.height + 0.012, 0]}>
            <cylinderGeometry args={[CAP.radius * 0.92, CAP.radius, 0.025, 48]} />
            <meshStandardMaterial color="#e4c88c" metalness={1} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </>
  );
}
