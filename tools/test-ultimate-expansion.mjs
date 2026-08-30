import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDir, '..');
const expansionPath = path.join(root, 'roulette-entertainment.js');
const controllerPath = path.join(root, 'roulette-controller.js');
const researchPath = path.join(root, 'ROYAL-ORACLE-ULTIMATE-RESEARCH.md');

const expansionSource = fs.readFileSync(expansionPath, 'utf8');
const controllerSource = fs.readFileSync(controllerPath, 'utf8');
const researchSource = fs.readFileSync(researchPath, 'utf8');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(expansionSource, sandbox, { filename: expansionPath });

const expansion = sandbox.window.NaokingOracleExpansion;
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

check(Boolean(expansion), 'roulette-entertainment.js did not expose window.NaokingOracleExpansion');
check(Object.isFrozen(expansion), 'expansion root is not frozen');

const expectedRouteIds = [
  'small-fish-school',
  'royal-fish-school',
  'golden-fish-school',
  'abyss-fish-school',
  'naoking-school-overload',
  'seventh-witness-unregistered',
  'witness-evacuation',
  'accordion-oracle',
  'naoking-race',
  'royal-school-dash',
  'realistic-deep-dive',
  'portal-panic',
  'machine-power-cycle',
  'oracle-ui-collapse',
  'golden-ocean-jackpot',
  'fish-celebration-jackpot',
  'abyss-dawn-jackpot',
  'naoking-overload-jackpot'
];

const routes = expansion?.routes || [];
const routeIds = routes.map(route => route.id);
check(routes.length === 18, 'expansion route count was ' + routes.length + '; expected 18');
check(new Set(routeIds).size === routes.length, 'expansion route ids are not unique');
check(JSON.stringify(routeIds) === JSON.stringify(expectedRouteIds), 'expansion route id/order contract changed');

const effectiveReelCounts = routes.map(route => Number(route.reelCount ?? 5));
check(effectiveReelCounts.every(count => Number.isInteger(count) && count >= 4 && count <= 8), 'an effective reel count fell outside 4–8');
check(Math.min(...effectiveReelCounts) === 4, 'minimum effective reel count was not 4');
check(Math.max(...effectiveReelCounts) === 8, 'maximum effective reel count was not 8');
for (let count = 4; count <= 8; count += 1) {
  check(effectiveReelCounts.includes(count), 'effective reel count ' + count + ' is not represented');
}

const expectedFishFamilies = ['abyss', 'golden', 'naoking', 'royal', 'small'];
const fishFamilies = [...new Set(routes.map(route => route.fishSchool).filter(Boolean))].sort();
check(JSON.stringify(fishFamilies) === JSON.stringify(expectedFishFamilies), 'fish families were ' + fishFamilies.join(', ') + '; expected five selected families');

const grammarKeys = Object.keys(expansion?.reelGrammars || {});
check(grammarKeys.length === 13, 'declarative reel grammar count was ' + grammarKeys.length + '; expected 13');
const requiredGrammarPhases = ['descent', 'cruise', 'signal', 'anomaly', 'judgment', 'stopping'];
for (const [key, grammar] of Object.entries(expansion?.reelGrammars || {})) {
  check(Object.isFrozen(grammar), 'reel grammar ' + key + ' is not frozen');
  for (const phase of requiredGrammarPhases) {
    check(typeof grammar[phase] === 'string' && grammar[phase].length > 0, 'reel grammar ' + key + ' is missing phase ' + phase);
  }
}

for (const route of routes) {
  check(Object.isFrozen(route), 'route ' + route.id + ' is not frozen');
  check(typeof route.audioScene === 'string' && route.audioScene.length > 0, 'route ' + route.id + ' has no audioScene');
  check(typeof route.reelGrammar === 'string' && route.reelGrammar.length > 0, 'route ' + route.id + ' has no reelGrammar');
  check(Boolean(expansion.reelGrammars[route.reelGrammar]), 'route ' + route.id + ' references unknown reel grammar ' + route.reelGrammar);
  if (route.scene) check(Boolean(expansion.scenes[route.scene]), 'route ' + route.id + ' references unknown scene ' + route.scene);
}

const sceneRoutes = routes.filter(route => route.scene);
check(sceneRoutes.length === 13, 'named scene route count was ' + sceneRoutes.length + '; expected 13');
check(Object.keys(expansion?.scenes || {}).length === 13, 'scene definition count was not 13');
check(new Set(routes.map(route => route.audioScene)).size === 11, 'unique route audio-scene key count was not 11');

const outcomeSet = ['normal', 'win', 'loss', 'revival'];
const fullEventIds = ['naoking-race', 'royal-school-dash', 'realistic-deep-dive', 'portal-panic'];
const fullEvents = routes.filter(route => route.family === 'full-event');
check(JSON.stringify(fullEvents.map(route => route.id)) === JSON.stringify(fullEventIds), 'new full-event set changed');
for (const id of fullEventIds) {
  const route = routes.find(candidate => candidate.id === id);
  const endings = expansion.endings[id];
  check(Boolean(route?.scene), id + ' has no full scene');
  check(route?.category === 'full-event', id + ' is not categorized as full-event');
  check(route?.revivalCompatible === true, id + ' is not revival compatible');
  for (const outcome of outcomeSet) {
    check(Array.isArray(endings?.[outcome]), id + ' is missing ' + outcome + ' endings');
    check((endings?.[outcome]?.length || 0) >= 3, id + ' has fewer than three ' + outcome + ' ending variants');
  }
}

