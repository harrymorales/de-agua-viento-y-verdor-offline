/*
 * Extracts the Palenque content embedded in the original compiled application.
 * It does not edit the original assets; it produces a readable JSON source for
 * the future data-driven implementation.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets', 'index-Faag-3-f.js'), 'utf8');

function expressionAfter(variable) {
  const marker = `${variable}=`;
  let start = source.indexOf(marker);
  if (start < 0) throw new Error(`No se encontró la variable ${variable}.`);
  start += marker.length;

  const opening = source[start];
  const closing = opening === '[' ? ']' : opening === '{' ? '}' : null;
  if (!closing) throw new Error(`La variable ${variable} no inicia con un arreglo u objeto.`);

  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if (character === opening) depth += 1;
    if (character === closing) {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`La expresión ${variable} no está cerrada.`);
}

function read(variable) {
  return vm.runInNewContext(`(${expressionAfter(variable)})`);
}

const palenque = {
  meta: {
    slug: 'palenque',
    name: 'San Basilio de Palenque',
    status: 'published',
    source: 'assets/index-Faag-3-f.js',
    extractedAt: new Date().toISOString(),
    note: 'Extracción automática del contenido original. No modifica el diseño ni los recursos existentes.'
  },
  portalTerritories: read('s'),
  vocabulary: read('c'),
  vocabularyAudioSegments: read('l'),
  photos: read('u'),
  tracks: read('d'),
  activities: read('f'),
  culturalArticles: read('p')
};

const output = path.join(root, 'src', 'content', 'palenque.original.json');
fs.writeFileSync(output, `${JSON.stringify(palenque, null, 2)}\n`, 'utf8');
console.log(`Contenido extraído: ${output}`);
console.log(`${palenque.tracks.length} pistas, ${palenque.vocabulary.length} categorías de vocabulario, ${palenque.photos.length} fotografías, ${palenque.activities.length} actividades.`);
