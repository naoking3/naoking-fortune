(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('has-kingdom-experience');

  // Motion language: Drift = ambient, Dive = navigation, Reveal = content, Impact = earned reward.
  const revealTargets = [...document.querySelectorAll('.section-frame')].filter(target => !target.classList.contains('hero'));
  revealTargets.forEach(target => target.classList.add('motion-section'));
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-current-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10%', threshold: .08 });
    revealTargets.forEach(target => observer.observe(target));
  } else {
    revealTargets.forEach(target => target.classList.add('is-current-visible'));
  }

  const hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion.matches) {
    let heroPointerFrame = 0;
    let latestPointer = null;
    hero.addEventListener('pointermove', event => {
      latestPointer = event;
      if (heroPointerFrame) return;
      heroPointerFrame = window.requestAnimationFrame(() => {
        heroPointerFrame = 0;
        const bounds = hero.getBoundingClientRect();
        const x = ((latestPointer.clientX - bounds.left) / Math.max(1, bounds.width) - .5) * 2;
        const y = ((latestPointer.clientY - bounds.top) / Math.max(1, bounds.height) - .5) * 2;
        hero.style.setProperty('--hero-copy-x', `${(x * 2.2).toFixed(2)}px`);
        hero.style.setProperty('--hero-copy-y', `${(y * 1.8).toFixed(2)}px`);
        hero.style.setProperty('--signature-shift-x', `${(x * 5).toFixed(2)}px`);
        hero.style.setProperty('--signature-shift-y', `${(y * 4).toFixed(2)}px`);
        hero.style.setProperty('--signature-tilt', `${(x * 1.4).toFixed(2)}deg`);
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      window.cancelAnimationFrame(heroPointerFrame);
      heroPointerFrame = 0;
      hero.style.setProperty('--hero-copy-x', '0px');
      hero.style.setProperty('--hero-copy-y', '0px');
      hero.style.setProperty('--signature-shift-x', '0px');
      hero.style.setProperty('--signature-shift-y', '0px');
      hero.style.setProperty('--signature-tilt', '0deg');
    });
  }

  const today = new Date();
  const todayKey = window.NaokingWorldData?.toLocalDateKey?.(today)
    || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const canonicalDaily = window.NaokingWorldData?.getDailyContext?.(todayKey, {
    photoCount: window.NaokingPhotoCatalog?.length || 26
  });
  function refreshIfDateChanged() {
    const current = new Date();
    const currentKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    if (currentKey !== todayKey) window.location.reload();
  }
  window.addEventListener('focus', refreshIfDateChanged);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshIfDateChanged(); });
  const dailyDate = document.querySelector('#daily-date');
  const dailyDecree = document.querySelector('#daily-decree');
  const dailyDetail = document.querySelector('#daily-detail');
  const dailyTide = document.querySelector('#daily-tide');
  const dailyRelic = document.querySelector('#daily-relic');
  if (dailyDate) dailyDate.textContent = `TODAY / ${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  if (canonicalDaily) {
    if (dailyDecree) dailyDecree.textContent = canonicalDaily.decree.text;
    if (dailyDetail) dailyDetail.textContent = canonicalDaily.decree.detail;
    if (dailyTide) dailyTide.textContent = canonicalDaily.tide.label;
    if (dailyRelic) dailyRelic.textContent = canonicalDaily.relic.label;
  }

  const passportList = document.querySelector('#passport-stamps');
  const passportStatus = document.querySelector('#passport-status');
  const stampButton = document.querySelector('#daily-stamp');
  const passportKey = 'naokingRoyalPassportV1';
  let passport = { stamps: [] };
  try {
    const stored = JSON.parse(window.localStorage.getItem(passportKey) || '{}');
    if (Array.isArray(stored.stamps)) passport.stamps = stored.stamps.filter(value => /^\d{4}-\d{2}-\d{2}$/.test(value)).slice(-28);
  } catch { /* localStorage or invalid JSON can be ignored */ }

  function dayKey(offset) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function renderPassport() {
    if (!passportList) return;
    passportList.replaceChildren();
    for (let offset = 6; offset >= 0; offset -= 1) {
      const key = dayKey(offset);
      const item = document.createElement('li');
      const stamped = passport.stamps.includes(key);
      item.className = stamped ? 'is-stamped' : '';
      item.innerHTML = `<span>${key.slice(5).replace('-', '.')}</span><b aria-label="${stamped ? '謁見済み' : '未謁見'}">${stamped ? '♛' : '·'}</b>`;
      passportList.append(item);
    }
    const stampedToday = passport.stamps.includes(todayKey);
    if (passportStatus) passportStatus.textContent = stampedToday ? '本日の謁見印は受領済み。王国はあなたを覚えています。' : '本日の謁見印は、まだ受け取っていません。';
    if (stampButton) {
      stampButton.disabled = stampedToday;
      stampButton.classList.toggle('is-stamped', stampedToday);
      stampButton.firstChild.textContent = stampedToday ? '本日の謁見は完了 ' : '本日の謁見印を受け取る ';
    }
  }
  function resetPassport() {
    passport = { stamps: [] };
    try { window.localStorage.removeItem(passportKey); } catch { /* private mode */ }
    renderPassport();
  }
  stampButton?.addEventListener('click', () => {
    if (!passport.stamps.includes(todayKey)) passport.stamps.push(todayKey);
    passport.stamps = passport.stamps.slice(-28);
    try { window.localStorage.setItem(passportKey, JSON.stringify(passport)); } catch { /* private mode */ }
    renderPassport();
    stampButton.classList.add('is-impacting');
    window.setTimeout(() => stampButton.classList.remove('is-impacting'), 900);
  });
  renderPassport();
  window.NaokingRoyalPassport = Object.freeze({ reset: resetPassport, render: renderPassport });

  const gallery = document.querySelector('#kingdom-gallery');
  const galleryOpen = document.querySelector('#photo-gallery-open');
  const galleryClose = document.querySelector('#gallery-close');
  const galleryImage = document.querySelector('#gallery-image');
  const galleryCounter = document.querySelector('#gallery-counter');
  const galleryCaption = document.querySelector('#gallery-caption');
  const galleryStrip = document.querySelector('#gallery-strip');
  const photoRotationToggle = document.querySelector('#photo-rotation-toggle');
  const photoCatalog = window.NaokingPhotoCatalog || [];
  let galleryIndex = 0;
  let galleryWasPaused = false;
  let galleryLoadToken = 0;

  function preloadGalleryRecord(record) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = async () => {
        try { await image.decode?.(); } catch { /* decoded load is still usable */ }
        resolve(true);
      };
      image.onerror = () => resolve(false);
      image.src = record.source;
    });
  }

  async function updateGallery(index, { selectBackground = true } = {}) {
    if (!photoCatalog.length || !galleryImage) return;
    galleryIndex = ((index % photoCatalog.length) + photoCatalog.length) % photoCatalog.length;
    const record = photoCatalog[galleryIndex];
    const token = ++galleryLoadToken;
    gallery?.classList.add('is-loading');
    galleryImage.parentElement?.setAttribute('aria-busy', 'true');
    const loaded = await preloadGalleryRecord(record);
    if (token !== galleryLoadToken) return false;
    gallery?.classList.remove('is-loading');
    galleryImage.parentElement?.setAttribute('aria-busy', 'false');
    if (!loaded) return false;
    galleryImage.src = record.source;
    galleryImage.alt = record.alt;
    galleryImage.dataset.photoIndex = String(galleryIndex);
    galleryImage.style.objectPosition = `${record.focalX}% ${record.focalY}%`;
    if (galleryCounter) galleryCounter.textContent = `SCENE ${String(galleryIndex + 1).padStart(2, '0')} / ${photoCatalog.length}`;
    if (galleryCaption) galleryCaption.textContent = record.caption;
    galleryStrip?.querySelectorAll('button').forEach((button, buttonIndex) => {
      const selected = buttonIndex === galleryIndex;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
      if (buttonIndex === galleryIndex) button.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    });
    if (selectBackground) window.NaokingPhotos?.select(galleryIndex);
    window.dispatchEvent(new CustomEvent('naoking:galleryselection', { detail: { index: galleryIndex, record } }));
    return true;
  }

  if (galleryStrip && photoCatalog.length) {
    const fragment = document.createDocumentFragment();
    photoCatalog.forEach((record, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `${record.caption}を表示`);
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `<img src="${record.thumbnail}" alt="" loading="lazy" decoding="async" width="160" height="90" style="object-position:${record.focalX}% ${record.focalY}%"><span>${String(index + 1).padStart(2, '0')}</span>`;
      button.addEventListener('click', () => updateGallery(index));
      fragment.append(button);
    });
    galleryStrip.append(fragment);
  }
  function openGallery() {
    if (!gallery) return;
    galleryIndex = window.NaokingPhotos?.current() || 0;
    let opened = false;
    try {
      if (typeof gallery.showModal === 'function') gallery.showModal();
      else gallery.setAttribute('open', '');
      opened = gallery.open || gallery.hasAttribute('open');
    } catch { /* fall through without locking the page */ }
    if (!opened) return;
    galleryWasPaused = Boolean(window.NaokingPhotos?.isPaused());
    window.NaokingPhotos?.pause();
    body.classList.add('gallery-open');
    window.requestAnimationFrame(() => updateGallery(galleryIndex, { selectBackground: false }));
  }
  function finishGalleryClose() {
    body.classList.remove('gallery-open');
    if (!galleryWasPaused) window.NaokingPhotos?.resume();
    galleryOpen?.focus();
  }
  function closeGallery() {
    if (!gallery?.open && !gallery?.hasAttribute('open')) return;
    if (typeof gallery.close === 'function') gallery.close();
    else {
      gallery.removeAttribute('open');
      finishGalleryClose();
    }
  }
  galleryOpen?.addEventListener('click', openGallery);
  galleryClose?.addEventListener('click', closeGallery);
  document.querySelector('#gallery-prev')?.addEventListener('click', () => updateGallery(galleryIndex - 1));
  document.querySelector('#gallery-next')?.addEventListener('click', () => updateGallery(galleryIndex + 1));
  gallery?.addEventListener('click', event => { if (event.target === gallery) closeGallery(); });
  gallery?.addEventListener('close', finishGalleryClose);
  gallery?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault();
    if (event.key === 'ArrowLeft') updateGallery(galleryIndex - 1);
    if (event.key === 'ArrowRight') updateGallery(galleryIndex + 1);
  });
  window.addEventListener('naoking:photochange', event => {
    if (!gallery?.open) galleryIndex = event.detail.index;
  });
  photoRotationToggle?.addEventListener('click', () => {
    const paused = Boolean(window.NaokingPhotos?.isPaused());
    if (paused) window.NaokingPhotos?.resume();
    else window.NaokingPhotos?.pause();
    const nextPaused = !paused;
    photoRotationToggle.setAttribute('aria-pressed', String(nextPaused));
    photoRotationToggle.textContent = nextPaused ? 'RESUME CURRENT' : 'PAUSE CURRENT';
  });

  const frameFile = document.querySelector('#frame-file');
  const frameCanvas = document.querySelector('#frame-canvas');
  const frameEmpty = document.querySelector('#frame-empty');
  const frameDownload = document.querySelector('#frame-download');
  const frameStyleButtons = [...document.querySelectorAll('[data-frame-style]')];
  const frameContext = frameCanvas?.getContext('2d');
  let frameSource = null;
  let frameStyle = 'abyss';
  let frameLoadToken = 0;

  function setFrameStatus(message, { error = false } = {}) {
    if (!frameEmpty) return;
    frameEmpty.hidden = false;
    frameEmpty.textContent = message;
    frameEmpty.classList.toggle('is-error', error);
  }

  function drawCover(context, image, width, height) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  }
  function drawFrame() {
    if (!frameContext || !frameCanvas || !frameSource) return;
    const { width, height } = frameCanvas;
    frameContext.clearRect(0, 0, width, height);
    drawCover(frameContext, frameSource, width, height);

    const schemes = {
      abyss: { edge: '#f4dfa0', wash: 'rgba(3,30,55,.12)', shade: 'rgba(3,23,48,.84)', label: 'ABYSSAL FIELD RECORD' },
      surface: { edge: '#d9fbff', wash: 'rgba(90,222,238,.1)', shade: 'rgba(4,65,91,.72)', label: 'SURFACE LIGHT RECORD' },
      archive: { edge: '#f0f2dc', wash: 'rgba(10,54,71,.18)', shade: 'rgba(5,37,55,.9)', label: 'ROYAL ARCHIVE / CLASSIFIED' }
    };
    const scheme = schemes[frameStyle];
    frameContext.fillStyle = scheme.wash;
    frameContext.fillRect(0, 0, width, height);
    const shade = frameContext.createLinearGradient(0, height * .54, 0, height);
    shade.addColorStop(0, 'rgba(3,22,40,0)');
    shade.addColorStop(1, scheme.shade);
    frameContext.fillStyle = shade;
    frameContext.fillRect(0, 0, width, height);
    frameContext.strokeStyle = scheme.edge;
    frameContext.lineWidth = 4;
    frameContext.strokeRect(28, 28, width - 56, height - 56);
    frameContext.strokeStyle = 'rgba(226,249,251,.42)';
    frameContext.lineWidth = 1;
    frameContext.strokeRect(42, 42, width - 84, height - 84);

    frameContext.fillStyle = scheme.edge;
    frameContext.font = '700 22px Consolas, monospace';
    frameContext.fillText('NAOKING KINGDOM', 72, height - 112);
    frameContext.fillStyle = '#f2fbfc';
    frameContext.font = '500 44px "Yu Mincho", serif';
    frameContext.fillText(scheme.label, 72, height - 62);
    frameContext.textAlign = 'right';
    frameContext.fillStyle = scheme.edge;
    frameContext.font = '700 23px Consolas, monospace';
    frameContext.fillText(`${todayKey.replaceAll('-', '.')}  //  ♛`, width - 72, height - 72);
    frameContext.textAlign = 'left';
  }
  frameFile?.addEventListener('change', () => {
    const file = frameFile.files?.[0];
    const token = ++frameLoadToken;
    frameSource = null;
    if (frameDownload) frameDownload.disabled = true;
    frameContext?.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setFrameStatus('JPEG / PNG / WebP の写真を選んでください。', { error: true });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setFrameStatus('写真が大きすぎます。25MB以内の画像を選んでください。', { error: true });
      return;
    }
    setFrameStatus('王国記録を現像しています…');
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (token !== frameLoadToken) {
        URL.revokeObjectURL(url);
        return;
      }
      if (image.naturalWidth * image.naturalHeight > 60000000) {
        setFrameStatus('画像の縦横サイズが大きすぎます。60メガピクセル以下にしてください。', { error: true });
        URL.revokeObjectURL(url);
        return;
      }
      frameSource = image;
      drawFrame();
      if (frameEmpty) {
        frameEmpty.hidden = true;
        frameEmpty.classList.remove('is-error');
      }
      if (frameDownload) frameDownload.disabled = false;
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      if (token === frameLoadToken) setFrameStatus('写真を読み込めませんでした。別の画像を試してください。', { error: true });
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
  frameStyleButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.frameStyle === frameStyle));
    button.addEventListener('click', () => {
      frameStyle = button.dataset.frameStyle;
      frameStyleButtons.forEach(control => {
        const selected = control === button;
        control.classList.toggle('is-active', selected);
        control.setAttribute('aria-pressed', String(selected));
      });
      drawFrame();
    });
  });
  frameDownload?.addEventListener('click', () => {
    if (!frameCanvas || !frameSource) return;
    frameCanvas.toBlob(blob => {
      if (!blob) return;
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      const extension = blob.type === 'image/webp' ? 'webp' : 'png';
      link.download = `naoking-kingdom-${todayKey}.${extension}`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/webp', .9);
  });
})();