for (const id of ['machine-power-cycle', 'oracle-ui-collapse']) {
  const endings = expansion.endings[id];
  for (const outcome of outcomeSet) {
    check((endings?.[outcome]?.length || 0) >= 2, id + ' has fewer than two ' + outcome + ' ending variants');
  }
}

const premiumIds = [
  'golden-ocean-jackpot',
  'fish-celebration-jackpot',
  'abyss-dawn-jackpot',
  'naoking-overload-jackpot'
];
for (const id of premiumIds) {
  const route = routes.find(candidate => candidate.id === id);
  check(route?.premium === true, id + ' is missing its premium flag');
  check(JSON.stringify(route?.kinds) === JSON.stringify(['win']), id + ' is not win-only');
  check((expansion.endings[id]?.win?.length || 0) >= 3, id + ' has fewer than three premium endings');
}

check(Object.keys(expansion?.endings || {}).length === 10, 'named ending-tree count was not 10');
check(expansion?.research?.eventIdeas === 60, 'expansion research.eventIdeas was not 60');
check(expansion?.research?.siteWideIdeas === 26, 'expansion research.siteWideIdeas was not 26');
check(expansion?.research?.fishSchoolConcepts === 15, 'expansion research.fishSchoolConcepts was not 15');
check(expansion?.research?.animationGrammars === 20, 'expansion research.animationGrammars was not 20');

check(/const expansion = window\.NaokingOracleExpansion/.test(controllerSource), 'controller does not read the expansion');
check(/\.\.\.\(expansion\.routes \|\| \[\]\)/.test(controllerSource), 'controller does not merge expansion routes');
check(/\.\.\.\(expansion\.endings \|\| \{\}\)/.test(controllerSource), 'controller does not merge expansion endings');
check(/\.\.\.\(expansion\.scenes \|\| \{\}\)/.test(controllerSource), 'controller does not merge expansion scenes');
check(/const reelGrammars = expansion\.reelGrammars/.test(controllerSource), 'controller does not consume expansion reel grammars');
check(/const MIN_REEL_TILE_COUNT = 4/.test(controllerSource), 'controller minimum reel clamp is not 4');
check(/const MAX_REEL_TILE_COUNT = 8/.test(controllerSource), 'controller maximum reel clamp is not 8');
check(/function resolveFinalResult\(\)[\s\S]*?return Object\.freeze\(\{/.test(controllerSource), 'controller final result is not statically frozen');

const resolveAt = controllerSource.indexOf('const result = resolveFinalResult();');
const presentationAt = controllerSource.indexOf('const presentation = choosePresentation(result', resolveAt);
check(resolveAt >= 0 && presentationAt > resolveAt, 'controller does not resolve/freeze result before presentation selection');
check(controllerSource.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"), 'controller has no reduced-motion query');
check(controllerSource.includes("'visibilitychange'"), 'controller has no visibilitychange handling');
check(controllerSource.includes("'pagehide'"), 'controller has no pagehide cleanup');
check(controllerSource.includes('clearScheduledTasks()'), 'controller has no scheduled-task cleanup');

function verifyNumberedRows(prefix, expectedCount) {
  const pattern = new RegExp('^\\| ' + prefix + '-(\\d{2}) \\|', 'gm');
  const numbers = [...researchSource.matchAll(pattern)].map(match => Number(match[1]));
  check(numbers.length === expectedCount, prefix + ' row count was ' + numbers.length + '; expected ' + expectedCount);
  check(new Set(numbers).size === expectedCount, prefix + ' rows contain duplicate ids');
  for (let number = 1; number <= expectedCount; number += 1) {
    check(numbers.includes(number), prefix + '-' + String(number).padStart(2, '0') + ' is missing');
  }
}

verifyNumberedRows('EVT', 60);
verifyNumberedRows('SITE', 26);
verifyNumberedRows('FISH', 15);
verifyNumberedRows('REEL', 20);
verifyNumberedRows('IMPL', 18);

for (const id of expectedRouteIds) {
  check(researchSource.includes('| ' + id + ' |'), 'research implementation map is missing route ' + id);
}

const requiredReferences = [
  'https://p-town.dmm.com/specials/2183',
  'https://patents.google.com/patent/JP7200176B2/ja',
  'https://patents.google.com/patent/JP2014147688A/ja',
  'https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-7-generation-of-random-outcomes',
  'https://www.w3.org/WAI/WCAG21/Techniques/css/C39.html',
  'https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API'
];
for (const url of requiredReferences) {
  check(researchSource.includes(url), 'research memo is missing required reference ' + url);
}

if (failures.length > 0) {
  console.error('ULTIMATE expansion contract: FAIL');
  for (const failure of failures) console.error('- ' + failure);
  process.exitCode = 1;
} else {
  console.log('ULTIMATE expansion contract: PASS');
  console.log('routes=18; fishFamilies=5; reelRange=4-8; scenes=13; endingTrees=10; reelGrammars=13; audioScenes=11');
  console.log('research=60 events / 26 site-wide / 15 fish-school / 20 reel-grammar; implementationMap=18');
}
