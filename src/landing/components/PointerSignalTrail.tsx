import { useEffect, useRef } from "react";
import { initAgencyFluidCursor } from "../fluid/agencyFluidCursor";
import { setLandingMotion, type LandingQuality } from "../landingMotionStore";

type Props = { enabled: boolean; quality: LandingQuality };

export function PointerSignalTrail({ enabled, quality }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled || quality === "low") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;

    const onPointerMove = (event: PointerEvent) => {
      const velocityX = event.clientX - lastX;
      const velocityY = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;

      setLandingMotion({
        pointerX: event.clientX / Math.max(1, window.innerWidth) * 2 - 1,
        pointerY: -(event.clientY / Math.max(1, window.innerHeight) * 2 - 1),
        pointerSpeed: Math.min(1, Math.hypot(velocityX, velocityY) / 58),
      });
    };
    const onPointerLeave = () => setLandingMotion({ pointerSpeed: 0 });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    let disposeFluidCursor: (() => void) | undefined;
    try {
      disposeFluidCursor = initAgencyFluidCursor(canvas, quality);
    } catch {
      // The signature object remains interactive if raw WebGL initialization fails.
    }

    return () => {
      disposeFluidCursor?.();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      setLandingMotion({ pointerX: 0, pointerY: 0, pointerSpeed: 0 });
    };
  }, [enabled, quality]);

  if (!enabled) return null;
  return <canvas aria-hidden="true" className="landing-pointer-field landing-fluid-cursor" ref={canvasRef} />;
}
