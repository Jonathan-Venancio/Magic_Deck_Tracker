import { Play, Plus, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DeckCard } from "@/components/DeckCard.tsx";
import { Page } from "@/components/PageHeader.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { ownedCount } from "@/lib/deck.ts";
import { greeting, pluralCards } from "@/lib/format.ts";

export function HomePage() {
  const { cards, collections, decks, game, startSetup } = useApp();
  const navigate = useNavigate();
  const recent = [...decks]
    .sort((left, right) => Date.parse(right.lastUsedAt ?? "0") - Date.parse(left.lastUsedAt ?? "0"))
    .slice(0, 3);
  const featured = (game ? decks.find((deck) => deck.id === game.deckId) : undefined) ?? recent[0];

  async function continueMatch() {
    if (game?.phase === "active") {
      navigate("/jogar/partida");
      return;
    }
    if (game?.phase === "setup") {
      navigate("/jogar/mao");
      return;
    }
    if (!featured) {
      navigate("/jogar");
      return;
    }
    await startSetup(featured.id);
    navigate("/jogar/mao");
  }

  return (
    <Page>
      <p className="text-sm font-medium text-gold">{greeting()}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Pronto para jogar?</h1>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Continuar última partida</h2>
        {featured ? (
          <div className="rounded-3xl border border-gold/30 bg-card p-2 shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
            <DeckCard
              deck={featured}
              cards={cards}
              collections={collections}
              action={
                <Button className="w-full" size="lg" onClick={continueMatch}>
                  <Play className="size-4" />
                  Continuar partida
                </Button>
              }
            />
            {game?.phase === "active" ? (
              <p className="px-4 pb-3 text-sm text-gold">Partida em andamento</p>
            ) : null}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            Crie um deck para começar uma partida.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Decks recentes</h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {recent.map((deck) => (
            <Link key={deck.id} to={`/decks/${deck.id}`} className="block">
              <DeckCard deck={deck} cards={cards} collections={collections} />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid grid-cols-3 gap-3">
        <article className="rounded-3xl border border-line bg-card px-3 py-4 text-center">
          <p className="text-2xl font-semibold tabular-nums">{ownedCount(cards)}</p>
          <p className="text-xs uppercase tracking-wide text-muted">cartas</p>
        </article>
        <article className="rounded-3xl border border-line bg-card px-3 py-4 text-center">
          <p className="text-2xl font-semibold tabular-nums">{collections.length}</p>
          <p className="text-xs uppercase tracking-wide text-muted">coleções</p>
        </article>
        <article className="rounded-3xl border border-line bg-card px-3 py-4 text-center">
          <p className="text-2xl font-semibold tabular-nums">{decks.length}</p>
          <p className="text-xs uppercase tracking-wide text-muted">decks</p>
        </article>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Button asChild size="lg">
          <Link to="/carta/nova">
            <Plus className="size-4" /> Adicionar carta
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link to="/decks/novo">
            <Plus className="size-4" /> Criar deck
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link to="/jogar">
            <Sparkles className="size-4" /> Iniciar partida
          </Link>
        </Button>
      </section>
      <p className="mt-4 text-xs text-muted">{pluralCards(ownedCount(cards))} cadastradas na sua coleção.</p>
    </Page>
  );
}
