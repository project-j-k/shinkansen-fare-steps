import "./style.css";
import { setupChecker } from "./checker";
import { data } from "./lib/data";
import { renderArticle } from "./sections/article";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = renderArticle(data);
setupChecker(data.stations, data.tokuteiRule);
