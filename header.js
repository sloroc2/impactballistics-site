// Build shared header
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('site-header');
  if (!el) return;

  el.innerHTML = `
    <div class="brand"><div class="logo"></div><strong>Impact Ballistics</strong></div>
    <nav class="site-nav">
      <a href="/">Home</a>
      <a href="help.html">Help</a>
      <a href="screenshots.html">Screenshots</a>
      <a href="wind-hold-challenge.html">Wind Challenge</a>
      <a href="legal.html">Legal</a>
      <a href="privacy.html">Privacy</a>
    </nav>
  `;

  // Highlight current page
  const path = location.pathname.replace(/^\//,'').toLowerCase() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach(a => {
    const href = a.getAttribute('href').toLowerCase();
    // treat "/" as index.html for highlight purposes
    const normalized = href === '/' ? 'index.html' : href;
    if (path === normalized) a.classList.add('active');
  });
});

// Site-wide watermark (off on screenshots page)
document.addEventListener('DOMContentLoaded', () => {
  const b = document.body;
  if (!b.classList.contains('screenshots')) {
    Object.assign(b.style, {
      backgroundImage: 'url("second_logo.png")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center 35%',
      backgroundAttachment: 'fixed',
      backgroundSize: '520px auto'
    });
  } else {
    b.style.backgroundImage = 'none';
  }
});
