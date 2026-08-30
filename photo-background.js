(() => {
  'use strict';

  const background = document.querySelector('#photo-background');
  if (!background) return;

  // Keep the background and snapshot gallery on the same 26-image source of truth.
  const photos = Array.from({ length: 26 }, (_, index) => `assets/backgrounds/vrchat-${String(index + 1).padStart(2, '0')}.webp`);
  const layers = [document.createElement('i'), document.createElement('i')];
  const snapshots = [...document.querySelectorAll('.snapshot-photo')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentIndex = -1;
  let layerIndex = 0;
  let timer = 0;
  let rotating = false;
  let paused = false;
  let changeToken = 0;

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

  async function show(index, { restart = false } = {}) {
    if (document.hidden) return false;
    const token = ++changeToken;
    rotating = true;
    const nextIndex = ((Number(index) || 0) + photos.length) % photos.length;
    const source = photos[nextIndex];
    await preload(source);
    if (token !== changeToken) return false;

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
    window.dispatchEvent(new CustomEvent('naoking:photochange', { detail: { index: currentIndex, source } }));
    if (restart && !paused) schedule();
    return true;
  }

  async function rotate() {
    if (paused || rotating || document.hidden) return;
    await show(chooseNext());
  }

  function schedule() {
    window.clearInterval(timer);
    if (paused) return;
    if (!reducedMotion.matches) timer = window.setInterval(rotate, 8500);
  }

  function start() {
    rotate();
    schedule();
  }

  function pause() {
    paused = true;
    changeToken += 1;
    rotating = false;
    window.clearInterval(timer);
  }

  function resume() {
    paused = false;
    schedule();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearInterval(timer);
    else start();
  });
  reducedMotion.addEventListener?.('change', start);
  window.NaokingPhotos = Object.freeze({
    sources: [...photos],
    current: () => Math.max(0, currentIndex),
    select: index => show(index, { restart: true }),
    isPaused: () => paused,
    pause,
    resume
  });
  start();
})();
