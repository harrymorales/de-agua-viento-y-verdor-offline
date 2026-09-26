const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const entries=new Map([...fs.readFileSync(path.join(root,'tmp','docx','extracted-content.txt'),'utf8').matchAll(/^P(\d+):\s?(.*)$/gm)].map(([,n,text])=>[Number(n),text]));
const contentPath=path.join(root,'src','content','yukpa.json');const data=JSON.parse(fs.readFileSync(contentPath,'utf8'));
data.communityProfile.history=[1090,1091,1092,1093,1094,1095].map(number=>entries.get(number));
data.communityProfile.facts=[
  {label:'Territorio',value:'Comunidad de San Genaro, Resguardo Indígena de Sokorhpa.'},
  {label:'Otros nombres',value:'Antes fueron llamados motilones mansos o motilados; la comunidad no adoptó este término como propio.'},
  {label:'Ubicación',value:'Serranía del Perijá, municipio de Becerril, departamento del Cesar, Colombia.'},
  {label:'Población',value:'300 personas y 96 familias en San Genaro (censo interno 2025); 7.000 indígenas yukpa en Colombia según Dusakawi.'},
  {label:'Lenguas',value:'Lengua yukpa, variante dialectal Sokorhpa, y español.'}
];
data.culturalArticles=[
  {title:entries.get(1102),paragraphs:[entries.get(1103),entries.get(1104),entries.get(1105)]},
  {title:entries.get(1106),paragraphs:[entries.get(1107),entries.get(1108),entries.get(1109),entries.get(1110),entries.get(1111),entries.get(1112),entries.get(1113),entries.get(1114)]},
  {title:entries.get(1115),paragraphs:[entries.get(1116),entries.get(1117),entries.get(1118)]},
  {title:entries.get(1119),paragraphs:[entries.get(1120),entries.get(1121),entries.get(1122)]},
  {title:entries.get(1123),paragraphs:[entries.get(1124),entries.get(1125)]},
  {title:entries.get(1126),paragraphs:[entries.get(1127),entries.get(1128),entries.get(1129),entries.get(1130)]}
];
fs.writeFileSync(contentPath,`${JSON.stringify(data,null,2)}\n`);console.log('Perfil Yukpa corregido');
