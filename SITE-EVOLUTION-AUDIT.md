# NAOKING KINGDOM — SITE EVOLUTION AUDIT / PLAN

監査日: 2026-08-31

対象: `main` の現行HTML/CSS/JavaScript、runtime assets、検証スクリプト

状態: **計画のみ。既存実装・asset・Git refは変更しない。**

## 0. Executive conclusion

現行サイトには、捨てるべき土台ではなく、守るべき三つの強みがある。

1. HOMEのOpening → Hero → Depth Navigationは、静的サイトとしては十分に固有である。
2. ORACLEは「結果を先にfreezeし、演出が結果を書き換えない」という強いゲーム／演出契約を持つ。
3. Gallery、GAME、Submission、Audioは、`naoking:*` event、`visibilitychange`、`prefers-reduced-motion`、local storage、native dialog/canvas/Web Audioを使い、フレームワークなしでも実用品質の状態管理を持つ。

一方、サイト全体として見ると、**HOMEとORACLEだけが“体験”で、VIDEOS・SUBMISSION・JOINは“同じ青いページに別の内容を載せたもの”に見える**。原因は、全ページを同じ写真wash、同じ`.page-hero`、同じMincho＋mono、同じcyan/gold、同じglass panel、同じambient音で包んでいることにある。色を変えるだけでは解決しない。ページごとに、空間の輪郭、情報の進み方、入力の仕方、音の役割を変える必要がある。

目標は「演出数を増やす」ではなく、次の一文を満たすことである。

> ナビゲーションを隠し、色をグレースケールにしても、静止画一枚と最初の操作だけで、どのPageか判別できる。

各Pageに挙げる10個以上のSignature案は全部を同時実装するメニューではない。各Pageで **Anchor 3個 + Supporting 2〜4個** を選び、残りはDaily/Surpriseのreserveとする。全案を常時動かすと、ORACLEと競合して再び「効果展示会」になる。

## 1. Audit scope and evidence

### 1.1 Runtime files read

| 領域 | 現行file | 現在の責任 |
| --- | --- | --- |
| HTML shell | `index.html` | 6 hash pages、Opening、Header/Nav、Depth Rail、Footer、Gallery dialog、全feature DOM |
| 404 | `404.html` | 独立inline CSSの浅瀬エラー画面 |
| Shared CSS | `deep-sea.css` | token、共通背景、Opening基礎、Header/Nav、全Page layout、form、decree |
| Experience CSS | `kingdom-experience.css` | water transition、Opening film、HOME lens composition、ambient events、Daily、Gallery、Frame Studio |
| Oracle CSS | `roulette.css` | Oracle筐体、4–8 reels、route/scene/world takeover、fish schools、ending/outcome、responsive/reduced motion |
| Game CSS | `deep-sea-game.css` | GAME canvas shell、oxygen/risk/fever/current/result state |
| Site state | `site.js` | hash navigation、page visibility/inert/focus、Opening、depth、secret crest |
| Photo state | `photo-background.js` | 26 path生成、2-layer crossfade、HOME snapshot同期、pause/select API |
| Shared WebGL | `signature-water.js` | 全画面waterfield、pointer wake、transition pulse |
| HOME WebGL | `royal-abyss-lens.js` | Hero写真texture、refraction、pointer/scroll/impact、HOME外pause |
| Mixed experience | `kingdom-experience.js` | reveal、ambient event、Daily/Passport、Gallery、Frame Studio |
| Submission | `submission.js` | file preview/validation、Supabase Storage＋metadata POST、30秒client cooldown |
| Oracle data | `roulette-entertainment.js` | 18 expansion routes、13 scenes、10 ending trees、13 reel grammars |
| Oracle runtime | `roulette-controller.js` | 20 results、80 presentation routes、draw/timeline/DOM/cleanup/diagnostics |
| Game runtime | `deep-sea-game.js` | 30秒LIFE 1/O2 survival、5 pressure phases、input、draw、score/storage/cleanup |
| Audio | `kingdom-audio.js` | gesture-gated procedural Web Audio、9 layers、Page/Oracle/Game events、cleanup |

補助的に`tools/test-audio.mjs`、`tools/test-roulette.mjs`、`tools/test-ultimate-expansion.mjs`、`tools/simulate-deep-sea-human.mjs`も確認した。現行baselineではaudio test、100,000 draw/presentationのroulette test、ULTIMATE expansion contractがPASSしている。これは構造監査のbaselineであり、実機のfps、LCP、メモリ、スクリーンリーダー品質を保証するものではない。

### 1.2 Actual route/DOM map

| Experience | Route / entry | 主DOM | 現在の主動機 |
| --- | --- | --- | --- |
| HOME | `#home`, nav `00` | `.hero`, `#kingdom-overview`, `.daily-audience`, `.portal-section`, `.royal-index` | 王国を理解し、次の体験へ潜る |
| RECORD / VIDEOS | `#videos`, nav `01` | `.page-hero`, `.featured-film`, `.archive-ledger` | 唯一のYouTube記録を見る |
| ORACLE | `#fortune`, nav `02` | `#card`, `#slot`, `#reel`, `#spin`, `.oracle-notes` | 一回の神託と予測不能なshowを見る |
| GAME | `#game`, nav `03` | `.deep-sea-game`, `#game-canvas`, HUD、L/R controls | 30秒生存し記録更新する |
| VRChat / Submission | `#submit`, nav `04` | `#photo-submit-form`, `#frame-canvas`, `[data-frame-style]` | 素材を送る／ローカルでframeを作る |
| JOIN | `#join`, nav `05` | `.decree`, `.decree-steps` | 王国のbureaucratic jokeを読む |
| GALLERY | HOMEの`#photo-gallery-open` | `<dialog id="kingdom-gallery">`, `#gallery-image`, `#gallery-strip` | 26枚を巡り、選択写真を背景にする |
| DAILY | HOME内、routeなし | `#daily-*`, `#passport-*` | 日替わり通達と7日印 |
| OTHER | 全route共通／404 | Header/Nav/Depth Rail/Footer/secret、`404.html` | 迷わず移動し、秘密を発見する |

### 1.3 What is already good and must survive

- `site.js`の`inert`、menu focus trap、destination heading focus、hash/history同期。
- `data-depth`を使うdive/surface方向、0.82秒相当の短いpage handoff。
- 初回だけのOpening、skip、session storage、hidden時pause。
- `prefers-reduced-motion`で装飾を消し、情報と結果は残す方針。
- 写真crossfadeのlatest-selection-wins token、Gallery open時のrotation pause/restore。
- Galleryのnative `<dialog>`、arrow key、close後focus return。
- HOMEのsharp HTML character＋WebGL lensというfallback可能な積層。
- ORACLEの「final resultをroute選択前にfreeze」「`#spin`は一listener」「presentationは確率を変えない」契約。
- ORACLEの4–8 variable reel、5 fish family、scene/world/ending/outcome class、pagechange/pagehide cleanup。
- GAMEのtelegraph → safe gap → action → result、keyboard/touch、page exit reset、storage。
- Submissionの明示consent、honeypot、size/type/signature check、preview URL revoke、metadata失敗時cleanup attempt。
- Frame Studioが写真をuploadせずbrowser内だけで加工すること。
- Audioが初期OFF、user gesture後のみunlockし、音源assetなしで9 layerを合成すること。
- Runtime WebP 26枚とcharacter WebP 12枚の軽量化。

### 1.4 Similarity debt

| 観察 | 実際の原因 | 影響 |
| --- | --- | --- |
| HOME以外の最初の画面が似る | `#videos/#fortune/#game/#submit/#join`がほぼ同じ`.page-hero`骨格 | route移動が“別の深度”ではなく“見出し差替え”に見える |
| 全Pageがcyan/goldの青いglass | 共通gradient、thin line、blur panelがcontent種別を問わず再利用 | RECORD、workshop、bureaucracyまで同じ素材感になる |
| 背景写真が常時同じ役割 | 全Pageで同じcover image＋teal wash＋caustics | 26枚がcontentでなくwallpaperになる |
| revealが同じ | 全`.section-frame`へ同じIntersectionObserver class | Page固有の読み順を作れない |
| sound identityが弱い | `startAmbient(page)`は主にdepth scalarだけ変更 | Pageを耳だけで判別できない |
| ORACLEだけ密度が極端 | 80 routes、44 scenes、site takeoverに対しVIDEOSは1 video＋2 placeholder | サイトの価値がOracle一つに偏る |
| HOMEに機能が集中 | Gallery、Daily、Passport、portal、profileがHOMEだけ | 他Pageから戻る理由が弱い |
| `kingdom-experience.js`が混在 | reveal、ambient、Daily、Gallery、Frame Studioを一IIFEで所有 | Page単位のenter/leave、test、asset budgetを作りにくい |

## 2. Evolution principles

1. **Colorではなくcompositionで分ける。** RECORDは横長projection、ORACLEはpressure chamber、GAMEはfull-bleed lane、SUBMISSIONはworkbench、JOINはpaper documentにする。
2. **同じ写真を別の役割で使う。** HOME=世界の入口、RECORD=証拠、GALLERY=主役、DAILY=今日の記憶。全Pageでcover wallpaperにしない。
3. **Motionは意味のある10 grammarへ寄せる。** Drift / Dive / Reveal / Impactに加え、Project / Index / Stamp / Chase / Assemble / DissolveをPage契約として追加する。
4. **Soundは常時BGMではなくfeedback。** 初期OFFとgesture gateを維持し、Pageごとにmaterialとrhythmを変える。
5. **Dailyは薄い共通state。** 結果確率、upload成否、GAME公平性を変えない。
6. **Surpriseは低頻度・非block。** CTAを隠さず、結果を偽らず、終了手段を常に残す。
7. **Mobileは縮小版にしない。** actor数やblurを減らしても、route axis、reading order、signature silhouetteは残す。
8. **一度に一つの主役。** HOME lens、GAME canvas、ORACLE takeover、GALLERY photoのうち、continuous heavy rendererはactive experienceだけにする。

