import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardSearchResult } from "@/components/CardSearchResult.tsx";
import { Chip, ChipRow } from "@/components/Chip.tsx";
import { CollectionCard } from "@/components/CollectionCard.tsx";
import { Page, PageHeader } from "@/components/PageHeader.tsx";
import { SearchBar } from "@/components/SearchBar.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { searchCards } from "@/lib/search.ts";

const KNOWN_COLLECTIONS = ["Avatar", "Terra Média", "Vingadores", "Final Fantasy"];

export function CollectionPage() {
  const { cards, collections } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [collectionId, setCollectionId] = useState("all");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const scoped = collectionId === "outras" ? "all" : collectionId;
    const found = searchCards(cards, query, { collectionId: scoped });
    if (collectionId !== "outras") return found;
    const otherIds = new Set(
      collections.filter((collection) => !KNOWN_COLLECTIONS.includes(collection.name)).map((collection) => collection.id),
    );
    return found.filter((card) => otherIds.has(card.collectionId));
  }, [cards, collections, query, collectionId]);
  const visibleCollections =
    collectionId === "all" ? collections : collections.filter((collection) => collection.id === collectionId);

  return (
    <Page>
      <PageHeader title="Minha Coleção" subtitle="Busque pelo nome ou pelo número impresso na carta." />
      <SearchBar value={query} onChange={setQuery} placeholder="Buscar carta ou número..." />
      <div className="mt-3">
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
          <Chip active={collectionId === "outras"} onClick={() => setCollectionId("outras")}>
            Outras
          </Chip>
        </ChipRow>
      </div>

      {query.trim() ? (
        <div className="mt-4 grid min-w-0 gap-2">
          {results.map((card) => {
            const collection = collections.find((item) => item.id === card.collectionId);
            return (
              <div key={card.id} className="animate-rise">
                <CardSearchResult
                  card={card}
                  collectionName={collection?.name ?? "Coleção"}
                  detail={card.typeLine}
                  onClick={() => navigate(`/carta/${card.id}`)}
                />
              </div>
            );
          })}
          {!results.length ? (
            <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
              Nenhuma carta encontrada.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(collectionId === "outras"
          ? collections.filter((collection) => !KNOWN_COLLECTIONS.includes(collection.name))
          : visibleCollections
        ).map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            cards={cards}
            onClick={() => navigate(`/colecao/${collection.id}`)}
          />
        ))}
      </div>
      {collectionId === "outras" &&
      !collections.some((collection) => !KNOWN_COLLECTIONS.includes(collection.name)) ? (
        <p className="mt-4 text-sm text-muted">As coleções que você criar aparecem aqui.</p>
      ) : null}
    </Page>
  );
}
