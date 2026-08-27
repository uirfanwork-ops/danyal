import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to the project's environment variables — see .env.example.`,
    );
  }
  return value;
}

/**
 * Supabase client for use inside Server Components and Server Actions.
 * Every query it makes runs as the signed-in user, so the database's row
 * level security decides what comes back. There is no service key anywhere
 * in this app: the rules live in Postgres, not in the UI.
 */
export async function getSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // The middleware refreshes the session instead.
          }
        },
      },
    },
  );
}
