"use client";

import { useEffect, useRef, useState } from "react";
import { Plane } from "lucide-react";

type Point = {
  x: number;
  y: number;
};

const TRAIL_LENGTH = 12;

export function SiteCursor() {
  const [enabled, setEnabled] = useState(false);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [trail, setTrail] = useState<Point[]>([]);
  const currentRef = useRef<Point>({ x: 0, y: 0 });
  const targetRef = useRef<Point>({ x: 0, y: 0 });
  const trailRef = useRef<Point[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const updateEnabled = () => setEnabled(mediaQuery.matches);
    updateEnabled();

    mediaQuery.addEventListener?.("change", updateEnabled);
    return () => mediaQuery.removeEventListener?.("change", updateEnabled);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleMove = (event: PointerEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleLeave = () => {
      trailRef.current = [];
      setTrail([]);
    };

    const initialX = window.innerWidth * 0.18;
    const initialY = window.innerHeight * 0.2;
    currentRef.current = { x: initialX, y: initialY };
    targetRef.current = { x: initialX, y: initialY };
    setPosition({ x: initialX, y: initialY });
    setTrail([]);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);

    let animationFrame = 0;

    const animate = () => {
      const current = currentRef.current;
      const target = targetRef.current;
      const dx = target.x - current.x;
      const dy = target.y - current.y;

      // Lower interpolation factor => slower, less sensitive cursor
      const SMOOTHING = 0.06;
      current.x += dx * SMOOTHING;
      current.y += dy * SMOOTHING;

      const nextPoint = { x: current.x, y: current.y };
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      const nextTrail = [nextPoint, ...trailRef.current].slice(0, TRAIL_LENGTH);
      trailRef.current = nextTrail;

      setPosition(nextPoint);
      setRotation(Number.isFinite(angle) ? angle : 0);
      setTrail(nextTrail);

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div className="site-cursor fixed inset-0 z-[1000] pointer-events-none select-none">
      {trail.map((point, index) => {
        const age = index / TRAIL_LENGTH;

        return (
          <span
            key={`${point.x.toFixed(2)}-${point.y.toFixed(2)}-${index}`}
            className="cursor-smoke-puff"
            style={{
              left: `${point.x}px`,
              top: `${point.y}px`,
              opacity: Math.max(0.15, 0.6 - age * 0.5),
              transform: `translate(-50%, -50%) scale(${1 - age * 0.25})`,
              animationDelay: `${index * 0.03}s`,
            }}
          />
        );
      })}

      <div
        className="absolute"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate3d(-50%, -50%, 0) rotate(${rotation}deg)`,
        }}
      >
        <Plane className="h-10 w-10 text-white/70 drop-shadow-[0_0_16px_color-mix(in_oklab,var(--gold)_42%,transparent)]" />
      </div>
    </div>
  );
}
