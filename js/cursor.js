// Precision Editorial Magnetic Cursor

export function initCursor() {
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  if (!cursor || !cursorRing) return;

  // Touch devices shouldn't show custom cursor
  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    cursorRing.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isHovered = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(renderRing);
  }
  requestAnimationFrame(renderRing);

  // Bind hover states to interactive elements
  const hoverSelector = 'a, button, input, [role="button"], .interactive, .kinetic-action, .project-card, .menu-control';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelector)) {
      if (!isHovered) {
        isHovered = true;
        document.body.classList.add('cursor-hover');
      }
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelector)) {
      if (isHovered) {
        isHovered = false;
        document.body.classList.remove('cursor-hover');
      }
    }
  });
}
