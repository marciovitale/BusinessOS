"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, getIsPlatformAdmin } from "@/lib/organization";

const createOrganizationInput = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  slug: z
    .string()
    .min(1, "Slug obrigatório")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug deve ser kebab-case"),
  ownerEmail: z.string().email("E-mail inválido"),
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationInput>;

async function requirePlatformAdmin(): Promise<string> {
  const isAdmin = await getIsPlatformAdmin();
  if (!isAdmin) throw new Error("Apenas administradores da plataforma podem fazer isso.");
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Sessão inválida: usuário não autenticado.");
  return userId;
}

/**
 * Cria uma nova organização + um convite pendente de `owner` para o e-mail
 * informado. Não há envio de e-mail real neste MVP: o convite fica
 * `pending` no banco e é aplicado automaticamente por `ensure_profile` no
 * próximo login dessa pessoa (ver `lib/auth0.ts`).
 */
export async function createOrganizationWithOwner(input: CreateOrganizationInput) {
  const data = createOrganizationInput.parse(input);
  const userId = await requirePlatformAdmin();
  const supabase = createClient();

  const organizationId = randomUUID();

  const { error: orgError } = await supabase.from("organizations").insert({
    id: organizationId,
    name: data.name,
    slug: data.slug,
    created_by: userId,
  });

  if (orgError) {
    if (orgError.code === "23505") {
      throw new Error(`Já existe uma organização com o slug "${data.slug}".`);
    }
    throw new Error(orgError.message);
  }

  const { error: inviteError } = await supabase.from("organization_invites").insert({
    organization_id: organizationId,
    email: data.ownerEmail.toLowerCase(),
    role: "owner",
    invited_by: userId,
    status: "pending",
  });

  if (inviteError) {
    if (inviteError.code === "23505") {
      throw new Error(
        `Já existe um convite pendente para "${data.ownerEmail}" nesta organização.`,
      );
    }
    throw new Error(inviteError.message);
  }

  revalidatePath("/admin");

  return {
    ok: true as const,
    organizationId,
    organizationName: data.name,
    ownerEmail: data.ownerEmail,
  };
}
