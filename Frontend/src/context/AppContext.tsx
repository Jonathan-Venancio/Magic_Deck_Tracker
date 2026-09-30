import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { ApiError, api, normalizeAppData } from "@/lib/api.ts";
import type { AppData, Card, CardDraft, Collection, CollectionDraft, Deck, DeckDraft, ImportSummary } from "@/lib/types.ts";

type SaveResult<T> = { ok: true; value: T } | { ok: false; message: string };

interface AppContextValue extends AppData {
  ready: boolean;
  addCollection: (draft: CollectionDraft) => Promise<SaveResult<Collection>>;
  deleteCollection: (id: string) => Promise<SaveResult<true>>;
  addCard: (draft: CardDraft) => Promise<SaveResult<Card>>;
  updateCard: (id: string, draft: CardDraft) => Promise<SaveResult<Card>>;
  deleteCard: (id: string) => Promise<SaveResult<true>>;
  importCards: (file: File) => Promise<SaveResult<ImportSummary>>;
  addDeck: (draft: DeckDraft) => Promise<SaveResult<Deck>>;
  updateDeck: (id: string, draft: DeckDraft) => Promise<SaveResult<Deck>>;
  deleteDeck: (id: string) => Promise<SaveResult<true>>;
  adjustDeckCard: (deckId: string, cardId: string, delta: number) => Promise<void>;
  startSetup: (deckId: string) => Promise<void>;
  addToHand: (cardId: string) => Promise<string | null>;
  removeFromHand: (instanceId: string) => Promise<void>;
  beginMatch: () => Promise<void>;
  playCard: (instanceId: string) => Promise<void>;
  discardCard: (instanceId: string) => Promise<void>;
  restartMatch: () => Promise<void>;
  endMatch: () => Promise<void>;
}

const EMPTY: AppData = { collections: [], cards: [], decks: [], game: null };
const AppContext = createContext<AppContextValue | null>(null);

function failMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

async function asSaveResult<T>(run: () => Promise<T>): Promise<SaveResult<T>> {
  try {
    return { ok: true, value: await run() };
  } catch (error) {
    return { ok: false, message: failMessage(error, "Não foi possível salvar.") };
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppData>(EMPTY);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  const apply = useCallback((data: AppData) => {
    setState(normalizeAppData(data));
  }, []);

  const load = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      apply(await api.getState());
      setStatus("ready");
    } catch (err) {
      setError(failMessage(err, "Não foi possível conectar ao servidor."));
      setStatus("error");
    }
  }, [apply]);

  useEffect(() => {
    void load();
  }, [load]);

  const value: AppContextValue = {
    ...state,
    ready: status === "ready",
    async addCollection(draft) {
      return asSaveResult(async () => {
        const data = await api.addCollection(draft);
        apply(data);
        return data.value as Collection;
      });
    },
    async deleteCollection(id) {
      return asSaveResult(async () => {
        apply(await api.deleteCollection(id));
        return true as const;
      });
    },
    async addCard(draft) {
      return asSaveResult(async () => {
        const data = await api.addCard(draft);
        apply(data);
        return data.value as Card;
      });
    },
    async updateCard(id, draft) {
      return asSaveResult(async () => {
        const data = await api.updateCard(id, draft);
        apply(data);
        return data.value as Card;
      });
    },
    async deleteCard(id) {
      return asSaveResult(async () => {
        apply(await api.deleteCard(id));
        return true as const;
      });
    },
    async importCards(file) {
      return asSaveResult(async () => {
        const data = await api.importCards(file);
        apply(data);
        return (
          data.import ?? {
            created: 0,
            updated: 0,
            collectionsCreated: 0,
            errors: [],
          }
        );
      });
    },
    async addDeck(draft) {
      return asSaveResult(async () => {
        const data = await api.addDeck(draft);
        apply(data);
        return data.value as Deck;
      });
    },
    async updateDeck(id, draft) {
      return asSaveResult(async () => {
        const data = await api.updateDeck(id, draft);
        apply(data);
        return data.value as Deck;
      });
    },
    async deleteDeck(id) {
      return asSaveResult(async () => {
        apply(await api.deleteDeck(id));
        return true as const;
      });
    },
    async adjustDeckCard(deckId, cardId, delta) {
      apply(await api.adjustDeckCard(deckId, cardId, delta));
    },
    async startSetup(deckId) {
      apply(await api.startSetup(deckId));
    },
    async addToHand(cardId) {
      try {
        const data = await api.addToHand(cardId);
        apply(data);
        return data.instanceId ?? (typeof data.value === "string" ? data.value : null);
      } catch (err) {
        toast.error(failMessage(err, "Não foi possível adicionar a carta."));
        return null;
      }
    },
    async removeFromHand(instanceId) {
      apply(await api.removeFromHand(instanceId));
    },
    async beginMatch() {
      apply(await api.beginMatch());
    },
    async playCard(instanceId) {
      apply(await api.playCard(instanceId));
    },
    async discardCard(instanceId) {
      apply(await api.discardCard(instanceId));
    },
    async restartMatch() {
      apply(await api.restartMatch());
    },
    async endMatch() {
      apply(await api.endMatch());
    },
  };

  if (status !== "ready") {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        {status === "loading" ? (
          <p className="text-sm text-muted">Carregando sua coleção...</p>
        ) : (
          <div>
            <p className="text-lg font-semibold">Não foi possível conectar</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{error}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Suba o backend com <span className="text-foreground">poetry run uvicorn app.main:app --reload --host 0.0.0.0</span>
            </p>
            <Button className="mt-5" onClick={() => void load()}>
              Tentar de novo
            </Button>
          </div>
        )}
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp precisa estar dentro de AppProvider.");
  return context;
}
