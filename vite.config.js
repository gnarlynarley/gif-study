import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import commonjs from "@rollup/plugin-commonjs";

const publicPath = "/gif-study/";

export default defineConfig({
  base: publicPath,
  plugins: [react(), commonjs()],
});
