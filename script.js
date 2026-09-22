const links = [...document.querySelectorAll('header nav a')];
const sections = links.map(link => document.querySelector(link.getAttribute('href')));
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(link => {
        const active = link.getAttribute('href') === '#' + entry.target.id;
        link.classList.toggle('active', active);
        if(active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  });
}, {rootMargin: '-15% 0px -60% 0px'});
sections.forEach(section => observer.observe(section));

/* Accessible image enlargement. */
document.addEventListener('DOMContentLoaded', () => {
  const viewer = document.querySelector('.image-viewer');
  if (!viewer) return;
  const enlarged = viewer.querySelector('.viewer-image');
  const caption = viewer.querySelector('.viewer-caption');
  let opener;
  let previousOverflow;
  document.querySelectorAll('.image-zoom').forEach(button => {
    button.addEventListener('click', () => {
      const source = button.querySelector('img');
      opener = button;
      enlarged.src = source.currentSrc || source.src;
      enlarged.alt = source.alt;
      caption.textContent = button.closest('figure').querySelector('figcaption')?.innerText || source.alt;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      viewer.showModal();
    });
  });
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target === viewer) viewer.close();
  });
  viewer.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow || '';
    enlarged.removeAttribute('src');
    opener?.focus({preventScroll:true});
  });
});
