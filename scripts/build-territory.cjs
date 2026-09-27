/*
 * Produces a territory-specific copy of the original audioteca engine.
 * The original CSS and compiled engine remain untouched in /assets.
 * Usage: node scripts/build-territory.cjs palenque
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const slug = process.argv[2];
if (!slug) throw new Error('Uso: node scripts/build-territory.cjs <slug>');

const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src', 'content', 'territories.json'), 'utf8'));
const territory = catalog.territories.find(item => item.slug === slug);
if (!territory) throw new Error(`No existe el territorio ${slug} en territories.json.`);
const textPreview = territory.status === 'text-ready';
if (territory.status !== 'published' && !textPreview) throw new Error(`${territory.name} está en estado ${territory.status}; complete y valide su contenido antes de construirlo.`);

const data = JSON.parse(fs.readFileSync(path.join(root, 'src', 'content', territory.contentFile), 'utf8'));
// A text preview must never produce broken audio controls. The editable source
// keeps the intended routes; only the generated preview omits playback until
// the corresponding files exist.
const renderData = textPreview
  ? { ...data, tracks: data.tracks.map(track => ({ ...track, audio: '', audioFallback: '' })) }
  : data;
let script = fs.readFileSync(path.join(root, 'assets', 'offline-index.js'), 'utf8');

function findExpressionStart(code, variable) {
  const marker = `${variable}=`;
  // The bundle contains React internals before the audioteca. Content values
  // are declared near its end, so use the final declaration rather than a
  // same-named helper in the runtime.
  const start = code.lastIndexOf(marker);
  if (start < 0) throw new Error(`No se encontró ${variable} en el motor original.`);
  return start + marker.length;
}

function findExpressionEnd(code, start) {
  const opening = code[start];
  const closing = opening === '[' ? ']' : opening === '{' ? '}' : null;
  if (!closing) throw new Error(`La expresión no inicia con [ o { en ${start}.`);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < code.length; index += 1) {
    const character = code[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') { quote = character; continue; }
    if (character === opening) depth += 1;
    if (character === closing && --depth === 0) return index + 1;
  }
  throw new Error(`La expresión iniciada en ${start} no terminó.`);
}

function replaceExpression(code, variable, value) {
  const start = findExpressionStart(code, variable);
  const end = findExpressionEnd(code, start);
  return `${code.slice(0, start)}${JSON.stringify(value)}${code.slice(end)}`;
}

// These names are the content-only declarations in the original bundled app.
// Keeping the React rendering code and its CSS intact preserves the exact design.
const portalTerritories = catalog.territories.map((item, index) => ({
  slug: item.slug,
  name: item.name.replace(/^San Basilio de /, ''),
  slot: index + 1,
  ...(item.status === 'published' || item.status === 'text-ready' ? { available: true } : {})
}));

const replacements = [
  ['is', portalTerritories],
  ['Hl', renderData.vocabulary],
  ['Um', renderData.vocabularyAudioSegments],
  ['Vn', renderData.photos],
  ['Ul', renderData.tracks],
  ['La', renderData.activities],
  ['qr', renderData.culturalArticles]
];
for (const [variable, value] of replacements) script = replaceExpression(script, variable, value);

// A reading with only one available text must not render a second, empty tab.
// This applies to vocabulary lists and to recordings published only in Spanish.
const readingReplacements = [
  [
    'q=O===null?null:Ul[O],se=(0,pe.useMemo)(()=>q?q.singleReading||ae==="original"?q.original:q.translation:void 0,[q,ae]),Be=Hl[we]',
    'q=O===null?null:Ul[O],G=!!(q&&(q.readingMode||q.singleReading||!q.translation||q.language==="Español")),se=(0,pe.useMemo)(()=>q?G?q.readingMode==="spanish-only"?q.translation||q.original:q.original||q.translation:ae==="original"?q.original:q.translation:void 0,[q,ae,G]),Be=Hl[we]'
  ],
  ['className:`reading ${q.singleReading?"single-reading":""}`', 'className:`reading ${G?"single-reading":""}`'],
  [
    'children:q.singleReading?(0,s.jsx)("span",{children:"Vocabulario"}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("button",{className:ae==="original"?"selected":"",onClick:()=>Se("original"),children:"Palenquero"}),(0,s.jsx)("button",{className:ae==="translation"?"selected":"",onClick:()=>Se("translation"),children:"Espa\\xF1ol"})]})',
    'children:q.singleReading?(0,s.jsx)("span",{children:"Vocabulario"}):G?(0,s.jsx)("span",{children:q.readingMode==="spanish-only"||q.language==="Español"?"Español":q.language}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("button",{className:ae==="original"?"selected":"",onClick:()=>Se("original"),children:"Palenquero"}),(0,s.jsx)("button",{className:ae==="translation"?"selected":"",onClick:()=>Se("translation"),children:"Español"})]})'
  ],
  ['q.singleReading||ae==="original"?q.title:q.spanishTitle||q.title', 'G||ae==="original"?q.title:q.spanishTitle||q.title'],
  [
    '"aria-label":q.singleReading?"Abrir vocabulario":"Descubre c\\xF3mo se lee",children:[(0,s.jsx)("span",{children:q.singleReading?"Vocabulario":"Descubre c\\xF3mo se lee"})',
    '"aria-label":q.singleReading?"Abrir vocabulario":G&&!q.readingMode?"Abrir texto":"Descubre cómo se lee",children:[(0,s.jsx)("span",{children:q.singleReading?"Vocabulario":G&&!q.readingMode?"Abrir texto":"Descubre cómo se lee"})'
  ]
];
for (const [from, to] of readingReplacements) {
  if (!script.includes(from)) throw new Error('No se encontró una sección de lectura para actualizar.');
  script = script.replace(from, to);
}

// Make active territory selection accept the content used to generate this copy.
script = script.replace('if(v!=="palenque")', `if(v!=="${slug}")`);
// Generated territory pages open directly in their own audioteca. The portal
// remains the shared point of entry and sends visitors to these pages.
script = script.replace('let[v,z]=(0,pe.useState)(null)', `let[v,z]=(0,pe.useState)(${JSON.stringify(slug)})`);

if (slug !== 'palenque') {
  // The original engine contains a small number of Palenque-only labels and
  // cover values outside its content arrays. Replace only those for a
  // text-preview; its layout and interaction code remain untouched.
  const cover = renderData.cover || {};
  const profile = renderData.communityProfile || {};
  const vocabularyTrackNumbers = renderData.tracks
    .filter(track => track.singleReading)
    .map(track => track.number);
  const vocabularyTrackCondition = `${JSON.stringify(vocabularyTrackNumbers)}.includes(q.number)`;
  script = script.replaceAll('q.number==="07"', vocabularyTrackCondition);
  script = script.replaceAll('Acerca de Palenque', `Acerca de ${renderData.meta.name}`);
  script = script.replaceAll('Conoce Palenque', `Conoce ${renderData.meta.name}`);
  script = script.replaceAll('children:"Palenquero"', `children:${JSON.stringify(renderData.meta.readingOriginalLabel || renderData.meta.language || 'Lengua de la comunidad')}`);
  script = script.replaceAll('Fototeca de Palenque', `Fototeca de ${renderData.meta.name}`);
  script = script.replaceAll('Veinte miradas a San Basilio de Palenque.', `Fototeca de ${renderData.meta.name}.`);
  script = script.replace(/src:"images\/palenque-portadilla\.jpg",alt:"[^"]*"/, `src:${JSON.stringify(cover.image || 'images/portal/01.png')},alt:${JSON.stringify(cover.imageAlt || `Vista previa de ${renderData.meta.name}`)}`);
  script = script.replace('children:["San Basilio",(0,s.jsx)("br",{}),"de Palenque"]', `children:${JSON.stringify(cover.title || renderData.meta.name)}`);
  script = script.replace('children:"Relatos, cantos, juegos, palabras y paisajes sonoros para escuchar una comunidad que mantiene viva su lengua y su memoria."', `children:${JSON.stringify(cover.subtitle || '')}`);

  const profileChildren = [
    `(0,s.jsx)("span",{children:"Territorio, lengua y memoria"})`,
    `(0,s.jsx)("h2",{children:${JSON.stringify(`Acerca de ${data.meta.name}`)}})`,
    ...profile.history.map(paragraph => `(0,s.jsx)("p",{children:${JSON.stringify(paragraph)}})`)
  ].join(',');
  const aboutMarker = 'className:"about-copy",tabIndex:0,children:';
  const aboutStart = script.indexOf(aboutMarker);
  if (aboutStart >= 0) {
    const start = aboutStart + aboutMarker.length;
    const end = findExpressionEnd(script, start);
    script = `${script.slice(0, start)}[${profileChildren}]${script.slice(end)}`;
  }

  const factIcons = {
    'Otros nombres': 'Aa',
    'Ubicación': '⌖',
    'Población': '●●',
    'Lenguas': 'ab',
    'Territorio': '⌖'
  };
  const factRows = (profile.facts || []).filter(fact => fact.label !== 'Territorio').map(fact => `(0,s.jsxs)("div",{children:[(0,s.jsx)("span",{className:"fact-icon","aria-hidden":"true",children:${JSON.stringify(factIcons[fact.label] || '•')}}),(0,s.jsxs)("section",{children:[(0,s.jsx)("dt",{children:${JSON.stringify(fact.label)}}),(0,s.jsx)("dd",{children:${JSON.stringify(fact.value)}})]})]})`).join(',');
  const cultureChildren = [
    `(0,s.jsx)("div",{className:"culture-label",children:"Ficha de la comunidad"})`,
    `(0,s.jsx)("h3",{children:${JSON.stringify(renderData.meta.name)}})`,
    `(0,s.jsxs)("div",{className:"culture-layout",children:[(0,s.jsx)("dl",{children:[${factRows}]}),(0,s.jsx)("div",{className:"map-wrap",children:(0,s.jsx)("img",{src:"images/portal/mapa-comunidades.png",alt:${JSON.stringify(`Mapa ilustrado de Colombia con la ubicación de la comunidad ${renderData.meta.name}`)}})})]})`,
    profile.heritageNote ? `(0,s.jsx)("p",{className:"heritage-note",children:${JSON.stringify(profile.heritageNote)}})` : ''
  ].filter(Boolean).join(',');
  const cultureMarker = 'className:"culture-card",children:';
  const cultureStart = script.indexOf(cultureMarker);
  if (cultureStart >= 0) {
    const start = cultureStart + cultureMarker.length;
    const end = findExpressionEnd(script, start);
    script = `${script.slice(0, start)}[${cultureChildren}]${script.slice(end)}`;
  }
}

// The generated page lives two folders below the package root.
script = script.replaceAll('"images/', '"../../images/').replace(/"audio\/(?!mpeg"|mp4"|ogg")/g, '"../../audio/');
script = script.replace('href:"creditos.html"', 'href:"../../creditos.html"');

const output = path.join(root, 'territories', slug);
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'app.js'), script, 'utf8');
fs.writeFileSync(path.join(output, 'index.html'), `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#185775"><title>${territory.name} · De agua, viento y verdor</title>
<link rel="icon" href="../../favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../../assets/jsx-runtime-CZNtXjXx.css">
<link rel="stylesheet" href="../../assets/guide-layout-fix.css">
</head><body><div id="root"></div><script src="./app.js"></script><script src="../../assets/experience-label.js?v=portal-navigation-2"></script></body></html>\n`, 'utf8');
console.log(`Audioteca generada: territories/${slug}/index.html`);
