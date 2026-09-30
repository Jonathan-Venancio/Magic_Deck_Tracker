export type ManaColor = "W" | "U" | "B" | "R" | "G";

export type CardCategory = "creature" | "spell" | "land" | "other";

export interface Collection {
  id: string;
  name: string;
  code: string;
  description: string;
  coverImage?: string;
  createdAt: string;
}

export interface Card {
  id: string;
  name: string;
  collectionId: string;
  number: string;
  typeLine: string;
  category: CardCategory;
  manaCost: string;
  colors: ManaColor[];
  quantity: number;
  text: string;
  image?: string;
  createdAt: string;
}

export interface DeckEntry {
  cardId: string;
  quantity: number;
}

export interface Deck {
  id: string;
  name: string;
  entries: DeckEntry[];
  lastUsedAt?: string;
  createdAt: string;
}

export interface CardInstance {
  instanceId: string;
  cardId: string;
}

export interface GameState {
  deckId: string;
  phase: "setup" | "active";
  hand: CardInstance[];
  graveyard: CardInstance[];
  played: CardInstance[];
  startedAt: string;
}

export interface AppData {
  collections: Collection[];
  cards: Card[];
  decks: Deck[];
  game: GameState | null;
}

export interface CardDraft {
  name: string;
  collectionId: string;
  number: string;
  typeLine: string;
  category: CardCategory;
  manaCost: string;
  colors: ManaColor[];
  quantity: number;
  text: string;
  image?: string;
}

export interface CollectionDraft {
  name: string;
  code: string;
  description: string;
  coverImage?: string;
}

export interface DeckDraft {
  name: string;
  entries: DeckEntry[];
}

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportSummary {
  created: number;
  updated: number;
  collectionsCreated: number;
  errors: ImportError[];
}
