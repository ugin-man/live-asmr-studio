// Real engine + worker code with Web Audio/Chrome hardware replaced by fakes.
// This verifies lifecycle and persistence, not perceived sound quality.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..', 'extension');

class Param {
  constructor(value = 0) { this.value = value; }
  cancelScheduledValues() {}
  setValueAtTime(value) { assert.ok(Number.isFinite(value)); this.value = value; }
  linearRampToValueAtTime(value) { this.setValueAtTime(value); }
  setTargetAtTime(value) { this.setValueAtTime(value); }
}
class Node {
  constructor() {
    for (const key of ['gain', 'frequency', 'Q', 'delayTime', 'threshold', 'knee', 'ratio', 'attack', 'release']) {
      this[key] = new Param();
    }
    this.fftSize = 1024;
  }
  connect(node) { return node; }
  disconnect() {}
  getFloatTimeDomainData(data) { data.fill(0); }
}
const contexts = [];
class AudioBuffer {
  constructor({numberOfChannels, length, sampleRate}) {
    Object.assign(this, {numberOfChannels, length, sampleRate});
    this.channels = Array.from({length: numberOfChannels}, () => new Float32Array(length));
  }
  getChannelData(channel) { return this.channels[channel]; }
  copyToChannel(data, channel, offset = 0) { this.channels[channel].set(data, offset); }
}
let resumeBarrier = null;
let resumeEntered = false;
class AudioContext {
  constructor() {
    this.sampleRate = 48000;
    this.currentTime = 0;
    this.state = 'suspended';
    this.destination = new Node();
    contexts.push(this);
  }
  async resume() { resumeEntered = true; if (resumeBarrier) await resumeBarrier; this.state = 'running'; }
  async close() { this.state = 'closed'; }
  createBuffer(channels, length, rate) {
    const data = Array.from({length: channels}, () => new Float32Array(length));
    return { numberOfChannels: channels, length, sampleRate: rate,
      getChannelData: (channel) => data[channel] };
  }
}
for (const method of ['createMediaStreamSource', 'createGain', 'createAnalyser', 'createDelay',
  'createBiquadFilter', 'createDynamicsCompressor', 'createConvolver',
  'createChannelMerger', 'createChannelSplitter']) {
  AudioContext.prototype[method] = () => new Node();
}

