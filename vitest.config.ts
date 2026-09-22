import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    {
      name: "deno-npm-resolver",
      enforce: "pre",
      transform(code, id) {
        if (id.includes("supabase") && id.includes("functions")) {
          return {
            code: code.replace(/["']npm:@supabase\/supabase-js@[^"']+["']/g, '"@supabase/supabase-js"'),
            map: null,
          };
        }
      },
    },
    react(),
  ],
  test: {
    exclude: [...configDefaults.exclude, ".tmp/**"],
    environment: "jsdom",
    fileParallelism: false,
    globals: true,
    pool: "forks",
    setupFiles: "./src/test/setup.ts",
  },
});
