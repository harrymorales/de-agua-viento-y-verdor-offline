/* El título ya aparece en el encabezado de la lectura; se evita repetirlo en el cuerpo. */
(() => {
  const normalize = (text) => text.normalize('NFC').trim().toLocaleLowerCase();

  const removeRepeatedTitle = () => {
    document.querySelectorAll('.reading').forEach((reading) => {
      const title = reading.querySelector('.reading-header .vocab-reading-title > span')?.textContent;
      const paragraph = reading.querySelector('.scroll-copy > p');
      if (!title || !paragraph) return;

      const copy = paragraph.textContent.trimStart();
      if (!normalize(copy).startsWith(normalize(title))) return;

      paragraph.textContent = copy.slice(title.length).replace(/^[\s:–—-]+/, '');
    });
  };

  const root = document.getElementById('root');
  if (!root) return;
  new MutationObserver(removeRepeatedTitle).observe(root, { childList: true, subtree: true, characterData: true });
  removeRepeatedTitle();
})();
