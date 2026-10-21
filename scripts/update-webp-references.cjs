/* Reescritura mecánica de rutas tras convertir imágenes de contenido a WebP. */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'webp-manifest.json'), 'utf8'));
const tracked = execFileSync('git', ['-c', `safe.directory=${root.replace(/\\/g, '/')}`, 'ls-files', '-z'], { cwd: root })
  .toString('utf8').split('\0').filter(Boolean);
const textFiles = tracked.filter(file =>
  !file.startsWith('scripts/') && /\.(?:html|css|js|jsx|ts|tsx|json|webmanifest)$/i.test(file));
let changed = 0;
let replacements = 0;

for (const rel of textFiles) {
  const file = path.join(root, rel);
  let source = fs.readFileSync(file, 'utf8');
  let result = source;
  for (const image of manifest.converted) {
    if (!fs.existsSync(path.join(root, image.target))) throw Error(`Falta ${image.target}`);
    if (!result.includes(image.source)) continue;
    const parts = result.split(image.source);
    replacements += parts.length - 1;
    result = parts.join(image.target);
  }
  if (result !== source) {
    fs.writeFileSync(file, result);
    changed++;
    console.log(rel);
  }
}

for (const rel of textFiles) {
  const content = fs.readFileSync(path.join(root, rel), 'utf8');
  const stale = manifest.converted.find(image => content.includes(image.source));
  if (stale) throw Error(`Referencia sin actualizar en ${rel}: ${stale.source}`);
}
console.log(`Actualizados ${changed} archivos de texto y ${replacements} referencias. Logos oficiales intactos.`);
