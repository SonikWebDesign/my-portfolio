/* SONIK — dependency-free navigation, portfolio and enquiry interactions. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lang = 'bg';
  let selectedDesign = '';
  let previewKind = 'project';
  let previewTitle = '';
  const tr = (bg, en) => lang === 'bg' ? bg : en;
  const preview = $('#preview-dialog');
  preview.setAttribute('aria-labelledby', 'preview-title');

  function updatePreviewText() {
    $('#preview-kind').textContent = previewKind === 'template'
      ? tr('ПРИМЕРЕН ДИЗАЙН', 'DESIGN EXAMPLE') : tr('ИЗБРАН ПРОЕКТ', 'SELECTED WORK');
    $('#preview-description').textContent = previewKind === 'template'
      ? tr('Преглед на готов шаблон за вдъхновение. Финалният сайт се адаптира към Вашия бранд и договорения обхват.', 'A template preview for inspiration. The final website is adapted to your brand and agreed scope.')
      : tr('Визуално представяне от портфолиото на SONIK Web Design.', 'A visual presentation from the SONIK Web Design portfolio.');
  }

  function setLanguage(next) {
    lang = next === 'en' ? 'en' : 'bg';
    document.documentElement.lang = lang;
    $$('[data-bg][data-en]').forEach(el => { el.innerHTML = el.dataset[lang]; });
    $$('[data-bg-placeholder]').forEach(el => { el.placeholder = el.dataset[`${lang}Placeholder`]; });
    $$('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
    document.title = tr('Изработка на сайтове от 200 € | SONIK Web Design', 'Websites from €200 | SONIK Web Design');
    $('meta[name="description"]').content = tr(
      'Професионална изработка на сайтове от 200 €. 3D и motion дизайн, анимирани лога и рекламни видеа. Разгледайте проектите на SONIK и заявете индивидуална оферта.',
      'Professional websites from €200. 3D and motion design, animated logos and promotional videos. Explore SONIK’s work and request a tailored quote.'
    );
    $('#form-status').textContent = '';
    updatePreviewText();
    try { localStorage.setItem('sonik_lang', lang); } catch (_) { /* Optional preference. */ }
    document.dispatchEvent(new CustomEvent('sonik:language'));
  }
  let initialLang = 'bg';
  try { initialLang = localStorage.getItem('sonik_lang') || 'bg'; } catch (_) { /* BG remains the default. */ }
  setLanguage(initialLang);
  $$('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
  $('#year').textContent = new Date().getFullYear();

  const menuButton = $('.menu-toggle');
  const menu = $('#mobile-nav');
  function closeMenu(returnFocus = false) {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    menuButton.setAttribute('aria-expanded', String(!menu.hidden));
  });
  $$('a', menu).forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
  });
  window.matchMedia('(min-width: 851px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });

  // Each industry has its own native scroll-snap slideshow and retained position.
  const tabs = $$('[data-group]');
  const groups = $$('.design-group');
  function activateGroup(button, focus = false) {
    tabs.forEach(tab => {
      const active = tab === button;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    groups.forEach(group => {
      group.hidden = group.id !== button.getAttribute('aria-controls');
      if (!group.hidden && group.restoreSlide) group.restoreSlide();
    });
    if (focus) button.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateGroup(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activateGroup(tabs[next], true);
      }
    });
  });
  groups.forEach(group => {
    const track = $('.slide-track', group);
    const slides = $$('.design-slide', group);
    const prev = $('.slide-prev', group);
    const next = $('.slide-next', group);
    let current = 0;
    let pending = false;
    function update() {
      prev.disabled = current === 0;
      next.disabled = current === slides.length - 1;
      $('.slide-count', group).innerHTML = `${String(current + 1).padStart(2, '0')} <span>/ ${String(slides.length).padStart(2, '0')}</span>`;
      slides.forEach((slide, i) => { slide.inert = i !== current; });
    }
    function move(delta) {
      const target = Math.max(0, Math.min(slides.length - 1, current + delta));
      track.scrollTo({ left: target * track.clientWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', event => {
      if (event.target !== track) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    track.addEventListener('scroll', () => {
      if (pending || group.hidden) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        if (!track.clientWidth) return;
        current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
        update();
      });
    }, { passive: true });
    group.restoreSlide = () => {
      track.scrollTo({ left: current * track.clientWidth, behavior: 'instant' });
      update();
    };
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => { if (!group.hidden) group.restoreSlide(); }).observe(track);
    }
    update();
  });
  activateGroup(tabs[0]);

  function openDialog(dialog) {
    closeMenu();
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (!$('dialog[open]')) document.body.classList.remove('modal-open');
    });
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  });
  $$('[data-preview]').forEach(button => button.addEventListener('click', () => {
    previewTitle = button.dataset.title;
    previewKind = button.dataset.kind;
    $('#preview-title').textContent = previewTitle;
    $('#preview-image').src = button.dataset.preview;
    $('#preview-image').alt = previewTitle;
    updatePreviewText();
    openDialog(preview);
  }));
  $$('.privacy-trigger').forEach(button => button.addEventListener('click', () => openDialog($('#privacy-dialog'))));

  function chooseDesign(name) {
    selectedDesign = name;
    const message = $('#message');
    if (!message.value.trim()) message.value = tr(`Харесвам визията на ${name}. Моят бизнес е: `, `I like the ${name} design. My business is: `);
  }
  $('#choose-design').addEventListener('click', () => {
    chooseDesign(previewTitle);
    preview.close();
  });
  $$('[data-design]').forEach(link => link.addEventListener('click', () => chooseDesign(link.dataset.design)));
  $$('[data-plan]').forEach(link => link.addEventListener('click', () => {
    $('#project-type').value = link.dataset.plan;
  }));

  const form = $('#enquiry-form');
  function enquiryText() {
    const selected = $('#project-type').selectedOptions[0];
    return [tr('Здравейте, SONIK!', 'Hello SONIK!'), '',
      `${tr('Име', 'Name')}: ${$('#name').value.trim()}`,
      `${tr('Имейл', 'Email')}: ${$('#email').value.trim()}`,
      `${tr('Проект', 'Project')}: ${selected.textContent}`,
      selectedDesign ? `${tr('Харесан дизайн', 'Selected design')}: ${selectedDesign}` : '',
      '', $('#message').value.trim()].filter((line, index, all) => line || all[index - 1]).join('\n');
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const subject = tr('Запитване за сайт — SONIK', 'Website enquiry — SONIK');
    const link = document.createElement('a');
    link.href = `mailto:sonikwebco@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(enquiryText())}`;
    link.click();
    $('#form-status').textContent = tr(
      'Изпратете запитването от Вашата имейл програма. Ако тя не се отвори, копирайте текста и го изпратете на sonikwebco@gmail.com.',
      'Send the enquiry from your email app. If it did not open, copy the text and email it to sonikwebco@gmail.com.'
    );
  });
  $('#copy-enquiry').addEventListener('click', async () => {
    if (!form.reportValidity()) return;
    const text = enquiryText();
    try {
      await navigator.clipboard.writeText(text);
      $('#form-status').textContent = tr('Копирано. Изпратете текста на sonikwebco@gmail.com.', 'Copied. Send the text to sonikwebco@gmail.com.');
      $('#copy-fallback').hidden = true;
    } catch (_) {
      const fallback = $('#copy-fallback');
      fallback.hidden = false;
      fallback.value = text;
      fallback.focus();
      fallback.select();
      $('#form-status').textContent = tr('Копирайте избрания текст и го изпратете на sonikwebco@gmail.com.', 'Copy the selected text and email it to sonikwebco@gmail.com.');
    }
  });
  form.addEventListener('input', () => {
    $('#form-status').textContent = '';
    $('#copy-fallback').hidden = true;
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      $('.mobile-contact').classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0 }).observe($('#contact'));
  }
})();
