# AI_REBUILD_NOTES.md

このファイルは、AIまたは開発者が最悪の場合に現在の梁強度計算WEBを一から再構成するための引継ぎメモです。

通常利用者向けの説明は `README.md` を参照してください。

## 最重要方針

このアプリは、Excel v9「コの字2追加版」を静的HTML/JS/CSSへ移植したものです。

- サーバー処理なし
- ビルド処理なし
- 外部ライブラリなし
- GitHub Pagesでそのまま公開
- すべて `/` 直下のファイルで構成
- `index.html` が読み込み順を制御

壊れた場合、まず `index.html` の script 読み込み順を確認してください。

## 現在の中核構成

### 1. 基本データ

`data.js`

- `window.BEAM_XLSM_DATA` を定義する。
- 内容:
  - `materials`
  - `loadCases`
  - `shapes`
  - `defaults`
- `defaults.uniformLoadW` は `0`。
- 元のExcel形鋼DBもここに含まれる。

### 2. JIS形鋼DB追加

`jis-shapes.js`

- `window.BEAM_XLSM_DATA.shapes` に JIS G 3192:2014 の形鋼を追加する。
- 各追加形鋼には `source: 'JIS G 3192:2014'` が付く。
- 形鋼種類:
  - 等辺山形鋼
  - 不等辺山形鋼
  - 不等辺不等厚山形鋼
  - I形鋼
  - 溝形鋼
  - H形鋼

### 3. 溝形鋼向き補正

`channel-orientation.js`

- `jis-shapes.js` の後、`app.js` の前に読み込む。
- 溝形鋼の `sectionType` を `コの字2` へ補正し、断面イメージを横向きC形相当にする。

### 4. 基本計算

`app.js`

主なグローバル関数:

- `populate()`
- `init()`
- `inputs()`
- `sectionManual(i)`
- `section(i)`
- `calc()`
- `render()`
- `drawSection(i, sec)`
- `drawSupportCaseChart(active)`
- `drawMoment(r)`
- `saveCsv()`
- `saveJson()`
- `download(name, content, type)`
- `bind()`

`app.js` は基礎計算と描画の本体。
後続JSは多くが `render()` や描画関数をラップ/上書きする。

## 読み込み順

`index.html` の末尾で下記順に読み込む。

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

順序変更は不具合要因になる。
特に以下は重要。

- `jis-shapes.js` は `app.js` より前
- `channel-orientation.js` は `jis-shapes.js` の後、`app.js` の前
- `section-mode-utils.js` は `jis-shape-ui.js` の後、各補助JSの前
- `accurate-bmd.js` は `app.js` の後
- `input-guards-summary.js` は入力UI生成後
- `print-report.js` は最後付近

## UIの実態

### 内部用 `shapePreset`

`index.html` には元の `shapePreset` select が存在する。
ただし画面では非表示。

理由:

- `app.js` が `shapePreset` を基準に形鋼/断面を取得するため。
- `jis-shape-ui.js` が表側UIの選択を `shapePreset` に同期しているため。

削除すると既存計算が壊れる可能性が高い。

### 表側の断面選択UI

`jis-shape-ui.js` が以下を作る。

- `jisShapeMode`
  - 断面形状または `__steel__`
- `jisSteelKind`
  - 形鋼種類
- `jisSteelSize`
  - 形鋼サイズ

断面形状選択時は `jisSteelKind` / `jisSteelSize` を無効化する。
形鋼選択時は `shapePreset` に形鋼名を入れる。

## 断面形状 / 形鋼判定

`section-mode-utils.js` を使用する。

```js
BeamSectionMode.getMode();       // 'manual' or 'steel'
BeamSectionMode.isSteel();       // true / false
BeamSectionMode.isManual();      // true / false
BeamSectionMode.getSectionType();// sectionType value
```

新規JSでは独自に `jisShapeMode` や `shapePreset` を直接判定しない。

## 各補助JSの役割

### `shape-presets.js`

- `shapePreset` に断面形状プリセットを追加する。
- プリセット:
  - `断面形状_L字`
  - `断面形状_コの字`
  - `断面形状_凹の字`
  - `断面形状_I(H)形`
  - `断面形状_円`
  - `断面形状_長方形`
- 断面形状プリセットの t1/t2 初期値は `3.2`。
- 型鋼は `型鋼_` prefix 付き表示へ変更する。

### `ss400-section-fixes.js`

