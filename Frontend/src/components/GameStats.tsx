import { cn } from "@/lib/utils.ts";

function Stat({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const className = cn(
    "rounded-2xl border border-line bg-card px-2 py-3 text-center",
    onClick && "hover:border-gold/40",
  );
  const content = (
    <>
      <span className="block text-2xl font-semibold tabular-nums">{value}</span>
      <span className="mt-0.5 block text-xs uppercase tracking-wide text-muted">{label}</span>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }
  return <div className={className}>{content}</div>;
}

export function GameStats({
  library,
  hand,
  graveyard,
  onGraveyard,
}: {
  library: number;
  hand: number;
  graveyard: number;
  onGraveyard?: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Stat label="Biblioteca" value={library} />
      <Stat label="Mão" value={hand} />
      <Stat label="Cemitério" value={graveyard} onClick={onGraveyard} />
    </div>
  );
}
