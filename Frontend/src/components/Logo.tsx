export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-2xl border border-gold/40 bg-card text-gold">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <rect x="5" y="3" width="14" height="18" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8.2l1.1 2.2 2.4.3-1.8 1.6.4 2.4L12 13.6l-2.1 1.1.4-2.4-1.8-1.6 2.4-.3L12 8.2z" fill="currentColor" />
        </svg>
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-wide">Deck Tracker</span>
        <span className="block text-xs text-muted">Magic companion</span>
      </span>
    </span>
  );
}
