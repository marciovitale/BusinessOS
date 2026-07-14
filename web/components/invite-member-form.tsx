"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteMember } from "@/actions/organization-members";

// Formulário "Convidar membro": só é renderizado pelo pai quando o usuário
// logado é owner da organização ativa (a RLS de INSERT em
// `organization_invites` barraria qualquer outro caso mesmo assim).
export function InviteMemberForm({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "owner">("member");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function reset() {
    setEmail("");
    setRole("member");
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        const result = await inviteMember({ organizationId, email, role });
        if (result.emailSent) {
          toast.success(`Convite enviado por e-mail para ${email}.`);
        } else {
          toast.warning(
            `Convite criado para ${email}, mas o e-mail não pôde ser enviado` +
              (result.emailError ? ` (${result.emailError})` : "") +
              ". Compartilhe o link de login manualmente por enquanto.",
          );
        }
        setOpen(false);
        reset();
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível convidar este e-mail",
        );
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" strokeWidth={1.75} />
        Convidar membro
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar membro</DialogTitle>
            <DialogDescription>
              Um e-mail de convite é enviado para este endereço; o convite fica pendente
              até a pessoa fazer login com este mesmo e-mail.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">E-mail</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pessoa@empresa.com"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Papel</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as "member" | "owner")}
                disabled={pending}
              >
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={!email.trim() || pending} onClick={handleSubmit}>
              {pending ? "Convidando…" : "Convidar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
