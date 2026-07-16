# Settings

TitleBarの歯車アイコンを押すとSettingsが開きます。項目が画面に収まらない場合は、パネル内を上下にスクロールできます。

## System

### Update interval

CPU、RAM、ネットワーク情報を取得する間隔を秒単位で指定します。最小値は`0.1`秒です。短くするほど表示は細かく更新されますが、更新回数も増えます。

## Network

### Ping target

手動Pingの測定先となるホスト名またはIPアドレスを指定します。

## Shortcuts

最大6件のショートカットについて、Label、Type、Icon、Targetを編集します。詳しくは「Shortcuts」を参照してください。

## Application

### Launch at startup

有効にすると、OSへサインインしたときにpure_boardを起動します。Linuxではデスクトップ環境によって自動起動の挙動が異なる場合があります。

### Close button behavior

- **Ask every time**: 閉じるたびに終了方法を確認します。
- **Minimize to tray**: ウィンドウを隠し、タスクトレイで動作を続けます。
- **Exit app**: アプリを完全に終了します。

確認画面の「選択を記憶」を有効にして選択した場合も、次回からその動作が使われます。
