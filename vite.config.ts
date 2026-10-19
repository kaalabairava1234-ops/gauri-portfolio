import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// GitHub Pages serves the site from /gauri-portfolio/; the Pages build sets
// BASE_PATH to that. Locally and on Vercel it stays at the root.
const base = process.env["BASE_PATH"] ?? "/";

export default defineConfig({
  base,
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    // src/server.ts wraps the SSR handler so server errors keep their stack.
    // Both pages are pre-rendered to static HTML at build time, so the site
    // also works on static hosts such as GitHub Pages.
    tanstackStart({
      server: { entry: "server" },
      pages: [{ path: "/" }, { path: "/work" }],
      prerender: { enabled: true, crawlLinks: false, failOnError: true },
    }),
    nitro(),
    viteReact(),
  ],
  resolve: { dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"] },
});
