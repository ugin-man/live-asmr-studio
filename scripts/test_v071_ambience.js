const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FakeAudioParam {
  constructor(value = 0) {
    this.value = value;
  }

  cancelScheduledValues() {}

  setValueAtTime(value) {
    this.value = value;
  }

  linearRampToValueAtTime(value) {
    this.value = value;
  }
}

class FakeNode {
  constructor() {
    this.gain = new FakeAudioParam(1);
    this.frequency = new FakeAudioParam(350);
    this.Q = new FakeAudioParam(1);
    this.connections = [];
  }

  connect(node) {
    this.connections.push(node);
    return node;
  }

  disconnect() {
    this.connections = [];
  }
}

class FakeBuffer {
  constructor(channels, length, sampleRate) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.channels = Array.from({ length: channels }, () => new Float32Array(length));
  }

  getChannelData(channel) {
    return this.channels[channel];
  }
}

class FakeBufferSource extends FakeNode {
  constructor() {
    super();
    this.buffer = null;
    this.loop = false;
    this.started = false;
    this.stopped = false;
  }

  start() {
    this.started = true;
  }

  stop() {
    this.stopped = true;
  }
}

class FakeAudioContext {
  constructor() {
    this.sampleRate = 48000;
    this.currentTime = 0;
    this.state = 'running';
    this.sources = [];
  }

  createBuffer(channels, length, sampleRate) {
    return new FakeBuffer(channels, length, sampleRate);
  }

  createBufferSource() {
    const source = new FakeBufferSource();
    this.sources.push(source);
    return source;
  }

  createBiquadFilter() {
    return new FakeNode();
  }

  createGain() {
    return new FakeNode();
  }

  async close() {
    this.state = 'closed';
  }
}

function rms(buffer) {
  let squareSum = 0;
  for (const sample of buffer) squareSum += sample * sample;
  return Math.sqrt(squareSum / buffer.length);
}

