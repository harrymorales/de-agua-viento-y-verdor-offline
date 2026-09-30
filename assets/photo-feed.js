/* Convierte el detalle de una fotografía en una lectura vertical continua. */
(() => {
  let photographs = [];

  const rememberPhotographs = () => {
    const cards = [...document.querySelectorAll('.photo-grid .photo-card img')];
    if (!cards.length) return;
    photographs = cards.map(image => ({ src: image.currentSrc || image.src, alt: image.alt }));
  };

  const showVerticalFeed = () => {
    rememberPhotographs();
    const viewer = document.querySelector('.photo-viewer');
    if (!viewer || viewer.dataset.verticalFeed || !photographs.length) return;

    const selected = viewer.querySelector('.photo-frame img')?.currentSrc || viewer.querySelector('.photo-frame img')?.src;
    const selectedIndex = photographs.findIndex(photo => photo.src === selected);
    const ordered = selectedIndex >= 0 ? photographs.slice(selectedIndex) : photographs;
    const feed = document.createElement('div');
    feed.className = 'photo-feed';
    feed.setAttribute('aria-label', 'Fotografías de la fototeca');

    ordered.forEach(photo => {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.src = photo.src;
      image.alt = photo.alt;
      image.loading = 'lazy';
      figure.append(image);
      feed.append(figure);
    });

    viewer.querySelector('.photo-frame')?.replaceWith(feed);
    viewer.querySelector('.photo-footer')?.remove();
    viewer.dataset.verticalFeed = 'true';
  };

  const sync = () => {
    rememberPhotographs();
    showVerticalFeed();
  };

  sync();
  new MutationObserver(sync).observe(document.body, { childList: true, subtree: true });
})();
