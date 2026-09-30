/* Las pistas con una sola lectura no requieren pestaña de idioma. */
(() => {
  const syncSingleLanguageReading = () => {
    const number = document.querySelector('.record.active .record-number')?.textContent.trim();
    document.querySelector('.shell')?.classList.toggle(
      'single-language-track',
      ['04', '07', '11'].includes(number)
    );
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('.record')) window.setTimeout(syncSingleLanguageReading, 0);
  });

  syncSingleLanguageReading();
})();
