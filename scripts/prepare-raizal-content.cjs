/*
 * Builds the editable Raizal content file from the reviewed Word extraction.
 * The source text is kept in tmp/docx/extracted-content.txt; audio files are
 * intentionally referenced but are not copied or renamed by this script.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'tmp', 'docx', 'extracted-content.txt'), 'utf8');
const entries = new Map();
for (const match of source.matchAll(/^P(\d+):\s*([\s\S]*?)(?=^P\d+:|$)/gm)) {
  entries.set(Number(match[1]), match[2].trim());
}

function textAt(number) {
  const text = entries.get(number);
  if (!text) throw new Error(`No se encontró el párrafo P${number} en la extracción del Word.`);
  return text;
}

function textRange(start, end) {
  return Array.from(entries)
    .filter(([number]) => number >= start && number <= end)
    .map(([, text]) => text)
    // The original Palenque reader uses a single line break inside one
    // reading block. Keep that rhythm rather than adding a blank line after
    // every paragraph extracted from Word.
    .join('\n');
}

// The reader already displays the track title above both language columns.
// Word also includes that heading as the first paragraph of many readings,
// so remove it only when it exactly matches one of the track titles.
function withoutRepeatedReadingTitle(text, title, spanishTitle) {
  const [firstLine, ...rest] = text.split('\n');
  const headings = [title, spanishTitle].filter(Boolean).map(value => value.trim().toLocaleLowerCase());
  return headings.includes(firstLine.trim().toLocaleLowerCase()) ? rest.join('\n').trimStart() : text;
}

function parseVocabulary(title, start, end) {
  const items = textRange(start, end).split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const match = line.match(/^(.+?):\s*(.+?)\s*\(ing\.\)\s*—\s*(.+?)\s*\(cre\.\)$/i);
    if (!match) throw new Error(`No se pudo leer el vocabulario: ${line}`);
    const [, spanish, english, creole] = match;
    return { spanish, english, creole, palenquero: `${english} · ${creole}` };
  });
  return { title, items };
}

function activity(title, tracks, purpose, materials, steps, closing, key, observation, adaptations) {
  return { title, tracks, purpose, materials, steps, closing, key, observation, adaptations };
}

const sharedCredits = {
  mixingAndMastering: 'Pablo Martínez',
  productionAndRecording: 'León David Cobo',
  license: '© Ministerio de Educación Nacional de Colombia\n© Ministerio de las Culturas, las Artes y los Saberes de Colombia'
};

const tracks = [
  ['01', 'Amanecer en Providencia', '', 'Paisaje sonoro', '5:00', 'N/A', 'Rai-01-Amanecer_en_providencia-pai-son', 1615, '', '', 'León David Cobo Estrada', '2026-06-06'],
  ['02', 'Brown girl in the ring', 'Una morena en la ronda', 'Canción', '1:05', 'Creole (Raizal) + Español', 'Rai-02-Brown_girl_in_the_ring-can', 1618, [1620, 1634], [1635, 1649], 'Tradición oral; interpretación de estudiantes de la I.E. María Inmaculada y McLean Brothers', '2026-06-09'],
  ['03', 'Naansi an Margaret stuori', 'Historia de Anansi y Margarita', 'Relato', '3:34', 'Creole (Raizal) + Español', 'Rai-03-Naansi_an_margaret_stuori-rel', 1652, '', [1654, 1681], 'Tradición oral; voz Dionicia Gómez Davis; traducción Alejandro Dawkins Hawkins', '2026-06-04'],
  ['04', 'He Died for Me', 'Él murió por mí', 'Canción', '1:27', 'Creole (Raizal) + Español', 'Rai-04-He_died_for_me-can', 1684, [1686, 1695], [1696, 1705], 'John Newton (letra) y Edwin Othello Excell (música); interpretación Alejandro Dawkins Hawkins; dominio público', '2026-06-09'],
  ['05', 'Vocabularios', '', 'Vocabulario', '7:34', 'Creole (Raizal) + Español', 'Rai-05-Vocabularios-voc', 1708, '', '', 'Yaily Shakira Guerrero Taylor, Bruce Henrry Dufist y Blanca Newball Dawkins', '2026-06-09'],
  ['06', 'Los McLean Brothers interpretan un shotis', '', 'Música instrumental', '2:32', 'N/A', 'Rai-06-Los_mclean_brothers_interpretan_un_shotis-mus', 1864, '', '', 'Tradición oral; Marion McLean, Kemisto McLean, Senavio Robinson y Luis Cantillo', '2026-06-05'],
  ['07', 'La siembra del cordón umbilical', '', 'Relato', '1:10', 'Creole (Raizal) + Español', 'Rai-07-La_siembra_del_cordon_umbilical-rel', 1867, '', '', 'Dionicia Gómez Davis; traducción Alejandro Dawkins Hawkins', '2026-06-05'],
  ['08', 'Sleep, baby, sleep', 'Duerme, bebé, duerme', 'Arrullo', '0:57', 'Creole (Raizal) + Español', 'Rai-08-Sleep_baby_sleep-arr', 1871, [1873, 1892], [1893, 1912], 'Tradición oral; interpretación Dionicia Gómez Davis', '2026-06-04'],
  ['09', 'Fishing', 'Pesca', 'Relato', '7:32', 'Creole (Raizal) + Español', 'Rai-09-Fishing-rel', 1915, [1917, 1918], [1919, 1920], 'Anis Henry; traducción Alejandro Dawkins Hawkins', '2026-06-04'],
  ['10', 'Drop a letter', 'Deja caer una carta', 'Canción', '0:32', 'Creole (Raizal)', 'Rai-10-Drop_a_letter-can', 1923, [1925, 1930], [1931, 1935], 'Tradición oral; interpretación de estudiantes de la I.E. María Inmaculada y McLean Brothers', '2026-06-09'],
  ['11', 'Jesus loves the little children', 'Jesús ama a los niños pequeños', 'Canción', '0:40', 'Creole (Raizal) + Español', 'Rai-11-Jesus_loves_the_little_children-can', 1938, [1940, 1955], [1956, 1969], 'Clarence Herbert Woolston (letra) y George Frederick Root (música); dominio público; interpretación Krislena Bryan Howard, Mahalet Bryan Howard y Michaela Howard Corpus', '2026-06-09'],
  ['12', 'Los McLean Brothers interpretan una mazurca', '', 'Música instrumental', '2:17', 'N/A', 'Rai-12-Los_mclean_brothers_interpretan_una_mazurca-mus', 1972, '', '', 'Pendiente de confirmar el origen o autor en los metadatos; interpretación Marion McLean, Kemisto McLean, Senavio Robinson y Luis Cantillo', '2026-06-05'],
  ['13', 'Al mediodía en la playa de Manzanillo', '', 'Paisaje sonoro', '5:00', 'N/A', 'Rai-13-Al_mediodia_en_la_playa_de_manzanillo-pai-son', 1975, '', '', 'León David Cobo Estrada', '2026-06-06']
].map(([number, title, spanishTitle, kind, duration, language, fileBase, introParagraph, originalRange, translationRange, authorOrOrigin, captureDate]) => ({
  number,
  title,
  spanishTitle,
  kind,
  tracks: `Pista ${Number(number)}`,
  intro: textAt(introParagraph),
  audio: `audio/raizal/${fileBase}.mp3`,
  audioFileBase: fileBase,
  duration,
  language,
  authorOrOrigin,
  captureDate,
  credits: sharedCredits,
  image: '',
  activities: [],
  ...(number === '05' ? { singleReading: true } : {}),
  ...(originalRange ? { original: withoutRepeatedReadingTitle(textRange(...originalRange), title, spanishTitle) } : {}),
  ...(translationRange ? { translation: withoutRepeatedReadingTitle(textRange(...translationRange), title, spanishTitle) } : {})
}));

const vocabulary = [
  parseVocabulary('Familia', 1710, 1730),
  parseVocabulary('Colores', 1732, 1744),
  parseVocabulary('Animales', 1746, 1758),
  parseVocabulary('Números', 1760, 1760),
  parseVocabulary('Partes del cuerpo', 1762, 1784),
  parseVocabulary('Animales marinos', 1786, 1802),
  parseVocabulary('Música y vamos a…', 1804, 1817),
  parseVocabulary('Emociones', 1819, 1828),
  parseVocabulary('Nombrar el paisaje', 1830, 1861)
];

const vocabularyReading = vocabulary
  .map(category => `${category.title}\n${category.items.map(item => `${item.spanish} · ${item.english} · ${item.creole}`).join('\n')}`)
  .join('\n\n');

const experiencesByTrack = {
  '01': [0],
  '02': [5],
  '03': [5],
  '04': [4],
  '05': [2],
  '06': [3],
  '07': [1],
  '08': [4],
  '09': [0, 2],
  '10': [5],
  '11': [5],
  '12': [3],
  '13': [0, 2]
};

const data = {
  meta: {
    slug: 'raizal',
    name: 'Raizal',
    language: 'Creole raizal, español e inglés estándar',
    readingOriginalLabel: 'Creole raizal',
    status: 'text-ready',
    sources: [
      'De agua viento y verdor 4.docx',
      'Metadatos_Audioteca_FINAL.xlsm'
    ],
    pending: ['Copiar los 13 archivos de audio a audio/raizal y confirmar su extensión.', 'Incorporar imágenes autorizadas de portada, pistas y fototeca.', 'Confirmar origen o autor de la pista 12.']
  },
  cover: {
    title: 'Raizal',
    subtitle: 'Relatos, cantos, juegos, palabras y paisajes sonoros de Providencia.',
    image: '',
    imageAlt: ''
  },
  communityProfile: {
    facts: [
      { label: 'Territorio', value: textAt(1583) },
      { label: 'Otros nombres', value: 'Isleños.' },
      { label: 'Ubicación', value: 'Isla en el mar Caribe occidental, municipio de Providencia y Santa Catalina, departamento archipiélago de San Andrés, Providencia y Santa Catalina.' },
      { label: 'Población', value: '6.342 habitantes (Proyecciones de población del DANE, 2026). El 89 % de sus habitantes se identifica como raizal.' },
      { label: 'Lenguas', value: 'Creole o criollo sanandresano, español e inglés estándar.' }
    ],
    history: [textAt(1576), textAt(1577), textAt(1578), textAt(1579), textAt(1580), textAt(1581)],
    heritageNote: 'La audioteca recoge memorias, músicas, palabras y paisajes sonoros de Old Providence.'
  },
  tracks: tracks.map(track => ({
    ...track,
    activities: experiencesByTrack[track.number] || [],
    ...(track.number === '05' ? { original: vocabularyReading } : {})
  })),
  vocabulary,
  // These placeholders retain the vocabulary-reader structure until the
  // audio editor provides the actual start and end times for each category.
  vocabularyAudioSegments: Object.fromEntries(vocabulary.map(category => [category.title, { start: 0, end: 0 }])),
  photos: [],
  activities: [
    activity(
      textAt(3798).replace('Experiencia 1: ', ''),
      'Pistas 1, Amanecer en Providencia; 9, Fishing; y 13, Al mediodía en la playa de Manzanillo.',
      textAt(3806),
      `${textAt(3809)}\n${textAt(3810)}`,
      [textAt(3812), textAt(3813), textAt(3814), textAt(3815)],
      textAt(3828),
      `${textAt(3817)}\n${textAt(3818)}`,
      `${textAt(3820)}\n${textAt(3821)}\n${textAt(3822)}\n${textAt(3823)}`,
      `${textAt(3825)}\n${textAt(3826)}`
    ),
    activity(
      textAt(3829).replace('Experiencia 2: ', ''),
      'Pista 7, La siembra del cordón umbilical.',
      textAt(3835),
      `${textAt(3838)}\n${textAt(3839)}`,
      [textAt(3841), textAt(3842), textAt(3843), textAt(3844)],
      textAt(3857),
      `${textAt(3846)}\n${textAt(3847)}`,
      `${textAt(3849)}\n${textAt(3850)}\n${textAt(3851)}\n${textAt(3852)}`,
      `${textAt(3854)}\n${textAt(3855)}`
    ),
    activity(
      textAt(3858).replace('Experiencia 3: ', ''),
      'Pistas 5, Vocabularios; 9, Fishing; y 13, Al mediodía en la playa de Manzanillo.',
      textAt(3866),
      `${textAt(3869)}\n${textAt(3870)}`,
      [textAt(3872), textAt(3873), textAt(3874), textAt(3875)],
      textAt(3888),
      `${textAt(3877)}\n${textAt(3878)}`,
      `${textAt(3880)}\n${textAt(3881)}\n${textAt(3882)}\n${textAt(3883)}`,
      `${textAt(3885)}\n${textAt(3886)}`
    ),
    activity(
      textAt(3889).replace('Experiencia 4: ', ''),
      'Pistas 6, Los McLean Brothers interpretan un shotis; y 12, Los McLean Brothers interpretan una mazurca.',
      textAt(3896),
      `${textAt(3899)}\n${textAt(3900)}`,
      [textAt(3902), textAt(3903), textAt(3904), textAt(3905)],
      textAt(3918),
      `${textAt(3907)}\n${textAt(3908)}`,
      `${textAt(3910)}\n${textAt(3911)}\n${textAt(3912)}\n${textAt(3913)}`,
      `${textAt(3915)}\n${textAt(3916)}`
    ),
    activity(
      textAt(3919).replace('Experiencia 5: ', ''),
      'Pistas 4, He Died for Me; y 8, Sleep, baby, sleep.',
      textAt(3926),
      `${textAt(3929)}\n${textAt(3930)}`,
      [textAt(3932), textAt(3933), textAt(3934), textAt(3935)],
      textAt(3948),
      `${textAt(3937)}\n${textAt(3938)}`,
      `${textAt(3940)}\n${textAt(3941)}\n${textAt(3942)}\n${textAt(3943)}`,
      `${textAt(3945)}\n${textAt(3946)}`
    ),
    activity(
      textAt(3949).replace('Experiencia 6: ', ''),
      'Pistas 2, Brown girl in the ring; 3, Naansi an Margaret stuori; 10, Drop a letter; y 11, Jesus loves the little children.',
      textAt(3958),
      `${textAt(3961)}\n${textAt(3962)}`,
      [textAt(3964), textAt(3965), textAt(3966), textAt(3967)],
      textAt(3980),
      `${textAt(3969)}\n${textAt(3970)}`,
      `${textAt(3972)}\n${textAt(3973)}\n${textAt(3974)}\n${textAt(3975)}`,
      `${textAt(3977)}\n${textAt(3978)}`
    )
  ],
  culturalArticles: [
    { title: 'El ombligamiento', paragraphs: [textAt(1589)] },
    { title: 'El sonido de la caracola. Conch Shell blowing', paragraphs: [textAt(1591), textAt(1592), textAt(1593), textAt(1594)] },
    { title: 'Pikninis', paragraphs: [textAt(1596), textAt(1597), textAt(1598), textAt(1599), textAt(1600), textAt(1601), textAt(1602)] },
    { title: 'La música', paragraphs: [textAt(1604), textAt(1605), textAt(1606), textAt(1607)] },
    { title: 'La lengua en Providencia', paragraphs: [textAt(1609), textAt(1610), textAt(1611), textAt(1612)] }
  ]
};

fs.writeFileSync(path.join(root, 'src', 'content', 'raizal.json'), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Contenido Raizal preparado: ${data.tracks.length} pistas y ${data.vocabulary.length} categorías de vocabulario.`);
