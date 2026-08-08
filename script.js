const fortunes=[
  {name:'海の支配者',face:1,lines:['今日はお前がルールだ。まあ、水槽の中だけだけどな。','調子に乗れ。珍しく、お前に追い風が吹いてる。']},
  {name:'背びれ絶好調',face:2,lines:['背びれが立ってる。お前のやる気も、それくらい見せろ。','今日は少しだけイケてる。勘違いは明日からにしろ。']},
  {name:'エサ発見',face:3,lines:['欲しいものが見つかる。取り逃がすな、遅そうだから。','目の前にチャンス。口を開けて待つだけはやめろ。']},
  {name:'水槽の主',face:4,lines:['悪くない日。お前も一応、主役っぽく見える。','平和な一日。余計なことをしなければな。']},
  {name:'小魚メンタル',face:5,lines:['気にしすぎ。誰もお前のことそんなに見てない。','弱気でも行ける。小魚なりの機動力を見せろ。']},
  {name:'浅瀬で迷子',face:6,lines:['方向感覚がない日。地図を見るという進化をしろ。','迷ってるうちに日が暮れるぞ。まあ、いつものことか。']},
  {name:'干からび寸前',face:7,lines:['今日は無理するな。干物になる前に休め。','頑張るより、寝ろ。反論は受け付けない。']}
];

const extraLines={
  '海の支配者':['今日は勝てる。しれっと勝て。','エサに困らない日。人間関係は知らん。','偉そうにしていい日。たぶん誰も止めない。','王様気分で泳げ。周囲がついてくるかは別。','運が味方してる。雑に使うなよ。','なぜか話が通る日。奇跡かもしれない。','お前のターンだ。長居はするな。','今日はヒレが光って見える。気のせいでもいい。'],
  '背びれ絶好調':['小さな勝ちを拾える。落とすなよ。','まあまあ調子いい。欲張ると浅瀬に乗り上げるぞ。','勢いだけはある。壁にぶつかる前に泳げ。','背びれの角度がいい。理由はない。','急に自信が出る日。明日には戻る。','できることからやれ。今日は意外と進む。','周囲の評価が少し甘い。今のうちだ。','気分で突破できる日。理屈は後からつけろ。'],
  'エサ発見':['今日は腹が減ってるくらいがちょうどいい。','小さなご褒美がある。大騒ぎするほどではない。','食いつきどころを間違えるな。何でも噛むな。','チャンスは近い。お前が気づけるかは別。','欲しいものを一個だけ狙え。乱獲するな。','目の前の話に乗れ。たぶんエサだ。','拾える運はある。拾う動作をしろ。','今日の獲物は小さめ。でもゼロよりまし。'],
  '水槽の主':['いつもの場所で輝け。外海に出る勇気はまだ要らん。','居場所があるって、地味にすごい。感謝しとけ。','今日は水槽の中心。照明は当たってないけど。','平常運転で勝てる。余計な演出はいらない。','慣れた場所に答えがある。珍しいな。','お前の縄張りは守られている。狭いけど。','誰かに頼られるかも。逃げるなよ。','安定している日。退屈だと思うなら贅沢だ。'],
  '小魚メンタル':['その一言、たぶん深い意味ない。深海まで潜るな。','今日は静かにしてろ。無駄にヒレを広げるな。','不安のほとんどは想像。残りは寝不足。','気まずさは三秒で忘れられる。お前以外には。','小さく泳げ。今日はそれでいい。','反省会を始めるな。まだ何も終わってない。','怖くても進め。小魚にも進行方向はある。','気にしてるの、お前だけかもしれないぞ。'],
  '浅瀬で迷子':['あれこれ始めるな。一個だけ終わらせろ。','今日は寄り道が多い。目的地は遠い。','助けを呼べ。サメでも迷子になる。お前だけじゃない。','地図は見ろ。直感だけで泳ぐな。','予定を一個捨てろ。溺れるよりまし。','迷ったら止まれ。さらに進むとただの遭難。','たぶん大丈夫。たぶん、という程度には。','目的地を忘れたなら、いったん帰れ。'],
  '干からび寸前':['運勢は低空飛行。お前のせいではなく、たぶん潮のせい。','やる気が砂浜に置いてきぼり。回収は明日でいい。','今日は生存で合格。以上。','水分を取れ。まず話はそれからだ。','休むのも予定に入れろ。お前は機械じゃない。','失敗しても今日は許される。期待されてないから。','無理をすると干物になる。干物はしゃべれない。','早めに撤退しろ。英雄ごっこは別の日にやれ。']
};
fortunes.forEach(f=>f.lines.push(...extraLines[f.name]));

