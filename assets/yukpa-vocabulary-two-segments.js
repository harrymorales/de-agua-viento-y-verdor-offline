(() => {
  const segments = {
    'Animales': [0, 104],
    'Cacería': [104, 184],
    'Tejido y cosas de la casa': [184, 235],
    'Algunos alimentos': [235, 328],
    'Nombrar el paisaje': [328, 408],
    'Vamos a…': [410, 558]
  };
  let selection = 'Animales';
  let activeAudio;
  let cleanup = () => {};

  const titleFrom = (button) => button.textContent.replace(/^\s*\d+\s*/, '').trim();
  const isVocabularyTwo = (player) => player.closest('.stage')?.querySelector('.giant-number')?.textContent.trim() === '09';
  const release = () => {
    cleanup();
    cleanup = () => {};
    activeAudio = null;
  };
  const setSegment = (player, audio, [start, end]) => {
    let timer;
    const isCurrent = () => audio.isConnected && activeAudio === audio && isVocabularyTwo(player);
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
    if (!player || !audio || !isVocabularyTwo(player)) {
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
