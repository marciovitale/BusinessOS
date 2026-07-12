"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/organization";

const roleEnum = z.enum(["owner", "member"]);

const inviteMemberInput = z.object({
  organizationId: z.string().uuid(),
  email: z.string().email("E-mail inválido"),
  role: roleEnum.default("member"),
});
export type InviteMemberInput = z.infer<typeof inviteMemberInput>;

/**
 * Cria um convite pendente para `email` entrar na organização. A RLS de
 * INSERT em `organization_invites` já exige `is_org_owner(organization_id)
 * OR is_platform_admin()` — deixamos o Postgres barrar quem não pode, só
 * traduzimos os erros mais comuns em mensagens amigáveis.
 */
export async function inviteMember(input: InviteMemberInput) {
  const data = inviteMemberInput.parse(input);
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Sessão inválida: usuário não autenticado.");

  const supabase = createClient();
  const { error } = await supabase.from("organization_invites").insert({
    organization_id: data.organizationId,
    email: data.email.toLowerCase(),
    role: data.role,
    invited_by: userId,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Já existe um convite pendente para "${data.email}".`);
    }
    if (error.code === "42501") {
      throw new Error("Apenas o owner da organização pode convidar membros.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/organizacao");
  return { ok: true as const };
}

const revokeInviteInput = z.object({
  inviteId: z.string().uuid(),
});
export type RevokeInviteInput = z.infer<typeof revokeInviteInput>;

/** Marca um convite pendente como `revoked`. Só o owner (RLS) consegue. */
export async function revokeInvite(input: RevokeInviteInput) {
  const data = revokeInviteInput.parse(input);
  const supabase = createClient();

  const { error } = await supabase
    .from("organization_invites")
    .update({ status: "revoked" })
    .eq("id", data.inviteId);

  if (error) throw new Error(error.message);

  revalidatePath("/organizacao");
  return { ok: true as const };
}

const removeMemberInput = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().min(1),
});
export type RemoveMemberInput = z.infer<typeof removeMemberInput>;

/**
 * Remove um membro da organização. A RLS de DELETE permite owner remover
 * qualquer um, ou o próprio membro sair (`user_id = current_user_id()`).
 */
export async function removeMember(input: RemoveMemberInput) {
  const data = removeMemberInput.parse(input);
  const supabase = createClient();

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", data.organizationId)
    .eq("user_id", data.userId);

  if (error) throw new Error(error.message);

  revalidatePath("/organizacao");
  return { ok: true as const };
}
