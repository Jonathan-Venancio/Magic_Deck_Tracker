import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { CardSearchResult } from "@/components/CardSearchResult.tsx";
import { Chip, ChipRow } from "@/components/Chip.tsx";
import { SearchBar } from "@/components/SearchBar.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { searchCards } from "@/lib/search.ts";
import type { CardCategory, DeckEntry, ManaColor } from "@/lib/types.ts";

const categories: { id: CardCategory | "all"; label: string }[] = [
  { id: "all", label: "Todos os tipos" },
  { id: "creature", label: "Criaturas" },
  { id: "spell", label: "Mágicas" },
  { id: "land", label: "Terrenos" },
];

const colors: { id: ManaColor | "all"; label: string }[] = [
  { id: "all", label: "Todas as cores" },
  { id: "W", label: "Branco" },
  { id: "U", label: "Azul" },
  { id: "B", label: "Preto" },
  { id: "R", label: "Vermelho" },
  { id: "G", label: "Verde" },
];

export function CardSelector({
  entries,
  onAdd,
}: {
  entries: DeckEntry[];
  onAdd: (cardId: string) => void;
}) {
  const { cards, collections } = useApp();
  const [query, setQuery] = useState("");
  const [collectionId, setCollectionId] = useState("all");
  const [color, setColor] = useState<ManaColor | "all">("all");
  const [category, setCategory] = useState<CardCategory | "all">("all");

  const results = useMemo(
    () => searchCards(cards, query, { collectionId, color, category }),
    [cards, query, collectionId, color, category],
  );

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} placeholder="Buscar carta ou número..." />
      <div className="mt-3 grid gap-2">
        <ChipRow>
          <Chip active={collectionId === "all"} onClick={() => setCollectionId("all")}>
            Todas
          </Chip>
          {collections.map((collection) => (
            <Chip
              key={collection.id}
              active={collectionId === collection.id}
              onClick={() => setCollectionId(collection.id)}
            >
              {collection.name}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow>
          {colors.map((item) => (
            <Chip key={item.id} active={color === item.id} onClick={() => setColor(item.id)}>
              {item.label}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow>
          {categories.map((item) => (
            <Chip key={item.id} active={category === item.id} onClick={() => setCategory(item.id)}>
              {item.label}
            </Chip>
          ))}
        </ChipRow>
      </div>
      <div className="mt-4 grid gap-2">
        {results.map((card) => {
          const inDeck = entries.find((entry) => entry.cardId === card.id)?.quantity ?? 0;
          const collectionName = collections.find((collection) => collection.id === card.collectionId)?.name ?? "";
          return (
            <CardSearchResult
              key={card.id}
              card={card}
              collectionName={collectionName}
              detail={card.typeLine}
              badge={inDeck ? `No deck · x${inDeck}` : undefined}
              onClick={() => onAdd(card.id)}
              action={
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-ink">
                  <Plus className="size-5" />
                </span>
              }
            />
          );
        })}
        {!results.length ? <p className="py-8 text-center text-sm text-muted">Nenhuma carta com esses filtros.</p> : null}
      </div>
    </div>
  );
}
