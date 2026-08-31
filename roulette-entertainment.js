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
    route({ id:'small-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.62, tier:'signal', world:'fish-school-small', motion:'wave', reelGrammar:'flowing', duration:9100, cue:'小魚の群れ、接近', detail:'偵察中の一匹を追って、小さな魚の群れがリールの後ろを横切ります。', fishSchool:'small', fishMotion:'cross', audioScene:'fish-school' }),
    route({ id:'royal-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.34, tier:'hot', world:'fish-school-royal', motion:'outside-in', reelGrammar:'sticky', duration:10500, cue:'王家の魚群、接近', detail:'王冠を付けた魚たちが占い機を一周し、リールの停止順を勝手に変えます。', fishSchool:'royal', fishMotion:'orbit', audioScene:'fish-school' }),
    route({ id:'golden-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.18, tier:'superhot', world:'fish-school-golden', motion:'center-last', reelGrammar:'majestic', duration:11200, cue:'金色の魚群、接近', detail:'金色の魚たちがリールへ飛び込み、すべての結果をまぶしく照らします。', fishSchool:'golden', fishMotion:'absorb', audioScene:'fish-school' }),
    route({ id:'abyss-fish-school', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.25, tier:'hot', world:'fish-school-abyss', motion:'push', reelGrammar:'depth', reelCount:7, duration:11100, cue:'巨大魚群、急接近', detail:'遠くの光が巨大な深海魚の群れに変わり、画面のすぐ手前まで迫ります。', fishSchool:'abyss', fishMotion:'depth', audioScene:'fish-school' }),
    route({ id:'naoking-school-overload', family:'fish-school', category:'fish-school', kinds:['normal','win','loss'], revivalCompatible:true, weight:.15, tier:'hot', world:'fish-school-naoking', motion:'skip', reelGrammar:'scatter', reelCount:8, duration:11600, cue:'なおキング大量発生', detail:'小さななおキングが渦を作り、八つのリールへ無計画に増殖します。王は止めません。', fishSchool:'naoking', fishMotion:'spiral', audioScene:'fish-school' }),

    route({ id:'seventh-witness-unregistered', family:'reel-event', category:'reel-topology', kinds:['normal','win','loss'], revivalCompatible:true, weight:.28, tier:'hot', world:'seventh-witness', motion:'witnesses', reelGrammar:'selective', reelCount:7, duration:10000, cue:'サメが七体？', detail:'七体目のサメは一覧にいません。なのに、なぜか二体も増えました。', scene:'seventh-witness', sequence:'topology', twistMotion:'one-accelerates', audioScene:'ui-failure' }),
    route({ id:'witness-evacuation', family:'reel-event', category:'reel-topology', kinds:['normal','win','loss'], revivalCompatible:true, weight:.27, tier:'signal', world:'witness-evacuation', motion:'outside-in', reelGrammar:'evacuate', reelCount:4, duration:9600, cue:'サメ、一体逃走', detail:'一体のサメがリールから逃げました。四体しかいませんが、王は続けるそうです。', scene:'witness-evacuation', sequence:'topology', twistMotion:'respin', audioScene:'ui-failure' }),
    route({ id:'accordion-oracle', family:'reel-event', category:'reel-topology', kinds:['normal','win','loss'], revivalCompatible:true, weight:.23, tier:'hot', world:'accordion-reel', motion:'skip', reelGrammar:'topology', reelCount:6, duration:10400, cue:'リールが横に伸びた', detail:'占い機が横へ伸び、今まで隠していた第六列を堂々と開きます。', scene:'accordion-reel', sequence:'topology', twistMotion:'rewind', audioScene:'ui-failure' }),

    route({ id:'naoking-race', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.34, tier:'hot', world:'race-track', motion:'push', reelGrammar:'race', reelCount:7, duration:17400, cue:'なおキング大競走', detail:'七体のなおキングが深海の競走路へ。誰が勝つかは最後まで読めません。本人たちも知りません。', scene:'naoking-race', sequence:'race-event', twistMotion:'one-accelerates', audioScene:'race' }),
    route({ id:'royal-school-dash', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.32, tier:'hot', world:'royal-school', motion:'wave', reelGrammar:'school', reelCount:5, duration:16800, cue:'王、学校へ急げ', detail:'遅刻まであと十秒。王冠を落としたなおキングが、今さら校門へ走ります。', scene:'royal-school-dash', sequence:'school-event', twistMotion:'stutter', audioScene:'school' }),
    route({ id:'realistic-deep-dive', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.30, tier:'superhot', world:'cinematic-dive', motion:'center-last', reelGrammar:'depth', reelCount:4, duration:18400, cue:'深さ4810まで潜る', detail:'海面を割り、光が消える深さまで潜ります。大きな影の向こうにある王宮の光を探します。', scene:'realistic-deep-dive', sequence:'dive-event', twistMotion:'majestic', audioScene:'dive' }),
    route({ id:'portal-panic', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.31, tier:'hot', world:'portal-world', motion:'reverse', reelGrammar:'portal', reelCount:6, duration:17000, cue:'転送門、大混乱', detail:'王国の転送門が別世界へつながりました。鏡の王と本物の王、どちらが戻るかは不明です。', scene:'portal-panic', sequence:'portal-event', twistMotion:'rewind', audioScene:'portal' }),
    route({ id:'machine-power-cycle', family:'power-failure', category:'machine-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.27, tier:'hot', world:'machine-power-cycle', motion:'power-cut', reelGrammar:'power-cycle', reelCount:5, duration:15600, cue:'占い機、停電', detail:'一列ずつ完全に消灯。非常灯、王の手回し修理、再起動の順で占い機が変形します。', scene:'machine-power-cycle', sequence:'power-event', twistMotion:'stutter', audioScene:'power-failure', blackout:true, freeze:true }),
    route({ id:'oracle-ui-collapse', family:'chaos', category:'ui-failure', kinds:['normal','win','loss'], revivalCompatible:true, weight:.25, tier:'hot', world:'ui-collapse', motion:'skip', reelGrammar:'glitch', reelCount:7, duration:15400, cue:'王国画面、崩壊', detail:'深さの表示は故障、見出しは落下、七体のサメは自分の場所を見失いました。王が雑に並べ直します。', scene:'oracle-ui-collapse', sequence:'ui-event', twistMotion:'rewind', audioScene:'ui-failure' }),

    route({ id:'golden-ocean-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['rainbow','crown'], weight:.11, tier:'extreme', world:'golden-ocean', motion:'wave', reelGrammar:'majestic', reelCount:8, duration:15000, cue:'金色の海、大当たり', detail:'海全体が金色に開き、八つのリールと王宮の光が一斉に解放されます。', scene:'golden-ocean-jackpot', sequence:'jackpot-event', twistMotion:'majestic', audioScene:'jackpot-golden', premium:true, freeze:true }),
    route({ id:'fish-celebration-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['comet','abyss'], weight:.10, tier:'extreme', world:'fish-celebration', motion:'outside-in', reelGrammar:'flowing', reelCount:6, duration:14800, cue:'魚群大集合、大当たり', detail:'すべての魚群が画面中央へ集まり、巨大な王冠の渦に変わります。', scene:'fish-celebration-jackpot', sequence:'jackpot-event', twistMotion:'respin', audioScene:'jackpot-fish', premium:true, fishSchool:'golden', fishMotion:'spiral', freeze:true }),
    route({ id:'abyss-dawn-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['abyss','rainbow'], weight:.09, tier:'extreme', world:'abyss-dawn', motion:'center-last', reelGrammar:'majestic', reelCount:5, duration:15400, cue:'深海の夜明け、大当たり', detail:'完全な暗闇を青白い朝日が切り開き、眠っていた深海宮殿を照らします。', scene:'abyss-dawn-jackpot', sequence:'jackpot-event', twistMotion:'majestic', audioScene:'jackpot-dawn', premium:true, blackout:true, freeze:true }),
    route({ id:'naoking-overload-jackpot', family:'premium', category:'jackpot-family', kinds:['win'], effects:['crown','comet'], weight:.09, tier:'extreme', world:'naoking-overload', motion:'skip', reelGrammar:'scatter', reelCount:7, duration:15100, cue:'なおキング大増殖、大当たり', detail:'小さな王が全方向から乱入。最後は巨大な王が画面を押し広げて居座ります。', scene:'naoking-overload-jackpot', sequence:'jackpot-event', twistMotion:'one-accelerates', audioScene:'jackpot-overload', premium:true, fishSchool:'naoking', fishMotion:'depth', freeze:true })
  ]);

  const endings = Object.freeze({
    'naoking-race':endingSet({
      normal:[{variant:'photo-draw',eyebrow:'写真判定でも同着',title:'全員ほぼ同着',detail:'どれだけ拡大しても差がないので、普通の判定へ戻します。'},{variant:'lunch-stop',eyebrow:'王、弁当休憩',title:'全員、途中で昼食',detail:'競走より弁当が大事だそうです。順位は保留にします。'},{variant:'wrong-course',eyebrow:'コースを間違えた',title:'全員が別の道へ',detail:'ゴールだけが待ちぼうけです。何事もなかったように通常へ戻します。'}],
      win:[{variant:'favorite-win',eyebrow:'王、先頭でゴール',title:'本命の王が一着',detail:'最後の直線を金の海流で抜け、王冠旗が上がります。'},{variant:'tiny-comeback',eyebrow:'最下位から大逆転',title:'最小の王が全員を抜く',detail:'画面の端から一気に追い抜き、勝利線へ飛び込みました。'},{variant:'crown-ride',eyebrow:'王冠で加速',title:'王冠に乗って飛ぶ',detail:'走ってはいませんが、王が勝ちだと言うので大当たりです。'}],
      loss:[{variant:'all-fall',eyebrow:'全員転倒',title:'同じ場所で仲良く転ぶ',detail:'干からびた王だけが遅れて到着。残念ながらハズレです。'},{variant:'reverse-runner',eyebrow:'逆走を確認',title:'一体だけ逆向き',detail:'全員で追いかけたため、ゴールが無人になりました。見事なハズレです。'},{variant:'sleep-track',eyebrow:'競走中止',title:'王がコースの真ん中で寝る',detail:'危ないので競走終了。王は寝たまま、敗北札だけ回収します。'}],
      revival:[{variant:'late-surge',eyebrow:'最後尾から逆転',title:'暗転後、王が急浮上',detail:'終わったはずの写真判定を飛び越え、大当たり線へ滑り込みます。'},{variant:'finish-rewind',eyebrow:'写真判定を見直し',title:'ゴール映像を逆再生',detail:'見落としていた王冠の先が、ほんの少し勝利線を越えていました。'},{variant:'fish-push',eyebrow:'魚群の後押し',title:'魚たちが王を押し込む',detail:'観客の魚が海流を作り、止まった王を勝利まで運びます。'}]
    }),
    'royal-school-dash':endingSet({
      normal:[{variant:'holiday',eyebrow:'本日は休校',title:'今日は休日でした',detail:'あれだけ走りましたが、学校はお休みです。普通の判定へ戻ります。'},{variant:'wrong-class',eyebrow:'教室を間違えた',title:'隣の教室へ到着',detail:'場所は違いますが時間には間に合いました。今回は普通の結果です。'},{variant:'bell-delay',eyebrow:'鐘が遅刻',title:'王より鐘の方が遅い',detail:'誰も悪くないことにして、通常の判定へ合流します。'}],
      win:[{variant:'gate-slide',eyebrow:'すべり込み成功',title:'閉まる校門を通過',detail:'最後の一泡と同時に着席。王冠の出席印が光ります。'},{variant:'shortcut',eyebrow:'秘密の近道',title:'水槽の抜け道が開く',detail:'机の下を通って、大当たり教室へ直接到着しました。'},{variant:'teacher-crown',eyebrow:'遅刻なしの王',title:'先生が王冠を授ける',detail:'さっきまでの遅刻記録が、なぜか勝利証明に書き換わりました。'}],
      loss:[{variant:'gate-close',eyebrow:'一秒遅かった',title:'目の前で校門が閉じる',detail:'王冠だけ中へ転がり、本人はハズレ側に残りました。'},{variant:'crown-trip',eyebrow:'王冠で転倒',title:'自分の王冠につまずく',detail:'拾っている間に鐘が鳴り、しょんぼり帰宅です。さすが王です。'},{variant:'wrong-school',eyebrow:'学校が違う',title:'知らない校舎へ到着',detail:'受付にも丁寧に断られ、敗北札だけ持ち帰ります。'}],
      revival:[{variant:'respawn-class',eyebrow:'席の上へ再出現',title:'王、いきなり教室内へ',detail:'遅刻が決まった直後、王が自分の席の上に現れました。手段は不明です。'},{variant:'bell-rewind',eyebrow:'十秒巻き戻し',title:'最後の十秒をやり直す',detail:'転倒も赤信号も逆向きに戻り、今度こそ大当たりの時刻へ。'},{variant:'fish-bus',eyebrow:'小魚の送迎便',title:'小魚バスが急停車',detail:'閉じた校門を軽々と飛び越え、王を勝利教室へ運びます。'}]
    }),
    'realistic-deep-dive':endingSet({
      normal:[{variant:'quiet-trench',eyebrow:'海底は静か',title:'海底の谷へ到着',detail:'大きな影は通り過ぎ、普通の占い結果だけが残りました。'},{variant:'empty-palace',eyebrow:'王宮の光は見つからない',title:'王宮跡は空でした',detail:'王は泡を一つだけ拾い、調査した顔でいつもの道へ戻ります。'},{variant:'surface-call',eyebrow:'水面から帰還命令',title:'調査はここで中止',detail:'水面から呼び戻されました。現在の結果をそのまま持ち帰ります。'}],
      win:[{variant:'palace-found',eyebrow:'王宮を発見',title:'海底の壁が大きく開く',detail:'遠くに見えた青白い光が、金色の王の席を照らします。'},{variant:'leviathan-guide',eyebrow:'大きな影は味方',title:'安全な道を教えている',detail:'大きな背中の先に、大当たりへ続く門が現れました。'},{variant:'thermal-crown',eyebrow:'海底に金色の光',title:'海底から王冠が噴き出す',detail:'暗かった海底が、一瞬でお祭りの光に変わります。'}],
      loss:[{variant:'pressure-return',eyebrow:'水圧が限界',title:'水面へ強制的に戻される',detail:'王宮の光へ届く前に装置が閉じ、ハズレだけを回収しました。'},{variant:'shadow-block',eyebrow:'王宮の光が消えた',title:'大きな影がすべてを隠す',detail:'影が去ったあとには、敗北札だけが静かに沈んでいます。'},{variant:'wrong-beacon',eyebrow:'まぎらわしい光',title:'追っていたのは光る海藻',detail:'王宮の光ではありません。王は何も言わずに帰ります。'}],
      revival:[{variant:'last-beacon',eyebrow:'最後の一つが光る',title:'無音の海底で光が戻る',detail:'遠くの光が近づき、大当たりの王宮を再び動かします。'},{variant:'bubble-lift',eyebrow:'金の泡で水面へ',title:'深海そのものが持ち上がる',detail:'ハズレだった海底の谷ごと上下が逆になり、勝利の水面へ到着します。'},{variant:'shadow-crown',eyebrow:'大きな影にも王冠',title:'影の頭上に王冠が見える',detail:'敵だと思った影が宮殿を背負い、逆転の光を放ちます。'}]
    }),
    'portal-panic':endingSet({
      normal:[{variant:'mirror-delay',eyebrow:'鏡を確認',title:'鏡の王だけ一秒遅い',detail:'それ以外は正常らしいので、普通の結果へ戻します。'},{variant:'empty-instance',eyebrow:'静かな別王国',title:'誰もいない世界へ到着',detail:'王は記念写真だけ撮り、元の占いへ帰ります。'},{variant:'portal-loop',eyebrow:'転送ぐるぐる',title:'同じ入口へ戻ってきた',detail:'移動距離はゼロです。王には難しかったので、結果は通常通りです。'}],
      win:[{variant:'palace-world',eyebrow:'黄金王宮へ接続',title:'転送先は勝利の王宮',detail:'たくさんの魚が、にぎやかな音で王を迎えます。'},{variant:'mirror-crown',eyebrow:'鏡からごほうび',title:'鏡の王が王冠を投げ渡す',detail:'王冠が境界を越えた瞬間、本物の大当たりになりました。'},{variant:'friend-invite',eyebrow:'招待を受理',title:'知らない小魚から招待状',detail:'秘密の別世界へつながり、そのまま勝利の演出が始まります。'}],
      loss:[{variant:'instance-full',eyebrow:'王国は満員',title:'どこへ行っても満員',detail:'別の王国も満員でした。王はハズレ用の待合室へ戻ります。'},{variant:'avatar-error',eyebrow:'王の姿、読込失敗',title:'なおキングが表示されない',detail:'代わりに干からびた仮の王が現れ、敗北を告げました。'},{variant:'portal-refuse',eyebrow:'王だけ入場拒否',title:'転送門に嫌われる',detail:'王冠だけが吸い込まれ、本人はハズレ側に取り残されました。'}],
      revival:[{variant:'respawn',eyebrow:'勝利地点へ再出現',title:'敗北の世界から王が帰還',detail:'青白い輪が画面全体を走り、王が大当たり地点へ現れます。'},{variant:'mirror-break',eyebrow:'鏡を破って帰還',title:'鏡の奥から本物の王',detail:'偽のハズレ像を割り、勝利した王が画面の手前へ飛び出します。'},{variant:'portal-reverse',eyebrow:'転送門が逆回転',title:'出口が入口を飲み込む',detail:'失敗した航路が裏返り、勝利の王国へ直接つながりました。'}]
    }),
    'machine-power-cycle':endingSet({
      normal:[{variant:'clean-boot',eyebrow:'安全設定で起動',title:'通常設定で再起動',detail:'おかしな数値を捨て、しまってあった普通の判定を表示します。'},{variant:'hand-crank',eyebrow:'手回し発電',title:'王がハンドルを回して復帰',detail:'とても遅いですが、王が得意そうなので通常扱いです。'}],
      win:[{variant:'royal-fuse',eyebrow:'金色の電源部品',title:'最後の部品だけが輝く',detail:'すべての灯りが一斉に戻り、大当たりの電源へ直接つながりました。'},{variant:'overcharge',eyebrow:'出力百二十パーセント',title:'再起動の力が上限を突破',detail:'占い機の外まで王国の光があふれ、大当たりを確定表示します。'}],
      loss:[{variant:'wrong-fuse',eyebrow:'配線を間違えた',title:'照明だけが復旧',detail:'リールは戻らず、非常灯がハズレ札だけを照らします。'},{variant:'king-unplug',eyebrow:'王のうっかり',title:'王が電源を抜いていた',detail:'差し直す前に判定終了。王は気づかないふりをしています。'}],
      revival:[{variant:'distant-signal',eyebrow:'遠くに再起動の光',title:'小さな光がこちらへ届く',detail:'完全な無音のあと、王国の全設備が大当たりとして復活します。'},{variant:'bubble-fuse',eyebrow:'たった一つの泡',title:'小さな泡が電源部品へ着地',detail:'最小の青白い光が、世界すべての勝利電源を戻しました。'}]
    }),
    'oracle-ui-collapse':endingSet({
      normal:[{variant:'auto-layout',eyebrow:'自動で整列',title:'画面が勝手に元へ戻る',detail:'深さも位置も正常に戻ったので、普通の結果を表示します。'},{variant:'king-fix',eyebrow:'直った…たぶん',title:'王が一度叩いて直す',detail:'少し曲がっていますが、王が満足しているので通常扱いです。'}],
      win:[{variant:'error-jackpot',eyebrow:'故障が大当たりに',title:'崩れた文字が勝利へ整列',detail:'落下したすべての表示が、巨大な王冠を組み上げます。'},{variant:'seventh-admin',eyebrow:'七体目のサメが操作係',title:'一覧にいないのに画面を操作',detail:'壊れた画面を、金色の勝利仕様で勝手に作り直します。'}],
      loss:[{variant:'css-off',eyebrow:'飾りが消えた',title:'王だけ画面の下へ落下',detail:'表示が戻っても、敗北札だけは中央に残りました。'},{variant:'nan-verdict',eyebrow:'深さの表示が迷子',title:'結果を出す場所が見つからない',detail:'王には直せないため、安全という名目で特殊ハズレにします。'}],
      revival:[{variant:'whole-rewind',eyebrow:'画面を巻き戻す',title:'崩壊を逆再生',detail:'落ちた文字と光が戻り、最後に大当たりの文字を組みます。'},{variant:'royal-refresh',eyebrow:'王の強制再読込',title:'王が画面全体を読み直す',detail:'保存されていたハズレを捨て、勝利した世界へ戻りました。'}]
    }),
    'golden-ocean-jackpot':endingSet({ win:[{variant:'crown-storm',eyebrow:'王冠の嵐',title:'金の海から王冠が降る',detail:'八体のサメが一斉に礼をし、王宮の鐘が深海に響きます。'},{variant:'palace-rise',eyebrow:'王宮が海底から上がる',title:'巨大な王宮が姿を見せる',detail:'塔の窓が順番に光り、中央に勝利の王座が開きます。'},{variant:'royal-current',eyebrow:'金色の海流が集まる',title:'すべての海流が王へ向かう',detail:'集まった光が巨大な王の印になり、一気に広がります。'}] }),
    'fish-celebration-jackpot':endingSet({ win:[{variant:'school-crown',eyebrow:'魚群の王冠',title:'魚たちが巨大王冠を描く',detail:'最後の一匹が頂点へ入り、お祝いの渦が完成します。'},{variant:'fish-parade',eyebrow:'王国の魚パレード',title:'小魚から巨大魚まで大行進',detail:'リールも案内板も波に乗り、何もしていない王を中央へ運びます。'},{variant:'school-burst',eyebrow:'魚群が光へ変わる',title:'群れが無数の泡に弾ける',detail:'画面全体へ散った泡が、大当たりの文字に集まり直します。'}] }),
    'abyss-dawn-jackpot':endingSet({ win:[{variant:'first-ray',eyebrow:'最初の朝日',title:'深海に朝が来る',detail:'無音の闇を青白い光が切り開き、金の王冠だけを照らします。'},{variant:'white-palace',eyebrow:'白く輝く深海',title:'光の中から王宮が現れる',detail:'輪郭しかなかった世界に色が戻り、勝利の海が開きます。'},{variant:'sunrise-school',eyebrow:'朝日の魚行列',title:'光のもとへ魚群が集う',detail:'暗かった画面の隅々まで、お祝いの光が走ります。'}] }),
    'naoking-overload-jackpot':endingSet({ win:[{variant:'thousand-kings',eyebrow:'王、千体に増殖',title:'小さな王が止まらず増える',detail:'全員が別方向へ泳ぎ、最後は巨大な王だけが中央を占拠します。'},{variant:'all-fall-win',eyebrow:'王のドミノ倒し',title:'全員転んで勝利文字になる',detail:'締まりはありませんが、並びだけは完璧な大当たりです。'},{variant:'giant-sneeze',eyebrow:'巨大王のくしゃみ',title:'くしゃみ一発ですべて全開',detail:'表示も魚群も吹き飛び、王冠だけが画面中央へ残ります。'}] })
  });

  const scenes = Object.freeze({
    'seventh-witness':{ image:'assets/characters/naoking-panic.webp', glyph:'07?', signal:['サメの数が合いません','七体目のサメは一覧にいない','リールの枠が左右へ広がっています。'], twist:['王がサメを数えています','全員、同じ顔です','一体だけ急加速し、王を無視して先へ行きました。'] },
    'witness-evacuation':{ image:'assets/characters/naoking-3.webp', glyph:'04', signal:['一体、逃走','リールから飛び出した','残り四体だけで占いを続けます。王の判断です。'], twist:['空席を確認','逃げた先から返事','戻る、休む、別の場所へ行く。まだ結末は分かりません。'] },
    'accordion-reel':{ image:'assets/characters/naoking-2.webp', glyph:'5→6', signal:['リールが変形','占い機が横へ伸びる','今まで隠していた第六列を開きます。'], twist:['中央列を交換','真ん中が入れ替わる','止まったふりをして、すべての列が逆向きに回り始めました。'] },
    'naoking-race':{ image:'assets/characters/naoking-2.webp', glyph:'競走', signal:['なおキング大競走','スタート！','七体の王が深海の直線へ飛び出します。'], twist:['最後の海流','順位が激しく入れ替わる','ゴール、転倒、昼食、逆走。最後は写真で決めます。'] },
    'royal-school-dash':{ image:'assets/characters/naoking-panic.webp', glyph:'00:10', signal:['王、学校へ急げ','遅刻まであと十秒','王冠を落としたまま、校門へ全力で走ります。'], twist:['校門まであと少し','門が閉まり始める','間に合う、休日、学校違い。鐘が鳴ったら判定です。'] },
    'realistic-deep-dive':{ image:'assets/characters/naoking-hero.webp', glyph:'深さ4810', signal:['深さ4810まで潜る','海面を割って深海へ','光、水圧、泡。遠くにある王宮の光へ向かいます。'], twist:['大きな影、接近','影が進む道をふさぐ','敵か案内役か。音のない海底で、次の光を待ちます。'] },
    'portal-panic':{ image:'assets/characters/naoking-panic.webp', glyph:'接続?', signal:['転送門、大混乱','別の世界へ接続','鏡の王が一拍遅れて、本物の王を追いかけます。'], twist:['出口が入れ替わる','出口が別の入口へ','満員、姿が出ない、黄金王宮。王の再出現を待ちます。'] },
    'machine-power-cycle':{ image:'assets/characters/naoking-panic.webp', glyph:'0%', signal:['占い機、停電','一列ずつ完全に消える','水流、泡、音、表示灯がすべて止まりました。'], twist:['非常用の再起動','非常灯と王の手回し修理','普通に戻るか大当たりか。最後のヒューズ次第です。'] },
    'oracle-ui-collapse':{ image:'assets/characters/naoking-panic.webp', glyph:'迷子', signal:['王国画面、崩壊','深さ不明／サメが多すぎる','見出しと文字が重さを失い、画面の下へ落ちていきます。'], twist:['王の雑な修理','王が表示を手で並べ直す','一つずつ元へ戻ります。最後の文字だけ、まだ決まっていません。'] },
    'golden-ocean-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'♛', signal:['金色の海、大当たり','すべての海流が金色に','八体のサメが勝利の光で満たされます。'], twist:['王宮が海底から上がる','巨大な王宮が姿を見せる','すべての窓が光り、王冠の嵐が始まります。'] },
    'fish-celebration-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'∞', signal:['魚群大集合、大当たり','すべての魚が集まる','小魚から巨大な深海魚まで、王冠の形へ並びます。'], twist:['魚群が光へ変わる','群れが無数の泡に弾ける','画面全体へ散り、大当たりの文字に集まり直します。'] },
    'abyss-dawn-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'☼', signal:['深海の夜明け、大当たり','完全な暗闇、完全な無音','遠くに一本だけ、青白い光が現れます。'], twist:['王国最初の朝日','深海に朝が来る','王宮、魚群、王冠を順番に照らします。'] },
    'naoking-overload-jackpot':{ image:'assets/characters/naoking-jackpot.webp', glyph:'×1000', signal:['なおキング大増殖','小さな王が全方向から乱入','七つのリールでも入りきりません。増やしたのは王です。'], twist:['巨大王、接近','最後に大きすぎる王が来る','画面を押し広げ、中央に巨大な王印を置いていきます。'] }
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
