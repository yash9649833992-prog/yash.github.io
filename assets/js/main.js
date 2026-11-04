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

  // consistent emoji everywhere (Twemoji)
  if (window.twemoji) {
    try { twemoji.parse(document.body, { folder: 'svg', ext: '.svg', base: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/' }); } catch {}
  }

  // mobile menu
  const menuBtn = $('#menuBtn'), links = $('#navLinks');
  menuBtn.addEventListener('click', () => { menuBtn.classList.toggle('open'); links.classList.toggle('open'); });
  $$('a', links).forEach(a => a.addEventListener('click', () => { menuBtn.classList.remove('open'); links.classList.remove('open'); }));

  // scroll: progress bar, nav state, active link
  const nav = $('#nav'), progress = $('#progress');
  const sections = $$('main section[id]');
  const navAs = $$('#navLinks a');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', scrollY > 10);
    let cur = '';
    for (const s of sections) if (scrollY >= s.offsetTop - 180) cur = s.id;
    navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

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

  // radar chart
  const radar = $('#radar');
  if (radar) {
    const axes = [['Requirements', 95], ['Documentation', 92], ['Stakeholders', 93], ['Process & Gaps', 88], ['UAT', 88], ['Coordination', 87]];
    const cx = 200, cy = 160, R = 100, n = axes.length;
    const pt = (i, r) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    let s = '';
    [0.25, 0.5, 0.75, 1].forEach(k => { s += `<polygon points="${axes.map((_, i) => pt(i, R * k).join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-opacity=".12"/>`; });
    axes.forEach((_, i) => { const [x, y] = pt(i, R); s += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="currentColor" stroke-opacity=".12"/>`; });
    const poly = axes.map(([, v], i) => pt(i, (R * v) / 100).join(',')).join(' ');
    s += `<defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b7cff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>`;
    s += `<polygon class="radar-poly" points="${poly}" fill="url(#rg)" fill-opacity=".35" stroke="url(#rg)" stroke-width="2.5" stroke-linejoin="round"/>`;
    axes.forEach(([, v], i) => { const [x, y] = pt(i, (R * v) / 100); s += `<circle class="radar-dot" cx="${x}" cy="${y}" r="4.5" fill="#22d3ee" stroke="#0a0d16" stroke-width="1.5"/>`; });
    axes.forEach(([label], i) => {
      const [x, y] = pt(i, R + 22);
      const anchor = Math.abs(x - cx) < 8 ? 'middle' : x > cx ? 'start' : 'end';
      s += `<text x="${x}" y="${y + 4}" text-anchor="${anchor}" font-size="11.5" font-family="Inter,sans-serif" font-weight="600" fill="currentColor">${label}</text>`;
    });
    radar.innerHTML = s;
    radar.style.color = getComputedStyle(document.body).color;
    const poly_ = $('.radar-poly', radar), dots = $$('.radar-dot', radar);
    poly_.style.transformOrigin = `${cx}px ${cy}px`; poly_.style.transform = 'scale(0)'; poly_.style.transition = 'transform 1.2s cubic-bezier(.2,.8,.2,1)';
    dots.forEach(d => { d.style.opacity = 0; d.style.transition = 'opacity .5s 1s'; });
    radar.closest('.card').addEventListener('reveal', () => { poly_.style.transform = 'scale(1)'; dots.forEach(d => d.style.opacity = 1); });
    new MutationObserver(() => { radar.style.color = getComputedStyle(document.body).color; }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // reveal + counters
  const reveal = (el) => {
    el.classList.add('in-view');
    el.dispatchEvent(new Event('reveal'));
    $$('[data-count]', el).forEach(b => {
      if (b.dataset.done) return; b.dataset.done = 1;
      const end = +b.dataset.count, t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 1200); b.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { threshold: .12 });
    $$('.reveal').forEach(el => io.observe(el));
  } else $$('.reveal').forEach(reveal);

  // cursor glow
  const glow = $('#cursorGlow');
  addEventListener('pointermove', (e) => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, { passive: true });

  // tilt photo
  const card = $('#tilt');
  if (card && matchMedia('(hover:hover)').matches) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  }

  $('#year').textContent = new Date().getFullYear();
})();
