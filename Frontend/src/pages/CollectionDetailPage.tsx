import { LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CardSearchResult } from "@/components/CardSearchResult.tsx";
import { CardThumbnail } from "@/components/CardThumbnail.tsx";
import { Chip, ChipRow } from "@/components/Chip.tsx";
import { EmptyState } from "@/components/EmptyState.tsx";
import { Page, PageHeader } from "@/components/PageHeader.tsx";
import { SearchBar } from "@/components/SearchBar.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { ownedCount } from "@/lib/deck.ts";
import { formatNumber, pluralCards } from "@/lib/format.ts";
import { searchCards } from "@/lib/search.ts";
import type { ManaColor } from "@/lib/types.ts";
import { Library } from "lucide-react";

const colors: { id: ManaColor | "all"; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "W", label: "Branco" },
  { id: "U", label: "Azul" },
  { id: "B", label: "Preto" },
  { id: "R", label: "Vermelho" },
  { id: "G", label: "Verde" },
];

export function CollectionDetailPage() {
  const { collectionId = "" } = useParams();
  const { cards, collections } = useApp();
  const collection = collections.find((item) => item.id === collectionId);
  const [query, setQuery] = useState("");
  const [color, setColor] = useState<ManaColor | "all">("all");
  const [sort, setSort] = useState<"number" | "name">("number");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const base = searchCards(
      cards.filter((card) => card.collectionId === collectionId),
      query,
      { color },
    );
    return [...base].sort((left, right) => {
      if (sort === "name") return left.name.localeCompare(right.name, "pt-BR");
      return parseInt(left.number, 10) - parseInt(right.number, 10);
    });
  }, [cards, collectionId, query, color, sort]);

  if (!collection) {
    return (
      <Page>
        <EmptyState
          icon={<Library className="size-6" />}
          title="Coleção não encontrada"
          description="Ela pode ter sido removida deste aparelho."
        />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title={collection.name}
        subtitle={pluralCards(ownedCount(cards, collection.id))}
        backTo="/colecao"
      />
      {collection.description ? <p className="mb-4 text-sm text-muted">{collection.description}</p> : null}
      <SearchBar value={query} onChange={setQuery} placeholder="Buscar carta ou número..." />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ChipRow>
          {colors.map((item) => (
            <Chip key={item.id} active={color === item.id} onClick={() => setColor(item.id)}>
              {item.label}
            </Chip>
          ))}
        </ChipRow>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <label className="text-sm text-muted">
          Ordenar
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as "number" | "name")}
            className="ml-2 h-10 rounded-xl border border-line bg-raised px-3 text-foreground"
          >
            <option value="number">Número</option>
            <option value="name">Nome</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`grid size-11 place-items-center rounded-2xl border ${view === "grid" ? "border-gold-deep bg-gold-deep text-foreground" : "border-line bg-card"}`}
            aria-label="Ver em grade"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`grid size-11 place-items-center rounded-2xl border ${view === "list" ? "border-gold-deep bg-gold-deep text-foreground" : "border-line bg-card"}`}
            aria-label="Ver em lista"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {!filtered.length ? (
        <div className="mt-6">
          <EmptyState
            icon={<Library className="size-6" />}
            title={cards.some((card) => card.collectionId === collection.id) ? "Nenhuma carta com esses filtros" : "Sua coleção está vazia"}
            description={
              cards.some((card) => card.collectionId === collection.id)
                ? "Tente outro número, nome ou cor."
                : "Adicione sua primeira carta para começar."
            }
            action={
              <Link to="/carta/nova" className="inline-flex h-12 items-center rounded-2xl bg-gold-deep px-5 font-semibold text-foreground">
                Adicionar carta
              </Link>
            }
          />
        </div>
      ) : view === "grid" ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((card) => (
            <Link key={card.id} to={`/carta/${card.id}`} className="animate-rise">
              <CardThumbnail card={card} showCaption={false} />
              <p className="mt-2 text-xs font-semibold text-gold">{formatNumber(card.number)}</p>
              <p className="text-sm font-medium leading-tight">{card.name}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 grid gap-2">
          {filtered.map((card) => (
            <Link key={card.id} to={`/carta/${card.id}`} className="animate-rise block">
              <CardSearchResult card={card} collectionName={collection.name} detail={card.typeLine} />
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}