const storage = {};
const tracks = [];
let engineListener;
let workerListener;
const engineSender = { id: 'test', url: 'chrome-extension://test/offscreen.html' };
const route = (message, sender = engineSender) => new Promise((resolve) => {
  workerListener(message, sender, resolve);
});
const worker = vm.createContext({ console, URL, chrome: {
  runtime: { id: 'test', getURL: (file) => `chrome-extension://test/${file}`,
    onMessage: { addListener(listener) { workerListener = listener; } },
    getContexts: async () => [{ contextType: 'OFFSCREEN_DOCUMENT' }],
    sendMessage: (message) => new Promise((resolve) => engineListener(message, {}, resolve)) },
  action: { onClicked: { addListener() {} }, setBadgeText: async () => {}, setBadgeBackgroundColor: async () => {} },
  storage: { local: {
    get: async (keys) => Object.fromEntries(keys.filter((key) => key in storage).map((key) => [key, storage[key]])),
    set: async (values) => { Object.assign(storage, values); }
  } }
} });
vm.runInContext(fs.readFileSync(path.join(root, 'background.js'), 'utf8'), worker);
function createEngine() {
const engine = vm.createContext({ console, AudioContext, AudioBuffer, atob, performance, setTimeout, clearTimeout,
  setInterval, clearInterval,
  fetch: async (url) => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(path.join(root, url), 'utf8')) }),
  navigator: { mediaDevices: { async getUserMedia() {
    const track = { label: 'test', readyState: 'live', enabled: true, muted: false,
      stop() { this.readyState = 'ended'; } };
    tracks.push(track);
    return { getTracks: () => [track], getAudioTracks: () => [track] };
  } } },
  chrome: { runtime: { sendMessage: route,
    onMessage: { addListener(listener) { engineListener = listener; } } } }
});
vm.runInContext(fs.readFileSync(path.join(root, 'offscreen.js'), 'utf8'), engine);
return engine;
}
let engine = createEngine();
const send = (type, extra = {}) => new Promise((resolve) => engineListener({target: 'offscreen', type, ...extra}, {}, resolve));
async function ok(type, extra) {
  const response = await send(type, extra);
  assert.equal(response.ok, true, response.error);
  return response.state;
}
async function main() {
  assert.equal(engine.chrome.storage, undefined);
  assert.equal((await route({ target: 'background', type: 'audio-settings-get', keys: ['hrtfOutputGain'] },
    {id: 'test', url: 'chrome-extension://test/sidepanel.html'})).ok, false);
  assert.equal((await route({ target: 'background', type: 'audio-settings-set',
    values: {highGainWarningAcceptedV1: true} })).ok, false);

  let state = await ok('start-capture', {streamId: 'first', tabId: 1});
  assert.equal(state.capturing, true);
  assert.equal(state.hrtf.motion.active, true);
  assert.equal(state.hrtf.motion.pattern, 'behind-sweep');
  assert.equal(state.hrtf.motion.durationSeconds, 24);
  assert.equal(state.hrtf.motion.rearTransitionSeconds, 3);
  assert.equal(state.ambience.mode, 'off');
  assert.equal(state.ambience.levelDb, -34);
  assert.equal(state.hrtf.outputGain, 1);
  assert.equal(state.texture.components.body, 0.7);
  assert.equal(state.texture.components.nearEar, 0.7);

  await ok('set-hrtf-output-gain', {value: 3});
  assert.equal(storage.hrtfOutputGain, 3);
  assert.equal((await send('set-hrtf-output-gain', {value: 'broken'})).ok, false);
  assert.equal(storage.hrtfOutputGain, 3);
  state = await ok('update-hrtf-motion', {pattern: 'left-pullback', durationSeconds: 40, rearTransitionSeconds: 2});
  assert.equal(state.hrtf.motion.active, true);
  assert.equal(storage.hrtfMotionPattern, 'left-pullback');
  assert.equal(storage.hrtfMotionDurationSeconds, 40);
  // Changing speed mid pull-away must retain the original near-ear base.
  vm.runInContext('currentDistanceMeters = 0.4', engine);
  state = await ok('update-hrtf-motion', {pattern: 'left-pullback', durationSeconds: 36, rearTransitionSeconds: 2.5});
  assert.equal(state.hrtf.motion.baseDistanceMeters, 0.1);
  assert.equal(state.hrtf.motion.durationSeconds, 36);

  const oldEndedEvent = tracks.at(-1).onended;
  await ok('stop-capture');
  assert.equal(contexts.at(-1).state, 'closed');
  engine = createEngine(); // Recreate the document, not just the capture graph.
  state = await ok('start-capture', {streamId: 'second', tabId: 2});
  assert.equal(state.hrtf.motion.pattern, 'left-pullback');
  assert.equal(state.hrtf.motion.durationSeconds, 36);
  assert.equal(state.hrtf.motion.rearTransitionSeconds, 2.5);
  oldEndedEvent();
  await vm.runInContext('audioLifecycleQueue', engine);
  assert.equal((await ok('get-state')).capturing, true);

  await ok('stop-hrtf-motion');
  assert.equal(storage.hrtfMotionEnabled, false);
  assert.equal((await ok('update-hrtf-motion', {pattern: 'behind-sweep', durationSeconds: 20})).hrtf.motion.active, false);
  await ok('stop-capture');
  state = await ok('start-capture', {streamId: 'manual', tabId: 2});
  assert.equal(state.hrtf.motion.active, false);
  assert.equal(state.hrtf.outputGain, 3);
  const previousTrackEnded = tracks.at(-1).onended;
  await ok('start-hrtf-motion', {pattern: 'right-pullback', durationSeconds: 32, rearTransitionSeconds: 1.5});
  // The panel can save another choice immediately before a manual map drag.
  storage.hrtfMotionPattern = 'front-sweep';
  storage.hrtfMotionDurationSeconds = 44;
  await ok('set-hrtf-position', {azimuth: 40, elevation: 0, distanceMeters: 0.2});
  assert.equal(storage.hrtfMotionEnabled, false);
  assert.equal(storage.hrtfMotionPattern, 'front-sweep');
  assert.equal(storage.hrtfMotionDurationSeconds, 44);
  assert.equal(storage.hrtfAzimuth, 40);
  await ok('stop-capture');
  state = await ok('start-capture', {streamId: 'manual-position', tabId: 2});
  previousTrackEnded();
  await vm.runInContext('audioLifecycleQueue', engine);
  assert.equal((await ok('get-state')).capturing, true);
  assert.equal(state.hrtf.motion.active, false);
  assert.equal(state.hrtf.azimuth, 40);

  // A track ending during an async resume must be cleaned up, not race a new graph.
  await ok('stop-capture');
  let release;
  resumeBarrier = new Promise((resolve) => { release = resolve; });
  resumeEntered = false;
  const starting = send('start-capture', {streamId: 'ending', tabId: 3});
  for (let i = 0; !resumeEntered && i < 100; i++) await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(resumeEntered, true);
  tracks.at(-1).readyState = 'ended';
  tracks.at(-1).onended();
  const stopping = send('stop-capture');
  release();
  assert.equal((await starting).ok, false);
  assert.equal((await stopping).state.capturing, false);
  assert.equal(contexts.at(-1).state, 'closed');
  assert.ok(tracks.every((track) => track.readyState === 'ended'));
  console.log('Audio lifecycle, runtime-only storage bridge and motion persistence tests passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => send('stop-capture'));
