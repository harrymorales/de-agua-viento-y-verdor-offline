const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const controllerCode = fs.readFileSync(path.join(root, 'assets/vocabulary-segment-boundary.js'), 'utf8');

class Clock {
  now = 0;
  serial = 0;
  tasks = new Map();
  setTimeout = (fn, delay) => {
    const id = ++this.serial;
    this.tasks.set(id, { fn, at: this.now + Math.max(4, delay) });
    return id;
  };
  clearTimeout = id => this.tasks.delete(id);
  advance(ms) {
    const end = this.now + ms;
    let iterations = 0;
    while (this.tasks.size) {
      const [id, next] = [...this.tasks].sort((a, b) => a[1].at - b[1].at)[0];
      if (next.at > end) break;
      if (++iterations > 100000) throw Error('Temporizador sin progreso');
      this.now = next.at;
      this.tasks.delete(id);
      next.fn();
    }
    this.now = end;
  }
}
class Media extends EventTarget {
  readyState = 3;
  seeking = false;
  ended = false;
  isConnected = true;
  playbackRate = 1;
  paused = true;
  buffering = false;
  position = 0;
  baseTime = 0;
  stops = [];
  writes = 0;
  constructor(clock) { super(); this.clock = clock; }
  get currentTime() {
    return this.position + (!this.paused && !this.buffering && !this.seeking
      ? (this.clock.now - this.baseTime) / 1000 * this.playbackRate : 0);
  }
  set currentTime(value) { this.writes++; this.position = value; this.baseTime = this.clock.now; }
  play() {
    this.currentTime = this.currentTime;
    this.paused = false;
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  }
  pause() {
    const actual = this.currentTime;
    const wasPaused = this.paused;
    this.position = actual;
    this.baseTime = this.clock.now;
    this.paused = true;
    if (!wasPaused) {
      this.stops.push(actual);
      this.dispatchEvent(new Event('pause'));
    }
  }
  seek(value) {
    this.seeking = true;
    this.dispatchEvent(new Event('seeking'));
    this.currentTime = value;
    this.seeking = false;
    this.dispatchEvent(new Event('seeked'));
  }
  rate(value) {
    this.currentTime = this.currentTime;
    this.playbackRate = value;
    this.dispatchEvent(new Event('ratechange'));
  }
  wait() {
    this.currentTime = this.currentTime;
    this.buffering = true;
    this.dispatchEvent(new Event('waiting'));
  }
  resumeBuffer() {
    this.baseTime = this.clock.now;
    this.buffering = false;
    this.dispatchEvent(new Event('playing'));
  }
}
function setup() {
  const clock = new Clock();
  const module = { exports: {} };
  vm.runInNewContext(controllerCode, { window: clock, module });
  return { clock, boundary: module.exports };
}
let count = 0;
let maxDelayMs = 0;
for (const community of ['palenque', 'rrom', 'raizal', 'inga', 'cofan']) {
  const name = community === 'palenque' ? 'palenque.original' : community;
  const data = JSON.parse(fs.readFileSync(path.join(root, `src/content/${name}.json`), 'utf8'));
  const bundle = fs.readFileSync(path.join(root, `territories/${community}/app.js`), 'utf8');
  const begin = bundle.indexOf('function df({src:');
  const end = bundle.indexOf('function Bm()', begin);
  const track = data.tracks.find(track => track.singleReading);
  for (const [title, range] of Object.entries(data.vocabularyAudioSegments)) {
    if (range.end <= range.start) continue;
    const { clock, boundary } = setup();
    const audio = new Media(clock);
    const effects = [];
    let attachments = 0;
    const attach = boundary.attach;
    boundary.attach = (...args) => { attachments++; return attach(...args); };
    const element = (type, props) => ({ type, props });
    const player = vm.runInNewContext(`(${bundle.slice(begin, end)})`, {
      pe: { useRef: () => ({ current: audio }), useState: initial => [initial, () => {}], useEffect: effect => effects.push(effect) },
      s: { jsx: element, jsxs: element }, cf: value => String(value),
      window: { AudiotecaVocabularyBoundary: boundary }
    });
    const tree = player({ src: '../../' + track.audio, start: range.start, end: range.end, label: title });
    const cleanup = effects.map(effect => effect());
    assert.equal(attachments, 1);
    assert.equal(audio.currentTime, range.start);
    assert.equal(tree.props.children[0].props.children[0].props.src, '../../' + track.audio);
    assert.equal(tree.props.children[2].props.children[1].props.step, '0.001');
    audio.stops = [];
    audio.play();
    // No timeupdate events: el reloj debe detener el audio por sí solo.
    clock.advance((range.end - range.start) * 1000 + 10);
    assert(audio.paused, `${community}/${title}: no se detuvo`);
    assert.equal(audio.currentTime, range.end);
    assert.equal(audio.stops.length, 1);
    const delayMs = (audio.stops[0] - range.end) * 1000;
    assert(delayMs >= -0.00001 && delayMs <= 4.01, `${community}/${title}: retraso ${delayMs} ms`);
    maxDelayMs = Math.max(maxDelayMs, delayMs);
    const writes = audio.writes;
    tree.props.children[0].props.onTimeUpdate({ currentTarget: audio });
    tree.props.children[0].props.onTimeUpdate({ currentTarget: audio });
    assert.equal(audio.writes, writes, 'El final no debe provocar búsquedas repetidas al mismo instante');
    cleanup.forEach(dispose => dispose?.());
    assert.equal(clock.tasks.size, 0);
    count++;
  }
}
// Pausa, reanudación, avance, retroceso, velocidad y espera de red.
for (const scenario of ['pause', 'forward', 'backward', 'rate2', 'rateHalf', 'waiting', 'dispose', 'replace']) {
  const { clock, boundary } = setup();
  const audio = new Media(clock);
  audio.currentTime = 10.123;
  const dispose = boundary.attach(audio, { start: 10.123, end: 20.456 });
  audio.play();
  clock.advance(1000);
  if (scenario === 'pause') {
    audio.pause(); const at = audio.currentTime;
    clock.advance(30000); assert.equal(audio.currentTime, at); assert.equal(clock.tasks.size, 0);
    audio.play();
  } else if (scenario === 'forward') audio.seek(20.451);
  else if (scenario === 'backward') audio.seek(10.2);
  else if (scenario === 'rate2') audio.rate(2);
  else if (scenario === 'rateHalf') audio.rate(0.5);
  else if (scenario === 'waiting') {
    audio.wait(); const at = audio.currentTime;
    clock.advance(30000); assert.equal(audio.currentTime, at); assert(!audio.paused);
    audio.resumeBuffer();
  } else if (scenario === 'dispose') {
    dispose(); clock.advance(30000); assert(!audio.paused); assert.equal(clock.tasks.size, 0); continue;
  } else if (scenario === 'replace') {
    boundary.attach(audio, { start: 10.123, end: 40.789 });
    clock.advance(15000); assert(!audio.paused);
    clock.advance(20000); assert(audio.paused); assert.equal(audio.currentTime, 40.789); continue;
  }
  clock.advance((20.456 - audio.currentTime) / audio.playbackRate * 1000 + 10);
  assert(audio.paused, scenario);
  assert.equal(audio.currentTime, 20.456, scenario);
  dispose();
}
for (const end of [undefined, 0, NaN]) {
  const { clock, boundary } = setup();
  const audio = new Media(clock);
  boundary.attach(audio, { start: 0, end });
  audio.play(); clock.advance(600000);
  assert(!audio.paused); assert.equal(clock.tasks.size, 0);
}
console.log(`${count} categorías con el MP3 original: corte sin timeupdate; retraso simulado máximo ${maxDelayMs.toFixed(3)} ms con temporizadores mínimos de 4 ms. 11 casos adicionales correctos.`);
