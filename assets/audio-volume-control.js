(() => {
  const STORAGE_KEY = 'audioteca-volume';
  const readVolume = () => {
    try { const value = Number(localStorage.getItem(STORAGE_KEY)); return Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0.8; } catch { return 0.8; }
  };
  const saveVolume = (value) => { try { localStorage.setItem(STORAGE_KEY, String(value)); } catch { /* almacenamiento no disponible */ } };
  const decoratePlayer = (player) => {
    const audio = player.querySelector('audio');
    const track = player.querySelector('.audio-track');
    if (!audio || !track || track.querySelector('.audio-volume')) return;
    audio.volume = readVolume();
    const control = document.createElement('div');
    control.className = 'audio-volume';
    control.innerHTML = '<button type="button" aria-label="Silenciar audio" title="Silenciar audio">&#128266;</button><input type="range" min="0" max="100" step="1" aria-label="Volumen del audio"><output aria-live="polite"></output>';
    const mute = control.querySelector('button');
    const slider = control.querySelector('input');
    const output = control.querySelector('output');
    const update = () => {
      const value = Math.round(audio.volume * 100);
      slider.value = value;
      output.value = `${value}%`;
      output.textContent = `${value}%`;
      mute.textContent = audio.muted || value === 0 ? '🔇' : '🔊';
      mute.setAttribute('aria-label', audio.muted || value === 0 ? 'Activar sonido' : 'Silenciar audio');
      mute.title = mute.getAttribute('aria-label');
    };
    slider.addEventListener('input', () => { audio.muted = false; audio.volume = Number(slider.value) / 100; saveVolume(audio.volume); update(); });
    mute.addEventListener('click', () => { audio.muted = !audio.muted; update(); });
    audio.addEventListener('volumechange', update);
    track.append(control);
    update();
  };
  const decorateAll = () => document.querySelectorAll('.real-player').forEach(decoratePlayer);
  new MutationObserver(decorateAll).observe(document.documentElement, { childList: true, subtree: true });
  decorateAll();
})();
