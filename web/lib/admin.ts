import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIsPlatformAdmin } from "@/lib/organization";

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  memberCount: number;
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
      .select("id, name, slug, created_at")
      .order("created_at", { ascending: false });

    if (error || !orgs) {
      console.warn("[admin] erro ao listar organizações:", error?.message);
      return [];
    }

    const { data: members } = await supabase
      .from("organization_members")
      .select("organization_id");

    const counts = new Map<string, number>();
    for (const m of members ?? []) {
      counts.set(m.organization_id, (counts.get(m.organization_id) ?? 0) + 1);
    }

    return orgs.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      createdAt: o.created_at,
      memberCount: counts.get(o.id) ?? 0,
    }));
  },
);
