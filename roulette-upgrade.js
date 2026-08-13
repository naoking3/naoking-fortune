/* Standalone controller for the upgraded Naoking roulette. */
(() => {
  const card = document.querySelector('#card');
  const slot = document.querySelector('#slot');
  const reel = document.querySelector('#reel');
  const nameEl = document.querySelector('#fortune-name');
  const message = document.querySelector('#message');
  const status = document.querySelector('#roulette-status');
  const previousButton = document.querySelector('#spin');
  if (!card || !slot || !reel || !nameEl || !message || !status || !previousButton) return;

  // Cloning removes the former click listener, so this controller is the only one handling spins.
  const button = previousButton.cloneNode(true);
  previousButton.replaceWith(button);

  const templates = [
    '今日は少しだけ流れがある。使い切るな。', '運が味方している。気づかないふりで進め。',
    '小さな勝ちを拾える日。落とすなよ。', 'まあ悪くない。期待はほどほどにしろ。',
    'その背びれ、今日は飾りじゃないらしい。', '話が少しだけ通じる日。奇跡だな。',
    'やることを一個終わらせろ。それだけで偉い。', '勢いはある。方向だけ間違えるな。',
    '海流が少し味方している。浅瀬には行くな。', '今日は運の機嫌がいい。お前の機嫌は知らん。',
    '調子に乗ってもいい。ただし三分までだ。', '珍しく判断が冴える。二回目は保証しない。',
    'ちょっとだけ褒められる。驚くな。', '無駄な寄り道が減る。たぶん。', '小魚よりは上だ。胸を張れ。',
    '自信を持て。根拠は後から探せ。', '追い風を感じたら、ちゃんと泳げ。',
    '今日はお前の番かもしれない。短いけどな。', '面倒が一つ片付く。記念に寝ろ。',
    'その顔でも、今日はなんとかなる。', '運が迷子になっていない。珍事だ。',
    '周りが少し優しい。期限は今日まで。', '小さな願いなら通る。大きいのは知らん。',
    'なぜかタイミングが合う。今のうちに動け。', '泳ぎ切れ。評価は後でなおキングが決める。',
    'やれることからやれ。今日は意外と進む。', '遠慮するな。海は広い、たぶん。',
    '失敗しても沈むな。浮いてこい。', '結果より勢いで勝てる日。理屈は後付け。',
    'まあまあの運勢。贅沢を言うな。'
  ];
  const makeLines = prefix => templates.map(line => `${prefix} ${line}`);
  const fortunes = [
    { name: '海の支配者', image: 'naoking-1.png', lines: makeLines('海が少しだけお前を認めた。') },
    { name: '背びれ絶好調', image: 'naoking-2.png', lines: makeLines('背びれの角度が良い。') },
    { name: 'エサ発見', image: 'naoking-3.png', lines: makeLines('エサ運だけは期待できる。') },
    { name: '水槽の主', image: 'naoking-4.png', lines: makeLines('水槽では王様らしい。') },
    { name: '小魚メンタル', image: 'naoking-5.png', lines: makeLines('ビビっているが、まだ泳げる。') },
    { name: '浅瀬で迷子', image: 'naoking-6.png', lines: makeLines('浅瀬で方向を見失った。') },
    { name: '干からび寸前', image: 'naoking-7.png', lines: makeLines('干からびる前に水を探せ。') },
    { name: '深海ぼんやり', image: 'naoking-sleepy.png', lines: makeLines('眠そうななおキングが判定した。') },
    { name: 'あわあわ警報', image: 'naoking-panic.png', lines: makeLines('なおキングが少し慌てている。') },
    { name: 'サメ笑い', image: 'naoking-laugh.png', lines: makeLines('なおキングは何かを笑っている。') }
  ];
  const jackpotLines = [
    '虹が海底まで届いた。今日は王の客人として扱ってやる。',
    '王冠が鳴った。お前、まさか本当に当てるとはな。',
    '海が七色に割れた。運を使い切る前に深呼吸しろ。',
    'なおキングが立ち上がった。これはかなり珍しい。',
    '王の気まぐれを超えた。今日だけは堂々としていい。',
    '大当たり。サメ界の歴史に一行だけ刻まれた。',
    '虹色判定。お前の背びれ、今だけ神々しいぞ。',
    '王冠直撃。おめでとう、海の民に仮採用だ。',
    '海底ジャックポット。周囲に自慢しても信じてもらえない。',
    '王が笑った。たぶんお前を褒めている。たぶん。'
  ];
  const revivalLines = [
    '外れたと思った？ 甘いな。海底から逆転大当たりだ。',
    '沈んだ判定が浮上した。なおキングの気まぐれ復活。',
    '終了演出からの王冠。心臓に悪いだろ、これ。',
    '一度は干からびた。だが運だけは生きていた。',
    '絶望の一拍後、虹が来た。お前、持ってるじゃん。',
    '王が判定をひっくり返した。理由は聞くな。',
    '外れを見せてから当てる。なおキングは演出家でもある。',
    '海底から再起。これは逆転復活の大当たりだ。',
    '諦めた瞬間に王冠。そういう日もある。',
    '判定ミスではない。王のサプライズだ。喜べ。'
  ];
  const deepLines = ['深海から選ばれた。明かりは少ないが運はある。', '深海判定。静かに強い日だ。騒ぐな。', 'アビス到達。帰れるかはお前次第。'];
  const goldLines = ['金の気まぐれ。少し良いことが起きるかもな。', '王の金フラッシュ。無駄遣いは禁止。', '金色判定。期待しすぎず、でも喜べ。'];
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const normalTile = f => `<div class="shark-tile"><img class="shark-face" src="${f.image}" alt="なおキング"></div>`;
  const jackpotTile = () => `<div class="shark-tile jackpot-tile"><img class="shark-face" src="naoking-jackpot.png" alt="王冠なおキング"></div>`;
  const fx = document.createElement('div');
  fx.className = 'roulette-fx';
  card.append(fx);
  const dryIntruder = document.createElement('img');
  dryIntruder.className = 'dry-shark-intruder';
  dryIntruder.src = 'naoking-7.png';
  dryIntruder.alt = '';
  dryIntruder.setAttribute('aria-hidden', 'true');
  card.append(dryIntruder);
  const crownRain = document.createElement('div');
  crownRain.className = 'crown-rain';
  crownRain.setAttribute('aria-hidden', 'true');
  crownRain.innerHTML = '<i>♛</i><i>♛</i><i>♛</i><i>♛</i><i>♛</i><i>♛</i>';
  card.append(crownRain);
  const showFx = (kind, text, duration = 1500) => {
    fx.className = `roulette-fx is-visible ${kind}`;
    fx.textContent = text;
    window.setTimeout(() => { fx.className = 'roulette-fx'; }, duration);
  };
  const showDryIntruder = () => {
    dryIntruder.classList.remove('is-running');
    // Restart the CSS animation every time the dried shark steals a result.
    void dryIntruder.offsetWidth;
    dryIntruder.classList.add('is-running');
    window.setTimeout(() => dryIntruder.classList.remove('is-running'), 1800);
  };
  const showCrownRain = () => {
    crownRain.classList.remove('is-raining');
    void crownRain.offsetWidth;
    crownRain.classList.add('is-raining');
    window.setTimeout(() => crownRain.classList.remove('is-raining'), 1700);
  };
  let spinning = false;
  let locked = false;
  let streak = 0;
  let taps = [];
  let spinTimer;
  let revivalTimer;

  button.addEventListener('click', () => {
    if (locked) return;
    const now = Date.now();
    taps = taps.filter(time => now - time < 2400);
    taps.push(now);
    if (taps.length >= 3) {
      clearTimeout(spinTimer); clearTimeout(revivalTimer);
      spinning = false; locked = true;
      slot.classList.remove('is-spinning', 'is-long-spin');
      card.classList.add('is-exploded');
      nameEl.textContent = 'なおキング激怒';
      message.textContent = '連打されたので、なおキングは海へ帰りました。別ページに移動して戻るまで停止中。';
      status.textContent = 'SYSTEM LOCKED // DO NOT TAP';
      button.textContent = 'なおキング、怒って停止中…';
      showFx('fake', '連打厳禁');
      return;
    }
    if (spinning) return;
    spinning = true;
    streak += 1;
    const roll = Math.random();
    const pity = streak >= 8;
    const jackpot = pity || roll < 0.035;
    const deep = !jackpot && roll < 0.075;
    const gold = !jackpot && !deep && roll < 0.19;
    const revival = !jackpot && !deep && !gold && roll < 0.215;
    const crownDrop = !jackpot && !deep && !gold && !revival && roll < 0.235;
    const drySteal = !jackpot && !deep && !gold && !revival && !crownDrop && roll < 0.285;
    const voidMiss = !jackpot && !deep && !gold && !revival && !crownDrop && !drySteal && roll < 0.35;
    const fake = !jackpot && !deep && !gold && !revival && !crownDrop && !drySteal && !voidMiss && roll < 0.55;
    const duration = revival ? 2850 : crownDrop ? 2450 : drySteal ? 2050 : jackpot ? 2350 : 1700;
    card.classList.toggle('is-jackpot', jackpot);
    card.classList.toggle('is-deep', deep);
    card.classList.toggle('is-gold', gold);
    card.classList.toggle('is-revival', false);
    slot.classList.toggle('is-jackpot', jackpot);
    slot.classList.toggle('is-long-spin', revival);
    status.textContent = revival ? 'UNUSUAL DELAY // HOLD YOUR BREATH' : crownDrop ? 'ROYAL OBJECT DETECTED // LOOK UP' : drySteal ? 'LUCKY SIGNAL // ALMOST THERE...' : voidMiss ? 'SIGNAL ERROR // TRY NOT TO CRY' : jackpot ? 'RARE SIGNAL DETECTED // JACKPOT MODE' : deep ? 'ABYSS SIGNAL // DEEP SEA MODE' : gold ? 'ROYAL WHIM // GOLD FLASH' : 'JUDGMENT SYSTEM / SPINNING';
    button.textContent = 'なおキング採点中・連打厳禁…';
    message.textContent = revival ? '……判定が妙に長い。なおキングが何か企んでいる。' : crownDrop ? '上から何か落ちてくる。避けるな、これはたぶん吉兆だ。' : drySteal ? '大当たりの気配。なおキングが少しだけ笑っている。' : voidMiss ? '通信が不安定。運勢まで不安定。' : 'なおキングが今日の運勢を読んでいる……たぶん適当だ。';
    if (fake) window.setTimeout(() => showFx('fake', '！？'), 510);
    if (gold) showFx('gold', 'ROYAL FLASH');
    if (deep) showFx('deep', 'DEEP SEA MODE', 1850);
    if (pity) showFx('jackpot', 'STREAK BONUS', 1850);
    reel.innerHTML = fortunes.concat(fortunes, fortunes).map(normalTile).join('');
    slot.classList.add('is-spinning');
    const selected = pick(fortunes);
    spinTimer = window.setTimeout(() => {
      slot.classList.remove('is-spinning', 'is-long-spin');
      if (revival) {
        card.classList.add('is-failed');
        reel.innerHTML = normalTile({ image: 'naoking-7.png' });
        nameEl.textContent = '干からび寸前';
        message.textContent = '……終了。まあ、そういう日もある。';
        status.textContent = 'JUDGMENT FAILED // ...';
        revivalTimer = window.setTimeout(() => {
          card.classList.remove('is-failed');
          card.classList.add('is-revival', 'is-jackpot');
          slot.classList.add('is-jackpot');
          reel.innerHTML = jackpotTile();
          nameEl.textContent = '逆転・王冠大当たり';
          message.textContent = pick(revivalLines);
          status.textContent = 'REVIVAL JACKPOT CONFIRMED';
          button.textContent = '運命を回す';
          spinning = false; streak = 0;
          showFx('revival', 'REVIVAL!!', 2200);
          window.setTimeout(() => { card.classList.remove('is-revival', 'is-jackpot'); slot.classList.remove('is-jackpot'); }, 1500);
        }, 820);
        return;
      }
      if (crownDrop) {
        card.classList.add('is-crown-drop', 'is-jackpot');
        slot.classList.add('is-jackpot');
        showCrownRain();
        showFx('crown', 'CROWN DROP!', 1900);
        reel.innerHTML = jackpotTile();
        nameEl.textContent = '王冠落下大当たり';
        message.textContent = pick([
          '王冠が空から落ちてきた。避けなかったお前の勝ちだ。',
          '落下した王冠が判定を直撃。これは文句なしの大当たり。',
          'なおキングの王冠が増えた。一本はお前の運だ。',
          '上を見ろ。王冠と幸運が同時に落ちてきた。',
          '王冠落下演出。お前、今日だけは選ばれた側だ。'
        ]);
        status.textContent = 'CROWN DROP JACKPOT // ROYAL IMPACT';
        button.textContent = '運命を回す';
        spinning = false; streak = 0;
        window.setTimeout(() => { card.classList.remove('is-crown-drop', 'is-jackpot'); slot.classList.remove('is-jackpot'); }, 1800);
        return;
      }
      if (drySteal) {
        reel.innerHTML = normalTile({ image: 'naoking-1.png' });
        nameEl.textContent = '海の支配者！？';
        message.textContent = 'おお、これは当たりの予感……';
        status.textContent = 'LUCKY SIGNAL CONFIRMED // ...';
        showFx('gold', '大当たり！？', 1500);
        revivalTimer = window.setTimeout(() => {
          showDryIntruder();
          card.classList.add('is-dry-steal');
          reel.innerHTML = normalTile({ image: 'naoking-7.png' });
          nameEl.textContent = '干からびた横取り';
          message.textContent = pick([
            '干からびたなおキングが画面外から来て、当たりを持っていった。悲しいな。',
            '当たりはあった。だが干からびたサメが先に食べた。',
            '大当たり寸前で干からび乱入。運は乾いた。',
            '王冠の代わりに干からびが来た。受け入れろ。',
            '当たりを信じたお前が悪い。干からびたなおキングより。'
          ]);
          status.textContent = 'DRY SHARK STOLE YOUR LUCK';
          button.textContent = '運命を回す';
          spinning = false;
          window.setTimeout(() => card.classList.remove('is-dry-steal'), 1200);
        }, 850);
        return;
      }
      if (voidMiss) {
        card.classList.add('is-void-miss');
        reel.innerHTML = normalTile({ image: 'naoking-1.png' });
        nameEl.textContent = '……！？';
        message.textContent = '画面が暗くなった。まさか、これは……';
        status.textContent = 'DEEP BLACKOUT // SOMETHING IS COMING';
        showFx('void', '深海暗転', 1450);
        revivalTimer = window.setTimeout(() => {
          reel.innerHTML = normalTile({ image: 'naoking-6.png' });
          nameEl.textContent = '海流エラー';
          message.textContent = pick([
            '暗転しただけだった。判定は海流に流された。',
            '期待させておいて通信断。なおキングは昼寝に入った。',
            '深海の正体はハズレ。お前のドキドキを返せ。',
            '大当たりっぽい暗転からの結果なし。海は冷たい。'
          ]);
          status.textContent = 'NO RESULT // THE SEA REFUSED';
          button.textContent = '運命を回す';
          spinning = false;
          window.setTimeout(() => card.classList.remove('is-void-miss'), 1150);
        }, 980);
        return;
      }
      reel.innerHTML = jackpot ? jackpotTile() : normalTile(selected);
      const title = jackpot ? pick(['虹色の支配者', '王冠の大当たり', '海底ジャックポット']) : deep ? '深海の支配者' : gold ? '金の気まぐれ' : selected.name;
      nameEl.textContent = title;
      message.textContent = jackpot ? pick(jackpotLines) : deep ? pick(deepLines) : gold ? pick(goldLines) : pick(selected.lines);
      status.textContent = jackpot ? 'JACKPOT CONFIRMED // RAINBOW KING' : deep ? 'ABYSS JUDGMENT COMPLETE' : gold ? 'ROYAL FLASH COMPLETE' : 'JUDGMENT COMPLETE // TRY AGAIN';
      button.textContent = '運命を回す';
      spinning = false;
      if (jackpot) streak = 0;
      card.classList.remove('is-deep', 'is-gold');
      window.setTimeout(() => { card.classList.remove('is-jackpot'); slot.classList.remove('is-jackpot'); }, 900);
    }, duration);
  });

  document.querySelectorAll('[data-tab]').forEach(link => link.addEventListener('click', () => {
    if (!locked || link.dataset.tab === 'fortune') return;
    locked = false; taps = [];
    card.classList.remove('is-exploded', 'is-failed', 'is-revival', 'is-jackpot');
    slot.classList.remove('is-jackpot', 'is-long-spin', 'is-spinning');
    button.textContent = '運命を回す';
    status.textContent = 'JUDGMENT SYSTEM / READY';
  }));
})();
