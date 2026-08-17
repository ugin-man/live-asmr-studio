const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const extensionRoot = path.resolve(__dirname, '..', 'extension');
const context = vm.createContext({
  UiI18n: {
    locale: 'ja',
    normalizeLocale: (value) => value || 'ja',
    text: (value) => String(value ?? '')
  }
});
vm.runInContext(
  fs.readFileSync(path.join(extensionRoot, 'session-prompt-config.js'), 'utf8'),
  context,
  { filename: 'session-prompt-config.js' });

const config = context.SessionPromptConfig;
const modeOptions = Array.from(config.modeOptions());
assert.deepEqual(
  modeOptions.map((mode) => mode.id),
  ['conversation', 'relax', 'focus', 'roleplay', 'onomatopoeia', 'brought-content']);

for (const mode of modeOptions) {
  assert.equal(config.templateOptions(mode.id).length, 1, `${mode.id}/representative template`);
}
assert.deepEqual(
  modeOptions.map((mode) => config.templateOptions(mode.id)[0].id),
  ['bedtime-chat', 'co-sleep', 'quiet-coworking', 'co-sleep-partner',
    'ear-sound-journey', 'faithful-reading']);
assert.equal(config.modeDefaults('relax').template, 'co-sleep');
assert.equal(config.modeDefaults('roleplay').template, 'co-sleep-partner');
assert.equal(config.modePolicy('conversation', 'medium').showLength, false);
assert.equal(config.modePolicy('brought-content', 'medium').showLength, false);
assert.equal(config.modePolicy('relax', 'medium').showLength, true);
assert.equal(config.modePolicy('onomatopoeia', 'medium').showLength, true);
assert.equal(config.interactions, undefined);

