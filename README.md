# 梁強度計算WEB

Excel v9「コの字2追加版」をブラウザ用に移植した、梁強度計算用の静的WEBページです。

公開URL:

```text
https://sa-ban777.github.io/beam-strength/
```

## 概要

このWEBアプリは、mm・N・N/mm²系で梁の断面性能、曲げ応力、安全率、たわみ、自重を計算します。

主な操作は画面上で完結します。

- 断面形状・形鋼サイズの選択
- 断面イメージ上での寸法入力
- 支持方法画像クリックによる支持・荷重ケース選択
- X方向 / Y方向荷重ボタンによる断面方向切替
- 入力値異常チェック
- 重要結果の上部固定表示
- A4 1枚向け印刷 / PDF保存
- CSV保存
- 入力JSON保存 / 読込

## 使い方

1. `index.html` をブラウザで開きます。
2. 「断面形状」「形鋼種類」「形鋼サイズ」から断面を選びます。
3. 寸法は断面イメージ上の「寸法調整」パネルで入力します。
4. 支持・荷重ケースは支持方法画像をクリックして選択します。
5. X方向 / Y方向荷重は断面イメージ上のボタンで選択します。
6. 材料、梁長さ、荷重、許容たわみなどを入力します。
7. 計算結果、断面イメージ、支持方法図、計算式メモ、モーメント図が自動更新されます。
8. 「印刷 / PDF」でA4 1枚向けの計算書を出力できます。
9. 「入力JSON保存」で条件を保存し、「入力JSON読込」で復元できます。

## 画面構成

- 上部操作バー
  - 印刷 / PDF
  - CSV保存
  - 入力JSON保存
  - 入力JSON読込
  - 上下表示
  - 初期値に戻す
- 入力項目
  - 計算箇所
  - 断面形状 / 形鋼種類 / 形鋼サイズ
  - 材料
  - ヤング率
  - 密度
  - 降伏 / 耐力
  - 許容たわみ L/n
  - 梁長さ L
  - 集中荷重 P
  - 等分布荷重 w
  - 重力加速度
- 上部固定の重要結果バー
  - 総合判定
  - 安全率
  - 最大たわみ
  - 最大応力
  - 許容たわみ
- 計算結果
- 断面イメージ / 支持方法
- 計算式メモ
- 簡易モーメント図

## 対応断面

### 断面形状

- L字
- コの字
- コの字2
- I(H)形
- 長方形
- 丸棒

### JIS形鋼

`JIS_06_JIS G 3192：2014_熱間圧延形鋼.xlsx` を元に追加したJIS G 3192:2014の形鋼DBを使用します。

対応種類:

- 等辺山形鋼
- 不等辺山形鋼
- 不等辺不等厚山形鋼
- I形鋼
- 溝形鋼
- H形鋼

## 単位

- 長さ: mm
- 荷重: N
- 等分布荷重: N/mm
- 応力: N/mm²
- 断面積: mm²
- 断面二次モーメント: mm⁴
- 断面係数: mm³
- 密度: kg/m³
- 質量: kg

## 計算内容

主な計算項目:

- 断面積 A
- 重心位置
- 断面二次モーメント I
- 断面係数 Z
- 自重等分布荷重
- 合計等分布荷重
- 最大曲げモーメント
- 最大曲げ応力
- 安全率
- 外力たわみ
- 自重たわみ
- 合計たわみ
- 許容たわみ
- 概算質量

対応荷重ケース:

- 両端支持・中央集中荷重
- 両端支持・等分布荷重
- 片持ち・先端集中荷重
- 片持ち・等分布荷重
- 両端固定・中央集中荷重
- 両端固定・等分布荷重

## 入力チェック

入力値に異常がある場合、入力確認メッセージを表示し、計算結果を参考値扱いにします。

代表的なチェック:

- `B <= 0`
- `H <= 0`
- `D <= 0`
- `t1 <= 0`
- `t2 <= 0`
- `t1 > H`
- `t2 > B`
- I/H形で `2 × t1 >= H`
- コの字で `t1 >= H`
- 梁長さ `L <= 0`
- ヤング率 `E <= 0`
- 密度 `<= 0`
- 降伏 / 耐力 `<= 0`
- 許容たわみ `L/n <= 0`
- 集中荷重ケースで `P <= 0`
- 等分布荷重ケースで `w <= 0`
- 断面積 A が 0 または計算不能
- 断面二次モーメント I が 0 または計算不能
- 断面係数 Z が 0 または計算不能
- 応力またはたわみが計算不能

## JSON保存 / 読込

`入力JSON保存` で現在の入力条件を保存します。

保存対象例:

- 計算箇所 `calcLocation`
- 保存日時 `savedAt`
- 断面形状 / 形鋼
- 材料
- ヤング率
- 密度
- 降伏 / 耐力
- 支持・荷重ケース
- 断面方向
- 梁長さ
- 荷重
- 寸法
- 重力加速度

`入力JSON読込` で保存したJSONを読み込むと、入力値を復元し、自動で再計算します。

読込後、下記を確認メッセージとして表示します。

- 読込ファイル名
- 保存日時
- 計算箇所
- 材料
- 支持条件

## 印刷 / PDF

印刷時はA4縦1枚に収まりやすい専用レイアウトを使用します。

印刷レイアウトでは下記を圧縮表示します。

- 計算箇所
- 入力条件
- 重要結果
- 計算結果
- 断面イメージ
- 支持方法
- 計算式メモ
- 簡易モーメント図

