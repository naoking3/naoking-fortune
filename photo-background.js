const photoBackground=document.querySelector('#photo-background');
const backgroundPhotos=['backgrounds/vrchat-01.jpg','backgrounds/vrchat-02.jpg','backgrounds/vrchat-03.jpg','backgrounds/vrchat-04.jpg','backgrounds/vrchat-05.jpg','backgrounds/vrchat-06.jpg','backgrounds/vrchat-07.jpg'];
let currentPhoto=-1;
const photoLayers=[document.createElement('i'),document.createElement('i')];
photoLayers.forEach(layer=>photoBackground?.append(layer));
function rotateBackground(){
  let next;do{next=Math.floor(Math.random()*backgroundPhotos.length)}while(next===currentPhoto&&backgroundPhotos.length>1);currentPhoto=next;
  const incoming=photoLayers.find(layer=>!layer.classList.contains('is-visible'))||photoLayers[0];
  incoming.style.backgroundImage=`url('${backgroundPhotos[next]}')`;
  incoming.style.backgroundPosition=`${30+Math.floor(Math.random()*41)}% ${25+Math.floor(Math.random()*41)}%`;
  incoming.classList.add('is-visible');
  photoLayers.filter(layer=>layer!==incoming).forEach(layer=>layer.classList.remove('is-visible'));
  const mobilePhoto=document.querySelector('#mobile-photo');
  if(mobilePhoto){
    mobilePhoto.classList.add('is-changing');
    window.setTimeout(()=>{mobilePhoto.src=backgroundPhotos[next]},700);
    mobilePhoto.onload=()=>{window.setTimeout(()=>mobilePhoto.classList.remove('is-changing'),80)};
  }
}
rotateBackground();window.setInterval(rotateBackground,8500);
