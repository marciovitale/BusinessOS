"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardEditorDialog } from "@/components/card-editor-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteCard } from "@/actions/cards";
import { cn } from "@/lib/utils";
import type { Card, PillarSlug } from "@/lib/types";

/**
 * Ações por card: editar (abre CardEditor em Dialog) e excluir (confirmação
 * em AlertDialog — ação destrutiva). Client Component; pode ser renderizado
 * a partir do ContentCard (Server Component).
 */
export function CardActions({
  card,
  pillar,
  page,
  className,
}: {
  card: Card;
  pillar: PillarSlug;
  page: string;
  className?: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCard({ pillar, page, id: card.id });
        toast.success("Card excluído");
        setConfirmOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível excluir o card",
        );
      }
    });
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Editar card"
        onClick={() => setEditOpen(true)}
        className="size-7 text-muted-foreground hover:text-foreground"
      >
        <Pencil className="size-3.5" strokeWidth={1.75} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Excluir card"
        onClick={() => setConfirmOpen(true)}
        className="size-7 text-muted-foreground hover:text-foreground"
      >
        <Trash2 className="size-3.5" strokeWidth={1.75} />
      </Button>

      <CardEditorDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        pillar={pillar}
        page={page}
        card={card}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir card?</AlertDialogTitle>
            <AlertDialogDescription>
              O card “{card.title}” será removido permanentemente. Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {pending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
