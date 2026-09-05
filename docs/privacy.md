# Privacy policy

Last updated: 2026-09-06

Live ASMR Studio captures audio only from the tab selected when the user clicks the extension toolbar icon. It processes the audio in real time with Web Audio inside the browser.

## Data handling

- Tab audio is not recorded, stored, sold, or sent to an extension-operated server.
- Microphone audio is not captured.
- There are no ads, analytics, tracking identifiers, or remote code.
- The measured HRTF data and translation dictionaries are bundled with the extension.
- Capture stops when the captured track ends, the source tab closes, a new source is captured by a toolbar click, or the user presses Stop. Merely switching tabs does not stop it.

Volume, position, motion, ambience, session choices, edited prompts, language choice, and imported text are stored in `chrome.storage.local`. This data stays in the browser profile. Exported settings JSON is controlled by the user. Reset clears audio and prompt settings but retains the display language and high-gain acknowledgement. Uninstalling removes the extension's local data under the browser's normal behavior. Neither operation deletes previously exported files.

## Permissions

- `activeTab`, `tabCapture`: capture audio from the tab chosen by a direct toolbar click
- `offscreen`, `sidePanel`: keep local audio processing active while the side panel is not focused
- `storage`: save settings in the browser profile
- `clipboardWrite`: copy a generated session prompt when the user presses Copy

The extension does not use host permissions.

## Changes

Material changes to this policy will be published in this file and identified by a new update date.

## 日本語

最終更新日: 2026-09-06

Live ASMR Studioは、利用者がツールバーの拡張機能アイコンを押して選んだタブの音声だけを取得し、ブラウザ内のWeb Audioでリアルタイム処理します。

- タブ音声を録音、保存、販売、外部サーバーへの送信はしません。
- マイク音声は取得しません。
- 広告、利用状況分析、追跡用識別子、リモートコードは使いません。
- 実測HRTFデータと翻訳辞書は拡張機能に同梱します。
- 取得中の音声トラックの終了、対象タブを閉じる、アイコン操作で新しいタブの音声を取得する、停止ボタンを押す場合に取得を終了します。タブの表示を切り替えるだけでは停止しません。

音量、位置、動き、環境音、セッション選択、編集したプロンプト、表示言語、持ち込み文章は `chrome.storage.local` に保存します。このデータはブラウザのプロファイル内に残ります。設定JSONを書き出した場合、そのファイルは利用者が管理します。設定の初期化は音声・プロンプト設定を削除しますが、表示言語と高音量の確認済み状態は維持します。拡張機能を削除すると、ブラウザの通常動作に従ってローカルデータを削除します。どちらの操作でも、以前に書き出したファイルは削除しません。

この拡張機能はホスト権限を使いません。ポリシーに大きな変更がある場合は、このページの更新日を変更して公開します。
