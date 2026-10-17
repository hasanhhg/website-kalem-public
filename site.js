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
