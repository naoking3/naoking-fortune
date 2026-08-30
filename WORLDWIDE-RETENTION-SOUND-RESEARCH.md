# NAOKING KINGDOM — Worldwide Retention & Sound Research

調査日: 2026-08-31  
対象: `main` の現行実装（調査のみ。既存コード・Git refは変更していない）  
目的: 毎日戻る理由を「義務」ではなく、王国の世界が少しずつ生きている感覚として設計し、全ページに固有のSound Identityを与える。

---

## 0. 結論

なおキングダムに最も合うのは、一般的なログインボーナスの模倣ではない。

1. **毎日ひとつ、王国の状態が変わる**（潮・天候・住民・漂着物・王命）
2. **訪問者が30秒〜3分でひとつ選ぶ／見つける／残す**
3. **その行為が翌日以降の世界、図鑑、音、写真、Oracle、Gameへ小さく反映される**
4. **欠席を罰しない**。連続日数より「累計発見」「今季の航海」「戻ってきた物語」を重視する
5. **音は報酬そのもの**にする。数字が増えるだけでなく、新しい水音・王冠音・生物音の断片がコレクションへ加わる

最初の実装候補は、`Daily Royal Decree` を入口にした以下の五本である。

- Daily Tide Map（今日の全ページ共通World State）
- Three Royal Errands（短い日替わり三択Challenge）
- Relic Cabinet（収集と説明文の解放）
- Living Passport（連続ではなく訪問物語）
- Kingdom Sound Atlas（各ページの発見音を集める音図鑑）

これらは既存のDecree / Tide / Relic / Passportを削除せず、その意味をサイト全体へ広げられる。

---

## 1. 現行実装監査

### 1.1 Daily Royal Decree / Tide / Relic

`kingdom-experience.js` はローカル日付 `YYYY-MM-DD` を整数seedにし、以下を決定論的に選ぶ。

- 通達: 10組
- Tide: 6種
- Lucky Relic: 8種

同じ端末・同じ日なら同じ内容になる。日付変更はfocus/visibility復帰で検出し、reloadする。これは「全訪問者に同じ今日」を見せるには弱く、端末ごとのローカル時刻に依存する一方、サーバー不要・オフライン可・プライバシー良好という利点がある。

課題:

- 表示だけで、その日ほかのページに影響しない
- 組合せ母数はあるが、意味上の相関がない（潮とRelicが独立）
- 完了条件・発見・翌日への継続がない
- 過去のDecreeを見返せない

### 1.2 Royal Passport

`naokingRoyalPassportV1` に日付文字列を最大28件保存し、直近7日を表示する。ボタンを押した日だけ印が付く。

良い点:

- 明示操作で達成感がある
- 個人情報不要、サーバー不要
- 7日表示は理解しやすい

課題:

- 連続訪問だけが価値になり、印そのものに個性がない
- 8日目以降の物語や累計価値が見えない
- 端末・ブラウザを跨げない
- localStorage消去で消える
- 欠席時の復帰導線がない

推奨: 「連続streak」ではなく、月ごとに違う印、訪問時の潮・場所・発見物を記録する**航海日誌**へ育てる。欠席日は空欄ではなく「王国は静かだった」と扱い、損失を演出しない。

### 1.3 Oracle Daily / History

`roulette-controller.js` は `naoking-oracle-daily-v2` に当日回数、前結果、前route、rare droughtを保存する。表示Historyはセッション中の直近3件。結果抽選とpresentation履歴は分離され、履歴補正は特殊当たり/ハズレ確率を変えない。

課題:

- Daily stateがOracle内部に閉じる
- 履歴がreloadで消える
- 今日のOracleがDecree/Tideと物語上つながらない

推奨: Oracle結果そのものを収集対象にせず、結果に付随する「王印」「海域」「声紋」を一日一回だけArchiveへ記録する。回数を増やす圧力を避ける。

### 1.4 Gallery / Photo Background

