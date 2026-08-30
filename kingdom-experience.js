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
        hero.style.setProperty('--hero-shift-x', `${(-x * 10).toFixed(2)}px`);
        hero.style.setProperty('--hero-shift-y', `${(-y * 8).toFixed(2)}px`);
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
      hero.style.setProperty('--hero-shift-x', '0px');
      hero.style.setProperty('--hero-shift-y', '0px');
      hero.style.setProperty('--hero-copy-x', '0px');
      hero.style.setProperty('--hero-copy-y', '0px');
      hero.style.setProperty('--signature-shift-x', '0px');
      hero.style.setProperty('--signature-shift-y', '0px');
      hero.style.setProperty('--signature-tilt', '0deg');
    });
  }

  const eventLayer = document.querySelector('#kingdom-event-layer');
  let environmentTimer = 0;
  function scheduleEnvironmentEvent() {
    window.clearTimeout(environmentTimer);
    if (!eventLayer || reducedMotion.matches || document.hidden) return;
    environmentTimer = window.setTimeout(() => {
      const events = ['is-shoal-passing', 'is-current-glint', 'is-royal-wake'];
      const eventName = events[Math.floor(Math.random() * events.length)];
      eventLayer.classList.add(eventName);
      window.setTimeout(() => eventLayer.classList.remove(eventName), 6200);
      scheduleEnvironmentEvent();
    }, 22000 + Math.random() * 18000);
  }
  document.addEventListener('visibilitychange', scheduleEnvironmentEvent);
  reducedMotion.addEventListener?.('change', scheduleEnvironmentEvent);
  scheduleEnvironmentEvent();

  const dailyData = {
    decrees: [
      ['急がず泳げ。速さより、王らしい顔が大事だ。', '今日は遠回りに、小さな魚群が待っています。'],
      ['王冠が斜めでも、威厳まで斜めとは限らない。', '少し不格好な選択が、意外と良い潮目を作ります。'],
      ['深呼吸を三回。水中なので、真似はしないこと。', '立ち止まる時間を予定に入れると運勢が整います。'],
      ['よく分からない扉は、一度だけ押してみよ。', '新しいものに触れるなら、今日がちょうど良い日です。'],
      ['見栄を張るなら、最後まで堂々と張れ。', '自信は後からついてきます。まず姿勢だけ王様で。'],
      ['小魚を分けた者には、大魚の夢を見る権利を与える。', '誰かへの小さな親切が、別の流れを連れてきます。'],
      ['今日は何もしない決断も、正式な王命とする。', '休むことに理由はいりません。海流に預けてください。'],
      ['迷ったら、いちばん青い方へ進め。', '直感で選んだ色や音に、今日の答えが隠れています。'],
      ['失敗は沈めよ。反省だけ浮上させればよい。', '昨日より一つ軽くなれば、それで十分です。'],
      ['王は寝ている。各自、ほどよく幸せになれ。', '誰にも急かされない時間が、今日の宝物です。']
    ],
    tides: ['凪 / 透明度 88%', '上げ潮 / やや追い風', '王族性のうねり', '静穏 / 光の筋あり', '気まぐれな横流れ', '深度安定 / 良好'],
    relics: ['少し曲がった王冠', '青いグラス', '写真フォルダの三枚目', '丸いクッション', '未開封のお菓子', '金色の小物', '小さなサメ', '透明なもの']
  };
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  function refreshIfDateChanged() {
    const current = new Date();
    const currentKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    if (currentKey !== todayKey) window.location.reload();
  }
  window.addEventListener('focus', refreshIfDateChanged);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshIfDateChanged(); });
  const dateSeed = Number(todayKey.replaceAll('-', ''));
  const seededIndex = (seed, length) => Math.abs((seed * 9301 + 49297) % 233280) % length;
  const decree = dailyData.decrees[seededIndex(dateSeed, dailyData.decrees.length)];
  const dailyDate = document.querySelector('#daily-date');
  const dailyDecree = document.querySelector('#daily-decree');
  const dailyDetail = document.querySelector('#daily-detail');
  const dailyTide = document.querySelector('#daily-tide');
  const dailyRelic = document.querySelector('#daily-relic');
  if (dailyDate) dailyDate.textContent = `TODAY / ${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  if (dailyDecree) dailyDecree.textContent = decree[0];
  if (dailyDetail) dailyDetail.textContent = decree[1];
  if (dailyTide) dailyTide.textContent = dailyData.tides[seededIndex(dateSeed + 17, dailyData.tides.length)];
  if (dailyRelic) dailyRelic.textContent = dailyData.relics[seededIndex(dateSeed + 53, dailyData.relics.length)];

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
  stampButton?.addEventListener('click', () => {
    if (!passport.stamps.includes(todayKey)) passport.stamps.push(todayKey);
    passport.stamps = passport.stamps.slice(-28);
    try { window.localStorage.setItem(passportKey, JSON.stringify(passport)); } catch { /* private mode */ }
    renderPassport();
    stampButton.classList.add('is-impacting');
    window.setTimeout(() => stampButton.classList.remove('is-impacting'), 900);
  });
  renderPassport();

  const gallery = document.querySelector('#kingdom-gallery');
  const galleryOpen = document.querySelector('#photo-gallery-open');
  const galleryClose = document.querySelector('#gallery-close');
  const galleryImage = document.querySelector('#gallery-image');
  const galleryCounter = document.querySelector('#gallery-counter');
  const galleryCaption = document.querySelector('#gallery-caption');
  const galleryStrip = document.querySelector('#gallery-strip');
  const photoRotationToggle = document.querySelector('#photo-rotation-toggle');
  const photoSources = window.NaokingPhotos?.sources || [];
  const galleryCaptions = [
    '潮目の向こうにある王国', '深海遺跡の王族会議', '水面から届いた朝の光', 'クラゲの眠る観測室', 'あたたかな国民交流会', '王国の距離感は近い', 'プールサイド遠征記', '小さな同盟、成立', '夏夜を飾る王国花火', 'クラゲ観測員との記録', '王と国民の極秘会談', '夜更けの空中謁見', '朝寝坊の公式記録', '海辺に届いた夏', '雲の下での休息', '静かな部屋への訪問', '青空駅でひと休み', '光の森を漂う王', '蓮池に浮かぶ水の民', '逆さ空の漂流記', '遺跡の入口で集合', '深海神殿の迷子たち', '光へ向かう王国民', 'クラゲ回廊の夜', '小さな王冠の遠征', '王国風景、第二十六記録'
  ];
  let galleryIndex = 0;
  let galleryWasPaused = false;

  function updateGallery(index, { selectBackground = true } = {}) {
    if (!photoSources.length || !galleryImage) return;
    galleryIndex = ((index % photoSources.length) + photoSources.length) % photoSources.length;
    galleryImage.src = photoSources[galleryIndex];
    galleryImage.alt = `なおキングダムの王国風景 ${galleryIndex + 1}`;
    if (galleryCounter) galleryCounter.textContent = `SCENE ${String(galleryIndex + 1).padStart(2, '0')} / ${photoSources.length}`;
    if (galleryCaption) galleryCaption.textContent = galleryCaptions[galleryIndex] || `王国風景 第${galleryIndex + 1}記録`;
    galleryStrip?.querySelectorAll('button').forEach((button, buttonIndex) => {
      const selected = buttonIndex === galleryIndex;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
      if (buttonIndex === galleryIndex) button.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    });
    if (selectBackground) window.NaokingPhotos?.select(galleryIndex);
  }

  if (galleryStrip && photoSources.length) {
    const fragment = document.createDocumentFragment();
    photoSources.forEach((source, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `王国風景 ${index + 1}を表示`);
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `<img src="${source}" alt="" loading="lazy" decoding="async" width="160" height="90"><span>${String(index + 1).padStart(2, '0')}</span>`;
      button.addEventListener('click', () => updateGallery(index));
      fragment.append(button);
    });
    galleryStrip.append(fragment);
  }
  function openGallery() {
    if (!gallery) return;
    galleryIndex = window.NaokingPhotos?.current() || 0;
    updateGallery(galleryIndex, { selectBackground: false });
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
