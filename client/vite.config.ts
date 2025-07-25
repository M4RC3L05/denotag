import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import preact from "@preact/preset-vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [deno(), preact(), viteSingleFile()],
});
