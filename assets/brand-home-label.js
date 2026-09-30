/* La marca del encabezado vuelve a identificar la audioteca general. */
(() => {
  const applyLabel = () => {
    const brand = document.querySelector('.topbar .brand');
    if (!brand) return;
    const title = brand.querySelector('b');
    const subtitle = brand.querySelector('small');
    if (title) title.textContent = 'De agua, viento y verdor';
    if (subtitle) subtitle.textContent = 'Volver a las comunidades';
  };

  [0, 50, 300].forEach(delay => window.setTimeout(applyLabel, delay));
})();
