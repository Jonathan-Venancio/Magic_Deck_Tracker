import type { ManaColor } from "@/lib/types.ts";

export const COLOR_ORDER: ManaColor[] = ["W", "U", "B", "R", "G"];

export const COLOR_LABEL: Record<ManaColor, string> = {
  W: "Branco",
  U: "Azul",
  B: "Preto",
  R: "Vermelho",
  G: "Verde",
};

const COLOR_LETTERS = "WUBRG";
const PIP_LETTERS = "WUBRGCX";

export function sortColors(colors: ManaColor[]): ManaColor[] {
  return COLOR_ORDER.filter((color) => colors.includes(color));
}

function isColor(value: string): value is ManaColor {
  return value === "W" || value === "U" || value === "B" || value === "R" || value === "G";
}

function sortHybrid(left: string, right: string): string {
  if (isColor(left) && isColor(right) && left !== right) {
    return sortColors([left, right]).join("/");
  }
  return `${left}/${right}`;
}

function normalizePip(raw: string): string {
  const pip = raw.trim().toUpperCase();
  if (/^\d+$/.test(pip)) return pip;
  if (/^[WUBRG]\/[WUBRG]$/.test(pip)) {
    const [left, right] = pip.split("/");
    return sortHybrid(left, right);
  }
  if (/^2\/[WUBRG]$/.test(pip)) return pip;
  if (pip.length === 1 && PIP_LETTERS.includes(pip)) return pip;
  return pip;
}

export function parseMana(cost: string): string[] {
  const compact = cost.trim().toUpperCase().replace(/\s+/g, "");
  if (!compact) return [];
  const braces = [...compact.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
  if (braces.length) return braces.map(normalizePip);
  const body = compact.replace(/[{}]/g, "");
  const pips: string[] = [];
  let index = 0;
  while (index < body.length) {
    const char = body[index] ?? "";
    if (/\d/.test(char)) {
      let end = index;
      while (end < body.length && /\d/.test(body[end] ?? "")) end += 1;
      const next = body[end] ?? "";
      const after = body[end + 1] ?? "";
      if (next === "/" && COLOR_LETTERS.includes(after)) {
        pips.push(normalizePip(body.slice(index, end + 2)));
        index = end + 2;
        continue;
      }
      pips.push(body.slice(index, end));
      index = end;
      continue;
    }
    const second = body[index + 1] ?? "";
    const third = body[index + 2] ?? "";
    if (COLOR_LETTERS.includes(char) && second === "/" && COLOR_LETTERS.includes(third)) {
      pips.push(normalizePip(body.slice(index, index + 3)));
      index += 3;
      continue;
    }
    if (PIP_LETTERS.includes(char)) {
      pips.push(char);
      index += 1;
      continue;
    }
    pips.push(body.slice(index));
    break;
  }
  return pips;
}

export function colorsFromMana(cost: string): ManaColor[] {
  const found = new Set<ManaColor>();
  for (const pip of parseMana(cost)) {
    for (const symbol of pip.replaceAll("/", "")) {
      if (isColor(symbol)) found.add(symbol);
    }
  }
  return sortColors([...found]);
}

export function formatColors(colors: ManaColor[]): string {
  const ordered = sortColors(colors);
  if (!ordered.length) return "Incolor";
  return ordered.map((color) => COLOR_LABEL[color]).join(" / ");
}
