// Web Audio API Micro-sound Synthesizer
// Precision-crafted haptic clicks and architectural chimes

let audioCtx = null;
let soundEnabled = false;

function initAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  try {
    sessionStorage.setItem('portfolio_sound_enabled', enabled ? 'true' : 'false');
  } catch (e) {}

  if (enabled) {
    initAudioContext();
  }

  // Update all sound toggle buttons in UI
  document.querySelectorAll('[data-sound-toggle]').forEach(btn => {
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    btn.setAttribute('title', enabled ? 'Sound active — click to mute' : 'Sound muted — click to enable');
    const label = btn.querySelector('.sound-label');
    if (label) {
      label.textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
    }
    const wave = btn.querySelector('.sound-wave');
    if (wave) {
      wave.classList.toggle('playing', enabled);
    }
  });
}

export function toggleSound() {
  setSoundEnabled(!soundEnabled);
  if (soundEnabled) {
    playClickSound();
  }
}

// Gentle, ultra-short high-frequency click (hover haptic)
export function playHoverSound() {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    const now = audioCtx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.025);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch (e) {}
}

// Resonant tactile chime for button/link clicks
export function playClickSound() {
  if (!soundEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;

    // Harmonic 1: fundamental
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(520, now);
    osc1.frequency.exponentialRampToValueAtTime(380, now + 0.08);
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    // Harmonic 2: bell overtone
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1040, now);
    gain2.gain.setValueAtTime(0.025, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now);
    osc2.stop(now + 0.06);
  } catch (e) {}
}

// Initialize on page load from stored preference
export function initSoundSystem() {
  let stored = null;
  try {
    stored = sessionStorage.getItem('portfolio_sound_enabled');
  } catch (e) {}

  if (stored === 'true') {
    setSoundEnabled(true);
  } else {
    setSoundEnabled(false);
  }

  // Bind click & hover sounds to interactive elements
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, [data-sound], .kinetic-action, .gallery-item, .project-card');
    if (target) {
      playHoverSound();
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button, [data-sound], .kinetic-action');
    if (target) {
      playClickSound();
    }
  });
}
