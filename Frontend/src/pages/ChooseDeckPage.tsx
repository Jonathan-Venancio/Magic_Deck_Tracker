import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeckCard } from "@/components/DeckCard.tsx";
import { EmptyState } from "@/components/EmptyState.tsx";
import { Page, PageHeader } from "@/components/PageHeader.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Sheet } from "@/components/ui/sheet.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { Swords } from "lucide-react";
import { Link } from "react-router-dom";

export function ChooseDeckPage() {
  const { decks, cards, collections, game, startSetup } = useApp();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(game?.phase === "setup" ? game.deckId : null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const selected = decks.find((deck) => deck.id === selectedId);

  function choose(deckId: string) {
    if (game?.phase === "active" && game.deckId !== deckId) {
      setConfirmId(deckId);
      return;
    }
    setSelectedId(deckId);
  }

  async function begin() {
    if (!selected) return;
    if (!(game?.phase === "setup" && game.deckId === selected.id)) {
      await startSetup(selected.id);
    }
    navigate("/jogar/mao");
  }

  return (
    <Page>
      <PageHeader title="Escolha seu deck" subtitle="A partida usa o deck só como referência. As cartas continuam físicas." />
      {game?.phase === "active" ? (
        <div className="mb-4 rounded-3xl border border-gold/30 bg-card p-4">
          <p className="font-semibold">Você tem uma partida em andamento</p>
          <Button className="mt-3 w-full" onClick={() => navigate("/jogar/partida")}>
            Continuar partida
          </Button>
        </div>
      ) : null}
      {decks.length ? (
        <div className="grid gap-3">
          {decks.map((deck) => (
            <div key={deck.id} className={selectedId === deck.id ? "rounded-3xl ring-2 ring-gold" : ""}>
              <DeckCard
                deck={deck}
                cards={cards}
                collections={collections}
                meta={false}
                action={
                  <Button variant={selectedId === deck.id ? "default" : "secondary"} className="w-full" onClick={() => choose(deck.id)}>
                    {selectedId === deck.id ? "Selecionado" : "Selecionar"}
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Swords className="size-6" />}
          title="Você ainda não possui decks"
          description="Crie um deck utilizando as cartas da sua coleção."
          action={
            <Button asChild>
              <Link to="/decks/novo">Criar deck</Link>
            </Button>
          }
        />
      )}
      {selected ? (
        <div className="sticky bottom-24 z-10 mt-4 lg:static">
          <Button className="w-full shadow-[0_12px_30px_rgba(0,0,0,0.35)]" size="lg" onClick={begin}>
            Começar partida
          </Button>
        </div>
      ) : null}
      <Sheet
        open={Boolean(confirmId)}
        onOpenChange={(open) => {
          if (!open) setConfirmId(null);
        }}
        title="Encerrar a partida atual?"
        description="Escolher outro deck substitui a partida que está em andamento."
      >
        <div className="grid gap-2">
          <Button
            onClick={() => {
              if (!confirmId) return;
              setSelectedId(confirmId);
              setConfirmId(null);
            }}
          >
            Escolher este deck
          </Button>
          <Button variant="secondary" onClick={() => setConfirmId(null)}>
            Voltar
          </Button>
        </div>
      </Sheet>
    </Page>
  );
}