- SS400降伏点を板厚で自動補正。
- 入力欄の step を設定。
- 入力欄や select のマウスホイール操作を有効化。
- L字寸法線表示などを補正。
- `putMaterial()` をラップ/上書き。

SS400降伏点:

- `t <= 16`: 245
- `t <= 40`: 235
- `t > 40`: 225

### `axis-load-arrow.js`

- `drawSection()` をラップし、断面イメージに荷重方向矢印を追加。
- X/Y方向の文字ラベルは現在表示しない。
- 矢印のみ表示。

### `support-chart-click.js`

- 支持方法キャンバスをクリック可能にする。
- クリック位置から下記6ケースを選択。
  - 両端支持・中央集中荷重
  - 両端支持・等分布荷重
  - 片持ち・先端集中荷重
  - 片持ち・等分布荷重
  - 両端固定・中央集中荷重
  - 両端固定・等分布荷重
- 選択結果は内部の `loadCase` select に同期する。

### `accurate-bmd.js`

- `drawMoment()` を上書きする。
- ケースごとの曲げモーメント図を描く。
- 等分布荷重矢印は、等分布ケースかつ `w > 0` のときだけ表示。
- 自重のみでは全体荷重矢印を表示しない。

### `section-dim-controls.js`

- 断面イメージ上に「寸法調整」パネルを重ねる。
- 入力項目から寸法欄を消しているため、寸法変更はここが主操作。
- 丸棒: D
- 長方形: B/H
- L字、コの字、コの字2、I/H形: B/H/t1/t2
- 形鋼はDB値固定で入力無効。
- ホイール操作あり。

### `section-axis-toggle.js`

- 断面イメージ上に X方向荷重 / Y方向荷重ボタンを作る。
- 選択状態は青塗り。
- 内部の `axis` select に同期する。

### `section-thickness-link.js`

- `t1/t2連動` チェックを生成する。
- ただし現在は入力項目から非表示。
- 断面形状時は t1/t2 初期値を `3.2` にする。
- 断面形状選択時に材料を `SPCC` へ切り替える。
- 形鋼時は無効。

注意:

- ユーザーが材料を手動変更した後でも、断面形状イベントでSPCCへ戻る可能性がある。
- 将来改善するなら「断面形状へ切替した瞬間だけSPCC」に制限する。

### `input-guards-summary.js`

- 現在条件まとめを1行表示。
- 不要入力欄を非表示。
  - `shapePreset`
  - `loadCase`
  - `axis`
  - `D/B/H/t1/t2`
  - `t1/t2連動`
- 入力異常チェックを行う。
- 異常時は `inputWarningPanel` を表示し、該当入力を赤枠にする。

チェック項目:

- L <= 0
- E <= 0
- density <= 0
- yield <= 0
- L/n <= 0
- g <= 0
- 集中ケースで P <= 0
- 等分布ケースで w <= 0
- 丸棒D <= 0
- B/H <= 0
- t1/t2 <= 0
- t1 > H
- t2 > B
- I/H形で 2*t1 >= H
- コの字で t1 >= H
- A/I/Z <= 0 または NaN
- 応力/たわみ NaN

### `result-summary-guard.js`

- 上部固定の重要結果バーを作成。
- 表示項目:
  - 総合判定
  - 安全率
  - 最大たわみ
  - 最大応力
  - 許容たわみ
- 異常入力時は結果を「参考値」として表示。
- 計算結果欄を薄くし、参考値バナーを表示。

### `json-import.js`

- `入力JSON読込` ボタンを追加。
- JSONファイルを読み込み、入力条件を復元する。
- 保存JSONの互換性を少し持たせるため、複数キー名を許容する。
- 読込後に再計算する。
- 読込後ステータスを表示。

復元対象:

- 断面形状/形鋼
- 材料
- E
- 密度
- 降伏/耐力
- 支持・荷重ケース
- X/Y方向
- L
- P
- w
- L/n
- D/B/H/t1/t2
- 重力加速度
- 計算箇所

### `print-report.js`

- `計算箇所` 入力欄を追加。
- JSON保存に `calcLocation` と `savedAt` を追加するため、`jsonBtn` の click を capture で横取りする。
- A4縦1枚用の `@media print` CSS を追加する。
- 印刷時は操作ボタン非表示。
- 計算結果、断面イメージ、支持方法、計算式メモ、モーメント図を圧縮配置。

## CSS構成

### `style.css`

基本デザイン、PC画面、元レスポンシブ指定。

