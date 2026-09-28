import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: "src/lib/index.ts",
      name: "Songpyeon",
      fileName: (format) => (format === "cjs" ? "songpyeon.cjs" : "songpyeon.js"),
      formats: ["es", "cjs"]
    },
    outDir: "dist/library",
    sourcemap: false
  }
});
