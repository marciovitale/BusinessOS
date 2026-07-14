"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId, getIsPlatformAdmin } from "@/lib/organization";
import { sanitizeFileName } from "@/lib/utils";
import { isSupportedForExtraction, extractTextFromFile } from "@/lib/text-extraction";
import { chunkText } from "@/lib/chunk-text";
import { embedTexts } from "@/lib/embeddings";

const BUCKET = "organization-files";

export type IngestFileResult =
  | { ok: true; status: "ready"; fileId: string; name: string; chunkCount: number }
  | { ok: true; status: "failed"; fileId: string; name: string; errorMessage: string }
  | { ok: false; name: string; error: string };

/**
 * Upload + registro + ingestão de UM arquivo do "repositório" (RAG) de uma
 * organização, tudo em uma única Server Action.
 *
 * Por que upload + registro juntos (e não upload direto do browser via
 * lib/supabase/client.ts, como um fluxo "ingênuo" sugeriria): verificamos ao
 * vivo as policies de RLS de `storage.objects` e de `organization_files` —
 * ambas exigem `is_org_member(organization_id)` no INSERT (a de
 * `organization_files` exige além disso `uploaded_by = current_user_id()`).
 * Nenhuma das duas tem exceção para `is_platform_admin()`. No fluxo deste
 * wizard, o platform admin acabou de CRIAR a organização e ainda não é
 * membro dela (só os convites ficam pendentes) — logo um upload feito com a
 * sessão dele via client comum sempre falharia por RLS nesse cenário
 * específico, não é algo hipotético.
 *
 * Por isso: quando quem chama é platform admin, usamos o client de service
 * role (`createAdminClient`) para TODAS as escritas deste arquivo (storage +
 * `organization_files` + `document_chunks`), já tendo verificado
 * `getIsPlatformAdmin()` antes de usar o client privilegiado. Quando quem
 * chama é um membro comum da organização (reuso futuro desta action fora do
 * wizard de admin), usamos o client autenticado normal, que respeita a RLS
 * padrão (is_org_member / uploaded_by = current_user_id()).
 */
export async function uploadAndIngestFile(formData: FormData): Promise<IngestFileResult> {
  const organizationId = String(formData.get("organizationId") ?? "");
  const file = formData.get("file");

  if (!organizationId) {
    return { ok: false, name: "arquivo", error: "organizationId ausente." };
  }
  if (!(file instanceof File)) {
    return { ok: false, name: "arquivo", error: "Arquivo inválido." };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false, name: file.name, error: "Sessão inválida: usuário não autenticado." };
  }

  const isAdmin = await getIsPlatformAdmin();
  const supabase = isAdmin ? createAdminClient() : createClient();

  const safeName = sanitizeFileName(file.name);
  const storagePath = `${organizationId}/${randomUUID()}-${safeName}`;
  const mimeType = file.type || "application/octet-stream";

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: mimeType, upsert: false });

  if (uploadError) {
    return {
      ok: false,
      name: file.name,
      error: `Falha no upload: ${uploadError.message}`,
    };
  }

  const { data: fileRow, error: insertError } = await supabase
    .from("organization_files")
    .insert({
      organization_id: organizationId,
      name: file.name,
      storage_path: storagePath,
      mime_type: mimeType,
      size_bytes: file.size,
      status: "pending",
      uploaded_by: userId,
    })
    .select("id")
    .single();

  if (insertError || !fileRow) {
    // Upload já foi feito — tenta limpar o objeto órfão no Storage antes de desistir.
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return {
      ok: false,
      name: file.name,
      error: `Falha ao registrar arquivo: ${insertError?.message ?? "erro desconhecido"}`,
    };
  }

  const fileId = fileRow.id as string;

  async function markFailed(errorMessage: string) {
    await supabase
      .from("organization_files")
      .update({ status: "failed", error_message: errorMessage.slice(0, 500) })
      .eq("id", fileId);
  }

  await supabase.from("organization_files").update({ status: "processing" }).eq("id", fileId);

  if (!isSupportedForExtraction(mimeType, file.name)) {
    const message =
      "Formato não suportado neste MVP (aceitos: texto, PDF, Word, planilhas, imagens, áudio e vídeo).";
    await markFailed(message);
    revalidatePath("/admin");
    return { ok: true, status: "failed", fileId, name: file.name, errorMessage: message };
  }

  try {
    const text = await extractTextFromFile(file);
    if (!text) {
      const message = "Arquivo vazio ou sem texto extraível.";
      await markFailed(message);
      revalidatePath("/admin");
      return { ok: true, status: "failed", fileId, name: file.name, errorMessage: message };
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      const message = "Não foi possível dividir o conteúdo em chunks.";
      await markFailed(message);
      revalidatePath("/admin");
      return { ok: true, status: "failed", fileId, name: file.name, errorMessage: message };
    }

    const embeddings = await embedTexts(chunks);

    const rows = chunks.map((content, index) => ({
      file_id: fileId,
      organization_id: organizationId,
      chunk_index: index,
      content,
      embedding: embeddings[index],
    }));

    const { error: chunksError } = await supabase.from("document_chunks").insert(rows);
    if (chunksError) throw new Error(chunksError.message);

    await supabase.from("organization_files").update({ status: "ready" }).eq("id", fileId);
    revalidatePath("/admin");
    return { ok: true, status: "ready", fileId, name: file.name, chunkCount: chunks.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha desconhecida ao processar o arquivo.";
    await markFailed(message);
    revalidatePath("/admin");
    return { ok: true, status: "failed", fileId, name: file.name, errorMessage: message };
  }
}
