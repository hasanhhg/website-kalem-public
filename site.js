(() => {
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#site-nav');
  if (!toggle || !navigation) return;

  document.documentElement.classList.add('js');
  toggle.hidden = false;

  const setOpen = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Sluiten' : 'Menu';
    navigation.dataset.open = String(open);
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) setOpen(false);
  });
  matchMedia('(min-width: 1280px)').addEventListener('change', () => setOpen(false));
})();

(() => {
  const viewer = document.querySelector('.photo-viewer');
  if (!viewer || typeof viewer.showModal !== 'function') return;

  const image = viewer.querySelector('[data-viewer-image]');
  const caption = viewer.querySelector('#photo-viewer-caption');
  const position = viewer.querySelector('[data-photo-position]');
  const close = viewer.querySelector('.photo-viewer-close');
  const previous = viewer.querySelector('[data-photo-previous]');
  const next = viewer.querySelector('[data-photo-next]');
  let photos = [];
  let index = 0;
  let opener;

  const show = next => {
    index = (next + photos.length) % photos.length;
    const link = photos[index];
    const source = link.querySelector('img');
    image.width = Number(source.getAttribute('width'));
    image.height = Number(source.getAttribute('height'));
    image.alt = source.alt;
    image.src = link.href;
    caption.textContent = link.dataset.caption;
    position.textContent = `Foto ${index + 1} van ${photos.length}`;
  };

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-photo-view]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    photos = [...link.closest('[data-photo-collection]').querySelectorAll('a[data-photo-view]')];
    opener = link;
    show(photos.indexOf(link));
    viewer.showModal();
    document.body.classList.add('photo-viewer-open');
    close.focus();
  });
  close.addEventListener('click', () => viewer.close());
  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  viewer.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Tab' && event.shiftKey && document.activeElement === close) {
      event.preventDefault();
      next.focus();
    } else if (event.key === 'Tab' && !event.shiftKey && document.activeElement === next) {
      event.preventDefault();
      close.focus();
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  viewer.addEventListener('click', event => {
    const bounds = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) viewer.close();
  });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('photo-viewer-open');
    image.removeAttribute('src');
    opener?.focus({preventScroll:true});
  });
})();
