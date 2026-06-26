# pure_board

Windows 11 上で常駐動作する、ガラス風(Glassmorphism)デスクトップダッシュボード。

CPU・RAM の使用率を半透明のウィンドウ上に表示し、付箋メモ機能も備える常駐アプリとして開発している。

![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-stable-CE422B?logo=rust&logoColor=white)

## 概要

タスクマネージャーを開かずに CPU・RAM の状態を確認できる、デスクトップ常駐型のダッシュボードアプリ。Windows 11 の壁紙を透過させたガラス風 UI を採用し、システムモニタリングと簡易メモ機能を1つのウィンドウにまとめている。

開発環境は CachyOS (Linux) で、Windows 実機・VM 上での作業は最小限にとどめる構成を採用している。Windows 向けの動作確認は GitHub Actions 上の Windows runner によるネイティブビルドで行う。

## 実装状況

- [x] ガラス風の透過ウィンドウ(`transparent: true` / `backdrop-filter: blur()`)
- [x] CPU 使用率(円形ゲージ + 波形グラフ)
- [x] RAM 使用率(円形ゲージ + 使用量表示)
- [x] Memo ウィジェット(追加・完了チェック・削除・タグ選択・永続化)
- [ ] ネットワーク速度・Ping の実取得(現在は表示用のモック値)
- [ ] プロセッサ名の実取得(現在は `プロセッサ名(後で実装)` という固定表示)
- [ ] タスクトレイ常駐・自動起動
- [ ] ダークモード / ライトモードの切り替え(CSS 変数による実装方針は決定済み)

## 技術構成

| レイヤー | 採用技術 |
| --- | --- |
| シェル | [Tauri 2](https://tauri.app/) |
| フロントエンド | React 19 + TypeScript + Vite |
| バックエンド | Rust + [`sysinfo`](https://crates.io/crates/sysinfo) |
| 永続化 | [`tauri-plugin-store`](https://v2.tauri.app/plugin/store/)(Memo データ) |
| Lint / Format | [Biome](https://biomejs.dev/) |
| Git Hooks | [lefthook](https://github.com/evilmartians/lefthook) |
| CI | GitHub Actions(`ubuntu-latest` / `windows-latest` でのネイティブビルド) |

Windows 向けビルドは Linux 上でのクロスコンパイルではなく、GitHub Actions の `windows-latest` runner によるネイティブビルドを採用している。

## 開発環境のセットアップ

```bash
pnpm install
pnpm tauri dev
```

`pnpm install` 実行時に `lefthook install` が走り、以後のコミット時に Biome による整形が自動適用される。

### コマンド一覧

```bash
pnpm lint          # Biome によるチェック
pnpm lint:fix       # Biome による自動修正
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest
```

Rust 側(`src-tauri` 配下):

```bash
cargo fmt
cargo clippy --all-targets -- -D warnings
```

## ディレクトリ構成

```
src/
├── components/   # UI パーツ(TitleBar, CpuCard, RamCard, MemoPanel, ...)
├── hooks/        # useSystemUsage, usePersistedMemos など
└── App.tsx

src-tauri/
├── src/lib.rs    # Tauri コマンド(get_system_usage など)
└── capabilities/ # 権限設定
```

## 補足事項
- CPU の波形グラフは、ポーリングで取得した実際の使用率をフロントエンド側でバッファして描画しており、表示内容自体は実データに基づく。
- Windows 向けビルドはローカル環境では行わず、`v*` タグの push をトリガーに GitHub Actions が `windows-latest` / `ubuntu-latest` の各環境でネイティブビルドを実行する。
