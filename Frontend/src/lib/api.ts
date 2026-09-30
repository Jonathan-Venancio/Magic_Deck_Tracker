import type { AppData, Card, CardDraft, Collection, CollectionDraft, Deck, DeckDraft, ImportSummary } from "@/lib/types.ts";

export const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type MutationResponse<T = unknown> = AppData & {
  value?: T;
  instanceId?: string;
  import?: ImportSummary;
};

function resolveMedia(url?: string) {
  if (!url) return url;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (!API_BASE) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return url;
}

export function normalizeAppData(data: AppData): AppData {
  return {
    collections: data.collections.map((collection) => {
      const coverImage = resolveMedia(collection.coverImage);
      return coverImage ? { ...collection, coverImage } : collection;
    }),
    cards: data.cards.map((card) => {
      const image = resolveMedia(card.image);
      return image ? { ...card, image } : card;
    }),
    decks: data.decks,
    game: data.game ?? null,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor.", 0);
  }

  const data = (await response.json().catch(() => ({}))) as { detail?: unknown } & T;
  if (!response.ok) {
    const detail = data.detail;
    const message = typeof detail === "string" ? detail : "Não foi possível concluir.";
    throw new ApiError(message, response.status);
  }
  return data;
}

function asState(data: AppData): AppData {
  return {
    collections: data.collections,
    cards: data.cards,
    decks: data.decks,
    game: data.game ?? null,
  };
}

export const api = {
  getState: () => request<AppData>("/state").then(asState),
  addCollection: (draft: CollectionDraft) =>
    request<MutationResponse<Collection>>("/collections", { method: "POST", body: JSON.stringify(draft) }),
  deleteCollection: (id: string) => request<MutationResponse>(`/collections/${id}`, { method: "DELETE" }),
  addCard: (draft: CardDraft) => request<MutationResponse<Card>>("/cards", { method: "POST", body: JSON.stringify(draft) }),
  updateCard: (id: string, draft: CardDraft) =>
    request<MutationResponse<Card>>(`/cards/${id}`, { method: "PUT", body: JSON.stringify(draft) }),
  deleteCard: (id: string) => request<MutationResponse>(`/cards/${id}`, { method: "DELETE" }),
  importCards: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<MutationResponse<ImportSummary> & { import: ImportSummary }>("/cards/import", { method: "POST", body });
  },
  async downloadTemplate(fmt: "xlsx" | "ods") {
    let response: Response;
    try {
      response = await fetch(`${API_BASE}/api/cards/template?fmt=${fmt}`);
    } catch {
      throw new ApiError("Não foi possível conectar ao servidor.", 0);
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { detail?: unknown };
      const detail = data.detail;
      throw new ApiError(typeof detail === "string" ? detail : "Não foi possível baixar o modelo.", response.status);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `modelo-cartas.${fmt}`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
  addDeck: (draft: DeckDraft) => request<MutationResponse<Deck>>("/decks", { method: "POST", body: JSON.stringify(draft) }),
  updateDeck: (id: string, draft: DeckDraft) =>
    request<MutationResponse<Deck>>(`/decks/${id}`, { method: "PUT", body: JSON.stringify(draft) }),
  deleteDeck: (id: string) => request<MutationResponse>(`/decks/${id}`, { method: "DELETE" }),
  adjustDeckCard: (deckId: string, cardId: string, delta: number) =>
    request<MutationResponse>(`/decks/${deckId}/cards`, { method: "POST", body: JSON.stringify({ cardId, delta }) }),
  startSetup: (deckId: string) => request<MutationResponse>("/game/setup", { method: "POST", body: JSON.stringify({ deckId }) }),
  addToHand: (cardId: string) => request<MutationResponse<string>>("/game/hand", { method: "POST", body: JSON.stringify({ cardId }) }),
  removeFromHand: (instanceId: string) => request<MutationResponse>(`/game/hand/${instanceId}`, { method: "DELETE" }),
  beginMatch: () => request<MutationResponse>("/game/begin", { method: "POST" }),
  playCard: (instanceId: string) =>
    request<MutationResponse>("/game/play", { method: "POST", body: JSON.stringify({ instanceId }) }),
  discardCard: (instanceId: string) =>
    request<MutationResponse>("/game/discard", { method: "POST", body: JSON.stringify({ instanceId }) }),
  restartMatch: () => request<MutationResponse>("/game/restart", { method: "POST" }),
  endMatch: () => request<MutationResponse>("/game/end", { method: "POST" }),
};
