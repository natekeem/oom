import { Canvas } from "@react-three/fiber";
import { MorphingSignalPoints } from "./MorphingSignalPoints";
import type { LandingQuality } from "../landingMotionStore";

type Props = {
  quality: LandingQuality;
  reducedMotion: boolean;
};

export function VoiceUniverseCanvas({ quality, reducedMotion }: Props) {
  if (reducedMotion || quality === "low") {
    return null;
  }

  const maxDpr = quality === "high" ? 1.75 : 1.25;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    >
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        dpr={[1, maxDpr]}
        gl={{
          alpha: true,
          antialias: quality === "high",
          powerPreference: "high-performance",
        }}
      >
        <MorphingSignalPoints />
      </Canvas>
    </div>
  );
}
