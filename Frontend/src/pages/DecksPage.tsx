import { Layers, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { DeckCard } from "@/components/DeckCard.tsx";
import { EmptyState } from "@/components/EmptyState.tsx";
import { Page, PageHeader } from "@/components/PageHeader.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useApp } from "@/context/AppContext.tsx";

export function DecksPage() {
  const { decks, cards, collections } = useApp();
  const ordered = [...decks].sort((left, right) => Date.parse(right.lastUsedAt ?? right.createdAt) - Date.parse(left.lastUsedAt ?? left.createdAt));

  return (
    <Page>
      <PageHeader
        title="Meus Decks"
        subtitle="Monte decks com as cartas que você cadastrou."
        action={
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/decks/novo">
              <Plus className="size-4" /> Novo deck
            </Link>
          </Button>
        }
      />
      {ordered.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {ordered.map((deck) => (
            <Link key={deck.id} to={`/decks/${deck.id}`}>
              <DeckCard deck={deck} cards={cards} collections={collections} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Layers className="size-6" />}
          title="Você ainda não possui decks"
          description="Crie um deck utilizando as cartas da sua coleção."
          action={
            <Button asChild>
              <Link to="/decks/novo">Criar deck</Link>
            </Button>
          }
        />
      )}
      <Button asChild size="lg" className="mt-4 w-full sm:hidden">
        <Link to="/decks/novo">
          <Plus className="size-4" /> Novo deck
        </Link>
      </Button>
    </Page>
  );
}