## 3. Twenty-six-photo single source

### 3.1 Current state

- Runtimeの`assets/backgrounds/vrchat-01.webp`〜`vrchat-26.webp`は26枚、合計約2.31MB、平均約88.7KB。
- path listは`photo-background.js`で一度だけ生成され、`window.NaokingPhotos.sources`をGalleryとRoyal Lensが読む。この点は良い。
- しかしcaption 26件は`kingdom-experience.js`、初期`src`/alt/counterは`index.html`、OG/Twitter/preloadも`index.html`に別管理されている。**pathだけsingle sourceで、写真recordはsingle sourceではない。**
- rootの`backgrounds/`にはJPEGが7枚だけあり、runtime 26 WebPとのsource/provenance対応が揃っていない。rootにはcharacter原版PNG/JPG、`assets/characters/`にはruntime WebP 12枚がある。
- Gallery stripは26個の`<img loading="lazy">`を一度に生成する。compressed容量は軽いが、1600×900画像一枚のdecoded RGBAは約5.5MBであり、背景2 layer、main image、WebGL texture、snapshotが同時に残るとmobile memoryはcompressed file sizeより大きくなる。

### 3.2 Required catalog contract

将来`photo-catalog.js`を`photo-background.js`より前にloadし、26件のimmutable recordを唯一のauthoring sourceにする。各recordは少なくとも以下を持つ。

| Field | 用途 |
| --- | --- |
| `id` / `ordinal` | `vrchat-01`と01〜26の安定identifier |
| `src` / optional `thumbSrc` | main/backgroundと軽量strip |
| `title` / `alt` | Gallery captionと意味のある代替文 |
| `focalX` / `focalY` | background、Gallery、Recordで一貫したcrop |
| `tone` / `dominant` | 写真ごとのwash token。runtime samplingはしない |
| `tags` / `record` | underwater、people、night等の分類とRECORD連携 |
| `credit` / `capturedAt` / `provenance` | 表示可否を含む権利・来歴。unknownを空文字で偽装しない |

Consumersは次の一方向にする。

`PhotoCatalog[26]` → background rotation / HOME snapshot / Gallery / Daily photo / RECORD contact sheet / Royal Lens texture

`index.html`のOG image、preload、no-JS fallbackの1枚はfirst paint/metadataのための意図的な例外とし、catalogの`cover`と同じかをtestで照合する。26件のcaption/path arrayをHTMLや別JSへ複製しない。

### 3.3 Loading policy

- HOMEはcurrent＋nextの2枚だけdecode。snapshotは同じURLを使い、別の選択stateを持たない。
- Galleryはmain 1枚＋前後preload 2枚。stripは480px前後のthumb variantを使うか、current周辺5件をvirtualizeする。
- `navigator.connection?.saveData`ではauto rotationを止め、静止cover＋明示的な「次へ」にする。
- Pageごとの写真利用はcatalogのtag/recordから選ぶ。Pageが独自arrayを持たない。
- error時は欠番を飛ばし、counterはcatalog lengthを正とする。26をUIへ直書きしない。
- CIで「26 unique ids / 26 existing runtime files / nonempty title+alt / focal 0〜100 / cover一致 / orphan asset」を検査する。

## 4. Shared runtime, cleanup, and performance budget

### 4.1 Proposed lifecycle contract

現行の`naoking:pagechange`は残し、各featureを次のcontractへ揃える。

| Hook | 責任 |
| --- | --- |
| `enter({page, signal})` | DOMを同期し、必要assetだけload。`AbortSignal`を受け取る |
| `leave()` | timeout/RAF/fetch/observerを止め、global classとinertを返す |
| `suspend()` / `resume()` | visibility/bfcacheで時間差を補正し、勝手に再演しない |
| `destroy()` | pagehide(non-persisted)でlistener、URL、WebGL/Audio resourceを解放 |
| `snapshot()` | test用にtimer/RAF/voice/global lease数を返す |

site-wide classを使うORACLEや将来のSurpriseは、直接`documentElement.classList`を増減せず、owner token付きの`WorldLease`を取得する。Page changeはleaseを一括releaseする。これにより、ORACLE終了後にHeaderやFooterがtransformされたまま残る事故を防ぐ。

### 4.2 Current cleanup risks to resolve during implementation

- `signature-water.js`はhidden時停止するが、全Pageでcontinuous RAFを再開し、final pagehideでGL object/listenerをdestroyしない。
- HOMEでは全画面waterfieldとRoyal Lensの二つのWebGLが同時に動く。GAMEでは全画面waterfield＋2D canvas、ORACLEではwaterfield＋多数CSS actorになる。
- `kingdom-experience.js`のambient eventは外側timerをclearするが、event class removal用の内側timeoutを追跡しない。module全体にdestroyがない。
- Gallery/Frame Studio/Dailyが同一IIFEのため、Pageごとのsuspend範囲が曖昧。
- Frame Studioは25MB/60MPを確認するが、dimension check前にbrowserが巨大画像をdecodeする可能性がある。
- Submission fetchには`AbortController`、upload progress、離脱確認がなく、Page移動後もnetwork処理が続き得る。
- GAMEの`ResizeObserver`参照を保持せずdestroyしない。ただし現状はsingle document lifetimeなので即時leakではない。

### 4.3 Target budgets

| Budget | Desktop | Compact/mobile |
| --- | --- | --- |
| continuous canvas/WebGL | 通常1、HOMEだけ最大2 | 常時最大1。GAME/ORACLE中はshared waterfieldをstatic化 |
| full-screen shader | 最大60fps、DPR上限1.5前後 | 最大30fps、DPR上限1.0〜1.15 |
| decoded full photo | current/next/mainを含め最大3枚目安 | 最大2枚目安＋small thumbs |
| ambient actors | 24以下、offscreen停止 | 8〜12、family固有pathは維持 |
| Web Audio event polyphony | 10 voice程度 | 6 voice程度、既存compact limitを維持 |
| long animation | skip/reveal controlを提供 | 8秒超のshowは短縮または明示skip |
| reduced motion | state/resultは同じ、travel/loop/particlesを除去 | 同左。単なるduration 0.001s化だけにしない |

実装後は390×844、430×932、768×1024、1366×768、1440×900で、通常／reduced motion／SOUND OFF／save-data相当を確認する。visual QAだけでなく、10回Page往復後のRAF、timer、Audio voice、global class、object URL、fetch abortも検査する。

---

## 5. HOME — “THE LIVING ROYAL GATE”

### BEFORE

| 観点 | 現状 |
| --- | --- |
| 目的 | 王国の説明、写真、Daily、各Pageへのportalを一か所で担う |
| Visual | 巨大Mincho title＋sharp Naoking＋円形lens。下層はblue glass card/grid |
| Animation | Opening film、Hero pointer/scroll、lens refraction、section reveal、ambient shoal |
| Sound | Opening、transition、bubble中心。HOME固有ambientはdepth scalar差のみ |
| Interaction | CTA、DIVE、photo pause/gallery、daily stamp、portal |
| Background | 26枚random rotationを全画面coverしteal wash |
| Navigation | nav 00、hero CTA、5 portal cards |
| Motivation | 世界観理解→Oracle/Recordへ進む、再訪時はDaily stamp |
| 他Pageとの差 | 唯一Naoking本人とWebGL lensが主役で、scroll量も最大 |
| 問題 | 強いHeroの後がcard dashboard化し、写真・Daily・portalの視覚文法が似る |

### PROBLEM

HOMEは入口として成功しているが、下へ進むほど「王国を潜る」より「青い管理画面を読む」に戻る。Hero、snapshot、Daily、portal、profileが別々のcardとして並び、Openingで作った奥行きを引き継げていない。またreturn visitorにも毎回同じ構図で、Daily以外の“今日の王国状態”が弱い。

### NEW IDENTITY

**The Living Royal Gate / 生きている王国門。** 画面上部のHeroだけでなく、HOME全体をsurface → inhabited water → court gateの三層として構成する。カードを置くのでなく、海流上に記録、通達、portalが順に現れる。

### SIGNATURE SYSTEM — 10 candidates

| ID | Signature | 固有のvisual / motion / interaction | 役割・動機 | 優先 |
| --- | --- | --- | --- | --- |
| H-01 | **Gate Aperture** | Openingの円形handoffがHero lensの外周へ正確に接続 | 最初の3秒をHOMEの構図にする | Anchor |
| H-02 | **Sovereign Wake** | Hero Naokingの後ろだけ水面が左右へ割れ、copyは動かさない | 王が世界へ影響することを一目で示す | Anchor |
| H-03 | **Three-Strata Descent** | overview / daily / portalを水平cardでなく三つの深度断面に配置 | scroll=Diveという既存言語をHOME全体へ延長 | Anchor |
| H-04 | **Memory Porthole** | snapshotを角丸cardでなく船窓／水圧窓として写真を一枚だけ見せる | Galleryへの入口を“機能”でなく“発見”にする | Support |
| H-05 | **Crown Compass** | pointer/coarse tiltで王冠ringが次のroute方向を示す。contentは固定 | 探索先を選ぶ楽しさを足す | Support |
| H-06 | **Living Tide Spine** | Depth Railとsection境界を一本の発光海流で接続 | 現在地をdecorative railからnavigationへ昇格 | Support |
| H-07 | **Portal Currents** | 5 portalを同じcardにせず、Record=projection、Oracle=pressure、Game=lane等の小さなsilhouetteで表示 | 遷移前にPage差を予告 | Anchor候補 |
| H-08 | **Audience Beacon** | Daily stampを押すと局所的な印影と一度だけの水圧ring | 再訪rewardを短く確実に伝える | Support |
| H-09 | **Kingdom State Telegraph** | weather/tide/awakeをHero座標の一行telemetryとして変化 | Dailyを下部sectionだけでなく世界状態にする | Reserve |
| H-10 | **Return-Visitor Surface Cut** | 再訪はOpeningを繰り返さず、選ばれた今日の写真から0.4秒でHeroへ | 常連の待ち時間を減らしつつidentityを保つ | Anchor |

