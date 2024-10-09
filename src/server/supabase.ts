import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";
export const backendSupabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_PRIVATE_KEY,
);
