import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface OrganizationFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  status: "pending" | "processing" | "ready" | "failed";
  errorMessage: string | null;
  uploadedBy: string;
  createdAt: string;
  chunkCount: number;
  isActive: boolean;
}

/**
 * Arquivos do repositório (RAG) de uma organização, com a contagem de chunks
 * já gerados. RLS de `organization_files`/`document_chunks` permite membro
 * da org OU platform admin (ver migração `platform_admin_read_oversight`).
 */
export const listOrganizationFiles = cache(
  async (organizationId: string): Promise<OrganizationFile[]> => {
    const supabase = createClient();
    const { data: files, error } = await supabase
      .from("organization_files")
      .select(
        "id, name, mime_type, size_bytes, status, error_message, uploaded_by, created_at, is_active",
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error || !files) {
      console.warn("[organization-files] erro ao listar arquivos:", error?.message);
      return [];
    }

    const { data: chunks } = await supabase
      .from("document_chunks")
      .select("file_id")
      .eq("organization_id", organizationId);

    const chunkCounts = new Map<string, number>();
    for (const c of chunks ?? []) {
      chunkCounts.set(c.file_id, (chunkCounts.get(c.file_id) ?? 0) + 1);
    }

    return files.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mime_type,
      sizeBytes: f.size_bytes,
      status: f.status,
      errorMessage: f.error_message,
      uploadedBy: f.uploaded_by,
      createdAt: f.created_at,
      chunkCount: chunkCounts.get(f.id) ?? 0,
      isActive: f.is_active,
    }));
  },
);
