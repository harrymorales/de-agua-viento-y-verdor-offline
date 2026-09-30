/* Las traducciones acompañan las pistas originales en palenquero. */
(() => {
  let content;
  const pairs = {
    '03': '04',
    '06': '07',
    '10': '11'
  };

  const getContent = async () => {
    if (content) return content;
    const response = await fetch('../../src/content/palenque.original.json');
    content = await response.json();
    return content;
  };

  const installTranslationTabs = async (number) => {
    const reading = document.querySelector('.reading');
    const copy = reading?.querySelector('.scroll-copy');
    const tabs = reading?.querySelector('.reading-tabs');
    const heading = reading?.querySelector('.reading-header span');
    if (!reading || !copy || !tabs) return;

    reading.classList.remove('single-reading');
    const palenqueroText = copy.textContent;
    const source = await getContent();
    const originalTrack = source.tracks.find(track => track.number === number);
    const translationTrack = source.tracks.find(track => track.number === pairs[number]);
    const translation = translationTrack?.translation;
    if (!originalTrack || !translation) return;

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
      if (heading) heading.textContent = isPalenquero ? originalTrack.title : translationTrack.title;
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
    shell?.classList.toggle('palenque-translation-audio', ['04', '07', '11'].includes(number));

    if (pairs[number]) window.setTimeout(() => void installTranslationTabs(number), 80);
    if (['04', '07', '11'].includes(number)) {
      window.setTimeout(() => document.querySelector('.collapse-reading')?.click(), 80);
    }
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('.record')) window.setTimeout(syncReading, 0);
  });
})();
