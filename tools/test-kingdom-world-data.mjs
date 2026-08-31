import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const sourceUrl = new URL('../kingdom-world-data.js', import.meta.url);
const source = await readFile(sourceUrl, 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'kingdom-world-data.js' });

assert.equal(typeof sandbox.NaokingWorldDataFactory, 'function', 'VM-accessible factory must exist');
assert.ok(sandbox.NaokingWorldData, 'browser global API must exist');
assert.equal(
  Object.getOwnPropertyDescriptor(sandbox, 'NaokingWorldData').writable,
  false,
  'browser global must not be writable'
);

const world = sandbox.NaokingWorldDataFactory();
const compact = value => JSON.parse(JSON.stringify(value));
const dateKeyAt = offset => new Date(Date.UTC(2024, 0, 1 + offset)).toISOString().slice(0, 10);

assert.ok(Object.isFrozen(world), 'API must be immutable');
assert.ok(Object.isFrozen(world.worldStates), 'catalogs must be immutable');
assert.ok(Object.isFrozen(world.worldStates[0]), 'catalog records must be immutable');
assert.equal(world.STORAGE_KEY, 'naokingKingdomWorldV1');
assert.equal(world.STORAGE_VERSION, 1);
assert.equal(world.PHOTO_COUNT, 26);

assert.equal(world.districts.length, 9, 'nine district identities are required');
assert.ok(world.worldStates.length >= 8, 'at least eight daily world states are required');
assert.ok(world.surprises.length >= 15, 'surprise catalog must be broad enough for rotation');
assert.ok(new Set(world.surprises.map(item => item.category)).size >= 5, 'surprises need multiple categories');

const everyIdUnique = (items, label) => {
  assert.equal(new Set(items.map(item => item.id)).size, items.length, `${label} IDs must be unique`);
  items.forEach(item => assert.match(item.id, /^[a-z0-9][a-z0-9-]{0,63}$/, `${label} ID must be safe`));
};

[
  [world.districts, 'district'],
  [world.tides, 'tide'],
  [world.decrees, 'decree'],
  [world.relics, 'relic'],
  [world.motifs, 'motif'],
  [world.worldStates, 'world state'],
  [world.errands, 'errand'],
  [world.surprises, 'surprise']
].forEach(([items, label]) => everyIdUnique(items, label));

const reachableCompletionEvents = new Set([
  'gallery:view', 'record:daily-still', 'discovery:daily-visitor', 'oracle:result',
  'game:bubbles-3', 'game:run', 'workshop:frame-preview', 'workshop:safety-note',
  'gallery:favorite', 'daily:stamp', 'bureau:read', 'home:quiet-visit'
]);
world.errands.forEach(errand => assert.ok(
  reachableCompletionEvents.has(errand.completionEvent),
  `${errand.id} references unreachable completion event ${errand.completionEvent}`
));

world.worldStates.forEach(state => {
  assert.ok(state.tidePool.length > 0, `${state.id} needs a tide pool`);
  state.tidePool.forEach(id => assert.ok(world.indexes.tides[id], `${state.id} references missing tide ${id}`));
});
world.relics.forEach(relic => assert.ok(world.indexes.motifs[relic.motifId], `${relic.id} references missing motif`));
world.surprises.forEach(item => {
  assert.equal(item.blocksInput, false, `${item.id} must not block input`);
  assert.ok(item.maxPerSession > 0, `${item.id} needs a session cap`);
  item.eligibleDistricts.forEach(id => assert.ok(world.indexes.districts[id], `${item.id} references missing district ${id}`));
});

assert.equal(world.isValidDateKey('2024-02-29'), true);
assert.equal(world.isValidDateKey('2023-02-29'), false);
assert.equal(world.isValidDateKey('2024-13-01'), false);
assert.equal(world.toLocalDateKey('2026-08-31'), '2026-08-31');
assert.throws(() => world.toLocalDateKey('31-08-2026'), /Invalid local date key/);
assert.equal(world.hashString('2026-08-31'), world.hashString('2026-08-31'));
assert.notEqual(world.hashString('2026-08-31'), world.hashString('2026-09-01'));

