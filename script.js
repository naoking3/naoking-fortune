const fortunes=[
  {name:'海の支配者',face:1,lines:['今日はお前がルールだ。まあ、水槽の中だけだけどな。','調子に乗れ。珍しく、お前に追い風が吹いてる。']},
  {name:'背びれ絶好調',face:2,lines:['背びれが立ってる。お前のやる気も、それくらい見せろ。','今日は少しだけイケてる。勘違いは明日からにしろ。']},
  {name:'エサ発見',face:3,lines:['欲しいものが見つかる。取り逃がすな、遅そうだから。','目の前にチャンス。口を開けて待つだけはやめろ。']},
  {name:'水槽の主',face:4,lines:['悪くない日。お前も一応、主役っぽく見える。','平和な一日。余計なことをしなければな。']},
  {name:'小魚メンタル',face:5,lines:['気にしすぎ。誰もお前のことそんなに見てない。','弱気でも行ける。小魚なりの機動力を見せろ。']},
  {name:'浅瀬で迷子',face:6,lines:['方向感覚がない日。地図を見るという進化をしろ。','迷ってるうちに日が暮れるぞ。まあ、いつものことか。']},
  {name:'干からび寸前',face:7,lines:['今日は無理するな。干物になる前に休め。','頑張るより、寝ろ。反論は受け付けない。']}
];

const pages=[...document.querySelectorAll('.page')];
const navLinks=[...document.querySelectorAll('[data-tab]')];
const nav=document.querySelector('#site-nav');
const menuButton=document.querySelector('#menu-button');
function openTab(name){
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
let spinning=false,taps=[],spinTimer;
function tile(f){return `<div class="shark-tile"><img class="shark-face" src="naoking-${f.face}.png" alt="なおキング"></div>`}
button.addEventListener('click',()=>{
  if(blast.hidden===false)return;
  const now=Date.now();
  taps=taps.filter(time=>now-time<2400);taps.push(now);
  if(taps.length>=5){
    clearTimeout(spinTimer);spinning=false;slot.classList.remove('is-spinning');blast.hidden=false;card.classList.add('is-exploded');
    nameEl.textContent='なおキング激怒';message.textContent='連打されたので、今日の運勢はもう壊れた。';button.textContent='なおキング、停止中…';
    setTimeout(()=>{blast.hidden=true;card.classList.remove('is-exploded');taps=[];button.textContent='運命を回す'},2600);return;
  }
  if(spinning)return;
  spinning=true;button.textContent='なおキング、裁定中…';message.textContent='なおキングが今日の運勢を読んでいる……たぶん適当だ。';
  reel.innerHTML=fortunes.concat(fortunes,fortunes).map(tile).join('');slot.classList.add('is-spinning');
  const next=Math.floor(Math.random()*fortunes.length);
  spinTimer=setTimeout(()=>{const f=fortunes[next];slot.classList.remove('is-spinning');reel.innerHTML=tile(f);nameEl.textContent=f.name;message.textContent=f.lines[Math.floor(Math.random()*f.lines.length)];button.textContent='運命を回す';spinning=false},1700);
});
