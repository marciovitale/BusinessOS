import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  async onCallback(error, ctx, session) {
    const appBaseUrl = ctx.appBaseUrl ?? process.env.APP_BASE_URL ?? "http://localhost:3000";

    if (error) {
      return NextResponse.redirect(new URL(`/auth/login?error=${error.code}`, appBaseUrl));
    }

    // First request after Auth0 issues a session: provision the profile and
    // (on first login) the owner's default organization, using the ID token
    // that was just minted. Runs once here instead of on every request.
    if (session?.tokenSet.idToken) {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { accessToken: async () => session.tokenSet.idToken ?? null },
      );

      const { error: rpcError } = await supabase.rpc("ensure_profile", {
        p_email: session.user.email ?? "",
        p_full_name: session.user.name ?? null,
      });

      if (rpcError) {
        console.error("[auth0] ensure_profile failed:", rpcError.message);
      }
    }

    return NextResponse.redirect(new URL(ctx.returnTo || "/", appBaseUrl));
  },
});
