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
  const syncGuideIntroduction = () => {
    const guide = document.querySelector('.guide-list');
    const activityReader = document.querySelector('.activity-reader');
    if (activityReader) {
      document.querySelectorAll('.guide-introduction').forEach(element => element.remove());
      return;
    }
    if (!guide || guide.querySelector('.guide-introduction')) return;
    const section = document.createElement('section'); section.className = 'guide-introduction';
    const heading = document.createElement('h3'); heading.textContent = intro.title; section.append(heading);
    intro.paragraphs.forEach(text => { const paragraph = document.createElement('p'); paragraph.textContent = text; section.append(paragraph); });
    guide.prepend(section);
  };
  syncGuideIntroduction();
  const linkedGuideTracks = {
    raizal: {
      'Pistas 1, Amanecer en Providencia; 9, Fishing; y 13, Al mediodía en la playa de Manzanillo.': [
        { label: '1, Amanecer en Providencia', number: '01', before: 'Pistas ' },
        { label: '9, Fishing', number: '09', before: '; ' },
        { label: '13, Al mediodía en la playa de Manzanillo', number: '13', before: '; y ', after: '.' }
      ],
      'Pista 7, La siembra del cordón umbilical.': [
        { label: '7, La siembra del cordón umbilical', number: '07', before: 'Pista ', after: '.' }
      ],
      'Pistas 5, Vocabularios; 9, Fishing; y 13, Al mediodía en la playa de Manzanillo.': [
        { label: '5, Vocabularios', number: '05', before: 'Pistas ' },
        { label: '9, Fishing', number: '09', before: '; ' },
        { label: '13, Al mediodía en la playa de Manzanillo', number: '13', before: '; y ', after: '.' }
      ],
      'Pistas 6, Los McLean Brothers interpretan un shotis; y 12, Los McLean Brothers interpretan una mazurca.': [
        { label: '6, Los McLean Brothers interpretan un shotis', number: '06', before: 'Pistas ' },
        { label: '12, Los McLean Brothers interpretan una mazurca', number: '12', before: '; y ', after: '.' }
      ],
      'Pistas 4, He Died for Me; y 8, Sleep, baby, sleep.': [
        { label: '4, He Died for Me', number: '04', before: 'Pistas ' },
        { label: '8, Sleep, baby, sleep', number: '08', before: '; y ', after: '.' }
      ],
      'Pistas 2, Brown girl in the ring; 3, Naansi an Margaret stuori; 10, Drop a letter; y 11, Jesus loves the little children.': [
        { label: '2, Brown girl in the ring', number: '02', before: 'Pistas ' },
        { label: '3, Naansi an Margaret stuori', number: '03', before: '; ' },
        { label: '10, Drop a letter', number: '10', before: '; ' },
        { label: '11, Jesus loves the little children', number: '11', before: '; y ', after: '.' }
      ]
    }
  };
  const guideLinks = (prefix, tracks) => tracks.map(([number, label], index) => ({
    number,
    label,
    before: index === 0 ? prefix : index === tracks.length - 1 ? '; y ' : '; ',
    after: index === tracks.length - 1 ? '.' : ''
  }));
  Object.assign(linkedGuideTracks, {
    palenque: {
      'Pista 1: Amanecer en el monte;  Pistas 3 y 4: Itoria ri Palenge': guideLinks('Pistas ', [
        ['01', '1, Amanecer en el monte'], ['03', '3, Itoria ri Palenge'], ['04', '4, Historia de Palenque']
      ]),
      'Pista 2: Tra kolao ri posá': guideLinks('Pista ', [['02', '2, Tra kolao ri posá']]),
      'Pistas 3 y 4: Itoria ri Palenge': guideLinks('Pistas ', [
        ['03', '3, Itoria ri Palenge'], ['04', '4, Historia de Palenque']
      ]),
      'Pistas 6 y 7: Kuendo ri Cho Konejo i Cho Tigre': guideLinks('Pistas ', [
        ['06', '6, Kuendo ri Cho Konejo i Cho Tigre'], ['07', '7, Cuento de Tío Conejo y Tío Tigre']
      ]),
      'Pista 12: Ña Marikita mosa Pista 15: De mañana en la Plaza Central': guideLinks('Pistas ', [
        ['12', '12, Ña marikita mosa'], ['15', '15, De mañana en la Plaza Central']
      ]),
      'Pista 5: Canto a la ofrenda - Tata Suto Pista 13: Cuidados del niño Pista 14: Saraguia ri mueto': guideLinks('Pistas ', [
        ['05', '5, Tata Suto'], ['13', '13, Cuidados del niño'], ['14', '14, Saraguia ri mueto']
      ]),
      'Pista 8: Concierto didáctico Pista 9: Vocabularios': guideLinks('Pistas ', [
        ['08', '8, Concierto didáctico'], ['09', '9, Vocabularios']
      ]),
      'Pistas 10 y 11: Kuendo ri ma fieta ri ma abe [Cuento de la fiesta de las aves]': guideLinks('Pistas ', [
        ['10', '10, Kuendo ri ma fieta ri ma abe'], ['11', '11, Cuento de la fiesta de las aves']
      ])
    },
    cofan: {
      'Pistas 1, 2 y 5.': guideLinks('Pistas ', [
        ['01', '1, De mañana a la orilla del río La Hormiga'], ['02', '2, Chuni sethapaemba'], ['05', '5, Imitaciones animales']
      ]),
      'Pistas 6, 7 y 8.': guideLinks('Pistas ', [
        ['06', '6, Canto de ceremonia'], ['07', '7, Tayusw a’i: u’fa kundasepa'], ['08', '8, Canto espiritual']
      ]),
      'Pista 3.': guideLinks('Pista ', [['03', '3, Khuanifuekhu ande kundasepa a’indekhw kansechu']]),
      'Pistas 10 y 11.': guideLinks('Pistas ', [
        ['10', '10, Ingi andyupa'], ['11', '11, A’i kankhenga sethapaemba']
      ]),
      'Pistas 4, 9, 12 y 13.': guideLinks('Pistas ', [
        ['04', '4, Mendetshengi kansefa'], ['09', '9, Vocabularios'], ['12', '12, Aipanu anañe sethapaemba'], ['13', '13, De noche en el Resguardo Yarinal']
      ])
    },
    inga: {
      'Pistas 1, Quebrada San Francisco; 3, Risunchi; 6, Suma Kausai; y 7, Iaku, iaku, iaku.': guideLinks('Pistas ', [
        ['01', '1, Quebrada San Francisco'], ['03', '3, Risunchi'], ['06', '6, Suma Kausai'], ['07', '7, Iaku, iaku, iaku']
      ]),
      'Pistas 4, Takispa ugllai nukapa llatancito; 9, Puñupuai, wawita; 13, Enfermedades y cuidados; y 14, Limpieza del Taita.': guideLinks('Pistas ', [
        ['04', '4, Takispa ugllai nukapa llatancito'], ['09', '9, Puñupuai, wawita'], ['13', '13, Enfermedades y cuidados'], ['14', '14, Limpieza del Taita']
      ]),
      'Pista 11, Nuka kani Inga Apunti llagtamanda.': guideLinks('Pista ', [['11', '11, Nuka kani Inga Apunti llagtamanda']]),
      'Pistas 2, Taita Carlos; 10, Atun Puncha; y 12, Waira, wairita.': guideLinks('Pistas ', [
        ['02', '2, Taita Carlos'], ['10', '10, Atun Puncha'], ['12', '12, Waira, wairita']
      ]),
      'Pistas 5, Nuka kausani Paramu Awapi; 8, Vocabularios; 11, Nuka kani Inga Apunti llagtamanda; y 15, Anochecer en Tacumbina.': guideLinks('Pistas ', [
        ['05', '5, Nuka kausani Paramu Awapi'], ['08', '8, Vocabularios'], ['11', '11, Nuka kani Inga Apunti llagtamanda'], ['15', '15, Anochecer en Tacumbina']
      ])
    },
    yukpa: {
      'Pistas 1, Amanecer en San Genaro; 2, Owaya tamurhya trho ktaworh, taniap Papsh Yukpa iyanak; y 3, Cuando la tierra se estaba formando, Papsh sacó a los Yukpa de un árbol.': guideLinks('Pistas ', [
        ['01', '1, Amanecer en San Genaro'], ['02', '2, Owaya tamurhya trho ktaworh, taniap Papsh Yukpa iyanak'], ['03', '3, Cuando la tierra se estaba formando, Papsh sacó a los Yukpa de un árbol']
      ]),
      'Pista 5, Vocabularios 1.': guideLinks('Pista ', [['05', '5, Vocabularios 1']]),
      'Pistas 6, Shinprha ichok wat; y 10, Yonash, shini prha.': guideLinks('Pistas ', [
        ['06', '6, Shinprha ichok wat'], ['10', '10, Yonash, shini prha']
      ]),
      'Pistas 7, Sokʉ; y 8, Witarhash. El canto de la palizada.': guideLinks('Pistas ', [
        ['07', '7, Sokʉ'], ['08', '8, Witarhash. El canto de la palizada']
      ]),
      'Pistas 9, Vocabularios 2; 11, Flechando en San Genaro; 12, Imitando las voces de las aves; y 13, De noche en San Genaro.': guideLinks('Pistas ', [
        ['09', '9, Vocabularios 2'], ['11', '11, Flechando en San Genaro'], ['12', '12, Imitando las voces de las aves'], ['13', '13, De noche en San Genaro']
      ])
    },
    rrom: {
      'Pistas 1, Caporal galopando; 2, Le vurdona; y 8, Vocabularios.': guideLinks('Pistas ', [
        ['01', '1, Caporal galopando'], ['02', '2, Le vurdona'], ['08', '8, Vocabularios']
      ]),
      'Pista 3, Le tsery.': guideLinks('Pista ', [['03', '3, Le tsery']]),
      'Pistas 4, Arrurru mugo shavo; 5, E bramia akana pe de domul; y 9, Soutuke, mugo tsinogo.': guideLinks('Pistas ', [
        ['04', '4, Arrurru mugo shavo'], ['05', '5, E bramia akana pe de domul'], ['09', '9, Soutuke, mugo tsinogo']
      ]),
      'Pistas 6 y 7, Sar chiravelpe le sarmy.': guideLinks('Pistas ', [
        ['06', '6, Sar chiravelpe le sarmy'], ['07', '7, Receta de la sarma']
      ]),
      'Pistas 10, La bandera y la Pachiv; y 11, De tarde en El Salado.': guideLinks('Pistas ', [
        ['10', '10, La bandera y la Pachiv'], ['11', '11, De tarde en El Salado']
      ])
    }
  });
  const addGuideTrackLinks = () => {
    const configurations = linkedGuideTracks[territory];
    if (!configurations) return;
    document.querySelectorAll('.activity-reader .activity-tracks').forEach(element => {
      const links = configurations[element.textContent.trim()];
      if (!links || element.dataset.trackLinksReady) return;
      element.dataset.trackLinksReady = 'true';
      element.replaceChildren();
      links.forEach(link => {
        if (link.before) element.append(document.createTextNode(link.before));
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'guide-track-link'; button.textContent = link.label;
        button.setAttribute('aria-label', `Abrir pista ${link.number}: ${link.label.replace(/^\d+,\s*/, '')}`);
        button.addEventListener('click', () => {
          const selectTrack = () => {
            const record = [...document.querySelectorAll('.record')].find(item => item.querySelector('.record-number')?.textContent.trim() === link.number);
            if (!record) return;
            record.click();
            document.querySelector('.guide-overlay button[aria-label="Cerrar"]')?.click();
          };
          if (document.querySelector('.record')) { selectTrack(); return; }
          const enterAudioteca = [...document.querySelectorAll('button')].find(item => item.textContent.includes('Entrar a la audioteca'));
          if (!enterAudioteca) return;
          enterAudioteca.click();
          window.setTimeout(selectTrack, 0);
        });
        element.append(button);
        if (link.after) element.append(document.createTextNode(link.after));
      });
    });
  };
  const syncGuideContent = () => { syncGuideIntroduction(); addGuideTrackLinks(); };
  syncGuideContent();
  new MutationObserver(syncGuideContent).observe(document.body, { childList: true, subtree: true });
})();
