import type { Pair, Station, TokuteiRule } from "./types";
import { getPair } from "./lib/data";
import { km, perKm, sectionName, yen } from "./lib/format";

const tokuteiLabel = (pair: Pair, rule: TokuteiRule): string => {
  if (!pair.isTokutei) return "なし";
  return pair.km <= rule.thresholdKm ? `あり（${km(rule.thresholdKm)}以下）` : `あり（${km(rule.thresholdKm)}超）`;
};

export const renderSameFareMessage = (pair: Pair): string => {
  if (!pair.sameFareFarthest) {
    return "この自由席特急料金で行ける区間の中では、ここがいちばん長い区間です。料金帯を目いっぱい使えている側です。";
  }
  return `同じ自由席特急料金で行ける最遠区間：${sectionName(pair.sameFareFarthest)} ${km(pair.sameFareFarthest.km)}（${pair.sameFareFarthest.timesFarther.toLocaleString("ja-JP", { maximumFractionDigits: 2 })}倍）`;
};

export const renderResult = (pair: Pair | undefined, from: string, to: string, rule: TokuteiRule): string => {
  if (from === to) {
    return `<p class="empty-result">同一駅は区間として扱いません。別の駅を選んでください。</p>`;
  }
  if (!pair) {
    return `<p class="empty-result">この区間のデータが見つかりません。</p>`;
  }
  return `
    <h3>${sectionName({ from, to })}</h3>
    <dl>
      <div><dt>乗車券</dt><dd>${yen(pair.fare)}</dd></div>
      <div><dt>自由席特急料金</dt><dd>${yen(pair.freeLtd)}</dd></div>
      <div><dt>指定席特急料金</dt><dd>${yen(pair.reservedLtd)}</dd></div>
      <div><dt>自由席合計</dt><dd>${yen(pair.freeTotal)}</dd></div>
      <div><dt>指定席合計</dt><dd>${yen(pair.reservedTotal)}</dd></div>
      <div><dt>営業キロ</dt><dd>${km(pair.km)}</dd></div>
      <div><dt>自由席 円/km</dt><dd>${perKm(pair.yenPerKmFree)}</dd></div>
      <div><dt>特定特急券</dt><dd>${tokuteiLabel(pair, rule)}</dd></div>
    </dl>
    <p class="checker-note">${renderSameFareMessage(pair)}</p>
  `;
};

export const setupChecker = (stations: Station[], rule: TokuteiRule): void => {
  const from = document.querySelector<HTMLSelectElement>("#fromStation");
  const to = document.querySelector<HTMLSelectElement>("#toStation");
  const result = document.querySelector<HTMLElement>("#checkerResult");
  if (!from || !to || !result) return;

  from.value = "小田原";
  to.value = "三島";

  const update = (): void => {
    result.innerHTML = renderResult(getPair(from.value, to.value), from.value, to.value, rule);
  };

  from.addEventListener("change", update);
  to.addEventListener("change", update);
  update();

  if (stations.length !== from.options.length || stations.length !== to.options.length) {
    result.insertAdjacentHTML("beforeend", `<p class="empty-result">駅リストの件数を確認してください。</p>`);
  }
};
