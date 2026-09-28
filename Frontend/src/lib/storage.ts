import type { AppData } from "@/lib/types.ts";

const KEY = "magic-deck-tracker-v1";

export function loadState(fallback: AppData): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!Array.isArray(parsed.collections) || !Array.isArray(parsed.cards) || !Array.isArray(parsed.decks)) {
      return fallback;
    }
    return {
      collections: parsed.collections,
      cards: parsed.cards,
      decks: parsed.decks,
      game: parsed.game ?? null,
    };
  } catch {
    return fallback;
  }
}

export function saveState(data: AppData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    const slim: AppData = {
      ...data,
      cards: data.cards.map((card) => {
        const next = { ...card };
        delete next.image;
        return next;
      }),
      collections: data.collections.map((collection) => {
        const next = { ...collection };
        delete next.coverImage;
        return next;
      }),
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(slim));
    } catch {
      // A sessão atual continua na memória.
    }
  }
}
