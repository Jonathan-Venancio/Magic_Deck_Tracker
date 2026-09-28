import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export function CardImagePlaceholder({
  className,
  hint,
  compact = false,
}: {
  className?: string;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 bg-[linear-gradient(180deg,#2a241e,#141210)] text-center text-muted",
        className,
      )}
    >
      <span className="grid size-11 place-items-center rounded-2xl border border-line bg-black/20">
        <ImageOff className={compact ? "size-4" : "size-5"} />
      </span>
      <span className={cn("font-medium tracking-wide", compact ? "text-[11px]" : "text-sm")}>Sem imagem</span>
      {hint ? <span className="max-w-[16rem] px-4 text-xs leading-relaxed">{hint}</span> : null}
    </div>
  );
}