const sameDayA = world.getDailyContext('2026-08-31');
const sameDayB = world.getDailyContext('2026-08-31');
assert.deepEqual(compact(sameDayA), compact(sameDayB), 'same local day must be exactly deterministic');
assert.ok(Object.isFrozen(sameDayA));
assert.ok(Object.isFrozen(sameDayA.errands));
assert.equal(sameDayA.errands.length, 3);
assert.equal(new Set(sameDayA.errands.map(item => item.id)).size, 3);
assert.equal(new Set(sameDayA.errands.map(item => item.group)).size, 3, 'daily errands must span distinct gentle activity groups');
assert.ok(sameDayA.photoIndex >= 0 && sameDayA.photoIndex < 26);
assert.equal(world.getDailyContext('2026-08-31', { photoCount: 7 }).photoIndex < 7, true);
assert.equal(sameDayA.decree.id, sameDayA.decreeId);
assert.equal(sameDayA.tide.id, sameDayA.tideId);
assert.equal(sameDayA.relic.id, sameDayA.relicId);
assert.equal(sameDayA.motif.id, sameDayA.motifId);
assert.equal(sameDayA.worldState.id, sameDayA.worldStateId);
assert.equal(sameDayA.oraclePresentationModifier.presentationOnly, true);

const sampleDays = 1095;
const distributions = {
  worldStates: new Map(),
  tides: new Map(),
  decrees: new Map(),
  relics: new Map(),
  photos: new Map(),
  errands: new Map()
};
const bump = (map, key) => map.set(key, (map.get(key) || 0) + 1);
const probabilityBaseline = JSON.stringify(compact(world.probabilityPolicy));

for (let offset = 0; offset < sampleDays; offset += 1) {
  const context = world.getDailyContext(dateKeyAt(offset));
  bump(distributions.worldStates, context.worldStateId);
  bump(distributions.tides, context.tideId);
  bump(distributions.decrees, context.decreeId);
  bump(distributions.relics, context.relicId);
  bump(distributions.photos, context.photoIndex);
  context.errands.forEach(item => bump(distributions.errands, item.id));

  assert.equal(context.errands.length, 3);
  assert.equal(new Set(context.errands.map(item => item.id)).size, 3);
  assert.equal(JSON.stringify(compact(context.probabilityPolicy)), probabilityBaseline, 'daily state must never alter special-result scales');
  assert.equal(context.probabilityPolicy.oracleSpecialWinScale, 1);
  assert.equal(context.probabilityPolicy.oracleSpecialLoseScale, 1);
  assert.equal(context.probabilityPolicy.oracleRevivalScale, 1);
}

assert.equal(distributions.worldStates.size, world.worldStates.length, 'all world states should appear over three years');
assert.ok(distributions.tides.size >= 8, 'tide rotation should stay diverse');
assert.equal(distributions.decrees.size, world.decrees.length, 'all decrees should appear');
assert.equal(distributions.relics.size, world.relics.length, 'all relics should appear');
assert.equal(distributions.photos.size, 26, 'all 26 photo indexes should appear');
assert.equal(distributions.errands.size, world.errands.length, 'all gentle errands should appear');

const stateCounts = [...distributions.worldStates.values()];
assert.ok(Math.max(...stateCounts) / sampleDays < 0.18, 'no world state should dominate the calendar');
assert.ok(Math.min(...stateCounts) / sampleDays > 0.045, 'even the rarest world state should remain discoverable');

const manyDates = Array.from({ length: 260 }, (_, index) => dateKeyAt(index));
const dirty = {
  version: 999,
  firstSeen: 'not-a-date',
  lastSeen: '2024-05-02',
  totalVisits: Infinity,
  visitDays: [...manyDates, 'bad', '2024-01-01'],
  audienceStamps: [...manyDates, 'bad'],
  visitedDistricts: ['home', 'evil', 'oracle', 'home'],
  daily: {
    dateKey: '2026-08-31',
    completedErrandIds: [sameDayA.errands[0].id, 'foreign-errand'],
    chosenErrandId: 'foreign-errand',
    acknowledged: 'yes'
  },
  collections: {
    relicIds: ['blue-glass', 'not-a-relic'],
    soundIds: ['gate-tone', '<script>'],
    creatureIds: { 'moon-jelly': true, '../bad': true },
    clues: { 'clue-01': true, 'clue-02': false }
  },
  discoveries: ['royal-crossing', 'bad id', 'royal-crossing'],
  favoritePhotoIds: [0, 25, 26, -1, 0, '3'],
  pinnedPhotoId: 99,
  surprises: {
    seenIds: ['royal-crossing', 'not-real'],
    recentIds: ['royal-crossing', 'giant-shadow', 'royal-crossing'],
    lastShownAt: { 'royal-crossing': 1234, 'not-real': 9999 },
    total: -7
  },
  settings: { calmMode: true, reminders: 'yes' },
  streak: 999,
  missedDays: 42,
  penalty: true
};

