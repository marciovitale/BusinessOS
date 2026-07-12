import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Usar em Client Components.
// O cookie de sessão do Auth0 é httpOnly, então o ID token não pode ser lido
// direto no browser — buscamos um token fresco na nossa própria Route Handler
// a cada chamada e enviamos como bearer token para o Supabase.
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => {
        const res = await fetch("/api/supabase-token");
        if (!res.ok) return null;
        const { idToken } = (await res.json()) as { idToken: string | null };
        return idToken ?? null;
      },
    },
  );
}
