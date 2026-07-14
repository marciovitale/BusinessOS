"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageUp } from "lucide-react";
import { toast } from "sonner";
import { uploadOrganizationLogo } from "@/actions/upload-organization-logo";

// Widget de trocar o logo de uma organização já existente (tela de detalhe
// do admin). Envia e substitui imediatamente ao selecionar um arquivo —
// sem passo de confirmação extra, mesmo padrão de upload direto usado em
// `add-organization-files.tsx`.
export function ChangeOrganizationLogo({
  organizationId,
  currentLogoUrl,
}: {
  organizationId: string;
  currentLogoUrl: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSelect(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("organizationId", organizationId);
      formData.set("file", file);
      await uploadOrganizationLogo(formData);
      toast.success("Logo atualizado.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar o logo.");
      setPreview(null);
    } finally {
      setPending(false);
      URL.revokeObjectURL(objectUrl);
    }
  }

  const shown = preview ?? currentLogoUrl;

  return (
    <label
      htmlFor="change-org-logo"
      className="flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border text-muted-foreground hover:border-foreground/35 hover:bg-muted/50"
      title="Trocar logo"
    >
      {shown ? (
        <Image src={shown} alt="" width={64} height={64} className="size-16 object-cover" unoptimized />
      ) : (
        <ImageUp className="size-5" strokeWidth={1.5} />
      )}
      <input
        id="change-org-logo"
        type="file"
        accept="image/*"
        className="hidden"
        disabled={pending}
        onChange={(e) => {
          handleSelect(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}
