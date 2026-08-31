(function exposeNaokingWorldData(root, factory) {
  'use strict';

  const api = factory();
  Object.defineProperty(root, 'NaokingWorldDataFactory', {
    value: factory,
    configurable: true,
    enumerable: false,
    writable: false
  });
  Object.defineProperty(root, 'NaokingWorldData', {
    value: api,
    configurable: true,
    enumerable: true,
    writable: false
  });
})(typeof globalThis !== 'undefined' ? globalThis : this, function createNaokingWorldData() {
  'use strict';

  const STORAGE_KEY = 'naokingKingdomWorldV1';
  const STORAGE_VERSION = 1;
  const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  const SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
  const PHOTO_COUNT = 26;

  const CAPS = {
    visitDays: 180,
    audienceStamps: 28,
    visitedDistricts: 9,
    discoveries: 128,
    collectionItems: 96,
    favoritePhotos: PHOTO_COUNT,
    recentSurprises: 24,
    seenSurprises: 64,
    completedErrands: 3
  };

  function deepFreeze(value, seen) {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) return value;
    const visited = seen || new WeakSet();
    if (visited.has(value)) return value;
    visited.add(value);
    Reflect.ownKeys(value).forEach(key => deepFreeze(value[key], visited));
    return Object.freeze(value);
  }

  function immutable(value) {
    return deepFreeze(value);
  }

  const DISTRICTS = immutable([
    {
      id: 'home',
      routeId: 'home',
      code: 'GATE-00',
      title: 'Living Royal Gate',
      titleJa: '生きている王国門',
      identity: '海中王国へ入る、呼吸する玄関',
      material: 'pearl-water',
      motion: 'three-strata-drift',
      sound: 'distant-crown-hydrophone',
      signatureMoment: 'gate-aperture',
      dailyAspect: 'tide-and-memory'
    },
    {
      id: 'record',
      routeId: 'videos',
      code: 'ARCHIVE-01',
      title: 'Submerged Broadcast Archive',
      titleJa: '水没放送記録庫',
      identity: '圧力の中から記録映像を引き上げる保管庫',
      material: 'dark-film-and-brass',
      motion: 'projector-pressure-pull',
      sound: 'tape-water-resonance',
      signatureMoment: 'pressure-projector',
      dailyAspect: 'record-still'
    },
    {
      id: 'oracle',
      routeId: 'fortune',
      code: 'COURT-02',
      title: 'なおキング占いの間',
      titleJa: 'なおキング占いの間',
      identity: '王が勝手に今日の運勢を決める、少し騒がしい占い部屋',
      material: 'black-pearl-machinery',
      motion: 'charge-hold-verdict',
      sound: 'pressure-pulse-and-verdict-bell',
      signatureMoment: 'held-verdict',
      dailyAspect: 'presentation-only-modifier'
    },
    {
      id: 'gallery',
      routeId: 'gallery',
      code: 'MEMORY-03',
      title: 'Memory Current',
      titleJa: '記憶の海流',
      identity: '二十六の王国記憶を一枚ずつ再訪する流れ',
      material: 'photo-emulsion-water',
      motion: 'match-current',
      sound: 'soft-shutter-and-current',
      signatureMoment: 'one-memory-at-a-time',
      dailyAspect: 'memory-of-the-day'
    },
    {
      id: 'game',
      routeId: 'game',
      code: 'SURVIVAL-04',
      title: 'Pressure Survival Zone',
      titleJa: '水圧生存海域',
      identity: '操作と酸素が主役になる全幅航行海域',
      material: 'instrument-panel-and-open-water',
      motion: 'forward-current',
      sound: 'sonar-heart-and-oxygen',
      signatureMoment: 'full-bleed-dive',
      dailyAspect: 'fair-cosmetic-expedition'
    },
    {
      id: 'workshop',
      routeId: 'submit',
      code: 'WORKSHOP-05',
      title: 'Royal Creation Facility',
      titleJa: '王立制作施設',
      identity: 'VRChatの記憶を安全に王国へ引き渡す工房',
      material: 'blueprint-paper-and-waterline',
      motion: 'assemble-and-release',
      sound: 'tool-chime-and-airlock',
      signatureMoment: 'two-door-workbench',
      dailyAspect: 'frame-style-suggestion'
    },
    {
      id: 'daily',
      routeId: 'home',
      code: 'SIGNAL-06',
      title: 'Kingdom Day Signal',
      titleJa: '王国日信号',
      identity: '全地区へ同じ今日を薄く届ける共通信号',
      material: 'ink-seal-and-moving-light',
      motion: 'single-day-pulse',
      sound: 'three-note-tide-motif',
      signatureMoment: 'audience-stamp',
      dailyAspect: 'canonical-source'
    },
    {
      id: 'bureau',
      routeId: 'join',
      code: 'BUREAU-07',
      title: 'Royal Decree Bureau',
      titleJa: '王国通達局',
      identity: '無駄に格式高く、しかし読みやすい王国官庁',
      material: 'pearl-paper-and-redaction-ink',
      motion: 'decree-unfold',
      sound: 'paper-pressure-and-seal',
      signatureMoment: 'unfolding-decree',
      dailyAspect: 'clause-of-the-day'
    },
    {
      id: 'lost',
      routeId: '404',
      code: 'UNCHARTED-08',
      title: 'Uncharted Current',
      titleJa: '未記載海流',
      identity: '迷子を責めず王国へ送り返す静かな外縁',
      material: 'fog-water-and-compass-light',
      motion: 'lost-compass',
      sound: 'single-distant-sonar',
      signatureMoment: 'royal-lost-compass',
      dailyAspect: 'safe-return-bearing'
    }
  ]);

  const TIDES = immutable([
    { id: 'calm', label: '凪 / 透明度 88%', depthBand: 'blue', flow: 'still', rayAngle: -8, particleLevel: 1, motifShift: 0 },
    { id: 'rising', label: '上げ潮 / やや追い風', depthBand: 'surface', flow: 'upward', rayAngle: -18, particleLevel: 2, motifShift: 2 },
    { id: 'royal-swell', label: '王族性のうねり', depthBand: 'twilight', flow: 'rolling', rayAngle: 9, particleLevel: 2, motifShift: 4 },
    { id: 'light-shafts', label: '静穏 / 光の筋あり', depthBand: 'blue', flow: 'soft', rayAngle: -26, particleLevel: 1, motifShift: 5 },
    { id: 'cross-current', label: '気まぐれな横流れ', depthBand: 'twilight', flow: 'sideways', rayAngle: 22, particleLevel: 2, motifShift: -2 },
    { id: 'stable-depth', label: '深度安定 / 良好', depthBand: 'abyss', flow: 'slow', rayAngle: 3, particleLevel: 1, motifShift: -5 },
    { id: 'reverse', label: '逆潮 / 記憶が先行', depthBand: 'twilight', flow: 'reverse', rayAngle: 17, particleLevel: 2, motifShift: -4 },
    { id: 'luminous', label: '発光潮 / 青白い余光', depthBand: 'blue', flow: 'luminous', rayAngle: -31, particleLevel: 3, motifShift: 7 },
    { id: 'sleeping', label: '眠り潮 / 王宮静穏', depthBand: 'abyss', flow: 'sleeping', rayAngle: 0, particleLevel: 0, motifShift: -7 }
  ]);

  const DECREES = immutable([
    { id: 'dignified-pace', text: '急がず泳げ。速さより、王らしい顔が大事だ。', detail: '今日は遠回りに、小さな魚群が待っています。' },
    { id: 'crooked-crown', text: '王冠が斜めでも、威厳まで斜めとは限らない。', detail: '少し不格好な選択が、意外と良い潮目を作ります。' },
    { id: 'three-breaths', text: '深呼吸を三回。水中なので、真似はしないこと。', detail: '立ち止まる時間を予定に入れると運勢が整います。' },
    { id: 'unknown-door', text: 'よく分からない扉は、一度だけ押してみよ。', detail: '新しいものに触れるなら、今日がちょうど良い日です。' },
    { id: 'royal-posture', text: '見栄を張るなら、最後まで堂々と張れ。', detail: '自信は後からついてきます。まず姿勢だけ王様で。' },
    { id: 'share-small-fish', text: '小魚を分けた者には、大魚の夢を見る権利を与える。', detail: '誰かへの小さな親切が、別の流れを連れてきます。' },
    { id: 'official-rest', text: '今日は何もしない決断も、正式な王命とする。', detail: '休むことに理由はいりません。海流に預けてください。' },
    { id: 'bluest-way', text: '迷ったら、いちばん青い方へ進め。', detail: '直感で選んだ色や音に、今日の答えが隠れています。' },
    { id: 'float-the-lesson', text: '失敗は沈めよ。反省だけ浮上させればよい。', detail: '昨日より一つ軽くなれば、それで十分です。' },
    { id: 'sleeping-king', text: '王は寝ている。各自、ほどよく幸せになれ。', detail: '誰にも急かされない時間が、今日の宝物です。' }
  ]);

  const RELICS = immutable([
    { id: 'crooked-crown', label: '少し曲がった王冠', motifId: 'crown-fragment', note: '直すほどでもない、王国標準の角度。' },
    { id: 'blue-glass', label: '青いグラス', motifId: 'glass-ring', note: '海の色だけを一口ぶん保管する。' },
    { id: 'third-photo', label: '写真フォルダの三枚目', motifId: 'memory-frame', note: '選ばれなかった一枚にも記録番号はある。' },
    { id: 'round-cushion', label: '丸いクッション', motifId: 'soft-orbit', note: '王の昼寝により少しだけ平たい。' },
    { id: 'sealed-snack', label: '未開封のお菓子', motifId: 'tiny-seal', note: '開封日は王国暦でも未定。' },
    { id: 'gold-trinket', label: '金色の小物', motifId: 'gold-glint', note: '用途より威厳を優先した部品。' },
    { id: 'small-shark', label: '小さなサメ', motifId: 'little-fin', note: '本人は等身大だと主張している。' },
    { id: 'transparent-thing', label: '透明なもの', motifId: 'clear-current', note: '見失っても仕様です。' }
  ]);

  const MOTIFS = immutable([
    { id: 'crown-fragment', glyph: 'crown', interval: [0, 4, 7], bubbleCount: 2, filter: 'pearl' },
    { id: 'glass-ring', glyph: 'ring', interval: [0, 5, 9], bubbleCount: 3, filter: 'clear' },
    { id: 'memory-frame', glyph: 'frame', interval: [0, 2, 7], bubbleCount: 1, filter: 'archive' },
    { id: 'soft-orbit', glyph: 'orbit', interval: [0, 3, 7], bubbleCount: 2, filter: 'soft' },
    { id: 'tiny-seal', glyph: 'seal', interval: [0, 7, 12], bubbleCount: 1, filter: 'paper' },
    { id: 'gold-glint', glyph: 'glint', interval: [0, 4, 11], bubbleCount: 3, filter: 'gold' },
    { id: 'little-fin', glyph: 'fin', interval: [0, 2, 5], bubbleCount: 4, filter: 'playful' },
    { id: 'clear-current', glyph: 'current', interval: [0, 5, 7], bubbleCount: 2, filter: 'mist' },
    { id: 'jelly-bloom', glyph: 'jelly', interval: [0, 7, 9], bubbleCount: 5, filter: 'luminous' }
  ]);

  const WORLD_STATES = immutable([
    {
      id: 'luminous-tide',
      title: 'Luminous Tide',
      titleJa: '発光潮',
      description: '青白い水の筋が王国全域をゆっくり通過する日。',
      weight: 13,
      tidePool: ['luminous', 'light-shafts'],
      palette: 'aqua-pearl',
      depthBias: 'blue',
      visitor: 'moon-jelly',
      backgroundBehavior: 'slow-light-sweep',
      audioPalette: 'open-fifths'
    },
    {
      id: 'crown-drift',
      title: 'Crown Drift',
      titleJa: '王冠漂流',
      description: '小さな王冠片が海流に混じる、少しだけ格式高い日。',
      weight: 12,
      tidePool: ['royal-swell', 'rising'],
      palette: 'royal-blue-gold',
      depthBias: 'twilight',
      visitor: 'crown-fragment',
      backgroundBehavior: 'rare-gold-drift',
      audioPalette: 'distant-brass'
    },
    {
      id: 'sleeping-court',
      title: 'Sleeping Court',
      titleJa: '王宮睡眠日',
      description: '王宮の動きと音が少し静かになり、なおキングがよく眠る日。',
      weight: 11,
      tidePool: ['sleeping', 'stable-depth'],
      palette: 'midnight-cobalt',
      depthBias: 'abyss',
      visitor: 'sleepy-naoking',
      backgroundBehavior: 'low-particle-rest',
      audioPalette: 'low-lull'
    },
    {
      id: 'jelly-migration',
      title: 'Jelly Migration',
      titleJa: 'クラゲ回遊',
      description: '記憶の海流をクラゲの群れが横切る日。',
      weight: 12,
      tidePool: ['cross-current', 'luminous'],
      palette: 'violet-aqua',
      depthBias: 'twilight',
      visitor: 'jelly-shoal',
      backgroundBehavior: 'layered-migration',
      audioPalette: 'glass-drops'
    },
    {
      id: 'reverse-current',
      title: 'Reverse Current',
      titleJa: '逆流日',
      description: '古い記憶が先に届く、方向だけが少し不思議な日。',
      weight: 10,
      tidePool: ['reverse', 'cross-current'],
      palette: 'indigo-teal',
      depthBias: 'twilight',
      visitor: 'backward-fish',
      backgroundBehavior: 'subtle-reverse-drift',
      audioPalette: 'reverse-tail'
    },
    {
      id: 'archive-bloom',
      title: 'Archive Bloom',
      titleJa: '記録開花',
      description: '過去の写真に青い光が宿り、記録庫が少し明るくなる日。',
      weight: 12,
      tidePool: ['light-shafts', 'calm'],
      palette: 'film-blue',
      depthBias: 'blue',
      visitor: 'memory-mote',
      backgroundBehavior: 'photo-emulsion-bloom',
      audioPalette: 'tape-chime'
    },
    {
      id: 'portal-anomaly',
      title: 'Portal Anomaly',
      titleJa: '門異常',
      description: '地区間の扉が一瞬だけ知らない部屋を映す日。出口はいつも通り安全。',
      weight: 9,
      tidePool: ['rising', 'reverse'],
      palette: 'electric-deep-blue',
      depthBias: 'twilight',
      visitor: 'unknown-silhouette',
      backgroundBehavior: 'rare-portal-refraction',
      audioPalette: 'split-signal'
    },
    {
      id: 'royal-festival',
      title: 'Royal Festival',
      titleJa: '王国小祭',
      description: '金の印と小さな行列が現れる、派手すぎない祝祭日。',
      weight: 8,
      tidePool: ['royal-swell', 'luminous'],
      palette: 'festival-cobalt-gold',
      depthBias: 'surface',
      visitor: 'tiny-procession',
      backgroundBehavior: 'restrained-confetti-current',
      audioPalette: 'royal-triad'
    },
    {
      id: 'quiet-trench',
      title: 'Quiet Trench',
      titleJa: '静かな海溝',
      description: '泡も光も少なめで、遠くの水音がよく聞こえる日。',
      weight: 13,
      tidePool: ['stable-depth', 'sleeping', 'calm'],
      palette: 'soft-abyss-blue',
      depthBias: 'abyss',
      visitor: 'shy-ray',
      backgroundBehavior: 'wide-negative-space',
      audioPalette: 'quiet-sonar'
    }
  ]);

  const ERRANDS = immutable([
    { id: 'visit-one-memory', group: 'explore', label: '王国風景を一枚だけ眺める', target: 'gallery', duration: '約20秒', completionEvent: 'gallery:view', optional: true },
    { id: 'follow-record-current', group: 'explore', label: '記録庫で今日の一枚を見つける', target: 'record', duration: '約30秒', completionEvent: 'record:daily-still', optional: true },
    { id: 'find-quiet-creature', group: 'explore', label: 'どこかにいる静かな来訪者を見つける', target: 'any', duration: '好きなだけ', completionEvent: 'discovery:daily-visitor', optional: true },
    { id: 'ask-oracle-once', group: 'play', label: 'なおキング占いを一度だけ回す', target: 'oracle', duration: '約1分', completionEvent: 'oracle:result', optional: true },
    { id: 'collect-three-bubbles', group: 'play', label: '生存海域で王国餌を三つ集める', target: 'game', duration: '約1分', completionEvent: 'game:bubbles-3', optional: true },
    { id: 'calm-dive', group: 'play', label: '急がず短い航行を一度楽しむ', target: 'game', duration: '約1分', completionEvent: 'game:run', optional: true },
    { id: 'preview-one-frame', group: 'make', label: '写真工房で額縁を一つ試す', target: 'workshop', duration: '約30秒', completionEvent: 'workshop:frame-preview', optional: true },
    { id: 'read-submission-note', group: 'make', label: '制作施設の安全案内を一項読む', target: 'workshop', duration: '約20秒', completionEvent: 'workshop:safety-note', optional: true },
    { id: 'remember-one-photo', group: 'make', label: '好きな王国風景を一枚、記憶に留める', target: 'gallery', duration: '約20秒', completionEvent: 'gallery:favorite', optional: true },
    { id: 'receive-audience-stamp', group: 'reflect', label: '本日の謁見印を受け取る', target: 'daily', duration: '約10秒', completionEvent: 'daily:stamp', optional: true },
    { id: 'read-one-decree', group: 'reflect', label: '王国通達を一条だけ読む', target: 'bureau', duration: '約20秒', completionEvent: 'bureau:read', optional: true },
    { id: 'quiet-water-break', group: 'reflect', label: '海中の光を少しだけ眺める', target: 'home', duration: '約20秒', completionEvent: 'home:quiet-visit', optional: true }
  ].map(errand => ({
    ...errand,
    failureState: null,
    expiresWithoutPenalty: true,
    rewardAffectsOdds: false
  })));

  const ORACLE_PRESENTATION_MODIFIERS = immutable([
    { id: 'first-tide', label: '今日最初の潮', presentationOnly: true, cue: 'soft-pressure-rise' },
    { id: 'today-echo', label: '今日のひびき', presentationOnly: true, cue: 'distant-double-tone' },
    { id: 'court-silence', label: '王様が急に静か', presentationOnly: true, cue: 'brief-room-tone-dip' },
    { id: 'crown-refraction', label: '王冠がキラッ', presentationOnly: true, cue: 'pearl-shimmer' },
    { id: 'blue-hour', label: '海が青く光る時間', presentationOnly: true, cue: 'low-blue-pulse' }
  ]);

  const GAME_CHALLENGES = immutable([
    { id: 'three-calm-bubbles', cosmeticOnly: true },
    { id: 'one-gentle-current', cosmeticOnly: true },
    { id: 'royal-observer', cosmeticOnly: true },
    { id: 'blue-lane', cosmeticOnly: true }
  ]);

  const FRAME_STYLES = immutable([
    { id: 'memory-blue' },
    { id: 'pearl-document' },
    { id: 'royal-gold-edge' },
    { id: 'quiet-waterline' }
  ]);

  const PROBABILITY_POLICY = immutable({
    presentationOnly: true,
    oracleNormalScale: 1,
    oracleSpecialWinScale: 1,
    oracleSpecialLoseScale: 1,
    oracleRevivalScale: 1,
    gameRewardScale: 1,
    note: 'Daily state and progression never modify result, special-route, revival, or reward odds.'
  });

  function surprise(id, category, title, options) {
    return {
      id,
      category,
      title,
      weight: 1,
      eligibleDistricts: ['home'],
      durationMs: 4200,
      maxPerSession: 1,
      cooldownMs: 15 * 60 * 1000,
      requiresVisible: true,
      avoidCriticalFlow: true,
      avoidModal: true,
      blocksInput: false,
      sound: 'optional',
      motion: 'ambient',
      reducedMotionFallback: 'static',
      ...options
    };
  }

  const SURPRISES = immutable([
    surprise('royal-crossing', 'ambient', '王の横断', { eligibleDistricts: ['home', 'record'], motion: 'travel', reducedMotionFallback: 'static' }),
    surprise('giant-shadow', 'ambient', '遠い巨大影', { eligibleDistricts: ['home', 'game', 'gallery'], weight: 0.7, motion: 'ambient' }),
    surprise('shy-ray', 'ambient', '恥ずかしがりのエイ', { eligibleDistricts: ['home', 'gallery'], motion: 'travel' }),
    surprise('jelly-procession', 'ambient', 'クラゲの小行列', { eligibleDistricts: ['home', 'gallery', 'record'], motion: 'ambient' }),
    surprise('lost-crown', 'discovery', '流された王冠', { eligibleDistricts: ['home', 'gallery', 'bureau'], durationMs: 6000, motion: 'travel' }),
    surprise('archive-whisper', 'discovery', '記録庫の小声', { eligibleDistricts: ['record', 'gallery'], sound: 'optional', motion: 'none' }),
    surprise('surface-signal', 'discovery', '水面からの信号', { eligibleDistricts: ['home', 'record', 'lost'], durationMs: 5200, motion: 'none' }),
    surprise('royal-postcard', 'discovery', '未配達の絵葉書', { eligibleDistricts: ['gallery', 'workshop'], durationMs: 6000, motion: 'none' }),
    surprise('sleeping-king', 'comedy', '眠る王', { eligibleDistricts: ['home', 'bureau'], durationMs: 6800, motion: 'ambient' }),
    surprise('floating-decree', 'comedy', '漂流する通達', { eligibleDistricts: ['home', 'bureau'], motion: 'travel' }),
    surprise('royal-maintenance', 'comedy', '王国整備中', { eligibleDistricts: ['record', 'workshop'], durationMs: 5400, motion: 'none' }),
    surprise('portal-bubble-burp', 'comedy', '門の泡げっぷ', { eligibleDistricts: ['home'], durationMs: 3000, sound: 'optional', motion: 'ambient' }),
    surprise('tiny-procession', 'comedy', '小さすぎる王国行列', { eligibleDistricts: ['home', 'bureau', 'record'], durationMs: 5800, motion: 'travel' }),
    surprise('wrong-door', 'navigation', '存在しない部屋', { eligibleDistricts: ['home', 'lost'], durationMs: 1800, motion: 'transition', reducedMotionFallback: 'skip' }),
    surprise('lost-compass', 'navigation', '迷子の王立羅針盤', { eligibleDistricts: ['lost', 'home'], durationMs: 5000, motion: 'ambient' }),
    surprise('current-detour', 'navigation', '海流の寄り道', { eligibleDistricts: ['home', 'record', 'gallery'], durationMs: 2400, motion: 'transition', reducedMotionFallback: 'skip' }),
    surprise('waterline-inversion', 'world', '水面の一瞬反転', { eligibleDistricts: ['home', 'gallery'], durationMs: 2800, motion: 'ambient', reducedMotionFallback: 'static' }),
    surprise('quiet-power-nap', 'world', '王国の短い休電', { eligibleDistricts: ['home', 'record', 'bureau'], durationMs: 3600, sound: 'silent', motion: 'none' })
  ]);

  const indexes = immutable({
    districts: Object.fromEntries(DISTRICTS.map(item => [item.id, item])),
    tides: Object.fromEntries(TIDES.map(item => [item.id, item])),
    decrees: Object.fromEntries(DECREES.map(item => [item.id, item])),
    relics: Object.fromEntries(RELICS.map(item => [item.id, item])),
    motifs: Object.fromEntries(MOTIFS.map(item => [item.id, item])),
    worldStates: Object.fromEntries(WORLD_STATES.map(item => [item.id, item])),
    errands: Object.fromEntries(ERRANDS.map(item => [item.id, item])),
    surprises: Object.fromEntries(SURPRISES.map(item => [item.id, item]))
  });

  function isValidDateKey(value) {
    if (typeof value !== 'string' || !DATE_KEY_PATTERN.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function toLocalDateKey(value) {
    if (typeof value === 'string') {
      if (!isValidDateKey(value)) throw new TypeError(`Invalid local date key: ${value}`);
      return value;
    }
    const date = value === undefined ? new Date() : value;
    if (!date || typeof date.getFullYear !== 'function' || typeof date.getTime !== 'function' || Number.isNaN(date.getTime())) {
      throw new TypeError('Expected a valid Date or YYYY-MM-DD local date key.');
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateKey(dateKey) {
    const key = toLocalDateKey(dateKey);
    const [year, month, day] = key.split('-').map(Number);
    return { year, month, day };
  }

  function hashString(value) {
    const text = String(value);
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }
    hash += hash << 13;
    hash ^= hash >>> 7;
    hash += hash << 3;
    hash ^= hash >>> 17;
    hash += hash << 5;
    return hash >>> 0;
  }

  function seededUnit(seed) {
    let state = (typeof seed === 'number' ? seed : hashString(seed)) >>> 0;
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  function choose(items, seed) {
    if (!Array.isArray(items) || items.length === 0) return undefined;
    return items[Math.floor(seededUnit(seed) * items.length) % items.length];
  }

  function weightedChoose(items, seed) {
    if (!Array.isArray(items) || items.length === 0) return undefined;
    const total = items.reduce((sum, item) => sum + Math.max(0, Number(item.weight) || 0), 0);
    if (total <= 0) return choose(items, seed);
    let cursor = seededUnit(seed) * total;
    for (const item of items) {
      cursor -= Math.max(0, Number(item.weight) || 0);
      if (cursor < 0) return item;
    }
    return items[items.length - 1];
  }

  function deterministicShuffle(items, seed) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(seededUnit(`${seed}:${index}`) * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function seasonIdFor(dateKey) {
    const { year, month } = parseDateKey(dateKey);
    const season = month >= 3 && month <= 5
      ? 'spring'
      : month >= 6 && month <= 8
        ? 'summer'
        : month >= 9 && month <= 11
          ? 'autumn'
          : 'winter';
    return `${year}-${season}`;
  }

  function errandsFor(dateKey) {
    const groups = deterministicShuffle(['explore', 'play', 'make', 'reflect'], `${dateKey}:errand-groups`).slice(0, 3);
    return immutable(groups.map((group, index) => {
      const groupItems = ERRANDS.filter(item => item.group === group);
      return choose(groupItems, `${dateKey}:errand:${group}:${index}`);
    }));
  }

  function dailyContext(dateInput, options) {
    const settings = options && typeof options === 'object' ? options : {};
    const dateKey = toLocalDateKey(dateInput);
    const photoCount = Number.isInteger(settings.photoCount) && settings.photoCount > 0
      ? Math.min(settings.photoCount, 10000)
      : PHOTO_COUNT;
    const worldState = weightedChoose(WORLD_STATES, `${dateKey}:world-state`);
    const tide = choose(worldState.tidePool.map(id => indexes.tides[id]), `${dateKey}:tide:${worldState.id}`);
    const decree = choose(DECREES, `${dateKey}:decree`);
    const relic = choose(RELICS, `${dateKey}:relic`);
    const motif = indexes.motifs[relic.motifId] || choose(MOTIFS, `${dateKey}:motif`);
    const oraclePresentationModifier = choose(ORACLE_PRESENTATION_MODIFIERS, `${dateKey}:oracle-presentation`);
    const gameChallenge = choose(GAME_CHALLENGES, `${dateKey}:game-presentation`);
    const frameStyle = choose(FRAME_STYLES, `${dateKey}:frame-style`);
    const photoIndex = Math.floor(seededUnit(`${dateKey}:photo`) * photoCount) % photoCount;

    return immutable({
      version: 1,
      dateKey,
      seed: hashString(`naoking-kingdom:${dateKey}`),
      seasonId: seasonIdFor(dateKey),
      worldStateId: worldState.id,
      worldState,
      tideId: tide.id,
      tide,
      decreeId: decree.id,
      decree,
      relicId: relic.id,
      relic,
      photoIndex,
      motifId: motif.id,
      motif,
      errands: errandsFor(dateKey),
      hiddenClueId: `clue-${String((hashString(`${dateKey}:clue`) % 28) + 1).padStart(2, '0')}`,
      oraclePresentationModifierId: oraclePresentationModifier.id,
      oraclePresentationModifier,
      gameChallengeId: gameChallenge.id,
      frameStyleId: frameStyle.id,
      probabilityPolicy: PROBABILITY_POLICY
    });
  }

  function uniqueCapped(values, cap, validator) {
    if (!Array.isArray(values)) return [];
    const result = [];
    const seen = new Set();
    values.forEach(value => {
      if (!validator(value) || seen.has(value)) return;
      seen.add(value);
      result.push(value);
    });
    return result.slice(-cap);
  }

  function uniqueRecentCapped(values, cap, validator) {
    if (!Array.isArray(values)) return [];
    const result = [];
    const seen = new Set();
    for (let index = values.length - 1; index >= 0; index -= 1) {
      const value = values[index];
      if (!validator(value) || seen.has(value)) continue;
      seen.add(value);
      result.unshift(value);
    }
    return result.slice(-cap);
  }

  function safeId(value) {
    return typeof value === 'string' && SAFE_ID_PATTERN.test(value);
  }

  function validPhotoIndex(value) {
    return Number.isInteger(value) && value >= 0 && value < PHOTO_COUNT;
  }

  function boundedInteger(value, minimum, maximum, fallback) {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(minimum, Math.min(maximum, Math.trunc(value)));
  }

  function collectionValues(input, key) {
    const source = input && typeof input === 'object' ? input[key] : [];
    if (Array.isArray(source)) return source;
    if (source && typeof source === 'object') return Object.keys(source).filter(id => Boolean(source[id]));
    return [];
  }

  function normalizeStoredInput(input) {
    if (typeof input !== 'string') return input && typeof input === 'object' ? input : {};
    try {
      const parsed = JSON.parse(input);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function sanitizeProgression(input) {
    const source = normalizeStoredInput(input);
    const legacyVisits = source.visits && typeof source.visits === 'object' ? source.visits : {};
    const visitDays = uniqueCapped(
      Array.isArray(source.visitDays) ? source.visitDays : legacyVisits.days,
      CAPS.visitDays,
      isValidDateKey
    ).sort();
    const audienceStamps = uniqueCapped(
      Array.isArray(source.audienceStamps) ? source.audienceStamps : source.stamps,
      CAPS.audienceStamps,
      isValidDateKey
    ).sort();
    const visitedDistricts = uniqueCapped(
      Array.isArray(source.visitedDistricts) ? source.visitedDistricts : legacyVisits.districts,
      CAPS.visitedDistricts,
      id => Boolean(indexes.districts[id])
    );
    const rawCollections = source.collections && typeof source.collections === 'object' ? source.collections : {};
    const rawDaily = source.daily && typeof source.daily === 'object' ? source.daily : {};
    const rawSurprises = source.surprises && typeof source.surprises === 'object' ? source.surprises : {};
    const rawSettings = source.settings && typeof source.settings === 'object' ? source.settings : {};
    const favoriteSource = Array.isArray(source.favoritePhotoIds)
      ? source.favoritePhotoIds
      : source.favorites && Array.isArray(source.favorites.photos)
        ? source.favorites.photos
        : [];
    const firstSeenCandidate = isValidDateKey(source.firstSeen) ? source.firstSeen : visitDays[0] || null;
    const lastSeenCandidate = isValidDateKey(source.lastSeen) ? source.lastSeen : visitDays[visitDays.length - 1] || null;
    const firstSeen = firstSeenCandidate && lastSeenCandidate && firstSeenCandidate > lastSeenCandidate
      ? lastSeenCandidate
      : firstSeenCandidate;
    const lastSeen = firstSeenCandidate && lastSeenCandidate && firstSeenCandidate > lastSeenCandidate
      ? firstSeenCandidate
      : lastSeenCandidate;
    const dailyDateKey = isValidDateKey(rawDaily.dateKey)
      ? rawDaily.dateKey
      : isValidDateKey(rawDaily.date)
        ? rawDaily.date
        : null;
    const dailyErrands = dailyDateKey ? errandsFor(dailyDateKey) : [];
    const allowedDailyErrands = new Set(dailyErrands.map(item => item.id));
    const completedErrandIds = uniqueCapped(
      rawDaily.completedErrandIds || rawDaily.completed,
      CAPS.completedErrands,
      id => allowedDailyErrands.has(id)
    );
    const chosenErrandId = allowedDailyErrands.has(rawDaily.chosenErrandId || rawDaily.choice)
      ? rawDaily.chosenErrandId || rawDaily.choice
      : null;
    const lastShownAt = {};
    if (rawSurprises.lastShownAt && typeof rawSurprises.lastShownAt === 'object') {
      SURPRISES.forEach(item => {
        const timestamp = rawSurprises.lastShownAt[item.id];
        if (Number.isFinite(timestamp) && timestamp >= 0) lastShownAt[item.id] = Math.trunc(timestamp);
      });
    }

    return immutable({
      version: STORAGE_VERSION,
      firstSeen,
      lastSeen,
      totalVisits: boundedInteger(source.totalVisits ?? legacyVisits.total, 0, 1000000, visitDays.length),
      visitDays,
      audienceStamps,
      visitedDistricts,
      daily: {
        dateKey: dailyDateKey,
        completedErrandIds,
        chosenErrandId,
        acknowledged: rawDaily.acknowledged === true
      },
      collections: {
        relicIds: uniqueCapped(collectionValues(rawCollections, 'relicIds').concat(collectionValues(rawCollections, 'relics')), CAPS.collectionItems, id => Boolean(indexes.relics[id])),
        soundIds: uniqueCapped(collectionValues(rawCollections, 'soundIds').concat(collectionValues(rawCollections, 'sounds')), CAPS.collectionItems, safeId),
        creatureIds: uniqueCapped(collectionValues(rawCollections, 'creatureIds').concat(collectionValues(rawCollections, 'creatures')), CAPS.collectionItems, safeId),
        clueIds: uniqueCapped(collectionValues(rawCollections, 'clueIds').concat(collectionValues(rawCollections, 'clues')), CAPS.collectionItems, safeId)
      },
      discoveries: uniqueCapped(source.discoveries, CAPS.discoveries, safeId),
      favoritePhotoIds: uniqueCapped(favoriteSource, CAPS.favoritePhotos, validPhotoIndex),
      pinnedPhotoId: validPhotoIndex(source.pinnedPhotoId) ? source.pinnedPhotoId : null,
      surprises: {
        seenIds: uniqueCapped(rawSurprises.seenIds, CAPS.seenSurprises, id => Boolean(indexes.surprises[id])),
        recentIds: uniqueRecentCapped(rawSurprises.recentIds, CAPS.recentSurprises, id => Boolean(indexes.surprises[id])),
        lastShownAt,
        total: boundedInteger(rawSurprises.total, 0, 1000000, 0)
      },
      settings: {
        calmMode: rawSettings.calmMode === true,
        reminders: rawSettings.reminders === true
      }
    });
  }

  function createProgression(dateInput) {
    const dateKey = dateInput === undefined || dateInput === null ? null : toLocalDateKey(dateInput);
    return sanitizeProgression(dateKey ? { firstSeen: dateKey, lastSeen: dateKey, visitDays: [dateKey], totalVisits: 0 } : {});
  }

  function recordVisit(state, dateInput, districtId) {
    const current = sanitizeProgression(state);
    const dateKey = toLocalDateKey(dateInput);
    const visitDays = uniqueCapped([...current.visitDays, dateKey], CAPS.visitDays, isValidDateKey).sort();
    const visitedDistricts = indexes.districts[districtId]
      ? uniqueCapped([...current.visitedDistricts, districtId], CAPS.visitedDistricts, id => Boolean(indexes.districts[id]))
      : [...current.visitedDistricts];
    return sanitizeProgression({
      ...current,
      firstSeen: current.firstSeen || dateKey,
      lastSeen: dateKey,
      totalVisits: current.totalVisits + 1,
      visitDays,
      visitedDistricts
    });
  }

  function acknowledgeDay(state, dateInput) {
    const current = sanitizeProgression(state);
    const dateKey = toLocalDateKey(dateInput);
    const sameDay = current.daily.dateKey === dateKey;
    return sanitizeProgression({
      ...current,
      audienceStamps: [...current.audienceStamps, dateKey],
      daily: {
        dateKey,
        completedErrandIds: sameDay ? current.daily.completedErrandIds : [],
        chosenErrandId: sameDay ? current.daily.chosenErrandId : null,
        acknowledged: true
      }
    });
  }

  function completeErrand(state, dateInput, errandId) {
    const current = sanitizeProgression(state);
    const dateKey = toLocalDateKey(dateInput);
    const validIds = new Set(errandsFor(dateKey).map(item => item.id));
    if (!validIds.has(errandId)) return current;
    const previous = current.daily.dateKey === dateKey ? current.daily.completedErrandIds : [];
    return sanitizeProgression({
      ...current,
      daily: {
        dateKey,
        completedErrandIds: [...previous, errandId],
        chosenErrandId: errandId,
        acknowledged: current.daily.dateKey === dateKey && current.daily.acknowledged
      }
    });
  }

  function recordDiscovery(state, discoveryId, collectionType) {
    const current = sanitizeProgression(state);
    if (!safeId(discoveryId)) return current;
    const collections = { ...current.collections };
    if (collectionType && Object.prototype.hasOwnProperty.call(collections, collectionType)) {
      collections[collectionType] = [...collections[collectionType], discoveryId];
    }
    return sanitizeProgression({ ...current, discoveries: [...current.discoveries, discoveryId], collections });
  }

  function recordSurprise(state, surpriseId, timestamp) {
    const current = sanitizeProgression(state);
    if (!indexes.surprises[surpriseId]) return current;
    const at = Number.isFinite(timestamp) && timestamp >= 0 ? Math.trunc(timestamp) : 0;
    return sanitizeProgression({
      ...current,
      surprises: {
        seenIds: [...current.surprises.seenIds, surpriseId],
        recentIds: [...current.surprises.recentIds, surpriseId],
        lastShownAt: { ...current.surprises.lastShownAt, [surpriseId]: at },
        total: current.surprises.total + 1
      }
    });
  }

  function mergeLegacyPassport(state, passport) {
    const current = sanitizeProgression(state);
    const source = normalizeStoredInput(passport);
    const stamps = uniqueCapped(source.stamps, CAPS.audienceStamps, isValidDateKey);
    return sanitizeProgression({ ...current, audienceStamps: [...current.audienceStamps, ...stamps] });
  }

  function surpriseEligibility(surpriseOrId, runtime) {
    const item = typeof surpriseOrId === 'string' ? indexes.surprises[surpriseOrId] : surpriseOrId;
    if (!item || !indexes.surprises[item.id]) return immutable({ eligible: false, mode: 'skip', reasons: ['unknown-surprise'] });
    const state = runtime && typeof runtime === 'object' ? runtime : {};
    const reasons = [];
    const districtId = indexes.districts[state.districtId] ? state.districtId : 'home';
    const sessionCounts = state.sessionCounts && typeof state.sessionCounts === 'object' ? state.sessionCounts : {};
    const lastShownAt = state.lastShownAt && typeof state.lastShownAt === 'object' ? state.lastShownAt : {};
    const recentIds = Array.isArray(state.recentIds) ? state.recentIds : [];
    const now = Number.isFinite(state.now) ? state.now : 0;
    if (!item.eligibleDistricts.includes(districtId)) reasons.push('wrong-district');
    if (item.requiresVisible && state.documentHidden === true) reasons.push('document-hidden');
    if (item.avoidCriticalFlow && state.criticalFlowActive === true) reasons.push('critical-flow-active');
    if (item.avoidModal && state.modalOpen === true) reasons.push('modal-open');
    if ((sessionCounts[item.id] || 0) >= item.maxPerSession) reasons.push('session-cap');
    if (recentIds.includes(item.id)) reasons.push('recently-shown');
    if (Number.isFinite(lastShownAt[item.id]) && now > 0 && now - lastShownAt[item.id] < item.cooldownMs) reasons.push('cooldown');
    if (state.reducedMotion === true && item.reducedMotionFallback === 'skip') reasons.push('reduced-motion-skip');
    const mode = reasons.length
      ? 'skip'
      : state.reducedMotion === true
        ? 'reduced'
        : state.soundEnabled === false && item.sound !== 'silent'
          ? 'silent'
          : 'full';
    return immutable({ eligible: reasons.length === 0, mode, reasons });
  }

  function eligibleSurprises(runtime) {
    return immutable(SURPRISES
      .map(item => ({ item, eligibility: surpriseEligibility(item, runtime) }))
      .filter(entry => entry.eligibility.eligible)
      .map(entry => ({ ...entry.item, presentationMode: entry.eligibility.mode })));
  }

  function selectSurprise(runtime, entropy) {
    const candidates = eligibleSurprises(runtime);
    if (!candidates.length) return null;
    const state = runtime && typeof runtime === 'object' ? runtime : {};
    const seed = `${state.dateKey || 'session'}:${state.districtId || 'home'}:${state.sessionIndex || 0}:${entropy || ''}`;
    return weightedChoose(candidates, seed) || null;
  }

  const api = {
    STORAGE_KEY,
    STORAGE_VERSION,
    PHOTO_COUNT,
    CAPS,
    districts: DISTRICTS,
    tides: TIDES,
    decrees: DECREES,
    relics: RELICS,
    motifs: MOTIFS,
    worldStates: WORLD_STATES,
    errands: ERRANDS,
    surprises: SURPRISES,
    oraclePresentationModifiers: ORACLE_PRESENTATION_MODIFIERS,
    gameChallenges: GAME_CHALLENGES,
    frameStyles: FRAME_STYLES,
    probabilityPolicy: PROBABILITY_POLICY,
    indexes,
    isValidDateKey,
    toLocalDateKey,
    hashString,
    seededUnit,
    deterministicShuffle,
    seasonIdFor,
    errandsFor,
    getDailyContext: dailyContext,
    createProgression,
    sanitizeProgression,
    recordVisit,
    acknowledgeDay,
    completeErrand,
    recordDiscovery,
    recordSurprise,
    mergeLegacyPassport,
    getSurpriseEligibility: surpriseEligibility,
    getEligibleSurprises: eligibleSurprises,
    selectSurprise
  };

  return immutable(api);
});
