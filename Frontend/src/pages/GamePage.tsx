import { Menu, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CardImagePlaceholder } from "@/components/CardImagePlaceholder.tsx";
import { CardSearchResult } from "@/components/CardSearchResult.tsx";
import { CardViewer } from "@/components/CardViewer.tsx";
import { EmptyState } from "@/components/EmptyState.tsx";
import { GameBottomNavigation, type GameTab } from "@/components/GameBottomNavigation.tsx";
import { GameHand } from "@/components/GameHand.tsx";
import { GameStats } from "@/components/GameStats.tsx";
import { QuickCardSearch } from "@/components/QuickCardSearch.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Sheet } from "@/components/ui/sheet.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { libraryCount } from "@/lib/deck.ts";
import { firstName, formatNumber, pluralCards } from "@/lib/format.ts";
import type { Card } from "@/lib/types.ts";
import { Archive } from "lucide-react";

export function GamePage() {
  const navigate = useNavigate();
  const { game, decks, cards, collections, addToHand, playCard, discardCard, restartMatch, endMatch } = useApp();
  const deck = decks.find((item) => item.id === game?.deckId);
  const [panel, setPanel] = useState<GameTab | "menu" | "card" | "played" | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<Card | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [sideMode, setSideMode] = useState<"consult" | "acquire">("consult");
  const searchRef = useRef<HTMLInputElement>(null);
  const drawRef = useRef<HTMLInputElement>(null);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const update = () => setWide(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!game || !deck) return <Navigate to="/" replace />;
  if (game.phase !== "active") return <Navigate to="/jogar/mao" replace />;

  const activeInstance = game.hand.find((item) => item.instanceId === instanceId);
  const activeCard = cards.find((card) => card.id === activeInstance?.cardId);
  const activeCollection = collections.find((collection) => collection.id === activeCard?.collectionId);

  function collectionName(card: Card) {
    return collections.find((collection) => collection.id === card.collectionId)?.name ?? "Coleção";
  }

  async function handleAdd(card: Card) {
    const id = await addToHand(card.id);
    if (!id) return;
    setLastAdded(id);
    toast.success(`${firstName(card.name)} adicionada à sua mão`);
    setPanel(null);
  }

  function openTab(tab: GameTab) {
    setPanel(tab === "hand" ? null : tab);
  }

  return (
    <div className="min-h-dvh pb-36 xl:pb-10">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/5 bg-background/85 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">Partida</p>
          <h1 className="truncate text-lg font-semibold">{deck.name}</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setConfirmEnd(false);
            setPanel("menu");
          }}
          className="grid size-11 shrink-0 place-items-center rounded-2xl border border-line bg-card"
          aria-label="Menu da partida"
        >
          <Menu className="size-5" />
        </button>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <GameStats
            library={libraryCount(deck, game)}
            hand={game.hand.length}
            graveyard={game.graveyard.length}
            onGraveyard={() => setPanel("graveyard")}
          />
          <h2 className="mb-2 mt-6 text-lg font-semibold">Minha mão</h2>
          <GameHand
            hand={game.hand}
            cards={cards}
            lastAddedId={lastAdded}
            onOpen={(id) => {
              setInstanceId(id);
              setPanel("card");
            }}
          />
          <Button className="mt-2 w-full xl:hidden" size="lg" onClick={() => setPanel("draw")}>
            <Plus className="size-5" /> Comprar carta
          </Button>
        </div>

        {wide ? (
          <aside>
            <div className="sticky top-20 rounded-3xl border border-line bg-card p-4">
              <div className="mb-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSideMode("consult")}
                  className={`h-11 rounded-2xl text-sm font-semibold ${sideMode === "consult" ? "bg-gold-deep text-foreground" : "border border-line"}`}
                >
                  Consultar
                </button>
                <button
                  type="button"
                  onClick={() => setSideMode("acquire")}
                  className={`h-11 rounded-2xl text-sm font-semibold ${sideMode === "acquire" ? "bg-gold-deep text-foreground" : "border border-line"}`}
                >
                  Comprar
                </button>
              </div>
              <QuickCardSearch
                key={sideMode}
                mode={sideMode}
                deckId={deck.id}
                autoFocus
                onAddToHand={handleAdd}
                onOpenCard={setViewer}
              />
            </div>
          </aside>
        ) : null}
      </div>

      <GameBottomNavigation active={panel === "search" || panel === "draw" || panel === "graveyard" ? panel : "hand"} onChange={openTab} />

      <Sheet
        open={panel === "search"}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
        variant="fullscreen"
        title="Consultar carta"
        description="Digite o número impresso na carta física."
        initialFocusRef={searchRef}
      >
        <QuickCardSearch
          mode="consult"
          deckId={deck.id}
          autoFocus
          inputRef={searchRef}
          onOpenCard={setViewer}
        />
      </Sheet>

      <Sheet
        open={panel === "draw"}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
        variant="fullscreen"
        title="Qual carta você comprou?"
        description="Digite o número ou o nome da carta física."
        initialFocusRef={drawRef}
      >
        <QuickCardSearch
          mode="acquire"
          deckId={deck.id}
          autoFocus
          inputRef={drawRef}
          onAddToHand={handleAdd}
          onOpenCard={setViewer}
        />
      </Sheet>

      <Sheet
        open={panel === "graveyard"}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
        variant="fullscreen"
        title="Cemitério"
        description={pluralCards(game.graveyard.length)}
      >
        {game.graveyard.length ? (
          <div className="grid gap-2">
            {game.graveyard.map((instance) => {
              const card = cards.find((item) => item.id === instance.cardId);
              if (!card) return null;
              return (
                <CardSearchResult
                  key={instance.instanceId}
                  card={card}
                  collectionName={collectionName(card)}
                  onClick={() => setViewer(card)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState icon={<Archive className="size-6" />} title="Cemitério vazio" description="Cartas descartadas aparecem aqui." />
        )}
      </Sheet>

      <Sheet
        open={panel === "card" && Boolean(activeCard)}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
        variant="fullscreen"
        title={activeCard?.name ?? "Carta"}
      >
        {activeCard ? (
          <div>
            <button type="button" onClick={() => setViewer(activeCard)} className="block w-full">
              {activeCard.image ? (
                <img src={activeCard.image} alt={activeCard.name} className="mx-auto aspect-[63/88] w-full max-w-xs rounded-2xl object-cover" />
              ) : (
                <CardImagePlaceholder className="mx-auto h-36 w-full max-w-sm rounded-2xl" compact />
              )}
            </button>
            <p className="mt-4 text-sm font-semibold text-gold">
              {formatNumber(activeCard.number)} · {activeCollection?.name}
            </p>
            <h2 className="text-2xl font-semibold">{activeCard.name}</h2>
            <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted">Tradução</h3>
            <p className="mt-2 whitespace-pre-wrap font-serif text-lg leading-relaxed">
              {activeCard.text || "Nenhuma tradução cadastrada."}
            </p>
            <div className="mt-6 grid gap-3">
              <Button
                size="lg"
                onClick={() => {
                  if (!instanceId) return;
                  void playCard(instanceId).then(() => {
                    setPanel(null);
                    toast.success("Carta jogada");
                  });
                }}
              >
                Joguei esta carta
              </Button>
              <Button
                size="lg"
                variant="danger"
                onClick={() => {
                  if (!instanceId) return;
                  void discardCard(instanceId).then(() => {
                    setPanel(null);
                    toast.success("Carta enviada ao cemitério");
                  });
                }}
              >
                Descartar
              </Button>
            </div>
          </div>
        ) : null}
      </Sheet>

      <Sheet
        open={panel === "menu" || panel === "played"}
        onOpenChange={(open) => {
          if (!open) {
            setPanel(null);
            setConfirmEnd(false);
          }
        }}
        title={panel === "played" ? "Jogadas" : confirmEnd ? "Encerrar partida?" : "Partida"}
        description={panel === "played" ? pluralCards(game.played.length) : undefined}
      >
        {panel === "played" ? (
          <div className="grid gap-2">
            {game.played.length ? (
              game.played.map((instance) => {
                const card = cards.find((item) => item.id === instance.cardId);
                if (!card) return null;
                return (
                  <CardSearchResult
                    key={instance.instanceId}
                    card={card}
                    collectionName={collectionName(card)}
                    onClick={() => setViewer(card)}
                  />
                );
              })
            ) : (
              <p className="text-sm text-muted">Nenhuma carta jogada ainda.</p>
            )}
          </div>
        ) : confirmEnd ? (
          <div className="grid gap-2">
            <Button
              variant="danger"
              onClick={() => {
                void endMatch().then(() => navigate("/"));
              }}
            >
              Encerrar partida
            </Button>
            <Button variant="secondary" onClick={() => setConfirmEnd(false)}>
              Continuar jogando
            </Button>
          </div>
        ) : (
          <div className="grid gap-2">
            <Button variant="secondary" onClick={() => setPanel("played")}>
              Jogadas ({game.played.length})
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void restartMatch().then(() => navigate("/jogar/mao"));
              }}
            >
              Reiniciar partida
            </Button>
            <Button variant="danger" onClick={() => setConfirmEnd(true)}>
              Encerrar partida
            </Button>
          </div>
        )}
      </Sheet>

      {viewer ? <CardViewer card={viewer} collectionName={collectionName(viewer)} onClose={() => setViewer(null)} /> : null}
    </div>
  );
}
