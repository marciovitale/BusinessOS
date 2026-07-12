"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardEditorDialog } from "@/components/card-editor-dialog";
import type { Card, PillarSlug } from "@/lib/types";

// Botão "Novo card" (também reusado no empty state como "Criar primeiro card").
// Abre o CardEditor num Dialog do shadcn em modo criação (ou edição, se `card`
// for passado). Ao salvar, o dialog fecha e a rota é revalidada.
export function NewCardButton({
  pillar,
  page,
  label = "Novo card",
  variant = "default",
  card,
}: {
  pillar: PillarSlug;
  page: string;
  label?: string;
  variant?: "default" | "outline" | "secondary";
  card?: Partial<Card>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" strokeWidth={1.75} />
        {label}
      </Button>

      <CardEditorDialog
        open={open}
        onOpenChange={setOpen}
        pillar={pillar}
        page={page}
        card={card}
      />
    </>
  );
}
