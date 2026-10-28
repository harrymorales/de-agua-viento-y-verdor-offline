/* Clips por categoría: conserva grabaciones, textos y límites aprobados. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const ffmpeg = process.argv[2] || 'ffmpeg';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const run = (args, input) => execFileSync(ffmpeg, ['-nostdin', '-hide_banner', '-loglevel', 'error', ...args], {
  input, windowsHide: true, maxBuffer: 256 * 1024 * 1024
});
function pcmFrom(wav) {
  if (wav.toString('ascii', 0, 4) !== 'RIFF' || wav.toString('ascii', 8, 12) !== 'WAVE') throw Error('WAV inválido');
  let format;
  for (let offset = 12; offset + 8 <= wav.length;) {
    const name = wav.toString('ascii', offset, offset + 4);
    const size = wav.readUInt32LE(offset + 4), start = offset + 8;
    if (name === 'fmt ') format = { channels: wav.readUInt16LE(start + 2), sampleRate: wav.readUInt32LE(start + 4),
      blockAlign: wav.readUInt16LE(start + 12), bits: wav.readUInt16LE(start + 14) };
    if (name === 'data') {
      if (!format || format.bits !== 16) throw Error('Se requiere PCM de 16 bits');
      return { ...format, data: wav.subarray(start, Math.min(wav.length, start + size)) };
    }
    offset = start + size + size % 2;
  }
  throw Error('Falta PCM');
}
for (const slug of ['palenque', 'rrom', 'raizal', 'inga', 'cofan']) {
  const contentPath = path.join(root, 'src/content', `${slug === 'palenque' ? 'palenque.original' : slug}.json`);
  const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
  const tracks = content.tracks.filter(track => track.singleReading);
  if (tracks.length !== 1) throw Error(`Compruebe las pistas de ${slug}`);
  const track = tracks[0], source = path.join(root, track.audio);
  const sourceHash = hash(fs.readFileSync(source));
  const pcm = pcmFrom(run(['-i', source, '-map', '0:a:0', '-c:a', 'pcm_s16le', '-f', 'wav', 'pipe:1']));
  const manifest = { precision: 'decoded PCM samples', sources: [{ audio: track.audio, sha256: sourceHash,
    sampleRate: pcm.sampleRate, channels: pcm.channels }], clips: [] };
  let ordinal = 0;
  for (const [category, segment] of Object.entries(content.vocabularyAudioSegments)) {
    ordinal++;
    if (segment.end === 0 && segment.start === 0) continue;
    const name = category.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/_+$/g, '');
    segment.audio = `audio/${slug}/vocabularios/${path.basename(track.audio).slice(0, 3)}-${track.number}-${String(ordinal).padStart(2, '0')}-${name}.mp3`;
    const destination = path.resolve(root, segment.audio), outputRoot = path.join(root, 'audio', slug, 'vocabularios');
    if (!destination.startsWith(outputRoot + path.sep) || destination === source) throw Error('Destino inválido');
    const startSample = Math.round(segment.start * pcm.sampleRate), endSample = Math.round(segment.end * pcm.sampleRate);
    if (startSample < 0 || endSample <= startSample || endSample * pcm.blockAlign > pcm.data.length) throw Error(`Rango inválido: ${slug}/${category}`);
    const selected = pcm.data.subarray(startSample * pcm.blockAlign, endSample * pcm.blockAlign);
    fs.mkdirSync(outputRoot, { recursive: true });
    run(['-y', '-f', 's16le', '-ar', String(pcm.sampleRate), '-ac', String(pcm.channels), '-i', 'pipe:0',
      '-c:a', 'libmp3lame', '-b:a', '128k', '-write_xing', '1', '-id3v2_version', '3', destination], selected);
    const decoded = run(['-i', destination, '-map', '0:a:0', '-c:a', 'pcm_s16le', '-f', 's16le', 'pipe:1']);
    if (decoded.length !== selected.length) throw Error(`Duración incorrecta: ${category}`);
    manifest.clips.push({ track: track.number, category, source: track.audio, audio: segment.audio,
      start: segment.start, end: segment.end, sampleRate: pcm.sampleRate, channels: pcm.channels,
      startSample, endSample, samples: endSample - startSample, sha256: hash(fs.readFileSync(destination)) });
  }
  if (hash(fs.readFileSync(source)) !== sourceHash) throw Error('Se modificó el original');
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2) + '\n');
  fs.writeFileSync(path.join(__dirname, `${slug}-vocabulary-clips-manifest.json`), JSON.stringify(manifest, null, 2) + '\n');

  // Actualiza únicamente el mapa de audio y la llamada del reproductor existente.
  const bundlePath = path.join(root, 'territories', slug, 'app.js');
  let bundle = fs.readFileSync(bundlePath, 'utf8');
  const map = bundle.match(/Um=(\{(?:[^{}]|\{[^{}]*\})*\})/);
  if (!map) throw Error(`Falta mapa en ${slug}`);
  const runtimeSegments = JSON.parse(JSON.stringify(content.vocabularyAudioSegments));
  Object.values(runtimeSegments).forEach(segment => { if (segment.audio) segment.audio = '../../' + segment.audio; });
  bundle = bundle.replace(map[0], 'Um=' + JSON.stringify(runtimeSegments));
  const oldCall = '(0,s.jsx)(df,{src:q.audio,start:d.start,end:d.end,autoplay:xe>0,label:Be.title},`${we}-${xe}`)';
  const clipCall = '(0,s.jsx)(df,{src:d.audio||q.audio,start:d.audio?0:d.start,end:d.audio?Math.round((d.end-d.start)*1000)/1000:d.end,autoplay:!!d.audio||xe>0,label:Be.title},`${q.number}-${we}-${xe}`)';
  if (bundle.includes(oldCall)) bundle = bundle.replace(oldCall, clipCall);
  else if (!bundle.includes(clipCall)) throw Error(`Reproductor inesperado: ${slug}`);
  fs.writeFileSync(bundlePath, bundle);
  console.log(`${slug}: ${manifest.clips.length} clips verificados; original intacto.`);
}
