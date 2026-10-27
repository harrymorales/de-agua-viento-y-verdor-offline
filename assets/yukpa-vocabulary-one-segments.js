(() => {
  const segments = {
    'Colores': [0, 21.637],
    'Números': [22.454, 41.071],
    'Partes del cuerpo': [41.888, 113.143],
    'Familia': [116.412, 201.493],
    'Sonido y música': [203.184, 208.932],
    'Emociones': [209.749, 235.9],
    'Así se saluda en yukpa': [238.774, 306.083]
  };
  let selection = 'Colores';
  let activeAudio;
  let cleanup = () => {};

  const titleFrom = (button) => button.textContent.replace(/^\s*\d+\s*/, '').trim();
  const isVocabularyOne = (player) => player.closest('.stage')?.querySelector('.giant-number')?.textContent.trim() === '05';
  const release = () => {
    cleanup();
    cleanup = () => {};
    activeAudio = null;
  };
  const setSegment = (player, audio, [start, end]) => {
    let timer;
    const isCurrent = () => audio.isConnected && activeAudio === audio && isVocabularyOne(player);
    const seek = () => {
      if (!isCurrent()) return;
      audio.currentTime = start;
      audio.play().catch(() => {});
    };
    const startSegment = () => { timer = window.setTimeout(seek, 0); };
    if (audio.readyState >= 3) startSegment();
    else audio.addEventListener('canplay', startSegment, { once: true });
    const stopAtEnd = () => {
      if (isCurrent() && audio.currentTime >= end) {
        audio.pause();
        audio.currentTime = end;
      }
    };
    audio.addEventListener('timeupdate', stopAtEnd);
    cleanup = () => {
      window.clearTimeout(timer);
      audio.removeEventListener('canplay', startSegment);
      audio.removeEventListener('timeupdate', stopAtEnd);
    };
  };
  const update = () => {
    const player = document.querySelector('.stage .real-player');
    const audio = player?.querySelector('audio');
    if (!player || !audio || !isVocabularyOne(player)) {
      release();
      return;
    }
    if (audio === activeAudio) return;
    release();
    activeAudio = audio;
    const selected = player.closest('.stage')?.querySelector('.vocab-categories button.selected');
    if (selected) selection = titleFrom(selected);
    const segment = segments[selection];
    if (segment) setSegment(player, audio, segment);
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
