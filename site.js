(() => {
  'use strict';

  const body = document.body;
  const pages = [...document.querySelectorAll('.page')];
  const navigation = document.querySelector('#site-nav');
  const menuButton = document.querySelector('#menu-button');
  const header = document.querySelector('#site-header');
  const main = document.querySelector('#main-content');
  const siteFooter = document.querySelector('.site-footer');
  const brand = document.querySelector('.brand');
  const skipLink = document.querySelector('.skip-link');
  const opening = document.querySelector('#opening');
  const skipOpening = document.querySelector('#skip-opening');
  const depthValue = document.querySelector('#header-depth-value');
  const depthProgress = document.querySelector('#depth-progress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const validPages = new Set(pages.map(page => page.id));
  let activePage = 'home';
  let menuOpen = false;
  let openingActive = Boolean(opening);

  function syncInteractiveState() {
    const backgroundInert = openingActive || menuOpen;
    [main, siteFooter, brand, skipLink].forEach(element => {
      if (element) element.inert = backgroundInert;
    });
    if (navigation) navigation.inert = openingActive;
    if (menuButton) menuButton.inert = openingActive;
  }

  function closeMenu({ restoreFocus = false } = {}) {
    const wasOpen = menuOpen;
    menuOpen = false;
    navigation?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
    syncInteractiveState();
    if (wasOpen && restoreFocus) menuButton?.focus();
  }

  function openMenu() {
    menuOpen = true;
    navigation?.classList.add('is-open');
    menuButton?.setAttribute('aria-expanded', 'true');
    body.classList.add('menu-open');
    syncInteractiveState();
    window.requestAnimationFrame(() => navigation?.querySelector('.nav-link')?.focus());
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
    menuOpen ? closeMenu({ restoreFocus: true }) : openMenu();
  });

  document.addEventListener('keydown', event => {
    if (openingActive && event.key === 'Tab') {
      event.preventDefault();
      skipOpening?.focus();
      return;
    }
    if (!menuOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [menuButton, ...navigation.querySelectorAll('.nav-link')].filter(Boolean);
      const current = focusable.indexOf(document.activeElement);
      const next = event.shiftKey
        ? (current <= 0 ? focusable.length - 1 : current - 1)
        : (current === focusable.length - 1 ? 0 : current + 1);
      event.preventDefault();
      focusable[next].focus();
    }
  });
  function syncRouteFromLocation() {
    const route = window.location.hash.slice(1);
    const next = validPages.has(route) ? route : 'home';
    if (next !== activePage) setPage(next, { updateHistory: false });
  }
  window.addEventListener('popstate', syncRouteFromLocation);
  window.addEventListener('hashchange', syncRouteFromLocation);

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

  let openingTimer = 0;
  let manageOpeningFocus = false;
  function finishOpening() {
    if (!opening || opening.classList.contains('is-finished')) return;
    window.clearTimeout(openingTimer);
    openingActive = false;
    syncInteractiveState();
    opening.classList.add('is-finished');
    opening.setAttribute('aria-hidden', 'true');
    try { window.sessionStorage.setItem('naokingOpeningSeen', '1'); } catch { /* storage may be blocked */ }
    window.setTimeout(() => opening.remove(), reducedMotion.matches ? 0 : 900);
    if (manageOpeningFocus) {
      const heading = document.querySelector('.page:not([hidden]) h1');
      if (heading) {
        heading.tabIndex = -1;
        window.setTimeout(() => heading.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 100);
      }
    }
  }
  if (opening) {
    let seen = false;
    try { seen = window.sessionStorage.getItem('naokingOpeningSeen') === '1'; } catch { /* ignore */ }
    manageOpeningFocus = !seen && !reducedMotion.matches;
    syncInteractiveState();
    if (manageOpeningFocus) window.requestAnimationFrame(() => skipOpening?.focus());
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
