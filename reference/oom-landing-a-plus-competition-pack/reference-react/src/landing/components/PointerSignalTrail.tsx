import { useEffect, useRef } from "react";
import { setLandingMotion } from "../landingMotionStore";

type TrailPoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
};

type Props = {
  enabled: boolean;
};

export function PointerSignalTrail({ enabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const points: TrailPoint[] = [];
    let frame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let lastX = width / 2;
    let lastY = height / 2;
    let raf = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onPointerMove(event: PointerEvent) {
      const vx = event.clientX - lastX;
      const vy = event.clientY - lastY;
      const speed = Math.min(1, Math.hypot(vx, vy) / 60);

      lastX = event.clientX;
      lastY = event.clientY;

      setLandingMotion({
        pointerX: event.clientX / width * 2 - 1,
        pointerY: -(event.clientY / height * 2 - 1),
        pointerSpeed: speed,
      });

      for (let index = 0; index < 4 + Math.round(speed * 4); index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const push = 0.3 + Math.random() * 1.8;

        points.push({
          x: event.clientX,
          y: event.clientY,
          vx: Math.cos(angle) * push + vx * 0.03,
          vy: Math.sin(angle) * push + vy * 0.03,
          life: 1,
          radius: 18 + Math.random() * 34,
        });
      }

      if (points.length > 240) {
        points.splice(0, points.length - 240);
      }
    }

    function draw() {
      raf = requestAnimationFrame(draw);
      frame += 1;

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      for (let index = points.length - 1; index >= 0; index -= 1) {
        const point = points[index];

        point.x += point.vx;
        point.y += point.vy;
        point.vx *= 0.985;
        point.vy *= 0.985;
        point.life -= 0.018;
        point.radius *= 0.995;

        const gradient = context.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          point.radius,
        );

        gradient.addColorStop(
          0,
          `rgba(145, 167, 255, ${point.life * 0.11})`,
        );
        gradient.addColorStop(
          0.5,
          `rgba(124, 240, 214, ${point.life * 0.04})`,
        );
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fill();

        if (point.life <= 0) {
          points.splice(index, 1);
        }
      }

      context.globalCompositeOperation = "source-over";
    }

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
    />
  );
}
