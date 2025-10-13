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
      <a href="/">Home</a>
      <a href="help.html">Help</a>
      <a href="screenshots.html">Screenshots</a>
      <a href="wind-hold-challenge.html">Wind Challenge</a>
      <a href="legal.html">Legal</a>
      <a href="privacy.html">Privacy</a>
    </nav>
  `;

  // Mobile toggle
  const toggle = mount.querySelector('.header-toggle');
  const nav = mount.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Active link highlight
  const path = (location.pathname.replace(/^\//,'') || 'index.html').toLowerCase();
  mount.querySelectorAll('.site-nav a').forEach(a => {
    const href = a.getAttribute('href')?.replace(/^\//,'').toLowerCase() || '';
    const isHome = (path === 'index.html' || path === '');
    const match = (href === '/' && isHome) || (href && path.endsWith(href));
    if (match) a.classList.add('is-active');
  });
});
