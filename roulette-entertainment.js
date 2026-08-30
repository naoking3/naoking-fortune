/*
 * ROYAL ORACLE — ULTIMATE ENTERTAINMENT EXPANSION
 * ------------------------------------------------
 * Presentation-only data. The controller freezes the result before it reads
 * any value in this file, so every route below can misdirect without changing
 * the canonical title, image, message, effect or probability.
 */
(() => {
  const route = definition => Object.freeze(definition);
  const endingSet = sets => Object.freeze(Object.fromEntries(Object.entries(sets).map(([outcome, entries]) => [
    outcome,
    Object.freeze(entries.map(entry => Object.freeze({ ...entry })))
  ])));

  const routes = Object.freeze([
    route({ id:'small-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.62, tier:'signal', world:'fish-school-small', motion:'wave', reelGrammar:'flowing', duration:9100, cue:'SMALL FISH SCHOOL', detail:'一匹の偵察魚を追って、小さな群れがReelの後方を横断する。', fishSchool:'small', fishMotion:'cross', audioScene:'fish-school' }),
    route({ id:'royal-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.34, tier:'hot', world:'fish-school-royal', motion:'outside-in', reelGrammar:'sticky', duration:10500, cue:'ROYAL SCHOOL', detail:'王冠を付けた護衛魚群が筐体を一周し、停止順を書き換える。', fishSchool:'royal', fishMotion:'orbit', audioScene:'fish-school' }),
    route({ id:'golden-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.18, tier:'superhot', world:'fish-school-golden', motion:'center-last', reelGrammar:'majestic', duration:11200, cue:'GOLDEN SCHOOL', detail:'金の魚群がReelへ吸い込まれ、証言そのものを発光させる。', fishSchool:'golden', fishMotion:'absorb', audioScene:'fish-school' }),
    route({ id:'abyss-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.25, tier:'hot', world:'fish-school-abyss', motion:'push', reelGrammar:'depth', reelCount:7, duration:11100, cue:'ABYSS APPROACH', detail:'遠い光点が巨大な深海魚群へ変わり、Camera目前まで迫る。', fishSchool:'abyss', fishMotion:'depth', audioScene:'fish-school' }),
    route({ id:'naoking-school-overload', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.15, tier:'hot', world:'fish-school-naoking', motion:'skip', reelGrammar:'scatter', reelCount:8, duration:11600, cue:'NAOKING SCHOOL', detail:'大量の小型なおキングが螺旋を作り、八証言へ過剰増殖する。', fishSchool:'naoking', fishMotion:'spiral', audioScene:'fish-school' }),

    route({ id:'seventh-witness-unregistered', family:'reel-event', category:'reel-topology', kinds:['normal','win','loss'], revivalCompatible:true, weight:.28, tier:'hot', world:'seventh-witness', motion:'witnesses', reelGrammar:'selective', reelCount:7, duration:10000, cue:'WITNESS COUNT // 07', detail:'第七証人は登録されていません。それでも二体増えました。', scene:'seventh-witness', sequence:'topology', twistMotion:'one-accelerates', audioScene:'ui-failure' }),
    route({ id:'witness-evacuation', family:'reel-event', category:'reel-topology', kinds:['normal','win','loss'], revivalCompatible:true, weight:.27, tier:'signal', world:'witness-evacuation', motion:'outside-in', reelGrammar:'evacuate', reelCount:4, duration:9600, cue:'WITNESS EVACUATION', detail:'一体がReelから逃走。四証言だけで続行する。', scene:'witness-evacuation', sequence:'topology', twistMotion:'respin', audioScene:'ui-failure' }),
    route({ id:'accordion-oracle', family:'reel-event', category:'reel-topology', kinds:['normal','win','loss'], revivalCompatible:true, weight:.23, tier:'hot', world:'accordion-reel', motion:'skip', reelGrammar:'topology', reelCount:6, duration:10400, cue:'ORACLE TOPOLOGY SHIFT', detail:'筐体が横へ伸び、隠されていた第六列を展開する。', scene:'accordion-reel', sequence:'topology', twistMotion:'rewind', audioScene:'ui-failure' }),

    route({ id:'naoking-race', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.34, tier:'hot', world:'race-track', motion:'push', reelGrammar:'race', reelCount:7, duration:17400, cue:'NAOKING RACE 4810', detail:'七体のなおキングが深海Race Trackへ。順位は最終直線まで読めない。', scene:'naoking-race', sequence:'race-event', twistMotion:'one-accelerates', audioScene:'race' }),
    route({ id:'royal-school-dash', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.32, tier:'hot', world:'royal-school', motion:'wave', reelGrammar:'school', reelCount:5, duration:16800, cue:'ROYAL SCHOOL DASH', detail:'遅刻まで十秒。王冠を落としたなおキングが校門へ走る。', scene:'royal-school-dash', sequence:'school-event', twistMotion:'stutter', audioScene:'school' }),
    route({ id:'realistic-deep-dive', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.30, tier:'superhot', world:'cinematic-dive', motion:'center-last', reelGrammar:'depth', reelCount:4, duration:18400, cue:'REAL DEPTH DESCENT', detail:'海面を割り、光が消えるまで潜る。巨大な影の先で王宮信号を探す。', scene:'realistic-deep-dive', sequence:'dive-event', twistMotion:'majestic', audioScene:'dive' }),
    route({ id:'portal-panic', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.31, tier:'hot', world:'portal-world', motion:'reverse', reelGrammar:'portal', reelCount:6, duration:17000, cue:'PORTAL PANIC', detail:'王国Portalが別Worldへ接続。鏡像と本体のどちらが戻るかは不明。', scene:'portal-panic', sequence:'portal-event', twistMotion:'rewind', audioScene:'portal' }),
    route({ id:'machine-power-cycle', family:'power-failure', category:'machine-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.27, tier:'hot', world:'machine-power-cycle', motion:'power-cut', reelGrammar:'power-cycle', reelCount:5, duration:15600, cue:'ORACLE POWER CYCLE', detail:'一列ずつ消灯。非常灯、手回し修理、再起動の順に筐体が変形する。', scene:'machine-power-cycle', sequence:'power-event', twistMotion:'stutter', audioScene:'power-failure', blackout:true, freeze:true }),
    route({ id:'oracle-ui-collapse', family:'chaos', category:'ui-failure', kinds:['normal','win','loss'], revivalCompatible:true, weight:.25, tier:'hot', world:'ui-collapse', motion:'skip', reelGrammar:'glitch', reelCount:7, duration:15400, cue:'ROYAL UI FAILURE', detail:'DepthがNaN、Headerが落下、七証言が座標を失う。王が再配置を試みる。', scene:'oracle-ui-collapse', sequence:'ui-event', twistMotion:'rewind', audioScene:'ui-failure' }),

    route({ id:'golden-ocean-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['rainbow','crown'], weight:.11, tier:'extreme', world:'golden-ocean', motion:'wave', reelGrammar:'majestic', reelCount:8, duration:15000, cue:'GOLDEN OCEAN', detail:'海全体がRoyal Goldへ開き、八証言と王宮光が同時に解放される。', scene:'golden-ocean-jackpot', sequence:'jackpot-event', twistMotion:'majestic', audioScene:'jackpot-golden', premium:true, freeze:true }),
    route({ id:'fish-celebration-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['comet','abyss'], weight:.10, tier:'extreme', world:'fish-celebration', motion:'outside-in', reelGrammar:'flowing', reelCount:6, duration:14800, cue:'FISH CELEBRATION', detail:'全魚群がPage中央へ集合し、王冠型の巨大な渦へ変わる。', scene:'fish-celebration-jackpot', sequence:'jackpot-event', twistMotion:'respin', audioScene:'jackpot-fish', premium:true, fishSchool:'golden', fishMotion:'spiral', freeze:true }),
    route({ id:'abyss-dawn-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['abyss','rainbow'], weight:.09, tier:'extreme', world:'abyss-dawn', motion:'center-last', reelGrammar:'majestic', reelCount:5, duration:15400, cue:'ABYSS DAWN', detail:'完全な暗闇を一条の青白い朝日が割り、深海宮殿を照らす。', scene:'abyss-dawn-jackpot', sequence:'jackpot-event', twistMotion:'majestic', audioScene:'jackpot-dawn', premium:true, blackout:true, freeze:true }),
    route({ id:'naoking-overload-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['crown','comet'], weight:.09, tier:'extreme', world:'naoking-overload', motion:'skip', reelGrammar:'scatter', reelCount:7, duration:15100, cue:'NAOKING OVERLOAD', detail:'小型王が全方向から乱入。最後に巨大な王がPageを押し開く。', scene:'naoking-overload-jackpot', sequence:'jackpot-event', twistMotion:'one-accelerates', audioScene:'jackpot-overload', premium:true, fishSchool:'naoking', fishMotion:'depth', freeze:true })
  ]);

  const endings = Object.freeze({
    'naoking-race':endingSet({
      normal:[{variant:'photo-draw',eyebrow:'PHOTO DRAW',title:'全員ほぼ同着',detail:'拡大しても差がないため、通常判定へ戻します。'},{variant:'lunch-stop',eyebrow:'ROYAL PIT STOP',title:'全員、途中で昼食',detail:'競走より弁当が優先され、順位は保留です。'},{variant:'wrong-course',eyebrow:'COURSE ERROR',title:'全員が別Courseへ',detail:'Goalだけが待っています。通常潮へ帰還します。'}],
      win:[{variant:'favorite-win',eyebrow:'ROYAL FINISH',title:'本命王、先頭でGoal',detail:'最終直線を金の海流で抜け、王冠旗が上がります。'},{variant:'tiny-comeback',eyebrow:'LAST TO FIRST',title:'最小の王が大逆転',detail:'画面端から一気に全員を抜き、勝利線を割りました。'},{variant:'crown-ride',eyebrow:'CROWN BOOST',title:'王冠に乗って飛ぶ',detail:'走ってはいませんが、写真判定はJACKPOTです。'}],
      loss:[{variant:'all-fall',eyebrow:'TRACK INCIDENT',title:'全員、同じ場所で転ぶ',detail:'干からびた王だけが遅れて到着。判定はハズレです。'},{variant:'reverse-runner',eyebrow:'WRONG WAY',title:'一体だけ逆走',detail:'全員が追いかけてしまい、Goalが無人になりました。'},{variant:'sleep-track',eyebrow:'RACE ABANDONED',title:'王がCourse中央で寝る',detail:'安全のため競走中止。敗北札だけ回収します。'}],
      revival:[{variant:'late-surge',eyebrow:'ROYAL SURGE',title:'暗転後、最後尾から急浮上',detail:'終わった写真判定を飛び越え、JACKPOT線へ飛び込みます。'},{variant:'finish-rewind',eyebrow:'PHOTO REWIND',title:'Goal映像を逆再生',detail:'見落とした王冠の鼻先が勝利線を越えていました。'},{variant:'fish-push',eyebrow:'SCHOOL ASSIST',title:'魚群が王を押し込む',detail:'全観客が海流を作り、停止した王を勝利へ運びます。'}]
    }),
    'royal-school-dash':endingSet({
      normal:[{variant:'holiday',eyebrow:'SCHOOL CLOSED',title:'今日は休日でした',detail:'全力疾走の意味はありません。通常判定へ戻ります。'},{variant:'wrong-class',eyebrow:'ROOM 4811',title:'隣の教室へ到着',detail:'一応間に合ったので、穏当な結果を採用します。'},{variant:'bell-delay',eyebrow:'BELL DELAY',title:'鐘の方が遅刻',detail:'誰も悪くないまま通常潮へ合流しました。'}],
      win:[{variant:'gate-slide',eyebrow:'JUST IN TIME',title:'校門を滑り抜ける',detail:'最後の一泡と同時に着席。王冠の出席印が光ります。'},{variant:'shortcut',eyebrow:'SECRET ROUTE',title:'水槽Shortcutが開く',detail:'机の下からJACKPOT教室へ直接到着しました。'},{variant:'teacher-crown',eyebrow:'PERFECT ATTENDANCE',title:'先生が王冠を授与',detail:'遅刻記録が勝利証明へ書き換わります。'}],
      loss:[{variant:'gate-close',eyebrow:'ONE SECOND LATE',title:'目の前で校門が閉じる',detail:'王冠だけ中へ転がり、本人はハズレ側に残りました。'},{variant:'crown-trip',eyebrow:'TRIPPED',title:'落とした王冠で転ぶ',detail:'拾っている間に鐘が鳴り、しょんぼり帰宅です。'},{variant:'wrong-school',eyebrow:'NOT THIS SCHOOL',title:'知らない校舎でした',detail:'受付にも断られ、敗北札だけ持ち帰ります。'}],
      revival:[{variant:'respawn-class',eyebrow:'RESPAWN',title:'教室内へ再出現',detail:'遅刻判定の直後、王が席の上へRespawnしました。'},{variant:'bell-rewind',eyebrow:'BELL REWIND',title:'最後の十秒を巻き戻す',detail:'転倒も信号も逆走し、今度はJACKPOT時刻へ。'},{variant:'fish-bus',eyebrow:'ROYAL SCHOOL BUS',title:'小魚Busが急停車',detail:'閉じた校門を飛び越え、勝利教室へ運びます。'}]
    }),
    'realistic-deep-dive':endingSet({
      normal:[{variant:'quiet-trench',eyebrow:'DEPTH STABLE',title:'静かな海溝へ着底',detail:'巨大影は通過し、通常の神託だけが残ります。'},{variant:'empty-palace',eyebrow:'NO SIGNAL',title:'王宮跡は空でした',detail:'一つの泡を採取し、通常航路へ浮上します。'},{variant:'surface-call',eyebrow:'DIVE RECALLED',title:'水面から帰還Signal',detail:'調査を中止し、現在の判定を持ち帰ります。'}],
      win:[{variant:'palace-found',eyebrow:'PALACE FOUND',title:'海溝の壁が王宮へ開く',detail:'遠かった青白い光が金の玉座を照らします。'},{variant:'leviathan-guide',eyebrow:'GIANT ALLY',title:'巨大影が安全航路を示す',detail:'背中の先にJACKPOT Gateが現れました。'},{variant:'thermal-crown',eyebrow:'GOLDEN VENT',title:'熱水孔から王冠噴出',detail:'暗い海底が一瞬で祝祭の光へ変わります。'}],
      loss:[{variant:'pressure-return',eyebrow:'PRESSURE LIMIT',title:'水圧で強制浮上',detail:'信号へ届く前に装置が閉じ、ハズレを回収しました。'},{variant:'shadow-block',eyebrow:'CONTACT LOST',title:'巨大影が全光源を遮る',detail:'去ったあとには敗北札だけが沈んでいます。'},{variant:'wrong-beacon',eyebrow:'DECOY LIGHT',title:'追っていたのは発光海藻',detail:'王宮Signalではありません。静かに帰ります。'}],
      revival:[{variant:'last-beacon',eyebrow:'ONE LIGHT',title:'無音の海底で一灯だけ再点火',detail:'遠方Signalが近づき、JACKPOT王宮を再起動します。'},{variant:'bubble-lift',eyebrow:'EMERGENCY LIFT',title:'金の泡が深海を持ち上げる',detail:'敗北海溝ごと反転し、勝利の水面へ到達します。'},{variant:'shadow-crown',eyebrow:'ROYAL LEVIATHAN',title:'巨大影の頭上に王冠',detail:'敵と思った影が宮殿を背負い、逆転光を放ちます。'}]
    }),
    'portal-panic':endingSet({
      normal:[{variant:'mirror-delay',eyebrow:'MIRROR CHECK',title:'鏡像だけ一秒遅い',detail:'それ以外は正常らしいので、通常結果へ戻します。'},{variant:'empty-instance',eyebrow:'INSTANCE QUIET',title:'誰もいない別王国',detail:'写真だけ撮り、元の神託へ帰還します。'},{variant:'portal-loop',eyebrow:'LOOP EXIT',title:'同じ入口へ戻ってくる',detail:'移動距離ゼロ。結果は通常通りです。'}],
      win:[{variant:'palace-world',eyebrow:'ROYAL INSTANCE',title:'Portal先は黄金王宮',detail:'満員の魚群が勝利のJoin音で迎えます。'},{variant:'mirror-crown',eyebrow:'MIRROR BONUS',title:'鏡像が王冠を投げ渡す',detail:'境界を越えた瞬間、JACKPOTへ実体化しました。'},{variant:'friend-invite',eyebrow:'INVITE ACCEPTED',title:'未知の小魚から招待',detail:'秘密Worldへ接続し、勝利Sceneが展開されます。'}],
      loss:[{variant:'instance-full',eyebrow:'INSTANCE FULL',title:'王国が満員',detail:'別Instanceも満員。王はハズレLobbyへ戻りました。'},{variant:'avatar-error',eyebrow:'AVATAR ERROR',title:'王の姿が読み込めない',detail:'干からびたPlaceholderだけが敗北を告げます。'},{variant:'portal-refuse',eyebrow:'ACCESS DENIED',title:'Portalが王だけ拒否',detail:'王冠だけ吸い込まれ、ハズレ側に取り残されました。'}],
      revival:[{variant:'respawn',eyebrow:'ROYAL RESPAWN',title:'敗北WorldからRespawn',detail:'青白い輪が全Pageを走り、JACKPOT地点へ再出現します。'},{variant:'mirror-break',eyebrow:'MIRROR BREAK',title:'鏡の奥から本体が帰還',detail:'偽のハズレ像を割り、勝利王が前景へ飛び出します。'},{variant:'portal-reverse',eyebrow:'PORTAL REVERSED',title:'出口が入口を飲み込む',detail:'失敗した航路が裏返り、Royal Instanceへ直結しました。'}]
    }),
    'machine-power-cycle':endingSet({
      normal:[{variant:'clean-boot',eyebrow:'SAFE MODE',title:'通常設定で再起動',detail:'異常値を破棄し、封印済みの通常判定を表示します。'},{variant:'hand-crank',eyebrow:'MANUAL POWER',title:'王が手回しで復帰',detail:'遅いですが動いているため、通常扱いです。'}],
      win:[{variant:'royal-fuse',eyebrow:'ROYAL FUSE',title:'最後のFuseが金色',detail:'全灯が一斉に開き、勝利回路へ直結しました。'},{variant:'overcharge',eyebrow:'120% POWER',title:'再起動出力が上限突破',detail:'筐体外までRoyal Lightが溢れ、JACKPOTを確定表示します。'}],
      loss:[{variant:'wrong-fuse',eyebrow:'WRONG CIRCUIT',title:'照明だけ復旧',detail:'Reelは戻らず、非常灯がハズレ札を照らします。'},{variant:'king-unplug',eyebrow:'USER ERROR',title:'王が電源を抜いていた',detail:'差し直す前に判定終了。しょんぼりした敗北です。'}],
      revival:[{variant:'distant-signal',eyebrow:'SIGNAL DETECTED',title:'遠方から再起動Pulse',detail:'完全無音のあと、王国全系統がJACKPOTとして復活します。'},{variant:'bubble-fuse',eyebrow:'ONE BUBBLE',title:'一泡がFuseへ着地',detail:'最小の青白い光が、全世界の勝利電源を戻しました。'}]
    }),
    'oracle-ui-collapse':endingSet({
      normal:[{variant:'auto-layout',eyebrow:'AUTO LAYOUT',title:'UIが勝手に元へ戻る',detail:'Depthも座標も正常化し、通常判定を続行します。'},{variant:'king-fix',eyebrow:'FIXED?',title:'王が一度叩いて直す',detail:'見た目は少し曲がっていますが、通常扱いです。'}],
      win:[{variant:'error-jackpot',eyebrow:'ERROR = JACKPOT',title:'崩れた文字が勝利へ整列',detail:'落下した全UIが巨大な王冠を組み上げます。'},{variant:'seventh-admin',eyebrow:'ADMIN WITNESS',title:'第七証人が管理者権限を取得',detail:'壊れたPageを金の勝利Modeで再構築します。'}],
      loss:[{variant:'css-off',eyebrow:'STYLE LOST',title:'王だけ素の位置へ落下',detail:'復旧後も敗北札だけ中央に残りました。'},{variant:'nan-verdict',eyebrow:'DEPTH NaN',title:'判定座標が見つからない',detail:'安全側として特殊ハズレを採用します。'}],
      revival:[{variant:'whole-rewind',eyebrow:'PAGE REWIND',title:'崩壊を逆再生',detail:'落ちた文字と光が戻り、最後にJACKPOTを組みます。'},{variant:'royal-refresh',eyebrow:'ROYAL REFRESH',title:'王がPage全体を再読込',detail:'ハズレCacheを破棄し、勝利版の世界へ復帰しました。'}]
    }),
    'golden-ocean-jackpot':endingSet({ win:[{variant:'crown-storm',eyebrow:'CROWN STORM',title:'金の海が王冠を降らせる',detail:'八証言が一斉に礼をし、王宮鐘が深海を割ります。'},{variant:'palace-rise',eyebrow:'PALACE RISING',title:'海底から王宮が浮上',detail:'塔の窓が順に点灯し、中央に勝利玉座が開きます。'},{variant:'royal-current',eyebrow:'GOLD CONVERGENCE',title:'全海流が王へ収束',detail:'集まった光が巨大なRoyal Sealとして解放されます。'}] }),
    'fish-celebration-jackpot':endingSet({ win:[{variant:'school-crown',eyebrow:'SCHOOL CROWN',title:'魚群が巨大王冠を描く',detail:'最後の一匹が頂点へ入り、祝祭の渦が完成します。'},{variant:'fish-parade',eyebrow:'ROYAL PARADE',title:'小魚から巨大魚まで行進',detail:'ReelとNavigationまで波に乗り、王を中央へ運びます。'},{variant:'school-burst',eyebrow:'SCHOOL BURST',title:'群れが光の泡へ爆発',detail:'Page全体へ散った泡がJACKPOT文字へ再集合します。'}] }),
    'abyss-dawn-jackpot':endingSet({ win:[{variant:'first-ray',eyebrow:'FIRST LIGHT',title:'深海に朝が来る',detail:'無音の闇を青白い光が割り、金の王冠だけを照らします。'},{variant:'white-palace',eyebrow:'WHITE ABYSS',title:'白い深海から王宮出現',detail:'輪郭だけの世界へ色が戻り、勝利の海が開きます。'},{variant:'sunrise-school',eyebrow:'DAWN PROCESSION',title:'朝日に魚群が集う',detail:'暗かったPageの隅々まで祝祭光が走ります。'}] }),
    'naoking-overload-jackpot':endingSet({ win:[{variant:'thousand-kings',eyebrow:'KING OVERLOAD',title:'小型王が千体に増える',detail:'全員が別方向へ泳ぎ、最後だけ巨大王が中央を占拠します。'},{variant:'all-fall-win',eyebrow:'ROYAL DOMINO',title:'全員転んで勝利文字になる',detail:'締まりはありませんが、並びだけは完璧なJACKPOTです。'},{variant:'giant-sneeze',eyebrow:'ROYAL SNEEZE',title:'巨大王のくしゃみで全開',detail:'UIも魚群も吹き飛び、王冠だけが画面中央へ残ります。'}] })
  });

  const scenes = Object.freeze({
    'seventh-witness':{ image:'assets/characters/naoking-panic.webp', glyph:'07?', signal:['COUNT MISMATCH','第七証人は未登録','Reel Cageが左右へ拡張しています。'], twist:['ADMIN CHECK','全員同じ顔です','一体だけ速度を上げ、登録情報を追い越しました。'] },
    'witness-evacuation':{ image:'assets/characters/naoking-3.webp', glyph:'04', signal:['EVACUATION','一体がReelから逃走','残る四証言で神託を継続します。'], twist:['EMPTY SEAT','逃走先からSignal','帰還、欠席、別Scene。まだ結末は読めません。'] },
    'accordion-reel':{ image:'assets/characters/naoking-2.webp', glyph:'5→6', signal:['TOPOLOGY SHIFT','筐体が横へ伸びる','封印された第六列を展開します。'], twist:['REEL SWAP','中央列が入れ替わる','停止したふりをして、全列が逆再始動しました。'] },
    'naoking-race':{ image:'assets/characters/naoking-2.webp', glyph:'RACE', signal:['NAOKING RACE 4810','Start Gate、OPEN','七体の王が深海直線へ飛び出します。'], twist:['FINAL CURRENT','順位が激しく入れ替わる','Goal、転倒、昼食、逆走。写真判定へ。'] },
    'royal-school-dash':{ image:'assets/characters/naoking-panic.webp', glyph:'00:10', signal:['ROYAL SCHOOL DASH','遅刻まで十秒','王冠を落としたまま、校門へ全力疾走します。'], twist:['LAST CORNER','校門が閉まり始める','間に合う、休日、違う学校。鐘のあとに判定。'] },
    'realistic-deep-dive':{ image:'assets/characters/naoking-hero.webp', glyph:'-4810M', signal:['REAL DEPTH DESCENT','海面を割って潜航','光、水圧、泡。遠い王宮Signalへ向かいます。'], twist:['LEVIATHAN SHADOW','巨大な影が航路を覆う','敵か案内役か。無音の海溝で光を待ちます。'] },
    'portal-panic':{ image:'assets/characters/naoking-panic.webp', glyph:'JOIN?', signal:['PORTAL PANIC','別Worldへ接続','鏡像が一拍遅れて王を追います。'], twist:['INSTANCE SHIFT','出口が別の入口へ','満員、Avatar Error、Royal World。Respawnを待ちます。'] },
    'machine-power-cycle':{ image:'assets/characters/naoking-panic.webp', glyph:'0%', signal:['POWER CYCLE','一列ずつ完全消灯','水流、泡、音、Indicatorが停止しました。'], twist:['EMERGENCY BOOT','非常灯と手回しCrank','復旧先が通常か勝利か、最後のFuse次第です。'] },
    'oracle-ui-collapse':{ image:'assets/characters/naoking-panic.webp', glyph:'NaN', signal:['ROYAL UI FAILURE','Depth NaN / Witness 07???','Headerと文字が重力を失い、Page下へ落下します。'], twist:['AUTO REPAIR','王が座標を並べ直す','一つずつ逆再生。最後の文字だけ未確定です。'] },
    'golden-ocean-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'♛', signal:['GOLDEN OCEAN','全海流、Royal Gold','八証言の輪郭へ勝利光が満ちます。'], twist:['PALACE RISING','海底から王宮浮上','全窓が点灯し、王冠Stormを解放します。'] },
    'fish-celebration-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'∞', signal:['FISH CELEBRATION','全魚群が集合','小魚から深海影まで、王冠軌道へ合流します。'], twist:['SCHOOL BURST','群れが光へ変わる','Page全体へ散り、勝利文字として再集合します。'] },
    'abyss-dawn-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'☼', signal:['ABYSS DAWN','完全暗転、完全無音','遠い一線だけが青白く明るみ始めます。'], twist:['FIRST ROYAL LIGHT','深海に朝が来る','王宮、魚群、王冠を順に照らします。'] },
    'naoking-overload-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'×1000', signal:['NAOKING OVERLOAD','小型王が全方向から乱入','七Reelでも収容できません。'], twist:['GIANT KING','最後に巨大王が接近','Pageを押し開き、Royal Sealを中央へ置きます。'] }
  });

  const sequences = Object.freeze({
    topology:Object.freeze({ signal:.08, twist:.53, judgment:.76, stop:.90 }),
    'race-event':Object.freeze({ signal:.06, twist:.52, judgment:.78, stop:.91 }),
    'school-event':Object.freeze({ signal:.06, twist:.52, judgment:.78, stop:.91 }),
    'dive-event':Object.freeze({ signal:.05, twist:.51, judgment:.78, stop:.91 }),
    'portal-event':Object.freeze({ signal:.06, twist:.52, judgment:.78, stop:.91 }),
    'power-event':Object.freeze({ signal:.06, twist:.55, judgment:.79, stop:.91 }),
    'ui-event':Object.freeze({ signal:.06, twist:.53, judgment:.78, stop:.91 }),
    'jackpot-event':Object.freeze({ signal:.05, twist:.50, judgment:.77, stop:.90 })
  });

  const reelGrammars = Object.freeze({
    flowing:Object.freeze({ descent:'waterfall', cruise:'flow', signal:'orbit', anomaly:'flow', judgment:'sticky', stopping:'stopping' }),
    sticky:Object.freeze({ descent:'launch', cruise:'viscous', signal:'sticky', anomaly:'sticky', judgment:'sticky', stopping:'stopping' }),
    majestic:Object.freeze({ descent:'majestic', cruise:'majestic', signal:'orbit', anomaly:'majestic', judgment:'sticky', stopping:'stopping' }),
    depth:Object.freeze({ descent:'depth-dive', cruise:'waterfall', signal:'depth-pulse', anomaly:'orbit', judgment:'sticky', stopping:'stopping' }),
    scatter:Object.freeze({ descent:'scatter', cruise:'flow', signal:'orbit', anomaly:'one-accelerates', judgment:'stutter', stopping:'stopping' }),
    selective:Object.freeze({ descent:'launch', cruise:'flow', signal:'one-accelerates', anomaly:'selective-respin', judgment:'sticky', stopping:'stopping' }),
    evacuate:Object.freeze({ descent:'scatter', cruise:'flow', signal:'evacuate', anomaly:'respin', judgment:'sticky', stopping:'stopping' }),
    topology:Object.freeze({ descent:'launch', cruise:'accordion', signal:'selective-respin', anomaly:'rewind', judgment:'stutter', stopping:'stopping' }),
    race:Object.freeze({ descent:'launch', cruise:'race', signal:'race', anomaly:'one-accelerates', judgment:'sticky', stopping:'stopping' }),
    school:Object.freeze({ descent:'launch', cruise:'school-run', signal:'school-run', anomaly:'stutter', judgment:'sticky', stopping:'stopping' }),
    portal:Object.freeze({ descent:'reverse', cruise:'portal-spin', signal:'orbit', anomaly:'rewind', judgment:'sticky', stopping:'stopping' }),
    'power-cycle':Object.freeze({ descent:'launch', cruise:'stutter', signal:'blackout', anomaly:'power-restart', judgment:'sticky', stopping:'stopping' }),
    glitch:Object.freeze({ descent:'scatter', cruise:'glitch', signal:'glitch', anomaly:'rewind', judgment:'stutter', stopping:'stopping' })
  });

  window.NaokingOracleExpansion = Object.freeze({
    version:'1.0.0', routes, endings, scenes, sequences, reelGrammars,
    research:Object.freeze({ eventIdeas:60, siteWideIdeas:26, fishSchoolConcepts:15, animationGrammars:20 })
  });
})();
