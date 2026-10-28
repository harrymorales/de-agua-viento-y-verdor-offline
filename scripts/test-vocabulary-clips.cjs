const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
let total = 0;
for (const slug of ['palenque', 'rrom', 'raizal', 'inga', 'cofan', 'yukpa']) {
  const source = `src/content/${slug === 'palenque' ? 'palenque.original' : slug}.json`;
  const content = JSON.parse(fs.readFileSync(path.join(root, source), 'utf8'));
  const original = JSON.parse(execFileSync('git', ['-c', `safe.directory=${root.replace(/\\/g, '/')}`, 'show', `HEAD:${source}`], { cwd: root }));
  const withoutClips = JSON.parse(JSON.stringify(content));
  for (const value of [withoutClips, original]) Object.values(value.vocabularyAudioSegments).forEach(segment => delete segment.audio);
  assert.deepEqual(withoutClips, original, `${slug}: no deben cambiar textos, tiempos ni otras propiedades`);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, `scripts/${slug}-vocabulary-clips-manifest.json`), 'utf8'));
  manifest.sources.forEach(source => assert.equal(hash(source.audio), source.sha256, `${slug}: original alterado`));
  const bundle = fs.readFileSync(path.join(root, `territories/${slug}/app.js`), 'utf8');
  const runtime = JSON.parse(bundle.match(/Um=(\{(?:[^{}]|\{[^{}]*\})*\})/)[1]);
  const start = bundle.indexOf('(0,s.jsx)(df,{src:d.audio||q.audio');
  const endMarker = '},`${q.number}-${we}-${xe}`)';
  const end = bundle.indexOf(endMarker, start);
  assert(start >= 0 && end > start, `${slug}: falta reproductor por clips`);
  const call = bundle.slice(start, end + endMarker.length);
  for (const [category, segment] of Object.entries(content.vocabularyAudioSegments)) {
    if (segment.end === 0) { assert(!segment.audio); continue; }
    const clip = manifest.clips.find(clip => clip.category === category);
    assert(clip && clip.audio === segment.audio, `${slug}/${category}: falta clip`);
    assert.equal(hash(clip.audio), clip.sha256);
    assert.equal(clip.start, segment.start);
    assert.equal(clip.end, segment.end);
    assert.equal(clip.startSample, Math.round(segment.start * clip.sampleRate));
    assert.equal(clip.endSample, Math.round(segment.end * clip.sampleRate));
    assert.equal(runtime[category].audio, '../../' + clip.audio);
    const props = vm.runInNewContext(call, { d: runtime[category], q: { audio: 'original.mp3', number: clip.track },
      Be: { title: category }, we: 0, xe: 0, df() {}, s: { jsx: (_, props) => props } });
    assert.equal(props.src, '../../' + clip.audio);
    assert.equal(props.start, 0);
    assert.equal(props.end, Math.round((segment.end - segment.start) * 1000) / 1000);
    const wholeTrack = content.tracks.find(track => track.number === clip.track);
    assert.equal(wholeTrack.audio, clip.source, 'La pista completa debe conservar el original');
    total++;
  }
  const html = fs.readFileSync(path.join(root, `territories/${slug}/index.html`), 'utf8');
  assert(html.includes('responsive-layout.css?v=1'), `${slug}: falta responsive compartido`);
  assert(html.includes('brand-home-label.js?v=4'), `${slug}: falta bloqueo de fondo móvil`);
  if (slug === 'rrom') assert(!html.includes('rrom-vocabulary-segments.js'), 'No debe controlar los clips el antiguo salto por tiempos absolutos');
}
console.log(`${total} clips: mapas, reproductor, límites, hashes y originales correctos; textos y tiempos conservados; responsive enlazado en las seis comunidades.`);
