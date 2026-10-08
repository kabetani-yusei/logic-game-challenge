# 頭脳王に挑戦！必勝法を見抜いて、AIに勝利しよう

駒取りゲーム・ストレンジオセロ・mod M ゲームの 3 つのロジックゲームで AI と対戦できる Web アプリです。

## 使用技術

- React 19 + TypeScript 6 + Vite 8
- Material UI 9（ライト / ダークモード対応、CSS 変数テーマ）
- React Router 8（ルート単位の遅延読み込み）
- Zod 4（`zod/mini`、localStorage の検証）
- Vitest 5 / Playwright / ESLint 10
- オフライン対応（Service Worker、ホーム画面への追加に対応）

## セットアップ

このリポジトリは `Node.js 24 LTS`（`.node-version`）と `pnpm 12` を前提にしています。
pnpm のバージョンは `package.json` の `packageManager` で固定しており、異なるバージョンの pnpm で実行すると自動的に切り替わります（Corepack にも対応）。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | 開発サーバーを起動 |
| `pnpm build` | 型チェック + 本番ビルド（`dist/`） |
| `pnpm preview` | 本番ビルドを本番と同じセキュリティヘッダー付きで配信 |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | 静的解析・型チェック・ユニットテスト |
| `pnpm check` | 上記 + ビルドを実行 |
| `pnpm test:e2e` | 本番ビルドをブラウザで操作する E2E テスト（事前に `pnpm build` と `pnpm exec playwright install chromium`） |

E2E テストは全ゲームのプレイ、オフライン動作、セキュリティヘッダー、CSP / Trusted Types 違反がないことを PC・モバイルの両方で確認します。CI でも実行されます。

## オフライン対応

本番ビルドでは `/sw.js`（`service-worker/sw.js` をビルド時に生成）が登録され、初回訪問時にアプリ本体と AI の解析データをキャッシュします。以降はオフラインでも全ゲームを遊べます。新しいバージョンをデプロイすると画面に「更新する」ボタンが表示されます。

## セキュリティ対策

- **Content Security Policy**: `script-src 'self'` でインライン / 外部スクリプトを禁止し、Trusted Types（`require-trusted-types-for 'script'`）で DOM XSS のシンクを封じています。ビルド時に `index.html` へ `<meta>` として埋め込むほか、ホスティング用のヘッダーも生成します。
- **セキュリティヘッダー**: HSTS、`X-Content-Type-Options`、`X-Frame-Options` / `frame-ancestors`（クリックジャッキング対策）、`Referrer-Policy`、`Permissions-Policy`、COOP / CORP / COEP など。定義は [`security-headers.ts`](./security-headers.ts) に集約しています。
  - Netlify / Cloudflare Pages: ビルド時に `dist/_headers` を生成
  - Vercel: [`vercel.json`](./vercel.json)（`security-headers.ts` と一致していることをテストで検証）
  - その他（nginx 等）: `security-headers.ts` の値をレスポンスヘッダーとして設定してください
- **外部リソースなし**: フォントはパッケージから自己ホストし、Google Fonts などの第三者ドメインへの通信を行いません。
- **入力検証**: localStorage の保存データは信頼できない入力として Zod で検証し、不正・改ざんされたデータは破棄します。AI の解析テーブルもバイナリ形式を厳密に検証してから使い、AI の手は合法手かどうかを確認してから適用します。
- **Service Worker**: 同一オリジンの `/sw.js` のみ許可（`worker-src 'self'`）し、登録 URL は専用の Trusted Types ポリシーで固定しています。
- **サプライチェーン対策**: `pnpm-workspace.yaml` で公開後 3 日未満のパッケージを拒否（`minimumReleaseAge`）、依存のビルドスクリプトを許可制に（`strictDepBuilds`）、信頼性の低い取得元を拒否（`blockExoticSubdeps` / `trustPolicy`）。CI の Action はコミット SHA で固定し、`pnpm audit` を実行します。
- **Lint ルール**: `dangerouslySetInnerHTML`・`eval`・`new Function` を禁止しています。

## ストレンジオセロの解析データ

`public/strange-othello-*.bin` は `python3 scripts/generate_eval_table.py` で生成した全局面の解析結果です（数秒で再生成できます）。盤面を 44 ビットの整数に詰め、差分エンコードしたバイナリ形式で、AI の最善手テーブルは約 290KB（gzip 後 約 130KB）です。形式はスクリプト冒頭のコメントと `src/features/strange-othello/tableFormat.ts` を参照してください。評価値データ（約 630KB）は評価値表示を有効にしたときだけ読み込みます。
