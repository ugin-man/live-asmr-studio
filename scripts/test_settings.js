const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..', 'extension');
const source = fs.readFileSync(path.join(root, 'sidepanel.js'), 'utf8');
const writes = [];
let consent = false;
let prompts = 0;
const context = vm.createContext({
  highGainWarningAccepted: false,
  PRODUCT_PREFERENCE_STORAGE: {highGainWarningAccepted: 'highGainWarningAcceptedV1'},
  requestHighGainPermission: async () => { prompts++; return consent; },
  writeLocalSettings: async (values) => writes.push(JSON.parse(JSON.stringify(values)))
});
vm.runInContext(fs.readFileSync(path.join(root, 'settings.js'), 'utf8'), context);
// Execute the production import path without browser-only DOM startup.
vm.runInContext(source.slice(source.indexOf('async function importProductSettings('),
  source.indexOf('async function resetProductSettings(')), context);
const {ProductSettings} = context;
const plain = (value) => JSON.parse(JSON.stringify(value));
const sample = {
  hrtfOutputGain: 3, hrtfAzimuth: -110, hrtfDistanceMeters: 0.1,
  hrtfMotionEnabled: false, hrtfMotionPattern: 'right-pullback',
  hrtfMotionDurationSeconds: 40, hrtfRearTransitionSeconds: 2,
  ambienceMode: 'off', ambienceLevelDb: -34,
  texturePresetId: 'custom', textureBody: 0.7, textureNearEar: 0.7,
  voicePromptDraftsByLocaleV1: Object.fromEntries(['en', 'ja', 'zh-CN', 'ko', 'es']
    .map((locale) => [locale, {custom: `User text ${locale}\nKeep this exactly: 言葉を分断しない。`}]))
};
assert.deepEqual(plain(ProductSettings.validate(sample)), sample);
assert.deepEqual(plain(ProductSettings.pick({hrtfOutputGain: 3, highGainWarningAcceptedV1: true,
  voicePromptUnknown: 'excluded', unrelated: 'excluded'})), {hrtfOutputGain: 3});
for (const value of [null, [], 'wrong']) assert.throws(() => ProductSettings.validate(value));
for (const invalid of [
  {hrtfOutputGain: '15'}, {hrtfOutputGain: NaN}, {hrtfOutputGain: Infinity},
  {hrtfOutputGain: 16}, {hrtfOutputGain: 0}, {hrtfDistanceMeters: -1},
  {hrtfMotionDurationSeconds: 0}, {hrtfRearTransitionSeconds: 100},
  {hrtfMotionEnabled: 'false'}, {ambienceMode: 'missing'},
  {voicePromptDrafts: {'deep-whisper': {prompt: 'not a string'}}},
  {voicePromptDraftsByLocaleV1: {ja: []}}, {sessionPromptSourceContent: {}},
  {textureSettingsRevision: 3.5}
]) assert.throws(() => ProductSettings.validate(invalid));

function file(settings, options = {}) {
  return {size: 100, text: async () => JSON.stringify({schemaVersion: 1,
    product: 'Live ASMR Studio', settings, ...options})};
}
async function main() {
  assert.equal(await context.importProductSettings(file(sample)), true);
  assert.deepEqual(writes.at(-1), sample);
  assert.equal(prompts, 0);
  assert.equal(await context.importProductSettings(file({hrtfOutputGain: 10,
    highGainWarningAcceptedV1: true})), false);
  assert.equal(writes.length, 1, 'Cancellation must not apply even part of the imported settings');
  assert.equal(prompts, 1);
  consent = true;
  assert.equal(await context.importProductSettings(file({hrtfOutputGain: 15})), true);
  assert.deepEqual(writes.at(-1), {hrtfOutputGain: 15, highGainWarningAcceptedV1: true});
  assert.equal(prompts, 2);
  await context.importProductSettings(file({hrtfOutputGain: 12}));
  assert.equal(prompts, 2, 'Ask only once after acceptance');
  await context.importProductSettings(file({ambienceMode: 'off'}, {product: 'GPT Live ASMR'}));
  for (const invalidFile of [file({hrtfOutputGain: 'bad'}), file({}, {schemaVersion: 2}),
    file(sample, {product: 'unknown'}), file({unknown: 123}), {size: 1024 * 1024 + 1}]) {
    const before = writes.length;
    await assert.rejects(() => context.importProductSettings(invalidFile));
    assert.equal(writes.length, before);
  }
  assert.equal(await context.importProductSettings(null), false);
  console.log('Settings schema, five-locale backup round-trip and import gain-consent tests passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
