import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

export const getBackendSupabase = () => {
  console.log("creating backend supabase client");
  return createClient(env.SUPABASE_URL, env.SUPABASE_PRIVATE_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  });
};
