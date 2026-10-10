import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true,
  functions: {
    api: {
      name: "Conta Facil API",
      source: "src/functions/api/index.ts",
      env: {
        FUNCTION_ALLOWED_ORIGINS: process.env.FUNCTION_ALLOWED_ORIGINS!,
      },
    },
  },
  preview: {
    buckets: {
      documentos: { access: "private" },
    },
  },
});
