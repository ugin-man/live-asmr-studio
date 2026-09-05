const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname, '../extension/sidepanel.js'), 'utf8');
const writes = [];
const messages = [];
const timers = new Map();
let nextTimer = 0;
const element = (value = '') => ({value, classList: {toggle() {}}, disabled: false});
const context = vm.createContext({
  MOTION_PATTERNS: {'behind-sweep': {name: 'Behind'}, 'left-pullback': {name: 'Left'}},
  MOTION_UI_STORAGE: {pattern: 'hrtfMotionPattern', durationSeconds: 'hrtfMotionDurationSeconds',
    rearTransitionSeconds: 'hrtfRearTransitionSeconds', settingsRevision: 'hrtfMotionUiRevision'},
  busyHrtf: false, pendingMotionSettings: null, motionSettingsTimer: null,
  motionSettingsQueue: Promise.resolve(),
  motionPattern: element('behind-sweep'), quickMotionPattern: element('behind-sweep'),
  motionDuration: element('24'), rearTransitionDuration: element('3'),
  motionStatus: element(), rearTransitionControl: element(), motionStartButton: element(),
  motionStopButton: element(), quickMotionToggle: element(), spatialMap: element(),
  selectedMotionPattern: () => context.motionPattern.value,
  usesTransitionTiming: () => true,
  renderMotionTiming() {}, renderMotionDescription() {}, updateMotionUiPolling() {},
  writeLocalSettings: async (settings) => { writes.push({...settings}); },
  sendToAudioEngine: async (type, settings) => {
    messages.push({type, ...settings});
    return {capturing: true, hrtf: {motion: {active: true, ...settings}}};
  },
  showError: (message) => { throw new Error(message); },
  renderState: (state) => { context.latestState = state; context.renderMotionState(state.hrtf, state.capturing); },
  setTimeout: (callback) => { timers.set(++nextTimer, callback); return nextTimer; },
  clearTimeout: (id) => timers.delete(id)
});
function loadFunction(start, end) {
  vm.runInContext(source.slice(source.indexOf(start), source.indexOf(end)), context);
}
loadFunction('function renderMotionState(', 'async function initializeMotionControls(');
loadFunction('function scheduleMotionSettingsUpdate(', "motionPattern.addEventListener('change'");
async function flush() {
  for (const [id, callback] of [...timers]) { timers.delete(id); callback(); }
  await context.motionSettingsQueue;
}
async function main() {
  const playing = {capturing: true, hrtf: {motion: {active: true,
    pattern: 'behind-sweep', durationSeconds: 24, rearTransitionSeconds: 3}}};
  context.renderState(playing);
  for (const key of ['motionPattern', 'quickMotionPattern', 'motionDuration', 'rearTransitionDuration']) {
    assert.equal(context[key].disabled, false, `${key} must remain editable during playback`);
  }
  context.motionPattern.value = 'left-pullback';
  context.motionDuration.value = '40';
  context.rearTransitionDuration.value = '2';
  context.scheduleMotionSettingsUpdate();
  context.renderState(playing); // Polling must not overwrite uncommitted user input.
  assert.equal(context.motionPattern.value, 'left-pullback');
  assert.equal(context.quickMotionPattern.value, 'left-pullback');
  assert.equal(context.motionDuration.value, '40');
  context.motionDuration.value = '36';
  context.scheduleMotionSettingsUpdate();
  await flush();
  assert.equal(writes.length, 1);
  assert.equal(writes[0].hrtfMotionDurationSeconds, 36);
  assert.equal(messages[0].type, 'update-hrtf-motion');
  assert.equal(messages[0].pattern, 'left-pullback');
  assert.equal(context.pendingMotionSettings, null);

  context.motionDuration.value = '32';
  context.scheduleMotionSettingsUpdate();
  context.renderState({capturing: true, hrtf: {motion: {active: false, pattern: 'behind-sweep'}}});
  await flush();
  assert.equal(messages.length, 1, 'A stopped motion must not be restarted by a late input event');
  assert.equal(writes[1].hrtfMotionDurationSeconds, 32);
  assert.equal(context.motionPattern.value, 'left-pullback', 'Stopped engine defaults must not erase selection');
  context.busyHrtf = true;
  context.renderMotionState(playing.hrtf, true);
  assert.equal(context.motionDuration.disabled, true);
  console.log('Live motion controls, input coalescing and polling protection tests passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
