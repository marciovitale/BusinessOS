"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadAndIngestFile } from "@/actions/ingest-file";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Widget compacto para acrescentar arquivos ao repositório (RAG) de uma
// organização já existente — mesma lógica de upload+ingestão usada no
// wizard de criação (`components/new-organization-form.tsx`), só que aqui
// dispara uma organização por vez a partir da tela de detalhe.
export function AddOrganizationFiles({ organizationId }: { organizationId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [phase, setPhase] = useState("");
  const router = useRouter();

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (files.length === 0) return;
    setPending(true);
    let ready = 0;
    let failed = 0;
    try {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        setPhase(`Processando ${i + 1} de ${files.length}: ${file.name}…`);
        try {
          const formData = new FormData();
          formData.set("organizationId", organizationId);
          formData.set("file", file);
          const result = await uploadAndIngestFile(formData);
          if (!result.ok) {
            failed += 1;
            toast.error(`"${file.name}" falhou: ${result.error}`);
          } else if (result.status === "ready") {
            ready += 1;
          } else {
            failed += 1;
            toast.error(`"${file.name}" falhou: ${result.errorMessage}`);
          }
        } catch (err) {
          failed += 1;
          toast.error(
            `"${file.name}" falhou: ${err instanceof Error ? err.message : "erro desconhecido"}`,
          );
        }
      }
      toast.success(
        `${ready} arquivo${ready === 1 ? "" : "s"} processado${ready === 1 ? "" : "s"}` +
          (failed > 0 ? `, ${failed} falhou/falharam.` : "."),
      );
      setFiles([]);
      router.refresh();
    } finally {
      setPending(false);
      setPhase("");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="add-org-files"
        className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground hover:border-foreground/35 hover:bg-muted/50"
      >
        <UploadCloud className="size-5" strokeWidth={1.5} />
        <span>
          Clique para selecionar arquivos (texto, PDF, Word, planilhas, imagens, áudio ou
          vídeo — até 25MB cada)
        </span>
        <input
          id="add-org-files"
          type="file"
          multiple
          className="hidden"
          disabled={pending}
          onChange={(e) => {
            handleFilesSelected(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {files.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pending}
                onClick={() => removeFile(i)}
                aria-label="Remover arquivo"
              >
                <X className="size-4" strokeWidth={1.75} />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        {pending && phase ? (
          <p className="text-xs text-muted-foreground">{phase}</p>
        ) : (
          <span />
        )}
        <Button size="sm" disabled={files.length === 0 || pending} onClick={handleSubmit}>
          {pending ? "Enviando…" : "Adicionar ao repositório"}
        </Button>
      </div>
    </div>
  );
}
