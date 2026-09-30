/* Cada encabezado conserva el nombre de su comunidad y usa un lema común. */
(() => {
  const applyLabel = () => {
    const brand = document.querySelector('.topbar .brand');
    if (!brand) return;
    const subtitle = brand.querySelector('small');
    if (subtitle) subtitle.textContent = 'De agua, viento y verdor';
  };

  [0, 50, 300].forEach(delay => window.setTimeout(applyLabel, delay));
})();
