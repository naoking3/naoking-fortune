const photoBackground=document.querySelector('#photo-background');
const backgroundPhotos=['backgrounds/vrchat-01.jpg','backgrounds/vrchat-02.jpg','backgrounds/vrchat-03.jpg','backgrounds/vrchat-04.jpg','backgrounds/vrchat-05.jpg','backgrounds/vrchat-06.jpg','backgrounds/vrchat-07.jpg'];
let currentPhoto=-1;
const photoLayers=[document.createElement('i'),document.createElement('i')];
photoLayers.forEach(layer=>photoBackground?.append(layer));
function rotateBackground(){
  let next;do{next=Math.floor(Math.random()*backgroundPhotos.length)}while(next===currentPhoto&&backgroundPhotos.length>1);currentPhoto=next;
  const outgoing=photoLayers.find(layer=>layer.classList.contains('is-visible'));
  const incoming=photoLayers.find(layer=>!layer.classList.contains('is-visible'))||photoLayers[0];
  incoming.style.backgroundImage=`url('${backgroundPhotos[next]}')`;incoming.classList.add('is-visible');
  window.setTimeout(()=>outgoing?.classList.remove('is-visible'),1500);
  const snapshotPhotos=[...document.querySelectorAll('.snapshot-photo')];
  if(snapshotPhotos.length){
    const nextPhoto=snapshotPhotos.find(photo=>!photo.classList.contains('is-visible'))||snapshotPhotos[0];
    nextPhoto.src=backgroundPhotos[next];
    const outgoingPhoto=snapshotPhotos.find(photo=>photo.classList.contains('is-visible'));
    nextPhoto.onload=()=>{nextPhoto.classList.add('is-visible');window.setTimeout(()=>outgoingPhoto?.classList.remove('is-visible'),1500)};
  }
}
rotateBackground();window.setInterval(rotateBackground,8500);
