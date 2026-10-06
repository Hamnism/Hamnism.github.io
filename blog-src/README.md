# Lichen Blog (blog-src)

`https://hamnism.com/lichen/blog/` の元データ。Hugoで組んでいて、`main` にpushするとGitHub Actions (`.github/workflows/pages.yml`) がビルドして公開する。手でHTMLを書く必要はない。

## 記事の置き場所

1記事 = 1フォルダ。画像も同じフォルダに入れる。

```
blog-src/content/
  guide/<slug>/index.md      機能ガイド (F01〜)
  story/<slug>/index.md      その他 (M00, M03〜)
  release/<version>/index.md アップデート (バージョンごとに1記事。新しいビルドは ## を上に追記)
  <slug>/index.md            固定ページ (M01 ライケンとは？ / M02 専ブラとは？)
```

`<slug>` は半角英小文字とハイフン (例: `why-lichen`)。公開URLは `/lichen/blog/guide/<slug>/`・`/lichen/blog/story/<slug>/`・`/lichen/blog/<slug>/`。公開後は変えない。

## front matter

```yaml
---
title: "Lichenを作った理由と開発者のはなし"   # 記事タイトル (本文に # 見出しは書かない)
date: 2026-10-04T12:00:00+09:00              # 公開日。未来の日時にすると、その日以降のビルドまで出ない
id: M00                                      # content_map.md の番号。機能ガイドはこの順に並ぶ
slug: why-lichen                             # フォルダ名と同じにする
description: "一覧とSNSカードに出る1〜2文。"
step: 1                                      # 機能ガイドだけ必須: 1 / 2 / 3
closing: 2                                   # 末尾の定型文: 1=使い方・機能 / 2=その他 (開発のはなしなど)
cover: cover.jpg                             # 任意。記事フォルダ内の文字なしの見出し画像。記事冒頭に出す (ogimage が無ければ一覧・SNSカードにも)
ogimage: og.png                              # 任意。タイトル入りの画像 (1200x630)。一覧のサムネとSNSカードに、切り抜かずそのまま使う
short: "作った理由"                           # 任意。もくじ用の短い題
related: [F01, F05]                          # 任意。「関連する記事」に出す記事のid (下の「記事どうしのリンク」)
author: "Hamnism"                            # 任意。省くとHamnism
toc: false                                   # 任意。タイトル下のもくじを出さない
draft: true                                  # 書きかけ / 未リリース機能 (⏳) は付けておく → 公開されない
---
```

## 本文の書き方

- 見出しは `##` から。`##` がもくじ (左の索引) に並ぶ。その下は `###` まで。
- 末尾の定型文とApp Storeボタンは `closing` に応じて自動で付く。**本文には書かない** (`---` 以降の定型部分は持ち込まない)。文面を変える時は `data/closing.yaml`。
- 画像は記事フォルダに置いて `![説明](shot-01.png)`。キャプションを付けるなら:

  ```html
  <figure><img src="shot-01.png" alt="説明"><figcaption>キャプション</figcaption></figure>
  ```

- 表紙 (`cover`) は16:9に自動で切り抜かれる。横長1600px以上が目安。無ければ文字だけの記事になる。
- 表記ルールは `docs/blog/style_guide.md` (和欧間スペースなし など) のまま。

## 記事どうしのリンク

リンクはURLではなく記事のid (`F07` など) で書く。相手がまだ公開されていなくてもビルドは通り、公開された時点で自動でつながる。

- **記事末尾の「関連する記事」**: front matterの `related: [F07, F08, F18]`。書いた順に並ぶ。未公開のidは飛ばされるので、構想の段階で全部書いておいてよい。相手の記事にも自動で逆向きのリンクが出る (相互リンク)。原稿の「関連する記事」の箇条書きは本文に書かず、ここに移す。
- **本文の中のリンク**:

  ```
  タブについては{{</* post "F07" */>}}の記事で詳しく紹介しています。
  くわしくは{{</* post "F28" "せり上がるプレビューの記事" */>}}へ。
  ```

  1つ目は「記事タイトル」がそのままリンクの文字になる。2つ目は表示する文字を指定する形。相手が未公開の間はリンクにならず文字だけ出るので、**未公開の記事を指す時は必ず2つ目の形で文字を書く**。

## タイトルの下に自動で出るもの

執筆者 (Hamnism)・公開日・もくじ (`##` 見出しへのページ内リンク)。もくじは `##` が2つ以上ある時だけ出る。

## 手元で確認

```bash
hugo server --source blog-src --buildDrafts
```

`http://localhost:1313/lichen/blog/` で見られる (`--buildDrafts` で下書きも表示)。

## 設定 (hugo.toml の [params])

- `ga4` — GA4の測定ID (`G-XXXXXXXXXX`)。空なら計測タグは出ない。
- `appStoreURL` — App Storeへのリンク。キャンペーンリンクに差し替えるとボタン全部に効く。
- `formURL` — 定型文のお問い合わせフォーム。

## 構成

- `layouts/` テンプレート (`partials/sidebar.html` = もくじ、`_default/single.html` = 記事)
- `assets/css/main.css` 見た目。色は墨の濃淡だけ (ブランドグラデは使わない)
- `data/closing.yaml` 末尾の定型文
- `static/wordmark.png` ロゴ (CSSマスクで文字色に追従)
