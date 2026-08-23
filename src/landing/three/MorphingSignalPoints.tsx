import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  getLandingMotionSnapshot,
  LANDING_SCENE_POINTER_STRENGTHS,
  LANDING_SIGNAL_SCENE_LAYOUTS,
  type LandingQuality,
  type LandingScene,
} from "../landingMotionStore";

type Vector = [number, number, number];
type SignalTargetName = "heroO" | "ejected" | "finalO";
type SignalTransition = { from: SignalTargetName; to: SignalTargetName; mix: number };

function smoothProgress(value: number, start: number, end: number) {
  const progress = THREE.MathUtils.clamp((value - start) / Math.max(0.0001, end - start), 0, 1);
  return THREE.MathUtils.smoothstep(progress, 0, 1);
}

function circleTarget(count: number): Vector[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const layer = index % 5;
    const radius = 2.28 + (layer - 2) * 0.027 + Math.sin(angle * 7) * 0.006;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(angle * 3 + layer) * 0.018];
  });
}

function ejectedTarget(count: number): Vector[] {
  return Array.from({ length: count }, (_, index) => {
    const baseAngle = (index / count) * Math.PI * 2;
    const curl = Math.sin(baseAngle * 3 + index * 0.071) * 0.14;
    const angle = baseAngle + curl;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    const horizontalExit = 5.8 / Math.max(0.001, Math.abs(directionX));
    const verticalExit = 3.45 / Math.max(0.001, Math.abs(directionY));
    const distance = Math.min(horizontalExit, verticalExit) + 1.1 + ((index * 13) % 29) / 29 * 1.8;
    return [directionX * distance, directionY * distance, Math.sin(index * 0.19) * 0.7];
  });
}

function resolveTransition(scene: LandingScene, sceneProgress: number): SignalTransition {
  if (scene === "hero") {
    const heroExit = smoothProgress(sceneProgress, 0.08, 0.98);
    return { from: "heroO", to: "ejected", mix: Math.pow(heroExit, 1.65) };
  }
  if (scene === "final") {
    return { from: "ejected", to: "finalO", mix: smoothProgress(sceneProgress, 0.06, 0.92) };
  }

  return { from: "ejected", to: "ejected", mix: 1 };
}

function targetVisibility(target: SignalTargetName) {
  return target === "ejected" ? 0.22 : 1;
}

export function MorphingSignalPoints({ quality }: { quality: LandingQuality }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const count = quality === "high" ? 1320 : 720;

  const targets = useMemo<Record<SignalTargetName, Vector[]>>(() => ({
    heroO: circleTarget(count),
    ejected: ejectedTarget(count),
    finalO: circleTarget(count),
  }), [count]);

  const geometry = useMemo(() => {
    const next = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const mint = new THREE.Color("#7cf0d6");
    const indigo = new THREE.Color("#9aaeff");
    targets.heroO.forEach(([x, y, z], index) => {
      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;
      const color = indigo.clone().lerp(mint, (index % 17) / 24);
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    });
    next.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    next.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return next;
  }, [count, targets]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    const material = materialRef.current;
    if (!points || !material) return;

    const snapshot = getLandingMotionSnapshot();
    const transition = resolveTransition(snapshot.activeScene, snapshot.sceneProgress);
    const fromTarget = targets[transition.from];
    const toTarget = targets[transition.to];
    const position = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const time = state.clock.elapsedTime;
    const layout = LANDING_SIGNAL_SCENE_LAYOUTS[snapshot.activeScene];
    const layoutEase = 1 - Math.exp(-delta * 4.2);
    const isOPhase = transition.from === "heroO" || transition.to === "heroO" || transition.to === "finalO";
    const isEjected = transition.from === "ejected" || transition.to === "ejected";
    const breath = 1 + Math.sin(time * 0.52) * 0.008;
    const currentScale = Math.max(0.001, points.scale.x);
    const pointerLocalX = (snapshot.pointerX * 4.1 - points.position.x) / currentScale;
    const pointerLocalY = (snapshot.pointerY * 2.5 - points.position.y) / currentScale;
    const localPointerStrength = LANDING_SCENE_POINTER_STRENGTHS[snapshot.activeScene];

    for (let index = 0; index < count; index += 1) {
      const from = fromTarget[index];
      const to = toTarget[index];
      let x = THREE.MathUtils.lerp(from[0], to[0], transition.mix);
      let y = THREE.MathUtils.lerp(from[1], to[1], transition.mix);
      let z = THREE.MathUtils.lerp(from[2], to[2], transition.mix);
      const noisePhase = index * 0.173 + time * (0.35 + (index % 7) * 0.01);

      if (isOPhase) {
        const radius = Math.max(0.001, Math.hypot(x, y));
        const angle = Math.atan2(y, x);
        const organicDeformation = Math.sin(angle * 3 + time * 0.28) * 0.011
          + Math.sin(angle * 7 - time * 0.18) * 0.004;
        const radialScale = 1 + organicDeformation;
        const vibration = Math.sin(noisePhase) * 0.004;
        x = x * radialScale + (x / radius) * vibration;
        y = y * radialScale + (y / radius) * vibration;
      } else if (isEjected) {
        const edgeDrift = Math.sin(noisePhase * 0.72) * 0.025;
        x += edgeDrift;
        y += Math.cos(noisePhase * 0.61) * 0.02;
        z += Math.sin(noisePhase * 0.5) * 0.022;
      }

      if (localPointerStrength > 0) {
        const distanceSquared = (x - pointerLocalX) ** 2 + (y - pointerLocalY) ** 2;
        const pointerFalloff = Math.exp(-distanceSquared * 0.78);
        const localBulge = pointerFalloff
          * (0.02 + snapshot.pointerSpeed * 0.01)
          * localPointerStrength;
        x *= 1 + localBulge;
        y *= 1 + localBulge;
        x += (pointerLocalX - x) * localBulge * 0.06;
        y += (pointerLocalY - y) * localBulge * 0.06;
        z += localBulge * 1.35;
      }

      position.setXYZ(index, x, y, z);
    }

    position.needsUpdate = true;
    points.position.x = THREE.MathUtils.lerp(points.position.x, layout.anchorX, layoutEase);
    points.position.y = THREE.MathUtils.lerp(points.position.y, layout.anchorY, layoutEase);
    points.position.z = THREE.MathUtils.lerp(points.position.z, layout.depth, layoutEase);
    points.scale.setScalar(THREE.MathUtils.lerp(points.scale.x, layout.scale * breath, layoutEase));

    const visibility = THREE.MathUtils.lerp(targetVisibility(transition.from), targetVisibility(transition.to), transition.mix);
    material.opacity = THREE.MathUtils.lerp(material.opacity, layout.opacity * visibility, layoutEase);
    const basePointSize = quality === "high" ? 0.032 : 0.04;
    material.size = THREE.MathUtils.lerp(material.size, basePointSize * layout.pointSize, layoutEase);
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={materialRef}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={0.94}
        size={quality === "high" ? 0.032 : 0.04}
        sizeAttenuation
        transparent
        vertexColors
      />
    </points>
  );
}
