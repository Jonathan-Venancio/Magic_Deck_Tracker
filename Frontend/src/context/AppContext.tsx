import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { createMockData } from "@/data/mock.ts";
import { adjustEntries } from "@/lib/deck.ts";
import { normalizeNumber } from "@/lib/format.ts";
import { loadState, saveState } from "@/lib/storage.ts";
import type {
  AppData,
  Card,
  CardDraft,
  Collection,
  CollectionDraft,
  Deck,
  DeckDraft,
} from "@/lib/types.ts";
import { createId } from "@/lib/utils.ts";

type Action =
  | { type: "add-collection"; collection: Collection }
  | { type: "add-card"; card: Card }
  | { type: "update-card"; card: Card }
  | { type: "add-deck"; deck: Deck }
  | { type: "update-deck"; deck: Deck }
  | { type: "adjust-deck"; deckId: string; cardId: string; delta: number }
  | { type: "start-setup"; deckId: string; at: string }
  | { type: "add-instance"; instanceId: string; cardId: string }
  | { type: "remove-instance"; instanceId: string }
  | { type: "begin"; at: string }
  | { type: "play"; instanceId: string }
  | { type: "discard"; instanceId: string }
  | { type: "restart" }
  | { type: "end"; at: string };

type SaveResult<T> = { ok: true; value: T } | { ok: false; message: string };

interface AppContextValue extends AppData {
  addCollection: (draft: CollectionDraft) => SaveResult<Collection>;
  addCard: (draft: CardDraft) => SaveResult<Card>;
  updateCard: (id: string, draft: CardDraft) => SaveResult<Card>;
  addDeck: (draft: DeckDraft) => SaveResult<Deck>;
  updateDeck: (id: string, draft: DeckDraft) => SaveResult<Deck>;
  adjustDeckCard: (deckId: string, cardId: string, delta: number) => void;
  startSetup: (deckId: string) => void;
  addToHand: (cardId: string) => string | null;
  removeFromHand: (instanceId: string) => void;
  beginMatch: () => void;
  playCard: (instanceId: string) => void;
  discardCard: (instanceId: string) => void;
  restartMatch: () => void;
  endMatch: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function touchDeck(decks: Deck[], deckId: string, at: string): Deck[] {
  return decks.map((deck) => (deck.id === deckId ? { ...deck, lastUsedAt: at } : deck));
}

function withoutEmptyImage<T extends { image?: string }>(value: T): T {
  if (!value.image) {
    const next = { ...value };
    delete next.image;
    return next;
  }
  return value;
}

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "add-collection":
      return { ...state, collections: [...state.collections, action.collection] };
    case "add-card":
      return { ...state, cards: [...state.cards, action.card] };
    case "update-card":
      return {
        ...state,
        cards: state.cards.map((card) => (card.id === action.card.id ? action.card : card)),
      };
    case "add-deck":
      return { ...state, decks: [action.deck, ...state.decks] };
    case "update-deck":
      return {
        ...state,
        decks: state.decks.map((deck) => (deck.id === action.deck.id ? action.deck : deck)),
      };
    case "adjust-deck":
      return {
        ...state,
        decks: state.decks.map((deck) =>
          deck.id === action.deckId
            ? { ...deck, entries: adjustEntries(deck.entries, action.cardId, action.delta) }
            : deck,
        ),
      };
    case "start-setup":
      return {
        ...state,
        decks: touchDeck(state.decks, action.deckId, action.at),
        game: {
          deckId: action.deckId,
          phase: "setup",
          hand: [],
          graveyard: [],
          played: [],
          startedAt: action.at,
        },
      };
    case "add-instance":
      if (!state.game) return state;
      return {
        ...state,
        game: {
          ...state.game,
          hand: [...state.game.hand, { instanceId: action.instanceId, cardId: action.cardId }],
        },
      };
    case "remove-instance":
      if (!state.game) return state;
      return {
        ...state,
        game: {
          ...state.game,
          hand: state.game.hand.filter((item) => item.instanceId !== action.instanceId),
        },
      };
    case "begin":
      if (!state.game) return state;
      return {
        ...state,
        decks: touchDeck(state.decks, state.game.deckId, action.at),
        game: { ...state.game, phase: "active" },
      };
    case "play":
    case "discard": {
      if (!state.game) return state;
      const instance = state.game.hand.find((item) => item.instanceId === action.instanceId);
      if (!instance) return state;
      const hand = state.game.hand.filter((item) => item.instanceId !== action.instanceId);
      if (action.type === "play") {
        return { ...state, game: { ...state.game, hand, played: [...state.game.played, instance] } };
      }
      return { ...state, game: { ...state.game, hand, graveyard: [...state.game.graveyard, instance] } };
    }
    case "restart":
      if (!state.game) return state;
      return {
        ...state,
        game: { ...state.game, phase: "setup", hand: [], graveyard: [], played: [] },
      };
    case "end":
      if (!state.game) return { ...state, game: null };
      return {
        ...state,
        game: null,
        decks: touchDeck(state.decks, state.game.deckId, action.at),
      };
    default:
      return state;
  }
}