const conversationPrompt = config.buildPrompt({
  mode: 'conversation', template: 'bedtime-chat', length: 'long'
});
assert.match(conversationPrompt, /# 会話ASMRの継続方針/);
assert.match(conversationPrompt, /ユーザーの最新の発言、意図、話題を最優先/);
assert.doesNotMatch(conversationPrompt, /内容量:|固定会話場面|会話方針[0-9]/);
assert.doesNotMatch(conversationPrompt, /受動|ハイブリッド/);

const markerByMode = {
  relax: '## 固定休息場面',
  focus: '## 固定作業場面',
  roleplay: '## 固定物語場面',
  onomatopoeia: '## 固定音場面'
};
const countByLength = { short: 3, medium: 6, long: 12 };
const templateByMode = {
  relax: 'co-sleep',
  focus: 'quiet-coworking',
  roleplay: 'co-sleep-partner',
  onomatopoeia: 'ear-sound-journey'
};

for (const [modeId, marker] of Object.entries(markerByMode)) {
  for (const [length, expectedCount] of Object.entries(countByLength)) {
    const options = {
      mode: modeId,
      template: templateByMode[modeId],
      length,
      customInstructions: '追加内容',
      avoid: '避けたい内容'
    };
    const promptA = config.buildPrompt(options, () => 0.01);
    const promptB = config.buildPrompt(options, () => 0.99);
    assert.equal(promptA, promptB, `${modeId}/${length}/deterministic`);
    assert.equal((promptA.match(new RegExp(marker, 'g')) || []).length, expectedCount);
    assert.match(promptA, new RegExp(`内容モード: ${
      modeOptions.find((mode) => mode.id === modeId).label}`));
    assert.match(promptA, /AIが自由に決めてよい部分/);
    assert.match(promptA, /してはいけないこと/);
    assert.match(promptA, /追加内容/);
    assert.match(promptA, /避けたい内容/);
    assert.doesNotMatch(promptA, /ランダム|再抽選|必ず一度使う感覚/);
  }
}

const relaxShort = config.buildPrompt({ mode: 'relax', template: 'co-sleep', length: 'short' });
assert.match(relaxShort, /隣にいる静かな始まり/);
assert.match(relaxShort, /力を抜く速さを任せる/);
assert.match(relaxShort, /質問せず静かに終える/);
assert.doesNotMatch(relaxShort, /温かいカップ|手元の明かりを一段/);

const roleplayPrompt = config.buildPrompt({
  mode: 'roleplay',
  template: 'co-sleep-partner',
  length: 'long',
  customInstructions: '語り手の名前は小陽。兄妹のような自然な距離感。',
  avoid: '過度に誘惑的な表現',
  voiceStyleName: '試験用の静かな声',
  voiceStylePrompt: '# Voice Affect\n試験用に近い静かな声で話す。'
});
assert.match(roleplayPrompt, /添い寝パートナー/);
assert.match(roleplayPrompt, /語り手の名前は小陽/);
assert.match(roleplayPrompt, /過度に誘惑的な表現/);
assert.match(roleplayPrompt, /発話スタイル: 試験用の静かな声/);
assert.match(roleplayPrompt, /試験用に近い静かな声で話す/);
assert.equal((roleplayPrompt.match(/## 固定物語場面/g) || []).length, 12);

const onomatopoeiaPrompt = config.buildPrompt({
  mode: 'onomatopoeia', template: 'ear-sound-journey', length: 'long'
});
assert.match(onomatopoeiaPrompt, /# オノマトペ設定/);
assert.match(onomatopoeiaPrompt, /話す内容の中心を、声に出したオノマトペそのものにする/);
assert.match(onomatopoeiaPrompt, /単語や音節を不自然に切り離さない/);
assert.match(onomatopoeiaPrompt, /ふう.*すう.*ほわほわ/);
assert.equal((onomatopoeiaPrompt.match(/## 固定音場面/g) || []).length, 12);
assert.doesNotMatch(onomatopoeiaPrompt, /ランダム|再抽選/);

const sourceText = 'これは持ち込んだ文章です。\n二行目もそのまま残します。';
const broughtPrompt = config.buildPrompt({
  mode: 'brought-content',
  template: 'faithful-reading',
  length: 'long',
  sourceContent: sourceText
});
assert.match(broughtPrompt, new RegExp(sourceText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(broughtPrompt, /固定の場面数や目標時間へ合わせて水増ししない/);
assert.doesNotMatch(broughtPrompt, /内容量:|処理単位[0-9]|【ここに読み上げ/);

const html = fs.readFileSync(path.join(extensionRoot, 'sidepanel.html'), 'utf8');
const sidepanelJs = fs.readFileSync(path.join(extensionRoot, 'sidepanel.js'), 'utf8');
const offscreenJs = fs.readFileSync(path.join(extensionRoot, 'offscreen.js'), 'utf8');
const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const referencedIds = [...sidepanelJs.matchAll(/getElementById\('([^']+)'\)/g)]
  .map((match) => match[1]);
const missingIds = referencedIds.filter((id) => !htmlIds.has(id));
assert.deepEqual(missingIds, []);
assert.match(html, /<script src="session-prompt-config\.js"><\/script>/);
assert.match(html, /<script src="ui-locales\.generated\.js"><\/script>/);
assert.match(html, /<script src="i18n\.js"><\/script>/);
assert.match(html, /id="language-selector"/);
assert.match(html, /class="card session-card product-primary-section"/);
assert.match(html, /id="session-copy-primary"/);
assert.ok(html.indexOf('id="session-copy-primary"') < html.indexOf('id="session-mode"'));
assert.match(html, />プロンプトをコピー<\/span>/);
assert.doesNotMatch(html, /今やること|開始までの手順|id="session-start-flow"|id="session-copy"/);
assert.ok(html.indexOf('class="card session-card product-primary-section"')
  < html.indexOf('class="card product-status-card"'));
assert.doesNotMatch(html, /id="first-run-onboarding"/);
assert.doesNotMatch(html, /id="session-interaction"|id="session-regenerate"/);
assert.match(html, /id="session-behavior-name"/);
assert.match(html, /id="session-length-field"/);
assert.match(html, /id="session-outline-summary"/);
assert.match(html, /内容量/);
assert.match(html, /コンパクト/);
assert.match(html, /じっくり/);
assert.match(html, /class="card quick-sound-card"/);
assert.match(html, /<option value="onomatopoeia">オノマトペ<\/option>/);
assert.match(html, /<option value="left-pullback">左耳：離れて戻る<\/option>/);
assert.match(html, /<option value="right-pullback">右耳：離れて戻る<\/option>/);
assert.ok(html.indexOf('id="motion-duration"') > html.indexOf('class="card quick-sound-card"'));
assert.ok(html.indexOf('id="motion-duration"') < html.indexOf('id="advanced-settings-toggle"'));
assert.match(html, /id="product-stop"/);
assert.match(html, /id="product-capture-target"/);
assert.match(html, /id="high-gain-dialog"/);
assert.match(html, /10倍以上の音量を使いますか/);
assert.match(html, /中心 超近接・推定/);
assert.match(html, /data-azimuth="-110">左後方/);
assert.match(html, /aria-controls="advanced-output-section/);
assert.match(html, /id="product-prompt-readiness"/);
assert.match(html, /id="product-audio-readiness"/);
assert.match(sidepanelJs, /highGainWarningAcceptedV1/);
assert.doesNotMatch(sidepanelJs, /productOnboardingDismissedV1/);
assert.doesNotMatch(sidepanelJs, /sessionPromptSeed|createSeededSessionRandom|sessionInteraction/);
assert.match(sidepanelJs, /SessionPromptConfig\.modePolicy/);
assert.match(sidepanelJs, /SessionPromptConfig\.outlineSummary/);
assert.match(sidepanelJs, /sessionCopyPrimaryButton\.addEventListener\('click', copyCurrentSessionPrompt\)/);
assert.doesNotMatch(sidepanelJs, /sessionCopyButton|renderSessionStartFlow|renderSessionCopyState|sessionStartSteps/);
assert.match(sidepanelJs, /get-product-state/);
assert.match(sidepanelJs, /type: 'stop-capture'/);
assert.ok(html.indexOf('id="spatial-map"') > html.indexOf('class="card quick-sound-card"'));
assert.ok(html.indexOf('id="spatial-map"') < html.indexOf('id="advanced-settings-toggle"'));
assert.match(html, /class="card [^"]*advanced-product-section[^"]*" hidden/);
assert.match(html, /class="card [^"]*developer-lab-section[^"]*" hidden/);
assert.match(offscreenJs, /let processingMode = 'hrtf';/);
assert.match(offscreenJs, /await audioContext\.resume\(\);\s+await setMode\('hrtf'\);/);
assert.match(offscreenJs, /await startHrtfMotion\(\s*'behind-sweep'/);
assert.match(offscreenJs, /let currentAzimuth = -ASMR_SIDE_AZIMUTH_DEGREES/);
assert.match(offscreenJs, /const DEFAULT_SOURCE_DISTANCE_METERS = 0\.1/);
assert.match(offscreenJs, /function nearFarReturnMotionPosition\(/);
assert.match(offscreenJs, /'left-pullback', 'right-pullback'/);

const manifest = JSON.parse(fs.readFileSync(path.join(extensionRoot, 'manifest.json'), 'utf8'));
assert.equal(manifest.version, '0.15.0');
assert.equal(manifest.name, 'Live ASMR Studio');
assert.equal(manifest.icons['128'], 'assets/icons/icon128.png');
assert.equal(manifest.host_permissions, undefined);
assert.doesNotMatch(offscreenJs, /raw\.githubusercontent\.com|ircam-farfield/);
assert.match(html, /class="card developer-toggle-card" hidden/);

console.log('v0.15.0 onomatopoeia, quick timing and pullback motion test passed');
