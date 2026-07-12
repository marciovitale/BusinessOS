import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Usar em Server Components / Server Actions / Route Handlers.
// Precisa ser recriado a cada request (carrega os cookies da request atual).
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // `setAll` chamado de um Server Component sem middleware — ignorável
            // se houver refresh de sessão via middleware.
          }
        },
      },
    },
  )
}
