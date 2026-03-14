import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/utils/env";

export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
