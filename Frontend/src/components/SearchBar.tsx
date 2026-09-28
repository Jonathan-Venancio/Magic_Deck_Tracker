import { Search, X } from "lucide-react";
import type { RefObject } from "react";

export function SearchBar({
  value,
  onChange,
  placeholder,
  autoFocus = false,
  inputRef,
  onEnter,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  onEnter?: () => void;
}) {
  return (
    <label className="flex h-14 items-center gap-3 rounded-2xl border border-line bg-raised px-4 focus-within:border-gold/60">
      <Search className="size-5 shrink-0 text-gold" aria-hidden />
      <input
        ref={inputRef}
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onEnter?.();
        }}
        placeholder={placeholder}
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="h-full w-full bg-transparent text-[18px] text-foreground outline-none placeholder:text-muted"
        aria-label={placeholder}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="grid size-9 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-foreground"
          aria-label="Limpar busca"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </label>
  );
}