async function main() {
  const extensionRoot = path.resolve(__dirname, '..', 'extension');
  const source = fs.readFileSync(path.join(extensionRoot, 'offscreen.js'), 'utf8');
  const passiveTestConfigSource = fs.readFileSync(
    path.join(extensionRoot, 'passive-test-config.js'), 'utf8');
  const passiveTestConfigContext = vm.createContext({});
  vm.runInContext(passiveTestConfigSource, passiveTestConfigContext, {
    filename: 'passive-test-config.js'
  });
  for (const sceneCount of [3, 6, 9, 12]) {
    const prompt = vm.runInContext(
      `PassiveTestConfig.buildPrompt(${sceneCount}, () => 0.42)`,
      passiveTestConfigContext);
    assert.equal((prompt.match(/## 場面\d+/g) || []).length, sceneCount);
    assert.match(prompt, new RegExp(`以下の${sceneCount}枚の場面カード`));
    assert.match(prompt, /一度の返答/);
    assert.doesNotMatch(prompt, /\d+分/);
  }
  const twelveSceneCards = JSON.parse(vm.runInContext(
    `JSON.stringify(PassiveTestConfig.buildSceneCards(12, () => 0.25))`,
    passiveTestConfigContext));
  assert.equal(new Set(twelveSceneCards.map((card) => card.location)).size, 12);
  assert.equal(new Set(twelveSceneCards.map((card) => card.ambience)).size, 12);
  assert.equal(new Set(twelveSceneCards.map((card) => card.reassurance)).size, 12);
  assert.ok(twelveSceneCards.every((card) => card.sensoryDetails.length === 5));
  assert.ok(twelveSceneCards.every((card) => card.actions.length === 3));
  assert.ok(twelveSceneCards.every((card) => typeof card.transition === 'string'));
  assert.notEqual(
    vm.runInContext(`PassiveTestConfig.buildPrompt(6, () => 0.1)`, passiveTestConfigContext),
    vm.runInContext(`PassiveTestConfig.buildPrompt(6, () => 0.8)`, passiveTestConfigContext));
  assert.equal(
    vm.runInContext(
      `PassiveTestConfig.reasonCode('early-silence; motion-stop: storage unavailable')`,
      passiveTestConfigContext),
    'early-silence');
  const storage = {
    texturePresetId: 'custom',
    textureDensity: 0.12,
    textureBody: 0.31,
    textureNearEar: 0.44,
    vibrationEnabled: true,
    vibrationIntensity: 0.63,
    deEsserEnabled: true,
    deEsserIntensity: 0.27,
    earlyReflectionsEnabled: true,
    earlyReflectionsIntensity: 0.22,
    textureSettingsRevision: 3,
    ambienceMode: 'quiet-room',
    ambienceLevelDb: -24,
    ambienceSettingsRevision: 2,
    hrtfOutputGain: 7,
    hrtfAzimuth: 110,
    hrtfDistanceMeters: 0.1,
    hrtfDatasetId: 'aalto-nearfield',
    hrtfSettingsRevision: 6
  };
  let messageListener = null;
  const context = vm.createContext({
    AudioContext: FakeAudioContext,
    clearInterval,
    clearTimeout,
    console,
    performance,
    setInterval,
    setTimeout,
    chrome: {
      runtime: {
        onMessage: {
          addListener(listener) {
            messageListener = listener;
          }
        }
      },
      storage: {
        local: {
          async get(keys) {
            await new Promise((resolve) => setTimeout(resolve, 12));
            return Object.fromEntries(keys.map((key) => [key, storage[key]]));
          },
          async set(values) {
            await new Promise((resolve) => setTimeout(resolve, 4));
            Object.assign(storage, values);
          }
        }
      }
    }
  });
  vm.runInContext(source, context, { filename: 'offscreen.js' });
  assert.equal(typeof messageListener, 'function');

  const send = (type, extra = {}) => new Promise((resolve) => {
    messageListener({ target: 'offscreen', type, ...extra }, {}, resolve);
  });

  // Concurrent startup reads used to return defaults from whichever call saw
  // the old boolean "loaded" flag first. Both callers must now await one load.
  const [firstState, secondState] = await Promise.all([send('get-state'), send('get-state')]);
  for (const response of [firstState, secondState]) {
    assert.equal(response.ok, true);
    assert.equal(response.state.texture.components.body, 0.31);
    assert.equal(response.state.vibration.intensity, 0.63);
    assert.equal(response.state.hrtf.outputGain, 7);
    assert.equal(response.state.ambience.mode, 'off');
    assert.equal(response.state.ambience.levelDb, -34);
  }
  assert.equal(storage.ambienceSettingsRevision, 3);
  assert.equal(storage.ambienceMode, 'off');
  assert.equal(storage.ambienceLevelDb, -34);

  const leftPullbackNear = vm.runInContext(
    `periodicHrtfMotionPosition('left-pullback', 0, 0.1, 24, 3)`, context);
  const leftPullbackFar = vm.runInContext(
    `periodicHrtfMotionPosition('left-pullback', 20.4 / 24, 0.1, 24, 3)`, context);
  const leftPullbackReturn = vm.runInContext(
    `periodicHrtfMotionPosition('left-pullback', 22.5 / 24, 0.1, 24, 3)`, context);
  const rightPullbackFar = vm.runInContext(
    `periodicHrtfMotionPosition('right-pullback', 20.4 / 24, 0.1, 24, 3)`, context);
  assert.equal(leftPullbackNear.azimuth, -110);
  assert.equal(leftPullbackNear.distanceMeters, 0.1);
  assert.equal(leftPullbackFar.azimuth, -110);
  assert.ok(leftPullbackFar.distanceMeters >= 0.319);
  assert.ok(leftPullbackReturn.distanceMeters > 0.1);
  assert.ok(leftPullbackReturn.distanceMeters < leftPullbackFar.distanceMeters);
  assert.equal(rightPullbackFar.azimuth, 110);
  assert.ok(rightPullbackFar.distanceMeters >= 0.319);

  vm.runInContext(`
    hrtfDataset = { marker: 'known-good-dataset' };
    hrtfDatasetId = 'aalto-nearfield';
    hrtfMatchedIndex = 7;
    hrtfMatchedPosition = { leftIndex: 7, rightIndex: 8 };
    hrtfFilterLength = 512;
    globalThis.fetch = async () => { throw new Error('unexpected external fetch'); };
  `, context);
  const unsupportedDatasetSwitch = await send('set-hrtf-dataset', { value: 'removed-dataset' });
  assert.equal(unsupportedDatasetSwitch.ok, true);
  assert.equal(vm.runInContext('hrtfDatasetId', context), 'aalto-nearfield');
  assert.equal(vm.runInContext('hrtfDataset.marker', context), 'known-good-dataset');
  assert.equal(vm.runInContext('hrtfMatchedIndex', context), 7);
  assert.equal(storage.hrtfDatasetId, 'aalto-nearfield');

  vm.runInContext(`
    audioContext = new AudioContext();
    ambienceHighpass = audioContext.createBiquadFilter();
    ambienceLowpass = audioContext.createBiquadFilter();
    ambienceGain = audioContext.createGain();
  `, context);

  const expectedRms = {
    'quiet-room': 0.14,
    'air-conditioner': 0.17,
    'night-room': 0.15,
    'distant-rain': 0.2
  };
  for (const [mode, target] of Object.entries(expectedRms)) {
    const buffer = vm.runInContext(`createAmbienceBuffer('${mode}')`, context);
    for (let channel = 0; channel < 2; channel += 1) {
      assert.ok(Math.abs(rms(buffer.getChannelData(channel)) - target) < 0.03, mode);
    }
  }

  await send('set-texture-component', { component: 'body', value: 0.81 });
  await send('set-ambience-level', { value: -18 });
  const modeResponse = await send('set-ambience-mode', { value: 'air-conditioner' });
  assert.equal(modeResponse.state.texture.components.body, 0.81);
  assert.equal(modeResponse.state.vibration.intensity, 0.63);
  assert.equal(modeResponse.state.hrtf.outputGain, 7);
  assert.equal(modeResponse.state.ambience.mode, 'air-conditioner');
  assert.equal(modeResponse.state.ambience.levelDb, -18);

  assert.equal(
    (await send('set-ambience-mode', { value: 'quiet-room' })).state.ambience.mode,
    'quiet-room');
  assert.equal(
    (await send('set-ambience-mode', { value: 'distant-rain' })).state.ambience.mode,
    'distant-rain');
  assert.equal(storage.ambienceMode, 'distant-rain');

  // Reproduce the actual v0.7.2 failure: chrome.storage is unavailable in the
  // calling context. Switching must still work in memory instead of throwing.
  vm.runInContext('globalThis.savedStorageForTest = chrome.storage; chrome.storage = undefined', context);
  const noStorageResponse = await send('set-ambience-settings', {
    mode: 'night-room',
    levelDb: -17
  });
  assert.equal(noStorageResponse.ok, true);
  assert.equal(noStorageResponse.state.ambience.mode, 'night-room');
  assert.equal(noStorageResponse.state.ambience.levelDb, -17);
  vm.runInContext('chrome.storage = savedStorageForTest', context);
  await send('set-ambience-settings', { mode: 'distant-rain', levelDb: -18 });

  const fakeContext = vm.runInContext('audioContext', context);
  const latestSource = fakeContext.sources.at(-1);
  assert.equal(latestSource.started, true);
  assert.equal(latestSource.loop, true);
  assert.equal(latestSource.connections.length, 1);

  assert.equal((await send('set-ambience-level', { value: -100 })).state.ambience.levelDb, -48);
  assert.equal((await send('set-ambience-level', { value: 0 })).state.ambience.levelDb, -12);
  const preview = await send('preview-ambience');
  assert.equal(preview.ok, true);
  assert.equal(preview.state.ambience.previewing, true);
  assert.ok(Math.abs(vm.runInContext('ambienceGain.gain.value', context) - 10 ** (-12 / 20)) < 0.000001);
  vm.runInContext('cancelAmbiencePreview()', context);

  vm.runInContext(`
    globalThis.passiveTestAmplitude = 0;
    inputAnalyser = {
      fftSize: 16,
      getFloatTimeDomainData(samples) { samples.fill(globalThis.passiveTestAmplitude); }
    };
  `, context);

  vm.runInContext(`beginPassiveTestMonitoring({
    durationSeconds: 1800,
    startTimeoutSeconds: 30,
    silenceLimitSeconds: 12,
    sampleIntervalMs: 250,
    ownsMotion: false,
    completionMode: 'response-end',
    sceneCount: 9
  })`, context);
  assert.equal(vm.runInContext('publicPassiveTestState().durationSeconds', context), 1800);
  assert.equal(vm.runInContext('publicPassiveTestState().completionMode', context), 'response-end');
  assert.equal(vm.runInContext('publicPassiveTestState().sceneCount', context), 9);
  await vm.runInContext('stopPassiveTest()', context);

  vm.runInContext(`beginPassiveTestMonitoring({
    durationSeconds: 0.5,
    startTimeoutSeconds: 0.12,
    silenceLimitSeconds: 0.12,
    sampleIntervalMs: 25,
    ownsMotion: false
  })`, context);
  await new Promise((resolve) => setTimeout(resolve, 240));
  assert.equal(vm.runInContext('publicPassiveTestState().status', context), 'failed');
  assert.equal(vm.runInContext('publicPassiveTestState().reason', context), 'no-speech');

  vm.runInContext(`
    passiveTestAmplitude = 0.1;
    globalThis.savedStorageForPassiveTest = chrome.storage;
    chrome.storage = undefined;
    hrtfMotion.active = true;
  `, context);
  vm.runInContext(`beginPassiveTestMonitoring({
    durationSeconds: 0.8,
    startTimeoutSeconds: 0.2,
    silenceLimitSeconds: 0.12,
    sampleIntervalMs: 25,
    ownsMotion: true,
    completionMode: 'response-end',
    sceneCount: 6
  })`, context);
  await new Promise((resolve) => setTimeout(resolve, 90));
  assert.equal(vm.runInContext('publicPassiveTestState().detectedSpeech', context), true);
  vm.runInContext('passiveTestAmplitude = 0', context);
  await new Promise((resolve) => setTimeout(resolve, 220));
  assert.equal(vm.runInContext('publicPassiveTestState().status', context), 'completed');
  assert.equal(vm.runInContext('publicPassiveTestState().reason', context), 'response-ended');
  assert.ok(vm.runInContext(
    'publicPassiveTestState().estimatedResponseSeconds > 0', context));
  assert.ok(vm.runInContext(
    'publicPassiveTestState().estimatedResponseSeconds < publicPassiveTestState().elapsedSeconds',
    context));
  assert.equal(vm.runInContext('hrtfMotion.active', context), false);
  vm.runInContext('chrome.storage = savedStorageForPassiveTest', context);

  vm.runInContext('passiveTestAmplitude = 0.1', context);
  vm.runInContext(`beginPassiveTestMonitoring({
    durationSeconds: 0.25,
    startTimeoutSeconds: 0.12,
    silenceLimitSeconds: 0.12,
    sampleIntervalMs: 25,
    ownsMotion: false,
    completionMode: 'response-end',
    sceneCount: 3
  })`, context);
  await new Promise((resolve) => setTimeout(resolve, 380));
  assert.equal(vm.runInContext('publicPassiveTestState().status', context), 'completed');
  assert.equal(vm.runInContext('publicPassiveTestState().reason', context), 'observation-limit');

  vm.runInContext(`beginPassiveTestMonitoring({
    durationSeconds: 0.5,
    startTimeoutSeconds: 0.2,
    silenceLimitSeconds: 0.12,
    sampleIntervalMs: 25,
    ownsMotion: true
  })`, context);
  await new Promise((resolve) => setTimeout(resolve, 90));
  assert.equal(vm.runInContext('publicPassiveTestState().status', context), 'failed');
  assert.equal(vm.runInContext('publicPassiveTestState().reason', context), 'motion-stopped');

  context.navigator = {
    mediaDevices: {
      async getUserMedia() { throw new Error('tab capture denied'); }
    }
  };
  const failedCaptureStart = await send('start-capture', { streamId: 'bad-stream', tabId: 99 });
  assert.equal(failedCaptureStart.ok, false);
  assert.match(failedCaptureStart.error, /tab capture denied/);
  assert.equal(vm.runInContext('stream', context), null);
  assert.equal(vm.runInContext('audioContext', context), null);

  console.log('v0.15.0 ambience, rollback and passive-state test passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
