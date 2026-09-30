/* La versión en español de la historia acompaña la pista en palenquero. */
(() => {
  let spanishText;

  const getSpanishText = async () => {
    if (spanishText) return spanishText;
    const response = await fetch('../../src/content/palenque.original.json');
    const content = await response.json();
    spanishText = content.tracks.find(track => track.number === '04')?.translation || '';
    return spanishText;
  };

  const installTrack03Tabs = async () => {
    const reading = document.querySelector('.reading');
    const copy = reading?.querySelector('.scroll-copy');
    const tabs = reading?.querySelector('.reading-tabs');
    const heading = reading?.querySelector('.reading-header span');
    if (!reading || !copy || !tabs) return;

    reading.classList.remove('single-reading');
    const palenqueroText = copy.textContent;
    const translation = await getSpanishText();
    if (!translation) return;

    tabs.replaceChildren();
    const palenquero = document.createElement('button');
    const spanish = document.createElement('button');
    palenquero.type = spanish.type = 'button';
    palenquero.textContent = 'Palenquero';
    spanish.textContent = 'Español';

    const show = (language) => {
      const isPalenquero = language === 'palenquero';
      palenquero.classList.toggle('selected', isPalenquero);
      spanish.classList.toggle('selected', !isPalenquero);
      copy.textContent = isPalenquero ? palenqueroText : translation;
      if (heading) heading.textContent = isPalenquero ? 'Itoria ri Palenge' : 'Historia de Palenque';
      copy.scrollTop = 0;
    };

    palenquero.addEventListener('click', () => show('palenquero'));
    spanish.addEventListener('click', () => show('spanish'));
    tabs.append(palenquero, spanish);
    show('palenquero');
  };

  const syncReading = () => {
    const number = document.querySelector('.record.active .record-number')?.textContent.trim();
    const shell = document.querySelector('.shell');
    shell?.classList.toggle('palenque-track-04', number === '04');

    if (number === '03') window.setTimeout(() => void installTrack03Tabs(), 80);
    if (number === '04') {
      window.setTimeout(() => document.querySelector('.collapse-reading')?.click(), 80);
    }
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('.record')) window.setTimeout(syncReading, 0);
  });
})();
