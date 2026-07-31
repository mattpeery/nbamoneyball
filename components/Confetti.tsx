"use client";

import { useMemo } from "react";

const COLORS = ["#CC0000", "#16A34A", "#F5B400", "#2563EB", "#7C3AED"];

export type ConfettiOrigin = { left: number; right: number; y: number };

export function Confetti({
  origin,
  countPerSide = 65,
}: {
  origin: ConfettiOrigin;
  countPerSide?: number;
}) {
  const pieces = useMemo(() => {
    const fallDistance = (typeof window !== "undefined" ? window.innerHeight : 800) - origin.y + 200;

    const makeSide = (side: "left" | "right") => {
      // Screen coords: 0deg points right, positive angle rotates clockwise (toward +y/down).
      // -135deg = up-and-left, -45deg = up-and-right.
      const baseAngle = side === "left" ? -135 : -45;
      return Array.from({ length: countPerSide }, (_, i) => {
        const angle = ((baseAngle + (Math.random() - 0.5) * 55) * Math.PI) / 180;
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        const power = 170 + Math.random() * 260;

        const x1 = dirX * power;
        const y1 = dirY * power;
        const x2 = x1 + dirX * power * (0.3 + Math.random() * 0.3);
        const y2 = y1 + fallDistance + Math.random() * 150;

        return {
          id: `${side}-${i}`,
          originX: side === "left" ? origin.left : origin.right,
          color: COLORS[i % COLORS.length],
          delay: Math.random() * 0.2,
          duration: 1.7 + Math.random() * 1,
          x1,
          y1,
          x2,
          y2,
          rotate: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
          width: 6 + Math.random() * 6,
          height: 10 + Math.random() * 8,
        };
      });
    };

    return [...makeSide("left"), ...makeSide("right")];
  }, [origin, countPerSide]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute rounded-[1px]"
          style={
            {
              left: p.originX,
              top: origin.y,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--x1": `${p.x1}px`,
              "--y1": `${p.y1}px`,
              "--x2": `${p.x2}px`,
              "--y2": `${p.y2}px`,
              "--rotate": `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
