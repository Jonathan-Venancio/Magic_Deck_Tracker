import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CardDetails } from "@/components/CardDetails.tsx";
import { CardImagePlaceholder } from "@/components/CardImagePlaceholder.tsx";
import { CardViewer } from "@/components/CardViewer.tsx";
import { EmptyState } from "@/components/EmptyState.tsx";
import { Page, PageHeader } from "@/components/PageHeader.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Sheet } from "@/components/ui/sheet.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { Library } from "lucide-react";

export function CardDetailPage() {
  const { cardId = "" } = useParams();
  const navigate = useNavigate();
  const { cards, collections, decks, adjustDeckCard } = useApp();
  const card = cards.find((item) => item.id === cardId);
  const collection = collections.find((item) => item.id === card?.collectionId);
  const [viewer, setViewer] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);

  if (!card || !collection) {
    return (
      <Page>
        <EmptyState icon={<Library className="size-6" />} title="Carta não encontrada" description="Volte para a coleção e escolha outra carta." />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader title="Carta" backTo={`/colecao/${collection.id}`} />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <button type="button" onClick={() => setViewer(true)} className="block w-full text-left" aria-label="Ampliar carta">
          {card.image ? (
            <img src={card.image} alt={card.name} className="mx-auto aspect-[63/88] w-full max-w-sm rounded-3xl object-cover shadow-2xl" />
          ) : (
            <CardImagePlaceholder
              className="mx-auto aspect-[63/88] w-full max-w-sm rounded-3xl"
              hint="Adicione uma imagem para esta carta"
            />
          )}
        </button>
        <CardDetails
          card={card}
          collectionName={collection.name}
          actions={
            <>
              <Button onClick={() => setDeckOpen(true)}>Adicionar ao deck</Button>
              <Button variant="secondary" onClick={() => navigate(`/carta/${card.id}/editar`)}>
                Editar carta
              </Button>
            </>
          }
        />
      </div>
      {viewer ? <CardViewer card={card} collectionName={collection.name} onClose={() => setViewer(false)} /> : null}
      <Sheet open={deckOpen} onOpenChange={setDeckOpen} title="Adicionar ao deck" description="Escolha um deck para incluir uma cópia.">
        {decks.length ? (
          <div className="grid gap-2">
            {decks.map((deck) => {
              const copies = deck.entries.find((entry) => entry.cardId === card.id)?.quantity ?? 0;
              return (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => {
                    void adjustDeckCard(deck.id, card.id, 1).then(() => {
                      toast.success(`Adicionada a ${deck.name}`);
                      setDeckOpen(false);
                    });
                  }}
                  className="rounded-2xl border border-line bg-card px-4 py-4 text-left hover:border-gold/40"
                >
                  <span className="block font-semibold">{deck.name}</span>
                  <span className="mt-1 block text-sm text-muted">{copies ? `Já tem ${copies}` : "Adicionar 1 cópia"}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-3">
            <p className="text-sm text-muted">Você ainda não possui decks.</p>
            <Button asChild>
              <Link to="/decks/novo">Criar deck</Link>
            </Button>
          </div>
        )}
      </Sheet>
    </Page>
  );
}
