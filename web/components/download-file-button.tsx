"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getFileDownloadUrl } from "@/actions/organization-files";

// Só renderizado pelo pai quando o usuário logado é owner da organização
// (ou platform admin) — a Server Action também barra qualquer outro caso.
export function DownloadFileButton({
  fileId,
  organizationId,
  name,
}: {
  fileId: string;
  organizationId: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDownload() {
    startTransition(async () => {
      try {
        const { url } = await getFileDownloadUrl({ fileId, organizationId });
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível baixar o arquivo.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Baixar ${name}`}
      title="Baixar arquivo original"
      disabled={pending}
      onClick={handleDownload}
    >
      <Download className="size-3.5" strokeWidth={1.75} />
    </Button>
  );
}
