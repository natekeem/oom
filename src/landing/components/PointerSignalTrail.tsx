import { useEffect, useRef } from "react";
import { getLandingMotionSnapshot, setLandingMotion, type LandingQuality } from "../landingMotionStore";

type TrailPoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  haloRadius: number;
  coreRadius: number;
  hue: "mint" | "indigo";
};

type Props = { enabled: boolean; quality: LandingQuality };

const trailProfile = {
  fluid: { count: 3, haloRadius: 16, haloOpacity: 0.075, coreRadius: 1.7, coreOpacity: 0.82, decay: 0.032 },
  attract: { count: 2, haloRadius: 14, haloOpacity: 0.06, coreRadius: 1.45, coreOpacity: 0.68, decay: 0.038 },
  parallax: { count: 2, haloRadius: 15, haloOpacity: 0.05, coreRadius: 1.35, coreOpacity: 0.62, decay: 0.04 },
  activate: { count: 2, haloRadius: 12, haloOpacity: 0.055, coreRadius: 1.55, coreOpacity: 0.7, decay: 0.04 },
  tilt: { count: 1, haloRadius: 13, haloOpacity: 0.045, coreRadius: 1.25, coreOpacity: 0.58, decay: 0.043 },
  ambient: { count: 1, haloRadius: 15, haloOpacity: 0.04, coreRadius: 1.2, coreOpacity: 0.54, decay: 0.041 },
  reconverge: { count: 2, haloRadius: 15, haloOpacity: 0.06, coreRadius: 1.6, coreOpacity: 0.74, decay: 0.035 },
  none: { count: 0, haloRadius: 0, haloOpacity: 0, coreRadius: 0, coreOpacity: 0, decay: 1 },
} as const;

export function PointerSignalTrail({ enabled, quality }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const points: TrailPoint[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let lastX = width / 2;
    let lastY = height / 2;
    let animationFrame = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, quality === "high" ? 1.5 : 1.25);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      const velocityX = event.clientX - lastX;
      const velocityY = event.clientY - lastY;
      const speed = Math.min(1, Math.hypot(velocityX, velocityY) / 58);
      lastX = event.clientX;
      lastY = event.clientY;

      setLandingMotion({
        pointerX: event.clientX / Math.max(1, width) * 2 - 1,
        pointerY: -(event.clientY / Math.max(1, height) * 2 - 1),
        pointerSpeed: speed,
      });

      const { cursorMode } = getLandingMotionSnapshot();
      const profile = trailProfile[cursorMode];
      const count = profile.count + (cursorMode === "fluid" ? Math.round(speed * 4) : 0);
      for (let index = 0; index < count; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const push = 0.25 + Math.random() * 1.25;
        points.push({
          x: event.clientX,
          y: event.clientY,
          vx: Math.cos(angle) * push + velocityX * 0.025,
          vy: Math.sin(angle) * push + velocityY * 0.025,
          life: 1,
          haloRadius: profile.haloRadius * (0.82 + Math.random() * 0.36),
          coreRadius: profile.coreRadius * (0.84 + Math.random() * 0.32),
          hue: index % 3 === 0 ? "mint" : "indigo",
        });
      }
      const limit = quality === "high" ? 210 : 120;
      if (points.length > limit) points.splice(0, points.length - limit);
    };

    const onPointerLeave = () => setLandingMotion({ pointerSpeed: 0 });

    const draw = () => {
      animationFrame = window.requestAnimationFrame(draw);
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      const { cursorMode } = getLandingMotionSnapshot();
      const profile = trailProfile[cursorMode];

      for (let index = points.length - 1; index >= 0; index -= 1) {
        const point = points[index];
        point.x += point.vx;
        point.y += point.vy;
        point.vx *= 0.983;
        point.vy *= 0.983;
        point.life -= profile.decay;
        point.haloRadius *= 0.992;

        const gradient = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.haloRadius);
        const color = point.hue === "mint" ? "124,240,214" : "154,174,255";
        gradient.addColorStop(0, `rgba(${color},${Math.max(0, point.life) * profile.haloOpacity})`);
        gradient.addColorStop(0.42, `rgba(${color},${Math.max(0, point.life) * profile.haloOpacity * 0.3})`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(point.x, point.y, point.haloRadius, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = `rgba(${color},${Math.max(0, point.life) * profile.coreOpacity})`;
        context.fillStyle = `rgba(${color},${Math.max(0, point.life) * Math.min(1, profile.coreOpacity + 0.12)})`;
        context.lineCap = "round";
        context.lineWidth = point.coreRadius;
        context.beginPath();
        context.moveTo(point.x - point.vx * 3.4, point.y - point.vy * 3.4);
        context.lineTo(point.x, point.y);
        context.stroke();
        context.beginPath();
        context.arc(point.x, point.y, Math.max(0.7, point.coreRadius * 0.62), 0, Math.PI * 2);
        context.fill();
        if (point.life <= 0) points.splice(index, 1);
      }
      context.globalCompositeOperation = "source-over";
    };

    resize();
    draw();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      setLandingMotion({ pointerX: 0, pointerY: 0, pointerSpeed: 0 });
    };
  }, [enabled, quality]);

  if (!enabled) return null;
  return <canvas aria-hidden="true" className="landing-pointer-field" ref={canvasRef} />;
}
