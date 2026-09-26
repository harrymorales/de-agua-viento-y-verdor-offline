/* Builds editable Rrom content from the reviewed Word extraction. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'tmp', 'docx', 'extracted-content.txt'), 'utf8');
const entries = new Map();
for (const match of source.matchAll(/^P(\d+):\s*([\s\S]*?)(?=^P\d+:|$)/gm)) entries.set(Number(match[1]), match[2].trim());
const textAt = number => { const text = entries.get(number); if (!text) throw new Error(`Falta P${number}`); return text; };
const textRange = (start, end) => Array.from(entries).filter(([number]) => number >= start && number <= end).map(([, text]) => text).join('\n');
// The reader renders its own heading for each language column. Remove the
// duplicate Word heading only when it is exactly the track title.
const withoutRepeatedReadingTitle = (text, title, spanishTitle) => {
  const [firstLine, ...rest] = text.split('\n');
  const headings = [title, spanishTitle].filter(Boolean).map(value => value.trim().toLocaleLowerCase());
  return headings.includes(firstLine.trim().toLocaleLowerCase()) ? rest.join('\n').trimStart() : text;
};
const vocabulary = [
  ['Animales', 924, 940], ['Atuendos', 942, 945], ['Camino', 947, 951], ['Silencio y música', 953, 954], ['Alma gitana', 956, 957], ['Familia', 959, 980], ['Nombrar el paisaje', 982, 997], ['Colores', 999, 1006], ['Números', 1008, 1030], ['Saludos', 1032, 1037], ['Otros atuendos', 1041, 1046]
].map(([title, start, end]) => ({
  title,
  items: textRange(start, end).split('\n').filter(Boolean).map(line => {
    const match = line.match(/^(.+?):\s*(.+)$/);
    if (!match) throw new Error(`Vocabulario no reconocido: ${line}`);
    return { spanish: match[1], romanes: match[2], palenquero: match[2] };
  })
}));
const vocabularyReading = vocabulary.map(category => `${category.title}\n${category.items.map(item => `${item.spanish} · ${item.romanes}`).join('\n')}`).join('\n\n');
const commonCredits = { mixingAndMastering: 'Pablo Martínez', productionAndRecording: 'León David Cobo', license: '© Ministerio de Educación Nacional de Colombia\n© Ministerio de las Culturas, las Artes y los Saberes de Colombia' };
const definitions = [
  ['01','Caporal galopando','','Paisaje sonoro','1:36','N/A','Rro-01-Caporal_galopando-pai-son',766,'','', 'León David Cobo Estrada'],
  ['02','Le vurdona','Las carretas','Relato','1:18','Romanés + Español','Rro-02-Le_vurdona-rel',769,[771,775],[776,780],'Evangelina Triana; traducción Esperanza Gómez Triana'],
  ['03','Le tsery','Las carpas','Relato','3:56','Romanés + Español','Rro-03-Le_tsery-rel',783,[785,800],[801,816],'Evangelina Triana y Alfonso Gómez; traducción Esperanza Gómez Triana'],
  ['04','Arrurru mugo shavo','Arrurrú mi niño','Arrullo','2:06','Romanés + Español','Rro-04-Arrurru_mugo_shavo-arr',819,[821,851],[853,857],'Evangelina Triana; traducción Esperanza Gómez Triana'],
  ['05','E bramia akana pe de domul','El eterno presente','Relato','1:21','Romanés + Español','Rro-05-E_bramia_akana_pe_de_domul-rel',860,[862,866],[867,871],'Evangelina Triana; traducción Esperanza Gómez Triana'],
  ['06','Sar chiravelpe le sarmy','Receta de la sarma','Explicación','1:33','Romanés','Rro-06-Sar_chiravelpe_le_sarmy-exp',874,[876,897],'','Evangelina Triana; tradición oral'],
  ['07','Receta de la sarma','','Traducción','2:11','Español','Rro-07-Receta_de_la_sarma-tra',874,[898,919],'','Esperanza Gómez Triana; tradición oral'],
  ['08','Vocabularios','','Vocabulario','6:17','Romanés + Español','Rro-08-Vocabularios-voc',922,'','', 'Alfonso Gómez, Eduardo Gómez Triana, David Eduardo Gómez Barreto y Yance Gómez Barreto'],
  ['09','Soutuke, mugo tsinogo','Duerme, mi chiquito','Arrullo','2:01','Romanés + Español','Rro-09-Soutuke_mugo_tsinogo-arr',1049,[1051,1066],[1067,1082],'Paula Andrea Churón; traducción Dalila Gómez'],
  ['10','La bandera y la Pachiv','','Explicación','1:40','Romanés + Español','Rro-10-La_bandera_y_la_pachiv-exp',1085,'','', 'Eduardo Gómez Triana; tradición oral'],
  ['11','De tarde en El Salado','','Paisaje sonoro','5:00','N/A','Rro-11-De_tarde_en_el_salado-pai-son',1088,'','', 'León David Cobo Estrada']
];
const experienceByTrack = { '01':[0], '02':[0], '03':[1], '04':[2], '05':[2], '06':[3], '07':[3], '08':[0], '09':[2], '10':[4], '11':[4] };
const tracks = definitions.map(([number,title,spanishTitle,kind,duration,language,fileBase,intro,original,translation,authorOrOrigin]) => ({
  number, title, spanishTitle, kind, tracks: `Pista ${Number(number)}`, intro: textAt(intro), audio: `audio/rrom/${fileBase}.mp3`, audioFileBase: fileBase, duration, language, authorOrOrigin, credits: commonCredits, image: '', activities: experienceByTrack[number] || [], ...(number === '08' ? { singleReading: true, original: vocabularyReading } : {}), ...(original ? { original: withoutRepeatedReadingTitle(textRange(...original), title, spanishTitle) } : {}), ...(translation ? { translation: withoutRepeatedReadingTitle(textRange(...translation), title, spanishTitle) } : {})
}));
const activity = (title, tracksText, purpose, materials, steps, closing, key) => ({ title, tracks: tracksText, purpose, materials, steps, closing, key });
const data = {
  meta: { slug:'rrom', name:'Rrom', language:'Romanés o shib romaní y español', readingOriginalLabel:'Romanés', status:'text-ready', sources:['De agua viento y verdor 4.docx','Metadatos_Audioteca_FINAL.xlsm'], pending:['Copiar los 11 audios a audio/rrom y confirmar su extensión.','Incorporar imágenes autorizadas de portada, pistas y fototeca.'] },
  cover: { title:'Rrom', subtitle:'Relatos, cantos, palabras y paisajes sonoros de la Kumpania Tolima.', image:'', imageAlt:'' },
  communityProfile: { facts:[{label:'Territorio',value:'Kumpania Tolima.'},{label:'Otros nombres',value:'Pueblo rrom o gitano.'},{label:'Ubicación',value:'Kumpania establecida en Ibagué, Prado y Purificación, Tolima.'},{label:'Población',value:'61 integrantes en 2026, pertenecientes a la vitsa Bolochok.'},{label:'Lenguas',value:'Romanés o shib romaní y español.'}], history:[textAt(728),textAt(729),textAt(730),textAt(731),textAt(732),textAt(733)], heritageNote:'La Kumpania Tolima mantiene viva la memoria, la lengua y las tradiciones del pueblo Rrom.' },
  tracks, vocabulary, vocabularyAudioSegments:Object.fromEntries(vocabulary.map(category => [category.title,{start:0,end:0}])), photos:[],
  activities:[
    activity(textAt(3490).replace('Experiencia 1: ',''),'Pistas 1, Caporal galopando; 2, Le vurdona; y 8, Vocabularios.',textAt(3498),`${textAt(3501)}\n${textAt(3502)}`,[textAt(3504),textAt(3505),textAt(3506),textAt(3507)],textAt(3520),`${textAt(3509)}\n${textAt(3510)}`),
    activity(textAt(3521).replace('Experiencia 2: ',''),'Pista 3, Le tsery.',textAt(3527),`${textAt(3530)}\n${textAt(3531)}`,[textAt(3533),textAt(3534),textAt(3535),textAt(3536)],textAt(3549),`${textAt(3538)}\n${textAt(3539)}`),
    activity(textAt(3550).replace('Experiencia 3: ',''),'Pistas 4, Arrurru mugo shavo; 5, E bramia akana pe de domul; y 9, Soutuke, mugo tsinogo.',textAt(3558),`${textAt(3561)}\n${textAt(3562)}`,[textAt(3564),textAt(3565),textAt(3566),textAt(3567)],textAt(3580),`${textAt(3569)}\n${textAt(3570)}`),
    activity(textAt(3581).replace('Experiencia 4: ',''),'Pistas 6 y 7, Sar chiravelpe le sarmy.',textAt(3587),`${textAt(3590)}\n${textAt(3591)}`,[textAt(3593),textAt(3594),textAt(3595),textAt(3596)],textAt(3609),`${textAt(3598)}\n${textAt(3599)}`),
    activity(textAt(3610).replace('Experiencia 5: ',''),'Pistas 10, La bandera y la Pachiv; y 11, De tarde en El Salado.',textAt(3617),`${textAt(3620)}\n${textAt(3621)}`,[textAt(3623),textAt(3624),textAt(3625),textAt(3626)],textAt(3639),`${textAt(3628)}\n${textAt(3629)}`)
  ],
  culturalArticles:[
    {title:'Cuando un niño gitano llega al mundo',paragraphs:[textAt(738),textAt(739)]}, {title:'La crianza gitana',paragraphs:[textAt(741),textAt(742),textAt(743),textAt(744)]}, {title:'La vida familiar',paragraphs:[textAt(746),textAt(747),textAt(748)]}, {title:'El valor de la palabra',paragraphs:[textAt(750)]}, {title:'Caravanas, carretas y caballos',paragraphs:[textAt(752),textAt(753),textAt(754),textAt(755),textAt(756)]}, {title:'Shib romaní',paragraphs:[textAt(758),textAt(759)]}, {title:'El alma libre',paragraphs:[textAt(761),textAt(763)]}
  ]
};
fs.writeFileSync(path.join(root,'src','content','rrom.json'),`${JSON.stringify(data,null,2)}\n`,'utf8');
console.log(`Contenido Rrom preparado: ${tracks.length} pistas, ${vocabulary.length} categorías y ${data.activities.length} experiencias.`);
