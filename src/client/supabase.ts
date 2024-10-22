import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

export const getFrontendSupabase = () => {
  return createClient(
    "https://aulzipakvmpojwvviulk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bHppcGFrdm1wb2p3dnZpdWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgyNDE2OTQsImV4cCI6MjA0MzgxNzY5NH0.1lS92mM1mKg-OnqaxSQ7WGZCHBxje83AtOqc2GZThvY",
  );
};
