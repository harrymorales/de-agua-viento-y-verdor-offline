(function () {
  function assetPath(path) {
    return location.pathname.includes('/territories/') ? `../../${path}` : path;
  }

  function updateMaps() {
    document.querySelectorAll('.portal-corner').forEach((image) => {
      const match = image.className.match(/portal-(0[1-4])/);
      if (match) image.src = assetPath(`images/portal/Home/${match[1]}.png`);
    });

    const communityMap = document.querySelector('.map-art img');
    if (communityMap) {
      communityMap.src = assetPath('images/portal/Mapas/Mapa Comunidades.png');

      const coordinates = {
        raizal: { target: ['8.5%', '9%', '18%'], zoom: ['8.5%', '13.5%'] },
        palenque: { target: ['43.2%', '24%', '19%'], zoom: ['43.2%', '28.5%'] },
        yukpa: { target: ['64.4%', '25.8%', '19%'], zoom: ['64.4%', '21%'] },
        rrom: { target: ['51%', '51.4%', '19%'], zoom: ['57%', '51.4%'] },
        inga: { target: ['30.7%', '71.4%', '19%'], zoom: ['26%', '71.4%'] },
        cofan: { target: ['46.1%', '81.7%', '19%'], zoom: ['46.1%', '85%'] }
      };

      const syncSpotlights = () => {
        const mapBounds = communityMap.getBoundingClientRect();
        if (!mapBounds.width || !mapBounds.height) return;
        const isMobile = window.matchMedia('(max-width: 680px)').matches;
        const lensWidth = isMobile ? 168 : 220;
        const lensHeight = isMobile ? 156 : 200;
        document.querySelectorAll('.map-hotspot').forEach((button) => {
          const slug = Object.keys(coordinates).find((name) => button.classList.contains(`hotspot-${name}`));
          if (!slug) return;
          const [zoomLeft, zoomTop] = coordinates[slug].zoom;
          const x = mapBounds.width * parseFloat(zoomLeft) / 100;
          const y = mapBounds.height * parseFloat(zoomTop) / 100;
          button.style.setProperty('--spot-map-image', `url("${communityMap.currentSrc || communityMap.src}")`);
          button.style.setProperty('--spot-map-size', `${mapBounds.width}px ${mapBounds.height}px`);
          button.style.setProperty('--spot-map-position', `${lensWidth / 2 - x}px ${lensHeight / 2 - y}px`);
          button.style.setProperty('--spot-lens-width', `${lensWidth}px`);
          button.style.setProperty('--spot-lens-height', `${lensHeight}px`);
        });
      };

      document.querySelectorAll('.map-hotspot').forEach((button) => {
        const slug = Object.keys(coordinates).find((name) => button.classList.contains(`hotspot-${name}`));
        if (!slug) return;
        const [left, top, size] = coordinates[slug].target;
        button.style.cssText += `left:${left};top:${top};width:${size};height:${size};border:0;background:transparent;box-shadow:none;transform:translate(-50%,-50%);`;
        const label = button.querySelector('span');
        if (label) label.style.display = 'none';
      });
      communityMap.addEventListener('load', syncSpotlights, { once: true });
      requestAnimationFrame(syncSpotlights);
      window.addEventListener('resize', syncSpotlights);
    }

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateMaps, { once: true });
  } else {
    updateMaps();
  }
}());
