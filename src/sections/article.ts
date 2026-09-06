import type { Pair, TokaidoData } from "../types";
import { comparisonBarChart } from "../charts/comparisonBar";
import { fareStepChart } from "../charts/fareStep";
import { routeChart } from "../charts/route";
import { timeline1972Chart } from "../charts/timeline1972";
import { escapeHtml, km, perKm, ratio, sectionName, yen, year } from "../lib/format";
import { findPair } from "../lib/data";

const stat = (label: string, value: string, tone = ""): string => `
  <div class="stat ${tone}">
    <span>${label}</span>
    <strong>${value}</strong>
  </div>`;

const keyPoint = (label: string, text: string): string => `
  <figure class="memo-quote">
    <figcaption>${label}</figcaption>
    <blockquote>${escapeHtml(text)}</blockquote>
  </figure>`;

const readerFacingUse = (text: string): string => text.replace("本サイトの一次データ", "本ページの一次資料");

const fareLine = (pair: Pair): string => `
  <tr>
    <td>${sectionName(pair)}</td>
    <td>${km(pair.km)}</td>
    <td>${yen(pair.fare)}</td>
    <td>${yen(pair.freeLtd)}</td>
    <td>${yen(pair.freeTotal)}</td>
    <td>${yen(pair.reservedLtd)}</td>
    <td>${yen(pair.reservedTotal)}</td>
    <td>${perKm(pair.yenPerKmFree)}</td>
    <td>${pair.isTokutei ? "あり" : "なし"}</td>
  </tr>`;

const tableHead = (headers: string[]): string => `<thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>`;

const collapsedRowsTable = (headers: string[], rows: string[], visibleCount = 3): string => {
  const visibleRows = rows.slice(0, visibleCount).join("");
  const hiddenRows = rows.slice(visibleCount).join("");
  const hiddenCount = Math.max(rows.length - visibleCount, 0);

  return `
    <div class="table-wrap">
      <table>
        ${tableHead(headers)}
        <tbody>${visibleRows}</tbody>
      </table>
    </div>
    ${
      hiddenCount > 0
        ? `<details class="more-rows">
            <summary>残り${hiddenCount.toLocaleString("ja-JP")}区間を表示</summary>
            <div class="table-wrap">
              <table>
                ${tableHead(headers)}
                <tbody>${hiddenRows}</tbody>
              </table>
            </div>
          </details>`
        : ""
    }`;
};

const sameFareCell = (pair: Pair): string => {
  if (!pair.sameFareFarthest) {
    return "この料金帯で最長";
  }
  return `${sectionName(pair.sameFareFarthest)} ${ratio(pair.sameFareFarthest.timesFarther)}`;
};

const renderChecker = (data: TokaidoData): string => {
  const options = data.stations.map((station) => `<option value="${station.name}">${station.name}</option>`).join("");
  return `
    <section id="checker" class="section checker-section">
      <p class="section-number">7</p>
      <h2><span>乗る区間を調べてみる</span></h2>
      <p class="body-text">ここまでの話は、特定の区間だけの珍事件に見えるかもしれません。そこで、出発駅と到着駅を選ぶだけで、その区間が特定特急券の側にいるのか、通常の階段料金の側にいるのかを確認できるようにしました。</p>
      <p class="body-text">表示するのは、乗車券、自由席特急料金、指定席特急料金、実際に払う合計額、そして自由席特急料金を営業キロで割った単価です。同じ駅を選んだ場合は、移動区間ではないので料金を出さず、別の駅を選ぶよう案内します。</p>
      <div class="checker">
        <label>出発駅<select id="fromStation">${options}</select></label>
        <label>到着駅<select id="toStation">${options}</select></label>
        <div id="checkerResult" class="checker-result" aria-live="polite"></div>
      </div>
    </section>`;
};

