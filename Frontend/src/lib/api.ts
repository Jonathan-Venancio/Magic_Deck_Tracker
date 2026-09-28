import type { AppData, Card, CardDraft, Collection, CollectionDraft, Deck, DeckDraft } from "@/lib/types.ts";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type MutationResponse<T = unknown> = AppData & {
  value?: T;
  instanceId?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      headers: {
        "Content-Type": "application/json",
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
  addCard: (draft: CardDraft) => request<MutationResponse<Card>>("/cards", { method: "POST", body: JSON.stringify(draft) }),
  updateCard: (id: string, draft: CardDraft) =>
    request<MutationResponse<Card>>(`/cards/${id}`, { method: "PUT", body: JSON.stringify(draft) }),
  addDeck: (draft: DeckDraft) => request<MutationResponse<Deck>>("/decks", { method: "POST", body: JSON.stringify(draft) }),
  updateDeck: (id: string, draft: DeckDraft) =>
    request<MutationResponse<Deck>>(`/decks/${id}`, { method: "PUT", body: JSON.stringify(draft) }),
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
