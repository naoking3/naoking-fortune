(() => {
  'use strict';

  const body = document.body;
  const pages = [...document.querySelectorAll('.page')];
  const navigation = document.querySelector('#site-nav');
  const menuButton = document.querySelector('#menu-button');
  const header = document.querySelector('#site-header');
  const depthValue = document.querySelector('#header-depth-value');
  const depthProgress = document.querySelector('#depth-progress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const validPages = new Set(pages.map(page => page.id));
  let activePage = 'home';

  function closeMenu() {
    navigation?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  }

  function setPage(name, { updateHistory = true, focus = true } = {}) {
    const nextName = validPages.has(name) ? name : 'home';
    const nextPage = document.getElementById(nextName);
    if (!nextPage) return;

    activePage = nextName;
    body.dataset.page = nextName;
    pages.forEach(page => {
      const selected = page === nextPage;
      page.classList.toggle('is-active', selected);
      page.hidden = !selected;
      page.setAttribute('aria-hidden', String(!selected));
    });
    document.querySelectorAll('[data-tab]').forEach(control => {
      const selected = control.dataset.tab === nextName;
      control.classList.toggle('is-active', selected);
      if (control.classList.contains('nav-link')) {
        selected ? control.setAttribute('aria-current', 'page') : control.removeAttribute('aria-current');
      }
    });

    const depth = Number(nextPage.dataset.depth || 0);
    if (depthValue) depthValue.textContent = `${String(depth).padStart(4, '0')} M`;
    if (depthProgress) depthProgress.style.height = `${Math.min(100, Math.max(8, depth / 90))}%`;
    closeMenu();

    if (updateHistory && window.location.hash !== `#${nextName}`) {
      window.history.pushState({ page: nextName }, '', `#${nextName}`);
    }
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    if (focus) {
      const heading = nextPage.querySelector('h1');
      if (heading) {
        heading.tabIndex = -1;
        window.setTimeout(() => heading.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 360);
      }
    }
    window.dispatchEvent(new CustomEvent('naoking:pagechange', { detail: { page: nextName } }));
  }

  document.addEventListener('click', event => {
    const tabControl = event.target.closest('[data-tab]');
    if (tabControl) {
      event.preventDefault();
      setPage(tabControl.dataset.tab);
      return;
    }
    const scrollControl = event.target.closest('[data-scroll-to]');
    if (scrollControl) {
      document.getElementById(scrollControl.dataset.scrollTo)?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
  });

  menuButton?.addEventListener('click', () => {
    const isOpen = navigation?.classList.toggle('is-open') ?? false;
    menuButton.setAttribute('aria-expanded', String(isOpen));
    body.classList.toggle('menu-open', isOpen);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('popstate', () => setPage(window.location.hash.slice(1), { updateHistory: false }));

  let scrollTicking = false;
  function updateScrollState() {
    const scrollTop = window.scrollY;
    header?.classList.toggle('is-condensed', scrollTop > 28);
    if (activePage === 'home' && depthProgress) {
      const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(100, Math.max(8, (scrollTop / available) * 100));
      depthProgress.style.height = `${progress}%`;
    }
    scrollTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollState);
    }
  }, { passive: true });

  const opening = document.querySelector('#opening');
  const skipOpening = document.querySelector('#skip-opening');
  let openingTimer = 0;
  function finishOpening() {
    if (!opening || opening.classList.contains('is-finished')) return;
    window.clearTimeout(openingTimer);
    opening.classList.add('is-finished');
    opening.setAttribute('aria-hidden', 'true');
    try { window.sessionStorage.setItem('naokingOpeningSeen', '1'); } catch { /* storage may be blocked */ }
    window.setTimeout(() => opening.remove(), reducedMotion.matches ? 0 : 900);
  }
  if (opening) {
    let seen = false;
    try { seen = window.sessionStorage.getItem('naokingOpeningSeen') === '1'; } catch { /* ignore */ }
    openingTimer = window.setTimeout(finishOpening, seen || reducedMotion.matches ? 250 : 2600);
    skipOpening?.addEventListener('click', finishOpening);
  }

  const conditions = ['水圧、やや偉そう', '海流、王に忖度中', '王冠、少し斜め', 'エサ運、観測中', '国王、たぶん起床'];
  const condition = document.querySelector('#kingdom-condition');
  if (condition) condition.textContent = conditions[new Date().getDate() % conditions.length];

  const secretButton = document.querySelector('#crest-secret');
  const secretDecree = document.querySelector('#secret-decree');
  let crestTaps = 0;
  let secretTimer = 0;
  secretButton?.addEventListener('click', () => {
    crestTaps += 1;
    if (crestTaps < 5 || !secretDecree) return;
    crestTaps = 0;
    window.clearTimeout(secretTimer);
    secretDecree.hidden = false;
    requestAnimationFrame(() => secretDecree.classList.add('is-visible'));
    secretTimer = window.setTimeout(() => {
      secretDecree.classList.remove('is-visible');
      window.setTimeout(() => { secretDecree.hidden = true; }, 300);
    }, 4200);
  });

  const initialHash = window.location.hash.slice(1);
  setPage(validPages.has(initialHash) ? initialHash : 'home', { updateHistory: false, focus: false });
  updateScrollState();

  window.NaokingSite = Object.freeze({ open: page => setPage(page) });
})();
