import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { analyzer } from "vite-bundle-analyzer";

const ANALYZE = false;

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), analyzer({ enabled: ANALYZE })],
  resolve: { tsconfigPaths: true },
  base: "/gif-study/",
});
