import { z } from "zod/mini"

// Zod は既定で高速化のために new Function() による JIT コンパイルを試みる。
// 本アプリは CSP（script-src 'self' / Trusted Types）で eval 相当を禁止しているため、
// JIT を無効化して違反レポートやコンソールエラーを発生させないようにする。
// スキーマ定義より先に評価される必要があるため、main.tsx の最初で import すること。
z.config({ jitless: true })
