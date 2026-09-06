# shinkansen-fare-steps — 新幹線は "2駅" から急に高くなる

東海道新幹線の「短距離ほど特急料金が割高になる」構造を解説する静的サイトです。公開先は https://project-j-k.github.io/shinkansen-fare-steps/ です。Vite + TypeScript の vanilla 実装で、チャートライブラリや外部フォント、CDN、外部画像は使っていません。

## ローカル起動

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

生成物は `dist/` に出力されます。

## GitHub Pages 公開手順

1. GitHub に `shinkansen-fare-steps` リポジトリを作成する。
2. ローカルで remote を追加する。

```bash
git remote add origin git@github.com:project-j-k/shinkansen-fare-steps.git
git branch -M main
git push -u origin main
```

3. GitHub の Settings > Pages で **Source を GitHub Actions** にする。この初回設定は Web UI（またはリポジトリ管理権限を持つトークン）でしか行えず、ワークフロー内の `GITHUB_TOKEN` では有効化できないため、手動での操作が必要です。
4. `main` への push で `.github/workflows/deploy.yml` が `npm ci && npm run build` を実行し、GitHub Pages に公開します。Pages の設定後に再実行したい場合は、Actions タブから `workflow_dispatch` で手動実行できます。

## base パス

`vite.config.ts` の既定 base は `/shinkansen-fare-steps/` です。リポジトリ名を変える場合は、ビルド時に `VITE_BASE_PATH` を指定してください。

```bash
VITE_BASE_PATH=/another-repo/ npm run build
```

ユーザーサイト直下で公開する場合は `/` を指定します。

## データの出所

表示する料金、営業キロ、円/km、特定特急券の判定、出典情報は `src/data/tokaido.json` から import しています。JR東海の旅客営業規則・別表第2号ツなど、JSON 内の `sources` と `meta` に記録された一次情報・参照情報をもとにした検証済みデータです。

## OGP 画像とファビコン

- `public/og.png` … SNS 共有用の画像（1200×630）。文字だけの構成で、数値は `src/data/tokaido.json` から取っている
- `public/favicon.svg` … 方眼に赤い階段（短距離で跳ね上がる特急料金）
- `public/apple-touch-icon.png` … favicon.svg を 180×180 で書き出したもの

データを更新したら OG 画像も作り直す。手順は `scripts/make-og.py` の冒頭に書いてある。
