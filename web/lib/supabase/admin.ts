import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client com a Service Role key — bypassa RLS por completo.
//
// Uso restrito: SOMENTE em código server-only, e SOMENTE depois de verificar
// `getIsPlatformAdmin()` (via o client autenticado normal, que respeita RLS)
// no chamador. Necessário porque a policy de SELECT de `organizations` é
// `is_org_member(id)` — um platform admin que não é membro de uma
// organização não consegue listá-la com o client autenticado comum, mesmo
// tendo `is_platform_admin() = true`. Nunca importe isto em Client
// Components nem exponha a service role key ao browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
