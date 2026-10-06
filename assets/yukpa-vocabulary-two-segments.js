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

  const titleFrom = (button) => button.textContent.replace(/^\s*\d+\s*/, '').trim();
  const isVocabularyTwo = (player) => player.closest('.stage')?.querySelector('.giant-number')?.textContent.trim() === '09';
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
    if (!player || !audio || !isVocabularyTwo(player) || audio === activeAudio) return;
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
