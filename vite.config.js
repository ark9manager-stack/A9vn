import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = String(id || "").replace(/\\/g, "/");

          if (normalized.includes("/node_modules/")) {
            if (normalized.includes("/react") || normalized.includes("/react-dom") || normalized.includes("/react-router-dom")) {
              return "vendor-react";
            }
            return "vendor";
          }

          if (normalized.includes("/src/data/voiceline/")) return "data-voice";
          if (normalized.includes("/src/data/module/")) return "data-module";
          if (normalized.includes("/src/data/profile/")) return "data-profile";
          if (normalized.includes("/src/data/skins/")) return "data-skins";

          if (normalized.includes("/src/data/operators/character_table")) {
            return normalized.endsWith("character_table_en.json")
              : "data-character-cn";
          }
          if (normalized.includes("/src/data/operators/skill_table")) {
            return normalized.endsWith("skill_table_en.json")
              ? "data-skill-en"
              : "data-skill-cn";
          }
          if (normalized.includes("/src/data/operators/building_data")) {
            return "data-building";
          }
          if (normalized.includes("/src/data/operators/item_table")) {
            return "data-items";
          }
          if (normalized.includes("/src/data/operators/")) {
            return "data-operator-small";
          }

          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react-window", "react-virtualized-auto-sizer"],
  },
});
