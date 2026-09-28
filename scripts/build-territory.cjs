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

const territoryHeaders = {
  palenque: { name: 'Palenque', tagline: 'Tierra, tambor y verdor', color: '#B75635', ink: '#FFFFFF' },
  raizal: { name: 'Raizal', tagline: 'Mar, arrecife y luz insular', color: '#137F92', ink: '#FFFFFF' },
  rrom: { name: 'Rrom', tagline: 'Camino, tejido y encuentro', color: '#713E73', ink: '#FFFFFF' },
  inga: { name: 'Inga', tagline: 'Montaña, trama y páramo', color: '#465F91', ink: '#FFFFFF' },
  cofan: { name: 'Cofán', tagline: 'Selva, río y sombra húmeda', color: '#32775E', ink: '#FFFFFF' },
  yukpa: { name: 'Yukpa', tagline: 'Serranía, ave y fuego', color: '#BB842D', ink: '#24211E' }
};
const territoryHeader = territoryHeaders[slug];
if (!territoryHeader) throw new Error(`No hay encabezado definido para ${slug}.`);

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
    'q=O===null?null:Ul[O],G=!!(q&&(q.readingMode||q.singleReading||!q.translation||q.language==="Español")),se=(0,pe.useMemo)(()=>q?G?q.readingMode==="spanish-only"?q.translation||q.original:q.original||q.translation:ae==="original"?q.original:q.translation:void 0,[q,ae,G]),qa=q&&q.vocabularyCategoryIndexes?q.vocabularyCategoryIndexes.map(m=>Hl[m]):Hl,Be=qa[we]'
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
script = script.replaceAll('Hl.map(', 'qa.map(').replaceAll('Hl[we]', 'qa[we]');
script = script.replace('onClick:()=>{U(E),Se("original")}', 'onClick:()=>{U(E),Pa(0),Se("original")}');

// Some vocabulary sections include a short editorial note. Render it directly
// below the section name without changing the vocabulary layout.
const vocabularyHeaderMarker = '(0,s.jsx)("span",{children:q.number==="07"?qa[we].title:G||ae==="original"?q.title:q.spanishTitle||q.title})';
const vocabularyHeaderReplacement = '(0,s.jsxs)("div",{className:"vocab-reading-title",children:[(0,s.jsx)("span",{children:q.number==="07"?qa[we].title:G||ae==="original"?q.title:q.spanishTitle||q.title}),q.number==="07"&&qa[we].note&&(0,s.jsx)("small",{children:qa[we].note})]})';
if (!script.includes(vocabularyHeaderMarker)) throw new Error('No se encontró el encabezado del vocabulario para completar su nota.');
script = script.replace(vocabularyHeaderMarker, vocabularyHeaderReplacement);

// The source guide includes observation notes and inclusion adaptations.
// Render them with the existing guide card treatment whenever content provides
// those fields, so no text is hidden from the published experience.
const activityKeyMarker = String.raw`(0,s.jsxs)("div",{className:"activity-key",children:[(0,s.jsx)("b",{children:"Clave pedag\xF3gica"}),(0,s.jsx)("p",{children:La[be].key})]})`;
const activityKeyReplacement = String.raw`${activityKeyMarker},La[be].observation&&(0,s.jsxs)("div",{className:"activity-key",children:[(0,s.jsx)("b",{children:"Observaci\xF3n y registro"}),(0,s.jsx)("p",{children:La[be].observation})]}),La[be].adaptations&&(0,s.jsxs)("div",{className:"activity-key",children:[(0,s.jsx)("b",{children:"Adaptaciones e inclusi\xF3n"}),(0,s.jsx)("p",{children:La[be].adaptations})]})`;
if (!script.includes(activityKeyMarker)) throw new Error('No se encontró el detalle de la experiencia para completar.');
script = script.replace(activityKeyMarker, activityKeyReplacement);

// Make active territory selection accept the content used to generate this copy.
script = script.replace('if(v!=="palenque")', `if(v!=="${slug}")`);
// Generated territory pages open directly in their own audioteca. The portal
// remains the shared point of entry and sends visitors to these pages.
script = script.replace('let[v,z]=(0,pe.useState)(null)', `let[v,z]=(0,pe.useState)(${JSON.stringify(slug)})`);

// Each territory keeps the shared header layout but identifies itself with its
// editorial name, tagline and guide colour from the approved palette.
const sharedHeader = '(0,s.jsxs)("span",{children:[(0,s.jsx)("b",{children:"De agua, viento y verdor"}),(0,s.jsx)("small",{children:"Volver a las comunidades"})]})';
const territoryHeaderMarkup = `(0,s.jsxs)("span",{children:[(0,s.jsx)("b",{children:${JSON.stringify(territoryHeader.name)}}),(0,s.jsx)("small",{children:${JSON.stringify(territoryHeader.tagline)}})]})`;
if (!script.includes(sharedHeader)) throw new Error('No se encontró el encabezado compartido en el motor original.');
script = script.replace(sharedHeader, territoryHeaderMarkup);
script = script.replace(
  'className:"shell",children:',
  `className:"shell",style:{"--territory-guide":${JSON.stringify(territoryHeader.color)},"--territory-header-ink":${JSON.stringify(territoryHeader.ink)}},children:`
);

// The original Palenque bundle hard-codes its vocabulary as track 07. Content
// supplied for each territory identifies its own vocabulary record instead.
const vocabularyTrackNumbers = renderData.tracks
  .filter(track => track.singleReading)
  .map(track => track.number);
const vocabularyTrackCondition = `${JSON.stringify(vocabularyTrackNumbers)}.includes(q.number)`;
script = script.replaceAll('q.number==="07"', vocabularyTrackCondition);

// A territory may provide its own cover photograph while retaining the
// original Palenque cover composition and typography.
const cover = renderData.cover || {};
if (cover.image) {
  script = script.replace(
    /src:"images\/palenque-portadilla\.jpg",alt:"[^"]*"/,
    `src:${JSON.stringify(cover.image)},alt:${JSON.stringify(cover.imageAlt || `Vista previa de ${renderData.meta.name}`)}`
  );
}

if (slug !== 'palenque') {
  // The original engine contains a small number of Palenque-only labels and
  // cover values outside its content arrays. Replace only those for a
  // text-preview; its layout and interaction code remain untouched.
  const profile = renderData.communityProfile || {};
  script = script.replaceAll('Acerca de Palenque', `Acerca de ${renderData.meta.name}`);
  script = script.replaceAll('Conoce Palenque', `Conoce ${renderData.meta.name}`);
  script = script.replaceAll('children:"Palenquero"', `children:${JSON.stringify(renderData.meta.readingOriginalLabel || renderData.meta.language || 'Lengua de la comunidad')}`);
  script = script.replaceAll('Fototeca de Palenque', `Fototeca de ${renderData.meta.name}`);
  script = script.replaceAll('Veinte miradas a San Basilio de Palenque.', `Fototeca de ${renderData.meta.name}.`);
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
<link rel="icon" href="../../favicon_audioteca_margen_blanco_reducido.png" type="image/png">
<link rel="stylesheet" href="../../assets/jsx-runtime-CZNtXjXx.css">
<link rel="stylesheet" href="../../assets/guide-layout-fix.css">
<link rel="stylesheet" href="../../assets/brand-logo.css">
<link rel="stylesheet" href="../../assets/territory-header.css">
</head><body><div id="root"></div><script src="./app.js"></script><script src="../../assets/experience-label.js?v=guide-links-4"></script></body></html>\n`, 'utf8');
console.log(`Audioteca generada: territories/${slug}/index.html`);
