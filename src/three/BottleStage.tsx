"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Bottle, type Quality } from "./Bottle";

type Props = { progress: RefObject<number>; quality: Quality; className?: string; onReady?: () => void };

/**
 * WebGL stage for the bottle. Renders only while on screen, clamps DPR and
 * builds its studio lighting from procedural light-formers (no HDR download).
 */
export default function BottleStage({ progress, quality, className, onReady }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className={className}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
        camera={{ position: [0, 0, 7.4], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={() => onReady?.()}
        aria-hidden="true"
      >
        <ambientLight intensity={0.15} />
        <spotLight position={[-4, 5, 3]} angle={0.4} penumbra={1} intensity={60} color="#ffe6bf" />
        <spotLight position={[4, 2, -3]} angle={0.5} penumbra={1} intensity={50} color="#e4c88c" />
        <Bottle progress={progress} quality={quality} />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={4} color="#fff1d6" position={[-3, 1.5, 3]} scale={[1.2, 6, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={2.5} color="#e4c88c" position={[3, 1, 2]} scale={[0.8, 5, 1]} target={[0, 0, 0]} />
          <Lightformer form="ring" intensity={1.4} color="#ffffff" position={[0, 4, -3]} scale={2.5} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={0.8} color="#284a39" position={[0, -4, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