export const renderArticle = (data: TokaidoData): string => {
  const hero = findPair(data.highlights.hero.from, data.highlights.hero.to);
  const same = findPair(data.highlights.sameFareLongerRide.from, data.highlights.sameFareLongerRide.to);
  const cheaper = findPair(data.highlights.cheaperButLonger.from, data.highlights.cheaperButLonger.to);
  const cheaper2 = findPair(data.highlights.cheaperButLonger2.from, data.highlights.cheaperButLonger2.to);
  const oneStop = findPair(data.highlights.oneStop.from, data.highlights.oneStop.to);
  const oneStopWest = findPair(data.highlights.oneStopWest.from, data.highlights.oneStopWest.to);
  const shortPremium = hero.freeLtd - cheaper.freeLtd;
  const splitOdawaraMishima = data.splits.find((split) => split.from === hero.from && split.via === oneStopWest.to && split.to === hero.to);
  if (!splitOdawaraMishima) {
    throw new Error("小田原〜熱海〜三島の分割データが見つかりません");
  }
  const splitGifuKyoto = data.splits.find((split) => split.from === "岐阜羽島" && split.to === "京都");
  if (!splitGifuKyoto) {
    throw new Error("岐阜羽島〜京都の分割データが見つかりません");
  }
  const mishimaStation = data.stations.find((station) => station.name === hero.to);
  if (!mishimaStation) {
    throw new Error("三島駅のデータが見つかりません");
  }
  const newFujiStation = data.stations.find((station) => station.name === "新富士");
  if (!newFujiStation) {
    throw new Error("新富士駅のデータが見つかりません");
  }
  const noTokuteiUnderTier = data.pairs
    .filter((pair) => !pair.isTokutei && pair.km <= data.fareTiers[0].maxKm)
    .sort((a, b) => b.yenPerKmFree - a.yenPerKmFree);
  const worst = [...data.pairs].sort((a, b) => b.yenPerKmFree - a.yenPerKmFree).slice(0, 12);
  const worstNoTokutei = data.pairs.filter((pair) => !pair.isTokutei).sort((a, b) => b.yenPerKmFree - a.yenPerKmFree).slice(0, 12);
  const comparisonItems = [hero, same, cheaper, oneStop];
  const fareHeaders = ["区間", "営業キロ", "乗車券", "自由席特急料金", "自由席合計", "指定席特急料金", "指定席合計", "円/km", "特定"];
  const noTokuteiHeaders = ["区間", "営業キロ", "あいだの駅数", "乗車券", "自由席特急料金", "自由席合計", "指定席特急料金", "指定席合計", "円/km", "同じ料金の最遠区間"];
  if (!hero.sameFareFarthest) {
    throw new Error("主役区間の同額最遠区間が見つかりません");
  }

  return `
    <header class="hero">
      <div class="hero-copy">
        <p class="kicker">東海道新幹線・自由席特急料金の方眼メモ</p>
        <h1><span class="title-line">新幹線は <mark>"2駅"</mark> から</span><span class="title-line">急に高くなる</span></h1>
        <p class="subtitle">${sectionName(hero)} ${km(hero.km)} の自由席特急料金は ${yen(hero.freeLtd)}。${sectionName(same)} ${km(same.km)} も、同じ ${yen(same.freeLtd)}。</p>
        <div class="hero-note sticky">${data.highlights.hero.note}</div>
      </div>
    </header>

    <main>
      <section id="section-1" class="section lead-section">
        <p class="section-number">1</p>
        <h2><span>${sectionName(hero)}、${km(hero.km)}で${yen(hero.freeTotal)}</span></h2>
        <div class="compare-grid uneven">
          <article class="paper-block large">
            <h3>${sectionName(hero)}</h3>
            ${stat("営業キロ", km(hero.km), "red")}
            ${stat("乗車券", yen(hero.fare))}
            ${stat("自由席特急料金", yen(hero.freeLtd), "red")}
            ${stat("自由席で払う合計", yen(hero.freeTotal), "red")}
            ${stat("自由席 円/km", perKm(hero.yenPerKmFree))}
          </article>
          <article class="paper-block">
            <h3>${sectionName(same)}</h3>
            ${stat("営業キロ", km(same.km))}
            ${stat("自由席特急料金", yen(same.freeLtd))}
            ${stat("自由席で払う合計", yen(same.freeTotal))}
            ${stat("同じ料金で", `${ratio(hero.sameFareFarthest.timesFarther)}の距離まで`)}
          </article>
        </div>
        <p class="body-text">三島から小田原まで新幹線の自由席に乗ると、乗車券と自由席特急券を合わせて ${yen(hero.freeTotal)} かかります。内訳は乗車券が ${yen(hero.fare)}、自由席特急料金が ${yen(hero.freeLtd)} です。営業キロは ${km(hero.km)} しかありません。</p>
        <p class="body-text">ところが、同じ三島から東京まで ${km(same.km)} 乗っても、自由席特急料金は ${yen(same.freeLtd)} でまったく同じです。特急料金だけを見れば、${sectionName(hero.sameFareFarthest)} のように ${ratio(hero.sameFareFarthest.timesFarther)} の距離まで同じ値段で行けます。</p>
        <p class="body-text">乗車券は距離に応じて増えていきますが、特急料金はそう動いていません。この違和感がどこから来るのかを、東海道新幹線の全区間の記録で追っていきます。</p>
      </section>

      <section id="section-2" class="section">
        <p class="section-number">2</p>
        <h2><span>特急料金は、乗った距離だけでは決まりません</span></h2>
        <p class="body-text">新幹線に乗るときの支払いは、大きく分けると乗車券と特急券です。乗車券は普通列車に乗るための基本料金で、営業キロ、つまり運賃計算に使う鉄道上の距離に応じて増えていきます。</p>
        <p class="body-text">一方で、特急料金は営業キロに応じた階段で決まります。その最初の段である ${data.fareTiers[0].label} が広く、指定席なら ${yen(data.fareTiers[0].reservedLtd)}、自由席なら ${yen(data.fareTiers[0].freeLtd)} が一律でかかります。</p>
        <p class="body-text">つまり、この段の中では短く乗っても長く乗っても特急料金は同じです。乗車券は少しずつ増えるのに、特急料金だけが平らな踊り場を持っているため、乗る距離が短いほど ${perKm(hero.yenPerKmFree)} のように負担が跳ね上がります。</p>
        ${fareStepChart(data.fareTiers)}
      </section>

      <section id="section-3" class="section">
        <p class="section-number">3</p>
        <h2><span>短い区間には割引があります</span></h2>
        <p class="body-text">JRも短距離の割高感を放置しているわけではありません。隣接する駅どうしの区間には、特定特急券という割安な自由席用の特急券があります。指定席ではなく、自由席に乗るときの短距離向け割引です。</p>
        <p class="body-text">この特定特急券は、通常の ${data.fareTiers[0].label} の階段とは別枠です。営業キロ ${km(data.tokuteiRule.thresholdKm)} 以下なら ${yen(data.tokuteiRule.amounts.upTo50km)}、${km(data.tokuteiRule.thresholdKm)} を超えるなら ${yen(data.tokuteiRule.amounts.over50km)} になります。熱海〜三島は ${yen(oneStop.freeLtd)}、小田原〜熱海も ${yen(oneStopWest.freeLtd)} です。</p>
        <div class="note-row">
          <div class="sticky small">隣接駅間なら ${km(data.tokuteiRule.thresholdKm)} 以下 ${yen(data.tokuteiRule.amounts.upTo50km)} / 超 ${yen(data.tokuteiRule.amounts.over50km)}</div>
          <div class="paper-block">
            <h3>${sectionName(oneStopWest)} + ${sectionName(oneStop)}</h3>
            <p>1駅ずつなら ${yen(oneStopWest.freeLtd)} と ${yen(oneStop.freeLtd)}。分割すると ${yen(splitOdawaraMishima.splitLtd)}、通しで買うと ${yen(hero.freeLtd)}。</p>
          </div>
        </div>
        <p class="body-text">ここが本題です。小田原から三島までは、小田原〜熱海と熱海〜三島を足しただけの距離です。ところが通しの小田原〜三島になると、特定特急券の網から落ちて ${yen(hero.freeLtd)} になります。</p>
        <p class="body-text">分割購入をしても、差は ${yen(splitOdawaraMishima.saving)} だけです。ほぼ得をしないので、この区間には「買い方で逃げる」余地があまりありません。</p>
      </section>

      <section id="section-4" class="section">
        <p class="section-number">4</p>
        <h2><span>短いほうが高くなる区間があります</span></h2>
        <p class="body-text">三島から静岡までは ${km(cheaper.km)} ありますが、自由席特急料金は ${yen(cheaper.freeLtd)} です。小田原から三島までは ${km(hero.km)} しかないのに、自由席特急料金は ${yen(hero.freeLtd)} です。</p>
        <p class="body-text">短いほうが高い、という逆転が起きています。差額は ${yen(shortPremium)} です。これは割引商品やキャンペーンの話ではなく、通常の自由席特急料金どうしの比較です。</p>
        <p class="body-text">新横浜〜小田原も ${km(cheaper2.km)} で ${yen(cheaper2.freeLtd)} です。小田原〜三島より長いのに安い区間が複数あることで、距離と値段の対応が壊れて見える理由がはっきりします。</p>
        ${comparisonBarChart(comparisonItems)}
      </section>

      <section id="section-5" class="section">
        <p class="section-number">5</p>
        <h2><span>${year(data.tokuteiRule.basisYear)}年の駅の並びが、いまの料金を決めています</span></h2>
        <p class="body-text">特定特急券の「隣接駅間」は、現在の駅並びだけでは決まりません。東海道・山陽新幹線では、新大阪〜岡山が開業した ${year(data.tokuteiRule.basisYear)}年の駅の並びが、判断の大きな基準になっています。</p>
        <p class="body-text">その後に新駅ができた区間は、規則に区間名を書いて割引を続けています。代表例が ${sectionName(cheaper)} で、あとから新富士が入って現在は隣どうしではなくなっても、自由席特急料金は ${yen(cheaper.freeLtd)} のままです。</p>
        ${keyPoint("特定特急券の基準", data.tokuteiRule.basisNote)}
        ${timeline1972Chart(data.stations, data.tokuteiRule)}
        <p class="body-text">一方で、三島駅の開業は ${year(mishimaStation.opened)}年です。基準になる ${year(data.tokuteiRule.basisYear)}年には、すでに小田原・熱海・三島の順で駅が並んでいました。小田原と三島は隣接だったことがないため、「あとから駅が挟まった区間」として割引される入口に立てませんでした。</p>
        <p class="body-text">もし三島が新富士たちと同じ ${year(newFujiStation.opened)}年開業だったなら、小田原〜三島は今も特定特急券の対象で、${km(data.tokuteiRule.thresholdKm)} 以下の ${yen(data.tokuteiRule.amounts.upTo50km)} だったはずです。半世紀前の駅の並びが、いまの短距離移動の負担感につながっています。</p>
        ${keyPoint("小田原〜三島が外れた理由", data.tokuteiRule.whyOdawaraMishimaExcluded)}
        <ul class="lined-list">
          ${data.tokuteiRule.enumeratedSections
            .map(([from, to]) => `<li><strong>${from}〜${to}</strong>：${data.tokuteiRule.enumeratedReason[`${from}-${to}`]}</li>`)
            .join("")}
        </ul>
      </section>

      <section id="section-6" class="section">
        <p class="section-number">6</p>
        <h2><span>東海道新幹線の全区間を比べてみる</span></h2>
        <p class="body-text">路線図では、東海道新幹線の駅の並び、開業時期、特定特急券が効く区間をまとめて見られるようにしました。後発駅が間に入っても割引が続く区間と、最初から隣どうしではなかった小田原〜三島の違いが見えてきます。</p>
        <p class="body-text">表では、自由席特急料金を営業キロで割った単価が高い順に並べています。全区間の表と、特定特急券が効かない区間だけの表を分けることで、短い距離で通常料金になる区間を見つけやすくしています。</p>
        ${routeChart(data.stations, data.pairs, data.tokuteiRule, data.highlights.hero)}
        <h3 class="subhead">自由席 円/km が高い区間（全区間）</h3>
        <p class="body-text">全区間で見ると、隣接駅間は距離が極端に短いので単価が高く出ます。これは短距離向けの特定特急券が効いていても、分母の営業キロが小さいためです。</p>
        ${collapsedRowsTable(fareHeaders, worst.map(fareLine))}
        <h3 class="subhead">自由席 円/km が高い区間（特定特急券なし）</h3>
        <p class="body-text">特定特急券が効かない区間だけに絞ると、短距離なのに通常の階段料金へ乗ってしまう区間が浮かびます。この表では ${sectionName(worstNoTokutei[0])} が先頭に来ます。</p>
        ${collapsedRowsTable(fareHeaders, worstNoTokutei.map(fareLine))}
      </section>

      ${renderChecker(data)}

      <section id="section-8" class="section">
        <p class="section-number">8</p>
        <h2><span>同じことが起きている区間</span></h2>
        <p class="body-text">ここで見るのは、特定特急券が効かず、営業キロが ${data.fareTiers[0].label} の中に収まる区間です。さらに、あいだに駅があるほど「短距離なのに隣接駅扱いではない」ことが分かりやすくなります。</p>
        <p class="body-text">一覧には、あいだの駅数も加えました。営業キロだけなら短いのに、特急料金は通常の踊り場に乗ってしまう区間です。</p>
        ${collapsedRowsTable(
          noTokuteiHeaders,
          noTokuteiUnderTier.map((pair) => `<tr><td>${sectionName(pair)}</td><td>${km(pair.km)}</td><td>${pair.stationsBetween.toLocaleString("ja-JP")}</td><td>${yen(pair.fare)}</td><td>${yen(pair.freeLtd)}</td><td>${yen(pair.freeTotal)}</td><td>${yen(pair.reservedLtd)}</td><td>${yen(pair.reservedTotal)}</td><td>${perKm(pair.yenPerKmFree)}</td><td>${sameFareCell(pair)}</td></tr>`),
        )}
        <p class="body-text">分割購入は、区間によって効き方がかなり違います。${splitGifuKyoto.from}〜${splitGifuKyoto.to} は ${yen(splitGifuKyoto.saving)} も安くなりますが、${splitOdawaraMishima.from}〜${splitOdawaraMishima.to} は ${yen(splitOdawaraMishima.saving)} しか変わりません。</p>
        <p class="body-text">理由は単純です。小田原〜三島は通しで買っても、すでに最初の踊り場である ${yen(data.fareTiers[0].freeLtd)} どまりです。そこから分割しても、下げ幅がほとんど残っていません。</p>
        <div class="split-grid">
          ${data.splits
            .map(
              (split) => `<article class="sticky split">
                <h3>${split.from}〜${split.to}</h3>
                <p>${split.via}で分割：${yen(split.splitLtd)} / 通し：${yen(split.throughLtd)}</p>
                <strong>${yen(split.saving)} 安い</strong>
              </article>`,
            )
            .join("")}
        </div>
      </section>

      <section id="section-9" class="section">
        <p class="section-number">9</p>
        <h2><span>在来線なら安い。ただし熱海で乗り継ぎになります</span></h2>
        <p class="body-text">在来線を選ぶと、特急料金はかかりません。小田原〜三島なら、乗車券は ${yen(hero.fare)} です。新幹線の自由席に乗ると合計は ${yen(hero.freeTotal)} なので、乗車券だけの場合の ${ratio(hero.freeMultipleOfFare)} になります。</p>
        <p class="body-text">この差は、速さと乗り通しやすさに対して支払う上乗せ分です。短い距離では、その上乗せ分がかなり大きく見えます。</p>
        ${keyPoint("新幹線と在来線の乗車券", data.conventionalLine.note)}
        <div class="boundary-grid">
          <div class="paper-block"><h3>${data.conventionalLine.boundary.station}の会社境界</h3><p>${data.conventionalLine.boundary.east}</p><p>${data.conventionalLine.boundary.west}</p>${keyPoint("会社の境界はどこか", data.conventionalLine.boundary.physicalBoundary)}</div>
          <div class="paper-block"><h3>IC と運行</h3>${keyPoint("ICカードの制約", data.conventionalLine.boundary.icRule)}${keyPoint("実際の買い方", data.conventionalLine.boundary.practical)}${keyPoint("列車のつながり", data.conventionalLine.boundary.operation)}</div>
        </div>
        <p class="body-text">ただし在来線には別の手間があります。熱海はJR東日本とJR東海の境界駅で、熱海より東側はJR東日本、西側はJR東海の区間になります。定期券を除くと熱海をまたぐICカード利用ができないため、小田原〜三島を在来線で通すなら、乗る前に全区間の紙のきっぷを買う必要があります。</p>
        <p class="body-text">ICカードで熱海まで来てしまうと、熱海でいったん精算し、その先のきっぷを買い直すことになります。さらに東海道本線の大半の列車は熱海で系統が分かれるので、乗り換えも前提になります。</p>
        <p class="body-text">いっぽう東海道新幹線は全線がJR東海です。小田原〜三島は会社境界をまたがないため、このICカードや買い直しの手間がありません。新幹線は高いが継ぎ目がない、在来線は安いが熱海で切れる、という選択です。</p>
        ${keyPoint("新幹線側はどうか", data.conventionalLine.boundary.shinkansenNote)}
      </section>

      <section id="section-10" class="section sources">
        <p class="section-number">10</p>
        <h2><span>出典と注意書き</span></h2>
        <p class="body-text">料金、営業キロ、特定特急券の扱いは、JR東海の旅客営業規則とその別表、および同社の案内ページを根拠にしています。指定席特急料金は別表第2号ツの実額を使い、距離帯から見た扱いとも照合しています。</p>
        <p class="body-text">指定席料金は時期や列車種別で変わる場合があります。このページでは、通常期の「ひかり・こだま」と自由席を中心に見ています。</p>
        <details class="source-details">
          <summary>出典 ${data.sources.length.toLocaleString("ja-JP")}件（JR東海 旅客営業規則ほか）</summary>
          <ol>
            ${data.sources
              .map((source) => `<li><a href="${escapeHtml(source.url)}" rel="noreferrer">${escapeHtml(source.title)}</a><span>${escapeHtml(source.publisher)} / ${escapeHtml(readerFacingUse(source.used))}</span></li>`)
              .join("")}
          </ol>
        </details>
        <div class="paper-block">
          <p>${data.meta.fareBasis}</p>
          <p>${readerFacingUse(data.meta.reservedSource)}</p>
          <p>${data.meta.tokuteiBasis}</p>
          <ul>${data.meta.caveats.map((caveat) => `<li>${escapeHtml(caveat)}</li>`).join("")}</ul>
        </div>
      </section>
    </main>
  `;
};
