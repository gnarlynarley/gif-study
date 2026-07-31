import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { analyzer } from "vite-bundle-analyzer";
import { VitePWA } from "vite-plugin-pwa";

const ANALYZE = false;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      pwaAssets: {
        config: true,
      },
      devOptions: {
        enabled: true,
      },
      manifest: {
        theme_color: "#e2ad00",
      },
    }),
    svelte(),
    analyzer({ enabled: ANALYZE }),
  ],
  resolve: { tsconfigPaths: true },
  base: "/gif-study/",
});
