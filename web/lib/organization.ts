import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

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
