import { useEffect, useRef } from "react";
import { getLandingMotionSnapshot, setLandingMotion, type LandingQuality } from "../landingMotionStore";

type TrailPoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
  hue: "mint" | "indigo";
};

type Props = { enabled: boolean; quality: LandingQuality };

const trailProfile = {
  fluid: { count: 3, radius: 26, opacity: 0.11, decay: 0.019 },
  attract: { count: 2, radius: 22, opacity: 0.075, decay: 0.025 },
  parallax: { count: 1, radius: 30, opacity: 0.06, decay: 0.026 },
  activate: { count: 1, radius: 15, opacity: 0.085, decay: 0.026 },
  tilt: { count: 1, radius: 24, opacity: 0.055, decay: 0.028 },
  ambient: { count: 1, radius: 34, opacity: 0.045, decay: 0.024 },
  reconverge: { count: 2, radius: 25, opacity: 0.07, decay: 0.022 },
  none: { count: 0, radius: 0, opacity: 0, decay: 1 },
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
          radius: profile.radius * (0.72 + Math.random() * 0.56),
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
        point.radius *= 0.994;

        const gradient = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius);
        const color = point.hue === "mint" ? "124,240,214" : "154,174,255";
        gradient.addColorStop(0, `rgba(${color},${Math.max(0, point.life) * profile.opacity})`);
        gradient.addColorStop(0.46, `rgba(${color},${Math.max(0, point.life) * profile.opacity * 0.32})`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
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