### `mobile-compact.css`

後読み込みで上書きするスマホ/タブレット用CSS。

現在は `!important` が多い。
大規模整理するなら、将来 `style.css` 側に統合した方がよい。

主なブレークポイント:

- `max-width:1600px`
- `max-width:1180px`
- `max-width:640px`
- `max-width:390px`

## 印刷仕様

`print-report.js` 内の `@media print` が印刷専用。

方針:

- A4 portrait
- 余白 7mm
- 1ページに収まるよう文字と余白を圧縮
- `.page` を grid に変更
- 重要結果バーを先頭表示
- visual-card は断面イメージと支持方法を横並び
- formula と moment は下段に横並び

印刷が2ページに分かれる場合は、下記を調整する。

- `@page` margin
- canvas height
- `.formula` height/font-size
- `.result-grid > div` min-height
- body font-size

## JSON保存仕様

基本の `app.js` に `saveJson()` があるが、現在は `print-report.js` が `jsonBtn` click を capture で横取りして拡張保存している。

保存JSON例:

```json
{
  "manual": true,
  "sectionType": "L字",
  "materialName": "SPCC",
  "E": 205000,
  "density": 7850,
  "yieldStress": 205,
  "axis": "X方向",
  "L": 1000,
  "P": 500,
  "w": 0,
  "n": 300,
  "D": 0,
  "B": 50,
  "H": 50,
  "t1": 3.2,
  "t2": 3.2,
  "g": 9.80665,
  "loadCase": "両端支持・中央集中荷重",
  "calcLocation": "盤内補強材",
  "savedAt": "2026-xx-xxTxx:xx:xx.xxxZ"
}
```

## 復旧手順

最悪の場合、以下の順に復旧する。

1. `index.html` を作る。
2. `style.css` と `mobile-compact.css` を読み込む。
3. 画面に最低限以下のIDを持つ要素を作る。
   - `shapePreset`
   - `material`
   - `youngModulus`
   - `densityInput`
   - `yieldStressInput`
   - `loadCase`
   - `axis`
   - `deflectionRatio`
   - `spanL`
   - `pointLoadP`
   - `uniformLoadW`
   - `gravity`
   - `diameterD`
   - `B`
   - `H`
   - `t1`
   - `t2`
   - `sectionType`
   - `shapeCheckBadge`
   - `overallBadge`
   - `rArea`
   - `rCentroid`
   - `rI`
   - `rZ`
   - `rUsedLoad`
   - `rUsedLoadUnit`
   - `rSelfW`
   - `rTotalW`
   - `rM`
   - `rStress`
   - `rSafety`
   - `rDefLoad`
   - `rDefSelf`
   - `rDefTotal`
   - `rDefAllow`
   - `rMass`
   - `rE`
   - `rDensity`
   - `rYield`
   - `stressJudge`
   - `deflectionJudge`
   - `sectionCanvas`
   - `supportCaseCanvas`
   - `momentCanvas`
   - `formulaMemo`
   - `printBtn`
   - `csvBtn`
   - `jsonBtn`
   - `layoutBtn`
   - `resetBtn`
4. `data.js` を置く。
5. `app.js` を置き、最低限の計算と描画が動くようにする。
6. JIS形鋼が必要なら `jis-shapes.js` を追加する。
7. `index.html` の読み込み順を本メモ通りに戻す。
8. 表示確認後、各補助JSを1つずつ有効化する。

## 既知の注意点

- `shapePreset` は非表示でも削除しない。
- `loadCase` と `axis` は非表示でも削除しない。
- `D/B/H/t1/t2` は非表示でも削除しない。
- 補助JSは内部input/selectへ同期する前提で作られている。
- 複数JSが `render()` をラップしている。読み込み順が重要。
- 大規模修正時は、1ファイルずつ反映して画面確認すること。
- `app.js` の全置換はリスクが高い。可能なら補助JS追加で対応する。
- スマホCSSは `mobile-compact.css` に `!important` が多い。意図せず上書きされる場合は読み込み順と詳細度を確認する。

## 今後の改善候補

- CSSを整理し、`!important` を減らす。
- `app.js` をモジュール分割する。
- `shapePreset` 依存を段階的に減らす。
- t1/t2連動のSPCC自動切替を「断面形状へ切替した瞬間だけ」にする。
- 形鋼サイズ検索を追加する。
- 判定NG理由をより詳細に表示する。
- 印刷レイアウトを実機で微調整する。
