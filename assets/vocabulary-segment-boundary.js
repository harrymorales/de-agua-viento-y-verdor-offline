/* Vigila un tramo del MP3 original sin depender de la frecuencia de timeupdate. */
(function (scope, create) {
  const api = create(scope);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else scope.AudiotecaVocabularyBoundary = api;
})(typeof window === 'undefined' ? globalThis : window, function (scope) {
  const bindings = new WeakMap();

  function attach(audio, { start = 0, end, onStop = () => {} } = {}) {
    bindings.get(audio)?.();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return () => {};
    let timer;
    let disposed = false;
    let stopping = false;
    let waiting = audio.readyState < 3;
    const clear = () => {
      if (timer !== undefined) scope.clearTimeout(timer);
      timer = undefined;
    };
    const stop = () => {
      if (disposed || stopping) return;
      stopping = true;
      clear();
      audio.pause();
      if (audio.currentTime !== end) audio.currentTime = end;
      onStop(end);
      stopping = false;
    };
    const check = () => {
      clear();
      if (disposed || stopping) return;
      if (audio.currentTime >= end) {
        stop();
        return;
      }
      if (audio.paused || audio.ended || audio.seeking || waiting || audio.readyState < 3) return;
      const rate = audio.playbackRate;
      if (!Number.isFinite(rate) || rate <= 0) return;
      const remainingMs = (end - audio.currentTime) * 1000 / rate;
      // Lejos del límite se evita trabajo continuo; los últimos milisegundos
      // se comprueban con intervalos cortos sobre el reloj real del audio.
      const delay = remainingMs > 30 ? Math.min(250, remainingMs - 15) : Math.max(1, remainingMs / 2);
      timer = scope.setTimeout(check, delay);
    };
    const play = () => { waiting = false; check(); };
    const ready = () => { waiting = audio.readyState < 3; check(); };
    const seeked = () => {
      if (audio.readyState >= 1 && audio.currentTime < start) audio.currentTime = start;
      ready();
    };
    const stalled = () => { waiting = true; clear(); };
    const listeners = {
      playing: play, canplay: ready, seeked, ratechange: check,
      timeupdate: check, durationchange: check,
      seeking: clear, waiting: stalled, pause: clear, ended: clear
    };
    for (const [event, handler] of Object.entries(listeners)) audio.addEventListener(event, handler);
    scope.document?.addEventListener('visibilitychange', check);
    const dispose = () => {
      disposed = true;
      clear();
      for (const [event, handler] of Object.entries(listeners)) audio.removeEventListener(event, handler);
      scope.document?.removeEventListener('visibilitychange', check);
      if (bindings.get(audio) === dispose) bindings.delete(audio);
    };
    bindings.set(audio, dispose);
    check();
    return dispose;
  }
  return { attach };
});
