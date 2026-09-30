import type { ManaColor } from "@/lib/types.ts";

export const COLOR_ORDER: ManaColor[] = ["W", "U", "B", "R", "G"];

export const COLOR_LABEL: Record<ManaColor, string> = {
  W: "Branco",
  U: "Azul",
  B: "Preto",
  R: "Vermelho",
  G: "Verde",
};

export function sortColors(colors: ManaColor[]): ManaColor[] {
  return COLOR_ORDER.filter((color) => colors.includes(color));
}

export function parseMana(cost: string): string[] {
  const cleaned = cost.trim().toUpperCase().replace(/[{}\s]/g, "");
  if (!cleaned) return [];
  const match = cleaned.match(/^(\d+)?([WUBRGCX]*)$/);
  if (!match) return [cleaned];
  const pips: string[] = [];
  if (match[1]) pips.push(match[1]);
  for (const symbol of match[2] ?? "") pips.push(symbol);
  return pips;
}

export function colorsFromMana(cost: string): ManaColor[] {
  const found = new Set<ManaColor>();
  for (const pip of parseMana(cost)) {
    if (pip === "W" || pip === "U" || pip === "B" || pip === "R" || pip === "G") {
      found.add(pip);
    }
  }
  return sortColors([...found]);
}

export function formatColors(colors: ManaColor[]): string {
  const ordered = sortColors(colors);
  if (!ordered.length) return "Incolor";
  return ordered.map((color) => COLOR_LABEL[color]).join(" / ");
}
