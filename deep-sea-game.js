(() => {
  'use strict';

  function initialiseDeepSeaGame() {
    const host = document.getElementById('game-canvas');
    const startButton = document.getElementById('start-game');
    if (!host || !startButton || host.dataset.naokingGameReady === 'true') return;
    host.dataset.naokingGameReady = 'true';

    const gameRoot = host.closest('.deep-sea-game') || host;
    const curtain = document.getElementById('game-curtain');
    const timeOutput = document.getElementById('game-time');
    const scoreOutput = document.getElementById('game-score');
    const comboOutput = document.getElementById('game-combo');
    const stateOutput = document.getElementById('game-state');
    const bestOutput = document.getElementById('game-high-score');
    const rankOutput = document.getElementById('game-rank');
    const leftControl = document.getElementById('left-control');
    const rightControl = document.getElementById('right-control');
    const helpOutput = gameRoot.querySelector('.game-help');
    const gameHud = gameRoot.querySelector('.game-hud');

    const oxygenHud = document.createElement('div');
    const oxygenLabel = document.createElement('small');
    const oxygenValue = document.createElement('b');
    const oxygenTrack = document.createElement('span');
    const oxygenFill = document.createElement('i');
    oxygenHud.className = 'game-oxygen-hud';
    oxygenHud.setAttribute('role', 'meter');
    oxygenHud.setAttribute('aria-label', '残り酸素');
    oxygenHud.setAttribute('aria-valuemin', '0');
    oxygenHud.setAttribute('aria-valuemax', '100');
    oxygenLabel.textContent = 'OXYGEN';
    oxygenValue.textContent = '78%';
    oxygenTrack.className = 'game-oxygen-track';
    oxygenFill.className = 'game-oxygen-fill';
    oxygenTrack.setAttribute('aria-hidden', 'true');
    oxygenTrack.append(oxygenFill);
    oxygenHud.append(oxygenLabel, oxygenValue, oxygenTrack);
    if (gameHud) {
      gameHud.classList.add('has-oxygen-meter');
      gameHud.append(oxygenHud);
    }

    const canvas = host instanceof HTMLCanvasElement
      ? host
      : host.querySelector('canvas[data-game-surface]') || document.createElement('canvas');
    if (!(host instanceof HTMLCanvasElement) && !canvas.parentElement) {
      canvas.dataset.gameSurface = '';
      canvas.className = 'deep-sea-game__surface';
      host.append(canvas);
    }

    canvas.width = 960;
    canvas.height = 540;
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'LIFE 1の深海回遊ゲーム。左右に泳ぎ、予兆の安全帯で酸素餌を取りながら30秒生存する。');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    const WORLD = { width: 960, height: 540 };
    const GAME_DURATION = 30;
    const OXYGEN_START = 78;
    const PLAYER_WIDTH = 112;
    const PLAYER_HEIGHT = 62;
    const PLAYER_BOTTOM_OFFSET = 92;
    const PLAYER_Y = WORLD.height - PLAYER_BOTTOM_OFFSET;
    const PLAYER_ACCELERATION = 1500;
    const PLAYER_MAX_SPEED = 465;
    const PLAYER_HIT_WIDTH_RATIO = 0.61;
    const PLAYER_HIT_HEIGHT_RATIO = 0.56;
    const PRECISE_PICKUP_HIT_RATIO = 0.12;
    const RISK_PICKUP_WIDTH = 24;
    const RISK_SAFE_OFFSET_MIN = 28;
    const RISK_SAFE_OFFSET_MAX = 50;
    const PLAYER_EDGE_PADDING = 12;
    const FORCED_SHIFT_MINIMUM = 105;
    const GAP_EDGE_PADDING = 46;
    const PATTERN_INITIAL_DELAY = 1.95;
    const PATTERN_RECOVERY_TIME = 0.16;
    const HAZARD_RANDOM_SPEED = 18;
    const MINE_SPEED_BONUS = 18;
    const NET_SPEED_BONUS = 8;
    const CURRENT_GATE_DELAY = 0.2;
    const CURRENT_DURATION = 2.35;
    const FEVER_OBSTACLE_SCALE = 0.84;
    const HAZARD_MIN_SPEED_SCALE = 0.84;
    const PHASE_TIMES = [4.2, 8.4, 12.6, 16.8];
    const DOUBLE_GATE_OFFSET = 0.84;
    const SWEEP_GATE_OFFSET = 0.66;
    const LATE_SPEED_RAMP = 3.7;
    const PHASES = [
      { drain: 8.4, gap: 196, speed: 238, warning: 0.88, shift: 238, current: 102, reward: 42 },
      { drain: 11.2, gap: 184, speed: 286, warning: 0.76, shift: 268, current: 118, reward: 52 },
      { drain: 14.8, gap: 172, speed: 333, warning: 0.65, shift: 298, current: 136, reward: 64 },
      { drain: 18.5, gap: 158, speed: 381, warning: 0.56, shift: 330, current: 156, reward: 78 },
      { drain: 21.5, gap: 146, speed: 432, warning: 0.48, shift: 360, current: 178, reward: 92 }
    ];
    const reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = reducedMotionQuery.matches;
    const keyState = { left: false, right: false };
    const pointerState = { left: false, right: false };
    const entities = [];
    const particles = [];
    const warnings = [];
    const scheduledEvents = [];
    const bubbles = Array.from({ length: reducedMotion ? 9 : 24 }, (_, index) => ({
      x: (index * 137.31) % WORLD.width,
      y: (index * 79.73) % WORLD.height,
      radius: 1.4 + (index % 5) * 0.7,
      speed: 7 + (index % 6) * 2.5,
      drift: (index % 2 ? 1 : -1) * (2 + index % 4)
    }));

    const player = {
      x: WORLD.width / 2,
      y: PLAYER_Y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      velocityX: 0,
      direction: 1,
      lives: 1,
      shieldFor: 0
    };

    const game = {
      mode: 'idle',
      score: 0,
      combo: 0,
      runBestCombo: 0,
      comboWindow: 0,
      multiplier: 1,
      elapsed: 0,
      pickupTimer: 0,
      patternTimer: 0,
      crownTimer: 0,
      oxygen: OXYGEN_START,
      oxygenWarningStage: 0,
      oxygenFlashFor: 0,
      riskRewardFor: 0,
      riskAttemptFor: 0,
      feverFor: 0,
      currentFor: 0,
      currentStrength: 0,
      flashFor: 0,
      shakeFor: 0,
      hitStopFor: 0,
      deathTimer: 0,
      deathCause: 'unknown',
      lastSafeX: WORLD.width / 2,
      recentPatterns: [],
      lastTaunt: '',
      lastFrame: 0,
      animationFrame: 0,
      announcementTimer: 0,
      highScore: readNumber('naoking-deep-sea-high-score'),
      bestTime: readNumber('naoking-deep-sea-best-time'),
      bestCombo: readNumber('naoking-deep-sea-best-combo'),
      runs: readNumber('naoking-deep-sea-runs'),
      resultTaunt: '',
      resultTitle: '未判定',
      deathCueSent: false,
      gateSequence: 0,
      lastNearMissGate: 0
    };

    const TAUNTS = {
      common: [
        'なおキングは最初から見ていた。',
        '深海、向いてないかもしれん。',
        '王国民、海底で静かになる。',
        'その回避、気持ちだけは伝わった。',
        '海は広いのに、なぜそこへ行く。',
        'いまの動き、魚にも心配されてたで。',
        '操作説明、もう一回読む？',
        'なおキング判定、まだ回遊見習い。'
      ],
      instant: [
        'え、もう終わり？',
        '開始演出より短いやん。',
        '海に入って、海に負けた。',
        '3秒も王様を守れない王国民はこちらです。',
        '今のは回遊というより入水。',
        'なおキング、まだ準備運動してたで。',
        '記録より読み込みの方が長い。',
        '深海から即日返品されました。'
      ],
      early: [
        '5秒の壁、今日も立派やな。',
        'もう少し泳いだら魚も名前を覚えたのに。',
        '予兆は出てた。王国民は見てなかった。',
        'いま避けるところ、そこやで。',
        '反射神経、地上に置いてきた？',
        '次はせめて一桁後半まで頼む。'
      ],
      opening: [
        '5秒前から終わる王、記録係が追いつかない。',
        '予兆より先に、心が沈んだな。',
        '最初の青い隙間、王には狭すぎた？',
        '開幕で海へ返却されました。',
        'チュートリアルは読まない。海流も読まない。',
        'まだ酸素メーターの説明中だったぞ。'
      ],
      middle: [
        'ちょっと上手くなった瞬間に油断したな。',
        '10秒突破。なおキングも少しだけ認める。少しだけ。',
        '惜しい雰囲気だけは王国級。',
        '流れは見えてきた。岩も見て。',
        'その調子。最後の衝突以外は。',
        '次はあと3秒、欲張ってみようか。'
      ],
      long: [
        'ここまで来たなら、もう一回で届く。たぶん。',
        '20秒突破。なおキング、拍手はしないが見直した。',
        '深海適性、ようやく発見。',
        'かなり良い。最後だけ王国民だった。',
        '次は30秒。逃げる理由はもうない。',
        'その死に方以外は上級者やった。'
      ],
      near: [
        'あと1秒。これは煽るより、もう一回やな。',
        '29秒台。なおキング、無言で再挑戦を勧める。',
        'ほぼ生還。ほぼ、は生還ではない。',
        '惜しい。今だけは本当に惜しい。',
        '王冠まであと一歩。次で決めよう。',
        'ここまで来た王国民なら、次はいける。'
      ],
      rock: [
        '岩に負けた王国民はこちらです。',
        '岩は動いてない。いや今回は動いたけど予兆は出てた。',
        '王様より岩を選んだ進路。',
        'その岩、だいぶ前からおったで。',
        '石ころ一個に王国の命運を任せるな。'
      ],
      net: [
        '網に自分から入るタイプの王様。',
        '漁獲される側になってどうする。',
        '網の隙間、ちゃんと光ってたで。',
        '本日の収穫、なおキング一匹。',
        '回遊終了。理由、漁網。威厳、なし。'
      ],
      mine: [
        '赤く光る物には近づかない。深海の基本です。',
        '機雷を真珠だと思った？',
        '警告色を信じない王国民。',
        '爆発の中心に王様を置くな。',
        '今の進路、危険物が喜んでたで。'
      ],
      current: [
        '海流に流され、意思まで流された。',
        '矢印の方向、ちゃんと見えてた？',
        '流れに乗るのと流されるのは別です。',
        '海流のせいにしていいのは一回だけ。'
      ],
      greed: [
        '餌に目がくらんで、岩まで食べたな。',
        'O2は取れた？ 命は落とした。',
        '王国餌一匹に、王国ごと賭けたな。',
        '欲張った瞬間だけ、泳ぎが庶民だった。',
        '回復の数字を見て、障害物を忘れた王。',
        'その餌は高かったな。代金は残機ひとつ。',
        'RISKは読めた。REWARDまで届かなかった。',
        '餌を追った。海もお前を追っていた。'
      ],
      combo: [
        'そのコンボを抱えて沈むの、芸術点は高い。',
        '魚は取れる。障害物は避けられない。個性的やな。',
        '高コンボからの急停止。なおキング劇場でした。',
        '欲張ったな。王様は全部見ていた。'
      ],
      best: [
        '自己ベスト。今日は少しだけ王国民らしい。',
        '記録更新。なおキングの期待値も1ミリ上がった。',
        '前の自分には勝った。次は深海に勝て。',
        '新記録やん。そこは普通にえらい。'
      ],
      pbNear: [
        '自己ベストの背びれが、目の前で逃げた。',
        'あと一呼吸で更新。呼吸が足りなかった。',
        '記録更新の直前だけ、海はよく見ている。',
        'BESTの数字、今お前を見て笑っている。',
        '前回の自分に、ほんの少しだけ負けた。',
        '次は届く。今のは届かなかったけど。'
      ],
      oxygen: [
        '避けるだけで酸素が増えると思った？',
        '酸素ゼロ。威厳では呼吸できない。',
        '魚を無視した王様、呼吸にも無視された。',
        '餌は得点だけじゃない。次は吸え。',
        '海の支配者、酸欠には支配された。',
        '青いゲージまで深海に沈めたな。',
        'あと一匹食べていれば、まだ偉そうにできた。',
        '障害物は避けた。生存条件も避けた。'
      ],
      clear: [
        '30秒生還。王国民、本当にやるやん。',
        '完全回遊。なおキング直々に上級者認定。',
        '深海を制した。今日は煽るところがない。',
        '生還確認。王冠を名乗ってよし。今日だけ。'
      ]
    };

    function readNumber(key) {
      try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; }
    }

    function writeNumber(key, value) {
      try { localStorage.setItem(key, String(value)); } catch { /* Private browsing fallback. */ }
    }

    function setText(element, value) { if (element) element.textContent = value; }
    function announce(message) { setText(stateOutput, message); }
    function randomFrom(values) { return values[Math.floor(Math.random() * values.length)]; }
    function exclusiveTaunt(values) {
      const available = values.filter((message) => message !== game.lastTaunt);
      const message = randomFrom(available.length ? available : values);
      game.lastTaunt = message;
      return message;
    }
    function clamp(value, minimum, maximum) { return Math.max(minimum, Math.min(maximum, value)); }
    function emitGameAudio(cue, detail = {}) {
      const intensity = clamp(Number(detail.intensity ?? 0.5), 0, 1);
      const oxygen = Math.round(clamp(Number(detail.oxygen ?? game.oxygen), 0, 100));
      window.dispatchEvent(new CustomEvent('naoking:gameaudio', {
        detail: {
          ...detail,
          cue,
          intensity,
          oxygen
        }
      }));
    }
    function difficulty() { return clamp(game.elapsed / GAME_DURATION, 0, 1); }
    function phaseIndex() {
      if (game.elapsed >= PHASE_TIMES[3]) return 4;
      if (game.elapsed >= PHASE_TIMES[2]) return 3;
      if (game.elapsed >= PHASE_TIMES[1]) return 2;
      if (game.elapsed >= PHASE_TIMES[0]) return 1;
      return 0;
    }
    function phaseConfig() { return PHASES[phaseIndex()]; }

    function updateHud() {
      setText(timeOutput, `${Math.min(GAME_DURATION, game.elapsed).toFixed(1)}s`);
      setText(scoreOutput, game.score.toLocaleString('ja-JP'));
      setText(comboOutput, game.combo > 1 ? `${game.combo} COMBO ×${game.multiplier}` : '—');
      setText(bestOutput, `${game.bestTime.toFixed(1)}s`);
      const oxygenLevel = clamp(game.oxygen, 0, 100);
      oxygenHud.style.setProperty('--oxygen-level', String(oxygenLevel / 100));
      oxygenHud.setAttribute('aria-valuenow', String(Math.round(oxygenLevel)));
      oxygenHud.setAttribute('aria-valuetext', `残り酸素 ${Math.round(oxygenLevel)}パーセント`);
      setText(oxygenValue, `${Math.ceil(oxygenLevel)}%`);
      gameRoot.classList.toggle('is-fever', game.feverFor > 0);
      gameRoot.classList.toggle('has-current', game.currentFor > 0);
      gameRoot.classList.toggle('is-oxygen-low', oxygenLevel <= 40);
      gameRoot.classList.toggle('is-oxygen-critical', oxygenLevel <= 20);
      gameRoot.classList.toggle('is-risk-reward', game.riskRewardFor > 0);
    }

    function clearRunState() {
      entities.length = 0;
      particles.length = 0;
      warnings.length = 0;
      scheduledEvents.length = 0;
    }

    function resetGame() {
      clearRunState();
      Object.assign(game, {
        mode: 'playing', score: 0, combo: 0, runBestCombo: 0, comboWindow: 0, multiplier: 1,
        elapsed: 0, pickupTimer: 0.35, patternTimer: PATTERN_INITIAL_DELAY, crownTimer: 7.5 + Math.random() * 3,
        oxygen: OXYGEN_START, oxygenWarningStage: 0, oxygenFlashFor: 0,
        riskRewardFor: 0, riskAttemptFor: 0,
        feverFor: 0, currentFor: 0, currentStrength: 0, flashFor: 0, shakeFor: 0,
        hitStopFor: 0, deathTimer: 0, deathCause: 'unknown', lastSafeX: WORLD.width / 2,
        recentPatterns: [], announcementTimer: 3.8, lastFrame: performance.now(),
        resultTaunt: '', resultTitle: '回遊中', deathCueSent: false,
        gateSequence: 0, lastNearMissGate: 0
      });
      Object.assign(player, {
        x: WORLD.width / 2, y: PLAYER_Y, velocityX: 0, direction: 1, lives: 1, shieldFor: 0
      });
      keyState.left = keyState.right = false;
      pointerState.left = pointerState.right = false;
      gameRoot.classList.remove('is-dying', 'is-game-over', 'is-clear');
      startButton.classList.remove('is-retry-ready');
      startButton.textContent = '回遊中';
      startButton.disabled = true;
      startButton.setAttribute('aria-disabled', 'true');
      setText(stateOutput, 'LIFE 1。安全帯のO2餌を取りながら30秒生き残れ。');
      setText(rankOutput, '回遊中');
      announce('一度ぶつかれば終了。光る隙間へ泳げ。');
      updateHud();
    }

    function startGame() {
      const cue = game.mode === 'finished' ? 'retry' : 'start';
      cancelAnimationFrame(game.animationFrame);
      if (curtain) curtain.hidden = true;
      resetGame();
      emitGameAudio(cue, { intensity: cue === 'retry' ? 0.7 : 0.62 });
      announce('LIFE 1。O2は時間で減る。予兆の安全帯で王国餌を取れ。');
      canvas.focus({ preventScroll: true });
      game.animationFrame = requestAnimationFrame(frame);
    }

    function rankFor(time, cleared = false) {
      if (cleared || time >= GAME_DURATION) return ['深海完全制覇', '30秒を泳ぎ切った上級王国民。'];
      if (time >= 24) return ['王冠級回遊者', '王座まで、あとひと泳ぎ。'];
      if (time >= 15) return ['深海適性あり', '危険海域でも目が慣れてきた。'];
      if (time >= 10) return ['回遊兵候補', '初見の壁は越えた。'];
      if (time >= 5) return ['王国民見習い', '深海の入口には立てている。'];
      return ['浅瀬送り', '王国の海はまだ早かった。'];
    }

    function causeGroup(cause) {
      if (cause.includes('oxygen')) return 'oxygen';
      if (cause.includes('greed')) return 'greed';
      if (cause.includes('rock')) return 'rock';
      if (cause.includes('net')) return 'net';
      if (cause.includes('mine')) return 'mine';
      if (cause.includes('current')) return 'current';
      return 'common';
    }

    function chooseTaunt({ time, cause, isBest, cleared }) {
      const candidates = [];
      if (!cleared && causeGroup(cause) === 'oxygen') {
        return exclusiveTaunt(TAUNTS.oxygen);
      }
      if (!cleared && causeGroup(cause) === 'greed') return exclusiveTaunt(TAUNTS.greed);
      const distanceToBest = game.bestTime - time;
      if (!cleared && !isBest && time >= 5 && distanceToBest > 0 && distanceToBest <= 0.75) {
        return exclusiveTaunt(TAUNTS.pbNear);
      }
      if (!cleared && time < 5.5) return exclusiveTaunt(TAUNTS.opening);
      if (cleared) candidates.push(...TAUNTS.clear);
      else if (time < 3) candidates.push(...TAUNTS.instant);
      else if (time < 7) candidates.push(...TAUNTS.early);
      else if (time < 20) candidates.push(...TAUNTS.middle);
      else if (time < 28.7) candidates.push(...TAUNTS.long);
      else candidates.push(...TAUNTS.near);
      if (!cleared) candidates.push(...TAUNTS[causeGroup(cause)]);
      if (game.runBestCombo >= 8) candidates.push(...TAUNTS.combo);
      if (isBest && time >= 5) candidates.push(...TAUNTS.best);
      if (candidates.length < 8) candidates.push(...TAUNTS.common);
      const available = candidates.filter((message) => message !== game.lastTaunt);
      const message = randomFrom(available.length ? available : candidates);
      game.lastTaunt = message;
      return message;
    }

    function finishGame(cause = 'unknown', cleared = false) {
      if (!['playing', 'dying'].includes(game.mode)) return;
      game.mode = 'finished';
      game.deathCause = cause;
      keyState.left = keyState.right = false;
      pointerState.left = pointerState.right = false;
      player.velocityX = 0;
      warnings.length = 0;
      scheduledEvents.length = 0;
      game.currentFor = 0;
      game.currentStrength = 0;
      game.riskRewardFor = 0;
      game.riskAttemptFor = 0;

      const survivalTime = cleared ? GAME_DURATION : Math.min(GAME_DURATION, game.elapsed);
      const isBest = survivalTime > game.bestTime + 0.04;
      if (isBest) {
        game.bestTime = survivalTime;
        writeNumber('naoking-deep-sea-best-time', game.bestTime.toFixed(2));
      }
      if (game.score > game.highScore) {
        game.highScore = game.score;
        writeNumber('naoking-deep-sea-high-score', game.highScore);
      }
      if (game.runBestCombo > game.bestCombo) {
        game.bestCombo = game.runBestCombo;
        writeNumber('naoking-deep-sea-best-combo', game.bestCombo);
      }
      game.runs += 1;
      writeNumber('naoking-deep-sea-runs', game.runs);

      const [rank, rankDescription] = rankFor(survivalTime, cleared);
      const taunt = chooseTaunt({ time: survivalTime, cause, isBest, cleared });
      game.resultTitle = rank;
      game.resultTaunt = taunt;
      setText(rankOutput, rank);
      startButton.disabled = false;
      startButton.removeAttribute('aria-disabled');
      startButton.textContent = 'もう1回';
      startButton.classList.add('is-retry-ready');
      gameRoot.classList.remove('is-dying');
      gameRoot.classList.add('is-game-over');
      gameRoot.classList.toggle('is-clear', cleared);
      const bestSuffix = isBest ? ' NEW BEST!' : ` BEST ${game.bestTime.toFixed(1)}秒`;
      announce(`「${taunt}」 ${survivalTime.toFixed(1)}秒 / ${game.score}点。${rankDescription}${bestSuffix}`);
      emitGameAudio(cleared ? 'clear' : 'game-over', {
        intensity: cleared ? 1 : 0.84,
        cause,
        cleared
      });
      updateHud();
      draw();
    }

    function addParticles(x, y, color, count = 10, crown = false) {
      if (reducedMotion) return;
      for (let index = 0; index < count && particles.length < 130; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 55 + Math.random() * 190;
        particles.push({
          x, y,
          velocityX: Math.cos(angle) * velocity,
          velocityY: Math.sin(angle) * velocity - (crown ? 70 : 0),
          life: 0.42 + Math.random() * 0.58,
          maxLife: 1,
          size: 2 + Math.random() * (crown ? 7 : 4),
          color,
          crown
        });
      }
    }

    function beginDeath(entity, bypassShield = false) {
      if (game.mode !== 'playing') return;
      if (!bypassShield && player.shieldFor > 0) {
        player.shieldFor = 0;
        game.flashFor = 0.32;
        game.shakeFor = reducedMotion ? 0 : 0.16;
        game.score += 35;
        addParticles(entity.x, entity.y, '#ffe178', 24, true);
        emitGameAudio('shield-hit', { intensity: 0.78, cause: entity.type || 'unknown' });
        announce('王冠シールド消費。次は当たれば終わり。');
        return;
      }
      game.mode = 'dying';
      game.deathCause = entity.type === 'oxygen'
        ? 'oxygen'
        : (game.riskAttemptFor > 0 ? 'greed' : (game.currentFor > 0 ? 'current' : (entity.type || 'unknown')));
      game.deathTimer = reducedMotion ? 0.12 : 0.38;
      game.hitStopFor = reducedMotion ? 0 : 0.075;
      game.shakeFor = reducedMotion ? 0 : 0.32;
      game.flashFor = 0.24;
      player.lives = 0;
      player.velocityX = 0;
      gameRoot.classList.add('is-dying');
      addParticles(entity.x, entity.y, game.deathCause === 'oxygen' ? '#89eaff' : '#ff7779', 32);
      if (game.deathCause !== 'oxygen') {
        emitGameAudio('damage', { intensity: 1, cause: game.deathCause });
      }
      announce(game.deathCause === 'oxygen' ? '酸素ゼロ。なおキング、静かに沈む……' : '被弾。なおキング判定中……');
    }

    function schedule(delay, action) { scheduledEvents.push({ delay, action }); }

    function spawnPickup() {
      const roll = Math.random();
      const type = roll < 0.59 ? 'sardine' : roll < 0.86 ? 'tuna' : 'pearl';
      const specs = { sardine: [22, 14, 12, 3], tuna: [34, 19, 28, 5], pearl: [18, 18, 42, 2] }[type];
      entities.push({
        type, x: 54 + Math.random() * (WORLD.width - 108), y: -40,
        width: specs[0], height: specs[1], points: specs[2], oxygenGain: specs[3], hazard: false,
        speed: 150 + Math.random() * 60 + difficulty() * 35,
        sway: (Math.random() - 0.5) * 34, phase: Math.random() * Math.PI * 2, rotation: 0
      });
    }

    function spawnRiskFood({ gapX, gapWidth, speed, hazardType, rewardBoost = 0 }) {
      const phase = phaseConfig();
      const playerHitHalf = player.width * PLAYER_HIT_WIDTH_RATIO / 2;
      const safeOffset = clamp(gapWidth / 2 - playerHitHalf - 6, RISK_SAFE_OFFSET_MIN, RISK_SAFE_OFFSET_MAX);
      const direction = Math.random() < 0.5 ? -1 : 1;
      entities.push({
        type: 'royalTuna', x: gapX + safeOffset * direction, y: -hazardHeight(hazardType),
        width: RISK_PICKUP_WIDTH, height: 16, points: 45 + phaseIndex() * 20 + rewardBoost * 3,
        oxygenGain: phase.reward + rewardBoost, hazard: false, riskReward: true, precisePickup: true,
        speed, sway: 0, phase: Math.random() * Math.PI * 2, rotation: 0
      });
    }

    function spawnCrown() {
      entities.push({
        type: 'crown', x: 86 + Math.random() * (WORLD.width - 172), y: -55,
        width: 38, height: 31, points: 100, hazard: false,
        speed: 145 + difficulty() * 30, sway: 22, phase: Math.random() * Math.PI * 2, rotation: 0
      });
    }

    function gapWidthForCurrentDifficulty() { return phaseConfig().gap; }

    function chooseReachableGap(forceShift = true, shiftLimit = null) {
      const maximumShift = shiftLimit ?? phaseConfig().shift;
      let shift = (Math.random() * 2 - 1) * maximumShift;
      if (forceShift && Math.abs(shift) < Math.min(FORCED_SHIFT_MINIMUM, maximumShift * 0.68)) {
        const minimumShift = Math.min(FORCED_SHIFT_MINIMUM, maximumShift * 0.68);
        shift = (shift < 0 ? -1 : 1) * (minimumShift + Math.random() * (maximumShift - minimumShift));
      }
      const gapWidth = gapWidthForCurrentDifficulty();
      const edge = gapWidth / 2 + GAP_EDGE_PADDING;
      const gapX = clamp(game.lastSafeX + shift, edge, WORLD.width - edge);
      game.lastSafeX = gapX;
      return { gapX, gapWidth };
    }

    function hazardSpeed() {
      return phaseConfig().speed + Math.random() * HAZARD_RANDOM_SPEED + Math.max(0, game.elapsed - PHASE_TIMES[3]) * LATE_SPEED_RAMP;
    }

    function hazardHeight(hazardType) {
      if (hazardType === 'netGate') return 68;
      if (hazardType === 'mineGate') return 58;
      return 64;
    }

    function patternCooldown({ hazardType, speed, warningDelay, spawnOffset = 0 }) {
      const height = hazardHeight(hazardType);
      const playerHitHeight = player.height * PLAYER_HIT_HEIGHT_RATIO;
      const distanceUntilClear = PLAYER_Y + (height + playerHitHeight) / 2 + height;
      const slowestPossibleSpeed = speed * HAZARD_MIN_SPEED_SCALE;
      return spawnOffset + warningDelay + distanceUntilClear / slowestPossibleSpeed + PATTERN_RECOVERY_TIME;
    }

    function spawnGate({ gapX, gapWidth, hazardType, speed }) {
      const gateId = ++game.gateSequence;
      const leftWidth = gapX - gapWidth / 2;
      const rightStart = gapX + gapWidth / 2;
      const rightWidth = WORLD.width - rightStart;
      const height = hazardHeight(hazardType);
      const pushSegment = (x, width) => {
        if (width < 18) return;
        entities.push({
          type: hazardType, x, y: -height, width, height, points: 0, hazard: true,
          speed, sway: 0, phase: 0, rotation: 0, gateId, nearMissChecked: false
        });
      };
      pushSegment(leftWidth / 2, leftWidth);
      pushSegment(rightStart + rightWidth / 2, rightWidth);
    }

    function telegraphGate({
      gapX, gapWidth, hazardType, delay, speed, label = '', previewOnly = false,
      reward = false, rewardBoost = 0
    }) {
      warnings.push({
        kind: 'gate', gapX, gapWidth, hazardType, life: delay, maxLife: delay, label, previewOnly,
        onExpire: () => {
          spawnGate({ gapX, gapWidth, hazardType, speed });
          if (reward) spawnRiskFood({ gapX, gapWidth, speed, hazardType, rewardBoost });
        }
      });
    }

    function triggerCurrent(direction) {
      game.currentFor = CURRENT_DURATION;
      game.currentStrength = direction * phaseConfig().current;
      game.flashFor = 0.08;
      announce(direction > 0 ? '海流発生。右へ流される。逆らえ。' : '海流発生。左へ流される。逆らえ。');
    }

    function telegraphCurrent(direction, delay = 0.85) {
      emitGameAudio('current-warning', {
        intensity: 0.54 + phaseIndex() * 0.08,
        pattern: 'current-gate'
      });
      warnings.push({
        kind: 'current', direction, life: delay, maxLife: delay,
        onExpire: () => triggerCurrent(direction)
      });
    }

    function rememberPattern(name) {
      game.recentPatterns.push(name);
      if (game.recentPatterns.length > 3) game.recentPatterns.shift();
    }

    function choosePattern(pool) {
      const fresh = pool.filter((name) => !game.recentPatterns.includes(name));
      return randomFrom(fresh.length ? fresh : pool);
    }

    function spawnPattern() {
      const phase = phaseIndex();
      const pool = ['rock-gate', 'mine-gate', 'net-gate'];
      if (phase >= 1) pool.push('double-gate');
      if (phase >= 2) pool.push('current-gate');
      if (phase >= 3) pool.push('sweep-gate');
      const pattern = choosePattern(pool);
      rememberPattern(pattern);
      const warningTime = phaseConfig().warning;
      const first = chooseReachableGap(true);
      const speed = hazardSpeed();
      if (pattern !== 'current-gate') {
        emitGameAudio('pattern-warning', {
          intensity: 0.38 + phase * 0.1,
          pattern
        });
      }

      if (pattern === 'rock-gate') {
        telegraphGate({ ...first, hazardType: 'rockGate', delay: warningTime, speed, label: 'ROCK + O2', reward: true });
        announce('岩壁接近。青い隙間へ。');
        return patternCooldown({ hazardType: 'rockGate', speed, warningDelay: warningTime });
      }
      if (pattern === 'mine-gate') {
        const mineSpeed = speed + MINE_SPEED_BONUS;
        telegraphGate({ ...first, hazardType: 'mineGate', delay: warningTime, speed: mineSpeed, label: 'MINE + O2', reward: true });
        announce('機雷列接近。点滅する隙間を見ろ。');
        return patternCooldown({ hazardType: 'mineGate', speed: mineSpeed, warningDelay: warningTime });
      }
      if (pattern === 'net-gate') {
        const netSpeed = speed + NET_SPEED_BONUS;
        telegraphGate({ ...first, hazardType: 'netGate', delay: warningTime, speed: netSpeed, label: 'NET + O2', reward: true });
        announce('漁網接近。開いている場所へ。');
        return patternCooldown({ hazardType: 'netGate', speed: netSpeed, warningDelay: warningTime });
      }
      if (pattern === 'double-gate') {
        const secondType = Math.random() < 0.5 ? 'netGate' : 'rockGate';
        telegraphGate({ ...first, hazardType: 'rockGate', delay: warningTime, speed, label: '1 / 2' });
        schedule(DOUBLE_GATE_OFFSET, () => {
          const second = chooseReachableGap(true, 155);
          telegraphGate({
            ...second, hazardType: secondType, delay: warningTime, speed,
            label: 'NEXT 2 / 2 + O2', previewOnly: true, reward: true, rewardBoost: 4
          });
        });
        announce('連続波。次の隙間まで見て。');
        return patternCooldown({ hazardType: secondType, speed, warningDelay: warningTime, spawnOffset: DOUBLE_GATE_OFFSET });
      }
      if (pattern === 'current-gate') {
        const direction = Math.random() < 0.5 ? -1 : 1;
        telegraphCurrent(direction, warningTime);
        telegraphGate({
          ...first, hazardType: 'netGate', delay: warningTime + CURRENT_GATE_DELAY, speed,
          label: 'CURRENT + O2', reward: true, rewardBoost: 3
        });
        announce('海流予兆。矢印と隙間を同時に見ろ。');
        return patternCooldown({ hazardType: 'netGate', speed, warningDelay: warningTime + CURRENT_GATE_DELAY });
      }
      telegraphGate({ ...first, hazardType: 'mineGate', delay: warningTime, speed, label: '1 / 3' });
      schedule(SWEEP_GATE_OFFSET, () => {
        const second = chooseReachableGap(true, 145);
        telegraphGate({ ...second, hazardType: 'rockGate', delay: warningTime, speed, label: 'NEXT 2 / 3', previewOnly: true });
      });
      schedule(SWEEP_GATE_OFFSET * 2, () => {
        const third = chooseReachableGap(true, 145);
        telegraphGate({
          ...third, hazardType: 'netGate', delay: warningTime, speed,
          label: 'NEXT 3 / 3 + O2', previewOnly: true, reward: true, rewardBoost: 8
        });
      });
      announce('三連続波。止まるな。');
      return patternCooldown({ hazardType: 'netGate', speed, warningDelay: warningTime, spawnOffset: SWEEP_GATE_OFFSET * 2 });
    }

    function intersects(entity) {
      const playerHitWidth = player.width * (entity.precisePickup ? PRECISE_PICKUP_HIT_RATIO : PLAYER_HIT_WIDTH_RATIO);
      const playerHitHeight = player.height * (entity.precisePickup ? 0.38 : PLAYER_HIT_HEIGHT_RATIO);
      return Math.abs(entity.x - player.x) < (entity.width + playerHitWidth) / 2
        && Math.abs(entity.y - player.y) < (entity.height + playerHitHeight) / 2;
    }

    function collect(entity) {
      if (entity.type === 'crown') {
        game.feverFor = 3.2;
        player.shieldFor = 0.85;
        game.oxygen = clamp(game.oxygen + 10, 0, 100);
        game.oxygenFlashFor = 0.42;
        game.score += 100;
        game.combo += 2;
        game.runBestCombo = Math.max(game.runBestCombo, game.combo);
        game.flashFor = 0.42;
        addParticles(entity.x, entity.y, '#ffd66b', 30, true);
        emitGameAudio('crown', { intensity: 0.96 });
        announce('王冠獲得。3.2秒スコア2倍＋一瞬だけシールド。無敵ではない。');
        return;
      }
      game.combo = game.comboWindow > 0 ? game.combo + 1 : 1;
      game.comboWindow = 1.9;
      game.multiplier = Math.min(4, 1 + Math.floor(game.combo / 5));
      game.runBestCombo = Math.max(game.runBestCombo, game.combo);
      const feverMultiplier = game.feverFor > 0 ? 2 : 1;
      game.score += entity.points * game.multiplier * feverMultiplier;
      const oxygenGain = entity.oxygenGain || 0;
      if (oxygenGain > 0) {
        game.oxygen = clamp(game.oxygen + oxygenGain, 0, 100);
        game.oxygenFlashFor = entity.riskReward ? 0.46 : 0.24;
      }
      addParticles(entity.x, entity.y, entity.type === 'pearl' ? '#dffcff' : '#ffd66b', entity.type === 'pearl' ? 18 : 9);
      emitGameAudio(entity.type === 'pearl' || entity.riskReward ? 'rare-pickup' : 'pickup', {
        intensity: entity.riskReward ? 0.88 : (entity.type === 'pearl' ? 0.72 : 0.38)
      });
      if (entity.riskReward) {
        game.riskRewardFor = 0.58;
        game.riskAttemptFor = 0.55;
        announce(`RISK CLEARED → O2 +${oxygenGain}% / ${game.combo} COMBO`);
      }
    }

    function updateParticles(delta) {
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.life -= delta;
        particle.x += particle.velocityX * delta;
        particle.y += particle.velocityY * delta;
        particle.velocityY += 120 * delta;
        if (particle.life <= 0) particles.splice(index, 1);
      }
    }

    function updateAmbient(delta) {
      for (const bubble of bubbles) {
        bubble.y -= bubble.speed * delta;
        bubble.x += Math.sin(game.elapsed + bubble.y * 0.01) * bubble.drift * delta;
        if (bubble.y < -10) {
          bubble.y = WORLD.height + 10;
          bubble.x = Math.random() * WORLD.width;
        }
      }
    }

    function updateDying(delta) {
      if (game.hitStopFor > 0) {
        game.hitStopFor = Math.max(0, game.hitStopFor - delta);
        return;
      }
      const slowDelta = delta * (reducedMotion ? 1 : 0.32);
      game.deathTimer -= delta;
      if (!game.deathCueSent && game.deathTimer <= (reducedMotion ? 0.08 : 0.22)) {
        game.deathCueSent = true;
        emitGameAudio('death', { intensity: 0.92, cause: game.deathCause });
      }
      game.flashFor = Math.max(0, game.flashFor - delta);
      game.oxygenFlashFor = Math.max(0, game.oxygenFlashFor - delta);
      game.riskRewardFor = Math.max(0, game.riskRewardFor - delta);
      game.riskAttemptFor = Math.max(0, game.riskAttemptFor - delta);
      game.shakeFor = Math.max(0, game.shakeFor - delta);
      updateParticles(slowDelta);
      updateAmbient(slowDelta);
      if (game.deathTimer <= 0) finishGame(game.deathCause, false);
    }

    function update(delta) {
      if (game.mode === 'dying') { updateDying(delta); return; }
      if (game.mode !== 'playing') return;

      game.elapsed += delta;
      game.pickupTimer -= delta;
      game.patternTimer -= delta;
      game.crownTimer -= delta;
      game.comboWindow = Math.max(0, game.comboWindow - delta);
      game.feverFor = Math.max(0, game.feverFor - delta);
      game.currentFor = Math.max(0, game.currentFor - delta);
      game.flashFor = Math.max(0, game.flashFor - delta);
      game.oxygenFlashFor = Math.max(0, game.oxygenFlashFor - delta);
      game.riskRewardFor = Math.max(0, game.riskRewardFor - delta);
      game.riskAttemptFor = Math.max(0, game.riskAttemptFor - delta);
      game.shakeFor = Math.max(0, game.shakeFor - delta);
      player.shieldFor = Math.max(0, player.shieldFor - delta);
      game.oxygen = Math.max(0, game.oxygen - phaseConfig().drain * delta);
      if (game.oxygen <= 40 && game.oxygenWarningStage === 0) {
        game.oxygenWarningStage = 1;
        emitGameAudio('oxygen-warning', { intensity: 0.58, oxygen: Math.round(game.oxygen) });
        announce('O2 40%. 餌を取らないと、避けても沈む。');
      }
      if (game.oxygen <= 20 && game.oxygenWarningStage === 1) {
        game.oxygenWarningStage = 2;
        emitGameAudio('oxygen-warning', { intensity: 0.94, oxygen: Math.round(game.oxygen) });
        announce('O2 CRITICAL. 危険帯の王国餌へ。');
      }
      if (game.currentFor <= 0) game.currentStrength = 0;
      if (game.comboWindow <= 0 && game.combo > 0) { game.combo = 0; game.multiplier = 1; }

      const movingLeft = keyState.left || pointerState.left;
      const movingRight = keyState.right || pointerState.right;
      const input = Number(movingRight) - Number(movingLeft);
      const maxSpeed = game.feverFor > 0 ? 525 : PLAYER_MAX_SPEED;
      player.velocityX += input * PLAYER_ACCELERATION * delta;
      player.velocityX *= Math.pow(input ? 0.16 : 0.009, delta);
      player.velocityX = clamp(player.velocityX, -maxSpeed, maxSpeed);
      player.x += (player.velocityX + game.currentStrength) * delta;
      player.x = clamp(
        player.x,
        player.width / 2 + PLAYER_EDGE_PADDING,
        WORLD.width - player.width / 2 - PLAYER_EDGE_PADDING
      );
      if (Math.abs(player.velocityX) > 10) player.direction = Math.sign(player.velocityX);

      if (game.pickupTimer <= 0) {
        spawnPickup();
        game.pickupTimer = 0.42 + Math.random() * 0.34 - difficulty() * 0.08;
      }
      if (game.patternTimer <= 0) game.patternTimer = spawnPattern();
      if (game.crownTimer <= 0) { spawnCrown(); game.crownTimer = 9.5 + Math.random() * 5.5; }

      for (let index = scheduledEvents.length - 1; index >= 0; index -= 1) {
        const event = scheduledEvents[index];
        event.delay -= delta;
        if (event.delay <= 0) { scheduledEvents.splice(index, 1); event.action(); }
      }
      for (let index = warnings.length - 1; index >= 0; index -= 1) {
        const warning = warnings[index];
        warning.life -= delta;
        if (warning.life <= 0) { warnings.splice(index, 1); warning.onExpire(); }
      }

      updateAmbient(delta);
      const obstacleScale = game.feverFor > 0 ? FEVER_OBSTACLE_SCALE : 1;
      for (let index = entities.length - 1; index >= 0; index -= 1) {
        const entity = entities[index];
        entity.y += entity.speed * delta * (entity.hazard || entity.riskReward ? obstacleScale : 1);
        entity.x += Math.sin(game.elapsed * 2.1 + entity.phase) * entity.sway * delta;
        entity.rotation += delta * (entity.hazard ? 0.9 : 0.25);
        if (
          entity.riskReward
          && entity.y > PLAYER_Y - 150
          && entity.y < PLAYER_Y + 36
          && Math.abs(entity.x - player.x) < 30
        ) game.riskAttemptFor = 0.7;
        if (intersects(entity)) {
          entities.splice(index, 1);
          if (entity.hazard) beginDeath(entity); else collect(entity);
          if (game.mode === 'dying') break;
        } else {
          const passedPlayer = entity.hazard
            && !entity.nearMissChecked
            && entity.y >= PLAYER_Y + (entity.height + player.height * PLAYER_HIT_HEIGHT_RATIO) / 2;
          if (passedPlayer) {
            entity.nearMissChecked = true;
            const clearance = Math.abs(entity.x - player.x)
              - (entity.width + player.width * PLAYER_HIT_WIDTH_RATIO) / 2;
            if (clearance >= 0 && clearance <= 22 && game.lastNearMissGate !== entity.gateId) {
              game.lastNearMissGate = entity.gateId;
              emitGameAudio('near-miss', {
                intensity: clamp(1 - clearance / 30, 0.55, 0.96),
                cause: entity.type
              });
            }
          }
          if (entity.y > WORLD.height + 90) entities.splice(index, 1);
        }
      }

      if (game.mode === 'playing' && game.oxygen <= 0) {
        beginDeath({ type: 'oxygen', x: player.x, y: player.y }, true);
      }
      if (game.mode === 'dying') {
        updateParticles(delta);
        updateHud();
        return;
      }

      updateParticles(delta);
      game.announcementTimer -= delta;
      if (game.announcementTimer <= 0) {
        game.announcementTimer = 4.2;
        const remaining = Math.max(0, GAME_DURATION - game.elapsed);
        announce(`${game.elapsed.toFixed(1)}秒生存。残り${remaining.toFixed(1)}秒 / BEST ${game.bestTime.toFixed(1)}秒。`);
      }
      if (game.elapsed >= GAME_DURATION) finishGame('clear', true);
      updateHud();
    }

    function roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, Math.min(radius, width / 2, height / 2));
    }

    function drawBackground() {
      const intensity = difficulty();
      const gradient = context.createLinearGradient(0, 0, 0, WORLD.height);
      gradient.addColorStop(0, game.feverFor > 0 ? '#08728a' : '#07506a');
      gradient.addColorStop(0.55, game.feverFor > 0 ? '#06465a' : '#063448');
      gradient.addColorStop(1, '#041b28');
      context.fillStyle = gradient;
      context.fillRect(0, 0, WORLD.width, WORLD.height);

      context.save();
      context.globalAlpha = 0.08 + intensity * 0.04;
      context.strokeStyle = '#9eeeff';
      context.lineWidth = 16;
      for (let index = -2; index < 8; index += 1) {
        const offset = (game.elapsed * 13 + index * 160) % 1300;
        context.beginPath();
        context.moveTo(offset - 260, 0);
        context.quadraticCurveTo(offset, 190, offset - 90, 410);
        context.stroke();
      }
      context.restore();

      context.fillStyle = '#062431';
      context.beginPath();
      context.moveTo(0, WORLD.height);
      context.lineTo(0, WORLD.height - 48);
      for (let x = 0; x <= WORLD.width; x += 48) context.lineTo(x, WORLD.height - 38 - Math.sin(x * 0.035) * 14);
      context.lineTo(WORLD.width, WORLD.height);
      context.fill();

      context.save();
      context.strokeStyle = '#a5efff';
      context.globalAlpha = 0.22;
      context.lineWidth = 1.6;
      for (const bubble of bubbles) {
        context.beginPath();
        context.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();

      if (intensity > 0.45) {
        const pressure = context.createRadialGradient(player.x, player.y, 100, player.x, player.y, 610);
        pressure.addColorStop(0, 'rgba(4, 29, 43, 0)');
        pressure.addColorStop(1, `rgba(0, 12, 24, ${0.08 + intensity * 0.16})`);
        context.fillStyle = pressure;
        context.fillRect(0, 0, WORLD.width, WORLD.height);
      }
    }

    function drawWarnings() {
      for (const warning of warnings) {
        const progress = 1 - warning.life / warning.maxLife;
        const pulse = 0.45 + Math.sin(progress * Math.PI * 8) * 0.14;
        context.save();
        if (warning.kind === 'current') {
          context.globalAlpha = pulse;
          context.fillStyle = '#8deafa';
          const direction = warning.direction;
          for (let row = 0; row < 3; row += 1) {
            for (let column = 0; column < 6; column += 1) {
              const x = 100 + column * 150;
              const y = 145 + row * 105;
              context.save();
              context.translate(x, y);
              context.scale(direction, 1);
              context.beginPath();
              context.moveTo(-28, -8);
              context.lineTo(8, -8);
              context.lineTo(8, -20);
              context.lineTo(34, 0);
              context.lineTo(8, 20);
              context.lineTo(8, 8);
              context.lineTo(-28, 8);
              context.closePath();
              context.fill();
              context.restore();
            }
          }
        } else if (warning.previewOnly) {
          const trackLeft = 130;
          const trackTop = 88;
          const trackWidth = WORLD.width - trackLeft * 2;
          const trackHeight = 24;
          const gapLeft = trackLeft + ((warning.gapX - warning.gapWidth / 2) / WORLD.width) * trackWidth;
          const gapWidth = (warning.gapWidth / WORLD.width) * trackWidth;
          context.globalAlpha = 0.9;
          context.fillStyle = 'rgba(3, 24, 34, .88)';
          roundRect(context, trackLeft - 8, trackTop - 7, trackWidth + 16, trackHeight + 14, 12);
          context.fill();
          context.fillStyle = 'rgba(255, 111, 111, .42)';
          context.fillRect(trackLeft, trackTop, trackWidth, trackHeight);
          context.fillStyle = 'rgba(131, 239, 255, .88)';
          context.fillRect(gapLeft, trackTop, gapWidth, trackHeight);
          context.strokeStyle = '#dffbff';
          context.lineWidth = 2;
          context.strokeRect(gapLeft, trackTop, gapWidth, trackHeight);
          context.fillStyle = '#dffbff';
          context.textAlign = 'center';
          context.font = '900 12px system-ui, sans-serif';
          context.fillText(warning.label || 'NEXT GAP', WORLD.width / 2, trackTop - 11);
        } else {
          const gapLeft = warning.gapX - warning.gapWidth / 2;
          const gapRight = warning.gapX + warning.gapWidth / 2;
          context.fillStyle = `rgba(255, 103, 103, ${pulse * 0.24})`;
          context.fillRect(0, 0, gapLeft, WORLD.height);
          context.fillRect(gapRight, 0, WORLD.width - gapRight, WORLD.height);
          context.fillStyle = `rgba(121, 239, 255, ${pulse * 0.16})`;
          context.fillRect(gapLeft, 0, warning.gapWidth, WORLD.height);
          context.strokeStyle = `rgba(159, 248, 255, ${pulse + 0.18})`;
          context.lineWidth = 3;
          context.setLineDash([12, 10]);
          context.strokeRect(gapLeft + 3, 4, warning.gapWidth - 6, WORLD.height - 8);
          context.setLineDash([]);
          context.fillStyle = '#dffbff';
          context.textAlign = 'center';
          context.font = '900 14px system-ui, sans-serif';
          context.fillText(warning.label || 'SAFE GAP', warning.gapX, 25);
        }
        context.restore();
      }
    }

    function drawFish(entity) {
      context.save();
      context.translate(entity.x, entity.y);
      if (entity.riskReward) {
        context.shadowColor = '#79efff';
        context.shadowBlur = 19;
        context.strokeStyle = 'rgba(130, 241, 255, .78)';
        context.lineWidth = 2;
        context.beginPath();
        context.arc(0, 0, 22 + Math.sin(game.elapsed * 7 + entity.phase) * 2, 0, Math.PI * 2);
        context.stroke();
      }
      const color = entity.type === 'royalTuna' ? '#8fe8ef' : (entity.type === 'tuna' ? '#ff9678' : '#ffdd70');
      context.fillStyle = entity.type === 'pearl' ? '#dffaff' : color;
      if (entity.type === 'pearl') {
        context.shadowColor = '#bdefff'; context.shadowBlur = 16;
        context.beginPath(); context.arc(0, 0, 12, 0, Math.PI * 2); context.fill();
        context.strokeStyle = '#86c6d7'; context.stroke();
      } else {
        context.beginPath(); context.ellipse(0, 0, entity.width / 2, entity.height / 2, 0, 0, Math.PI * 2); context.fill();
        context.beginPath(); context.moveTo(entity.width / 2 - 3, 0); context.lineTo(entity.width / 2 + 14, -entity.height / 2); context.lineTo(entity.width / 2 + 14, entity.height / 2); context.closePath(); context.fill();
        context.fillStyle = '#0c3141'; context.beginPath(); context.arc(-entity.width * 0.22, -2, 2.3, 0, Math.PI * 2); context.fill();
      }
      if (entity.riskReward) {
        context.shadowBlur = 0;
        context.fillStyle = '#dffcff';
        context.textAlign = 'center';
        context.font = '900 11px system-ui, sans-serif';
        context.fillText(`O2 +${entity.oxygenGain}`, 0, -20);
      }
      context.restore();
    }

    function drawRockGate(entity) {
      context.fillStyle = '#4f6975'; context.strokeStyle = '#7694a0'; context.lineWidth = 2;
      context.beginPath();
      const left = -entity.width / 2; const top = -entity.height / 2;
      context.moveTo(left, top + 12);
      for (let x = 0; x <= entity.width; x += 28) context.lineTo(left + x, top + (x / 28 % 2 ? 2 : 15));
      context.lineTo(entity.width / 2, entity.height / 2 - 8);
      for (let x = entity.width; x >= 0; x -= 28) context.lineTo(left + x, entity.height / 2 - (x / 28 % 2 ? 14 : 3));
      context.closePath(); context.fill(); context.stroke();
    }

    function drawNetGate(entity) {
      context.fillStyle = 'rgba(133, 184, 194, .14)';
      context.fillRect(-entity.width / 2, -entity.height / 2, entity.width, entity.height);
      context.strokeStyle = '#c4e5e9'; context.lineWidth = 2.4;
      context.strokeRect(-entity.width / 2, -entity.height / 2, entity.width, entity.height);
      context.lineWidth = 1.2;
      for (let offset = -entity.width / 2 + 14; offset < entity.width / 2; offset += 18) {
        context.beginPath(); context.moveTo(offset, -entity.height / 2); context.lineTo(offset, entity.height / 2); context.stroke();
      }
      for (let offset = -entity.height / 2 + 14; offset < entity.height / 2; offset += 16) {
        context.beginPath(); context.moveTo(-entity.width / 2, offset); context.lineTo(entity.width / 2, offset); context.stroke();
      }
    }

    function drawMineGate(entity) {
      context.fillStyle = 'rgba(255, 95, 105, .09)';
      context.fillRect(-entity.width / 2, -entity.height / 2, entity.width, entity.height);
      const count = Math.max(1, Math.floor(entity.width / 54));
      for (let index = 0; index < count; index += 1) {
        const x = count === 1 ? 0 : -entity.width / 2 + 28 + index * ((entity.width - 56) / (count - 1));
        context.save(); context.translate(x, 0); context.rotate(entity.rotation + index * 0.4);
        context.fillStyle = '#182f39'; context.strokeStyle = '#ff7378'; context.lineWidth = 2.5;
        context.beginPath(); context.arc(0, 0, 16, 0, Math.PI * 2); context.fill(); context.stroke();
        for (let spike = 0; spike < 8; spike += 1) { context.rotate(Math.PI / 4); context.fillStyle = '#ff7378'; context.fillRect(14, -1.7, 8, 3.4); }
        context.restore();
      }
    }

    function drawHazard(entity) {
      context.save(); context.translate(entity.x, entity.y);
      if (entity.type === 'rockGate') drawRockGate(entity);
      else if (entity.type === 'netGate') drawNetGate(entity);
      else drawMineGate(entity);
      context.restore();
    }

    function drawCrown(entity) {
      context.save();
      context.translate(entity.x, entity.y + Math.sin(game.elapsed * 4 + entity.phase) * 4);
      context.shadowColor = '#ffd762'; context.shadowBlur = 22; context.fillStyle = '#ffd762';
      context.beginPath(); context.moveTo(-22, 13); context.lineTo(-24, -13); context.lineTo(-8, -1); context.lineTo(0, -20); context.lineTo(9, -1); context.lineTo(24, -13); context.lineTo(21, 13); context.closePath(); context.fill();
      context.restore();
    }

    function drawPlayer() {
      context.save(); context.translate(player.x, player.y); context.scale(player.direction || 1, 1);
      if (game.feverFor > 0 || player.shieldFor > 0) { context.shadowColor = '#ffda69'; context.shadowBlur = player.shieldFor > 0 ? 34 : 21; }
      context.fillStyle = '#8fc8d8';
      context.beginPath(); context.ellipse(0, 0, 48, 29, 0, 0, Math.PI * 2); context.fill();
      context.beginPath(); context.moveTo(-44, -4); context.lineTo(-70, -28); context.lineTo(-68, 27); context.closePath(); context.fill();
      context.beginPath(); context.moveTo(1, -24); context.lineTo(-13, -46); context.lineTo(24, -24); context.closePath(); context.fill();
      context.fillStyle = '#eaf8fb'; context.beginPath(); context.ellipse(20, 9, 29, 17, -0.13, 0, Math.PI * 2); context.fill();
      context.fillStyle = '#092d3d'; context.beginPath(); context.arc(26, -6, 6.5, 0, Math.PI * 2); context.fill();
      context.fillStyle = '#fff'; context.beginPath(); context.arc(28, -9, 2.3, 0, Math.PI * 2); context.fill();
      context.strokeStyle = '#214d5d'; context.lineWidth = 2;
      for (let offset = -1; offset <= 1; offset += 1) { context.beginPath(); context.moveTo(34 + offset * 5, 6); context.lineTo(38 + offset * 5, 13); context.stroke(); }
      if (game.feverFor > 0) {
        context.fillStyle = '#ffd762'; context.beginPath(); context.moveTo(-10, -31); context.lineTo(-16, -50); context.lineTo(-3, -40); context.lineTo(6, -57); context.lineTo(15, -40); context.lineTo(28, -50); context.lineTo(21, -29); context.closePath(); context.fill();
      }
      if (player.shieldFor > 0) { context.strokeStyle = 'rgba(255, 226, 120, .9)'; context.lineWidth = 3; context.beginPath(); context.arc(0, 0, 72, 0, Math.PI * 2); context.stroke(); }
      context.restore();
    }

    function drawOverlay() {
      context.save();
      context.fillStyle = '#021923cc'; roundRect(context, 18, 18, 176, 54, 15); context.fill();
      context.font = '800 17px system-ui, sans-serif'; context.fillStyle = player.lives > 0 ? '#d8f8ff' : '#ff9598';
      context.fillText(player.lives > 0 ? 'LIFE  ◆' : 'LIFE  EMPTY', 34, 51);
      const survivalWidth = 310;
      context.fillStyle = '#041a24cc'; roundRect(context, WORLD.width / 2 - survivalWidth / 2, 20, survivalWidth, 40, 13); context.fill();
      context.fillStyle = '#75ddea'; roundRect(context, WORLD.width / 2 - survivalWidth / 2 + 5, 25, (survivalWidth - 10) * clamp(game.elapsed / GAME_DURATION, 0, 1), 30, 9); context.fill();
      context.fillStyle = '#052734'; context.textAlign = 'center'; context.font = '900 16px system-ui, sans-serif'; context.fillText(`${game.elapsed.toFixed(1)} / ${GAME_DURATION.toFixed(1)} SEC`, WORLD.width / 2, 47); context.textAlign = 'start';
      if (game.feverFor > 0) {
        const width = 245; const progress = game.feverFor / 3.2;
        context.fillStyle = '#071a22dd'; roundRect(context, WORLD.width - width - 18, 20, width, 40, 13); context.fill();
        context.fillStyle = '#ffd762'; roundRect(context, WORLD.width - width - 13, 25, (width - 10) * progress, 30, 9); context.fill();
        context.fillStyle = '#082333'; context.textAlign = 'center'; context.font = '900 15px system-ui, sans-serif'; context.fillText('ROYAL FEVER ×2', WORLD.width - width / 2 - 18, 47); context.textAlign = 'start';
      }
      if (game.mode === 'idle' && (!curtain || curtain.hidden)) {
        context.fillStyle = '#031722df'; context.fillRect(0, 0, WORLD.width, WORLD.height); context.textAlign = 'center'; context.fillStyle = '#dffaff'; context.font = '900 42px system-ui, sans-serif'; context.fillText('一撃で終了。深海へ挑め。', WORLD.width / 2, WORLD.height / 2 - 18); context.fillStyle = '#9fcad5'; context.font = '600 20px system-ui, sans-serif'; context.fillText('赤い予兆を避け、青い隙間へ。30秒で完全制覇。', WORLD.width / 2, WORLD.height / 2 + 27);
      } else if (game.mode === 'finished') {
        context.fillStyle = 'rgba(3, 23, 34, .84)'; context.fillRect(0, 0, WORLD.width, WORLD.height); context.textAlign = 'center';
        context.fillStyle = game.resultTitle === '深海完全制覇' ? '#ffd762' : '#ffcb78'; context.font = '900 22px system-ui, sans-serif'; context.fillText('NAOKING JUDGMENT', WORLD.width / 2, WORLD.height / 2 - 82);
        context.fillStyle = '#e8fbff'; context.font = '900 46px system-ui, sans-serif'; context.fillText(game.resultTitle, WORLD.width / 2, WORLD.height / 2 - 22);
        context.fillStyle = '#9fd9e5'; context.font = '800 22px system-ui, sans-serif'; context.fillText(`${Math.min(GAME_DURATION, game.elapsed).toFixed(1)} SEC  /  ${game.score.toLocaleString('ja-JP')} POINTS`, WORLD.width / 2, WORLD.height / 2 + 23);
        context.fillStyle = '#f5fbfd'; context.font = '700 18px system-ui, sans-serif';
        const shortTaunt = game.resultTaunt.length > 28 ? `${game.resultTaunt.slice(0, 28)}…` : game.resultTaunt;
        context.fillText(`「${shortTaunt}」`, WORLD.width / 2, WORLD.height / 2 + 63);
        context.fillStyle = '#ffd762'; context.font = '900 16px system-ui, sans-serif'; context.fillText('もう1回は、すぐ下。', WORLD.width / 2, WORLD.height / 2 + 100);
      }
      context.restore();
    }

    function drawParticles() {
      for (const particle of particles) {
        context.save(); context.globalAlpha = Math.max(0, particle.life / particle.maxLife); context.fillStyle = particle.color;
        if (particle.crown) { context.translate(particle.x, particle.y); context.rotate(particle.life * 6); context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size); }
        else { context.beginPath(); context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); context.fill(); }
        context.restore();
      }
    }

    function draw() {
      context.save();
      if (game.shakeFor > 0) { const strength = Math.min(12, game.shakeFor * 38); context.translate((Math.random() - 0.5) * strength, (Math.random() - 0.5) * strength * 0.7); }
      drawBackground(); drawWarnings();
      for (const entity of entities) { if (entity.hazard) drawHazard(entity); else if (entity.type === 'crown') drawCrown(entity); else drawFish(entity); }
      drawParticles(); drawPlayer(); drawOverlay();
      if (game.flashFor > 0) {
        const fever = game.feverFor > 0 || player.shieldFor > 0;
        const oxygenDeath = game.mode === 'dying' && game.deathCause === 'oxygen';
        context.fillStyle = oxygenDeath
          ? `rgba(94, 202, 238, ${Math.min(0.38, game.flashFor)})`
          : (fever ? `rgba(255, 224, 116, ${Math.min(0.42, game.flashFor)})` : `rgba(255, 105, 111, ${Math.min(0.42, game.flashFor)})`);
        context.fillRect(0, 0, WORLD.width, WORLD.height);
      }
      if (game.oxygenFlashFor > 0) {
        context.fillStyle = `rgba(126, 235, 255, ${Math.min(0.16, game.oxygenFlashFor * 0.34)})`;
        context.fillRect(0, 0, WORLD.width, WORLD.height);
      }
      context.restore();
    }

    function frame(now) {
      const delta = Math.min(0.035, Math.max(0, (now - game.lastFrame) / 1000));
      game.lastFrame = now; update(delta); draw();
      if (game.mode === 'playing' || game.mode === 'dying') game.animationFrame = requestAnimationFrame(frame);
    }

    function setDirection(direction, pressed) { pointerState[direction] = pressed; }

    function bindControl(button, direction) {
      if (!button) return;
      button.setAttribute('aria-label', direction === 'left' ? 'なおキングを左へ泳がせる' : 'なおキングを右へ泳がせる');
      button.style.touchAction = 'none';
      button.addEventListener('pointerdown', (event) => { event.preventDefault(); button.setPointerCapture?.(event.pointerId); setDirection(direction, true); });
      ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave'].forEach((type) => button.addEventListener(type, () => setDirection(direction, false)));
      button.addEventListener('contextmenu', (event) => event.preventDefault());
    }

    startButton.addEventListener('click', startGame);
    bindControl(leftControl, 'left');
    bindControl(rightControl, 'right');
    window.addEventListener('keydown', (event) => {
      const target = event.target;
      const isEditableTarget = target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
      if (document.body?.dataset?.page !== 'game' || isEditableTarget) return;
      if (game.mode === 'finished' && event.key.toLowerCase() === 'r') { startGame(); event.preventDefault(); return; }
      if (game.mode !== 'playing') return;
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') { keyState.left = true; event.preventDefault(); }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') { keyState.right = true; event.preventDefault(); }
    }, { passive: false });
    window.addEventListener('keyup', (event) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') keyState.left = false;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') keyState.right = false;
    });
    window.addEventListener('blur', () => {
      keyState.left = keyState.right = false;
      pointerState.left = pointerState.right = false;
    });
    reducedMotionQuery.addEventListener?.('change', (event) => {
      reducedMotion = event.matches;
      if (!reducedMotion) return;
      game.shakeFor = 0;
      game.hitStopFor = 0;
      game.flashFor = 0;
      game.oxygenFlashFor = 0;
      particles.length = 0;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && ['playing', 'dying'].includes(game.mode)) {
        game.lastFrame = performance.now(); keyState.left = keyState.right = false; pointerState.left = pointerState.right = false;
      }
    });
    window.addEventListener('naoking:pagechange', (event) => {
      if (event.detail?.page !== 'game') emitGameAudio('exit', { intensity: 0 });
      if (event.detail?.page !== 'game' && game.mode !== 'idle') {
        cancelAnimationFrame(game.animationFrame);
        clearRunState();
        Object.assign(game, {
          mode: 'idle', score: 0, combo: 0, runBestCombo: 0, comboWindow: 0, multiplier: 1,
          elapsed: 0, pickupTimer: 0, patternTimer: 0, crownTimer: 0,
          oxygen: OXYGEN_START, oxygenWarningStage: 0, oxygenFlashFor: 0,
          riskRewardFor: 0, riskAttemptFor: 0, feverFor: 0,
          currentFor: 0, currentStrength: 0, flashFor: 0, shakeFor: 0, hitStopFor: 0,
          deathTimer: 0, deathCause: 'unknown', lastSafeX: WORLD.width / 2,
          recentPatterns: [], announcementTimer: 0, resultTaunt: '', resultTitle: '未判定',
          deathCueSent: false, gateSequence: 0, lastNearMissGate: 0
        });
        Object.assign(player, { x: WORLD.width / 2, y: PLAYER_Y, velocityX: 0, direction: 1, lives: 1, shieldFor: 0 });
        keyState.left = keyState.right = false; pointerState.left = pointerState.right = false;
        gameRoot.classList.remove(
          'is-dying', 'is-game-over', 'is-clear', 'is-fever', 'has-current',
          'is-oxygen-low', 'is-oxygen-critical'
        );
        startButton.classList.remove('is-retry-ready');
        setText(rankOutput, '未判定');
        updateHud();
        draw();
        announce('LIFE 1 / O2は餌で回復 / 30秒で完全制覇');
        startButton.disabled = false; startButton.removeAttribute('aria-disabled'); startButton.textContent = '回遊を始める';
      }
    });
    if ('ResizeObserver' in window) new ResizeObserver(() => draw()).observe(host);

    if (helpOutput) helpOutput.textContent = 'LIFE 1。酸素は時間で減少し、餌で回復。予兆の青い安全帯へ泳ぎ、30秒生存で完全制覇。';
    game.mode = 'idle';
    updateHud();
    setText(rankOutput, '未判定');
    announce('LIFE 1 / O2は餌で回復 / 30秒で完全制覇');
    startButton.textContent = '回遊を始める';
    draw();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseDeepSeaGame, { once: true });
  else initialiseDeepSeaGame();
})();
