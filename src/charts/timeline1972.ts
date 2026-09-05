import type { Station, TokuteiRule } from "../types";
import { year } from "../lib/format";
import { handPath, svg } from "./svg";

export const timeline1972Chart = (stations: Station[], rule: TokuteiRule): string => {
  const names = ["小田原", "熱海", "三島", "新富士", "静岡"];
  const selected = stations.filter((station) => names.includes(station.name));
  const w = 860;
  const h = 310;
  const xMap = new Map<string, number>(names.map((name, index) => [name, 92 + index * 170]));
  const row = (y: number, title: string, includeNewFuji: boolean): string => {
    const visible = selected.filter((station) => includeNewFuji || station.name !== "新富士");
    return `
      <text class="axis-label" x="24" y="${y + 6}">${title}</text>
      <path class="route-line" d="M92 ${y}H772" />
      ${visible
        .map((station) => {
          const x = xMap.get(station.name) ?? 0;
          return `<circle class="station ${station.existedIn1972 ? "old" : "new"}" cx="${x}" cy="${y}" r="7" /><text class="station-name flat" x="${x}" y="${y - 18}" text-anchor="middle">${station.name}</text><text class="station-km" x="${x}" y="${y + 30}" text-anchor="middle">${year(station.opened)}</text>`;
        })
        .join("")}
    `;
  };
  const odawara = xMap.get("小田原") ?? 0;
  const mishima = xMap.get("三島") ?? 0;
  const atami = xMap.get("熱海") ?? 0;
  const shizuoka = xMap.get("静岡") ?? 0;
  const body = `
    ${row(96, `${year(rule.basisYear)}年`, false)}
    <path class="annotation-line" d="${handPath([[odawara, 128], [atami, 154], [mishima, 128]], "already-three")}" />
    <text class="note-label" x="92" y="174">小田原〜熱海〜三島で、すでに3駅</text>
    <text class="note-label" x="${mishima - 46}" y="54">三島は基準年より前に開業</text>
    ${row(230, "現在", true)}
    <path class="bracket strong" d="${handPath([[mishima, 262], [mishima, 276], [shizuoka, 276], [shizuoka, 262]], "mishima-shizuoka")}" />
    <text class="note-label" x="${mishima + 20}" y="302">後から新駅が挟まった区間は名指しで救済</text>
  `;
  return svg(w, h, body, `${year(rule.basisYear)}年と現在の小田原から静岡までの路線図比較`);
};
