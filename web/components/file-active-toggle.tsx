"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleFileActive } from "@/actions/organization-files";

// Liga/desliga um arquivo do repositório (RAG). Desativado continua
// arquivado, só sai da busca por similaridade até ser reativado.
export function FileActiveToggle({
  fileId,
  organizationId,
  isActive,
  name,
}: {
  fileId: string;
  organizationId: string;
  isActive: boolean;
  name: string;
}) {
  const [checked, setChecked] = useState(isActive);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      try {
        await toggleFileActive({ fileId, organizationId, isActive: next });
        toast.success(next ? `"${name}" ativado na busca.` : `"${name}" desativado da busca.`);
        router.refresh();
      } catch (err) {
        setChecked(!next);
        toast.error(err instanceof Error ? err.message : "Não foi possível atualizar o arquivo.");
      }
    });
  }

  return (
    <Switch
      checked={checked}
      disabled={pending}
      onCheckedChange={handleChange}
      aria-label={checked ? `Desativar ${name}` : `Ativar ${name}`}
      title={checked ? "Ativo na busca (RAG)" : "Desativado — fora da busca"}
    />
  );
}
