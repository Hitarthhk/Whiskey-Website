"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useMemo, type RefObject } from "react";
import { Shape } from "three";

function Ridges({ progress }: { progress: RefObject<number> }) {
  const shape = useMemo(() => {
    const ridge = new Shape();
    ridge.moveTo(-16, -8);
    ridge.lineTo(-16, 0);
    const heights = [0.4, 1.7, 0.8, 2.8, 1.2, 3.5, 1.6, 2.4, 0.9, 2.1, 0.6, 1.5, 0.4];
    heights.forEach((y, i) => ridge.lineTo(-16 + i * 32 / (heights.length - 1), y));
    ridge.lineTo(16, -8);
    ridge.closePath();
    return ridge;
  }, []);
  useFrame(({ camera }) => {
    const p = progress.current;
    camera.position.set(Math.sin(p * Math.PI) * 0.8, 0.4 + p * 0.6, 13 - p * 4);
    camera.lookAt(0, 0.5, 0);
  });
  return (
    <>
      <color attach="background" args={["#12261d"]} />
      <fog attach="fog" args={["#12261d", 8, 23]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[-5, 8, 5]} color="#e4c88c" intensity={2} />
      <Float speed={0.7} rotationIntensity={0.015} floatIntensity={0.05}>
        {["#53675a", "#284a39", "#12261d"].map((color, i) => (
          <mesh key={color} position={[(i - 1) * 2, -0.3 - i * 1.25, -5 + i * 2.7]} scale={[1, 1 + i * 0.15, 1]}>
            <extrudeGeometry args={[shape, { depth: 0.3, bevelEnabled: false }]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
        ))}
      </Float>
    </>
  );
}

/** A brief camera push through real layered ridges; mounted only during navigation. */
export default function TransitionTerrain({ progress }: { progress: RefObject<number> }) {
  return <Canvas aria-hidden="true" dpr={[1, 1.25]} camera={{ position: [0, 0.4, 13], fov: 42 }} gl={{ antialias: false, alpha: false }}><Ridges progress={progress} /></Canvas>;
}
