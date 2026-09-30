import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CardImagePlaceholder } from "@/components/CardImagePlaceholder.tsx";
import { EmptyState } from "@/components/EmptyState.tsx";
import { ImageUploader } from "@/components/ImageUploader.tsx";
import { ManaBadge } from "@/components/ManaBadge.tsx";
import { Page, PageHeader } from "@/components/PageHeader.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Field, Input, Textarea } from "@/components/ui/field.tsx";
import { useApp } from "@/context/AppContext.tsx";
import { formatNumber } from "@/lib/format.ts";
import { COLOR_ORDER, COLOR_LABEL, colorsFromMana } from "@/lib/mana.ts";
import type { CardCategory, ManaColor } from "@/lib/types.ts";
import { Library } from "lucide-react";
import { Link } from "react-router-dom";

const categories: { id: CardCategory; label: string }[] = [
  { id: "creature", label: "Criatura" },
  { id: "spell", label: "Mágica" },
  { id: "land", label: "Terreno" },
  { id: "other", label: "Outro" },
];

export function CardFormPage() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { cards, collections, addCard, updateCard } = useApp();
  const existing = cardId ? cards.find((card) => card.id === cardId) : undefined;
  const [name, setName] = useState(existing?.name ?? "");
  const [collectionId, setCollectionId] = useState(existing?.collectionId ?? collections[0]?.id ?? "");
  const [number, setNumber] = useState(existing?.number ?? "");
  const [typeLine, setTypeLine] = useState(existing?.typeLine ?? "");
  const [manaCost, setManaCost] = useState(existing?.manaCost ?? "");
  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [text, setText] = useState(existing?.text ?? "");
  const [image, setImage] = useState<string | undefined>(existing?.image);
  const [category, setCategory] = useState<CardCategory>(existing?.category ?? "creature");
  const [colors, setColors] = useState<ManaColor[]>(existing?.colors ?? []);

  if (cardId && !existing) {
    return (
      <Page>
        <EmptyState icon={<Library className="size-6" />} title="Carta não encontrada" description="Não foi possível abrir a edição." />
      </Page>
    );
  }

  const collection = collections.find((item) => item.id === collectionId);

  function toggleColor(color: ManaColor) {
    setColors((current) => (current.includes(color) ? current.filter((item) => item !== color) : [...current, color]));
  }

  async function save() {
    const draft = {
      name,
      collectionId,
      number,
      typeLine,
      category,
      manaCost,
      colors,
      quantity,
      text,
      image,
    };
    const result = existing ? await updateCard(existing.id, draft) : await addCard(draft);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(existing ? "Carta atualizada!" : "Carta adicionada à coleção!");
    navigate(`/carta/${result.value.id}`);
  }

  return (
    <Page>
      <PageHeader
        title={existing ? "Editar carta" : "Adicionar nova carta"}
        subtitle="A imagem só entra se você enviar uma do seu aparelho."
        backTo={existing ? `/carta/${existing.id}` : "/colecao"}
      />
      {!collections.length ? (
        <EmptyState
          icon={<Library className="size-6" />}
          title="Crie uma coleção primeiro"
          description="As cartas ficam organizadas dentro de uma coleção."
          action={
            <Button asChild>
              <Link to="/colecao/nova">Criar coleção</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            <Field label="Nome da carta *">
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Katara, Mestra da Água" />
            </Field>
            <Field label="Coleção *">
              <select
                value={collectionId}
                onChange={(event) => setCollectionId(event.target.value)}
                className="h-14 w-full rounded-2xl border border-line bg-raised px-4"
              >
                {collections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Número da carta *">
                <Input
                  value={number}
                  inputMode="numeric"
                  onChange={(event) => setNumber(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder="127"
                />
              </Field>
              <Field label="Quantidade">
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                />
              </Field>
            </div>
            <Field label="Tipo">
              <Input value={typeLine} onChange={(event) => setTypeLine(event.target.value)} placeholder="Criatura Lendária — Humano Mago" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Custo de mana"
                hint="Número = genérico. Letras: W U B R G. Híbrida (verde ou vermelha): 1R/G. Ex.: 2U, 1, 1WU."
              >
                <Input
                  value={manaCost}
                  onChange={(event) => {
                    const next = event.target.value.toUpperCase();
                    setManaCost(next);
                    const parsed = colorsFromMana(next);
                    if (parsed.length) setColors(parsed);
                  }}
                  placeholder="2U"
                />
              </Field>
              <Field label="Categoria">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as CardCategory)}
                  className="h-14 w-full rounded-2xl border border-line bg-raised px-4"
                >
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-muted">Cores</p>
              <div className="flex flex-wrap gap-2">
                {COLOR_ORDER.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`h-10 rounded-full px-4 text-sm ${colors.includes(color) ? "bg-gold-deep text-foreground" : "border border-line bg-card"}`}
                  >
                    {COLOR_LABEL[color]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Descrição / Tradução</h2>
              <div className="mt-3">
                <Textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Digite aqui a tradução ou descrição da carta em português..."
                />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Imagem da carta</h2>
              <div className="mt-3">
                <ImageUploader value={image} onChange={setImage} />
              </div>
            </div>
          </div>
          <aside>
            <h2 className="text-lg font-semibold">Preview</h2>
            <article className="mt-3 rounded-3xl border border-line bg-card p-4">
              {image ? (
                <img src={image} alt="" className="mx-auto aspect-[63/88] w-48 rounded-2xl object-cover" />
              ) : (
                <CardImagePlaceholder className="mx-auto h-36 w-full rounded-2xl" compact />
              )}
              <p className="mt-4 text-sm font-semibold text-gold">{number ? formatNumber(number) : "#—"}</p>
              <h3 className="text-xl font-semibold">{name || "Nome da carta"}</h3>
              <p className="mt-1 text-sm text-muted">{collection?.name ?? "Coleção"}</p>
              <div className="mt-3">
                <ManaBadge cost={manaCost} />
              </div>
            </article>
            <Button className="mt-4 w-full" size="lg" onClick={save}>
              {existing ? "Salvar alterações" : "Salvar carta"}
            </Button>
          </aside>
        </div>
      )}
    </Page>
  );
}
