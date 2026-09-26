/* Audits the local package against MAG technical delivery requirements. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'maguare.config.json'), 'utf8'));
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const warnings = [];
const errors = [];

function requireMatch(pattern, message) { if (!pattern.test(index)) errors.push(message); }
function sizeInMiB(file) { return fs.statSync(file).size / 1024 / 1024; }
function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(item => {
    const fullPath = path.join(directory, item.name);
    return item.isDirectory() ? filesIn(fullPath) : [fullPath];
  });
}

requireMatch(/<html lang="es-CO">/, 'Falta lang="es-CO".');
requireMatch(/<meta name="viewport"/, 'Falta viewport responsive.');
requireMatch(/<meta name="theme-color"/, 'Falta theme-color.');
requireMatch(/<link rel="manifest" href="manifest\.webmanifest">/, 'Falta manifest web.');
requireMatch(/<meta name="description"/, 'Falta meta description.');
requireMatch(/<meta property="og:type" content="website">/, 'Falta og:type website.');
requireMatch(/<meta name="twitter:card" content="summary_large_image">/, 'Falta Twitter card.');
requireMatch(/MAGUARE_GTM_HEAD/, 'Falta espacio reservado para GTM en head.');
requireMatch(/MAGUARE_GTM_BODY/, 'Falta espacio reservado para GTM en body.');

const description = index.match(/<meta name="description" content="([^"]+)"/i)?.[1] || '';
if (description.length < 140 || description.length > 160) warnings.push(`Meta description tiene ${description.length} caracteres; objetivo: 140-160.`);
const title = index.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
if (title.length < 50 || title.length > 60) warnings.push(`Title tiene ${title.length} caracteres. La denominación institucional completa supera el rango 50-60.`);
if (!config.productionUrl) warnings.push('Falta productionUrl: no se puede emitir canonical, og:url u og:image absolutos.');
if (!config.gtmContainerId) warnings.push('Falta gtmContainerId: el espacio está reservado, pero GTM no se inyecta.');
if (!fs.existsSync(path.join(root, 'apple-touch-icon.png'))) warnings.push('Falta apple-touch-icon.png y los iconos PNG 192x192 / 512x512 requeridos para PWA.');
if (fs.existsSync(path.join(root, 'og.png')) && fs.statSync(path.join(root, 'og.png')).size > 500 * 1024) warnings.push('og.png supera 500 KB y debe reemplazarse por una imagen Open Graph de 1200x630 optimizada.');

for (const file of filesIn(path.join(root, 'audio'))) {
  const extension = path.extname(file).toLowerCase();
  const size = sizeInMiB(file);
  if (!['.mp3', '.ogg'].includes(extension)) warnings.push(`Audio no permitido para entrega MAG: ${path.relative(root, file)} (${extension}).`);
  if (size > 5) warnings.push(`Audio supera 5 MB: ${path.relative(root, file)} (${size.toFixed(2)} MB).`);
}
for (const file of filesIn(path.join(root, 'images'))) {
  const extension = path.extname(file).toLowerCase();
  const size = fs.statSync(file).size / 1024;
  if (!['.webp', '.jpg', '.jpeg', '.png', '.svg'].includes(extension)) warnings.push(`Formato de imagen no contemplado: ${path.relative(root, file)}.`);
  if (size > 400) warnings.push(`Imagen supera 400 KB: ${path.relative(root, file)} (${Math.round(size)} KB).`);
}

for (const message of errors) console.error(`ERROR: ${message}`);
for (const message of warnings) console.warn(`AVISO: ${message}`);
if (errors.length) process.exit(1);
console.log(`Auditoría completada: ${warnings.length} aviso(s), ${errors.length} error(es).`);
