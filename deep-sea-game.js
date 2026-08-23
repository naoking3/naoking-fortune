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
  const highScoreOutput = document.getElementById('game-high-score');
  const rankOutput = document.getElementById('game-rank');
  const leftControl = document.getElementById('left-control');
  const rightControl = document.getElementById('right-control');

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
  canvas.setAttribute('aria-label', 'なおキングを左右に動かして魚を集める回遊ゲーム');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return;

  const WORLD = { width: 960, height: 540 };
  const GAME_DURATION = 30;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const keyState = { left: false, right: false };
  const pointerState = { left: false, right: false };
  const entities = [];
  const particles = [];
  const bubbles = Array.from({ length: reducedMotion ? 10 : 28 }, (_, index) => ({
    x: (index * 137.31) % WORLD.width,
    y: (index * 79.73) % WORLD.height,
    radius: 1.5 + (index % 5) * 0.65,
    speed: 7 + (index % 6) * 2.5,
    drift: (index % 2 ? 1 : -1) * (2 + index % 4)
  }));

  const player = {
    x: WORLD.width / 2,
    y: WORLD.height - 92,
    width: 112,
    height: 62,
    velocityX: 0,
    direction: 1,
    lives: 3,
    invulnerableFor: 0
  };

  const game = {
    mode: 'idle',
    score: 0,
    combo: 0,
    comboWindow: 0,
    multiplier: 1,
    elapsed: 0,
    spawnTimer: 0,
    crownTimer: 8,
    feverFor: 0,
    flashFor: 0,
    shakeFor: 0,
    lastFrame: 0,
    animationFrame: 0,
    announcementTimer: 0,
    highScore: readHighScore()
  };

  function readHighScore() {
    try {
      return Number(localStorage.getItem('naoking-deep-sea-high-score')) || 0;
    } catch {
      return 0;
    }
  }

  function writeHighScore(value) {
    try {
      localStorage.setItem('naoking-deep-sea-high-score', String(value));
    } catch {
      // Storage can be unavailable in strict/private browsing. The game still works.
    }
  }

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function announce(message) {
    setText(stateOutput, message);
  }

  function updateHud() {
    setText(timeOutput, `${Math.max(0, Math.ceil(GAME_DURATION - game.elapsed))}`);
    setText(scoreOutput, game.score.toLocaleString('ja-JP'));
    setText(comboOutput, game.combo > 1 ? `${game.combo} COMBO ×${game.multiplier}` : '—');
    setText(highScoreOutput, game.highScore.toLocaleString('ja-JP'));
    gameRoot.classList.toggle('is-fever', game.feverFor > 0);
  }

  function resetGame() {
    entities.length = 0;
    particles.length = 0;
    Object.assign(game, {
      mode: 'playing',
      score: 0,
      combo: 0,
      comboWindow: 0,
      multiplier: 1,
      elapsed: 0,
      spawnTimer: 0.25,
      crownTimer: 6 + Math.random() * 4,
      feverFor: 0,
      flashFor: 0,
      shakeFor: 0,
      announcementTimer: 0,
      lastFrame: performance.now()
    });
    Object.assign(player, {
      x: WORLD.width / 2,
      velocityX: 0,
      direction: 1,
      lives: 3,
      invulnerableFor: 0
    });
    keyState.left = keyState.right = false;
    pointerState.left = pointerState.right = false;
    startButton.textContent = '回遊中';
    startButton.disabled = true;
    startButton.setAttribute('aria-disabled', 'true');
    setText(rankOutput, '航海中');
    announce('回遊開始。魚を集め、岩と網を避けろ。王冠を取るとフィーバー。');
    updateHud();
  }

  function startGame() {
    cancelAnimationFrame(game.animationFrame);
    if (curtain) curtain.hidden = true;
    resetGame();
    canvas.focus({ preventScroll: true });
    game.animationFrame = requestAnimationFrame(frame);
  }

  function rankFor(score) {
    if (score >= 1200) return ['深海の絶対王者', '海が先に道を空けた。なおキング、文句なしの戴冠。'];
    if (score >= 800) return ['王冠回遊', 'かなりやる。今日だけは王国の一等航海士を名乗れ。'];
    if (score >= 480) return ['背びれ絶好調', '悪くない。魚たちも少しだけお前を恐れている。'];
    if (score >= 220) return ['沿岸の実力者', '浅瀬なら威張ってよし。深海ではまだ静かにしておけ。'];
    return ['迷子の小魚', '生還はした。そこだけは褒めてやる。'];
  }

  function finishGame(reason = '') {
    if (game.mode !== 'playing') return;
    game.mode = 'finished';
    keyState.left = keyState.right = false;
    pointerState.left = pointerState.right = false;
    player.velocityX = 0;
    const [rank, comment] = rankFor(game.score);
    if (game.score > game.highScore) {
      game.highScore = game.score;
      writeHighScore(game.highScore);
    }
    setText(rankOutput, rank);
    startButton.disabled = false;
    startButton.removeAttribute('aria-disabled');
    startButton.textContent = 'もう一度、回遊する';
    announce(`${reason}${rank}。${game.score}点。${comment}`);
    updateHud();
    draw();
  }

  function spawnEntity() {
    const difficulty = Math.min(1, game.elapsed / GAME_DURATION);
    const roll = Math.random();
    let type;
    if (roll < 0.5) type = 'sardine';
    else if (roll < 0.66) type = 'tuna';
    else if (roll < 0.73) type = 'pearl';
    else if (roll < 0.84) type = 'rock';
    else if (roll < 0.94) type = 'net';
    else type = 'mine';
    const specs = {
      sardine: [22, 14, 12, 0],
      tuna: [34, 19, 28, 0],
      pearl: [18, 18, 42, 0],
      rock: [31, 29, 0, 1],
      net: [38, 34, 0, 1],
      mine: [26, 26, 0, 1]
    }[type];
    entities.push({
      type,
      x: 52 + Math.random() * (WORLD.width - 104),
      y: -50,
      width: specs[0],
      height: specs[1],
      points: specs[2],
      hazard: Boolean(specs[3]),
      speed: 128 + Math.random() * 65 + difficulty * 82,
      sway: (Math.random() - 0.5) * 42,
      phase: Math.random() * Math.PI * 2,
      rotation: 0
    });
  }

  function spawnCrown() {
    entities.push({
      type: 'crown',
      x: 70 + Math.random() * (WORLD.width - 140),
      y: -60,
      width: 38,
      height: 31,
      points: 100,
      hazard: false,
      speed: 112,
      sway: 28,
      phase: Math.random() * Math.PI * 2,
      rotation: 0
    });
  }

  function intersects(entity) {
    const playerHitWidth = player.width * 0.72;
    const playerHitHeight = player.height * 0.66;
    return Math.abs(entity.x - player.x) < (entity.width + playerHitWidth) / 2
      && Math.abs(entity.y - player.y) < (entity.height + playerHitHeight) / 2;
  }

  function addParticles(x, y, color, count = 10, crown = false) {
    if (reducedMotion) return;
    for (let index = 0; index < count && particles.length < 100; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 45 + Math.random() * 150;
      particles.push({
        x,
        y,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - (crown ? 70 : 0),
        life: 0.45 + Math.random() * 0.55,
        maxLife: 1,
        size: 2 + Math.random() * (crown ? 7 : 4),
        color,
        crown
      });
    }
  }

  function collect(entity) {
    if (entity.type === 'crown') {
      game.feverFor = 6;
      game.score += 100;
      game.combo += 3;
      game.flashFor = 0.45;
      addParticles(entity.x, entity.y, '#ffd66b', 30, true);
      announce('王冠獲得。6秒間ロイヤルフィーバー。得点2倍、障害物無効。');
      return;
    }
    game.combo = game.comboWindow > 0 ? game.combo + 1 : 1;
    game.comboWindow = 2.2;
    game.multiplier = Math.min(4, 1 + Math.floor(game.combo / 5));
    const feverMultiplier = game.feverFor > 0 ? 2 : 1;
    game.score += entity.points * game.multiplier * feverMultiplier;
    addParticles(entity.x, entity.y, entity.type === 'pearl' ? '#dffcff' : '#ffd66b', entity.type === 'pearl' ? 18 : 9);
  }

  function hitHazard(entity) {
    if (game.feverFor > 0) {
      game.score += 20;
      addParticles(entity.x, entity.y, '#ffdb62', 14);
      return;
    }
    if (player.invulnerableFor > 0) return;
    player.lives -= 1;
    player.invulnerableFor = 1.15;
    game.combo = 0;
    game.comboWindow = 0;
    game.multiplier = 1;
    game.shakeFor = reducedMotion ? 0 : 0.3;
    game.flashFor = 0.18;
    addParticles(entity.x, entity.y, '#ff6d71', 20);
    announce(`危険物に接触。残りヒレ ${player.lives}。`);
    if (player.lives <= 0) finishGame('航路離脱。ヒレを全部なくした。');
  }

  function update(delta) {
    if (game.mode !== 'playing') return;
    game.elapsed += delta;
    game.spawnTimer -= delta;
    game.crownTimer -= delta;
    game.comboWindow = Math.max(0, game.comboWindow - delta);
    game.feverFor = Math.max(0, game.feverFor - delta);
    game.flashFor = Math.max(0, game.flashFor - delta);
    game.shakeFor = Math.max(0, game.shakeFor - delta);
    player.invulnerableFor = Math.max(0, player.invulnerableFor - delta);

    if (game.comboWindow <= 0 && game.combo > 0) {
      game.combo = 0;
      game.multiplier = 1;
    }

    const movingLeft = keyState.left || pointerState.left;
    const movingRight = keyState.right || pointerState.right;
    const input = Number(movingRight) - Number(movingLeft);
    const acceleration = 1350;
    const maxSpeed = game.feverFor > 0 ? 540 : 440;
    player.velocityX += input * acceleration * delta;
    player.velocityX *= Math.pow(input ? 0.18 : 0.012, delta);
    player.velocityX = Math.max(-maxSpeed, Math.min(maxSpeed, player.velocityX));
    player.x += player.velocityX * delta;
    player.x = Math.max(player.width / 2 + 12, Math.min(WORLD.width - player.width / 2 - 12, player.x));
    if (Math.abs(player.velocityX) > 10) player.direction = Math.sign(player.velocityX);

    if (game.spawnTimer <= 0) {
      spawnEntity();
      const intensity = Math.min(1, game.elapsed / GAME_DURATION);
      game.spawnTimer = 0.42 + Math.random() * 0.35 - intensity * 0.11;
    }
    if (game.crownTimer <= 0) {
      spawnCrown();
      game.crownTimer = 11 + Math.random() * 7;
    }

    for (const bubble of bubbles) {
      bubble.y -= bubble.speed * delta;
      bubble.x += Math.sin(game.elapsed + bubble.y * 0.01) * bubble.drift * delta;
      if (bubble.y < -10) {
        bubble.y = WORLD.height + 10;
        bubble.x = Math.random() * WORLD.width;
      }
    }

    for (let index = entities.length - 1; index >= 0; index -= 1) {
      const entity = entities[index];
      entity.y += entity.speed * delta;
      entity.x += Math.sin(game.elapsed * 2.1 + entity.phase) * entity.sway * delta;
      entity.rotation += delta * (entity.hazard ? 0.9 : 0.25);
      if (intersects(entity)) {
        entities.splice(index, 1);
        if (entity.hazard) hitHazard(entity); else collect(entity);
      } else if (entity.y > WORLD.height + 70) {
        entities.splice(index, 1);
      }
    }

    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.life -= delta;
      particle.x += particle.velocityX * delta;
      particle.y += particle.velocityY * delta;
      particle.velocityY += 120 * delta;
      if (particle.life <= 0) particles.splice(index, 1);
    }

    game.announcementTimer -= delta;
    if (game.announcementTimer <= 0) {
      game.announcementTimer = 5;
      announce(`回遊中。残り${Math.max(0, Math.ceil(GAME_DURATION - game.elapsed))}秒、${game.score}点、ヒレ${player.lives}。`);
    }
    if (game.elapsed >= GAME_DURATION) finishGame('回遊完了。時間いっぱい生き残った。');
    updateHud();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, r);
  }

  function drawBackground() {
    const gradient = context.createLinearGradient(0, 0, 0, WORLD.height);
    gradient.addColorStop(0, game.feverFor > 0 ? '#075d75' : '#063e55');
    gradient.addColorStop(0.55, game.feverFor > 0 ? '#063747' : '#062d40');
    gradient.addColorStop(1, '#031621');
    context.fillStyle = gradient;
    context.fillRect(0, 0, WORLD.width, WORLD.height);

    context.save();
    context.globalAlpha = 0.1;
    context.strokeStyle = '#9eeeff';
    context.lineWidth = 16;
    for (let index = -2; index < 8; index += 1) {
      const offset = (game.elapsed * 12 + index * 160) % 1300;
      context.beginPath();
      context.moveTo(offset - 260, 0);
      context.quadraticCurveTo(offset, 190, offset - 90, 410);
      context.stroke();
    }
    context.restore();

    context.fillStyle = '#06202d';
    context.beginPath();
    context.moveTo(0, WORLD.height);
    context.lineTo(0, WORLD.height - 48);
    for (let x = 0; x <= WORLD.width; x += 48) {
      context.lineTo(x, WORLD.height - 38 - Math.sin(x * 0.035) * 14);
    }
    context.lineTo(WORLD.width, WORLD.height);
    context.fill();

    context.save();
    context.strokeStyle = '#a5efff';
    context.globalAlpha = 0.3;
    context.lineWidth = 1.6;
    for (const bubble of bubbles) {
      context.beginPath();
      context.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
  }

  function drawFish(entity) {
    context.save();
    context.translate(entity.x, entity.y);
    const color = entity.type === 'tuna' ? '#ff8f71' : '#ffd660';
    context.fillStyle = entity.type === 'pearl' ? '#dffaff' : color;
    if (entity.type === 'pearl') {
      context.shadowColor = '#bdefff';
      context.shadowBlur = 16;
      context.beginPath();
      context.arc(0, 0, 12, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#86c6d7';
      context.stroke();
    } else {
      context.beginPath();
      context.ellipse(0, 0, entity.width / 2, entity.height / 2, 0, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.moveTo(entity.width / 2 - 3, 0);
      context.lineTo(entity.width / 2 + 14, -entity.height / 2);
      context.lineTo(entity.width / 2 + 14, entity.height / 2);
      context.closePath();
      context.fill();
      context.fillStyle = '#0c3141';
      context.beginPath();
      context.arc(-entity.width * 0.22, -2, 2.3, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  function drawHazard(entity) {
    context.save();
    context.translate(entity.x, entity.y);
    context.rotate(entity.rotation);
    if (entity.type === 'rock') {
      context.fillStyle = '#58717a';
      context.beginPath();
      context.moveTo(-25, 20);
      context.lineTo(-17, -16);
      context.lineTo(2, -25);
      context.lineTo(25, 8);
      context.lineTo(20, 23);
      context.closePath();
      context.fill();
      context.strokeStyle = '#78909a';
      context.stroke();
    } else if (entity.type === 'net') {
      context.strokeStyle = '#c5e2e5';
      context.lineWidth = 3;
      context.strokeRect(-27, -25, 54, 50);
      context.lineWidth = 1.5;
      for (let offset = -18; offset <= 18; offset += 12) {
        context.beginPath();
        context.moveTo(offset, -25);
        context.lineTo(offset, 25);
        context.moveTo(-27, offset);
        context.lineTo(27, offset);
        context.stroke();
      }
    } else {
      context.fillStyle = '#182c34';
      context.strokeStyle = '#ff6d71';
      context.lineWidth = 3;
      context.beginPath();
      context.arc(0, 0, 19, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      for (let index = 0; index < 8; index += 1) {
        context.rotate(Math.PI / 4);
        context.fillRect(17, -2, 10, 4);
      }
    }
    context.restore();
  }

  function drawCrown(entity) {
    context.save();
    context.translate(entity.x, entity.y + Math.sin(game.elapsed * 4 + entity.phase) * 4);
    context.shadowColor = '#ffd762';
    context.shadowBlur = 22;
    context.fillStyle = '#ffd762';
    context.beginPath();
    context.moveTo(-22, 13);
    context.lineTo(-24, -13);
    context.lineTo(-8, -1);
    context.lineTo(0, -20);
    context.lineTo(9, -1);
    context.lineTo(24, -13);
    context.lineTo(21, 13);
    context.closePath();
    context.fill();
    context.restore();
  }

  function drawPlayer() {
    context.save();
    const flicker = player.invulnerableFor > 0 && Math.floor(player.invulnerableFor * 14) % 2 === 0;
    if (flicker) context.globalAlpha = 0.38;
    context.translate(player.x, player.y);
    context.scale(player.direction || 1, 1);
    if (game.feverFor > 0) {
      context.shadowColor = '#ffda69';
      context.shadowBlur = 26;
    }
    context.fillStyle = '#8fc8d8';
    context.beginPath();
    context.ellipse(0, 0, 48, 29, 0, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(-44, -4);
    context.lineTo(-70, -28);
    context.lineTo(-68, 27);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(1, -24);
    context.lineTo(-13, -46);
    context.lineTo(24, -24);
    context.closePath();
    context.fill();
    context.fillStyle = '#eaf8fb';
    context.beginPath();
    context.ellipse(20, 9, 29, 17, -0.13, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#092d3d';
    context.beginPath();
    context.arc(26, -6, 6.5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(28, -9, 2.3, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#214d5d';
    context.lineWidth = 2;
    for (let offset = -1; offset <= 1; offset += 1) {
      context.beginPath();
      context.moveTo(34 + offset * 5, 6);
      context.lineTo(38 + offset * 5, 13);
      context.stroke();
    }
    if (game.feverFor > 0) {
      context.fillStyle = '#ffd762';
      context.beginPath();
      context.moveTo(-10, -31);
      context.lineTo(-16, -50);
      context.lineTo(-3, -40);
      context.lineTo(6, -57);
      context.lineTo(15, -40);
      context.lineTo(28, -50);
      context.lineTo(21, -29);
      context.closePath();
      context.fill();
    }
    context.restore();
  }

  function drawOverlay() {
    context.save();
    context.fillStyle = '#02121bbb';
    roundRect(context, 18, 18, 184, 55, 15);
    context.fill();
    context.font = '700 19px system-ui, sans-serif';
    context.fillStyle = '#d8f8ff';
    context.fillText(`ヒレ ${'◆'.repeat(player.lives)}${'◇'.repeat(3 - player.lives)}`, 34, 52);

    if (game.feverFor > 0) {
      const width = 300;
      const progress = game.feverFor / 6;
      context.fillStyle = '#071a22cc';
      roundRect(context, WORLD.width / 2 - width / 2, 20, width, 42, 14);
      context.fill();
      context.fillStyle = '#ffd762';
      roundRect(context, WORLD.width / 2 - width / 2 + 5, 25, (width - 10) * progress, 32, 10);
      context.fill();
      context.fillStyle = '#082333';
      context.textAlign = 'center';
      context.font = '900 17px system-ui, sans-serif';
      context.fillText('ROYAL FEVER ×2', WORLD.width / 2, 48);
      context.textAlign = 'start';
    }

    if (game.mode === 'idle') {
      context.fillStyle = '#031722d9';
      context.fillRect(0, 0, WORLD.width, WORLD.height);
      context.textAlign = 'center';
      context.fillStyle = '#dffaff';
      context.font = '900 42px system-ui, sans-serif';
      context.fillText('深海回遊、出航待ち。', WORLD.width / 2, WORLD.height / 2 - 18);
      context.fillStyle = '#9fcad5';
      context.font = '600 20px system-ui, sans-serif';
      context.fillText('魚を集めろ。王冠を取れ。網には捕まるな。', WORLD.width / 2, WORLD.height / 2 + 27);
    } else if (game.mode === 'finished') {
      context.fillStyle = '#031722ad';
      context.fillRect(0, 0, WORLD.width, WORLD.height);
      const [rank] = rankFor(game.score);
      context.textAlign = 'center';
      context.fillStyle = '#ffd762';
      context.font = '900 24px system-ui, sans-serif';
      context.fillText('FINAL JUDGMENT', WORLD.width / 2, WORLD.height / 2 - 58);
      context.fillStyle = '#e8fbff';
      context.font = '900 48px system-ui, sans-serif';
      context.fillText(rank, WORLD.width / 2, WORLD.height / 2);
      context.fillStyle = '#a9d4de';
      context.font = '700 22px system-ui, sans-serif';
      context.fillText(`${game.score.toLocaleString('ja-JP')} POINTS`, WORLD.width / 2, WORLD.height / 2 + 44);
      context.textAlign = 'start';
    }
    context.restore();
  }

  function draw() {
    context.save();
    if (game.shakeFor > 0) {
      context.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8);
    }
    drawBackground();
    for (const entity of entities) {
      if (entity.hazard) drawHazard(entity);
      else if (entity.type === 'crown') drawCrown(entity);
      else drawFish(entity);
    }
    for (const particle of particles) {
      context.save();
      context.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      context.fillStyle = particle.color;
      if (particle.crown) {
        context.translate(particle.x, particle.y);
        context.rotate(particle.life * 6);
        context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      } else {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    }
    drawPlayer();
    drawOverlay();
    if (game.flashFor > 0) {
      context.fillStyle = `rgba(255, ${game.feverFor > 0 ? 222 : 99}, 105, ${Math.min(0.42, game.flashFor)})`;
      context.fillRect(0, 0, WORLD.width, WORLD.height);
    }
    context.restore();
  }

  function frame(now) {
    const delta = Math.min(0.035, Math.max(0, (now - game.lastFrame) / 1000));
    game.lastFrame = now;
    update(delta);
    draw();
    if (game.mode === 'playing') game.animationFrame = requestAnimationFrame(frame);
  }

  function setDirection(direction, pressed) {
    pointerState[direction] = pressed;
  }

  function bindControl(button, direction) {
    if (!button) return;
    button.setAttribute('aria-label', direction === 'left' ? 'なおキングを左へ泳がせる' : 'なおキングを右へ泳がせる');
    button.style.touchAction = 'none';
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      setDirection(direction, true);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave'].forEach((type) => {
      button.addEventListener(type, () => setDirection(direction, false));
    });
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  startButton.addEventListener('click', startGame);
  bindControl(leftControl, 'left');
  bindControl(rightControl, 'right');

  window.addEventListener('keydown', (event) => {
    if (game.mode !== 'playing') return;
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
      keyState.left = true;
      event.preventDefault();
    }
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
      keyState.right = true;
      event.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') keyState.left = false;
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') keyState.right = false;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.mode === 'playing') {
      game.lastFrame = performance.now();
      keyState.left = keyState.right = false;
      pointerState.left = pointerState.right = false;
    }
  });

  window.addEventListener('naoking:pagechange', (event) => {
    if (event.detail?.page !== 'game' && game.mode === 'playing') {
      finishGame('航路変更につき帰港。');
    }
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => draw()).observe(host);
  }

  game.mode = 'idle';
  updateHud();
  setText(rankOutput, '未判定');
  announce('回遊準備完了。開始ボタンを押してください。');
  draw();

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseDeepSeaGame, { once: true });
  } else {
    initialiseDeepSeaGame();
  }
})();
