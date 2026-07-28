import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Server-only Supabase client using the service-role key. Never import this
 * from a "use client" file — the key must not reach the browser.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key
    ? createClient(url, key, {
        auth: { persistSession: false },
        // Next.js patches global fetch to cache by default; Supabase reads
        // must always be live, so force every request through uncached.
        global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
      })
    : null;
  return client;
}
