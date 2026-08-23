(() => {
  'use strict';

  const background = document.querySelector('#photo-background');
  if (!background) return;

  const photos = Array.from({ length: 7 }, (_, index) => `assets/backgrounds/vrchat-${String(index + 1).padStart(2, '0')}.webp`);
  const layers = [document.createElement('i'), document.createElement('i')];
  const snapshots = [...document.querySelectorAll('.snapshot-photo')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentIndex = -1;
  let layerIndex = 0;
  let timer = 0;
  let rotating = false;

  layers.forEach((layer, index) => {
    layer.className = `photo-layer${index === 0 ? ' is-visible' : ''}`;
    background.append(layer);
  });

  function preload(source) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = source;
    });
  }

  function chooseNext() {
    if (currentIndex < 0) return 0;
    let next = currentIndex;
    while (next === currentIndex && photos.length > 1) next = Math.floor(Math.random() * photos.length);
    return next;
  }

  async function rotate() {
    if (rotating || document.hidden) return;
    rotating = true;
    const nextIndex = chooseNext();
    const source = photos[nextIndex];
    await preload(source);

    const outgoingLayer = layers[layerIndex];
    layerIndex = 1 - layerIndex;
    const incomingLayer = layers[layerIndex];
    incomingLayer.style.backgroundImage = `url('${source}')`;
    incomingLayer.style.setProperty('--photo-x', `${35 + Math.round(Math.random() * 30)}%`);
    incomingLayer.classList.add('is-visible');
    outgoingLayer.classList.remove('is-visible');

    if (snapshots.length) {
      const outgoingPhoto = snapshots.find(photo => photo.classList.contains('is-visible')) || snapshots[0];
      const incomingPhoto = snapshots.find(photo => photo !== outgoingPhoto) || snapshots[0];
      incomingPhoto.src = source;
      incomingPhoto.alt = `なおキングダムの王国風景 ${nextIndex + 1}`;
      incomingPhoto.removeAttribute('aria-hidden');
      incomingPhoto.classList.add('is-visible');
      outgoingPhoto.alt = '';
      outgoingPhoto.setAttribute('aria-hidden', 'true');
      outgoingPhoto.classList.remove('is-visible');
    }
    currentIndex = nextIndex;
    rotating = false;
  }

  function start() {
    window.clearInterval(timer);
    rotate();
    if (!reducedMotion.matches) timer = window.setInterval(rotate, 8500);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearInterval(timer);
    else start();
  });
  reducedMotion.addEventListener?.('change', start);
  start();
})();
