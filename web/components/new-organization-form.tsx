"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createOrganizationWithOwner } from "@/actions/admin";
import { slugify } from "@/lib/utils";

// Formulário "Nova organização": nome + slug (derivado automaticamente do
// nome, mas editável) + e-mail do owner inicial. Ao submeter, cria a org e
// um convite `pending` de owner — não há e-mail real enviado neste MVP.
export function NewOrganizationForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function reset() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setOwnerEmail("");
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        const result = await createOrganizationWithOwner({ name, slug, ownerEmail });
        toast.success(
          `Convite enviado para ${result.ownerEmail} — quando essa pessoa fizer login, vira owner de "${result.organizationName}". Compartilhe o link de login com ela manualmente por enquanto.`,
        );
        setOpen(false);
        reset();
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível criar a organização",
        );
      }
    });
  }

  const canSubmit = name.trim() && slug.trim() && ownerEmail.trim();

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" strokeWidth={1.75} />
        Nova organização
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova organização</DialogTitle>
            <DialogDescription>
              Cria a organização e um convite pendente de owner. A pessoa vira owner
              assim que fizer login com esse e-mail — não há envio de e-mail
              automático neste MVP, compartilhe o link de login manualmente.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-name">Nome</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Ensinando"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="ensinando"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-owner-email">E-mail do owner inicial</Label>
              <Input
                id="org-owner-email"
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="owner@empresa.com"
                disabled={pending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={!canSubmit || pending} onClick={handleSubmit}>
              {pending ? "Criando…" : "Criar organização"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