### SOUND

HOMEは低いhydrophone noise＋遠い一音のcrown bellをsignatureにする。pointer移動やauto photo rotationには音を付けない。Gate Aperture、manual photo selection、daily stampだけに短い意味音を与え、SOUND OFF/armedを維持する。

### DAILY

`DailyContext.photoId/tide/condition`でHero wash、Memory Porthole、telemetryを一致させる。日替わりは色だけでなく、surface rayの角度、portalへの推奨一件、短いcopyを変える。ただしnav順や利用可否は変えない。

### SURPRISE

20〜40秒滞在時に一度だけ、遠景を王の影または魚群が横切る。CTA、文字、focusを覆わず、reduced motion/save-data/hiddenでは発生させない。既存`kingdom-event-layer`をHOME owner lease内に限定する。

### ASSET

- Reuse: `naoking-hero.webp`、26-photo catalog、existing crown/line CSS、Royal Lens shader。
- New bitmap不要。Gate、depth strata、portal silhouettesはCSS/SVGで構築。
- 必要metadata: HOME cover候補、focal point、tone、daily eligibility。

### IMPLEMENTATION

- DOM ownership: `#home`, `.hero`, `#kingdom-overview`, `.daily-audience`, `.portal-section`, `.royal-index`。
- `royal-abyss-lens.js`はHOME enter時だけactive、leave時texture updateも停止。
- `kingdom-experience.js`からHOME motion、Daily、Galleryを分離し、少なくとも内部controllerを別責任にする。
- `deep-sea.css`の共有`.page-hero/card`を流用せず、HOMEの三層layoutを`kingdom-experience.css`側に置く。
- Acceptance: Hero後の三sectionをcolorなしで区別できる、mobileでも三層の順序が残る、HOME leave後RAFはshared waterfield 1本以下。

---

## 6. RECORD / VIDEOS — “THE SUBMERGED BROADCAST ARCHIVE”

### BEFORE

| 観点 | 現状 |
| --- | --- |
| 目的 | YouTube Record 001の視聴と、将来記録の予告 |
| Visual | generic `.page-hero`、16:9 iframe、copy、同形placeholder 2枚 |
| Animation | section reveal以外にRecord固有grammarなし |
| Sound | shared ambient。YouTube音はiframe側で別system |
| Interaction | iframe視聴、外部YouTube linkのみ |
| Background | 他Pageと同じrotating photo wallpaper |
| Navigation | nav 01、HOME portal。Gallery/photoとの接続なし |
| Motivation | 最新videoを見る。一件視聴後の次行動が弱い |
| 他Pageとの差 | 横長videoだけが差。shell/hero/card materialは同じ |
| 問題 | Record 002/003は内容でなくplaceholder、archiveとして探索性がない |

### PROBLEM

映像が一件しかないこと自体は問題ではない。問題は、一件を“王国唯一の重要記録”として演出せず、空の二枠で不足を強調していることにある。YouTube embedは外部playerの黒いrectangleとして置かれ、26枚の写真記録や王国telemetryとも繋がらない。iframe audioとsite audioの二重再生にも設計上の境界がない。

### NEW IDENTITY

**The Submerged Broadcast Archive / 沈んだ放送記録庫。** 件数を水増しせず、Record 001を中心に、26枚のstill、field log、編集状態を“証拠”として横長projection空間に配置する。

### SIGNATURE SYSTEM — 10 candidates

| ID | Signature | 固有のvisual / motion / interaction | 役割・動機 | 優先 |
| --- | --- | --- | --- | --- |
| R-01 | **Pressure Projector** | iframe前にposter apertureを置き、user clickでplayerをload | 外部playerをarchiveの一部にし、初期networkも抑える | Anchor |
| R-02 | **Record Beam** | 画面左のprojector slitから16:9面へ細い光が伸びる | 横長projection silhouetteを固定 | Anchor |
| R-03 | **Dive-Time Ledger** | dateではなくrecord sequenceと深度を一本の横timelineにする | 一件でも“記録の位置”を感じさせる | Support |
| R-04 | **26-Frame Contact Current** | catalog写真を同じcardでなくfilm stripとして横移動 | Video以外の実在contentへ探索を広げる | Anchor |
| R-05 | **Field Note Drawer** | 選択sceneのtitle/credit/record tagが下から薄い紙片で現れる | 写真に文脈を足す | Support |
| R-06 | **Signal Lock** | player load前だけ走査線が一度収束し、その後停止 | load状態をfictionと実状態で一致 | Support |
| R-07 | **Honest Production Board** | 002/003を空cardでなく「EDITING / NOT SCHEDULED」一枚の工程表にする | 存在しないcontentを期待させない | Anchor候補 |
| R-08 | **Redaction Window** | classified textをfocus/clickで一行だけ開示、内容は実データのみ | archiveらしい小さな探索 | Reserve |
| R-09 | **Scene-to-Memory Link** | Recordのstillを選ぶとGalleryの同じcatalog idを開く | Page間の循環を作る | Support |
| R-10 | **End-Credit Exit Current** | 視聴後／外部link近傍にGallery・Submissionの二つの明確な出口 | 一件視聴後の次行動を作る | Anchor候補 |

### SOUND

Record固有音はprojectorの低いhum、signal lockの短いclick、drawerのdry tick。iframeを再生する直前にsite ambientをduckし、Page離脱またはplayer終了で戻す。ただしYouTube IFrame APIを導入しない段階では再生状態を推測せず、poster click時にambientを下げ、明示的な「王国音を戻す」を提供する。

### DAILY

`DailyContext.recordPhotoId`から「本日のstill」を一枚だけcontact currentの先頭に出す。新videoがない日も実在する26枚の記録へ戻れる。DailyでRecord 002を“公開済み”に見せない。

### SURPRISE

まれにprojectorの一frameだけNaokingの別表情へ差し替わる“記録係の挿入ミス”。video本体やcaptionを改変せず、poster/display layerだけで0.5秒以内、reduced motionでは静止badgeにする。

### ASSET

- Reuse: YouTube `ur3w4qmnQW8`、26-photo catalog、existing character faces。
- New required: Record 001 poster WebP（YouTube thumbnail直link依存を避ける場合）、optional 480px contact thumbs。
- New metadata: video title、record id、duration、published date、poster、YouTube URL、related photo ids、status。
- 音源fileは不要。procedural Web Audioで足りる。

### IMPLEMENTATION

- DOM ownership: `#videos`, `.featured-film`, `.film-frame`, `.archive-ledger`。
- `index.html`の即時iframeをposter＋consent/load buttonへ変える案を優先。privacy-enhanced embedも検討する。
- Record metadataはHTMLへ散在させず、small immutable catalogへ置く。写真recordはPhotoCatalog idを参照する。
- Page-specific CSSはprojection比率、beam、ledgerを所有し、generic `.page-hero`を外す。
- Audioは`kingdom-audio.js`へ`record:projector/load/close` semantic cueを追加し、iframe音を検知できない場合はその制約をUIへ出す。
- Acceptance: videoが一件でもplaceholder感がない、player未操作時はYouTube iframeをloadしない、keyboardだけでload/exit/Galleryへ進める。

---

## 7. ORACLE — “THE PRESSURE COURT”

### BEFORE

| 観点 | 現状 |
| --- | --- |
| 目的 | 20 resultから一件を先に確定し、80 presentation routeで神託showとして見せる |
| Visual | pressure-hull筐体、4–8 witness reels、docket、scene/chaos/takeover layer |
| Animation | 13 expansion reel grammarsを含む多段phase、44 scene、fish school、site-wide world、ending/outcome |
| Sound | reel/signal/tension/event/result、11 declarative scene、fake silence/revival |
| Interaction | `#spin`一回、連打blast、一部scene action、結果history |
| Background | 写真/water/header/footerまでroute classで変化 |
| Navigation | nav 02。Page leaveでtimer/class/audio cleanup |
| Motivation | 一回の結果＋結果を読ませない長いmisdirectionを楽しむ |
| 他Pageとの差 | 唯一、site全体を舞台にする。構造・音・結果契約とも最も成熟 |
| 問題 | 体験密度と保守量が突出し、長いrouteは15〜18.4秒。showを見ない選択が弱い |

### PROBLEM

ORACLEの課題は演出不足ではない。`roulette.css`約2,000行、controller約129KB、presentation data約29KBに、結果、確率、route選択、timeline、DOM生成、世界class、fish、ending、diagnosticsが集中している。世界takeoverがHeader/Footer/写真まで動かすため、cleanup failureの影響範囲も最大である。また通常判定とpremium showが同じ「押したら待つ」一操作に収まり、長い演出をskipして結果だけ読みたいvisitorへの出口がない。

### NEW IDENTITY

**The Pressure Court / 五〜八証人が物理的に評決する深海法廷。** 新規route数より、witness → evidence → judgment → sealという共通理解を強め、各familyはstage geometryとsoundで差を出す。機械でありながら、結果は常に一枚の“Royal Verdict”へ収束する。

### SIGNATURE SYSTEM — 10 candidates

