(() => {
  const segments = {
    'Animales': [0, 39],
    'Atuendos': [39, 48],
    'Camino': [48, 68],
    'Silencio y música': [69, 73],
    'Alma gitana': [74, 79],
    'Familia': [80, 125],
    'Nombrar el paisaje': [126, 153],
    'Colores': [154, 170],
    'Números': [171, 210],
    'Así se saluda en romanés': [210, 223]
  };
  let selection = 'Animales';
  let activeAudio;

  const titleFrom = (button) => button.textContent.replace(/^\s*\d+\s*/, '').trim();
  const pauseUnavailable = (player, audio) => {
    audio.pause();
    player.classList.add('audio-unavailable');
    player.querySelector('.audio-play')?.setAttribute('disabled', '');
    player.querySelector('.audio-track input')?.setAttribute('disabled', '');
  };
  const setSegment = (audio, [start, end]) => {
    const seek = () => {
      audio.currentTime = start;
      audio.play().catch(() => {});
    };
    // El componente base inicializa el audio después de montarlo y puede
    // pausarlo en sus propios eventos. Esperamos a que termine esa
    // inicialización antes de saltar al rango seleccionado.
    const startSegment = () => window.setTimeout(seek, 0);
    if (audio.readyState >= 3) startSegment();
    else audio.addEventListener('canplay', startSegment, { once: true });
    audio.addEventListener('timeupdate', () => {
      if (audio.currentTime >= end) {
        audio.pause();
        audio.currentTime = end;
      }
    });
  };
  const update = () => {
    const player = document.querySelector('.stage .real-player');
    const audio = player?.querySelector('audio');
    if (!player || !audio || audio === activeAudio) return;
    activeAudio = audio;
    const segment = segments[selection];
    if (!segment) {
      pauseUnavailable(player, audio);
      audio.addEventListener('canplay', () => pauseUnavailable(player, audio), { once: true });
      return;
    }
    player.classList.remove('audio-unavailable');
    player.querySelector('.audio-play')?.removeAttribute('disabled');
    player.querySelector('.audio-track input')?.removeAttribute('disabled');
    setSegment(audio, segment);
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.vocab-categories button');
    if (!button) return;
    selection = titleFrom(button);
    activeAudio = null;
    window.setTimeout(update, 0);
  }, true);
  new MutationObserver(update).observe(document.documentElement, { childList: true, subtree: true });
  update();
})();
