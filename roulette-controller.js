/*
 * The only roulette controller.
 * A draw is resolved once into one immutable result object, then every visual
 * update reads from that object. No other file may bind a spin handler.
 */
(() => {
  const card = document.querySelector('#card');
  const slot = document.querySelector('#slot');
  const reel = document.querySelector('#reel');
  const title = document.querySelector('#fortune-name');
  const message = document.querySelector('#message');
  const status = document.querySelector('#roulette-status');
  const oldButton = document.querySelector('#spin');
  const blast = document.querySelector('#blast');
  if (!card || !slot || !reel || !title || !message || !status || !oldButton) return;

  if (oldButton.dataset.rouletteBound === 'true') return;
  const button = oldButton;
  button.dataset.rouletteBound = 'true';

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

  const messageBags = new Map();
  const lastMessageByResult = new Map();
  function shuffledBag(result) {
    const key = result.key;
    let bag = messageBags.get(key);
    if (!bag || bag.length === 0) {
      bag = [...result.messages];
      for (let i = bag.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      // Do not repeat the final line of the previous bag as the first line of
      // the next bag for this same result.
      if (bag.length > 1 && bag[bag.length - 1] === lastMessageByResult.get(key)) {
        [bag[bag.length - 1], bag[0]] = [bag[0], bag[bag.length - 1]];
      }
      messageBags.set(key, bag);
    }
    const nextMessage = bag.pop();
    lastMessageByResult.set(key, nextMessage);
    return nextMessage;
  }
  const normalHistory = [];
  let spinsSinceWin = 0;
  function chooseNormal() {
    const candidates = normalResults.filter(result => result.key !== normalHistory[0]);
    const weights = candidates.map(result => normalHistory.includes(result.key) ? 0.22 : 1);
    const total = weights.reduce((sum, value) => sum + value, 0);
    let cursor = Math.random() * total;
    let chosen = candidates[candidates.length - 1];
    for (let i = 0; i < candidates.length; i += 1) {
      cursor -= weights[i];
      if (cursor <= 0) { chosen = candidates[i]; break; }
    }
    normalHistory.unshift(chosen.key);
    normalHistory.splice(3);
    return chosen;
  }
  function chooseFinalResult() {
    // Preserve the existing streak bonus: the eighth non-winning spin becomes
    // a rainbow jackpot. Normal-result history never affects special odds.
    if (spinsSinceWin >= 7) {
      spinsSinceWin = 0;
      return winResults[0];
    }
    // Special probabilities stay independent of the normal-result history.
    const roll = Math.random();
    let result;
    if (roll < 0.10) result = lossResults[Math.floor(roll / 0.02)];       // 10% total, 2% each
    else if (roll < 0.24) result = winResults[Math.floor((roll - 0.10) / 0.028)]; // 14% total, 2.8% each
    else result = chooseNormal();
    spinsSinceWin = result.kind === 'win' ? 0 : spinsSinceWin + 1;
    return result;
  }
  function resolveFinalResult() {
    const template = chooseFinalResult();
    return Object.freeze({
      kind: template.kind,
      key: template.key,
      title: template.title,
      image: template.image,
      message: shuffledBag(template),
      effect: template.effect,
      duration: template.duration
    });
  }
  const tile = image => `<div class="shark-tile"><img class="shark-face" src="${image}" alt="なおキング"></div>`;
  const effectLayer = document.createElement('div'); effectLayer.className = 'roulette-fx'; card.append(effectLayer);
  const prop = document.createElement('div'); prop.className = 'roulette-scene-prop'; prop.setAttribute('aria-hidden','true'); card.append(prop);
  const intruder = document.createElement('img'); intruder.className = 'dry-shark-intruder'; intruder.src = 'assets/characters/naoking-7.webp'; intruder.alt = ''; card.append(intruder);
  const crowns = document.createElement('div'); crowns.className = 'crown-rain'; crowns.innerHTML = '<i>♛</i><i>♛</i><i>♛</i><i>♛</i><i>♛</i>'; card.append(crowns);

  let busy = false;
  let locked = false;
  let taps = [];
  let activeTimers = [];
  let drawToken = 0;
  const historyList = document.querySelector('#fortune-history');
  const displayHistory = [];
  const later = (fn, ms, token = drawToken) => {
    const id = window.setTimeout(() => {
      activeTimers = activeTimers.filter(item => item !== id);
      if (token === drawToken) fn();
    }, ms);
    activeTimers.push(id);
    return id;
  };
  const flash = (kind, text, ms = 1650) => {
    effectLayer.className = `roulette-fx is-visible ${kind}`;
    effectLayer.textContent = text;
    later(() => { effectLayer.className = 'roulette-fx'; }, ms);
  };
  const propIn = (kind, text, ms = 1600) => {
    prop.className = `roulette-scene-prop is-running ${kind}`;
    prop.textContent = text;
    later(() => { prop.className = 'roulette-scene-prop'; }, ms);
  };
  const resetVisualState = () => {
    activeTimers.forEach(window.clearTimeout); activeTimers = [];
    card.className = card.className.replace(/\bis-(jackpot|rainbow|crown|revival|comet|abyss|dry|blackout|net|alarm|drain|failed|exploded|searchlight|gold|deep|crown-drop|dry-steal|void-miss)\b/g, '').trim();
    slot.classList.remove('is-jackpot', 'is-long-spin', 'is-spinning');
    effectLayer.className = 'roulette-fx';
    prop.className = 'roulette-scene-prop';
    intruder.classList.remove('is-running');
    crowns.classList.remove('is-raining');
    if (blast) blast.hidden = true;
  };
  const effectText = { rainbow:'RAINBOW JACKPOT', crown:'CROWN DROP!', revival:'REVIVAL!!', comet:'ROYAL COMET', abyss:'ABYSS BEAM', dry:'LUCK STOLEN', blackout:'DEEP BLACKOUT', net:'NET FAILURE', alarm:'RED ALERT', drain:'WATER DRAIN' };
  function applyStartEffect(result) {
    if (result.effect === 'comet') { card.classList.add('is-comet'); propIn('comet', '✦'); }
    if (result.effect === 'abyss') { card.classList.add('is-abyss'); propIn('searchlight', '◢', 1850); }
    if (result.effect === 'net') { card.classList.add('is-net'); propIn('net', '╳'); }
    if (result.effect === 'alarm') { card.classList.add('is-alarm'); propIn('alarm', '!'); }
    if (result.effect === 'drain') { card.classList.add('is-drain'); propIn('drain', '↓'); }
  }
  function showFinal(result) {
    if (result.kind === 'win') {
      card.classList.add('is-jackpot', `is-${result.effect}`); slot.classList.add('is-jackpot');
      if (result.effect === 'crown') { crowns.classList.add('is-raining'); later(() => crowns.classList.remove('is-raining'), 1800); }
      if (result.effect === 'revival') card.classList.remove('is-failed');
      flash(result.effect, effectText[result.effect], 1950);
    }
    if (result.kind === 'loss') {
      card.classList.add(`is-${result.effect}`);
      if (result.effect === 'dry') { intruder.classList.add('is-running'); later(() => intruder.classList.remove('is-running'), 1800); }
      flash(result.effect, effectText[result.effect], 1700);
    }
    reel.innerHTML = tile(result.image);
    title.textContent = result.title;
    message.textContent = result.message;
    status.textContent = result.kind === 'win' ? 'SPECIAL JACKPOT CONFIRMED' : result.kind === 'loss' ? 'SPECIAL MISS CONFIRMED' : 'JUDGMENT COMPLETE // TRY AGAIN';
    button.textContent = '運命を回す';
    displayHistory.unshift(result);
    displayHistory.splice(3);
    if (historyList) {
      historyList.innerHTML = displayHistory.map(item => `<li><span>${item.title}</span><small>${item.kind === 'win' ? '大当たり' : item.kind === 'loss' ? '特殊ハズレ' : '通常'}</small></li>`).join('');
    }
    busy = false;
  }
  function spin() {
    if (locked) return;
    const now = Date.now(); taps = taps.filter(time => now - time < 2400); taps.push(now);
    if (taps.length >= 3) {
      drawToken += 1;
      busy = false; locked = true; resetVisualState(); card.classList.add('is-exploded');
      title.textContent = 'なおキング激怒'; message.textContent = '連打されたので、なおキングは海へ帰りました。別ページに移動して戻るまで停止中。';
      status.textContent = 'SYSTEM LOCKED // DO NOT TAP'; button.textContent = 'なおキング、怒って停止中…';
      if (blast) { blast.hidden = false; later(() => { blast.hidden = true; }, 1650); }
      flash('fake', '連打厳禁', 1700); return;
    }
    if (busy) return;
    drawToken += 1;
    busy = true; resetVisualState();
    const result = resolveFinalResult(); // The one immutable draw for this click.
    reel.innerHTML = Array.from({ length: 30 }, () => tile(normalResults[Math.floor(Math.random() * normalResults.length)].image)).join('');
    slot.classList.add('is-spinning');
    slot.classList.toggle('is-long-spin', result.effect === 'revival');
    button.textContent = 'なおキング採点中・連打厳禁…';
    status.textContent = result.kind === 'win' ? 'SPECIAL SIGNAL DETECTED' : result.kind === 'loss' ? 'UNSTABLE SEA CONDITIONS' : 'JUDGMENT SYSTEM / SPINNING';
    message.textContent = result.effect === 'revival' ? '……判定が妙に長い。なおキングが何か企んでいる。' : 'なおキングが今日の運勢を読んでいる……たぶん適当だ。';
    applyStartEffect(result);
    later(() => {
      slot.classList.remove('is-spinning', 'is-long-spin');
      if (result.effect === 'revival') {
        card.classList.add('is-failed'); reel.innerHTML = tile('assets/characters/naoking-7.webp'); title.textContent = '干からび寸前'; message.textContent = '……終了。まあ、そういう日もある。'; status.textContent = 'JUDGMENT FAILED // ...';
        later(() => showFinal(result), 820); return;
      }
      if (result.effect === 'blackout') {
        card.classList.add('is-blackout'); title.textContent = '……！？'; message.textContent = '画面が暗くなった。まさか、これは……'; status.textContent = 'DEEP BLACKOUT'; flash('void', '深海暗転', 1200);
        later(() => showFinal(result), 850); return;
      }
      showFinal(result);
    }, result.duration);
  }
  button.addEventListener('click', spin);
  window.addEventListener('naoking:pagechange', event => {
    if (event.detail?.page === 'fortune') return;
    drawToken += 1;
    busy = false;
    locked = false;
    taps = [];
    resetVisualState();
    button.textContent = '運命を回す';
    status.textContent = 'JUDGMENT SYSTEM / READY';
    title.textContent = '海の支配者';
    message.textContent = 'ボタンを押せ。なおキングが、あなたの都合を見ずに今日の運勢を決める。';
    reel.innerHTML = tile(normalResults[0].image);
  });

  function runDiagnostics(iterations = 10000) {
    const sampleSize = Math.max(1, Math.min(250000, Math.floor(Number(iterations) || 10000)));
    const historySnapshot = [...normalHistory];
    const spinsSnapshot = spinsSinceWin;
    const bagSnapshot = new Map([...messageBags].map(([key, bag]) => [key, [...bag]]));
    const lastMessageSnapshot = new Map(lastMessageByResult);
    const counts = { normal: 0, win: 0, loss: 0 };
    const byResult = {};
    const lastMessage = new Map();
    let lastNormalKey = null;
    let repeatedNormal = 0;
    let immediateMessageRepeat = 0;

    try {
      for (let index = 0; index < sampleSize; index += 1) {
        const result = resolveFinalResult();
        counts[result.kind] += 1;
        byResult[result.key] = (byResult[result.key] || 0) + 1;
        if (result.kind === 'normal') {
          if (result.key === lastNormalKey) repeatedNormal += 1;
          lastNormalKey = result.key;
        }
        if (lastMessage.get(result.key) === result.message) immediateMessageRepeat += 1;
        lastMessage.set(result.key, result.message);
      }
    } finally {
      normalHistory.splice(0, normalHistory.length, ...historySnapshot);
      spinsSinceWin = spinsSnapshot;
      messageBags.clear();
      bagSnapshot.forEach((bag, key) => messageBags.set(key, [...bag]));
      lastMessageByResult.clear();
      lastMessageSnapshot.forEach((value, key) => lastMessageByResult.set(key, value));
    }

    return Object.freeze({
      iterations: sampleSize,
      counts: Object.freeze(counts),
      rates: Object.freeze(Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, value / sampleSize]))),
      byResult: Object.freeze(byResult),
      repeatedNormal,
      immediateMessageRepeat
    });
  }

  // Keep heavy diagnostics available on local/test hosts without exposing a
  // synchronous 250k-loop helper on the public GitHub Pages build.
  if (!window.location || ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    window.NaokingRouletteDebug = Object.freeze({
      baseProbabilities: Object.freeze({ normal: 0.76, specialWin: 0.14, specialLoss: 0.10 }),
      pityRule: 'The eighth consecutive non-winning draw becomes rainbow.',
      getState: () => Object.freeze({ busy, locked, normalHistory: [...normalHistory], displayed: displayHistory.map(item => item.key) }),
      runDiagnostics
    });
  }
})();
