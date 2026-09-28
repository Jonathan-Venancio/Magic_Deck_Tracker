import { sortColors } from "@/lib/mana.ts";
import type { Card, CardInstance, Collection, Deck, DeckEntry, GameState, ManaColor } from "@/lib/types.ts";

export function deckSize(entries: DeckEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.quantity, 0);
}

export function cardsInDeck(deck: Deck, cards: Card[]): { entry: DeckEntry; card: Card }[] {
  const pairs: { entry: DeckEntry; card: Card }[] = [];
  for (const entry of deck.entries) {
    const card = cards.find((item) => item.id === entry.cardId);
    if (card) pairs.push({ entry, card });
  }
  return pairs;
}

export function deckColors(deck: Deck, cards: Card[]): ManaColor[] {
  const colors = new Set<ManaColor>();
  for (const { card } of cardsInDeck(deck, cards)) {
    card.colors.forEach((color) => colors.add(color));
  }
  return sortColors([...colors]);
}

export interface DeckBreakdown {
  creatures: number;
  spells: number;
  lands: number;
  other: number;
  total: number;
}

export function deckBreakdown(entries: DeckEntry[], cards: Card[]): DeckBreakdown {
  const totals: DeckBreakdown = { creatures: 0, spells: 0, lands: 0, other: 0, total: 0 };
  for (const entry of entries) {
    const card = cards.find((item) => item.id === entry.cardId);
    if (!card) continue;
    totals.total += entry.quantity;
    if (card.category === "creature") totals.creatures += entry.quantity;
    else if (card.category === "land") totals.lands += entry.quantity;
    else if (card.category === "spell") totals.spells += entry.quantity;
    else totals.other += entry.quantity;
  }
  return totals;
}

export function deckCollectionNames(deck: Deck, cards: Card[], collections: Collection[]): string[] {
  const ids = new Set<string>();
  for (const { card } of cardsInDeck(deck, cards)) ids.add(card.collectionId);
  return collections.filter((collection) => ids.has(collection.id)).map((collection) => collection.name);
}

export function deckCardIds(deck: Deck | undefined): Set<string> {
  return new Set(deck?.entries.map((entry) => entry.cardId) ?? []);
}

export function libraryCount(deck: Deck, game: GameState): number {
  const outside = game.hand.length + game.graveyard.length + game.played.length;
  return Math.max(0, deckSize(deck.entries) - outside);
}

export function resolveInstances(instances: CardInstance[], cards: Card[]): { instance: CardInstance; card: Card }[] {
  const resolved: { instance: CardInstance; card: Card }[] = [];
  for (const instance of instances) {
    const card = cards.find((item) => item.id === instance.cardId);
    if (card) resolved.push({ instance, card });
  }
  return resolved;
}

export function ownedCount(cards: Card[], collectionId?: string): number {
  return cards
    .filter((card) => !collectionId || card.collectionId === collectionId)
    .reduce((sum, card) => sum + card.quantity, 0);
}

export function adjustEntries(entries: DeckEntry[], cardId: string, delta: number): DeckEntry[] {
  const current = entries.find((entry) => entry.cardId === cardId);
  const nextQuantity = (current?.quantity ?? 0) + delta;
  if (nextQuantity <= 0) return entries.filter((entry) => entry.cardId !== cardId);
  if (!current) return [...entries, { cardId, quantity: nextQuantity }];
  return entries.map((entry) => (entry.cardId === cardId ? { ...entry, quantity: nextQuantity } : entry));
}
