/*
 * ROYAL ORACLE REBIRTH
 * --------------------
 * This is the only roulette controller. Every click freezes one result first;
 * a second, independent draw then chooses how that result is presented. The
 * presentation layer may lie, stall, black out or revive, but it may never
 * replace the frozen title, image, message or effect.
 */
(() => {
  const expansion = window.NaokingOracleExpansion || Object.freeze({});
  const card = document.querySelector('#card');
  const slot = document.querySelector('#slot');
  const reel = document.querySelector('#reel');
  const title = document.querySelector('#fortune-name');
  const message = document.querySelector('#message');
  const resultRegion = document.querySelector('.result');
  const status = document.querySelector('#roulette-status');
  const button = document.querySelector('#spin');
  const blast = document.querySelector('#blast');
  const historyList = document.querySelector('#fortune-history');
  if (!card || !slot || !reel || !title || !message || !status || !button) return;

  if (button.dataset.rouletteBound === 'true') return;
  button.dataset.rouletteBound = 'true';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pageRoot = document.documentElement || null;
  const pageBody = document.body || null;
  const environmentTargets = [pageRoot, pageBody].filter(Boolean);
  const DEFAULT_REEL_TILE_COUNT = 5;
  const MIN_REEL_TILE_COUNT = 4;
  const MAX_REEL_TILE_COUNT = 8;
  const clampReelCount = value => Math.max(MIN_REEL_TILE_COUNT, Math.min(MAX_REEL_TILE_COUNT, Number(value) || DEFAULT_REEL_TILE_COUNT));
  const DEFAULT_BUTTON_HINT = 'HOLD YOUR BREATH';

  function setButtonCopy(label, hint = DEFAULT_BUTTON_HINT) {
    const labelElement = button.querySelector('span');
    const hintElement = button.querySelector('small');
    if (labelElement && hintElement) {
      labelElement.textContent = label;
      hintElement.textContent = hint;
    } else {
      button.textContent = label;
    }
  }

  /* Result data and probability stages remain deliberately unchanged. */
  const normalTemplates = [
    '今日は少しだけ流れがある。使い切るな。', '小さな勝ちを拾える日。落とすなよ。',
    'まあ悪くない。贅沢を言うな。', '運が迷子になっていない。珍事だ。',
    '海流が少し味方している。浅瀬には行くな。', '調子に乗ってもいい。ただし三分までだ。',
    '話が少しだけ通じる日。奇跡だな。', 'やることを一個終わらせろ。それだけで偉い。',
    '勢いはある。方向だけ間違えるな。', '運の機嫌がいい。お前の機嫌は知らん。',
    '判断が冴える。二回目は保証しない。', 'ちょっとだけ褒められる。驚くな。',
    '無駄な寄り道が減る。たぶん。', '小魚よりは上だ。胸を張れ。',
    '自信を持て。根拠は後から探せ。', '追い風を感じたら、ちゃんと泳げ。',
    '今日はお前の番かもしれない。短いけどな。', '面倒が一つ片付く。記念に寝ろ。',
    'その顔でも、今日はなんとかなる。', '周りが少し優しい。期限は今日まで。',
    '小さな願いなら通る。大きいのは知らん。', 'なぜかタイミングが合う。今のうちに動け。',
    '泳ぎ切れ。評価は後でなおキングが決める。', 'やれることからやれ。今日は意外と進む。',
    '遠慮するな。海は広い、たぶん。', '失敗しても沈むな。浮いてこい。',
    '結果より勢いで勝てる日。理屈は後付け。', '背びれの角度だけは完璧だ。',
    '今日は運が少し従順だ。扱いを間違えるな。', '終わりよければ全てよし。途中は知らん。'
  ];
  const normalDefs = [
    ['海の支配者', 'assets/characters/naoking-1.webp', '海が少しだけお前を認めた。'],
    ['背びれ絶好調', 'assets/characters/naoking-2.webp', '背びれの角度が良い。'],
    ['エサ発見', 'assets/characters/naoking-3.webp', 'エサ運だけは期待できる。'],
    ['水槽の主', 'assets/characters/naoking-4.webp', '水槽では王様らしい。'],
    ['小魚メンタル', 'assets/characters/naoking-5.webp', 'ビビっているが、まだ泳げる。'],
    ['浅瀬で迷子', 'assets/characters/naoking-6.webp', '浅瀬で方向を見失った。'],
    ['干からび寸前', 'assets/characters/naoking-7.webp', '干からびる前に水を探せ。'],
    ['深海ぼんやり', 'assets/characters/naoking-sleepy.webp', '眠そうななおキングが判定した。'],
    ['あわあわ警報', 'assets/characters/naoking-panic.webp', 'なおキングが少し慌てている。'],
    ['サメ笑い', 'assets/characters/naoking-laugh.webp', 'なおキングは何かを笑っている。']
  ];
  const makeNormal = ([resultTitle, image, prefix]) => ({
    kind: 'normal', key: resultTitle, title: resultTitle, image,
    messages: normalTemplates.map(text => `${prefix} ${text}`), effect: 'normal', duration: 1700
  });
  const normalResults = normalDefs.map(makeNormal);

  const winResults = [
    { key:'rainbow', kind:'win', title:'虹色の支配者', image:'assets/characters/naoking-jackpot.webp', effect:'rainbow', duration:2350, messages:[
      '虹が海底まで届いた。今日は王の客人として扱ってやる。','王冠が鳴った。お前、まさか本当に当てるとはな。','海が七色に割れた。運を使い切る前に深呼吸しろ。','なおキングが立ち上がった。これはかなり珍しい。','虹色判定。お前の背びれ、今だけ神々しいぞ。'
    ]},
    { key:'crown', kind:'win', title:'王冠落下大当たり', image:'assets/characters/naoking-jackpot.webp', effect:'crown', duration:2400, messages:[
      '王冠が空から落ちてきた。避けなかったお前の勝ちだ。','落下した王冠が判定を直撃。これは文句なしの大当たり。','なおキングの王冠が増えた。一本はお前の運だ。','上を見ろ。王冠と幸運が同時に落ちてきた。','王冠落下演出。お前、今日だけは選ばれた側だ。'
    ]},
    { key:'revival', kind:'win', title:'逆転・王冠大当たり', image:'assets/characters/naoking-jackpot.webp', effect:'revival', duration:2850, messages:[
      '外れたと思った？ 甘いな。海底から逆転大当たりだ。','沈んだ判定が浮上した。なおキングの気まぐれ復活。','終了演出からの王冠。心臓に悪いだろ、これ。','絶望の一拍後、虹が来た。お前、持ってるじゃん。','王が判定をひっくり返した。理由は聞くな。'
    ]},
    { key:'comet', kind:'win', title:'流星王国ボーナス', image:'assets/characters/naoking-jackpot.webp', effect:'comet', duration:2150, messages:[
      '海を横切る流星が、お前の運を撃ち抜いた。','金色の流星がなおキングの背びれをかすめた。吉だ。','流星演出。願いを言う前に当たってしまったな。','王国上空から幸運が落ちてきた。拾え。','海底なのに流星。理屈はないが大当たりだ。'
    ]},
    { key:'abyss', kind:'win', title:'深海照射大当たり', image:'assets/characters/naoking-jackpot.webp', effect:'abyss', duration:2200, messages:[
      '深海の光が選んだ。静かに強い大当たりだ。','海底のサーチライトが、お前だけを照らしている。','深海モードからの特別判定。今日は少し誇れ。','見つかったな。なおキング王国の優良海民だ。','暗い場所ほど、当たりは派手に見える。'
    ]}
  ];
  const lossResults = [
    { key:'dry', kind:'loss', title:'干からびた横取り', image:'assets/characters/naoking-7.webp', effect:'dry', duration:2050, messages:[
      '干からびたなおキングが画面外から来て、当たりを持っていった。悲しいな。','当たりはあった。だが干からびたサメが先に食べた。','大当たり寸前で干からび乱入。運は乾いた。','王冠の代わりに干からびが来た。受け入れろ。','当たりを信じたお前が悪い。干からびたなおキングより。'
    ]},
    { key:'blackout', kind:'loss', title:'深海暗転ハズレ', image:'assets/characters/naoking-6.webp', effect:'blackout', duration:1950, messages:[
      '大当たりっぽい暗転からのハズレ。お前のドキドキを返せ。','暗転しただけだった。判定は海流に流された。','期待させておいて通信断。なおキングは昼寝に入った。','深海の正体はハズレ。お前のドキドキを返せ。','大当たりっぽい暗転からの結果なし。海は冷たい。'
    ]},
    { key:'net', kind:'loss', title:'網にかかった運', image:'assets/characters/naoking-panic.webp', effect:'net', duration:2050, messages:[
      '巨大な網が画面外から来て、運をさらっていった。','運勢が網に引っかかった。助ける気はない。','いい流れだったのに、網が全部止めた。海あるあるだ。','当たりの気配は網に回収された。次の海流を待て。','網だけは派手だった。結果はハズレだ。'
    ]},
    { key:'alarm', kind:'loss', title:'緊急帰還', image:'assets/characters/naoking-5.webp', effect:'alarm', duration:1950, messages:[
      '赤い警報が鳴ったので、なおキングは判定を中止した。','危険海域につき本日の運勢は撤収。お前も帰れ。','警報だけ派手で結果はハズレ。期待させるな。','サイレンが全部持っていった。今日は静かにしろ。','緊急帰還。運勢より避難を優先したらしい。'
    ]},
    { key:'drain', kind:'loss', title:'水位低下', image:'assets/characters/naoking-7.webp', effect:'drain', duration:1950, messages:[
      '水位と期待値が同時に下がった。悲しいな。','画面の明かりが消え、水だけが引いた。残ったのはハズレ。','運が蒸発した。干からびる前に諦めろ。','暗い、乾いた、ハズレた。三拍子そろった。','水位低下演出。お前の運も一緒に引いていった。'
    ]}
  ];

  const allResults = [...normalResults, ...winResults, ...lossResults];
  const resultByKey = new Map(allResults.map(result => [result.key, result]));
  const messageBags = new Map();
  const lastMessageByResult = new Map();
  const normalHistory = [];
  let spinsSinceWin = 0;

  function shuffledBag(result) {
    const key = result.key;
    let bag = messageBags.get(key);
    if (!bag || bag.length === 0) {
      bag = [...result.messages];
      for (let index = bag.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
      }
      if (bag.length > 1 && bag[bag.length - 1] === lastMessageByResult.get(key)) {
        [bag[bag.length - 1], bag[0]] = [bag[0], bag[bag.length - 1]];
      }
      messageBags.set(key, bag);
    }
    const nextMessage = bag.pop();
    lastMessageByResult.set(key, nextMessage);
    return nextMessage;
  }

  function chooseNormal() {
    const candidates = normalResults.filter(result => result.key !== normalHistory[0]);
    const weights = candidates.map(result => normalHistory.includes(result.key) ? 0.22 : 1);
    const total = weights.reduce((sum, value) => sum + value, 0);
    let cursor = Math.random() * total;
    let chosen = candidates[candidates.length - 1];
    for (let index = 0; index < candidates.length; index += 1) {
      cursor -= weights[index];
      if (cursor <= 0) { chosen = candidates[index]; break; }
    }
    normalHistory.unshift(chosen.key);
    normalHistory.splice(3);
    return chosen;
  }

  function chooseFinalResult() {
    if (spinsSinceWin >= 7) {
      spinsSinceWin = 0;
      return winResults[0];
    }
    const roll = Math.random();
    let result;
    if (roll < 0.10) result = lossResults[Math.floor(roll / 0.02)];
    else if (roll < 0.24) result = winResults[Math.floor((roll - 0.10) / 0.028)];
    else result = chooseNormal();
    spinsSinceWin = result.kind === 'win' ? 0 : spinsSinceWin + 1;
    return result;
  }

  function resolveFinalResult() {
    const template = chooseFinalResult();
    return Object.freeze({
      kind: template.kind, key: template.key, title: template.title, image: template.image,
      message: shuffledBag(template), effect: template.effect, duration: template.duration
    });
  }

  /* Presentation routes are genuinely different ideas, not palette swaps. */
  const presentationRoutes = Object.freeze([
    { id:'quiet-tide', family:'normal', category:'environment', cutin:false, kinds:['normal'], weight:1.45, tier:'normal', world:'quiet', motion:'cascade', duration:3900, cue:'QUIET TIDE', detail:'静かな海流が五つの証言を運ぶ。' },
    { id:'pearl-procession', family:'normal', category:'environment', cutin:false, kinds:['normal'], weight:1.15, tier:'normal', world:'pearls', motion:'outside-in', duration:4050, cue:'PEARL PROCESSION', detail:'微細な真珠泡が順番を決める。' },
    { id:'sonar-five', family:'normal', category:'reel-event', cutin:false, kinds:['normal'], weight:1.1, tier:'signal', world:'sonar', motion:'center-last', duration:4200, cue:'FIVEFOLD SONAR', detail:'五回の反響から本命を探知。' },
    { id:'crown-shadow', family:'normal', category:'text-cutin', kinds:['normal'], weight:.34, tier:'signal', world:'shadow', motion:'edge-first', duration:4300, cue:'CROWN SHADOW', detail:'王冠の影だけが先に通過した。', fake:true },
    { id:'biolume-drift', family:'normal', category:'environment', cutin:false, kinds:['normal'], weight:1.18, tier:'normal', world:'biolume', motion:'wave', duration:4000, cue:'BIOLUME DRIFT', detail:'発光する海流が判定を撫でていく。' },
    { id:'depth-skip', family:'normal', category:'text-cutin', kinds:['normal'], weight:.30, tier:'signal', world:'depth', motion:'skip', duration:4250, cue:'DEPTH SKIP', detail:'深度計が一層だけ飛んだ。結果はまだ普通だ。' },
    { id:'court-whisper', family:'normal', category:'rule-change', cutin:false, kinds:['normal'], weight:1.12, tier:'normal', world:'whisper', motion:'whisper', duration:3950, cue:'COURT WHISPER', detail:'宮廷の小声が停止順を変えた。' },
    { id:'blue-hour', family:'normal', category:'text-cutin', kinds:['normal'], weight:.38, tier:'normal', world:'blue-hour', motion:'synchronous', duration:4100, cue:'BLUE HOUR', detail:'海が青白く静まり、五枚が同時に息をする。' },
    { id:'false-crown', family:'false-signal', kinds:['normal'], weight:.46, tier:'hot', world:'false-crown', motion:'center-last', duration:4750, cue:'CROWN SIGNAL?', detail:'王冠信号を検知。……一秒後、何事もなく消えた。', fake:true, freeze:true },
    { id:'sleeping-king', family:'intrusion', category:'intrusion', cutin:false, kinds:['normal'], weight:.5, tier:'signal', world:'sleep', motion:'lazy', duration:4400, cue:'SLEEPING KING', detail:'眠い王が画面外から一度だけ覗く。', intrusion:'sleepy' },
    { id:'royal-lunch-break', family:'chaos', kinds:['normal'], weight:.42, tier:'signal', world:'lunch', motion:'lazy', duration:7800, cue:'ROYAL LUNCH BREAK', detail:'判定中だが、王が先に昼食を始めた。', scene:'lunch', sequence:'chaos', twistMotion:'brake' },
    { id:'abyss-news-break', family:'broadcast', kinds:['normal'], weight:.38, tier:'signal', world:'news', motion:'synchronous', duration:7800, cue:'ABYSS NEWS 4810', detail:'速報「神託は、まだ回っています」。', scene:'news', sequence:'broadcast', twistMotion:'cruise' },
    { id:'emergency-council', family:'rule-change', kinds:['normal'], weight:.3, tier:'hot', world:'council', motion:'witnesses', duration:8500, cue:'EMERGENCY COUNCIL', detail:'三枚の布告が揉め、王の木槌で停止順を決める。', scene:'council', sequence:'tribunal', twistMotion:'stopping' },
    { id:'sixth-witness', family:'rule-change', kinds:['normal'], weight:.26, tier:'hot', world:'sixth', motion:'center-last', duration:8300, cue:'SIXTH WITNESS?', detail:'呼んでいない六枚目が証言席へ割り込む。', scene:'sixth', sequence:'anomaly', twistMotion:'respin' },
    { id:'reel-labor-strike', family:'chaos', kinds:['normal'], weight:.34, tier:'signal', world:'strike', motion:'lazy', duration:8200, cue:'REEL ON BREAK', detail:'第三証人が「休憩中」の札を出した。', scene:'strike', sequence:'breakdown', twistMotion:'respin' },
    { id:'giant-fish-traffic', family:'environment', kinds:['normal'], weight:.36, tier:'signal', world:'giant-fish', motion:'wave', duration:7600, cue:'UNSCHEDULED TRAFFIC', detail:'ルーレットとは無関係な巨大魚が通過する。', scene:'giant-fish', sequence:'passage', twistMotion:'anticipation' },
    { id:'royal-commercial', family:'broadcast', kinds:['normal'], weight:.3, tier:'signal', world:'commercial', motion:'skip', duration:7900, cue:'A WORD FROM THE KING', detail:'突然、王国海藻のCMが始まる。買わなくていい。', scene:'commercial', sequence:'broadcast', twistMotion:'brake' },
    { id:'do-not-press-seal', family:'interactive', kinds:['normal'], weight:.22, tier:'hot', world:'royal-seal', motion:'edge-first', duration:8400, cue:'DO NOT PRESS', detail:'押すなと言われた王印が、こちらを見ている。', scene:'royal-seal', sequence:'interactive', twistMotion:'respin', interactive:true },

    { id:'deep-sea-duel', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.48, tier:'hot', world:'duel', motion:'witnesses', duration:8600, cue:'DEEP-SEA DUEL', detail:'二つの影が王国中央で激突。勝敗は最後まで確定しない。', scene:'duel', sequence:'battle', twistMotion:'brake', audioScene:'battle' },
    { id:'crown-chase', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.46, tier:'hot', world:'crown-chase', motion:'push', duration:8500, cue:'CROWN CHASE', detail:'逃げる王冠を全証人で追跡。捕まるかはまだ分からない。', scene:'crown-chase', sequence:'pursuit', twistMotion:'respin', audioScene:'chase' },
    { id:'royal-trial', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.44, tier:'hot', world:'royal-trial', motion:'witnesses', duration:8800, cue:'ROYAL TRIAL', detail:'王国法廷が開廷。評決は最後の一枚まで伏せられる。', scene:'royal-trial', sequence:'trial', twistMotion:'stopping', audioScene:'court' },
    { id:'crown-goal-challenge', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.24, tier:'hot', world:'crown-goal', motion:'push', duration:10100, cue:'CROWN GOAL CHALLENGE', detail:'王冠を一投。ポストの先に何が待つかは、静止画判定まで分からない。', scene:'crown-goal', sequence:'sports', twistMotion:'brake', audioScene:'sports' },
    { id:'abyss-news-live', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.20, tier:'hot', world:'news-live', motion:'synchronous', duration:9700, cue:'ABYSS NEWS LIVE', detail:'王冠行方不明の現場とスタジオを緊急接続。速報の結末は未確認。', scene:'news-live', sequence:'news-event', twistMotion:'respin', audioScene:'news' },
    { id:'royal-commercial-takeover', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.18, tier:'signal', world:'commercial-takeover', motion:'skip', duration:9900, cue:'ROYAL COMMERCIAL', detail:'音の出ない王笛のCMが、神託を勝手に占拠した。', scene:'commercial-takeover', sequence:'commercial-event', twistMotion:'brake', audioScene:'commercial' },
    { id:'oracle-repair-disaster', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.22, tier:'hot', world:'repair-disaster', motion:'breakdown', duration:10200, cue:'ORACLE REPAIR DISASTER', detail:'装置を全部分解したあと、王の手元に一本だけネジが余る。', scene:'repair-disaster', sequence:'repair-event', twistMotion:'reverse', audioScene:'repair' },
    { id:'judgment-abandoned', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.19, tier:'hot', world:'abandon', motion:'lazy', duration:10400, cue:'JUDGMENT ABANDONED', detail:'なおキングは定時を理由に神託を放棄。装置も海も沈み始める。', scene:'abandon', sequence:'abandon-event', twistMotion:'stopping', audioScene:'abandon' },
    { id:'cctv-result-chase', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.23, tier:'hot', world:'cctv-chase', motion:'push', duration:10300, cue:'RESULT ENVELOPE ESCAPED', detail:'判決入り封筒が王国全域へ逃走。監視カメラが追跡を開始した。', scene:'cctv-chase', sequence:'surveillance', twistMotion:'respin', audioScene:'chase' },
    { id:'royal-lunch-show', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.17, tier:'signal', world:'lunch-show', motion:'lazy', duration:9800, cue:'THE KING IS EATING', detail:'Rouletteを片付け、王の昼食番組が突然始まった。', scene:'lunch-show', sequence:'banquet', twistMotion:'brake', audioScene:'lunch' },
    { id:'council-deadlock', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.18, tier:'hot', world:'council-deadlock', motion:'witnesses', duration:10100, cue:'ROYAL COUNCIL DEADLOCK', detail:'全証人の意見が食い違い、王だけが議題を聞いていない。', scene:'council-deadlock', sequence:'council-event', twistMotion:'stopping', audioScene:'court' },
    { id:'upside-down-kingdom', family:'chaos', category:'chaos-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.22, tier:'hot', world:'upside-down', motion:'reverse', duration:9600, cue:'GRAVITY AUDIT', detail:'王国の重力監査。Pageが反転し、UIが天井へ落ちていく。', scene:'upside-down', sequence:'gravity-event', twistMotion:'reverse', audioScene:'gravity' },
    { id:'giant-naoking-inspection', family:'chaos', category:'chaos-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.22, tier:'hot', world:'giant-naoking', motion:'outside-in', duration:9400, cue:'GIANT KING INSPECTION', detail:'巨大なおキングが背景から接近。判定装置を顔だけで検査する。', scene:'giant-naoking', sequence:'giant-event', twistMotion:'brake', audioScene:'giant' },

    { id:'royal-intrusion', family:'intrusion', kinds:['win'], weight:1.15, tier:'superhot', world:'royal', motion:'push', duration:5200, cue:'THE KING INTERVENES', detail:'なおキングが五枚目を自分で押し込む。', intrusion:'king' },
    { id:'palace-floodlights', family:'environment', kinds:['win'], weight:1.05, tier:'superhot', world:'floodlights', motion:'outside-in', duration:5000, cue:'PALACE FLOODLIGHTS', detail:'宮殿の光がサイト全体から一点へ集まる。' },
    { id:'reel-reversal', family:'reel-event', kinds:['win'], weight:.92, tier:'hot', world:'reverse', motion:'reverse', duration:5350, cue:'CURRENT REVERSAL', detail:'停止寸前、海流とリールが逆転する。', reversal:true },
    { id:'abyss-constellation', family:'environment', kinds:['win'], weight:.82, tier:'superhot', world:'constellation', motion:'center-last', duration:5400, cue:'ABYSS CONSTELLATION', detail:'気泡が王冠座を作り、中央証言を指す。' },
    { id:'crown-lock', family:'reel-event', kinds:['win'], weight:.88, tier:'superhot', world:'crown-lock', motion:'edge-first', duration:5250, cue:'ROYAL FREEZE', detail:'全世界が凍結し、王冠だけが動く。', freeze:true },
    { id:'tidal-ascension', family:'environment', kinds:['win'], weight:1.08, tier:'hot', world:'ascension', motion:'wave', duration:4900, cue:'TIDAL ASCENSION', detail:'上向きの海流が装置を持ち上げる。' },
    { id:'five-witnesses', family:'rule-change', kinds:['win'], weight:1.2, tier:'hot', world:'tribunal', motion:'witnesses', duration:5050, cue:'FIVE WITNESSES', detail:'五人の証言を一枚ずつ採決する。' },
    { id:'reel-jam-repair', family:'reel-event', kinds:['win'], weight:.56, tier:'superhot', world:'repair', motion:'edge-first', duration:9000, cue:'ROYAL MAINTENANCE', detail:'噛んだ証人を、王が雑な木槌で直して再始動。', scene:'repair', sequence:'breakdown', twistMotion:'reverse', intrusion:'king' },
    { id:'surface-breach', family:'environment', kinds:['win'], weight:.52, tier:'superhot', world:'surface', motion:'wave', duration:8800, cue:'SURFACE BREACH', detail:'神託装置ごと海面へ急浮上し、もう一度潜る。', scene:'surface', sequence:'journey', twistMotion:'reverse' },
    { id:'witness-escape', family:'intrusion', kinds:['win'], weight:.46, tier:'hot', world:'escape', motion:'push', duration:8800, cue:'WITNESS ESCAPED', detail:'証人が王冠を咥えて筐体外へ逃げ、戻ってくる。', scene:'escape', sequence:'chase', twistMotion:'respin', intrusion:'king' },

    { id:'dry-shark-theft', family:'intrusion', kinds:['loss'], weight:1.2, tier:'fake-loss', world:'dry', motion:'theft', duration:4750, cue:'VERDICT STOLEN', detail:'干からびた王が当たり札だけ持ち去る。', intrusion:'dry', fake:true },
    { id:'power-failure', family:'blackout', kinds:['loss'], weight:1.05, tier:'fake-loss', world:'blackout', motion:'power-cut', duration:4800, cue:'POWER FAILURE', detail:'装置も海流も消え、非常灯だけが残る。', blackout:true, freeze:true },
    { id:'crown-sink', family:'environment', kinds:['loss'], weight:1.08, tier:'fake-loss', world:'crown-sink', motion:'outside-in', duration:4550, cue:'THE CROWN SINKS', detail:'王冠だけが静かに結果より深く沈む。' },
    { id:'fish-confiscation', family:'intrusion', kinds:['loss'], weight:.92, tier:'fake-loss', world:'fish', motion:'edge-first', duration:4650, cue:'EVIDENCE CONFISCATED', detail:'小魚の群れが判定資料を回収した。', intrusion:'fish' },
    { id:'undertow-ejection', family:'environment', kinds:['loss'], weight:1.0, tier:'fake-loss', world:'undertow', motion:'reverse', duration:4700, cue:'UNDERTOW', detail:'逆流が五枚の証言を画面外へ流す。', reversal:true },
    { id:'cold-court', family:'typography', kinds:['loss'], weight:1.08, tier:'fake-loss', world:'cold', motion:'synchronous', duration:4450, cue:'CASE DISMISSED', detail:'宮廷システムが一行だけで冷たく棄却。' },
    { id:'depth-collapse', family:'typography', kinds:['loss'], weight:.95, tier:'fake-loss', world:'depth-collapse', motion:'skip', duration:4750, cue:'DEPTH // -99999', detail:'深度表示が壊れ、判定も海底へ落ちる。' },
    { id:'cardboard-crown', family:'false-signal', kinds:['loss'], weight:.66, tier:'fake-loss', world:'cardboard', motion:'center-last', duration:8200, cue:'PREMIUM CROWN?', detail:'大当たり風の王冠が着地し、段ボールだと判明する。', scene:'cardboard', sequence:'fake-object', twistMotion:'brake', fake:true },
    { id:'cracked-kingdom-tank', family:'power-failure', kinds:['loss'], weight:.55, tier:'fake-loss', world:'cracked-tank', motion:'power-cut', duration:8500, cue:'PRESSURE LEAK', detail:'王国水槽にひび。王が雑なテープを貼って終了する。', scene:'cracked-tank', sequence:'breakdown', twistMotion:'stopping', blackout:true, freeze:true },

    { id:'crown-defibrillator', family:'revival', kinds:['win'], effects:['revival'], weight:1.15, tier:'revival', world:'defibrillator', motion:'center-last', duration:6500, cue:'CROWN DEFIBRILLATOR', detail:'停止した海へ王冠が一撃。世界が再起動する。', fake:true, freeze:true },
    { id:'oracle-rewind', family:'revival', kinds:['win'], effects:['revival'], weight:1.0, tier:'revival', world:'rewind', motion:'reverse', duration:6700, cue:'ORACLE REWIND', detail:'敗北の一秒を海流ごと巻き戻す。', fake:true, reversal:true },
    { id:'king-return', family:'revival', kinds:['win'], effects:['revival'], weight:.9, tier:'revival', world:'king-return', motion:'push', duration:6400, cue:'THE KING RETURNS', detail:'帰ったはずのなおキングが結果を裏返す。', fake:true, intrusion:'king' },
    { id:'light-reboot', family:'revival', kinds:['win'], effects:['revival'], weight:1.05, tier:'revival', world:'reboot', motion:'outside-in', duration:6600, cue:'KINGDOM REBOOT', detail:'非常灯から順に王国の光が蘇る。', fake:true, blackout:true },
    { id:'verdict-book-reversal', family:'revival', kinds:['win'], effects:['revival'], weight:.62, tier:'revival', world:'verdict-book', motion:'reverse', duration:9000, cue:'THE CLOSED VERDICT', detail:'敗北判定書が閉じ、王冠のしおりから逆向きに開く。', scene:'verdict-book', sequence:'book-revival', twistMotion:'reverse', fake:true, freeze:true },
    { id:'single-golden-bubble', family:'revival', kinds:['win'], effects:['revival'], weight:.58, tier:'revival', world:'golden-bubble', motion:'center-last', duration:9500, cue:'ONE BUBBLE REMAINS', detail:'完全停止した海で、金の一泡だけが戻ってくる。', scene:'golden-bubble', sequence:'silent-revival', twistMotion:'revival', fake:true, blackout:true, freeze:true },
    { id:'abyssal-blackout-revival', family:'revival', kinds:['win'], effects:['revival'], weight:.46, tier:'extreme', world:'abyssal-restart', motion:'power-cut', duration:10500, cue:'ABYSSAL POWER FAILURE', detail:'海も光も止まり、遠くの信号だけが残る。', premium:true, fake:true, blackout:true, freeze:true },

    { id:'royal-audience', family:'premium', kinds:['win'], effects:['rainbow','crown','abyss'], weight:.16, tier:'extreme', world:'audience', motion:'witnesses', duration:11000, cue:'ROYAL CORONATION', detail:'筐体が王座へ組み替わり、五証人が一枚ずつ礼をする。', premium:true, intrusion:'king', freeze:true, scene:'coronation', sequence:'coronation', twistMotion:'stopping' },
    { id:'golden-tide', family:'premium', kinds:['win'], effects:['rainbow','crown'], weight:.14, tier:'extreme', world:'golden-tide', motion:'wave', duration:6800, cue:'GOLDEN TIDE', detail:'金の海流がページの端から端まで満ちる。', premium:true },
    { id:'secret-4810', family:'secret', kinds:['win'], weight:.09, tier:'extreme', world:'secret-4810', motion:'skip', duration:11600, cue:'DEPTH 4810 // VAULT', detail:'四個の封印が順に外れ、金庫から寝た王が結果を押し出す。', premium:true, blackout:true, scene:'vault-4810', sequence:'vault', twistMotion:'respin' },
    { id:'palace-open', family:'premium', kinds:['win'], effects:['rainbow','comet'], weight:.13, tier:'extreme', world:'palace-open', motion:'outside-in', duration:7000, cue:'THE PALACE OPENS', detail:'背景の海が割れ、その奥に王宮の光が現れる。', premium:true, freeze:true },
    { id:'pixel-palace-bonus', family:'premium', category:'premium', kinds:['win'], effects:['rainbow','crown','comet','abyss'], weight:.08, tier:'extreme', world:'pixel-palace', motion:'skip', duration:11200, cue:'ROYAL 8-BIT PALACE', detail:'神託が低解像度の王宮ゲームへ変換。王冠ゲートを開いて帰還する。', premium:true, freeze:true, scene:'pixel-palace', sequence:'pixel-palace', twistMotion:'respin', audioScene:'pixel' },
    ...(expansion.routes || [])
  ].map(route => Object.freeze(route)));

  const routeById = new Map(presentationRoutes.map(route => [route.id, route]));
  const presentationHistory = [];
  const presentationCategoryHistory = [];
  const sealEndingSet = sets => Object.freeze(Object.fromEntries(Object.entries(sets).map(([outcome, entries]) => [
    outcome, Object.freeze(entries.map(entry => Object.freeze({ ...entry })))
  ])));
  const eventEndings = Object.freeze({
    'deep-sea-duel':Object.freeze({
      normal:Object.freeze([
        Object.freeze({ eyebrow:'DRAW', title:'両者、同時に離脱', detail:'勝者なし。海流だけが静かに戻りました。' }),
        Object.freeze({ eyebrow:'TIME UP', title:'決着は次の潮へ', detail:'鐘が鳴り、勝負は判定保留になりました。' })
      ]),
      win:Object.freeze([
        Object.freeze({ eyebrow:'ROYAL STRIKE', title:'王冠の一撃、命中', detail:'なおキング側の勝利。海が金色に沸き立ちます。' }),
        Object.freeze({ eyebrow:'VICTORY', title:'深海王、制圧', detail:'最後の反撃が決まり、王国旗が上がりました。' })
      ]),
      loss:Object.freeze([
        Object.freeze({ eyebrow:'DEFEAT', title:'王冠、海底へ', detail:'挑戦者の一撃で、判定はハズレへ沈みました。' }),
        Object.freeze({ eyebrow:'KNOCK OUT', title:'なおキング、転がる', detail:'間の抜けた顔のまま場外へ流されました。' })
      ]),
      revival:Object.freeze([
        Object.freeze({ eyebrow:'LAST COUNTER', title:'倒れた王が反撃', detail:'敗北寸前から王冠が再点火。JACKPOTへ逆転します。' }),
        Object.freeze({ eyebrow:'ROYAL REVIVAL', title:'海底から再参戦', detail:'終わったはずの決闘が、王の一撃でひっくり返りました。' })
      ])
    }),
    'crown-chase':Object.freeze({
      normal:Object.freeze([Object.freeze({ eyebrow:'DECOY', title:'偽物の王冠でした', detail:'追跡は終了。結果は通常航路へ戻ります。' }), Object.freeze({ eyebrow:'LOST SIGNAL', title:'曲がり角で見失う', detail:'王冠信号は消え、静かな判定だけが残りました。' })]),
      win:Object.freeze([Object.freeze({ eyebrow:'CAUGHT', title:'王冠を確保', detail:'全証人の連携で捕獲成功。祝勝信号が走ります。' }), Object.freeze({ eyebrow:'ROYAL RETURN', title:'王冠、自分から戻る', detail:'追いつく直前、王の頭へきれいに着地しました。' })]),
      loss:Object.freeze([Object.freeze({ eyebrow:'ESCAPED', title:'王冠は画面外へ', detail:'最後の角を曲がり、ハズレ札だけが残りました。' }), Object.freeze({ eyebrow:'WRONG TARGET', title:'追っていたのは海藻', detail:'王冠は別方向でした。王がしょんぼりしています。' })]),
      revival:Object.freeze([Object.freeze({ eyebrow:'SIGNAL RESTORED', title:'消えた王冠が急旋回', detail:'敗北判定を飛び越え、JACKPOTの位置へ帰還します。' }), Object.freeze({ eyebrow:'KING RETURNS', title:'王が王冠ごと乱入', detail:'追跡終了の暗転から、逆方向へ突っ込んできました。' })])
    }),
    'royal-trial':Object.freeze({
      normal:Object.freeze([Object.freeze({ eyebrow:'ADJOURNED', title:'本日は休廷', detail:'判決は出ず、通常の神託だけを採用します。' }), Object.freeze({ eyebrow:'NO VERDICT', title:'証言が同数', detail:'王の木槌も迷い、穏当な判定に落ち着きました。' })]),
      win:Object.freeze([Object.freeze({ eyebrow:'NOT GUILTY', title:'王国より褒賞', detail:'無罪判決と同時に、勝利の王印が押されました。' }), Object.freeze({ eyebrow:'ROYAL DECREE', title:'特別勝訴', detail:'最後の証言で評決が反転し、祝砲が鳴ります。' })]),
      loss:Object.freeze([Object.freeze({ eyebrow:'GUILTY', title:'判決、ハズレ', detail:'冷たい木槌の一打で、全証言が閉じました。' }), Object.freeze({ eyebrow:'CASE DISMISSED', title:'申立て却下', detail:'王国法典の端に、小さく敗訴と記されています。' })]),
      revival:Object.freeze([Object.freeze({ eyebrow:'OBJECTION', title:'最終証言で再審', detail:'確定寸前の敗訴が破棄され、JACKPOT判決へ変わります。' }), Object.freeze({ eyebrow:'OVERRULED', title:'王が判決を撤回', detail:'閉廷後になおキングが戻り、勝訴の印を押しました。' })])
    }),
    'crown-goal-challenge':sealEndingSet({
      normal:[{ variant:'post', eyebrow:'ON THE POST', title:'王冠、ポストで停止', detail:'入っても外れてもいないので、通常判定へ戻ります。' },{ variant:'walkout', eyebrow:'NO THROW', title:'王が投げずに帰る', detail:'構えだけは完璧でした。競技委員が通常判定を採用します。' }],
      win:[{ variant:'goal', eyebrow:'ROYAL GOAL', title:'王冠、ゴール中央へ', detail:'海底スタンドが揺れ、勝利信号が一斉に点灯します。' },{ variant:'keeper-own-goal', eyebrow:'OWN GOAL', title:'守護魚が自分で押し込む', detail:'なおキングは何もしていませんが、得点として認められました。' }],
      loss:[{ variant:'miss', eyebrow:'WIDE', title:'王冠、画面外へ', detail:'長い助走の末、ゴールだけをきれいに避けました。' },{ variant:'keeper', eyebrow:'SAVED', title:'小魚Keeperが完全捕球', detail:'王は抗議していますが、映像判定も明確なハズレです。' }],
      revival:[{ variant:'bounce-goal', eyebrow:'POST → GOAL', title:'跳ね返った王冠が逆転入場', detail:'外れたと思った一拍後、逆側のポストからJACKPOTへ。' },{ variant:'late-goal', eyebrow:'AFTER THE WHISTLE', title:'遅れて来た泡が押し込む', detail:'競技終了の静寂を破り、王冠が最後の一線を越えました。' }]
    }),
    'abyss-news-live':sealEndingSet({
      normal:[{ variant:'weather', eyebrow:'WEATHER DESK', title:'結局、深度の天気予報', detail:'王冠速報は保留。穏やかな通常潮が続く見込みです。' },{ variant:'no-update', eyebrow:'NO UPDATE', title:'新情報はありません', detail:'現場記者も困り、静かな神託へ戻しました。' }],
      win:[{ variant:'breaking-win', eyebrow:'BREAKING JACKPOT', title:'王冠、Studioへ帰還', detail:'中継映像を突き破り、勝利速報がPage全体を占拠します。' },{ variant:'ticker-win', eyebrow:'EXTRA EDITION', title:'Tickerが勝利文へ変形', detail:'流れていた文字が整列し、王国史上最速の号外になりました。' }],
      loss:[{ variant:'signal-lost', eyebrow:'SIGNAL LOST', title:'中継、ハズレ地点で途絶', detail:'テスト画面に残ったのは、しょんぼりした王だけでした。' },{ variant:'fake-crown', eyebrow:'CORRECTION', title:'発見物は海藻でした', detail:'速報を訂正します。王冠ではなく長めの海藻です。' }],
      revival:[{ variant:'correction-win', eyebrow:'URGENT CORRECTION', title:'ハズレ速報を全面訂正', detail:'別Cameraの王冠映像が届き、JACKPOTへ差し替わります。' },{ variant:'studio-crash', eyebrow:'LIVE INTRUSION', title:'王がStudioへ突入', detail:'放送終了の直前、勝利札を持った王が画面を破りました。' }]
    }),
    'royal-commercial-takeover':sealEndingSet({
      normal:[{ variant:'silent-flute', eyebrow:'PRODUCT TEST', title:'王笛は本当に無音', detail:'盛大に構えましたが何も鳴らず、通常判定だけ残りました。' },{ variant:'sold-out', eyebrow:'SOLD OUT?', title:'まだ売っていません', detail:'問い合わせ先も存在しないので神託へ戻ります。' }],
      win:[{ variant:'jingle-win', eyebrow:'BUY ONE / WIN ONE', title:'極小Jingleから大当たり', detail:'一音だけの広告が、なぜか王宮級の勝利へ膨らみました。' },{ variant:'disclaimer-win', eyebrow:'LIMITED OFFER', title:'注意書きがJACKPOTへ拡大', detail:'画面下の小さな一行が、王国全体を覆う勝利文になります。' }],
      loss:[{ variant:'refund', eyebrow:'NO REFUNDS', title:'運勢の返品は不可', detail:'箱を開けたらハズレ札だけ。保証書は海水で読めません。' },{ variant:'weak-beep', eyebrow:'DEMO FAILED', title:'弱いBeepでCM終了', detail:'王が気まずそうに退場し、そのままハズレです。' }],
      revival:[{ variant:'director-cut', eyebrow:'DIRECTOR\'S CUT', title:'「CUT」のあと壁が崩れる', detail:'撮影Setの裏から本物のJACKPOT宮殿が現れました。' },{ variant:'dream-offer', eyebrow:'ONE MORE OFFER', title:'放送終了後に王が戻る', detail:'売れ残った王冠を押し込み、勝利扱いに変更しました。' }]
    }),
    'oracle-repair-disaster':sealEndingSet({
      normal:[{ variant:'one-screw', eyebrow:'ONE SCREW LEFT', title:'一本余ったが動いている', detail:'触らない方が良さそうなので通常判定で封印します。' },{ variant:'tape', eyebrow:'TEMPORARY FIX', title:'海藻Tapeで応急処置', detail:'見た目は悪いですが、神託は平常運転へ戻りました。' }],
      win:[{ variant:'fix', eyebrow:'SYSTEM RESTORED', title:'余ったネジが王室Key', detail:'最後の穴へ入れた瞬間、勝利回路が完全起動しました。' },{ variant:'hit-win', eyebrow:'IMPACT SUCCESS', title:'叩いたらJACKPOT', detail:'修理手順書にはありませんが、王の一撃で直りました。' }],
      loss:[{ variant:'collapse', eyebrow:'TOTAL FAILURE', title:'Panelが全部落ちる', detail:'余ったネジを隠した直後、装置が静かに崩壊しました。' },{ variant:'reverse-wire', eyebrow:'WRONG CABLE', title:'上下を逆に配線', detail:'画面は戻りましたが、判定だけがハズレ方向です。' }],
      revival:[{ variant:'reverse-repair', eyebrow:'UNDO REPAIR', title:'修理を逆再生', detail:'壊す前まで巻き戻すと、内部からJACKPOTが出てきました。' },{ variant:'tiny-fish', eyebrow:'SECOND OPINION', title:'小魚整備士が一秒で直す', detail:'王の長い修理を横目に、勝利回路だけを接続しました。' }]
    }),
    'judgment-abandoned':sealEndingSet({
      normal:[{ variant:'cleaner', eyebrow:'SHIFT ENDED', title:'清掃魚が通常判定を代行', detail:'王は帰りました。床に残った札を正式結果とします。' },{ variant:'elevator', eyebrow:'OUT OF OFFICE', title:'Elevatorは戻ってこない', detail:'置き忘れた王冠だけが通常航路を指しました。' }],
      win:[{ variant:'forgotten-crown', eyebrow:'LEFT BEHIND', title:'忘れ物の王冠が勝利判定', detail:'無人の装置へ着地し、王不在のJACKPOTが成立しました。' },{ variant:'overtime', eyebrow:'UNPAID OVERTIME', title:'王、渋々戻ってくる', detail:'帰宅直前に勝利信号を見つけ、偉そうに押印しました。' }],
      loss:[{ variant:'closed', eyebrow:'COURT CLOSED', title:'本日の判定は終了', detail:'照明も水流も落ち、ハズレ札だけが受付に残ります。' },{ variant:'outsourced', eyebrow:'RETURN TO SENDER', title:'外注先から差し戻し', detail:'書類不備の赤印と一緒に、敗北判定が返送されました。' }],
      revival:[{ variant:'crown-drop', eyebrow:'AFTER HOURS', title:'無人の天井から王冠落下', detail:'完全無音のあと、JACKPOTだけが営業を再開します。' },{ variant:'wrong-floor', eyebrow:'ELEVATOR RETURNS', title:'王が違う階から乱入', detail:'閉廷後のPageをこじ開け、勝利札を置いてまた帰りました。' }]
    }),
    'cctv-result-chase':sealEndingSet({
      normal:[{ variant:'decoy-envelope', eyebrow:'CAM 04', title:'捕まえた封筒は空', detail:'本物は不明のまま、通常判定へ接続します。' },{ variant:'time-out', eyebrow:'TRACKING ENDED', title:'監視時間切れ', detail:'足跡だけが穏やかな結果へ並び替わりました。' }],
      win:[{ variant:'caught', eyebrow:'TARGET SECURED', title:'判決封筒を捕獲', detail:'四つのCameraが同時に勝利Sealを確認しました。' },{ variant:'ahead', eyebrow:'SUBJECT AHEAD', title:'Resultが先回りして待っていた', detail:'追跡隊より先にJACKPOT席へ到着しています。' }],
      loss:[{ variant:'escaped', eyebrow:'TARGET LOST', title:'封筒、Footerの外へ逃走', detail:'王は追跡を諦め、ハズレの控えだけを提出しました。' },{ variant:'wrong-subject', eyebrow:'WRONG SUBJECT', title:'干からびた王を誤認逮捕', detail:'本物の判決は逃げ切り、しょんぼりしたハズレが残ります。' }],
      revival:[{ variant:'rewind-camera', eyebrow:'REWIND CAM 02', title:'映像を逆再生して再捕獲', detail:'逃走経路を巻き戻し、JACKPOT封筒だけ取り戻しました。' },{ variant:'drop', eyebrow:'EVIDENCE DROP', title:'画面上から勝利封筒', detail:'見失った直後、別Cameraから王冠付きで落ちてきます。' }]
    }),
    'royal-lunch-show':sealEndingSet({
      normal:[{ variant:'nap', eyebrow:'AFTER LUNCH', title:'王、食後すぐ寝る', detail:'寝息が通常判定の泡だけを運びました。' },{ variant:'shared', eyebrow:'TABLE SERVICE', title:'残りは証人へ配給', detail:'会食は穏やかに終了し、通常航路へ戻ります。' }],
      win:[{ variant:'satisfied', eyebrow:'ROYAL SATISFACTION', title:'満足した王がJACKPOT', detail:'最後の一口を飲み込み、王冠Sealを豪快に押しました。' },{ variant:'plate-win', eyebrow:'SECRET COURSE', title:'皿の下に勝利札', detail:'片付けた瞬間、隠しMenuのJACKPOTが現れます。' }],
      loss:[{ variant:'fish-escape', eyebrow:'DINNER ESCAPED', title:'主菜が泳いで逃げる', detail:'王も皿も追いかけ、ハズレ判定だけ置き去りです。' },{ variant:'overeaten', eyebrow:'TOO FULL', title:'食べ過ぎで判定不能', detail:'なおキングは動けず、敗北札にだけ手が届きました。' }],
      revival:[{ variant:'dessert', eyebrow:'DESSERT ARRIVES', title:'終わった卓へ王冠Dessert', detail:'閉店寸前の一皿がJACKPOTへ変形しました。' },{ variant:'dream-win', eyebrow:'ROYAL DREAM', title:'寝た王の夢から勝利', detail:'現実のハズレ卓を、寝言だけでひっくり返します。' }]
    }),
    'council-deadlock':sealEndingSet({
      normal:[{ variant:'postponed', eyebrow:'MEETING POSTPONED', title:'結論は次の潮へ', detail:'議事録だけ残し、通常判定へ戻ります。' },{ variant:'abstain', eyebrow:'ALL ABSTAIN', title:'全証人が棄権', detail:'王が一番無難な神託を採用しました。' }],
      win:[{ variant:'unanimous', eyebrow:'UNANIMOUS', title:'全会一致の勝利', detail:'聞いていなかった王も最後だけ賛成しました。' },{ variant:'minority-win', eyebrow:'ONE SMALL VOICE', title:'小魚の一票で逆転', detail:'最小の証言が全議席を動かし、JACKPOT可決です。' }],
      loss:[{ variant:'veto', eyebrow:'ROYAL VETO', title:'王が理由なく拒否', detail:'説明はありません。議事録には大きくハズレとだけ。' },{ variant:'sleep-vote', eyebrow:'CHAIR ASLEEP', title:'寝言を敗北票として集計', detail:'会議はそのまま散会し、冷たい判定が残りました。' }],
      revival:[{ variant:'recount', eyebrow:'RECOUNT', title:'最後の一票を数え直す', detail:'裏返った王冠票が見つかり、JACKPOTへ再可決。' },{ variant:'minutes-rewrite', eyebrow:'AMENDED MINUTES', title:'議事録が勝手に書き換わる', detail:'敗北の文字が一字ずつ逃げ、勝利案が成立しました。' }]
    }),
    'upside-down-kingdom':sealEndingSet({
      normal:[{ variant:'center', eyebrow:'GRAVITY STABLE', title:'王冠だけ中央に残る', detail:'落ちたUIを戻し、通常判定を再開します。' },{ variant:'wall-king', eyebrow:'90 DEGREE KING', title:'王が壁に張り付く', detail:'本人は平気そうなので、結果は通常扱いです。' }],
      win:[{ variant:'crown-assembly', eyebrow:'ZERO-G JACKPOT', title:'落下物が勝利文を組む', detail:'反転した王国で、王冠だけが上向きに爆発します。' },{ variant:'floor-win', eyebrow:'NEW FLOOR', title:'天井側にJACKPOT着地', detail:'常識は逆ですが、勝利Sealだけは正位置です。' }],
      loss:[{ variant:'fall-out', eyebrow:'GRAVITY ERROR', title:'判定がPage端から落下', detail:'王も追いかけましたが、ハズレ札だけ残りました。' },{ variant:'crushed', eyebrow:'UI COLLISION', title:'王冠が装置に刺さる', detail:'抜こうとしてさらに壊し、敗北判定で停止します。' }],
      revival:[{ variant:'reverse-gravity', eyebrow:'GRAVITY REVERSED', title:'落下を完全逆再生', detail:'散った部品が戻り、中心にJACKPOTを組み上げます。' },{ variant:'king-shove', eyebrow:'ROYAL PUSH', title:'巨大な王がPageを押し戻す', detail:'上下も敗北も正位置へ戻り、勝利信号が再点火。' }]
    }),
    'giant-naoking-inspection':sealEndingSet({
      normal:[{ variant:'pass', eyebrow:'INSPECTION PASS', title:'何もせず帰る', detail:'瞳の反射に通常判定だけが一瞬見えました。' },{ variant:'stamp', eyebrow:'ACCEPTABLE', title:'理由なしの合格Seal', detail:'巨大な王の鼻先で、通常航路へ押し戻されます。' }],
      win:[{ variant:'sneeze-win', eyebrow:'ROYAL SNEEZE', title:'くしゃみで王冠Storm', detail:'UIは吹き飛びましたが、JACKPOTだけ中央へ残りました。' },{ variant:'eye-win', eyebrow:'EYE REFLECTION', title:'瞳の奥に王宮', detail:'巨大な反射面が開き、専用勝利Sceneへ接続します。' }],
      loss:[{ variant:'fail', eyebrow:'INSPECTION FAIL', title:'不合格、理由なし', detail:'巨大な王は首を振り、しょんぼり顔のハズレを置きました。' },{ variant:'covered', eyebrow:'TOO CLOSE', title:'顔で画面が全部隠れる', detail:'離れたあとには敗北札しか残っていません。' }],
      revival:[{ variant:'second-look', eyebrow:'SECOND LOOK', title:'帰り際に振り向く', detail:'王の瞳から勝利光が飛び、JACKPOTへ上書きします。' },{ variant:'tiny-crown', eyebrow:'MICRO CROWN', title:'巨大王に極小王冠', detail:'間の抜けた戴冠の瞬間、敗北Sceneが金色に破裂しました。' }]
    }),
    'pixel-palace-bonus':sealEndingSet({
      win:[{ variant:'gate', eyebrow:'STAGE CLEAR', title:'王冠Gate、OPEN', detail:'低解像度の王宮を突破し、JACKPOT世界へ帰還します。' },{ variant:'secret-room', eyebrow:'SECRET ROOM', title:'壁の裏に白金王座', detail:'一Pixelの亀裂から、専用Premium宮殿が展開されます。' },{ variant:'boss-sleep', eyebrow:'BOSS ASLEEP', title:'最終王が寝ていた', detail:'戦わず王冠を回収。豪華なのに締まらない完全勝利です。' },{ variant:'extra-life', eyebrow:'1UP → JACKPOT', title:'残機が王冠へ変換', detail:'Retro Fanfareのあと、Page全体がRoyal Sceneへ変わります。' }]
    }),
    ...(expansion.endings || {})
  });

  function presentationCategory(route) {
    if (route.category) return route.category;
    if (route.scene) return 'character-cutin';
    if (route.family === 'intrusion') return 'intrusion';
    if (route.family === 'reel-event') return 'reel-event';
    if (route.family === 'environment') return 'environment';
    if (route.family === 'blackout' || route.family === 'power-failure') return 'power-failure';
    if (route.family === 'rule-change' || route.family === 'interactive') return 'rule-change';
    if (route.family === 'revival') return 'revival';
    if (route.family === 'premium' || route.family === 'secret') return 'premium';
    return 'text-cutin';
  }

  function chooseEventEnding(route, result) {
    const endings = eventEndings[route.id];
    if (!endings) return null;
    const outcome = result.effect === 'revival' ? 'revival' : result.kind;
    const candidates = endings[outcome] || [];
    if (!candidates.length) return null;
    return Object.freeze({ ...candidates[Math.floor(Math.random() * candidates.length)], outcome });
  }
  const routeStopOrders = Object.freeze({
    cascade:[0,1,2,3,4], 'outside-in':[0,4,1,3,2], 'center-last':[1,3,0,4,2],
    'edge-first':[4,0,3,1,2], wave:[0,2,4,1,3], skip:[1,4,0,3,2],
    whisper:[2,1,3,0,4], synchronous:[0,1,2,3,4], lazy:[0,2,1,4,3],
    push:[4,3,2,1,0], reverse:[4,3,2,1,0], witnesses:[0,4,1,3,2],
    theft:[2,0,4,1,3], 'power-cut':[0,4,2,1,3], respin:[2,4,0,3,1],
    breakdown:[0,1,4,3,2]
  });

  const reelGrammars = expansion.reelGrammars || Object.freeze({});
  function makeStopOrder(strategy, count) {
    const size = clampReelCount(count);
    if (size === DEFAULT_REEL_TILE_COUNT && routeStopOrders[strategy]) return [...routeStopOrders[strategy]];
    const indexes = Array.from({ length:size }, (_, index) => index);
    const center = (size - 1) / 2;
    if (['push','reverse'].includes(strategy)) return indexes.reverse();
    if (['outside-in','witnesses'].includes(strategy)) {
      const order = [];
      for (let left = 0, right = size - 1; left <= right; left += 1, right -= 1) {
        order.push(left);
        if (right !== left) order.push(right);
      }
      return order;
    }
    if (['center-last','edge-first'].includes(strategy)) return indexes.sort((a, b) => Math.abs(b - center) - Math.abs(a - center));
    if (strategy === 'wave') return [...indexes.filter(index => index % 2 === 0), ...indexes.filter(index => index % 2 === 1)];
    if (strategy === 'skip') return [...indexes.filter(index => index % 2 === 1), ...indexes.filter(index => index % 2 === 0)];
    if (['theft','respin'].includes(strategy)) return indexes.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
    if (strategy === 'power-cut') return indexes.sort((a, b) => Math.abs(b - center) - Math.abs(a - center));
    return indexes;
  }

  function reelMotionFor(presentation, phase, fallback) {
    const grammar = reelGrammars[presentation?.reelGrammar];
    return grammar?.[phase] || fallback;
  }

  /*
   * Routes no longer share one four-beat clock. A sequence changes the
   * composition repeatedly while the already-frozen result stays untouched.
   * Ratios are intentionally declarative so long routes gain events, not idle
   * waiting time. Reduced motion keeps the same story in a compressed clock.
   */
  const sequenceBlueprints = Object.freeze({
    classic:Object.freeze({ signal:.38, judgment:.61, stop:.76 }),
    chaos:Object.freeze({ signal:.12, twist:.53, judgment:.70, stop:.85 }),
    broadcast:Object.freeze({ signal:.11, twist:.52, judgment:.70, stop:.85 }),
    tribunal:Object.freeze({ signal:.12, twist:.55, judgment:.72, stop:.86 }),
    anomaly:Object.freeze({ signal:.12, twist:.56, judgment:.72, stop:.86 }),
    breakdown:Object.freeze({ signal:.11, twist:.53, judgment:.70, stop:.85 }),
    passage:Object.freeze({ signal:.14, twist:.56, judgment:.72, stop:.86 }),
    interactive:Object.freeze({ signal:.12, twist:.56, judgment:.72, stop:.86 }),
    journey:Object.freeze({ signal:.11, twist:.54, judgment:.71, stop:.85 }),
    chase:Object.freeze({ signal:.12, twist:.55, judgment:.72, stop:.86 }),
    battle:Object.freeze({ signal:.10, twist:.51, judgment:.71, stop:.86 }),
    pursuit:Object.freeze({ signal:.11, twist:.52, judgment:.71, stop:.86 }),
    trial:Object.freeze({ signal:.10, twist:.53, judgment:.72, stop:.87 }),
    sports:Object.freeze({ signal:.08, twist:.51, judgment:.72, stop:.87 }),
    'news-event':Object.freeze({ signal:.09, twist:.51, judgment:.71, stop:.86 }),
    'commercial-event':Object.freeze({ signal:.10, twist:.52, judgment:.72, stop:.87 }),
    'repair-event':Object.freeze({ signal:.08, twist:.51, judgment:.71, stop:.87 }),
    'abandon-event':Object.freeze({ signal:.08, twist:.52, judgment:.73, stop:.88 }),
    surveillance:Object.freeze({ signal:.08, twist:.50, judgment:.71, stop:.87 }),
    banquet:Object.freeze({ signal:.10, twist:.53, judgment:.73, stop:.88 }),
    'council-event':Object.freeze({ signal:.09, twist:.52, judgment:.72, stop:.87 }),
    'gravity-event':Object.freeze({ signal:.09, twist:.51, judgment:.71, stop:.87 }),
    'giant-event':Object.freeze({ signal:.09, twist:.52, judgment:.72, stop:.87 }),
    'fake-object':Object.freeze({ signal:.12, twist:.55, judgment:.72, stop:.86 }),
    'book-revival':Object.freeze({ signal:.10, twist:.50, judgment:.68, stop:.85 }),
    'silent-revival':Object.freeze({ signal:.10, twist:.52, judgment:.70, stop:.85 }),
    coronation:Object.freeze({ signal:.09, twist:.50, judgment:.68, stop:.86 }),
    vault:Object.freeze({ signal:.08, twist:.48, judgment:.66, stop:.84 }),
    'pixel-palace':Object.freeze({ signal:.07, twist:.48, judgment:.68, stop:.86 }),
    ...(expansion.sequences || {})
  });

  function sequenceFor(presentation) {
    return sequenceBlueprints[presentation.sequence] || sequenceBlueprints.classic;
  }

  function cutinDuration(presentation, phase = 'signal') {
    if (presentation.cutin === false) return 0;
    const premium = Boolean(presentation.premium || presentation.tier === 'extreme');
    const heated = premium || ['hot', 'superhot', 'revival', 'fake-loss'].includes(presentation.tier);
    if (premium) return phase === 'signal' ? 5000 : 4700;
    if (heated) return phase === 'signal' ? 4500 : 4200;
    if (presentation.scene) return phase === 'signal' ? 4000 : 3800;
    return phase === 'signal' ? 3700 : 3500;
  }

  function sequenceTimings(presentation) {
    const sequence = sequenceFor(presentation);
    const total = presentation.duration;
    const signalAt = Math.round(total * sequence.signal);
    const signalDwell = cutinDuration(presentation, 'signal');
    const twistDwell = cutinDuration(presentation, 'twist');
    const twistAt = sequence.twist
      ? Math.max(Math.round(total * sequence.twist), signalAt + signalDwell + 380)
      : 0;
    const lastCutinEnd = twistAt ? twistAt + twistDwell : signalAt + signalDwell;
    const judgmentAt = Math.max(Math.round(total * sequence.judgment), lastCutinEnd + 520);
    const stopAt = Math.max(Math.round(total * sequence.stop), judgmentAt + 850);
    return Object.freeze({ signalAt, twistAt, judgmentAt, stopAt, signalDwell, twistDwell });
  }

  function routeCompatible(route, result) {
    if (!route.kinds.includes(result.kind)) return false;
    if (route.effects && !route.effects.includes(result.effect)) return false;
    if (result.effect === 'revival' && route.family !== 'revival' && !route.revivalCompatible) return false;
    if (route.family === 'revival' && result.effect !== 'revival') return false;
    if ((route.family === 'premium' || route.family === 'secret') && result.kind !== 'win') return false;
    return true;
  }

  function todayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function readDailyState() {
    const fallback = { date:todayKey(), count:0, lastResult:'', lastRoute:'', rareDrought:0 };
    try {
      const parsed = JSON.parse(window.localStorage?.getItem('naoking-oracle-daily-v2') || 'null');
      if (!parsed || parsed.date !== fallback.date) return fallback;
      return { ...fallback, ...parsed };
    } catch (_) { return fallback; }
  }

  let dailyState = readDailyState();
  function writeDailyState(result, presentation) {
    dailyState = {
      date:todayKey(), count:dailyState.count + 1, lastResult:result.key, lastRoute:presentation.id,
      rareDrought:result.kind === 'win' ? 0 : dailyState.rareDrought + 1
    };
    try { window.localStorage?.setItem('naoking-oracle-daily-v2', JSON.stringify(dailyState)); } catch (_) { /* optional */ }
  }

  function presentationModifier(result, context) {
    if (context.isFirstToday) return Object.freeze({ id:'first-tide', cue:'FIRST TIDE TODAY', detail:'本日最初の海流を記録。' });
    if (context.spinNumber === 5) return Object.freeze({ id:'fifth-bell', cue:'FIFTH COURT BELL', detail:'本日五回目。宮廷鐘が一度だけ鳴る。' });
    if (context.lastResult === result.key) return Object.freeze({ id:'echo-result', cue:'VERDICT ECHO', detail:'前回の判定が遠くで反響している。' });
    if (context.rareDrought >= 7) return Object.freeze({ id:'long-silence', cue:'LONG SILENCE', detail:'特殊信号のない長い静けさを観測。' });
    return Object.freeze({ id:'none', cue:'', detail:'' });
  }

  function choosePresentation(result, context = {}, track = true) {
    const candidates = presentationRoutes.filter(route => routeCompatible(route, result));
    const weights = candidates.map(route => {
      let weight = route.weight;
      const category = presentationCategory(route);
      if (category === 'character-cutin') weight *= .72;
      if (presentationHistory[0] === route.id) weight = 0;
      else if (presentationHistory.slice(1, 4).includes(route.id)) weight *= .22;
      if (presentationCategoryHistory[0] === category) weight *= category === 'text-cutin' ? .04 : .12;
      else if (presentationCategoryHistory.slice(1, 4).includes(category)) weight *= .45;
      if (context.lastRoute === route.id) weight *= .08;
      return weight;
    });
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let cursor = Math.random() * total;
    let route = candidates[candidates.length - 1];
    for (let index = 0; index < candidates.length; index += 1) {
      cursor -= weights[index];
      if (cursor <= 0) { route = candidates[index]; break; }
    }
    if (track) {
      presentationHistory.unshift(route.id);
      presentationHistory.splice(5);
      presentationCategoryHistory.unshift(presentationCategory(route));
      presentationCategoryHistory.splice(5);
    }
    const jitter = reducedMotion.matches ? 0 : Math.floor(Math.random() * 260);
    const reelCount = clampReelCount(route.reelCount);
    return Object.freeze({
      ...route, reelCount, category:presentationCategory(route), duration:route.duration + jitter,
      modifier:presentationModifier(result, context), ending:chooseEventEnding(route, result),
      stopOrder:Object.freeze(makeStopOrder(route.motion, reelCount))
    });
  }

  const tile = (image, index = 0, stopped = false, count = DEFAULT_REEL_TILE_COUNT) => {
    const prime = Math.abs(index - ((count - 1) / 2)) <= .5;
    return `<div class="shark-tile${stopped ? ' is-stopped' : ''}${prime ? ' is-prime' : ''}" data-reel-index="${index}" style="--center-distance:${Math.abs(index - ((count - 1) / 2))}"><span aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><img class="shark-face" src="${image}" alt="なおキング" draggable="false"></div>`;
  };
  const tileSet = (image, count = DEFAULT_REEL_TILE_COUNT, stopped = false) => Array.from({ length:clampReelCount(count) }, (_, index) => tile(image, index, stopped, clampReelCount(count))).join('');
  const shuffledSpinImages = (count = DEFAULT_REEL_TILE_COUNT) => {
    const images = normalResults.map(result => result.image);
    for (let index = images.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [images[index], images[swapIndex]] = [images[swapIndex], images[index]];
    }
    return Array.from({ length:clampReelCount(count) }, (_, index) => images[index % images.length]);
  };

  /* Theatre layers are ornamental; readable typography stays outside them. */
  const effectLayer = document.createElement('div');
  effectLayer.className = 'roulette-fx'; effectLayer.setAttribute('aria-hidden', 'true'); card.append(effectLayer);
  const sceneProp = document.createElement('div');
  sceneProp.className = 'roulette-scene-prop'; sceneProp.setAttribute('aria-hidden', 'true'); card.append(sceneProp);
  const intruder = document.createElement('img');
  intruder.className = 'oracle-intruder'; intruder.src = 'assets/characters/naoking-hero.webp'; intruder.alt = ''; card.append(intruder);
  const crowns = document.createElement('div');
  crowns.className = 'oracle-crown-field'; crowns.setAttribute('aria-hidden', 'true');
  crowns.innerHTML = '<i>♛</i><i>♛</i><i>♛</i><i>♛</i><i>♛</i><i>♛</i><i>♛</i>'; card.append(crowns);
  const proscenium = document.createElement('div');
  proscenium.className = 'oracle-proscenium'; proscenium.setAttribute('aria-hidden', 'true');
  proscenium.innerHTML = '<i></i><i></i><b></b><b></b><span></span>'; card.append(proscenium);
  const routeReadout = document.createElement('div');
  routeReadout.className = 'oracle-route-readout'; routeReadout.setAttribute('aria-hidden', 'true');
  routeReadout.innerHTML = '<span>AWAITING CURRENT</span><small>演出航路を待機中</small>'; card.append(routeReadout);
  const phaseRail = document.createElement('div');
  phaseRail.className = 'oracle-phase-rail'; phaseRail.setAttribute('aria-hidden', 'true');
  phaseRail.innerHTML = '<i data-step="DESCENT">01</i><i data-step="CRUISE">02</i><i data-step="OMEN">03</i><i data-step="VERDICT">04</i>'; card.append(phaseRail);

  const machinePlate = document.querySelector('.machine-plate');
  const machineIdentity = document.createElement('strong');
  machineIdentity.className = 'oracle-machine-identity'; machineIdentity.setAttribute('aria-hidden', 'true');
  machineIdentity.innerHTML = '<span>ROYAL ORACLE // FIVE WITNESSES</span><small>深海王国・五証言神託機構</small>';
  const oracleTierBadge = document.createElement('b');
  oracleTierBadge.className = 'oracle-tier-badge'; oracleTierBadge.setAttribute('aria-hidden', 'true');
  const oracleTierLamp = document.createElement('i');
  const oracleTierLabel = document.createElement('span'); oracleTierLabel.textContent = 'DORMANT';
  oracleTierBadge.append(oracleTierLamp, oracleTierLabel);
  machinePlate?.append(machineIdentity, oracleTierBadge);

  const oracleEnvironment = document.createElement('div');
  oracleEnvironment.className = 'oracle-environment'; oracleEnvironment.setAttribute('aria-hidden', 'true');
  oracleEnvironment.innerHTML = '<i class="oracle-current oracle-current-a"></i><i class="oracle-current oracle-current-b"></i><i class="oracle-current oracle-current-c"></i><b class="oracle-pressure-ring"></b><b class="oracle-pressure-ring oracle-pressure-ring-b"></b><span class="oracle-bubble oracle-bubble-a"></span><span class="oracle-bubble oracle-bubble-b"></span><span class="oracle-bubble oracle-bubble-c"></span><span class="oracle-bubble oracle-bubble-d"></span><span class="oracle-bubble oracle-bubble-e"></span>';
  pageBody?.append(oracleEnvironment);
  const oracleTakeover = document.createElement('div');
  oracleTakeover.className = 'oracle-takeover'; oracleTakeover.setAttribute('aria-hidden', 'true');
  oracleTakeover.innerHTML = '<span></span><small></small><i></i>'; pageBody?.append(oracleTakeover);
  const fishSchool = document.createElement('div');
  fishSchool.className = 'oracle-fish-school'; fishSchool.setAttribute('aria-hidden', 'true');
  pageBody?.append(fishSchool);
  const chaosStage = document.createElement('section');
  chaosStage.className = 'oracle-chaos-stage'; chaosStage.setAttribute('aria-hidden', 'true'); chaosStage.setAttribute('role', 'status'); chaosStage.setAttribute('aria-live', 'polite'); chaosStage.setAttribute('aria-atomic', 'true');
  const chaosPanel = document.createElement('div'); chaosPanel.className = 'oracle-chaos-panel';
  const chaosImage = document.createElement('img'); chaosImage.className = 'oracle-chaos-image'; chaosImage.alt = '';
  const chaosCopy = document.createElement('div'); chaosCopy.className = 'oracle-chaos-copy';
  const chaosEyebrow = document.createElement('small');
  const chaosTitle = document.createElement('strong');
  const chaosDetail = document.createElement('span');
  const chaosGlyph = document.createElement('b'); chaosGlyph.setAttribute('aria-hidden', 'true');
  const chaosProps = document.createElement('div');
  chaosProps.className = 'oracle-event-props'; chaosProps.setAttribute('aria-hidden', 'true');
  chaosProps.innerHTML = '<i></i><i></i><i></i><i></i><b></b><span></span>';
  const chaosAction = document.createElement('button');
  chaosAction.className = 'oracle-chaos-action'; chaosAction.type = 'button'; chaosAction.hidden = true;
  chaosCopy.append(chaosEyebrow, chaosTitle, chaosDetail, chaosAction);
  chaosPanel.append(chaosImage, chaosCopy, chaosGlyph); chaosStage.append(chaosPanel, chaosProps);
  (pageBody || card).append(chaosStage);

  let busy = false;
  let locked = false;
  let taps = [];
  let scheduledTasks = [];
  let drawToken = 0;
  let resolvedDraws = 0;
  let activeVisualResult = null;
  let activePresentation = null;
  let chaosInteracted = false;
  let chaosSceneRevision = 0;
  let fishSchoolRevision = 0;
  let visibilityPausedAt = 0;
  const displayHistory = [];
  const activeEnvironmentClasses = new Set();

  const oracleTierLabels = Object.freeze({ normal:'NORMAL', signal:'SIGNAL', hot:'HOT', superhot:'VERY HOT', extreme:'EXTREME', jackpot:'JACKPOT', 'fake-loss':'FAKE LOSE', revival:'REVIVAL' });

  function clearOracleEnvironment() {
    environmentTargets.forEach(target => {
      activeEnvironmentClasses.forEach(className => target.classList.remove(className));
      if (target.dataset) { delete target.dataset.oraclePhase; delete target.dataset.oracleTier; delete target.dataset.oracleRoute; }
    });
    activeEnvironmentClasses.clear();
    oracleEnvironment.removeAttribute?.('data-phase');
    oracleEnvironment.removeAttribute?.('data-tier');
    oracleEnvironment.removeAttribute?.('data-route');
  }

  function tierFor(result, presentation, override = '') {
    if (override) return override;
    if (presentation?.id === 'abyssal-blackout-revival' && result?.effect === 'revival') return 'jackpot';
    if (presentation?.tier) return presentation.tier;
    if (!result || result.kind === 'normal') return 'normal';
    if (result.effect === 'revival') return 'revival';
    if (result.kind === 'loss') return 'fake-loss';
    if (result.effect === 'rainbow') return 'jackpot';
    if (result.effect === 'crown' || result.effect === 'abyss') return 'superhot';
    return 'hot';
  }

  function phaseTierCopy(phase, tier) {
    if (phase === 'descent') return 'DIVE';
    if (phase === 'cruise') return 'FULL CURRENT';
    if (phase === 'signal') return tier === 'normal' ? 'READING' : oracleTierLabels[tier] || 'SIGNAL';
    if (phase === 'anomaly') return tier === 'normal' ? 'CURRENT SHIFT' : oracleTierLabels[tier] || 'ANOMALY';
    if (phase === 'judgment') return tier === 'normal' ? 'ANTICIPATION' : oracleTierLabels[tier] || 'ANTICIPATION';
    if (phase === 'verdict') return 'STAGGERED STOP';
    if (phase === 'fake') return 'SIGNAL LOST';
    if (phase === 'revival') return 'WORLD RESTART';
    if (phase === 'locked') return 'SYSTEM LOCK';
    return oracleTierLabels[tier] || 'DORMANT';
  }

  function emitOracle(name, detail) {
    if (typeof window.dispatchEvent !== 'function' || typeof window.CustomEvent !== 'function') return;
    window.dispatchEvent(new window.CustomEvent(name, { detail }));
  }

  function dispatchOracleEvent(phase, tier) {
    const resultVisible = ['revealed', 'revival', 'resting'].includes(phase);
    emitOracle('naoking:oraclephase', {
      phase, tier, route:activePresentation?.id || '', family:activePresentation?.family || '',
      sealed:true, resultKind:resultVisible ? activeVisualResult?.kind || '' : ''
    });
  }

  function dispatchOracleBeat(cue, detail = {}) {
    emitOracle('naoking:oraclebeat', {
      cue, route:activePresentation?.id || '', family:activePresentation?.family || '',
      tier:tierFor(activeVisualResult, activePresentation), ...detail
    });
  }

  function dispatchOracleDraw(presentation) {
    emitOracle('naoking:oracledraw', {
      route:presentation.id, family:presentation.family, tier:presentation.tier,
      draw:resolvedDraws, sealed:true
    });
  }

  function dispatchOracleStop(index, order, total) {
    emitOracle('naoking:oraclestop', {
      index, order, total, final:order === total - 1, route:activePresentation?.id || ''
    });
  }

  function dispatchOracleResult(result, presentation) {
    emitOracle('naoking:oracleresult', {
      resultKind:result.kind, effect:result.effect, tier:tierFor(result, presentation),
      route:presentation.id, family:presentation.family
    });
  }

  function pulseWaterfield(phase, tier) {
    if (typeof window.dispatchEvent !== 'function' || typeof window.CustomEvent !== 'function') return;
    const pulses = {
      descent:{ intensity:.32, duration:720 }, cruise:{ intensity:.48, duration:900 }, signal:{ intensity:tier === 'normal' ? .38 : .68, duration:950 },
      judgment:{ intensity:.76, duration:720 }, verdict:{ intensity:.9, duration:520 }, revealed:{ intensity:tier === 'normal' ? .42 : 1, duration:1450 },
      fake:{ intensity:.12, duration:700 }, revival:{ intensity:1, duration:1800 }, locked:{ intensity:.1, duration:700 }
    };
    const pulse = pulses[phase];
    if (pulse) window.dispatchEvent(new window.CustomEvent('naoking:waterpulse', { detail:pulse }));
  }

  function syncOracleEnvironment(phase, tierOverride = '') {
    clearOracleEnvironment();
    if (!phase) { oracleTierLabel.textContent = 'DORMANT'; return; }
    const tier = tierFor(activeVisualResult, activePresentation, tierOverride);
    // "resting" keeps the sealed result on the machine, but it must not keep
    // the page-wide currents, filters, bubbles, or premium lighting alive.
    // The next draw rehydrates the route classes from its frozen presentation.
    if (phase === 'resting') {
      oracleTierLabel.textContent = 'SEALED';
      dispatchOracleEvent(phase, tier);
      return;
    }
    oracleTierLabel.textContent = phaseTierCopy(phase, tier);
    const classes = ['is-oracle-active', `oracle-stage-${phase}`, `oracle-tier-${tier}`];
    const resultVisible = ['revealed', 'revival'].includes(phase);
    if (resultVisible && activeVisualResult?.kind) classes.push(`oracle-outcome-${activeVisualResult.kind}`);
    if (resultVisible && activeVisualResult?.effect) classes.push(`oracle-effect-${activeVisualResult.effect}`);
    if (activePresentation) {
      classes.push(`oracle-route-${activePresentation.id}`, `oracle-family-${activePresentation.family}`, `oracle-world-${activePresentation.world}`, `oracle-motion-${activePresentation.motion}`);
      if (activePresentation.modifier?.id && activePresentation.modifier.id !== 'none') classes.push(`oracle-mod-${activePresentation.modifier.id}`);
      if (activePresentation.premium) classes.push('is-oracle-premium');
    }
    classes.forEach(className => activeEnvironmentClasses.add(className));
    environmentTargets.forEach(target => {
      target.classList.add(...classes);
      if (target.dataset) { target.dataset.oraclePhase = phase; target.dataset.oracleTier = tier; target.dataset.oracleRoute = activePresentation?.id || ''; }
    });
    oracleEnvironment.setAttribute?.('data-phase', phase);
    oracleEnvironment.setAttribute?.('data-tier', tier);
    oracleEnvironment.setAttribute?.('data-route', activePresentation?.id || '');
    pulseWaterfield(phase, tier);
    dispatchOracleEvent(phase, tier);
  }

  function updatePhaseRail(phase) {
    const phaseIndex = { descent:0, cruise:1, signal:2, anomaly:2, judgment:2, verdict:3, fake:3, revival:3, revealed:3, resting:3 }[phase] ?? -1;
    Array.from(phaseRail.children || []).forEach((item, index) => item.classList.toggle('is-current', index === phaseIndex));
  }

  function setPhase(phase, tierOverride = '') {
    if (phase) card.dataset.roulettePhase = phase;
    else delete card.dataset.roulettePhase;
    updatePhaseRail(phase);
    syncOracleEnvironment(phase, tierOverride);
  }

  function setReelMotion(motion) {
    if (motion) { card.dataset.reelMotion = motion; slot.dataset.reelMotion = motion; }
    else { delete card.dataset.reelMotion; delete slot.dataset.reelMotion; }
  }

  function timelineDelay(ms) { return reducedMotion.matches ? Math.max(35, Math.round(ms * .075)) : ms; }

  function armTask(task) {
    if (document.hidden) return;
    task.due = Date.now() + task.remaining;
    task.id = window.setTimeout(() => {
      scheduledTasks = scheduledTasks.filter(item => item !== task);
      task.id = null;
      if (task.token === drawToken) task.fn();
    }, task.remaining);
  }

  function later(fn, ms, token = drawToken) {
    const task = { fn, token, remaining:timelineDelay(ms), due:0, id:null };
    scheduledTasks.push(task); armTask(task); return task;
  }

  function clearScheduledTasks() {
    scheduledTasks.forEach(task => { if (task.id !== null) window.clearTimeout(task.id); });
    scheduledTasks = [];
  }

  function onReducedMotionChange() {
    if (!reducedMotion.matches || scheduledTasks.length === 0) return;
    const now = Date.now();
    scheduledTasks.forEach(task => {
      if (task.id !== null) window.clearTimeout(task.id);
      const unscaledRemaining = task.id === null ? task.remaining : Math.max(0, task.due - now);
      task.remaining = Math.max(35, Math.round(unscaledRemaining * .075));
      task.id = null;
      armTask(task);
    });
  }

  function flash(kind, text, ms = 1550) {
    effectLayer.style.setProperty('--roulette-fx-duration', `${timelineDelay(ms)}ms`);
    effectLayer.className = `roulette-fx is-visible ${kind}`;
    effectLayer.textContent = text;
    later(() => { effectLayer.className = 'roulette-fx'; }, ms);
  }

  function propIn(kind, text, ms = 1600) {
    sceneProp.className = `roulette-scene-prop is-running ${kind}`;
    sceneProp.textContent = text;
    later(() => { sceneProp.className = 'roulette-scene-prop'; }, ms);
  }

  function showTakeover(presentation, phase = 'signal', ms = 1250) {
    const span = oracleTakeover.querySelector?.('span');
    const small = oracleTakeover.querySelector?.('small');
    if (span) span.textContent = presentation.cue;
    if (small) small.textContent = presentation.modifier?.cue || presentation.detail;
    oracleTakeover.style.setProperty('--takeover-duration', `${timelineDelay(ms)}ms`);
    oracleTakeover.className = `oracle-takeover is-visible is-${phase} route-${presentation.id}`;
    later(() => { oracleTakeover.className = 'oracle-takeover'; }, ms);
  }

  function setRouteReadout(presentation, phase = 'descent') {
    const cue = routeReadout.querySelector?.('span');
    const detail = routeReadout.querySelector?.('small');
    if (cue) cue.textContent = phase === 'descent' && presentation.modifier?.cue ? presentation.modifier.cue : presentation.cue;
    if (detail) detail.textContent = phase === 'descent' && presentation.modifier?.detail ? presentation.modifier.detail : presentation.detail;
  }

  function setIntruder(presentation, running) {
    const source = { dry:'assets/characters/naoking-7.webp', sleepy:'assets/characters/naoking-sleepy.webp', fish:'assets/characters/naoking-3.webp', king:'assets/characters/naoking-jackpot.webp' }[presentation.intrusion] || 'assets/characters/naoking-hero.webp';
    intruder.src = source;
    intruder.className = `oracle-intruder${running ? ` is-running is-${presentation.intrusion || 'king'}` : ''}`;
  }

  const chaosScenes = Object.freeze({
    lunch:{ image:'assets/characters/naoking-sleepy.webp', glyph:'♨', signal:['ROYAL BREAK ROOM','王の昼食休憩','神託より先に、ワカメ弁当を開封しました。'], twist:['LUNCH COMPLETE','一口で飽きた','残りは小魚に任せ、判定へ戻ります。'] },
    news:{ image:'assets/characters/naoking-panic.webp', glyph:'LIVE', signal:['ABYSS NEWS 4810','深海速報','神託装置が回転中。以上、現場からでした。'], twist:['BREAKING','まだ回っています','新情報は特にありません。'] },
    council:{ image:'assets/characters/naoking-hero.webp', glyph:'議', signal:['EMERGENCY COUNCIL','王国緊急会議','三枚の布告が、停止順について揉めています。'], twist:['ORDER!','王の木槌で決定','議論は聞いていません。'] },
    sixth:{ image:'assets/characters/naoking-panic.webp', glyph:'06', signal:['UNREGISTERED','第六証人が侵入','五証言制です。誰ですか、あなた。'], twist:['EJECTED','六枚目を追放','何もなかったことにして再回転します。'] },
    strike:{ image:'assets/characters/naoking-sleepy.webp', glyph:'休', signal:['LABOR NOTICE','第三証人、休憩中','本人の希望により一度停止します。'], twist:['BACK TO WORK','王が手で押した','労働協定は今つくりました。'] },
    'giant-fish':{ image:'assets/characters/naoking-4.webp', glyph:'…', signal:['UNSCHEDULED TRAFFIC','巨大魚、通過中','ルーレットとは関係ありません。'], twist:['TRAFFIC CLEAR','王も見ていました','では何事もなく続けます。'] },
    commercial:{ image:'assets/characters/naoking-laugh.webp', glyph:'CM', signal:['ROYAL SPONSOR','王国海藻・新発売','噛むほど海です。今なら定価のまま。'], twist:['SKIP AD','買わんでいい','王が広告主を裏切りました。'] },
    'royal-seal':{ image:'assets/characters/naoking-hero.webp', glyph:'印', signal:['ROYAL SEAL','この王印は押すな','結果は変わりませんが、王は怒ります。'], twist:['AUTO APPROVED','王が自分で押した','押していないのに文句を言っています。'], action:'押すな' },
    repair:{ image:'assets/characters/naoking-panic.webp', glyph:'🔧', signal:['MECHANICAL FAILURE','証人が斜めに噛んだ','王室整備班は王ひとりです。'], twist:['IMPACT REPAIR','木槌で直した','精密機械にしてはいけない直し方です。'] },
    surface:{ image:'assets/characters/naoking-2.webp', glyph:'0M', signal:['EMERGENCY ASCENT','海面へ急浮上','光が強いので王が少し嫌そうです。'], twist:['DIVE AGAIN','王国へ再潜航','上まで来た意味はありません。'] },
    escape:{ image:'assets/characters/naoking-3.webp', glyph:'↗', signal:['WITNESS ESCAPED','証人が王冠を持って逃亡','筐体の外まで追跡します。'], twist:['WITNESS RETURNED','王冠ごと戻った','説教は結果のあとです。'] },
    cardboard:{ image:'assets/characters/naoking-7.webp', glyph:'箱', signal:['CROWN DESCENT','王冠が来た','見た目だけは大当たりです。'], twist:['CARDBOARD','段ボールでした','王室備品費が足りません。'] },
    'cracked-tank':{ image:'assets/characters/naoking-panic.webp', glyph:'⚠', signal:['PRESSURE LEAK','王国水槽にひび','なおキングがテープを探しています。'], twist:['TEMPORARY FIX','雑に貼りました','水はまだ漏れています。'] },
    'verdict-book':{ image:'assets/characters/naoking-7.webp', glyph:'本', signal:['FINAL RECORD','敗北判定書を閉じます','本日の神託は終了しました。'], twist:['BOOKMARK MOVED','王冠のしおりが逆走','最終ページが勝手に開き直ります。'] },
    'golden-bubble':{ image:'assets/characters/naoking-jackpot.webp', glyph:'○', signal:['NO LIGHT / NO CURRENT','海は完全に停止した','遠くに、一つだけ泡が残っています。'], twist:['ONE GOLDEN BUBBLE','金の一泡が破裂','王国全系統を再起動します。'] },
    duel:{ image:'assets/characters/naoking-hero.webp', glyph:'VS', signal:['DEEP-SEA DUEL','王国中央で決闘開始','二つの影が接近。勝敗信号はまだ封印されています。'], twist:['FINAL EXCHANGE','最後の一撃が交差','どちらが立っているか、泡が晴れるまで分かりません。'] },
    'crown-chase':{ image:'assets/characters/naoking-panic.webp', glyph:'♛↗', signal:['CROWN CHASE','王冠が逃走','なおキングと五証人が画面外まで追跡します。'], twist:['LAST CORNER','王冠信号、急旋回','捕まえたのか、見失ったのか――判定へ。'] },
    'royal-trial':{ image:'assets/characters/naoking-hero.webp', glyph:'判', signal:['ROYAL TRIAL','深海王国法廷、開廷','当たりにもハズレにも見える証言を順に読み上げます。'], twist:['FINAL VERDICT','王の木槌が上がる','評決は落下音のあとにだけ公開されます。'] },
    'crown-goal':{ image:'assets/characters/naoking-panic.webp', glyph:'GOAL', signal:['ROYAL SPORTS LIVE','王冠ゴールチャレンジ','助走開始。王冠の軌道はまだ誰にも読めません。'], twist:['PHOTO FINISH','ポスト直前で完全静止','入る、外れる、跳ね返る――次の一拍が決着です。'] },
    'news-live':{ image:'assets/characters/naoking-panic.webp', glyph:'LIVE', signal:['ABYSS NEWS NETWORK','王冠行方不明 LIVE','Studioと四つの監視Cameraを緊急接続します。'], twist:['BREAKING UPDATE','現場映像に何かが映る','王冠か海藻か、速報字幕が確定を待っています。'] },
    'commercial-takeover':{ image:'assets/characters/naoking-laugh.webp', glyph:'CM', signal:['ROYAL SHOPPING','音の出ない王笛','豪華な構え。機能は音が出ないことです。'], twist:['ONE TINY BEEP','広告はまだ続きます','返品、成功、放送事故。どの締め方かは未定です。'] },
    'repair-disaster':{ image:'assets/characters/naoking-panic.webp', glyph:'🔧', signal:['ROYAL MAINTENANCE','神託装置を全分解','王は手順書を上下逆に持っています。'], twist:['ONE SCREW LEFT','一本だけ余りました','成功か完全崩壊か、電源を入れるまで分かりません。'] },
    abandon:{ image:'assets/characters/naoking-sleepy.webp', glyph:'退', signal:['SHIFT COMPLETE','王、定時退勤','判定途中ですが、なおキングはもう帰ります。'], twist:['NO STAFF / NO CURRENT','海も装置も営業終了','このまま終わるのか、何かが戻るのか――無音で待ちます。'] },
    'cctv-chase':{ image:'assets/characters/naoking-panic.webp', glyph:'CAM', signal:['SECURITY CAMERA 01','判決封筒が逃走','HeroからFooterまで、王国全Cameraで追跡します。'], twist:['CAMERA 04 / LOST CORNER','封筒が死角へ入った','捕獲、逃走、誤認逮捕。映像を巻き戻します。'] },
    'lunch-show':{ image:'assets/characters/naoking-sleepy.webp', glyph:'皿', signal:['ROYAL TABLE LIVE','王の昼食が始まった','Rouletteは片付けました。今日の主菜は逃げそうです。'], twist:['LAST COURSE','皿の下に何かある','勝利札、ハズレ札、ただの汚れ。片付けて確認します。'] },
    'council-deadlock':{ image:'assets/characters/naoking-hero.webp', glyph:'議', signal:['ROYAL COUNCIL','全員、意見が違う','王は議題を聞かずに木槌だけ構えています。'], twist:['FINAL VOTE','最後の一票を開封','賛成、反対、寝言。どれとして数えるか協議中です。'] },
    'upside-down':{ image:'assets/characters/naoking-panic.webp', glyph:'↻', signal:['GRAVITY AUDIT','王国、上下反転','Pageの部品が天井方向へ落ち始めました。'], twist:['COLLISION REPORT','王冠とUIが衝突','壊れたのか組み上がったのか、重力を戻して確認します。'] },
    'giant-naoking':{ image:'assets/characters/naoking-hero.webp', glyph:'王', signal:['ROYAL SCALE ANOMALY','巨大なおキング接近','背景から中景、前景へ。検査理由は不明です。'], twist:['TOO CLOSE','顔で画面が埋まりました','合格、不合格、くしゃみ。離れるまで結末は見えません。'] },
    coronation:{ image:'assets/characters/naoking-jackpot.webp', glyph:'♛', signal:['ROYAL CORONATION','五証人、起立','神託装置を王座へ組み替えます。'], twist:['THE KING ARRIVES','戴冠式を開始','王は少し遅刻しました。'] },
    'vault-4810':{ image:'assets/characters/naoking-sleepy.webp', glyph:'4810', signal:['FOUR ROYAL SEALS','王室金庫を解錠','第一、第二、第三……第四封印。'], twist:['VAULT OPEN','中で王が寝ていた','起こしたので、結果を押し出します。'] },
    'pixel-palace':{ image:'assets/characters/naoking-jackpot.webp', glyph:'8BIT', signal:['ROYAL GAME MODE','王宮を8-bitへ変換','王冠Gateまで残り一画面。結果はまだ封印中です。'], twist:['FINAL STAGE','Boss Roomを開く','戦闘、居眠り、隠し通路。どのClearかは次のFrameで。'] },
    ...(expansion.scenes || {})
  });

  function hideFishSchool() {
    fishSchoolRevision += 1;
    fishSchool.className = 'oracle-fish-school';
    fishSchool.removeAttribute('data-school');
    fishSchool.removeAttribute('data-motion');
    fishSchool.replaceChildren();
  }

  function showFishSchool(presentation, phase = 'signal', ms = 3600) {
    const family = presentation.fishSchool;
    if (!family) return;
    hideFishSchool();
    const baseCount = { small:20, royal:28, golden:38, abyss:24, naoking:34 }[family] || 20;
    const mobileScale = window.innerWidth < 720 ? .56 : 1;
    const count = reducedMotion.matches ? 7 : Math.max(10, Math.round(baseCount * mobileScale));
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
      const fish = document.createElement('span');
      fish.className = `oracle-fish fish-${family}`;
      fish.dataset.fishIndex = String(index);
      fish.style.setProperty('--fish-index', index);
      fish.style.setProperty('--fish-x', `${-18 - Math.random() * 30}vw`);
      fish.style.setProperty('--fish-y', `${4 + Math.random() * 88}%`);
      fish.style.setProperty('--fish-size', `${20 + Math.round(Math.random() * 34)}px`);
      fish.style.setProperty('--fish-delay', `${Math.random() * 1.9}s`);
      fish.style.setProperty('--fish-duration', `${4.6 + Math.random() * 3.8}s`);
      fish.style.setProperty('--fish-turn', `${index % 3 === 0 ? -7 : 4}deg`);
      fish.style.setProperty('--fish-depth', `${.24 + Math.random() * .76}`);
      const body = document.createElement('i');
      const tail = document.createElement('b');
      fish.append(body, tail); fragment.append(fish);
    }
    const motion = presentation.fishMotion || 'cross';
    fishSchool.className = `oracle-fish-school is-visible school-${family} motion-${motion} phase-${phase}`;
    fishSchool.dataset.school = family; fishSchool.dataset.motion = motion;
    fishSchool.replaceChildren(fragment);
    const revision = ++fishSchoolRevision;
    later(() => {
      if (revision === fishSchoolRevision) hideFishSchool();
    }, Math.max(1700, ms));
  }

  function hideChaosScene() {
    chaosSceneRevision += 1;
    chaosStage.className = 'oracle-chaos-stage'; chaosStage.setAttribute('aria-hidden', 'true');
    chaosAction.hidden = true; chaosAction.textContent = ''; chaosInteracted = false;
  }

  function showChaosScene(presentation, phase = 'signal', ms = 1500) {
    const scene = chaosScenes[presentation.scene];
    if (!scene) return;
    const copy = phase === 'twist' && presentation.ending
      ? [presentation.ending.eyebrow, presentation.ending.title, presentation.ending.detail]
      : (scene[phase] || scene.signal);
    chaosImage.src = scene.image; chaosGlyph.textContent = scene.glyph || '';
    chaosEyebrow.textContent = copy[0]; chaosTitle.textContent = copy[1]; chaosDetail.textContent = copy[2];
    chaosAction.hidden = !(presentation.interactive && phase === 'signal' && !chaosInteracted && !reducedMotion.matches);
    chaosAction.textContent = scene.action || '王印を押す';
    chaosStage.style.setProperty('--chaos-duration', `${timelineDelay(ms)}ms`);
    const endingClass = phase === 'twist' && presentation.ending
      ? ` outcome-${presentation.ending.outcome} ending-${presentation.ending.variant || 'default'}`
      : '';
    chaosStage.className = `oracle-chaos-stage is-visible scene-${presentation.scene} phase-${phase}${endingClass}`;
    chaosStage.setAttribute('aria-hidden', 'false');
    const revision = ++chaosSceneRevision;
    later(() => {
      if (activePresentation?.id === presentation.id && revision === chaosSceneRevision) hideChaosScene();
    }, ms);
  }

  chaosAction.addEventListener('click', () => {
    if (!activePresentation?.interactive || chaosAction.hidden) return;
    chaosInteracted = true; chaosAction.hidden = true;
    chaosStage.classList.add('is-interacted');
    chaosEyebrow.textContent = 'UNAUTHORIZED INPUT'; chaosTitle.textContent = '押したな';
    chaosDetail.textContent = 'なおキングは怒りました。結果は変わりません。';
    dispatchOracleBeat('royal-seal-pressed', { intensity:.72, pan:.18 });
  });

  function removeDynamicClasses() {
    const classNames = String(card.className || '').split(/\s+/).filter(Boolean);
    card.className = classNames.filter(className => !className.startsWith('is-outcome-') && !className.startsWith('is-effect-') && !className.startsWith('is-route-') && ![
      'is-jackpot','is-failed','is-revival','is-final','is-fake','is-premium','is-reel-freeze','is-reel-reverse','is-chaos-twist'
    ].includes(className)).join(' ');
  }

  function resetVisualState() {
    clearScheduledTasks(); removeDynamicClasses();
    slot.classList.remove('is-jackpot', 'is-spinning', 'is-stopping'); setReelMotion('');
    effectLayer.className = 'roulette-fx'; effectLayer.style.removeProperty('--roulette-fx-duration');
    sceneProp.className = 'roulette-scene-prop'; setIntruder({ intrusion:'' }, false);
    crowns.classList.remove('is-raining', 'is-sinking', 'is-constellation');
    resultRegion?.classList.remove('is-revealing', 'is-false-ending'); oracleTakeover.className = 'oracle-takeover'; hideChaosScene(); hideFishSchool();
    activeVisualResult = null; activePresentation = null; setPhase('');
    if (blast) blast.hidden = true;
  }

  function setReelCount(count = DEFAULT_REEL_TILE_COUNT) {
    const safeCount = clampReelCount(count);
    reel.dataset.reelCount = String(safeCount);
    slot.dataset.reelCount = String(safeCount);
    reel.style.setProperty('--reel-count', safeCount);
    slot.style.setProperty('--reel-count', safeCount);
    const identity = machineIdentity.querySelector?.('span');
    const detail = machineIdentity.querySelector?.('small');
    if (identity) identity.textContent = `ROYAL ORACLE // ${safeCount} WITNESSES`;
    if (detail) detail.textContent = `深海王国・${safeCount}証言神託機構`;
    return safeCount;
  }

  function renderSpinCandidates(presentation = activePresentation) {
    const count = setReelCount(presentation?.reelCount || DEFAULT_REEL_TILE_COUNT);
    reel.innerHTML = shuffledSpinImages(count).map((image, index) => tile(image, index, false, count)).join('');
  }
  function spinTiles() { return Array.from(reel.querySelectorAll?.('.shark-tile') || []); }
  function refreshSpinCandidates(result) {
    const count = activePresentation?.reelCount || spinTiles().length || DEFAULT_REEL_TILE_COUNT;
    const images = shuffledSpinImages(count);
    const center = (count - 1) / 2;
    spinTiles().forEach((item, index) => {
      const image = item.querySelector?.('img');
      if (image) image.src = Math.abs(index - center) <= .5 && result.kind === 'win' ? normalResults[0].image : images[index % images.length];
    });
  }

  function routeBeatCue(presentation, phase) {
    if (presentation.audioScene) return `${presentation.audioScene}-${phase}`;
    if (phase === 'signal') {
      if (presentation.blackout) return 'blackout';
      if (presentation.intrusion) return 'intrusion';
      if (presentation.reversal) return 'reverse';
      if (presentation.premium) return 'crown';
      return 'signal';
    }
    const sceneCues = {
      lunch:'intrusion', news:'glitch', council:'impact', sixth:'glitch', strike:'intrusion',
      'giant-fish':'reverse', commercial:'intrusion', 'royal-seal':'impact', repair:'impact',
      surface:'reverse', escape:'intrusion', cardboard:'intrusion', 'cracked-tank':'blackout',
      'verdict-book':'silence', 'golden-bubble':'revival', duel:'impact', 'crown-chase':'intrusion',
      'royal-trial':'impact', 'crown-goal':'sports-twist', 'news-live':'news-twist',
      'commercial-takeover':'commercial-twist', 'repair-disaster':'repair-twist', abandon:'abandon-twist',
      'cctv-chase':'chase-twist', 'lunch-show':'lunch-twist', 'council-deadlock':'court-twist',
      'upside-down':'gravity-twist', 'giant-naoking':'giant-twist', coronation:'crown',
      'vault-4810':'crown', 'pixel-palace':'pixel-twist'
    };
    return sceneCues[presentation.scene] || (presentation.reversal ? 'reverse' : 'reel-brake');
  }

  function applyRouteMoment(presentation, phase) {
    if (phase === 'signal') {
      setRouteReadout(presentation, phase);
      const cutinMs = cutinDuration(presentation, 'signal');
      setReelMotion(reelMotionFor(presentation, 'signal', cutinMs ? 'suspense' : (presentation.reversal ? 'reverse' : 'anticipation')));
      if (cutinMs && presentation.scene) showChaosScene(presentation, 'signal', cutinMs);
      else if (cutinMs) showTakeover(presentation, 'signal', cutinMs);
      if (presentation.fishSchool) showFishSchool(presentation, 'signal', cutinMs || 4200);
      dispatchOracleBeat(routeBeatCue(presentation, phase), { scene:presentation.audioScene || '', beat:phase, durationMs:cutinMs || 1800, reducedMotion:reducedMotion.matches, intensity:presentation.premium ? .92 : presentation.tier === 'superhot' ? .78 : .52 });
      if (presentation.intrusion) { setIntruder(presentation, true); later(() => setIntruder(presentation, false), Math.min(cutinMs || 2300, 2600)); }
      if (cutinMs) later(() => {
        if (activePresentation?.id === presentation.id && busy) setReelMotion(reelMotionFor(presentation, 'anomaly', 'anticipation'));
      }, Math.max(500, cutinMs - 500));
      if (presentation.world === 'constellation') crowns.classList.add('is-constellation');
      if (presentation.world === 'crown-sink') crowns.classList.add('is-sinking');
      if (presentation.world === 'golden-tide' || presentation.world === 'audience') crowns.classList.add('is-raining');
      if (presentation.blackout) propIn('blackout', '·', 1050);
      if (presentation.reversal) card.classList.add('is-reel-reverse');
      if (presentation.freeze) { card.classList.add('is-reel-freeze'); later(() => card.classList.remove('is-reel-freeze'), 430); }
      if (presentation.fake) flash('signal', 'SIGNAL?', 980);
    }
    if (phase === 'twist') {
      card.classList.add('is-chaos-twist');
      later(() => card.classList.remove('is-chaos-twist'), 920);
      refreshSpinCandidates(activeVisualResult);
      const cutinMs = cutinDuration(presentation, 'twist');
      setReelMotion(reelMotionFor(presentation, 'anomaly', cutinMs ? 'suspense' : (presentation.twistMotion || 'anticipation')));
      if (cutinMs && presentation.scene) showChaosScene(presentation, 'twist', cutinMs);
      else if (cutinMs) showTakeover({ ...presentation, cue:'CURRENT SHIFT', detail:'航路が途中で書き換わった。', modifier:{ cue:'', detail:'' } }, 'twist', cutinMs);
      if (presentation.fishSchool) showFishSchool(presentation, 'twist', cutinMs || 4200);
      dispatchOracleBeat(routeBeatCue(presentation, phase), {
        scene:presentation.audioScene || '', beat:phase, durationMs:cutinMs || 1900, reducedMotion:reducedMotion.matches,
        intensity:presentation.premium ? 1 : presentation.tier === 'hot' || presentation.tier === 'superhot' ? .78 : .58,
        silenceMs:['verdict-book'].includes(presentation.scene) ? 720 : undefined
      });
      if (presentation.scene === 'sixth') propIn('sixth-witness', '06', 1350);
      if (presentation.scene === 'repair') card.classList.add('is-reel-reverse');
      if (presentation.scene === 'escape') { setIntruder({ intrusion:'fish' }, true); later(() => setIntruder(presentation, false), 1250); }
      if (presentation.scene === 'coronation' || presentation.scene === 'vault-4810') crowns.classList.add('is-raining');
      if (cutinMs) later(() => {
        if (activePresentation?.id === presentation.id && busy) setReelMotion(reelMotionFor(presentation, 'anomaly', presentation.twistMotion || 'anticipation'));
      }, Math.max(500, cutinMs - 500));
    }
    if (phase === 'judgment') {
      refreshSpinCandidates(activeVisualResult);
      dispatchOracleBeat('reel-brake', { scene:presentation.audioScene || '', beat:phase, durationMs:1200, reducedMotion:reducedMotion.matches, intensity:presentation.tier === 'extreme' ? .94 : .64 });
      if (presentation.premium) flash('extreme', 'ROYAL SEAL', 1500);
      else if (presentation.tier === 'superhot') flash('hot', 'VERY HOT', 1050);
    }
  }

  const finalEffectText = Object.freeze({ rainbow:'RAINBOW SOVEREIGN', crown:'CROWN DESCENT', revival:'ROYAL REVIVAL', comet:'ROYAL COMET', abyss:'ABYSS BEAM', dry:'VERDICT STOLEN', blackout:'DEEP BLACKOUT', net:'NET FAILURE', alarm:'RED ALERT', drain:'WATER DRAIN' });

  function applyFinalEffect(result, presentation) {
    card.classList.add('is-final', `is-outcome-${result.kind}`, `is-effect-${result.effect}`, `is-route-${presentation.id}`);
    if (presentation.premium) card.classList.add('is-premium');
    if (result.kind === 'win') {
      card.classList.add('is-jackpot'); slot.classList.add('is-jackpot');
      crowns.classList.add('is-raining');
      propIn('royal-burst', '♛', presentation.premium ? 2600 : 2050);
      if (presentation.premium || ['rainbow','revival','abyss'].includes(result.effect)) setIntruder({ intrusion:'king' }, true);
      if (result.effect === 'comet') propIn('comet', '✦', 1550);
      if (result.effect === 'abyss') propIn('searchlight', '◢', 1850);
      flash(result.effect, presentation.id === 'abyssal-blackout-revival' ? 'REVIVAL // JACKPOT' : finalEffectText[result.effect], presentation.id === 'abyssal-blackout-revival' ? 2800 : 1900);
    } else if (result.kind === 'loss') {
      if (result.effect === 'net') propIn('net', '╳', 1700);
      if (result.effect === 'alarm') propIn('alarm', '!', 1600);
      if (result.effect === 'drain') propIn('drain', '↓', 1650);
      flash(result.effect, finalEffectText[result.effect], 1650);
      if (result.effect === 'dry') setIntruder({ intrusion:'dry' }, true);
    }
  }

  function updateHistory(result, presentation) {
    displayHistory.unshift({ ...result, route:presentation.id }); displayHistory.splice(3);
    if (!historyList) return;
    historyList.innerHTML = displayHistory.map(item => `<li><span>${item.title}</span><small>${item.kind === 'win' ? '大当たり' : item.kind === 'loss' ? '特殊ハズレ' : '通常'} / ${routeById.get(item.route)?.cue || 'ORACLE'}</small></li>`).join('');
  }

  function showFinal(result, presentation) {
    const reelCount = setReelCount(presentation?.reelCount || DEFAULT_REEL_TILE_COUNT);
    setReelMotion('settled'); slot.classList.remove('is-spinning', 'is-stopping'); reel.innerHTML = tileSet(result.image, reelCount, true);
    title.textContent = result.title; message.textContent = result.message;
    resultRegion?.classList.remove('is-false-ending'); resultRegion?.classList.add('is-revealing'); resultRegion?.setAttribute('aria-busy', 'false');
    setPhase('revealed'); applyFinalEffect(result, presentation); dispatchOracleResult(result, presentation);
    status.textContent = result.kind === 'win' ? 'ROYAL VERDICT // SPECIAL CONFIRMED' : result.kind === 'loss' ? 'ROYAL VERDICT // SPECIAL MISS' : 'ROYAL VERDICT // SEALED';
    setButtonCopy('もう一度、神託を回す', 'ENTER THE UNKNOWN AGAIN'); updateHistory(result, presentation); writeDailyState(result, presentation);
    busy = false;
    later(() => {
      resultRegion?.classList.remove('is-revealing'); crowns.classList.remove('is-raining', 'is-sinking', 'is-constellation');
      setIntruder(presentation, false); setPhase('resting');
    }, result.kind === 'normal' ? 1250 : 2450);
  }

  function runFalseEnding(result, presentation) {
    if (presentation.id === 'abyssal-blackout-revival') {
      const blackoutHold = 5200;
      const rebootHold = 3100;
      setPhase('fake', 'fake-loss'); setReelMotion('blackout'); card.classList.add('is-failed', 'is-fake', 'is-abyssal-blackout');
      reel.innerHTML = tileSet('assets/characters/naoking-7.webp', presentation.reelCount, true); title.textContent = '通信断';
      message.textContent = '……信号も水流も、完全に停止しました。'; resultRegion?.classList.add('is-false-ending');
      status.textContent = 'POWER FAILURE // ORACLE OFFLINE'; flash('void', 'POWER FAILURE', 4200);
      showTakeover({ ...presentation, cue:'POWER FAILURE', detail:'深海王国の全系統が停止しました。', modifier:{ cue:'', detail:'' } }, 'fake', 4200);
      dispatchOracleBeat('abyssal-blackout', { intensity:.18 });
      later(() => {
        flash('signal', '·', 900);
        dispatchOracleBeat('abyssal-distant-signal', { intensity:.22 });
      }, 3900);
      later(() => {
        card.classList.remove('is-failed', 'is-fake', 'is-abyssal-blackout'); setPhase('revival', 'jackpot');
        showTakeover({ ...presentation, cue:'SIGNAL DETECTED', detail:'深海の彼方から、王国の再起動信号。', modifier:{ cue:'', detail:'' } }, 'revival', 1700);
        flash('revival', 'REVIVAL // JACKPOT', 2500); setReelMotion('revival'); slot.classList.add('is-spinning');
        dispatchOracleBeat('abyssal-reboot', { intensity:1 });
        later(() => showFinal(result, presentation), rebootHold);
      }, blackoutHold);
      return;
    }
    const fakeHold = presentation.scene ? 1500 : 1800;
    const revivalHold = presentation.scene ? 2000 : 1600;
    setPhase('fake', 'fake-loss'); setReelMotion('settled'); card.classList.add('is-failed', 'is-fake');
    reel.innerHTML = tileSet('assets/characters/naoking-7.webp', presentation.reelCount, true); title.textContent = '判定終了';
    message.textContent = '……王冠信号なし。神託装置を停止します。'; resultRegion?.classList.add('is-false-ending');
    status.textContent = 'NO SIGNAL // SESSION CLOSED'; flash('void', 'END', 900);
    if (presentation.scene) showTakeover({ ...presentation, cue:'VERDICT CLOSED', detail:'判定書は閉じた。海は、まだ黙っている。', modifier:{ cue:'', detail:'' } }, 'fake', fakeHold);
    dispatchOracleBeat('silence', { silenceMs:Math.min(1200, fakeHold), intensity:.2 });
    later(() => {
      card.classList.remove('is-failed'); setPhase('revival', 'revival');
      if (presentation.scene) showTakeover({ ...presentation, cue:'ONE LAST CURRENT', detail:'最後の海流が、閉じた判定を押し戻す。', modifier:{ cue:'', detail:'' } }, 'revival', revivalHold);
      else showTakeover({ ...presentation, cue:'WAIT // VERDICT REVERSED', detail:'王が終了判定を却下した。', modifier:{ cue:'', detail:'' } }, 'revival', revivalHold);
      flash('revival', 'RE:START', Math.min(1800, revivalHold)); setReelMotion(presentation.reversal ? 'reverse' : 'revival'); slot.classList.add('is-spinning');
      later(() => showFinal(result, presentation), Math.max(1320, revivalHold - 220));
    }, fakeHold);
  }

  function stopWitnesses(result, presentation, onComplete) {
    const tiles = spinTiles();
    const stopGap = presentation.premium ? 205 : presentation.family === 'normal' ? 145 : 175;
    slot.classList.add('is-stopping');
    presentation.stopOrder.forEach((tileIndex, orderIndex) => {
      later(() => {
        const item = tiles[tileIndex]; const image = item?.querySelector?.('img');
        if (image) image.src = result.image;
        item?.classList.add('is-stopped'); item?.style?.setProperty('--stop-order', orderIndex);
        dispatchOracleStop(tileIndex, orderIndex, presentation.stopOrder.length);
        if (orderIndex === presentation.stopOrder.length - 1) { setPhase('verdict'); later(onComplete, presentation.premium ? 620 : 430); }
      }, orderIndex * stopGap);
    });
  }

  function spin() {
    if (locked) return;
    const now = Date.now(); taps = taps.filter(time => now - time < 2400); taps.push(now);
    if (taps.length >= 3) {
      drawToken += 1; busy = false; locked = true; resetVisualState();
      activePresentation = Object.freeze({ id:'royal-lock', family:'lock', tier:'fake-loss', world:'lock', motion:'power-cut', cue:'ROYAL LOCK', detail:'王を急かしたため装置が封印された。', modifier:{ id:'none', cue:'', detail:'' } });
      setPhase('locked', 'fake-loss'); title.textContent = 'なおキング激怒';
      message.textContent = '連打されたので、なおキングは海へ帰りました。別ページに移動して戻るまで停止中。';
      resultRegion?.setAttribute('aria-busy', 'false'); status.textContent = 'SYSTEM LOCKED // DO NOT TAP';
      setButtonCopy('なおキング、怒って停止中…', 'SYSTEM LOCKED');
      if (blast) { blast.hidden = false; later(() => { blast.hidden = true; }, 1650); }
      flash('fake', '連打厳禁', 1700);
      later(() => {
        if (!locked) return;
        syncOracleEnvironment('resting');
        oracleTierLabel.textContent = 'LOCKED';
      }, 1900);
      return;
    }
    if (busy) return;

    drawToken += 1; busy = true; resetVisualState();
    const result = resolveFinalResult();
    const presentation = choosePresentation(result, {
      spinNumber:dailyState.count + 1, isFirstToday:dailyState.count === 0, lastResult:dailyState.lastResult,
      lastRoute:dailyState.lastRoute, rareDrought:dailyState.rareDrought
    });
    activeVisualResult = result; activePresentation = presentation; resolvedDraws += 1;
    dispatchOracleDraw(presentation);

    card.classList.add(`is-route-${presentation.id}`); if (presentation.premium) card.classList.add('is-premium');
    renderSpinCandidates(presentation); slot.classList.add('is-spinning'); setRouteReadout(presentation, 'descent'); setReelMotion(reelMotionFor(presentation, 'descent', 'launch')); setPhase('descent');
    setButtonCopy(`${presentation.reelCount}つの証言を採取中…`, 'ONE DRAW // DO NOT TAP'); status.textContent = `ROUTE LOCKED // ${presentation.cue}`;
    resultRegion?.setAttribute('aria-busy', 'true'); message.textContent = '最終結果は封印済み。王国が、そこへ至る航路を選んでいる。';

    const { signalAt, twistAt, judgmentAt, stopAt } = sequenceTimings(presentation);
    later(() => { setPhase('cruise'); setReelMotion(reelMotionFor(presentation, 'cruise', 'cruise')); status.textContent = `FULL CURRENT // ${presentation.reelCount} WITNESSES ROTATING`; }, 320);
    later(() => {
      setPhase('signal', presentation.fake && result.kind === 'normal' ? 'hot' : ''); setReelMotion(reelMotionFor(presentation, 'signal', presentation.reversal ? 'reverse' : 'suspense'));
      status.textContent = `${presentation.tier.toUpperCase()} // OMEN DETECTED`; applyRouteMoment(presentation, 'signal');
    }, signalAt);
    if (twistAt) {
      later(() => {
        setPhase('anomaly'); setReelMotion(reelMotionFor(presentation, 'anomaly', 'suspense'));
        status.textContent = `${presentation.scene ? 'SCENE CHANGE' : 'CURRENT SHIFT'} // ROUTE STILL SEALED`; applyRouteMoment(presentation, 'twist');
      }, twistAt);
    }
    later(() => {
      setPhase('judgment'); setReelMotion(reelMotionFor(presentation, 'judgment', 'brake')); status.textContent = 'PRESSURE DROP // FINAL ORBIT'; applyRouteMoment(presentation, 'judgment');
    }, judgmentAt);
    later(() => {
      setReelMotion(reelMotionFor(presentation, 'stopping', 'stopping')); status.textContent = `${presentation.reelCount} WITNESSES // STAGGERED STOP`;
      stopWitnesses(result, presentation, () => { if (result.effect === 'revival') runFalseEnding(result, presentation); else showFinal(result, presentation); });
    }, stopAt);
  }

  button.addEventListener('click', spin);
  window.addEventListener('naoking:pagechange', event => {
    if (event.detail?.page === 'fortune') return;
    drawToken += 1; busy = false; locked = false; taps = []; resetVisualState(); setButtonCopy('運命を回す');
    resultRegion?.setAttribute('aria-busy', 'false'); status.textContent = 'ROYAL ORACLE // DORMANT'; title.textContent = '海の支配者';
    message.textContent = 'ボタンを押せ。なおキングが、あなたの都合を見ずに今日の運勢を決める。'; setReelCount(); reel.innerHTML = tileSet(normalResults[0].image, DEFAULT_REEL_TILE_COUNT, true);
    const routeCue = routeReadout.querySelector?.('span'); const routeDetail = routeReadout.querySelector?.('small');
    if (routeCue) routeCue.textContent = 'AWAITING CURRENT'; if (routeDetail) routeDetail.textContent = '演出航路を待機中';
  });

  function syncVisibilityState() {
    const hidden = Boolean(document.hidden);
    environmentTargets.forEach(target => target.classList.toggle('is-oracle-suspended', hidden));
    if (hidden) {
      visibilityPausedAt = Date.now();
      scheduledTasks.forEach(task => { if (task.id !== null) window.clearTimeout(task.id); task.remaining = Math.max(0, task.due - visibilityPausedAt); task.id = null; });
      return;
    }
    if (visibilityPausedAt) { visibilityPausedAt = 0; scheduledTasks.forEach(task => armTask(task)); }
  }
  document.addEventListener?.('visibilitychange', syncVisibilityState);
  reducedMotion.addEventListener?.('change', onReducedMotionChange);
  window.addEventListener?.('pagehide', event => { if (event.persisted) return; drawToken += 1; clearScheduledTasks(); clearOracleEnvironment(); });
  syncVisibilityState();

  function snapshotDrawState() {
    return { normalHistory:[...normalHistory], spinsSinceWin, bags:new Map([...messageBags].map(([key, bag]) => [key, [...bag]])), messages:new Map(lastMessageByResult), routes:[...presentationHistory], categories:[...presentationCategoryHistory] };
  }
  function restoreDrawState(snapshot) {
    normalHistory.splice(0, normalHistory.length, ...snapshot.normalHistory); spinsSinceWin = snapshot.spinsSinceWin;
    messageBags.clear(); snapshot.bags.forEach((bag, key) => messageBags.set(key, [...bag]));
    lastMessageByResult.clear(); snapshot.messages.forEach((value, key) => lastMessageByResult.set(key, value));
    presentationHistory.splice(0, presentationHistory.length, ...snapshot.routes);
    presentationCategoryHistory.splice(0, presentationCategoryHistory.length, ...(snapshot.categories || []));
  }

  function runDiagnostics(iterations = 10000) {
    const sampleSize = Math.max(1, Math.min(250000, Math.floor(Number(iterations) || 10000)));
    const snapshot = snapshotDrawState(); const counts = { normal:0, win:0, loss:0 }; const byResult = {}; const lastMessage = new Map();
    let lastNormalKey = null; let repeatedNormal = 0; let immediateMessageRepeat = 0; let integrityMismatches = 0; let nonFrozenResults = 0;
    try {
      for (let index = 0; index < sampleSize; index += 1) {
        const result = resolveFinalResult(); const template = resultByKey.get(result.key);
        if (!Object.isFrozen(result)) nonFrozenResults += 1;
        if (!template || result.kind !== template.kind || result.title !== template.title || result.image !== template.image || result.effect !== template.effect || result.duration !== template.duration || !template.messages.includes(result.message)) integrityMismatches += 1;
        counts[result.kind] += 1; byResult[result.key] = (byResult[result.key] || 0) + 1;
        if (result.kind === 'normal') { if (result.key === lastNormalKey) repeatedNormal += 1; lastNormalKey = result.key; }
        if (lastMessage.get(result.key) === result.message) immediateMessageRepeat += 1; lastMessage.set(result.key, result.message);
      }
    } finally { restoreDrawState(snapshot); }
    return Object.freeze({ iterations:sampleSize, counts:Object.freeze(counts), rates:Object.freeze(Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, value / sampleSize]))), byResult:Object.freeze(byResult), repeatedNormal, immediateMessageRepeat, integrityMismatches, nonFrozenResults });
  }

  function runMessageBagDiagnostics() {
    const snapshot = snapshotDrawState(); let duplicateWithinBag = 0; let boundaryRepeats = 0;
    try {
      messageBags.clear(); lastMessageByResult.clear();
      allResults.forEach(result => {
        let previous = null;
        for (let cycle = 0; cycle < 2; cycle += 1) {
          const seen = new Set();
          for (let index = 0; index < result.messages.length; index += 1) {
            const next = shuffledBag(result); if (seen.has(next)) duplicateWithinBag += 1; if (next === previous) boundaryRepeats += 1;
            seen.add(next); previous = next;
          }
        }
      });
    } finally { restoreDrawState(snapshot); }
    return Object.freeze({ definitions:allResults.length, duplicateWithinBag, boundaryRepeats });
  }

  function runPresentationDiagnostics(iterations = 100000) {
    const sampleSize = Math.max(1, Math.min(250000, Math.floor(Number(iterations) || 100000)));
    const snapshot = snapshotDrawState(); const routes = {}; const families = {}; const categories = {}; const endings = {}; const reelCounts = {}; const normalRoutes = new Set();
    let lastRoute = ''; let lastCategory = ''; let immediateRouteRepeat = 0; let immediateCategoryRepeat = 0; let incompatibleRoutes = 0; let resultPresentationContradictions = 0; let endingContradictions = 0; let nonFrozenPresentations = 0; let invalidStopOrders = 0; let minEstimatedRotations = Infinity;
    try {
      presentationHistory.splice(0);
      presentationCategoryHistory.splice(0);
      for (let index = 0; index < sampleSize; index += 1) {
        const result = resolveFinalResult();
        const presentation = choosePresentation(result, { spinNumber:(index % 8) + 1, isFirstToday:index === 0, lastResult:index % 29 === 0 ? result.key : '', lastRoute, rareDrought:index % 13 }, true);
        if (!Object.isFrozen(presentation) || !Object.isFrozen(presentation.stopOrder)) nonFrozenPresentations += 1;
        const uniqueStops = new Set(presentation.stopOrder);
        if (presentation.stopOrder.length !== presentation.reelCount || uniqueStops.size !== presentation.reelCount || presentation.stopOrder.some(value => value < 0 || value >= presentation.reelCount)) invalidStopOrders += 1;
        if (!routeCompatible(presentation, result)) incompatibleRoutes += 1;
        if (result.kind === 'loss' && (presentation.family === 'premium' || presentation.family === 'revival')) resultPresentationContradictions += 1;
        if (result.kind === 'normal' && ['extreme','revival','jackpot'].includes(presentation.tier)) resultPresentationContradictions += 1;
        const expectedEnding = result.effect === 'revival' ? 'revival' : result.kind;
        if (presentation.ending && presentation.ending.outcome !== expectedEnding) endingContradictions += 1;
        if (presentation.id === lastRoute) immediateRouteRepeat += 1; lastRoute = presentation.id;
        if (presentation.category === lastCategory) immediateCategoryRepeat += 1; lastCategory = presentation.category;
        routes[presentation.id] = (routes[presentation.id] || 0) + 1; families[presentation.family] = (families[presentation.family] || 0) + 1;
        categories[presentation.category] = (categories[presentation.category] || 0) + 1;
        reelCounts[presentation.reelCount] = (reelCounts[presentation.reelCount] || 0) + 1;
        if (presentation.ending) endings[`${presentation.id}:${presentation.ending.outcome}:${presentation.ending.title}`] = (endings[`${presentation.id}:${presentation.ending.outcome}:${presentation.ending.title}`] || 0) + 1;
        if (result.kind === 'normal') normalRoutes.add(presentation.id);
        minEstimatedRotations = Math.min(minEstimatedRotations, Math.floor((presentation.duration * .6) / 225));
      }
    } finally { restoreDrawState(snapshot); }
    const missingRoutes = presentationRoutes.map(route => route.id).filter(id => !routes[id]);
    const largestRouteShare = Math.max(...Object.values(routes)) / sampleSize;
    return Object.freeze({ iterations:sampleSize, routeDefinitions:presentationRoutes.length, routes:Object.freeze(routes), families:Object.freeze(families), categories:Object.freeze(categories), reelCounts:Object.freeze(reelCounts), endings:Object.freeze(endings), normalRouteCount:normalRoutes.size, missingRoutes:Object.freeze(missingRoutes), immediateRouteRepeat, immediateCategoryRepeat, incompatibleRoutes, resultPresentationContradictions, endingContradictions, nonFrozenPresentations, invalidStopOrders, largestRouteShare, minEstimatedRotations, textCutinShare:(categories['text-cutin'] || 0) / sampleSize, fullEventShare:(categories['full-event'] || 0) / sampleSize });
  }

  function runCutinDiagnostics() {
    const routes = presentationRoutes.map(route => {
      const timings = sequenceTimings(route);
      const endings = eventEndings[route.id] || {};
      return Object.freeze({
        id:route.id,
        scene:Boolean(route.scene), family:route.family, category:presentationCategory(route),
        sceneId:route.scene || '', audioScene:route.audioScene || '', reelCount:clampReelCount(route.reelCount), reelGrammar:route.reelGrammar || '', fishSchool:route.fishSchool || '',
        endingOutcomes:Object.freeze(Object.keys(endings)),
        endingVariantCount:Object.values(endings).reduce((total, entries) => total + entries.length, 0),
        signalDwell:timings.signalDwell,
        twistDwell:timings.twistDwell,
        signalToTwist:timings.twistAt ? timings.twistAt - timings.signalAt : 0,
        signalAt:timings.signalAt,
        twistAt:timings.twistAt,
        judgmentAt:timings.judgmentAt,
        stopAt:timings.stopAt
      });
    });
    const scenes = routes.filter(route => route.scene);
    const cutins = routes.filter(route => route.signalDwell > 0);
    const textCutins = cutins.filter(route => presentationCategory(routeById.get(route.id) || {}) === 'text-cutin');
    const restartRoute = routes.find(route => route.id === 'abyssal-blackout-revival');
    return Object.freeze({
      sceneCount:scenes.length,
      routeCount:routes.length,
      cutinRouteCount:cutins.length,
      shortestSignalDwell:Math.min(...cutins.map(route => route.signalDwell)),
      shortestTwistDwell:Math.min(...cutins.map(route => route.twistDwell)),
      shortestTextSignalDwell:Math.min(...textCutins.map(route => route.signalDwell)),
      shortestSceneSignalDwell:Math.min(...scenes.map(scene => scene.signalDwell)),
      shortestSceneTwistDwell:Math.min(...scenes.map(scene => scene.twistDwell)),
      shortestSignalToTwist:Math.min(...routes.filter(route => route.twistAt).map(route => route.signalToTwist)),
      netLossImage:resultByKey.get('net')?.image || '',
      restartRoute:Object.freeze(restartRoute || {}),
      routes:Object.freeze(routes)
    });
  }

  setReelCount(); reel.innerHTML = tileSet(normalResults[0].image, DEFAULT_REEL_TILE_COUNT, true); status.textContent = 'ROYAL ORACLE // DORMANT';
  if (!window.location || ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    window.NaokingRouletteDebug = Object.freeze({
      baseProbabilities:Object.freeze({ normal:0.76, specialWin:0.14, specialLoss:0.10 }), pityRule:'The eighth consecutive non-winning draw becomes rainbow.',
      presentationRule:'A frozen result is chosen before an independent compatible presentation route.', routeCount:presentationRoutes.length,
      expansion:Object.freeze({ version:expansion.version || '', research:expansion.research || {}, routeCount:(expansion.routes || []).length, fishFamilies:Object.freeze([...new Set((expansion.routes || []).map(route => route.fishSchool).filter(Boolean))]), reelGrammars:Object.freeze(Object.keys(reelGrammars)) }),
      getState:() => Object.freeze({ busy, locked, resolvedDraws, timerCount:scheduledTasks.length, phase:card.dataset.roulettePhase || '', motion:card.dataset.reelMotion || '', route:activePresentation?.id || '', category:activePresentation?.category || '', reelCount:Number(reel.dataset.reelCount || DEFAULT_REEL_TILE_COUNT), environmentClassCount:activeEnvironmentClasses.size, environmentClasses:[...activeEnvironmentClasses], normalHistory:[...normalHistory], presentationHistory:[...presentationHistory], presentationCategoryHistory:[...presentationCategoryHistory], displayed:displayHistory.map(item => item.key) }),
      runDiagnostics, runMessageBagDiagnostics, runPresentationDiagnostics, runCutinDiagnostics
    });
  }
})();
