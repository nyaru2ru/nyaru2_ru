# 公式HP

## サイトの全体像

Astroによる静的サイト
画面は `src/pages/`
共通ヘッダーとフッターは `src/layouts/BaseLayout.astro`
全体のデザインは `src/styles/global.css` 
ページ固有のスタイルは各 `.astro` の末尾にも。

お知らせ・カレンダー・SNS・動画・活動履歴・掲載画像・GOODSの紹介文はPages CMSから更新できます。
CMSの画面定義は `.pages.yml`、保存されたデータは `src/content/` 
CMSで変更した内容は、サイトの次回ビルドで表示に反映。

## 日常の更新（Pages CMS）

| CMSのメニュー | 何を更新するか | 保存先 | 表示される場所 |

| 配信・イベント予定 | 日時、曜日、配信先、公開/中止 | `src/content/schedule/.json` | HOMEのカレンダー、SCHEDULE、ACTIVITYの今後の予定 |

| NEWS・活動情報 | お知らせ、活動実績、コラボ、イベント | `src/content/updates/.json` | ACTIVITY、HOMEの最近のお知らせ |

| 画像（GOODS・FAN ART）：HOMEのメイン画像 | メイン画像の差し替え | `src/content/media.json` → `mainVisual` と `public/images/` | HOMEのメイン画像 |

| 画像（GOODS・FAN ART）：GOODSの紹介文 | 商品欄の短い文章 | `src/content/media.json` → `goodsNote` | CONTENTSのGOODS見出し下 |

| 画像（GOODS・FAN ART）：グッズ画像 | 商品画像、掲載の有無、並び順の日時 | `src/content/media.json` → `goods` と `public/goods/` | CONTENTSのGOODS |

| 画像（GOODS・FAN ART）：ファンアート | 画像、タイトル、作者、掲載許可 | `src/content/media.json` → `fanArt` と `public/images/fan-art/` | FAN ART |

予定は「日付指定」または「毎週」を選びます。毎週の曜日は日曜が0、月曜が1、土曜が6
開始時間は `20:00` のように入力します。日付指定の「毎週の予定を置き換える」を有効にすると、同じ日の毎週予定を表示しません。

お知らせは分類を選び、掲載日・タイトルを入力します。「公開する」を有効にしたものだけ表示されます。日付は `YYYY-MM-DD` として扱います。

GOODSは最大10枚です。`public/goods/` にある画像を新しい順
CMSに登録した画像の `addedAt` に `2026-10-29T14:30:00+09:00` のような日時があれば、その時刻が並び順に使われます。空欄または未登録ならファイルの作成・更新日時を使います。CMSで非表示にした画像は一覧から外れます。画像は縦横比を維持してカード内に縮小。

FAN ARTはCMSの作品情報を元に表示。「掲載許可あり」が有効な作品だけが掲載。画像をフォルダに入れるだけでは表示されません。

## 置換リスト

公開前に仮の文字・リンク・画像を置き換える場所です。

| 現在の値・内容 | 編集するファイル | 項目 | 反映先 |

| `名前入れる`、`ここにフルネームを入れる` | `src/data/site.ts` | `site.name`、`site.fullName` | HOME、サイトタイトル、検索用の説明 |

| 検索エンジンへの掲載設定 | `src/data/site.ts` | `allowSearchIndexing` | 全ページの検索設定 |

| `ここに / キャッチコピーを / 入れる` | `src/data/pages.ts` | `home.heroFirst`、`heroAccent`、`heroLast` | HOMEの大きな見出し |

| `ここに紹介文を入れる。` などのHOME文章 | `src/data/pages.ts` | `home.introduction`、`home.about`、各 `Feature` | HOMEの案内文 |

| メインビジュアルと説明 | CMSの「HOMEのメイン画像」、`src/data/pages.ts` | `media.json > mainVisual`、`home.mainVisualAlt` | HOMEのメイン画像 |

| `ここに自己紹介文を入れる` など | `src/data/pages.ts` | `about.` | ABOUT ME |

| 配信・二次創作・切り抜きのルール | `src/data/pages.ts` | `guidelines.` | GUIDELINES |

| ファンアートの投稿方法と利用案内 | `src/data/pages.ts` | `fanArt.howToPost`、`usage` | FAN ART |

| 問い合わせ時の注意・返信案内 | `src/data/pages.ts` | `contact.notes`、`response` | CONTACT |

| SNSのURL・動画 | Pages CMS「SNS・おすすめ動画」 | `src/content/social.json` | HOME、SOCIAL |

| `ここに販売ページ名1を入れる` など | `src/data/links.ts` | `salesLinks` の `label`、`description`、`url` | CONTENTSの販売サイト |

| `ここにお問い合わせについての案内`、連絡先の `url: null` | `src/data/links.ts` | `contactLinks` | CONTACT |

| 活動ジャンル・プロフィールタグの空の一覧 | `src/data/profile.ts` | `activityGenres`、`profileTags` | ABOUT ME、HOMEのABOUT欄 |

| 歌ってみた・動画の空の一覧 | `src/data/contents.ts` | `contentItems` | CONTENTS |

| `まだ準備中だよ！！` | CMSの「GOODSの紹介文」 | `src/content/media.json > goodsNote` | GOODSの見出し下 |

