"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { deleteOrganizationFile } from "@/actions/organization-files";

export function DeleteFileButton({
  fileId,
  organizationId,
  name,
}: {
  fileId: string;
  organizationId: string;
  name: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteOrganizationFile({ fileId, organizationId });
        toast.success(`"${name}" removido do repositório.`);
        setConfirmOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível remover o arquivo.");
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Remover ${name}`}
        title="Remover definitivamente"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="size-3.5" strokeWidth={1.75} />
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover arquivo definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              “{name}” e todo o conteúdo indexado dele (chunks/embeddings) serão apagados.
              Esta ação não pode ser desfeita.
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
              {pending ? "Removendo…" : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
