# ROYAL ORACLE — ULTIMATE ENTERTAINMENT RESEARCH

Repository: naoking-fortune  
Branch reviewed: main  
Research and implementation snapshot: 2026-08-31  
Scope: presentation structure only; no result-probability change

## 1. Audit summary

This memo records the research-to-implementation trail for the ULTIMATE ENTERTAINMENT EXPANSION.

| Audit item | Recorded value |
| --- | ---: |
| Original full-event / chaos concepts | 60 |
| Independent site-wide takeover concepts | 26 |
| Fish-school concepts researched | 15 |
| Reel / animation grammars researched | 20 |
| Expansion routes selected in roulette-entertainment.js | 18 |
| Fish-school families selected | 5 |
| Effective reel range | 4–8 |
| New named scene definitions | 13 |
| New routes with named ending trees | 10 |
| New declarative reel grammars | 13 |
| New route audio-scene keys | 11 |

All concepts, copy, compositions, CSS geometry, and sound recipes are original NAOKING adaptations. The sources below are used only to study abstract structures: staged disclosure, group motion, expectation ladders, reel anomalies, branching, revival, cabinet-wide synchronization, and outcome integrity. No proprietary character, logo, cabinet design, melody, footage, symbol set, or named effect is to be copied.

## 2. Source log and structural findings

### Mandatory industry reference

