import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrganizationId } from "@/lib/organization";

const BUCKET = "organization-logos";

export interface ActiveOrganizationBrand {
  organizationId: string;
  name: string;
  logoUrl: string | null;
}

/**
 * Identidade da organização ativa do usuário logado, para o header fixo:
 * nome + URL assinada (temporária) do logo, se houver um carregado. Retorna
 * `null` quando o usuário não tem organização ativa (ex.: platform admin sem
 * vínculo, ou membro recém-logado aguardando convite) — nesse caso o header
 * cai no fallback genérico da marca BusinessOS, sem logo de organização.
 */
export const getActiveOrganizationBrand = cache(
  async (): Promise<ActiveOrganizationBrand | null> => {
    const organizationId = await getActiveOrganizationId();
    if (!organizationId) return null;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("name, logo_storage_path")
      .eq("id", organizationId)
      .maybeSingle();

    if (error || !data) return null;

    let logoUrl: string | null = null;
    if (data.logo_storage_path) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(data.logo_storage_path, 3600);
      logoUrl = signed?.signedUrl ?? null;
    }

    return { organizationId, name: data.name, logoUrl };
  },
);

/** Mesma coisa, mas para uma organização arbitrária (tela de detalhe do admin). */
export const getOrganizationBrand = cache(
  async (organizationId: string): Promise<{ name: string; logoUrl: string | null } | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("name, logo_storage_path")
      .eq("id", organizationId)
      .maybeSingle();

    if (error || !data) return null;

    let logoUrl: string | null = null;
    if (data.logo_storage_path) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(data.logo_storage_path, 3600);
      logoUrl = signed?.signedUrl ?? null;
    }

    return { name: data.name, logoUrl };
  },
);
