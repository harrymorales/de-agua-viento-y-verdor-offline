/* Las traducciones acompañan las pistas originales en palenquero. */
(() => {
  let content;
  let managedReading;
  const pairs = {
    '03': '04',
    '06': '07',
    '10': '11'
  };
  const activeTrackNumber = () =>
    document.querySelector('.record.active .record-number')?.textContent.trim();

  /* React conserva referencias a sus nodos de lectura. Antes de que cambie
     una pista restauramos esos nodos para que el cambio no cierre la app. */
  const restoreManagedReading = () => {
    if (!managedReading) return;
    const { tabs, copy, originalTabs, originalCopy } = managedReading;
    if (tabs.isConnected) tabs.replaceChildren(...originalTabs);
    if (copy.isConnected) copy.replaceChildren(...originalCopy);
    managedReading = null;
  };

  const getContent = async () => {
    if (content) return content;
    const response = await fetch('../../src/content/palenque.original.json');
    content = await response.json();
    return content;
  };

  const installTranslationTabs = async (number) => {
    if (activeTrackNumber() !== number) return;
    const source = await getContent();
    /* La carga del archivo es asíncrona. Si la persona ya eligió otra pista,
       no se debe escribir la traducción anterior sobre esa nueva lectura. */
    if (activeTrackNumber() !== number) return;

    const reading = document.querySelector('.reading');
    const copy = reading?.querySelector('.scroll-copy');
    const tabs = reading?.querySelector('.reading-tabs');
    const heading = reading?.querySelector('.reading-header span');
    if (!reading || !copy || !tabs) return;

    reading.classList.remove('single-reading');
    const palenqueroText = copy.querySelector('p')?.textContent || copy.textContent;
    const originalTrack = source.tracks.find(track => track.number === number);
    const translationTrack = source.tracks.find(track => track.number === pairs[number]);
    const translation = translationTrack?.translation;
    if (!originalTrack || !translation) return;

    restoreManagedReading();
    managedReading = {
      tabs,
      copy,
      originalTabs: [...tabs.childNodes],
      originalCopy: [...copy.childNodes]
    };
    tabs.replaceChildren();
    const palenquero = document.createElement('button');
    const spanish = document.createElement('button');
    palenquero.type = spanish.type = 'button';
    palenquero.textContent = 'Palenquero';
    spanish.textContent = 'Español';

    const show = (language) => {
      if (activeTrackNumber() !== number) return;
      const isPalenquero = language === 'palenquero';
      palenquero.classList.toggle('selected', isPalenquero);
      spanish.classList.toggle('selected', !isPalenquero);
      const paragraph = document.createElement('p');
      paragraph.textContent = isPalenquero ? palenqueroText : translation;
      copy.replaceChildren(paragraph);
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

  document.addEventListener('click', (event) => {
    if (event.target.closest('.record, .collapse-reading, .vocab-categories button')) {
      restoreManagedReading();
    }
  }, true);
})();
