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

  const supportedLanguages = new Set(['bg', 'en']);
  function urlLanguage() {
    const value = new URL(window.location.href).searchParams.get('lang');
    const language = value ? value.toLowerCase() : '';
    return supportedLanguages.has(language) ? language : null;
  }
  function preferredLanguage() {
    const explicit = urlLanguage();
    if (explicit) return explicit;
    for (const locale of navigator.languages || [navigator.language]) {
      const language = (locale || '').toLowerCase().split(/[-_]/)[0];
      if (supportedLanguages.has(language)) return language;
    }
    return 'en';
  }
  function updateLanguageURL(language, mode) {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    if (url.href === window.location.href) return;
    try {
      history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url.href);
    } catch (_) { /* Local file previews may restrict History APIs. */ }
  }
  function setLanguage(next, { historyMode = 'replace' } = {}) {
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
    updatePreviewText();
    if (historyMode) updateLanguageURL(lang, historyMode);
    $('link[rel="canonical"]').href = `https://sonikwebdesign.com/?lang=${lang}`;
    $('meta[property="og:url"]').content = `https://sonikwebdesign.com/?lang=${lang}`;
    $('meta[property="og:locale"]').content = lang === 'bg' ? 'bg_BG' : 'en_GB';
    document.dispatchEvent(new CustomEvent('sonik:language'));
  }
  setLanguage(preferredLanguage());
  $$('[data-lang]').forEach(button => button.addEventListener('click', () => {
    setLanguage(button.dataset.lang, { historyMode: 'push' });
  }));
  window.addEventListener('popstate', () => setLanguage(preferredLanguage(), { historyMode: false }));
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
  let formState = 'idle';
  let lastSentFingerprint = '';
  const submitButton = $('.form-submit', form);
  const submitLabel = $('[data-bg]', submitButton);
  const editableFields = $$('input:not([type="hidden"]), select, textarea:not([readonly])', form);
  function fingerprint() {
    return JSON.stringify([$('#name').value.trim(), $('#email').value.trim(),
      $('#project-type').value, $('#message').value.trim(), selectedDesign]);
  }
  function updateFormUI() {
    form.dataset.formState = formState;
    const pending = formState === 'sending';
    form.setAttribute('aria-busy', String(pending));
    submitButton.disabled = pending || (formState === 'success' && fingerprint() === lastSentFingerprint);
    editableFields.forEach(field => { field.disabled = pending; });
    submitLabel.textContent = pending ? tr('Изпращане…', 'Sending…')
      : formState === 'success' ? tr('Запитването е прието', 'Enquiry received')
      : tr('Изпратете запитване', 'Send your enquiry');
    const messages = {
      idle: '',
      sending: tr('Изпращаме Вашето запитване…', 'Sending your enquiry…'),
      success: tr('Благодарим. Запитването Ви е прието. Ще отговорим на посочения имейл.',
        'Thank you. Your enquiry has been accepted. We’ll reply to the email address you provided.'),
      activation: tr('Формата все още се активира. Данните Ви са запазени тук. Можете да използвате контакта по имейл.',
        'The form is still being activated. Your details remain here. You can use our email contact.'),
      error: tr('Не получихме потвърждение за изпращането. Данните Ви са запазени тук. Проверете връзката и опитайте отново или използвайте контакта по имейл.',
        'We could not confirm submission. Your details remain here. Check your connection and try again, or use our email contact.')
    };
    $('#form-status').textContent = messages[formState] || '';
    $('#copy-enquiry').hidden = !['error', 'activation'].includes(formState);
  }
  function setFormState(state) {
    formState = state;
    updateFormUI();
  }
  document.addEventListener('sonik:language', updateFormUI);
  updateFormUI();

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (formState === 'sending' || (formState === 'success' && fingerprint() === lastSentFingerprint)) return;
    for (const field of [$('#name'), $('#message')]) {
      field.setCustomValidity(field.value.trim() ? '' : tr('Моля, попълнете това поле.', 'Please fill in this field.'));
    }
    if (!form.reportValidity()) return;
    if ($('#contact-website').value) {
      setFormState('error');
      return;
    }
    const draftFingerprint = fingerprint();
    const source = new URL(window.location.href);
    source.search = '';
    source.hash = '';
    source.searchParams.set('lang', lang);
    const payload = {
      name: $('#name').value.trim(),
      email: $('#email').value.trim(),
      service: $('#project-type').selectedOptions[0].textContent,
      message: $('#message').value.trim(),
      design: selectedDesign || tr('Няма избран дизайн', 'No design selected'),
      language: lang,
      _subject: tr('Ново запитване — SONIK', 'New enquiry — SONIK'),
      _replyto: $('#email').value.trim(),
      _template: 'table',
      _honey: '',
      _url: ['http:', 'https:'].includes(source.protocol) ? source.href : `https://sonikwebdesign.com/?lang=${lang}`
    };
    setFormState('sending');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const endpoint = form.action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: 'omit'
      });
      const result = await response.json();
      // Activation notices must never be shown as a delivered enquiry.
      if (typeof result.message === 'string' && /activat|confirm.{0,45}email|email.{0,45}confirm/i.test(result.message)) {
        setFormState('activation');
        return;
      }
      if (!response.ok || !(result.success === true || result.success === 'true')) {
        throw new Error('Submission was not confirmed');
      }
      lastSentFingerprint = draftFingerprint;
      setFormState('success');
      $('#copy-fallback').hidden = true;
    } catch (_) {
      setFormState('error');
    } finally {
      clearTimeout(timeout);
    }
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
  function editedEnquiry() {
    if (formState === 'sending') return;
    $('#name').setCustomValidity('');
    $('#message').setCustomValidity('');
    setFormState('idle');
    $('#copy-fallback').hidden = true;
  }
  form.addEventListener('input', editedEnquiry);
  form.addEventListener('change', editedEnquiry);
  $$('[data-design], [data-plan], #choose-design').forEach(button => button.addEventListener('click', editedEnquiry));


  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      $('.mobile-contact').classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0 }).observe($('#contact'));
  }
})();
