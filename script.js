const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation.classList.toggle('is-open', !open);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  });
});

document.querySelectorAll('.external-link').forEach((link) => {
  const destination = link.dataset.destination;
  const url = window.BOX_LINKS?.[destination]?.trim();
  if (url) {
    link.href = url;
    return;
  }

  link.removeAttribute('href');
  link.removeAttribute('target');
  link.classList.add('is-unconfigured');
  link.setAttribute('aria-disabled', 'true');
  link.title = `Configure o link ${destination} em config.js`;
  link.tabIndex = -1;
});
