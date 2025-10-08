document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('site-header');
  if (!el) return;
  el.innerHTML = `
    <div class="brand"><div class="logo"></div><strong>Impact Ballistics</strong></div>
    <nav class="site-nav">
      <a href="/">Home</a>
      <a href="help.html">Help</a>
      <a href="screenshots.html">Screenshots</a>
      <a href="legal.html">Legal</a>
      <a href="privacy.html">Privacy</a>
    </nav>
  `;
});
// --- Watermark: apply on every page EXCEPT screenshots ---
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
    // make sure it stays off on screenshots
    b.style.backgroundImage = 'none';
  }
});
