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
console.log(`${cases} casos correctos: pistas completas, categorías y cambios de pista sin límites heredados.`);
