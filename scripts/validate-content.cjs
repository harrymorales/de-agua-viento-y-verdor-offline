/* Validates published territory data and their local audio/image references. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contentDirectory = path.join(root, 'src', 'content');
const catalog = JSON.parse(fs.readFileSync(path.join(contentDirectory, 'territories.json'), 'utf8'));
const errors = [];

function requireValue(value, label) {
  if (value === undefined || value === null || value === '') errors.push(`${label} es obligatorio.`);
}

function checkAsset(value, label) {
  if (!value) return;
  const asset = path.join(root, value.replaceAll('/', path.sep));
  if (!fs.existsSync(asset)) errors.push(`${label} no existe: ${value}`);
}

for (const territory of catalog.territories) {
  if (territory.status !== 'published') continue;
  const source = path.join(contentDirectory, territory.contentFile);
  if (!fs.existsSync(source)) {
    errors.push(`${territory.slug}: falta ${territory.contentFile}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(source, 'utf8'));
  requireValue(data.meta?.slug, `${territory.slug}: meta.slug`);
  requireValue(data.meta?.name, `${territory.slug}: meta.name`);
  if (data.meta?.slug !== territory.slug) errors.push(`${territory.slug}: el slug del catálogo no coincide con el contenido.`);
  if (!Array.isArray(data.tracks) || !data.tracks.length) errors.push(`${territory.slug}: debe tener al menos una pista.`);
  if (!Array.isArray(data.photos)) errors.push(`${territory.slug}: photos debe ser un arreglo.`);
  for (const track of data.tracks || []) {
    requireValue(track.number, `${territory.slug}: número de pista`);
    requireValue(track.title, `${territory.slug}: título de pista`);
    requireValue(track.audio, `${territory.slug}: audio de ${track.title || track.number}`);
    checkAsset(track.audio, `${territory.slug}: audio de ${track.title || track.number}`);
    checkAsset(track.audioFallback, `${territory.slug}: audio alterno de ${track.title || track.number}`);
    checkAsset(track.image, `${territory.slug}: imagen de ${track.title || track.number}`);
  }
  for (const photo of data.photos || []) checkAsset(photo.src, `${territory.slug}: fotografía`);
  for (const article of data.culturalArticles || []) checkAsset(article.image, `${territory.slug}: imagen del artículo`);
}

if (errors.length) {
  console.error(`Validación fallida (${errors.length} problema(s)):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Validación correcta: ${catalog.territories.filter(item => item.status === 'published').length} territorio(s) publicado(s).`);
