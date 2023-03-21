import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import commonjs from "@rollup/plugin-commonjs";
import { VitePWA } from "vite-plugin-pwa";

const publicPath = "/gif-study/";

export default defineConfig({
  base: publicPath,
  plugins: [
    tsconfigPaths(),
    react(),
    commonjs(),
    VitePWA({
      injectRegister: "auto",
      registerType: "prompt",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Gif Study",
        short_name: "Gif Study",
        description: "Studying app for exploring every gif frame",
        theme_color: "#222222",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
