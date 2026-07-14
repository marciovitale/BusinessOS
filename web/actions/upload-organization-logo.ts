"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIsPlatformAdmin } from "@/lib/organization";

const BUCKET = "organization-logos";

/**
 * Sobe (ou substitui) o logo de uma organização. Mesmo raciocínio de
 * `actions/ingest-file.ts`: um platform admin criando/editando uma
 * organização da qual não é membro precisa do client de service role, já
 * verificado `getIsPlatformAdmin()` antes de usá-lo; um owner comum usa o
 * client autenticado normal (RLS: is_org_owner OR is_platform_admin).
 *
 * Path fixo por organização (`<organizationId>/logo`, upsert: true) — troca
 * o logo sem acumular arquivos órfãos no bucket.
 */
export async function uploadOrganizationLogo(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const file = formData.get("file");

  if (!organizationId) throw new Error("organizationId ausente.");
  if (!(file instanceof File)) throw new Error("Arquivo inválido.");
  if (!file.type.startsWith("image/")) {
    throw new Error("O logo precisa ser uma imagem (PNG, JPG, SVG ou WEBP).");
  }

  const isAdmin = await getIsPlatformAdmin();
  const supabase = isAdmin ? createAdminClient() : createClient();

  const storagePath = `${organizationId}/logo`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: true });

  if (uploadError) throw new Error(`Falha no upload do logo: ${uploadError.message}`);

  const { error: updateError } = await supabase
    .from("organizations")
    .update({ logo_storage_path: storagePath })
    .eq("id", organizationId);

  if (updateError) throw new Error(`Falha ao registrar o logo: ${updateError.message}`);

  revalidatePath("/admin");
  revalidatePath(`/admin/${organizationId}`);
  revalidatePath("/");
  return { ok: true as const };
}
