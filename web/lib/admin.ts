import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIsPlatformAdmin } from "@/lib/organization";

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  memberCount: number;
  fileCount: number;
}

/**
 * Lista TODAS as organizações da plataforma (independente de o platform
 * admin ser membro delas ou não). Usa o client de service role porque a
 * policy de SELECT de `organizations` é `is_org_member(id)` — não cobre
 * platform admin. A checagem de autorização acontece aqui mesmo, antes de
 * usar o client privilegiado.
 */
export const listOrganizations = cache(
  async (): Promise<OrganizationSummary[]> => {
    const isAdmin = await getIsPlatformAdmin();
    if (!isAdmin) return [];

    const supabase = createAdminClient();

    const { data: orgs, error } = await supabase
      .from("organizations")
      .select("id, name, slug, description, created_at")
      .order("created_at", { ascending: false });

    if (error || !orgs) {
      console.warn("[admin] erro ao listar organizações:", error?.message);
      return [];
    }

    const [{ data: members }, { data: files }] = await Promise.all([
      supabase.from("organization_members").select("organization_id"),
      supabase.from("organization_files").select("organization_id"),
    ]);

    const memberCounts = new Map<string, number>();
    for (const m of members ?? []) {
      memberCounts.set(m.organization_id, (memberCounts.get(m.organization_id) ?? 0) + 1);
    }

    const fileCounts = new Map<string, number>();
    for (const f of files ?? []) {
      fileCounts.set(f.organization_id, (fileCounts.get(f.organization_id) ?? 0) + 1);
    }

    return orgs.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      description: o.description ?? "",
      createdAt: o.created_at,
      memberCount: memberCounts.get(o.id) ?? 0,
      fileCount: fileCounts.get(o.id) ?? 0,
    }));
  },
);
