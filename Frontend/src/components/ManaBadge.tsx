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

const PIP_HEX: Record<string, string> = {
  W: "#f3ead7",
  U: "#3d7ec4",
  B: "#3a3540",
  R: "#c44b3e",
  G: "#2f8a52",
  C: "#c8c2b4",
};

function pipTitle(symbol: string): string {
  if (/^\d+$/.test(symbol)) return `${symbol} de mana genérico`;
  if (/^[WUBRG]\/[WUBRG]$/.test(symbol)) {
    const [left, right] = symbol.split("/");
    return `${COLOR_LABEL[left as ManaColor]} ou ${COLOR_LABEL[right as ManaColor]}`;
  }
  if (/^2\/[WUBRG]$/.test(symbol)) {
    return `Dois genéricos ou ${COLOR_LABEL[symbol.slice(-1) as ManaColor]}`;
  }
  return COLOR_LABEL[symbol as ManaColor] ?? symbol;
}

export function ManaPip({ symbol, className }: { symbol: string; className?: string }) {
  const generic = /^\d+$/.test(symbol);
  const hybrid = /^[WUBRG]\/[WUBRG]$/.test(symbol) || /^2\/[WUBRG]$/.test(symbol);
  const [left, right] = hybrid ? symbol.split("/") : [];
  return (
    <span
      className={cn(
        "inline-grid h-6 min-w-6 place-items-center rounded-full px-1 text-[11px] font-bold leading-none",
        generic ? "bg-[#c8c2b4] text-[#2a2418]" : hybrid ? "text-white" : PIP_CLASS[symbol],
        hybrid ? "min-w-8 text-[10px]" : null,
        className,
      )}
      style={
        hybrid
          ? {
              background: `linear-gradient(90deg, ${PIP_HEX[left ?? "C"] ?? "#c8c2b4"} 50%, ${PIP_HEX[right ?? "C"] ?? "#c8c2b4"} 50%)`,
            }
          : undefined
      }
      title={pipTitle(symbol)}
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
