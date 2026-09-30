#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contentDirectory = path.join(root, 'src', 'content');
const output = path.join(root, 'assets', 'audioteca-search-index.json');

const plainText = value => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(plainText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(plainText).join(' ');
  return '';
};

const excerpt = value => plainText(value).replace(/\s+/g, ' ').trim().slice(0, 220);
const entry = (community, type, title, body, extra = '') => ({
  community: community.name,
  slug: community.slug,
  type,
  title: title || type,
  snippet: excerpt(body),
  text: `${community.name} ${type} ${title || ''} ${plainText(body)} ${extra}`.replace(/\s+/g, ' ').trim(),
  url: `territories/${community.slug}/index.html`
});

const index = [];
for (const file of fs.readdirSync(contentDirectory).filter(name => name.endsWith('.json'))) {
  if (['territories.json', 'territory-template.json'].includes(file)) continue;
  const data = JSON.parse(fs.readFileSync(path.join(contentDirectory, file), 'utf8'));
  if (!data.meta?.slug || !data.meta?.name) continue;
  const community = { slug: data.meta.slug, name: data.meta.name };

  for (const track of data.tracks || []) {
    index.push(entry(
      community,
      `Pista ${track.number || ''} · ${track.kind || 'Audioteca'}`.trim(),
      track.spanishTitle || track.title,
      [track.title, track.spanishTitle, track.intro, track.original, track.translation, track.prompt],
      track.number
    ));
  }

  for (const vocabulary of data.vocabulary || []) {
    index.push(entry(community, 'Vocabulario', vocabulary.title, vocabulary.items || [], vocabulary.note || ''));
  }

  for (const activity of data.activities || []) {
    index.push(entry(community, 'Experiencia pedagógica', activity.title, activity, activity.tracks || ''));
  }

  for (const article of data.culturalArticles || []) {
    index.push(entry(community, 'Conoce la comunidad', article.title, article.paragraphs || []));
  }
}

fs.writeFileSync(output, `${JSON.stringify(index)}\n`);
console.log(`Índice de búsqueda generado: ${index.length} entradas.`);
