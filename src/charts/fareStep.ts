import type { FareTier } from "../types";
import { yen } from "../lib/format";
import { axisLabel, line, svg } from "./svg";

export const fareStepChart = (tiers: FareTier[]): string => {
  const w = 840;
  const h = 360;
  const p = { l: 66, r: 28, t: 32, b: 58 };
  const maxKm = Math.max(...tiers.map((tier) => tier.maxKm));
  const maxFare = Math.max(...tiers.flatMap((tier) => [tier.freeLtd, tier.reservedLtd]));
  const chartMaxFare = Math.ceil(maxFare / 1000) * 1000;
  const x = (kmValue: number) => p.l + (kmValue / maxKm) * (w - p.l - p.r);
  const y = (fare: number) => h - p.b - (fare / chartMaxFare) * (h - p.t - p.b);
  const stepPoints = (field: "freeLtd" | "reservedLtd"): [number, number][] =>
    tiers.flatMap((tier, index) => {
      const left = x(tier.minKm);
      const right = x(tier.maxKm);
      const yy = y(tier[field]);
      return index === 0 ? [[left, yy], [right, yy]] : [[left, yy], [right, yy]];
    });
  const xTicks = tiers.map((tier) => tier.maxKm);
  const yTicks = Array.from({ length: chartMaxFare / 1000 }, (_, index) => (index + 1) * 1000);

  const plateau = tiers[0];
  const body = `
    <rect class="chart-bg" x="${p.l}" y="${p.t}" width="${w - p.l - p.r}" height="${h - p.t - p.b}" />
    <rect class="plateau" x="${x(plateau.minKm)}" y="${p.t}" width="${x(plateau.maxKm) - x(plateau.minKm)}" height="${h - p.t - p.b}" />
    <path class="grid-line" d="M${p.l} ${h - p.b}H${w - p.r}M${p.l} ${p.t}V${h - p.b}" />
    ${yTicks.map((tick) => `<path class="minor-grid" d="M${p.l - 4} ${y(tick)}H${w - p.r}" /><text class="tick" x="${p.l - 8}" y="${y(tick) + 4}" text-anchor="end">${yen(tick)}</text>`).join("")}
    ${xTicks.map((tick) => `<path class="minor-grid" d="M${x(tick)} ${p.t}V${h - p.b + 5}" /><text class="tick" x="${x(tick)}" y="${h - 38}" text-anchor="middle">${tick}</text>`).join("")}
    ${tiers.map((tier) => `<text class="tick" x="${x((tier.minKm + tier.maxKm) / 2)}" y="${h - 24}" text-anchor="middle">${tier.label}</text>`).join("")}
    ${line(stepPoints("reservedLtd"), "series reserved")}
    ${line(stepPoints("freeLtd"), "series free")}
    <text class="note-label" x="${x(plateau.maxKm) + 16}" y="${h - p.b - 18}">${plateau.label}は平らな踊り場</text>
    <g class="legend">
      <circle cx="${w - 220}" cy="34" r="5" class="reserved-dot" /><text x="${w - 208}" y="39">指定席</text>
      <circle cx="${w - 130}" cy="34" r="5" class="free-dot" /><text x="${w - 118}" y="39">自由席</text>
    </g>
    ${axisLabel(24, 18, "特急料金", "start")}
    ${axisLabel(w / 2, h - 4, "営業キロ帯")}
  `;
  return svg(w, h, body, "距離帯ごとの自由席・指定席特急料金の階段グラフ");
};
