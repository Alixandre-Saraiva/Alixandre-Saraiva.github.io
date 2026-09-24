"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Stars({ value, size = 16, showValue, count, className }: { value: number; size?: number; showValue?: boolean; count?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`Nota ${value.toFixed(1)} de 5`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, value - (i - 1)));
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star className="absolute inset-0 text-line" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="text-accent" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && <span className="text-sm font-semibold text-ink">{value > 0 ? value.toFixed(1).replace(".", ",") : "Novo"}</span>}
      {count != null && <span className="text-xs text-muted">({count})</span>}
    </div>
  );
}

export function StarInput({ name, defaultValue = 0 }: { name: string; defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const labels = ["", "Ruim", "Regular", "Bom", "Muito bom", "Excelente"];
  const shown = hover || value;
  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={value} />
      <div className="flex" role="radiogroup" aria-label="Sua nota" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} estrela${i > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => setValue(i)}
            className="p-0.5 transition-transform active:scale-90"
          >
            <Star className={cn("size-8 transition-colors", i <= shown ? "text-accent" : "text-line")} fill="currentColor" strokeWidth={0} />
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-muted">{labels[shown]}</span>
    </div>
  );
}
