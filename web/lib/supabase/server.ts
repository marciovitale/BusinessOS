import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth0 } from "@/lib/auth0";

// Usar em Server Components / Server Actions / Route Handlers.
// Auth0 é o Third-Party Auth do Supabase: não há sessão/cookie do Supabase
// Auth aqui — cada request carrega o ID token da sessão Auth0 atual.
// DIAGNÓSTICO TEMPORÁRIO — decodifica (sem verificar assinatura) o payload do
// ID token para logar exp/iat/aud/iss vs. hora atual, tentando entender por
// que o Supabase está rejeitando o token com 401 mesmo após o refresh
// forçado. Remover depois de identificar a causa.
function logIdTokenDiagnostics(idToken: string | null) {
  if (!idToken) {
    console.error("[diag] idToken é null/ausente na sessão.");
    return;
  }
  try {
    const [, payloadB64] = idToken.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    );
    const now = Math.floor(Date.now() / 1000);
    console.error("[diag] idToken claims:", {
      sub: payload.sub,
      aud: payload.aud,
      iss: payload.iss,
      exp: payload.exp,
      iat: payload.iat,
      now,
      secondsUntilExpiry: payload.exp - now,
      isExpired: payload.exp < now,
    });
  } catch (err) {
    console.error("[diag] falha ao decodificar idToken:", err);
  }
}

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => {
        const session = await auth0.getSession();
        const idToken = session?.tokenSet.idToken ?? null;
        logIdTokenDiagnostics(idToken);
        return idToken;
      },
    },
  );
}
