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
