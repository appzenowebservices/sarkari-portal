import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

export const env = createEnv({
  server: {
    AUTH_SECRET: isProd ? z.string() : z.string().optional(),
    DATABASE_URL: isProd ? z.string() : z.string().optional(),
    MONGODB_URI: isProd ? z.string() : z.string().optional(),
    MONGODB_TIMEOUT_MS: z.string().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEWSLETTER_SEND_API: z.string().optional(),
    NEXT_PUBLIC_SITE_URL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().optional(),
  },
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL ?? process.env.MONGODB_URI,
    MONGODB_URI: process.env.MONGODB_URI ?? process.env.DATABASE_URL,
    MONGODB_TIMEOUT_MS: process.env.MONGODB_TIMEOUT_MS,
    NODE_ENV: process.env.NODE_ENV,
    NEWSLETTER_SEND_API: process.env.NEWSLETTER_SEND_API,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