function duplicateNumber(cards: Card[], collectionId: string, number: string, ignoreId?: string) {
  const normalized = normalizeNumber(number);
  return cards.some(
    (card) =>
      card.id !== ignoreId &&
      card.collectionId === collectionId &&
      normalizeNumber(card.number) === normalized,
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState(createMockData()));

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value: AppContextValue = {
    ...state,
    addCollection(draft) {
      const name = draft.name.trim();
      if (!name) return { ok: false, message: "Dê um nome à coleção." };
      const collection: Collection = {
        id: createId(),
        name,
        code: draft.code.trim().toUpperCase(),
        description: draft.description.trim(),
        createdAt: new Date().toISOString(),
      };
      if (draft.coverImage) collection.coverImage = draft.coverImage;
      dispatch({ type: "add-collection", collection });
      return { ok: true, value: collection };
    },
    addCard(draft) {
      const name = draft.name.trim();
      if (!name || !draft.collectionId || !normalizeNumber(draft.number)) {
        return { ok: false, message: "Preencha nome, coleção e número." };
      }
      if (duplicateNumber(state.cards, draft.collectionId, draft.number)) {
        return { ok: false, message: "Já existe uma carta com esse número nesta coleção." };
      }
      const card = withoutEmptyImage({
        ...draft,
        id: createId(),
        name,
        number: normalizeNumber(draft.number),
        typeLine: draft.typeLine.trim(),
        manaCost: draft.manaCost.trim().toUpperCase(),
        text: draft.text.trim(),
        quantity: Math.max(1, draft.quantity),
        createdAt: new Date().toISOString(),
      });
      dispatch({ type: "add-card", card });
      return { ok: true, value: card };
    },
    updateCard(id, draft) {
      const current = state.cards.find((card) => card.id === id);
      if (!current) return { ok: false, message: "Carta não encontrada." };
      const name = draft.name.trim();
      if (!name || !draft.collectionId || !normalizeNumber(draft.number)) {
        return { ok: false, message: "Preencha nome, coleção e número." };
      }
      if (duplicateNumber(state.cards, draft.collectionId, draft.number, id)) {
        return { ok: false, message: "Já existe uma carta com esse número nesta coleção." };
      }
      const card = withoutEmptyImage({
        ...current,
        ...draft,
        name,
        number: normalizeNumber(draft.number),
        typeLine: draft.typeLine.trim(),
        manaCost: draft.manaCost.trim().toUpperCase(),
        text: draft.text.trim(),
        quantity: Math.max(1, draft.quantity),
      });
      dispatch({ type: "update-card", card });
      return { ok: true, value: card };
    },
    addDeck(draft) {
      const name = draft.name.trim();
      if (!name) return { ok: false, message: "Dê um nome ao deck." };
      if (!draft.entries.length) return { ok: false, message: "Adicione pelo menos uma carta." };
      const deck: Deck = {
        id: createId(),
        name,
        entries: draft.entries,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "add-deck", deck });
      return { ok: true, value: deck };
    },
    updateDeck(id, draft) {
      const current = state.decks.find((deck) => deck.id === id);
      if (!current) return { ok: false, message: "Deck não encontrado." };
      const name = draft.name.trim();
      if (!name) return { ok: false, message: "Dê um nome ao deck." };
      if (!draft.entries.length) return { ok: false, message: "Adicione pelo menos uma carta." };
      const deck: Deck = { ...current, name, entries: draft.entries };
      dispatch({ type: "update-deck", deck });
      return { ok: true, value: deck };
    },
    adjustDeckCard(deckId, cardId, delta) {
      dispatch({ type: "adjust-deck", deckId, cardId, delta });
    },
    startSetup(deckId) {
      dispatch({ type: "start-setup", deckId, at: new Date().toISOString() });
    },
    addToHand(cardId) {
      if (!state.game) return null;
      const instanceId = createId();
      dispatch({ type: "add-instance", instanceId, cardId });
      return instanceId;
    },
    removeFromHand(instanceId) {
      dispatch({ type: "remove-instance", instanceId });
    },
    beginMatch() {
      dispatch({ type: "begin", at: new Date().toISOString() });
    },
    playCard(instanceId) {
      dispatch({ type: "play", instanceId });
    },
    discardCard(instanceId) {
      dispatch({ type: "discard", instanceId });
    },
    restartMatch() {
      dispatch({ type: "restart" });
    },
    endMatch() {
      dispatch({ type: "end", at: new Date().toISOString() });
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp precisa estar dentro de AppProvider.");
  return context;
}
