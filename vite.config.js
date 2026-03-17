import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // tắt sourcemap ở production để giảm size
    chunkSizeWarningLimit: 1000, // tăng limit warning
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react-window", "react-virtualized-auto-sizer"], // preload
  },
});
