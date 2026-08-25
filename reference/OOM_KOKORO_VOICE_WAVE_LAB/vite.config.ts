import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  worker: {
    format: "es",
  },
  server: {
    headers: {
      // Useful for WASM/WebGPU experiments. The default lab uses q8 + WASM.
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
