(() => {
  const view = document.getElementById('cdh-page-view');
  if (!view) return;

  const body = document.body;
  const pages = {
    impressum: './assets/page-templates/impressum.html',
    datenschutz: './assets/page-templates/datenschutz.html'
  };
  const homeTitle = 'CDH Container Depot Hamburg';
  const homeDescription = 'CDH Container Depot Hamburg: sichere Containerlagerung und professionelles Handling im Hamburger Hafen. Senden Sie uns Ihre Anfrage.';
  const homeOpenGraph = {
    title: 'CDH Container Depot Hamburg',
    description: 'Sichere Containerlagerung und professionelles Handling im Hamburger Hafen.'
  };
  const cache = new Map();
  let loading = false;

  const safeStorage = {
    get(key) { try { return sessionStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch (_) {} },
    remove(key) { try { sessionStorage.removeItem(key); } catch (_) {} }
  };

  function cleanAddress(state = history.state) {
    try {
      if (location.pathname !== '/' || location.search || location.hash) {
        history.replaceState(state, '', '/');
      }
    } catch (_) { /* A local file preview can reject path changes. */ }
  }

  function setMetadata({ title, description, ogTitle, ogDescription }) {
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleElement.dataset.i18nOriginal = title;
      titleElement.textContent = title;
    }
    const descriptionElement = document.querySelector('meta[name="description"]');
    if (descriptionElement) {
      descriptionElement.dataset.i18nSource = description;
      descriptionElement.content = window.CDH_I18N ? window.CDH_I18N.translate(description) : description;
    }
    const ogTitleElement = document.querySelector('meta[property="og:title"]');
    if (ogTitleElement) {
      ogTitleElement.dataset.i18nSource = ogTitle;
      ogTitleElement.content = window.CDH_I18N ? window.CDH_I18N.translate(ogTitle) : ogTitle;
    }
    const ogDescriptionElement = document.querySelector('meta[property="og:description"]');
    if (ogDescriptionElement) {
      ogDescriptionElement.dataset.i18nSource = ogDescription;
      ogDescriptionElement.content = window.CDH_I18N ? window.CDH_I18N.translate(ogDescription) : ogDescription;
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = 'https://cdh-hamburg.de/';
  }

  function localizedContent() {
    if (window.CDH_I18N) window.CDH_I18N.setLocale(window.CDH_I18N.getLocale(), { persist: false, notify: true });
    view.querySelectorAll('[data-current-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
  }

  function showHome(scrollY = 0) {
    view.hidden = true;
    view.replaceChildren();
    body.classList.remove('route-legal', 'legal-page');
    body.classList.add('home-page');
    setMetadata({
      title: homeTitle,
      description: homeDescription,
      ogTitle: homeOpenGraph.title,
      ogDescription: homeOpenGraph.description
    });
    safeStorage.set('cdh-current-page', 'home');
    localizedContent();
    requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: 'instant' }));
  }

  async function getPage(name) {
    if (cache.has(name)) return cache.get(name);
    const response = await fetch(pages[name], { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Unable to load ${name}`);
    const html = await response.text();
    const documentPage = new DOMParser().parseFromString(html, 'text/html');
    const page = {
      body: documentPage.body.innerHTML,
      title: documentPage.title,
      description: documentPage.querySelector('meta[name="description"]')?.content || '',
      ogTitle: documentPage.title,
      ogDescription: documentPage.querySelector('meta[name="description"]')?.content || ''
    };
    cache.set(name, page);
    return page;
  }

  async function showLegal(name, { scrollY = 0 } = {}) {
    if (!pages[name]) return showHome(scrollY);
    loading = true;
    view.setAttribute('aria-busy', 'true');
    try {
      const page = await getPage(name);
      view.innerHTML = page.body;
      view.hidden = false;
      body.classList.remove('home-page', 'menu-open');
      body.classList.add('legal-page', 'route-legal');
      setMetadata(page);
      safeStorage.set('cdh-current-page', name);
      window.scrollTo({ top: 0, behavior: 'instant' });
      localizedContent();
      view.querySelector('.legal-heading h1')?.focus({ preventScroll: true });
    } catch (_) {
      showHome(scrollY);
    } finally {
      loading = false;
      view.removeAttribute('aria-busy');
    }
  }

  function navigatePage(name) {
    if (!pages[name] || loading) return;
    if (location.protocol === 'file:') {
      location.href = `./${name}.html`;
      return;
    }
    if (!body.classList.contains('route-legal')) {
      history.replaceState({ cdhPage: 'home', scrollY: window.scrollY }, '', '/');
    }
    history.pushState({ cdhPage: name, previousPage: history.state?.cdhPage || 'home', scrollY: 0 }, '', '/');
    cleanAddress(history.state);
    showLegal(name);
  }

  function navigateHome({ replace = false, scrollY = 0 } = {}) {
    const state = { cdhPage: 'home', scrollY };
    if (replace) history.replaceState(state, '', '/');
    else history.pushState({ ...state, previousPage: history.state?.cdhPage || 'home' }, '', '/');
    cleanAddress(history.state);
    showHome(scrollY);
  }

  function backToPreviousPage() {
    if (history.state?.previousPage && history.length > 1) {
      history.back();
      return;
    }
    navigateHome({ replace: true });
  }

  cleanAddress();
  const navigationEntry = performance.getEntriesByType('navigation')[0];
  const redirectedPage = safeStorage.get('cdh-redirect-page');
  safeStorage.remove('cdh-redirect-page');
  if (pages[redirectedPage]) history.replaceState({ cdhPage: redirectedPage, previousPage: null, scrollY: 0 }, '', '/');
  else if (!history.state?.cdhPage) history.replaceState({ cdhPage: 'home', scrollY: 0 }, '', '/');
  const restoredPage = history.state?.cdhPage ||
    (navigationEntry?.type === 'reload' ? safeStorage.get('cdh-current-page') : null) || 'home';
  if (restoredPage === 'home') {
    safeStorage.set('cdh-current-page', 'home');
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      target?.scrollIntoView({ block: 'start' });
      cleanAddress(history.state);
    }
  } else {
    showLegal(restoredPage);
  }

  document.addEventListener('click', event => {
    const back = event.target.closest('[data-history-back]');
    if (back) {
      event.preventDefault();
      backToPreviousPage();
      return;
    }

    const routeLink = event.target.closest('a[data-page]');
    if (routeLink) {
      event.preventDefault();
      navigatePage(routeLink.dataset.page);
      return;
    }

    const homeLink = event.target.closest('a[data-page-home]');
    if (homeLink) {
      event.preventDefault();
      if (body.classList.contains('route-legal')) navigateHome();
      else document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const sectionLink = event.target.closest('a[href^="#"]');
    if (sectionLink && !body.classList.contains('route-legal')) {
      const id = decodeURIComponent(sectionLink.getAttribute('href').slice(1));
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  window.addEventListener('popstate', event => {
    const state = event.state || { cdhPage: 'home', scrollY: 0 };
    cleanAddress(state);
    if (state.cdhPage === 'home') showHome(state.scrollY || 0);
    else showLegal(state.cdhPage);
  });
})();
