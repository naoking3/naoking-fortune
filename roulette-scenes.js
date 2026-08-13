/* Extra roulette scene controller: five win scenes and five loss scenes. */
(() => {
  const card = document.querySelector('#card');
  const slot = document.querySelector('#slot');
  const reel = document.querySelector('#reel');
  const name = document.querySelector('#fortune-name');
  const message = document.querySelector('#message');
  const status = document.querySelector('#roulette-status');
  const button = document.querySelector('#spin');
  if (!card || !slot || !reel || !name || !message || !status || !button) return;

  const faces = ['naoking-1.png','naoking-2.png','naoking-3.png','naoking-4.png','naoking-5.png','naoking-6.png','naoking-7.png','naoking-sleepy.png','naoking-panic.png','naoking-laugh.png'];
  const normalNames = ['海の支配者','背びれ絶好調','エサ発見','水槽の主','小魚メンタル','浅瀬で迷子','干からび寸前','深海ぼんやり','あわあわ警報','サメ笑い'];
  const normalLines = ['今日は少しだけ流れがある。使い切るな。','小さな勝ちを拾える日。落とすなよ。','まあ悪くない。贅沢を言うな。','運が迷子になっていない。珍事だ。','海流が少し味方している。浅瀬には行くな。','調子に乗ってもいい。ただし三分までだ。'];
  const wins = [
    {key:'rainbow', title:'虹色の支配者', line:'虹が海底まで届いた。今日は王の客人として扱ってやる。', fx:'RAINBOW JACKPOT'},
    {key:'crown', title:'王冠落下大当たり', line:'王冠が空から落ちてきた。避けなかったお前の勝ちだ。', fx:'CROWN DROP!'},
    {key:'revival', title:'逆転・王冠大当たり', line:'外れたと思った？ 甘いな。海底から逆転大当たりだ。', fx:'REVIVAL!!'},
    {key:'comet', title:'流星王国ボーナス', line:'海を横切る流星が、お前の運を撃ち抜いた。', fx:'ROYAL COMET'},
    {key:'abyss', title:'深海照射大当たり', line:'深海の光が選んだ。静かに強い大当たりだ。', fx:'ABYSS BEAM'}
  ];
  const losses = [
    {key:'dry', title:'干からびた横取り', line:'干からびたなおキングが画面外から来て、当たりを持っていった。悲しいな。', fx:'LUCK STOLEN'},
    {key:'blackout', title:'深海暗転ハズレ', line:'大当たりっぽい暗転からのハズレ。お前のドキドキを返せ。', fx:'DEEP BLACKOUT'},
    {key:'net', title:'網にかかった運', line:'巨大な網が画面外から来て、運をさらっていった。', fx:'NET FAILURE'},
    {key:'alarm', title:'緊急帰還', line:'赤い警報が鳴ったので、なおキングは判定を中止した。', fx:'RED ALERT'},
    {key:'drain', title:'水位低下', line:'水位と期待値が同時に下がった。悲しいな。', fx:'WATER DRAIN'}
  ];
  const tile = src => `<div class="shark-tile"><img class="shark-face" src="${src}" alt="なおキング"></div>`;
  const jackpotTile = () => tile('naoking-jackpot.png');
  const fx = document.createElement('div'); fx.className = 'roulette-fx'; card.append(fx);
  const prop = document.createElement('div'); prop.className = 'roulette-scene-prop'; prop.setAttribute('aria-hidden','true'); card.append(prop);
  const intruder = document.createElement('img'); intruder.className = 'dry-shark-intruder'; intruder.src = 'naoking-7.png'; intruder.alt = ''; card.append(intruder);
  const crowns = document.createElement('div'); crowns.className = 'crown-rain'; crowns.innerHTML = '<i>♛</i><i>♛</i><i>♛</i><i>♛</i><i>♛</i>'; card.append(crowns);
  const showFx = (kind,text,time=1650) => { fx.className=`roulette-fx is-visible ${kind}`; fx.textContent=text; setTimeout(()=>fx.className='roulette-fx',time); };
  const showProp = (kind,text,time=1600) => { prop.className=`roulette-scene-prop is-running ${kind}`; prop.textContent=text; setTimeout(()=>prop.className='roulette-scene-prop',time); };
  const pick = a => a[Math.floor(Math.random()*a.length)];
  let busy=false;

  button.addEventListener('click', event => {
    event.stopImmediatePropagation();
    if (busy) return;
    busy=true;
    card.className = card.className.replace(/\bis-(jackpot|rainbow|crown|revival|comet|abyss|dry|blackout|net|alarm|drain|failed|exploded)\b/g,'').trim();
    slot.classList.remove('is-jackpot','is-long-spin');
    const roll=Math.random();
    const loss = roll < .10 ? losses[Math.floor(roll/.02)] : null;
    const win = !loss && roll < .24 ? wins[Math.floor((roll-.10)/.028)] : null;
    const selected = Math.floor(Math.random()*faces.length);
    const duration = win?.key === 'revival' ? 2850 : (win || loss) ? 2150 : 1650;
    reel.innerHTML = faces.concat(faces,faces).map(tile).join('');
    slot.classList.add('is-spinning');
    button.textContent='なおキング採点中・連打厳禁…';
    status.textContent=win ? 'SPECIAL SIGNAL DETECTED' : loss ? 'UNSTABLE SEA CONDITIONS' : 'JUDGMENT SYSTEM / SPINNING';
    message.textContent=win ? '何か熱い気配がする……' : loss ? '海が妙にざわついている。' : 'なおキングが適当に判定している。';
    if (win?.key === 'comet') { card.classList.add('is-comet'); showProp('comet','✦'); }
    if (win?.key === 'abyss') { card.classList.add('is-abyss'); showProp('searchlight','◢'); }
    if (loss?.key === 'alarm') { card.classList.add('is-alarm'); showProp('alarm','!'); }
    if (loss?.key === 'drain') { card.classList.add('is-drain'); showProp('drain','↓'); }
    if (loss?.key === 'net') { card.classList.add('is-net'); showProp('net','╳'); }
    setTimeout(() => {
      slot.classList.remove('is-spinning');
      if (win?.key === 'revival') {
        card.classList.add('is-failed'); reel.innerHTML=tile('naoking-7.png'); name.textContent='干からび寸前'; message.textContent='……終了。まあ、そういう日もある。'; status.textContent='JUDGMENT FAILED // ...';
        setTimeout(() => finish(win,true),820); return;
      }
      if (loss?.key === 'blackout') {
        card.classList.add('is-blackout'); name.textContent='……！？'; message.textContent='画面が暗くなった。まさか、これは……'; status.textContent='DEEP BLACKOUT'; showFx('void','深海暗転');
        setTimeout(() => finish(loss,false),850); return;
      }
      finish(win || loss || null,Boolean(win),selected);
    },duration);
  },true);

  function finish(scene, isWin, normalIndex=0) {
    if (scene) {
      if (isWin) {
        card.classList.add('is-jackpot',`is-${scene.key}`); slot.classList.add('is-jackpot'); reel.innerHTML=jackpotTile();
        if(scene.key==='crown'){ crowns.classList.add('is-raining'); setTimeout(()=>crowns.classList.remove('is-raining'),1800); }
        if(scene.key==='revival') card.classList.remove('is-failed');
        showFx(scene.key,scene.fx,1900);
      } else {
        card.classList.add(`is-${scene.key}`);
        if(scene.key==='dry'){ intruder.classList.add('is-running'); setTimeout(()=>intruder.classList.remove('is-running'),1800); }
        reel.innerHTML=tile(scene.key==='dry'||scene.key==='drain'?'naoking-7.png':scene.key==='net'?'naoking-3.png':'naoking-6.png');
        showFx(scene.key,scene.fx,1700);
      }
      name.textContent=scene.title; message.textContent=scene.line; status.textContent=isWin?'SPECIAL JACKPOT CONFIRMED':'SPECIAL MISS CONFIRMED';
    } else {
      reel.innerHTML=tile(faces[normalIndex]); name.textContent=normalNames[normalIndex]; message.textContent=pick(normalLines); status.textContent='JUDGMENT COMPLETE // TRY AGAIN';
    }
    button.textContent='運命を回す'; busy=false;
  }
})();
