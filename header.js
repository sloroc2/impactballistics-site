<script>
document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  if (!header) return;
  header.innerHTML = `
    <div class="brand"><div class="logo"></div><strong>Impact Ballistics</strong></div>
    <nav class="site-nav">
      <a href="/">Home</a>
      <a href="screenshots.html">Screenshots</a>
      <a href="help.html">Help</a>
      <a href="legal.html">Legal</a>
      <a href="privacy.html">Privacy</a>
    </nav>
  `;
});
</script>
