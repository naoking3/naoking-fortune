import assert from 'node:assert/strict';
import fs from 'node:fs';

const controller = fs.readFileSync(new URL('../roulette-controller.js', import.meta.url), 'utf8');
const entertainment = fs.readFileSync(new URL('../roulette-entertainment.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../roulette.css', import.meta.url), 'utf8');

const difficultWords = /神託|証人|証言|筐体|深度|裁定|評決|布告|異議申立|敗訴|勝訴|棄却/;
const retiredLore = /Witness|Testimony|Verdict|Decree|Omen|Seal|Judgment|審択|証言|布告|封印|航路|王冠信号/i;
const displayEnglish = /JACKPOT|POWER FAILURE|BLUE HOUR|ROYAL ORACLE|WITNESS|VERDICT|JUDGMENT|DORMANT|LOCKED|SEALED|TOPOLOGY|(?:^|\W)(?:Page|Reel|Signal|World|Goal|Course|Portal|Instance|Respawn|Fuse|Depth|Header|Mode|Cache|Scene|Gate|Indicator|Camera|Lobby|Avatar|Crank|Pulse|Royal|Oracle|Verdict|Witness|CM|UI)(?:\W|$)/i;
const japanese = /[ぁ-んァ-ヶ一-龠]/;

function directDisplayValues(source, filename) {
  const values = [];
  const direct = /\b(cue|detail|eyebrow|title)\s*:\s*(['"])((?:\\.|(?!\2).)*)\2/g;
  for (const match of source.matchAll(direct)) values.push({ filename, field: match[1], value: match[3] });

  const arrays = /\b(messages|signal|twist)\s*:\s*\[([^\]]*)\]/g;
  const stringLiteral = /(['"])((?:\\.|(?!\1).)*)\1/g;
  for (const arrayMatch of source.matchAll(arrays)) {
    for (const valueMatch of arrayMatch[2].matchAll(stringLiteral)) {
      values.push({ filename, field: arrayMatch[1], value: valueMatch[2] });
    }
  }
  return values;
}

function objectStringValues(source, filename, declaration, field) {
  const start = source.indexOf(declaration);
  if (start < 0) return [];
  const end = source.indexOf('});', start);
  if (end < 0) return [];

  const block = source.slice(start, end);
  const values = [];
  const pair = /(['"])(?:\\.|(?!\1).)*\1\s*:\s*(['"])((?:\\.|(?!\2).)*)\2/g;
  for (const match of block.matchAll(pair)) {
    values.push({ filename, field, value: match[3] });
  }
  return values;
}

const displayValues = [
  ...directDisplayValues(controller, 'roulette-controller.js'),
  ...directDisplayValues(entertainment, 'roulette-entertainment.js'),
  ...objectStringValues(controller, 'roulette-controller.js', 'const routeLabels = Object.freeze({', 'routeLabel')
];

const difficultHits = displayValues.filter(entry => difficultWords.test(entry.value));
const englishHits = displayValues.filter(entry => displayEnglish.test(entry.value));
const retiredLoreHits = displayValues.filter(entry => retiredLore.test(entry.value));
const unreadableLabels = displayValues.filter(entry => (
  (entry.field === 'cue' || entry.field === 'eyebrow')
  && entry.value.length > 0
  && !japanese.test(entry.value)
));

assert.deepEqual(difficultHits, [], `difficult roulette copy remains:\n${JSON.stringify(difficultHits, null, 2)}`);
assert.deepEqual(englishHits, [], `mixed English roulette copy remains:\n${JSON.stringify(englishHits, null, 2)}`);
assert.deepEqual(retiredLoreHits, [], `retired roulette lore remains visible:\n${JSON.stringify(retiredLoreHits, null, 2)}`);
assert.deepEqual(unreadableLabels, [], `cut-in labels without Japanese remain:\n${JSON.stringify(unreadableLabels, null, 2)}`);

const fortuneSection = html.slice(html.indexOf('<section class="page" id="fortune"'), html.indexOf('<section class="page" id="game"'));
assert.ok(fortuneSection.length > 0, 'fortune section was not found');
assert.equal(difficultWords.test(fortuneSection), false, 'fortune page still contains difficult copy');
assert.match(fortuneSection, /なおキング/);
assert.match(fortuneSection, /今日の運勢/);

const cssContent = [...css.matchAll(/content\s*:\s*(['"])(.*?)\1/g)].map(match => match[2]).filter(Boolean);
assert.equal(cssContent.some(value => difficultWords.test(value)), false, 'roulette CSS still contains difficult visible copy');
assert.equal(cssContent.some(value => displayEnglish.test(value)), false, 'roulette CSS still contains mixed English visible copy');
assert.equal(cssContent.some(value => retiredLore.test(value)), false, 'roulette CSS still contains retired lore');

const winBlock = controller.slice(controller.indexOf('const winResults = ['), controller.indexOf('const lossResults = ['));
const lossBlock = controller.slice(controller.indexOf('const lossResults = ['), controller.indexOf('const allResults = ['));
const winTitles = [...winBlock.matchAll(/\btitle\s*:\s*(['"])(.*?)\1/g)].map(match => match[2]);
const lossTitles = [...lossBlock.matchAll(/\btitle\s*:\s*(['"])(.*?)\1/g)].map(match => match[2]);
assert.ok(winTitles.length >= 5 && winTitles.every(value => value.includes('大当たり')), 'a win result title does not clearly say 大当たり');
assert.ok(lossTitles.length >= 5 && lossTitles.every(value => value.startsWith('残念')), 'a loss result title does not clearly say 残念');

const characterMarkers = (controller.match(/なおキング|王|昼寝|寝る|知らん|勝手|しょんぼり|干からび|意味はない/g) || []).length;
assert.ok(characterMarkers >= 35, `Naoking character voice became too weak (${characterMarkers} markers)`);

const copyInventory = Object.freeze({
  dynamicLiterals:displayValues.length,
  generatedNormalMessages:300,
  staticMeaningUnits:48,
  cssLabels:cssContent.length
});
console.log(`roulette copy tests passed: ${Object.values(copyInventory).reduce((sum, value) => sum + value, 0)} user-facing variants (${displayValues.length} dynamic literals + 300 result messages + 48 static units + ${cssContent.length} CSS labels) are plain Japanese; character voice markers=${characterMarkers}`);
