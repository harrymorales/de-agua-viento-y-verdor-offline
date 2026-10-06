(() => {
  const segments = {
    'Colores': [0, 22],
    'Números': [22, 41],
    'Partes del cuerpo': [41, 113],
    'Familia': [117, 202],
    'Sonido y música': [203, 209],
    'Emociones': [209, 236],
    'Así se saluda en yukpa': [238, 306]
  };
  let selection = 'Colores';
  let activeAudio;

  const titleFrom = (button) => button.textContent.replace(/^\s*\d+\s*/, '').trim();
  const isVocabularyOne = (player) => player.closest('.stage')?.querySelector('.giant-number')?.textContent.trim() === '05';
  const setSegment = (audio, [start, end]) => {
    const seek = () => {
      audio.currentTime = start;
      audio.play().catch(() => {});
    };
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
    if (!player || !audio || !isVocabularyOne(player) || audio === activeAudio) return;
    activeAudio = audio;
    const segment = segments[selection];
    if (segment) setSegment(audio, segment);
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
