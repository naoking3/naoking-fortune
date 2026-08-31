/**
 * ROYAL ORACLE cinematic scene layer.
 *
 * This module only observes the sealed roulette presentation events. It never
 * chooses, mutates or replaces a result. Integration: load roulette-cinematics.css
 * and load this observer before roulette-controller.js so URL previews are also captured.
 */
(() => {
  'use strict';

  const VERSION = '1.0.0';
  const ROOT_ID = 'royal-oracle-cinematic-root';
  const ASSET_ROOT = 'assets/oracle-cinematics/';
  const html = document.documentElement;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)') || { matches:false };
  const supportedRoutes = Object.freeze([
    'crown-goal-challenge', 'naoking-race', 'machine-power-cycle', 'power-failure',
    'abyssal-blackout-revival', 'abyss-dawn-jackpot', 'golden-ocean-jackpot',
    'fish-celebration-jackpot', 'naoking-overload-jackpot', 'small-fish-school',
    'royal-fish-school', 'golden-fish-school', 'abyss-fish-school', 'naoking-school-overload'
  ]);
  const supportedRouteSet = new Set(supportedRoutes);
  const sceneClasses = Object.freeze([
    'royal-oracle-cinematic-active', 'royal-oracle-cinematic-soccer',
    'royal-oracle-cinematic-race', 'royal-oracle-cinematic-blackout',
    'royal-oracle-cinematic-jackpot', 'royal-oracle-cinematic-fish-school',
    'royal-oracle-power-off'
  ]);

  let root = null;
  let generation = 0;
  let active = null;
  let destroyed = false;
  const timers = new Set();
  const frames = new Set();
  const controller = new AbortController();

  const asset = file => `${ASSET_ROOT}${file}`;
  const image = (file, className, alt = '') => `<img class="${className}" src="${asset(file)}" alt="${alt}" draggable="false">`;
  const fishMarkup = count => Array.from({ length:count }, (_, index) => {
    const row = index % 7;
    const depth = index % 4;
    return `<span class="ro-school-fish" style="--fish-i:${index};--fish-row:${row};--fish-depth:${depth};--fish-delay:${(index % 9) * -0.19}s">${image('fish.svg', 'ro-school-fish-image')}</span>`;
  }).join('');

  function emit(name, detail) {
    if (typeof window.CustomEvent !== 'function') return;
    window.dispatchEvent(new CustomEvent(name, { detail:Object.freeze({ ...detail }) }));
  }

  function later(callback, delay, token = generation) {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (!destroyed && token === generation) callback();
    }, Math.max(0, Number(delay) || 0));
    timers.add(id);
    return id;
  }

  function nextFrame(callback, token = generation) {
    const id = window.requestAnimationFrame(() => {
      frames.delete(id);
      if (!destroyed && token === generation) callback();
    });
    frames.add(id);
    return id;
  }

  function clearAsync() {
    timers.forEach(id => window.clearTimeout(id));
    frames.forEach(id => window.cancelAnimationFrame(id));
    timers.clear();
    frames.clear();
  }

  function routeType(detail = {}) {
    const route = String(detail.route || '');
    const family = String(detail.family || '');
    if (route === 'crown-goal-challenge') return 'soccer';
    if (route === 'naoking-race') return 'race';
    if (['machine-power-cycle', 'power-failure', 'abyssal-blackout-revival'].includes(route)) return 'blackout';
    if (route.includes('jackpot') || family === 'premium') return 'jackpot';
    if (route.includes('fish-school') || family === 'fish-school') return 'fish-school';
    return '';
  }

  function stage(name, caption = '') {
    if (!root || !active) return;
    const prefix = `ro-stage-`;
    [...root.classList].filter(value => value.startsWith(prefix)).forEach(value => root.classList.remove(value));
    root.classList.add(`${prefix}${name}`);
    html.classList.toggle('royal-oracle-power-off', /^blackout-(off|emergency|signal)$/.test(name));
    root.dataset.stage = name;
    const label = root.querySelector('.ro-cinematic-caption strong');
    if (label && caption) label.textContent = caption;
    active.stage = name;
    emit('royaloracle:cinematicphase', { route:active.route, type:active.type, stage:name });
  }

  function shell(type, route, content) {
    const node = document.createElement('div');
    node.id = ROOT_ID;
    node.className = `ro-cinematic ro-scene-${type}${reducedMotion.matches ? ' is-reduced-motion' : ''}`;
    node.dataset.route = route;
    node.dataset.stage = 'mounting';
    node.setAttribute('aria-hidden', 'true');
    node.innerHTML = `<div class="ro-cinematic-water" aria-hidden="true"></div><div class="ro-cinematic-vignette" aria-hidden="true"></div>${content}`;
    return node;
  }

  function soccerScene(route) {
    return shell('soccer', route, `
      <div class="ro-soccer-field" aria-hidden="true">
        <div class="ro-field-light"></div><div class="ro-field-lines"></div>
        ${image('goal.svg', 'ro-soccer-goal')}
        <div class="ro-soccer-keeper">${image('naoking-keeper.svg', 'ro-keeper-image')}</div>
        <div class="ro-soccer-player">
          <span class="ro-sheet-frame ro-soccer-sheet ro-soccer-frame-ready"></span>
          <span class="ro-sheet-frame ro-soccer-sheet ro-soccer-frame-run"></span>
          <span class="ro-sheet-frame ro-soccer-sheet ro-soccer-frame-kick"></span>
          <span class="ro-sheet-frame ro-soccer-sheet ro-soccer-frame-shock"></span>
          ${image('naoking-kick-ready.svg', 'ro-player-pose ro-pose-ready')}
          <span class="ro-run-cycle">${image('naoking-run-1.svg', 'ro-run-frame ro-run-one')}${image('naoking-run-2.svg', 'ro-run-frame ro-run-two')}${image('naoking-run-3.svg', 'ro-run-frame ro-run-three')}</span>
          ${image('naoking-kick.svg', 'ro-player-pose ro-pose-kick')}
          ${image('naoking-celebrate.svg', 'ro-player-pose ro-pose-win')}
          ${image('naoking-defeat.svg', 'ro-player-pose ro-pose-lose')}
        </div>
        ${image('crown-ball.svg', 'ro-crown-ball')}
        <div class="ro-ball-trail"></div><div class="ro-goal-flash"></div>
        <div class="ro-bubble-crowd">${fishMarkup(12)}</div>
      </div>
      <div class="ro-scoreboard"><small>CROWN GOAL</small><span>00 : 00</span></div>
      <div class="ro-cinematic-caption"><small>王冠ゴール挑戦</small><strong>王、いちおう構えた</strong></div>
    `);
  }

  function raceScene(route) {
    const racers = Array.from({ length:5 }, (_, index) => `
      <span class="ro-racer ro-racer-${index + 1}${index === 2 ? ' is-hero' : ''}" style="--lane:${index};--racer:${index}">
        <i>${index + 1}</i><span class="ro-racer-sprite"><span class="ro-sheet-frame ro-race-sheet ro-race-frame-${index + 1}"></span>${image('naoking-run-1.svg', 'ro-run-frame ro-run-one')}${image('naoking-run-2.svg', 'ro-run-frame ro-run-two')}${image('naoking-run-3.svg', 'ro-run-frame ro-run-three')}</span>
      </span>`).join('');
    return shell('race', route, `
      <div class="ro-race-sky"><i></i><i></i><i></i></div>
      <div class="ro-race-track" aria-hidden="true"><div class="ro-track-lines"></div>${racers}${image('race-gate.svg', 'ro-race-gate')}<div class="ro-finish-line"></div><div class="ro-race-dust"></div></div>
      <div class="ro-race-board"><small>NAOKING RACE</small><span>出走 5サメ</span></div>
      <div class="ro-cinematic-caption"><small>なおキング大競走</small><strong>全員、同じ王です</strong></div>
    `);
  }

  function blackoutScene(route) {
    return shell('blackout', route, `
      <div class="ro-blackout-glitch" aria-hidden="true"></div>
      <div class="ro-blackout-darkness" aria-hidden="true"></div>
      <div class="ro-emergency">${image('emergency-lamp.svg', 'ro-emergency-lamp')}<small>非常用</small></div>
      <div class="ro-distant-signal"><i></i><i></i><i></i><span>・　・　・</span></div>
      <div class="ro-restart-core"><i></i><b>♛</b><strong>再起動</strong></div>
      <div class="ro-blackout-eyes"><i></i><i></i></div>
      <div class="ro-cinematic-caption"><small>電源トラブル</small><strong>あ、消えた</strong></div>
    `);
  }

  function jackpotScene(route) {
    return shell('jackpot', route, `
      <div class="ro-jackpot-rays" aria-hidden="true"></div><div class="ro-jackpot-tide" aria-hidden="true"></div>
      <div class="ro-jackpot-crown"><i>♛</i><span></span></div>
      <div class="ro-jackpot-school">${fishMarkup(22)}</div>
      ${image('naoking-celebrate.svg', 'ro-jackpot-naoking')}
      <div class="ro-cinematic-caption"><small>王国ぜんぶが反応中</small><strong>これは、かなり来てる</strong></div>
    `);
  }

  function fishSchoolScene(route) {
    return shell('fish-school', route, `
      <div class="ro-school-depth" aria-hidden="true"></div><div class="ro-fish-school">${fishMarkup(30)}</div>
      <div class="ro-school-shadow"></div>
      <div class="ro-cinematic-caption"><small>魚群接近</small><strong>ちょっと多すぎる</strong></div>
    `);
  }

  function build(type, route) {
    if (type === 'soccer') return soccerScene(route);
    if (type === 'race') return raceScene(route);
    if (type === 'blackout') return blackoutScene(route);
    if (type === 'jackpot') return jackpotScene(route);
    return fishSchoolScene(route);
  }

  function setRootClass(className, enabled = true) {
    if (!root) return;
    root.classList.toggle(className, enabled);
  }

  function startTimeline(type, route, token) {
    const timeScale = reducedMotion.matches ? .42 : 1;
    const at = (ms, name, caption) => later(() => stage(name, caption), ms * timeScale, token);
    if (type === 'soccer') {
      at(120, 'soccer-prepare', '王、いちおう構えた');
      at(1150, 'soccer-run', '助走は本気');
      at(3550, 'soccer-kick', '蹴った！');
      at(4300, 'soccer-flight', '王冠ボール、飛行中');
      at(5900, 'soccer-keeper', '守護魚が飛んだ');
      at(7600, 'soccer-suspense', '入る？　止める？');
    } else if (type === 'race') {
      at(180, 'race-gate', '全員、同じ王です');
      at(1250, 'race-start', 'スタート！');
      at(3400, 'race-leg-one', '3号、いきなり先頭');
      at(5900, 'race-leg-two', '順位、ぐちゃぐちゃ');
      at(8400, 'race-chaos', '1号転倒、2号は逆走');
      at(11200, 'race-final', '最後の直線！');
      at(14100, 'race-photo', '写真で見るしかない');
    } else if (type === 'blackout') {
      at(250, 'blackout-warning', 'なんか変だぞ');
      if (route !== 'abyssal-blackout-revival') {
        at(route === 'power-failure' ? 800 : 1400, 'blackout-off', '……消えた');
        at(route === 'power-failure' ? 2100 : 3500, 'blackout-emergency', '非常灯だけ生きてる');
        at(route === 'power-failure' ? 3100 : 7600, 'blackout-signal', '遠くで何か光った');
      }
    } else if (type === 'jackpot') {
      at(180, 'jackpot-gather', '海の光が集まってる');
      at(2600, 'jackpot-school', '魚まで集まってきた');
      at(5600, 'jackpot-ready', 'これは、かなり来てる');
    } else {
      at(120, 'school-distance', '遠くに何かいる');
      at(1250, 'school-cross', '魚群、横断中');
      at(3500, 'school-camera', '近い近い近い');
      at(5900, 'school-orbit', '占い機を囲まれた');
    }
  }

  function start(detail = {}, options = {}) {
    const route = String(detail.route || options.route || '');
    const type = options.type || routeType(detail);
    if (!type || !route) return null;
    cleanup('superseded');
    generation += 1;
    const token = generation;
    active = { route, type, family:String(detail.family || ''), tier:String(detail.tier || ''), stage:'mounting', resultKind:'', preview:Boolean(options.preview), startedAt:performance.now() };
    root = build(type, route);
    document.body.appendChild(root);
    html.classList.add('royal-oracle-cinematic-active', `royal-oracle-cinematic-${type}`);
    nextFrame(() => { root?.classList.add('is-visible'); startTimeline(type, route, token); }, token);
    emit('royaloracle:cinematicstart', { route, type, preview:active.preview });
    return Object.freeze({ route, type, stop:() => cleanup('api-stop') });
  }

  function resolve(resultKind = 'normal', effect = '') {
    if (!root || !active) return false;
    // The sealed result is authoritative. Cancel every pending scene beat before
    // resolving so an old prepare/flight timer can never overwrite the ending.
    generation += 1;
    clearAsync();
    const kind = ['win', 'loss', 'normal'].includes(resultKind) ? resultKind : 'normal';
    active.resultKind = kind;
    root.dataset.resultKind = kind;
    root.dataset.effect = String(effect || '');
    root.classList.add(`ro-outcome-${kind}`);
    if (active.type === 'soccer') {
      stage(kind === 'win' ? 'soccer-goal' : kind === 'loss' ? 'soccer-save' : 'soccer-post', kind === 'win' ? 'ゴール！ 王もびっくり' : kind === 'loss' ? '止められた。王、しょんぼり' : '柱！ 今日はここまで');
    } else if (active.type === 'race') {
      stage(kind === 'win' ? 'race-win' : kind === 'loss' ? 'race-lose' : 'race-draw', kind === 'win' ? '3号が優勝！ 本人は3号を知らない' : kind === 'loss' ? '王、写真にも入ってない' : 'ほぼ同時。たぶん');
    } else if (active.type === 'blackout') {
      if (kind === 'win' || effect === 'revival') stage('blackout-restart', '王国ぜんぶ、再起動！');
      else stage('blackout-end', kind === 'loss' ? '直らなかった。王は帰った' : 'なんとか戻った。たぶん');
    } else if (active.type === 'jackpot') {
      stage(kind === 'win' ? 'jackpot-burst' : 'jackpot-fade', kind === 'win' ? '大当たり！ 王国ぜんぶがお祝い中' : '光は集まった。結果は普通');
    } else {
      stage(kind === 'win' ? 'school-gold' : 'school-exit', kind === 'win' ? '金の魚群！ これは大当たり' : '魚群、帰宅しました');
    }
    emit('royaloracle:cinematicresolve', { route:active.route, type:active.type, resultKind:kind, effect:String(effect || '') });
    const linger = reducedMotion.matches ? 1150 : active.type === 'blackout' && kind === 'win' ? 4300 : active.type === 'jackpot' && kind === 'win' ? 4100 : 3000;
    later(() => cleanup('resolved'), linger);
    return true;
  }

  function blackoutFakePhase() {
    if (!root || active?.type !== 'blackout') return;
    if (/^blackout-(off|emergency|signal|restart)$/.test(active.stage)) return;
    const token = generation;
    stage('blackout-off', '……消えた');
    const scale = reducedMotion.matches ? .45 : 1;
    later(() => stage('blackout-emergency', '非常灯だけ生きてる'), 1450 * scale, token);
    later(() => stage('blackout-signal', '遠くで何か光った'), 3550 * scale, token);
  }

  function cleanup(reason = 'cleanup') {
    generation += 1;
    clearAsync();
    if (root) {
      root.getAnimations?.({ subtree:true }).forEach(animation => animation.cancel());
      root.remove();
    }
    const previous = active;
    root = null;
    active = null;
    sceneClasses.forEach(className => html.classList.remove(className));
    if (previous) emit('royaloracle:cinematicend', { route:previous.route, type:previous.type, reason });
  }

  function onDraw(event) {
    const detail = event.detail || {};
    if (!supportedRouteSet.has(String(detail.route || '')) && !routeType(detail)) return;
    start(detail);
  }

  function onPhase(event) {
    const detail = event.detail || {};
    if (!active || (detail.route && detail.route !== active.route)) return;
    if (active.type === 'blackout' && detail.phase === 'fake') blackoutFakePhase();
    if (active.type === 'blackout' && detail.phase === 'revival') stage('blackout-restart', '王国ぜんぶ、再起動！');
    if (detail.phase === 'resting' && active.resultKind) later(() => cleanup('resting'), 450);
  }

  function onBeat(event) {
    const detail = event.detail || {};
    if (!active || (detail.route && detail.route !== active.route)) return;
    if (active.type === 'blackout' && detail.cue === 'abyssal-blackout') blackoutFakePhase();
  }

  function onResult(event) {
    const detail = event.detail || {};
    if (!active || (detail.route && detail.route !== active.route)) return;
    resolve(detail.resultKind, detail.effect);
  }

  function onPageChange(event) {
    if (event.detail?.page !== 'fortune') cleanup('page-change');
  }

  function onCinematic(event) {
    const detail = event.detail || {};
    const phase = String(detail.phase || detail.action || '');
    if (phase === 'cleanup') {
      cleanup('controller-cleanup');
      return;
    }
    const route = String(detail.route || '');
    if (!active && supportedRouteSet.has(route) && ['signal', 'twist', 'judgment', 'blackout'].includes(phase)) start(detail);
    if (!active || (route && route !== active.route)) return;
    if (active.type === 'blackout' && phase === 'blackout') blackoutFakePhase();
    if (active.type === 'blackout' && phase === 'distant-signal') stage('blackout-signal', '遠くで何か光った');
    if (active.type === 'blackout' && phase === 'revival') stage('blackout-restart', '王国ぜんぶ、再起動！');
  }

  function listen(name, handler) {
    window.addEventListener(name, handler, { signal:controller.signal });
  }

  listen('naoking:oracledraw', onDraw);
  listen('naoking:oraclephase', onPhase);
  listen('naoking:oraclebeat', onBeat);
  listen('naoking:oracleresult', onResult);
  listen('naoking:oraclecinematic', onCinematic);
  listen('naoking:pagechange', onPageChange);
  // Forward-compatible aliases for standalone or future controller integrations.
  listen('royaloracle:draw', onDraw);
  listen('royaloracle:phase', onPhase);
  listen('royaloracle:beat', onBeat);
  listen('royaloracle:result', onResult);

  window.RoyalOracleCinematics = Object.freeze({
    version:VERSION,
    supportedRoutes,
    assets:Object.freeze([
      'naoking-run-1.svg', 'naoking-run-2.svg', 'naoking-run-3.svg',
      'naoking-kick-ready.svg', 'naoking-kick.svg', 'naoking-celebrate.svg',
      'naoking-defeat.svg', 'naoking-keeper.svg', 'crown-ball.svg', 'goal.svg',
      'race-gate.svg', 'fish.svg', 'emergency-lamp.svg'
      , 'naoking-soccer-sprites.webp', 'naoking-race-sprites.webp'
    ].map(asset)),
    play:(route, options = {}) => start({ route, family:options.family || '', tier:options.tier || '' }, { ...options, route, preview:true }),
    resolve,
    stop:() => cleanup('api-stop'),
    getState:() => Object.freeze(active ? {
      active:true, route:active.route, type:active.type, stage:active.stage,
      resultKind:active.resultKind, timerCount:timers.size, frameCount:frames.size,
      nodeCount:root?.querySelectorAll('*').length || 0, reducedMotion:reducedMotion.matches
    } : { active:false, route:'', type:'', stage:'', resultKind:'', timerCount:timers.size, frameCount:frames.size, nodeCount:0, reducedMotion:reducedMotion.matches }),
    destroy:() => {
      cleanup('destroy');
      destroyed = true;
      controller.abort();
      delete window.RoyalOracleCinematics;
    }
  });
})();
