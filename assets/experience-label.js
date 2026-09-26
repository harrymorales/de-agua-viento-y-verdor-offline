/* Keeps the original React engine intact while standardizing the public term. */
(() => {
  const replacements = [
    ['Actividad ', 'Experiencia '],
    ['Ver actividad', 'Ver experiencia'],
    ['Todas las actividades', 'Todas las experiencias']
  ];

  function updateLabels(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      let text = node.nodeValue;
      for (const [from, to] of replacements) text = text.replaceAll(from, to);
      if (text !== node.nodeValue) node.nodeValue = text;
    }
  }

  updateLabels(document.body);
  new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) updateLabels(node.parentElement || document.body);
        else if (node.nodeType === Node.ELEMENT_NODE) updateLabels(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

  // The original portal only has an internal view for Palenque. Route its
  // community buttons to the generated pages that contain each territory's
  // published content instead.
  const portalTerritories = {
    raizal: 'raizal',
    palenque: 'palenque',
    'cofán': 'cofan',
    cofan: 'cofan',
    inga: 'inga',
    yukpa: 'yukpa',
    rrom: 'rrom'
  };
  const territory = location.pathname.match(/territories\/([^/]+)/)?.[1];
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const label = button.textContent.replace(/\s+/g, ' ').trim().toLocaleLowerCase();

    // On a generated territory page, the original brand button only resets
    // that copy of the app. It must return to the shared portal instead.
    if (territory && label.includes('volver a las comunidades')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      location.assign(new URL('../../index.html', location.href));
      return;
    }

    const name = label.replace(/^ir a la audioteca\s+/, '');
    const slug = portalTerritories[name];
    if (!slug || (label !== name && label !== `ir a la audioteca ${name}`)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const destination = territory ? `../${slug}/index.html` : `territories/${slug}/index.html`;
    location.assign(new URL(destination, location.href));
  }, true);

  const guideText = { title: '¿Cómo usar esta guía?', paragraphs: ['Esta guía propone escuchar sin prisa. Una pista puede abrir la puerta a un amanecer en el monte, a una ronda junto al mar o a la voz de quien arrulla. Después vendrán las manos: sembrar, tejer, construir un refugio, seguir el pulso de un tambor, dibujar lo que se oye o guardar silencio para oír de nuevo. Son maneras de acercarse, con respeto y curiosidad, a las lenguas, las memorias y los saberes vivos de los pueblos palenquero, rrom, yukpa, raizal, inga y kofán.', 'Madres, padres, abuelas, abuelos, docentes, profesionales de bibliotecas y promotores de lectura: escojan una o varias opciones según el tiempo disponible, el ritmo del grupo y los intereses de las niñas y los niños. No hay que hacerlo todo ni esperar respuestas iguales. Escuchen con ellos, hagan preguntas, observen sus gestos y permitan que cada quien participe a su manera. A veces, una palabra que nadie conocía se queda resonando después de apagar el reproductor; quizá allí comience una conversación que la audioteca no alcanza a terminar.'] };
  const guideIntroductions = Object.fromEntries(['palenque', 'raizal', 'rrom', 'yukpa', 'inga', 'cofan'].map(slug => [slug, guideText]));
  const intro = guideIntroductions[territory];
  if (!intro) return;
  const addGuideIntroduction = () => {
    const guide = document.querySelector('.guide-list');
    if (!guide || guide.querySelector('.guide-introduction')) return;
    const section = document.createElement('section'); section.className = 'guide-introduction';
    const heading = document.createElement('h3'); heading.textContent = intro.title; section.append(heading);
    intro.paragraphs.forEach(text => { const paragraph = document.createElement('p'); paragraph.textContent = text; section.append(paragraph); });
    guide.prepend(section);
  };
  addGuideIntroduction();
  new MutationObserver(addGuideIntroduction).observe(document.body, { childList: true, subtree: true });
})();
