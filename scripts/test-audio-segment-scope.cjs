const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
class Audio extends EventTarget {
  currentTime = 0;
  readyState = 3;
  isConnected = true;
  plays = 0;
  pauses = 0;
  play() { this.plays++; return Promise.resolve(); }
  pause() { this.pauses++; }
}
function harness(scripts) {
  const state = { number: '01', selected: '', audio: new Audio(), disabled: new Set() };
  const observers = [];
  const timers = new Map();
  let id = 0;
  const stage = { querySelector(selector) {
    if (selector === '.giant-number') return { textContent: state.number };
    if (selector === '.vocab-categories button.selected' && state.selected) return { textContent: `01 ${state.selected}` };
    return null;
  } };
  const controls = { setAttribute(name) { state.disabled.add(name); }, removeAttribute(name) { state.disabled.delete(name); } };
  const player = {
    closest: () => stage,
    querySelector: selector => selector === 'audio' ? state.audio : controls,
    classList: { add() {}, remove() {} }
  };
  const document = {
    documentElement: {}, addEventListener() {},
    querySelector: () => player
  };
  const context = vm.createContext({
    document,
    window: {
      setTimeout(fn) { timers.set(++id, fn); return id; },
      clearTimeout(timer) { timers.delete(timer); }
    },
    MutationObserver: class { constructor(fn) { observers.push(fn); } observe() {} }
  });
  const flush = () => { while (timers.size) { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()); } };
  const update = () => { observers.forEach(fn => fn()); flush(); };
  scripts.forEach(file => vm.runInContext(fs.readFileSync(file, 'utf8'), context));
  flush();
  const track = (number, selected = '', readyState = 3) => {
    state.audio.isConnected = false;
    state.audio = new Audio();
    state.audio.readyState = readyState;
    state.number = number;
    state.selected = selected;
    state.disabled.clear();
    update();
    return state.audio;
  };
  return { state, track, update };
}

