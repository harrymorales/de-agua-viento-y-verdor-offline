const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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
  assert.deepEqual(JSON.parse(map[1]), content.vocabularyAudioSegments, `${community}: tiempos publicados desactualizados`);
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
for (const [title, segment] of Object.entries(yukpaSegments)) {
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
  const tree = nativePlayer({ src: 'vocabulario.mp3', start: segment.start, end: segment.end, label: title });
  const dispose = effects.map(callback => callback());
  assert.equal(audio.currentTime, segment.start, `${title}: inicio nativo exacto`);
  const range = tree.props.children[2].props.children[1];
  assert.equal(range.props.min, segment.start);
  assert.equal(range.props.max, segment.end);
  audio.pauses = 0;
  audio.currentTime = segment.end - 0.001;
  tree.props.children[0].props.onTimeUpdate({ currentTarget: audio });
  assert.equal(audio.pauses, 0, `${title}: no cortar antes del final`);
  audio.currentTime = segment.end + 0.001;
  tree.props.children[0].props.onTimeUpdate({ currentTarget: audio });
  assert.equal(audio.pauses, 1, `${title}: detener al superar el final`);
  assert.equal(audio.currentTime, segment.end, `${title}: final nativo exacto`);
  dispose.forEach(callback => callback?.());
}
console.log(`${cases} casos correctos de navegación y límites; ${Object.keys(yukpaSegments).length} categorías Yukpa verificadas con el reproductor local real.`);