| HOMEののぞき見動画 | `public/images/0001-0120.webm` | 動画ファイル本体 | HOME（処理は `PeekCharacter.astro`） |

## 画面から探す

| 画面 | URL | ページ | 関連ファイル |

| HOME | `/` | `src/pages/index.astro` | `data/site.ts`、`data/pages.ts`、`content/media.json`、`data/activity.ts`、`WeeklyCalendar.astro`、`HomeAbout.astro`、`PeekCharacter.astro` |

| ABOUT ME | `/about/` | `src/pages/about.astro` | `data/pages.ts`、`data/profile.ts` |

| SOCIAL | `/social/` | `src/pages/social.astro` | `data/links.ts` |

| ACTIVITY | `/activity/` | `src/pages/activity.astro` | `data/activity.ts`、`data/calendar.ts` |

| CONTENTS | `/contents/` | `src/pages/contents.astro` | `data/contents.ts`、`data/links.ts`、`content/media.json`、`GoodsSlideshow.astro` |

| GUIDELINES | `/guidelines/` | `src/pages/guidelines.astro` | `data/pages.ts` |

| FAN ART | `/fan-art/` | `src/pages/fan-art.astro` | `content/media.json`、`public/images/fan-art/` |

| CONTACT | `/contact/` | `src/pages/contact.astro` | `data/links.ts` |

| SCHEDULE | `/schedule/` | `src/pages/schedule.astro` | `data/calendar.ts`、`WeeklyCalendar.astro`（ナビには未掲載） |

## データが表示されるまで


.pages.yml（Pages CMSの編集画面）
  ├─ src/content/updates/.json ─> src/data/activity.ts ─> HOME / ACTIVITY
  ├─ src/content/schedule/.json ─> src/data/calendar.ts
  │                                    ├─> WeeklyCalendar ─> HOME / SCHEDULE
  │                                    └─> src/data/activity.ts ─> ACTIVITY
  └─ src/content/media.json
       ├─ mainVisual + public/images/ ─> HOME
       ├─ goodsNote ─> GOODSの紹介文
       ├─ goods + public/goods/ ─> src/pages/contents.astro ─> GoodsSlideshow
       └─ fanArt + public/images/fan-art/ ─> src/pages/fan-art.astro

src/data/site.ts ─> BaseLayout / HOME
src/data/pages.ts ─> 各ページの文章
src/data/links.ts ─> HOME / SOCIAL / CONTENTS / CONTACT
src/data/profile.ts ─> HOME / ABOUT ME
src/data/contents.ts ─> CONTENTS
BaseLayout ─> 共通ナビ・フッター・SiteDecorations・MediaSaveGuard

## よく触る

| 変更内容 | 場所 |

| GOODSの自動送りの間隔 | `src/components/GoodsSlideshow.astro` の `setInterval`（現在 `2800` ms） |

| GOODSの移動アニメーション | 同ファイルの `transition`（ `1400ms"） |

| GOODSの選出数・並び順 | `src/pages/contents.astro` 冒頭（最大10枚） |

| カレンダーのデータ取得・表示形式 | `src/data/calendar.ts`、`src/lib/calendar.ts`、`src/scripts/weekly-calendar.ts` |

| 共通の色・余白・画面幅 | `src/styles/global.css` |

| ページ内だけのデザイン | そのページの `.astro` の `<style>` |

| PC・スマホのメニュー、フッター | `src/layouts/BaseLayout.astro` |

| 青い装飾・背景 | `src/components/SiteDecorations.astro` |

| 画像の右クリック用メニュー | `src/components/MediaSaveGuard.astro` |

| GOODSの紹介文 | CMSの「GOODSの紹介文」／`src/content/media.json` |

| CMSで表示する入力欄の追加・変更 | `.pages.yml`（必要に応じてデータを読む側も変更） |

## 開発・確認（Windows PowerShell）

| コマンド | 動作 |

| `npm.cmd run dev` | 開発用の画面を開く |
| `npm.cmd run build` | 静的サイトを `dist/` に生成する |
| `npm.cmd run preview` | ビルド済みのサイトを確認する |

`package.json` は実行コマンドと依存パッケージ
`astro.config.mjs` はAstroの設定
`.pages.yml` はPages CMSの入力画面を定義。

## SNS・動画・活動履歴のCMS更新

Pages CMSの「SNS・おすすめ動画」でTwitch・YouTubeのURL、Xの3アカウント、YouTube動画を登録できます。
HOME・SOCIALの動画は各登録欄から「表示する」を有効にした先頭2件を掲載します。YouTube動画IDはURLの `v=` 以降の11文字です。
HOMEの「わたしのこと」の動画はCMSに登録するとCMSの値が優先されます。未登録の間は既存の `HomeAbout.astro` の値を使用します。

「これまでのこと」はPages CMSの同名メニューから日付と内容を1件ずつ登録します。6件まではそのまま表示し、7件以上で折りたたみます。CMSに登録がなければ `src/data/pages.ts` の `about.history` を表示します。

HOMEの「次の予定」は配信・イベント予定に登録した最新の次回予定を使用します。毎週の予定にも対応します。

FAN ARTは1ページ24作品です。ページ数はビルド時に作品件数から生成されます。掲載許可のある作品だけが対象です。

## 画像について

`public` の画像・動画は別途維持してください。今回の修正ファイルには含まれません。プロジェクトを展開するときは元の `public` を消さないでください。