写真はGalleryとHOME背景が連動し、閲覧者が選択・一時停止できる。これは既に強いDiscovery loopである。ただし閲覧済み・お気に入り・今日の一枚・写真に紐づく小話の永続化はない。

### 1.5 Deep Sea Game

`deep-sea-game.js` はbest score等の数値をlocalStorageに保存し、`naoking:gameaudio` を通じてstart/pickup/warning/damage/clear等を共通音響へ送る。Daily challengeや日ごとのmutatorはない。

### 1.6 Hidden Event / Secret

王冠を5回押すとsession中の秘密通達が出る。Oracleにもsecret/premium routeがある。現在は「見つけた記録」がなく、再発見と収集の関係もない。

### 1.7 共通Audio architecture

`kingdom-audio.js` は一つのgesture-gated `AudioContext` とmaster gain、9 layer、Oracle専用bus、bounded voice、timer cleanupを持つ。主要integration event:

- `naoking:pagechange`
- `naoking:oraclephase`, `naoking:oraclestop`, `naoking:oracleresult`, `naoking:oraclebeat`
- `naoking:gameaudio`
- `naoking:opening`, `naoking:transition`, `naoking:audio`

強み:

- procedural中心で配信容量と権利リスクが小さい
- SOUND OFF / volume / visibility / pagehide cleanupがある
- OracleとGameの音響契約が既にイベント駆動
- ページ移動で残音を止められる

今後の不足:

- ページごとのambient identityがまだ薄い
- Daily/Collection/Discovery専用cue contractがない
- 長時間ambienceのducking policyとscene ownershipを明文化していない
- 同じachievement音を全機能で使うと、報酬の意味が均質化する

---

## 2. 一次資料・優良実例から得られる原則

### 2.1 Browser-local progression

