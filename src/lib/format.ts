import type { HighlightPair, Pair } from "../types";

export type PairLike = Pair | HighlightPair;

export const yen = (value: number): string => `${value.toLocaleString("ja-JP")}円`;
export const km = (value: number): string => `${value.toLocaleString("ja-JP", { maximumFractionDigits: 1 })}km`;
export const ratio = (value: number): string => `${value.toLocaleString("ja-JP", { maximumFractionDigits: 2 })}倍`;
export const perKm = (value: number): string => `${value.toLocaleString("ja-JP", { maximumFractionDigits: 2 })}円/km`;
export const year = (date: string): string => new Date(`${date}T00:00:00+09:00`).getFullYear().toString();
export const sectionName = (pair: Pick<PairLike, "from" | "to">): string => `${pair.from}〜${pair.to}`;

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
