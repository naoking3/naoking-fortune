# WORLDWIDE CREATIVE RESEARCH

NAOKING KINGDOM 向け Creative Website / Creative Coding / Experimental UI 調査メモ  
調査日: 2026-08-31（Asia/Tokyo） / 調査範囲: 2025–2026 を中心に、現在も参照価値がある基盤事例を補助採用

## Machine-readable manifest

```yaml
document: WORLDWIDE-CREATIVE-RESEARCH
researched_at: 2026-08-31
case_rows: 66
case_rows_2025_or_2026: 47
system_rows: 22
naoking_idea_rows: 120
chaos_idea_rows: 36
case_id_pattern: "^\\| CASE-[0-9]{3} \\|"
system_id_pattern: "^\\| SYS-[0-9]{2} \\|"
idea_id_pattern: "^\\| IDEA-[0-9]{3} \\|"
chaos_id_pattern: "^\\| CHAOS-[0-9]{2} \\|"
source_policy: official_live_or_creator_case_study_first
copyright_policy: principles_only_no_visual_or_name_copying
```

## 調査方法と読み方

- 公式ライブサイト、制作者自身のケーススタディ、公式プロダクト文書、主催団体の公式受賞記録を優先した。CSS Design Awards / Webby / FWA は受賞年の確認に使い、構造の主張は可能な限り制作者資料で照合した。
- `2025` / `2026` は公式資料で公開・稼働・受賞のいずれかが確認できた年。`current` は 2026-08-31 に公式ページが現存するが公開年を断定できないもの。日付を推測していない。
- `Evidence` は一次資料に明記された事実または直接読める情報だけ。`NAOKING principle` はそこからの独自設計翻訳であり、元作品の固有名、画面構成、キャラクター、文言、音、3Dモデル、シェーダーを転用しない。
- 動的ブラウザ実体を利用できなかったため、公式ページ本文・メタデータ・制作側の技術説明を直接取得して確認した。見えていない動きは断定せず、`Risk / verify` に実機確認事項を残した。
- 分解タグ: `LAY` layout、`TYPE` typography、`NAV` navigation、`CAM` camera、`SCR` scroll、`DEP` depth、`LYR` layering、`LGT` light、`SHD` shader、`PRT` particle、`TRN` transition、`SND` sound、`INT` interaction、`DAY` daily、`GAME` gamification、`SUR` surprise、`RET` return motivation。

## 1. Worldwide case ledger

