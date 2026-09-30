/* Las pistas 03 y 04 de Palenque tienen una sola lectura: no requieren pestaña. */
(() => {
  const syncSingleLanguageReading = () => {
    const number = document.querySelector('.record.active .record-number')?.textContent.trim();
    document.querySelector('.shell')?.classList.toggle(
      'single-language-track',
      number === '03' || number === '04'
    );
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('.record')) window.setTimeout(syncSingleLanguageReading, 0);
  });

  syncSingleLanguageReading();
})();
