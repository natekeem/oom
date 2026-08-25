import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getLandingMotionSnapshot } from "../landingMotionStore";

type Vec = [number, number, number];

function circleTarget(count: number): Vec[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const wobble = Math.sin(angle * 7) * 0.05;
    const radius = 2.4 + wobble;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
  });
}

function waveTarget(count: number): Vec[] {
  return Array.from({ length: count }, (_, index) => {
    const t = index / Math.max(1, count - 1);
    const x = THREE.MathUtils.lerp(-4.8, 4.8, t);
    const envelope = Math.sin(Math.PI * t);
    const y =
      Math.sin(t * Math.PI * 12) * 0.7 * envelope +
      Math.sin(t * Math.PI * 27) * 0.12;
    return [x, y, 0];
  });
}

function threeBandsTarget(count: number): Vec[] {
  const bandOffsets = [-1.25, 0, 1.25];

  return Array.from({ length: count }, (_, index) => {
    const t = index / Math.max(1, count - 1);
    const band = index % 3;
    const x = THREE.MathUtils.lerp(-4.5, 4.5, t);
    const density = band === 0 ? 0.35 : band === 1 ? 0.55 : 0.8;
    const y =
      bandOffsets[band] +
      Math.sin(t * Math.PI * (8 + band * 3)) * density * 0.38;
    return [x, y, 0];
  });
}

function sixPulseTarget(count: number): Vec[] {
  return Array.from({ length: count }, (_, index) => {
    const t = index / Math.max(1, count - 1);
    const x = THREE.MathUtils.lerp(-4.5, 4.5, t);
    const nearest = Math.round(t * 5) / 5;
    const distance = Math.abs(t - nearest);
    const pulse = Math.exp(-distance * 90) * 0.75;
    return [x, Math.sin(t * Math.PI * 2) * 0.08 + pulse, 0];
  });
}

function recordRingTarget(count: number): Vec[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const radius = 1.45;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      Math.sin(angle * 2) * 0.15,
    ];
  });
}

function targetPair(progress: number) {
  const phases = [
    { start: 0.0, end: 0.23, from: 0, to: 1 },
    { start: 0.23, end: 0.46, from: 1, to: 2 },
    { start: 0.46, end: 0.72, from: 2, to: 3 },
    { start: 0.72, end: 1.0, from: 3, to: 4 },
  ];

  const phase =
    phases.find((item) => progress >= item.start && progress <= item.end) ??
    phases[phases.length - 1];

  const local =
    (progress - phase.start) / Math.max(0.0001, phase.end - phase.start);

  return {
    from: phase.from,
    to: phase.to,
    mix: THREE.MathUtils.smoothstep(local, 0, 1),
  };
}

export function MorphingSignalPoints() {
  const pointsRef = useRef<THREE.Points>(null);

  const count = useMemo(() => {
    const quality = getLandingMotionSnapshot().quality;
    if (quality === "high") return 1200;
    if (quality === "medium") return 700;
    return 260;
  }, []);

  const targets = useMemo(
    () => [
      circleTarget(count),
      waveTarget(count),
      threeBandsTarget(count),
      sixPulseTarget(count),
      recordRingTarget(count),
    ],
    [count],
  );

  const geometry = useMemo(() => {
    const next = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    targets[0].forEach(([x, y, z], index) => {
      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;
    });

    next.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return next;
  }, [count, targets]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const snapshot = getLandingMotionSnapshot();
    const { from, to, mix } = targetPair(snapshot.pageProgress);

    const position = points.geometry.attributes.position as THREE.BufferAttribute;

    for (let index = 0; index < count; index += 1) {
      const a = targets[from][index];
      const b = targets[to][index];

      let x = THREE.MathUtils.lerp(a[0], b[0], mix);
      let y = THREE.MathUtils.lerp(a[1], b[1], mix);
      const z = THREE.MathUtils.lerp(a[2], b[2], mix);

      // Local pointer influence. Keep it subtle so the visual does not detach
      // from the product-story shape.
      const dx = x - snapshot.pointerX * 4;
      const dy = y - snapshot.pointerY * 2.5;
      const distance2 = dx * dx + dy * dy;
      const influence = Math.exp(-distance2 * 0.65) * 0.12;

      x += snapshot.pointerX * influence;
      y += snapshot.pointerY * influence;

      position.setXYZ(index, x, y, z);
    }

    position.needsUpdate = true;

    points.rotation.y += delta * 0.04;
    points.rotation.x = THREE.MathUtils.lerp(
      points.rotation.x,
      snapshot.pointerY * -0.08,
      0.04,
    );
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color="#b8c6ff"
        size={0.032}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