| ID | Signature | 固有のvisual / motion / interaction | 役割・動機 | 優先 |
| --- | --- | --- | --- | --- |
| O-01 | **Frozen Verdict Oath** | click直後に非表示のdraw idをsealし、show終了まで同一result objectを使う | 公平性の核。現行契約を明文化 | Anchor / Preserve |
| O-02 | **Witness Topology** | 4/5/6/7/8列でcage幅、prime、stop orderが本当に変わる | “枚数違い”を結果の物理現象にする | Anchor / Preserve |
| O-03 | **Evidence Rail** | phase railをdescent→signal→judgment→verdictの四語に整理 | 長いshowで現在地を失わせない | Anchor |
| O-04 | **Family Proscenia** | Race=low horizon、School=vertical corridor、Dive=tall trench、Portal=concentric depth | colorでなくscene silhouetteを分ける | Preserve |
| O-05 | **Five Fish Laws** | small=cross、royal=orbit、golden=absorb、abyss=depth approach、naoking=spiral | 同asset familyでも経路を重複させない | Preserve |
| O-06 | **Silence Chamber** | blackout/fake時はOracle busだけを閉じ、ambientとUI controlは残す | 無音を故障でなく演出として扱う | Anchor / Preserve |
| O-07 | **World Lease** | routeがHeader/Footer/photoを借り、settle/leave/abortでtoken release | takeoverの強さと安全性を両立 | Anchor |
| O-08 | **Reveal-or-Watch Choice** | long event開始後、結果を変えず「演出を短縮して評決へ」を表示 | 待ちたくない人、mobile、cognitive loadへ出口 | Anchor |
| O-09 | **Royal Verdict Slip** | final resultだけをcompactな一枚へ整形し、copy/download可能 | show後の持ち帰り動機を作る | Support |
| O-10 | **Route Field Log** | result後にfamily/scene名と観測済み印をhistoryへ追加。確率や未見数は煽らない | presentationの豊富さを理解可能にする | Support |

### SOUND

現行`naoking:oraclephase/oraclestop/oracleresult/oraclebeat`をcanonical contractとして残す。音はroute nameの文字列推測より`audioScene` dataを優先し、stop位置をpanへ、tierをintensityへ、outcomeをresult chordへだけ写像する。結果種別は`naoking:oracleresult`まで音に漏らさない。SOUND OFF、hidden、Page leave、skipで全Oracle timer/voiceが0になることをtestする。

### DAILY

Dailyはpresentation modifierだけを変え、normal/win/loss確率とresult definitionを絶対に変えない。たとえば「FIRST TIDE」「FIFTH AUDIENCE」「TODAY'S ECHO」はcue、opening geometry、Field Log badgeだけを変える。日替わりの“当たりやすさ”を示唆するcopyは禁止する。

### SURPRISE

Surpriseは既存route pool内で選ぶ。sceneがresultを上書きしたように見えるcopy、早期にwin/lossを示す色・和音、閉じられないsite takeoverは禁止する。interactive sceneでもpressしないと進まない構造にせず、timeoutで自動継続する。

### ASSET

- Reuse: `naoking-1..7`, sleepy/panic/laugh/jackpot/hero、CSS geometry、Web Audio。
- 新規bitmap routeは当面追加しない。現行12 character runtime assetsでstage grammarを磨く。
- Route dataに`durationCompact`, `skippableAt`, `worldBudget`, `actorBudget`, `reducedVariant`を追加する案。
- Verdict SlipはCanvasまたはHTML print styleで作り、外部share SDKを必須にしない。

### IMPLEMENTATION

- DOM ownership: `#fortune`, `#card`, `#slot`, `#reel`, `.oracle-notes`とcontrollerが生成する`.oracle-environment/.oracle-takeover/.oracle-fish-school/.oracle-chaos-stage`。
- `roulette-controller.js`だけが`#spin`をbindし、`resolveFinalResult()`→freeze→`choosePresentation()`の順序を維持。
- data (`results/routes/scenes/endings/grammars`) とruntime (`draw/timeline/DOM/lifecycle`)を段階的に分離する。大規模rewriteを一度に行わない。
- `WorldLease`と`AbortController`を先に導入し、その後skipを実装。skipはfinal resultを再resolveしない。
- mobileはactor数、blur、durationを下げるが、Raceの横軸、Schoolの縦軸、Diveの奥行き、Portalの回転軸を同じ一方向へ潰さない。
- Acceptance: 100,000 draw/presentation diagnostics、1 draw / variable stops / 1 result、early leak 0、Page leave後timer/class/voice 0、4〜8列overflowなし。

---

## 8. GALLERY — “THE MEMORY CURRENT”

### BEFORE

| 観点 | 現状 |
| --- | --- |
| 目的 | 26枚の王国風景をfullscreenで閲覧し、選択をsite背景へ反映 |
| Visual | teal fullscreen dialog、main photo＋caption＋prev/next＋horizontal strip |
| Animation | background crossfade、thumbnail smooth scroll。写真自体は安定 |
| Sound | Gallery固有cueなし |
| Interaction | open/close、click、ArrowLeft/Right、photo rotation pause/restore |
| Background | 選択写真が同時にsite backgroundへ反映 |
| Navigation | HOME snapshotからだけ開く。top navにはない |
| Motivation | 26枚を探索し、自分の好きな背景を選ぶ |
| 他Pageとの差 | native dialogで写真が主役。ただしshellは青いUIのまま |
| 問題 | pathとcaptionが別source、strip 26 DOM、写真のcredit/date/tagがなく“linked memory”が弱い |

### PROBLEM

Galleryは機能的には良いが、写真の周囲に青いshellを置いたため、写真を見るより“サイトのGallery UIを見る”印象が強い。captionは26件あるが、focal point、場面分類、credit/provenanceがcatalog化されていない。背景反映は面白いが、その選択が他Pageでどのように続くか説明が少ない。

### NEW IDENTITY

**The Memory Current / 26の記憶を一枚ずつ流れる空間。** 写真をpanelに入れず、viewportの主照明として扱う。UIは上下の薄い岸辺へ退き、現在写真、前後関係、field noteだけを残す。

### SIGNATURE SYSTEM — 10 candidates

| ID | Signature | 固有のvisual / motion / interaction | 役割・動機 | 優先 |
| --- | --- | --- | --- | --- |
| G-01 | **One-Memory Stage** | main photo一枚をviewport主役にし、shell gradientを最小化 | Galleryを写真の場所にする | Anchor |
| G-02 | **Tide Map 01–26** | stripを等幅thumbnail列でなく、26点の潮位map＋current previewにする | 全体位置を軽量に示す | Anchor |
| G-03 | **Focal Drift** | catalog focal点へゆっくりcropが寄る。manual navigation中は停止 | 画像ごとの構図を尊重 | Support |
| G-04 | **Memory Match Cut** | 前後写真のhorizon/focal方向に合わせて横・縦・depth transitionを選ぶ | 一律crossfadeをlinked journeyへ変える | Anchor |
| G-05 | **Field Note Margin** | title、record id、credit/date/tagを写真外のmarginに配置 | “風景01”以上の記憶にする | Anchor |
| G-06 | **Background Pin** | 選択中sceneを明示的に「王国背景に固定／解除」 | 現在の暗黙同期を理解可能にする | Support |
| G-07 | **Near-Memory Peek** | 画面端に前後の色面だけ見せ、full imageはdecodeしない | swipe/arrowの方向を予告 | Support |
| G-08 | **Gesture Current** | touch swipe、trackpad、keyboardを同じnext/prev actionへ集約 | deviceを問わず一貫操作 | Anchor候補 |
| G-09 | **Record Link Marker** | videoやdailyに関連する写真へsmall marker。clickで該当Pageへ | Galleryを行き止まりにしない | Reserve |
| G-10 | **Return Through the Photo** | close時、選択写真が縮んでHOME portholeへ戻る。reduced時は即focus return | dialog closeを空間的に理解させる | Support |

### SOUND

manual next/prev時だけ、左右panした短い水膜音を一回鳴らす。auto rotation、Focal Drift、thumbnail scrollには音を付けない。Gallery open時にambientを少し広げ、closeで戻す。写真ごとの音景を26個作らず、tone tagは最大4 familyに抑える。

### DAILY

catalogから`memoryOfDay`を一枚選び、HOME snapshotとGallery initial indexを一致させる。userが背景をpinした場合は、その選択をDailyより優先し、明示解除まで上書きしない。

### SURPRISE

全26枚を一訪問で巡ったときだけ、Tide Mapの点が短時間王冠形へ整列する。新しい画像や“27枚目”を偽装しない。動機はcompletion badgeではなく、静かな一回の発見に留める。

### ASSET

- Canonical: PhotoCatalog 26 records。
- Recommended derived: 480px幅thumb 26枚。mainは既存WebPを継続。
- Missing metadataは推測で埋めず、`credit: null`, `capturedAt: null`を表示しない。
- Color/tone/focalはauthoring metadataにし、毎回Canvasでsamplingしない。

### IMPLEMENTATION

- DOM ownership: `#kingdom-gallery`, `#gallery-image`, `#gallery-counter`, `#gallery-caption`, `#gallery-strip`, prev/next/close。
- `kingdom-experience.js`からGallery controllerを分離し、open/close/select/pin/suspend/destroyを持たせる。
- main `<img>`は一枚を維持し、latest-selection tokenでdecode完了順の逆転を防ぐ。前後preloadは最大2件。
- native dialog、Escape、focus containment/return、Arrow keysを維持。swipeを追加してもclick/keyboardを代替しない。
- Acceptance: catalog 26とcounter一致、100回rapid nextでも最終選択が正しい、close後background rotation状態が元通り、mobile decoded main photoが概ね2枚以内。

---

## 9. GAME — “THE PRESSURE SURVIVAL INSTRUMENT”

### BEFORE

