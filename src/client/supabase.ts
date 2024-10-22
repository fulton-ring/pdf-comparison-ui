import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

export const getFrontendSupabase = () => {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY,
  );
};
