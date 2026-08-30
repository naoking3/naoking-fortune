/*
 * ROYAL ORACLE REBIRTH
 * --------------------
 * This is the only roulette controller. Every click freezes one result first;
 * a second, independent draw then chooses how that result is presented. The
 * presentation layer may lie, stall, black out or revive, but it may never
 * replace the frozen title, image, message or effect.
 */
(() => {
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
  const REEL_TILE_COUNT = 5;
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
    { key:'net', kind:'loss', title:'網にかかった運', image:'assets/characters/naoking-3.webp', effect:'net', duration:2050, messages:[
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
    { id:'quiet-tide', family:'normal', kinds:['normal'], weight:1.45, tier:'normal', world:'quiet', motion:'cascade', duration:3900, cue:'QUIET TIDE', detail:'静かな海流が五つの証言を運ぶ。' },
    { id:'pearl-procession', family:'normal', kinds:['normal'], weight:1.15, tier:'normal', world:'pearls', motion:'outside-in', duration:4050, cue:'PEARL PROCESSION', detail:'微細な真珠泡が順番を決める。' },
    { id:'sonar-five', family:'normal', kinds:['normal'], weight:1.1, tier:'signal', world:'sonar', motion:'center-last', duration:4200, cue:'FIVEFOLD SONAR', detail:'五回の反響から本命を探知。' },
    { id:'crown-shadow', family:'normal', kinds:['normal'], weight:.82, tier:'signal', world:'shadow', motion:'edge-first', duration:4300, cue:'CROWN SHADOW', detail:'王冠の影だけが先に通過した。', fake:true },
    { id:'biolume-drift', family:'normal', kinds:['normal'], weight:1.18, tier:'normal', world:'biolume', motion:'wave', duration:4000, cue:'BIOLUME DRIFT', detail:'発光する海流が判定を撫でていく。' },
    { id:'depth-skip', family:'normal', kinds:['normal'], weight:.9, tier:'signal', world:'depth', motion:'skip', duration:4250, cue:'DEPTH SKIP', detail:'深度計が一層だけ飛んだ。結果はまだ普通だ。' },
    { id:'court-whisper', family:'normal', kinds:['normal'], weight:1.12, tier:'normal', world:'whisper', motion:'whisper', duration:3950, cue:'COURT WHISPER', detail:'宮廷の小声が停止順を変えた。' },
    { id:'blue-hour', family:'normal', kinds:['normal'], weight:1.05, tier:'normal', world:'blue-hour', motion:'synchronous', duration:4100, cue:'BLUE HOUR', detail:'海が青白く静まり、五枚が同時に息をする。' },
    { id:'false-crown', family:'false-signal', kinds:['normal'], weight:.46, tier:'hot', world:'false-crown', motion:'center-last', duration:4750, cue:'CROWN SIGNAL?', detail:'王冠信号を検知。……一秒後、何事もなく消えた。', fake:true, freeze:true },
    { id:'sleeping-king', family:'intrusion', kinds:['normal'], weight:.5, tier:'signal', world:'sleep', motion:'lazy', duration:4400, cue:'SLEEPING KING', detail:'眠い王が画面外から一度だけ覗く。', intrusion:'sleepy' },

    { id:'royal-intrusion', family:'intrusion', kinds:['win'], weight:1.15, tier:'superhot', world:'royal', motion:'push', duration:5200, cue:'THE KING INTERVENES', detail:'なおキングが五枚目を自分で押し込む。', intrusion:'king' },
    { id:'palace-floodlights', family:'environment', kinds:['win'], weight:1.05, tier:'superhot', world:'floodlights', motion:'outside-in', duration:5000, cue:'PALACE FLOODLIGHTS', detail:'宮殿の光がサイト全体から一点へ集まる。' },
    { id:'reel-reversal', family:'reel-event', kinds:['win'], weight:.92, tier:'hot', world:'reverse', motion:'reverse', duration:5350, cue:'CURRENT REVERSAL', detail:'停止寸前、海流とリールが逆転する。', reversal:true },
    { id:'abyss-constellation', family:'environment', kinds:['win'], weight:.82, tier:'superhot', world:'constellation', motion:'center-last', duration:5400, cue:'ABYSS CONSTELLATION', detail:'気泡が王冠座を作り、中央証言を指す。' },
    { id:'crown-lock', family:'reel-event', kinds:['win'], weight:.88, tier:'superhot', world:'crown-lock', motion:'edge-first', duration:5250, cue:'ROYAL FREEZE', detail:'全世界が凍結し、王冠だけが動く。', freeze:true },
    { id:'tidal-ascension', family:'environment', kinds:['win'], weight:1.08, tier:'hot', world:'ascension', motion:'wave', duration:4900, cue:'TIDAL ASCENSION', detail:'上向きの海流が装置を持ち上げる。' },
    { id:'five-witnesses', family:'rule-change', kinds:['win'], weight:1.2, tier:'hot', world:'tribunal', motion:'witnesses', duration:5050, cue:'FIVE WITNESSES', detail:'五人の証言を一枚ずつ採決する。' },

    { id:'dry-shark-theft', family:'intrusion', kinds:['loss'], weight:1.2, tier:'fake-loss', world:'dry', motion:'theft', duration:4750, cue:'VERDICT STOLEN', detail:'干からびた王が当たり札だけ持ち去る。', intrusion:'dry', fake:true },
    { id:'power-failure', family:'blackout', kinds:['loss'], weight:1.05, tier:'fake-loss', world:'blackout', motion:'power-cut', duration:4800, cue:'POWER FAILURE', detail:'装置も海流も消え、非常灯だけが残る。', blackout:true, freeze:true },
    { id:'crown-sink', family:'environment', kinds:['loss'], weight:1.08, tier:'fake-loss', world:'crown-sink', motion:'outside-in', duration:4550, cue:'THE CROWN SINKS', detail:'王冠だけが静かに結果より深く沈む。' },
    { id:'fish-confiscation', family:'intrusion', kinds:['loss'], weight:.92, tier:'fake-loss', world:'fish', motion:'edge-first', duration:4650, cue:'EVIDENCE CONFISCATED', detail:'小魚の群れが判定資料を回収した。', intrusion:'fish' },
    { id:'undertow-ejection', family:'environment', kinds:['loss'], weight:1.0, tier:'fake-loss', world:'undertow', motion:'reverse', duration:4700, cue:'UNDERTOW', detail:'逆流が五枚の証言を画面外へ流す。', reversal:true },
    { id:'cold-court', family:'typography', kinds:['loss'], weight:1.08, tier:'fake-loss', world:'cold', motion:'synchronous', duration:4450, cue:'CASE DISMISSED', detail:'宮廷システムが一行だけで冷たく棄却。' },
    { id:'depth-collapse', family:'typography', kinds:['loss'], weight:.95, tier:'fake-loss', world:'depth-collapse', motion:'skip', duration:4750, cue:'DEPTH // -99999', detail:'深度表示が壊れ、判定も海底へ落ちる。' },

    { id:'crown-defibrillator', family:'revival', kinds:['win'], effects:['revival'], weight:1.15, tier:'revival', world:'defibrillator', motion:'center-last', duration:6500, cue:'CROWN DEFIBRILLATOR', detail:'停止した海へ王冠が一撃。世界が再起動する。', fake:true, freeze:true },
    { id:'oracle-rewind', family:'revival', kinds:['win'], effects:['revival'], weight:1.0, tier:'revival', world:'rewind', motion:'reverse', duration:6700, cue:'ORACLE REWIND', detail:'敗北の一秒を海流ごと巻き戻す。', fake:true, reversal:true },
    { id:'king-return', family:'revival', kinds:['win'], effects:['revival'], weight:.9, tier:'revival', world:'king-return', motion:'push', duration:6400, cue:'THE KING RETURNS', detail:'帰ったはずのなおキングが結果を裏返す。', fake:true, intrusion:'king' },
    { id:'light-reboot', family:'revival', kinds:['win'], effects:['revival'], weight:1.05, tier:'revival', world:'reboot', motion:'outside-in', duration:6600, cue:'KINGDOM REBOOT', detail:'非常灯から順に王国の光が蘇る。', fake:true, blackout:true },

    { id:'royal-audience', family:'premium', kinds:['win'], effects:['rainbow','crown','abyss'], weight:.16, tier:'extreme', world:'audience', motion:'witnesses', duration:6900, cue:'ROYAL AUDIENCE', detail:'神託装置が消え、王国そのものが謁見室になる。', premium:true, intrusion:'king', freeze:true },
    { id:'golden-tide', family:'premium', kinds:['win'], effects:['rainbow','crown'], weight:.14, tier:'extreme', world:'golden-tide', motion:'wave', duration:6800, cue:'GOLDEN TIDE', detail:'金の海流がページの端から端まで満ちる。', premium:true },
    { id:'secret-4810', family:'secret', kinds:['win'], weight:.09, tier:'extreme', world:'secret-4810', motion:'skip', duration:7100, cue:'DEPTH 4810 // UNSEALED', detail:'普段は閉じた第四八一〇王室記録が開く。', premium:true, blackout:true },
    { id:'palace-open', family:'premium', kinds:['win'], effects:['rainbow','comet'], weight:.13, tier:'extreme', world:'palace-open', motion:'outside-in', duration:7000, cue:'THE PALACE OPENS', detail:'背景の海が割れ、その奥に王宮の光が現れる。', premium:true, freeze:true }
  ].map(route => Object.freeze(route)));

  const routeById = new Map(presentationRoutes.map(route => [route.id, route]));
  const presentationHistory = [];
  const routeStopOrders = Object.freeze({
    cascade:[0,1,2,3,4], 'outside-in':[0,4,1,3,2], 'center-last':[1,3,0,4,2],
    'edge-first':[4,0,3,1,2], wave:[0,2,4,1,3], skip:[1,4,0,3,2],
    whisper:[2,1,3,0,4], synchronous:[0,1,2,3,4], lazy:[0,2,1,4,3],
    push:[4,3,2,1,0], reverse:[4,3,2,1,0], witnesses:[0,4,1,3,2],
    theft:[2,0,4,1,3], 'power-cut':[0,4,2,1,3]
  });

  function routeCompatible(route, result) {
    if (!route.kinds.includes(result.kind)) return false;
    if (route.effects && !route.effects.includes(result.effect)) return false;
    if (result.effect === 'revival' && route.family !== 'revival') return false;
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
      if (presentationHistory[0] === route.id) weight = 0;
      else if (presentationHistory.slice(1, 4).includes(route.id)) weight *= .22;
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
    }
    const jitter = reducedMotion.matches ? 0 : Math.floor(Math.random() * 260);
    return Object.freeze({
      ...route, duration:route.duration + jitter, modifier:presentationModifier(result, context),
      stopOrder:Object.freeze([...(routeStopOrders[route.motion] || routeStopOrders.cascade)])
    });
  }

  const tile = (image, index = 0, stopped = false) => `<div class="shark-tile${stopped ? ' is-stopped' : ''}" data-reel-index="${index}"><span aria-hidden="true">0${index + 1}</span><img class="shark-face" src="${image}" alt="なおキング" draggable="false"></div>`;
  const fiveTiles = (image, stopped = false) => Array.from({ length:REEL_TILE_COUNT }, (_, index) => tile(image, index, stopped)).join('');
  const shuffledSpinImages = () => {
    const images = normalResults.map(result => result.image);
    for (let index = images.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [images[index], images[swapIndex]] = [images[swapIndex], images[index]];
    }
    return images.slice(0, REEL_TILE_COUNT);
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

  let busy = false;
  let locked = false;
  let taps = [];
  let scheduledTasks = [];
  let drawToken = 0;
  let resolvedDraws = 0;
  let activeVisualResult = null;
  let activePresentation = null;
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
    if (phase === 'judgment') return tier === 'normal' ? 'ANTICIPATION' : oracleTierLabels[tier] || 'ANTICIPATION';
    if (phase === 'verdict') return 'STAGGERED STOP';
    if (phase === 'fake') return 'SIGNAL LOST';
    if (phase === 'revival') return 'WORLD RESTART';
    if (phase === 'locked') return 'SYSTEM LOCK';
    return oracleTierLabels[tier] || 'DORMANT';
  }

  function dispatchOracleEvent(phase, tier) {
    if (typeof window.dispatchEvent !== 'function' || typeof window.CustomEvent !== 'function') return;
    window.dispatchEvent(new window.CustomEvent('naoking:oraclephase', { detail:{ phase, tier, route:activePresentation?.id || '', family:activePresentation?.family || '', resultKind:activeVisualResult?.kind || '' } }));
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
    if (activeVisualResult?.kind) classes.push(`oracle-outcome-${activeVisualResult.kind}`);
    if (activeVisualResult?.effect) classes.push(`oracle-effect-${activeVisualResult.effect}`);
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
    const phaseIndex = { descent:0, cruise:1, signal:2, judgment:2, verdict:3, fake:3, revival:3, revealed:3, resting:3 }[phase] ?? -1;
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

  function removeDynamicClasses() {
    const classNames = String(card.className || '').split(/\s+/).filter(Boolean);
    card.className = classNames.filter(className => !className.startsWith('is-outcome-') && !className.startsWith('is-effect-') && !className.startsWith('is-route-') && ![
      'is-jackpot','is-failed','is-revival','is-final','is-fake','is-premium','is-reel-freeze','is-reel-reverse'
    ].includes(className)).join(' ');
  }

  function resetVisualState() {
    clearScheduledTasks(); removeDynamicClasses();
    slot.classList.remove('is-jackpot', 'is-spinning', 'is-stopping'); setReelMotion('');
    effectLayer.className = 'roulette-fx'; effectLayer.style.removeProperty('--roulette-fx-duration');
    sceneProp.className = 'roulette-scene-prop'; setIntruder({ intrusion:'' }, false);
    crowns.classList.remove('is-raining', 'is-sinking', 'is-constellation');
    resultRegion?.classList.remove('is-revealing', 'is-false-ending'); oracleTakeover.className = 'oracle-takeover';
    activeVisualResult = null; activePresentation = null; setPhase('');
    if (blast) blast.hidden = true;
  }

  function renderSpinCandidates() { reel.innerHTML = shuffledSpinImages().map((image, index) => tile(image, index)).join(''); }
  function spinTiles() { return Array.from(reel.querySelectorAll?.('.shark-tile') || []); }
  function refreshSpinCandidates(result) {
    const images = shuffledSpinImages();
    spinTiles().forEach((item, index) => {
      const image = item.querySelector?.('img');
      if (image) image.src = index === 2 && result.kind === 'win' ? normalResults[0].image : images[index % images.length];
    });
  }

  function applyRouteMoment(presentation, phase) {
    if (phase === 'signal') {
      setRouteReadout(presentation, phase); showTakeover(presentation, 'signal', presentation.premium ? 1750 : 1150);
      if (presentation.intrusion) { setIntruder(presentation, true); later(() => setIntruder(presentation, false), 1650); }
      if (presentation.world === 'constellation') crowns.classList.add('is-constellation');
      if (presentation.world === 'crown-sink') crowns.classList.add('is-sinking');
      if (presentation.world === 'golden-tide' || presentation.world === 'audience') crowns.classList.add('is-raining');
      if (presentation.blackout) propIn('blackout', '·', 1050);
      if (presentation.reversal) card.classList.add('is-reel-reverse');
      if (presentation.freeze) { card.classList.add('is-reel-freeze'); later(() => card.classList.remove('is-reel-freeze'), 430); }
      if (presentation.fake) flash('signal', 'SIGNAL?', 980);
    }
    if (phase === 'judgment') {
      refreshSpinCandidates(activeVisualResult);
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
      if (result.effect === 'crown' || presentation.world === 'golden-tide') crowns.classList.add('is-raining');
      if (result.effect === 'comet') propIn('comet', '✦', 1550);
      if (result.effect === 'abyss') propIn('searchlight', '◢', 1850);
      flash(result.effect, finalEffectText[result.effect], 1900);
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
    setReelMotion('settled'); slot.classList.remove('is-spinning', 'is-stopping'); reel.innerHTML = fiveTiles(result.image, true);
    title.textContent = result.title; message.textContent = result.message;
    resultRegion?.classList.remove('is-false-ending'); resultRegion?.classList.add('is-revealing'); resultRegion?.setAttribute('aria-busy', 'false');
    setPhase(result.effect === 'revival' ? 'revival' : 'revealed'); applyFinalEffect(result, presentation);
    status.textContent = result.kind === 'win' ? 'ROYAL VERDICT // SPECIAL CONFIRMED' : result.kind === 'loss' ? 'ROYAL VERDICT // SPECIAL MISS' : 'ROYAL VERDICT // SEALED';
    setButtonCopy('もう一度、神託を回す', 'ENTER THE UNKNOWN AGAIN'); updateHistory(result, presentation); writeDailyState(result, presentation);
    busy = false;
    later(() => {
      resultRegion?.classList.remove('is-revealing'); crowns.classList.remove('is-raining', 'is-sinking', 'is-constellation');
      setIntruder(presentation, false); setPhase('resting');
    }, result.kind === 'normal' ? 1250 : 2450);
  }

  function runFalseEnding(result, presentation) {
    setPhase('fake', 'fake-loss'); setReelMotion('settled'); card.classList.add('is-failed', 'is-fake');
    reel.innerHTML = fiveTiles('assets/characters/naoking-7.webp', true); title.textContent = '判定終了';
    message.textContent = '……王冠信号なし。神託装置を停止します。'; resultRegion?.classList.add('is-false-ending');
    status.textContent = 'NO SIGNAL // SESSION CLOSED'; flash('void', 'END', 900);
    later(() => {
      card.classList.remove('is-failed'); setPhase('revival', 'revival');
      showTakeover({ ...presentation, cue:'WAIT // VERDICT REVERSED', detail:'王が終了判定を却下した。', modifier:{ cue:'', detail:'' } }, 'revival', 1450);
      flash('revival', 'RE:START', 1450); setReelMotion(presentation.reversal ? 'reverse' : 'revival'); slot.classList.add('is-spinning');
      later(() => showFinal(result, presentation), 1320);
    }, 1080);
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

    card.classList.add(`is-route-${presentation.id}`); if (presentation.premium) card.classList.add('is-premium');
    renderSpinCandidates(); slot.classList.add('is-spinning'); setRouteReadout(presentation, 'descent'); setReelMotion('launch'); setPhase('descent');
    setButtonCopy('五つの証言を採取中…', 'ONE DRAW // DO NOT TAP'); status.textContent = `ROUTE LOCKED // ${presentation.cue}`;
    resultRegion?.setAttribute('aria-busy', 'true'); message.textContent = '最終結果は封印済み。王国が、そこへ至る航路を選んでいる。';

    const total = presentation.duration;
    const signalAt = Math.round(total * .38);
    const judgmentAt = Math.round(total * .61);
    const stopAt = Math.round(total * .76);
    later(() => { setPhase('cruise'); setReelMotion('cruise'); status.textContent = 'FULL CURRENT // WITNESSES ROTATING'; }, 320);
    later(() => {
      setPhase('signal', presentation.fake && result.kind === 'normal' ? 'hot' : ''); setReelMotion(presentation.reversal ? 'reverse' : 'anticipation');
      status.textContent = `${presentation.tier.toUpperCase()} // OMEN DETECTED`; applyRouteMoment(presentation, 'signal');
    }, signalAt);
    later(() => {
      setPhase('judgment'); setReelMotion('brake'); status.textContent = 'PRESSURE DROP // FINAL ORBIT'; applyRouteMoment(presentation, 'judgment');
    }, judgmentAt);
    later(() => {
      setReelMotion('stopping'); status.textContent = 'FIVE WITNESSES // STAGGERED STOP';
      stopWitnesses(result, presentation, () => { if (result.effect === 'revival') runFalseEnding(result, presentation); else showFinal(result, presentation); });
    }, stopAt);
  }

  button.addEventListener('click', spin);
  window.addEventListener('naoking:pagechange', event => {
    if (event.detail?.page === 'fortune') return;
    drawToken += 1; busy = false; locked = false; taps = []; resetVisualState(); setButtonCopy('運命を回す');
    resultRegion?.setAttribute('aria-busy', 'false'); status.textContent = 'ROYAL ORACLE // DORMANT'; title.textContent = '海の支配者';
    message.textContent = 'ボタンを押せ。なおキングが、あなたの都合を見ずに今日の運勢を決める。'; reel.innerHTML = fiveTiles(normalResults[0].image, true);
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
    return { normalHistory:[...normalHistory], spinsSinceWin, bags:new Map([...messageBags].map(([key, bag]) => [key, [...bag]])), messages:new Map(lastMessageByResult), routes:[...presentationHistory] };
  }
  function restoreDrawState(snapshot) {
    normalHistory.splice(0, normalHistory.length, ...snapshot.normalHistory); spinsSinceWin = snapshot.spinsSinceWin;
    messageBags.clear(); snapshot.bags.forEach((bag, key) => messageBags.set(key, [...bag]));
    lastMessageByResult.clear(); snapshot.messages.forEach((value, key) => lastMessageByResult.set(key, value));
    presentationHistory.splice(0, presentationHistory.length, ...snapshot.routes);
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
    const snapshot = snapshotDrawState(); const routes = {}; const families = {}; const normalRoutes = new Set();
    let lastRoute = ''; let immediateRouteRepeat = 0; let incompatibleRoutes = 0; let resultPresentationContradictions = 0; let nonFrozenPresentations = 0; let minEstimatedRotations = Infinity;
    try {
      presentationHistory.splice(0);
      for (let index = 0; index < sampleSize; index += 1) {
        const result = resolveFinalResult();
        const presentation = choosePresentation(result, { spinNumber:(index % 8) + 1, isFirstToday:index === 0, lastResult:index % 29 === 0 ? result.key : '', lastRoute, rareDrought:index % 13 }, true);
        if (!Object.isFrozen(presentation) || !Object.isFrozen(presentation.stopOrder)) nonFrozenPresentations += 1;
        if (!routeCompatible(presentation, result)) incompatibleRoutes += 1;
        if (result.kind === 'loss' && (presentation.family === 'premium' || presentation.family === 'revival')) resultPresentationContradictions += 1;
        if (result.kind === 'normal' && ['extreme','revival','jackpot'].includes(presentation.tier)) resultPresentationContradictions += 1;
        if (presentation.id === lastRoute) immediateRouteRepeat += 1; lastRoute = presentation.id;
        routes[presentation.id] = (routes[presentation.id] || 0) + 1; families[presentation.family] = (families[presentation.family] || 0) + 1;
        if (result.kind === 'normal') normalRoutes.add(presentation.id);
        minEstimatedRotations = Math.min(minEstimatedRotations, Math.floor((presentation.duration * .6) / 225));
      }
    } finally { restoreDrawState(snapshot); }
    const missingRoutes = presentationRoutes.map(route => route.id).filter(id => !routes[id]);
    const largestRouteShare = Math.max(...Object.values(routes)) / sampleSize;
    return Object.freeze({ iterations:sampleSize, routeDefinitions:presentationRoutes.length, routes:Object.freeze(routes), families:Object.freeze(families), normalRouteCount:normalRoutes.size, missingRoutes:Object.freeze(missingRoutes), immediateRouteRepeat, incompatibleRoutes, resultPresentationContradictions, nonFrozenPresentations, largestRouteShare, minEstimatedRotations });
  }

  reel.innerHTML = fiveTiles(normalResults[0].image, true); status.textContent = 'ROYAL ORACLE // DORMANT';
  if (!window.location || ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    window.NaokingRouletteDebug = Object.freeze({
      baseProbabilities:Object.freeze({ normal:0.76, specialWin:0.14, specialLoss:0.10 }), pityRule:'The eighth consecutive non-winning draw becomes rainbow.',
      presentationRule:'A frozen result is chosen before an independent compatible presentation route.', routeCount:presentationRoutes.length,
      getState:() => Object.freeze({ busy, locked, resolvedDraws, timerCount:scheduledTasks.length, phase:card.dataset.roulettePhase || '', motion:card.dataset.reelMotion || '', route:activePresentation?.id || '', environmentClassCount:activeEnvironmentClasses.size, environmentClasses:[...activeEnvironmentClasses], normalHistory:[...normalHistory], presentationHistory:[...presentationHistory], displayed:displayHistory.map(item => item.key) }),
      runDiagnostics, runMessageBagDiagnostics, runPresentationDiagnostics
    });
  }
})();
