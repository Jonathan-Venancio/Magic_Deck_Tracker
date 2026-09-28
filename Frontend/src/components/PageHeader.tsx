import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export function PageHeader({
  title,
  subtitle,
  backTo,
  action,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  action?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="mb-5 flex items-start gap-3">
      {backTo ? (
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl border border-line bg-card"
          aria-label="Voltar"
        >
          <ChevronLeft className="size-5" />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl animate-rise px-4 py-5">{children}</div>;
}
