"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardEditor } from "@/components/card-editor";
import type { Card, PillarSlug } from "@/lib/types";

/**
 * Envelopa o CardEditor num Dialog do shadcn. Reusado tanto pela criação
 * ("Novo card") quanto pela edição a partir de um card. Ao salvar, fecha o
 * dialog e revalida a rota (router.refresh) para refletir a mudança.
 */
export function CardEditorDialog({
  open,
  onOpenChange,
  pillar,
  page,
  card,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pillar: PillarSlug;
  page: string;
  card?: Partial<Card>;
}) {
  const router = useRouter();
  const isEdit = Boolean(card?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar card" : "Novo card"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize o conteúdo deste card."
              : "Crie um novo card nesta página."}
          </DialogDescription>
        </DialogHeader>
        <CardEditor
          pillar={pillar}
          page={page}
          card={card}
          onSaved={() => {
            onOpenChange(false);
            router.refresh();
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