通常画面用の操作ボタンや不要な装飾は印刷時に非表示になります。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | 画面本体、各JS/CSSの読み込み |
| `style.css` | 基本デザイン、PC向けレイアウト |
| `mobile-compact.css` | タブレット・スマホ向けレイアウト調整 |
| `data.js` | 材料DB、荷重ケースDB、初期値、元形鋼DB |
| `app.js` | 基本計算、断面計算、描画、CSV/JSON保存の元処理 |
| `jis-shapes.js` | JIS G 3192:2014 形鋼DB追加 |
| `channel-orientation.js` | 溝形鋼の断面表示向き補正 |
| `shape-presets.js` | 断面形状プリセット追加、断面形状の初期値設定 |
| `jis-shape-ui.js` | 断面形状 / 形鋼種類 / 形鋼サイズのUI追加 |
| `section-mode-utils.js` | 断面形状・形鋼判定の共通関数 |
| `ss400-section-fixes.js` | SS400降伏点補正、寸法線補正、入力step/ホイール調整 |
| `axis-load-arrow.js` | 断面イメージ上の荷重方向矢印描画 |
| `support-chart-click.js` | 支持方法図クリックによる荷重ケース切替 |
| `accurate-bmd.js` | ケース別の曲げモーメント図描画 |
| `section-dim-controls.js` | 断面イメージ上の寸法入力パネル |
| `section-axis-toggle.js` | X方向 / Y方向荷重ボタン |
| `section-thickness-link.js` | t1/t2連動チェック、断面形状時の初期板厚とSPCC設定 |
| `input-guards-summary.js` | 入力チェック、不要入力非表示、現在条件まとめ |
| `result-summary-guard.js` | 重要結果固定バー、異常入力時の参考値表示 |
| `json-import.js` | 入力JSON読込、読込後メッセージ |
| `print-report.js` | 計算箇所入力、JSON保存拡張、A4印刷専用CSS |
| `.nojekyll` | GitHub Pages用 |

## スクリプト読み込み順

`index.html` では下記順で読み込みます。順序依存があるため、原則この順序を維持してください。

```html
<script src="data.js"></script>
<script src="jis-shapes.js"></script>
<script src="channel-orientation.js"></script>
<script src="app.js"></script>
<script src="shape-presets.js"></script>
<script src="jis-shape-ui.js"></script>
<script src="section-mode-utils.js"></script>
<script src="ss400-section-fixes.js"></script>
<script src="axis-load-arrow.js"></script>
<script src="support-chart-click.js"></script>
<script src="accurate-bmd.js"></script>
<script src="section-dim-controls.js"></script>
<script src="section-axis-toggle.js"></script>
<script src="section-thickness-link.js"></script>
<script src="input-guards-summary.js"></script>
<script src="result-summary-guard.js"></script>
<script src="json-import.js"></script>
<script src="print-report.js"></script>
```

## 重要な内部仕様

### `shapePreset`

画面上では「形鋼or断面形状」の元プルダウンは非表示ですが、内部連動用として残しています。

現在の表側UIは以下です。

- 断面形状
- 形鋼種類
- 形鋼サイズ

`jis-shape-ui.js` がこれらのUIを作成し、最終的に内部の `shapePreset` へ値を反映します。

### 断面形状 / 形鋼の判定

共通判定は `section-mode-utils.js` の下記関数を使います。

```js
BeamSectionMode.getMode();       // 'manual' または 'steel'
BeamSectionMode.isSteel();       // 形鋼なら true
BeamSectionMode.isManual();      // 断面形状なら true
BeamSectionMode.getSectionType();// 現在の sectionType
```

新規JSを追加する場合は、独自に `jisShapeMode` や `shapePreset` を直接判定せず、上記関数を使うことを推奨します。

### 寸法入力

入力項目から `D / B / H / t1 / t2` は非表示です。

寸法は `section-dim-controls.js` が作成する断面イメージ上の寸法調整パネルで入力します。

### 支持方法と断面方向

- 支持・荷重ケースのプルダウンは非表示です。
- 支持方法は支持方法画像クリックで切り替えます。
- X方向 / Y方向のプルダウンは非表示です。
- X方向 / Y方向は断面イメージ上のボタンで切り替えます。

### 材料

断面形状を選択した場合、`section-thickness-link.js` により材料は初期的に `SPCC` へ切り替わります。
その後、ユーザーが手動で材料を変更できます。

### SS400降伏点

`ss400-section-fixes.js` により、SS400は板厚に応じて降伏点を自動補正します。

- `t <= 16`: 245 N/mm²
- `t <= 40`: 235 N/mm²
- `t > 40`: 225 N/mm²

## 注意事項

本ページはアップロードされたExcelの簡易計算ロジックをブラウザ用に移植したものです。

下記は未考慮です。

- 穴あき
- 溶接部強度
- 局部座屈
- 横座屈
- 応力集中
- 疲労
- せん断変形
- 動荷重
- 支点詳細条件
- 製作誤差

正式運用前に、既存Excel・社内基準・実機条件で照合してください。

## GitHub Pagesで公開する場合

GitHubのリポジトリ画面で以下を設定してください。

1. `Settings`
2. `Pages`
3. `Build and deployment`
4. `Source`: `Deploy from a branch`
5. `Branch`: `main`
6. `Folder`: `/ root`
7. `Save`

数分後、以下のURLで開けます。

```text
https://sa-ban777.github.io/beam-strength/
```