const pages=[...document.querySelectorAll('.page')];
const navLinks=[...document.querySelectorAll('[data-tab]')];
const nav=document.querySelector('#site-nav');
const menuButton=document.querySelector('#menu-button');
function openTab(name){
  if(name!=="game")gameStop();
  if(name!=="fortune"&&locked)canReset=true;
  if(name==="fortune"&&locked&&canReset){
    locked=false;canReset=false;blast.hidden=true;card.classList.remove('is-exploded');taps=[];
    reel.innerHTML=tile(fortunes[0]);nameEl.textContent='海の支配者';message.textContent='ボタンを押せ。なおキングが、あなたの都合を見ずに今日の運勢を決める。';button.textContent='運命を回す';
  }
  pages.forEach(page=>page.classList.toggle('is-active',page.id===name));
  navLinks.forEach(link=>link.classList.toggle('is-active',link.dataset.tab===name&&link.classList.contains('nav-link')));
  nav.classList.remove('is-open');
  window.scrollTo({top:0,behavior:'smooth'});
}
navLinks.forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openTab(link.dataset.tab)}));
menuButton.addEventListener('click',()=>nav.classList.toggle('is-open'));

const card=document.querySelector('#card');
const slot=document.querySelector('#slot');
const reel=document.querySelector('#reel');
const nameEl=document.querySelector('#fortune-name');
const message=document.querySelector('#message');
const button=document.querySelector('#spin');
const blast=document.querySelector('#blast');
let spinning=false,taps=[],spinTimer,locked=false,canReset=false;
function tile(f){return `<div class="shark-tile"><img class="shark-face" src="naoking-${f.face}.png" alt="なおキング"></div>`}
button.addEventListener('click',()=>{
  if(blast.hidden===false||locked)return;
  const now=Date.now();
  taps=taps.filter(time=>now-time<2400);taps.push(now);
  if(taps.length>=3){
    clearTimeout(spinTimer);spinning=false;locked=true;canReset=false;slot.classList.remove('is-spinning');blast.hidden=false;card.classList.add('is-exploded');
    nameEl.textContent='なおキング激怒';message.textContent='連打されたので、今日の運勢はもう壊れた。';button.textContent='なおキング、停止中…';
    setTimeout(()=>{blast.hidden=true;card.classList.remove('is-exploded');taps=[];button.textContent='なおキング、怒って停止中…'},2600);return;
  }
  if(spinning)return;
  spinning=true;button.textContent='なおキング採点中・連打厳禁…';message.textContent='なおキングが今日の運勢を読んでいる……たぶん適当だ。';
  reel.innerHTML=fortunes.concat(fortunes,fortunes).map(tile).join('');slot.classList.add('is-spinning');
  const next=Math.floor(Math.random()*fortunes.length);
  spinTimer=setTimeout(()=>{const f=fortunes[next];slot.classList.remove('is-spinning');reel.innerHTML=tile(f);nameEl.textContent=f.name;message.textContent=f.lines[Math.floor(Math.random()*f.lines.length)];button.textContent='運命を回す';spinning=false},1700);
});

