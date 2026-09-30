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
        raizal: ['8.5%', '9%', '18%'],
        palenque: ['43.2%', '24%', '19%'],
        yukpa: ['64.4%', '25.8%', '19%'],
        rrom: ['51%', '51.4%', '19%'],
        inga: ['30.7%', '71.4%', '19%'],
        cofan: ['46.1%', '81.7%', '19%']
      };

      document.querySelectorAll('.map-hotspot').forEach((button) => {
        const slug = Object.keys(coordinates).find((name) => button.classList.contains(`hotspot-${name}`));
        if (!slug) return;
        const [left, top, size] = coordinates[slug];
        button.style.cssText += `left:${left};top:${top};width:${size};height:${size};border:0;background:transparent;box-shadow:none;transform:translate(-50%,-50%);`;
        const label = button.querySelector('span');
        if (label) label.style.display = 'none';
      });
    }

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateMaps, { once: true });
  } else {
    updateMaps();
  }
}());
