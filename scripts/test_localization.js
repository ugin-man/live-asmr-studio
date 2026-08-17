const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const extensionRoot = path.resolve(__dirname, '..', 'extension');

class MockElement {
  constructor() {
    this.classList = { remove() {} };
  }
  closest() { return null; }
  querySelectorAll() { return []; }
  hasAttribute() { return false; }
  setAttribute() {}
}

class MockMutationObserver {
  disconnect() {}
  observe() {}
}

async function main() {
  const sidepanelSource = fs.readFileSync(path.join(extensionRoot, 'sidepanel.js'), 'utf8');
  const voicePresetSource = sidepanelSource.slice(
    sidepanelSource.indexOf('const VOICE_PROMPT_PRESETS'),
    sidepanelSource.indexOf('const MOTION_UI_STORAGE')
  );
  const voicePrompts = Array.from(
    voicePresetSource.matchAll(/prompt: `([\s\S]*?)`/gu),
    (match) => match[1]
  );
  assert.equal(voicePrompts.length, 5, 'voice prompt preset count');
  for (const prompt of voicePrompts) {
    assert.match(prompt, /# Pacing/u);
    assert.match(prompt, /# Pauses/u);
    assert.doesNotMatch(
      prompt,
      /普段の[0-9一二三四五六七八九]割|一文を短|単語同士を急いでつなげず/u
    );
  }
  const deepWhisperBlock = sidepanelSource.slice(
    sidepanelSource.indexOf("  'deep-whisper': {"),
    sidepanelSource.indexOf("  'sleep-relaxation': {")
  );
  const deepWhisperPrompt = deepWhisperBlock.match(/prompt: `([\s\S]*?)`/u)?.[1];
  assert.ok(deepWhisperPrompt, 'deep-whisper prompt source');
  assert.match(deepWhisperPrompt, /# Pacing\n速度より息遣いと余白を優先する。/u);
  assert.doesNotMatch(deepWhisperPrompt, /普段の6割程度|一文を短く|単語同士を急いでつなげず/u);

  const migrationSource = sidepanelSource.slice(
    sidepanelSource.indexOf('const VOICE_PACING_HEADING_PATTERN'),
    sidepanelSource.indexOf('function currentLocale()')
  );
  const migrationContext = vm.createContext({});
  vm.runInContext(
    `${migrationSource}\nglobalThis.restoreForTest = restoreDefaultVoiceTimingSections;`
      + '\nglobalThis.replaceForTest = replaceWithDefaultVoiceTimingSections;',
    migrationContext
  );
  const defaultTimingPrompt = [
    'intro', '# Tone\nquiet', '# Pacing\nrevised pacing', '# Emotion\ncalm',
    '# Pronunciation\nsmooth', '# Pauses\nnatural pauses', '# Continuity\nkeep'
  ].join('\n\n');
  const strippedTimingPrompt = [
    'intro', '# Tone\nquiet', '# Emotion\ncalm', '# Pronunciation\nsmooth', '# Continuity\nkeep'
  ].join('\n\n');
  const restoredTimingPrompt = migrationContext.restoreForTest(
    strippedTimingPrompt, defaultTimingPrompt, ['pacing', 'pauses']
  );
  assert.match(restoredTimingPrompt, /# Pacing\nrevised pacing/);
  assert.match(restoredTimingPrompt, /# Pauses\nnatural pauses/);
  const replacedPacingPrompt = migrationContext.replaceForTest(
    `${strippedTimingPrompt}\n\n# Pacing\nold pacing`, defaultTimingPrompt, ['pacing']
  );
  assert.match(replacedPacingPrompt, /# Pacing\nrevised pacing/);
  assert.doesNotMatch(replacedPacingPrompt, /old pacing/);

  const context = vm.createContext({
    console,
    Element: MockElement,
    Node: { TEXT_NODE: 3, ELEMENT_NODE: 1 },
    NodeFilter: { SHOW_TEXT: 4 },
    MutationObserver: MockMutationObserver,
    location: { reload() {} },
    chrome: { storage: { local: { get: async () => ({}), set: async () => {} } } },
    document: {
      documentElement: { lang: '' },
      body: new MockElement(),
      getElementById: () => null,
      createTreeWalker: () => ({ nextNode: () => null })
    }
  });

  for (const file of [
    'ui-locales.generated.js', 'i18n.js', 'session-prompt-config.js', 'passive-test-config.js'
  ]) {
    vm.runInContext(fs.readFileSync(path.join(extensionRoot, file), 'utf8'), context, {
      filename: file
    });
  }
  await context.UiI18n.ready;

  assert.equal(context.UiI18n.DEFAULT_LOCALE, 'en');
  assert.deepEqual(
    Array.from(context.UiI18n.LANGUAGE_OPTIONS, (option) => option.id),
    ['en', 'ja', 'zh-CN', 'ko', 'es']
  );
  for (const locale of ['en', 'ja', 'zh-CN', 'ko', 'es']) {
    assert.ok(Object.keys(context.UiLocaleMessages[locale]).length >= 850, locale);
    for (const voicePrompt of voicePrompts) {
      const localizedVoicePrompt = context.UiI18n.text(voicePrompt, locale);
      assert.match(
        localizedVoicePrompt,
        /#\s*(?:Pacing|节奏|速度|속도|리듬|ritmo)/iu,
        `${locale}/voice pacing section retained`
      );
      assert.doesNotMatch(
        localizedVoicePrompt,
        /普段の[0-9一二三四五六七八九]割|一文を短|単語同士を急いでつなげず|about (?:60|70|80)% of normal|keep (?:the )?sentences? short|do not connect words|约为正常值的(?:60|70|80)%|保持句子简短|단어끼리 서둘러 연결하지 않고|한 문장을 짧게|Alrededor del (?:60|70|80)% de lo normal|oraciones cortas/iu,
        `${locale}/segmentation directive removed`
      );
    }
  }
  assert.equal(
    context.UiI18n.text('添い寝・安心', 'en'),
    'Bedside comfort'
  );
  assert.equal(context.UiI18n.text('添い寝・安心', 'ja'), '添い寝・安心');

  const kana = /[ぁ-んァ-ヶ々]/;
  const modes = [
    'conversation', 'relax', 'focus', 'roleplay', 'onomatopoeia', 'brought-content'
  ];
  for (const locale of ['en', 'zh-CN', 'ko', 'es']) {
    for (const mode of modes) {
      const custom = `USER_CUSTOM_${locale}_日本語保持`;
      const avoid = `USER_AVOID_${locale}_日本語保持`;
      const source = `USER_SOURCE_${locale}_日本語保持`;
      const prompt = context.SessionPromptConfig.buildPrompt({
        locale,
        mode,
        length: 'medium',
        voiceStylePrompt: context.UiI18n.text(deepWhisperPrompt, locale),
        customInstructions: custom,
        avoid,
        sourceContent: source
      }, () => 0.42);
      assert.ok(prompt.length > 700, `${locale}/${mode}`);
      assert.ok(prompt.includes(custom), `${locale}/${mode}/custom`);
      assert.ok(prompt.includes(avoid), `${locale}/${mode}/avoid`);
      if (mode === 'brought-content') assert.ok(prompt.includes(source));
      const withoutUserText = prompt
        .replace(custom, '')
        .replace(avoid, '')
        .replace(source, '');
      assert.doesNotMatch(withoutUserText, kana, `${locale}/${mode}/built-in Japanese`);
      assert.doesNotMatch(
        withoutUserText,
        /short (?:sentences?|utterances?|lines?|responses?)|keep (?:the )?sentences? short|brief utterances?/i,
        `${locale}/${mode}/removed short-speech instruction`
      );
      assert.doesNotMatch(withoutUserText, /ランダム|randomly selected/i, `${locale}/${mode}/random structure`);
    }
    const passivePrompt = context.PassiveTestConfig.buildPrompt(3, () => 0.42, locale);
    assert.doesNotMatch(passivePrompt, kana, `${locale}/passive-test`);
  }

  const japanesePrompt = context.SessionPromptConfig.buildPrompt({
    locale: 'ja', mode: 'relax', template: 'co-sleep'
  }, () => 0.42);
  assert.match(japanesePrompt, /添い寝・安心/);
  assert.match(japanesePrompt, /# 選択内容/);
  assert.doesNotMatch(
    japanesePrompt,
    /短い文|短い発話|短い台詞|一文へ圧縮|一文だけで|単語同士を急いでつなげず|普段の[0-9一二三四五六七八九]割/
  );

  const deterministicA = context.SessionPromptConfig.buildPrompt({
    locale: 'ja', mode: 'relax', template: 'co-sleep', length: 'medium'
  }, () => 0.01);
  const deterministicB = context.SessionPromptConfig.buildPrompt({
    locale: 'ja', mode: 'relax', template: 'co-sleep', length: 'medium'
  }, () => 0.99);
  assert.equal(deterministicA, deterministicB);

  console.log('v0.15.0 five-locale deterministic session localization test passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
