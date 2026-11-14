/* SONIK — site settings. This is the only place to edit.

   calendly: paste your Calendly link between the quotes, for example
             'https://calendly.com/your-name/15min'
             While it is empty, the "Book a 15-minute call" buttons stay hidden. */
window.SONIK_CONFIG = {
  calendly: ''
};

(() => {
  'use strict';
  const apply = () => {
    const link = (window.SONIK_CONFIG.calendly || '').trim();
    if (!/^https:\/\//.test(link)) return;
    document.querySelectorAll('[data-calendly]').forEach(el => {
      el.href = link;
      el.hidden = false;
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
