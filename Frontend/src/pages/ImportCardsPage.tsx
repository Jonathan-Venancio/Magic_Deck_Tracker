import { Download, FileSpreadsheet } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Page, PageHeader } from "@/components/PageHeader.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { api } from "@/lib/api.ts";
import type { ImportSummary } from "@/lib/types.ts";
import { ManaBadge } from "@/components/ManaBadge.tsx";

const EXAMPLES = [
  { cost: "2U", meaning: "Dois genéricos + um azul" },
  { cost: "1", meaning: "Um genérico (qualquer cor)" },
  { cost: "1WU", meaning: "Um genérico + branco + azul" },
  { cost: "UU", meaning: "Dois azuis" },
  { cost: "R", meaning: "Um vermelho" },
];

export function ImportCardsPage() {
  const { importCards } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<ImportSummary | null>(null);

  async function download(fmt: "xlsx" | "ods") {
    try {
      await api.downloadTemplate(fmt);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível baixar o modelo.");
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setWorking(true);
    setResult(null);
    try {
      const outcome = await importCards(file);
      if (!outcome.ok) {
        toast.error(outcome.message);
        return;
      }
      setResult(outcome.value);
      const total = outcome.value.created + outcome.value.updated;
      if (total) {
        toast.success(
          total === 1 ? "1 carta importada." : `${total} cartas importadas.`,
        );
      } else if (outcome.value.errors.length) {
        toast.error("Nenhuma carta foi importada. Veja os erros abaixo.");
      } else {
        toast.error("A planilha não tinha cartas novas.");
      }
    } finally {
      setWorking(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Page>
      <PageHeader
        title="Importar cartas"
        subtitle="Preencha uma planilha e cadastre várias cartas de uma vez. A foto você adiciona depois."
        backTo="/colecao"
      />

      <section className="rounded-3xl border border-line bg-card p-4">
        <h2 className="text-lg font-semibold">1. Baixar o modelo</h2>
        <p className="mt-2 text-sm text-muted">
          Excel usa .xlsx. No LibreOffice Calc o formato é .ods — .odt é arquivo de texto e não serve.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => void download("xlsx")}>
            <Download className="size-4" /> Modelo Excel (.xlsx)
          </Button>
          <Button variant="secondary" onClick={() => void download("ods")}>
            <Download className="size-4" /> Modelo Calc (.ods)
          </Button>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-line bg-card p-4">
        <h2 className="text-lg font-semibold">Custo de mana e cores</h2>
        <p className="mt-2 text-sm text-muted">
          O número é mana genérica, de qualquer cor. As letras são mana colorida: W branco, U azul, B preto, R
          vermelho, G verde. Junte tudo sem espaço.
        </p>
        <div className="mt-4 grid gap-2">
          {EXAMPLES.map((item) => (
            <div key={item.cost} className="flex items-center gap-3 rounded-2xl border border-line bg-raised px-3 py-3">
              <code className="w-14 font-semibold text-gold">{item.cost}</code>
              <ManaBadge cost={item.cost} />
              <p className="min-w-0 flex-1 text-sm text-muted">{item.meaning}</p>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-raised px-3 py-3">
            <code className="w-14 font-semibold text-gold">—</code>
            <p className="min-w-0 flex-1 text-sm text-muted">Vazio: terreno, sem custo</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">
          Cores: deixe vazio e o app lê pelo custo (2U vira Azul). Carta com mais de uma cor: na coluna Cores use
          U, W ou Azul, Branco ou UW. No custo, 1WU já marca as duas cores.
        </p>
        <p className="mt-2 text-sm text-muted">
          Se a coleção da linha ainda não existir, o app cria. Se já existir, a carta entra nela.
        </p>
      </section>

      <section className="mt-4 rounded-3xl border border-line bg-card p-4">
        <h2 className="text-lg font-semibold">2. Enviar a planilha</h2>
        <p className="mt-2 text-sm text-muted">Apague as linhas de exemplo do modelo antes de importar as suas cartas.</p>
        <Button className="mt-4 w-full" size="lg" disabled={working} onClick={() => inputRef.current?.click()}>
          <FileSpreadsheet className="size-4" />
          {working ? "Importando..." : "Escolher arquivo"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.oasis.opendocument.spreadsheet"
          className="hidden"
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
      </section>

      {result ? (
        <section className="mt-4 rounded-3xl border border-line bg-card p-4">
          <h2 className="text-lg font-semibold">Resultado</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-line bg-raised px-2 py-3">
              <p className="text-2xl font-semibold tabular-nums">{result.created}</p>
              <p className="text-xs text-muted">novas</p>
            </div>
            <div className="rounded-2xl border border-line bg-raised px-2 py-3">
              <p className="text-2xl font-semibold tabular-nums">{result.updated}</p>
              <p className="text-xs text-muted">atualizadas</p>
            </div>
            <div className="rounded-2xl border border-line bg-raised px-2 py-3">
              <p className="text-2xl font-semibold tabular-nums">{result.collectionsCreated}</p>
              <p className="text-xs text-muted">coleções novas</p>
            </div>
          </div>
          {result.errors.length ? (
            <div className="mt-4 grid gap-2">
              {result.errors.map((error) => (
                <p key={`${error.row}-${error.message}`} className="rounded-2xl border border-danger/30 bg-danger/10 px-3 py-3 text-sm">
                  Linha {error.row}: {error.message}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </Page>
  );
}
