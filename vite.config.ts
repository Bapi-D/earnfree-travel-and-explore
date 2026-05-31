import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    nitro({ preset: "vercel" }),
    viteReact(),
  ],
  server: {
    proxy: process.env.DEV_ADMIN_URL
      ? {
          '/__admin': {
            target: process.env.DEV_ADMIN_URL,
            changeOrigin: true,
            secure: false,
          },
        }
      : undefined,
  },
});
