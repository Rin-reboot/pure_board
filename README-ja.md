# pure_board

Windows 11向けの、軽量なガラス風デスクトップダッシュボードです。

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
- ウィジェットの並び替えと表示切り替え
- 終了時の動作設定

## 対象環境

pure_boardはWindows 11を主な対象として設計されています。Linuxも開発環境として利用できますが、透過、ぼかし、常に最前面に表示する機能などのデスクトップ挙動は、コンポジターによって異なる場合があります。

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
- [ロードマップ](docs/roadmap.md)
