# 頭脳王に挑戦！必勝法を見抜いて、AIに勝利しよう

駒取りゲーム・ストレンジオセロ・mod M ゲームの 3 つのロジックゲームで AI と対戦できる Web アプリです。

## 使用技術

- React 19 + TypeScript 6 + Vite 8
- Material UI 9（ライト / ダークモード対応、CSS 変数テーマ）
- React Router 8（ルート単位の遅延読み込み）
- Zod 4（localStorage・解析データの検証）
- Vitest 5 / ESLint 10

## セットアップ

このリポジトリは `Node.js 24 LTS`（`.node-version`）と `pnpm 12` を前提にしています。
pnpm のバージョンは `package.json` の `devEngines.packageManager` で固定しており、異なるバージョンの pnpm で実行すると自動的に切り替わります。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | 開発サーバーを起動 |
| `pnpm build` | 型チェック + 本番ビルド（`dist/`） |
| `pnpm preview` | 本番ビルドを本番と同じセキュリティヘッダー付きで配信 |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | 静的解析・型チェック・テスト |
| `pnpm check` | 上記すべてを実行（CI と同じ） |

## セキュリティ対策

- **Content Security Policy**: `script-src 'self'` でインライン / 外部スクリプトを禁止し、Trusted Types（`require-trusted-types-for 'script'`）で DOM XSS のシンクを封じています。ビルド時に `index.html` へ `<meta>` として埋め込むほか、ホスティング用のヘッダーも生成します。
- **セキュリティヘッダー**: HSTS、`X-Content-Type-Options`、`X-Frame-Options` / `frame-ancestors`（クリックジャッキング対策）、`Referrer-Policy`、`Permissions-Policy`、COOP / CORP / COEP など。定義は [`security-headers.ts`](./security-headers.ts) に集約しています。
  - Netlify / Cloudflare Pages: ビルド時に `dist/_headers` を生成
  - Vercel: [`vercel.json`](./vercel.json)（`security-headers.ts` と一致していることをテストで検証）
  - その他（nginx 等）: `security-headers.ts` の値をレスポンスヘッダーとして設定してください
- **外部リソースなし**: フォントはパッケージから自己ホストし、Google Fonts などの第三者ドメインへの通信を行いません。
- **入力検証**: localStorage の保存データと AI の解析テーブルは信頼できない入力として Zod で検証し、不正・改ざんされたデータは破棄します。AI の手も合法手かどうかを検証してから適用します。
- **サプライチェーン対策**: `pnpm-workspace.yaml` で公開後 3 日未満のパッケージを拒否（`minimumReleaseAge`）、依存のビルドスクリプトを許可制に（`strictDepBuilds`）、信頼性の低い取得元を拒否（`blockExoticSubdeps` / `trustPolicy`）。CI の Action はコミット SHA で固定し、`pnpm audit` を実行します。
- **Lint ルール**: `dangerouslySetInnerHTML`・`eval`・`new Function` を禁止しています。

## ストレンジオセロの解析データ

`public/strange-othello-*.json` は `scripts/generate_eval_table.py` で生成した全局面の解析結果です。評価値データ（約 10MB）は評価値表示を有効にしたときだけ読み込みます。