| 観点 | 現状 |
| --- | --- |
| 目的 | LIFE 1、O2 78%から30秒生存し、score/combo/crown/記録を伸ばす |
| Visual | generic page hero＋blue glass HUD＋960×540 Canvas＋L/R controls |
| Animation | Canvas内のgate/pickup/current/particles/shake、短いCSS state pulse |
| Sound | start/pickup/crown/warning/current/near miss/damage/death/clear/retryのsemantic cues |
| Interaction | Arrow/A-D、touch L/R、R retry、start button |
| Background | Canvas内5 pressure phases。外側は他Pageと同じphoto/water |
| Navigation | nav 03。Page leaveでrun reset/audio exit |
| Motivation | best survival、score、combo、30秒clear、tauntへの再挑戦 |
| 他Pageとの差 | 操作とfair telegraphが主役。唯一continuous 2D gameplay |
| 問題 | outer shellは共通、HTML Heroは旧「魚を食べコンボ」説明で現行survival中心とずれる |

### PROBLEM

GAME本体は独立しているが、Pageへの入り口とCanvas周囲が他Pageのglass dashboardに見える。`#game-high-score`というid/`BEST` labelへruntimeはbest survival timeを書き、high score自体はstorageするが見せないため、何を更新すべきか曖昧である。screen readerへlive statusは出るものの、空間回避gameを同等にplayできる代替はなく、その制約を明確に伝える必要がある。shared WebGL waterfieldとgame RAFを同時稼働させるmobile costもある。

### NEW IDENTITY

**The Pressure Survival Instrument / 深海航行計器そのもの。** Canvasを青いcardの中へ入れず、Pageの大半を航路として扱う。UIは上に載るdashboardでなく、潜航艇の外周instrumentとして組む。

### SIGNATURE SYSTEM — 10 candidates

| ID | Signature | 固有のvisual / motion / interaction | 役割・動機 | 優先 |
| --- | --- | --- | --- | --- |
| P-01 | **Full-Bleed Hunting Lane** | CanvasをPageの主面にし、outer card/backgroundを止める | 操作Pageのsilhouetteを固定 | Anchor |
| P-02 | **Perimeter Oxygen** | O2を上部boxでなく画面外周の細いpressure ringにする | 視線を航路から外さず危機を伝える | Anchor |
| P-03 | **Five Strata Gate** | 5 phase境界で地形・粒子・音域が段階変化 | 30秒を物語的に分節 | Anchor |
| P-04 | **Safe-Gap Telegraph** | warning帯→gap輪郭→gateの順序を色＋shape＋位置で冗長表示 | fairnessとaccessibilityを守る | Anchor / Preserve |
| P-05 | **Current Hull Tilt** | 流れ中はcameraではなくinstrument frameだけ傾き、player座標は読みやすく保つ | currentの力を体感化 | Support |
| P-06 | **Crown Pressure Shield** | crown取得時に外周ringが一回閉じ、次hitで割れる | shield状態をsprite色だけにしない | Support |
| P-07 | **Risk-Line Food** | risky pickupをsafe gap中心から明確に外し、細いgold tetherで示す | score欲と生存の選択を可視化 | Preserve |
| P-08 | **Cause-of-Death Tableau** | rock/net/mine/current/O2でresult silhouetteとtaunt位置を変える | retryに学習情報を残す | Anchor候補 |
| P-09 | **Expedition Log** | survival best、high score、best combo、runsを別項目で表示 | 現在曖昧な記録動機を整理 | Support |
| P-10 | **One-Beat Retry** | result後、同じinput位置で即retry。長いclear演出だけ別扱い | failure→再挑戦tempoを守る | Anchor |

### SOUND

現行15 cueを維持し、Page固有のsignatureを「54Hz hull hum＋O2 warning interval＋clear bell」に限定する。危険予告は視覚と同時、pickup連打はrate limit、death時はgame voiceだけを止める。reduced motionは音量設定とは独立なので、motion preferenceだけで重要warning音を消さない。SOUND OFF時もshape/text telegraphを完全に残す。

### DAILY

Daily challengeはopt-inの同一seed courseまたはcosmetic mission（例: near miss 3回）にする。通常playのrandomness、hitbox、O2、rewardはDailyで変えない。日替わり記録は通常bestと別欄にし、streak lossや期限煽りを使わない。

### SURPRISE

高skill runの遠景に一度だけLeviathan shadowまたはschoolを出す。collision/hitboxを持たず、warning帯と同じ領域を覆わない。低O2中、reduced motion、compact端末では出さない。

### ASSET

- GAMEはCanvas primitivesとexisting Naoking faceを優先し、新規large bitmapを増やさない。
- optional: 3 hazard silhouette SVG、crown shield SVG。Canvas pathでも可。
- Record keysを`bestTime/highScore/bestCombo/runs/daily`としてUI labelと一致させる。

### IMPLEMENTATION

- DOM ownership: `#game`, `.deep-sea-game`, `#game-canvas`, `.game-hud`, `#game-curtain`, controls。
- `deep-sea-game.js/.css`を唯一のgame ownerとし、shared `deep-sea.css`はPage placementだけ担当。
- Page hero copyを現行mechanics（LIFE 1、O2、telegraphed safe gap、30秒）へ合わせる。
- GAME enter中は`signature-water`をstatic frameまたは低頻度にし、continuous RAFをgame一つへ寄せる。
- `ResizeObserver`、keyboard/pointer listeners、RAFをlifecycle snapshotで追跡する。Page leaveの既存resetを維持。
- 非視覚利用者には「spatial canvas game」であること、保存される記録、代替content（結果/ルール）を明示し、play不能を曖昧にしない。
- Acceptance: deterministic simulationで全phase reachable、touch/keyboard parity、pause/hiddenでdelta jumpなし、best label整合、Page leave後RAF/audio 0。

---

## 10. VRChat / SUBMISSION — “THE ROYAL WORKSHOP & EMBASSY”

### BEFORE

| 観点 | 現状 |
| --- | --- |
| 目的 | VRChat写真を管理者へuploadし、別機能で写真に王国frameを付けてlocal保存 |
| Visual | generic page hero、guidance＋blue submit panel、下部にblue Frame Studio workbench |
| Animation | upload state、dragover、Frame draw。Page固有の空間motionは少ない |
| Sound | global UI tickのみ。upload成功/失敗の専用semantic cueなし |
| Interaction | drop/select、nickname、consent、submit、local image select、3 styles、download |
| Background | 他Pageと同じrotating photo wallpaper |
| Navigation | nav 04、HOME portal。Galleryからの寄稿導線はない |
| Motivation | 王国動画/SNSへ素材提供、または自分用のframe生成 |
| 他Pageとの差 | 唯一の外部writeとlocal creation tool。ただし見た目では違いが弱い |
| 問題 | remote offeringとlocal toolの境界が弱く、security/privacy/progress責任がUIから見えにくい |

### PROBLEM

このPageには性質が逆の二機能が同居する。一つはSupabaseへ実際にnetwork送信する献上、もう一つはbrowser外へ写真を出さないFrame Studioである。現状copyには書かれているが、同じblue frameの連続なので操作前に差が伝わりにくい。clientの10MB/type/signature/cooldown/honeypotはUX防御であり、server側RLS、MIME再検証、rate limit、moderationを証明しない。repository内にbackend policyはないため、安全性をclientだけで断言できない。upload progress/cancelもなく、離脱後fetchが続き得る。

### NEW IDENTITY

**The Royal Workshop & Embassy / 作る机と、渡す窓口。** Page最初に「LOCAL WORKSHOP」と「SEND TO KINGDOM」の二つの明確な道を分ける。local toolは明るいlight table、submissionは封印されたevidence counterとし、同じcard componentを使わない。

### SIGNATURE SYSTEM — 10 candidates

| ID | Signature | 固有のvisual / motion / interaction | 役割・動機 | 優先 |
| --- | --- | --- | --- | --- |
| S-01 | **Two-Door Embassy** | LOCAL / SENDを左右または上下の異なる入口で選ぶ | 写真がnetworkへ出るかを操作前に理解 | Anchor |
| S-02 | **Evidence Counter** | upload側を封筒、番号、受領trayの硬いbureaucratic構図にする | Submissionの責任をvisual化 | Anchor |
| S-03 | **Local Light Table** | Frame Studioは白青の透過台、写真が主役でcontrolsは脇へ | upload panelとの混同をなくす | Anchor |
| S-04 | **Chain-of-Custody Steps** | SELECT→CHECK→CONSENT→SEND→RECEIPTを実stateだけで進める | 何が起きているかを明示 | Anchor |
| S-05 | **Physical Frame Grammar** | Abyss=deep inset、Surface=open border、Archive=registration marksで形を変える | 三styleを色替えから構図差へ | Support |
| S-06 | **Consent Seal** | checkboxを読んだ後にsealが閉じる。未同意ならsend不可のまま | 同意をdecorativeにしない | Support |
| S-07 | **Inspectable Manifest** | filename/type/size/nickname有無/送信先説明を最終確認に表示 | 誤送信を減らす | Anchor候補 |
| S-08 | **Abortable Dispatch** | upload中にprogress stateとCancelを出し、Page leaveでAbortControllerを発火 | 外部writeをuser control下へ戻す | Anchor |
| S-09 | **Verified Receipt** | Storage＋metadata両方成功したときだけreceipt id/timeを表示 | “届いた”を正確に伝える | Anchor |
| S-10 | **Gallery Contribution Bridge** | Gallery/Recordから「同じ形式で自分の一枚を作る」へ移動 | creationの入口を増やす | Support |

### SOUND

Light Tableはframe選択時の薄いregistration tick、download時の一回だけのshutter。Submissionはselect/check/send/confirmed/errorの状態音を分ける。**request送信開始を成功音にしない。** metadata POSTまで成功したconfirmedだけに短いseal impactを使う。network errorはalarmで煽らず、低い二音＋読めるmessageにする。

### DAILY

DailyはおすすめFrame style、caption template、今日のcatalog photo exampleだけを変える。upload採否、queue優先度、制限を変えない。「今日送ると採用されやすい」等の誤認copyは禁止する。

### SURPRISE

