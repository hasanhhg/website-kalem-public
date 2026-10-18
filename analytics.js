(() => {
  const banner = document.querySelector('#cookie-consent');
  const settings = document.querySelector('[data-cookie-settings]');
  const script = document.querySelector('script[data-ga4]');
  if (!banner || !settings || !script || !/^G-[A-Z0-9]+$/.test(script.dataset.ga4)) return;

  const measurementId = script.dataset.ga4;
  const storageKey = 'kalem_analytics_consent';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  let started = false;
  let returnFocus = null;
  function storedChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.version === 1 && ['granted', 'denied'].includes(saved.value) &&
          Number.isFinite(saved.time) && saved.time <= Date.now() && Date.now() - saved.time < lifetime) return saved.value;
    } catch {}
    return null;
  }
  let choice = storedChoice();
  const reserveSpace = () => { document.body.style.paddingBottom = banner.hidden ? '' : `${banner.offsetHeight}px`; };
  function show(visible) {
    banner.hidden = !visible;
    reserveSpace();
  }
  if (typeof ResizeObserver === 'function') new ResizeObserver(reserveSpace).observe(banner);
  window.addEventListener('resize', reserveSpace);
  settings.hidden = false;
  settings.addEventListener('click', () => {
    returnFocus = settings;
    show(true);
    banner.querySelector('[data-cookie-choice]').focus();
  });

  function pageLocation() {
    const url = new URL(location.pathname === '/index.html' ? '/' : location.pathname, location.origin);
    const query = new URLSearchParams(location.search);
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_content', 'utm_term']) {
      const value = query.get(key);
      if (value && /^[a-z0-9_.-]{1,80}$/i.test(value)) url.searchParams.set(key, value);
    }
    return url.href;
  }
  function pageReferrer() {
    try {
      const url = new URL(document.referrer);
      return url.origin === location.origin ? `${url.origin}${url.pathname}` : `${url.origin}/`;
    } catch { return ''; }
  }
  function track(name, parameters = {}) {
    if (choice !== 'granted' || !started) return;
    window.gtag('event', name, { send_to: measurementId, page_location: pageLocation(),
      page_referrer: pageReferrer(), page_title: document.title, ...parameters });
  }
  function start() {
    if (started || choice !== 'granted' || location.hostname !== 'kalemvzw.be') return;
    started = true;
    window[`ga-disable-${measurementId}`] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false,
      page_location: pageLocation(), page_referrer: pageReferrer(), page_title: document.title,
      allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_expires: lifetime / 1000, cookie_update: false, cookie_flags: 'SameSite=Lax;Secure' });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(tag);
    track('page_view');
  }
  function clearAnalyticsCookies() {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (name !== '_ga' && !name.startsWith('_ga_')) continue;
      for (const domain of ['', `;domain=${location.hostname}`, `;domain=.${location.hostname}`]) {
        document.cookie = `${name}=;max-age=0;path=/${domain};SameSite=Lax;Secure`;
      }
    }
  }
  function decline() {
    window[`ga-disable-${measurementId}`] = true;
    clearAnalyticsCookies();
    // Reload stops an already loaded tag without sending a consent-withdrawal ping.
    if (started) location.reload();
  }
  banner.addEventListener('click', event => {
    const button = event.target.closest('[data-cookie-choice]');
    if (!button) return;
    choice = button.dataset.cookieChoice;
    try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, value: choice, time: Date.now() })); } catch {}
    show(false);
    if (returnFocus) returnFocus.focus();
    if (choice === 'granted') start();
    else decline();
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey) return;
    choice = storedChoice();
    show(!choice);
    if (choice === 'granted') start();
    else decline();
  });
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    const url = new URL(anchor.href);
    if (url.pathname.replace(/\/$/, '') !== '/kalemvzw') return;
    const channel = { 'www.instagram.com': 'instagram', 'www.facebook.com': 'facebook' }[url.hostname];
    if (channel) track('contact_intent', { contact_channel: channel, transport_type: 'beacon' });
  });
  show(!choice);
  if (choice === 'granted') start();
  else clearAnalyticsCookies();
})();
