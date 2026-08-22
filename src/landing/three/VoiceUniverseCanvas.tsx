import { Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { MorphingSignalPoints } from "./MorphingSignalPoints";
import type { LandingQuality } from "../landingMotionStore";

type BoundaryProps = { children: ReactNode; onFail: () => void };
type BoundaryState = { failed: boolean };

class CanvasErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail(); }
  render() { return this.state.failed ? null : this.props.children; }
}

type Props = {
  enabled: boolean;
  onFail: () => void;
  onReady: () => void;
  quality: LandingQuality;
};

export function VoiceUniverseCanvas({ enabled, onFail, onReady, quality }: Props) {
  if (!enabled || quality === "low") return null;
  return (
    <CanvasErrorBoundary onFail={onFail}>
      <div aria-hidden="true" className="landing-webgl-layer">
        <Canvas
          camera={{ fov: 44, position: [0, 0, 7.4] }}
          dpr={[1, quality === "high" ? 1.65 : 1.25]}
          gl={{ alpha: true, antialias: quality === "high", powerPreference: "high-performance" }}
          onCreated={onReady}
        >
          <MorphingSignalPoints quality={quality} />
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
