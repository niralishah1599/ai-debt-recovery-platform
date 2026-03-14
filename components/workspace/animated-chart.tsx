"use client";

import { useEffect, useRef } from "react";

export type ChartPoint = { label: string; value: number };

type Props = {
  points: ChartPoint[];
  max: number;
  colorVar: string;
  format: "currency" | "number";
  ariaLabel?: string;
};

function formatValue(value: number, format: "currency" | "number"): string {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  }
  return String(value);
}

export function AnimatedChart({ points, max, colorVar, format, ariaLabel }: Props) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    barRefs.current.forEach((bar, i) => {
      if (!bar) return;
      const pct = max > 0 ? (points[i].value / max) * 100 : 0;
      timers.push(
        setTimeout(() => {
          if (bar) bar.style.width = `${pct}%`;
        }, 60 + i * 90),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [points, max]);

  return (
    <div className="chart-list" aria-label={ariaLabel}>
      {points.map((point, i) => (
        <div className="chart-row" key={point.label}>
          <span className="chart-label">{point.label}</span>
          <div className="chart-track">
            <div
              ref={(el) => { barRefs.current[i] = el; }}
              className="chart-bar"
              style={{
                width: "0%",
                background: colorVar,
                transition: "width 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
          <span className="chart-value">{formatValue(point.value, format)}</span>
        </div>
      ))}
    </div>
  );
}
