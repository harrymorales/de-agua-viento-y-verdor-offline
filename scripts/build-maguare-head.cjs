/* Completa metadatos de una COPIA del sitio, nunca del árbol fuente. */
const fs = require('node:fs');
const path = require('node:path');

const sourceRoot = path.resolve(__dirname, '..');
const pages = ['index.html', 'creditos.html', ...['cofan', 'inga', 'palenque', 'raizal', 'rrom', 'yukpa']
  .map(name => `territories/${name}/index.html`)];
const descriptions = {
  'index.html': 'Explora De agua, viento y verdor: una audioteca de paisajes sonoros, cantos y relatos en lenguas nativas para niños y niñas de seis comunidades de Colombia.',
  'creditos.html': 'Conoce las instituciones, comunidades y personas que hicieron posible De agua, viento y verdor, una audioteca de relatos y paisajes sonoros para la infancia.',
  'territories/cofan/index.html': 'Escucha los cantos, relatos, vocabularios y paisajes sonoros de la comunidad Cofán en la audioteca De agua, viento y verdor para niños y niñas.',
  'territories/inga/index.html': 'Escucha los cantos, relatos, vocabularios y paisajes sonoros de la comunidad Inga en la audioteca De agua, viento y verdor para niños y niñas.',
  'territories/palenque/index.html': 'Escucha los cantos, relatos, vocabularios y paisajes sonoros de San Basilio de Palenque en la audioteca De agua, viento y verdor para niños y niñas.',
  'territories/raizal/index.html': 'Escucha los cantos, relatos, vocabularios y paisajes sonoros de la comunidad Raizal en la audioteca De agua, viento y verdor para niños y niñas.',
  'territories/rrom/index.html': 'Escucha los cantos, relatos, vocabularios y paisajes sonoros de la comunidad Rrom en la audioteca De agua, viento y verdor para niños y niñas.',
  'territories/yukpa/index.html': 'Escucha los cantos, relatos, vocabularios y paisajes sonoros de la comunidad Yukpa en la audioteca De agua, viento y verdor para niños y niñas.'
};

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
function setTag(html, matcher, tag) {
  return matcher.test(html) ? html.replace(matcher, tag) : html.replace(/<\/head>/i, `${tag}\n</head>`);
}
function buildHead(html, rel, config) {
  const production = config.environment === 'production';
  if (production && !config.productionUrl) throw Error('productionUrl es obligatorio en producción.');
  let base;
  if (production) {
    base = new URL(config.productionUrl);
    if (base.protocol !== 'https:') throw Error('productionUrl debe usar HTTPS.');
    if (!base.pathname.endsWith('/')) base.pathname += '/';
  }
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  if (!title) throw Error(`${rel}: falta <title>.`);
  const description = descriptions[rel];
  if (!description) throw Error(`${rel}: falta descripción editorial.`);
  const canonical = production ? new URL(rel, base).href : '';
  const image = production ? new URL(config.ogImage || 'og.webp', base).href : '';
  html = html.replace(/<html lang="es(?:-CO)?"/i, '<html lang="es-CO"');
  html = html.replace(/<meta name="theme-color"[^>]*>\s*(?=<meta name="description")/i, '');
  html = setTag(html, /<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(description)}">`);
  html = setTag(html, /<meta\s+name="robots"[^>]*>/i,
    `<meta name="robots" content="${production ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}">`);
  html = setTag(html, /<meta\s+property="og:type"[^>]*>/i, '<meta property="og:type" content="website">');
  html = setTag(html, /<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}">`);
  html = setTag(html, /<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}">`);
  html = setTag(html, /<meta\s+name="twitter:card"[^>]*>/i, '<meta name="twitter:card" content="summary_large_image">');
  html = setTag(html, /<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(title)}">`);
  html = setTag(html, /<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(description)}">`);
  if (production) {
    html = setTag(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonical)}">`);
    html = setTag(html, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${escapeHtml(canonical)}">`);
    html = setTag(html, /<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${escapeHtml(image)}">`);
    html = setTag(html, /<meta\s+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(image)}">`);
    if (config.gtmContainerId) {
      if (!/^GTM-[A-Z0-9]+$/.test(config.gtmContainerId)) throw Error('gtmContainerId no tiene formato GTM válido.');
      const id = config.gtmContainerId;
      const head = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f)})(window,document,'script','dataLayer','${id}');</script>`;
      const body = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`;
      html = html.replace(/<!-- MAGUARE_GTM_HEAD:[\s\S]*?-->/, head);
      html = html.replace(/<!-- MAGUARE_GTM_BODY:[\s\S]*?-->/, body);
      if (!html.includes(head)) html = html.replace(/<\/head>/i, `${head}</head>`);
      if (!html.includes(body)) html = html.replace(/<body[^>]*>/i, match => match + body);
    }
  } else {
    html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
    html = html.replace(/<meta\s+property="og:url"[^>]*>/gi, '');
  }
  return html;
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) throw Error('Uso: node scripts/build-maguare-head.cjs RUTA_DE_LA_COPIA_DEL_SITIO');
  const siteRoot = path.resolve(target);
  if (siteRoot === sourceRoot || sourceRoot.startsWith(siteRoot + path.sep))
    throw Error('Use una copia del sitio; el árbol fuente no se modifica.');
  const config = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'maguare.config.json'), 'utf8'));
  for (const rel of pages) {
    const file = path.join(siteRoot, rel);
    const html = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, buildHead(html, rel, config));
  }
  fs.writeFileSync(path.join(siteRoot, 'robots.txt'), config.environment === 'production'
    ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n');
  console.log(`Metadatos de ${pages.length} páginas preparados en ${siteRoot} (${config.environment}).`);
}

module.exports = { buildHead, pages };
