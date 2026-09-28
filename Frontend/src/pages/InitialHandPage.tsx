import { Navigate, useNavigate } from "react-router-dom";
import { CardSearchResult } from "@/components/CardSearchResult.tsx";
import { PageHeader } from "@/components/PageHeader.tsx";
import { QuickCardSearch } from "@/components/QuickCardSearch.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { pluralCards } from "@/lib/format.ts";

export function InitialHandPage() {
  const { game, decks, cards, collections, addToHand, removeFromHand, beginMatch } = useApp();
  const navigate = useNavigate();
  const deck = decks.find((item) => item.id === game?.deckId);

  if (!game || !deck) return <Navigate to="/jogar" replace />;
  if (game.phase === "active") return <Navigate to="/jogar/partida" replace />;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 pt-4 pb-40">
      <PageHeader
        title="Sua mão inicial"
        subtitle="Adicione as cartas que estão na sua mão física."
        backTo="/jogar"
      />
      <p className="mb-4 text-sm text-muted">{deck.name}</p>
      <QuickCardSearch mode="acquire" deckId={deck.id} autoFocus onAddToHand={(card) => addToHand(card.id)} />
      <p className="mt-6 text-sm font-semibold text-gold">Mão: {pluralCards(game.hand.length)}</p>
      <div className="mt-3 grid gap-2">
        {game.hand.map((instance) => {
          const card = cards.find((item) => item.id === instance.cardId);
          if (!card) return null;
          const collection = collections.find((item) => item.id === card.collectionId);
          return (
            <CardSearchResult
              key={instance.instanceId}
              card={card}
              collectionName={collection?.name ?? ""}
              action={
                <button
                  type="button"
                  onClick={() => removeFromHand(instance.instanceId)}
                  className="text-sm text-danger"
                >
                  Remover
                </button>
              }
            />
          );
        })}
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-ink/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-lg">
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              beginMatch();
              navigate("/jogar/partida", { replace: true });
            }}
          >
            Começar partida
          </Button>
        </div>
      </div>
    </div>
  );
}
