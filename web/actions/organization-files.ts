"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIsPlatformAdmin, isOrgOwner } from "@/lib/organization";

const BUCKET = "organization-files";

const fileRefInput = z.object({
  fileId: z.string().uuid(),
  organizationId: z.string().uuid(),
});

/**
 * Liga/desliga um arquivo do repositório. Desativado = suas fatias
 * (`document_chunks`) deixam de entrar em `match_document_chunks`
 * (a função já filtra `is_active = true`), sem apagar nada — reversível.
 * RLS de UPDATE em `organization_files` já cobre quem enviou, o owner da
 * org, ou platform admin.
 */
export async function toggleFileActive(
  input: z.infer<typeof fileRefInput> & { isActive: boolean },
) {
  const data = fileRefInput.extend({ isActive: z.boolean() }).parse(input);
  const supabase = createClient();

  const { error } = await supabase
    .from("organization_files")
    .update({ is_active: data.isActive })
    .eq("id", data.fileId)
    .eq("organization_id", data.organizationId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/${data.organizationId}`);
  revalidatePath("/organizacao");
  return { ok: true as const };
}

/**
 * Remove um arquivo definitivamente: apaga o objeto no Storage e a linha em
 * `organization_files` (o `on delete cascade` de `document_chunks` cuida das
 * fatias). Ação destrutiva — a UI exige confirmação antes de chamar.
 *
 * Mesmo raciocínio de `actions/ingest-file.ts`: a policy de DELETE do
 * bucket `organization-files` só libera para owner/platform admin (não para
 * quem só fez upload), então usamos o client de service role quando quem
 * chama é platform admin, já verificado antes.
 */
export async function deleteOrganizationFile(input: z.infer<typeof fileRefInput>) {
  const data = fileRefInput.parse(input);
  const isAdmin = await getIsPlatformAdmin();
  const supabase = isAdmin ? createAdminClient() : createClient();

  const { data: file, error: fetchError } = await supabase
    .from("organization_files")
    .select("storage_path")
    .eq("id", data.fileId)
    .eq("organization_id", data.organizationId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!file) throw new Error("Arquivo não encontrado.");

  const { error: storageError } = await supabase.storage.from(BUCKET).remove([file.storage_path]);
  if (storageError) throw new Error(`Falha ao remover do Storage: ${storageError.message}`);

  const { error: deleteError } = await supabase
    .from("organization_files")
    .delete()
    .eq("id", data.fileId)
    .eq("organization_id", data.organizationId);

  if (deleteError) throw new Error(deleteError.message);

  revalidatePath(`/admin/${data.organizationId}`);
  revalidatePath("/organizacao");
  return { ok: true as const };
}

/**
 * Gera uma URL assinada (temporária) para baixar o arquivo original.
 * Restrito de propósito ao OWNER da organização (ou platform admin) — mais
 * estrito que a RLS de SELECT do bucket (que libera qualquer membro da
 * org), a pedido do produto: só quem administra a organização baixa os
 * arquivos originais.
 */
export async function getFileDownloadUrl(input: z.infer<typeof fileRefInput>) {
  const data = fileRefInput.parse(input);

  const [isAdmin, isOwner] = await Promise.all([
    getIsPlatformAdmin(),
    isOrgOwner(data.organizationId),
  ]);
  if (!isAdmin && !isOwner) {
    throw new Error("Apenas o administrador da organização pode baixar arquivos.");
  }

  const supabase = isAdmin ? createAdminClient() : createClient();

  const { data: file, error: fetchError } = await supabase
    .from("organization_files")
    .select("storage_path, name")
    .eq("id", data.fileId)
    .eq("organization_id", data.organizationId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!file) throw new Error("Arquivo não encontrado.");

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(file.storage_path, 60, { download: file.name });

  if (signError || !signed) {
    throw new Error(signError?.message ?? "Não foi possível gerar o link de download.");
  }

  return { ok: true as const, url: signed.signedUrl };
}