- `localStorage` はstring key/value向け。大きな構造や索引付きデータはIndexedDBが適する。ブラウザ保存領域はquota・evictionの対象になり得るため、進行はexport/import可能にする。[MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- tabがhiddenになったら更新・音・animationを止める。Page Visibility APIはwidely availableで、非表示時の資源節約に使える。[MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- 通知はsecure contextと明示許可が必要で、permission requestはユーザー操作に応じて行う。モバイルではService Worker経由が基本。[MDN: Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API)
- Web Audioはユーザー操作内でContextをcreate/resumeし、必ずmute/volume controlを提供する。[MDN: Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

### 2.2 Daily / Weekly / Seasonal layering

- FortniteはDaily（毎日refresh）、Season（週追加）、Milestone（複数stage）を分離し、短期・中期・長期の目的を同時に提示した。[Fortnite: Chapter 3 Season 1 Quests](https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-3-season-1-flipped%3Flang%3Den-US)
- Apple Game Centerはachievement、challenge、recurring leaderboardを再訪・進行確認に使い、daily/weekly resetも例示する。ただし本サイトは競争より個人の発見を主軸にすべき。[Apple Game Center](https://developer.apple.com/game-center/), [Game Center HIG](https://developer.apple.com/design/human-interface-guidelines/game-center?changes=_8)
- Genshinの季節祭は期間限定の景観、複数mini-game、写真探索、収集、物語を一つのfestivalへ束ねる。単純な受取箱より「期間中だけ世界が変わる」方がサイトの世界観に合う。[PlayStation Blog: Genshin 3.1](https://blog.playstation.com/2022/09/16/genshin-impact-version-3-1-a-journey-through-the-desert/)
- Destiny 2のDeck of Whispersは広い活動・quest・hidden placementから同一collectionへカードが集まり、収集とbuild選択を接続する。[PlayStation Blog: Season of the Witch](https://blog.playstation.com/2023/08/22/destiny-2-the-final-shape-and-season-of-the-witch-full-details-revealed/)

### 2.3 Streakは保護し、罰にしない

- Duolingoはdaily habitにstreakを使い、miss時のStreak Freezeを持つ。[Duolingo: Protecting streaks](https://blog.duolingo.com/protecting-streaks-from-site-issues/)
- 一方、FTCのdark pattern資料は、損失不安・grinding・confirm shaming・紛らわしい選択・過剰な通知等が自律性を損なうことを警告する。[FTC: Bringing Dark Patterns to Light](https://www.ftc.gov/reports/bringing-dark-patterns-light)

なおキングダムでの運用原則:

- 取り逃しでcollectionを永久欠損させない
- countdownで焦らせない
- 「来なかったから王が悲しい」等の罪悪感copyを使わない
- streak breakを赤く警告しない
- notificationは任意、頻度選択、即解除可能
- random rewardの確率を隠して反復を煽らない
- 1日一回の希少発見は後日Archiveやseason rerunで回収可能にする

---

## 3. Retention design framework

### 3.1 三つの時間軸

| 時間軸 | 滞在 | 役割 | 例 |
|---|---:|---|---|
| Today | 30秒〜3分 | 今日だけの変化を確認 | Tide, Decree, Encounter, Errand |
| Voyage | 7〜28日 | 少しずつ完成 | Passport, Relic set, Sound Atlas |
| Season | 4〜12週 | 世界の章が進む | 月光祭、クラゲ回遊、王冠修復 |

### 3.2 四つのReturn動機

1. **Curiosity**: 明日は何が漂着するか
2. **Agency**: 今日の選択が小さく残る
3. **Mastery**: GameやOracleの自分史が育つ
4. **Belonging**: 同じ日の王国を訪問者が共有する（個人情報やsocial graphは不要）

### 3.3 共通World State

`KingdomDayState` を日付seedから一度生成し、全ページが読む。

```text
dateKey
seasonId
tide: calm | rising | reverse | luminous | storm | sleeping
depthBand: surface | blue | twilight | abyss
visitor: fish | jelly | ray | crown | unknown
relicId
decreeId
challengeIds[3]
hiddenClueId
soundPaletteId
```

同じstateから背景色・particle量・写真候補・Oracle presentation weight（結果確率は変更しない）・Gameの公平なcosmetic/mutator・音階を導出する。これによりサイト全体が「同じ今日」になる。

---

## 4. Daily Return案 60件

すべて既存Decree/Tide/Relic/Passportと役割が重複しないよう、主行為と報酬を分けた。★は初期優先候補。

### A. World state / living kingdom

1. ★ **Daily Tide Map** — 今日の水深・流向・透明度が全ページの色、粒子、ambient音階に反映される。報酬ではなく世界の変化そのもの。
2. **Passing Shoal Clock** — 一日の決まった数時間だけHOME奥に魚群が通過。後で図鑑から再演可能。
3. **Jellyfish Migration** — 月齢に応じてGallery背景へクラゲ密度が変化し、月一回ピークになる。
4. **Royal Weather Window** — 晴潮・泡雨・金色の曇り・逆流など、海中天気がUI highlightへ弱く影響。
5. **Depth of the Day** — 日ごとにsurface/blue/twilight/abyssを選び、同じ写真にも異なる水中filterを与える。
6. **Visiting Creature** — 日替わりの一匹が各ページのどこかに現れ、見つけると生態メモが開く。
7. **Drifting Object** — 手紙、王冠片、瓶、浮き輪、謎の靴などがページ間を漂う。最後まで追うと短い落ち。
8. **Kingdom Power Level** — 訪問行為で発電するのではなく、今日の王国設備状態を表示。停電日は特別な静かなデザイン。
9. **Palace Room Rotation** — HOMEのportal descriptionが日替わりの王宮部屋として変わり、同じページへ別の物語を付与。
10. **Common Ocean Moment** — seedをUTC/JSTで統一し、全訪問者が同じ「今日の海」を共有。個別trackingなし。

### B. Short daily challenge

11. ★ **Three Royal Errands** — Galleryを1枚見る、Oracleを1回、Gameで泡3個など三つから一つだけ選ぶ。全部やる必要はない。
12. **One-Breath Hunt** — 20秒で画面内の小魚を一匹探す。失敗表示なし、見つけたらSound Atlasを一音解放。
13. **Tide Choice** — 左右二つの潮を選ぶだけ。翌日のDecree detailが選択に応じて少し変わる。
14. **Royal Caption** — 今日の写真に三つの短い題名から一つを選び、Passportへ記録。
15. **Bubble Constellation** — 5個の泡を好きな順に押し、生成された星座名を保存。正解なし。
16. **Quiet Visit** — 30秒サイト内で何も押さず海を眺めると「静観印」。強制待機ではなく任意。
17. **Sound Guess** — proceduralな水音を一回聞き、魚/扉/王冠のどれかを選ぶ。正解後に作り方を表示。
18. **Photo Detail Hunt** — 今日のGallery写真の一部分を見せ、元写真を探す。ヒントは無制限。
19. **King’s Tiny Request** — 「青いものを選べ」「丸いものを探せ」等、UI内で完結する10秒task。
20. **Reverse Day** — 月1程度、challengeの文面だけ上下逆・左右逆など遊びを入れ、accessibility buttonで即通常表示。

### C. Collection / relic / discovery

21. ★ **Relic Cabinet** — Lucky Relicを「今日のラッキー物」から、説明・発見日・発見場所付きcollectionへ拡張。
22. **Crown Fragment Mosaic** — 各ページの初回発見で王冠片が集まり、28片で一枚絵。欠片順は固定せず重複なしbag。
23. ★ **Kingdom Sound Atlas** — HOME/GALLERY/GAME等で発見した短い音を標本として再生できる。SOUND OFF尊重。
24. **Fish Silhouette Book** — 日替わりvisitorを見つけるとsilhouetteが彩色。未発見名は伏せる。
25. **Royal Seal Presses** — 連続日数でなく、異なる行為（見る・遊ぶ・作る・投稿する）ごとの印を収集。
26. **Lost & Found Ledger** — Drifting Objectを見つけるたび、所有者の短文がつながる。
27. **Tide Color Swatches** — 今日の海から3色paletteを保存し、過去の季節色を眺める。
28. **Decree Archive** — 受け取ったDecreeを日付・潮・relicとセットで閲覧。未訪問日も後日「公文書」として埋められる。
29. **Photo Postcards** — Gallery閲覧で写真を解放するのではなく、お気に入りだけ日付とcaption付きで保存。
30. **Oracle Voiceprints** — 結果ではなく演出familyの声紋をcollection。反復抽選を促さないよう一日上限1。

### D. Passport / streak / return protection

31. ★ **Living Passport** — 印に日付だけでなく潮・depth・訪れたpage iconを刻む。
32. **Welcome Back Chapter** — 3日以上空いた時だけ、失った日を責めず「留守中の王国」を一枚の短話で報告。
33. **Rest Day Pearl** — 連続訪問を目標にするユーザー向けに、週2日の欠席を自然な休息としてPearl表示。購入不要。
34. **Seven Different Visits** — 連続7日ではなく、異なる7種類の行為でPassport pageを完成。
35. **Monthly Voyage Page** — 月末に訪問日、写真、relic、Game bestを一枚のdownloadable画像へ。
36. **Anniversary Tide** — 初回訪問日と同じ日付に特別な背景・音。ただし端末内記録のみ。
37. **Return Choice** — 久しぶりの訪問時、「続きから」「今日だけ見る」を選べる。catch-upを強制しない。
38. **Passport Repair** — storage移行失敗時に、手動import/exportから復元。課金や回数制限なし。
39. **Soft Streak Labels** — 1/3/7/14日を「連続」ではなく「潮が続いた」と表現し、途切れてもbest記録は残す。
40. **Season Passport Cover** — 季節ごとに表紙色だけ変わり、過去coverは常時選択可能。

### E. Game / mastery

41. ★ **Daily Fair Current** — Gameの地形spamではなく、予告可能な一つの流れmodifierと固定seedを全員に提供。
42. **Three Skill Medals** — score以外に「無傷」「泡を急がない」「王冠を一個」等、違うplaystyleを称える。
43. **Ghost of Yesterday** — 個人bestの位置を半透明trailで表示。サーバー不要。
44. **Daily 60-Second Dive** — 1分で終わる固定challenge。通常Gameとはscoreを分ける。
45. **Creature Rescue Day** — 特定曜日のみ、避けるだけでなく一匹を出口へ導くcozy variation。
46. **Practice Tide** — Game Overなしの練習日を週一で提示。記録対象外を明記。
47. **Personal Rival Crown** — global leaderboardでなく、自分の過去bestとの差だけを表示。
48. **Current Mastery Log** — 遭遇したpatternを図鑑化し、避け方を記録。死亡をcollection条件にしない。
49. **Game-to-Gallery Souvenir** — clear時のseedとscoreから一枚のprocedural postcardを作る。
50. **Calm Accessibility Challenge** — reduced motion / reduced intensityでも同等に達成できる専用条件。

### F. Hidden / seasonal / random encounter

51. ★ **Hidden Clue of the Day** — 毎日一つ、どのページに秘密があるか曖昧な一文。答えは翌日Archiveで公開。
52. **Royal Wrong Door** — 低確率でportal遷移中に存在しない部屋が1秒だけ見える。発見後は再演可。
53. **Sleeping King Encounter** — 長い無操作を検出して煽るのではなく、HOME滞在中に王が寝るambient event。
54. **Midnight Surface Light** — 端末の夜間だけ明るい月光palette。夜更かしを推奨する報酬は付けない。
55. **Seasonal Migration Arc** — 4週間で魚群がHOME→GALLERY→GAME→HOMEへ移動し、小さな章を形成。
56. **Festival Week** — 期間中はDecree、Gallery frame、Oracle presentation、Sound paletteが一テーマで同期。
57. **Rare but Recoverable Encounter** — 2%の遭遇は一度逃してもseason中に確率が上がり、最終週に必ず見られる。
58. **404 Royal Broadcast** — 月一程度、UI failure風の偽broadcast。操作不能時間は作らず、即skip可能。
59. **Photo Moon Phase** — 同じ写真を月齢に応じたwater-lightで見せ、満月時にcaptionの続きが出る。
60. **Communityless Community Event** — server集計なしで、全員共通seedの「王冠を東へ送る/西へ送る」選択を提示。翌日の物語はseedで決め、実投票と誤認させない。

---

## 5. 推奨ロードマップ

### Phase 1 — local-first foundation

- `naoking-kingdom-state-v1` を導入（version, firstSeen, visits, discoveries, collections, settings）
- date seedを一箇所へ統合
- Daily Tide Map / Living Passport / Decree Archive
- JSON export/importと「この端末の記録を消す」
- storage失敗時はmemory fallback。機能が消えても閲覧・Oracle・Gameは壊さない

### Phase 2 — cross-page loops

- Three Royal Errands
- Relic Cabinet
- Sound Atlas
- Hidden Clue
- Game Daily Fair Current

### Phase 3 — seasons

- 4週間のMigration Arc
- Festival palette / scene / sound
- catch-upとseason archive
- 任意通知はこの段階で初めて検討

### 優先度判定

| 案 | 世界観 | 再訪 | 実装安全性 | 初期優先 |
|---|---:|---:|---:|---:|
| Daily Tide Map | 5 | 4 | 5 | A |
| Three Royal Errands | 4 | 5 | 4 | A |
| Living Passport | 5 | 4 | 4 | A |
| Relic Cabinet | 5 | 4 | 4 | A |
| Sound Atlas | 5 | 4 | 3 | A- |
| Daily Fair Current | 4 | 4 | 3 | B+ |
| Seasonal Migration | 5 | 5 | 2 | B |
| Notification | 2 | 3 | 2 | C（急がない） |

---

## 6. Local progressionの技術計画

### 6.1 保存責任

```text
localStorage
  settings / feature flags / small counters / latest summary

IndexedDB（collectionが大きくなった段階）
  decree archive / relic records / postcards / sound atlas metadata

sessionStorage
  opening seen / current session discoveries / one-session surprises
```

写真本体や音声bufferは保存しない。asset IDと状態だけ保存する。

### 6.2 schema例

```json
{
  "version": 1,
  "firstSeen": "2026-08-31",
  "lastSeen": "2026-08-31",
  "visits": { "days": ["2026-08-31"], "bestFlow": 1 },
  "daily": { "date": "2026-08-31", "completed": [], "choice": null },
  "collections": { "relics": {}, "sounds": {}, "creatures": {}, "clues": {} },
  "seasons": { "2026-autumn": { "chapter": 0, "discoveries": [] } },
  "settings": { "reminders": false, "calmMode": false }
}
```

### 6.3 日付と不正耐性

- これは競争・課金ではないため、時計変更への強いanti-cheatは不要
- JST固定の「王国日付」か端末local日付かを仕様として明記
- 同じtabを跨ぐ同期は`storage` event/BroadcastChannelで十分
- writeは一回のtransaction相当として、parse→validate→copy→write
- 破損時は該当部分だけresetし、全記録を巻き添えにしない

### 6.4 privacy / portability

- 全て端末内であることをUIに表示
- analyticsを導入する場合もcollection内容を送らない
- export JSONは本人が読めるkey名にする
- delete buttonは一段階確認後、即削除
- notification permissionは専用button操作時だけ要求

---

## 7. Sound Identity

共通原則: 「深海高級王国」の音は、低いbuzzを常時鳴らすことではなく、**水の距離・材質・余白**で表現する。

### 7.1 共通音響語彙

| 要素 | 合成 | 意味 |
|---|---|---|
| Water bed | bandpass filtered noise、非常に低gain | 空間の水 |
| Bubble | sine pitch rise + short noise breath | 小発見 |
| Pearl | 1〜3本のsine/triangle partial | 保存・収集 |
| Crown | inharmonic bell + gold chord | 王国の権威・大報酬 |
| Pressure | low-mid filtered pulse、短時間のみ | 緊張 |
| Current | noise filter sweep + pan | 移動 |
| Archive | paper-like noise + muted click | 記録 |
| Secret | silence gap + distant partial | 隠し発見 |

常時40〜80Hzを鳴らさない。subはimpactの瞬間だけ。ambienceは主に220Hz以上、必要時だけlow-midへ降りる。

### 7.2 HOME

- Identity: 開けた海、王国の呼吸
- Base: 400〜900Hzの薄い水床、ゆっくり左右へ動く2音、遠いbubble
- Start: surface→underwaterの短いfilter descent
- Daily reveal: Tideに応じて二音motifの2音目だけ変化
- Stop: 0.4秒で水床をfade、transition currentへhandoff
- 禁止: 常時王冠fanfare、頻繁なbubble、sub drone

### 7.3 ORACLE

- Identity: 儀式、機械、異常、評決
- Base: Oracle専用bus。reel/signal/tension/eventとresultを段階化
- Start: reel launch → witness stop → tension
- Scene: `detail.scene` + `detail.beat` の宣言型cue
- Result: normal/loss/winを必ず確定結果objectから一回だけ
- Stop: `oraclestop`/pagechangeでvoice・timer・silence解除
- Silence/freeze: Oracle busのみ。HOME ambientやUIを巻き込まない

### 7.4 GALLERY

- Identity: 記憶、水中写真室
- Base: ambience最少。写真を邪魔しない高域のair-water
- Photo next/prev: 小さな水滴ではなく、方向付きのsoft film slide
- Favorite/Postcard: muted pearl + paper tail
- Gallery open: room toneを0.6秒で狭くする
- Close: HOME/Page ambientへcrossfade

### 7.5 GAME

- Identity: 泳ぐ身体、酸素、危険の予告
- Base: rhythmではなく移動速度に追随するfiltered current
- Gameplay cue: pickup / rare / crown / oxygen / pattern / near-miss / damage / death / clear
- Warningは視覚が主、音は方向と緊急度を補助
- Stop: exit/game-over/pagechange/visibility hiddenでgame busとtimerを即解放
- Daily modifier音は開始時に一度だけ説明motif。常時追加しない

### 7.6 VRChat / VIDEOS

- Identity: 王国外から届く放送、記録映像
- Base: 900〜2400Hzのごく薄いbroadcast air、音声再生がある場合は即duck
- Card focus: 1音のbroadcast tick
- Video start: サイトambientを-12dB duck。動画音声を妨げない
- Video stop/page leave: duck解除、埋込playerがあればpause messageを検討

### 7.7 RECORD / HISTORY / ARCHIVE

- Identity: 保存、時間、紙と真珠
- Base: 無音に近い。操作時だけdryなarchive click
- New record: 低い木質click + pearl partial
- Set complete: 3音の上昇、1秒以内
- Past item preview: 自動再生しない。Sound Atlasは押した時だけ

### 7.8 DECREE / JOIN / DOCUMENT

- Identity: 公文書、印章、少し不条理
- Base: ほぼ無音
- Section enter: 紙を開くfiltered noise
- Seal: 低い一回のstamp + short room response
- Secret decree: silence 80ms → very distant crown partial

### 7.9 SUBMIT

- Identity: 港の受付
- Select: soft container click
- Upload progress: loop音を使わず、25/50/75%の節目だけ任意cue
- Success: pearl chord
- Error: 強いalarmでなく、下降2音。連打を煽らない

### 7.10 Daily / Seasonal layer

- Daily Tideは各page Identityのpitch palette/filterを変えるだけで、独立loopを重ねない
- Seasonはmotif intervalと一つのtextureだけ変更
- Hidden Encounterは通常音を止めるのでなく、一瞬の空白または定位移動で気づかせる

---

## 8. Scene start / transition / stop / cleanup契約

### 8.1 推奨event contract

```js
naoking:soundscene
detail = {
  owner: 'home|oracle|gallery|game|vrchat|record|decree|submit|daily|seasonal',
  action: 'start|beat|transition|duck|unduck|stop',
  scene: 'daily-tide|relic-found|gallery-open|...',
  beat: 'intro|loop|discover|complete|exit',
  intensity: 0..1,
  durationMs,
  seed,
  cause
}
```

`owner`単位のbus/voice/timerを持ち、別ownerを停止しない。Oracle/Gameの既存eventはadapterでこの内部contractへ写せる。

### 8.2 lifecycle

```text
user gesture → unlock one AudioContext
page enter → start(page owner)
feature open → duck(page owner), start(feature owner)
feature beat → schedule against context.currentTime
feature close → stop(feature owner), unduck(page owner)
page change → stop(all previous page owners), start(next owner)
visibility hidden/pagehide → stop all transient voices/timers, suspend context
visibility visible + sound enabled → resume after policy allows, reconstruct only current base scene
```

### 8.3 cleanup invariants

- owner stop後: voices=0, timers=0, silence=false, duck gain=1
- stale `setTimeout` はtoken/generationで無効化
- AudioParam scheduled valueをcancelしてからreset
- loop sourceは必ずstop + disconnect
- `URL.createObjectURL`等を音に使う場合はrevoke（現状proceduralなら不要）
- pagechange中に古いsceneのrevealを発火させない
- SOUND OFFは60〜80ms fade後に全owner停止・suspend
- reduced-motionは音を必ずmuteする意味ではないが、長いwhoosh・連打・左右の激しい移動を短縮
- compact/mobileはvoice budgetを下げる

### 8.4 ducking priority

```text
critical warning > Oracle result / Game clear > dialog/video > discovery > UI > ambient
```

同時に鳴らすのは「base + foreground + UI」の最大3階層。Daily/Seasonalはbaseを変調するだけで新しいloopを追加しない。

---

## 9. 外部音源候補とライセンス

結論: **初期実装は外部音源なし、proceduralを推奨**。王国固有motif、軽量、loop継ぎ目、license管理、offline、GitHub Pages配信の全てで有利。

どうしても実録の水・紙・金属が必要な場合のみ、以下を候補にする。

| Source | 採用条件 | Credit | 再配布条件 / 注意 |
|---|---|---|---|
| [Freesound](https://freesound.org/help/faq/) | 個別assetが**CC0**のものだけを選ぶ | CC0は不要だが、作者・URL・取得日を`AUDIO-CREDITS.md`へ記録推奨 | FreesoundにはCC BY/CC BY-NCも混在。検索結果でなく各asset licenseを保存し、元wavとlicense snapshotを保管 |
| [OpenGameArt CC0](https://opengameart.org/content/cc0-2) | asset pageがCC0明記 | 不要。ただし作者・URL記録推奨 | サイトは複数license混在。CC-BY-SA/GPL等を誤ってbundleしない。各asset単位で確認 |
| [Pixabay](https://pixabay.com/service/terms/) | CC0の旧contentか、Content Licenseを法務確認して組込 | 通常不要 | 非CC0はstandalone再配布禁止。Web bundle内の元音源抽出可能性を考えると優先度低。Content IDリスクも確認 |
| BBC Sound Effects | 原則不採用 | 条件依存 | RemArcはpersonal/educational/research中心で、一般公開サイトへの再配布・commercial利用に不向き |

素材を入れる場合の必須台帳:

```text
asset file / source page / author / exact license / license URL
download date / original filename / edits / attribution text
redistribution allowed? / commercial allowed? / share-alike? / source snapshot
```

「royalty free」はlicense名ではない。YouTube抽出、出所不明pack、AI生成サービスの規約不明音、ゲームからのrippingは使わない。

---

## 10. 計測と評価

サーバーanalyticsなしでも、dev simulationと任意local diagnosticsで品質を測れる。

### Retention UX

- Daily stateの組合せが90日で不自然に反復しない
- 一日の所要時間中央値を30秒〜3分に収める
- 欠席後も全機能へ即戻れる
- collectionに永久missがない
- challengeは三つ全部でなく一つで完了
- notificationなしでも今日の変化がHOMEで分かる

### Storage

- localStorage不可/満杯/JSON破損でsite閲覧が壊れない
- 日付跨ぎ、timezone変更、DST、端末時計逆行
- 複数tabで最後のwriteが他のcollectionを消さない
- v1→v2 migrationとrollback
- export→clear→importで一致

### Audio

- 初回は無音、gesture後のみ開始
- SOUND OFF/volumeが全sceneで尊重される
- pagechange/hidden/pagehideで残音なし
- owner stopが別ownerを止めない
- video/dialog中のduckが復帰する
- mobile voice上限超過なし
- reduced-motion時に長いsweep/連打が短くなる
- Daily/Seasonal layer追加で常時低音buzzが戻らない
- 30分放置でvoice/timer/nodeが増加しない

### 倫理チェック

- missed dayを赤く罰しない
- loss aversion copyを使わない
- reminderはopt-in・頻度選択・解除容易
- random encounterの回収手段を用意
- collectionと支払いを結びつけない
- 子どもを含む訪問者へ個人情報・連絡先共有を求めない

---

## 11. 最終推奨仕様

```text
HOMEで今日のTide / Decree / 3 Errandsを確認
  ↓
好きな一つだけ行う
  ↓
Relic / Sound / Creature / Postcardのどれか一つを発見
  ↓
Living Passportへ「今日の物語」として保存
  ↓
翌日、World Stateと短い続きが変化
```

このloopなら、報酬を受け取るためにサイトを開くのではなく、**今日の王国がどうなっているか見に来る**体験になる。既存のDecree/Tide/Relic/Passportを核として活かしながら、HOME、ORACLE、GALLERY、GAME、VRChat、RECORDが一つの海の一日に属する。Soundはその接着剤として機能し、画面を見なくても「どの場所にいて、何を発見したか」が分かる。

