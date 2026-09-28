import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CardSearchResult } from "@/components/CardSearchResult.tsx";
import { PageHeader } from "@/components/PageHeader.tsx";
import { QuickCardSearch } from "@/components/QuickCardSearch.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { firstName, pluralCards } from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";

export function InitialHandPage() {
  const { game, decks, cards, collections, addToHand, removeFromHand, beginMatch } = useApp();
  const navigate = useNavigate();
  const [searching, setSearching] = useState(false);
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
      <QuickCardSearch
        mode="acquire"
        deckId={deck.id}
        autoFocus
        onFocus={() => setSearching(true)}
        onBlur={() => setSearching(false)}
        onAddToHand={async (card) => {
          const id = await addToHand(card.id);
          if (!id) return;
          toast.success(`${firstName(card.name)} adicionada à sua mão`);
        }}
      />
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
                  onClick={() => void removeFromHand(instance.instanceId)}
                  className="text-sm text-danger"
                >
                  Remover
                </button>
              }
            />
          );
        })}
      </div>
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-20 border-t border-line bg-ink/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
          searching && "pointer-events-none invisible",
        )}
      >
        <div className="mx-auto max-w-lg">
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              void beginMatch().then(() => {
                navigate("/jogar/partida", { replace: true });
              });
            }}
          >
            Começar partida
          </Button>
        </div>
      </div>
    </div>
  );
}
