/* ===========================
   MARDAKHAY — main.js
   =========================== */

'use strict';

/* ── Custom Cursor ────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0, hoverCount = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  (function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  function onEnter() { hoverCount++; document.body.classList.add('cursor-hover'); }
  function onLeave() {
    hoverCount = Math.max(0, hoverCount - 1);
    if (hoverCount === 0) document.body.classList.remove('cursor-hover');
  }

  document.querySelectorAll('a, button, .bento-card, .service-card, .metric-cell')
    .forEach(el => { el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave); });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();


/* ── Navbar: scroll class + active link ──────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const navH = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;

  const sectionMap = {
    hero:      '#solutions',
    metrics:   '#solutions',
    solutions: '#solutions',
    services:  '#services',
    partners:  '#partners',
    cta:       '#partners',
  };

  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));

  function setActiveLink(sectionId) {
    const activeHref = sectionMap[sectionId] || null;
    navLinks.forEach(a => {
      a.classList.toggle('active', activeHref !== null && a.getAttribute('href') === activeHref);
    });
  }

  function getActiveSectionId() {
    const sections  = Array.from(document.querySelectorAll('section[id]'));
    const threshold = window.scrollY + navH() + 60;
    let active = sections[0]?.id || 'hero';
    for (const sec of sections) {
      if (threshold >= sec.getBoundingClientRect().top + window.scrollY) active = sec.id;
    }
    return active;
  }

  let lastId = '';
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    const id = getActiveSectionId();
    if (id !== lastId) { lastId = id; setActiveLink(id); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ── Mobile hamburger ─────────────────────────── */
(function initHamburger() {
  const btn    = document.querySelector('.nav-hamburger');
  const mobile = document.querySelector('.nav-mobile');
  if (!btn || !mobile) return;

  function openMenu() {
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    mobile.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    mobile.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => btn.classList.contains('open') ? closeMenu() : openMenu());
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();


/* ── Smooth scroll ────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
  });
});


/* ── Progress bar ─────────────────────────────── */
(function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
  }, { passive: true });
})();


/* ── Scroll reveal ────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); } });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
})();


/* ── Animated counters ────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    const raw = el.dataset.count;
    const suffix = raw.replace(/[\d.]/g, '');
    const target = parseFloat(raw);
    const dp = (raw.split('.')[1] || '').replace(/\D/g, '').length;
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1800, 1);
      el.textContent = (easeOutQuart(p) * target).toFixed(dp) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { animateCounter(entry.target); io.unobserve(entry.target); } });
  }, { threshold: 0.4 });

  counters.forEach(el => io.observe(el));
})();


/* ── Bento card spotlight ─────────────────────── */
(function initCardSpotlight() {
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
    }, { passive: true });
  });
})();


/* ── Terminal typing ──────────────────────────── */
(function initTerminal() {
  const terminal = document.querySelector('.card-terminal');
  if (!terminal) return;
  const lines = Array.from(terminal.querySelectorAll('.t-line'));
  const fullTexts = lines.map(l => { const t = l.textContent; l.textContent = ''; l.style.opacity = '0'; return t; });
  let started = false;

  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        typeNext(0);
      }
    });
  }, { threshold: 0.5 }).observe(terminal);

  function typeLine(text, el, done) {
    el.style.opacity = '1'; let i = 0;
    function next() {
      el.textContent = text.slice(0, i++);
      if (i <= text.length) setTimeout(next, 22 + Math.random() * 24);
      else setTimeout(done, 180);
    }
    next();
  }

  function typeNext(idx) {
    if (idx >= lines.length) return;
    typeLine(fullTexts[idx], lines[idx], () => typeNext(idx + 1));
  }
})();


/* ── Hero glitch flicker ──────────────────────── */
(function initGlitch() {
  const title = document.querySelector('.hero-title');
  if (!title) return;

  function flicker() {
    title.style.textShadow = '2px 0 rgba(74,124,255,.7), -2px 0 rgba(167,139,250,.5)';
    setTimeout(() => {
      title.style.textShadow = 'none';
      setTimeout(() => {
        title.style.textShadow = '-2px 0 rgba(74,124,255,.7), 2px 0 rgba(167,139,250,.5)';
        setTimeout(() => { title.style.textShadow = 'none'; }, 55);
      }, 120);
    }, 70);
  }

  function schedule() { setTimeout(() => { flicker(); schedule(); }, 5000 + Math.random() * 9000); }
  schedule();
})();


/* ── Hero orb parallax ────────────────────────── */
(function initParallax() {
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  const hero  = document.getElementById('hero');
  if (!orb1 && !orb2) return;

  window.addEventListener('mousemove', e => {
    const r = hero?.getBoundingClientRect();
    if (!r || r.bottom < 0 || r.top > window.innerHeight) return;
    const dx = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
    const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    if (orb1) orb1.style.transform = `translate(${dx * 22}px, ${dy * 18}px)`;
    if (orb2) orb2.style.transform = `translate(${-dx * 14}px, ${-dy * 12}px)`;
  }, { passive: true });
})();


/* ── Contact Modal ────────────────────────────── */
(function initModal() {
  const overlay  = document.getElementById('contact-modal');
  const form     = document.getElementById('contact-form');
  const status   = document.getElementById('form-status');
  const closeBtn = document.getElementById('modal-close');
  if (!overlay) return;

  function openModal() {
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => overlay.querySelector('.form-input')?.focus(), 350);
  }

  function closeModal() {
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (status) status.textContent = '';
  }

  document.querySelectorAll('[data-modal="open"]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openModal(); });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') closeModal();
  });

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name    = form.querySelector('[name="name"]').value.trim();
      const email   = form.querySelector('[name="email"]').value.trim();
      const message = form.querySelector('[name="message"]').value.trim();

      if (!name || !email || !message) {
        status.style.color   = '#f87171';
        status.textContent   = 'Please fill in all fields.';
        return;
      }

      status.style.color = '#4ade80';
      status.textContent = 'Request queued. We will respond shortly.';
      form.reset();
      setTimeout(closeModal, 1200);
    });
  }
})();
