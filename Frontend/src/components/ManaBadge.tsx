import type { ManaColor } from "@/lib/types.ts";
import { COLOR_LABEL, parseMana, sortColors } from "@/lib/mana.ts";
import { cn } from "@/lib/utils.ts";

const PIP_CLASS: Record<string, string> = {
  W: "bg-[#f3ead7] text-[#2a2418]",
  U: "bg-[#3d7ec4] text-white",
  B: "bg-[#3a3540] text-foreground ring-1 ring-white/25",
  R: "bg-[#c44b3e] text-white",
  G: "bg-[#2f8a52] text-white",
  C: "bg-[#c8c2b4] text-[#2a2418]",
};

export function ManaPip({ symbol, className }: { symbol: string; className?: string }) {
  const generic = /^\d+$/.test(symbol);
  return (
    <span
      className={cn(
        "inline-grid size-6 place-items-center rounded-full text-[11px] font-bold leading-none",
        generic ? "bg-[#c8c2b4] text-[#2a2418]" : PIP_CLASS[symbol],
        className,
      )}
      title={generic ? `${symbol} de mana genérico` : symbol}
    >
      {symbol}
    </span>
  );
}

export function ManaBadge({ cost }: { cost: string }) {
  const pips = parseMana(cost);
  if (!pips.length) return <span className="text-muted">—</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {pips.map((pip, index) => (
        <ManaPip key={`${pip}-${index}`} symbol={pip} />
      ))}
    </span>
  );
}

export function ColorPips({
  colors,
  names = false,
  className,
}: {
  colors: ManaColor[];
  names?: boolean;
  className?: string;
}) {
  const ordered = sortColors(colors);
  if (!ordered.length) return <span className={cn("text-sm text-muted", className)}>Incolor</span>;
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {ordered.map((color) => (
        <ManaPip key={color} symbol={color} />
      ))}
      {names ? <span className="text-sm text-muted">{ordered.map((color) => COLOR_LABEL[color]).join(" / ")}</span> : null}
    </span>
  );
}
