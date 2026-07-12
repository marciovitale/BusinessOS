import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface OrgMember {
  id: string;
  userId: string;
  role: "owner" | "member";
  createdAt: string;
  name: string;
  email: string;
}

export interface OrgInvite {
  id: string;
  email: string;
  role: "owner" | "member";
  createdAt: string;
}

/** Nome da organização ativa (só o que a RLS de `organizations` permite ler: membro). */
export const getOrganizationName = cache(
  async (organizationId: string): Promise<string | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .maybeSingle();

    if (error || !data) return null;
    return data.name;
  },
);

/** Membros atuais da organização (qualquer membro pode ler — RLS `is_org_member`). */
export const listOrgMembers = cache(
  async (organizationId: string): Promise<OrgMember[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("organization_members")
      .select("id, user_id, role, created_at, profiles(full_name, email)")
      .eq("organization_id", organizationId);

    if (error || !data) {
      console.warn("[organization-members] erro ao listar membros:", error?.message);
      return [];
    }

    return data.map((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        id: row.id,
        userId: row.user_id,
        role: row.role,
        createdAt: row.created_at,
        name: profile?.full_name ?? profile?.email ?? row.user_id,
        email: profile?.email ?? "",
      };
    });
  },
);

/**
 * Convites pendentes da organização. RLS de SELECT em `organization_invites`
 * é `is_org_owner(organization_id) OR is_platform_admin()` — não visível
 * para membros comuns. Chame só quando o usuário atual for owner (ou
 * platform admin); membros comuns recebem `[]` (ou erro degradado) mesmo se
 * chamarem por engano.
 */
export const listPendingInvites = cache(
  async (organizationId: string): Promise<OrgInvite[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("organization_invites")
      .select("id, email, role, created_at")
      .eq("organization_id", organizationId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
    }));
  },
);
