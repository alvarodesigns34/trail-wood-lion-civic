import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const src = fileURLToPath(new URL("./src", import.meta.url));

/**
 * Compilación estática del laboratorio para GitHub Pages.
 *
 * Deliberadamente NO incluye los complementos de TanStack Start ni de Nitro: el
 * sitio publicado es una única página de cliente, sin servidor, sin sesión y sin
 * base de datos. La aplicación completa se sigue construyendo con
 * `vite.config.ts`; esto es sólo el escaparate jugable.
 */
export default defineConfig({
  base: process.env.PAGES_BASE ?? "/trail-wood-lion-civic/",
  root: fileURLToPath(new URL("./pages", import.meta.url)),
  plugins: [viteReact(), tailwindcss()],
  resolve: {
    alias: [
      // El experimento con IA es una función de servidor; en estático se
      // sustituye por un rechazo y el panel usa el intérprete local.
      {
        find: /^@\/lib\/ai\/experiment$/,
        replacement: fileURLToPath(new URL("./pages/experiment-stub.ts", import.meta.url)),
      },
      { find: /^@\//, replacement: `${src}/` },
    ],
  },
  build: {
    outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
    emptyOutDir: true,
    target: "es2022",
    chunkSizeWarningLimit: 3000,
  },
});
