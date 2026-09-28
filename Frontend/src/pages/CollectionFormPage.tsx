import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ImageUploader.tsx";
import { Page, PageHeader } from "@/components/PageHeader.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Field, Input, Textarea } from "@/components/ui/field.tsx";
import { useApp } from "@/context/AppContext.tsx";

export function CollectionFormPage() {
  const navigate = useNavigate();
  const { addCollection } = useApp();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>();

  function save() {
    const result = addCollection({ name, code, description, coverImage });
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Coleção criada!");
    navigate(`/colecao/${result.value.id}`);
  }

  return (
    <Page>
      <PageHeader title="Criar coleção" subtitle="A capa é opcional e também é enviada por você." backTo="/colecao" />
      <div className="grid max-w-2xl gap-4">
        <Field label="Nome da coleção">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Avatar: The Last Airbender" />
        </Field>
        <Field label="Sigla">
          <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="TLA" maxLength={6} />
        </Field>
        <Field label="Descrição">
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Minha coleção de Avatar." />
        </Field>
        <div>
          <h2 className="text-lg font-semibold">Imagem / capa opcional</h2>
          <div className="mt-3">
            <ImageUploader value={coverImage} onChange={setCoverImage} label="Adicionar capa" emptyHint="Sem capa" />
          </div>
        </div>
        <Button size="lg" onClick={save}>
          Criar coleção
        </Button>
      </div>
    </Page>
  );
}
