/* Paquete autocontenido, sin fuentes de desarrollo ni originales ignorados. */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildHead, pages } = require('./build-maguare-head.cjs');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const allowOverweight = args.includes('--allow-overweight');
const destinationArg = args.find(arg => !arg.startsWith('--'));
if (!destinationArg && !dryRun) throw Error('Uso: node scripts/package-maguare.cjs RUTA_NUEVA [--dry-run] [--allow-overweight]');
const destination = destinationArg ? path.resolve(destinationArg) : null;
if (destination && (destination === root || root.startsWith(destination + path.sep)))
  throw Error('La salida debe ser una carpeta nueva, no la raíz ni un antecesor del proyecto.');

const config = JSON.parse(fs.readFileSync(path.join(root, 'maguare.config.json'), 'utf8'));
if (config.environment === 'production' && !config.productionUrl)
  throw Error('Configure productionUrl antes de generar el paquete de producción.');

const tracked = execFileSync('git', ['-c', `safe.directory=${root.replace(/\\/g, '/')}`, 'ls-files', '-z'], { cwd: root })
  .toString('utf8').split('\0').filter(Boolean);
const manifestFile = path.join(__dirname, 'webp-manifest.json');
const webp = fs.existsSync(manifestFile)
  ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')).converted : [];
const retired = JSON.parse(fs.readFileSync(path.join(__dirname, 'retired-images.json'), 'utf8'));
const replaced = new Set([...webp, ...retired].map(image => image.source));
const retiredAudio = JSON.parse(fs.readFileSync(path.join(__dirname, 'retired-audio.json'), 'utf8'));
const relocations = JSON.parse(fs.readFileSync(path.join(__dirname, 'image-relocations.json'), 'utf8'));
const relocated = new Set(Object.keys(relocations));
const developmentAssets = new Set([
  'assets/index-Faag-3-f.js',
  'assets/creditos-CLPKkVgZ.js',
  'assets/offline-creditos.js',
  'assets/jsx-runtime-BGaaR9gX.js'
]);
const files = [...new Set(tracked.filter(file => !replaced.has(file) && !(file in retiredAudio) && !relocated.has(file) && !developmentAssets.has(file) && (
  /^(audio|images|assets|territories)\//.test(file) ||
  ['index.html', 'creditos.html', 'manifest.webmanifest', 'robots.txt'].includes(file)))
  .concat(webp.map(image => image.target), Object.values(relocations), ['og.webp', 'favicon.webp']))];
for (const image of webp) {
  if (!fs.existsSync(path.join(root, image.target))) throw Error(`Falta WebP: ${image.target}`);
}
for (const rel of files.filter(file => /\.(?:html|css|js|json|webmanifest)$/i.test(file))) {
  const content = fs.readFileSync(path.join(root, rel), 'utf8');
  const stale = webp.find(image => content.includes(image.source));
  if (stale) throw Error(`Referencia a imagen sustituida en ${rel}: ${stale.source}`);
  const obsolete = retired.find(image => content.includes(image.source) || content.includes(image.target));
  if (obsolete) throw Error(`Referencia a imagen antigua en ${rel}: ${obsolete.target}`);
  const oldAudio = Object.keys(retiredAudio).find(audio => content.includes(audio));
  if (oldAudio) throw Error(`Referencia a audio retirado en ${rel}: ${oldAudio}`);
  const audioRefs = new Set(content.match(/audio\/[^"'`\s<>]+?\.(?:mp3|m4a|ogg)/gi) || []);
  for (const audio of audioRefs) {
    if (!fs.existsSync(path.join(root, audio))) throw Error(`Audio inexistente en ${rel}: ${audio}`);
  }
  const oldLogo = [...relocated].find(image => content.includes(image));
  if (oldLogo) throw Error(`Referencia a logo movido en ${rel}: ${oldLogo}`);
}
const bytes = files.reduce((sum, file) => sum + fs.statSync(path.join(root, file)).size, 0);
const mib = (bytes / 1048576).toFixed(2);
console.log(`${files.length} archivos web rastreados; ${mib} MiB sin comprimir.`);
if (dryRun) process.exit(0);
if (bytes > 100 * 1048576 && !allowOverweight)
  throw Error('Supera 100 MiB. Optimice/autorice los medios o use --allow-overweight para una copia de revisión, no una entrega conforme.');
if (fs.existsSync(destination)) throw Error(`La salida ya existe: ${destination}. No se sobrescribe.`);

// Validar todas las transformaciones antes de crear la carpeta de salida.
const preparedPages = new Map(pages.map(rel => [rel,
  buildHead(fs.readFileSync(path.join(root, rel), 'utf8'), rel, config)]));

fs.mkdirSync(destination, { recursive: true });
for (const rel of files) {
  const output = path.join(destination, rel);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.copyFileSync(path.join(root, rel), output);
}
for (const rel of pages) {
  fs.writeFileSync(path.join(destination, rel), preparedPages.get(rel));
}
fs.writeFileSync(path.join(destination, 'robots.txt'), config.environment === 'production'
  ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(destination, 'README.md'), [
  '# De agua, viento y verdor — copia de revisión para Maguaré',
  '',
  'Instalación: copie todo el contenido de esta carpeta a la URL HTTPS asignada.',
  'index.html debe quedar en la raíz del subdirectorio de instalación.',
  'No requiere compilación, Node.js, base de datos ni API en el servidor.',
  'Comando para una prueba local desde la carpeta que contiene este paquete: python -m http.server 8080',
  'Abra http://localhost:8080/NOMBRE_DE_ESTA_CARPETA/ y pruebe las seis comunidades.',
  'Conserve la estructura de assets/, audio/, images/ y territories/.',
  'El servidor debe enviar los archivos .webp con Content-Type: image/webp.',
  'Compruebe navegación, fotografías, audios, móviles y teclado en la URL final.',
  `Entorno: ${config.environment}.`,
  config.environment === 'production' ? `URL prevista: ${config.productionUrl}` : 'Staging: no indexar.',
  ''
].join('\n'));
console.log(`Paquete preparado en ${destination}. Compruebe enlaces, medios y peso antes de crear el ZIP.`);
