# Live ASMR Studio privacy policy

Last updated: 2026-08-17

Live ASMR Studio captures audio only from the tab selected when the user clicks the extension toolbar icon. The audio is processed in real time with Web Audio inside the browser.

- Tab audio is not recorded, stored, sold, or sent to an extension-operated server.
- Microphone audio is not captured.
- The extension has no advertising, analytics, or tracking identifiers.
- Bundled HRTF data and translation dictionaries are used locally. The extension makes no external data request for audio processing.
- Capture stops when the source ends, the tab closes, another tab is selected, or the user presses Stop.

Volume, position, motion, ambience, session choices, edited prompts, language choice, and imported text are stored in `chrome.storage.local`. This data stays in the browser profile. Exported settings JSON is controlled by the user. Resetting settings or removing the extension deletes the extension's local browser data, subject to the browser's normal behavior.

Permissions are used as follows:

- `activeTab`, `tabCapture`: capture audio from the tab chosen by a direct toolbar click
- `offscreen`, `sidePanel`: keep local audio processing active while the side panel is not focused
- `storage`: save settings in the browser profile
- `clipboardWrite`: copy a generated session prompt when the user presses Copy

The extension does not use host permissions.

## 日本語

Live ASMR Studioは、利用者がツールバーの拡張機能アイコンを押して選んだタブの音声だけを取得し、ブラウザ内のWeb Audioでリアルタイム処理します。

- タブ音声を録音、保存、販売、外部サーバーへの送信はしません。
- マイク音声は取得しません。
- 広告、利用状況分析、追跡用識別子は使いません。
- HRTFデータと翻訳辞書は同梱し、音声処理のための外部データ取得は行いません。
- 音声終了、タブを閉じる、別タブを選ぶ、停止ボタンを押す場合に取得を終了します。

音量、位置、動き、環境音、セッション選択、編集したプロンプト、表示言語、持ち込み文章は `chrome.storage.local` に保存します。設定JSONを書き出した場合、そのファイルは利用者が管理します。設定の初期化または拡張機能の削除により、ブラウザの通常動作に従ってローカルデータを削除できます。

この拡張機能はホスト権限を使いません。
