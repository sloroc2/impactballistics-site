// header.js — single source of truth for the site header
document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('site-header');
  if (!mount) return;

  // Build header
  mount.innerHTML = `
    <div class="brand">
      <div class="logo" aria-hidden="true"></div>
      <strong>Impact Ballistics</strong>
    </div>

    <button class="header-toggle" aria-label="Menu" aria-expanded="false">☰</button>

    <nav class="site-nav" aria-label="Primary">
      <a href="index.html">Home</a>
      <a href="help.html">Help</a>
      <a href="screenshots.html">Screenshots</a>
      <a href="wind-hold-challenge.html">Wind Challenge</a>
      <a href="legal.html">Legal</a>
      <a href="privacy.html">Privacy</a>
    </nav>
  `;

  const toggle = mount.querySelector('.header-toggle');
  const nav = mount.querySelector('.site-nav');

  // Mobile toggle
  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    const openMenu = () => {
      nav.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    };
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Close on link click (mobile)
    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      closeMenu();
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
    // Auto-close when viewport grows past mobile breakpoint
    const mq = window.matchMedia('(min-width: 781px)');
    mq.addEventListener?.('change', (ev) => { if (ev.matches) closeMenu(); });
  }

  // Active link highlight (filename-based, ignores folders, query, and hash)
  const normalize = (url) => {
    try {
      const u = new URL(url, window.location.href);
      const file = u.pathname.split('/').filter(Boolean).pop() || 'index.html';
      return file.toLowerCase();
    } catch {
      return 'index.html';
    }
  };
  const current = normalize(window.location.href);
  mount.querySelectorAll('.site-nav a').forEach(a => {
    const target = normalize(a.getAttribute('href') || '');
    if (target === current) a.classList.add('is-active');
  });
});
