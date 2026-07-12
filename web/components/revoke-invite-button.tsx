"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { revokeInvite } from "@/actions/organization-members";

export function RevokeInviteButton({ inviteId, email }: { inviteId: string; email: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleRevoke() {
    startTransition(async () => {
      try {
        await revokeInvite({ inviteId });
        toast.success(`Convite para ${email} revogado`);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível revogar o convite",
        );
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Revogar convite de ${email}`}
      title="Revogar convite"
      disabled={pending}
      onClick={handleRevoke}
    >
      <X className="size-3.5" strokeWidth={1.75} />
    </Button>
  );
}
