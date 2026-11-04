(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // theme
  const root = document.documentElement;
  const saved = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
  if (saved) root.dataset.theme = saved;
  else if (window.matchMedia('(prefers-color-scheme: light)').matches) root.dataset.theme = 'light';
  $('#themeToggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
  });

  // mobile menu
  const menuBtn = $('#menuBtn'), links = $('#navLinks');
  menuBtn.addEventListener('click', () => { menuBtn.classList.toggle('open'); links.classList.toggle('open'); });
  $$('a', links).forEach(a => a.addEventListener('click', () => { menuBtn.classList.remove('open'); links.classList.remove('open'); }));

  // nav scrolled + active link
  const nav = $('#nav');
  const sections = $$('main section[id]');
  const navAs = $$('#navLinks a');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
    let cur = '';
    for (const s of sections) if (window.scrollY >= s.offsetTop - 160) cur = s.id;
    navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // typing effect
  const phrases = ['clear requirements.', 'user stories developers love.', 'BRDs that get built.', 'tested, delivered work.'];
  const typed = $('#typed'); let pi = 0, ci = 0, del = false;
  const tick = () => {
    const p = phrases[pi];
    typed.textContent = p.slice(0, ci);
    let wait = del ? 40 : 70;
    if (!del && ci === p.length) { wait = 1800; del = true; }
    else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 300; }
    ci += del ? -1 : 1;
    setTimeout(tick, wait);
  };
  tick();

  // reveal + counters + bars
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');
      $$('[data-count]', e.target).forEach(b => {
        if (b.dataset.done) return; b.dataset.done = 1;
        const end = +b.dataset.count, t0 = performance.now();
        const step = (t) => { const k = Math.min(1, (t - t0) / 1200); b.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
      io.unobserve(e.target);
    });
  }, { threshold: .15 });
  if ('IntersectionObserver' in window) $$('.reveal').forEach(el => io.observe(el));
  else $$('.reveal').forEach(el => el.classList.add('in-view'));

  // cursor glow
  const glow = $('#cursorGlow');
  window.addEventListener('pointermove', (e) => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, { passive: true });

  // tilt card
  const card = $('#tilt');
  if (card && window.matchMedia('(hover:hover)').matches) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  }

  $('#year').textContent = new Date().getFullYear();
})();
