# VF高西 X Draft Assistant

GitHub Actions から毎日3回、X下書きをLINEへ送る最小構成です。

## 送信時間

- 朝用: 06:45 JST
- 昼用: 11:30 JST
- 夕方用: 17:30 JST

## 必要な Secrets

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_USER_ID`

## 手動テスト

GitHub Actions の `LINE Draft Delivery` を開いて `Run workflow` を押し、`morning / noon / evening` を選んで実行します。
