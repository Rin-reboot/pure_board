# Shortcuts

よく使うURL、ファイル、フォルダ、アプリを最大6件まで登録できます。

## 登録する

TitleBarのSettingsを開き、**Shortcuts** の空いているSlotを編集します。

- **Label**: ボタンに表示する名前
- **Type**: 開く対象の種類
- **Icon**: ボタンに表示するアイコン。実行内容には影響しません
- **Target**: 実際に開くURLまたはパス

Targetが空のSlotはショートカット画面に表示されません。**Remove**を押すと登録を削除できます。

## TypeとTarget

### URL

既定のブラウザでWebページを開きます。`http://`または`https://`から始まるURLを入力します。

例: `https://github.com/`

### File

ファイルは既定のアプリ、フォルダはOSの既定のファイルマネージャーで開きます。使用中のOSで対象を特定できるフルパスを入力します。

例: Windowsでは`C:\Users\User\Documents\notes.txt`、Linuxでは`/home/user/Documents/notes.txt`

### App

指定したアプリケーションを起動します。使用中のOSにある実行ファイルのフルパスを入力します。コマンドライン引数や任意のシェルコマンドは指定できません。

例: Windowsでは`C:\Windows\System32\notepad.exe`、Linuxでは`/usr/bin/konsole`

## 実行する

Footerのクリップボードアイコンを押し、表示されたボタンを選択します。実行できなかった場合はボタンに「失敗」と表示され、マウスポインターを合わせるとエラー内容を確認できます。