const clean = world.sanitizeProgression(dirty);
assert.ok(Object.isFrozen(clean));
assert.equal(clean.version, 1);
assert.equal(clean.visitDays.length, world.CAPS.visitDays);
assert.equal(clean.audienceStamps.length, world.CAPS.audienceStamps);
assert.deepEqual(compact(clean.visitedDistricts), ['home', 'oracle']);
assert.equal(clean.daily.completedErrandIds.length, 1);
assert.equal(clean.daily.chosenErrandId, null);
assert.equal(clean.daily.acknowledged, false);
assert.deepEqual(compact(clean.collections.relicIds), ['blue-glass']);
assert.deepEqual(compact(clean.collections.soundIds), ['gate-tone']);
assert.deepEqual(compact(clean.collections.creatureIds), ['moon-jelly']);
assert.deepEqual(compact(clean.collections.clueIds), ['clue-01']);
assert.deepEqual(compact(clean.favoritePhotoIds), [0, 25]);
assert.equal(clean.pinnedPhotoId, null);
assert.deepEqual(compact(clean.surprises.seenIds), ['royal-crossing']);
assert.deepEqual(compact(clean.surprises.recentIds), ['giant-shadow', 'royal-crossing']);
assert.deepEqual(compact(clean.surprises.lastShownAt), { 'royal-crossing': 1234 });
assert.equal(clean.surprises.total, 0);
assert.equal(clean.settings.calmMode, true);
assert.equal(clean.settings.reminders, false);
assert.equal('streak' in clean, false, 'punitive streak fields must be discarded');
assert.equal('missedDays' in clean, false);
assert.equal('penalty' in clean, false);

const repaired = world.sanitizeProgression('{ definitely not json');
assert.deepEqual(compact(repaired), compact(world.createProgression()), 'invalid JSON should safely reset only this model');

let progression = world.createProgression('2026-08-31');
assert.equal(progression.totalVisits, 0, 'fresh progression should not count a visit before recordVisit runs');
progression = world.recordVisit(progression, '2026-08-31', 'home');
assert.equal(progression.totalVisits, 1);
progression = world.recordVisit(progression, '2026-09-02', 'oracle');
assert.equal(progression.totalVisits, 2);
assert.deepEqual(compact(progression.visitDays), ['2026-08-31', '2026-09-02']);
assert.deepEqual(compact(progression.visitedDistricts), ['home', 'oracle']);
assert.equal(progression.firstSeen, '2026-08-31');
assert.equal(progression.lastSeen, '2026-09-02');
assert.equal('streak' in progression, false, 'missing a day must not create a penalty or broken streak');

progression = world.acknowledgeDay(progression, '2026-09-02');
assert.deepEqual(compact(progression.audienceStamps), ['2026-09-02']);
assert.equal(progression.daily.acknowledged, true);
const todaysErrand = world.errandsFor('2026-09-02')[0];
progression = world.completeErrand(progression, '2026-09-02', todaysErrand.id);
assert.deepEqual(compact(progression.daily.completedErrandIds), [todaysErrand.id]);
progression = world.completeErrand(progression, '2026-09-02', 'not-today');
assert.deepEqual(compact(progression.daily.completedErrandIds), [todaysErrand.id]);

