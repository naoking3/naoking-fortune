(() => {
  'use strict';

  const model = window.NaokingWorldData;
  if (!model) return;

  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactActor = window.matchMedia('(max-width: 820px)');
  const forcedColors = window.matchMedia('(forced-colors: active)');
  const dateKey = model.toLocalDateKey(new Date());
  const photoCount = window.NaokingPhotoCatalog?.length || model.PHOTO_COUNT;
  const daily = model.getDailyContext(dateKey, { photoCount });
  // `daily` is a kingdom-wide signal rendered inside home, not a navigable district.
  // Build the route map once, keeping the first real district for duplicated routes.
  const routeDistrict = new Map();
  const visibleDistricts = [];
  model.districts.forEach(district => {
    if (district.id === 'daily' || !district.routeId) return;
    if (routeDistrict.has(district.routeId)) return;
    routeDistrict.set(district.routeId, district.id);
    if (document.getElementById(district.routeId)) visibleDistricts.push(district);
  });
  const sessionCounts = Object.create(null);
  const timers = new Set();
  let encounterUsed = false;
  let actorUsed = false;
  let quietVisitTimer = 0;
  let actorScheduleTimer = 0;
  let surpriseScheduleTimer = 0;
  let actorEndTimer = 0;
  let surpriseEndTimer = 0;
  let gamePickupCount = 0;
  let currentDistrict = routeDistrict.get(body.dataset.page || 'home') || 'home';

  const discoveryCopy = Object.freeze({
    'archive-signal': '記録庫の微弱信号を照合した',
    'missing-record': '行方不明の記録係へ信号を送った',
    'bureau-seal': '効力不明の王印を押した',
    'gallery-favorite': '王国風景を記憶に留めた',
    'daily-visitor': '王国を横切る、なおキングを目撃した',
    'royal-crossing': '王の横断に遭遇した',
    'giant-shadow': '遠い巨大影を目撃した',
    'lost-crown': '流された王冠を見送った',
    'archive-whisper': '記録庫の小声を受信した',
    'portal-glimpse': '門の向こうに知らない部屋を見た'
  });
  const surpriseCopy = Object.freeze({
    'royal-crossing': ['王、通過中。', '目的地は本人も知りません。'],
    'giant-shadow': ['大きすぎる何か。', '王国は「だいたい安全」と発表。'],
    'shy-ray': ['エイ、逃走。', '目が合った気がしたため。'],
    'jelly-procession': ['クラゲの小行列。', '行き先は記録されていません。'],
    'lost-crown': ['王冠、漂流。', '王はまだ気づいていません。'],
    'archive-whisper': ['記録庫から小声。', '「編集は、まだです」'],
    'portal-glimpse': ['知らない部屋を確認。', '扉はすぐ正常に戻りました。'],
    'sleeping-king': ['王、勤務中に睡眠。', 'これは正式な休憩です。'],
    'tiny-inspection': ['王国検査、3秒で終了。', '何も見ていません。']
  });

  function discoveryLabel(id) {
    if (discoveryCopy[id]) return discoveryCopy[id];
    const surprise = model.indexes.surprises[id];
    if (surprise?.title) return `${surprise.title}を王国記録へ追加した`;
    return '名称未定の王国記録を発見した';
  }

  function setTimer(callback, delay) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
    return timer;
  }

  function cancelTimer(timer) {
    if (!timer) return 0;
    window.clearTimeout(timer);
    timers.delete(timer);
    return 0;
  }

  function clearTimers() {
    timers.forEach(timer => window.clearTimeout(timer));
    timers.clear();
    window.clearTimeout(quietVisitTimer);
    quietVisitTimer = 0;
    actorScheduleTimer = 0;
    surpriseScheduleTimer = 0;
    actorEndTimer = 0;
    surpriseEndTimer = 0;
  }

  function loadProgression() {
    let stored = null;
    try { stored = window.localStorage.getItem(model.STORAGE_KEY); } catch { /* localStorage is optional */ }
    let next = model.sanitizeProgression(stored);
    try {
      const legacy = window.localStorage.getItem('naokingRoyalPassportV1');
      if (legacy) next = model.mergeLegacyPassport(next, legacy);
    } catch { /* legacy passport remains independently usable */ }
    if (next.daily.dateKey !== dateKey) {
      next = model.sanitizeProgression({
        ...next,
        daily: { dateKey, completedErrandIds: [], chosenErrandId: null, acknowledged: false }
      });
    }
    return next;
  }

  let progression = loadProgression();

  function saveProgression() {
    try { window.localStorage.setItem(model.STORAGE_KEY, JSON.stringify(progression)); } catch { /* private mode */ }
  }

  function updateProgression(next, { render = true } = {}) {
    progression = model.sanitizeProgression(next);
    saveProgression();
    if (render) {
      renderErrands();
      renderLogbook();
      renderFavorite();
    }
    return progression;
  }

  function emitWorldAudio(type, value) {
    const identityKey = type === 'discovery' ? 'discovery' : type === 'surprise' ? 'surprise' : 'state';
    const detail = { action: 'world', type, [identityKey]: value };
    if (typeof window.NaokingAudio?.world === 'function') {
      window.NaokingAudio.world(detail);
      return;
    }
    window.dispatchEvent(new CustomEvent('naoking:audio', { detail }));
  }

  function applyDailyContext() {
    body.dataset.worldState = daily.worldStateId;
    body.dataset.worldPalette = daily.worldState.palette;
    body.dataset.tide = daily.tideId;
    body.dataset.season = daily.seasonId.split('-').at(-1);
    body.style.setProperty('--world-ray-angle', `${daily.tide.rayAngle}deg`);
    body.style.setProperty('--world-particle-level', String(daily.tide.particleLevel));

    const date = daily.dateKey.split('-');
    const content = {
      '#daily-date': `TODAY / ${date[1]}.${date[2]}`,
      '#daily-decree': daily.decree.text,
      '#daily-detail': daily.decree.detail,
      '#daily-tide': daily.tide.label,
      '#daily-relic': daily.relic.label,
      '#kingdom-condition': daily.worldState.titleJa,
      '#kingdom-condition-detail': daily.worldState.description,
      '#kingdom-day-code': `DAY SIGNAL / ${daily.dateKey.replaceAll('-', '.')}`,
      '#kingdom-state-name': `${daily.worldState.titleJa} / ${daily.worldState.title}`,
      '#kingdom-state-summary': daily.worldState.description
    };
    Object.entries(content).forEach(([selector, value]) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = value;
    });

    setTimer(() => {
      if (!document.hidden && !window.NaokingPhotos?.isPaused?.()) {
        const preferredPhoto = Number.isInteger(progression.pinnedPhotoId)
          ? progression.pinnedPhotoId
          : daily.photoIndex;
        window.NaokingPhotos?.select?.(preferredPhoto);
      }
    }, 180);
  }

  function districtForRoute(route) {
    return routeDistrict.get(route) || (model.indexes.districts[route] ? route : 'home');
  }

  function recordDistrict(route) {
    currentDistrict = districtForRoute(route);
    updateProgression(model.recordVisit(progression, dateKey, currentDistrict), { render: false });
    renderLogbook();
  }

  function recordDiscovery(id, collectionType, { announce = true } = {}) {
    const alreadyKnown = progression.discoveries.includes(id);
    updateProgression(model.recordDiscovery(progression, id, collectionType));
    if (announce && !alreadyKnown && progression.discoveries.includes(id)) emitWorldAudio('discovery', id);
  }

  function completeErrandByEvent(eventName) {
    const errand = daily.errands.find(item => item.completionEvent === eventName);
    if (!errand || progression.daily.completedErrandIds.includes(errand.id)) return;
    updateProgression(model.completeErrand(progression, dateKey, errand.id));
  }

  function renderErrands() {
    const list = document.querySelector('#royal-errand-list');
    if (!list) return;
    const completed = new Set(progression.daily.dateKey === dateKey ? progression.daily.completedErrandIds : []);
    list.replaceChildren(...daily.errands.map((errand, index) => {
      const item = document.createElement('li');
      const done = completed.has(errand.id);
      item.className = done ? 'is-complete' : '';
      item.dataset.errand = errand.id;
      const mark = document.createElement('span');
      mark.textContent = done ? '✓' : String(index + 1).padStart(2, '0');
      const copy = document.createElement('div');
      const title = document.createElement('b');
      title.textContent = errand.label;
      const detail = document.createElement('p');
      detail.textContent = `${errand.duration} / 任意 / 失敗なし`;
      copy.append(title, detail);
      item.append(mark, copy);
      return item;
    }));
  }

  function photoDiscoveryCount() {
    return progression.discoveries.filter(id => /^photo-\d{2}$/.test(id)).length;
  }

  function renderLogbook() {
    const values = {
      '#kingdom-discovery-count': progression.discoveries.length,
      '#logbook-visit-days': progression.visitDays.length,
      '#logbook-districts': `${progression.visitedDistricts.filter(id => visibleDistricts.some(district => district.id === id)).length} / ${visibleDistricts.length}`,
      '#logbook-memories': `${photoDiscoveryCount()} / ${photoCount}`,
      '#logbook-secrets': progression.discoveries.filter(id => !/^photo-\d{2}$/.test(id)).length
    };
    Object.entries(values).forEach(([selector, value]) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = String(value);
    });

    const discoveries = document.querySelector('#logbook-discoveries');
    if (discoveries) {
      const meaningful = progression.discoveries.filter(id => !/^photo-\d{2}$/.test(id));
      discoveries.replaceChildren(...(meaningful.length ? meaningful : ['']).map(id => {
        const item = document.createElement('li');
        item.textContent = id ? discoveryLabel(id) : 'まだ何も見つかっていません。';
        return item;
      }));
    }

    const districtList = document.querySelector('#logbook-district-list');
    if (districtList) {
      districtList.replaceChildren(...visibleDistricts.map(district => {
        const item = document.createElement('li');
        const visited = progression.visitedDistricts.includes(district.id);
        item.className = visited ? 'is-visited' : '';
        item.textContent = visited ? `${district.code} / ${district.titleJa}` : `${district.code} / 未訪問`;
        return item;
      }));
    }

    const intro = document.querySelector('#kingdom-logbook-intro');
    if (intro) {
      const returning = progression.visitDays.length > 1;
      intro.textContent = returning
        ? `${progression.visitDays.length}日分の潮目を記録しています。来なかった日は空白のままで大丈夫です。`
        : 'このブラウザが覚えている、王国での小さな発見です。';
    }
  }

  function selectedGalleryPhotoIndex() {
    const displayed = Number.parseInt(document.querySelector('#gallery-image')?.dataset.photoIndex || '', 10);
    if (Number.isInteger(displayed) && displayed >= 0 && displayed < photoCount) return displayed;
    return window.NaokingPhotos?.current?.() ?? 0;
  }

  function renderFavorite() {
    const button = document.querySelector('#gallery-favorite');
    if (!button || !window.NaokingPhotos) return;
    const index = selectedGalleryPhotoIndex();
    const favorite = progression.favoritePhotoIds.includes(index);
    button.setAttribute('aria-pressed', String(favorite));
    button.textContent = favorite ? '★ 記憶に留めた' : '☆ 記憶に留める';
  }

  function toggleFavorite() {
    if (!window.NaokingPhotos) return;
    const index = selectedGalleryPhotoIndex();
    const favorites = new Set(progression.favoritePhotoIds);
    const adding = !favorites.has(index);
    adding ? favorites.add(index) : favorites.delete(index);
    updateProgression(model.sanitizeProgression({
      ...progression,
      favoritePhotoIds: [...favorites],
      pinnedPhotoId: favorites.has(index) ? index : progression.pinnedPhotoId === index ? null : progression.pinnedPhotoId
    }));
    if (adding) {
      recordDiscovery('gallery-favorite');
      completeErrandByEvent('gallery:favorite');
    }
  }

  function renderExpeditionSummary() {
    const output = document.querySelector('#expedition-summary');
    if (!output) return;
    try {
      const runs = Number(window.localStorage.getItem('naoking-deep-sea-runs')) || 0;
      const best = Number(window.localStorage.getItem('naoking-deep-sea-high-score')) || 0;
      output.textContent = runs ? `${runs}回の回遊 / 最高 ${best.toLocaleString('ja-JP')}点。王は記録に責任を負いません。` : 'まだ本日の回遊記録はありません。';
    } catch { output.textContent = '回遊記録は、このブラウザでは保存されていません。'; }
  }

  function runArchiveScan() {
    const consoleElement = document.querySelector('.archive-console');
    const status = document.querySelector('#archive-scan-status');
    if (!consoleElement || consoleElement.classList.contains('is-scanning')) return;
    consoleElement.classList.add('is-scanning');
    if (status) status.textContent = '圧力プロジェクターを走査中…';
    emitWorldAudio('discovery', 'archive-scan');
    setTimer(() => {
      consoleElement.classList.remove('is-scanning');
      if (status) status.textContent = `記録 ${String(daily.photoIndex + 1).padStart(2, '0')} に本日の海流反応を確認`;
      recordDiscovery('archive-signal');
      completeErrandByEvent('record:daily-still');
    }, reducedMotion.matches ? 80 : 1800);
  }

  function revealMissingRecord() {
    const button = document.querySelector('#missing-record');
    if (!button) return;
    button.classList.add('is-discovered');
    const title = button.querySelector('b');
    const detail = button.querySelector('p');
    if (title) title.textContent = '記録係、休憩中';
    if (detail) detail.textContent = '微弱信号の内容は「今日はもう帰りたい」でした。無事です。';
    recordDiscovery('missing-record');
  }

  function stampBureau() {
    const seal = document.querySelector('#decree-seal');
    const response = document.querySelector('#bureau-response');
    seal?.classList.remove('is-stamped');
    window.requestAnimationFrame(() => seal?.classList.add('is-stamped'));
    const responses = [
      '受理されました。ただし、何を受理したのかは非公開です。',
      '王印を確認。入会資格は「たぶん」に更新されました。',
      '書類は完璧です。書類の目的だけが見つかりません。'
    ];
    if (response) response.textContent = responses[daily.seed % responses.length];
    recordDiscovery('bureau-seal');
    completeErrandByEvent('bureau:read');
  }

  function isCriticalFlowActive() {
    const spin = document.querySelector('#spin');
    const gameState = document.querySelector('#game-state')?.textContent || '';
    return Boolean(
      (spin && spin.disabled)
      || body.classList.contains('menu-open')
      || /航行中|回遊中|残り/.test(gameState)
      || document.querySelector('.fortune-card.is-spinning, .roulette-full-event.is-active, .ultimate-event.is-active')
    );
  }

  function modalOpen() {
    return Boolean(document.querySelector('dialog[open]'));
  }

  function soundEnabled() {
    try { return Boolean(window.NaokingAudio?.snapshot?.().enabled); } catch { return false; }
  }

  function endSurprise() {
    surpriseEndTimer = cancelTimer(surpriseEndTimer);
    const layer = document.querySelector('#kingdom-surprise');
    layer?.classList.remove('is-active');
    if (layer) {
      delete layer.dataset.kind;
      delete layer.dataset.mode;
    }
  }

  function hideBackgroundActor() {
    actorEndTimer = cancelTimer(actorEndTimer);
    const actor = document.querySelector('#kingdom-actor');
    actor?.classList.remove('is-crossing', 'is-peeking', 'is-static-fallback');
    actor?.setAttribute('aria-hidden', 'true');
    actor?.removeAttribute('role');
    actor?.removeAttribute('tabindex');
    actor?.removeAttribute('aria-label');
  }

  function usesStaticActorFallback() {
    return reducedMotion.matches || compactActor.matches || forcedColors.matches;
  }

  function discoverStaticActor() {
    const actor = document.querySelector('#kingdom-actor');
    if (actorUsed || !actor?.classList.contains('is-static-fallback')) return;
    actorUsed = true;
    recordDiscovery('daily-visitor');
    completeErrandByEvent('discovery:daily-visitor');
    hideBackgroundActor();
  }

  function showSurprise() {
    if (encounterUsed || document.hidden || modalOpen() || isCriticalFlowActive()) return;
    const selection = model.selectSurprise({
      dateKey,
      districtId: currentDistrict,
      sessionIndex: progression.surprises.total,
      sessionCounts,
      lastShownAt: progression.surprises.lastShownAt,
      recentIds: progression.surprises.recentIds.slice(-3),
      now: Date.now(),
      documentHidden: document.hidden,
      reducedMotion: reducedMotion.matches,
      criticalFlowActive: isCriticalFlowActive(),
      modalOpen: modalOpen(),
      soundEnabled: soundEnabled()
    }, `${daily.seed}:${progression.totalVisits}`);
    if (!selection) return;

    const layer = document.querySelector('#kingdom-surprise');
    if (!layer) return;
    const copy = surpriseCopy[selection.id] || [selection.title, '王国記録へ追加されました。'];
    const title = layer.querySelector('b');
    const detail = layer.querySelector('span');
    if (title) title.textContent = copy[0];
    if (detail) detail.textContent = copy[1];
    layer.dataset.kind = selection.id;
    layer.dataset.mode = selection.presentationMode || 'full';
    layer.classList.add('is-active');
    encounterUsed = true;
    sessionCounts[selection.id] = (sessionCounts[selection.id] || 0) + 1;
    progression = model.recordSurprise(progression, selection.id, Date.now());
    saveProgression();
    // A surprise is also logged as a discovery, but owns one distinct sound scene.
    // Suppress the generic discovery chime so both cues do not overlap.
    recordDiscovery(selection.id, undefined, { announce:false });
    if (selection.sound !== 'silent' && selection.presentationMode !== 'silent') emitWorldAudio('surprise', selection.id);
    surpriseEndTimer = setTimer(() => {
      surpriseEndTimer = 0;
      endSurprise();
    }, Math.min(6500, Math.max(3200, selection.durationMs || 4200)));
  }

  function showBackgroundActor() {
    if (actorUsed || document.hidden || modalOpen() || isCriticalFlowActive()) return;
    const actor = document.querySelector('#kingdom-actor');
    if (!actor) return;
    actor.classList.remove('is-sleeping', 'is-peeking', 'is-crossing');
    if (usesStaticActorFallback()) {
      actor.classList.add('is-static-fallback');
      actor.setAttribute('role', 'button');
      actor.setAttribute('tabindex', '0');
      actor.setAttribute('aria-hidden', 'false');
      actor.setAttribute('aria-label', '静かな来訪者を見つける');
      return;
    }
    actorUsed = true;
    actor.classList.add(currentDistrict === 'record' ? 'is-peeking' : 'is-crossing');
    recordDiscovery('daily-visitor');
    completeErrandByEvent('discovery:daily-visitor');
    actorEndTimer = setTimer(() => {
      actorEndTimer = 0;
      actor.classList.remove('is-peeking', 'is-crossing');
    }, 8200);
  }

  function scheduleAmbientLife() {
    actorScheduleTimer = cancelTimer(actorScheduleTimer);
    surpriseScheduleTimer = cancelTimer(surpriseScheduleTimer);
    if (document.hidden) return;
    if (daily.worldStateId === 'sleeping-court' && currentDistrict === 'home' && !reducedMotion.matches) {
      document.querySelector('#kingdom-actor')?.classList.add('is-sleeping');
    } else {
      document.querySelector('#kingdom-actor')?.classList.remove('is-sleeping');
    }
    if (!actorUsed) {
      actorScheduleTimer = setTimer(() => {
        actorScheduleTimer = 0;
        showBackgroundActor();
      }, 10000 + (daily.seed % 5000));
    }
    if (!encounterUsed) {
      surpriseScheduleTimer = setTimer(() => {
        surpriseScheduleTimer = 0;
        showSurprise();
      }, 26000 + (daily.seed % 9000));
    }
  }

  function scheduleQuietVisit(route) {
    window.clearTimeout(quietVisitTimer);
    quietVisitTimer = 0;
    if (route !== 'home' || document.hidden) return;
    quietVisitTimer = window.setTimeout(() => completeErrandByEvent('home:quiet-visit'), 20000);
  }

  function openLogbook() {
    const dialog = document.querySelector('#kingdom-logbook');
    if (!dialog || dialog.open) return;
    renderLogbook();
    dialog.showModal();
    body.classList.add('logbook-open');
  }

  function closeLogbook() {
    const dialog = document.querySelector('#kingdom-logbook');
    if (!dialog?.open) return;
    dialog.close();
    body.classList.remove('logbook-open');
    document.querySelector('#kingdom-logbook-open')?.focus();
  }

  function clearLogbook() {
    if (!window.confirm('この端末に保存した王国手帳の記録を初期化しますか？')) return;
    window.NaokingRoyalPassport?.reset?.();
    try { window.localStorage.removeItem('naokingRoyalPassportV1'); } catch { /* legacy storage is optional */ }
    progression = model.createProgression(dateKey);
    progression = model.recordVisit(progression, dateKey, currentDistrict);
    gamePickupCount = 0;
    saveProgression();
    renderErrands();
    renderLogbook();
    renderFavorite();
    if (!window.NaokingPhotos?.isPaused?.()) window.NaokingPhotos?.select?.(daily.photoIndex);
  }

  document.querySelector('#kingdom-logbook-open')?.addEventListener('click', openLogbook);
  document.querySelector('#kingdom-logbook-close')?.addEventListener('click', closeLogbook);
  document.querySelector('#kingdom-logbook-clear')?.addEventListener('click', clearLogbook);
  document.querySelector('#kingdom-logbook')?.addEventListener('cancel', event => {
    event.preventDefault();
    closeLogbook();
  });
  document.querySelector('#archive-scan')?.addEventListener('click', runArchiveScan);
  document.querySelector('#missing-record')?.addEventListener('click', revealMissingRecord);
  document.querySelector('#decree-seal')?.addEventListener('click', stampBureau);
  document.querySelector('#gallery-favorite')?.addEventListener('click', toggleFavorite);
  const kingdomActor = document.querySelector('#kingdom-actor');
  kingdomActor?.addEventListener('click', discoverStaticActor);
  kingdomActor?.addEventListener('keydown', event => {
    if (!['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    discoverStaticActor();
  });
  document.querySelector('#photo-gallery-open')?.addEventListener('click', () => {
    completeErrandByEvent('gallery:view');
    window.requestAnimationFrame(renderFavorite);
  });
  document.querySelector('#daily-stamp')?.addEventListener('click', () => {
    const firstAcknowledgement = progression.daily.dateKey !== dateKey || !progression.daily.acknowledged;
    updateProgression(model.acknowledgeDay(progression, dateKey));
    completeErrandByEvent('daily:stamp');
    if (firstAcknowledgement) emitWorldAudio('state', daily.worldStateId);
  });
  const offeringGuidance = document.querySelector('.offering-guidance');
  let safetyNoteRead = false;
  const acknowledgeSafetyNote = () => {
    if (safetyNoteRead) return;
    safetyNoteRead = true;
    completeErrandByEvent('workshop:safety-note');
  };
  offeringGuidance?.addEventListener('click', acknowledgeSafetyNote);
  offeringGuidance?.addEventListener('keydown', event => {
    if (!['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    acknowledgeSafetyNote();
  });
  document.querySelector('#frame-file')?.addEventListener('change', () => completeErrandByEvent('workshop:frame-preview'));

  window.addEventListener('naoking:pagechange', event => {
    const route = event.detail?.page || 'home';
    endSurprise();
    hideBackgroundActor();
    recordDistrict(route);
    scheduleQuietVisit(route);
    scheduleAmbientLife();
  });
  window.addEventListener('naoking:photochange', event => {
    const index = Number(event.detail?.index);
    const galleryOpen = Boolean(document.querySelector('#kingdom-gallery')?.open);
    if (galleryOpen && Number.isInteger(index) && index >= 0 && index < photoCount) {
      recordDiscovery(`photo-${String(index + 1).padStart(2, '0')}`, 'clueIds');
    }
    if (galleryOpen) completeErrandByEvent('gallery:view');
    renderFavorite();
  });
  window.addEventListener('naoking:galleryselection', () => {
    completeErrandByEvent('gallery:view');
    renderFavorite();
  });
  window.addEventListener('naoking:oracleresult', () => completeErrandByEvent('oracle:result'));
  window.addEventListener('naoking:gameaudio', event => {
    const cue = event.detail?.cue;
    if (['clear', 'game-over'].includes(cue)) {
      completeErrandByEvent('game:run');
      renderExpeditionSummary();
    }
    if (cue === 'pickup' || cue === 'rare-pickup') {
      gamePickupCount = Math.min(3, gamePickupCount + 1);
      if (gamePickupCount >= 3) completeErrandByEvent('game:bubbles-3');
    }
  });
  window.addEventListener('storage', event => {
    if (event.key !== model.STORAGE_KEY) return;
    let next = event.newValue ? model.sanitizeProgression(event.newValue) : model.createProgression(dateKey);
    if (next.daily.dateKey !== dateKey) {
      next = model.sanitizeProgression({
        ...next,
        daily: { dateKey, completedErrandIds: [], chosenErrandId: null, acknowledged: false }
      });
    }
    progression = next;
    renderErrands();
    renderLogbook();
    renderFavorite();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      endSurprise();
      hideBackgroundActor();
      clearTimers();
    } else {
      scheduleQuietVisit(body.dataset.page || 'home');
      scheduleAmbientLife();
    }
  });
  reducedMotion.addEventListener?.('change', event => {
    if (event.matches) {
      endSurprise();
      hideBackgroundActor();
      document.querySelector('#kingdom-actor')?.classList.remove('is-sleeping');
      clearTimers();
    }
    scheduleQuietVisit(body.dataset.page || 'home');
    scheduleAmbientLife();
  });
  compactActor.addEventListener?.('change', () => {
    hideBackgroundActor();
    actorScheduleTimer = cancelTimer(actorScheduleTimer);
    scheduleAmbientLife();
  });
  forcedColors.addEventListener?.('change', () => {
    hideBackgroundActor();
    actorScheduleTimer = cancelTimer(actorScheduleTimer);
    scheduleAmbientLife();
  });
  window.addEventListener('pagehide', clearTimers, { once: true });

  applyDailyContext();
  progression = model.recordVisit(progression, dateKey, currentDistrict);
  saveProgression();
  renderErrands();
  renderLogbook();
  renderFavorite();
  renderExpeditionSummary();
  scheduleQuietVisit(body.dataset.page || 'home');
  scheduleAmbientLife();

  window.NaokingKingdomWorld = Object.freeze({
    daily,
    progression: () => progression,
    discover: recordDiscovery,
    complete: completeErrandByEvent,
    openLogbook,
    surprise: showSurprise
  });
})();
