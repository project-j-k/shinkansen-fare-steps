import type { Pair, Station, TokuteiRule } from "../types";
import { km, sectionName, year } from "../lib/format";
import { handPath, svg } from "./svg";

export const routeChart = (stations: Station[], pairs: Pair[], rule: TokuteiRule): string => {
  const w = 1080;
  const h = 300;
  const start = 56;
  const end = w - 48;
  const maxKm = Math.max(...stations.map((station) => station.km));
  const x = (value: number) => start + (value / maxKm) * (end - start);
  const tokuteiPairs = pairs.filter((pair) => pair.isTokutei && (pair.adjacentNow || pair.adjacent1972));
  const stationMarks = stations
    .map((station) => {
      const cx = x(station.km);
      const marker = station.existedIn1972
        ? `<circle class="station old" cx="${cx}" cy="118" r="7" />`
        : `<rect class="station new" x="${cx - 6}" y="112" width="12" height="12" />`;
      return `${marker}<text class="station-name" x="${cx}" y="92" transform="rotate(-38 ${cx} 92)">${station.name}</text><text class="station-km" x="${cx}" y="146" text-anchor="middle">${km(station.km)}</text>`;
    })
    .join("");
  const brackets = tokuteiPairs
    .map((pair, index) => {
      const from = stations.find((station) => station.name === pair.from);
      const to = stations.find((station) => station.name === pair.to);
      if (!from || !to) return "";
      const y = 174 + (index % 3) * 24;
      return `<path class="bracket" d="${handPath([[x(from.km), y], [x(from.km), y + 9], [x(to.km), y + 9], [x(to.km), y]], `${pair.from}-${pair.to}`)}"><title>${sectionName(pair)}</title></path>`;
    })
    .join("");
  const body = `
    <path class="route-line" d="M${start} 118H${end}" />
    ${stationMarks}
    ${brackets}
    <text class="note-label" x="${start}" y="232">下のブラケット: 特定特急券が効く区間</text>
    <g class="legend">
      <circle cx="${w - 300}" cy="234" r="6" class="station old" /><text x="${w - 288}" y="239">${year(rule.basisYear)}時点で存在</text>
      <rect x="${w - 132}" y="228" width="12" height="12" class="station new" /><text x="${w - 114}" y="239">後発駅</text>
    </g>
  `;
  return svg(w, h, body, "東海道新幹線17駅の路線図と特定特急券区間");
};
