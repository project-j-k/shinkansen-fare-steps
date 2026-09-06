# -*- coding: utf-8 -*-
"""tokaido.json の実数値から OG 画像用の HTML を組み立てる。

使い方（リポジトリのルートで）:

    python3 scripts/make-og.py            # public/og.html を生成
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \\
      --headless=new --disable-gpu --hide-scrollbars \\
      --window-size=1200,630 --screenshot=public/og.png \\
      "file://$PWD/public/og.html"
    rm public/og.html                     # PNG にしたら中間HTMLは不要

数値はすべて src/data/tokaido.json から読むので、データを更新したら
このスクリプトで OG 画像を作り直すこと。
"""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import json

d = json.load(open(os.path.join(ROOT, 'src/data/tokaido.json')))
h = d['highlights']
hero, same, cheap, one = h['hero'], h['sameFareLongerRide'], h['cheaperButLonger'], h['oneStop']
ic = d['conventionalLine']['boundary']['station']
yen = lambda v: f"{v:,}円"
km  = lambda v: f"{v}km"

page = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: 1200px 630px; }}
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
  padding: 46px 56px;
  display: flex; flex-direction: column; justify-content: space-between;
}}
.kicker {{ color: #b64237; font-size: 24px; font-weight: 800; letter-spacing: .02em; }}
h1 {{ font-size: 68px; line-height: 1.14; font-weight: 900; letter-spacing: -.01em; }}
h1 span {{ display: block; white-space: nowrap; }}
h1 mark {{ color: inherit; background: linear-gradient(to top, transparent .07em, #f7e36b .07em, #f7e36b .4em, transparent .4em); }}
.rows {{ display: flex; flex-direction: column; gap: 10px; }}
.row {{ display: flex; align-items: baseline; gap: 18px; font-weight: 800; }}
.sec {{ font-size: 32px; width: 280px; }}
.km  {{ font-size: 34px; width: 175px; color: #1f6f8b; }}
.arrow {{ font-size: 26px; color: #6a6256; }}
.fare {{ font-size: 44px; color: #b64237; }}
.same {{ font-size: 23px; margin-left: 4px; color: #6a6256; font-weight: 700; }}
.notes {{ display: flex; gap: 14px; }}
.note {{
  flex: 1; border: 3px solid #25231d; background: #fffdf4;
  box-shadow: 5px 6px 0 rgba(50,42,30,.18);
  padding: 14px 16px; font-size: 23px; font-weight: 700; line-height: 1.45;
}}
.note b {{ color: #b64237; }}
.foot {{ display: flex; justify-content: space-between; align-items: flex-end; font-size: 22px; color: #6a6256; font-weight: 700; }}
</style></head><body>
  <div>
    <p class="kicker">東海道新幹線・自由席特急料金の方眼メモ</p>
    <h1><span>新幹線は <mark>"2駅"</mark> から</span><span>急に高くなる</span></h1>
  </div>

  <div class="rows">
    <div class="row">
      <span class="sec">{hero['from']}〜{hero['to']}</span>
      <span class="km">{km(hero['km'])}</span>
      <span class="arrow">→</span>
      <span class="fare">{yen(hero['freeLtd'])}</span>
    </div>
    <div class="row">
      <span class="sec">{same['from']}〜{same['to']}</span>
      <span class="km">{km(same['km'])}</span>
      <span class="arrow">→</span>
      <span class="fare">{yen(same['freeLtd'])}</span>
      <span class="same">おなじ値段で {round(same['km']/hero['km'],2)}倍の距離</span>
    </div>
  </div>

  <div class="notes">
    <div class="note">{cheap['from']}〜{cheap['to']} は {km(cheap['km'])} で <b>{yen(cheap['freeLtd'])}</b><br>長いほうが安い逆転</div>
    <div class="note">1駅なら {one['from']}〜{one['to']} <b>{yen(one['freeLtd'])}</b><br>2駅から一気に倍近く</div>
    <div class="note">在来線は{ic}で<b>ICが切れる</b><br>紙のきっぷが要る</div>
  </div>

  <div class="foot">
    <span>こだま・自由席で短い区間に乗る人へ</span>
    <span>project-j-k.github.io/two-stop-tax</span>
  </div>
</body></html>"""

out = os.path.join(ROOT, 'public/og.html')
open(out, 'w').write(page)
print(f"生成: {out}")
