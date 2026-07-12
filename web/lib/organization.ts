import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { auth0 } from "@/lib/auth0";

// Organização ativa do usuário logado. Simplificação atual: usa sempre a
// default_organization_id do profile (definida no primeiro login, seção
// "Auth0 -> ensure_profile"). Sem seletor de organização na UI ainda —
// suficiente enquanto cada usuário tem uma única organização relevante.
export const getActiveOrganizationId = cache(async (): Promise<string | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .single();

  if (error || !data) return null;
  return data.default_organization_id;
});

// `sub` do Auth0 (== profiles.id / cards.created_by / agents.created_by) do
// usuário logado, ou `null` se não houver sessão.
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const session = await auth0.getSession();
  return session?.user.sub ?? null;
});

// `true` se `profiles.is_platform_admin` do usuário logado.
export const getIsPlatformAdmin = cache(async (): Promise<boolean> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("is_platform_admin")
    .single();

  if (error || !data) return false;
  return Boolean(data.is_platform_admin);
});

// `true` se o usuário logado é `owner` da organização informada (via RPC
// `is_org_owner`, já criada em RLS — security definer).
export const isOrgOwner = cache(
  async (organizationId: string | null): Promise<boolean> => {
    if (!organizationId) return false;
    const supabase = createClient();
    const { data, error } = await supabase.rpc("is_org_owner", {
      org_id: organizationId,
    });
    if (error) return false;
    return Boolean(data);
  },
);