let cases = 0;
for (const [community, scripts, vocabNumbers, trackCount] of [
  ['rrom', ['rrom-vocabulary-segments.js'], ['08'], 11],
  ['yukpa', ['yukpa-vocabulary-one-segments.js', 'yukpa-vocabulary-two-segments.js'], ['05', '09'], 13]
]) {
  const h = harness(scripts.map(file => path.join(root, 'assets', file)));
  for (let number = 1; number <= trackCount; number++) {
    const value = String(number).padStart(2, '0');
    if (vocabNumbers.includes(value)) continue;
    const audio = h.track(value);
    for (const second of [22, 39, 104, 300, 600]) {
      audio.currentTime = second;
      audio.dispatchEvent(new Event('timeupdate'));
      assert.equal(audio.currentTime, second, `${community} ${value}: salto indebido`);
      assert.equal(audio.pauses, 0, `${community} ${value}: pausa indebida`);
    }
    assert.equal(audio.plays, 0, `${community} ${value}: inicio indebido`);
    cases++;
  }
  const content = JSON.parse(fs.readFileSync(path.join(root, 'src/content', `${community}.json`), 'utf8'));
  for (const [category, segment] of Object.entries(content.vocabularyAudioSegments)) {
    const number = community === 'rrom' ? '08' : content.tracks.find(track => track.vocabularyCategoryIndexes?.some(index => content.vocabulary[index].title === category)).number;
    const audio = h.track(number, category);
    if (segment.end === 0) {
      assert(h.state.disabled.has('disabled'));
      assert.equal(audio.plays, 0);
    } else {
      assert.equal(audio.currentTime, segment.start, `${category}: inicio`);
      assert.equal(audio.plays, 1, `${category}: reproducción`);
      audio.currentTime = segment.end + 0.1;
      audio.dispatchEvent(new Event('timeupdate'));
      assert.equal(audio.currentTime, segment.end, `${category}: final`);
      assert.equal(audio.pauses, 1, `${category}: pausa al final`);
    }
    // Un canplay tardío de una pista que ya se abandonó no debe reiniciarla.
    const waiting = h.track(number, category, 0);
    h.track('01');
    waiting.dispatchEvent(new Event('canplay'));
    h.update();
    assert.equal(waiting.plays, 0, `${category}: canplay tardío`);
    cases++;
  }
}
assert(fs.readFileSync(path.join(root, 'territories/yukpa/app.js'), 'utf8').includes('`${q.number}-${we}-${xe}`'));
for (const community of ['rrom', 'yukpa', 'palenque', 'cofan', 'inga', 'raizal']) {
  const source = community === 'palenque' ? 'palenque.original' : community;
  const content = JSON.parse(fs.readFileSync(path.join(root, 'src/content', `${source}.json`), 'utf8'));
  const bundle = fs.readFileSync(path.join(root, 'territories', community, 'app.js'), 'utf8');
  const map = bundle.match(/Um=(\{(?:[^{}]|\{[^{}]*\})*\})/);
  assert(map, `${community}: falta mapa de tiempos`);
  const runtimeSegments = JSON.parse(map[1]);
  for (const segment of Object.values(runtimeSegments)) {
    if (segment.audio) segment.audio = segment.audio.replace(/^\.\.\/\.\.\//, '');
  }
  assert.deepEqual(runtimeSegments, content.vocabularyAudioSegments, `${community}: tiempos publicados desactualizados`);
}
const rromBundle = fs.readFileSync(path.join(root, 'territories/rrom/app.js'), 'utf8');
const playerStart = rromBundle.indexOf('d.end>d.start?');
assert(playerStart >= 0, 'Rrom: falta la condición para omitir reproductores sin audio');
const playerExpression = rromBundle.slice(playerStart, rromBundle.indexOf(':null', playerStart) + 5);
const rromSegments = JSON.parse(fs.readFileSync(path.join(root, 'src/content/rrom.json'), 'utf8')).vocabularyAudioSegments;
for (const [title, segment] of Object.entries(rromSegments)) {
  const rendered = vm.runInNewContext(playerExpression, {
    d: segment, q: { audio: 'vocabulario.mp3', number: '08' },
    Be: { title }, we: 0, xe: 0, df() {},
    s: { jsx: (component, props) => props }
  });
  if (title === 'Otros atuendos') assert.equal(rendered, null, 'Otros atuendos debe conservar el texto sin reproductor');
  else {
    assert.equal(rendered.start, segment.start);
    assert.equal(rendered.end, segment.end);
  }
}
// Exercise the actual local player, including decimal seeks and stop values.
const yukpaBundle = fs.readFileSync(path.join(root, 'territories/yukpa/app.js'), 'utf8');
const playerFunctionStart = yukpaBundle.indexOf('function df({src:');
const playerFunctionEnd = yukpaBundle.indexOf('function Bm()', playerFunctionStart);
assert(playerFunctionStart >= 0 && playerFunctionEnd > playerFunctionStart);
const formatStart = yukpaBundle.indexOf('cf=') + 3;
const formatEnd = yukpaBundle.indexOf(';function df', formatStart);
const formatTime = vm.runInNewContext(`(${yukpaBundle.slice(formatStart, formatEnd)})`);
const yukpaSegments = JSON.parse(fs.readFileSync(path.join(root, 'src/content/yukpa.json'), 'utf8')).vocabularyAudioSegments;
const clipManifest = JSON.parse(fs.readFileSync(path.join(root, 'scripts/yukpa-vocabulary-clips-manifest.json'), 'utf8'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
assert.equal(clipManifest.clips.length, 13);
for (const source of clipManifest.sources) assert.equal(hash(source.audio), source.sha256, 'La grabación original debe conservarse');
const localHtml = fs.readFileSync(path.join(root, 'territories/yukpa/index.html'), 'utf8');
assert(!localHtml.includes('yukpa-vocabulary-one-segments.js'));
assert(!localHtml.includes('yukpa-vocabulary-two-segments.js'));
const clipCallStart = yukpaBundle.indexOf('(0,s.jsx)(df,{src:d.audio||q.audio');
const clipCallEndMarker = '},`${q.number}-${we}-${xe}`)';
const clipCallEnd = yukpaBundle.indexOf(clipCallEndMarker, clipCallStart);
assert(clipCallStart >= 0 && clipCallEnd > clipCallStart, 'El reproductor debe usar el fragmento de la categoría');
const clipCall = yukpaBundle.slice(clipCallStart, clipCallEnd + clipCallEndMarker.length);
for (const [title, segment] of Object.entries(yukpaSegments)) {
  const clip = clipManifest.clips.find(clip => clip.category === title);
  assert(clip && clip.audio === segment.audio);
  assert.equal(clip.start, segment.start);
  assert.equal(clip.end, segment.end);
  assert.equal(clip.samples, Math.round((segment.end - segment.start) * clip.sampleRate));
  assert.equal(hash(clip.audio), clip.sha256);
  const audio = new Audio();
  const effects = [];
  const element = (type, props) => ({ type, props });
  const nativePlayer = vm.runInNewContext(`(${yukpaBundle.slice(playerFunctionStart, playerFunctionEnd)})`, {
    pe: {
      useRef: () => ({ current: audio }),
      useState: initial => [initial, () => {}],
      useEffect: callback => effects.push(callback)
    },
    s: { jsx: element, jsxs: element }, cf: formatTime
  });
  const tree = vm.runInNewContext(clipCall, {
    d: { ...segment, audio: '../../' + segment.audio }, q: { number: clip.track },
    Be: { title }, we: 0, xe: 0, df: nativePlayer,
    s: { jsx: (component, props) => component(props) }
  });
  const dispose = effects.map(callback => callback());
  const duration = segment.end - segment.start;
  assert.equal(tree.props.children[0].props.children[0].props.src, '../../' + clip.audio);
  assert.equal(audio.currentTime, 0, `${title}: reproducir desde el inicio del fragmento exacto`);
  const range = tree.props.children[2].props.children[1];
  assert.equal(range.props.min, 0);
  assert.equal(range.props.max, duration);
  assert.equal(range.props.step, '0.001');
  audio.pauses = 0;
  audio.currentTime = duration - 0.001;
  tree.props.children[0].props.onTimeUpdate({ currentTarget: audio });
  assert.equal(audio.pauses, 0, `${title}: no cortar antes del final`);
  audio.currentTime = duration + 0.001;
  tree.props.children[0].props.onTimeUpdate({ currentTarget: audio });
  assert.equal(audio.pauses, 1, `${title}: detener al superar el final`);
  assert.equal(audio.currentTime, duration, `${title}: final del fragmento exacto`);
  audio.paused = true;
  audio.currentTime = duration - 0.02;
  tree.props.children[1].props.onClick();
  assert.equal(audio.currentTime, duration - 0.02, `${title}: reanudar los últimos milisegundos sin reiniciar`);
  audio.currentTime = duration;
  tree.props.children[1].props.onClick();
  assert.equal(audio.currentTime, 0, `${title}: repetir desde el inicio del fragmento`);
  const pausesBeforeDispose = audio.pauses;
  dispose.forEach(callback => callback?.());
  assert.equal(audio.pauses, pausesBeforeDispose + 1, `${title}: detener el fragmento al cambiar de categoría`);
}
console.log(`${cases} casos correctos de navegación y límites; ${Object.keys(yukpaSegments).length} fragmentos Yukpa verificados con el código del reproductor local.`);
