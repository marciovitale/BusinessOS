"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { getCurrentUserId, getIsPlatformAdmin } from "@/lib/organization";

const createOrganizationInput = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional().default(""),
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
 * Cria uma nova organização (sem owner/membro algum ainda — quem convida os
 * membros é um passo separado do wizard de criação em `/admin`). A RLS de
 * INSERT em `organizations` já exige `is_platform_admin()`.
 *
 * O slug é derivado do nome automaticamente (com sufixo aleatório em caso de
 * colisão) porque o novo formulário de criação não expõe mais um campo de
 * slug — só nome e descrição.
 */
export async function createOrganization(input: CreateOrganizationInput) {
  const data = createOrganizationInput.parse(input);
  const userId = await requirePlatformAdmin();
  const supabase = createClient();

  const organizationId = randomUUID();
  const baseSlug = slugify(data.name) || "organizacao";

  let slug = baseSlug;
  let attempt = 0;
  // Tenta o slug derivado do nome; em caso de colisão (23505), acrescenta um
  // sufixo curto e tenta de novo, algumas vezes.
  while (attempt < 5) {
    const { error } = await supabase.from("organizations").insert({
      id: organizationId,
      name: data.name,
      slug,
      description: data.description ?? "",
      created_by: userId,
    });

    if (!error) {
      revalidatePath("/admin");
      return {
        ok: true as const,
        organizationId,
        organizationName: data.name,
      };
    }

    if (error.code === "23505") {
      attempt += 1;
      slug = `${baseSlug}-${randomUUID().slice(0, 4)}`;
      continue;
    }

    throw new Error(error.message);
  }

  throw new Error("Não foi possível gerar um slug único para a organização.");
}
