"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { Color, Group, MathUtils, SpotLight } from "three";
import type { Expression, ExpressionId } from "@/content/site";
import { CAMERA } from "./Bottle";
import { designs } from "./bottles/designs";
import { GamberBottle, type Quality } from "./bottles/GamberBottle";
import { stepDrag, type DragState } from "./useDragRotate";
import { TransmissionBackdrop } from "./useTransmissionBackdrop";

type Props = {
  expressions: Expression[];
  active: number;
  /** The card areas each bottle should stand in (DOM elements). */
  slots: RefObject<Partial<Record<ExpressionId, HTMLElement | null>>>;
  drags: RefObject<Partial<Record<ExpressionId, DragState>>>;
  quality: Quality;
  idle: boolean;
  className?: string;
};

const VIS_H = 2 * CAMERA.z * Math.tan(MathUtils.degToRad(CAMERA.fov / 2));

/**
 * Both expressions in one WebGL context, standing behind their cards. Each
 * bottle is fitted to its card every frame, so it tracks layout, hover lifts
 * and responsive changes. The selected bottle steps forward into the light.
 */
export default function CollectionStage({ expressions, active, slots, drags, quality, idle, className }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      if (e.isIntersecting) setNear(true);
    }, { rootMargin: "50% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tint = designs[expressions[active].id].light;
  // The room behind the cards: the selected accent sinking into forest black.
  const backdrop = new Color(expressions[active].accent).lerp(new Color("#07100c"), 0.3).getStyle();

  return (
    <div ref={host} className={className}>
      {near && (
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
          camera={{ position: [0, 0, CAMERA.z], fov: CAMERA.fov }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          aria-hidden="true"
        >
          <TransmissionBackdrop color={backdrop} />
          <ambientLight intensity={0.16} />
          <spotLight position={[-4, 5, 4]} angle={0.5} penumbra={1} intensity={45} color="#ffe6bf" />
          {expressions.map((e, i) => (
            <SlotBottle key={e.id} expression={e} active={i === active} host={host} slots={slots} drags={drags} quality={quality} idle={idle} />
          ))}
          <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={5} color="#fff1d6" position={[-3.2, 1, 3]} scale={[0.22, 7, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={3} color={tint.fill} position={[3.4, 0.5, 2.4]} scale={[0.16, 6, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={1.4} color={tint.rim} position={[0, 0.4, -5]} scale={[3, 5, 1]} target={[0, 0, 0]} />
            <Lightformer form="ring" intensity={0.22} color="#ffffff" position={[0, 4, -3]} scale={2} target={[0, 0, 0]} />
          </Environment>
        </Canvas>
      )}
    </div>
  );
}

function SlotBottle({ expression, active, host, slots, drags, quality, idle }: Omit<Props, "expressions" | "active" | "className"> & { expression: Expression; active: boolean; host: RefObject<HTMLDivElement | null> }) {
  const group = useRef<Group>(null);
  const spot = useRef<SpotLight>(null);
  const design = designs[expression.id];
  const yawIdle = useRef(0);

  useFrame((state, dt) => {
    const g = group.current;
    const slot = slots.current?.[expression.id];
    const frame = host.current?.getBoundingClientRect();
    if (!g || !slot || !frame || !frame.width) return;
    const r = slot.getBoundingClientRect();
    const visW = VIS_H * (frame.width / frame.height);
    const x = ((r.left + r.width / 2 - frame.left) / frame.width - 0.5) * visW;
    const y = (0.5 - (r.top + r.height / 2 - frame.top) / frame.height) * VIS_H;
    const fit = Math.min(((r.height / frame.height) * VIS_H * 0.84) / design.height, ((r.width / frame.width) * visW * 0.86) / design.width);

    const drag = drags.current?.[expression.id];
    const user = drag ? stepDrag(drag, dt) : 0;
    const quiet = drag ? (performance.now() - drag.lastInteraction) / 1000 > 1.5 : true;
    if (active && idle && quiet) yawIdle.current += dt * 0.35;
    const hover = drag?.hover ?? 0;

    g.position.x = MathUtils.damp(g.position.x, x, 6, dt);
    g.position.y = MathUtils.damp(g.position.y, y, 6, dt);
    g.position.z = MathUtils.damp(g.position.z, active ? 0.12 : -0.25, 3, dt);
    g.scale.setScalar(MathUtils.damp(g.scale.x, fit * (active ? 1 : 0.9), 4, dt));
    g.rotation.y = MathUtils.damp(g.rotation.y, -0.35 + yawIdle.current + user + hover * 0.6, drag?.dragging ? 14 : 3.5, dt);
    if (spot.current) {
      spot.current.position.set(g.position.x + 1.2, g.position.y + 3, 3);
      spot.current.target.position.set(g.position.x, g.position.y, 0);
      spot.current.target.updateMatrixWorld();
      spot.current.intensity = MathUtils.damp(spot.current.intensity, active ? 70 : 12, 3, dt);
    }
  });

  return (
    <>
      <spotLight ref={spot} angle={0.35} penumbra={1} intensity={12} color={design.light.key} />
      <group ref={group} position={[0, -6, 0]}>
        <group position={[0, -design.height / 2, 0]}>
          <Suspense fallback={null}>
            <GamberBottle expression={expression} quality={quality} />
          </Suspense>
        </group>
      </group>
    </>
  );
}
