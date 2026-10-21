/* Auditoría de solo lectura para la entrega técnica a Maguaré. */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'maguare.config.json'), 'utf8'));
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
const runtime = [...new Set(tracked.filter(file => !replaced.has(file) && !(file in retiredAudio) && !relocated.has(file) && !developmentAssets.has(file) && (
  /^(audio|images|assets|territories)\//.test(file) ||
  ['index.html', 'creditos.html', 'manifest.webmanifest', 'robots.txt'].includes(file)))
  .concat(webp.map(image => image.target), Object.values(relocations), ['og.webp', 'favicon.webp']))];
const errors = [];
const warnings = [];
const oversized = { audio: [], image: [], og: [] };
let total = 0;
const totals = { audio: 0, images: 0, other: 0 };
for (const image of webp) {
  if (!fs.existsSync(path.join(root, image.target))) errors.push(`Falta WebP: ${image.target}`);
}
for (const rel of runtime.filter(file => /\.(?:html|css|js|json|webmanifest)$/i.test(file))) {
  const content = fs.readFileSync(path.join(root, rel), 'utf8');
  const stale = webp.find(image => content.includes(image.source));
  if (stale) errors.push(`Referencia PNG/JPG sin actualizar en ${rel}: ${stale.source}`);
  const obsolete = retired.find(image => content.includes(image.source) || content.includes(image.target));
  if (obsolete) errors.push(`Referencia a imagen antigua en ${rel}: ${obsolete.target}`);
  const oldAudio = Object.keys(retiredAudio).find(audio => content.includes(audio));
  if (oldAudio) errors.push(`Referencia a audio retirado en ${rel}: ${oldAudio}`);
  const audioRefs = new Set(content.match(/audio\/[^"'`\s<>]+?\.(?:mp3|m4a|ogg)/gi) || []);
  for (const audio of audioRefs) {
    if (!fs.existsSync(path.join(root, audio))) errors.push(`Audio inexistente en ${rel}: ${audio}`);
  }
  const oldLogo = [...relocated].find(image => content.includes(image));
  if (oldLogo) errors.push(`Referencia a logo movido en ${rel}: ${oldLogo}`);
}

function kb(bytes) { return (bytes / 1024).toFixed(0); }
function mb(bytes) { return (bytes / 1048576).toFixed(2); }
function meta(html, name) {
  return html.match(new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)`, 'i'))?.[1] || '';
}

for (const rel of runtime) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) { errors.push(`Falta archivo rastreado: ${rel}`); continue; }
  const bytes = fs.statSync(full).size;
  total += bytes;
  totals[rel.startsWith('audio/') ? 'audio' : rel.startsWith('images/') ? 'images' : 'other'] += bytes;
  const ext = path.extname(rel).toLowerCase();
  if (rel.startsWith('audio/')) {
    if (!['.mp3', '.ogg'].includes(ext)) warnings.push(`Formato de audio por revisar: ${rel}`);
    if (bytes > 5 * 1048576) oversized.audio.push({ rel, bytes });
  } else if (rel === 'og.webp' && bytes > 500 * 1024) {
    oversized.og.push({ rel, bytes });
  } else if (rel.startsWith('images/') && ['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
    const limit = /\/(fototeca|portada)\//i.test(rel) || /\/web\/(?:fototeca|portada)\//i.test(rel) ? 400 : 150;
    if (bytes > limit * 1024) oversized.image.push({ rel, bytes, limit });
  }
}

const pages = ['index.html', 'creditos.html', ...['cofan', 'inga', 'palenque', 'raizal', 'rrom', 'yukpa']
  .map(name => `territories/${name}/index.html`)];
for (const rel of pages) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  if (!/<html\s+lang="es-CO"/i.test(html)) warnings.push(`${rel}: usar lang="es-CO".`);
  if (!/<meta\s+name="viewport"/i.test(html)) errors.push(`${rel}: falta viewport.`);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${rel}: falta title.`);
  if (!meta(html, 'description')) warnings.push(`${rel}: falta meta description (se genera en el paquete).`);
  const refs = [...html.matchAll(/<(?:script|link|img)\b[^>]*?\b(?:src|href)="([^"]+)"/gi)];
  for (const [, ref] of refs) {
    if (/^(?:https?:|data:|#)/i.test(ref)) continue;
    if (ref.startsWith('/')) { errors.push(`${rel}: ruta absoluta incompatible con subdirectorio: ${ref}`); continue; }
    const target = path.resolve(root, path.dirname(rel), decodeURIComponent(ref.split('?')[0]));
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) errors.push(`${rel}: referencia inexistente: ${ref}`);
  }
}

if (total > 100 * 1048576) warnings.push(`Paquete web rastreado: ${mb(total)} MiB; la guía propone 75 MiB y evaluar excepciones hasta 100 MiB.`);
if (!config.productionUrl) warnings.push('Falta URL definitiva de Maguaré para canonical y Open Graph absolutos.');
if (!config.gtmContainerId) warnings.push('Falta ID de GTM aprobado; no se instala rastreo sin autorización.');
if (!fs.existsSync(path.join(root, 'og.webp'))) errors.push('Falta og.webp.');
if (!fs.existsSync(path.join(root, 'favicon.webp'))) errors.push('Falta favicon.webp.');
const appManifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const icon of appManifest.icons || []) {
  if (!fs.existsSync(path.join(root, icon.src))) errors.push(`Falta icono del manifiesto: ${icon.src}`);
}
if (!(appManifest.icons || []).some(icon => icon.sizes?.includes('512x512')))
  warnings.push('Falta icono de 512x512 en el manifiesto.');
if (!fs.existsSync(path.join(root, 'apple-touch-icon.png')))
  warnings.push('Falta apple-touch-icon.png para iOS.');
for (const [kind, files, unit] of [
  ['Audios >5 MiB', oversized.audio, 'MiB'],
  ['Imágenes sobre su límite', oversized.image, 'KiB'],
  ['Imagen Open Graph >500 KiB', oversized.og, 'KiB']
]) {
  files.sort((a, b) => b.bytes - a.bytes);
  console.log(`${kind}: ${files.length}`);
  for (const file of files.slice(0, 8))
    console.log(`  ${file.rel}: ${unit === 'MiB' ? mb(file.bytes) : kb(file.bytes)} ${unit}${file.limit ? ` (límite ${file.limit} KiB)` : ''}`);
  if (files.length > 8) console.log(`  ... y ${files.length - 8} más.`);
}
console.log(`Archivos del paquete web: ${runtime.length}; peso sin comprimir: ${mb(total)} MiB.`);
console.log(`Desglose: audio ${mb(totals.audio)} MiB; imágenes ${mb(totals.images)} MiB; otros ${mb(totals.other)} MiB.`);
for (const warning of warnings) console.warn(`AVISO: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);
console.log(`Auditoría: ${errors.length} error(es), ${warnings.length} aviso(s).`);
if (errors.length) process.exitCode = 1;
