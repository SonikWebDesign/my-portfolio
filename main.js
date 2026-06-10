// SONIK Web Design - cleaned app script
// Fixes: duplicate declarations removed, single floating CTA, guarded DOM lookups, global handlers for inline onclick attributes.
(function () {
  'use strict';

  const TOTAL = 7;
  const CAMS = [
    { p: [0, 34, 125], rx: .18, ry: 0 },
    { p: [85, 14, 60], rx: .12, ry: .38 },
    { p: [-40, 25, 110], rx: .15, ry: -.22 },
    { p: [-55, -18, 78], rx: .22, ry: -.28 },
    { p: [30, 20, 95], rx: .14, ry: .25 },
    { p: [0, -55, 88], rx: .52, ry: .1 },
    { p: [0, 8, 48], rx: .08, ry: 0 }
  ];

  let currentSection = 0;
  let animatedSection = 0;
  let transitioning = false;
  let countersStarted = false;
  let lang = 'en';
  const mouse = { x: 0, y: 0 };

  let renderer = null;
  let scene = null;
  let camera = null;
  let galaxy = null;
  let dust = null;
  let core = null;
  let shardGroup = null;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  function updateDrawerActive(index) {
    $$('.d-nav-item').forEach((item, i) => item.classList.toggle('active-page', i === index));
  }

  function showPanel(index) {
    const panels = $$('.panel');
    const dots = $$('.d-btn');
    const hintDots = $$('.hint-dot');

    panels.forEach((panel, i) => {
      panel.classList.remove('active', 'exit-up', 'exit-down');
      if (i !== index) panel.classList.add(i < index ? 'exit-up' : 'exit-down');
    });

    if (panels[index]) panels[index].classList.add('active');
    dots.forEach((dot, i) => dot.classList.toggle('on', i === index));
    hintDots.forEach((dot, i) => dot.classList.toggle('on', i === index));
    updateDrawerActive(index);
    if (index === 3) startCounters();
  }

  function goTo(index) {
    const next = Math.max(0, Math.min(TOTAL - 1, Number(index) || 0));
    if (next === currentSection || transitioning) return;
    transitioning = true;
    currentSection = next;
    showPanel(next);
    window.setTimeout(() => { transitioning = false; }, 600);
  }

  function goNext() { if (currentSection < TOTAL - 1) goTo(currentSection + 1); }
  function goPrev() { if (currentSection > 0) goTo(currentSection - 1); }

  function openDrawer() {
    $('#drawer')?.classList.add('open');
    $('#drawer-overlay')?.classList.add('open');
    $('#hamBtn')?.classList.add('open');
  }

  function closeDrawer() {
    $('#drawer')?.classList.remove('open');
    $('#drawer-overlay')?.classList.remove('open');
    $('#hamBtn')?.classList.remove('open');
  }

  function navTo(index) {
    closeDrawer();
    window.setTimeout(() => goTo(index), 120);
  }

  function setLang(nextLang) {
    lang = nextLang === 'bg' ? 'bg' : 'en';
    $$('.lang-btn').forEach((button) => {
      const on = button.textContent.trim().toLowerCase() === lang;
      button.classList.toggle('on', on);
      button.style.background = on ? 'rgba(0,80,200,.08)' : 'transparent';
      button.style.color = on ? '#0055ff' : 'rgba(0,60,160,.35)';
    });

    $$('[data-en]').forEach((el) => {
      const value = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
      if (value && el.tagName !== 'CANVAS') el.innerHTML = value;
    });

    $$('[data-en-ph]').forEach((el) => {
      el.placeholder = el.getAttribute(`data-${lang}-ph`) || el.getAttribute('data-en-ph') || '';
    });
  }

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;

    function count(id, to, duration) {
      const el = document.getElementById(id);
      if (!el) return;
      let start = null;
      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        el.textContent = Math.floor(progress * to) + (progress === 1 && to >= 10 ? '+' : '');
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    count('s1', 120, 1800);
    count('s2', 85, 1800);
    count('s3', 5, 1200);
    count('s4', 20, 1500);
  }

  function toggleFloat() {
    const menu = $('#floatMenu');
    const btn = $('#floatMain');
    const icon = $('#floatIcon');
    const label = $('#floatLabel');
    if (!menu || !btn || !icon || !label) return;

    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    icon.textContent = isOpen ? '✕' : '✉';
    label.style.display = isOpen ? 'none' : '';
  }

  function closeFloat() {
    const menu = $('#floatMenu');
    const btn = $('#floatMain');
    const icon = $('#floatIcon');
    const label = $('#floatLabel');
    if (!menu || !btn || !icon || !label) return;

    menu.classList.remove('open');
    btn.classList.remove('open');
    icon.textContent = '✉';
    label.style.display = '';
  }

  function psNav(button, direction) {
    const slider = button.closest('.port-slider');
    if (!slider) return;
    const slides = $$('.port-slide', slider);
    const dots = $$('.ps-dot', slider);
    if (!slides.length) return;

    let index = parseInt(slider.dataset.idx || '0', 10);
    slides[index]?.classList.remove('port-slide-active');
    dots[index]?.classList.remove('ps-dot-on');

    index = (index + direction + slides.length) % slides.length;
    slides[index]?.classList.add('port-slide-active');
    dots[index]?.classList.add('ps-dot-on');
    slider.dataset.idx = String(index);
  }

  function psGoto(dot, index) {
    const slider = dot.closest('.port-slider');
    if (!slider) return;
    const slides = $$('.port-slide', slider);
    const dots = $$('.ps-dot', slider);
    if (!slides[index]) return;

    const current = parseInt(slider.dataset.idx || '0', 10);
    slides[current]?.classList.remove('port-slide-active');
    dots[current]?.classList.remove('ps-dot-on');
    slides[index].classList.add('port-slide-active');
    dots[index]?.classList.add('ps-dot-on');
    slider.dataset.idx = String(index);
  }

  function initNavigationEvents() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') goPrev();
    });

    let wheelLock = false;
    window.addEventListener('wheel', (event) => {
      if (event.target.closest('.port-slider,.port-cats,#p-portfolio,#p-services,#p-process,#p-contact,#p-pricing')) return;
      if (wheelLock) return;
      wheelLock = true;
      event.deltaY > 0 ? goNext() : goPrev();
      window.setTimeout(() => { wheelLock = false; }, 700);
    }, { passive: true });

    let touchY = 0;
    let touchX = 0;
    window.addEventListener('touchstart', (event) => {
      touchY = event.touches[0].clientY;
      touchX = event.touches[0].clientX;
    }, { passive: true });

    window.addEventListener('touchend', (event) => {
      if (event.target.closest('.port-slider,#drawer,#drawer-overlay,#float-cta,.float-menu')) return;
      const dy = touchY - event.changedTouches[0].clientY;
      const dx = touchX - event.changedTouches[0].clientX;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 45) dy > 0 ? goNext() : goPrev();
    }, { passive: true });

    document.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth - .5) * 2;
      mouse.y = (event.clientY / window.innerHeight - .5) * 2;
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('#float-cta')) closeFloat();
    });
  }

  function initPortfolioTouch() {
    let startX = 0;
    let startY = 0;
    let activeSlider = null;

    document.addEventListener('touchstart', (event) => {
      const slider = event.target.closest('.port-slider');
      if (!slider) {
        activeSlider = null;
        return;
      }
      activeSlider = slider;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (event) => {
      if (!activeSlider) return;
      const dx = startX - event.changedTouches[0].clientX;
      const dy = startY - event.changedTouches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 28) {
        const button = activeSlider.querySelector(dx > 0 ? '.ps-next' : '.ps-prev');
        if (button) button.click();
      }
    }, { passive: true });
  }

  function initCursor() {
    const curEl = $('#cur');
    const ringEl = $('#cur-ring');
    if (!curEl || !ringEl || !window.matchMedia('(pointer:fine)').matches) return;

    let cx = 0, cy = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (event) => {
      cx = event.clientX;
      cy = event.clientY;
      curEl.style.left = `${cx}px`;
      curEl.style.top = `${cy}px`;
    });

    (function animateRing() {
      rx += (cx - rx) * .18;
      ry += (cy - ry) * .18;
      ringEl.style.left = `${rx}px`;
      ringEl.style.top = `${ry}px`;
      requestAnimationFrame(animateRing);
    })();

    $$('a,button,.s-card,.d-btn').forEach((el) => {
      el.addEventListener('mouseenter', () => ringEl.classList.add('big'));
      el.addEventListener('mouseleave', () => ringEl.classList.remove('big'));
    });
  }

  function initVortexCanvas() {
    const canvas = $('#vortex-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 300;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 60 + Math.pow(Math.random(), 0.5) * Math.min(window.innerWidth, window.innerHeight) * 0.38;
      particles.push({
        angle,
        radius,
        speed: (0.0004 + Math.random() * 0.0006) * (Math.random() > .5 ? 1 : -1),
        size: Math.random() * 1.2 + 0.2,
        opacity: Math.random() * 0.4 + 0.05,
        hue: 200 + Math.random() * 40
      });
    }

    let time = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
      gradient.addColorStop(0, 'rgba(0,100,255,0.06)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.angle += p.speed;
        const wobble = Math.sin(time * 0.5 + p.angle) * 8;
        const x = cx + Math.cos(p.angle) * (p.radius + wobble);
        const y = cy + Math.sin(p.angle) * (p.radius + wobble) * 0.35;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,65%,${p.opacity})`;
        ctx.fill();
      });
      time += 0.016;
      requestAnimationFrame(draw);
    }
    draw();
  }

  function createGalaxyParticleSystem(count, radius, arms, colorA, colorB, spread, yScale) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c1 = new THREE.Color(colorA);
    const c2 = new THREE.Color(colorB);

    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * arms);
      const r = Math.pow(Math.random(), .52) * radius;
      const angle = (arm / arms) * Math.PI * 2 + r * .013 + (Math.random() - .5) * .55;
      const localSpread = spread * (1 - r / radius) * .5 + spread * .18;

      positions[i * 3] = Math.cos(angle) * r + (Math.random() - .5) * localSpread;
      positions[i * 3 + 1] = (Math.random() - .5) * radius * yScale;
      positions[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - .5) * localSpread;

      const color = c1.clone().lerp(c2, Math.random());
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ size: .5, vertexColors: true, transparent: true, opacity: .45, depthWrite: false, sizeAttenuation: true })
    );
  }

  function initScene() {
    if (typeof THREE === 'undefined') return;

    try {
      const canvas = $('#c');
      if (!canvas) return;

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0xedf2f8, 1);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 2000);

      galaxy = createGalaxyParticleSystem(22000, 150, 3, '#0088ff', '#003399', 16, .042);
      dust = createGalaxyParticleSystem(6000, 195, 2, '#88bbff', '#4477cc', 30, .055);
      scene.add(galaxy);
      scene.add(dust);

      const coreGeometry = new THREE.BufferGeometry();
      const corePositions = new Float32Array(2000 * 3);
      for (let i = 0; i < 2000; i++) {
        const r = Math.random() * 18;
        const a = Math.random() * Math.PI * 2;
        const b = Math.random() * Math.PI * 2;
        corePositions[i * 3] = Math.cos(a) * Math.cos(b) * r;
        corePositions[i * 3 + 1] = Math.sin(b) * r * .28;
        corePositions[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r;
      }
      coreGeometry.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
      core = new THREE.Points(coreGeometry, new THREE.PointsMaterial({ size: .9, color: 0x4499ff, transparent: true, opacity: .6, depthWrite: false }));
      scene.add(core);

      const starsGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(3500 * 3);
      for (let i = 0; i < 3500; i++) {
        starPositions[i * 3] = (Math.random() - .5) * 900;
        starPositions[i * 3 + 1] = (Math.random() - .5) * 900;
        starPositions[i * 3 + 2] = (Math.random() - .5) * 900;
      }
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      scene.add(new THREE.Points(starsGeometry, new THREE.PointsMaterial({ size: .18, color: 0x3366bb, transparent: true, opacity: .18 })));

      shardGroup = new THREE.Group();
      for (let i = 0; i < 16; i++) {
        const geometry = new THREE.OctahedronGeometry(Math.random() * 2 + .5, 0);
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(.6 + Math.random() * .05, .7, .55 + Math.random() * .2),
          wireframe: true,
          transparent: true,
          opacity: .12 + Math.random() * .18
        });
        const mesh = new THREE.Mesh(geometry, material);
        const r = 60 + Math.random() * 100;
        const a = Math.random() * Math.PI * 2;
        mesh.position.set(Math.cos(a) * r, (Math.random() - .5) * 40, Math.sin(a) * r);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        mesh.userData = {
          rx: (.002 + Math.random() * .004) * (Math.random() > .5 ? 1 : -1),
          ry: (.002 + Math.random() * .004) * (Math.random() > .5 ? 1 : -1),
          offset: Math.random() * Math.PI * 2,
          speed: .008 + Math.random() * .006
        };
        shardGroup.add(mesh);
      }
      scene.add(shardGroup);

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      let time = 0;
      const target = new THREE.Vector3();
      function lerp(a, b, t) { return a + (b - a) * t; }

      function animate() {
        requestAnimationFrame(animate);
        time += .001;
        animatedSection += (currentSection - animatedSection) * .055;
        const sectionA = Math.floor(animatedSection);
        const sectionB = Math.min(sectionA + 1, TOTAL - 1);
        const t = animatedSection - sectionA;
        const a = CAMS[sectionA];
        const b = CAMS[sectionB];

        target.set(
          lerp(a.p[0], b.p[0], t) + mouse.x * 3.5,
          lerp(a.p[1], b.p[1], t) - mouse.y * 2.5,
          lerp(a.p[2], b.p[2], t)
        );
        camera.position.lerp(target, .07);
        camera.lookAt(0, 0, 0);

        galaxy.rotation.x += (lerp(a.rx, b.rx, t) - galaxy.rotation.x) * .05;
        galaxy.rotation.y += (lerp(a.ry, b.ry, t) - galaxy.rotation.y) * .05;
        galaxy.rotation.z += .0007;
        dust.rotation.x = galaxy.rotation.x;
        dust.rotation.y = galaxy.rotation.y;
        dust.rotation.z = galaxy.rotation.z;
        core.rotation.y = galaxy.rotation.y;

        if (shardGroup) {
          shardGroup.children.forEach((mesh) => {
            mesh.rotation.x += mesh.userData.rx;
            mesh.rotation.y += mesh.userData.ry;
            mesh.position.y += Math.sin(time * mesh.userData.speed * 100 + mesh.userData.offset) * .04;
          });
          shardGroup.rotation.y += .0003;
        }

        renderer.render(scene, camera);
      }
      animate();
    } catch (error) {
      console.warn('Scene init error:', error);
    }
  }

  function loadThree() {
    if (typeof THREE !== 'undefined') {
      initScene();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = initScene;
    script.onerror = () => {
      const fallback = document.createElement('script');
      fallback.src = 'https://unpkg.com/three@0.128.0/build/three.min.js';
      fallback.onload = initScene;
      fallback.onerror = () => console.warn('Three.js failed to load; background animation disabled.');
      document.head.appendChild(fallback);
    };
    document.head.appendChild(script);
  }

  function init() {
    initNavigationEvents();
    initPortfolioTouch();
    initCursor();
    initVortexCanvas();
    showPanel(0);
    loadThree();
  }

  window.goTo = goTo;
  window.openDrawer = openDrawer;
  window.closeDrawer = closeDrawer;
  window.navTo = navTo;
  window.setLang = setLang;
  window.toggleFloat = toggleFloat;
  window.psNav = psNav;
  window.psGoto = psGoto;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


// === SONIK FINAL MOBILE CLICK FIX ===
(function(){
  function ready(fn){ if(document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    document.querySelectorAll('.hero-btns [data-target]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        var target = parseInt(btn.getAttribute('data-target'), 10);
        if (typeof window.goTo === 'function') window.goTo(target);
      }, { passive: false });
      btn.addEventListener('touchend', function(e){
        e.preventDefault();
        e.stopPropagation();
        var target = parseInt(btn.getAttribute('data-target'), 10);
        if (typeof window.goTo === 'function') window.goTo(target);
      }, { passive: false });
    });
  });
})();
