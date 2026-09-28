import type { Card } from "@/lib/types.ts";
import { formatNumber } from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";
import { CardImagePlaceholder } from "@/components/CardImagePlaceholder.tsx";

export function CardThumbnail({
  card,
  className,
  showCaption = false,
  priority = false,
}: {
  card: Card;
  className?: string;
  showCaption?: boolean;
  priority?: boolean;
}) {
  return (
    <span className={cn("block", className)}>
      <span className="relative block aspect-[63/88] overflow-hidden rounded-xl border border-line bg-card shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        ) : (
          <CardImagePlaceholder className="h-full w-full" compact />
        )}
        <span className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-gold">
          {formatNumber(card.number)}
        </span>
      </span>
      {showCaption ? (
        <span className="mt-2 block text-left">
          <span className="block text-sm font-medium leading-tight">{card.name}</span>
        </span>
      ) : null}
    </span>
  );
}
