import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Client-side Vite configuration
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared/api": path.resolve(__dirname, "./shared/api"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist/client",
    sourcemap: true,
  },
});