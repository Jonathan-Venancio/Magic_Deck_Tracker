import type { ReactNode } from "react";
import { ColorPips, ManaPip } from "@/components/ManaBadge.tsx";
import { deckCollectionNames, deckColors, deckSize } from "@/lib/deck.ts";
import { formatLastUsed } from "@/lib/format.ts";
import { formatColors } from "@/lib/mana.ts";
import type { Card, Collection, Deck } from "@/lib/types.ts";

export function DeckMark({ colors }: { colors: ReturnType<typeof deckColors> }) {
  return (
    <span className="grid h-24 w-16 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-[linear-gradient(180deg,#163214,#0c110b)]">
      <span className="flex flex-col gap-1">
        {colors.length ? colors.map((color) => <ManaPip key={color} symbol={color} />) : <span className="text-xs text-muted">—</span>}
      </span>
    </span>
  );
}

export function DeckCard({
  deck,
  cards,
  collections,
  action,
  meta = true,
}: {
  deck: Deck;
  cards: Card[];
  collections: Collection[];
  action?: ReactNode;
  meta?: boolean;
}) {
  const colors = deckColors(deck, cards);
  const used = deckCollectionNames(deck, cards, collections);
  return (
    <article className="rounded-3xl border border-line bg-card p-4">
      <div className="flex gap-4">
        <DeckMark colors={colors} />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-tight">{deck.name}</h3>
          <p className="mt-1 text-sm text-muted">{deckSize(deck.entries)}/60 cartas</p>
          <div className="mt-2">
            <ColorPips colors={colors} />
          </div>
          <p className="mt-2 text-sm">{formatColors(colors)}</p>
          {meta ? (
            <p className="mt-2 text-xs text-muted">
              {used.length ? used.join(" · ") : "Sem coleção"} · {formatLastUsed(deck.lastUsedAt)}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </article>
  );
}
