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

/* Reveal once on entry; content stays readable without JavaScript. */
document.addEventListener('DOMContentLoaded', () => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...document.querySelectorAll('.profile-photo, .profile-copy, .stages-intro, .stage-heading, .school-milestone, .life-stage .milestone, .skills>h2, .skills-intro, .skill-card, .contact>.wrap>h2')];
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const reveal = element => { element.classList.add('is-visible'); element.classList.remove('reveal-pending'); };
    const entrance = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { reveal(entry.target); entrance.unobserve(entry.target); } });
    }, {threshold:0, rootMargin:'0px 0px -35px 0px'});
    targets.forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.classList.add('scroll-reveal', 'reveal-pending');
      entrance.observe(element);
    });
    // Keyboard navigation and reduced-motion changes never leave content hidden.
    document.addEventListener('focusin', event => {
      const target = event.target.closest('.reveal-pending');
      if(target) { reveal(target); entrance.unobserve(target); }
    });
    reduced.addEventListener('change', event => {
      if(event.matches) { targets.forEach(reveal); entrance.disconnect(); }
    });
  }
  const toggle = document.querySelector('.music-toggle');
  const audio = document.querySelector('.background-music');
  const label = toggle.querySelector('.music-label');
  let userMuted = false;
  let pending = false;
  let revision = 0;
  audio.volume = 0.45;
  const sync = () => {
    const playing = !audio.paused;
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Tắt nhạc Life Goes On của BTS' : 'Bật nhạc Life Goes On của BTS');
    toggle.title = playing ? 'Life Goes On · BTS — Bấm để tắt nhạc' : 'Life Goes On · BTS — Bấm để bật nhạc';
    label.textContent = playing ? 'Tắt nhạc' : 'Bật nhạc';
    toggle.classList.toggle('is-playing', playing);
  };
  const start = async () => {
    if (userMuted || pending || !audio.paused) return;
    pending = true;
    const attempt = revision;
    try {
      await audio.play();
      if (userMuted || attempt !== revision) audio.pause();
    } catch {
      // A later touch/click can satisfy the browser's playback policy.
    } finally { pending = false; sync(); }
  };
  const autoStart = event => {
    if (event.target instanceof Element && event.target.closest('.music-widget')) return;
    if (event.type === 'keydown' && !['Enter',' ','ArrowDown','PageDown'].includes(event.key)) return;
    if (!userMuted) start();
  };
  ['pointerdown','touchend','click','wheel','scroll','keydown'].forEach(type => {
    document.addEventListener(type, autoStart, {passive:true});
  });
  toggle.addEventListener('click', () => {
    if (!audio.paused || pending) {
      userMuted = true;
      revision++;
      audio.pause();
      sync();
    } else {
      userMuted = false;
      start();
    }
  });
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  audio.addEventListener('error', () => {
    label.textContent = 'Thử lại nhạc';
    toggle.setAttribute('aria-label', 'Không tải được nhạc, bấm để thử lại');
  });
  sync();
});
