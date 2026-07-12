"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserMinus } from "lucide-react";
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
import { removeMember } from "@/actions/organization-members";

export function RemoveMemberButton({
  organizationId,
  userId,
  name,
}: {
  organizationId: string;
  userId: string;
  name: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleRemove() {
    startTransition(async () => {
      try {
        await removeMember({ organizationId, userId });
        toast.success(`${name} removido da organização`);
        setConfirmOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível remover este membro",
        );
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
        title="Remover membro"
        onClick={() => setConfirmOpen(true)}
      >
        <UserMinus className="size-3.5" strokeWidth={1.75} />
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro?</AlertDialogTitle>
            <AlertDialogDescription>
              “{name}” perde o acesso a esta organização imediatamente. Esta ação não
              pode ser desfeita — a pessoa precisaria de um novo convite para voltar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
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
