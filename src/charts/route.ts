import type { HighlightPair, Pair, Station, TokuteiRule } from "../types";
import { km, sectionName, year } from "../lib/format";
import { svg } from "./svg";

export const routeChart = (stations: Station[], pairs: Pair[], rule: TokuteiRule, hero: HighlightPair): string => {
  const w = 1500;
  const h = 280;
  const start = 70;
  const end = w - 70;
  const lineY = 144;
  const xByStation = new Map<string, number>(
    stations.map((station, index) => [station.name, start + (index / Math.max(stations.length - 1, 1)) * (end - start)]),
  );
  const x = (stationName: string): number => xByStation.get(stationName) ?? start;
  const namedTokuteiPairs = rule.enumeratedSections
    .map(([from, to]) => pairs.find((pair) => (pair.from === from && pair.to === to) || (pair.from === to && pair.to === from)))
    .filter((pair): pair is Pair => Boolean(pair));
  const stationMarks = stations
    .map((station, index) => {
      const cx = x(station.name);
      const labelY = index % 2 === 0 ? 96 : 70;
      const kmY = index % 4 === 0 || index === stations.length - 1 ? 178 : 0;
      const marker = station.existedIn1972
        ? `<circle class="station old" cx="${cx}" cy="${lineY}" r="7" />`
        : `<rect class="station new" x="${cx - 6}" y="${lineY - 6}" width="12" height="12" />`;
      return `${marker}<text class="station-name" x="${cx}" y="${labelY}" text-anchor="middle">${station.name}</text>${kmY ? `<text class="station-km" x="${cx}" y="${kmY}" text-anchor="middle">${km(station.km)}</text>` : ""}`;
    })
    .join("");
  const bracketPath = (fromName: string, toName: string, y: number): string => {
    const fromX = x(fromName);
    const toX = x(toName);
    return `M${fromX} ${y}V${y + 10}H${toX}V${y}`;
  };
  const tokuteiBrackets = namedTokuteiPairs
    .map((pair) => {
      const from = stations.find((station) => station.name === pair.from);
      const to = stations.find((station) => station.name === pair.to);
      if (!from || !to) return "";
      return `<path class="bracket" d="${bracketPath(from.name, to.name, 204)}"><title>${sectionName(pair)}</title></path>`;
    })
    .join("");
  const heroBracket = `<path class="annotation-line" d="${bracketPath(hero.from, hero.to, 226)}"><title>${sectionName(hero)}: 割引なし</title></path>`;
  const body = `
    <path class="route-line" d="M${start} ${lineY}H${end}" />
    ${stationMarks}
    ${tokuteiBrackets}
    ${heroBracket}
    <g class="legend">
      <circle cx="${start}" cy="252" r="6" class="station old" /><text x="${start + 12}" y="257">${year(rule.basisYear)}時点で存在</text>
      <rect x="${start + 180}" y="246" width="12" height="12" class="station new" /><text x="${start + 198}" y="257">後発駅</text>
      <path class="bracket" d="M${start + 320} 246V256H${start + 370}V246" /><text x="${start + 382}" y="257">後発駅が挟まっても割引が続く区間</text>
      <path class="annotation-line" d="M${start + 685} 246V256H${start + 735}V246" /><text x="${start + 747}" y="257">割引がない区間</text>
    </g>
  `;
  return svg(w, h, body, "東海道新幹線17駅の路線図と特定特急券区間");
};
