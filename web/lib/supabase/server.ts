import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth0 } from "@/lib/auth0";

// Usar em Server Components / Server Actions / Route Handlers.
// Auth0 é o Third-Party Auth do Supabase: não há sessão/cookie do Supabase
// Auth aqui — cada request carrega o ID token da sessão Auth0 atual.
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => {
        const session = await auth0.getSession();
        return session?.tokenSet.idToken ?? null;
      },
    },
  );
}
