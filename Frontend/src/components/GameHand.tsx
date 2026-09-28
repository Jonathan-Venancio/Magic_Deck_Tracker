import { CardThumbnail } from "@/components/CardThumbnail.tsx";
import { EmptyState } from "@/components/EmptyState.tsx";
import type { Card, CardInstance } from "@/lib/types.ts";
import { cn } from "@/lib/utils.ts";
import { Hand } from "lucide-react";

export function GameHand({
  hand,
  cards,
  lastAddedId,
  onOpen,
}: {
  hand: CardInstance[];
  cards: Card[];
  lastAddedId?: string | null;
  onOpen: (instanceId: string, card: Card) => void;
}) {
  const resolved = hand
    .map((instance) => {
      const card = cards.find((item) => item.id === instance.cardId);
      return card ? { instance, card } : null;
    })
    .filter((item): item is { instance: CardInstance; card: Card } => item !== null);

  if (!resolved.length) {
    return (
      <EmptyState
        icon={<Hand className="size-6" />}
        title="Sua mão está vazia"
        description="Use Comprar Carta para adicionar a carta física que você comprou."
      />
    );
  }

  return (
    <div className="overflow-x-auto py-6">
      <div className="flex min-w-full items-end px-2">
        {resolved.map(({ instance, card }, index) => {
          const middle = (resolved.length - 1) / 2;
          const rotation = (index - middle) * 2.4;
          return (
            <button
              key={instance.instanceId}
              type="button"
              onClick={() => onOpen(instance.instanceId, card)}
              className={cn("shrink-0", lastAddedId === instance.instanceId && "animate-deal")}
              style={{
                marginLeft: index === 0 ? 0 : resolved.length > 5 ? -52 : -36,
                zIndex: index + 1,
              }}
              aria-label={`Abrir ${card.name}`}
            >
              <span className="block origin-bottom" style={{ transform: `rotate(${rotation}deg)` }}>
                <CardThumbnail card={card} className="w-[108px]" priority={index < 3} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
