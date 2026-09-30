/* Abre automáticamente la lectura asociada cuando una pista la tiene. */
(() => {
  document.addEventListener('click', (event) => {
    const record = event.target.closest('.record');
    if (!record) return;

    window.setTimeout(() => {
      document.querySelector('.reading-rail button')?.click();
    }, 0);
  });
})();