| ID | Year | Region / maker | Official or primary source | Axes | Evidence directly confirmed | NAOKING principle（独自翻訳） | Risk / verify before use |
|---|---:|---|---|---|---|---|---|
| CASE-001 | 2025 | US / Daybreak Studio | Dropbox Brand — [creator case](https://www.daybreak.studio/work/dropbox), [official CSSDA 2025 result](https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/) | LAY TYPE SCR LYR TRN INT SUR | CSSDA は遊べるカラフルなスクロール体験、Daybreak は Dropbox のブランド案件として掲載。 | 王国の整然とした基盤の上に、触るとだけ崩れる色面を置く。「平常」と「遊び」を同一画面で両立。 | 高彩度面のコントラスト、画像・映像量、スクロール依存の代替導線を実機確認。 |
| CASE-002 | 2025 | UK / Unseen Studio | Symphony of Vines — [official experience](https://symphonyofvines.unseen.co/), [creator year review](https://2025.unseen.co/) | NAV CAM SCR DEP LYR LGT SHD PRT TRN SND INT SUR | 氷河・川・潮・土の4章。押し続けて道を刻む、流れを指揮する等、章ごとに動詞が変わり、章スキップと音がある。 | 一つの操作を延々使わず「章ごとに入力文法を交換」。Oracle の結果は不変、旅の触感だけを変える。 | WebGL・音・長尺導入を任意化。低性能では静止画＋同じ章選択へ縮退。 |
| CASE-003 | 2025 | Monaco / Apart & Uprising | Charles Leclerc — [official site](https://charlesleclerc.com/en/), [official CSSDA result](https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/) | LAY TYPE NAV CAM SCR DEP LYR TRN INT | 章ナビ、`Scroll to explore / Swipe right`、表示切替、写真タイムラインを公式サイトで確認。 | 王の年代記を「直線年表」と「軌道ビュー」の二眼にする。入力方法を画面内で明示。 | 横・縦スクロール競合、キーボード操作、履歴URL、モバイルのスワイプ誤発火を検証。 |
| CASE-004 | 2025 | International / The Monolith Project team | The Monolith Project — [official site](https://themonolithproject.net/), [Communication Arts project record](https://www.commarts.com/project/38626/the-monolith-project) | NAV CAM SCR DEP LGT SHD TRN SND INT SUR | 技術進化を巡るインタラクティブ作品。制作者公表では Three.js / React Three Fiber / GSAP / WebGL とオリジナル音源。 | 「石碑」を模倣せず、結果までの歴史を抽象的な王国遺物の層として見せる。 | 技術史の固有演出は転用しない。ロード時間、音の同意、GPU喪失復帰を設計。 |
| CASE-005 | 2025 | France / Bruno Simon | Bruno Simon Portfolio — [official site and source terms](https://bruno-simon.com/) | NAV CAM DEP LYR LGT SHD PRT SND INT GAME SUR RET | 車で移動するWebGPU/Three.js空間、秘密要素。ソースはMIT、Blenderデータ公開、音楽はCC0と公式記載。 | 探索は本筋を塞がない「寄り道」に限定。王国の小道で秘密印を集めても占い結果は変えない。 | 3D移動酔い、操作学習、タッチ入力、低性能端末を平面マップへフォールバック。 |
| CASE-006 | 2025 | Europe / Studio Size + RISE2 | Exat Typeface — [official microsite](https://exat.hottype.co/), [foundry page](https://hottype.co/fonts/exat) | LAY TYPE NAV SCR LYR TRN INT | 可変ウェイト・幅のテスター、1715 glyphs/style、グリッドとアート画像を公式ページで確認。 | 王国見出しの可変軸をスクロール速度ではなく明示スライダーで試せる「活字工房」にする。 | 書体自体は商用。ライセンス購入と日本語代替、CLS、可変フォント容量を確認。 |
| CASE-007 | 2025 | France / Merouane Bali | Merouane Bali Portfolio — [official CSSDA project record](https://www.cssdesignawards.com/woty2025/sites/merouane-bali-portfolio/) | LAY TYPE CAM SCR DEP SHD TRN INT | CSSDA は one-page / responsive / WebGL の没入型ポートフォリオとして記録。 | 一ページでも「今どこか」を失わせない固定座標と章番号を持たせる。 | 制作者側の技術詳細未確認。動作・アクセシビリティを採用前に実機で再調査。 |
| CASE-008 | 2025 | France / Lacoste + Merci-Michel | Lacoste Members Experience — [official loyalty page](https://www.lacoste.com/us/members-week.html), [creator announcement](https://www.linkedin.com/posts/merci-michel_what-a-great-honour-lacoste-members-experience-activity-7302643168921935873-9zhR) | LAY NAV TRN INT GAME SUR RET | 会員が柄・ステッカーを組み、投票し、選出作が限定品になる参加構造を公式ページで確認。 | 王国の紋章工房で装飾案を作り、投票は見た目の展示順だけに反映。占い結果・有利不利とは切り離す。 | 会員限定・UGC権利・モデレーション・人気順の偏りを管理。 |
| CASE-009 | 2025 | US / Konpo | ComPsych Brand Hub — [creator case](https://www.konpo.studio/work/compsych) | LAY TYPE NAV LYR LGT TRN INT | 制作側は専用インタラクティブ Brand Hub、昇る地平線と発光コア、開かれたブランドシステムを説明。 | 中央の「Oracle core」を状態の唯一の発光源にし、周囲のUIはその光を受ける従属層にする。 | 光だけで状態を伝えずテキスト・形状・ARIAを併記。ブルーム量を制限。 |
| CASE-010 | 2025 | Portugal / Bürocratik | We Are Büro — [official studio site](https://burocratik.com/), [creator launch note](https://www.linkedin.com/posts/burokratik_unbelievably-we-finally-have-a-proper-website-activity-7304874206092025857-sJPZ) | LAY TYPE NAV SCR DEP LYR SHD TRN SND INT | 制作会社自身の新サイト。公式受賞記録は grid / video+sound / WebGL を評価。 | グリッドを壊すのはイベント時だけにし、終了後に元の列へ正確にスナップバック。 | 音・動画自動再生禁止、WebGLなしでも作品一覧が読めるDOM順を維持。 |
| CASE-011 | 2025 | UK / Unseen Studio | Year in Review 2025 — [official site](https://2025.unseen.co/) | LAY TYPE NAV SCR LYR TRN INT DAY SUR RET | 月別のスクロール年表、月マーカー、hover reveal、個別実験への `Open` を直接確認。 | 毎日ではなく「王国暦」の節目を蓄積し、再訪時は未読月へ戻す。 | 年表は深いリンクとスキップを用意。hover-onlyを避け、タップ・フォーカスで同等表示。 |
| CASE-012 | 2025 | Global / L'Oréal + Unseen | Salon of the Future — [creator year review, January](https://2025.unseen.co/) | LAY NAV DEP LYR LGT TRN INT SUR | 2025年1月のWeb案件として制作側が公式年表に掲載。 | 未来の宮廷サロンを「機能を試す小部屋」の集合にし、全室巡回を強制しない。 | 詳細ケース未公開のため視覚仕様を推測しない。採用前にライブ動作を再確認。 |
| CASE-013 | 2025 | US / Netflix + Unseen | Netflix Jobs redesign — [official jobs site](https://jobs.netflix.com/), [creator year review, March](https://2025.unseen.co/) | LAY TYPE NAV SCR LYR TRN INT | 2025年3月公開の採用サイト再設計を制作側年表で確認。 | 強い世界観の中でも探索目的を最短で達成できる「業務導線優先」原則を採る。 | 装飾より検索・フィルタ・読み上げ順を優先。映像は遅延読込。 |
| CASE-014 | 2025 | UK / Unseen Studio | Petal Particles R&D — [creator year review, February–April](https://2025.unseen.co/) | PRT LYR LGT SHD INT SUR | 制作側が petal particle と interactive petal experiments を月別に公開。 | 花弁コピーではなく、王国の微小紋章をポインタの後流へ疎に流す。 | 粒子上限、deviceMemory/DPR段階、reduced-motionで静止模様に切替。 |
| CASE-015 | 2025 | Europe / BlueYard + Unseen | BlueYard — [official site](https://blueyard.com/), [creator year review, April](https://2025.unseen.co/) | LAY TYPE NAV SCR LYR TRN INT SUR | `Utopia or Oblivion?` の二極問い、5領域ナビ、ポートフォリオ群を公式サイトで確認。 | 二択の物語フックを入口に使いつつ、回答に優劣や結果バイアスを持たせない。 | 強い二項対立を誤情報にしない。主要情報へ常時アクセス可能に。 |
| CASE-016 | 2025 | UK / Unseen Studio | Cellular Experiment — [creator year review, April](https://2025.unseen.co/) | DEP LYR SHD PRT INT SUR | `cellular experimentation` を制作側の公式R&Dとして掲載。 | セル模様を運勢の背景生態系にし、結果確定後は成長を止めて可読性を戻す。 | 実装詳細は非公開。高周波点滅を避け、低GPUはCSSグラデーション。 |
| CASE-017 | 2025 | Asia / Klook + Unseen | Experience the Best You quiz — [creator year review, April](https://2025.unseen.co/) | LAY TYPE NAV TRN INT GAME SUR RET | インタラクティブquizが初月100万unique visitsと制作側が公表。 | 3問の「王国気質診断」は結果を変えず、演出テーマだけを選ぶオンボーディングにする。 | 診断を科学的・人格的断定にしない。スキップ・修正・データ非保存を明示。 |
| CASE-018 | 2025 | US / Topology + Unseen | Topology — [official site](https://www.topology.vc/), [creator year review, May](https://2025.unseen.co/) | LAY TYPE NAV SCR LYR TRN INT | 2025年5月公開を制作側年表で確認。 | 投資会社固有表現は使わず、複雑な王国地区を一定の座標規則で整理する情報地形の考え方だけ採る。 | 公式本文が取得できないため動きの詳細は未断定。実機確認必須。 |
| CASE-019 | 2025 | UK / Moonlake + Unseen | Moonlake — [creator year review, May–June](https://2025.unseen.co/) | LAY CAM SCR DEP LYR TRN INT SUR | unique design exploration と hover-based reveal R&D を制作側が同時期に掲載。 | ポインタで「裏層」が覗く窓を作り、タッチでは押下中のみ開く。 | hover-only禁止。裏層もDOMでは重複読上げしない。 |
| CASE-020 | 2025 | Belgium / KIKK + Unseen | KIKK Festival 2025 — [official festival site](https://www.kikk.be/), [creator year review](https://2025.unseen.co/) | LAY TYPE NAV SCR LYR TRN INT SUR RET | `TRUE/FALSE` 主題、プログラム、パス、インスタレーションを質問型タイポで編成。 | 真偽の揺らぎを文字の反転で示すが、ボタンの意味・結果の真偽は決して曖昧にしない。 | 反転文字の読み上げ・言語切替・チケット導線を最優先。 |
| CASE-021 | 2025 | Global / Poly + Unseen | Poly — [official site](https://poly.app/), [creator year review, November](https://2025.unseen.co/) | LAY TYPE NAV TRN INT | 2025年11月公開を制作側年表で確認。 | 機能密度の高い箇所では世界観を後退させ、操作ラベルを前面に置く「演出濃度スイッチ」。 | 製品固有UIをコピーしない。機能名・状態・フォーカスを優先。 |
| CASE-022 | 2025 | Global / OceanX + Unseen | OceanX 2025 Year in Review — [official site](https://2025.oceanx.org/), [creator year review](https://2025.unseen.co/) | LAY TYPE NAV CAM SCR DEP LYR TRN SND INT RET | 7章の世界タイムライン、章へ戻る、`Keep Exploring`、写真群、共有、2026への継続を直接確認。 | Oracle履歴を7枚の遠征記録に凝縮し、任意の章から再開・共有できる。 | 長文はHTMLで保持。3D/映像がなくても章移動と内容が成立すること。 |
| CASE-023 | 2025 | US / Netflix + Powster | Netflix House — [creator case](https://www.powster.com/case-study/netflix-house/) | LAY NAV CAM SCR DEP LYR TRN SND INT SUR RET | 制作側は物理会場と物語世界をつなぐ scrolling experience / conversion engine と説明。 | 画面内の王国と実際の次行動を同一旅程でつなぐが、CTAは物語の外形でも識別可能にする。 | ブランド作品の固有世界を転用しない。位置情報・予約導線は明示同意。 |
| CASE-024 | 2025 | France / Undream Studio | The Silence Museum — [creator case, 2025-04-14](https://www.undreamstudio.com/projects/the-silence-museum/) | LAY CAM SCR DEP LYR LGT SHD TRN SND INT | Blender 3D、Three.js/WebGL、camera animation、preloader、scroll transitions、interactive media、progressive loading/fallback を制作側が明記。 | 「静寂」を模倣せず、情報密度を段階的に落とす休息室として転用。 | preloaderに残時間・skip、映像字幕、音のon/off、静止HTML fallback。 |
| CASE-025 | 2025 | Japan / Expo 2025 | Expo 2025 Thematic Project — [official project page](https://www.expo2025.or.jp/en/project/) | LAY NAV DEP LYR LGT TRN SND INT SUR | `Resonance of Lives`、interactive tech、digital body/infinity mirror、変形彫刻・景観を公式説明で確認。 | 鏡コピーではなく、訪問者の選択履歴を「共鳴する輪郭」に変えるが生体推定はしない。 | 展示規模をWebへ直輸入しない。カメラ・マイク不要の代替入力を用意。 |
| CASE-026 | 2025 | UK / National Trust + Glitch | Blossom 2025 AR — [official National Trust page](https://www.nationaltrust.org.uk/visit/london/national-trust-london-x-glitch-for-blossom-2025) | NAV CAM DEP LYR LGT PRT TRN INT DAY GAME SUR RET | AI/ARのデジタル花木、5樹種・季節差、インタラクティブmap、教育・mindfulnessを公式説明で確認。 | 季節で王国の樹形が変わるが、毎日来ないと損をする設計にしない。図鑑は後追い解放可能。 | AR非対応・位置情報拒否時も2D地図。AI生成物の出典・権利確認。 |
| CASE-027 | 2025 | Global / Spotify | 2025 Wrapped — [official product announcement, 2025-12-03](https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/) | LAY TYPE NAV TRN SND INT GAME SUR RET | speed調整、特定場面へ戻る、Top Song Quiz、月別順位Sprint、Leaderboard、Clubs、share cardsを公式説明で確認。 | Oracle履歴を個人年鑑へ可視化。比較順位で煽らず「自分の変化」と共有カードを中心にする。 | 個人データ透明性、削除、共有前preview。leaderboardは原則不採用。 |
| CASE-028 | 2025 | Global / Spotify | Wrapped Party — [official guide, 2025-12-03](https://newsroom.spotify.com/2025-12-03/wrapped-party-how-to/) | NAV TRN SND INT GAME SUR RET | 2–10人、host進行、待合室、emoji、可変award pool、終了後replay、退出後非保存を公式説明で確認。 | 共同閲覧時は「同じ結果の見せ方を皆で開く」同期劇場にし、他者との勝敗を作らない。 | 同席者へのデータ開示同意、退出・非保存・年齢配慮、host依存の救済。 |
| CASE-029 | 2025 | Global / GitHub | GitHub Skyline — [official engineering article, 2025-01-15](https://github.blog/developer-skills/application-development/how-we-built-the-github-skyline-cli-extension-using-github/) | LAY CAM DEP LYR LGT INT GAME RET | contribution graphを3D skyline / STLへ変換する公式CLIの構築過程を公開。 | 行動履歴を物理的高さにせず、王国の街並み密度として穏やかに記念化。 | 活動量を価値と同一視しない。空白日も「休息庭園」として肯定。 |
| CASE-030 | 2025 | Global / Climate TRACE | Climate TRACE map — [official site](https://climatetrace.org/), [official Webby 2025 winners release](https://www.webbyawards.com/press/press-releases/29th-annual-webby-awards-announce-2025-winners/) | LAY TYPE NAV CAM DEP LYR INT DAY RET | 世界排出データを地図・施設・セクターで探索する現行公式サイト。Webby 2025受賞者として公式発表。 | 大量のOracle履歴を地図ではなく「王国星図」に集約し、overview→detailを維持。 | 実データ可視化の色意味を装飾に流用しない。凡例、表形式、キーボード代替。 |
| CASE-031 | 2025 | US / NASA | NASA Eyes — [official NASA Webby winners reference](https://www.nasa.gov/reference/nasa-webby-award-winners/), [official Eyes portal](https://eyes.nasa.gov/) | NAV CAM DEP LYR LGT INT DAY SUR RET | NASA公式のリアルタイム/ミッション別3D可視化群と受賞記録。 | 「今」の王国空模様を低頻度で更新し、毎回訪問時に同一でない天球背景を生成。 | 科学可視化の見た目をコピーしない。精密3Dはoptional、表と画像を用意。 |
| CASE-032 | 2025 | Global / Google | Doodles — [official Doodles archive](https://doodles.google/) | LAY TYPE NAV TRN SND INT DAY GAME SUR RET | 日付・地域ごとに変わる公式ロゴ体験と検索可能なアーカイブ。 | ロゴ改変ではなく、王国門の小さな日替わり「紋章印」を履歴化。機能位置は動かさない。 | 毎日の新規資産負荷を抑え、意味のあるalt・一時演出を閉じる手段。 |
| CASE-033 | 2025 | France / Immersive Garden | Immersive Garden portfolio — [official studio site](https://immersive-g.com/), [official Webby winner record](https://winners.webbyawards.com/2025/websites-and-mobile-sites/features-design/best-visual-design-aesthetic/333859/immersive-garden) | LAY TYPE NAV SCR DEP LYR LGT SHD TRN SND INT | 作品カード、音on/off、3D/物語案件群を公式ポートフォリオで確認。2025 Webby visual design winner。 | 強いヒーローの後に可読なケース一覧へ着地する二層構造。 | 音の初期値off、プロジェクト一覧を検索可能なHTMLに。 |
| CASE-034 | current | France / Immersive Garden | Louis Vuitton VIA — [creator case](https://immersive-g.com/projects/louis-vuitton-1) | CAM DEP LYR LGT SHD TRN SND INT SUR | photoreal 3D、virtual trunk、dynamic effects、glitch transitions、sound、waitlistを制作側が明記。 | 高級品固有表現は使わず、「宝箱を開く前後」でUI層が組み替わる原理だけ採る。 | NFT/ブランド要素を転用しない。glitchは1秒未満、点滅基準、静的詳細ページ。 |
| CASE-035 | current | France / Immersive Garden | David Whyte Experience — [creator case](https://immersive-g.com/projects/david-whyte-experience) | TYPE CAM SCR DEP LYR SHD TRN SND INT | 動的水彩、3D WebGL、custom soundscapeで詩と人生を語ると制作側が説明。 | 水彩コピーではなく、Oracle文の余白にゆっくり滲む「記憶インク」を使う。 | 詩・絵・音の権利を独自制作。文章可読性、音なしの情緒等価。 |
| CASE-036 | current | France / Immersive Garden | Chartogne-Taillet — [creator case](https://immersive-g.com/projects/chartogne-taillet-1) | NAV CAM DEP LYR PRT TRN SND INT | 手描き地図、hoverで区画史、watercolor particle、low-poly 3D、device最適化を制作側が明記。 | 王国地区を手描き風「意味地図」にするが、地理形状・画風は独自生成。 | hover代替、粒子密度、低ポリでも日本語ラベルが読めること。 |
| CASE-037 | current | France / Immersive Garden | Cartier in Time — [creator case](https://immersive-g.com/projects/cartier-in-time) | LAY NAV CAM SCR DEP LYR TRN SND INT SUR | 時計針発想の12作品carousel、grid menu、暗所へzoom-outする終幕を制作側が説明。 | 時計・ブランド固有表現を避け、12の王国時刻を円環ナビと一覧表の両方で開く。 | 円環だけに依存しない。前後ボタン、現在位置、直接選択、reduced-motion。 |
| CASE-038 | current | France / Immersive Garden | Aten7 / Toom Archives — [official portfolio description](https://immersive-g.com/) | NAV CAM DEP LYR LGT TRN SND INT SUR | 公式ポートフォリオが「秘密とEVAの台頭を辿るimmersive archives」と説明。 | 秘密資料の雰囲気だけを抽象化し、重要情報を隠さない任意アーカイブへ。 | 詳細技術は未公開。アクセシビリティと負荷を実機再調査。 |
| CASE-039 | current | France / Immersive Garden | Dioriviera — [official portfolio description](https://immersive-g.com/) | CAM DEP LYR LGT SHD TRN SND INT | 3D journeyでデザインを提示する案件として公式掲載。 | ファッション固有表現を避け、Oracle装束を360度ではなく3段の軽量レイヤーで試着表示。 | 商標・意匠を独自化。端末傾き入力を必須にしない。 |
| CASE-040 | current | France / Immersive Garden | Longines Spirit Zulu Time — [official portfolio description](https://immersive-g.com/) | NAV CAM SCR DEP LYR TRN SND INT | 航空開拓者の物語を巡るWeb experienceとして公式掲載。 | 実在人物・時計表現を使わず、王国使節の航路をスクロールで結ぶ。 | 歴史を装飾化しない。テキスト版年表とskip。 |
| CASE-041 | current | Saudi Arabia / Masar + Immersive Garden | Masar Destination — [official portfolio description](https://immersive-g.com/) | LAY NAV CAM DEP LYR LGT TRN INT | 都市中心の将来像を没入体験として紹介する案件を公式掲載。 | 全体計画→地区→部屋の3段ズーム規則を王国情報設計へ転用。 | 巨大モデルを避け、タイル/LOD/静止鳥瞰図。 |
| CASE-042 | current | Switzerland / OMEGA + Immersive Garden | OMEGA Space Sustainability — [official portfolio description](https://immersive-g.com/) | LAY NAV CAM DEP LYR LGT TRN INT | 宇宙とsustainabilityの旅を公式ポートフォリオに掲載。 | 宇宙ブランド表現を使わず、運勢の長期影響を軌道ではなく重なる時間帯で示す。 | 環境主張は検証可能な情報だけ。派手な背景と本文コントラストを分離。 |
| CASE-043 | current | France / Orano + Immersive Garden | Orano — [official portfolio description](https://immersive-g.com/) | LAY NAV DEP LYR TRN INT GAME | interactive wireframes と gamified zonesで安全に区域を巡ると公式説明。 | 危険区域ゲームを模倣せず、複雑な設定を「安全な練習場」で試してから本番へ戻す。 | 安全情報をゲーム化しない。完了報酬なし、いつでも離脱可。 |
| CASE-044 | current | France / Artisans d’Idées + Immersive Garden | Artisans d’Idées — [official portfolio description](https://immersive-g.com/) | TYPE NAV CAM SCR DEP LYR TRN SND INT | art / history / storytellingを融合するinteractive journeyとして公式掲載。 | 工芸品のコピーでなく、Oracleカードの制作工程を素材→線→文字の順で見せる。 | 制作工程は任意。本文をcanvas内に閉じ込めない。 |
| CASE-045 | current | Global / Hatom + Immersive Garden | Hatom — [official portfolio description](https://immersive-g.com/) | CAM DEP LYR LGT SHD TRN SND INT | 暗号資産platformの進化をsymbolic storytellingで伝える体験として公式掲載。 | 金融記号を使わず、抽象シンボルが意味を得る「三段変態」だけ採用。 | 金融連想・誤認を避ける。点滅・ブルーム・音を任意化。 |
| CASE-046 | 2026 | US / Active Theory | Active Theory V5 — [official site](https://v5.activetheory.net/) | LAY NAV CAM DEP LYR LGT SHD TRN SND INT | websites/apps/installations/VR/ARを社内制作し、performance / efficiencyを重視と公式記載。 | 技術を前面に出さず、同じ物語状態をDOM/CSS/WebGLの3品質で共有する。 | ケース本文が少ないため動きは実機再確認。最低品質を製品要件にする。 |
| CASE-047 | 2026 | US / Active Theory | XR Experiments — [official lab](https://xr.activetheory.net/) | CAM DEP LYR LGT SHD PRT TRN INT SUR | orb/bloom/transparency、spherical-harmonic GI、GPU particles、PBR、meshing、post-processing、zero-gravity physicsの実験群。 | 全技術を同時使用せず、場面ごとに主役1 effect＋補助1 effectへ制限。 | XR権限、発熱、酔い、GPU差。2Dポスター版を常備。 |
| CASE-048 | current | UK / Lusion | Open Continents — [creator case](https://v2.lusion.co/work/open-continents/) | NAV CAM DEP LYR LGT SHD TRN SND INT | 3D globe、clickable pins、global storytelling、WebGLを制作側が説明。 | 地球儀をコピーせず、王国を包む「情報球」に地域別Oracle断片を留める。 | 球体ナビは補助。リスト、検索、キーボード、低精度モデル。 |
| CASE-049 | current | Global / Coca-Cola + Lusion | The Soda Experience — [creator case](https://v2.lusion.co/work/coca-cola-the-soda-experience/) | CAM DEP LYR SHD PRT TRN INT SUR | WebAR、custom render pipeline、8th Wallを制作側が説明。 | 商品・泡表現を転用せず、任意ARで王国紋章を机上に置く。 | ARは追加体験。カメラ拒否時のWebGL/PNG、商標非転用。 |
| CASE-050 | current | UK / Lusion | The Turn of the Screw Trailer — [creator case](https://v2.lusion.co/work/the-turn-of-the-screw-trailer/) | NAV CAM DEP LYR LGT SHD TRN SND INT SUR | Houdini→WebGL binary buffers、camera splines、positional audio、hover audio focus、visibility polygon最適化を制作側が明記。 | 作品固有恐怖表現を避け、視界外の部屋を描画しないportal-culling原理を王城へ採る。 | horror表現不採用。音なし、手動カメラ、視認性、低精度ジオメトリ。 |
| CASE-051 | current | Global / Google + Lusion | Google WebXR Experiments — [creator case](https://v2.lusion.co/work/google-webxr-experiences/) | NAV CAM DEP LYR TRN INT SUR | Sodar / Measure Up / Floom の3WebXR prototypeを制作側が掲載。 | 一つの巨大XRでなく「距離・穴・重なり」の単機能実験へ分割し、どれも任意。 | 権限説明、対応端末検出、同等2D入力、測定を正確性保証に使わない。 |
| CASE-052 | current | Global / Netflix + Lusion | Kaos Logo Generator — [creator case](https://v2.lusion.co/work/kaos-logo-generator/) | TYPE LYR SHD TRN SND INT SUR | voice/audio-reactive logo、WebAudio/Meyda、screen-space wire quads、feature texture、temporal AA高解像export、low-end mobile最適化を制作側が説明。 | 固有ロゴを使わず、音量ではなくユーザーが押す3パラメータで王印を生成。マイクは追加option。 | マイク同意、無音入力、音声保存なし、発作誘発点滅回避、export上限。 |
| CASE-053 | current | Italy / MaxMara + Lusion | Bearing Gifts — [creator case](https://v2.lusion.co/work/maxmara-bearing-gifts/) | CAM DEP LYR LGT SHD PRT TRN INT GAME SUR | GPU confettiを8-bit targetsでmobile対応、Oimo.js physics、透明/金属material工夫を制作側が説明。 | 商品・贈答表現を使わず、結果確定後だけ軽量な王冠片が落ち、触れると物理反応。 | 粒子は200→40→0段階、reduced-motion静止、物理計算をworker/停止。 |
| CASE-054 | current | UK / Lusion | Particle Love — [creator case](https://v2.lusion.co/work/particle-love/) | CAM DEP LYR LGT SHD PRT SND INT SUR | interactive GPU particle experimentsとして制作側掲載。 | 粒子を常設背景にせず、1つの動詞を説明する短い反応素材にする。 | 画面占有率・数・DPRをbudget化。DOM操作を阻害しない。 |
| CASE-055 | 2026 | US / Studio10b | Painted Paths — [official creator page](https://www.studio10b.com/) | NAV CAM SCR DEP LYR LGT SHD TRN SND INT | Blender/Three.js/glTF、最適化3D、lighting/animation/audio/UI、desktop scroll、mobile carousel、commerce接続を公式説明。 | desktopとmobileで同一ジェスチャを強制せず、各端末で既知の入力に翻訳。 | WebGLなしで作品・購入・連絡を完遂。メモリ解放とvisibility pause。 |
| CASE-056 | 2026 | US / Studio10b | Interactive 3D Arcade — [official creator page](https://www.studio10b.com/) | NAV CAM DEP LYR LGT SHD PRT SND INT GAME SUR | 80年代風interactive 3D arcade environmentを公式作品一覧に掲載。 | 固有年代・筐体をコピーせず、王国の小遊戯を「一画面一ルール」で展示。 | ノスタルジー資産は独自制作。キーボード再割当、タッチ、pause。 |
| CASE-057 | 2026 | US / Studio10b | Music Space — [official creator page](https://www.studio10b.com/) | NAV CAM DEP LYR LGT SHD PRT SND INT RET | independent artists向け3D環境、ambient music、dynamic lightingを公式掲載。 | 王国音楽室で同じ曲の層をユーザーが足し引き。再訪時は音量設定だけ保存。 | 音声自動開始なし。字幕/曲名、帯域節約、バックグラウンド停止。 |
| CASE-058 | 2026 | US / Crèche | CRÈCHE — the tank — [official CSSDA record, 2026-08-27](https://www.cssdesignawards.com/sites/cr-che-the-tank/50058/) | LAY TYPE NAV CAM SCR DEP LYR LGT SHD TRN SND INT SUR | creative-tech studioのサイト自体が水槽で、2生物の会話を通り作品へ沈む one-page / scroll / WebGL と公式受賞ページが説明。 | 水槽・生物は使わず、ナビと物語役が口論してルート候補を示す「二声ガイド」。最終選択はユーザー。 | キャラクター・設定非転用。会話skip、文字起こし、スクロール量を短縮。 |
| CASE-059 | 2026 | UAE / Khaled Oghli | Khaled Oghli Portfolio — [official site](https://www.khaledoghli.com/), [official CSSDA WebGL gallery](https://www.cssdesignawards.com/website-gallery?feature=webgl) | LAY TYPE NAV CAM DEP LYR SHD TRN SND INT | 公式メタデータと本文にReact/Vue/WebGL/motion、回転project navigation、visual presets、sound、high-performance interface。 | 表示品質をlow/normal/highではなく「静穏/標準/劇場」と目的語で選ばせる。 | auto判定を上書き可能に。設定は即時反映し低品質も意図的デザインに。 |
| CASE-060 | 2026 | US / Santioni + Active Theory | The Notturno Experience — [official brand site](https://santionispirits.com/), [creator primary note](https://www.linkedin.com/posts/louisansa_its-one-of-those-projects-that-reminds-me-activity-7478483798205227008-J3Ll) | LAY TYPE NAV CAM SCR DEP LYR LGT SHD TRN SND INT SUR | 制作側はinteractive 3D comic panels、micro-interactions、voice-overを説明。別の制作解説ではcustom shaderとscroll-driven comic-panel rendering。 | 漫画・物語・商品を模倣せず、Oracleイベントを「独立パネル＋間の余白」で段階公開。 | 作品固有世界非転用。voice-over字幕、scroll skip、点滅、端末熱。 |
| CASE-061 | 2025 | Spain / Atoll Digital | Atoll Digital — [official studio site](https://atoll.digital/), [official CSSDA record](https://www.cssdesignawards.com/woty2025/sites/atoll-digital/) | LAY TYPE NAV SCR LYR TRN INT SUR | animated grid とscrollを用いる2025 studio siteとして公式受賞記録。 | グリッドセルを王国施設に対応づけ、イベント時は位置でなく寸法だけを変える。 | reflow/CLS、読上げ順、モバイル2列→1列で意味を保持。 |
| CASE-062 | 2026 | Global / Three.js community | Three.js Examples — [official examples](https://threejs.org/examples/), [official source/license](https://github.com/mrdoob/three.js/) | CAM DEP LYR LGT SHD PRT TRN SND INT SUR | WebGL/WebGL2/WebGPU/WebXRの小さな実験を公式example単位で公開。MIT。 | 大作を先に作らず、light/particle/cameraを個別検証して合格した二要素だけ合成。 | exampleは完成UIではない。production負荷・cleanup・a11yは別途実装。 |
| CASE-063 | 2026 | Global / Processing Foundation | p5.js Web Editor / accessibility experiments — [official editor](https://editor.p5js.org/), [official accessibility docs](https://p5js.org/contribute/web_accessibility/) | LAY TYPE SHD PRT SND INT SUR | `describe`, `describeElement`, `textOutput`, `gridOutput` でcanvas代替説明を公式文書化。 | 実験canvasごとに「何が変化しているか」を短いライブでない文章へ同期。 | 毎frame DOM更新禁止。説明更新を意味変化時に限定。p5.js本体はLGPL-2.1。 |
| CASE-064 | 2026 | Global / PixiJS community | PixiJS Examples — [official examples](https://pixijs.com/examples), [official source](https://github.com/pixijs/pixijs) | LAY DEP LYR LGT SHD PRT TRN INT GAME SUR | WebGL/WebGPU、asset loader、mouse/multitouch、text、mask/filter/blendを公式に提供。MIT。 | 大量2Dスプライトの祝祭や紙片に限定し、本文・主要ボタンはDOMのまま。 | renderer検出、texture atlas、destroy、DPR cap。canvasだけで操作を完結しない。 |
| CASE-065 | 2026 | Global / Rive | Rive Web runtime demos — [official web docs](https://rive.app/docs/runtimes/web/web-js), [runtime sizes, 2026-01](https://rive.app/docs/runtimes/runtime-sizes) | LAY LYR TRN SND INT GAME SUR | state machine、JS/WASM runtime、Canvas/WebGL2/Lite。圧縮WASMはcanvas-lite 222KB / canvas 567KB / webgl2 648KBと公式表。 | 小さな王印・ガイド役の状態機械に限定し、ページ全体は通常DOM/CSS。 | authoring asset termsはruntime MITと別確認。CSP `wasm-unsafe-eval`、major format一致、容量。 |
| CASE-066 | 2026 | Global / Shader Park + Hydra | Browser live-coded shaders — [Shader Park official source](https://github.com/shader-park/shader-park-core), [Hydra official source](https://github.com/hydra-synth/hydra) | LYR LGT SHD PRT TRN SND INT SUR | Shader ParkはJS→2D/3D shader、MIT。Hydraはbrowser networked visuals、AGPL-3.0。 | 制作時のR&D sandboxとして使い、採用表現は独自の小型shaderへ書き直して本番依存を減らす。 | HydraはAGPLで商用bundle適合を法務確認。ライブコードをuser入力として実行しない。 |

### Case synthesis: what sustains interest without hiding control

1. **Scene grammar before spectacle.** 強い事例は「章」「月」「時刻」「場所」「パネル」など現在位置の文法を持つ。NAOKINGでは `scene → beat → reveal → settle → exit` を全イベント共通にし、見た目だけ交換する。
2. **One primary verb per scene.** carve / conduct / explore のように章ごとに主動詞を一つにする。drag・scroll・tilt・holdを同時要求しない。
3. **Overview and detail coexist.** 球・地図・3D空間はoverview、一覧・章番号・検索は確実なdetail導線。どちらかを削らない。
4. **Depth is information, not wallpaper.** 前景=入力、中央=物語、背景=雰囲気という責務を固定。z-indexの驚きで主要操作を隠さない。
5. **Sound is a layer, never a gate.** 音はユーザー操作後に開始し、字幕/視覚リズム/振動なしの等価演出を持つ。音設定を再訪時に尊重する。
6. **Return motivation is memory, not pressure.** 日替わり紋章、履歴年鑑、季節庭園は再訪理由になるが、streak loss、限定損失、順位煽りを使わない。
7. **Surprise must preserve agency.** surpriseは画面構成・語り口・演出順にだけ作用し、占い結果、購入、データ同意、戻る/閉じるを変えない。

Axis coverage in the 66 case rows（同一caseは複数axis）:

| Axis | LAY | TYPE | NAV | CAM | SCR | DEP | LYR | LGT | SHD | PRT | TRN | SND | INT | DAY | GAME | SUR | RET |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Case count | 37 | 26 | 45 | 39 | 25 | 46 | 57 | 32 | 31 | 16 | 56 | 36 | 66 | 5 | 13 | 39 | 15 |

`DAY`は独立した日替わりを一次資料で確認できる事例だけに限定したため少ない。推測でタグを増やさず、daily / returnの設計はCASE-011/026/027/029/031/032から別に合成した。

## 2. Reusable system audit

評価: Usefulness `A`=本番候補、`B`=限定採用、`C`=R&Dのみ。Compatibility は公式文書と2026-08-31時点の現行仕様に基づくため、導入時にlockfileとブラウザ実機で再検証する。

| ID | System / primary source | License / legal fit | Compatibility | Performance notes | NAOKING usefulness |
|---|---|---|---|---|---|
| SYS-01 | Three.js — [official source](https://github.com/mrdoob/three.js/), [license](https://threejs.org/license/) | MIT。notice保持。 | WebGL/WebGL2/WebGPU/WebXR。WebGPUは[MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)でまだLimited availability、HTTPS必須。 | renderer/texture/geometryをscene終了時dispose。DPR cap、visibility pause、WebGL fallback。 | A: 王城・camera・lightの本命。ただし常設canvasは1つ。 |
| SYS-02 | PixiJS — [official source](https://github.com/pixijs/pixijs) | MIT。notice保持。 | WebGL/WebGPU、mouse/multitouch、各種frameworkから利用可。 | atlas・batchに強い。filterとblendの重ね過ぎ、巨大texture、未destroyに注意。 | A: 2D紙片、紋章、sprite祝祭。本文はDOM。 |
| SYS-03 | GSAP — [official 2025 licensing announcement](https://webflow.com/updates/gsap-becomes-free), [GSAP-powered interactions](https://webflow.com/updates/introducing-webflow-interactions-powered-by-gsap) | 2025-04-30から全pluginを含み商用利用無料。OSI MITではなく現行GSAP/Webflow Product Termsをreleaseごとに確認。 | 広いmodern-browser実績。ScrollTrigger/SplitText等。 | timelineをscene ownership下に置きkill。transform/opacity中心、layout thrashを避ける。 | A: 複合timelineとcleanup。依存条件を法務記録。 |
| SYS-04 | Motion — [official site](https://motion.dev/), [quick start](https://motion.dev/docs/quick-start) | MIT。 | HTML/CSS/SVG/WebGL。mini buildは公式値2.3KB。 | 小規模micro-motionはmini。scroll observerを乱立させない。 | A: DOM主体の状態遷移。 |
| SYS-05 | Lenis — [official source](https://github.com/darkroomengineering/lenis) | MIT。 | autoToggleはSafari>17.3 / Chrome>116 / Firefox>128。syncTouchはiOS<16で不安定との公式注意。 | RAFは一系統。nested scrollのtree walkは負荷。native scroll fallback必須。 | B: 物語ページ限定。主要サイト全体には原則不要。 |
| SYS-06 | View Transition API — [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API), [Baseline 2025 note](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) | Web標準、library license不要。 | same-documentは2025-10以降Baseline。cross-documentは対応差が残るためfeature detect。 | browser snapshotを使い実装量を削減。hidden documentではskip。 | A: DOM状態間の連続性。unsupportedは即時切替。 |
| SYS-07 | CSS Scroll-driven Animations — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations) | Web標準。 | feature queryで段階導入。非対応は通常scroll。 | main-thread JS scroll handlerを減らせる。過度なscroll-linked parallaxは酔い。 | A: progress/章マーカー。移動量は小さく。 |
| SYS-08 | Barba.js — [official source](https://github.com/barbajs/barba) | MIT。 | modern browser progressive enhancement、Promise/TS、hooks/views/plugins。 | 約7KB（公式README値）、prefetch/cacheは帯域を増やし得る。page lifecycle cleanup必須。 | B: MPA遷移が本当に必要な場合。既存routingと競合確認。 |
| SYS-09 | Swup — [official source](https://github.com/swup/swup) | MIT。 | server-rendered sites、history/scroll/cache/hooks。a11y pluginあり。 | small core＋必要pluginだけ。preload対象を絞る。 | B: native View Transitionで不足するMPAのみ。 |
| SYS-10 | Rive Web Runtime — [official docs](https://rive.app/docs/runtimes/getting-started), [sizes](https://rive.app/docs/runtimes/runtime-sizes) | official runtimesはMIT。`.riv` asset/editor termsは別途確認。 | JS/WASM、Canvas/WebGL2/Lite。major file/runtime formatは一致必須。CSPは`wasm-unsafe-eval`検討。 | Brotli: canvas-lite 222KB / canvas 567KB / webgl2 648KB（2026-01公式）。必要featureで最小runtime。 | B: 1–2個のstate-machine icon/guide。装飾だけならCSS。 |
| SYS-11 | p5.js — [official source](https://github.com/processing/p5.js), [accessibility docs](https://p5js.org/contribute/web_accessibility/) | p5.js本体 LGPL-2.1。websiteはMITで別物。配布・変更条件を法務確認。 | Canvas/WebGL、screen-reader用describe/textOutput/gridOutput。2.0移行期。 | 教育/R&Dに速い。本番bundle、addon互換、毎frame a11y DOM更新に注意。 | C/B: prototype優先。本番は小範囲でlicense review。 |
| SYS-12 | Howler.js — [official source](https://github.com/goldfire/howler.js/) | MIT。 | Web Audio＋HTML5 Audio fallback、mobile unlock、spatial plugin。webm+mp3推奨。 | 大音源はhtml5 streaming、inactiveでAudioContext auto-suspend。source二形式。 | A: scene SFX/ambient管理。初回gesture後のみ。 |
| SYS-13 | Tone.js — [official source](https://github.com/Tonejs/Tone.js/) | MIT（LICENSE同梱）。 | Web Audio。公式にuser gesture後 `Tone.start()` 必須。 | transportで同期しやすいがsynth/effect数をbudget化。tab hiddenで停止。 | B: 音楽的な動的layer。単純SFXはHowler。 |
| SYS-14 | Matter.js — [official source](https://github.com/liabru/matter-js) | MIT。 | 2D rigid-body、browser/Node。 | 2D小物向き。fixed timestep、body上限、sleep、offscreen時停止。 | B: 紙片/王冠片の短時間物理。 |
| SYS-15 | Rapier — [official docs](https://rapier.rs/docs/), [JS setup](https://rapier.rs/docs/user_guides/templates/getting_started_js/) | Apache-2.0。NOTICE/条件確認。 | 2D/3D、JSはWASM async load。compat packageはWASMをbase64同梱。 | 高性能だがWASM初期費用。deterministicでも同一version/初期条件が前提。 | C/B: 大きな3D物理が必要な場面だけ。 |
| SYS-16 | postprocessing — [official source](https://github.com/pmndrs/postprocessing) | zlib。原コード一部はThree.js MIT。notice保持。 | Three.js peer dependency、WebGL pipeline。 | antialias/depth/stencil設定、pass数、framebuffer帯域を管理。demo 60MBはbundle目安ではない。 | B: bloom/outlineを一場面1–2pass。glitch常設禁止。 |
| SYS-17 | tsParticles — [official source](https://github.com/tsparticles/tsparticles), [official guide](https://github.com/tsparticles/tsparticles/blob/main/websites/website/docs/guide/getting-started.md) | MIT。 | modern browsers、CDN/npm、React/Vue/Angular/Svelte等。engine+plugin/bundle構成。 | fullでなくbasic/slim/個別plugin。高粒子数を事前検証しない設定は避ける。 | B: confetti/fireworksの短い場面。Pixiと二重導入しない。 |
| SYS-18 | Shader Park — [official source](https://github.com/shader-park/shader-park-core) | MIT。 | JS記法から2D/3D shader、web/Three.js統合。 | raymarch/SDFはmobileで高負荷。step数・resolution・更新頻度を制限。 | C/B: shader prototype、採用品は独自最小shaderへ。 |
| SYS-19 | Hydra — [official source](https://github.com/hydra-synth/hydra) | AGPL-3.0。network useを含む義務が商用構成に影響し得るため法務必須。 | browser live-coded networked visuals。 | video feedbackはGPU/熱/発作リスク。 | C: R&D参考のみを既定。production組込は法務承認なしで不可。 |
| SYS-20 | Theatre.js — [official source/license explanation](https://github.com/theatre-js/theatre) | coreはApache-2.0、studioはAGPL-3.0。最終bundleはcoreのみという公式説明を構成で検証。 | Three.js等と連携する高精度timeline authoring。 | editor/studioをproductionから除外。sequenceをlazy load、scene終了でdetach。 | B: 複雑なpremium sceneのauthoring。license境界をCI監査。 |
| SYS-21 | React Three Fiber — [official source](https://github.com/pmndrs/react-three-fiber) | MIT。 | React renderer for Three.js。React versionとのpeer整合必須。 | React stateで毎frame rerenderせずuseFrame/ref。canvas/context数を増やさない。 | B: repoがReact中心なら採用。既存vanilla構成ならThree.js直使用。 |
| SYS-22 | Web Audio / WebGPU / reduced-motion primitives — [WebGPU MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API), [reduced-motion MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) | Web標準。 | secure context、feature detect。WebGPU非Baseline、reduced-motionは広範対応。 | 一段階ずつ能力検出し、失敗後の再試行loop禁止。OS preferenceを最初に尊重。 | A: 全systemを囲むcapability gate。 |

### Recommended production stack boundary

| Layer | Default | Optional upgrade | Hard fallback |
|---|---|---|---|
| Document / navigation | semantic HTML + CSS + native history | View Transition API / Motion | instant state change with focus restoration |
| Scroll narrative | native scroll + IntersectionObserver | CSS scroll-driven animation; Lenis only per isolated story | chapter links + normal document flow |
| 2D celebration | CSS transforms | PixiJS **or** tsParticles, never both in one scene | static SVG/PNG ornament |
| 3D world | no 3D on core result path | one Three.js/R3F canvas, lazy-loaded | illustrated 2D scene + same controls |
| Audio | user-initiated HTMLAudio/Howler | Tone.js for generative music | captions, visual beat, no-audio completion |
| Timeline | Web Animations / Motion | GSAP; Theatre core for premium scenes | final state applied immediately |
| Physics | none by default | Matter for short 2D; Rapier for justified 3D | keyframed transforms |

**License gate:** `MIT / zlib / Apache-2.0` はnoticeを配布物に残す。`LGPL-2.1 / AGPL-3.0 / GSAP standard terms / Rive asset terms` は導入前に用途・配布形態・bundle境界を法務/責任者が確認する。ライブラリのライセンスは作品の画像・音・書体・3D assetの利用許諾を意味しない。

## 3. NAOKING original visual / interaction systems

すべて**原理からの新規案**で、参照作品の固有visual/name/layoutを再現しない。結果値は事前確定し、下記はpresentationだけを変える。`Fallback` は装飾を失っても情報・操作・終了状態が一致する契約。

| ID | Axis | Original NAOKING concept | Trigger → state grammar | Fallback / a11y / performance contract | Principle refs |
|---|---|---|---|---|---|
| IDEA-001 | LAY | Royal Split Court: 左を「現在」、右を「可能性」の可変二庭にする。 | result pendingで50/50、revealで選ばれた側が60/40、settleで通常gridへ。 | DOM順は常に現在→可能性。狭幅は縦積み、結果本文の位置は動かさない。 | CASE-001, CASE-015 |
| IDEA-002 | LAY | Throne Grid: 12セルの宮廷床を各機能の固定住所にする。 | event時は対象セルだけ2倍、終了時は元のgrid-areaへ戻る。 | CSS Gridのみでも成立。拡大中もfocus順不変、CLSを発生させない。 | CASE-010, CASE-061 |
| IDEA-003 | LAY | Folded Edict: 長文結果を三つ折りの勅書として段階展開。 | summary→meaning→actionの明示ボタンで開く。 | `<details>`相当、print/readerでは全内容を順に表示。 | CASE-022, CASE-035 |
| IDEA-004 | LAY | Balcony / Stage: 操作欄を固定balcony、演出を下のstageに分離。 | interaction中もbalconyは不動、scene終了でstageだけ交換。 | 主要操作はDOM上層・canvas外。safe-areaと画面拡大に対応。 | CASE-023, CASE-046 |
| IDEA-005 | LAY | Living Margin: 本文の余白だけが王国の天候で変わる。 | calm/windy/festivalでmargin ornamentを交換。 | 本文幅・行長は固定、ornamentはaria-hidden・pointer-events none。 | CASE-009, CASE-042 |
| IDEA-006 | LAY | Archive Mosaic: 履歴を日付順listと意味別mosaicの二表示にする。 | toggleでviewのみ変更、同じfilterとURLを保持。 | `<ol>`がsource of truth。mosaicはprogressive enhancement。 | CASE-003, CASE-029 |
| IDEA-007 | LAY | Nine-Gate Home: 3×3門に主要地区を割り当て、中央だけOracle。 | pointer/focusで門内preview、activateで通常navigation。 | 1列listへ縮退。previewなしでもlabelと説明が揃う。 | CASE-018, CASE-061 |
| IDEA-008 | LAY | Scroll Ledger: 長いsceneの横に常時「既読/現在/未読」細線を置く。 | IntersectionObserverで章状態のみ更新。 | `<nav aria-label>`の章リンク。線animationなしでも現在章を文字表示。 | CASE-011, CASE-022 |
| IDEA-009 | LAY | Crown Safe Zone: 画面中央40%を常に結果可読領域として予約。 | particles/3Dは外周mask内だけ。 | 小画面は装飾全停止。コントラストを背景に依存しない。 | CASE-009, CASE-054 |
| IDEA-010 | LAY | Traveling Card: 同じOracle cardがhome→scene→archiveを連続移動。 | view-transition-nameで位置だけ変え、内容は状態共有。 | API非対応はcrossfadeなし即時配置。focusは新見出しへ。 | CASE-003, SYS-06 |
| IDEA-011 | TYPE | Variable Crown Weight: 結果の確信度ではなくscene強度で見出しweightを変える。 | calm 450 / festive 700、結果の良否とは無関係。 | variable font非対応は2ウェイト。文字サイズ・内容は固定。 | CASE-006 |
| IDEA-012 | TYPE | Royal Whisper: 補足文が一文字ずつでなく語群単位で静かに現れる。 | userの`more`で3語群を150ms stagger。 | reduced-motionは即時全文。live regionで逐字読上げしない。 | CASE-027, SYS-03 |
| IDEA-013 | TYPE | Counter-rotating Seal: 円環文字と中央の平文labelを同時表示。 | dragで円環回転、中央labelは不動。 | 円環は装飾。list/prev/nextで全項目へ到達。 | CASE-037, CASE-059 |
| IDEA-014 | TYPE | Bilingual Coronation: 日本語主文と短い英語称号を役割で分離。 | reveal後に称号が0.2秒遅れて付く。 | lang属性を個別設定。英語なしでも意味が完結。 | CASE-006, CASE-020 |
| IDEA-015 | TYPE | Ink Pressure: pointer/pressの圧ではなくhold時間で線の太さを選ぶ。 | 0–800msを3段階、確定前にpreview。 | click/keyboardで段階buttonを選べる。結果には影響させない。 | CASE-002, CASE-035 |
| IDEA-016 | TYPE | Truth Flip: 裏返る見出しの背面に反対語でなく補助視点を置く。 | explicit toggleで表/別視点。 | 両文をDOMに置き、button expanded状態。自動反転しない。 | CASE-015, CASE-020 |
| IDEA-017 | TYPE | Processional Baseline: 文字のbaselineが一列ずつ王座へ揃う。 | introで最大400ms、settle後は静止。 | reduced-motion/low modeで最初から整列。 | CASE-001, CASE-010 |
| IDEA-018 | TYPE | Constellation Index: 履歴の頭文字を星座風に結ぶが本文は別list。 | hover/focusで対応項目をhighlight。 | canvasはaria-hidden、listが操作元。線は最大30本。 | CASE-030, CASE-031 |
| IDEA-019 | TYPE | Weather Kerning: 天候themeで見出しletter-spacingを±2%だけ変える。 | scene mount時に一度決定、途中では揺らさない。 | 日本語はtracking最小、行折返しテスト。結果意味とは無関係。 | CASE-019, CASE-042 |
| IDEA-020 | TYPE | Heraldic Initial: 章頭1文字を独自幾何紋章へ一瞬変形。 | chapter enter→300ms morph→通常字形。 | 元文字を常にaccessibility treeへ。画像化しない。 | CASE-052, CASE-066 |
| IDEA-021 | NAV | Royal Compass: 4方位に地区、中央に現在地を置く補助ナビ。 | arrow key / swipeで候補、Enterで移動。 | 標準menu listを常設。空間方向だけに意味を依存させない。 | CASE-003, CASE-048 |
| IDEA-022 | NAV | Chapter Ribbon: 章タイトルを一本の巻物状progressに連結。 | scrollで現在章だけ太く、clickでanchor移動。 | `ol`＋anchor、scroll-behavior offにも対応。 | CASE-011, CASE-022 |
| IDEA-023 | NAV | Two-Voice Guide: 二人の王国案内役が「近道/寄り道」を提案。 | scene開始時に各1行、userが選ぶかskip。 | どちらも同じ必須情報へ到達。会話全文とmuteを用意。 | CASE-058 |
| IDEA-024 | NAV | Portal Preview: 門を開く前に次画面の静止previewと所要時間を表示。 | focus/hoverでpreview、activateでnavigation。 | data-saverはpreviewを読み込まない。戻る位置保持。 | CASE-023, CASE-050 |
| IDEA-025 | NAV | Memory Breadcrumb: パンくずに前回訪問した章だけ小さな印。 | local-only historyから印を描画。 | 保存off/clear、普通のbreadcrumbが本体。 | CASE-011, CASE-027 |
| IDEA-026 | NAV | Ring and List Pair: 円形の劇場ナビと直線listを同じstateへ接続。 | view toggle、選択位置を共有。 | listを既定、円形は`aria-hidden`複製でなく同じcontrolsを視覚配置。 | CASE-037 |
| IDEA-027 | NAV | Time-Slice Tabs: morning/noon/nightで内容でなく照明themeを切替。 | explicit segmented control。 | auto timeは提案のみ。全themeで内容・可読性同一。 | CASE-037, CASE-057 |
| IDEA-028 | NAV | Scene Skip Contract: すべてのfull scene右上に同じ位置・文言のskip。 | skip→最終settled state→result focus。 | 2秒以内に操作可能。演出途中でもcleanupを完遂。 | CASE-002, CASE-024 |
| IDEA-029 | NAV | Backstage Map: 3D世界の横に2D小地図を常設。 | camera移動に現在地点だけ同期。 | list/章リンクが主導線。地図を閉じても進行可。 | CASE-036, CASE-048 |
| IDEA-030 | NAV | Exit Lantern: scene出口を光だけでなく「結果へ戻る」と明示。 | completionでbutton enabled、未完でもskip可。 | 色・光に依存せずlabel/shape/focus ring。 | CASE-009, CASE-050 |
| IDEA-031 | CAM | Three-Shot Oracle: wide→medium→card close-upの3shotだけでscene構成。 | beatsに同期し各shot 350ms以下。 | reduced-motionは固定medium。手動camera不要。 | CASE-004, CASE-024 |
| IDEA-032 | CAM | User-paced Dolly: wheel量ではなく章進行率でcameraを補間。 | 章anchor間だけ移動し、逆scrollで正確に戻る。 | normal document flowと画像poster。scrub off選択。 | CASE-002, CASE-050 |
| IDEA-033 | CAM | Parallax Crown Room: 背景3%、中景1.5%、前景0%の微差。 | pointerではなくscroll位置に低域filter。 | reduced-motionは全0%。最大移動12px。 | CASE-024, CASE-035 |
| IDEA-034 | CAM | Focus Telescope: 選択項目へcameraではなくcrop maskが寄る。 | focusでmask 250ms、blurで戻る。 | CSS clip unsupportedはoutlineだけ。文字は拡縮しない。 | CASE-041, CASE-062 |
| IDEA-035 | CAM | Orbit with Rails: drag可能範囲を30度の弧に限定。 | drag→spring settle→説明label表示。 | prev/next buttons、静止3枚、酔いを減らす。 | CASE-048, CASE-055 |
| IDEA-036 | CAM | Room-to-Card Match: 遠景の扉と結果cardを同じ比率でmatch cut。 | door activate→view transition→card。 | 非対応はinstant navigation。長いzoom禁止。 | CASE-023, SYS-06 |
| IDEA-037 | CAM | No-camera Depth Mode: perspectiveなしでscale/occlusionだけの奥行き。 | scene stateで3層の重なりを交換。 | CSS transformsのみ、scale 0.96–1.04。 | CASE-009, CASE-046 |
| IDEA-038 | CAM | Compass Recenter: 3D探索のどこからでも1操作で正面へ戻す。 | button/`R`→300ms recenter。 | reduced-motionは即時。操作説明と再割当。 | CASE-005, CASE-055 |
| IDEA-039 | CAM | Camera as Narrator: camera motionを驚きでなく文章段落境界にだけ置く。 | `next paragraph`で一度移動。 | scroll中に勝手に追わない。固定camera option。 | CASE-035, CASE-040 |
| IDEA-040 | CAM | Portrait Safe Orbit: mobile portraitでは水平orbitをcard carouselに翻訳。 | desktop drag / mobile swipe、同じindex state。 | orientation変更でstate保持。scroll lockしない。 | CASE-055 |
| IDEA-041 | SCR | Chapter Detents: scrollが章境界付近だけ柔らかく吸着。 | 80px範囲でCSS scroll-snap proximity。 | mandatory禁止、keyboard/page searchを妨げない。 | CASE-002, CASE-022 |
| IDEA-042 | SCR | Scroll / Button Parity: 全scroll revealに同じ「次へ」buttonを用意。 | scrollまたはbuttonで同じstate reducer event。 | assistive techはbutton経路。二重発火をidempotent化。 | CASE-003, CASE-055 |
| IDEA-043 | SCR | Reverse-safe Story: 上へ戻すとbeatを逆順に正確復元。 | progressを純関数でstateへ変換。 | irreversible side effectはcompletion時だけ。 | CASE-024, CASE-050 |
| IDEA-044 | SCR | Reading-speed Buffer: 文章量で章長を決め、装飾都合の100vh連打を避ける。 | text measureで自然高さ。 | user zoom 200%でも重ならない。 | CASE-013, CASE-022 |
| IDEA-045 | SCR | Scroll Quiet Zones: 各大scene後に動かない1画面の休息帯。 | scene settle→quiet section。 | quiet帯は短縮可能、主要情報を置く。 | CASE-024, CASE-035 |
| IDEA-046 | SCR | Horizontal Gallery, Vertical Escape: 横gallery端で自然に縦へ戻る。 | pointer over galleryかつ横gestureのみ横移動。 | prev/next、scroll chaining、touch-actionを適切化。 | CASE-003, CASE-037 |
| IDEA-047 | SCR | Velocity-independent Reveal: 高速scrollでも全beatを待たず最終状態へ追従。 | progress absolute mapping、queueを溜めない。 | input終了後100ms以内に状態一致。 | CASE-011, SYS-07 |
| IDEA-048 | SCR | Scroll Energy Meter: scene進行率を王国灯の充填で示す。 | 0–100% visual progress。 | `aria-valuenow`は章進捗、結果確率と誤認しないlabel。 | CASE-022, CASE-041 |
| IDEA-049 | SCR | Optional Deep Dive: 本筋から横枝へ入り、戻ると同じscroll位置。 | `Explore detail`→modal/page→history restore。 | focus return、URL、back button対応。 | CASE-011, CASE-036 |
| IDEA-050 | SCR | Reduced-scroll Edition: user設定で各章をcard deckへ切替。 | setting toggle、内容と順序を共有。 | default DOMをdeckにも再利用し重複なし。 | CASE-027, SYS-22 |
| IDEA-051 | DEP | Royal Depth Tokens: `surface=0`, `card=1`, `stage=2`, `spectacle=3` の4層だけ。 | scene manifestがtokenを宣言。 | z-index任意値禁止。modal/focus layerを最上位で予約。 | CASE-009, CASE-046 |
| IDEA-052 | DEP | Fog of Context: 非選択地区をblurでなく低彩度と縮小で後退。 | selectionで隣接層のみ変化。 | blurなしlow mode、文字opacityは下げない。 | CASE-041, CASE-048 |
| IDEA-053 | DEP | Paper Theatre: 前景幕、中景人物、背景紋章の平面3枚で奥行き。 | pointer tilt最大2度、scene beatで開閉。 | reduced-motion固定、画像3枚をlazy load。 | CASE-060, CASE-064 |
| IDEA-054 | DEP | Occlusion Reveal: 前景の王旗が通過した瞬間だけ次の状態へ切替。 | deterministic timeline、400ms以内。 | flag animationなしでcrossfade、内容遅延なし。 | CASE-034, CASE-060 |
| IDEA-055 | DEP | Layer Inspector: debug/quality設定で各層を個別off可能。 | internal toggleとpublic静穏mode。 | failure isolation、どの層を消してもcore UI正常。 | CASE-046, CASE-062 |
| IDEA-056 | LYR | Context Veil: full event中も背景に元画面を15%だけ残し帰還先を示す。 | mount→veil、exit→veil解除。 | contrast overlay、背景をinert、focus trap、Escapeでexit。 | CASE-010, CASE-023 |
| IDEA-057 | LYR | History Palimpsest: 過去3結果の輪郭を薄く重ね、現在だけ実色。 | archive viewでexplicit toggle。 | 色以外に日付label。大量履歴はvirtualizeせずページ分割。 | CASE-029, CASE-035 |
| IDEA-058 | LYR | Shadow Court: 同一characterの感情を別spriteでなく影形状で示す。 | scene stateでshadow path切替。 | shadowなしでも台詞/状態label。 | CASE-009, CASE-053 |
| IDEA-059 | LYR | Portal Masks: 各地区を円/菱形/門型の独自maskでpreview。 | focus→mask reveal、activate→full view。 | clip-path非対応はrect。形だけで状態を伝えない。 | CASE-036, CASE-066 |
| IDEA-060 | LYR | UI Above Weather: rain/fog/particlesを必ずcontent layerの背後へ固定。 | theme managerはbackground rootだけを所有。 | pointer-events none、aria-hidden、DOM contrast layer固定。 | CASE-026, CASE-054 |
| IDEA-061 | LGT | Oracle Key Light: 結果cardだけを照らす一灯をscene全体の状態源にする。 | pending=低、reveal=上昇、settle=一定。 | CSS border/labelも同時変化。ブルームなしmode。 | CASE-009, CASE-055 |
| IDEA-062 | LGT | Moving Sundial: userが時刻themeを変えると影角だけが変わる。 | segmented control→3 preset。 | 実時刻自動追従は任意。shaderなしはCSS shadow。 | CASE-037, CASE-057 |
| IDEA-063 | LGT | Lantern Breadcrumbs: 通過済み章の灯だけ点灯。 | completion eventで永続しないsession state更新。 | text `完了` とcheck iconを併記。点滅なし。 | CASE-022, CASE-030 |
| IDEA-064 | LGT | Courtesy Dimmer: modal/full scene開始時に周囲を暗くするが黒潰れさせない。 | open→150ms dim 55%、close→restore。 | backdrop contrast、Escape、reduced-motion即時。 | CASE-024, CASE-034 |
| IDEA-065 | LGT | Color-temperature Story: sceneごとに寒色→中立→暖色、結果の吉凶とは独立。 | beat indexで3 tokenを補間。 | high-contrast modeでは中立固定。 | CASE-002, CASE-035 |
| IDEA-066 | LGT | Focus Halo Relay: keyboard focus ringが王国灯へ小さく反射。 | focus-visible時だけ周辺2要素のbox-shadow。 | ring自体は常に3:1、反射offでも識別可能。 | CASE-009, SYS-22 |
| IDEA-067 | SHD | Royal Silk Shader: 低周波noiseで布の明暗だけ揺らす。 | premium scene mount後、最大20fps。 | static gradient、DPR 1、shader compile失敗で即切替。 | CASE-047, CASE-066 |
| IDEA-068 | SHD | Ink Boundary: 結果card境界が一度だけにじんで確定形へ戻る。 | reveal 450ms single-shot。 | CSS mask/static border、点滅なし。 | CASE-035, CASE-066 |
| IDEA-069 | SHD | Stained Atmosphere: 背景色を3色の低速屈折で混ぜる。 | idle中のみ、visibility hiddenで停止。 | CSS radial gradients。本文背後はsolid scrim。 | CASE-047, CASE-065 |
| IDEA-070 | SHD | Truth Lens: 明示buttonを押すと背景装飾だけ輪郭表示へ変わる。 | toggle normal/outline。 | core情報にはfilterをかけない。Canvas unsupportedはCSS class。 | CASE-020, CASE-047 |
| IDEA-071 | SHD | Quality-tier Material: 同一紋章をflat / normal-mapped / refractiveの3品質で共有。 | capability＋user overrideで初回決定。 | flatが正式デザイン。途中の自動品質変更はscene境界のみ。 | CASE-059, SYS-01 |
| IDEA-072 | SHD | Portal Heat Haze: 門の内側8%領域だけ軽く歪む。 | pointer/focus中最大300ms。 | focus ringとlabelは歪ませない。low/reduced mode off。 | CASE-060, CASE-066 |
| IDEA-073 | PRT | Heraldic Dust: 王印の輪郭から12粒だけ外へ離れる。 | seal confirmで一度。 | CSS dots/static sparkle、粒子上限12。 | CASE-014, CASE-054 |
| IDEA-074 | PRT | Seasonal Sigils: 春/夏/秋/冬で粒子形を独自幾何に交換。 | dateをlocalで読みtheme提案、manual override。 | texture atlas1枚、dateは結果へ影響なし。 | CASE-026, CASE-032 |
| IDEA-075 | PRT | Cursor Wake with Rest: pointerが速い時だけ3粒、停止で0。 | velocity threshold、touchはoff。 | canvasなし、pointer precisionを必要としない。 | CASE-014, CASE-054 |
| IDEA-076 | PRT | Confetti Perimeter: 紙片は外周20%だけで落下。 | celebration scene max1.2秒。 | reduced-motionは四隅の静止飾り。最大80/40/0 tier。 | CASE-053, SYS-17 |
| IDEA-077 | PRT | Meaningful Fireflies: 蛍1匹=未読の補足1件、装飾数と情報数を一致。 | firefly activate→該当補足を開く。 | 補足listを併設、飛行停止設定、最大5。 | CASE-026, CASE-036 |
| IDEA-078 | PRT | Particle-to-Type Settle: 粒が文字を作るのでなく文字の周囲に整列する。 | reveal前300ms→outline周辺へ停止。 | 本文は最初からDOMに存在、opacityで隠さない。 | CASE-014, CASE-052 |
| IDEA-079 | TRN | Curtain without Cover: 幕は画面80%までで止まり、skipを常に露出。 | scene enter 300ms、exit 200ms。 | reduced-motion即時、幕なしでもstate遷移同一。 | CASE-010, CASE-060 |
| IDEA-080 | TRN | Grid Reassembly: 旧画面のcellが新画面の同じ意味位置へ再集合。 | semantic keyでview transition。 | API非対応はinstant。文字snapshotの長時間拡大禁止。 | CASE-001, CASE-061 |
| IDEA-081 | TRN | Royal Stamp Cut: 王印が押された1frameを境にsceneを切替。 | click→100ms stamp→state swap。 | 音なし、shakeなし、static icon。 | CASE-052, SYS-06 |
| IDEA-082 | TRN | Page Fold with Reading Order: 下端を折るvisualと同時に次見出しへfocus。 | next actionで250ms。 | CSS unsupportedはscroll into view。DOM順は元から正しい。 | CASE-035, CASE-044 |
| IDEA-083 | TRN | Weather Wipe: 雲・霧ではなく抽象透明帯が背景だけを交換。 | theme change 400ms。 | core UIはwipe外。reduced-motion instant token swap。 | CASE-026, CASE-042 |
| IDEA-084 | TRN | Deep-return Match: 3D退出時、最後に見たcardとarchive thumbnailをmatch。 | exit→snapshot transition→focus restore。 | GPU loss時も即archiveへ。 | CASE-023, CASE-055 |
| IDEA-085 | SND | Three-note Royal Motif: intro/reveal/settleを同じ3音の異なるvoicingで示す。 | scene state eventに一度だけschedule。 | 初回gesture後、mute、視覚label。結果の良否で長短を変えない。 | CASE-002, CASE-057 |
| IDEA-086 | SND | Spatial Room Tone: 3Dcameraに追従するのは環境音1本だけ。 | room enterでfade-in、exitで必ずstop/dispose。 | mono ambient fallback、音なしで全情報。 | CASE-050, SYS-12 |
| IDEA-087 | SND | Focus Chime Scale: focus移動で音階を鳴らさず、カテゴリ境界だけ小音。 | keyboardでsection change時、opt-inのみ。 | screen reader使用時の二重通知を避け既定off。 | CASE-052, SYS-13 |
| IDEA-088 | SND | User-built Court Ensemble: bass/pulse/chimeの3layerを明示toggle。 | controlsで追加・除去、master mute常設。 | 各状態をtext表示。Web Audio unavailableでUI disabled説明。 | CASE-057, SYS-13 |
| IDEA-089 | SND | Silence as Beat: reveal直前の120msだけambientをduckし、長い無音待ちを作らない。 | deterministic audio envelope。 | 音offではvisual pauseを増やさない。 | CASE-024, CASE-060 |
| IDEA-090 | SND | Captioned Sound Palette: `low bell`, `paper`, `wind`を視覚字幕として任意表示。 | sound eventと同時に短いcaption、user設定。 | live region乱用なし。意味音だけassertive、装飾音は非通知。 | CASE-035, SYS-12 |
| IDEA-091 | SND | Tempo from Interaction, Not Fate: drag速度でambient tempoが80–100%変化。 | interaction中だけ、releaseで中立へ。 | 結果や期待度と関連づけない。音offなら視覚も不要。 | CASE-052, CASE-054 |
| IDEA-092 | SND | Scene Audio Bus: ambient/foley/voiceの3busを独立管理。 | mount creates buses、exit abort controllerで全停止。 | volume設定永続、voice字幕、background tab suspend。 | CASE-060, SYS-12 |
| IDEA-093 | INT | Hold-to-Reveal with Alternative: 600ms holdで封印がほどける。 | pointer/Space holdまたは`すぐ開く`click。 | motor負荷回避、progress label、途中解除でreset。 | CASE-002, CASE-015 |
| IDEA-094 | INT | Tilt-as-Decoration: device tiltは背景旗だけ動かし選択には使わない。 | explicit enable後±2度。 | permission拒否/no sensorで静止。reduced-motion off。 | CASE-049, CASE-051 |
| IDEA-095 | INT | Draw a Route, Not a Symbol: 3点を結ぶと旅程themeが選ばれる。 | pointer drawまたは3button順次選択。 | 結果不変、reset、touch target44px。 | CASE-002, CASE-048 |
| IDEA-096 | INT | Conduct the Lights: 上下dragで灯の明るさを変える。 | preview only、releaseで選択確定。 | range input同値、labelと数値。 | CASE-002, CASE-062 |
| IDEA-097 | INT | Reveal Brush: pointerで覆いを削らず、通過領域の補助絵だけ表示。 | 30%探索で全体表示button提示。 | click `全体を見る`、canvasなしでも即表示。主要文を隠さない。 | CASE-019, CASE-035 |
| IDEA-098 | INT | Crown Assembly: 3部品をdrag/dropまたはbuttonで並べ、themeを作る。 | explicit play area、完成後undo/edit。 | accessible sortable list、結果・報酬とは無関係。 | CASE-008, CASE-053 |
| IDEA-099 | INT | Echo Choice: 以前のtheme選択を提案するが毎回変更可能。 | local preference→suggest chip、auto applyしない。 | clear history、no account、choice説明。 | CASE-025, CASE-027 |
| IDEA-100 | INT | Shared Viewing Baton: 同席sceneで進行役を明示し交代可能。 | room state、host advances、handoff button。 | 個人結果を他者へ自動公開しない。solo/replay版。 | CASE-028 |
| IDEA-101 | DAY | Daily Gate Patina: 日ごとに入口門の材質が4段循環。 | local date seed、内容/結果は同一。 | date変更で急なloadなし、static CSS token。 | CASE-032, CASE-074 |
| IDEA-102 | DAY | Court Almanac: 今日の季節・月相を装飾情報として短く表示。 | user locale date、外部追跡なし。 | 科学/占いの因果を主張しない。hide option。 | CASE-026, CASE-031 |
| IDEA-103 | DAY | One New Footnote: 日替わりでアーカイブの補足1件を先頭提案。 | deterministic rotation、既読でも消失しない。 | streakなし、いつでも全補足へアクセス。 | CASE-011, CASE-032 |
| IDEA-104 | DAY | Royal Weather Rotation: 7種背景を曜日で循環しmanual変更可。 | default suggested theme。 | low modeはsolid color、結果確率との関連なし。 | CASE-026, CASE-042 |
| IDEA-105 | GAME | Exploration Passport: 地区訪問を印として残すが未訪問も機能利用可。 | scene completionでlocal badge。 | 報酬/順位/streakなし、reset/export。 | CASE-005, CASE-026 |
| IDEA-106 | GAME | Gentle Puzzle Gate: 任意の3手puzzleでalternate entranceを開く。 | solveまたはskipで同じdestination。 | 時間制限・失敗罰なし、keyboard solution。 | CASE-017, CASE-043 |
| IDEA-107 | GAME | Cooperative Chorus: 参加者のemojiで舞台色だけ混ざる。 | 2–10人session、色state aggregation。 | 個人データなし、勝者なし、solo palette。 | CASE-028, CASE-057 |
| IDEA-108 | RET | Return Postcard: 前回sceneの静止1枚と一文を次回入口に表示。 | local last-scene metadata、1回dismissで消える。 | 保存off/clear、画像ではなく独自生成thumbnail。 | CASE-022, CASE-027 |
| IDEA-109 | RET | Seasonal Archive Shelf: 履歴を季節棚へ自動整理。 | date groupingのみ、内容重みづけなし。 | chronological listへtoggle、empty seasonも肯定表示。 | CASE-026, CASE-029 |
| IDEA-110 | RET | Next Royal Broadcast: 更新予定を曖昧countdownでなく日付と内容で告知。 | editorial scheduleから表示。 | FOMO文言・偽timerなし、通知opt-in別。 | CASE-020, CASE-032 |
| IDEA-111 | SUR | Reversible Header Guest: 稀に小さな王国使者がheader端から挨拶。 | session初回かつ1/8、2秒で去る。 | navigationを覆わず、dismiss、reduced-motion静止icon。 | CASE-058, CASE-060 |
| IDEA-112 | SUR | Wrong-door Comedy: 門が一度だけ少し横へ逃げ、即戻る。 | decorative gateへのpointerで最大1回。 | 主要CTAには適用しない。keyboard/reduced-motionなし。 | CASE-005, CASE-058 |
| IDEA-113 | SUR | Mirror Day: 月1回、装飾の左右だけ反転しUI位置は不変。 | deterministic calendar theme。 | text/icon/navigation非反転、manual off。 | CASE-020, CASE-025 |
| IDEA-114 | SUR | Tiny Stagehand: scene転換時に裏方の手が幕を直す。 | 1/10 scene transition、600ms以内。 | skip露出、静止corner illustration。 | CASE-011, CASE-060 |
| IDEA-115 | SUR | Honest Fake Loading: loaderではなく「舞台準備中」と実進捗を併記。 | asset fetch中のみ、bytes/chunks実値。 | 偽待機なし、timeout→fallback、cancel/continue text mode。 | CASE-024, CASE-055 |
| IDEA-116 | SUR | Archive Echo: 過去のcard色が背景へ1秒だけ反射。 | archive→home return時、local metadata。 | card内容や個人情報を露出しない、off設定。 | CASE-025, CASE-057 |
| IDEA-117 | INTEGRATED | Three-quality Theatre: 静穏/標準/劇場をscene入口で選択し途中変更可。 | capability suggests、user decides、next sceneから適用。 | 全tierで同内容・同終了時刻上限。 | CASE-046, CASE-059 |
| IDEA-118 | INTEGRATED | Result-first Premium: 結果本文を即表示し、その後に任意`物語で見る`。 | result commit→focus text→optional scene。 | animationが結果を人質にしない。 | CASE-023, CASE-027 |
| IDEA-119 | INTEGRATED | Royal Scene Recipe: `layout+light+transition+sound`各1tokenをmanifestで合成。 | deterministic scene seed、最大4 ingredients。 | tokenごとにcleanup/fallback/test id。 | CASE-062, SYS-03 |
| IDEA-120 | INTEGRATED | Memory Garden: 履歴は量で競わず、各訪問が異なる休息植物を一つ残す。 | saved result date→deterministic plant silhouette。 | streak/枯死なし、empty gardenも完成形、2D SVG default。 | CASE-026, CASE-029 |

## 4. Original Chaos / Surprise catalogue

Chaosは「壊れたように見せる短い演劇」であり、実際の状態・結果・戻る・閉じる・同意を壊さない。各案は一意の`presentationSeed`で再現可能にし、1 session最大1件、同familyは3 session cooldown。`reduced-motion`, data saver, screen reader優先mode, `静穏`設定では自動無効。`Skip chaos`は常に同じ位置に置く。

| ID | Original surprise | Eligible trigger / cap | Sequence and guaranteed exit | Invariant / fallback |
|---|---|---|---|---|
| CHAOS-01 | Sideways Kingdom: stageだけが3度傾き、侍従が水平線を直す。 | result後、micro、最大900ms。 | tilt 250ms→手が押し戻す400ms→settle。 | core UIは傾けない。reduced-motionは角に水平器iconを一瞬表示。 |
| CHAOS-02 | Tiny Throne: cameraが引くと王座が意外に小さく、すぐcardへ戻る。 | optional full scene、最大3秒。 | zoom-out→1行caption→`戻る`/auto return。 | 結果本文は先に表示。固定画像版あり。 |
| CHAOS-03 | Secret Side Door: 背景壁に小扉が開き、紙片を置いて閉じる。 | idle 4秒後、1/12 eligible。 | door open→ornament drop→close、1.4秒。 | 操作を覆わずpointer-events none。静止corner badge。 |
| CHAOS-04 | Court Floor Wave: grid床の一列だけ波打ち、隣列が制止する。 | navigation直後、micro。 | 4セルを順に6px上げて全復帰、700ms。 | layoutは変えずtransformのみ。motion offでborder色移動。 |
| CHAOS-05 | Ceiling Window: 天井の細帯だけ夜空へ変わり一つ星が通過。 | day themeかつsession初回。 | slit reveal→star traverse→close、1.8秒。 | 点滅なし、星1個、静止gradientへ縮退。 |
| CHAOS-06 | Card Overshoot Apology: 装飾cardが定位置を8px越し、小さくお辞儀して戻る。 | non-primary preview cardのみ。 | overshoot→bow→settle、500ms。 | primary result/buttonには適用しない。motion offでcorner label。 |
| CHAOS-07 | Shadow Arrives First: キャラクター影だけ先に入り、本体が追いつく。 | character scene、最大1回。 | shadow 300ms→body 250ms→align。 | 台詞開始を遅らせない。影なし静止版。 |
| CHAOS-08 | Backdrop Peel: 背景の一角が紙のようにめくれ別色が見える。 | theme transition、micro。 | peel 350ms→stagehand pin→new theme。 | content layer不変、clip-pathなしはsimple color swap。 |
| CHAOS-09 | Program View: 3D舞台が一瞬、同じsceneの平面「演目表」へ畳まれる。 | userが`Chaos`を明示選択。 | flatten→3項目表示→re-expand/exit、最大4秒。 | 同じ情報・同じcontrols。reduced-motionは直接program view。 |
| CHAOS-10 | Attendant Navigation: nav横に小さな案内役が各labelを指差す。 | first visitのみ、dismiss可能。 | 3labelsを順に示し退場、最大3秒。 | nav位置・label・focus不変。通常tooltip代替。 |
| CHAOS-11 | Button Bow: secondary buttonsだけが結果確定後に一度お辞儀。 | celebration scene、600ms。 | scaleY 1→0.96→1。 | primary CTA、focused buttonは動かさない。motion offでoutline pulse1回。 |
| CHAOS-12 | Crown Wake: pointer後流が一瞬だけ小王冠形になり直ちに点へ戻る。 | fine pointer、max2秒。 | 6 glyphs cap→fade。 | touch/keyboard/off。独自shape、pointer action不要。 |
| CHAOS-13 | Banner Scrollbar: section進捗barの先端だけ旗になる。 | long storyの中間50%。 | flag unfurl→通常marker、1秒。 | native scrollbarは変更しない。progress label本体。 |
| CHAOS-14 | Polite Tooltip: tooltipが一度だけ「失礼」と退き、正しい位置へ出る。 | optional lore control、session1回。 | wrong-side 150ms→correct-side。 | 情報は同時表示、遅延なし。keyboardは最初から正位置。 |
| CHAOS-15 | Indoor Weather: 背景の一部にだけ小雨が降り、侍従が傘を置く。 | non-rain theme、1/16。 | rain 1.5秒→umbrella icon→clear。 | content背後、粒子max24、static icon fallback。 |
| CHAOS-16 | Reverse Assembly: 幕→背景→前景の通常順を一度だけ逆順で組む。 | scene mount、full、max2.5秒。 | foreground silhouette→background→curtain opens。 | reading contentは完成後でなく先にDOM表示。skip直行。 |
| CHAOS-17 | Crest Hiccup: 実loaderの紋章が一度だけ小さく「しゃっくり」する。 | fetchが400ms超の時のみ。 | true progress継続、icon pulse1回。 | fake progress/追加待機禁止。timeoutでfallback。 |
| CHAOS-18 | Focus Escort: keyboard focusがsection境界を越える時だけ小灯が先導。 | keyboard navigation、opt-in。 | light moves 150ms、focusは即移動。 | focusを遅延・奪取しない。screen reader mode既定off。 |
| CHAOS-19 | Herald Interruption: 使者が「大変です」と入り、「演出でした」と即退場。 | lore scene、1/20、max3秒。 | entrance→2短文→exit/skip。 | 緊急・損失・課金を示唆しない。captionのみ版。 |
| CHAOS-20 | Paper Bird Delivery: 折紙風の独自幾何鳥が補足cardを運ぶ。 | unread optional noteがある時。 | fly 700ms→note place→rest。 | note listから常時開ける。birdなし即note。 |
| CHAOS-21 | Invisible Orchestra: 楽器の席だけ点灯し、音は別方向から一度鳴る。 | sound opt-in + stereo、micro。 | 3 lights→3 notes→normal mix。 | headphones要求なし。mono/音offは3字幕chips。 |
| CHAOS-22 | Twin Narrators: 同じ事実を「簡潔」と「芝居調」の二声が一文ずつ言う。 | userがtone comparisonを開く。 | A→B→user selects preferred tone。 | 内容意味同一、音声なし全文、設定変更可。 |
| CHAOS-23 | Footnote Revolt: 脚注が「私も本文です」と一度だけ少し大きくなる。 | archive deep dive、micro。 | 1.05 scale→settle、700ms。 | 本文順・意味不変。motion offでbackground tint。 |
| CHAOS-24 | One-beat Time Loop: 幕が閉じかけた最後の300msだけ一度巻き戻る。 | non-critical transition、1/20。 | reverse300→complete normally。 | 最大追加300ms、skip露出。audioも短く正確に戻すかoff。 |
| CHAOS-25 | Audience Gasp: 舞台外周の3影が驚き、すぐ礼をする。 | result celebration、sound opt-in。 | silhouettes rise→bow→leave、1秒。 | 結果価値と無関係。同頻度を全結果classへ。 |
| CHAOS-26 | Stagehand Cleanup: confetti終了時、裏方が一掃してcanvasも消える。 | particle scene exit。 | sweep visualと同時にparticles destroy→DOM remove。 | cleanupを演出にしつつtimeout後必ず強制dispose。静止版は即除去。 |
| CHAOS-27 | Stubborn Curtain: 幕が5%だけ閉まり残り、紐を引くと正常化。 | user-enabled chaos、max2秒。 | pause250ms→stagehand pull→open。 | skip/CTAは常に見える。入力を要求せず自動解決。 |
| CHAOS-28 | Motif Detour: 3音motifの2音目だけ別楽器、3音目で戻る。 | sound opt-in、session1回。 | exact musical bar内で完結。 | 不協和・大音量なし、結果classと無相関。 |
| CHAOS-29 | Soloist Spotlight: ambientの一層だけ1秒前景に出て席へ戻る。 | idle scene、sound opt-in。 | gain +2dB max→normal。 | master volume厳守、字幕`楽器が前へ`は任意。 |
| CHAOS-30 | Door Knock from Wrong Side: 画面反対側で小さなknock、正しい門が光る。 | portal preview、1/16。 | knock→correct door halo→settle、900ms。 | spatial audioなしは左右caption不可、単に門outline。 |
| CHAOS-31 | Whisper Becomes Caption: 音声が途中で消え、その続きが文字札として着地。 | voice opt-in scene、max3秒。 | voice phrase→duck→caption tile。 | 最初から全文字幕あり。驚き字幕は重複読上げしない。 |
| CHAOS-32 | Emoji Comet: shared viewingのreactionが勝敗なく外周を彗星として通る。 | explicit group room、rate limit1/s。 | emoji→trail→fade、700ms。 | content遮蔽なし、mute reactions、文字logは任意。 |
| CHAOS-33 | One-second Wrong Season: 入場時だけ季節色が一つ先になり、暦係が戻す。 | seasonal theme、月1回、max1秒。 | wrong token→calendar stamp→correct token。 | 結果・日付情報は最初から正しい。motion offでstampのみ。 |
| CHAOS-34 | Monochrome Courtesy: 装飾だけが彩度0になり、王印の押下で色が戻る。 | user-enabled chaos、最大2秒。 | grayscale decor→auto restore、pressは任意。 | text/control色不変、press不要、high-contrast off。 |
| CHAOS-35 | Upward Confetti: 紙片が下から上へ流れ天井の帯に整列。 | celebration、1/12、1.2秒。 | rise→line up→fade/destroy。 | 外周のみ、max60、static top border fallback。 |
| CHAOS-36 | Post-credit Footman: scene退出後、背景端から一人だけ戻り忘れ物を回収。 | full scene後、次操作が2秒ない時。 | peek→pickup→exit、1.1秒。 | core画面を覆わず、入力で即cancel/dispose、static badgeなし。 |

### Chaos frequency policy

| Rule | Contract |
|---|---|
| Selection | `presentationSeed = hash(sessionNonce, visitOrdinal, sceneId, userChaosPreference)`。Oracle result seed / result class / account valueを入力にしない。 |
| Eligibility | 静穏mode・reduced-motion・data saver・初回critical onboarding・error recovery・決済/同意画面は0%。 |
| Session budget | 70% no chaos / 25% micro / 5% fullを初期実験値とし、1 session最大1件。これはpresentationの頻度で、結果確率ではない。 |
| Fairness | すべての結果classで同じeligible distribution。良い結果ほど豪華、悪い結果ほど短いという条件分岐を禁止。 |
| Control | settingsに`Chaos: off / rare / standard`。`standard`でも上限は同じ。scene中のskipは即座にsettled stateへ。 |
| Telemetry | `eligible`, `selected`, `started`, `skipped`, `completed`, `fallbackReason`のみ。Oracle内容、音声、pointer軌跡を収集しない。 |

## 5. Implementation architecture derived from the research

### 5.1 Result and presentation are separate authorities

```text
user action
   ├─ ResultEngine.resolve(resultSeed) ──> immutable ResultRecord
   └─ PresentationPlanner.plan(presentationSeed, capabilities, preferences)
                                      └─> PresentationPlan

SceneController consumes { ResultRecord, PresentationPlan }
but PresentationPlanner cannot read resultSeed, resultClass, payout/value, or account value.
```

Required invariants:

1. `ResultRecord` is committed before scene preload/animation starts and cannot be rewritten by skip, error, refresh, offline transition, quality tier, sound setting, chaos, or interaction performance.
2. `PresentationPlan` may choose layout, camera, light, sound, transition, interaction prompt and chaos family. It may receive text length / available media aspect ratio only after selection for fitting, never result value for route weighting.
3. `Skip` applies the exact same final DOM state, focus target and history record as `complete`.
4. Asset failure downgrades presentation only. It never retries the result draw and never displays a substitute result.
5. Analytics events identify scene/presentation IDs, not hidden probabilities. If any result probability exists elsewhere, UI copy and legal disclosure remain owned by ResultEngine/product policy, not by spectacle intensity.

### 5.2 Full-event lifecycle

| State | Owned work | Exit condition | Mandatory cleanup |
|---|---|---|---|
| `idle` | core page, result request not yet committed | user action | none |
| `resolved` | immutable result saved; plan chosen independently | route accepted | abort stale preloads |
| `preloading` | optional scene chunk/assets; true progress | ready, timeout, error, skip | cancel fetch/decode not needed |
| `entering` | backdrop/inert/focus scope; short transition | animation end or 800ms watchdog | cancel timeline listeners |
| `interactive` | at most one primary verb | complete, skip, 8s idle affordance | remove pointer/keyboard/sensor listeners |
| `revealing` | expose existing result DOM; never draw result now | content visible and focusable | clear audio schedules, observers |
| `settling` | stop camera/particles; leave readable final pose | max1.2s or skip | stop RAF, physics sleep/destroy |
| `complete` | sharing/archive/exit available | exit/navigation | persist only allowed preferences/history |
| `exiting` | return context and focus | max500ms watchdog | dispose renderer, textures, audio nodes, workers |
| `disposed` | zero scene-owned handles | terminal | assert registry size 0 in development |

Every scene gets one `AbortController`, one cleanup registry, a hard total timeout, and an idempotent `finish(reason)` method. `pagehide`, `visibilitychange`, route change, skip, error and component unmount all call the same finish path.

### 5.3 Scene recipe schema

```js
{
  id: "royal-scene-original-id",
  beats: ["enter", "interact", "reveal", "settle"],
  primaryVerb: "hold",              // one only
  ingredients: {
    layout: "split-court",
    light: "oracle-key",
    transition: "stamp-cut",
    sound: "three-note-motif"
  },
  caps: { durationMs: 6500, particles: 40, dpr: 1.5, audioVoices: 4 },
  fallbacks: { motion: "instant", gpu: "poster", audio: "captions" },
  cleanup: ["raf", "timelines", "audio", "renderer", "observers", "sensors"]
}
```

Recipe rule: one primary visual effect, one support effect, one transition, one optional sound layer。shader＋particles＋physics＋postprocessingを同一sceneで全部有効にしない。

## 6. Sound system

| Concern | Production rule |
|---|---|
| Consent | 音は明示gesture後だけ開始。初期値offまたは既存user preference。ブラウザautoplay解除をloaderと偽装しない。 |
| Buses | `master`, `ambient`, `foley`, `voice`。各sceneはsub-busを所有し、exitでdisconnect。最大同時voice 6（mobile 4）。 |
| Motif | 3音の独自motifを状態識別に使用。良否・希少度・価値を音量/長さで符号化しない。 |
| Voice | 全voiceに同期字幕とtranscript。字幕をcanvasに描かずDOMへ。速度変更・再生停止。 |
| Spatial | 一場面1 ambientのみ。重要情報を左右定位だけで示さない。headphones前提禁止。 |
| Assets | 原音を新規制作または明確な商用許諾。WebM/Opus＋MP3/AAC fallback、短音はsprite、長音はstream。 |
| Lifecycle | `visibility:hidden`でsuspend/fade、route exitでscheduled event cancel、AudioBuffer参照解放。 |
| Loudness | surpriseで急増させない。master limiter、scene間の知覚音量を揃え、OS音量を尊重。 |

## 7. Asset plan and provenance

| Asset family | Create / source plan | Runtime form | Rights record |
|---|---|---|---|
| Royal marks / ornaments | NAOKING専用の幾何ルールから新規vector制作 | SVG symbols / CSS masks | creator, date, source file, license, modification log |
| Characters / stagehands | 既存作品の生物・衣装・シルエットを参照せず新規model sheet | WebP/AVIF sprite atlas; optional glTF | character bible、権利者、類似性review |
| 3D rooms / props | 独自blockout→low-poly、texture atlas共有 | glTF/GLB + KTX2/Basis where justified | source mesh、texture origin、third-party notice |
| Shader | 公開作品のshader codeをコピーせず、必要な数学効果を最小実装 | GLSL/WGSL source in repo | author、license if derived、test screenshot |
| Type | 既存repo fontまたは購入済みJP対応fontを優先 | WOFF2 subset、font-display policy | EULA、allowed domains、seat/pageview terms |
| Sound / voice | 新規録音・合成、または商用許諾library | WebM/Opus + MP3/AAC; VTT transcript | performer consent、territory/term、model-use prohibition where needed |
| Photography / video | 必要時のみ撮影/commission。award siteから抽出しない | AVIF/WebP; MP4/WebM adaptive poster | model/property release、credit、expiry |
| Daily variants | parametric color/shape tokenで生成し毎日asset追加を避ける | JSON token + shared SVG | generator source ownership、seed policy |

Before merge, every non-code asset must have `assetId`, origin, license/contract, attribution requirement, permitted modification, permitted distribution, expiry and owner. Unknown provenance means reject, not placeholder ship.

## 8. Mobile, performance, accessibility, and cleanup guardrails

### Proposed budgets

| Budget | Mobile default | Theatre/high tier | Enforcement |
|---|---:|---:|---|
| Additional initial route JS for creative layer | ≤ 35KB gzip | same; premium remains lazy | bundle report in CI |
| Lazy full-scene JS | ≤ 120KB gzip/scene | ≤ 180KB gzip/scene | per-chunk limit |
| Decoded texture memory active | ≤ 24MB | ≤ 48MB desktop only | runtime counter + asset manifest |
| Canvas count | 1 | 1 | DOM assertion |
| DPR | cap 1.25 | cap 1.75 | quality manager |
| Active particles | 40 | 120 desktop | scene manifest assertion |
| Active postprocess passes | 0–1 | ≤ 2 | renderer instrumentation |
| Animation frame target | stable 30fps minimum | 60fps where sustainable | 2s rolling monitor; auto-downgrade at <45fps |
| Main-thread long task | no task >50ms caused by scene | same | PerformanceObserver |
| Full scene duration before usable result | result usable immediately; optional story ≤8s | same | E2E timing |
| Exit / cleanup | ≤500ms visual; resources released ≤1s | same | lifecycle test |

### Mobile contracts

- Desktop scroll/orbit becomes swipe carousel or explicit prev/next; orientation is never required. Touch targets ≥44×44 CSS px、safe-area inset、browser chrome変動の`dvh`を考慮。
- Device tilt、camera、microphone、locationは追加体験の明示permissionだけ。拒否しても同一結果・同一情報・同一終了へ到達。
- `Save-Data`, effective connection type, device memory, thermal/fps signalは品質提案に使い、user overrideを尊重。能力情報をanalytics identityにしない。
- mobileでvideo/3Dを先読みしない。poster first、interaction後にscene chunk、表示中scene以外のtexture/audioは保持しない。

### Reduced motion and sensory safety

- `prefers-reduced-motion: reduce` では camera travel、parallax、particle travel、physics、scrub、loop、chaosを無効。opacityの長いcrossfadeも避け、最終状態を即表示。
- 独立した `静穏 / 標準 / 劇場` 設定を提供しOS設定を上書きせず、静穏を選んだ後に再勧誘しない。
- 3 flashes/secondに近づく表現を作らない。glitch、strobe、急なfullscreen白、強いzoom、screen shake、unexpected loud soundは禁止。
- すべてのcanvas/WebGL sceneに同等のsemantic HTML、keyboard path、text alternative、skip、focus restorationを実装。decorative canvasは`aria-hidden`。
- animation中のlive region更新禁止。状態の意味が変わった時だけ短いstatusを通知。

### Cleanup checklist

- RAF / timers / GSAP timelines / Motion controls / observers / event listeners / media queries / sensor subscriptionsをscene ownerで登録しabort時に全解除。
- Three.jsのgeometry/material/texture/render target、Pixi texture/container、physics world/body、Rive instance、AudioNode/AudioBuffer参照、Worker/OffscreenCanvasをdispose/terminate。
- `visibilitychange`でanimation/audioを停止し、復帰時は経過時間をcatch-up animationで再生せず現在stateへsnap。
- route change、back/forward、skip、error、timeout、GPU context lost、orientation changeを同じE2E suiteで検証。scene exit後のRAF、canvas、audio node、listener数がbaselineへ戻ること。

## 9. Daily, gamification, surprise, and return-motivation ethics

| Mechanism | Allowed | Not allowed |
|---|---|---|
| Daily | 色・紋章・天候・補足のdeterministic rotation、全履歴への後日アクセス | streak loss、連続日数で結果優遇、見逃し罰、偽限定 |
| Gamification | 任意探索、協力、図鑑、訪問印、skipと同一到達先 | pay-to-progress、leaderboard煽り、人格/運の優劣、結果を変えるskill illusion |
| Surprise | 短いpresentation変化、1 session上限、再現可能seed、常設skip | 結果確率に連動、戻る/閉じる移動、偽error、偽loading、同意の隠蔽 |
| Return | 自分の履歴、季節庭園、編集予定、前回からの継続 | notification spam、scarcity countdown、友人比較、未訪問で枯れる資産 |
| Personalization | userが選んだtheme/音/motion、local clearable memory | 無断profiling、感情推定、音声/顔/軌跡保存、弱者を狙う頻度最適化 |

## 10. Implementation priority

| Phase | Deliverable | Why now | Acceptance gate |
|---|---|---|---|
| P0 | semantic scene shell、Result/Presentation分離、skip/focus/abort/cleanup、静穏mode | 全表現の安全な土台 | result invariant tests、zero leaked handles |
| P1 | IDEA-004/010/022/028/061/079/085/117/118/119 | 小さな部品でlayout/light/transition/soundの文法を確立 | mobile + keyboard + reduced-motion E2E |
| P2 | 2D celebration（IDEA-053/073/076）、history/return（IDEA-108/109/120） | 3Dなしで高い固有性と再訪価値 | budgets内、asset provenance complete |
| P3 | one optional Three.js room（IDEA-031/035/055） | fallbackとcleanupが固まってから | GPU loss、poster fallback、memory release |
| P4 | Chaos micro setから3件だけA/Bでなく安全性pilot | surprise fatigueを先に測る | skip rate、motion complaints、no result correlation |

Recommended first Chaos pilot: `CHAOS-03`（背景端だけ）、`CHAOS-26`（cleanupを可視化）、`CHAOS-36`（入力で即cancel）。偽挙動に近い`CHAOS-14/17/19/27`はtone/user trust review後まで保留。

## 11. Source and claim audit notes

- 公式URLは各`CASE-*` / `SYS-*`行に直接置いた。同一スタジオの複数案件は各案件の公式case URLが取得できたものを優先し、一覧しかないものは`official portfolio description`と明記した。
- 作品の技術stackが制作者資料にない場合は推定しなかった。awardページに`WebGL`等が明記された場合だけその範囲を記録。
- `current`行を2025–2026件数へ水増ししていない。manifestの47件はYear列が文字通り`2025`または`2026`の行だけを数える。
- 各licenseは2026-08-31時点の公式source/docs確認。導入時点のrelease tagのLICENSEをlockfileと共に再保存する。
- この文書は法的助言ではない。asset/書体/音声/AGPL/LGPL/standard commercial termsはrelease前に権利者・法務確認が必要。

## 12. Mechanical validation recipe

PowerShell例（ファイルを変更しない）:

```powershell
$p = 'WORLDWIDE-CREATIVE-RESEARCH.md'
$t = Get-Content -Raw -LiteralPath $p
[pscustomobject]@{
  cases   = ([regex]::Matches($t, '(?m)^\| CASE-\d{3} \|')).Count
  recent  = ([regex]::Matches($t, '(?m)^\| CASE-\d{3} \| 202[56] \|')).Count
  systems = ([regex]::Matches($t, '(?m)^\| SYS-\d{2} \|')).Count
  ideas   = ([regex]::Matches($t, '(?m)^\| IDEA-\d{3} \|')).Count
  chaos   = ([regex]::Matches($t, '(?m)^\| CHAOS-\d{2} \|')).Count
  urls    = ([regex]::Matches($t, 'https://')).Count
}
```

Expected: `cases=66`, `recent=47`, `systems=22`, `ideas=120`, `chaos=36`, `urls>=80`。さらに各ID系列が1から連番で重複・欠番なし、全URLが`http 2xx/3xx`または公式側のbot防御として説明可能であることをrelease時に再検査する。
