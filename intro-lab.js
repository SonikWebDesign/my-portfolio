/* Three finite, seekable animation studies. Native DOM and Web Animations only. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const duration = 5600;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stage = $('.stage');
  const tabs = $$('[data-concept]');
  const range = $('#timeline');
  const playButton = $('#play-pause');
  const configs = {
    assembly: {
      label: '01 / THE ASSEMBLY', tone: 'gold', kicker: '01 / МАГНИТНО СГЛОБЯВАНЕ',
      title: 'Знакът се превръща в преживяване.',
      description: 'Три метални сегмента оформят собственото S на SONIK. Знакът освобождава място за лаптоп и телефон, а сайтът се появява в тях.',
      chapters: [[0, 'Сглобяване на монограм'], [1450, 'От знак до дигитално присъствие'], [3100, 'Една идентичност. Всеки екран.'], [4300, 'Впечатлението започва тук.']]
    },
    architecture: {
      label: '02 / THE ARCHITECTURE', tone: 'gold', kicker: '02 / СЛОЕВЕ И ПРЕЦИЗНОСТ',
      title: 'Професионализмът се вижда в детайлите.',
      description: 'Навигацията, съдържанието и изображенията стоят като отделни слоеве. Те се подреждат в завършен сайт, който се адаптира и към телефона.',
      chapters: [[0, 'Разгърната структура'], [1650, 'Всеки елемент намира своето място'], [3350, 'Завършен сайт. Мобилна версия.'], [4350, 'Всеки детайл изгражда доверие.']]
    },
    signal: {
      label: '03 / THE SIGNAL', tone: 'ice', kicker: '03 / СВЕТЛИНА И ИМПУЛС',
      title: 'Една идея. Сигнал за ново начало.',
      description: 'Светлинен импулс очертава S, след това рисува лаптоп и телефон. Сканиращ лъч включва готовото дигитално присъствие.',
      chapters: [[0, 'Началният импулс'], [850, 'Сигнатурата на SONIK'], [2100, 'Светлината оформя устройствата'], [3100, 'Дигиталното присъствие оживява'], [4550, 'Идеята Ви. Следващото ѝ ниво.']]
    }
  };

  const siteHTML = () => `<div class="site"><div class="site-header"><span class="site-wordmark"><img src="sonik-monogram.svg" alt="">SONIK</span><span class="site-nav">СТУДИО ПРОЕКТИ КОНТАКТ</span></div><div class="site-main"><div class="site-copy"><span class="site-overline">PRECISE DESIGN. LASTING IMPRESSION.</span><h3>Създадено,<br><em>за да впечатлява.</em></h3><p>Дизайн с характер. Присъствие, което представя стойността на Вашия бизнес.</p><span class="site-cta">ОБСЪДЕТЕ ПРОЕКТ ↗</span></div><div class="site-art"><img src="sonik-monogram.svg" alt=""></div></div><div class="site-projects"><div class="mini-project"><img src="work-nima.webp" alt=""><span>NIMA Optical<small>BRAND EXPERIENCE</small></span></div><div class="mini-project"><img src="work-woodra.webp" alt=""><span>Woodra A-Frame<small>DIGITAL HOSPITALITY</small></span></div></div></div>`;
  $$('[data-devices]').forEach(group => {
    group.setAttribute('aria-label', 'Лаптоп и телефон с адаптивна концепция за сайта на SONIK');
    group.setAttribute('role', 'img');
    group.innerHTML = `<div class="device-shadow"></div><div class="laptop"><div class="laptop-screen"><span class="camera"></span><div class="screen-inner">${siteHTML()}</div></div><div class="laptop-base"></div></div><div class="phone"><span class="phone-island"></span><div class="phone-screen">${siteHTML()}</div></div>`;
  });

  let active = 'assembly';
  let current = 0;
  let playing = false;
  let frameId = 0;
  let baseTime = 0;
  let animations = [];
  let currentChapter = '';
  const ease = 'cubic-bezier(.2,.75,.15,1)';
  function add(selector, frames, start, end, easing = ease) {
    const nodes = typeof selector === 'string' ? $$(selector, $(`#panel-${active}`)) : [selector];
    nodes.forEach(el => {
      const animation = el.animate(frames, { duration: Math.max(1, end - start), delay: start, fill: 'both', easing });
      animation.pause();
      animation.currentTime = 0;
      animations.push(animation);
    });
  }
  function fade(selector, start, end) { add(selector, [{ opacity: 0 }, { opacity: 1 }], start, end); }
  function appear(selector, from, start, end) { add(selector, [{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }], start, end); }
  function vanish(selector, start, end) { add(selector, [{ opacity: 1 }, { opacity: 0 }], start, end); }
  function ending(start = 4050) {
    appear('.scene-ending', 'translateY(19px)', start, start + 720);
    add('.ending-rule', [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], start - 130, start + 550);
  }
  function draw(selector, start, end) {
    const el = $(selector, $(`#panel-${active}`));
    const length = el.getTotalLength();
    el.style.strokeDasharray = `${length}`;
    add(el, [{ strokeDashoffset: length }, { strokeDashoffset: 0 }], start, end, 'cubic-bezier(.4,0,.25,1)');
  }
  function buildAssembly() {
    add('.piece-a', [{ opacity: 0, transform: 'translate(-230px,-175px) rotate(-42deg) scale(.7)' }, { opacity: 1, transform: 'translate(4px,3px) rotate(1deg)', offset: .84 }, { opacity: 1, transform: 'none' }], 0, 1120);
    add('.piece-b', [{ opacity: 0, transform: 'translate(280px,-20px) rotate(52deg) scale(.7)' }, { opacity: 1, transform: 'translate(-4px,0) rotate(-1deg)', offset: .84 }, { opacity: 1, transform: 'none' }], 140, 1230);
    add('.piece-c', [{ opacity: 0, transform: 'translate(-110px,210px) rotate(35deg) scale(.7)' }, { opacity: 1, transform: 'translate(2px,-3px) rotate(1deg)', offset: .84 }, { opacity: 1, transform: 'none' }], 260, 1330);
    fade('.scene-halo', 0, 1350);
    add('.orbit-a', [{ opacity: 0, transform: 'scale(.65)' }, { opacity: .8, transform: 'scale(1)', offset: .5 }, { opacity: 0, transform: 'scale(1.25)' }], 400, 2060);
    add('.orbit-b', [{ opacity: 0, transform: 'scale(.8) rotate(0deg)' }, { opacity: .5, transform: 'scale(1) rotate(14deg)', offset: .5 }, { opacity: 0, transform: 'scale(1.1) rotate(22deg)' }], 430, 2260);
    add('.logo-glint', [{ opacity: 0, transform: 'translateX(-140px)' }, { opacity: .65, offset: .4 }, { opacity: 0, transform: 'translateX(140px)' }], 980, 1660);
    add('.scene-flare', [{ opacity: 0, transform: 'scaleX(.2)' }, { opacity: .85, offset: .25 }, { opacity: 0, transform: 'scaleX(1.65)' }], 1220, 1810);
    add('.assembly-mark', [{ transform: 'scale(1.18)' }, { transform: 'translate(-350px,-165px) scale(.25)' }], 1580, 2400);
    fade('.assembly-wordmark', 720, 1380);
    add('.assembly-wordmark', [{ transform: 'none' }, { transform: 'translate(-269px,-326px) scale(.42)' }], 1580, 2410);
    vanish('.assembly-wordmark span', 1590, 1900);
    appear('.assembly-devices', 'translateY(95px) scale(.78)', 1680, 2950);
    add('.laptop-screen', [{ transform: 'rotateX(-86deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], 1850, 3150);
    appear('.laptop-base', 'scaleX(.75)', 1770, 2490);
    add('.laptop .screen-inner', [{ opacity: .1 }, { opacity: 1 }], 2380, 2920);
    appear('.laptop .site-header', 'translateY(-18px)', 2570, 3270);
    appear('.laptop .site-copy', 'translateY(28px)', 2730, 3500);
    appear('.laptop .site-art', 'translateX(40px) rotateY(-20deg)', 2800, 3670);
    appear('.laptop .site-projects', 'translateY(25px)', 2940, 3800);
    appear('.phone', 'translate(160px,80px) rotateY(-32deg) rotateZ(9deg)', 3140, 4220);
    ending(4200);
  }
  function buildArchitecture() {
    fade('.technical-grid', 0, 900);
    add('.laptop-screen', [{ opacity: .1, transform: 'rotateX(11deg) rotateY(-10deg) translateY(12px)' }, { opacity: .25, offset: .46 }, { opacity: 1, transform: 'none' }], 0, 3200);
    appear('.laptop-base', 'translateY(68px) scaleX(.8)', 1650, 3270);
    fade('.device-shadow', 1700, 3100);
    const layers = [
      ['.laptop .site-header', 'translate3d(-36px,-112px,90px) rotate(-3deg)', 150, 3060],
      ['.laptop .site-copy', 'translate3d(-107px,-7px,155px) rotate(-3deg)', 270, 3220],
      ['.laptop .site-art', 'translate3d(118px,-49px,170px) rotate(5deg)', 400, 3360],
      ['.laptop .site-projects', 'translate3d(27px,89px,115px) rotate(2deg)', 550, 3480]
    ];
    layers.forEach(([selector, exploded, start, end]) => add(selector, [
      { opacity: 0, transform: exploded }, { opacity: 1, transform: exploded, offset: .24 },
      { opacity: 1, transform: exploded, offset: .47 }, { opacity: 1, transform: 'none' }
    ], start, end, 'cubic-bezier(.25,.6,.2,1)'));
    add('.measure', [{ opacity: 0 }, { opacity: .75, offset: .18 }, { opacity: .75, offset: .68 }, { opacity: 0 }], 550, 3440);
    add('.layer-label', [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none', offset: .24 }, { opacity: 1, offset: .66 }, { opacity: 0 }], 380, 2990);
    appear('.phone', 'translate(90px,35px) rotateY(-32deg)', 3350, 4410);
    appear('.architecture-signature', 'translateY(10px)', 3540, 4200);
    ending(4290);
  }
  function buildSignal() {
    draw('.pulse-line', 0, 1210);
    add('.pulse-line', [{ opacity: .7 }, { opacity: 1, offset: .63 }, { opacity: 0 }], 0, 1660);
    draw('.signal-s', 730, 1580);
    add('.signal-s', [{ opacity: 0 }, { opacity: 1, offset: .28 }, { opacity: 1, offset: .65 }, { opacity: 0 }], 650, 2240);
    add('.signal-ring', [{ opacity: 0, transform: 'scale(.6)' }, { opacity: .7, offset: .15 }, { opacity: 0, transform: 'scale(3)' }], 1480, 2660);
    fade('.signal-aura', 1000, 3500);
    draw('.screen-outline', 1810, 2860);
    draw('.base-outline', 2180, 2900);
    draw('.phone-outline', 2490, 3250);
    add('.screen-outline,.base-outline', [{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .57 }, { opacity: 0 }], 1740, 4070);
    add('.phone-outline', [{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .63 }, { opacity: 0 }], 2400, 4350);
    fade('.signal-devices', 2790, 3950);
    add('.laptop .screen-inner', [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], 2890, 3910, 'cubic-bezier(.4,0,.3,1)');
    add('.light-scan', [{ opacity: 0, transform: 'translateX(0px)' }, { opacity: .9, offset: .1 }, { opacity: .9, offset: .87 }, { opacity: 0, transform: 'translateX(610px)' }], 2890, 3910, 'cubic-bezier(.4,0,.3,1)');
    appear('.phone', 'translateY(12px)', 3440, 4300);
    add('.phone-screen', [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], 3500, 4280);
    appear('.signal-logo', 'translateX(-15px)', 3700, 4430);
    ending(4400);
  }

  function render(time) {
    current = Math.max(0, Math.min(duration, time));
    animations.forEach(animation => { animation.currentTime = current; });
    range.value = String(Math.round(current));
    $('#time').textContent = `${(current / 1000).toFixed(1)} / 5.6 s`;
    const chapter = configs[active].chapters.filter(([t]) => t <= current).at(-1)[1];
    if (chapter !== currentChapter) { $('#chapter').textContent = chapter; currentChapter = chapter; }
    stage.dataset.progress = String(Math.round(current));
  }
  function updatePlayback() {
    playButton.textContent = playing ? 'Ⅱ' : '▶';
    playButton.setAttribute('aria-label', playing ? 'Пауза' : 'Пусни анимацията');
    stage.dataset.state = playing ? 'playing' : current >= duration ? 'complete' : 'paused';
  }
  function pause() { playing = false; cancelAnimationFrame(frameId); frameId = 0; updatePlayback(); }
  function tick(now) {
    if (!playing) return;
    render(now - baseTime);
    if (current >= duration) pause(); else frameId = requestAnimationFrame(tick);
  }
  function play() {
    if (reduced.matches) { render(duration); pause(); return; }
    if (current >= duration) render(0);
    playing = true;
    baseTime = performance.now() - current;
    updatePlayback();
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(tick);
  }
  function activate(concept, autoPlay = true) {
    if (!configs[concept]) concept = 'assembly';
    pause();
    animations.forEach(animation => animation.cancel());
    animations = [];
    active = concept;
    tabs.forEach(tab => {
      const isActive = tab.dataset.concept === concept;
      tab.setAttribute('aria-selected', String(isActive)); tab.tabIndex = isActive ? 0 : -1;
      $(`#panel-${tab.dataset.concept}`).hidden = !isActive;
    });
    const config = configs[active];
    stage.dataset.tone = config.tone;
    stage.dataset.concept = active;
    $('#stage-label').textContent = config.label;
    $('#concept-kicker').textContent = config.kicker;
    $('#concept-title').textContent = config.title;
    $('#concept-description').textContent = config.description;
    ({ assembly: buildAssembly, architecture: buildArchitecture, signal: buildSignal })[active]();
    render(reduced.matches ? duration : 0);
    $('#reduced-note').hidden = !reduced.matches;
    if (autoPlay && !reduced.matches) play(); else updatePlayback();
    const url = new URL(location.href); url.searchParams.set('concept', active);
    try { history.replaceState(null, '', url); } catch (_) { /* Direct local files still work. */ }
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab.dataset.concept));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); activate(tabs[next].dataset.concept); tabs[next].focus(); }
    });
  });
  playButton.addEventListener('click', () => playing ? pause() : play());
  $('#replay').addEventListener('click', () => { pause(); render(0); play(); });
  $('#skip').addEventListener('click', () => { pause(); render(duration); updatePlayback(); });
  range.addEventListener('input', () => { pause(); render(Number(range.value)); updatePlayback(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  reduced.addEventListener('change', () => activate(active, false));
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); }, { threshold: 0 }).observe(stage);
  function resize() {
    const box = $('.canvas-wrap').getBoundingClientRect();
    const scale = Math.min((box.width - 8) / 1000, (box.height - 48) / 620);
    $$('.rig').forEach(rig => rig.style.setProperty('--rig-scale', String(scale)));
  }
  new ResizeObserver(resize).observe($('.canvas-wrap'));
  resize();
  activate(new URLSearchParams(location.search).get('concept') || 'assembly');
})();