const completedBeforeStamp = world.completeErrand(
  world.createProgression('2026-10-03'),
  '2026-10-03',
  world.errandsFor('2026-10-03')[0].id
);
const stampedAfterCompletion = world.acknowledgeDay(completedBeforeStamp, '2026-10-03');
assert.deepEqual(
  compact(stampedAfterCompletion.daily.completedErrandIds),
  compact(completedBeforeStamp.daily.completedErrandIds),
  'receiving a same-day audience stamp must not erase completed errands'
);
assert.equal(stampedAfterCompletion.daily.chosenErrandId, completedBeforeStamp.daily.chosenErrandId);
assert.equal(stampedAfterCompletion.daily.acknowledged, true);

progression = world.recordDiscovery(progression, 'moon-jelly', 'creatureIds');
assert.ok(progression.discoveries.includes('moon-jelly'));
assert.ok(progression.collections.creatureIds.includes('moon-jelly'));
progression = world.recordSurprise(progression, 'royal-crossing', 5000);
assert.ok(progression.surprises.seenIds.includes('royal-crossing'));
assert.equal(progression.surprises.lastShownAt['royal-crossing'], 5000);

const legacy = world.mergeLegacyPassport(progression, { stamps: ['2026-08-30', 'invalid', '2026-08-30'] });
assert.ok(legacy.audienceStamps.includes('2026-08-30'));
assert.ok(legacy.audienceStamps.includes('2026-09-02'));

const fullEligibility = world.getSurpriseEligibility('royal-crossing', {
  districtId: 'home',
  documentHidden: false,
  criticalFlowActive: false,
  modalOpen: false,
  reducedMotion: false,
  soundEnabled: true,
  sessionCounts: {},
  recentIds: [],
  lastShownAt: {},
  now: 100000
});
assert.deepEqual(compact(fullEligibility), { eligible: true, mode: 'full', reasons: [] });

const reducedEligibility = world.getSurpriseEligibility('royal-crossing', {
  districtId: 'home',
  reducedMotion: true,
  sessionCounts: {},
  recentIds: [],
  lastShownAt: {}
});
assert.equal(reducedEligibility.eligible, true);
assert.equal(reducedEligibility.mode, 'reduced');

const skippedForSafety = world.getSurpriseEligibility('wrong-door', {
  districtId: 'home',
  documentHidden: true,
  criticalFlowActive: true,
  modalOpen: true,
  reducedMotion: true,
  sessionCounts: { 'wrong-door': 1 },
  recentIds: ['wrong-door'],
  lastShownAt: { 'wrong-door': 90000 },
  now: 100000
});
assert.equal(skippedForSafety.eligible, false);
assert.equal(skippedForSafety.mode, 'skip');
assert.ok(skippedForSafety.reasons.includes('document-hidden'));
assert.ok(skippedForSafety.reasons.includes('critical-flow-active'));
assert.ok(skippedForSafety.reasons.includes('modal-open'));
assert.ok(skippedForSafety.reasons.includes('session-cap'));
assert.ok(skippedForSafety.reasons.includes('recently-shown'));
assert.ok(skippedForSafety.reasons.includes('cooldown'));
assert.ok(skippedForSafety.reasons.includes('reduced-motion-skip'));

const eligible = world.getEligibleSurprises({ districtId: 'gallery', soundEnabled: false });
assert.ok(eligible.length > 0);
assert.ok(eligible.every(item => item.eligibleDistricts.includes('gallery')));
assert.ok(eligible.every(item => item.presentationMode === 'silent' || item.sound === 'silent'));
assert.equal(world.selectSurprise({ districtId: 'game', dateKey: '2026-08-31' }, 'test')?.blocksInput, false);
assert.equal(world.selectSurprise({ districtId: 'oracle', dateKey: '2026-08-31' }, 'test'), null, 'districts without safe surprises should get no event');

const summary = {
  sampleDays,
  districts: world.districts.length,
  worldStates: Object.fromEntries([...distributions.worldStates].sort()),
  tidesSeen: distributions.tides.size,
  decreesSeen: distributions.decrees.size,
  relicsSeen: distributions.relics.size,
  photosSeen: distributions.photos.size,
  errandsSeen: distributions.errands.size,
  surprises: world.surprises.length,
  surpriseCategories: [...new Set(world.surprises.map(item => item.category))].sort(),
  storageCaps: compact(world.CAPS),
  probabilityPolicy: compact(world.probabilityPolicy)
};

console.log('Kingdom world data checks passed.');
console.log(JSON.stringify(summary, null, 2));
