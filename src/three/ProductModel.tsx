"use client";

import { Canvas } from "@react-three/fiber";
import { Bounds, Clone, Environment, Html, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useMotion } from "@/animation/MotionProvider";
import { BottleSVG } from "@/components/BottleSVG";
import { WebGLBoundary } from "@/components/WebGLBoundary";

function Model({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  return (
    <Bounds fit clip observe margin={1.2}><Clone object={scene} /></Bounds>
  );
}

/**
 * Drag-to-rotate viewer used by collection cards once real bottle GLBs are
 * supplied (set `model` on an expression in content/site.ts).
 */
export default function ProductModel({ src, className }: { src: string; className?: string }) {
  const { ready, webgl, reduced, mobile } = useMotion();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(host.current);
    return () => io.disconnect();
  }, []);
  const fallback = <BottleSVG className={className} />;
  return (
    <div ref={host} className={className}>
      {ready && webgl && !mobile && !reduced && visible ? (
      <WebGLBoundary fallback={fallback}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4], fov: 30 }} gl={{ alpha: true }}>
        <Suspense fallback={<Html center>{fallback}</Html>}>
          <Model src={src} />
          <Environment resolution={128} frames={1}>
            <Lightformer form="rect" intensity={3} position={[-3, 2, 3]} scale={[1, 5, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={2} color="#e4c88c" position={[3, 1, 2]} scale={[1, 5, 1]} target={[0, 0, 0]} />
          </Environment>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} minPolarAngle={Math.PI / 2.4} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>
      </WebGLBoundary>
      ) : fallback}
    </div>
  );
}
