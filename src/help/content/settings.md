# Settings

TitleBarの歯車アイコンを押すとSettingsが開きます。項目が画面に収まらない場合は、パネル内を上下にスクロールできます。

## System

### Update interval

CPU、RAM、ネットワーク情報を取得する間隔を秒単位で指定します。最小値は`0.1`秒です。短くするほど表示は細かく更新されますが、更新回数も増えます。

## Network

### Ping target

手動Pingの測定先となるホスト名またはIPアドレスを指定します。

## Taskbar status

### Show mini graph

Windows 11の通知領域に表示するミニグラフを有効または無効にします。初期値は有効です。Windows側で常に表示する方法は、Settings内の **How to keep the icon visible in Windows 11** またはヘルプの「タスクバー表示」を参照してください。

### Metric

ミニグラフへ表示する値を`CPU`、`RAM`、`Network`から選びます。

### Update interval

ミニグラフの更新間隔を`1`～`60`秒の範囲で、1秒単位で指定します。バッテリー駆動中またはOSの「視覚効果を減らす」が有効な場合、グラフは静止します。

## Shortcuts

最大6件のショートカットについて、Label、Type、Icon、Targetを編集します。詳しくは「Shortcuts」を参照してください。

## Application

### Launch at startup

有効にすると、Windowsへサインインしたときにpure_boardを起動します。

### Close button behavior

- **Ask every time**: 閉じるたびに終了方法を確認します。
- **Minimize to tray**: ウィンドウを隠し、タスクトレイで動作を続けます。
- **Exit app**: アプリを完全に終了します。

確認画面の「選択を記憶」を有効にして選択した場合も、次回からその動作が使われます。
