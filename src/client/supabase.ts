import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

export const frontendSupabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY,
);
