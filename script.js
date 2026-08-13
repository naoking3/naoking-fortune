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

const moreLines={
  '海の支配者':['海流までお前を避けている。たぶん気のせいだ。','今日は発言に重みが出る。腹にも出るかは知らん。','勝ち筋が見える。目を細めすぎるな。','堂々としていろ。根拠はあとで探せ。','運が妙に従順だ。扱いを間違えるな。','王冠はないが、背びれは立っている。','今日は周りが少し優しい。期限は短い。','先に一歩出ろ。珍しく様になる。','自分を褒めろ。誰も止めない。','波に乗れる日。沖へ行きすぎるな。','小さな願いなら通る。大きいのは知らん。','お前の言い分が通りやすい。今だけだ。','今日はエサ運も人運も悪くない。珍事だ。','いい流れが来る。泳ぎ方を忘れるな。','少し偉そうでも許される。少しだけだ。','面倒なことが片付く。お前にしては早い。','勢いで進め。慎重さは明日回収しろ。','何をしても王様っぽく見える日。','今日は浅瀬でも堂々としていろ。','海の支配者を名乗っていい日。明日は返上しろ。'],
  '背びれ絶好調':['背びれの調子がいい。人生も少しだけだ。','今日は一個くらい褒められる。驚くな。','やる気が迷子になっていない。珍しい。','軽い追い風。全力疾走はするな。','まあまあ賢く動ける。期待しすぎるな。','話が噛み合う日。相手に感謝しろ。','小さな幸運を見逃すな。目は開けろ。','体感より調子がいい。信じて動け。','背びれの角度が完璧。中身も合わせろ。','今日は段取りが進む。途中で寝るな。','勢いはある。方向だけ確認しろ。','ちょっとした勝ちを拾える。落とすな。','できることが増える日。気のせいでもいい。','今日は無難に強い。地味に誇れ。','周りの空気が少し味方する。','直感が当たる。二回目は知らん。','気持ちよく終われる用事がある。','背びれを立てろ。理由は後付けでいい。','細かいことが妙にうまくいく。','今日はまあ、悪くない。調子に乗るな。'],
  'エサ発見':['欲しかった情報が流れてくる。噛みつけ。','小さな当たりを引く。大当たりではない。','腹が減るほど運が動く。ちゃんと食べろ。','目の前にヒントがある。見落とすな。','今日は得を拾える。拾う姿勢を見せろ。','何か見つかる。財布ではないかもしれない。','欲張らなければ十分なエサがある。','チャンスは泳いでくる。網は持つな。','いい話がある。耳だけは開けておけ。','一口目が大事。迷って逃すな。','偶然が役に立つ。珍しくな。','獲物は遠くない。お前が遠回りするだけだ。','気になることを調べろ。収穫がある。','今日は拾い物の日。道端は見なくていい。','欲しいものに一歩近づく。二歩は知らん。','小さなご褒美を受け取れ。遠慮するな。','いい匂いの方へ進め。比喩だぞ。','エサの気配がする。鼻はないけどな。','目の前の選択が正解寄り。寄りだ。','何かを掴める日。手はないが頑張れ。'],
  '水槽の主':['いつもの場所が一番強い。外海はまた今度。','慣れた手順で十分勝てる。','今日は安心できる場所にいろ。王の命令だ。','地味な作業が片付く。地味に偉い。','小さな居場所を守れ。それが今日は正解。','変化より安定。たまには頭を使え。','いつもの人が頼りになる。珍しく。','余計な冒険をしないだけで点が入る。','水槽の端で輝け。端でも輝ける。','今日はルーティンが味方する。','平和が一番。お前には刺激が多すぎる。','身の丈に合った幸せを拾え。','落ち着いていれば大丈夫。たぶん。','よく知っていることを丁寧にやれ。','いつもの場所に答えが沈んでいる。','安心できる人に連絡しろ。用件は作れ。','今日は守りが強い。攻めるな。','水槽の主として、定位置を死守しろ。','小さく整う日。散らかすな。','安定は才能だ。退屈扱いするな。'],
  '小魚メンタル':['不安は大きく見える。お前が小魚だからだ。','今日は深呼吸してから泳げ。','誰もそこまで見ていない。安心しろ。','失敗の予感は予感でしかない。珍しく正しい。','小さな一歩でいい。ヒレも短いしな。','自分に厳しすぎる。海にも謝れ。','考えすぎの波に飲まれるな。','今日は静かに勝てばいい。目立つな。','気まずさは風化する。お前以外の中で。','比べるな。相手にも迷惑だ。','怖いならゆっくり進め。止まるな。','不安な予定は半分だけ片付けろ。','小魚でも流れには逆らえる。少しだけ。','気にしなくていい。たぶん誰も覚えていない。','弱気でも行動すれば合格。','今日は自分を甘やかせ。塩分控えめで。','失敗しても海は広い。水槽なら狭い。','心配の九割は暇から来る。','小さな達成を数えろ。指はないけど。','お前は思うより沈んでいない。'],
  '浅瀬で迷子':['目的地を一度書け。頭の中は濁っている。','今日は寄り道が多い。帰れるうちに帰れ。','一つずつ決めろ。全部は無理だ。','迷ったら人に聞け。王様ごっこは終わり。','方向感覚より締切を信じろ。','予定を詰めすぎるな。サメでも溺れる。','今日は地図役が必要だ。自覚しろ。','先にやることを一個だけ選べ。','流れに任せるな。流された顔をするな。','迷子でも止まれば遭難ではない。','知らない道は慎重に行け。泳げないならなおさら。','目標を小さくしろ。今のお前にはそれでいい。','途中で目的を忘れても、戻ればいい。','今日は案内板を読め。飾りじゃない。','選択肢を減らせ。お前は選べない。','焦ると浅瀬に乗り上げるぞ。','順番を守れ。人生は早押しではない。','迷っている時間も経験。短くしろ。','とりあえず水分を取れ。判断はその後。','帰る場所があるなら、まずそこへ戻れ。'],
  '干からび寸前':['今日は生きているだけで合格。','頑張りは明日でいい。今日は干物回避だ。','休む判断が一番賢い。お前にしては。','エネルギーがない。根性で増やすな。','今日は省エネで泳げ。泳がなくてもいい。','やる気がないなら座れ。サメだが。','予定を減らせ。お前は忙しすぎる。','疲れたら寝ろ。名言でも何でもない。','今日は期待値を下げろ。地面まで。','水分と糖分を取れ。占いより先だ。','無理をすると浅瀬で詰む。','できなかったことは明日のエサにしろ。','今日は撤退が勝ち。逃げ足はないけど。','頭が回らない日。背びれも休ませろ。','誰にも会いたくないなら会うな。','最低限で終われ。それが最高点だ。','今日は小さなことだけやれ。','干からびる前に日陰へ行け。','何もしない勇気を持て。ずっとは駄目だ。','明日の自分に任せろ。たぶん何とかする。']
};
fortunes.forEach(f=>f.lines.push(...moreLines[f.name]));

const pages=[...document.querySelectorAll('.page')];
const navLinks=[...document.querySelectorAll('[data-tab]')];
const nav=document.querySelector('#site-nav');
const menuButton=document.querySelector('#menu-button');
function openTab(name){
  document.querySelector('main').classList.toggle('is-home',name==='home');
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
