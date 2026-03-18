# Webページ技術解析拡張機能

## 概要

開いているWebページを解析して、使用されている技術スタックを可視化するChrome拡張機能です。

## 検出できる技術

| カテゴリ | 検出例 |
|---|---|
| 言語 | JavaScript, TypeScript, WebAssembly |
| フレームワーク | React, Next.js, Vue.js, Nuxt.js, Angular, Svelte 他 |
| CSSフレームワーク | Tailwind CSS, Bootstrap, Material UI, Ant Design 他 |
| ライブラリ | jQuery, Three.js, GSAP, D3.js, Chart.js 他 |
| CMS / プラットフォーム | WordPress, Shopify, Webflow, Squarespace 他 |
| DB / API | Firebase, Supabase, MongoDB, GraphQL 他 |
| インフラ | Vercel, Netlify, AWS, Cloudflare, Google Cloud 他 |
| 分析 / マーケ | Google Analytics, GTM, Meta Pixel, Hotjar 他 |
| フォント | Google Fonts, Adobe Fonts, Font Awesome 他 |

## インストール（開発用）

1. Chromeの拡張機能管理画面（`chrome://extensions`）を開きます。
2. 右上の「デベロッパーモード」を有効にします。
3. 「パッケージ化されていない拡張機能を読み込む」から本プロジェクトのフォルダを指定します。

## 使い方

1. 解析したいページを開き、拡張機能のアイコンをクリックします。
2. 「解析」ボタンを押すと、検出された技術スタックがカテゴリ別に表示されます。

## 開発・貢献

バグ報告や機能提案、プルリクエストは歓迎します。まず Issue を立ててください。