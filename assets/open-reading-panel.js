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

/* En teléfono y tableta, después de elegir una pista se muestra de inmediato
   su contenido. La lista sigue disponible al volver a desplazarse hacia arriba. */
(() => {
  document.addEventListener('click', (event) => {
    if (!window.matchMedia('(max-width: 900px)').matches) return;
    if (!event.target.closest('.record')) return;

    window.setTimeout(() => {
      document.querySelector('.stage')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 80);
  });
})();
