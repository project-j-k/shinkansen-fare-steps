# -*- coding: utf-8 -*-
"""tokaido.json の実数値から OG 画像用の HTML を組み立てる。

使い方（リポジトリのルートで）:

    python3 scripts/make-og.py            # public/og.html を生成
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
      --headless=new --disable-gpu --hide-scrollbars \
      --window-size=1200,630 --screenshot=public/og.png \
      "file://$PWD/public/og.html"
    rm public/og.html                     # PNG にしたら中間HTMLは不要

数値はすべて src/data/tokaido.json から読むので、データを更新したら
このスクリプトで OG 画像を作り直すこと。

乗車券・特急料金・合計を並べて出しているのは、「同じなのは特急料金だけで、
支払総額は距離に応じて変わる」ことを画像だけ見た人が誤解しないため。
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, 'src/data/tokaido.json')))
h = d['highlights']
hero, same, cheap, one = h['hero'], h['sameFareLongerRide'], h['cheaperButLonger'], h['oneStop']
tk = d['tokuteiRule']
ic = d['conventionalLine']['boundary']['station']
yen = lambda v: f"{v:,}円"
km = lambda v: f"{v}km"

def row(p, accent=False):
    cls = ' class="accent"' if accent else ''
    return f"""<tr{cls}>
      <th>{p['from']}〜{p['to']}</th>
      <td class="km">{km(p['km'])}</td>
      <td>{yen(p['fare'])}</td>
      <td class="ltd">{yen(p['freeLtd'])}</td>
      <td class="total">{yen(p['freeTotal'])}</td>
    </tr>"""

page = f"""<!doctype html><html><head><meta charset="utf-8"><style>
* {{ box-sizing: border-box; margin: 0; }}
body {{
  width: 1200px; height: 630px; overflow: hidden;
  font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", system-ui, sans-serif;
  color: #25231d;
  background-color: #fbf7ea;
  background-image:
    repeating-linear-gradient(0deg, transparent 0 27px, rgba(64,111,131,.16) 27px 28px),
    repeating-linear-gradient(90deg, transparent 0 27px, rgba(64,111,131,.16) 27px 28px),
    repeating-linear-gradient(0deg, transparent 0 139px, rgba(64,111,131,.3) 139px 140px),
    repeating-linear-gradient(90deg, transparent 0 139px, rgba(64,111,131,.3) 139px 140px);
  padding: 42px 54px 34px;
  display: flex; flex-direction: column; justify-content: space-between;
}}
.kicker {{ color: #b64237; font-size: 23px; font-weight: 800; }}
h1 {{ font-size: 62px; line-height: 1.14; font-weight: 900; letter-spacing: -.01em; margin-top: 4px; }}
h1 span {{ display: block; white-space: nowrap; }}
h1 mark {{ color: inherit; background: linear-gradient(to top, transparent .07em, #f7e36b .07em, #f7e36b .4em, transparent .4em); }}
table {{ border-collapse: collapse; width: 100%; font-weight: 800; }}
thead th {{ font-size: 21px; color: #6a6256; font-weight: 800; padding: 0 14px 8px; text-align: right; }}
thead th:first-child {{ text-align: left; }}
tbody th {{ font-size: 29px; text-align: left; padding: 11px 14px; white-space: nowrap; }}
tbody td {{ font-size: 31px; text-align: right; padding: 11px 14px; }}
tbody tr {{ border-top: 3px solid rgba(37,35,29,.2); }}
.km {{ color: #1f6f8b; }}
.ltd {{ color: #b64237; background: rgba(247,227,107,.5); }}
.total {{ font-size: 33px; }}
.caption {{ font-size: 22px; font-weight: 700; color: #6a6256; margin-top: 8px; }}
.caption b {{ color: #b64237; }}
.notes {{ display: flex; gap: 13px; }}
.note {{
  flex: 1; border: 3px solid #25231d; background: #fffdf4;
  box-shadow: 5px 6px 0 rgba(50,42,30,.18);
  padding: 12px 15px; font-size: 22px; font-weight: 700; line-height: 1.45;
}}
.note b {{ color: #b64237; }}
.foot {{ display: flex; justify-content: space-between; font-size: 21px; color: #6a6256; font-weight: 700; }}
</style></head><body>
  <div>
    <p class="kicker">東海道新幹線・特急料金の方眼メモ</p>
    <h1><span>新幹線の<mark>特急料金</mark>は、</span><span>距離に比例しない</span></h1>
  </div>

  <div>
    <table>
      <thead><tr><th>区間</th><th>営業キロ</th><th>乗車券</th><th>自由席特急料金</th><th>合計</th></tr></thead>
      <tbody>
        {row(hero, True)}
        {row(same)}
      </tbody>
    </table>
    <p class="caption">距離が {round(same['km'] / hero['km'], 2)}倍 でも <b>特急料金は同じ</b>。乗車券は距離ぶん増えるので、合計は変わります</p>
  </div>

  <div class="notes">
    <div class="note">隣接駅間には特定特急券<br>{one['from']}〜{one['to']} は <b>{yen(one['freeLtd'])}</b></div>
    <div class="note">{cheap['from']}〜{cheap['to']} {km(cheap['km'])} は<br><b>{yen(cheap['freeLtd'])}</b>（{tk['thresholdKm']}km超の特定額）</div>
    <div class="note">在来線は{ic}をまたぐと<br><b>ICが使えない</b>（定期券を除く）</div>
  </div>

  <div class="foot">
    <span>こだま・自由席で短い区間に乗る人へ</span>
    <span>project-j-k.github.io/shinkansen-fare-steps</span>
  </div>
</body></html>"""

out = os.path.join(ROOT, 'public/og.html')
open(out, 'w').write(page)
print(f"生成: {out}")