| Source | Date | Structural finding used | Adaptation boundary |
| --- | --- | --- | --- |
| [DMM P-TOWN: 激アツ（激熱）とは？](https://p-town.dmm.com/specials/2183) | Published 2020-12-05; updated 2021-06-07; reviewed 2026-08-31 | The article describes “hot” as high confidence rather than certainty; gives a common white/blue/yellow/green/red/gold/rainbow-style escalation vocabulary; explains group prediction, next-preview, cut-in strength, and button transformations. It also notes that obvious and subtle cues can coexist and that machine-specific exceptions matter. | This is a secondary vocabulary source, not an odds specification. The cited 40–50% examples are not imported. NAOKING uses original colors, fish, text, timing, and scenes, and never copies a manufacturer pattern or visual. |

The mandatory DMM URL’s article body was directly opened and reviewed; no page artwork, screenshots, wording, or manufacturer-specific visual was brought into the implementation.

### Primary / official-leaning mechanics references

| Area | Source and date | Extracted presentation structure |
| --- | --- | --- |
| Group prediction | [JP7200176B2](https://patents.google.com/patent/JP7200176B2/ja), granted 2023-01-06 | Multiple objects may move as a group; the objects may be fish, people, animals, or machines, and one or several kinds can compose the group. This supports “school” as a motion family rather than one fixed picture. |
| Group direction and sound | [JP2018202248A](https://patents.google.com/patent/JP2018202248A/ja), published 2018-12-27 | A group crossing the display can carry a dedicated sound and can act as a stage that develops into a stronger later cue. Direction is part of the grammar. |
| Color / light escalation | [JP6491634B2](https://patents.google.com/patent/JP6491634B2/en), granted 2019-03-27 | Emission color can progress in stages to communicate expectation; combinations can be constrained so the apparent expectation does not arbitrarily step backward. |
| Multi-axis light cue | [JP7753308B2](https://patents.google.com/patent/JP7753308B2/ja), granted 2025-10-14 | Brightness and color can form staged indication, and a next-preview can follow input or timeout. For this project, hue, luminance, coverage, motion, and sound are independent axes. |
| Reel anomalies | [JP2014147688A](https://patents.google.com/patent/JP2014147688A/ja), published 2014-08-21 | Freeze, reverse rotation, and asymmetric left/right start delays make the reel itself the omen rather than placing a text cue on top. |
| False stop / restart | [JP2005066208A](https://patents.google.com/patent/JP2005066208A/en), published 2005-03-17 | Temporary stopping followed by renewed movement sustains uncertainty after an apparent conclusion. |
| Selective respin | [US20200342721A1](https://patents.google.com/patent/US20200342721A1/en), published 2020-10-29 | Holding some symbols while re-spinning others creates a second decision beat without changing the already selected canonical result. |
| Array expansion | [US12266240B2](https://patents.google.com/patent/US12266240B2/en), granted 2025-04-01 | A trigger may expand a symbol array. ULTIMATE translates this into 4–8 witnesses, accordion cages, and unregistered reels. |
| Branch and later reversal | [JP2024113620A](https://patents.google.com/patent/JP2024113620A/en), published 2024-08-22 | A scene can branch toward favorable or unfavorable development and later move from unfavorable to favorable; input, time, or order may provide hints. |
| Defeat then revival | [JP6688750B2](https://patents.google.com/patent/JP6688750B2/en), granted 2020-04-28 | A multi-step battle may show defeat, insert a beat, then revive into victory. ULTIMATE applies the timing structure to races, school, portals, repair, and UI failure. |
| Cabinet-wide synchronization | [US9972161B2](https://patents.google.com/patent/US9972161B2/en), granted 2018-05-15 | Cabinet light color, sequence, and timing can synchronize with base and bonus states. The web analogue is synchronized background, navigation, page edge, depth rail, reel, and audio. |
| Conceal then open | [US20060019733A1](https://patents.google.com/patent/US20060019733A1/en), published 2006-01-26 | A physical member can conceal a display and later open to reveal it. The original web adaptation uses masks, shutters, page folds, and frame mouths. |
| Multi-machine light field | [WO2008057588A2](https://patents.google.com/patent/WO2008057588A2/en), published 2008-05-15 | Coordinated light patterns can span multiple machines. Site-wide takeover routes similarly treat otherwise separate page surfaces as one stage. |
| Arcade overlay | [US20200013256A1](https://patents.google.com/patent/US20200013256A1/en), published 2020-01-09 | A transparent display can overlay and transform a physical playfield. This informs glass, HUD, CCTV, and portal overlays without copying a cabinet. |
| Bonus-condition lighting | [US20150051026A1](https://patents.google.com/patent/US20150051026A1/en), published 2015-02-19 | Lighting on an arcade goal can signal a time-limited or bonus condition. ULTIMATE uses goal edges and page borders as readable state, not decoration alone. |
| Gacha reveal chain | [JP7443475B1](https://patents.google.com/patent/JP7443475B1/en), granted 2024-03-05 | A reveal may travel through a 3D space, silhouette, gate, per-character animation, and final list. The useful abstraction is multi-stage identity disclosure. |
| Partial conceal / reveal | [US6347996B1](https://patents.google.com/patent/US6347996B1/en), granted 2002-02-19 | Portions of one unified image may be concealed and revealed in steps, supporting mask-based uncertainty. |
| Progressive information | [WO2008011600A2](https://patents.google.com/patent/WO2008011600A2/en), published 2008-01-24 | Hints and elimination of choices can progressively narrow an unknown value. A cue should reduce uncertainty without necessarily ending it. |
| Hidden presentation state | [US20260094489A1](https://patents.google.com/patent/US20260094489A1/en), published 2026-04-02 | A hidden presentation state can drive a scripted event before the complete value is shown. ULTIMATE keeps that state subordinate to the frozen result. |

Patents are cited as mechanics-taxonomy evidence, not as a clearance opinion or an implementation license.

### Outcome integrity, accessibility, and runtime references

| Source | Current/issue date | Project rule |
| --- | --- | --- |
| [UK Gambling Commission RTS 7 — generation of random outcomes](https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-7-generation-of-random-outcomes) | Updated 2024-05-07 | Preserve outcome mapping, do not fabricate a misleading near miss, and make the canonical result clear. |
| [UK Gambling Commission RTS 14 — responsible product design](https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-14-responsible-product-design) | Updated 2026-01-12 | Interaction must not imply control over a random outcome; a losing result must not be celebrated like a win. |
| [Nevada Gaming Control Board Technical Standard 1](https://gaming.nv.gov/uploadedFiles/gamingnvgov/content/Home/Features/TechnicalStandard1.pdf) | Official technical standard; reviewed 2026-08-31 | Outcome RNG and presentation/other-purpose randomness are separate concerns. |
| [CESA: ネットワークゲームにおけるランダム型アイテム提供方式運営ガイドライン](https://www.cesa.or.jp/uploads/2016/release20160427.pdf) | Released 2016-04-27 | Where paid random items are in scope, disclosure and operating rules belong to the product contract, not to dramatic cues. |
| [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) | Living official guidance; reviewed 2026-08-31 | Paid randomized virtual items require odds disclosure. This site is not to obscure such obligations with presentation. |
| [W3C C39: prefers-reduced-motion](https://www.w3.org/WAI/WCAG21/Techniques/css/C39.html) | Updated 2026-01-12 | Preserve story and result while replacing large motion with short fades, state changes, and readable text. |
| [MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) | Living platform reference; reviewed 2026-08-31 | Pause timers and expensive presentation while hidden; do not let stale callbacks resolve a scene off-screen. |
| [Three.js: How to dispose of objects](https://threejs.org/manual/en/how-to-dispose-of-objects.html) | Living official manual; reviewed 2026-08-31 | If a future temporary 3D scene is used, explicitly dispose geometries, materials, textures, render targets, and loop handles. |

## 3. Uncertainty and probability contract

The canonical result and its probability remain outside the entertainment expansion:

    resolve and Object.freeze(result)
      → filter result-compatible presentation routes
      → apply presentation-history and context weights
      → freeze route, reel count, stop order, modifier, and ending
      → play signal / anomaly / judgment / stop
      → reveal the original canonical result

The controller currently calls resolveFinalResult() before choosePresentation(result, context). roulette-entertainment.js contains presentation data only. It cannot replace title, image, message, effect, or the result draw.

Rules:

1. Never alter P(Result) to make a scene feel rare or dramatic. Adjust only P(Cue | Result).
2. The audience experiences P(Result | Cue). Calibrate this empirically; do not copy DMM’s example percentages.
3. A common full event should support normal, win, loss, and revival endings so “event started” is not equivalent to “win.”
4. “Oddity” may be uncorrelated, “Chance” lightly biased, “Hot” clearly biased but missable, “Very Hot” strongly biased with a rare miss, and “Premium” guaranteed only when the route contract explicitly permits win results only.
5. History changes presentation selection, not result odds. Track recent route and family gaps to avoid repeats.
6. Interaction changes camera, dialogue, prop, or timing only. It never changes the frozen result.
7. A loss leaf uses restrained light/audio and an unambiguous result; it must not masquerade as a win celebration.
8. Suggested telemetry: showsByCue, positiveResultsByCue, posteriorByCue, sameFamilyGap, sameGrammarGap, fakeHotRate, earlyResultGuessRate, and cleanupFailures.

## 4. Original event catalogue — 60 concepts

Every row has multiple possible leaves. These are research candidates, not promises that every row is implemented.

### Fish-school and pre-notice

| ID | Concept | Event structure | Example leaves |
| --- | --- | --- | --- |
| EVT-01 | 魚群入国審査 | A school queues at a tiny royal checkpoint while the reels continue behind it. | 全員通過 / 一匹逮捕 / 王が逆に検査される / 遅刻金魚で復活 |
| EVT-02 | 魚群議会 | Fish occupy witness seats and vote by changing formation. | 可決 / 否決 / 全員棄権 / Crown Fishが再投票 |
| EVT-03 | 海溝群トンネル | A distant school enters a trench and the exit is hidden. | 王宮へ出る / 空洞 / 巨大影 / 別Eventへ直結 |
| EVT-04 | 遅刻魚の予言 | One late fish carries a sign whose face is initially concealed. | 的中 / 逆さ文字 / 白紙 / 裏面Premium |
| EVT-05 | 魚群三叉路 | The school splits across three page-depth lanes. | Battleへ / Raceへ / Courtへ / 全群消失 |
| EVT-06 | 魚群渋滞 | Too many fish physically block the oracle cage. | 渋滞解消 / 全群逆走 / 交通王乱入 / Reelへ吸収 |

### Reel topology and witness anomalies

| ID | Concept | Event structure | Example leaves |
| --- | --- | --- | --- |
| EVT-07 | 第七証人未登録 | A hidden witness appears after the count has been certified. | 登録 / 退去 / 管理者化 / Freeze後に復活 |
| EVT-08 | Witness Elevator | Reels ride a depth elevator and the selected floor stays hidden. | 正しい階 / 行き過ぎ / 停電 / Secret Floor |
| EVT-09 | Accordion Reel | The cage stretches from five columns to six or seven. | 正常展開 / 途中停止 / Cage崩壊 / 全展開を巻戻し |
| EVT-10 | 横向き証人 | One reel rotates ninety degrees and reads across the others. | 整列 / 交差失敗 / Pageごと回転 / Portal化 |
| EVT-11 | Witness Evacuation | A witness abandons the cage during cruise. | 帰還 / 欠席続行 / 代理魚 / 群衆と復活 |
| EVT-12 | 巨大第六証人養子縁組 | An oversized witness asks to join a five-reel family. | 養子成立 / 拒否 / 他Reelを食べる / 極小化 |

### Machine, repair, blackout, and cabinet comedy

| ID | Concept | Event structure | Example leaves |
| --- | --- | --- | --- |
| EVT-13 | Royal Fuse Hunt | The machine opens and several unlabeled fuses become suspects. | 正解Fuse / 照明だけ復旧 / 完全暗転 / 火花から復活 |
| EVT-14 | 手回しOracle | NAOKING must crank the stopped oracle by hand. | 規定速度 / 遅すぎ / 王が放棄 / 小魚が回して勝利 |
| EVT-15 | 嘘つきWarning Lamp | A warning lamp repeatedly contradicts the actual machine state. | 正しい警告 / False Alarm / 証言変更 / Rainbow謝罪 |
| EVT-16 | Machine Heartbeat | The cabinet develops a pulse that may be mechanical or alive. | 安定 / Flatline / 安いBeep / 寝息から復活 |
| EVT-17 | Panel脱皮 | The outer panel peels away like a shell. | 新筐体 / 古い殻だけ落下 / 配線ミス露出 / Palace Skin |
| EVT-18 | Crown Frameの口 | The frame becomes a mouth and swallows the visible verdict. | 同じResultを吐く / 別Prop / 寝る / 勝利Sealを噛む |

### Adventure, rescue, chase, and battle

| ID | Concept | Event structure | Example leaves |
| --- | --- | --- | --- |
| EVT-19 | 潜水艇救助作戦 | The roulette disappears and a rescue craft follows a weak beacon. | 救助成功 / 水圧撤退 / Decoy / 最終信号で復活 |
| EVT-20 | 王国海底採掘 | A drill opens three strata while the treasure silhouette remains hidden. | 王冠鉱脈 / 海藻 / Cave-in / 帰路で金塊 |
| EVT-21 | Bubble Factory暴走 | A production line builds result bubbles faster than they can be inspected. | 完成 / Overflow / 石鹸だけ / 全泡Popで勝利 |
| EVT-22 | 宝箱税関 | A locked chest must clear nonsensical royal customs. | Release / Confiscate / Wrong Owner / Royal Sealで逆転 |
| EVT-23 | 深度Elevator点検 | The whole page descends past numbered depth floors. | 目的階 / Overshoot / Stalled / Emergency Restart |
| EVT-24 | Jelly Storm避難 | A luminous jelly storm pushes actors across foreground and background. | Shelter / Strike / Storm Ride / Fish Guide |

### Sports, race, and royal school

| ID | Concept | Event structure | Example leaves |
| --- | --- | --- | --- |
| EVT-25 | 深海旗Relay | Several kings exchange one crown flag through changing currents. | Finish / Flag Drop / Wrong King / Late Handoff Revival |
| EVT-26 | 昼食Cart Derby | Lunch carts race through palace corridors. | Serve / Spill / 王が途中で食べる / Lidの下に勝利 |
| EVT-27 | 王立学校Bell Dash | NAOKING races a closing gate and a ten-second bell. | On Time / Late / 休日 / Classroom Respawn |
| EVT-28 | 蟹Train乗換Challenge | A crab train departs as the witness platform slides away. | Catch / Miss / Wrong Train / Crab Reverse |
| EVT-29 | 海底棒高跳び | A crown pole bends across the entire viewport. | Clear / Bar Hit / 王冠だけGoal / 王が跳ばず帰る |
| EVT-30 | 王国Synchronised Swim | Witnesses must form one symbol under a moving camera. | Perfect / Desync / 全員寝る / Crown Formation |

### Portal, social-world, and camera play

| ID | Concept | Event structure | Example leaves |
| --- | --- | --- | --- |
| EVT-31 | Portal Customs | An inter-world gate asks the king for impossible documents. | Pass / Denied / Wrong World / Respawn |
| EVT-32 | Mirror Copy Incident | A delayed mirror copy disputes which NAOKING is original. | 本体勝利 / Copy勝利 / 両方Fake / Mirror Break Revival |
| EVT-33 | Instance待機列 | The page becomes a lobby whose capacity counter keeps changing. | Join / Full / Kicked / Secret Instance |
| EVT-34 | Avatar Rig Calibration | Joints and crown anchors are tested while the verdict is hidden. | Calibrated / Twisted / T-Pose / Royal Rig |
| EVT-35 | Respawn Relay | The result passes between checkpoints but may loop. | Goal / Loop / Wrong Checkpoint / Final Warp |
| EVT-36 | Photo Mode Freeze | Action stops for a staged picture before anyone knows the ending. | Perfect Photo / Freeze Too Long / Actor Leaves / Photo becomes Verdict |

### Broadcast, court, commercial, and service interruption

| ID | Concept | Event structure | Example leaves |
| --- | --- | --- | --- |
| EVT-37 | Royal Auction | Court witnesses bid on a sealed verdict lot. | 落札 / Outbid / No Bidders / LotそのものがResult |
| EVT-38 | 深海Cooking Contest | A glossy cooking show replaces the machine. | Delicious / Inedible / Ingredient Escape / Chef Revival |
| EVT-39 | Witness Talent Audition | Each reel performs a useless talent for an unseen judge. | Pass / Fail / No Talent / Hidden Crown |
| EVT-40 | 王国Hotline | A breaking-news help desk transfers the user between departments. | Solved / Hold Music / Wrong Desk / Operator is King |
| EVT-41 | 神託Museum Tour | A commercial tour labels every prop incorrectly. | Real Exhibit / Fake / Closed / Exhibit Moves |
| EVT-42 | 修理Tutorial乗っ取り | An instructional overlay attempts to fix the oracle live. | Fixed / Worse / Steps Skipped / Secret Chord |

### Deep environment and large-scale encounters

| ID | Concept | Event structure | Example leaves |
| --- | --- | --- | --- |
| EVT-43 | Thermocline突破 | The camera pushes through a refractive temperature boundary. | Breakthrough / Stall / Side Current / Heat Crown |
| EVT-44 | 発光峡谷航行 | Bioluminescent walls reveal only one route at a time. | Palace Route / Dead End / Creature Chase / Light Reverse |
| EVT-45 | Whale Shadow Transit | A huge shadow crosses all page layers and blocks the oracle. | Passes / Blocks / Eats Signal / Guides to Palace |
| EVT-46 | Frozen Sea Crack | The entire layout becomes a cracking ice sheet. | Cross / Fall / Glass Stage / Crown under Ice |
| EVT-47 | Volcanic Vent Oracle | A hydrothermal plume alternates between concealment and illumination. | Gold Plume / Blackout / Wrong Chemical / Royal Eruption |
| EVT-48 | Lost Submarine Lights | Remote lamps answer in a pattern that may be rescue or bait. | Rescue / Decoy / Deeper Loss / Ancient Palace |

### Character chaos, court, and abandonment

| ID | Concept | Event structure | Example leaves |
| --- | --- | --- | --- |
| EVT-49 | Witness組合選挙 | Reels unionize and elect a spokesperson. | Win / Lose / Draw / Ballot Eaten |
| EVT-50 | 衣装総入替 | Every NAOKING sprite receives the wrong role costume. | Royal / Dry / Wrong Costume / Outfit becomes Gate |
| EVT-51 | Tiny King Uprising | Miniature kings attempt a coup across navigation and footer. | Coup Fails / Coup Wins / Negotiation / All form Crown |
| EVT-52 | 干からび王Hydration Chamber | A dry king enters an overengineered recovery tank. | Recovers / Overfills / Still Dry / Bubble Win |
| EVT-53 | Crown Translator | The crown claims to translate witness speech. | Accurate / Insult / Wrong Language / Secret Phrase |
| EVT-54 | Sleepwalking Verdict | A sleeping king carries the sealed result through several doors. | Right Door / Wrong Door / Wakes / Bed lands on Jackpot |

### Premium-only scene candidates

| ID | Concept | Event structure | Example leaves |
| --- | --- | --- | --- |
| EVT-55 | Trench Gate Opening | A black trench splits into nested royal gates. | Single Gate / Narrow Passage / False Door / All Gates Open |
| EVT-56 | Golden Current Convergence | Every moving light and bubble converges on one point. | Crown Burst / Spiral Palace / Silent Seal / Current Reverse Finale |
| EVT-57 | Crown Seed Palace | A tiny crown seed grows into a full palace. | Bloom / Dormant Fake / Crystal Root / Late Bloom |
| EVT-58 | Thousand Witness Procession | Witnesses cross every page plane in a ceremonial march. | Perfect / One Late / Scatter / Final Alignment |
| EVT-59 | Abyss Dawn | Complete darkness yields to one physically expanding ray. | First Light / False Dawn / Eclipse / Second Light |
| EVT-60 | Royal Time Bell | Time freezes until an unseen bell resolves the world. | On Time / Late Bell / Stuck Bell / Silent Golden Bell |

Multi-label coverage of the requested show families:

| Show family | Candidate IDs |
| --- | --- |
| Battle | EVT-19, EVT-24, EVT-44, EVT-45 |
| Sports | EVT-25–EVT-30 |
| Court | EVT-02, EVT-22, EVT-37, EVT-49 |
| News | EVT-04, EVT-40, EVT-48 |
| Commercial | EVT-38, EVT-41 |
| Repair | EVT-13–EVT-18, EVT-42 |
| Abandon judgment | EVT-14, EVT-15, EVT-54 |
| Chase | EVT-19, EVT-24, EVT-44, EVT-48 |
| Chaos | EVT-06, EVT-09, EVT-17, EVT-21, EVT-50–EVT-54 |
| Interactive | EVT-22, EVT-29, EVT-31, EVT-34, EVT-42 |
| Premium | EVT-55–EVT-60 |

## 5. Independent site-wide takeover catalogue — 26 concepts

These are independent overlays that can wrap a compatible event; they are not additional result draws. Leaf codes: N = restrained/normal, F = fail or comedy, E = escalation, R = revival, P = premium.

| ID | Takeover | Page-stage grammar | Compatible leaves |
| --- | --- | --- | --- |
| SITE-01 | Breaker Cascade | Header-to-footer power segments extinguish in sequence. | N / F / R |
| SITE-02 | Emergency Crown Rail | A luminous crown rail traces every page edge and selects a destination. | N / E / P |
| SITE-03 | Dry Kingdom | Water shader drains; actors and typography sag under gravity. | F / E / R |
| SITE-04 | Surface Breach | The camera rises past depth markers and breaks the water surface. | N / E / P |
| SITE-05 | Bottomless Drop | Content planes fall into a central abyss with forced perspective. | F / E / R |
| SITE-06 | Reverse Current | Bubbles, parallax, reel travel, and typography all reverse. | N / F / E |
| SITE-07 | Bubble Time Stop | Every bubble freezes; one continues as the only clock. | N / R / P |
| SITE-08 | Bubble Rain | Bubbles reverse into a downward storm and push UI panels. | F / E / R |
| SITE-09 | Sideways Gravity | Navigation and cards slide toward one page edge. | N / F / R |
| SITE-10 | Upside-down Ocean | Root perspective rotates while readable result copy remains upright. | N / E / R |
| SITE-11 | Race Track Rewrite | Page sections become lanes, depth rail becomes lap counter. | F / E / R |
| SITE-12 | Royal School Rewrite | Header becomes gate, cards become classrooms, bell drives timing. | F / E / R |
| SITE-13 | Palace Room Rewrite | Existing surfaces fold into throne-room walls. | N / E / P |
| SITE-14 | Portal Mosaic | Viewport divides into incompatible world fragments. | F / E / P |
| SITE-15 | Pixel Quantization Wave | A low-resolution wave converts sections one after another. | N / F / E |
| SITE-16 | CRT Curvature | Scanlines, barrel mask, phosphor trails, and broadcast safe areas take over. | N / F / R |
| SITE-17 | Red Ocean Emergency | All light desaturates except directional emergency red. | F / E / R |
| SITE-18 | White Abyss | Detail disappears into white silhouette before being redrawn. | N / R / P |
| SITE-19 | Typography Liquefaction | Headlines melt into currents, then reform as evidence. | F / E / R |
| SITE-20 | Navigation Escape | Navigation items detach and flee from the approaching result. | N / F / E |
| SITE-21 | Depth Rail Elevator | The depth indicator becomes a full-viewport lift shaft. | N / E / P |
| SITE-22 | Foreground Giant Inspection | A giant original NAOKING actor moves background → midground → foreground. | F / E / R |
| SITE-23 | Whole-site Rewind | Prior transformations reverse in exact event order. | N / R / P |
| SITE-24 | Four-camera Surveillance | Four time-offset cameras disagree about the same chase. | F / E / R |
| SITE-25 | Royal Origami Page | Sections fold into a paper-theater crown or palace. | N / E / P |
| SITE-26 | Backdrop Peel-off | The apparent ocean is removed as a stage flat, exposing a second set. | F / E / R |

Selection rule: choose at most one dominant takeover per draw; a secondary edge/light treatment may accompany it only if motion direction and cleanup owner are unambiguous.

## 6. Fish-school family design

The school is a reusable grammar with five variables: count, direction, depth, formation, and reveal relationship. Color is supplementary; it is never the sole differentiator.

| ID | Family | Motion / uncertainty role | Implementation |
| --- | --- | --- | --- |
| FISH-01 | Scout Fish | One fish becomes three; low-cost pre-notice. | Research reserve |
| FISH-02 | Small School | 12–24 lateral fish, readable as a common anomaly. | selected as small |
| FISH-03 | Reverse School | Crosses against the current; secret directional cue. | Research reserve |
| FISH-04 | Broken School | One late or wrong-way fish; comedy and false signal. | Research reserve |
| FISH-05 | Reel-back School | Travels behind the reel cage to preserve legibility. | Research reserve |
| FISH-06 | Reel-vacuum School | Is pulled into individual reels, linking group to stop order. | Research reserve |
| FISH-07 | Spiral School | Forms an inward helix with an unresolved center. | Used as motion variant |
| FISH-08 | Abyss Approach | Begins as depth lights and becomes a school near camera. | selected as abyss |
| FISH-09 | Crown School | Formation briefly resembles a crown, then breaks. | Research reserve |
| FISH-10 | Royal Procession | Guard fish orbit the cabinet and imply an official decision. | selected as royal |
| FISH-11 | Golden School | Luminous fish enter the reel symbols; very-hot visual family. | selected as golden |
| FISH-12 | Pixel School | Low-resolution school assembles a temporary retro world. | Research reserve |
| FISH-13 | NAOKING School | Miniature kings behave like an overpopulated fish school. | selected as naoking |
| FISH-14 | Silent Shadow School | No body detail and no sound until it has passed. | Research reserve |
| FISH-15 | Iridescent School | Dedicated premium family only when the win-only contract applies. | Research reserve |

Current selected family set is exactly small, royal, golden, abyss, and naoking. Mobile scales school actor counts to 56%; reduced motion uses seven actors and a shorter readable state.

## 7. Reel and animation grammar

Research considered 20 reel-native transformations. Thirteen declarative grammars are selected in roulette-entertainment.js; a route references a grammar key and the controller resolves phase-specific motion.

| ID | Grammar candidate | Uncertainty contribution | Current mapping |
| --- | --- | --- | --- |
| REEL-01 | Delayed ignition | Nothing moves, then one witness starts late. | launch phases |
| REEL-02 | Left/right asymmetric start | Direction itself becomes the cue. | selective |
| REEL-03 | Fluid cruise wobble | Speed and phase drift prevent a metronomic look. | flowing |
| REEL-04 | Sticky viscous slowdown | Apparent stopping is prolonged without a text overlay. | sticky |
| REEL-05 | Stagger stop | Several small judgments replace one simultaneous stop. | shared stopping phase |
| REEL-06 | Final-reel hold | One witness remains unknown after the others settle. | stop order plus judgment |
| REEL-07 | One-reel acceleration | A lagging/leading witness can still reverse the scene. | scatter, selective, race |
| REEL-08 | Full reverse | All evidence moves backward without yet declaring revival. | portal |
| REEL-09 | Fake stop → restart | An apparent end becomes a new beat. | topology |
| REEL-10 | Selective respin | Some witnesses hold while another retries. | selective |
| REEL-11 | Rewind to earlier witness | Earlier evidence returns with changed context. | topology, portal, glitch |
| REEL-12 | 5→6→7 expansion | The physical count itself escalates. | topology and 6/7-reel routes |
| REEL-13 | 5→3→1 contraction | Evidence disappears while importance concentrates. | evacuate |
| REEL-14 | One horizontal reel | A cross-axis witness reads the vertical set. | Research reserve |
| REEL-15 | Reel position swap | A stopped order cannot be trusted spatially. | topology |
| REEL-16 | Symbols evacuate the cage | An empty seat becomes the anomaly. | evacuate |
| REEL-17 | Giant unregistered witness | Scale and count disagree. | selective scene grammar |
| REEL-18 | Reel cage collapse | UI structure becomes physical debris. | glitch |
| REEL-19 | Fish school absorbed into reels | A foreground group becomes symbol evidence. | flowing / golden school |
| REEL-20 | Majestic near-static rotation | Premium anticipation uses restraint before release. | majestic |

Selected declarative keys: flowing, sticky, majestic, depth, scatter, selective, evacuate, topology, race, school, portal, power-cycle, and glitch. The effective witness count is clamped to 4–8; this changes topology and choreography, never probability.

## 8. Sound-scene design

### Logical buses

| Bus | Purpose |
| --- | --- |
| DeepAmbient | Continuous low-pressure world bed; ducked during judgment. |
| ReelMotion | Launch pressure, fluid cruise, viscosity noise, and material stop clicks. |
| PreNotice | Small directional signals before a visible cue. |
| SchoolSwarm | Panned granular rush whose bandwidth follows density and depth. |
| EventMusic | Scene identity: race, school, dive, portal, court, news, or repair. |
| Impact | Crown, collision, gate, and page-edge forces. |
| Voice | NAOKING copy and short character punctuation. |
| FinalTruth | Canonical result chord; the only layer allowed to conclusively celebrate a win. |

### Route-scene vocabulary

| Audio scene | Design |
| --- | --- |
| fish-school | Left-to-right tone school plus opposite-pan water rush; density changes without announcing a result. |
| race | Short start cadence, opposing-current noise, late impact/photo beat. |
| school | Bell-like chord, descending reminder tones, awkward late bell. |
| dive | High-to-low filtered descent, pressure tone, sparse leviathan pulse. |
| portal | Wide chord, mirrored square-wave ticks, reversed spatial response. |
| power-failure | Hard electrical fall, true silence, low restart pulse, restrained boot chord. |
| ui-failure | Cheap digital errors, inconsistent pan, short silence after collapse. |
| jackpot-golden | Silence → impact → long royal chord → bell. |
| jackpot-fish | Panned school passes converge into a stable victory chord. |
| jackpot-dawn | Silence → rising broadband ray → open chord → bell. |
| jackpot-overload | Intentionally silly square-wave swarm → large impact → dense royal chord. |

Procedural Web Audio is preferred, so no borrowed jingles or third-party sound files are required. Comedy may use a weak whistle, tiny fanfare, single beep, or awkward silence. Blackout and false-loss scenes must stop both active sources and reverb tails before revival breath/bell. Reduced-motion/compact-audio mode limits scheduled entries and shortens envelopes, but preserves the semantic cue order.

## 9. Implemented expansion mapping — 18 routes

Effective reel count uses the controller default of five where the route omits reelCount. “Branches” counts named ending variants in roulette-entertainment.js.

| ID | Route | Family / selected research | Reels | Reel grammar | Audio scene | Named branches |
| --- | --- | --- | ---: | --- | --- | ---: |
| IMPL-01 | small-fish-school | FISH-02; common fish pre-notice | 5 | flowing | fish-school | result-compatible canonical leaves |
| IMPL-02 | royal-fish-school | FISH-10; royal orbit school | 5 | sticky | fish-school | result-compatible canonical leaves |
| IMPL-03 | golden-fish-school | FISH-11 + REEL-19; school absorbed into evidence | 5 | majestic | fish-school | result-compatible canonical leaves |
| IMPL-04 | abyss-fish-school | FISH-08 + EVT-03; depth approach | 7 | depth | fish-school | result-compatible canonical leaves |
| IMPL-05 | naoking-school-overload | FISH-13 + EVT-51; miniature-king swarm | 8 | scatter | fish-school | result-compatible canonical leaves |
| IMPL-06 | seventh-witness-unregistered | EVT-07 + REEL-17 | 7 | selective | ui-failure | result-compatible canonical leaves |
| IMPL-07 | witness-evacuation | EVT-11 + REEL-13/16 | 4 | evacuate | ui-failure | result-compatible canonical leaves |
| IMPL-08 | accordion-oracle | EVT-09 + REEL-09/12/15 | 6 | topology | ui-failure | result-compatible canonical leaves |
| IMPL-09 | naoking-race | EVT-25/26; seven-king sports event | 7 | race | race | 12: normal 3 / win 3 / loss 3 / revival 3 |
| IMPL-10 | royal-school-dash | EVT-27 | 5 | school | school | 12: normal 3 / win 3 / loss 3 / revival 3 |
| IMPL-11 | realistic-deep-dive | EVT-43/45/48; cinematic descent | 4 | depth | dive | 12: normal 3 / win 3 / loss 3 / revival 3 |
| IMPL-12 | portal-panic | EVT-31/32/35 | 6 | portal | portal | 12: normal 3 / win 3 / loss 3 / revival 3 |
| IMPL-13 | machine-power-cycle | EVT-13/14/16 | 5 | power-cycle | power-failure | 8: normal 2 / win 2 / loss 2 / revival 2 |
| IMPL-14 | oracle-ui-collapse | EVT-42 + SITE-01/15/20/23 | 7 | glitch | ui-failure | 8: normal 2 / win 2 / loss 2 / revival 2 |
| IMPL-15 | golden-ocean-jackpot | EVT-56/57 + SITE-13 | 8 | majestic | jackpot-golden | 3 win variants |
| IMPL-16 | fish-celebration-jackpot | EVT-58 + FISH-07/11 | 6 | flowing | jackpot-fish | 3 win variants |
| IMPL-17 | abyss-dawn-jackpot | EVT-59 + SITE-18 | 5 | majestic | jackpot-dawn | 3 win variants |
| IMPL-18 | naoking-overload-jackpot | EVT-51/58 + SITE-22 | 7 | scatter | jackpot-overload | 3 win variants |

The expansion deliberately complements existing controller coverage rather than duplicating it. Existing routes already cover battle (deep-sea-duel), sports (crown-goal-challenge), court (royal-trial), news (abyss-news-live), commercial (royal-commercial-takeover), repair (oracle-repair-disaster), abandonment (judgment-abandoned), chase (cctv-result-chase), lunch, council, interactive “do not press,” upside-down kingdom, giant inspection, and pixel premium. ULTIMATE selects fish schools, topology changes, race/school/dive/portal scenes, power failure, UI collapse, and four distinct jackpot worlds.

## 10. Color and light system

| State | Base treatment | Non-color companion |
| --- | --- | --- |
| Normal | Deep Blue | slow lateral drift, low coverage |
| Chance | Aqua | directional pulse and a small pre-notice sound |
| Secret Hot | Moonlight White | silhouette, pause, and narrow spotlight |
| Hot | Abyss Red | expanding edge force and faster cadence |
| Very Hot | Royal Gold | broad coverage, orbit motion, royal interval |
| Premium | Iridescent only under a win-only contract | dedicated layout, scene, audio, and ending grammar |

Implementation decisions use Hue × Luminance × Coverage × Motion × Sound. Information must remain distinguishable when color is removed; shape, direction, copy, and audio provide redundant state. A color does not independently certify the result unless the route is explicitly win-only.

## 11. Asset plan and copyright boundary

| Need | Preferred source | Budget / fallback |
| --- | --- | --- |
| NAOKING actors | Existing owned assets/characters/naoking-*.webp | Current files are approximately 12.7–37.1 KB each; reuse poses and transform/crop them in CSS. |
| Environment plates | Existing owned assets/backgrounds/vrchat-*.webp | Current files are approximately 27.8–275.8 KB; load only when a selected route needs one. |
| Fish schools | CSS geometry / pseudo-elements / small original vector silhouettes | No external image required; actor count is quality-scaled. |
| Gates, rails, fuse panels, school props | CSS masks, gradients, clip paths, and original simple SVG if later needed | Keep each optional SVG small and independently removable. |
| UI debris and reel cages | Existing DOM cloned only within the owned event root | Never clone interactive IDs; fragments are aria-hidden and removed after use. |
| Sound | Procedural Web Audio oscillators, noise, filters, panning, and envelopes | No copied melody, voice line, or cabinet sample. |
| Future temporary 3D | Original low-poly meshes or generated primitives | Lazy-load after route selection; dispose every GPU resource and cancel the RAF loop. |

No reference screenshot, manufacturer motif, game character, proprietary symbol, or source audio enters the asset pipeline. If a new asset is commissioned later, record creator/license provenance beside the file.

## 12. Mobile, performance, reduced motion, and cleanup

### Mobile / responsive

- Keep the complete narrative and all canonical result text on mobile.
- Scale particle/fish/actor counts before reducing legibility; current fish schools use a 0.56 mobile multiplier.
- Keep effective reel counts 4–8, but reduce tile size and gap rather than removing a route.
- Avoid essential controls beneath fixed takeovers; interactive routes must preserve a minimum readable target and timeout path.
- Use a single dominant foreground actor, smaller shader resolution, capped devicePixelRatio, and no simultaneous heavy canvases on narrow screens.

### Performance

- Route-select first, then create DOM/canvas/WebGL resources. Do not preload every scene.
- Use transform/opacity/mask animation where possible; batch DOM insertion with fragments.
- Cap school actors and procedural audio entries. Avoid layout reads inside per-frame loops.
- A future WebGL route owns one renderer and one RAF; pause on visibility change and destroy on completion/pagehide.
- Roulette-time visual impact may be high, but idle-page cost must return to baseline.

### Reduced motion

- prefers-reduced-motion keeps the same signal → anomaly → judgment → result semantics.
- Replace large parallax, spin, shake, gravity, and zoom with a short state change, restrained dissolve, and explicit text.
- Compress route timers rather than skipping the canonical result.
- Limit fish schools to seven actors and compact audio scheduling; never use flashing as the only cue.

### Cleanup ownership

- One draw token owns all scheduled callbacks; stale-token callbacks do nothing.
- resetVisualState clears scheduled timers, route/result classes, scene props, takeovers, fish nodes, and environment state.
- visibilitychange pauses remaining timer durations; returning resumes the same frozen route.
- pagehide invalidates the draw token, clears timers/environment classes, stops all audio, and suspends the audio context.
- Scene revisions prevent late hide callbacks from affecting a later scene.
- If canvas/WebGL is introduced, cleanup must additionally cancel RAF, remove listeners/canvas nodes, and dispose buffers, geometries, materials, textures, render targets, and workers.

## 13. Verification contract

tools/test-ultimate-expansion.mjs verifies:

1. VM loading of roulette-entertainment.js.
2. Exactly 18 unique expansion routes.
3. Exactly five fish families: small, royal, golden, abyss, naoking.
4. Effective reel counts cover and remain within 4–8.
5. Four new full events expose normal/win/loss/revival endings and dedicated scene/audio/reel grammar data.
6. Machine power-cycle and UI-collapse ending trees are complete.
7. Four premium scenes are win-only and have distinct endings.
8. Every route’s audioScene, reelGrammar, and optional scene reference is resolvable.
9. Controller integration spreads expansion routes/endings/scenes, freezes result before presentation selection, clamps reel counts, and has reduced-motion/visibility/pagehide contracts.
10. This memo contains exactly 60 EVT rows, 26 SITE rows, 15 FISH rows, 20 REEL rows, and 18 IMPL rows.

This separation keeps the research auditable: idea count is not inferred from production code, and production coverage is not inflated by unimplemented concepts.
