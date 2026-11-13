import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCursor } from './js/cursor.js';
import { initSoundSystem, toggleSound, setSoundEnabled, playClickSound, playHoverSound } from './js/sound.js';

gsap.registerPlugin(ScrollTrigger);

// ── INITIALIZE HARDWARE ACCELERATED SMOOTH SCROLL (LENIS) ──
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 0.9,
  touchMultiplier: 1.8,
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

// Export lenis instance for external anchor links
window.lenis = lenis;

// ── INITIALIZE CURSOR & SOUND ──
initCursor();
initSoundSystem();

// ── SOUND TOGGLE CONTROLS ──
document.querySelectorAll('[data-sound-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    toggleSound();
  });
});

// ── PRELOADER & ENTRANCE SEQUENCE ──
const preloader = document.getElementById('preloader');
const preloaderCounter = document.getElementById('preloader-counter');
const preloaderFill = document.getElementById('preloader-fill');
const quietBtn = document.getElementById('entry-quiet');
const soundBtn = document.getElementById('entry-sound');
const reduceMotionBtn = document.getElementById('reduce-motion-btn');

let progress = 0;
let counterInterval = null;

function runCounter() {
  if (!preloaderCounter || !preloaderFill) return;
  
  counterInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(counterInterval);
      preloaderCounter.textContent = '100%';
      preloaderFill.style.transform = 'scaleX(1)';
      if (preloader) {
        preloader.classList.add('ready');
      }
    } else {
      preloaderCounter.textContent = `${progress.toString().padStart(2, '0')}%`;
      preloaderFill.style.transform = `scaleX(${progress / 100})`;
    }
  }, 35);
}

function dismissPreloader(enableSoundChoice) {
  setSoundEnabled(enableSoundChoice);
  if (preloader) {
    preloader.classList.add('dismissed');
  }
  
  // Trigger Hero Masked Reveals
  setTimeout(() => {
    document.querySelectorAll('.hero-experience .masked-line').forEach(el => {
      el.classList.add('revealed');
    });
  }, 200);
}

if (quietBtn) {
  quietBtn.addEventListener('click', () => dismissPreloader(false));
}
if (soundBtn) {
  soundBtn.addEventListener('click', () => dismissPreloader(true));
}

// Auto-fallback if user doesn't click within 7s
setTimeout(() => {
  if (preloader && !preloader.classList.contains('dismissed')) {
    dismissPreloader(false);
  }
}, 7000);

// Run preloader counter
runCounter();

// Reduce Motion Toggle
if (reduceMotionBtn) {
  reduceMotionBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('reduce-motion');
    const isReduced = document.documentElement.classList.contains('reduce-motion');
    reduceMotionBtn.textContent = isReduced ? 'Motion: Reduced' : 'Reduce motion';
  });
}

// ── FULLSCREEN ARCHITECTURAL MENU ──
const menuTrigger = document.getElementById('menu-trigger');
const fullscreenMenu = document.getElementById('fullscreen-menu');
const menuClose = document.getElementById('menu-close');
const menuLinks = document.querySelectorAll('.menu-nav-link');

function openMenu() {
  if (fullscreenMenu) {
    fullscreenMenu.classList.add('open');
    fullscreenMenu.setAttribute('aria-hidden', 'false');
    if (menuTrigger) {
      menuTrigger.textContent = 'CLOSE';
      menuTrigger.setAttribute('aria-expanded', 'true');
    }
    if (window.lenis) {
      window.lenis.stop();
    }
  }
}

function closeMenu() {
  if (fullscreenMenu) {
    fullscreenMenu.classList.remove('open');
    fullscreenMenu.setAttribute('aria-hidden', 'true');
    if (menuTrigger) {
      menuTrigger.textContent = 'MENU';
      menuTrigger.setAttribute('aria-expanded', 'false');
    }
    if (window.lenis) {
      window.lenis.start();
    }
  }
}

