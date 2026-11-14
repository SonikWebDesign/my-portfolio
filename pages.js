/* SONIK — inner pages (services and case studies): menu and footer year. */
(() => {
  'use strict';
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const button = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-nav');
  if (!button || !menu) return;
  const close = (returnFocus = false) => {
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) button.focus();
  };
  button.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    button.setAttribute('aria-expanded', String(!menu.hidden));
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => close()));
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) close(true);
  });
})();
