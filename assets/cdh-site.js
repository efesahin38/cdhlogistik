(() => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.nav-toggle');
  const navigation = document.querySelector('.primary-navigation');
  const navBackdrop = document.querySelector('.nav-backdrop');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function closeMenu({ restoreFocus = false } = {}) {
    if (!header || !menuToggle) return;
    header.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', window.CDH_I18N ? window.CDH_I18N.translate('Menü öffnen') : 'Menü öffnen');
    if (restoreFocus) menuToggle.focus();
  }

  if (header && menuToggle && navigation) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      const toggleLabel = isOpen ? 'Menü öffnen' : 'Menü schließen';
      header.classList.toggle('menu-open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', window.CDH_I18N ? window.CDH_I18N.translate(toggleLabel) : toggleLabel);
      if (!isOpen) navigation.querySelector('a')?.focus({ preventScroll: true });
    });

    navigation.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu({ restoreFocus: true });
    });

    navBackdrop?.addEventListener('click', () => closeMenu());
    document.addEventListener('click', event => {
      if (!header.classList.contains('menu-open')) return;
      if (navigation.contains(event.target) || menuToggle.contains(event.target)) return;
      closeMenu();
    });
    window.addEventListener('cdh:localechange', () => closeMenu());

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu({ restoreFocus: true });
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 800) closeMenu();
    }, { passive: true });

    window.addEventListener('scroll', () => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    }, { passive: true });
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  if (navigation && 'IntersectionObserver' in window) {
    const navTargets = [...document.querySelectorAll('#home, #leistungen, #ueber-uns, #standort, #booking')];
    const activeObserver = new IntersectionObserver(entries => {
      const active = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      navigation.querySelectorAll('a[href^="#"]').forEach(link => {
        if (link.getAttribute('href') === `#${active.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { threshold: [0, .1, .25, .5], rootMargin: '-28% 0px -58% 0px' });
    navTargets.forEach(target => activeObserver.observe(target));
  }

  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      document.body.classList.toggle('hero-visible', entries.some(entry => entry.isIntersecting));
    }, { threshold: 0.05 });
    heroObserver.observe(hero);
  }

  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if (!reducedMotion.matches && 'IntersectionObserver' in window && revealItems.length) {
    document.documentElement.classList.add('has-reveal');
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-revealed'));
  }

  const booking = document.getElementById('booking');
  if (booking && 'IntersectionObserver' in window) {
    const bookingObserver = new IntersectionObserver(entries => {
      document.body.classList.toggle('booking-visible', entries.some(entry => entry.isIntersecting));
    }, { threshold: 0.08 });
    bookingObserver.observe(booking);
  }

  const currentYear = document.getElementById('currentYear');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  const form = document.getElementById('bookingForm');
  const formMessage = document.getElementById('formMessage');
  const submitButton = document.getElementById('submitBtn');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');

  if (form && formMessage && submitButton) {
    const showMessage = (message, state) => {
      formMessage.dataset.messageSource = message;
      formMessage.textContent = window.CDH_I18N ? window.CDH_I18N.translate(message) : message;
      formMessage.dataset.state = state;
      formMessage.hidden = false;
    };

    const updateDateRange = () => {
      if (!startDate || !endDate) return;
      endDate.min = startDate.value;
      endDate.setCustomValidity(startDate.value && endDate.value && endDate.value < startDate.value
        ? (window.CDH_I18N ? window.CDH_I18N.translate('Das Enddatum muss am oder nach dem Startdatum liegen.') : 'Das Enddatum muss am oder nach dem Startdatum liegen.')
        : '');
    };

    startDate?.addEventListener('change', updateDateRange);
    endDate?.addEventListener('change', updateDateRange);

    form.addEventListener('submit', async event => {
      event.preventDefault();
      updateDateRange();
      if (!form.reportValidity() || submitButton.disabled) return;

      formMessage.hidden = true;
      submitButton.disabled = true;
      submitButton.classList.add('is-submitting');
      submitButton.setAttribute('aria-busy', 'true');

      try {
        const formValues = Object.fromEntries(new FormData(form).entries());
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            ...formValues,
            _subject: `Containeranfrage – ${formValues.Firma || 'CDH Website'}`,
            _replyto: formValues.Email
          })
        });
        let result = {};
        try { result = await response.json(); } catch (_) { /* Non-JSON responses are handled below. */ }
        if (!response.ok || !(result.success === true || result.success === 'true')) {
          throw new Error('The inquiry service rejected the submission.');
        }
        form.reset();
        updateDateRange();
        showMessage('Vielen Dank. Ihre Anfrage wurde übermittelt. CDH setzt sich mit Ihnen in Verbindung.', 'success');
      } catch (_) {
        showMessage('Die Anfrage konnte gerade nicht übertragen werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt per E-Mail.', 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('is-submitting');
        submitButton.removeAttribute('aria-busy');
      }
    });
  }
})();
