# pure_board

Windows 11 上で動作する、ガラス風デスクトップダッシュボード。

雑多に「あれば嬉しい」機能を兼ね備えたデスクトップアプリとして開発しています。

![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri\&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript\&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-stable-CE422B?logo=rust\&logoColor=white)

---

## 概要

**pure_board** は、雑多に「あれば嬉しい」機能を兼ね備えた、Windows 11 向けのデスクトップダッシュボードアプリです。

Windows 11 の壁紙を透過させたガラス風 UI を採用し、システムモニタリングと簡易メモ機能を 1 つのウィンドウにまとめています。

---

## 主な機能

* CPU 使用率の表示
* プロセッサ名の表示
* CPU 使用率の波形グラフ
* RAM 使用率の表示
* CPU / RAM 履歴の詳細グラフビュー
* ネットワーク送受信速度の表示
* 手動 Ping 測定
* システム情報の更新間隔変更（0.1 秒以上の自由入力）
* Memo ウィジェット
* Memo の追加 / 完了チェック / 削除
* Memo のタグ選択
* Memo のリストビュー
* Memo データの永続化
* 設定パネル
* ダークモード / ライトモード切り替え
* 常に最前面に表示の切り替え
* 編集モード
* ウィジェットのドラッグ並び替え
* ウィジェットの表示 / 非表示切り替え
* ウィンドウを閉じるボタン

---

## 技術構成

| レイヤー          | 採用技術                                                       |
| ------------- | ---------------------------------------------------------- |
| シェル           | [Tauri 2](https://tauri.app/)                              |
| フロントエンド       | React 19 + TypeScript + Vite                               |
| バックエンド        | Rust + [`sysinfo`](https://crates.io/crates/sysinfo)       |
| 永続化           | [`tauri-plugin-store`](https://v2.tauri.app/plugin/store/) |
| Lint / Format | [Biome](https://biomejs.dev/)                              |
| Git Hooks     | [lefthook](https://github.com/evilmartians/lefthook)       |
| CI            | GitHub Actions                                             |

---

## 対象環境

主なターゲット環境:

* Windows 11

開発環境:

* Windows 11
* Linux / CachyOS

Windows 向けビルドは Linux 上でクロスコンパイルせず、GitHub Actions の `windows-latest` runner によるネイティブビルドで検証します。

OS ごとの挙動や Wayland 環境での注意点は [`docs/windows.md`](docs/windows.md) を参照してください。

---

## セットアップ

```bash
pnpm install
pnpm tauri dev
```

`pnpm install` 実行時に `lefthook install` が走り、以後のコミット時に Biome による整形が自動適用されます。

---

## コマンド

### Frontend / App

```bash
pnpm lint
pnpm lint:fix
pnpm typecheck
pnpm test
```

### Rust

```bash
cd src-tauri
cargo fmt
cargo clippy --all-targets -- -D warnings
```

---

## ディレクトリ構成

```text
src/
├── components/   # UI パーツ
├── hooks/        # React hooks
└── App.tsx

src-tauri/
├── src/lib.rs    # Tauri commands
└── capabilities/ # Tauri 権限設定
```

詳細な構成は [`docs/architecture.md`](docs/architecture.md) を参照してください。

---

## 実装状況

主な実装済み機能は「主な機能」を参照してください。

### 今後対応予定

* [ ] タスクトレイ常駐
* [ ] 自動起動

詳しいロードマップは [`docs/roadmap.md`](docs/roadmap.md) を参照してください。

---

## 補足

ネットワーク速度と Ping は Rust 側で取得します。Ping は外部サービスへの定期通信を避けるため、手動実行のみです。

---

## ドキュメント

| ファイル                                           | 内容                       |
| ---------------------------------------------- | ------------------------ |
| [`AGENTS.md`](AGENTS.md)                       | AI エージェント向けの開発ガイド        |
| [`docs/architecture.md`](docs/architecture.md) | アプリ全体の構成                 |
| [`docs/development.md`](docs/development.md)   | 開発規約・実装ルール               |
| [`docs/windows.md`](docs/windows.md)           | Windows / Linux 環境ごとの注意点 |
| [`docs/roadmap.md`](docs/roadmap.md)           | 今後の実装予定                  |
| [`docs/ci.md`](docs/ci.md)                     | CI / リリース方針              |

---

## 開発方針

pure_board は、軽量で保守しやすい Windows 11 向けデスクトップダッシュボードを目指しています。

大規模なフレームワーク化や複雑なプラグイン機構ではなく、Tauri / React / Rust のシンプルな構成を維持しながら、必要な機能を段階的に追加していきます。
