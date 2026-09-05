import type { Pair } from "../types";
import { km, sectionName, yen } from "../lib/format";
import { svg } from "./svg";

export const comparisonBarChart = (items: Pair[]): string => {
  const w = 860;
  const h = 380;
  const maxKm = Math.max(...items.map((item) => item.km));
  const maxLtd = Math.max(...items.map((item) => item.freeLtd));
  const baseX = 190;
  const kmWidth = 270;
  const ltdWidth = 270;
  const rowH = 72;
  const y0 = 72;
  const body = `
    <text class="axis-label" x="${baseX}" y="34">営業キロ</text>
    <text class="axis-label" x="${baseX + kmWidth + 56}" y="34">自由席特急料金</text>
    ${items
      .map((item, index) => {
        const y = y0 + index * rowH;
        const kw = (item.km / maxKm) * kmWidth;
        const lw = (item.freeLtd / maxLtd) * ltdWidth;
        return `<g>
          <text class="bar-label" x="26" y="${y + 21}">${sectionName(item)}</text>
          <rect class="bar km-bar" x="${baseX}" y="${y}" width="${kw}" height="22" />
          <text class="bar-value" x="${baseX + kw + 8}" y="${y + 17}">${km(item.km)}</text>
          <rect class="bar ltd-bar" x="${baseX + kmWidth + 56}" y="${y}" width="${lw}" height="22" />
          <text class="bar-value" x="${baseX + kmWidth + 56 + lw + 8}" y="${y + 17}">${yen(item.freeLtd)}</text>
        </g>`;
      })
      .join("")}
  `;
  return svg(w, h, body, "代表4区間の営業キロと自由席特急料金の対比バーチャート");
};
