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
    route({ id:'small-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.62, tier:'signal', world:'fish-school-small', motion:'wave', reelGrammar:'flowing', duration:9100, cue:'小魚が来た！', detail:'小さな魚の群れが、リールの後ろを横切ります。', fishSchool:'small', fishMotion:'cross', audioScene:'fish-school' }),
    route({ id:'royal-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.34, tier:'hot', world:'fish-school-royal', motion:'outside-in', reelGrammar:'sticky', duration:10500, cue:'王冠の魚が来た！', detail:'王冠つきの魚たちが、止まる順番を勝手に変えます。', fishSchool:'royal', fishMotion:'orbit', audioScene:'fish-school' }),
    route({ id:'golden-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.18, tier:'superhot', world:'fish-school-golden', motion:'center-last', reelGrammar:'majestic', duration:11200, cue:'金色の魚だ！', detail:'金色の魚たちが飛び込み、リールがまぶしく光ります。', fishSchool:'golden', fishMotion:'absorb', audioScene:'fish-school' }),
    route({ id:'abyss-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.25, tier:'hot', world:'fish-school-abyss', motion:'push', reelGrammar:'depth', reelCount:7, duration:11100, cue:'巨大な魚の群れ！', detail:'大きな深海魚が、画面のすぐ手前まで迫ります。', fishSchool:'abyss', fishMotion:'depth', audioScene:'fish-school' }),
    route({ id:'naoking-school-overload', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.15, tier:'hot', world:'fish-school-naoking', motion:'skip', reelGrammar:'scatter', reelCount:8, duration:11600, cue:'なおキング増えすぎ！', detail:'小さな王が勝手に増え続けます。本人は止める気ゼロです。', fishSchool:'naoking', fishMotion:'spiral', audioScene:'fish-school' }),

    route({ id:'seventh-witness-unregistered', family:'reel-event', category:'reel-topology', kinds:['normal','win','loss'], revivalCompatible:true, weight:.28, tier:'hot', world:'seventh-witness', motion:'witnesses', reelGrammar:'selective', reelCount:7, duration:10000, cue:'サメが増えた！', detail:'数が合いません。なおキングも数え直しています。', scene:'seventh-witness', sequence:'topology', twistMotion:'one-accelerates', audioScene:'ui-failure' }),
    route({ id:'witness-evacuation', family:'reel-event', category:'reel-topology', kinds:['normal','win','loss'], revivalCompatible:true, weight:.27, tier:'signal', world:'witness-evacuation', motion:'outside-in', reelGrammar:'evacuate', reelCount:4, duration:9600, cue:'サメが逃げた！', detail:'一体が画面外へ逃走。それでも王は続けます。', scene:'witness-evacuation', sequence:'topology', twistMotion:'respin', audioScene:'ui-failure' }),
    route({ id:'accordion-oracle', family:'reel-event', category:'reel-topology', kinds:['normal','win','loss'], revivalCompatible:true, weight:.23, tier:'hot', world:'accordion-reel', motion:'skip', reelGrammar:'topology', reelCount:6, duration:10400, cue:'リールが伸びた！', detail:'占い機が横に伸び、リールが一つ増えます。', scene:'accordion-reel', sequence:'topology', twistMotion:'rewind', audioScene:'ui-failure' }),

    route({ id:'naoking-race', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.34, tier:'hot', world:'race-track', motion:'push', reelGrammar:'race', reelCount:7, duration:17400, cue:'なおキング大レース！', detail:'七体の王が競走します。たぶん誰もルールを知りません。', scene:'naoking-race', sequence:'race-event', twistMotion:'one-accelerates', audioScene:'race' }),
    route({ id:'royal-school-dash', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.32, tier:'hot', world:'royal-school', motion:'wave', reelGrammar:'school', reelCount:5, duration:16800, cue:'遅刻まで10秒！', detail:'王冠を落としたなおキングが、学校へ全力疾走します。', scene:'royal-school-dash', sequence:'school-event', twistMotion:'stutter', audioScene:'school' }),
    route({ id:'realistic-deep-dive', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.30, tier:'superhot', world:'cinematic-dive', motion:'center-last', reelGrammar:'depth', reelCount:4, duration:18400, cue:'深海へまっすぐ潜る！', detail:'光のない海底へ潜り、王宮を探します。', scene:'realistic-deep-dive', sequence:'dive-event', twistMotion:'majestic', audioScene:'dive' }),
    route({ id:'portal-panic', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.31, tier:'hot', world:'portal-world', motion:'reverse', reelGrammar:'portal', reelCount:6, duration:17000, cue:'変な穴が開いた！', detail:'王が別世界へ吸い込まれました。帰ってこられるでしょうか。', scene:'portal-panic', sequence:'portal-event', twistMotion:'rewind', audioScene:'portal' }),
    route({ id:'machine-power-cycle', family:'power-failure', category:'machine-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.27, tier:'hot', world:'machine-power-cycle', motion:'power-cut', reelGrammar:'power-cycle', reelCount:5, duration:15600, cue:'突然の停電！', detail:'占い機が全部止まりました。王が手回しで直します。', scene:'machine-power-cycle', sequence:'power-event', twistMotion:'stutter', audioScene:'power-failure', blackout:true, freeze:true }),
    route({ id:'oracle-ui-collapse', family:'chaos', category:'ui-failure', kinds:['normal','win','loss'], revivalCompatible:true, weight:.25, tier:'hot', world:'ui-collapse', motion:'skip', reelGrammar:'glitch', reelCount:7, duration:15400, cue:'画面が壊れた！', detail:'文字もサメも落下。王が手で戻そうとしています。', scene:'oracle-ui-collapse', sequence:'ui-event', twistMotion:'rewind', audioScene:'ui-failure' }),

    route({ id:'golden-ocean-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['rainbow','crown'], weight:.11, tier:'extreme', world:'golden-ocean', motion:'wave', reelGrammar:'majestic', reelCount:8, duration:15000, cue:'超大当たり！金色の海！', detail:'海もリールも金色に変わり、王宮が光ります。', scene:'golden-ocean-jackpot', sequence:'jackpot-event', twistMotion:'majestic', audioScene:'jackpot-golden', premium:true, freeze:true }),
    route({ id:'fish-celebration-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['comet','abyss'], weight:.10, tier:'extreme', world:'fish-celebration', motion:'outside-in', reelGrammar:'flowing', reelCount:6, duration:14800, cue:'超大当たり！魚が大集合！', detail:'全部の魚が集まり、大きな王冠を作ります。', scene:'fish-celebration-jackpot', sequence:'jackpot-event', twistMotion:'respin', audioScene:'jackpot-fish', premium:true, fishSchool:'golden', fishMotion:'spiral', freeze:true }),
    route({ id:'abyss-dawn-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['abyss','rainbow'], weight:.09, tier:'extreme', world:'abyss-dawn', motion:'center-last', reelGrammar:'majestic', reelCount:5, duration:15400, cue:'超大当たり！深海に朝！', detail:'真っ暗な海を朝日が照らし、王宮が目を覚まします。', scene:'abyss-dawn-jackpot', sequence:'jackpot-event', twistMotion:'majestic', audioScene:'jackpot-dawn', premium:true, blackout:true, freeze:true }),
    route({ id:'naoking-overload-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['crown','comet'], weight:.09, tier:'extreme', world:'naoking-overload', motion:'skip', reelGrammar:'scatter', reelCount:7, duration:15100, cue:'超大当たり！王が増えた！', detail:'小さな王が大量発生。最後は巨大な王が居座ります。', scene:'naoking-overload-jackpot', sequence:'jackpot-event', twistMotion:'one-accelerates', audioScene:'jackpot-overload', premium:true, fishSchool:'naoking', fishMotion:'depth', freeze:true })
  ]);

  const endings = Object.freeze({
    'naoking-race':endingSet({
      normal:[{variant:'photo-draw',eyebrow:'通常結果',title:'全員ほぼ同着',detail:'写真でも差が分からず、普通の結果になりました。'},{variant:'lunch-stop',eyebrow:'通常結果',title:'全員、お弁当休憩',detail:'競走よりご飯が大事。順位は決まりませんでした。'},{variant:'wrong-course',eyebrow:'通常結果',title:'全員が道を間違えた',detail:'ゴールだけが待ちぼうけ。普通の結果です。'}],
      win:[{variant:'favorite-win',eyebrow:'当たり！',title:'なおキングが一着！',detail:'最後に一気に追い抜き、王冠を守りました。'},{variant:'tiny-comeback',eyebrow:'当たり！',title:'小さな王が大逆転！',detail:'画面の端から全員を抜き、当たりです。'},{variant:'crown-ride',eyebrow:'大当たり！',title:'王冠に乗ってゴール！',detail:'走っていません。でも王が勝ちと言うので大当たりです。'}],
      loss:[{variant:'all-fall',eyebrow:'ハズレ…',title:'全員そろって転んだ',detail:'干からびた王だけ到着。残念、ハズレです。'},{variant:'reverse-runner',eyebrow:'ハズレ…',title:'全員で逆走！',detail:'誰もゴールしませんでした。見事なハズレです。'},{variant:'sleep-track',eyebrow:'ハズレ…',title:'王がコースで寝た',detail:'競走は中止。王は寝たまま、ハズレです。'}],
      revival:[{variant:'late-surge',eyebrow:'復活！大当たり！',title:'最後尾から大逆転！',detail:'終わったと思った瞬間、王がゴールへ飛び込みました。'},{variant:'finish-rewind',eyebrow:'復活！大当たり！',title:'よく見たら勝っていた！',detail:'王冠の先だけ、少し早くゴールしていました。'},{variant:'fish-push',eyebrow:'復活！大当たり！',title:'魚たちが王を押した！',detail:'止まった王を魚が押し込み、まさかの大当たりです。'}]
    }),
    'royal-school-dash':endingSet({
      normal:[{variant:'holiday',eyebrow:'通常結果',title:'今日は休校でした',detail:'全力で走りましたが、お休みでした。普通の結果です。'},{variant:'wrong-class',eyebrow:'通常結果',title:'隣の教室へ到着',detail:'教室は違いますが、時間には間に合いました。'},{variant:'bell-delay',eyebrow:'通常結果',title:'鐘の方が遅刻した',detail:'今回は誰も悪くないことにします。普通の結果です。'}],
      win:[{variant:'gate-slide',eyebrow:'当たり！',title:'閉まる校門を突破！',detail:'最後の一秒ですべり込み。間に合いました。'},{variant:'shortcut',eyebrow:'大当たり！',title:'秘密の近道を発見！',detail:'机の下を通り、大当たり教室へ直行しました。'},{variant:'teacher-crown',eyebrow:'当たり！',title:'先生から王冠！',detail:'遅刻記録が、なぜか当たり記録に変わりました。'}],
      loss:[{variant:'gate-close',eyebrow:'ハズレ…',title:'目の前で校門が閉じた',detail:'王冠だけ校内へ。本人はハズレ側です。'},{variant:'crown-trip',eyebrow:'ハズレ…',title:'自分の王冠で転んだ',detail:'拾っている間に鐘が鳴りました。さすがポンコツ王。'},{variant:'wrong-school',eyebrow:'ハズレ…',title:'学校を間違えた',detail:'受付に断られ、ハズレだけ持って帰ります。'}],
      revival:[{variant:'respawn-class',eyebrow:'復活！大当たり！',title:'王が教室に現れた！',detail:'遅刻の直後、自分の席へ突然現れました。方法は秘密です。'},{variant:'bell-rewind',eyebrow:'復活！大当たり！',title:'10秒だけ巻き戻った！',detail:'転んだ時間まで戻り、今度は間に合いました。'},{variant:'fish-bus',eyebrow:'復活！大当たり！',title:'小魚バスが救出！',detail:'校門を飛び越え、王を教室へ運びました。'}]
    }),
    'realistic-deep-dive':endingSet({
      normal:[{variant:'quiet-trench',eyebrow:'通常結果',title:'静かな海底へ到着',detail:'大きな影は通り過ぎ、普通の結果になりました。'},{variant:'empty-palace',eyebrow:'通常結果',title:'王宮は空っぽ',detail:'王は泡を一つ拾い、調査した顔で帰ります。'},{variant:'surface-call',eyebrow:'通常結果',title:'ここで調査終了',detail:'水面から呼び戻され、普通の結果を持ち帰ります。'}],
      win:[{variant:'palace-found',eyebrow:'当たり！',title:'海底の王宮を発見！',detail:'大きな扉が開き、金色の王座が現れました。'},{variant:'leviathan-guide',eyebrow:'大当たり！',title:'大きな影は味方だった！',detail:'影の先に、大当たりへ続く門が現れました。'},{variant:'thermal-crown',eyebrow:'当たり！',title:'海底から王冠！',detail:'暗い海底が、金色のお祭り会場に変わりました。'}],
      loss:[{variant:'pressure-return',eyebrow:'ハズレ…',title:'水面へ戻された',detail:'王宮へ届く前に装置が閉じました。ハズレです。'},{variant:'shadow-block',eyebrow:'ハズレ…',title:'大きな影で真っ暗',detail:'影が去ると、ハズレ札だけが沈んでいました。'},{variant:'wrong-beacon',eyebrow:'ハズレ…',title:'光る海藻でした',detail:'王宮ではありません。王は無言で帰ります。'}],
      revival:[{variant:'last-beacon',eyebrow:'復活！大当たり！',title:'海底の光が戻った！',detail:'消えた王宮が動き出し、大当たりになりました。'},{variant:'bubble-lift',eyebrow:'復活！大当たり！',title:'金の泡が持ち上げた！',detail:'沈んだ結果ごと浮上して、大当たりに変わりました。'},{variant:'shadow-crown',eyebrow:'復活！大当たり！',title:'影にも王冠があった！',detail:'敵だと思った影が王宮を運び、逆転大当たりです。'}]
    }),
    'portal-panic':endingSet({
      normal:[{variant:'mirror-delay',eyebrow:'通常結果',title:'鏡の王だけ少し遅い',detail:'それ以外は問題なし。普通の結果です。'},{variant:'empty-instance',eyebrow:'通常結果',title:'誰もいない世界へ到着',detail:'王は写真だけ撮り、普通の占いへ戻りました。'},{variant:'portal-loop',eyebrow:'通常結果',title:'同じ入口へ戻った',detail:'移動距離はゼロ。王には難しすぎました。'}],
      win:[{variant:'palace-world',eyebrow:'当たり！',title:'穴の先は大当たり王宮！',detail:'たくさんの魚が、王をにぎやかに迎えます。'},{variant:'mirror-crown',eyebrow:'大当たり！',title:'鏡の王から王冠！',detail:'王冠が飛び出した瞬間、大当たりになりました。'},{variant:'friend-invite',eyebrow:'当たり！',title:'小魚から招待状！',detail:'秘密の世界につながり、そのまま当たりです。'}],
      loss:[{variant:'instance-full',eyebrow:'ハズレ…',title:'どこへ行っても満員',detail:'王はハズレ用の待合室へ戻されました。'},{variant:'avatar-error',eyebrow:'ハズレ…',title:'なおキングが出てこない',detail:'代わりに干からびた王が現れ、ハズレを告げます。'},{variant:'portal-refuse',eyebrow:'ハズレ…',title:'王だけ入場拒否',detail:'王冠だけ穴へ消え、本人は置いてきぼりです。'}],
      revival:[{variant:'respawn',eyebrow:'復活！大当たり！',title:'大当たりの場所へ再登場！',detail:'消えた王が、大当たりの場所へ戻ってきました。'},{variant:'mirror-break',eyebrow:'復活！大当たり！',title:'鏡を割って王が帰還！',detail:'偽のハズレを壊し、本物の大当たりが飛び出します。'},{variant:'portal-reverse',eyebrow:'復活！大当たり！',title:'変な穴が逆回転！',detail:'失敗した出口が、大当たりの王宮につながりました。'}]
    }),
    'machine-power-cycle':endingSet({
      normal:[{variant:'clean-boot',eyebrow:'通常結果',title:'普通に動き出した',detail:'変な数字を消して、普通の結果を表示しました。'},{variant:'hand-crank',eyebrow:'通常結果',title:'手回しでなんとか直った',detail:'遅いですが、王が得意げなので普通の結果です。'}],
      win:[{variant:'royal-fuse',eyebrow:'当たり！',title:'最後の部品が光った！',detail:'全部の灯りが戻り、大当たりへつながりました。'},{variant:'overcharge',eyebrow:'大当たり！',title:'動く力が120％！',detail:'光が占い機からあふれ、大当たり確定です。'}],
      loss:[{variant:'wrong-fuse',eyebrow:'ハズレ…',title:'照明だけ直った',detail:'リールは止まったまま。ハズレ札だけ光っています。'},{variant:'king-unplug',eyebrow:'ハズレ…',title:'王が電源を抜いていた',detail:'差し直す前に終了。王は知らん顔です。'}],
      revival:[{variant:'distant-signal',eyebrow:'復活！大当たり！',title:'遠くで小さな光！',detail:'全部止まった状態から、一気に復活。大当たりです。'},{variant:'bubble-fuse',eyebrow:'復活！大当たり！',title:'一つの泡で電源復活！',detail:'小さな泡が落ちた瞬間、全部の灯りが戻りました。'}]
    }),
    'oracle-ui-collapse':endingSet({
      normal:[{variant:'auto-layout',eyebrow:'通常結果',title:'画面が元に戻った',detail:'文字もサメも戻り、普通の結果になりました。'},{variant:'king-fix',eyebrow:'通常結果',title:'王が一度たたいて直した',detail:'少し曲がっていますが、王は満足しています。'}],
      win:[{variant:'error-jackpot',eyebrow:'大当たり！',title:'壊れた文字が王冠に！',detail:'落ちた表示が集まり、大きな王冠を作りました。'},{variant:'seventh-admin',eyebrow:'当たり！',title:'増えたサメが勝手に修理！',detail:'壊れた画面を、金色の大当たり画面に変えました。'}],
      loss:[{variant:'css-off',eyebrow:'ハズレ…',title:'王だけ画面下へ落下',detail:'画面は戻りましたが、ハズレだけ残っています。'},{variant:'nan-verdict',eyebrow:'ハズレ…',title:'結果の場所が見つからない',detail:'王には直せません。困った顔でハズレにしました。'}],
      revival:[{variant:'whole-rewind',eyebrow:'復活！大当たり！',title:'画面が逆再生！',detail:'落ちた文字が戻り、大当たりを作りました。'},{variant:'royal-refresh',eyebrow:'復活！大当たり！',title:'王が画面をやり直した！',detail:'ハズレを消し、大当たりの画面へ戻りました。'}]
    }),
    'golden-ocean-jackpot':endingSet({ win:[{variant:'crown-storm',eyebrow:'超大当たり！',title:'金の海から王冠の雨！',detail:'サメたちが礼をして、王宮の鐘が鳴ります。'},{variant:'palace-rise',eyebrow:'超大当たり！',title:'巨大な王宮が出現！',detail:'窓が順番に光り、大当たりの王座が開きます。'},{variant:'royal-current',eyebrow:'超大当たり！',title:'金色の海流が王へ！',detail:'集まった光が大きな王の印になりました。'}] }),
    'fish-celebration-jackpot':endingSet({ win:[{variant:'school-crown',eyebrow:'超大当たり！',title:'魚たちが巨大王冠を作った！',detail:'最後の一匹が入り、お祝いの形が完成しました。'},{variant:'fish-parade',eyebrow:'超大当たり！',title:'魚の大パレード！',detail:'何もしていない王が、なぜか主役です。'},{variant:'school-burst',eyebrow:'超大当たり！',title:'魚の群れが光に変身！',detail:'光る泡が集まり、大当たりの文字を作ります。'}] }),
    'abyss-dawn-jackpot':endingSet({ win:[{variant:'first-ray',eyebrow:'超大当たり！',title:'深海に朝が来た！',detail:'真っ暗な海へ光が差し、金の王冠を照らします。'},{variant:'white-palace',eyebrow:'超大当たり！',title:'光の中から王宮！',detail:'暗かった世界に色が戻り、大当たりの海が開きます。'},{variant:'sunrise-school',eyebrow:'超大当たり！',title:'朝日に魚が大集合！',detail:'画面のすみまで、お祝いの光が走ります。'}] }),
    'naoking-overload-jackpot':endingSet({ win:[{variant:'thousand-kings',eyebrow:'超大当たり！',title:'王が千体に増えた！',detail:'全員バラバラに泳ぎ、巨大な王だけ残りました。'},{variant:'all-fall-win',eyebrow:'超大当たり！',title:'全員転んで「大当たり」！',detail:'締まりはありませんが、並びだけは完璧です。'},{variant:'giant-sneeze',eyebrow:'超大当たり！',title:'巨大王のくしゃみ！',detail:'全部吹き飛び、王冠だけが中央に残りました。'}] })
  });

  const scenes = Object.freeze({
    'seventh-witness':{ image:'assets/characters/naoking-panic.webp', glyph:'07?', signal:['サメが増えた！','数が合いません','リールの左右から、知らないサメが出てきます。'], twist:['王が数え直す','やっぱり多い','一体だけ急加速。王を置いて先へ行きました。'] },
    'witness-evacuation':{ image:'assets/characters/naoking-3.webp', glyph:'04', signal:['サメが逃げた！','リールから一体逃走','残り四体で続行。王は止めません。'], twist:['空席を発見','画面の外から返事','戻るのか休むのか、まだ分かりません。'] },
    'accordion-reel':{ image:'assets/characters/naoking-2.webp', glyph:'5→6', signal:['リールが伸びた！','占い機が横に伸びる','リールが一つ増えました。'], twist:['真ん中を交換','止まったと思ったら逆回転','全部のリールが、また動き始めました。'] },
    'naoking-race':{ image:'assets/characters/naoking-2.webp', glyph:'競走', signal:['なおキング大レース！','スタート！','七体の王が一斉に飛び出します。'], twist:['最後の直線！','順位がぐちゃぐちゃ','ゴールか転倒か昼食か。もうすぐ決まります。'] },
    'royal-school-dash':{ image:'assets/characters/naoking-panic.webp', glyph:'00:10', signal:['遅刻まで10秒！','王、学校へ急げ！','王冠を落としたまま全力疾走です。'], twist:['校門まであと少し！','門が閉まり始めた','間に合うのか。次で結果が決まります。'] },
    'realistic-deep-dive':{ image:'assets/characters/naoking-hero.webp', glyph:'深さ4810', signal:['深海へまっすぐ潜る！','光のない海底へ','遠くに見える王宮の光を追います。'], twist:['大きな魚が来た！','道をふさがれた','どいてくれるでしょうか。次の動きを待ちます。'] },
    'portal-panic':{ image:'assets/characters/naoking-panic.webp', glyph:'どこ？', signal:['変な穴が開いた！','王が吸い込まれた','鏡の王が、本物の王を追いかけます。'], twist:['出口が入れ替わる！','別の入口に逆戻り','王は無事に帰れるのでしょうか。'] },
    'machine-power-cycle':{ image:'assets/characters/naoking-panic.webp', glyph:'0%', signal:['突然の停電！','占い機が全部止まった','光も泡も音も、すべて止まりました。'], twist:['王が修理中！','手回しで直している','直るのか爆発するのか。あと少しです。'] },
    'oracle-ui-collapse':{ image:'assets/characters/naoking-panic.webp', glyph:'迷子', signal:['画面が壊れた！','文字もサメも落下','全部が画面の下へ落ちていきます。'], twist:['王が雑に修理！','手で表示を並べ直す','最後の一文字だけ、まだ戻りません。'] },
    'golden-ocean-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'♛', signal:['超大当たり！','海が金色に変わる','すべてのサメが大当たりの光に包まれます。'], twist:['王宮が出現！','巨大な王宮が海底から上がる','窓が全部光り、王冠の雨が始まります。'] },
    'fish-celebration-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'∞', signal:['超大当たり！','全部の魚が大集合','小魚も巨大魚も、王冠の形に並びます。'], twist:['魚が光に変身！','群れが光る泡になる','泡が集まり、大当たりの文字を作ります。'] },
    'abyss-dawn-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'☼', signal:['超大当たり！','真っ暗、そして無音','遠くに一本だけ、朝の光が見えます。'], twist:['深海に朝が来た！','光が一気に広がる','王宮も魚も王冠も、全部が輝きます。'] },
    'naoking-overload-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'×1000', signal:['超大当たり！','小さな王が大量発生','増やした本人は、満足そうです。'], twist:['巨大な王が来た！','画面に入りきらない','全部を押しのけ、中央に居座りました。'] }
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