Frame download時、一定条件でlocal outputへ小さなsecret royal stampを**previewで選択可能**にする。勝手に写真へ焼き込まず、OFFにできる。upload側にはsurpriseを混ぜず、同意・送信結果を常に予測可能にする。

### ASSET

- Reuse: user-selected local image、existing typography/crown、26 catalog examples。
- New bitmap不要。FrameはCanvas path/SVG overlayで構築。
- Optional: downloadable privacy/usage policy document、moderation/contact link。内容と運用担当が確定してから公開。
- Backend requirement: Supabase bucket policy、DB RLS、server MIME/size validation、abuse/rate limit、orphan cleanup、retention/deletion procedure。repository外の責任者を明記する。

### IMPLEMENTATION

- DOM ownership: `#submit`, `#photo-submit-form`, `#submit-status`, `#frame-canvas`, `#frame-file`, `[data-frame-style]`。
- `submission.js`はremote writeだけ、Frame Studioは別controllerへ分離。`kingdom-experience.js`から外す。
- `AbortController`をPage leave/pagehide/Cancelへ接続。native fetchでupload byte progressが必要ならXHRまたはresumable protocolを選ぶが、疑似percentageは表示しない。
- file signatureはdeclared MIMEと一致させ、server側でも再検証。publishable keyはsecret扱いしない一方、policyが境界であることを明記。
- Frame decode前に可能な範囲でsizeを絞り、large imageは`createImageBitmap`のresize option等でmobile memoryを抑える。object URL/blob URLをdestroyで全解放。
- Acceptance: local pathはnetwork request 0、remote pathは明示consent前request 0、Cancel/leave後fetch 0、metadata失敗時の状態が正確、private modeでも壊れない。

---

## 11. DAILY — “THE KINGDOM DAY SIGNAL”

### BEFORE

| 観点 | 現状 |
| --- | --- |
| 目的 | 毎日変わる decree/tide/relic、7日passport、HOME再訪理由 |
| Visual | HOME内のdecree card＋passport card＋7 stamp cells |
| Animation | stamp impactのみ |
| Sound | global UI clickのみ、Daily motifなし |
| Interaction | 一日一回stamp。local storage `naokingRoyalPassportV1` |
| Background | Daily stateと背景写真は別々にrandom/deterministicで動く |
| Navigation | routeなし、HOMEをscrollしないと見えない |
| Motivation | 今日のcopyを見る、直近7日の印を埋める |
| 他Pageとの差 | 日付で変わる唯一の明示section |
| 問題 | stateが`kingdom-experience.js`、`site.js` condition、Oracle daily stateに分散し、timezone/seed/sourceが統一されない |

### PROBLEM

現状は10 decrees、6 tides、8 relicsをlocal date seedで選び、passportは最大28日保存して7日表示する。別途`site.js`はday-of-monthだけでkingdom conditionを選び、ORACLEも独自today keyを持つ。つまりDailyは一つの世界状態でなく、複数moduleが別々に“今日”を計算している。日付変更時はfocus/visibilityでreloadするため、editing中やgame中のreload境界も設計されていない。

### NEW IDENTITY

**The Kingdom Day Signal / 全Pageに薄く届く一つの日付信号。** Dailyを巨大なPageにせず、immutableな`DailyContext`を一度生成し、各Pageが結果を変えない範囲で一要素ずつ受け取る。

### SIGNATURE SYSTEM — 10 candidates

| ID | Signature | Pageへの現れ方 | 守る境界 | 優先 |
| --- | --- | --- | --- | --- |
| D-01 | **Kingdom Date Key** | `Asia/Tokyo`等、仕様で決めた日界から一つのkey生成 | moduleが独自`new Date()` seedを作らない | Anchor |
| D-02 | **Tide State** | HOME ray角度、Headerの小表示、Audio filterへ同じtide token | 機能可否は変えない | Anchor |
| D-03 | **Memory of the Day** | HOME/Gallery/Recordが同じphoto idから始まる | user-pinned photoを上書きしない | Anchor |
| D-04 | **Royal Decree** | 既存ひとこと＋detailをHOMEに表示 | adviceを事実・医療/金融判断に見せない | Preserve |
| D-05 | **Relic Motif** | crown/bubble/glass等の小さなSVG motifを一日一つ共通表示 | CTA iconや意味を置換しない | Support |
| D-06 | **Audience Stamp** | 明示clickで一日一印、重複なし | auto stamp、通知、streak penaltyなし | Anchor |
| D-07 | **Record Still** | VIDEOSに今日の関連still一枚 | 存在しないvideoを作らない | Support |
| D-08 | **Oracle First Tide** | presentation intro/cueだけ変える | result/probability/message bagを変えない | Anchor |
| D-09 | **Daily Expedition** | GAMEにopt-in cosmetic/seeded challenge | normal bestと分離、公平条件を表示 | Reserve |
| D-10 | **Workshop Frame** | SUBMISSIONのlocal Frameおすすめ一つ | 採否やuploadを変えない | Support |

### SOUND

日替わりで完全に別曲を作らず、三音motifのinterval、bubble数、filterの三tokenだけを変える。初回の明示gestureまたはstamp時に一度鳴り、Page loadでauto再生しない。Headerを移動するたびにDaily motifを反復しない。

### DAILY

このsection自体がcanonical仕様である。`DailyContext`は`dateKey, tide, decreeId, relicId, photoId, motif, oraclePresentationModifier, gameChallengeId, frameStyleId`をimmutableに返す。日界を跨いだら、active upload/game/oracleをreloadせず、「新しい王国日が届きました」を出し、安全な次Page enterでcontextをrefreshする。

### SURPRISE

誕生日等の個人情報は収集せず、公開された王国記念日またはcatalog節目だけにspecial sealを出す。random surpriseはdaily stamp数を条件にせず、訪問者へ継続圧力をかけない。

### ASSET

- Daily contentをimmutable data moduleへ。copy、tide、relic、motif、photo referenceをidで管理。
- 追加assetはsmall SVG motifのみ。写真はPhotoCatalog参照。
- local storage schemaに`version`, `stamps`, optional `pinnedPhotoId`を持たせ、migrationとinvalid data filterを用意。

### IMPLEMENTATION

- Current DOM: `.daily-audience`, `#daily-date`, `#daily-decree`, `#daily-detail`, `#daily-tide`, `#daily-relic`, `#passport-stamps`, `#daily-stamp`。
- `kingdom-experience.js`のdaily data、`site.js`のconditions、Oracleの日付modifierを一つのread-only providerへ移す。
- consumerはproviderを変更せず、Page固有viewだけを描画。timezoneは仕様書とUIに明記。
- storage unavailable時はsession内だけで動き、失敗をerror扱いしない。
- Acceptance: 同一date keyで全Page token一致、日界跨ぎでactive taskを破壊しない、stamp duplicate 0、28日上限/migration/private mode test。

---

## 12. OTHER — JOIN / 404 / SHARED NAVIGATION — “THE ROYAL BUREAUCRACY”

### BEFORE

| 観点 | 現状 |
| --- | --- |
| 目的 | JOINは入会方法が謎という一つのjoke、404は王国門へ救出、Shellは全Page移動 |
| Visual | JOINだけpearl paper decree。404はinline CSSの独立navy画面。Header/Footerは全Page同形 |
| Animation | JOIN固有motionなし。404はstatic。Navはwater aperture |
| Sound | JOIN/404固有cueなし。404はaudio system外 |
| Interaction | JOINは読むだけ。404 return link。Header menu、depth rail、secret crest 5 taps |
| Background | JOINも共通photo washの上にpaper。404はgradientのみ |
| Navigation | 6 tab hash route、brand、mobile menu、depth readout |
| Motivation | jokeの結末、迷子から復帰、secret発見 |
| 他Pageとの差 | JOINのpaper materialは現行で最も明確な非glass identity |
| 問題 | JOINは一読で終了、404/Shellとdesign token/lifecycleが分断、navはPage identityを予告しない |

### PROBLEM

JOINのpaper directionは残す価値が高いが、三条を読むだけで終わり、HOMEへ戻る／Submissionへ行く理由がない。404はbase pathを`/naoking-fortune/`へ固定し、shared header、PhotoCatalog、reduced motion、sound controlを持たない。Headerはdepth以外どのPageでも同じため、移動先の空間文法を伝えない。一方、secret crestは小さく安全なsurpriseとして良い。

### NEW IDENTITY

**The Royal Bureaucracy / もっとも格式があり、もっとも役に立たない文書系。** JOIN・404・Footer secretsは、海中glassでなくpaper、stamp、redaction、misfiled mapで統一する。Navigationはbureaucracyに染めず、各Pageへの“深度instrument”として共通のまま進化させる。

### SIGNATURE SYSTEM — 10 candidates

| ID | Signature | 固有のvisual / motion / interaction | 役割・動機 | 優先 |
| --- | --- | --- | --- | --- |
| X-01 | **Unfolding Decree** | JOIN文書を縦scrollで一枚ずつ折り目が開く | static長文にreading rhythmを与える | Anchor |
| X-02 | **Missing Gate Diagram** | 存在しない門の図面をSVGで示し、全寸法が“未確認” | jokeを視覚で理解 | Anchor |
| X-03 | **Status Stamp Grammar** | MISSING/AWAY/MAYBEが位置・角度・印影で違う | red label色替えだけにしない | Support |
| X-04 | **Redaction Reveal** | focus/clickで一箇所だけ黒塗りが外れ、別の無意味な文が出る | keyboard対応の小surprise | Support |
| X-05 | **Maybe Membership Slip** | 読了後にlocalだけの「たぶん入国済み」slipを発行 | JOIN後の持ち帰り | Anchor候補 |
| X-06 | **Shallow-Lost Compass** | 404で壊れたdepth compassがHOME方向だけを指す | errorをnavigationへ変える | Anchor |
| X-07 | **404 Memory Buoy** | PhotoCatalog cover一枚を遠い浮標として表示 | 404をmain worldと視覚接続 | Support |
| X-08 | **Depth-Sonar Navigation** | nav hover/focusでdestination depthと固有silhouetteをpreview | Page差を移動前に伝える | Anchor |
| X-09 | **Route Wake** | active navからPage固有方向へ短いlineが流れる | shared navにcurrent locationを持たせる | Support |
| X-10 | **Footer Royal Dispatch** | Footer statusがDailyContextの一行を表示し、crest secretと接続 | 全Pageの終端を小さな帰還点にする | Reserve |

