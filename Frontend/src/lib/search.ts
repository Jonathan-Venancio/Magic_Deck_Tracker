import { foldText, normalizeNumber } from "@/lib/format.ts";
import type { Card, CardCategory, ManaColor } from "@/lib/types.ts";

export interface SearchOptions {
  deckCardIds?: Set<string>;
  collectionId?: string;
  color?: ManaColor | "all";
  category?: CardCategory | "all";
}

function matchesQuery(card: Card, query: string): boolean {
  const foldedQuery = foldText(query.replace(/^#/, ""));
  if (foldedQuery && foldText(card.name).includes(foldedQuery)) return true;
  if (/^#?\d+$/.test(query)) {
    return normalizeNumber(card.number) === normalizeNumber(query);
  }
  const digits = query.replace(/\D/g, "");
  if (!digits) return false;
  return card.number.includes(digits);
}

function score(card: Card, query: string, deckCardIds?: Set<string>): number {
  const inDeck = deckCardIds?.has(card.id) ? 0 : 10;
  if (!query) return inDeck;
  const numeric = /^#?\d+$/.test(query);
  if (numeric && normalizeNumber(card.number) === normalizeNumber(query)) return inDeck;
  const foldedName = foldText(card.name);
  const foldedQuery = foldText(query.replace(/^#/, ""));
  if (foldedName.startsWith(foldedQuery)) return 20 + inDeck;
  return 30 + inDeck;
}

export function searchCards(cards: Card[], query: string, options: SearchOptions = {}): Card[] {
  const trimmed = query.trim();
  const filtered = cards.filter((card) => {
    if (options.collectionId && options.collectionId !== "all" && card.collectionId !== options.collectionId) {
      return false;
    }
    if (options.color && options.color !== "all" && !card.colors.includes(options.color)) return false;
    if (options.category && options.category !== "all" && card.category !== options.category) return false;
    if (!trimmed) return true;
    return matchesQuery(card, trimmed);
  });

  return filtered.sort((left, right) => {
    const diff = score(left, trimmed, options.deckCardIds) - score(right, trimmed, options.deckCardIds);
    if (diff !== 0) return diff;
    const numberDiff = parseInt(left.number, 10) - parseInt(right.number, 10);
    if (numberDiff !== 0) return numberDiff;
    return left.name.localeCompare(right.name, "pt-BR");
  });
}
