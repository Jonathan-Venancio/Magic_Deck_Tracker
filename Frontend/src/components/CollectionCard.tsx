import { ownedCount } from "@/lib/deck.ts";
import { pluralCards } from "@/lib/format.ts";
import type { Card, Collection } from "@/lib/types.ts";

export function CollectionCard({
  collection,
  cards,
  onClick,
}: {
  collection: Collection;
  cards: Card[];
  onClick: () => void;
}) {
  const count = ownedCount(cards, collection.id);
  return (
    <button
      type="button"
      onClick={onClick}
      className="overflow-hidden rounded-3xl border border-line bg-card text-left transition-colors hover:border-gold/40"
    >
      <span className="block aspect-[5/3] overflow-hidden">
        {collection.coverImage ? (
          <img src={collection.coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center bg-[linear-gradient(160deg,#163214,#0c110b)] text-2xl font-semibold tracking-[0.22em] text-gold">
            {collection.code || collection.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>
      <span className="block px-4 py-4">
        <span className="block text-lg font-semibold">{collection.name}</span>
        <span className="mt-1 block text-sm text-muted">{pluralCards(count)}</span>
      </span>
    </button>
  );
}