### SOUND

JOINはpaper fold、stamp、木槌のdry soundで、水音主体の他Pageと分ける。Navは現在のwater transitionを維持し、destinationごとの一音を加えるとしてもfocus移動だけでは鳴らさず、activate時だけにする。404はmain audio bundleをloadしなくても成立させ、return clickに必須音を置かない。

### DAILY

JOINに“本日の条文”を一行だけ差し込めるが、入会状態やroute可否は変えない。Footer dispatchはDailyContextを再利用し、別のdate計算を持たない。404はcacheされたcatalog coverだけで成立し、Daily fetch依存にしない。

### SURPRISE

既存`#crest-secret`の5 tapsを保持する。Discoverabilityを上げすぎず、keyboard focus/Enterでも同じcountになること、messageが`role=status`で一度だけ読まれること、Page移動でtimer cleanupすることを保証する。JOINのredactionも同時多発させない。

### ASSET

- Missing Gate diagram、stamp、compassはSVG/CSS。新規raster不要。
- 404はshared minimal token fileを使うか、critical CSSをbuild時に同期する。runtime JS全量を404へ持ち込まない。
- base pathはdeployment configから一元化し、hardcoded `/naoking-fortune/`の検証testを置く。

### IMPLEMENTATION

- DOM ownership: `#join`, `.decree`, `.decree-steps`, `.site-header`, `#site-nav`, `.depth-rail`, `.site-footer`, `#crest-secret`, `#secret-decree`, `404.html`。
- JOIN固有CSSはpaper moduleへ寄せ、shared glass tokenの影響を減らす。semantic `article/header/ol/footer`は維持。
- `site.js`はroute、inert、focus、history、transitionの唯一ownerを維持。Page moduleはnav stateを直接変更しない。
- 404 return URLはGitHub Pages baseとlocal previewの両方で検証する。
- Acceptance: navをkeyboard/mobile menuで完走、Page transition中二重focusなし、JOIN読了後の次行動あり、404から確実にHOMEへ戻る、secret timer/class leak 0。

---

## 13. Page identity matrix

このmatrixを実装判断の最上位に置く。同じrowへ戻る変更は、色が違っても採用しない。

| Experience | Dominant geometry | Material | Primary motion axis | Interaction verb | Photo role | Sound material |
| --- | --- | --- | --- | --- | --- | --- |
| HOME | 円形gate＋三層depth | 水・光・sharp character | 奥へ潜る | Enter / choose | 世界の入口 | hydrophone / crown bell |
| RECORD | 横長projection＋film current | glassではなくscreen/ledger | 左→右に記録を送る | Watch / inspect | 証拠still | projector / signal click |
| ORACLE | 4–8 pressure chambers | metal hull / seals | stop order＋scene固有軸 | Submit to judgment | 世界takeover texture | machinery / silence / verdict chord |
| GALLERY | 一枚fullscreen＋26点map | 写真／暗いmargin | memoryごとのmatch cut | Browse / pin | 主役 | membrane / spatial water tick |
| GAME | full-bleed lane＋外周meter | hull instrument | 横回避＋上から来るgate | Survive / retry | 外側では静止 | engine / warning / impact |
| SUBMISSION | 二つのdoor＋evidence counter/light table | paper, tray, translucent table | assemble / stamp | Make / consent / send | user content | registration tick / seal |
| DAILY | 小さな共通signal | stamp / tide mark | 一日一回だけimpact | Return / acknowledge | 今日の一枚 | three-note motif |
| JOIN / 404 | unfolded document＋broken compass | pearl paper / ink | 開く／押印／帰還 | Read / recover | distant buoy only | paper / gavel |

### 13.1 Mobile / reduced-motion identity

compact化で全Pageを「一列の青いcard」に戻さない。layoutをstackしても、主軸とmaterialを残す。

| Experience | Compact/mobile | Reduced motion |
| --- | --- | --- |
| HOME | 三層を縦順にし、Gate円とportal silhouetteを残す。Lensはstatic/低DPR | apertureはinstant dissolve、telemetryと三層境界は残す |
| RECORD | projectionを全幅、contact currentはnative horizontal scroll | beamを静止線にし、poster/load/ledgerは同じ |
| ORACLE | actor/blur/durationを削減、4–8列は横幅内でdensity調整、scene固有軸を維持 | phaseを短いstate cutで見せ、result/ending差は静止compositionで残す |
| GALLERY | main photo＋下端Tide Map。前後peekは色面だけ | Match Cutを即時crossfade＋方向labelへ |
| GAME | safe-area内に大きいL/R controls、shared waterをstatic化 | particles/shakeを除去し、warning shape/timer/hitboxは不変 |
| SUBMISSION | Two-Doorを縦stackしてもLight TableとEvidence Counterのmaterialを変える | fold/stamp travelを除き、step/status/consentは同じ |
| DAILY | decree detailをcollapse可能にし、stampは44px以上 | stamp impactを静止印影に置換 |
| JOIN / 404 | paper幅、折り目、compassを維持し、横三列だけ縦順へ | unfoldingを最終状態で表示、redactionはbutton stateで切替 |

## 14. Sound evolution plan

### 14.1 Preserve the current safety model

- Initial state OFF、stored ONでも次のtrusted gestureまでAudioContextを作らない。
- master volume、nine layers、voice sets、rate limits、visibility suspend、pagechange stopを維持。
- Audio assetは追加せず、現状通りproceduralをdefaultとする。必要性が生じた場合だけ権利情報付きasset manifestを追加する。
- `prefers-reduced-motion`とSOUND preferenceを混同しない。motion reductionは重要なwarning soundを勝手にmuteしない。

### 14.2 Move from page depth to page material

現行`startAmbient(page)`は主に一つのdepth値でfilter/frequencyを変える。進化後はPageごとに“material preset”を持つ。

| Preset | Continuous component | Event component | Must not do |
| --- | --- | --- | --- |
| Gate | low water noise、very sparse shimmer | aperture bell、stamp | pointer/scrollへ連続cue |
| Archive | very quiet projector hum | lock、drawer、close | YouTube音との二重BGM |
| Court | reel motor/tension bus | stops、silence、verdict | reveal前にoutcomeを鳴らす |
| Memory | 原則continuousなし | manual next/prev、pin | auto rotationへ音 |
| Hunt | hull hum | telegraph、pickup、death/clear | pickup polyphony runaway |
| Workshop | 原則continuousなし | register、download、confirmed | request開始をsuccess扱い |
| Bureaucracy | paper room toneなしでも成立 | fold、stamp、gavel | nav focusごとに発音 |

`kingdom-audio.js`は音の唯一ownerのまま、Page moduleは`naoking:audio`またはtyped semantic eventをdispatchする。DOM class名やcopy文字列から音を推測しない。iframe、upload、Gallery、long showにはduck/release tokenを用意し、owner離脱時に必ず戻す。

## 15. Asset plan

### 15.1 Reuse first

| Asset group | 現在 | Plan |
| --- | --- | --- |
| Runtime photos | `assets/backgrounds/vrchat-01..26.webp`, 約2.31MB | 26-record catalogへ。mainは再利用、必要ならsmall thumbをderived生成 |
| Runtime characters | `assets/characters/*.webp` 12件、約220KB | HOME/ORACLE/GAMEで再利用。Page decorationへ無差別配置しない |
| Root originals | 7 background JPG＋character PNG/JPG | source/provenance mappingをmanifest化。runtimeから参照しない |
| Video | YouTube 1件 | Record catalog＋local poster option。存在しないrecordsをasset化しない |
| Audio | 0 files | Web Audioを継続。外部効果音を安易に追加しない |
| Vector/UI | `favicon.svg`＋CSS geometry | gate/map/stamp/compass/hazardはSVG/CSSで追加可能 |

### 15.2 New asset requests, in order

1. PhotoCatalog metadata: 26 title/alt/focal/tone/tag/provenance。これは新画像より先。
2. 26枚のsmall thumbnails（実測でGallery loadが問題の場合のみ）。
3. Record 001 local posterと確定metadata。
4. Missing Gate / compass / stamp / hazardのsmall SVG set。
5. Submission policy/contact文書。運用と削除窓口が確定してから。

禁止事項:

- 既存写真と似た“埋め草”のAI背景を足して26件の意味を薄めない。
- Page identityを作るためだけにlarge hero bitmapを7枚追加しない。
- credit/provenance/dateを推測して表示しない。
- 1600×900 main assetをそのまま26枚thumbnailとしてeager loadしない。

## 16. Future file responsibility map

静的GitHub Pages／no build frameworkは維持する。最初から全面ES module化せず、現行defer順とglobal read-only APIを保ちながら段階移行する。

