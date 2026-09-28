import type { ReactNode } from "react";
import { ColorPips } from "@/components/ManaBadge.tsx";
import { formatNumber } from "@/lib/format.ts";
import type { Card } from "@/lib/types.ts";
import { cn } from "@/lib/utils.ts";

export function CardSearchResult({
  card,
  collectionName,
  badge,
  detail,
  action,
  onClick,
}: {
  card: Card;
  collectionName: string;
  badge?: string;
  detail?: string;
  action?: ReactNode;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-raised">
        {card.image ? (
          <img src={card.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[11px] font-semibold text-gold">{formatNumber(card.number)}</span>
        )}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-gold">{formatNumber(card.number)}</span>
          {badge ? (
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-gold">{badge}</span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate font-medium">{card.name}</span>
        <span className="mt-0.5 block truncate text-sm text-muted">
          {collectionName}
          {detail ? ` · ${detail}` : ""}
        </span>
      </span>
      <ColorPips colors={card.colors} />
      {action}
    </>
  );

  const className =
    "flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-3 py-3 text-left transition-colors hover:border-gold/40 touch-manipulation";

  if (onClick) {
    return (
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
        className={className}
      >
        {body}
      </button>
    );
  }

  return <div className={cn(className, "hover:border-line")}>{body}</div>;
}
