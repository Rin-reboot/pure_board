# pure_boardへのコントリビューション

[English](CONTRIBUTE.md)

pure_boardへのコントリビューションに関心をお寄せいただき、ありがとうございます。バグ報告、機能提案、ドキュメント改善、コードの変更を歓迎します。

pure_boardはWindowsを主な対象とするTauriアプリです。変更は小さく、一つの目的に絞り、既存の設計に沿ったものにしてください。

## はじめに

- 新しいIssueを作る前に、同様のIssueがないか確認してください。
- バグを見つけた場合や機能を提案したい場合は、Issueを作成してください。
- 小さく明確な修正であれば、直接Pull Requestを作成しても構いません。
- 大きな変更の場合は、方針と範囲を相談できるよう、先にIssueを作成してください。

バグを報告する際は、OS、再現手順、期待する動作、実際の動作を記載し、必要に応じてスクリーンショットやログを添付してください。デスクトップ挙動についてはWindows 11を基準とします。

## 開発環境の構築

次のツールをインストールしてください。

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/ja/tools/install)
- 使用するOS向けの[Tauri前提パッケージ](https://v2.tauri.app/start/prerequisites/)

リポジトリをクローンし、依存関係をインストールします。

```bash
git clone git@github.com:Rin-reboot/pure_board.git
cd pure_board
pnpm install
```

`pnpm install`を実行すると、リポジトリで使用するLefthookのGitフックもインストールされます。

開発モードでデスクトップアプリを起動します。

```bash
pnpm tauri dev
```

## 検証

Pull Requestを作成する前に、変更に関連するチェックを実行してください。

フロントエンド：

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Rust：

```bash
cd src-tauri
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
```

透過、ぼかし、常に最前面、タスクトレイ、自動起動などのデスクトップ連携機能は、Windows 11の動作を基準とします。Linuxも開発環境として利用できますが、コンポジターによる違いをWindowsで確認せずにアプリの不具合として扱わないでください。

## Pull Request

- 最新のデフォルトブランチから作業ブランチを作成してください。
- 一つのPull Requestは一つの変更に絞ってください。
- 無関係なリファクタリングやフォーマット変更を含めないでください。
- 動作を変更する場合は、必要に応じてテストを追加・更新してください。
- ユーザーに見える動作を変更する場合は、ドキュメントも更新してください。
- 変更内容、変更理由、検証方法を説明してください。
- 永続化されたユーザーデータとの後方互換性を、可能な限り維持してください。

## 開発ドキュメント

- [`AGENTS.md`](AGENTS.md)：AIコーディングエージェント向けのリポジトリルール
- [`docs/architecture.md`](docs/architecture.md)：アプリのアーキテクチャ
- [`docs/development.md`](docs/development.md)：コーディング・開発規約
- [`docs/windows.md`](docs/windows.md)：プラットフォーム固有の挙動
- [`docs/roadmap.md`](docs/roadmap.md)：計画・提案されている機能
