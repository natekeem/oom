import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getLandingMotionSnapshot, type LandingQuality } from "../landingMotionStore";

type Vector = [number, number, number];

function circleTarget(count: number, clarity = 0): Vector[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const layer = index % 5;
    const radius = 2.16 + (layer - 2) * 0.035 + Math.sin(angle * 7) * (0.045 - clarity * 0.025);
    const depth = Math.sin(angle * 3 + layer) * 0.12 * (1 - clarity * 0.5);
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, depth];
  });
}

function voiceCircleTarget(count: number): Vector[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const frequency = Math.sin(angle * 13) * 0.13 + Math.sin(angle * 29) * 0.035;
    const radius = 2.18 + frequency;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(angle * 4) * 0.2];
  });
}

function waveformTarget(count: number): Vector[] {
  return Array.from({ length: count }, (_, index) => {
    const t = index / Math.max(1, count - 1);
    const x = THREE.MathUtils.lerp(-4.65, 4.65, t);
    const envelope = Math.pow(Math.sin(Math.PI * t), 0.65);
    const y = (Math.sin(t * Math.PI * 12) * 0.68 + Math.sin(t * Math.PI * 31) * 0.13) * envelope;
    return [x, y, Math.sin(t * Math.PI * 8) * 0.12];
  });
}

function branchTarget(count: number): Vector[] {
  const branchOffsets = [-1.5, -0.5, 0.5, 1.5];
  return Array.from({ length: count }, (_, index) => {
    const t = index / Math.max(1, count - 1);
    const branch = index % branchOffsets.length;
    const split = THREE.MathUtils.smoothstep(t, 0.22, 0.78);
    const x = THREE.MathUtils.lerp(-4.55, 4.55, t);
    const y = Math.sin(t * Math.PI * 10) * 0.2 + branchOffsets[branch] * split * 0.52;
    return [x, y, (branch - 1.5) * 0.12 * split];
  });
}

function threeBandsTarget(count: number): Vector[] {
  const offsets = [-1.28, 0, 1.28];
  return Array.from({ length: count }, (_, index) => {
    const t = index / Math.max(1, count - 1);
    const band = index % 3;
    const amplitude = [0.14, 0.25, 0.42][band];
    const frequency = [7, 10, 14][band];
    return [THREE.MathUtils.lerp(-4.5, 4.5, t), offsets[band] + Math.sin(t * Math.PI * frequency) * amplitude, (band - 1) * 0.16];
  });
}

function sixPulseTarget(count: number): Vector[] {
  return Array.from({ length: count }, (_, index) => {
    const t = index / Math.max(1, count - 1);
    const nearest = Math.round(t * 5) / 5;
    const distance = Math.abs(t - nearest);
    const pulse = Math.exp(-distance * 115) * (index % 2 === 0 ? 0.72 : -0.48);
    return [THREE.MathUtils.lerp(-4.45, 4.45, t), pulse + Math.sin(t * Math.PI * 4) * 0.04, Math.cos(t * Math.PI * 12) * 0.06];
  });
}

function recordRingTarget(count: number): Vector[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const ring = index % 4;
    const radius = 1.38 + ring * 0.035;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(angle * 2) * 0.18];
  });
}

function examSignalTarget(count: number): Vector[] {
  return Array.from({ length: count }, (_, index) => {
    const t = index / Math.max(1, count - 1);
    const lane = index % 3;
    const offsets = [-0.72, 0, 0.72];
    const signal = lane === 1 ? Math.sin(t * Math.PI * 22) * 0.24 : Math.sin(t * Math.PI * 8) * 0.08;
    return [THREE.MathUtils.lerp(-4.2, 4.2, t), offsets[lane] + signal, (lane - 1) * 0.12];
  });
}

const intervals = [0, 0.08, 0.19, 0.3, 0.43, 0.57, 0.69, 0.84, 1];

function targetPair(progress: number) {
  let from = intervals.length - 2;
  for (let index = 0; index < intervals.length - 1; index += 1) {
    if (progress <= intervals[index + 1]) {
      from = index;
      break;
    }
  }
  const start = intervals[from];
  const end = intervals[from + 1];
  const local = THREE.MathUtils.clamp((progress - start) / Math.max(0.0001, end - start), 0, 1);
  return { from, to: from + 1, mix: THREE.MathUtils.smoothstep(local, 0, 1) };
}

export function MorphingSignalPoints({ quality }: { quality: LandingQuality }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = quality === "high" ? 1320 : 720;

  const targets = useMemo(() => [
    circleTarget(count),
    voiceCircleTarget(count),
    waveformTarget(count),
    branchTarget(count),
    threeBandsTarget(count),
    sixPulseTarget(count),
    recordRingTarget(count),
    examSignalTarget(count),
    circleTarget(count, 1),
  ], [count]);

  const geometry = useMemo(() => {
    const next = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const mint = new THREE.Color("#7cf0d6");
    const indigo = new THREE.Color("#9aaeff");
    targets[0].forEach(([x, y, z], index) => {
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
    if (!points) return;
    const snapshot = getLandingMotionSnapshot();
    const { from, to, mix } = targetPair(snapshot.pageProgress);
    const position = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const breath = Math.sin(state.clock.elapsedTime * 0.9) * 0.012;

    for (let index = 0; index < count; index += 1) {
      const a = targets[from][index];
      const b = targets[to][index];
      let x = THREE.MathUtils.lerp(a[0], b[0], mix);
      let y = THREE.MathUtils.lerp(a[1], b[1], mix);
      let z = THREE.MathUtils.lerp(a[2], b[2], mix);
      if (snapshot.cursorMode === "fluid" || snapshot.cursorMode === "attract") {
        const pointerX = snapshot.pointerX * 4.1;
        const pointerY = snapshot.pointerY * 2.5;
        const distanceSquared = (x - pointerX) ** 2 + (y - pointerY) ** 2;
        const influence = Math.exp(-distanceSquared * 0.68) * (0.08 + snapshot.pointerSpeed * 0.09);
        x += snapshot.pointerX * influence;
        y += snapshot.pointerY * influence;
        z += influence * 0.8;
      }
      position.setXYZ(index, x, y, z);
    }
    position.needsUpdate = true;
    points.scale.setScalar(1 + breath * (snapshot.pageProgress < 0.1 || snapshot.pageProgress > 0.9 ? 1 : 0.25));
    points.rotation.y += delta * (snapshot.pageProgress < 0.12 ? 0.055 : 0.018);
    const targetRotationX = snapshot.cursorMode === "parallax" ? snapshot.pointerY * -0.08 : 0;
    const targetRotationZ = snapshot.cursorMode === "parallax" ? snapshot.pointerX * 0.035 : 0;
    points.rotation.x = THREE.MathUtils.lerp(points.rotation.x, targetRotationX, 0.045);
    points.rotation.z = THREE.MathUtils.lerp(points.rotation.z, targetRotationZ, 0.045);
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={0.9}
        size={quality === "high" ? 0.032 : 0.04}
        sizeAttenuation
        transparent
        vertexColors
      />
    </points>
  );
}
