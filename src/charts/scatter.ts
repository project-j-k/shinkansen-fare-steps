import type { Pair } from "../types";
import { km, perKm, sectionName } from "../lib/format";
import { axisLabel, handPath, svg } from "./svg";

export const scatterChart = (pairs: Pair[], hero: Pair): string => {
  const w = 900;
  const h = 470;
  const p = { l: 70, r: 34, t: 30, b: 62 };
  const maxKm = Math.max(...pairs.map((pair) => pair.km));
  const maxY = Math.max(...pairs.map((pair) => pair.yenPerKmFree));
  const x = (value: number) => p.l + (value / maxKm) * (w - p.l - p.r);
  const y = (value: number) => h - p.b - (value / maxY) * (h - p.t - p.b);
  const hx = x(hero.km);
  const hy = y(hero.yenPerKmFree);
  const xTicks = [0, maxKm / 4, maxKm / 2, (maxKm * 3) / 4, maxKm];
  const yTicks = [0, maxY / 4, maxY / 2, (maxY * 3) / 4, maxY];
  const points = pairs
    .map(
      (pair) => `<g tabindex="0" class="point ${pair.isTokutei ? "tokutei" : "normal"}">
        ${pair.isTokutei ? `<path d="M${x(pair.km) - 4} ${y(pair.yenPerKmFree)}h8M${x(pair.km)} ${y(pair.yenPerKmFree) - 4}v8" />` : `<circle cx="${x(pair.km)}" cy="${y(pair.yenPerKmFree)}" r="4.2" />`}
        <title>${sectionName(pair)} ${km(pair.km)} / ${perKm(pair.yenPerKmFree)} / ${pair.isTokutei ? "特定特急券あり" : "通常"}</title>
      </g>`,
    )
    .join("");

  const body = `
    <rect class="chart-bg" x="${p.l}" y="${p.t}" width="${w - p.l - p.r}" height="${h - p.t - p.b}" />
    <path class="grid-line" d="M${p.l} ${h - p.b}H${w - p.r}M${p.l} ${p.t}V${h - p.b}" />
    ${xTicks.map((tick) => `<path class="minor-grid" d="M${x(tick)} ${p.t}V${h - p.b}" /><text class="tick" x="${x(tick)}" y="${h - 36}" text-anchor="middle">${km(tick)}</text>`).join("")}
    ${yTicks.map((tick) => `<path class="minor-grid" d="M${p.l} ${y(tick)}H${w - p.r}" /><text class="tick" x="${p.l - 10}" y="${y(tick) + 4}" text-anchor="end">${perKm(tick)}</text>`).join("")}
    ${points}
    <circle class="hero-ring" cx="${hx}" cy="${hy}" r="11" />
    <path class="annotation-line" d="${handPath([[hx + 12, hy - 12], [hx + 90, hy - 70], [hx + 190, hy - 64]], "odawara-mishima")}" />
    <text class="note-label" x="${hx + 196}" y="${hy - 68}">${sectionName(hero)}が目立つ</text>
    ${axisLabel(w / 2, h - 8, "営業キロ")}
    ${axisLabel(22, 42, "自由席 円/km", "start")}
    <g class="legend">
      <circle cx="${w - 242}" cy="34" r="5" class="normal-dot" /><text x="${w - 230}" y="39">通常</text>
      <path d="M${w - 156} 34h10M${w - 151} 29v10" class="tokutei-sample" /><text x="${w - 136}" y="39">特定特急券</text>
    </g>
  `;
  return svg(w, h, body, "全136区間の営業キロと自由席円/kmの散布図");
};
