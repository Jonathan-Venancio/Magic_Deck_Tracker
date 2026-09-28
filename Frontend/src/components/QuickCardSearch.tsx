import { Plus } from "lucide-react";
import { useMemo, useRef, useState, type RefObject } from "react";
import { CardImagePlaceholder } from "@/components/CardImagePlaceholder.tsx";
import { CardSearchResult } from "@/components/CardSearchResult.tsx";
import { SearchBar } from "@/components/SearchBar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { deckCardIds } from "@/lib/deck.ts";
import { formatNumber } from "@/lib/format.ts";
import { searchCards } from "@/lib/search.ts";
import type { Card } from "@/lib/types.ts";

function keepInputFocus(event: { preventDefault: () => void }) {
  event.preventDefault();
}

export function QuickCardSearch({
  mode,
  deckId,
  onAddToHand,
  onOpenCard,
  inputRef: externalRef,
  autoFocus = false,
  onFocus,
  onBlur,
}: {
  mode: "consult" | "acquire";
  deckId?: string;
  onAddToHand?: (card: Card) => void;
  onOpenCard?: (card: Card) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const { cards, collections, decks } = useApp();
  const [query, setQuery] = useState("");
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const localRef = useRef<HTMLInputElement>(null);
  const inputRef = externalRef ?? localRef;
  const deck = decks.find((item) => item.id === deckId);
  const ids = useMemo(() => deckCardIds(deck), [deck]);

  const results = useMemo(
    () => (query.trim() ? searchCards(cards, query, { deckCardIds: ids }) : []),
    [cards, query, ids],
  );

  const selected = results.length === 1 ? results[0] : results.find((card) => card.id === pinnedId);
  const showResultList = results.length > 0 && (mode === "acquire" || (results.length > 1 && !selected));

  function collectionName(card: Card) {
    return collections.find((collection) => collection.id === card.collectionId)?.name ?? "Coleção";
  }

  function add(card: Card) {
    onAddToHand?.(card);
    setQuery("");
    setPinnedId(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div>
      <SearchBar
        value={query}
        onChange={(value) => {
          setQuery(value);
          setPinnedId(null);
        }}
        placeholder="Digite o número ou nome..."
        autoFocus={autoFocus}
        inputRef={inputRef}
        onFocus={onFocus}
        onBlur={onBlur}
        onEnter={() => {
          const target = selected ?? results[0];
          if (!target) return;
          if (mode === "acquire") add(target);
          else setPinnedId(target.id);
        }}
      />
      <p className="mt-2 text-xs text-muted">Dica: 127 encontra #127. 14 também encontra #014.</p>
      <div className="mt-4 grid gap-3" aria-live="polite">
        {!query.trim() ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            {mode === "acquire"
              ? "Digite o número da carta física para adicioná-la à mão."
              : "Digite o número impresso na carta para ver a tradução."}
          </p>
        ) : null}
        {query.trim() && !results.length ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            Nenhuma carta encontrada.
          </p>
        ) : null}
        {showResultList
          ? results.map((card) => (
              <div key={card.id} className="animate-rise">
                <CardSearchResult
                  card={card}
                  collectionName={collectionName(card)}
                  badge={ids.has(card.id) ? "No deck" : undefined}
                  onClick={() => (mode === "acquire" ? add(card) : setPinnedId(card.id))}
                  action={
                    mode === "acquire" ? (
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-deep text-foreground">
                        <Plus className="size-5" />
                      </span>
                    ) : undefined
                  }
                />
              </div>
            ))
          : null}
        {selected && mode === "consult" ? (
          <article className="animate-rise scroll-mb-40 rounded-3xl border border-line bg-card p-4">
            {results.length > 1 ? (
              <button type="button" onClick={() => setPinnedId(null)} className="mb-3 text-sm text-gold">
                Ver todas as {results.length} cartas
              </button>
            ) : null}
            {selected.image ? (
              <button type="button" onClick={() => onOpenCard?.(selected)} className="mx-auto block w-44">
                <img src={selected.image} alt={selected.name} className="aspect-[63/88] w-full rounded-2xl object-cover" />
              </button>
            ) : (
              <CardImagePlaceholder className="h-28 w-full rounded-2xl" compact />
            )}
            <p className="mt-4 text-sm font-semibold text-gold">{formatNumber(selected.number)}</p>
            <h3 className="text-2xl font-semibold leading-tight">{selected.name}</h3>
            <p className="mt-1 text-sm text-muted">
              {collectionName(selected)}
              {ids.has(selected.id) ? " · No deck" : ""}
            </p>
            <h4 className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted">Tradução</h4>
            <p className="mt-2 whitespace-pre-wrap font-serif text-lg leading-relaxed">
              {selected.text || "Nenhuma tradução cadastrada."}
            </p>
            {selected.image ? (
              <Button className="mt-4 w-full" variant="secondary" onClick={() => onOpenCard?.(selected)}>
                Abrir imagem
              </Button>
            ) : null}
          </article>
        ) : null}
        {selected && mode === "acquire" && results.length === 1 ? (
          <article className="animate-rise scroll-mb-40 rounded-3xl border border-line bg-card p-4">
            <Button
              className="mb-4 w-full"
              size="lg"
              onMouseDown={keepInputFocus}
              onClick={() => add(selected)}
            >
              Adicionar à mão
            </Button>
            {selected.image ? (
              <button type="button" onClick={() => onOpenCard?.(selected)} className="mx-auto block w-44">
                <img src={selected.image} alt={selected.name} className="aspect-[63/88] w-full rounded-2xl object-cover" />
              </button>
            ) : (
              <CardImagePlaceholder className="h-28 w-full rounded-2xl" compact />
            )}
            <p className="mt-4 text-sm font-semibold text-gold">{formatNumber(selected.number)}</p>
            <h3 className="text-2xl font-semibold leading-tight">{selected.name}</h3>
            <p className="mt-1 text-sm text-muted">
              {collectionName(selected)}
              {ids.has(selected.id) ? " · No deck" : ""}
            </p>
            <h4 className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted">Tradução</h4>
            <p className="mt-2 whitespace-pre-wrap font-serif text-lg leading-relaxed">
              {selected.text || "Nenhuma tradução cadastrada."}
            </p>
          </article>
        ) : null}
      </div>
    </div>
  );
}
