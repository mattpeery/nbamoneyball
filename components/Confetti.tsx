"use client";

import { useMemo } from "react";

const COLORS = ["#CC0000", "#16A34A", "#F5B400", "#2563EB", "#7C3AED"];

export function Confetti({ count = 110 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2.4 + Math.random() * 1.6,
        color: COLORS[i % COLORS.length],
        rotate: 360 + Math.random() * 360,
        drift: (Math.random() - 0.5) * 160,
        width: 6 + Math.random() * 6,
        height: 10 + Math.random() * 8,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-[-5%] rounded-[1px]"
          style={
            {
              left: `${p.left}%`,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--rotate": `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
