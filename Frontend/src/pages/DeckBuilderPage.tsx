import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CardSelector } from "@/components/CardSelector.tsx";
import { Page, PageHeader } from "@/components/PageHeader.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Field, Input } from "@/components/ui/field.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { adjustEntries, deckBreakdown, deckSize } from "@/lib/deck.ts";
import { formatNumber } from "@/lib/format.ts";
import type { Card, DeckEntry } from "@/lib/types.ts";
import { cn } from "@/lib/utils.ts";

export function DeckBuilderPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { cards, collections, decks, addDeck, updateDeck } = useApp();
  const existing = deckId ? decks.find((deck) => deck.id === deckId) : undefined;
  const [name, setName] = useState(existing?.name ?? "");
  const [entries, setEntries] = useState<DeckEntry[]>(existing?.entries ?? []);
  const [tab, setTab] = useState<"collection" | "deck">("collection");

  const total = deckSize(entries);
  const progress = Math.min(100, Math.round((total / 60) * 100));
  const summary = deckBreakdown(entries, cards);
  const rows: { entry: DeckEntry; card: Card }[] = [];
  for (const entry of entries) {
    const card = cards.find((item) => item.id === entry.cardId);
    if (card) rows.push({ entry, card });
  }
  rows.sort((left, right) => parseInt(left.card.number, 10) - parseInt(right.card.number, 10));

  function change(cardId: string, delta: number) {
    setEntries((current) => adjustEntries(current, cardId, delta));
  }

  function save() {
    const result = existing ? updateDeck(existing.id, { name, entries }) : addDeck({ name, entries });
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Deck salvo!");
    navigate("/decks");
  }

  const deckList = (
    <div className="grid gap-2">
      {rows.map(({ entry, card }) => {
        const collection = collections.find((item) => item.id === card.collectionId);
        return (
          <div key={card.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card px-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gold">
                {formatNumber(card.number)} {card.name}
              </p>
              <p className="truncate text-xs text-muted">{collection?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => change(card.id, -1)}
                className="grid size-11 place-items-center rounded-full border border-line bg-raised"
                aria-label="Diminuir"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center font-semibold tabular-nums">{entry.quantity}</span>
              <button
                type="button"
                onClick={() => change(card.id, 1)}
                className="grid size-11 place-items-center rounded-full bg-gold-deep text-foreground"
                aria-label="Aumentar"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        );
      })}
      {!rows.length ? <p className="py-8 text-center text-sm text-muted">Nenhuma carta no deck ainda.</p> : null}
    </div>
  );

  return (
    <Page>
      <PageHeader title={existing ? "Editar deck" : "Novo Deck"} backTo="/decks" />
      <Field label="Nome do deck">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Avatar — Domínio dos Elementos" />
      </Field>
      <div className="mt-4 rounded-3xl border border-line bg-card p-4">
        <div className="flex items-end justify-between">
          <p className="text-sm text-muted">Cartas no deck</p>
          <p className="text-2xl font-semibold tabular-nums">
            {total}
            <span className="text-base text-muted"> / 60</span>
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gold-deep transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <p>Criaturas: {summary.creatures}</p>
          <p>Mágicas: {summary.spells}</p>
          <p>Terrenos: {summary.lands}</p>
          <p>Total: {summary.total}</p>
        </div>
        {summary.other ? <p className="mt-2 text-sm text-muted">Outros: {summary.other}</p> : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setTab("collection")}
          className={cn("h-11 rounded-2xl text-sm font-semibold", tab === "collection" ? "bg-gold-deep text-foreground" : "border border-line bg-card")}
        >
          Minha coleção
        </button>
        <button
          type="button"
          onClick={() => setTab("deck")}
          className={cn("h-11 rounded-2xl text-sm font-semibold", tab === "deck" ? "bg-gold-deep text-foreground" : "border border-line bg-card")}
        >
          Cartas no deck
        </button>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <section className={tab === "collection" ? "" : "max-lg:hidden"}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Minha coleção</h2>
          <CardSelector entries={entries} onAdd={(cardId) => change(cardId, 1)} />
        </section>
        <section className={tab === "deck" ? "" : "max-lg:hidden"}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Cartas no deck</h2>
          {deckList}
        </section>
      </div>
      <Button className="mt-6 w-full" size="lg" onClick={save}>
        Salvar deck
      </Button>
    </Page>
  );
}