const canvas=document.querySelector('#swim-game');
const ctx=canvas.getContext('2d');
const gameStart=document.querySelector('#game-start');
const gameScore=document.querySelector('#game-score');
const gameStatus=document.querySelector('#game-status');
const gameResult=document.querySelector('#game-result');
const sharkSprite=new Image();
sharkSprite.src='naoking-1.png';
let gameRunning=false,gameFrame,gameX=330,gameScoreValue=0,gameItems=[],gameEndsAt=0,lastSpawn=0,moveDirection=0;
function gameDraw(){
  const w=canvas.width,h=canvas.height;
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#42a9c6');sky.addColorStop(1,'#06374e');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#d5f8ff55';for(let i=0;i<15;i++){ctx.beginPath();ctx.arc((i*71+30)%w,35+(i*47)%250,3+(i%4),0,Math.PI*2);ctx.fill()}
  gameItems.forEach(item=>{if(item.kind==='fish'){ctx.fillStyle='#ffdd89';ctx.beginPath();ctx.ellipse(item.x,item.y,14,8,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(item.x+12,item.y);ctx.lineTo(item.x+25,item.y-10);ctx.lineTo(item.x+25,item.y+10);ctx.fill()}else if(item.kind==='rock'){ctx.fillStyle='#314b5b';ctx.beginPath();ctx.arc(item.x,item.y,22,Math.PI,0);ctx.lineTo(item.x+22,item.y+28);ctx.lineTo(item.x-22,item.y+28);ctx.fill()}else{ctx.strokeStyle='#d8f7ff';ctx.lineWidth=4;ctx.strokeRect(item.x-19,item.y-19,38,38);ctx.beginPath();ctx.moveTo(item.x-19,item.y-19);ctx.lineTo(item.x+19,item.y+19);ctx.moveTo(item.x+19,item.y-19);ctx.lineTo(item.x-19,item.y+19);ctx.stroke()}});
  if(sharkSprite.complete)ctx.drawImage(sharkSprite,gameX,255,92,70);else{ctx.fillStyle='#9bd6e5';ctx.fillRect(gameX,270,90,35)}
}
function endGame(reason){gameRunning=false;cancelAnimationFrame(gameFrame);gameStart.disabled=false;gameStart.textContent='もう一度回遊する';gameStatus.textContent='なおキング、帰港。';const rank=gameScoreValue>=9?'海の支配者':gameScoreValue>=5?'背びれ絶好調':'小魚以下';gameResult.textContent=`今回の回遊評価：${rank}。エサ${gameScoreValue}匹。${reason}`}
function gameLoop(now){
  if(!gameRunning)return;
  if(!lastSpawn||now-lastSpawn>620){const roll=Math.random();gameItems.push({x:30+Math.random()*660,y:-30,kind:roll<.58?'fish':roll<.82?'rock':'net',speed:2.2+Math.random()*2.4});lastSpawn=now}
  gameX=Math.max(0,Math.min(canvas.width-92,gameX+moveDirection*7));
  gameItems.forEach(item=>item.y+=item.speed);gameItems=gameItems.filter(item=>item.y<400);
  for(let i=gameItems.length-1;i>=0;i--){const item=gameItems[i];if(item.y>245&&item.y<330&&Math.abs((item.x)-(gameX+46))<45){if(item.kind==='fish'){gameScoreValue++;gameItems.splice(i,1);gameScore.textContent=gameScoreValue}else{gameDraw();endGame('障害物に当たった。王様なのに。');return}}}
  gameDraw();gameStatus.textContent=`なおキング回遊中。残り${Math.max(0,Math.ceil((gameEndsAt-now)/1000))}秒。`;
  if(now>=gameEndsAt){endGame('生還した。まあ、当然だな。');return}gameFrame=requestAnimationFrame(gameLoop)
}
function startGame(){gameRunning=true;gameX=330;gameScoreValue=0;gameItems=[];lastSpawn=0;moveDirection=0;gameScore.textContent='0';gameStart.disabled=true;gameStart.textContent='回遊中…';gameResult.textContent='魚は取れ。岩と網は避けろ。常識だ。';gameEndsAt=performance.now()+15000;gameFrame=requestAnimationFrame(gameLoop)}
function gameStop(){if(gameRunning){gameRunning=false;cancelAnimationFrame(gameFrame);gameStart.disabled=false;gameStart.textContent='回遊を始める';gameStatus.textContent='なおキング、寄り道中。'}}
gameStart.addEventListener('click',startGame);
document.querySelectorAll('[data-move]').forEach(control=>{const dir=control.dataset.move==='left'?-1:1;control.addEventListener('pointerdown',event=>{event.preventDefault();moveDirection=dir});['pointerup','pointerleave','pointercancel'].forEach(type=>control.addEventListener(type,event=>{event.preventDefault();moveDirection=0}));['contextmenu','selectstart','dblclick'].forEach(type=>control.addEventListener(type,event=>event.preventDefault()))});
window.addEventListener('keydown',event=>{if(event.key==='ArrowLeft')moveDirection=-1;if(event.key==='ArrowRight')moveDirection=1});window.addEventListener('keyup',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight')moveDirection=0});
gameDraw();
