import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCursor } from './cursor.js';
import { initSoundSystem, toggleSound } from './sound.js';

gsap.registerPlugin(ScrollTrigger);

// ── SMOOTH SCROLL (LENIS) ──
const lenis = new Lenis({
  duration: 1.3,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 0.9,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

window.lenis = lenis;

// ── INITIALIZE CURSOR & AUDIO ──
initCursor();
initSoundSystem();

document.querySelectorAll('[data-sound-toggle]').forEach(btn => {
  btn.addEventListener('click', toggleSound);
});

// ── MASKED TEXT REVEALS ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.masked-line').forEach(el => {
  revealObserver.observe(el);
});

// Trigger initial hero reveals
setTimeout(() => {
  document.querySelectorAll('.case-hero .masked-line').forEach(el => {
    el.classList.add('revealed');
  });
}, 150);

// ── STICKY CONCEPT READING ASIDE & SCROLL SPY ──
const conceptLinks = document.querySelectorAll('.concept-index-link');
const stepArticles = document.querySelectorAll('.sequence-step');

if (conceptLinks.length > 0 && stepArticles.length > 0) {
  stepArticles.forEach((step, idx) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => updateActiveIndex(idx),
      onEnterBack: () => updateActiveIndex(idx),
    });
  });

  function updateActiveIndex(activeIdx) {
    conceptLinks.forEach((link, idx) => {
      if (idx === activeIdx) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  conceptLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          lenis.scrollTo(targetEl, { offset: -100, duration: 1.2 });
        }
      }
    });
  });
}
