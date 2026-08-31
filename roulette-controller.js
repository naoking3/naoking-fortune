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
  const DEFAULT_BUTTON_HINT = '押したら、あとは王に任せろ';

  const routeLabels = Object.freeze({
    'quiet-tide':'穏やかな海流', 'pearl-procession':'真珠泡の行列', 'sonar-five':'5回の反響',
    'crown-shadow':'王冠の影', 'biolume-drift':'光る海流', 'depth-skip':'深さが飛んだ',
    'court-whisper':'王国のひそひそ話', 'blue-hour':'青白い静けさ', 'false-crown':'王冠の気配？',
    'sleeping-king':'眠い王が来た', 'royal-lunch-break':'王の昼休み', 'abyss-news-break':'深海の速報',
    'emergency-council':'王国の緊急会議', 'sixth-witness':'6枚目が来た？', 'reel-labor-strike':'絵柄が休憩中',
    'giant-fish-traffic':'巨大魚が通ります', 'royal-commercial':'王からのお知らせ', 'do-not-press-seal':'押すなと言われた王印',
    'deep-sea-duel':'深海の一騎打ち', 'crown-chase':'逃げる王冠を追え', 'royal-trial':'王国の結果会議',
    'crown-goal-challenge':'王冠ゴール挑戦', 'abyss-news-live':'深海ニュース生中継',
    'royal-commercial-takeover':'王国広告が乱入', 'oracle-repair-disaster':'占い機の修理事故',
    'judgment-abandoned':'王が結果決めを放棄', 'cctv-result-chase':'逃げた結果を追え',
    'royal-lunch-show':'王の昼食番組', 'council-deadlock':'会議がまとまらない',
    'upside-down-kingdom':'王国が上下逆さま', 'giant-naoking-inspection':'巨大なおキング点検',
    'royal-intrusion':'王が自分で乱入', 'palace-floodlights':'王宮の光が集中', 'reel-reversal':'海流が逆回転',
    'abyss-constellation':'泡の王冠座', 'crown-lock':'王冠だけが動く', 'tidal-ascension':'上向きの海流',
    'five-witnesses':'5枚で多数決', 'reel-jam-repair':'絵柄づまりを修理', 'surface-breach':'海面まで急浮上',
    'witness-escape':'絵柄が逃げた', 'dry-shark-theft':'干からび王の横取り', 'power-failure':'王国ぜんぶ停電',
    'crown-sink':'王冠が沈む', 'fish-confiscation':'小魚が結果を回収', 'undertow-ejection':'逆流で画面外へ',
    'cold-court':'冷たいハズレ通知', 'depth-collapse':'深さメーターが故障', 'cardboard-crown':'段ボール王冠',
    'cracked-kingdom-tank':'王国水槽にひび', 'crown-defibrillator':'王冠の一撃で復活',
    'oracle-rewind':'ハズレを巻き戻す', 'king-return':'王が戻ってきた', 'light-reboot':'王国の光が復活',
    'verdict-book-reversal':'結果の本が逆開き', 'single-golden-bubble':'金の泡が一つ',
    'abyssal-blackout-revival':'完全停電から大逆転', 'royal-audience':'王の特別お披露目',
    'golden-tide':'金色の海流', 'secret-4810':'秘密の深さ4810', 'palace-open':'王宮への道が開く',
    'pixel-palace-bonus':'8ビット王宮'
  });

  const shortCopy = Object.freeze({
    'FIRST TIDE TODAY':'今日最初の占い', 'FIFTH COURT BELL':'今日5回目の王国ベル',
    'VERDICT ECHO':'前回の結果が反響中', 'LONG SILENCE':'長い静けさ',
    'CURRENT SHIFT':'海流が変わった', 'SIGNAL?':'何か来た？', 'ROYAL SEAL':'王の印',
    'VERY HOT':'かなり期待できる', 'REVIVAL // JACKPOT':'逆転大当たり',
    'POWER FAILURE':'王国停電', 'RE:START':'再始動', 'END':'終了',
    'UNAUTHORIZED INPUT':'勝手に押した', 'ORACLE':'占い',
    'LIVE':'生中継', 'CM':'広告', 'VS':'対決', '0M':'海面', 'GOAL':'ゴール',
    'CAM':'監視中', '8BIT':'ドット絵', 'LOCKED':'封印中'
  });

  const copyReplacements = Object.freeze([
    [/Retro Fanfare/g, '懐かしい勝利音'], [/JACKPOT/g, '大当たり'], [/Jackpot/g, '大当たり'],
    [/\bLIVE\b/g, '生中継'], [/\bCUT\b/g, '終了'], [/Boss Room/g, '最後の部屋'], [/8-bit/gi, 'ドット絵'],
    [/\bFrame\b/g, '瞬間'], [/\bStorm\b/g, '嵐'], [/\bElevator\b/g, '昇降機'], [/\bSeal\b/g, '王印'],
    [/Studio/g, '放送室'], [/Camera/g, 'カメラ'], [/CAMERA/g, 'カメラ'], [/Ticker/g, '速報字幕'],
    [/Jingle/g, '短い音'], [/Beep/g, '電子音'], [/Page/g, '画面全体'], [/Footer/g, '画面の下'],
    [/Panel/g, '表示板'], [/Tape/g, 'テープ'], [/Key/g, 'カギ'], [/Gate/g, '門'], [/OPEN/g, '開門'],
    [/Keeper/g, '守り役'], [/Menu/g, '献立'], [/Dessert/g, '甘味'], [/UI/g, '画面の部品'],
    [/Scene/g, '演出'], [/Pixel/g, '小さな点'], [/Premium/g, '特別'], [/Royal/g, '王国級'],
    [/サーチライト/g, '光'], [/モード/g, '状態'], [/システム/g, '仕組み'], [/監査/g, '点検'],
    [/Roulette/g, 'ルーレット'], [/CM/g, '広告'], [/Hero/g, '画面上部'],
    [/神託装置/g, '占い機'], [/神託/g, '占い'], [/五人の証言/g, '5枚の絵柄'],
    [/五つの証言/g, '5枚の絵柄'], [/五証言/g, '5枚判定'], [/全証人/g, '全部の絵柄'],
    [/第六証人/g, '6枚目の絵柄'], [/第三証人/g, '3枚目の絵柄'], [/証言席/g, '絵柄の列'],
    [/証人/g, '絵柄'], [/証言/g, '絵柄'], [/敗北判定書/g, 'ハズレの結果帳'], [/敗北判定/g, 'ハズレ結果'],
    [/勝利判定/g, '大当たり'], [/通常判定/g, 'いつもの結果'], [/特殊判定/g, '特別な結果'],
    [/ハズレ判定/g, 'ハズレ'], [/静止画判定/g, '止まった位置'], [/判定不能/g, '結果を出せない'],
    [/判定した/g, '結果を決めた'], [/判定を/g, '結果を'], [/判定が/g, '結果が'], [/判定は/g, '結果は'],
    [/判定へ/g, '結果へ'], [/判定だけ/g, '結果だけ'], [/判定/g, '結果'],
    [/判決入り封筒/g, '結果入りの封筒'], [/判決封筒/g, '結果の封筒'], [/判決/g, '結果'],
    [/評決/g, '最終結果'], [/法廷/g, '結果会議'], [/開廷/g, '会議開始'], [/閉廷/g, '会議終了'],
    [/休廷/g, '会議はお休み'], [/敗訴/g, 'ハズレ'], [/勝訴/g, '大当たり'], [/無罪/g, '大当たり'],
    [/有罪/g, 'ハズレ'], [/申立て/g, 'お願い'], [/棄却/g, '却下'], [/再審/g, 'やり直し'],
    [/採決/g, '多数決'], [/議事録/g, '会議メモ'], [/議席/g, 'みんな'], [/再可決/g, '決まり直し'],
    [/可決/g, '決定'], [/棄権/g, '答えない'], [/布告/g, 'お知らせ札'], [/宮廷/g, '王国'],
    [/筐体/g, '占い機'], [/航路/g, '演出'], [/競技委員/g, '見張り役'], [/裁定/g, '結果決め']
  ]);

  function plainCopy(value) {
    const source = String(value ?? '');
    let copy = shortCopy[source] || source;
    copyReplacements.forEach(([pattern, replacement]) => { copy = copy.replace(pattern, replacement); });
    copy = copy.replace(/\b1UP\b/g, 'もう一回');
    if (/[A-Za-z]/.test(copy)) {
      copy = copy.replace(/[A-Za-z][A-Za-z0-9'/-]*(?:\s+[A-Za-z][A-Za-z0-9'/-]*)*/g, '特別演出');
    }
    return copy;
  }

  function routeLabel(presentation) {
    if (presentation?.modifier?.cue) return plainCopy(presentation.modifier.cue);
    if (/[ぁ-んァ-ヶ一-龠]/.test(String(presentation?.cue || ''))) return plainCopy(presentation.cue);
    if (presentation?.id && routeLabels[presentation.id]) return routeLabels[presentation.id];
    const detail = plainCopy(presentation?.detail || '').split('。')[0].trim();
    if (detail) return detail;
    if (presentation?.family === 'revival') return 'まさかの逆転';
    if (presentation?.kinds?.length === 1 && presentation.kinds[0] === 'loss') return '嫌な気配';
    if (presentation?.kinds?.length === 1 && presentation.kinds[0] === 'win') return '大当たりの気配';
    return '海流が変わった';
  }

  function endingLabel(outcome) {
    return { normal:'いつもの結果', win:'大当たり', loss:'ハズレ', revival:'逆転大当たり' }[outcome] || '結果が出る';
  }

  function setButtonCopy(label, hint = DEFAULT_BUTTON_HINT) {
    const labelElement = button.querySelector('span');
    const hintElement = button.querySelector('small');
    if (labelElement && hintElement) {
      labelElement.textContent = plainCopy(label);
      hintElement.textContent = plainCopy(hint);
    } else {
      button.textContent = plainCopy(label);
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
    { id:'quiet-tide', family:'normal', category:'environment', cutin:false, kinds:['normal'], weight:1.45, tier:'normal', world:'quiet', motion:'cascade', duration:3900, cue:'穏やかな海流', detail:'静かな海流が5枚の絵柄を運ぶ。' },
    { id:'pearl-procession', family:'normal', category:'environment', cutin:false, kinds:['normal'], weight:1.15, tier:'normal', world:'pearls', motion:'outside-in', duration:4050, cue:'真珠泡の行列', detail:'小さな真珠色の泡が、止まる順番を決める。' },
    { id:'sonar-five', family:'normal', category:'reel-event', cutin:false, kinds:['normal'], weight:1.1, tier:'signal', world:'sonar', motion:'center-last', duration:4200, cue:'5回の反響', detail:'5回の響きから、今日の絵柄を探す。' },
    { id:'crown-shadow', family:'normal', category:'text-cutin', kinds:['normal'], weight:.34, tier:'signal', world:'shadow', motion:'edge-first', duration:4300, cue:'王冠の影', detail:'王冠の影だけが先に通った。本人はまだ来ない。', fake:true },
    { id:'biolume-drift', family:'normal', category:'environment', cutin:false, kinds:['normal'], weight:1.18, tier:'normal', world:'biolume', motion:'wave', duration:4000, cue:'光る海流', detail:'淡く光る海流が、絵柄を順に撫でていく。' },
    { id:'depth-skip', family:'normal', category:'text-cutin', kinds:['normal'], weight:.30, tier:'signal', world:'depth', motion:'skip', duration:4250, cue:'水深が急に変わった', detail:'水深の数字が一段だけ飛んだ。なおキングは気にしていない。' },
    { id:'court-whisper', family:'normal', category:'rule-change', cutin:false, kinds:['normal'], weight:1.12, tier:'normal', world:'whisper', motion:'whisper', duration:3950, cue:'王国のひそひそ話', detail:'王国の小声で、絵柄の止まる順番が変わった。' },
    { id:'blue-hour', family:'normal', category:'text-cutin', kinds:['normal'], weight:.38, tier:'normal', world:'blue-hour', motion:'synchronous', duration:4100, cue:'青白い静けさ', detail:'海が青白く静まり、5枚が一緒に息をする。' },
    { id:'false-crown', family:'false-signal', kinds:['normal'], weight:.46, tier:'hot', world:'false-crown', motion:'center-last', duration:4750, cue:'王冠の気配？', detail:'王冠らしい光が出た。……一秒後、何事もなく消えた。', fake:true, freeze:true },
    { id:'sleeping-king', family:'intrusion', category:'intrusion', cutin:false, kinds:['normal'], weight:.5, tier:'signal', world:'sleep', motion:'lazy', duration:4400, cue:'眠い王が来た', detail:'眠いなおキングが、画面の外から一度だけ覗く。', intrusion:'sleepy' },
    { id:'royal-lunch-break', family:'chaos', kinds:['normal'], weight:.42, tier:'signal', world:'lunch', motion:'lazy', duration:7800, cue:'王の昼休み', detail:'占いの途中だが、王が先に昼食を始めた。', scene:'lunch', sequence:'chaos', twistMotion:'brake' },
    { id:'abyss-news-break', family:'broadcast', kinds:['normal'], weight:.38, tier:'signal', world:'news', motion:'synchronous', duration:7800, cue:'深海の速報', detail:'速報です。「占いは、まだ回っています」。以上。', scene:'news', sequence:'broadcast', twistMotion:'cruise' },
    { id:'emergency-council', family:'rule-change', kinds:['normal'], weight:.3, tier:'hot', world:'council', motion:'witnesses', duration:8500, cue:'王国の緊急会議', detail:'3枚の札が揉めたので、王が止まる順番を勝手に決める。', scene:'council', sequence:'tribunal', twistMotion:'stopping' },
    { id:'sixth-witness', family:'rule-change', kinds:['normal'], weight:.26, tier:'hot', world:'sixth', motion:'center-last', duration:8300, cue:'6枚目が来た？', detail:'呼んでいない6枚目が、絵柄の列へ割り込んだ。誰だ。', scene:'sixth', sequence:'anomaly', twistMotion:'respin' },
    { id:'reel-labor-strike', family:'chaos', kinds:['normal'], weight:.34, tier:'signal', world:'strike', motion:'lazy', duration:8200, cue:'絵柄が休憩中', detail:'3枚目の絵柄が「休憩中」の札を出した。王より自由だ。', scene:'strike', sequence:'breakdown', twistMotion:'respin' },
    { id:'giant-fish-traffic', family:'environment', kinds:['normal'], weight:.36, tier:'signal', world:'giant-fish', motion:'wave', duration:7600, cue:'巨大魚が通ります', detail:'占いとは無関係な巨大魚が、堂々と横切る。', scene:'giant-fish', sequence:'passage', twistMotion:'anticipation' },
    { id:'royal-commercial', family:'broadcast', kinds:['normal'], weight:.3, tier:'signal', world:'commercial', motion:'skip', duration:7900, cue:'王からのお知らせ', detail:'突然、王国海藻の広告が始まる。買わなくていい。', scene:'commercial', sequence:'broadcast', twistMotion:'brake' },
    { id:'do-not-press-seal', family:'interactive', kinds:['normal'], weight:.22, tier:'hot', world:'royal-seal', motion:'edge-first', duration:8400, cue:'押すなと言われた王印', detail:'「押すな」と書かれた王の印が、こちらを見ている。押すなよ。', scene:'royal-seal', sequence:'interactive', twistMotion:'respin', interactive:true },

    { id:'deep-sea-duel', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.48, tier:'hot', world:'duel', motion:'witnesses', duration:8600, cue:'深海の一騎打ち', detail:'二つの影が王国の中央で激突。勝つか負けるかは最後まで分からない。', scene:'duel', sequence:'battle', twistMotion:'brake', audioScene:'battle' },
    { id:'crown-chase', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.46, tier:'hot', world:'crown-chase', motion:'push', duration:8500, cue:'逃げる王冠を追え', detail:'逃げる王冠を全部の絵柄で追う。捕まるかはまだ分からない。', scene:'crown-chase', sequence:'pursuit', twistMotion:'respin', audioScene:'chase' },
    { id:'royal-trial', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.44, tier:'hot', world:'royal-trial', motion:'witnesses', duration:8800, cue:'王国の結果会議', detail:'王国の結果会議が始まった。最後の1枚まで答えは秘密だ。', scene:'royal-trial', sequence:'trial', twistMotion:'stopping', audioScene:'court' },
    { id:'crown-goal-challenge', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.24, tier:'hot', world:'crown-goal', motion:'push', duration:10100, cue:'王冠ゴール挑戦', detail:'王冠を一投。入るか外れるかは、止まる瞬間まで分からない。', scene:'crown-goal', sequence:'sports', twistMotion:'brake', audioScene:'sports' },
    { id:'abyss-news-live', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.20, tier:'hot', world:'news-live', motion:'synchronous', duration:9700, cue:'深海ニュース生中継', detail:'消えた王冠を探す現場と放送室をつなぐ。なお結末は誰も知らない。', scene:'news-live', sequence:'news-event', twistMotion:'respin', audioScene:'news' },
    { id:'royal-commercial-takeover', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.18, tier:'signal', world:'commercial-takeover', motion:'skip', duration:9900, cue:'王国広告が乱入', detail:'音の出ない王笛の広告が、占い画面を勝手に乗っ取った。', scene:'commercial-takeover', sequence:'commercial-event', twistMotion:'brake', audioScene:'commercial' },
    { id:'oracle-repair-disaster', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.22, tier:'hot', world:'repair-disaster', motion:'breakdown', duration:10200, cue:'占い機の修理事故', detail:'占い機を全部ばらしたら、王の手にネジが1本余った。やったな。', scene:'repair-disaster', sequence:'repair-event', twistMotion:'reverse', audioScene:'repair' },
    { id:'judgment-abandoned', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.19, tier:'hot', world:'abandon', motion:'lazy', duration:10400, cue:'王が結果決めを放棄', detail:'なおキングは「定時だ」と言って帰った。占い機も海も沈み始める。', scene:'abandon', sequence:'abandon-event', twistMotion:'stopping', audioScene:'abandon' },
    { id:'cctv-result-chase', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.23, tier:'hot', world:'cctv-chase', motion:'push', duration:10300, cue:'逃げた結果を追え', detail:'結果入りの封筒が王国中を逃走。監視カメラで追いかける。', scene:'cctv-chase', sequence:'surveillance', twistMotion:'respin', audioScene:'chase' },
    { id:'royal-lunch-show', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.17, tier:'signal', world:'lunch-show', motion:'lazy', duration:9800, cue:'王の昼食番組', detail:'占い機を片付け、王の昼食番組が突然始まった。主菜は逃げそうだ。', scene:'lunch-show', sequence:'banquet', twistMotion:'brake', audioScene:'lunch' },
    { id:'council-deadlock', family:'full-event', category:'full-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.18, tier:'hot', world:'council-deadlock', motion:'witnesses', duration:10100, cue:'会議がまとまらない', detail:'全部の絵柄が違う意見。なおキングだけ話を聞いていない。', scene:'council-deadlock', sequence:'council-event', twistMotion:'stopping', audioScene:'court' },
    { id:'upside-down-kingdom', family:'chaos', category:'chaos-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.22, tier:'hot', world:'upside-down', motion:'reverse', duration:9600, cue:'王国が上下逆さま', detail:'王国の上下が反転し、画面の部品が天井へ落ちていく。王も落ちる。', scene:'upside-down', sequence:'gravity-event', twistMotion:'reverse', audioScene:'gravity' },
    { id:'giant-naoking-inspection', family:'chaos', category:'chaos-event', kinds:['normal','win','loss'], revivalCompatible:true, weight:.22, tier:'hot', world:'giant-naoking', motion:'outside-in', duration:9400, cue:'巨大なおキング点検', detail:'巨大なおキングが背景から接近。顔だけで占い機を点検する。', scene:'giant-naoking', sequence:'giant-event', twistMotion:'brake', audioScene:'giant' },

    { id:'royal-intrusion', family:'intrusion', kinds:['win'], weight:1.15, tier:'superhot', world:'royal', motion:'push', duration:5200, cue:'王が自分で乱入', detail:'なおキングが5枚目を自分で押し込む。王なので反則ではないらしい。', intrusion:'king' },
    { id:'palace-floodlights', family:'environment', kinds:['win'], weight:1.05, tier:'superhot', world:'floodlights', motion:'outside-in', duration:5000, cue:'王宮の光が集中', detail:'王宮の光が、画面全体から一点へ集まる。' },
    { id:'reel-reversal', family:'reel-event', kinds:['win'], weight:.92, tier:'hot', world:'reverse', motion:'reverse', duration:5350, cue:'海流が逆回転', detail:'止まる直前、海流と絵柄が逆向きに回り出す。', reversal:true },
    { id:'abyss-constellation', family:'environment', kinds:['win'], weight:.82, tier:'superhot', world:'constellation', motion:'center-last', duration:5400, cue:'泡の王冠座', detail:'気泡が王冠の形を作り、中央の絵柄を指す。' },
    { id:'crown-lock', family:'reel-event', kinds:['win'], weight:.88, tier:'superhot', world:'crown-lock', motion:'edge-first', duration:5250, cue:'王冠だけが動く', detail:'世界が止まり、王冠だけが勝手に動く。偉そうだ。', freeze:true },
    { id:'tidal-ascension', family:'environment', kinds:['win'], weight:1.08, tier:'hot', world:'ascension', motion:'wave', duration:4900, cue:'上向きの海流', detail:'上向きの海流が、占い機ごと持ち上げる。' },
    { id:'five-witnesses', family:'rule-change', kinds:['win'], weight:1.2, tier:'hot', world:'tribunal', motion:'witnesses', duration:5050, cue:'5枚で多数決', detail:'5枚の絵柄を一枚ずつ開き、みんなで結果を決める。' },
    { id:'reel-jam-repair', family:'reel-event', kinds:['win'], weight:.56, tier:'superhot', world:'repair', motion:'edge-first', duration:9000, cue:'絵柄づまりを修理', detail:'引っかかった絵柄を、王が木槌で雑に直す。直ったのが悔しい。', scene:'repair', sequence:'breakdown', twistMotion:'reverse', intrusion:'king' },
    { id:'surface-breach', family:'environment', kinds:['win'], weight:.52, tier:'superhot', world:'surface', motion:'wave', duration:8800, cue:'海面まで急浮上', detail:'占い機ごと海面へ急浮上し、そのままもう一度潜る。', scene:'surface', sequence:'journey', twistMotion:'reverse' },
    { id:'witness-escape', family:'intrusion', kinds:['win'], weight:.46, tier:'hot', world:'escape', motion:'push', duration:8800, cue:'絵柄が逃げた', detail:'絵柄が王冠をくわえて画面外へ逃げ、しれっと戻ってくる。', scene:'escape', sequence:'chase', twistMotion:'respin', intrusion:'king' },

    { id:'dry-shark-theft', family:'intrusion', kinds:['loss'], weight:1.2, tier:'fake-loss', world:'dry', motion:'theft', duration:4750, cue:'干からび王の横取り', detail:'干からびた王が、当たり札だけ持ち去る。悲しいな。', intrusion:'dry', fake:true },
    { id:'power-failure', family:'blackout', kinds:['loss'], weight:1.05, tier:'fake-loss', world:'blackout', motion:'power-cut', duration:4800, cue:'王国ぜんぶ停電', detail:'占い機も海流も消え、弱い非常灯だけが残る。', blackout:true, freeze:true },
    { id:'crown-sink', family:'environment', kinds:['loss'], weight:1.08, tier:'fake-loss', world:'crown-sink', motion:'outside-in', duration:4550, cue:'王冠が沈む', detail:'王冠だけが、今日の結果よりも深く沈んでいく。' },
    { id:'fish-confiscation', family:'intrusion', kinds:['loss'], weight:.92, tier:'fake-loss', world:'fish', motion:'edge-first', duration:4650, cue:'小魚が結果を回収', detail:'小魚の群れが、結果の札を全部持っていった。', intrusion:'fish' },
    { id:'undertow-ejection', family:'environment', kinds:['loss'], weight:1.0, tier:'fake-loss', world:'undertow', motion:'reverse', duration:4700, cue:'逆流で画面外へ', detail:'強い逆流が5枚の絵柄を画面外へ流す。', reversal:true },
    { id:'cold-court', family:'typography', kinds:['loss'], weight:1.08, tier:'fake-loss', world:'cold', motion:'synchronous', duration:4450, cue:'冷たいハズレ通知', detail:'王国の画面が、一行だけで冷たく「ハズレ」と告げる。' },
    { id:'depth-collapse', family:'typography', kinds:['loss'], weight:.95, tier:'fake-loss', world:'depth-collapse', motion:'skip', duration:4750, cue:'水深の表示が故障', detail:'水深の数字が壊れ、今日の運まで海底へ落ちる。' },
    { id:'cardboard-crown', family:'false-signal', kinds:['loss'], weight:.66, tier:'fake-loss', world:'cardboard', motion:'center-last', duration:8200, cue:'段ボール王冠', detail:'豪華な王冠が着地した。よく見たら段ボールだ。', scene:'cardboard', sequence:'fake-object', twistMotion:'brake', fake:true },
    { id:'cracked-kingdom-tank', family:'power-failure', kinds:['loss'], weight:.55, tier:'fake-loss', world:'cracked-tank', motion:'power-cut', duration:8500, cue:'王国水槽にひび', detail:'王国の水槽にひび。王が雑にテープを貼って帰る。', scene:'cracked-tank', sequence:'breakdown', twistMotion:'stopping', blackout:true, freeze:true },

    { id:'crown-defibrillator', family:'revival', kinds:['win'], effects:['revival'], weight:1.15, tier:'revival', world:'defibrillator', motion:'center-last', duration:6500, cue:'王冠の一撃で復活', detail:'止まった海へ王冠が一撃。王国ぜんぶが目を覚ます。', fake:true, freeze:true },
    { id:'oracle-rewind', family:'revival', kinds:['win'], effects:['revival'], weight:1.0, tier:'revival', world:'rewind', motion:'reverse', duration:6700, cue:'ハズレを巻き戻す', detail:'ハズレた一秒を、海流ごと巻き戻す。そんなのありか。', fake:true, reversal:true },
    { id:'king-return', family:'revival', kinds:['win'], effects:['revival'], weight:.9, tier:'revival', world:'king-return', motion:'push', duration:6400, cue:'王が戻ってきた', detail:'帰ったはずのなおキングが、結果を勝手に裏返す。', fake:true, intrusion:'king' },
    { id:'light-reboot', family:'revival', kinds:['win'], effects:['revival'], weight:1.05, tier:'revival', world:'reboot', motion:'outside-in', duration:6600, cue:'王国の光が復活', detail:'非常灯から順番に、王国の光が戻ってくる。', fake:true, blackout:true },
    { id:'verdict-book-reversal', family:'revival', kinds:['win'], effects:['revival'], weight:.62, tier:'revival', world:'verdict-book', motion:'reverse', duration:9000, cue:'結果の本が逆開き', detail:'ハズレの本が閉じ、王冠のしおりから逆向きに開く。', scene:'verdict-book', sequence:'book-revival', twistMotion:'reverse', fake:true, freeze:true },
    { id:'single-golden-bubble', family:'revival', kinds:['win'], effects:['revival'], weight:.58, tier:'revival', world:'golden-bubble', motion:'center-last', duration:9500, cue:'金の泡が一つ', detail:'完全に止まった海で、金色の泡だけが一つ戻ってくる。', scene:'golden-bubble', sequence:'silent-revival', twistMotion:'revival', fake:true, blackout:true, freeze:true },
    { id:'abyssal-blackout-revival', family:'revival', kinds:['win'], effects:['revival'], weight:.46, tier:'extreme', world:'abyssal-restart', motion:'power-cut', duration:10500, cue:'完全停電から大逆転', detail:'海も光も音も止まり、遠くの小さな光だけが残る。', premium:true, fake:true, blackout:true, freeze:true },

    { id:'royal-audience', family:'premium', kinds:['win'], effects:['rainbow','crown','abyss'], weight:.16, tier:'extreme', world:'audience', motion:'witnesses', duration:11000, cue:'王の特別お披露目', detail:'占い機が王座に変わり、5枚の絵柄が一枚ずつ頭を下げる。', premium:true, intrusion:'king', freeze:true, scene:'coronation', sequence:'coronation', twistMotion:'stopping' },
    { id:'golden-tide', family:'premium', kinds:['win'], effects:['rainbow','crown'], weight:.14, tier:'extreme', world:'golden-tide', motion:'wave', duration:6800, cue:'金色の海流', detail:'金色の海流が、画面の端から端まで満ちる。' , premium:true },
    { id:'secret-4810', family:'secret', kinds:['win'], weight:.09, tier:'extreme', world:'secret-4810', motion:'skip', duration:11600, cue:'秘密の海底4810', detail:'4個の封印が順に外れ、金庫で寝ていた王が結果を押し出す。', premium:true, blackout:true, scene:'vault-4810', sequence:'vault', twistMotion:'respin' },
    { id:'palace-open', family:'premium', kinds:['win'], effects:['rainbow','comet'], weight:.13, tier:'extreme', world:'palace-open', motion:'outside-in', duration:7000, cue:'王宮への道が開く', detail:'背景の海が左右に割れ、その奥に王宮の光が現れる。', premium:true, freeze:true },
    { id:'pixel-palace-bonus', family:'premium', category:'premium', kinds:['win'], effects:['rainbow','crown','comet','abyss'], weight:.08, tier:'extreme', world:'pixel-palace', motion:'skip', duration:11200, cue:'ドット絵の王宮', detail:'占いが昔の王宮ゲームに変わった。王冠の門を開けて帰るぞ。', premium:true, freeze:true, scene:'pixel-palace', sequence:'pixel-palace', twistMotion:'respin', audioScene:'pixel' },
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
        Object.freeze({ eyebrow:'引き分け', title:'両者、同時に離脱', detail:'勝者なし。海流だけが静かに戻りました。' }),
        Object.freeze({ eyebrow:'時間切れ', title:'決着は次の潮へ', detail:'鐘が鳴り、勝負は保留になりました。' })
      ]),
      win:Object.freeze([
        Object.freeze({ eyebrow:'王冠の一撃', title:'王冠の一撃、命中', detail:'なおキング側の勝利。海が金色に沸き立ちます。' }),
        Object.freeze({ eyebrow:'勝利', title:'深海王、制圧', detail:'最後の反撃が決まり、王国旗が上がりました。' })
      ]),
      loss:Object.freeze([
        Object.freeze({ eyebrow:'敗北', title:'王冠、海底へ', detail:'挑戦者の一撃で、結果はハズレへ沈みました。' }),
        Object.freeze({ eyebrow:'王が転んだ', title:'なおキング、転がる', detail:'間の抜けた顔のまま場外へ流されました。' })
      ]),
      revival:Object.freeze([
        Object.freeze({ eyebrow:'最後の反撃', title:'倒れた王が反撃', detail:'負ける寸前、王冠が光り直して大当たりへ逆転します。' }),
        Object.freeze({ eyebrow:'王の復活', title:'海底から再参戦', detail:'終わったはずの決闘が、王の一撃でひっくり返りました。' })
      ])
    }),
    'crown-chase':Object.freeze({
      normal:Object.freeze([Object.freeze({ eyebrow:'おとり', title:'偽物の王冠でした', detail:'追跡は終了。結果は通常航路へ戻ります。' }), Object.freeze({ eyebrow:'見失った', title:'曲がり角で見失う', detail:'王冠の光は消え、静かな結果だけが残りました。' })]),
      win:Object.freeze([Object.freeze({ eyebrow:'つかまえた', title:'王冠を確保', detail:'みんなで王冠を捕まえた。海じゅうが勝利を知らせます。' }), Object.freeze({ eyebrow:'王冠が戻った', title:'王冠、自分から戻る', detail:'追いつく直前、王の頭へきれいに着地しました。' })]),
      loss:Object.freeze([Object.freeze({ eyebrow:'逃げられた', title:'王冠は画面外へ', detail:'最後の角を曲がり、ハズレ札だけが残りました。' }), Object.freeze({ eyebrow:'相手を間違えた', title:'追っていたのは海藻', detail:'王冠は別方向でした。王がしょんぼりしています。' })]),
      revival:Object.freeze([Object.freeze({ eyebrow:'王冠を再発見', title:'消えた王冠が急旋回', detail:'ハズレを飛び越え、大当たりの場所へ戻ります。' }), Object.freeze({ eyebrow:'王が戻った', title:'王が王冠ごと乱入', detail:'追跡終了の暗転から、逆方向へ突っ込んできました。' })])
    }),
    'royal-trial':Object.freeze({
      normal:Object.freeze([Object.freeze({ eyebrow:'今日は保留', title:'今日は決めない', detail:'答えは出なかった。いつもの占いだけを使います。' }), Object.freeze({ eyebrow:'答えなし', title:'絵柄が同数', detail:'王の木槌も迷い、いつもの結果に落ち着きました。' })]),
      win:Object.freeze([Object.freeze({ eyebrow:'ごほうび', title:'王国からごほうび', detail:'大当たりと同時に、勝利の王印が押されました。' }), Object.freeze({ eyebrow:'王から決定', title:'特別な大当たり', detail:'最後の絵柄で結果がひっくり返り、祝砲が鳴ります。' })]),
      loss:Object.freeze([Object.freeze({ eyebrow:'ハズレ', title:'残念、ハズレ', detail:'冷たい木槌が落ち、全部の絵柄が閉じました。' }), Object.freeze({ eyebrow:'お願いは却下', title:'お願いは却下', detail:'王国の本の端に、小さく「ハズレ」と書かれています。' })]),
      revival:Object.freeze([Object.freeze({ eyebrow:'待った', title:'最後の絵柄でやり直し', detail:'ハズレ寸前で結果が消え、逆転大当たりへ変わります。' }), Object.freeze({ eyebrow:'王が取り消した', title:'王が結果を取り消した', detail:'終了後になおキングが戻り、大当たりの印を押しました。' })])
    }),
    'crown-goal-challenge':sealEndingSet({
      normal:[{ variant:'post', eyebrow:'柱の上で停止', title:'王冠、柱で停止', detail:'入っても外れてもいないので、いつもの結果へ戻ります。' },{ variant:'walkout', eyebrow:'投げずに終了', title:'王が投げずに帰る', detail:'構えだけは完璧でした。見張り役がいつもの結果を選びます。' }],
      win:[{ variant:'goal', eyebrow:'王冠ゴール', title:'王冠、ゴール中央へ', detail:'海底スタンドが揺れ、勝利の光が一斉に点灯します。' },{ variant:'keeper-own-goal', eyebrow:'まさかの自滅', title:'守護魚が自分で押し込む', detail:'なおキングは何もしていませんが、得点として認められました。' }],
      loss:[{ variant:'miss', eyebrow:'大きく外れた', title:'王冠、画面外へ', detail:'長い助走の末、ゴールだけをきれいに避けました。' },{ variant:'keeper', eyebrow:'止められた', title:'小魚の守り役が完全捕球', detail:'王は抗議していますが、映像で見ても明確なハズレです。' }],
      revival:[{ variant:'bounce-goal', eyebrow:'柱からゴールへ', title:'跳ね返った王冠が逆転入場', detail:'外れたと思った一拍後、反対の柱から大当たりへ。' },{ variant:'late-goal', eyebrow:'終了後の一撃', title:'遅れて来た泡が押し込む', detail:'競技終了の静寂を破り、王冠が最後の一線を越えました。' }]
    }),
    'abyss-news-live':sealEndingSet({
      normal:[{ variant:'weather', eyebrow:'海底の天気', title:'結局、海底の天気予報', detail:'王冠の速報は保留。穏やかな海流が続きそうです。' },{ variant:'no-update', eyebrow:'続報なし', title:'新情報はありません', detail:'現場の魚も困り、いつもの占いへ戻しました。' }],
      win:[{ variant:'breaking-win', eyebrow:'大当たり速報', title:'王冠、放送室へ帰還', detail:'中継映像を突き破り、勝利速報が画面全体を埋めます。' },{ variant:'ticker-win', eyebrow:'号外', title:'速報字幕が勝利文へ変形', detail:'流れていた文字が整列し、王国史上最速の号外になりました。' }],
      loss:[{ variant:'signal-lost', eyebrow:'中継が切れた', title:'中継、ハズレ地点で途絶', detail:'テスト画面に残ったのは、しょんぼりした王だけでした。' },{ variant:'fake-crown', eyebrow:'訂正', title:'発見物は海藻でした', detail:'速報を訂正します。王冠ではなく長めの海藻です。' }],
      revival:[{ variant:'correction-win', eyebrow:'緊急訂正', title:'ハズレ速報を全面訂正', detail:'別のカメラから王冠映像が届き、大当たりへ差し替わります。' },{ variant:'studio-crash', eyebrow:'王が生中継へ乱入', title:'王が放送室へ突入', detail:'放送終了の直前、勝利札を持った王が画面を破りました。' }]
    }),
    'royal-commercial-takeover':sealEndingSet({
      normal:[{ variant:'silent-flute', eyebrow:'商品を試す', title:'王笛は本当に無音', detail:'盛大に構えましたが何も鳴らず、いつもの結果だけ残りました。' },{ variant:'sold-out', eyebrow:'売り切れ？', title:'まだ売っていません', detail:'問い合わせ先もないので、いつもの占いへ戻ります。' }],
      win:[{ variant:'jingle-win', eyebrow:'一音で勝利', title:'小さな音から大当たり', detail:'一音だけの広告が、なぜか王宮級の勝利へ膨らみました。' },{ variant:'disclaimer-win', eyebrow:'今だけ特別', title:'注意書きが大当たりへ拡大', detail:'画面下の小さな一行が、王国全体を覆う勝利文になります。' }],
      loss:[{ variant:'refund', eyebrow:'返品できません', title:'運勢の返品は不可', detail:'箱を開けたらハズレ札だけ。保証書は海水で読めません。' },{ variant:'weak-beep', eyebrow:'実演に失敗', title:'弱い電子音で広告終了', detail:'王が気まずそうに退場し、そのままハズレです。' }],
      revival:[{ variant:'director-cut', eyebrow:'撮り直し', title:'「終了」のあと壁が崩れる', detail:'撮影舞台の裏から、本物の大当たり宮殿が現れました。' },{ variant:'dream-offer', eyebrow:'もう一品', title:'放送終了後に王が戻る', detail:'売れ残った王冠を押し込み、勝利扱いに変更しました。' }]
    }),
    'oracle-repair-disaster':sealEndingSet({
      normal:[{ variant:'one-screw', eyebrow:'ネジが一本余った', title:'一本余ったが動いている', detail:'触らない方が良さそうなので、いつもの結果で終わります。' },{ variant:'tape', eyebrow:'その場しのぎ', title:'海藻テープで応急処置', detail:'見た目は悪いですが、占い機はいつも通り動きました。' }],
      win:[{ variant:'fix', eyebrow:'修理完了', title:'余ったネジが王室のカギ', detail:'最後の穴へ入れた瞬間、勝利回路が完全起動しました。' },{ variant:'hit-win', eyebrow:'力技で成功', title:'叩いたら大当たり', detail:'修理手順書にはありませんが、王の一撃で直りました。' }],
      loss:[{ variant:'collapse', eyebrow:'完全に故障', title:'表示板が全部落ちる', detail:'余ったネジを隠した直後、装置が静かに崩れました。' },{ variant:'reverse-wire', eyebrow:'線を間違えた', title:'上下を逆に配線', detail:'画面は戻りましたが、結果だけがハズレ方向です。' }],
      revival:[{ variant:'reverse-repair', eyebrow:'修理を取り消す', title:'修理を逆再生', detail:'壊す前まで巻き戻すと、中から大当たりが出てきました。' },{ variant:'tiny-fish', eyebrow:'小魚の意見', title:'小魚整備士が一秒で直す', detail:'王の長い修理を横目に、勝利回路だけを接続しました。' }]
    }),
    'judgment-abandoned':sealEndingSet({
      normal:[{ variant:'cleaner', eyebrow:'仕事は終了', title:'掃除の魚が代わりに決める', detail:'王は帰りました。床に残った札を正式な結果とします。' },{ variant:'elevator', eyebrow:'王は不在', title:'昇降機は戻ってこない', detail:'置き忘れた王冠だけが、いつもの占いを指しました。' }],
      win:[{ variant:'forgotten-crown', eyebrow:'王の忘れ物', title:'忘れ物の王冠が大当たり', detail:'無人の占い機へ着地し、王がいないまま大当たりです。' },{ variant:'overtime', eyebrow:'王が残業', title:'王、渋々戻ってくる', detail:'帰宅直前に勝利の光を見つけ、偉そうに王印を押しました。' }],
      loss:[{ variant:'closed', eyebrow:'本日は終了', title:'今日の占いは終了', detail:'照明も水流も落ち、ハズレ札だけが受付に残ります。' },{ variant:'outsourced', eyebrow:'送り返された', title:'外注先から差し戻し', detail:'書類不備の赤印と一緒に、ハズレの結果が返されました。' }],
      revival:[{ variant:'crown-drop', eyebrow:'閉店後', title:'無人の天井から王冠落下', detail:'完全無音のあと、大当たりだけが営業を再開します。' },{ variant:'wrong-floor', eyebrow:'昇降機が戻った', title:'王が違う階から乱入', detail:'終了後の画面をこじ開け、勝利札を置いてまた帰りました。' }]
    }),
    'cctv-result-chase':sealEndingSet({
      normal:[{ variant:'decoy-envelope', eyebrow:'監視カメラ4番', title:'捕まえた封筒は空', detail:'本物は不明のまま、いつもの結果へつなぎます。' },{ variant:'time-out', eyebrow:'追跡終了', title:'監視時間切れ', detail:'足跡だけが穏やかな結果へ並び替わりました。' }],
      win:[{ variant:'caught', eyebrow:'つかまえた', title:'結果の封筒を捕獲', detail:'4台のカメラが同時に、勝利の王印を映しました。' },{ variant:'ahead', eyebrow:'先回りしていた', title:'結果が先回りして待っていた', detail:'追いかけた全員より先に、大当たり席へ着いています。' }],
      loss:[{ variant:'escaped', eyebrow:'見失った', title:'封筒、画面の下へ逃走', detail:'王は追跡を諦め、ハズレの控えだけを提出しました。' },{ variant:'wrong-subject', eyebrow:'相手を間違えた', title:'干からびた王を誤認逮捕', detail:'本物の結果は逃げ切り、しょんぼりしたハズレが残ります。' }],
      revival:[{ variant:'rewind-camera', eyebrow:'映像を巻き戻す', title:'映像を逆再生して再捕獲', detail:'逃げた道を巻き戻し、大当たりの封筒だけ取り戻しました。' },{ variant:'drop', eyebrow:'封筒が落下', title:'画面上から勝利封筒', detail:'見失った直後、別のカメラから王冠付きで落ちてきます。' }]
    }),
    'royal-lunch-show':sealEndingSet({
      normal:[{ variant:'nap', eyebrow:'食後', title:'王、食後すぐ寝る', detail:'寝息が、いつもの結果の泡だけを運びました。' },{ variant:'shared', eyebrow:'食事を配る', title:'残りは小魚へ配った', detail:'食事は穏やかに終わり、いつもの占いへ戻ります。' }],
      win:[{ variant:'satisfied', eyebrow:'王は満足', title:'満足した王が大当たり', detail:'最後の一口を飲み込み、王冠の印を豪快に押しました。' },{ variant:'plate-win', eyebrow:'秘密の一皿', title:'皿の下に勝利札', detail:'片付けた瞬間、隠し献立の大当たりが現れます。' }],
      loss:[{ variant:'fish-escape', eyebrow:'夕食が逃げた', title:'主菜が泳いで逃げる', detail:'王も皿も追いかけ、ハズレだけ置き去りです。' },{ variant:'overeaten', eyebrow:'食べ過ぎ', title:'食べ過ぎで動けない', detail:'なおキングは動けず、ハズレ札にだけ手が届きました。' }],
      revival:[{ variant:'dessert', eyebrow:'甘味が到着', title:'終わった卓へ王冠の甘味', detail:'閉店寸前の一皿が大当たりへ変わりました。' },{ variant:'dream-win', eyebrow:'王の夢', title:'寝た王の夢から勝利', detail:'現実のハズレ卓を、寝言だけでひっくり返します。' }]
    }),
    'council-deadlock':sealEndingSet({
      normal:[{ variant:'postponed', eyebrow:'会議は延期', title:'結論は次の潮へ', detail:'会議メモだけ残し、いつもの結果へ戻ります。' },{ variant:'abstain', eyebrow:'全員が答えない', title:'全員が答えない', detail:'王が一番無難な占いを選びました。珍しく正しい。' }],
      win:[{ variant:'unanimous', eyebrow:'全員そろった', title:'全員そろって勝利', detail:'聞いていなかった王も最後だけ賛成しました。' },{ variant:'minority-win', eyebrow:'小さな一票', title:'小魚の一票で逆転', detail:'小魚の一票でみんなが動き、大当たりに決まりました。' }],
      loss:[{ variant:'veto', eyebrow:'王が拒否', title:'王が理由なく拒否', detail:'説明はありません。会議メモには大きくハズレとだけ。' },{ variant:'sleep-vote', eyebrow:'王は居眠り中', title:'寝言を敗北票として集計', detail:'会議はそのまま終わり、冷たい結果が残りました。' }],
      revival:[{ variant:'recount', eyebrow:'数え直し', title:'最後の一票を数え直す', detail:'裏返った王冠票が見つかり、大当たりに決まり直した。' },{ variant:'minutes-rewrite', eyebrow:'会議メモを修正', title:'会議メモが勝手に書き換わる', detail:'敗北の文字が一字ずつ逃げ、勝利案が成立しました。' }]
    }),
    'upside-down-kingdom':sealEndingSet({
      normal:[{ variant:'center', eyebrow:'重力が安定', title:'王冠だけ中央に残る', detail:'落ちた画面の部品を戻し、いつもの占いを再開します。' },{ variant:'wall-king', eyebrow:'王が90度', title:'王が壁に張り付く', detail:'本人は平気そうなので、結果はいつも通りです。' }],
      win:[{ variant:'crown-assembly', eyebrow:'無重力の大当たり', title:'落下物が勝利文を組む', detail:'反転した王国で、王冠だけが上向きに爆発します。' },{ variant:'floor-win', eyebrow:'新しい床', title:'天井側に大当たり着地', detail:'常識は逆ですが、勝利の王印だけは正しい向きです。' }],
      loss:[{ variant:'fall-out', eyebrow:'重力がおかしい', title:'結果が画面の端から落下', detail:'王も追いかけましたが、ハズレ札だけ残りました。' },{ variant:'crushed', eyebrow:'画面の部品が衝突', title:'王冠が装置に刺さる', detail:'抜こうとしてさらに壊し、ハズレで停止します。' }],
      revival:[{ variant:'reverse-gravity', eyebrow:'重力が逆転', title:'落下を完全逆再生', detail:'散った部品が戻り、中心に大当たりを組み上げます。' },{ variant:'king-shove', eyebrow:'王が押し返す', title:'巨大な王が画面を押し戻す', detail:'上下も敗北も正しい向きへ戻り、勝利の光がまた点いた。' }]
    }),
    'giant-naoking-inspection':sealEndingSet({
      normal:[{ variant:'pass', eyebrow:'点検に合格', title:'何もせず帰る', detail:'瞳の反射に、いつもの結果だけが一瞬見えました。' },{ variant:'stamp', eyebrow:'まあ合格', title:'理由なしの合格印', detail:'巨大な王の鼻先で、いつもの占いへ押し戻されます。' }],
      win:[{ variant:'sneeze-win', eyebrow:'王のくしゃみ', title:'くしゃみで王冠の嵐', detail:'画面の部品は飛びましたが、大当たりだけ中央に残りました。' },{ variant:'eye-win', eyebrow:'瞳に映る王宮', title:'瞳の奥に王宮', detail:'巨大な瞳の奥が開き、特別な勝利演出へつながります。' }],
      loss:[{ variant:'fail', eyebrow:'点検に不合格', title:'不合格、理由なし', detail:'巨大な王は首を振り、しょんぼり顔のハズレを置きました。' },{ variant:'covered', eyebrow:'近すぎる', title:'顔で画面が全部隠れる', detail:'離れたあとにはハズレ札しか残っていません。' }],
      revival:[{ variant:'second-look', eyebrow:'もう一度見る', title:'帰り際に振り向く', detail:'王の瞳から勝利の光が飛び、大当たりへ上書きします。' },{ variant:'tiny-crown', eyebrow:'極小の王冠', title:'巨大王に極小王冠', detail:'間の抜けた姿で王冠をかぶると、ハズレ演出が金色に破裂した。' }]
    }),
    'pixel-palace-bonus':sealEndingSet({
      win:[{ variant:'gate', eyebrow:'最後の門を突破', title:'王冠の門、開く', detail:'ドット絵の王宮を突破し、大当たりの世界へ帰ります。' },{ variant:'secret-room', eyebrow:'秘密の部屋', title:'壁の裏に白金王座', detail:'小さな亀裂から、特別な宮殿が広がります。' },{ variant:'boss-sleep', eyebrow:'最後の王は居眠り中', title:'最後の王が寝ていた', detail:'戦わず王冠を回収。豪華なのに締まらない完全勝利です。' },{ variant:'extra-life', eyebrow:'もう一回から大当たり', title:'残り一回が王冠へ変わる', detail:'懐かしい勝利音のあと、画面全体が王国の勝利演出へ変わります。' }]
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
    // A cut-in is a readable chapter, not a flash frame. These dwells deliberately
    // slow the reels before the sequence resumes, turning reading time into tension.
    if (premium) return phase === 'signal' ? 6500 : 6000;
    if (heated) return phase === 'signal' ? 6000 : 5600;
    if (presentation.scene) return phase === 'signal' ? 5700 : 5300;
    return phase === 'signal' ? 5300 : 5000;
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
    if (context.isFirstToday) return Object.freeze({ id:'first-tide', cue:'今日最初の占い', detail:'今日最初の海流だ。王はまだ少し眠い。' });
    if (context.spinNumber === 5) return Object.freeze({ id:'fifth-bell', cue:'今日5回目の王国ベル', detail:'今日5回目。王国のベルが一度だけ鳴る。' });
    if (context.lastResult === result.key) return Object.freeze({ id:'echo-result', cue:'前回の結果が反響中', detail:'前回の結果が、遠くの海でまだ響いている。' });
    if (context.rareDrought >= 7) return Object.freeze({ id:'long-silence', cue:'長い静けさ', detail:'しばらく特別な演出がない。そろそろ何か来るかもな。' });
    return Object.freeze({ id:'none', cue:null, detail:null });
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
  routeReadout.innerHTML = '<span>海流を待っています</span><small>次の演出を準備中</small>'; card.append(routeReadout);
  const phaseRail = document.createElement('div');
  phaseRail.className = 'oracle-phase-rail'; phaseRail.setAttribute('aria-hidden', 'true');
  phaseRail.innerHTML = '<i data-step="潜る">01</i><i data-step="回る">02</i><i data-step="予兆">03</i><i data-step="結果">04</i>'; card.append(phaseRail);

  const machinePlate = document.querySelector('.machine-plate');
  const machineIdentity = document.createElement('strong');
  machineIdentity.className = 'oracle-machine-identity'; machineIdentity.setAttribute('aria-hidden', 'true');
  machineIdentity.innerHTML = '<span>なおキングの占い機 // 5枚判定</span><small>深海王国の気まぐれ占い</small>';
  const oracleTierBadge = document.createElement('b');
  oracleTierBadge.className = 'oracle-tier-badge'; oracleTierBadge.setAttribute('aria-hidden', 'true');
  const oracleTierLamp = document.createElement('i');
  const oracleTierLabel = document.createElement('span'); oracleTierLabel.textContent = '待機中';
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

  const oracleTierLabels = Object.freeze({ normal:'通常', signal:'気配あり', hot:'ちょっと熱い', superhot:'かなり熱い', extreme:'めったにない', jackpot:'大当たり', 'fake-loss':'嫌な予感', revival:'逆転' });

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
    if (phase === 'descent') return '潜航開始';
    if (phase === 'cruise') return '勢いよく回転中';
    if (phase === 'signal') return tier === 'normal' ? '結果を確認中' : oracleTierLabels[tier] || '気配あり';
    if (phase === 'anomaly') return tier === 'normal' ? '海流が変化' : oracleTierLabels[tier] || '何かが変だ';
    if (phase === 'judgment') return tier === 'normal' ? '最後の溜め' : oracleTierLabels[tier] || '最後の溜め';
    if (phase === 'verdict') return '順番に停止中';
    if (phase === 'fake') return '信号が消えた';
    if (phase === 'revival') return '王国が再始動';
    if (phase === 'locked') return '王が怒って停止';
    return oracleTierLabels[tier] || '待機中';
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
    if (!phase) { oracleTierLabel.textContent = '待機中'; return; }
    const tier = tierFor(activeVisualResult, activePresentation, tierOverride);
    // "resting" keeps the sealed result on the machine, but it must not keep
    // the page-wide currents, filters, bubbles, or premium lighting alive.
    // The next draw rehydrates the route classes from its frozen presentation.
    if (phase === 'resting') {
      oracleTierLabel.textContent = '結果確定';
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
    effectLayer.textContent = plainCopy(text);
    later(() => { effectLayer.className = 'roulette-fx'; }, ms);
  }

  function propIn(kind, text, ms = 1600) {
    sceneProp.className = `roulette-scene-prop is-running ${kind}`;
    sceneProp.textContent = plainCopy(text);
    later(() => { sceneProp.className = 'roulette-scene-prop'; }, ms);
  }

  function showTakeover(presentation, phase = 'signal', ms = 1250) {
    const span = oracleTakeover.querySelector?.('span');
    const small = oracleTakeover.querySelector?.('small');
    if (span) span.textContent = routeLabel(presentation);
    if (small) small.textContent = plainCopy(presentation.modifier?.detail || presentation.detail);
    oracleTakeover.style.setProperty('--takeover-duration', `${timelineDelay(ms)}ms`);
    oracleTakeover.className = `oracle-takeover is-visible is-${phase} route-${presentation.id}`;
    later(() => { oracleTakeover.className = 'oracle-takeover'; }, ms);
  }

  function setRouteReadout(presentation, phase = 'descent') {
    const cue = routeReadout.querySelector?.('span');
    const detail = routeReadout.querySelector?.('small');
    if (cue) cue.textContent = routeLabel(phase === 'descent' ? presentation : { ...presentation, modifier:{ cue:null, detail:null } });
    if (detail) detail.textContent = plainCopy(phase === 'descent' && presentation.modifier?.detail ? presentation.modifier.detail : presentation.detail);
  }

  function setIntruder(presentation, running) {
    const source = { dry:'assets/characters/naoking-7.webp', sleepy:'assets/characters/naoking-sleepy.webp', fish:'assets/characters/naoking-3.webp', king:'assets/characters/naoking-jackpot.webp' }[presentation.intrusion] || 'assets/characters/naoking-hero.webp';
    intruder.src = source;
    intruder.className = `oracle-intruder${running ? ` is-running is-${presentation.intrusion || 'king'}` : ''}`;
  }

  const chaosScenes = Object.freeze({
    lunch:{ image:'assets/characters/naoking-sleepy.webp', glyph:'♨', signal:['王の休憩室','王の昼食休憩','占いより先に、ワカメ弁当を開けました。'], twist:['昼食終了','一口で飽きた','残りは小魚に任せ、占いへ戻ります。'] },
    news:{ image:'assets/characters/naoking-panic.webp', glyph:'生中継', signal:['深海ニュース4810','深海速報','占い機はまだ回転中。以上、現場からでした。'], twist:['続報','まだ回っています','新しい情報は特にありません。何だったんだ。'] },
    council:{ image:'assets/characters/naoking-hero.webp', glyph:'議', signal:['緊急会議','王国の緊急会議','3枚の札が、止まる順番でもめています。'], twist:['静かにしろ','王の木槌で決定','なおキングは話を聞いていません。'] },
    sixth:{ image:'assets/characters/naoking-panic.webp', glyph:'06', signal:['知らない絵柄','6枚目が侵入','5枚で占う決まりだ。誰だ、お前。'], twist:['外へ出した','6枚目を追放','何もなかった顔で、もう一度回します。'] },
    strike:{ image:'assets/characters/naoking-sleepy.webp', glyph:'休', signal:['休憩のお知らせ','3枚目、休憩中','本人の希望により一度止まります。自由だな。'], twist:['仕事へ戻れ','王が手で押した','働き方の決まりは今つくりました。'] },
    'giant-fish':{ image:'assets/characters/naoking-4.webp', glyph:'…', signal:['突然の通行','巨大魚、通過中','占いとは関係ありません。道を空けろ。'], twist:['通過しました','王も見ていました','では何事もなかったように続けます。'] },
    commercial:{ image:'assets/characters/naoking-laugh.webp', glyph:'広告', signal:['王国提供','王国海藻・新発売','噛むほど海です。今なら定価。安くはない。'], twist:['広告を終了','買わんでいい','王が自分の広告を裏切りました。'] },
    'royal-seal':{ image:'assets/characters/naoking-hero.webp', glyph:'印', signal:['王の印','この王印は押すな','結果は変わりませんが、王は怒ります。'], twist:['王が勝手に承認','王が自分で押した','押していないのに文句を言っています。'], action:'押すな' },
    repair:{ image:'assets/characters/naoking-panic.webp', glyph:'🔧', signal:['占い機が故障','絵柄が斜めに詰まった','修理係は、なおキング一匹だけです。不安だな。'], twist:['王の力技','木槌で直した','占い機にしてはいけない直し方です。'] },
    surface:{ image:'assets/characters/naoking-2.webp', glyph:'海面', signal:['緊急浮上','海面へ急浮上','光がまぶしくて、王が少し嫌そうです。'], twist:['もう一度潜る','王国へ戻ります','海面まで来た意味はありません。'] },
    escape:{ image:'assets/characters/naoking-3.webp', glyph:'↗', signal:['絵柄が逃げた','絵柄が王冠を持って逃走','画面の外まで追いかけます。'], twist:['絵柄が戻った','王冠ごと帰ってきた','説教は結果のあとだ。'] },
    cardboard:{ image:'assets/characters/naoking-7.webp', glyph:'箱', signal:['王冠が落下','王冠が来た','見た目だけは大当たりです。期待するな。'], twist:['ただの紙','段ボールでした','王国のお金が足りません。'] },
    'cracked-tank':{ image:'assets/characters/naoking-panic.webp', glyph:'⚠', signal:['水が漏れている','王国水槽にひび','なおキングがテープを探しています。遅い。'], twist:['その場しのぎ','雑に貼りました','水はまだ漏れています。ダメじゃん。'] },
    'verdict-book':{ image:'assets/characters/naoking-7.webp', glyph:'本', signal:['最後の記録','ハズレの本を閉じます','今日の占いは終了しました。……たぶん。'], twist:['しおりが動いた','王冠のしおりが逆走','最後のページが勝手に開き直ります。'] },
    'golden-bubble':{ image:'assets/characters/naoking-jackpot.webp', glyph:'○', signal:['光なし、水流なし','海は完全に止まった','遠くに、泡が一つだけ残っています。'], twist:['金色の泡','金の泡が破裂','王国ぜんぶを、もう一度動かします。'] },
    duel:{ image:'assets/characters/naoking-hero.webp', glyph:'対決', signal:['深海の一騎打ち','王国の中央で勝負開始','二つの影が近づく。勝つか負けるかはまだ秘密だ。'], twist:['最後の一撃','二つの攻撃がぶつかる','どちらが立っているか、泡が晴れるまで分からない。'] },
    'crown-chase':{ image:'assets/characters/naoking-panic.webp', glyph:'♛↗', signal:['王冠を追え','王冠が逃走','なおキングと5枚の絵柄が、画面の外まで追いかける。'], twist:['最後の曲がり角','王冠が急に曲がった','捕まえたか、見失ったか。もうすぐ分かる。'] },
    'royal-trial':{ image:'assets/characters/naoking-hero.webp', glyph:'決', signal:['王国の結果会議','深海王国の会議、開始','当たりにもハズレにも見える絵柄を順に見る。'], twist:['最後の答え','王の木槌が上がる','木槌が落ちたあと、結果を見せる。偉そうだな。'] },
    'crown-goal':{ image:'assets/characters/naoking-panic.webp', glyph:'ゴール', signal:['王冠の球技大会','王冠ゴール挑戦','助走開始。王冠がどこへ飛ぶか、まだ誰にも分からない。'], twist:['止まった瞬間','ゴール直前で完全停止','入る、外れる、跳ね返る。次の一拍で決まる。'] },
    'news-live':{ image:'assets/characters/naoking-panic.webp', glyph:'生中継', signal:['深海ニュース','王冠が行方不明','放送室と4台の監視カメラを急いでつなぐ。'], twist:['続報が来た','現場映像に何かが映る','王冠か海藻か。字幕係も困っている。'] },
    'commercial-takeover':{ image:'assets/characters/naoking-laugh.webp', glyph:'広告', signal:['王国通販','音の出ない王笛','構えだけは豪華。機能は、音が出ないことです。'], twist:['小さな電子音','広告はまだ続きます','返品か成功か放送事故か。王も決めていません。'] },
    'repair-disaster':{ image:'assets/characters/naoking-panic.webp', glyph:'🔧', signal:['王の修理時間','占い機を全部ばらした','王は説明書を上下逆に持っています。終わったな。'], twist:['ネジが1本余った','一本だけ余りました','成功か全壊か、電源を入れるまで分かりません。'] },
    abandon:{ image:'assets/characters/naoking-sleepy.webp', glyph:'退', signal:['仕事は終わり','王、定時で帰る','占いの途中ですが、なおキングはもう帰ります。'], twist:['王も海流も不在','海も占い機も営業終了','このまま終わるか、何か戻るか。音を止めて待ちます。'] },
    'cctv-chase':{ image:'assets/characters/naoking-panic.webp', glyph:'監視中', signal:['監視カメラ1番','結果の封筒が逃走','画面の上から下まで、王国中のカメラで追う。'], twist:['監視カメラ4番','封筒が見えない場所へ','捕まえるか、逃げるか、王を間違えるか。映像を戻す。'] },
    'lunch-show':{ image:'assets/characters/naoking-sleepy.webp', glyph:'皿', signal:['王の食卓・生中継','王の昼食が始まった','占い機は片付けた。今日の主菜は逃げそうです。'], twist:['最後の一皿','皿の下に何かある','当たり札、ハズレ札、ただの汚れ。片付けて確かめる。'] },
    'council-deadlock':{ image:'assets/characters/naoking-hero.webp', glyph:'議', signal:['王国会議','全員、意見が違う','王は話を聞かず、木槌だけ構えています。'], twist:['最後の一票','最後の札を開く','賛成、反対、寝言。どれにするか王が悩んでいる。'] },
    'upside-down':{ image:'assets/characters/naoking-panic.webp', glyph:'↻', signal:['重力の点検','王国、上下反転','画面の部品が天井へ落ち始めました。'], twist:['ぶつかった','王冠と画面の部品が衝突','壊れたか直ったか、上下を戻して確かめる。'] },
    'giant-naoking':{ image:'assets/characters/naoking-hero.webp', glyph:'王', signal:['王が巨大化','巨大なおキング接近','背景から目の前へ。なぜ大きいのか本人も知らない。'], twist:['近すぎる','顔で画面が埋まりました','合格、不合格、くしゃみ。離れるまで何も見えない。'] },
    coronation:{ image:'assets/characters/naoking-jackpot.webp', glyph:'♛', signal:['王の特別お披露目','5枚の絵柄、起立','占い機を王座へ組み替える。豪華だが急だ。'], twist:['王が来た','王冠をかぶる時間','なおキングは少し遅刻しました。王なのに。'] },
    'vault-4810':{ image:'assets/characters/naoking-sleepy.webp', glyph:'4810', signal:['4つの王印','王国の金庫を開ける','一つ、二つ、三つ……最後の4つ目。'], twist:['金庫が開いた','中で王が寝ていた','起こしたので、結果を押し出してもらいます。'] },
    'pixel-palace':{ image:'assets/characters/naoking-jackpot.webp', glyph:'ドット絵', signal:['王宮ゲーム開始','王宮がドット絵になった','王冠の門まで、あと一画面。結果はまだ秘密だ。'], twist:['最後の部屋','大きな扉を開く','戦うか、寝るか、隠し道か。次の瞬間に決まる。'] },
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
    chaosImage.src = scene.image; chaosGlyph.textContent = plainCopy(scene.glyph || '');
    chaosEyebrow.textContent = phase === 'twist'
      ? (presentation.ending ? endingLabel(presentation.ending.outcome) : '演出が変わった')
      : routeLabel(presentation);
    chaosTitle.textContent = plainCopy(copy[1]); chaosDetail.textContent = plainCopy(copy[2]);
    chaosAction.hidden = !(presentation.interactive && phase === 'signal' && !chaosInteracted && !reducedMotion.matches);
    chaosAction.textContent = plainCopy(scene.action || '王印を押す');
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
    chaosEyebrow.textContent = '勝手に押した'; chaosTitle.textContent = '押したな';
    chaosDetail.textContent = 'なおキングは怒った。だが結果はもう決まっている。残念だったな。';
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
    if (identity) identity.textContent = `なおキングの占い機 // ${safeCount}枚判定`;
    if (detail) detail.textContent = `深海王国の気まぐれ占い・${safeCount}枚`;
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
      if (presentation.fake) flash('signal', '何か来た？', 980);
    }
    if (phase === 'twist') {
      card.classList.add('is-chaos-twist');
      later(() => card.classList.remove('is-chaos-twist'), 920);
      refreshSpinCandidates(activeVisualResult);
      const cutinMs = cutinDuration(presentation, 'twist');
      setReelMotion(reelMotionFor(presentation, 'anomaly', cutinMs ? 'suspense' : (presentation.twistMotion || 'anticipation')));
      if (cutinMs && presentation.scene) showChaosScene(presentation, 'twist', cutinMs);
      else if (cutinMs) showTakeover({ ...presentation, cue:'海流が変わった', detail:'演出が途中で変わった。まだ結果は分からない。', modifier:{ cue:null, detail:null } }, 'twist', cutinMs);
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
      if (presentation.premium) flash('extreme', '王の印', 1500);
      else if (presentation.tier === 'superhot') flash('hot', 'かなり期待できる', 1050);
    }
  }

  const finalEffectText = Object.freeze({ rainbow:'虹色の大当たり', crown:'王冠が降ってきた', revival:'まさかの逆転', comet:'王国流星', abyss:'深海の光', dry:'当たりを横取りされた', blackout:'真っ暗なハズレ', net:'網に捕まった', alarm:'赤い警報', drain:'水が引いた' });

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
      flash(result.effect, presentation.id === 'abyssal-blackout-revival' ? '完全停電から逆転大当たり' : finalEffectText[result.effect], presentation.id === 'abyssal-blackout-revival' ? 2800 : 1900);
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
    historyList.innerHTML = displayHistory.map(item => {
      const route = routeById.get(item.route);
      return `<li><span>${plainCopy(item.title)}</span><small>${item.kind === 'win' ? '大当たり' : item.kind === 'loss' ? '特別なハズレ' : 'いつもの結果'} / ${route ? routeLabel(route) : '占い'}</small></li>`;
    }).join('');
  }

  function showFinal(result, presentation) {
    const reelCount = setReelCount(presentation?.reelCount || DEFAULT_REEL_TILE_COUNT);
    setReelMotion('settled'); slot.classList.remove('is-spinning', 'is-stopping'); reel.innerHTML = tileSet(result.image, reelCount, true);
    title.textContent = plainCopy(result.title); message.textContent = plainCopy(result.message);
    resultRegion?.classList.remove('is-false-ending'); resultRegion?.classList.add('is-revealing'); resultRegion?.setAttribute('aria-busy', 'false');
    setPhase('revealed'); applyFinalEffect(result, presentation); dispatchOracleResult(result, presentation);
    status.textContent = result.kind === 'win' ? '王の結果 // 大当たり！' : result.kind === 'loss' ? '王の結果 // 残念、特別なハズレ' : '王の結果 // 今日の運勢が決まった';
    setButtonCopy('もう一度、占ってもらう', 'また王の気まぐれに任せる'); updateHistory(result, presentation); writeDailyState(result, presentation);
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
      status.textContent = '王国停電 // 占い機も停止'; flash('void', '王国ぜんぶ停電', 4200);
      showTakeover({ ...presentation, cue:'王国ぜんぶ停電', detail:'光も水流も音も、すべて止まった。', modifier:{ cue:null, detail:null } }, 'fake', 4200);
      dispatchOracleBeat('abyssal-blackout', { intensity:.18 });
      later(() => {
        flash('signal', '·', 900);
        dispatchOracleBeat('abyssal-distant-signal', { intensity:.22 });
      }, 3900);
      later(() => {
        card.classList.remove('is-failed', 'is-fake', 'is-abyssal-blackout'); setPhase('revival', 'jackpot');
        showTakeover({ ...presentation, cue:'遠くに光が見えた', detail:'深海の向こうから、王国を起こす光が近づく。', modifier:{ cue:null, detail:null } }, 'revival', 1700);
        flash('revival', '逆転大当たり', 2500); setReelMotion('revival'); slot.classList.add('is-spinning');
        dispatchOracleBeat('abyssal-reboot', { intensity:1 });
        later(() => showFinal(result, presentation), rebootHold);
      }, blackoutHold);
      return;
    }
    const fakeHold = presentation.scene ? 1500 : 1800;
    const revivalHold = presentation.scene ? 2000 : 1600;
    setPhase('fake', 'fake-loss'); setReelMotion('settled'); card.classList.add('is-failed', 'is-fake');
    reel.innerHTML = tileSet('assets/characters/naoking-7.webp', presentation.reelCount, true); title.textContent = '結果は終了……？';
    message.textContent = '……王冠の気配なし。占い機を止める。'; resultRegion?.classList.add('is-false-ending');
    status.textContent = '気配なし // 占い終了'; flash('void', '終了', 900);
    if (presentation.scene) showTakeover({ ...presentation, cue:'結果は終了', detail:'結果の本は閉じた。海は、まだ黙っている。', modifier:{ cue:null, detail:null } }, 'fake', fakeHold);
    dispatchOracleBeat('silence', { silenceMs:Math.min(1200, fakeHold), intensity:.2 });
    later(() => {
      card.classList.remove('is-failed'); setPhase('revival', 'revival');
      if (presentation.scene) showTakeover({ ...presentation, cue:'最後の海流', detail:'最後の海流が、閉じた結果を押し戻す。', modifier:{ cue:null, detail:null } }, 'revival', revivalHold);
      else showTakeover({ ...presentation, cue:'待て、結果が変わった', detail:'なおキングが終了を勝手に取り消した。王なので説明はしない。', modifier:{ cue:null, detail:null } }, 'revival', revivalHold);
      flash('revival', '再始動', Math.min(1800, revivalHold)); setReelMotion(presentation.reversal ? 'reverse' : 'revival'); slot.classList.add('is-spinning');
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
      activePresentation = Object.freeze({ id:'royal-lock', family:'lock', tier:'fake-loss', world:'lock', motion:'power-cut', cue:'王の封印', detail:'王を急かしたので、占い機を封印した。', modifier:{ id:'none', cue:null, detail:null } });
      setPhase('locked', 'fake-loss'); title.textContent = 'なおキング、激怒';
      message.textContent = '連打したな。なおキングは怒って海へ帰った。別のページへ行って戻るまで動かん。';
      resultRegion?.setAttribute('aria-busy', 'false'); status.textContent = '王が怒って停止 // 連打禁止';
      setButtonCopy('なおキング、怒って停止中…', '王が封印中');
      if (blast) { blast.hidden = false; later(() => { blast.hidden = true; }, 1650); }
      flash('fake', '連打厳禁', 1700);
      later(() => {
        if (!locked) return;
        syncOracleEnvironment('resting');
        oracleTierLabel.textContent = '封印中';
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
    setButtonCopy(`${presentation.reelCount}枚の絵柄を確認中…`, '一回勝負。連打するな'); status.textContent = `演出決定 // ${routeLabel(presentation)}`;
    resultRegion?.setAttribute('aria-busy', 'true'); message.textContent = '結果はもう決まった。なおキングが見せ方で遊んでいる。';

    const { signalAt, twistAt, judgmentAt, stopAt } = sequenceTimings(presentation);
    later(() => { setPhase('cruise'); setReelMotion(reelMotionFor(presentation, 'cruise', 'cruise')); status.textContent = `海流に乗って回転中 // ${presentation.reelCount}枚`; }, 320);
    later(() => {
      setPhase('signal', presentation.fake && result.kind === 'normal' ? 'hot' : ''); setReelMotion(reelMotionFor(presentation, 'signal', presentation.reversal ? 'reverse' : 'suspense'));
      status.textContent = `${oracleTierLabels[presentation.tier] || '気配あり'} // 何かが来る`; applyRouteMoment(presentation, 'signal');
    }, signalAt);
    if (twistAt) {
      later(() => {
        setPhase('anomaly'); setReelMotion(reelMotionFor(presentation, 'anomaly', 'suspense'));
        status.textContent = `${presentation.scene ? '場面が変わった' : '海流が変わった'} // 結果はまだ秘密`; applyRouteMoment(presentation, 'twist');
      }, twistAt);
    }
    later(() => {
      setPhase('judgment'); setReelMotion(reelMotionFor(presentation, 'judgment', 'brake')); status.textContent = '最後の溜め // もうすぐ止まる'; applyRouteMoment(presentation, 'judgment');
    }, judgmentAt);
    later(() => {
      setReelMotion(reelMotionFor(presentation, 'stopping', 'stopping')); status.textContent = `${presentation.reelCount}枚 // 順番に停止中`;
      stopWitnesses(result, presentation, () => { if (result.effect === 'revival') runFalseEnding(result, presentation); else showFinal(result, presentation); });
    }, stopAt);
  }

  button.addEventListener('click', spin);
  window.addEventListener('naoking:pagechange', event => {
    if (event.detail?.page === 'fortune') return;
    drawToken += 1; busy = false; locked = false; taps = []; resetVisualState(); setButtonCopy('運命を回す');
    resultRegion?.setAttribute('aria-busy', 'false'); status.textContent = 'なおキング占い // 待機中'; title.textContent = '海の支配者';
    message.textContent = 'ボタンを押せ。なおキングが、あなたの都合を見ずに今日の運勢を決める。'; setReelCount(); reel.innerHTML = tileSet(normalResults[0].image, DEFAULT_REEL_TILE_COUNT, true);
    const routeCue = routeReadout.querySelector?.('span'); const routeDetail = routeReadout.querySelector?.('small');
    if (routeCue) routeCue.textContent = '海流を待っています'; if (routeDetail) routeDetail.textContent = '次の演出を準備中';
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

  function previewRoute(routeId, phase = 'signal', requestedResultKey = '') {
    const route = routeById.get(String(routeId || ''));
    if (!route) throw new Error(`Unknown roulette route: ${routeId}`);
    const requestedResult = requestedResultKey ? resultByKey.get(String(requestedResultKey)) : null;
    const template = requestedResult && routeCompatible(route, requestedResult)
      ? requestedResult
      : allResults.find(result => routeCompatible(route, result));
    if (!template) throw new Error(`No compatible result for roulette route: ${routeId}`);

    drawToken += 1;
    clearScheduledTasks();
    busy = false;
    locked = false;
    resetVisualState();

    const result = Object.freeze({ ...template, message:template.messages[0] });
    const reelCount = clampReelCount(route.reelCount);
    const presentation = Object.freeze({
      ...route,
      reelCount,
      category:presentationCategory(route),
      modifier:Object.freeze({ id:'none', cue:null, detail:null }),
      ending:chooseEventEnding(route, result),
      stopOrder:Object.freeze(makeStopOrder(route.motion, reelCount))
    });
    const previewPhase = ['descent', 'cruise', 'signal', 'anomaly', 'judgment', 'revealed'].includes(phase) ? phase : 'signal';

    activeVisualResult = result;
    activePresentation = presentation;
    card.classList.add(`is-route-${presentation.id}`);
    if (presentation.premium) card.classList.add('is-premium');
    renderSpinCandidates(presentation);
    setRouteReadout(presentation, previewPhase === 'anomaly' ? 'twist' : previewPhase);
    setReelMotion(reelMotionFor(presentation, previewPhase, previewPhase === 'revealed' ? 'settled' : 'suspense'));
    setPhase(previewPhase, previewPhase === 'revealed' && result.kind === 'win' ? 'jackpot' : '');
    if (previewPhase === 'revealed') {
      reel.innerHTML = tileSet(result.image, reelCount, true);
      title.textContent = plainCopy(result.title);
      message.textContent = plainCopy(result.message);
    } else if (['signal', 'anomaly', 'judgment'].includes(previewPhase)) {
      applyRouteMoment(presentation, previewPhase === 'anomaly' ? 'twist' : previewPhase);
    }
    return Object.freeze({ route:presentation.id, phase:previewPhase, result:result.key, reelCount });
  }

  function clearPreview() {
    drawToken += 1;
    clearScheduledTasks();
    busy = false;
    locked = false;
    resetVisualState();
    setButtonCopy('運命を回す');
    status.textContent = 'なおキング占い // 待機中';
    title.textContent = '海の支配者';
    message.textContent = 'ボタンを押せ。なおキングが、あなたの都合を見ずに今日の運勢を決める。';
    setReelCount();
    reel.innerHTML = tileSet(normalResults[0].image, DEFAULT_REEL_TILE_COUNT, true);
  }

  setReelCount(); reel.innerHTML = tileSet(normalResults[0].image, DEFAULT_REEL_TILE_COUNT, true); status.textContent = 'なおキング占い // 待機中';
  if (!window.location || ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    window.NaokingRouletteDebug = Object.freeze({
      baseProbabilities:Object.freeze({ normal:0.76, specialWin:0.14, specialLoss:0.10 }), pityRule:'The eighth consecutive non-winning draw becomes rainbow.',
      presentationRule:'A frozen result is chosen before an independent compatible presentation route.', routeCount:presentationRoutes.length,
      expansion:Object.freeze({ version:expansion.version || '', research:expansion.research || {}, routeCount:(expansion.routes || []).length, fishFamilies:Object.freeze([...new Set((expansion.routes || []).map(route => route.fishSchool).filter(Boolean))]), reelGrammars:Object.freeze(Object.keys(reelGrammars)) }),
      getState:() => Object.freeze({ busy, locked, resolvedDraws, timerCount:scheduledTasks.length, phase:card.dataset.roulettePhase || '', motion:card.dataset.reelMotion || '', route:activePresentation?.id || '', category:activePresentation?.category || '', reelCount:Number(reel.dataset.reelCount || DEFAULT_REEL_TILE_COUNT), environmentClassCount:activeEnvironmentClasses.size, environmentClasses:[...activeEnvironmentClasses], normalHistory:[...normalHistory], presentationHistory:[...presentationHistory], presentationCategoryHistory:[...presentationCategoryHistory], displayed:displayHistory.map(item => item.key) }),
      routes:Object.freeze(presentationRoutes.map(route => Object.freeze({ id:route.id, scene:route.scene || '', family:route.family, category:presentationCategory(route), reelCount:clampReelCount(route.reelCount) }))),
      previewRoute, clearPreview,
      runDiagnostics, runMessageBagDiagnostics, runPresentationDiagnostics, runCutinDiagnostics
    });
    const previewParams = typeof URLSearchParams === 'function'
      ? new URLSearchParams(window.location?.search || '')
      : null;
    const previewId = previewParams?.get('oraclePreview');
    if (previewId && routeById.has(previewId)) {
      window.setTimeout(() => previewRoute(
        previewId,
        previewParams.get('oraclePhase') || 'signal',
        previewParams.get('oracleResult') || ''
      ), 0);
    }
  }
})();
