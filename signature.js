/* A 4.7-second signature, then zero animation work. No runtime dependencies. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const tr = (bg, en) => document.documentElement.lang === 'en' ? en : bg;
  const stage = $('#signature-stage');
  const play = $('#signature-play');
  const skip = $('#signature-skip');
  const duration = 4700;
  const animations = [];
  let elapsed = 0;
  let playing = true;
  let visible = true;
  let frame = null;
  let previous = 0;
  let lastCharacter = -1;
  let previousState = '';

  function animate(selector, keyframes, options = {}) {
    const animation = $(selector, stage).animate(keyframes, {
      duration, fill: 'both', easing: 'linear', ...options
    });
    animation.pause();
    animations.push(animation);
  }

  // Unsupported browsers retain the static logo and the working portfolio.
  if (stage && typeof stage.animate === 'function') {
    stage.classList.add('is-enhanced');
    $('.signature-toolbar').hidden = false;
    animate('.code-window', [
      { opacity: 0, transform: 'translateY(12px) scale(.97)', offset: 0 },
      { opacity: 1, transform: 'translateY(0) scale(1)', offset: .07 },
      { opacity: 1, transform: 'translateY(0) scale(1)', offset: .52 },
      { opacity: 0, transform: 'translateY(0) scale(.86)', offset: .665 },
      { opacity: 0, transform: 'translateY(0) scale(.86)', offset: 1 }
    ]);
    animate('.terminal-success', [
      { opacity: 0, offset: 0 }, { opacity: 0, offset: .48 },
      { opacity: 1, offset: .51 }, { opacity: 1, offset: 1 }
    ]);
    animate('.signature-reveal', [
      { opacity: 0, offset: 0 }, { opacity: 0, offset: .595 },
      { opacity: 1, offset: .665 }, { opacity: 1, offset: 1 }
    ]);
    [
      ['.piece-top', 'translate(-60px,-45px) rotate(-18deg)', 2790],
      ['.piece-middle', 'translate(65px,0) rotate(12deg)', 2910],
      ['.piece-bottom', 'translate(-40px,50px) rotate(-14deg)', 3030]
    ].forEach(([selector, transform, delay]) => animate(selector,
      [{ opacity: 0, transform }, { opacity: 1, transform: 'translate(0,0) rotate(0deg)' }],
      { duration: 680, delay, easing: 'cubic-bezier(.18,.72,.22,1)' }
    ));
    animate('.signature-wordmark', [
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 520, delay: 3340, easing: 'ease-out' });
    animate('.signature-line', [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 450, delay: 3540 });
    animate('.signature-tagline', [{ opacity: 0, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 600, delay: 3650 });
    animate('.signature-halo', [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 850, delay: 2980 });

    let length = 0;
    const tokens = $$('.token', stage).map(element => {
      const token = { element, text: element.dataset.code, start: length };
      length += token.text.length;
      return token;
    });
    const lines = $$('.line-content', stage);

    function render() {
      animations.forEach(animation => { animation.currentTime = elapsed; });
      const count = Math.min(length, Math.max(0, Math.floor((elapsed - 360) / 11)));
      if (count !== lastCharacter) {
        let cursorLine = lines[0];
        tokens.forEach(token => {
          const text = token.text.slice(0, Math.max(0, count - token.start));
          if (token.element.textContent !== text) token.element.textContent = text;
          if (count >= token.start) cursorLine = token.element.parentElement;
        });
        lines.forEach(line => line.classList.toggle('is-typing', line === cursorLine && count < length));
        lastCharacter = count;
      }
      stage.style.setProperty('--caret', Math.floor(elapsed / 300) % 2 ? '.25' : '1');
      stage.dataset.phase = elapsed < 2350 ? 'coding' : elapsed < 3150 ? 'building' : elapsed < duration ? 'revealing' : 'complete';
    }

    function labels() {
      const complete = elapsed >= duration;
      $('.signature-play-label').textContent = complete ? tr('Повтори', 'Replay') : playing ? tr('Пауза', 'Pause') : tr('Продължи', 'Play');
      $('.signature-play-icon').textContent = complete ? '↻' : playing ? 'Ⅱ' : '▷';
      skip.disabled = complete;
      const state = complete ? 'complete' : !playing ? 'paused' : elapsed < 2350 ? 'coding' : 'building';
      const label = {
        complete: tr('SONIK / от идея до присъствие', 'SONIK / from idea to presence'),
        paused: tr('Анимацията е на пауза', 'Animation paused'),
        coding: tr('01 / Всяка идея започва оттук', '01 / Every idea starts here'),
        building: tr('02 / Идеята получава своя знак', '02 / An idea finds its identity')
      }[state];
      if (previousState !== label) { $('.signature-state').textContent = label; previousState = label; }
      stage.setAttribute('aria-label', tr('Анимация: кодът се изписва в редактор и се превръща в златния знак SONIK.', 'Animation: code is typed in an editor, then transforms into the gold SONIK monogram.'));
    }

    function tick(now) {
      frame = null;
      if (previous) elapsed = Math.min(duration, elapsed + now - previous);
      previous = now;
      render();
      if (elapsed >= duration) playing = false;
      labels();
      if (playing && visible && !document.hidden) frame = requestAnimationFrame(tick);
      else previous = 0;
    }

    function sync() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previous = 0;
      if (playing && visible && !document.hidden) frame = requestAnimationFrame(tick);
      labels();
    }

    function finish() {
      elapsed = duration;
      playing = false;
      render();
      sync();
    }

    play.addEventListener('click', () => {
      if (elapsed >= duration) { elapsed = 0; playing = true; render(); }
      else playing = !playing;
      sync();
    });
    skip.addEventListener('click', () => { finish(); play.focus({ preventScroll: true }); });
    document.addEventListener('visibilitychange', sync);
    document.addEventListener('sonik:language', labels);
    motion.addEventListener('change', event => { if (event.matches) finish(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        sync();
      }, { threshold: .12 }).observe(stage);
    }
    // Capture a meaningful initial state before the first paint.
    if (motion.matches) finish();
    else { render(); sync(); }
  }

  const reel = $('.project-reel');
  const cards = $$('.reel-card', reel);
  const reelStage = $('.reel-stage', reel);
  let active = 3;
  function show(index) {
    active = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      const offset = (i - active + cards.length + 3) % cards.length - 3;
      card.style.setProperty('--offset', offset);
      card.style.setProperty('--distance', Math.abs(offset));
      card.style.zIndex = 10 - Math.abs(offset);
      card.classList.toggle('is-active', i === active);
      card.tabIndex = i === active ? 0 : -1;
      card.setAttribute('aria-current', String(i === active));
      if (Math.abs(offset) <= 1) $('img', card).loading = 'eager';
    });
    const card = cards[active];
    $('.reel-current', reel).textContent = card.dataset.title;
    $('.reel-current-kind', reel).textContent = `${card.dataset.kind === 'project' ? tr('Портфолио', 'Portfolio') : tr('Примерен дизайн', 'Design example')} · ${tr(card.dataset.categoryBg, card.dataset.categoryEn)}`;
    $('.reel-counter', reel).innerHTML = `${String(active + 1).padStart(2, '0')} <span>/ ${String(cards.length).padStart(2, '0')}</span>`;
  }
  $('.reel-prev', reel).addEventListener('click', () => show(active - 1));
  $('.reel-next', reel).addEventListener('click', () => show(active + 1));
  reel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const wasCard = event.target.classList.contains('reel-card');
    show(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1));
    if (wasCard) cards[active].focus({ preventScroll: true });
  });
  let start = null;
  let suppressClick = false;
  reelStage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    start = { x: event.clientX, y: event.clientY };
    suppressClick = false;
  }, { passive: true });
  reelStage.addEventListener('pointerup', event => {
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      show(active + (dx < 0 ? 1 : -1));
      suppressClick = true;
    }
    start = null;
  }, { passive: true });
  reelStage.addEventListener('pointercancel', () => { start = null; });
  reelStage.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
  }, true);
  document.addEventListener('sonik:language', () => show(active));
  show(active);

  const videos = $$('.motion-example video');
  videos.forEach(video => video.addEventListener('play', () => {
    videos.forEach(other => { if (other !== video) other.pause(); });
  }));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (!entry.isIntersecting) entry.target.pause(); });
    });
    videos.forEach(video => observer.observe(video));
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
  });
})();
