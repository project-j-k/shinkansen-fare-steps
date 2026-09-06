import { defineConfig } from "vite";
import { data } from "./src/lib/data";
import { renderArticle } from "./src/sections/article";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/shinkansen-fare-steps/",
  plugins: [
    {
      name: "inline-rendered-article",
      transformIndexHtml(html) {
        return html.replace('<div id="app"></div>', `<div id="app">${renderArticle(data)}</div>`);
      },
    },
  ],
});
