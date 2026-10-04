/* Aplica las cursivas editoriales registradas en el documento maestro.
   La referencia se guarda por párrafo completo para no confundir palabras
   españolas comunes con vocablos de las lenguas propias. */
(() => {
  const map = window.AudiotecaWordItalics || {};
  const originals = new Map();
  let queued = false;

  const normalize = (value) =>
    value.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');

  const restore = () => {
    originals.forEach((nodes, element) => {
      if (element.isConnected) element.replaceChildren(...nodes);
      element.removeAttribute('data-word-italics');
    });
    originals.clear();
  };

  const decorate = (element, terms) => {
    if (element.dataset.wordItalics || element.childElementCount) return;
    const text = element.textContent;
    const usable = terms.filter((term) => term && text.includes(term));
    if (!usable.length) return;

    const pattern = usable
      .slice()
      .sort((left, right) => right.length - left.length)
      .map((term) => term.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&'))
      .join('|');
    const expression = new RegExp('(' + pattern + ')', 'g');
    const originalNodes = [...element.childNodes];
    const fragment = document.createDocumentFragment();
    text.split(expression).forEach((part) => {
      if (!part) return;
      if (usable.includes(part)) {
        const italic = document.createElement('i');
        italic.textContent = part;
        fragment.append(italic);
      } else {
        fragment.append(document.createTextNode(part));
      }
    });

    originals.set(element, originalNodes);
    element.replaceChildren(fragment);
    element.dataset.wordItalics = 'true';
  };

  const apply = () => {
    queued = false;
    document.querySelectorAll(
      '.shell .stage h1, .shell .stage p, .shell .reading p, ' +
      '.shell .reading dt, .shell .reading dd, .shell .context-panel p, ' +
      '.shell .context-panel h2, .shell .context-panel h3'
    ).forEach((element) => {
      const terms = map[normalize(element.textContent)];
      if (terms) decorate(element, terms);
    });
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    window.setTimeout(apply, 0);
  };

  /* React conserva sus propios nodos de texto. Se restauran antes de que un
     botón cambie de pista, idioma o vista, y se vuelven a aplicar después. */
  document.addEventListener('click', (event) => {
    if (event.target.closest('.shell button')) restore();
    schedule();
  }, true);

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
  schedule();
})();