| File | Future responsibility | Explicitly not responsible for |
| --- | --- | --- |
| `index.html` | semantic landmarks、fallback content、SEO/OG/preload、script order | 26件catalog、route timeline、daily calculation |
| `deep-sea.css` | token、reset、Header/Nav/Footer、basic page visibility/accessibility | Page固有scene、Oracle/Game internals |
| `site.js` | hash route、history、inert/focus、opening handoff、nav/depth | Gallery、Daily、Frame、Oracle、Game logic |
| `photo-catalog.js` (new) | immutable 26 records＋cover id | rotation、DOM、date selection |
| `photo-background.js` | current photo、current/next loading、pause/pin、photochange event | captionsの別array、Gallery DOM |
| `daily-context.js` (new) | one date key/seed、immutable cross-page daily tokens、passport storage API | Page-specific rendering、probability changes |
| `experience-runtime.js` (new) | enter/leave/suspend/destroy、AbortSignal、WorldLease、budget snapshot | Page visuals |
| `home-experience.js` (split candidate) | HOME lens coordination、three strata、portal/current | Gallery、Frame Studio、Daily source data |
| `gallery.js` (split candidate) | dialog、catalog selection、preload window、pin、focus restore | background rotation internals |
| `record.js` (new when implemented) | video metadata、poster→iframe、contact current、audio duck | global navigation |
| `submission.js` | remote upload/validation/consent/abort/receipt | local Frame Studio |
| `frame-studio.js` (split candidate) | local decode/draw/styles/blob URLs/download | network upload |
| `roulette-entertainment.js` | immutable presentation data only | DOM/timer/result selection |
| `roulette-controller.js` | frozen draw、route selection、timeline、Oracle DOM/lifecycle | shared navigation/audio synthesis |
| `deep-sea-game.js/.css` | gameplay、draw、input、game states/storage | shared photo/water animation |
| `kingdom-audio.js` | mixer、material presets、semantic cues、duck/cleanup | choosing results、playing without gesture |
| `404.html`＋minimal shared tokens | fast error recovery | full app runtime |

`kingdom-experience.js`は最初に削除・rewriteせず、Daily → Gallery → Frame Studio → HOME motionの順に責任を抜く。各抽出後に同じDOM contractとtestを通し、最後にambient/revealだけ残すか廃止を判断する。

## 17. Implementation roadmap

### Phase 0 — Lock contracts before visual work

- 現行mainのdesktop/mobile/reduced-motion screenshots、audio snapshots、route diagnosticsをbaseline保存。
- `naoking:pagechange`, `naoking:photochange`, Oracle/Game/Audio eventsのpayloadを文書化。
- `#spin` one-listener、frozen result、hash route、focus/inert、Gallery pause restore、Submission explicit consentをnon-regressionに指定。
- 各Pageで採用するAnchor 3個を決める。10案全部を採らない。

### Phase 1 — One world state

- `photo-catalog.js`で26-record single sourceを作り、path/caption/focal/provenanceを移行。
- `daily-context.js`でdate/tide/photo/motif/passportを一元化。
- HTML fallback/OG/preloadとcatalog coverの整合testを追加。
- 見た目を大きく変える前にPhoto/Gallery/Daily既存挙動を同じに保つ。

### Phase 2 — Lifecycle and budget

- `experience-runtime.js`または同等の小controllerでPage AbortSignal、WorldLease、snapshotを実装。
- shared water、Royal Lens、ambient event、Gallery、Frame、Submission、Game、Oracleを順に接続。
- mobileでactive heavy renderer一つ、save-data、hidden、bfcache、pagehideを検証。
- Soundにmaterial presetとduck tokenを追加。

### Phase 3 — Fix the weakest identities first

- RECORD: poster-first projection、contact current、honest production board。
- SUBMISSION: Two-Door、Chain of Custody、abortable dispatch、Light Table分離。
- JOIN/404: paper/compass identityとnext action。

これらはORACLEより小さく、共通`.page-hero`依存を外す効果が最も見えやすい。

### Phase 4 — Make photos and Daily systemic

- GALLERY: One-Memory Stage、Tide Map、match cut、pin。
- HOME: Three-Strata Descent、Portal Currents、return visitor handoff。
- DAILY: 同一tokenをHOME/Record/Gallery/Oracle/Game/Workshopへ薄く接続。

### Phase 5 — Make GAME own its Page

- Hero copyと現行mechanicsを一致。
- Full-Bleed Lane、Perimeter O2、record labelsを実装。
- shared waterfield budgetをGAMEへ譲る。
- deterministic/human-like simulationとmanual touch QAを再実行。

### Phase 6 — Refactor ORACLE without changing chance

- 先にWorldLease、typed data、long-show skipを実装。
- data/runtime splitは小分けにし、各stepで100,000 diagnostics。
- 新規route/assetは、この段階のcleanupとskipが安定するまで追加しない。

### Phase 7 — Integration and release

- 全routeを10往復、Gallery open中navigate、Oracle mid-show leave、Game mid-run leave、upload mid-flight cancel、midnight rollover、bfcacheを検証。
- 390/430/768/1366/1440幅、keyboard、coarse pointer、reduced motion、SOUND OFF/ON、save-data相当。
- asset existence/provenance、broken hash/base path、focus order、contrast、aria-live frequency、horizontal overflowを確認。
- cache query versionとrelease notesを最後に更新。rollback refとPages branch設定は触らない。

## 18. Recommended first signature set

最初のreleaseで実装するなら、次の組合せが最小で最大の差を出す。

| Experience | First anchors | 理由 |
| --- | --- | --- |
| HOME | H-03 Three-Strata / H-07 Portal Currents / H-10 Return Cut | 既存Heroを壊さず、下層と再訪を改善 |
| RECORD | R-01 Pressure Projector / R-04 Contact Current / R-07 Honest Board | content一件の弱さを正直に価値へ変える |
| ORACLE | O-03 Evidence Rail / O-07 World Lease / O-08 Reveal-or-Watch | 新効果より理解・cleanup・選択権を改善 |
| GALLERY | G-01 One-Memory / G-02 Tide Map / G-04 Match Cut | 26枚を本当の主役にする |
| GAME | P-01 Full-Bleed / P-02 Perimeter O2 / P-09 Expedition Log | shell差、危機情報、再挑戦動機を同時改善 |
| SUBMISSION | S-01 Two-Door / S-04 Chain of Custody / S-08 Abortable Dispatch | local/network境界と安全性を明確化 |
| DAILY | D-01 Date Key / D-02 Tide / D-03 Memory | 全Pageを一日の世界へ接続 |
| OTHER | X-01 Unfolding Decree / X-06 Lost Compass / X-08 Depth Sonar | paper identityとnavigationを強化 |

## 19. Acceptance checklist

### Identity and content

- [ ] Headerと色を隠した静止画でも、8 experiencesをdominant geometryで判別できる。
- [ ] `.page-hero`の同じflex compositionをVIDEOS/GAME/SUBMISSION/JOINで使い回していない。
- [ ] PhotoCatalogは26 unique recordsで、caption/path/focal/provenanceの別arrayがない。
- [ ] RECORDは実在する一件を強く見せ、架空の公開済みrecordを作らない。
- [ ] HOME/ORACLEの既存良好要素を弱いPageへコピーせず、それぞれ別materialを持つ。

### Interaction and accessibility

- [ ] hash/back/forward、menu focus trap、page heading focus、skip link、dialog focus returnを維持。
- [ ] pointer-only interactionがなく、swipe/tiltはkeyboard/clickの補助である。
- [ ] long ORACLE showにresultを変えないskipがある。
- [ ] reduced motionでもPage identity、phase、warning、result、upload statusを理解できる。
- [ ] screen reader live regionsを頻繁なambient/daily updateでspamしない。
- [ ] 44×44px相当touch targetとsafe areaを維持。

### Sound

- [ ] first visitはAudioContext 0、trusted gesture後だけ一つ生成。
- [ ] Pageごとにmaterialが異なり、auto photo/scroll/pointerは無音。
- [ ] iframe/load/upload/Oracle skipのduck tokenがowner leaveで必ず解放。
- [ ] reveal前のOracle soundからwin/lossを推測できない。
- [ ] hidden/pagechange/SOUND OFF後、voice/timer/silence busがclean。

### Performance and cleanup

- [ ] compactでcontinuous canvas/WebGLは最大1、desktop通常最大1、HOMEだけ最大2。
- [ ] Gallery rapid navigationでdecoded full imagesを無制限に保持しない。
- [ ] Page 10往復後、orphan timeout/interval/RAF/observer/object URL/global class/Audio voiceがない。
- [ ] ORACLE mid-scene leaveでHeader/Footer/photo transformが残らない。
- [ ] GAME leaveでrun stateとinputがresetされる。
- [ ] Submission leave/Cancelでfetchがabortされ、local Frame pathはnetwork request 0。

### Security and truthfulness

- [ ] client validationをserver securityとして説明しない。
- [ ] Supabase Storage/DB policy、MIME/size、rate limit、moderation、retention/deletionを別途検証。
- [ ] upload “success”はobject＋metadata両方成功時だけ。
- [ ] credit/date/provenance不明を推測表示しない。
- [ ] Daily/Oracle presentationが結果確率を変えない。

### Regression tests

- [ ] Existing audio test PASS。
- [ ] Existing 100,000 draw/presentation roulette diagnostics PASS、early leak/contradiction 0。
- [ ] Existing ULTIMATE contract PASS: 18 expansion routes、5 fish families、4–8 reels、13 scenes、10 ending trees、13 reel grammars、11 audio scenes。
- [ ] PhotoCatalog integrity test、Daily consistency test、Page lifecycle stress testを追加。
- [ ] Game deterministic simulationとhuman-like modelを再実行。
- [ ] local asset references、404/base path、HTML landmarks、CSS animation names、horizontal overflowを検査。

## 20. Final recommendation

最初にORACLEへさらにsceneを足すべきではない。最も大きな改善は、Photo/Daily/Lifecycleを一つにし、VIDEOS・SUBMISSION・JOINへ別のgeometryとmaterialを与えることにある。その後HOME/GALLERY/GAMEをPage全体の体験へ広げ、最後にORACLEへskipとworld leaseを入れる。この順番なら、現行の強い演出契約を壊さず、サイト全体が「Oracleのある青いサイト」から「入口、記録庫、法廷、記憶の流れ、航行海域、工房、文書局が実在する王国」へ進化する。
