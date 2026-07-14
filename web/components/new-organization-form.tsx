"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Sparkles, Trash2, UploadCloud, X, FileText, ImageUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOrganization } from "@/actions/admin";
import { inviteMember } from "@/actions/organization-members";
import { uploadAndIngestFile } from "@/actions/ingest-file";
import { uploadOrganizationLogo } from "@/actions/upload-organization-logo";
import { improveOrgField } from "@/actions/ai-improve-org-field";

type Role = "owner" | "member";

interface InviteRow {
  key: string;
  email: string;
  role: Role;
}

function newInviteRow(role: Role = "member"): InviteRow {
  return { key: crypto.randomUUID(), email: "", role };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Dialog "+ Nova organização" de /admin: nome + descrição (com "Melhorar com
// IA" em cada), lista repetível de convites, e upload de arquivos para o
// repositório (RAG) da organização. Ao submeter, orquestra várias chamadas
// de Server Action em sequência (cria org -> convida membros -> sobe e
// processa cada arquivo) e mostra um resumo ao final.
export function NewOrganizationForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [improving, setImproving] = useState<"name" | "description" | null>(null);
  const [invites, setInvites] = useState<InviteRow[]>([newInviteRow("owner")]);
  const [files, setFiles] = useState<File[]>([]);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [phase, setPhase] = useState("");
  const router = useRouter();

  function reset() {
    setName("");
    setDescription("");
    setInvites([newInviteRow("owner")]);
    setFiles([]);
    setLogo(null);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPhase("");
  }

  function handleLogoSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function removeLogo() {
    setLogo(null);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function updateInvite(key: string, patch: Partial<InviteRow>) {
    setInvites((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addInvite() {
    setInvites((rows) => [...rows, newInviteRow("member")]);
  }

  function removeInvite(key: string) {
    setInvites((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.key !== key)));
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleImprove(field: "name" | "description") {
    const value = field === "name" ? name : description;
    if (!value.trim()) {
      toast.error("Escreva algo antes de pedir para a IA melhorar.");
      return;
    }
    setImproving(field);
    try {
      const improved = await improveOrgField({
        field,
        value,
        organizationName: field === "description" ? name : undefined,
      });
      if (field === "name") setName(improved);
      else setDescription(improved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível melhorar este campo.");
    } finally {
      setImproving(null);
    }
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Dê um nome para a organização.");
      return;
    }

    setPending(true);
    try {
      setPhase("Criando organização…");
      const org = await createOrganization({ name: name.trim(), description: description.trim() });

      if (logo) {
        setPhase("Enviando logo…");
        try {
          const formData = new FormData();
          formData.set("organizationId", org.organizationId);
          formData.set("file", logo);
          await uploadOrganizationLogo(formData);
        } catch (err) {
          toast.error(
            `Logo não foi salvo: ${err instanceof Error ? err.message : "erro desconhecido"}`,
          );
        }
      }

      const validInvites = invites.filter((r) => r.email.trim());
      let invitesOk = 0;
      let invitesFailed = 0;
      let invitesEmailFailed = 0;
      for (const row of validInvites) {
        setPhase(`Convidando ${row.email}…`);
        try {
          const result = await inviteMember({
            organizationId: org.organizationId,
            email: row.email.trim(),
            role: row.role,
          });
          invitesOk += 1;
          if (!result.emailSent) {
            invitesEmailFailed += 1;
            toast.warning(
              `Convite para ${row.email} criado, mas o e-mail não pôde ser enviado` +
                (result.emailError ? ` (${result.emailError})` : "") +
                ".",
            );
          }
        } catch (err) {
          invitesFailed += 1;
          toast.error(
            `Convite para ${row.email} falhou: ${err instanceof Error ? err.message : "erro desconhecido"}`,
          );
        }
      }

      let filesReady = 0;
      let filesFailed = 0;
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        setPhase(`Processando arquivo ${i + 1} de ${files.length}: ${file.name}…`);
        try {
          const formData = new FormData();
          formData.set("organizationId", org.organizationId);
          formData.set("file", file);
          const result = await uploadAndIngestFile(formData);
          if (!result.ok) {
            filesFailed += 1;
            toast.error(`"${file.name}" falhou: ${result.error}`);
          } else if (result.status === "ready") {
            filesReady += 1;
          } else {
            filesFailed += 1;
            toast.error(`"${file.name}" falhou: ${result.errorMessage}`);
          }
        } catch (err) {
          filesFailed += 1;
          toast.error(
            `"${file.name}" falhou: ${err instanceof Error ? err.message : "erro desconhecido"}`,
          );
        }
      }

      const summaryParts = [`Organização "${org.organizationName}" criada.`];
      if (validInvites.length > 0) {
        const emailedOk = invitesOk - invitesEmailFailed;
        summaryParts.push(
          `${emailedOk} convite${emailedOk === 1 ? "" : "s"} enviado${emailedOk === 1 ? "" : "s"} por e-mail` +
            (invitesEmailFailed > 0 ? `, ${invitesEmailFailed} sem e-mail (criado mesmo assim)` : "") +
            (invitesFailed > 0 ? `, ${invitesFailed} falhou/falharam` : "") +
            ".",
        );
      }
      if (files.length > 0) {
        summaryParts.push(
          `${filesReady} arquivo${filesReady === 1 ? "" : "s"} processado${filesReady === 1 ? "" : "s"}` +
            (filesFailed > 0 ? `, ${filesFailed} falhou/falharam.` : "."),
        );
      }

      toast.success(summaryParts.join(" "));
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível criar a organização");
    } finally {
      setPending(false);
      setPhase("");
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" strokeWidth={1.75} />
        Nova organização
      </Button>

      <Dialog open={open} onOpenChange={(v) => !pending && setOpen(v)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova organização</DialogTitle>
            <DialogDescription>
              Cria a organização, convida os membros iniciais por e-mail e sobe arquivos
              para o repositório (RAG) dela.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-6 overflow-y-auto pr-1">
            {/* Logo */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-logo">Logo da organização</Label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="org-logo"
                  className="flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border text-muted-foreground hover:border-foreground/35 hover:bg-muted/50"
                >
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt=""
                      width={64}
                      height={64}
                      className="size-16 object-cover"
                      unoptimized
                    />
                  ) : (
                    <ImageUp className="size-5" strokeWidth={1.5} />
                  )}
                  <input
                    id="org-logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={pending}
                    onChange={(e) => {
                      handleLogoSelected(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span>Aparece no header fixo quando esta organização estiver ativa.</span>
                  {logo ? (
                    <button
                      type="button"
                      onClick={removeLogo}
                      disabled={pending}
                      className="w-fit text-foreground underline-offset-2 hover:underline"
                    >
                      Remover
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Nome */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-name">Nome</Label>
              <div className="flex gap-2">
                <Input
                  id="org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ensinando"
                  disabled={pending}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending || improving !== null || !name.trim()}
                  onClick={() => handleImprove("name")}
                >
                  <Sparkles className="size-3.5" strokeWidth={1.75} />
                  {improving === "name" ? "Melhorando…" : "Melhorar com IA"}
                </Button>
              </div>
            </div>

            {/* Descrição */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-description">Descrição</Label>
              <Textarea
                id="org-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Do que essa organização trata, em uma ou duas frases."
                disabled={pending}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending || improving !== null || !description.trim()}
                  onClick={() => handleImprove("description")}
                >
                  <Sparkles className="size-3.5" strokeWidth={1.75} />
                  {improving === "description" ? "Melhorando…" : "Melhorar com IA"}
                </Button>
              </div>
            </div>

            {/* Convites */}
            <div className="flex flex-col gap-2">
              <Label>Convidar membros</Label>
              <div className="flex flex-col gap-2">
                {invites.map((row) => (
                  <div key={row.key} className="flex items-center gap-2">
                    <Input
                      type="email"
                      value={row.email}
                      onChange={(e) => updateInvite(row.key, { email: e.target.value })}
                      placeholder="pessoa@empresa.com"
                      disabled={pending}
                      className="flex-1"
                    />
                    <Select
                      value={row.role}
                      onValueChange={(v) => updateInvite(row.key, { role: v as Role })}
                      disabled={pending}
                    >
                      <SelectTrigger className="w-28 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={pending || invites.length <= 1}
                      onClick={() => removeInvite(row.key)}
                      aria-label="Remover convite"
                    >
                      <Trash2 className="size-4" strokeWidth={1.75} />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                disabled={pending}
                onClick={addInvite}
              >
                <Plus className="size-3.5" strokeWidth={1.75} />
                Adicionar membro
              </Button>
            </div>

            {/* Repositório (RAG) */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="org-files">Repositório (RAG)</Label>
              <label
                htmlFor="org-files"
                className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground hover:border-foreground/35 hover:bg-muted/50"
              >
                <UploadCloud className="size-5" strokeWidth={1.5} />
                <span>
                  Clique para selecionar arquivos (texto, PDF, Word, planilhas, imagens,
                  áudio ou vídeo — até 25MB cada)
                </span>
                <input
                  id="org-files"
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
            </div>
          </div>

          <DialogFooter className="items-center gap-3 sm:justify-between">
            {pending && phase ? (
              <p className="text-xs text-muted-foreground">{phase}</p>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button disabled={!name.trim() || pending} onClick={handleSubmit}>
                {pending ? "Criando…" : "Criar organização"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
