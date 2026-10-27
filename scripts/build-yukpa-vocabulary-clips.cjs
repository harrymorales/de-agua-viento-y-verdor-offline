/* Recorta el PCM decodificado por muestras; conserva los MP3 originales. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const ffmpeg = process.argv[2] || 'ffmpeg';
const content = JSON.parse(fs.readFileSync(path.join(root, 'src/content/yukpa.json'), 'utf8'));
const outputRoot = path.join(root, 'audio/yukpa/vocabularios');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const run = (args, input) => execFileSync(ffmpeg, ['-nostdin', '-hide_banner', '-loglevel', 'error', ...args], {
  input, windowsHide: true, maxBuffer: 256 * 1024 * 1024
});

function readPcm(wav) {
  if (wav.toString('ascii', 0, 4) !== 'RIFF' || wav.toString('ascii', 8, 12) !== 'WAVE') throw Error('WAV inválido');
  let format;
  for (let offset = 12; offset + 8 <= wav.length;) {
    const name = wav.toString('ascii', offset, offset + 4);
    const size = wav.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (name === 'fmt ') {
      format = { channels: wav.readUInt16LE(start + 2), sampleRate: wav.readUInt32LE(start + 4),
        blockAlign: wav.readUInt16LE(start + 12), bits: wav.readUInt16LE(start + 14) };
    }
    if (name === 'data') {
      if (!format || format.bits !== 16) throw Error('Se requiere PCM de 16 bits');
      return { ...format, data: wav.subarray(start, Math.min(wav.length, start + size)) };
    }
    offset = start + size + size % 2;
  }
  throw Error('Falta PCM en WAV');
}

const manifest = { precision: 'decoded PCM samples', sources: [], clips: [] };
for (const track of content.tracks.filter(track => track.singleReading)) {
  const source = path.join(root, track.audio);
  const sourceHash = digest(fs.readFileSync(source));
  const pcm = readPcm(run(['-i', source, '-map', '0:a:0', '-c:a', 'pcm_s16le', '-f', 'wav', 'pipe:1']));
  manifest.sources.push({ audio: track.audio, sha256: sourceHash, sampleRate: pcm.sampleRate, channels: pcm.channels });
  for (const index of track.vocabularyCategoryIndexes) {
    const category = content.vocabulary[index].title;
    const segment = content.vocabularyAudioSegments[category];
    const destination = path.resolve(root, segment.audio);
    if (!destination.startsWith(outputRoot + path.sep) || destination === source) throw Error('Destino de recorte inválido');
    const startSample = Math.round(segment.start * pcm.sampleRate);
    const endSample = Math.round(segment.end * pcm.sampleRate);
    if (startSample < 0 || endSample <= startSample || endSample * pcm.blockAlign > pcm.data.length) throw Error(`Rango inválido: ${category}`);
    const selected = pcm.data.subarray(startSample * pcm.blockAlign, endSample * pcm.blockAlign);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    run(['-y', '-f', 's16le', '-ar', String(pcm.sampleRate), '-ac', String(pcm.channels), '-i', 'pipe:0',
      '-c:a', 'libmp3lame', '-b:a', '128k', '-write_xing', '1', '-id3v2_version', '3', destination], selected);
    // La información gapless debe recuperar exactamente el número de muestras.
    const decoded = run(['-i', destination, '-map', '0:a:0', '-c:a', 'pcm_s16le', '-f', 's16le', 'pipe:1']);
    if (decoded.length !== selected.length) throw Error(`La duración decodificada no coincide: ${category}`);
    const record = { track: track.number, category, source: track.audio, audio: segment.audio,
      start: segment.start, end: segment.end, sampleRate: pcm.sampleRate, channels: pcm.channels,
      startSample, endSample, samples: endSample - startSample, sha256: digest(fs.readFileSync(destination)) };
    manifest.clips.push(record);
    console.log(`${track.number} ${category}: ${record.samples} muestras, ${record.samples / pcm.sampleRate} s`);
  }
  if (digest(fs.readFileSync(source)) !== sourceHash) throw Error('Se modificó el audio original');
}
fs.writeFileSync(path.join(__dirname, 'yukpa-vocabulary-clips-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`${manifest.clips.length} recortes verificados; originales intactos.`);
