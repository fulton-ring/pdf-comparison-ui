import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    SUPABASE_URL: z.string().url(),
    SUPABASE_PRIVATE_KEY: z.string(),
    SUPABASE_UPLOAD_BUCKET: z.string(),
    CELERY_BROKER_HOST: z.string(),
    CELERY_BROKER_PORT: z.string(),
    CELERY_BROKER_DB: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  // NOTE: this does not work in Docker
  client: {
    // NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    // NEXT_PUBLIC_SUPABASE_PUBLIC_KEY: z.string(),
    // NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET: z.string(),
    // NEXT_PUBLIC_SUPABASE_JOB_BUCKET: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PRIVATE_KEY: process.env.SUPABASE_PRIVATE_KEY,
    SUPABASE_UPLOAD_BUCKET: process.env.SUPABASE_UPLOAD_BUCKET,
    CELERY_BROKER_HOST: process.env.CELERY_BROKER_HOST,
    CELERY_BROKER_PORT: process.env.CELERY_BROKER_PORT,
    CELERY_BROKER_DB: process.env.CELERY_BROKER_DB,
    // NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    // NEXT_PUBLIC_SUPABASE_PUBLIC_KEY:
    //   process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY,
    // NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET:
    //   process.env.NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET,
    // NEXT_PUBLIC_SUPABASE_JOB_BUCKET:
    //   process.env.NEXT_PUBLIC_SUPABASE_JOB_BUCKET,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  // skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  skipValidation: true,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
