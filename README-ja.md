# pure_board

Windows 11のガラス風UIをリスペクトした、軽量なクロスプラットフォーム生産性向上ダッシュボードです。

[English](README.md)

![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-stable-CE422B?logo=rust&logoColor=white)

## 概要

**pure_board**は、システムモニタリングと小さな生産性向上ツールを、透過デスクトップウィジェットにまとめたアプリです。システムの稼働状況、TODO、アイデア、ユーザーが登録したショートカットへデスクトップからすぐにアクセスでき、ユーザーデータはローカル環境に保存されます。

## 主な機能

### システムモニタリング

- CPU / RAM使用率のリアルタイム表示
- CPU波形とCPU / RAM履歴の詳細ビュー
- プロセス別のCPU / メモリ使用量表示
- ネットワークのアップロード・ダウンロード速度表示
- 測定先を変更できる手動Ping測定
- システム情報の更新間隔設定

### 生産性向上

- 完了状態、タグ、絞り込み可能な一覧を備えた永続TODO
- 独立したIdea Editorウィンドウを備えたアイデア管理
- Markdownシンタックスハイライトとアイデアの自動保存
- URL、ファイル、フォルダー、アプリを最大6件登録できるショートカット
- Markdownで管理されたアプリ内ヘルプ

### デスクトップ連携

- 透過ガラス風インターフェース
- ライト・ダークテーマ
- 常に最前面に表示
- タスクトレイ連携と自動起動
- CPU・RAM・Networkを切り替えられる通知領域のミニグラフ
- ウィジェットの並び替えと表示切り替え
- 終了時の動作設定

## 対応プラットフォーム

pure_boardはWindows 11とLinuxで動作するクロスプラットフォームアプリケーションです。Windows 11のガラス風UIをリスペクトしつつ、対応する各デスクトップ環境で役立つことを目指しています。

通知領域のミニグラフを含むタスクバー連携は、Windows 11を優先して設計・検証します。Linuxでもミニグラフと右クリックメニューを提供しますが、ツールチップや左クリック操作はデスクトップ環境によって利用できない場合があります。

Windows 11ではpure_boardのアイコンが「隠れているインジケーター」に収納されることがあります。タスクバー右端の **^** からアイコンを表示領域へドラッグするか、Windowsの **設定 > 個人用設定 > タスクバー > その他のシステム トレイ アイコン** でpure_boardを有効にしてください。アプリ内の初回ヘルプとSettingsからも同じ手順を確認できます。

GitHub Releasesでは、Windowsインストーラーと、x86_64 Linux向けのDEB、RPM、AppImage、Arch Linuxパッケージ（`.pkg.tar.zst`）を配布します。ArchパッケージはCachyOSなどのArch系ディストリビューションで`sudo pacman -U <パッケージファイル>`を使ってインストールできます。

透過、ぼかし、常に最前面、タスクトレイ、自動起動などの挙動は、OS、ウィンドウシステム、コンポジターによって異なる場合があります。こうした差異はWindowsだけを唯一の基準とせず、影響を受ける環境ごとに評価します。macOSは現在のビルドマトリクスおよび対応プラットフォームには含まれていません。

## ローカルファースト

TODO、アイデア、ショートカット、設定はローカル環境に保存されます。ネットワーク速度は端末上で測定します。Pingはバックグラウンドで定期実行せず、ユーザーが操作したときのみOSのPingコマンドを使用します。

## 技術構成

- [Tauri 2](https://tauri.app/)
- React 19、TypeScript
- Rust、[`sysinfo`](https://crates.io/crates/sysinfo)
- [`tauri-plugin-store`](https://v2.tauri.app/plugin/store/)
- CodeMirror 6

## 関連リンク

- [コントリビューションガイド](CONTRIBUTE-ja.md)
- [CI・リリースビルド](docs/ci.md)
- [ロードマップ](docs/roadmap.md)