if (menuTrigger) {
  menuTrigger.addEventListener('click', () => {
    if (fullscreenMenu && fullscreenMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

if (menuClose) {
  menuClose.addEventListener('click', closeMenu);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && fullscreenMenu && fullscreenMenu.classList.contains('open')) {
    closeMenu();
  }
});

menuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      closeMenu();
      const target = document.querySelector(href);
      if (target) {
        lenis.scrollTo(target, { offset: -40, duration: 1.6 });
      }
    }
  });
});

// ── LIVE LOCAL TIME TICKER (PKT UTC+5) ──
function updateTime() {
  const clockElements = document.querySelectorAll('[data-live-time]');
  const now = new Date();
  
  // Format in PKT (Pakistan Standard Time, UTC+5)
  const options = {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const timeString = `PKT (UTC+5) ${formatter.format(now)}`;
  
  clockElements.forEach(el => {
    el.textContent = timeString;
  });
}
setInterval(updateTime, 1000);
updateTime();

// ── MASKED TEXT REVEALS ON SCROLL ──
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -10% 0px',
  threshold: 0.1
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, observerOptions);

document.querySelectorAll('.masked-line').forEach(el => {
  revealObserver.observe(el);
});

// ── CONTINUOUS SVG PATH PROGRESSION IN SELECTED WORK ──
const workConnectingPath = document.getElementById('work-connecting-path');
const workSection = document.getElementById('work');

if (workConnectingPath && workSection) {
  ScrollTrigger.create({
    trigger: workSection,
    start: 'top 70%',
    end: 'bottom 80%',
    scrub: 0.6,
    onUpdate: (self) => {
      const pathLength = workConnectingPath.getTotalLength ? workConnectingPath.getTotalLength() : 1000;
      const draw = pathLength * (1 - self.progress);
      workConnectingPath.style.strokeDashoffset = draw;
    }
  });
}

// ── INTERACTIVE HERO CANVAS: ARCHITECTURAL GEOMETRIC MESH ──
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX - width / 2) * 0.05;
    mouse.targetY = (e.clientY - height / 2) * 0.05;
  });

  // Orbital rings configuration
  const rings = [
    { radius: 180, speed: 0.003, tilt: 0.45, angle: 0, points: 6 },
    { radius: 320, speed: -0.002, tilt: 0.7, angle: Math.PI / 4, points: 8 },
    { radius: 480, speed: 0.0015, tilt: 0.3, angle: Math.PI / 2, points: 12 },
  ];

  function draw() {
    ctx.clearRect(0, 0, width, height);

    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    const centerX = width * 0.65 + mouse.x;
    const centerY = height * 0.5 + mouse.y;

    rings.forEach((ring, idx) => {
      ring.angle += ring.speed;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(1, ring.tilt);
      ctx.rotate(ring.angle);

      // Ring stroke
      ctx.beginPath();
      ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = idx === 1 ? 'rgba(228, 225, 217, 0.09)' : 'rgba(228, 225, 217, 0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Geometry points along ring
      for (let i = 0; i < ring.points; i++) {
        const ptAngle = (i / ring.points) * Math.PI * 2;
        const px = Math.cos(ptAngle) * ring.radius;
        const py = Math.sin(ptAngle) * ring.radius;

        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(228, 225, 217, 0.35)';
        ctx.fill();

        // Delicate spokes
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(px, py);
          ctx.strokeStyle = 'rgba(228, 225, 217, 0.025)';
          ctx.stroke();
        }
      }

      ctx.restore();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ── ONE-CLICK EMAIL COPY WITH TACTILE TOAST ──
const copyEmailBtn = document.getElementById('copy-email-btn');
if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('areebazhar3@gmail.com').then(() => {
      const originalText = copyEmailBtn.textContent;
      copyEmailBtn.textContent = 'COPIED TO CLIPBOARD ✓';
      copyEmailBtn.style.borderColor = 'var(--paper-bright)';
      copyEmailBtn.style.color = 'var(--paper-bright)';
      playClickSound();
      
      setTimeout(() => {
        copyEmailBtn.textContent = originalText;
        copyEmailBtn.style.borderColor = '';
        copyEmailBtn.style.color = '';
      }, 2500);
    });
  });
}
