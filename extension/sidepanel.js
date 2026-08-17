const restartButton = document.getElementById('restart');
const reloadExtensionButton = document.getElementById('reload-extension');
const stopButton = document.getElementById('stop');
const muteButton = document.getElementById('mute');
const productStatusCard = document.querySelector('.product-status-card');
const productConnectionStatus = document.getElementById('product-connection-status');
const productConnectionHint = document.getElementById('product-connection-hint');
const productMuteButton = document.getElementById('product-mute');
const productStopButton = document.getElementById('product-stop');
const productReconnectButton = document.getElementById('product-reconnect');
const productCaptureTarget = document.getElementById('product-capture-target');
const productPromptReadiness = document.getElementById('product-prompt-readiness');
const productAudioReadiness = document.getElementById('product-audio-readiness');
const productError = document.getElementById('product-error');
const highGainDialog = document.getElementById('high-gain-dialog');
const highGainCancelButton = document.getElementById('high-gain-cancel');
const highGainConfirmButton = document.getElementById('high-gain-confirm');
const settingsExportButton = document.getElementById('settings-export');
const settingsImportButton = document.getElementById('settings-import');
const settingsImportFile = document.getElementById('settings-import-file');
const settingsResetButton = document.getElementById('settings-reset');
const settingsManagementStatus = document.getElementById('settings-management-status');
const testLeftButton = document.getElementById('test-left');
const testRightButton = document.getElementById('test-right');
const errorText = document.getElementById('error');
const engineStatus = document.getElementById('engine-status');
const captureStatus = document.getElementById('capture-status');
const trackStatus = document.getElementById('track-status');
const contextRate = document.getElementById('context-rate');
const gainLeft = document.getElementById('gain-left');
const gainRight = document.getElementById('gain-right');
const hrtfStatus = document.getElementById('hrtf-status');
const hrtfCount = document.getElementById('hrtf-count');
const hrtfRate = document.getElementById('hrtf-rate');
const hrtfMatch = document.getElementById('hrtf-match');
const hrtfDatasetSelect = document.getElementById('hrtf-dataset-select');
const hrtfDatasetDescription = document.getElementById('hrtf-dataset-description');
const hrtfInputLevel = document.getElementById('hrtf-input-level');
const hrtfOutputLevel = document.getElementById('hrtf-output-level');
const hrtfLimiterReduction = document.getElementById('hrtf-limiter-reduction');
const hrtfOutputGain = document.getElementById('hrtf-output-gain');
const hrtfOutputGainSlider = document.getElementById('hrtf-output-gain-slider');
const texturePresetButtons = [...document.querySelectorAll('.texture-preset')];
const textureDescription = document.getElementById('texture-description');
const textureComponentControls = [
  { component: 'density', input: document.getElementById('texture-density'), value: document.getElementById('texture-density-value') },
  { component: 'body', input: document.getElementById('texture-body'), value: document.getElementById('texture-body-value') },
  { component: 'nearEar', input: document.getElementById('texture-near-ear'), value: document.getElementById('texture-near-ear-value') }
];
const textureStatus = document.getElementById('texture-status');
const textureValues = document.getElementById('texture-values');
const textureOutputLevel = document.getElementById('texture-output-level');
const textureCompressionReduction = document.getElementById('texture-compression-reduction');
const vibrationToggleButtons = [...document.querySelectorAll('.vibration-toggle')];
const vibrationStatus = document.getElementById('vibration-status');
const vibrationIntensity = document.getElementById('vibration-intensity');
const vibrationIntensityValue = document.getElementById('vibration-intensity-value');
const vibrationOutputLevel = document.getElementById('vibration-output-level');
const vibrationCompressionReduction = document.getElementById('vibration-compression-reduction');
const deEsserToggleButtons = [...document.querySelectorAll('.deesser-toggle')];
const deEsserStatus = document.getElementById('deesser-status');
const deEsserIntensity = document.getElementById('deesser-intensity');
const deEsserIntensityValue = document.getElementById('deesser-intensity-value');
const ambienceMode = document.getElementById('ambience-mode');
const ambienceModeStatus = document.getElementById('ambience-mode-status');
const ambienceDescription = document.getElementById('ambience-description');
const ambienceLevel = document.getElementById('ambience-level');
const ambienceLevelValue = document.getElementById('ambience-level-value');
const ambienceOutputLevel = document.getElementById('ambience-output-level');
const ambiencePreviewButton = document.getElementById('ambience-preview');
const reflectionToggleButtons = [...document.querySelectorAll('.reflection-toggle')];
const reflectionStatus = document.getElementById('reflection-status');
const reflectionIntensity = document.getElementById('reflection-intensity');
const reflectionIntensityValue = document.getElementById('reflection-intensity-value');
const spatialMap = document.getElementById('spatial-map');
const voiceSourceDot = document.getElementById('voice-source-dot');
const spatialPosition = document.getElementById('spatial-position');
const parallaxPosition = document.getElementById('parallax-position');
const nearFieldGains = document.getElementById('near-field-gains');
const motionPattern = document.getElementById('motion-pattern');
const motionDescription = document.getElementById('motion-description');
const motionDuration = document.getElementById('motion-duration');
const motionDurationValue = document.getElementById('motion-duration-value');
const rearTransitionControl = document.getElementById('rear-transition-control');
const motionTransitionLabel = document.getElementById('motion-transition-label');
const rearTransitionDuration = document.getElementById('rear-transition-duration');
const rearTransitionDurationValue = document.getElementById('rear-transition-duration-value');
const motionTimingSummary = document.getElementById('motion-timing-summary');
const motionStartButton = document.getElementById('motion-start');
const motionStopButton = document.getElementById('motion-stop');
const motionStatus = document.getElementById('motion-status');
const voicePromptPreset = document.getElementById('voice-prompt-preset');
const voicePromptDescription = document.getElementById('voice-prompt-description');
const voicePromptName = document.getElementById('voice-prompt-name');
const voicePromptText = document.getElementById('voice-prompt-text');
const copyVoicePromptButton = document.getElementById('copy-voice-prompt');
const resetVoicePromptButton = document.getElementById('reset-voice-prompt');
const voicePromptCopyStatus = document.getElementById('voice-prompt-copy-status');
const sessionMode = document.getElementById('session-mode');
const sessionTemplate = document.getElementById('session-template');
const sessionTemplateDescription = document.getElementById('session-template-description');
const sessionVoiceStyle = document.getElementById('session-voice-style');
const sessionVoiceStyleDescription = document.getElementById('session-voice-style-description');
const sessionLength = document.getElementById('session-length');
const sessionLengthField = document.getElementById('session-length-field');
const sessionBehaviorName = document.getElementById('session-behavior-name');
const sessionBehaviorDescription = document.getElementById('session-behavior-description');
const sessionOutlineSummary = document.getElementById('session-outline-summary');
const sessionCustomInstructions = document.getElementById('session-custom-instructions');
const sessionAvoid = document.getElementById('session-avoid');
const sessionSourceField = document.getElementById('session-source-field');
const sessionSourceContent = document.getElementById('session-source-content');
const sessionPrompt = document.getElementById('session-prompt');
const sessionCopyPrimaryButton = document.getElementById('session-copy-primary');
const sessionCopyStatus = document.getElementById('session-copy-status');
const sessionLaunchSummary = document.getElementById('session-launch-summary');
const quickOutputGain = document.getElementById('quick-output-gain');
const quickOutputGainValue = document.getElementById('quick-output-gain-value');
const quickPositionButtons = [...document.querySelectorAll('.quick-position')];
const quickDistance = document.getElementById('quick-distance');
const quickMotionPattern = document.getElementById('quick-motion-pattern');
const quickMotionToggle = document.getElementById('quick-motion-toggle');
const quickAmbienceMode = document.getElementById('quick-ambience-mode');
const quickAmbienceLevel = document.getElementById('quick-ambience-level');
const quickAmbienceLevelValue = document.getElementById('quick-ambience-level-value');
const quickChannelCheck = document.getElementById('quick-channel-check');
const advancedSettingsToggle = document.getElementById('advanced-settings-toggle');
const developerLabToggle = document.getElementById('developer-lab-toggle');
const advancedProductSections = [...document.querySelectorAll('.advanced-product-section')];
const developerLabSections = [...document.querySelectorAll('.developer-lab-section')];
const passiveTestSceneCount = document.getElementById('passive-test-scene-count');
const passiveTestRegenerateButton = document.getElementById('passive-test-regenerate');
const passiveTestPrompt = document.getElementById('passive-test-prompt');
const passiveTestCopyButton = document.getElementById('passive-test-copy');
const passiveTestStartButton = document.getElementById('passive-test-start');
const passiveTestStopButton = document.getElementById('passive-test-stop');
const passiveTestCopyStatus = document.getElementById('passive-test-copy-status');
const passiveTestStatus = document.getElementById('passive-test-status');
const passiveTestElapsed = document.getElementById('passive-test-elapsed');
const passiveTestResponseDuration = document.getElementById('passive-test-response-duration');
const passiveTestSpeech = document.getElementById('passive-test-speech');
const passiveTestSilence = document.getElementById('passive-test-silence');
const passiveTestLongestSilence = document.getElementById('passive-test-longest-silence');
const passiveTestResult = document.getElementById('passive-test-result');
const passiveTestHint = document.getElementById('passive-test-hint');
const positionButtons = [...document.querySelectorAll('.position')];
const engineButtons = [...document.querySelectorAll('.engine')];
const hrtfPositionButtons = [...document.querySelectorAll('.hrtf-position')];
let gainSliderTimer = null;
const textureComponentTimers = new Map();
let vibrationIntensityTimer = null;
let deEsserIntensityTimer = null;
let ambienceLevelTimer = null;
let pendingAmbienceMode = null;
let ambienceModeRequestId = 0;
let reflectionIntensityTimer = null;
let spatialUpdateTimer = null;
let spatialPointerId = null;
let pendingSpatialPosition = null;
let spatialUpdateRunning = false;
let latestState = null;
let latestProductState = null;
let busyHrtf = false;
let highGainWarningAccepted = false;
let highGainDecisionResolver = null;
let lastSafeOutputGain = 1;
let voicePromptDrafts = {};
let voicePromptDraftsByLocale = {};
let voicePromptSaveTimer = null;
let voicePromptStatusTimer = null;
let lastCopiedSessionPrompt = '';
let sessionSettingsSaveTimer = null;
let sessionPromptStatusTimer = null;
let motionDurationSaveTimer = null;
let rearTransitionSaveTimer = null;
let motionUiPollTimer = null;
let audioDiagnosticsPollTimer = null;
const AUDIO_ENGINE_REQUEST_SEQUENCE = Symbol('audioEngineRequestSequence');
let nextAudioEngineRequestSequence = 0;
let lastRenderedAudioEngineRequestSequence = 0;

const PRODUCT_PREFERENCE_STORAGE = Object.freeze({
  highGainWarningAccepted: 'highGainWarningAcceptedV1'
});

const PRODUCT_SETTING_KEY_PATTERN = /^(hrtf|texture|vibration|deEsser|earlyReflections|ambience|voicePrompt|sessionPrompt|motion)/;

const VOICE_PROMPT_STORAGE = Object.freeze({
  selectedPreset: 'voicePromptSelectedPreset',
  drafts: 'voicePromptDraftsByLocaleV1',
  legacyDrafts: 'voicePromptDrafts',
  settingsRevision: 'voicePromptSettingsRevision'
});

const VOICE_PACING_HEADING_PATTERN = /^#[^\S\r\n]*(?:Pacing|节奏|速度|속도|리듬|ritmo)[^\S\r\n]*$/iu;
const VOICE_PAUSES_HEADING_PATTERN = /^#[^\S\r\n]*(?:Pauses|暂停|停顿|일시[^\S\r\n]*중지|멈춤|Pausas)[^\S\r\n]*$/iu;

function promptBlocks(value) {
  return String(value ?? '').trim().split(/\r?\n\r?\n/u).filter(Boolean);
}

function promptBlockHeading(block) {
  return String(block).split(/\r?\n/u, 1)[0].trim();
}

function voiceTimingBlockKind(block) {
  const heading = promptBlockHeading(block);
  if (VOICE_PACING_HEADING_PATTERN.test(heading)) return 'pacing';
  if (VOICE_PAUSES_HEADING_PATTERN.test(heading)) return 'pauses';
  return '';
}

function restoreDefaultVoiceTimingSections(value, defaultValue, kinds) {
  const draftBlocks = promptBlocks(value);
  if (!draftBlocks.length) return String(value ?? '');
  const defaultBlocks = promptBlocks(defaultValue);
  for (const kind of kinds) {
    if (draftBlocks.some((block) => voiceTimingBlockKind(block) === kind)) continue;
    const defaultIndex = defaultBlocks.findIndex((block) => voiceTimingBlockKind(block) === kind);
    if (defaultIndex < 0) continue;
    const previousHeading = [...defaultBlocks.slice(0, defaultIndex)].reverse()
      .map(promptBlockHeading).find((heading) => heading.startsWith('#'));
    const nextHeading = defaultBlocks.slice(defaultIndex + 1)
      .map(promptBlockHeading).find((heading) => heading.startsWith('#'));
    const previousIndex = previousHeading
      ? draftBlocks.findIndex((block) => promptBlockHeading(block) === previousHeading) : -1;
    const nextIndex = nextHeading
      ? draftBlocks.findIndex((block) => promptBlockHeading(block) === nextHeading) : -1;
    const insertionIndex = previousIndex >= 0 ? previousIndex + 1
      : nextIndex >= 0 ? nextIndex : draftBlocks.length;
    draftBlocks.splice(insertionIndex, 0, defaultBlocks[defaultIndex]);
  }
  return draftBlocks.join('\n\n').trim();
}

function replaceWithDefaultVoiceTimingSections(value, defaultValue, kinds) {
  const kindSet = new Set(kinds);
  const withoutReplacedSections = promptBlocks(value)
    .filter((block) => !kindSet.has(voiceTimingBlockKind(block)))
    .join('\n\n');
  return restoreDefaultVoiceTimingSections(withoutReplacedSections, defaultValue, kinds);
}

function currentLocale() {
  return globalThis.UiI18n?.locale || 'en';
}

function uiText(value) {
  return globalThis.UiI18n?.text(value) ?? value;
}

function localizedVoicePromptPreset(presetId, locale = currentLocale()) {
  const normalizedId = VOICE_PROMPT_PRESETS[presetId] ? presetId : 'deep-whisper';
  const preset = VOICE_PROMPT_PRESETS[normalizedId];
  const localize = (value) => globalThis.UiI18n?.text(value, locale) ?? value;
  return {
    ...preset,
    name: localize(preset.name),
    description: localize(preset.description),
    prompt: localize(preset.prompt)
  };
}

function storedVoiceDrafts() {
  voicePromptDraftsByLocale[currentLocale()] = voicePromptDrafts;
  return voicePromptDraftsByLocale;
}

const SESSION_PROMPT_STORAGE = Object.freeze({
  mode: 'sessionPromptMode',
  template: 'sessionPromptTemplate',
  length: 'sessionPromptLength',
  customInstructions: 'sessionPromptCustomInstructions',
  avoid: 'sessionPromptAvoid',
  sourceContent: 'sessionPromptSourceContent'
});

const VOICE_PROMPT_PRESETS = Object.freeze({
  'soft-spoken': {
    name: 'ソフトスピーキング',
    description: '囁き切らず、近い距離で静かに話す。会話の自然さを残した比較用。',
    prompt: `以下は、この会話における音声応答の発話スタイル指示です。この文章自体は読み上げず、次の返答から継続して適用してください。

# Voice Affect
近い距離で静かに話す、柔らかなソフトスピーキング。普通の会話声より声量を抑えるが、完全な囁きにはしない。

# Tone
落ち着いていて温かい。大げさに演技せず、親しい相手へ自然に話しかけるようにする。

# Pacing
急がず、自然な会話の流れを保って話す。

# Emotion
低めの熱量で穏やかに保つ。過度に明るくしたり、語尾を強く跳ね上げたりしない。

# Pronunciation
子音を鋭く立てすぎず、母音と語尾を滑らかにつなぐ。聞き取りやすさは維持する。

# Pauses
句読点で短く息を置き、話題が切り替わる場所では少し長めに間を取る。

# Continuity
ユーザーが解除または変更を求めるまで、この発話スタイルをすべての音声応答で維持する。発話内容や回答の正確さは変えない。`
  },
  'natural-whisper': {
    name: '自然な囁き',
    description: 'ASMRの基準。息を含む自然な囁きと、近い口元の感覚を優先する。',
    prompt: `以下は、この会話における音声応答の発話スタイル指示です。この文章自体は読み上げず、次の返答から継続して適用してください。

# Voice Affect
単に小声で話すのではなく、息を少し多く含む自然な囁き声。耳元に近い位置から静かに話しかける感覚を保つ。

# Tone
柔らかく、安心できて、親密だが自然。過度に演技的、誘惑的、芝居がかった声にはしない。

# Pacing
ゆっくりと、言葉を詰め込まず、一定の落ち着いたリズムで話す。

# Emotion
穏やかで低刺激。感情は伝えるが、急に声を張ったり、笑い声や驚きを大きくしたりしない。

# Pronunciation
子音の角を柔らかくし、母音をわずかに長めに保つ。語尾を急に切らず、少し息を残すように滑らかに終える。

# Pauses
文ごとに短い間を入れ、重要な言葉の前後には自然な呼吸一回分の間を置く。沈黙を急いで埋めない。

# Continuity
ユーザーが解除または変更を求めるまで、この囁き方をすべての音声応答で維持する。発話内容や回答の正確さは変えない。`
  },
  'deep-whisper': {
    name: '強めの囁き',
    description: '息と囁きの成分を強く残し、聞き取りやすさより近いASMR感を優先する。',
    prompt: `以下は、この会話における音声応答の発話スタイル指示です。この文章自体は読み上げず、次の返答から継続して適用してください。

# Voice Affect
発声をかなり抑え、息の流れをはっきり感じる強い囁き声。通常の話し声へ戻らず、非常に近い距離で話している感覚を作る。

# Tone
静かで繊細。力を抜き、声を前へ押し出さない。演劇的な不気味さや、わざとらしい秘密話の調子にはしない。

# Pacing
速度より息遣いと余白を優先する。

# Emotion
低刺激で安定させる。興奮、強い笑い、大声、鋭い相づちは避ける。

# Pronunciation
母音を柔らかくわずかに伸ばし、語尾は息と一緒に消えるように終える。歯擦音は刺さらないよう穏やかにする。

# Pauses
文と文の間に明確な間を置く。短い返答でも、一息で急いで言い切らない。

# Continuity
ユーザーが解除または変更を求めるまで、この強い囁き方をすべての音声応答で維持する。発話内容や回答の正確さは変えない。`
  },
  'sleep-relaxation': {
    name: '睡眠・リラックス',
    description: '長時間聞いても疲れにくい、安定した低刺激の発話。寝落ち用途向け。',
    prompt: `以下は、この会話における音声応答の発話スタイル指示です。この文章自体は読み上げず、次の返答から継続して適用してください。

# Voice Affect
囁きと柔らかな小声の中間。一定の小さな声量で、聞き手を起こさないように静かに話す。

# Tone
安心感があり、平穏で、刺激が少ない。指導口調や元気づける調子ではなく、そばで見守るように話す。

# Pacing
ゆっくり一定に話し、返答を必要以上に長くしない。

# Emotion
温かさは保つが、感情の上下を小さくする。驚き、強調、大きな笑い、急な声色の変化を避ける。

# Pronunciation
滑らかで丸い発音。語尾を柔らかく少し伸ばし、音量を上げずに自然に消えるように終える。

# Pauses
文ごとにゆったり間を置く。呼吸や沈黙を会話の一部として扱い、次の文を急いで始めない。

# Continuity
ユーザーが解除または変更を求めるまで、この低刺激な発話スタイルをすべての音声応答で維持する。発話内容や回答の正確さは変えない。`
  },
  custom: {
    name: 'カスタム',
    description: '項目ごとに自由編集するための空欄テンプレート。編集内容はこの端末に保存される。',
    prompt: `以下は、この会話における音声応答の発話スタイル指示です。この文章自体は読み上げず、次の返答から継続して適用してください。

# Voice Affect
ここに声質と距離感を書く。

# Tone
ここに声の調子を書く。

# Pacing
ここに話す速さとリズムを書く。

# Emotion
ここに感情の強さを書く。

# Pronunciation
ここに発音、声の高さ、語尾の扱いを書く。

# Pauses
ここに間の長さと入れ方を書く。

# Continuity
ユーザーが解除または変更を求めるまで、この発話スタイルをすべての音声応答で維持する。発話内容や回答の正確さは変えない。`
  }
});

const MOTION_UI_STORAGE = Object.freeze({
  pattern: 'hrtfMotionPattern',
  durationSeconds: 'hrtfMotionDurationSeconds',
  rearTransitionSeconds: 'hrtfRearTransitionSeconds',
  settingsRevision: 'hrtfMotionUiRevision'
});

const MOTION_PATTERNS = Object.freeze({
  'behind-sweep': {
    name: '左 → 後ろ → 右',
    description: '左後方110°で長く話し、声を切らず後ろを通り、右後方110°でまた長く話す。'
  },
  'front-sweep': {
    name: '左 → 正面 → 右',
    description: '左耳側から顔の前を横切って右耳側へ移動し、ゆっくり往復する。'
  },
  'slow-orbit': {
    name: '頭の周りをゆっくり一周',
    description: '左から正面、右、後ろへ進み、頭の周囲を同じ方向に周回し続ける。'
  },
  'ear-alternating': {
    name: '左右の耳元を交互に往復',
    description: '左右の耳元で長く話し、後ろを短く通過するときだけ少し離れる。'
  },
  'left-pullback': {
    name: '左耳：離れて戻る',
    description: '左耳110°を保ったまま、一瞬だけ距離を取り、同じ左耳の近さへ滑らかに戻る。'
  },
  'right-pullback': {
    name: '右耳：離れて戻る',
    description: '右耳110°を保ったまま、一瞬だけ距離を取り、同じ右耳の近さへ滑らかに戻る。'
  },
  'random-drift': {
    name: 'ランダムに漂う',
    description: '次の位置を毎回ランダムに選び、角度と距離を曲線補間して自然に漂う。'
  }
});

const HRTF_DATASET_DESCRIPTIONS = Object.freeze({
  'aalto-nearfield': '20・30・40・50cmで実測。20cm未満は20cmの左右ペアを基準に、ごく小さな近接補正だけを加える。'
});

const TEXTURE_PRESETS = Object.freeze({
  raw: {
    name: '原音（基準）',
    description: '加工なし。現在の音を比較基準として聞く。'
  },
  density: {
    name: '密度',
    description: '弱い並列圧縮で、小さい語尾や息に近い成分を前へ出す。低音追加は控えめ。'
  },
  body: {
    name: '厚み',
    description: '220Hz付近の胴鳴りを中心に足す。こもるなら強度を下げる。'
  },
  'near-ear': {
    name: '耳元',
    description: '3.8kHz付近と高域を少し出し、唇や息の輪郭を近く感じやすくする。刺さる場合は強度を下げる。'
  },
  'balanced-asmr': {
    name: 'バランスASMR',
    description: '密度・厚み・耳元の補正を弱めに組み合わせた総合比較用。'
  },
  recommended: {
    name: '推奨 70/70',
    description: '密度0%、厚み70%、耳元70%の推奨ミックス。'
  },
  custom: {
    name: 'カスタム',
    description: '密度・厚み・耳元を個別に調整した状態。'
  }
});

const AMBIENCE_DESCRIPTIONS = Object.freeze({
  off: '環境音なし。加工前後を厳密に比較するための無音状態。',
  'quiet-room': '薄い広帯域ルームトーン。声を邪魔しにくい基準環境。',
  'air-conditioner': '低い送風音と弱いファン成分。高域の粗を隠す力は控えめ。',
  'night-room': '暗く低めの静かな部屋。睡眠向けだが、低域圧との重なりに注意。',
  'distant-rain': '高域を含む遠い雨。生成音声の細かな粗を隠しやすいが、強すぎると声を邪魔する。'
});

function showError(message = '') {
  const rawText = String(message || '');
  const text = /sendMessage|Cannot read properties of undefined|chrome is not defined/i.test(rawText)
    ? '拡張機能の接続機能を利用できません。拡張機能の管理画面からLive ASMR Studioを再読み込みしてください。'
    : rawText;
  errorText.textContent = text;
  productError.textContent = text;
  productError.hidden = !text;
}

function showSettingsStatus(message = '', isError = false) {
  settingsManagementStatus.textContent = message;
  settingsManagementStatus.classList.toggle('error', isError);
}

function setSectionGroupExpanded(button, sections, expanded, label) {
  for (const section of sections) section.hidden = !expanded;
  button.setAttribute('aria-expanded', String(expanded));
  button.textContent = `${label}を${expanded ? '閉じる' : '開く'}`;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function sidePanelStorageArea() {
  return globalThis.chrome?.storage?.local || null;
}

async function readLocalSettings(keys) {
  const storageArea = sidePanelStorageArea();
  return storageArea ? storageArea.get(keys) : {};
}

async function writeLocalSettings(values) {
  const storageArea = sidePanelStorageArea();
  if (!storageArea) return false;
  await storageArea.set(values);
  return true;
}

async function initializeProductPreferences() {
  const stored = await readLocalSettings(Object.values(PRODUCT_PREFERENCE_STORAGE));
  highGainWarningAccepted = stored[PRODUCT_PREFERENCE_STORAGE.highGainWarningAccepted] === true;
}

function resolveHighGainDecision(accepted) {
  if (!highGainDecisionResolver) return;
  const resolve = highGainDecisionResolver;
  highGainDecisionResolver = null;
  if (highGainDialog.open) highGainDialog.close();
  resolve(Boolean(accepted));
}

function requestHighGainPermission() {
  if (highGainWarningAccepted) return Promise.resolve(true);
  if (highGainDecisionResolver) {
    return new Promise((resolve) => {
      const previousResolve = highGainDecisionResolver;
      highGainDecisionResolver = (accepted) => {
        previousResolve(accepted);
        resolve(accepted);
      };
    });
  }
  highGainDialog.showModal();
  return new Promise((resolve) => { highGainDecisionResolver = resolve; });
}

function outputGainValueText(value) {
  return `${Number(value).toFixed(1)}倍`;
}

function syncOutputGainControls(value) {
  const normalized = Math.max(0.5, Math.min(15, Number(value) || 1));
  hrtfOutputGainSlider.value = String(normalized);
  quickOutputGain.value = String(normalized);
  hrtfOutputGain.textContent = formatHrtfOutputGain(normalized);
  quickOutputGainValue.textContent = outputGainValueText(normalized);
  if (normalized < 10) lastSafeOutputGain = normalized;
}

async function commitOutputGain(requestedValue) {
  let value = Math.max(0.5, Math.min(15, Number(requestedValue) || 1));
  if (value >= 10 && !highGainWarningAccepted) {
    const accepted = await requestHighGainPermission();
    if (!accepted) {
      value = Math.min(9.9, lastSafeOutputGain);
      syncOutputGainControls(value);
      return;
    }
    highGainWarningAccepted = true;
    await writeLocalSettings({
      [PRODUCT_PREFERENCE_STORAGE.highGainWarningAccepted]: true
    });
  }

  syncOutputGainControls(value);
  showError();
  try {
    renderState(await sendToAudioEngine('set-hrtf-output-gain', { value }));
  } catch (error) {
    showError(`HRTF音量の調整: ${error.message}`);
  }
}

function scheduleOutputGain(value) {
  syncOutputGainControls(value);
  clearTimeout(gainSliderTimer);
  gainSliderTimer = setTimeout(() => commitOutputGain(value), 70);
}

function productSettingsFromStorage(values) {
  return Object.fromEntries(Object.entries(values || {})
    .filter(([key]) => PRODUCT_SETTING_KEY_PATTERN.test(key)));
}

async function exportProductSettings() {
  const values = await readLocalSettings(null);
  const payload = {
    schemaVersion: 1,
    product: 'Live ASMR Studio',
    version: '0.15.0',
    exportedAt: new Date().toISOString(),
    settings: productSettingsFromStorage(values)
  };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `live-asmr-studio-settings-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function importProductSettings(file) {
  if (!file) return;
  if (file.size > 1024 * 1024) throw new Error('設定ファイルが大きすぎます。');
  const payload = JSON.parse(await file.text());
  const compatibleProducts = new Set(['Live ASMR Studio', 'GPT Live ASMR']);
  if (payload?.schemaVersion !== 1 || !compatibleProducts.has(payload?.product)
      || !payload.settings || typeof payload.settings !== 'object'
      || Array.isArray(payload.settings)) {
    throw new Error('Live ASMR Studioの設定ファイルではありません。');
  }
  const settings = productSettingsFromStorage(payload.settings);
  if (!Object.keys(settings).length) throw new Error('読み込める設定がありません。');
  await writeLocalSettings(settings);
}

async function resetProductSettings() {
  const storageArea = sidePanelStorageArea();
  if (!storageArea) throw new Error('設定保存を利用できません。');
  const values = await storageArea.get(null);
  const keys = Object.keys(productSettingsFromStorage(values));
  if (keys.length) await storageArea.remove(keys);
}

function selectedVoicePromptPreset() {
  const presetId = voicePromptPreset.value;
  return VOICE_PROMPT_PRESETS[presetId] ? presetId : 'deep-whisper';
}

function showVoicePromptStatus(message = '', isError = false) {
  clearTimeout(voicePromptStatusTimer);
  voicePromptCopyStatus.textContent = message;
  voicePromptCopyStatus.classList.toggle('error', isError);
  if (message) {
    voicePromptStatusTimer = setTimeout(() => {
      voicePromptCopyStatus.textContent = '';
      voicePromptCopyStatus.classList.remove('error');
    }, 2600);
  }
}

function renderVoicePromptEditor(presetId, preserveText = false) {
  const normalizedId = VOICE_PROMPT_PRESETS[presetId] ? presetId : 'deep-whisper';
  const preset = localizedVoicePromptPreset(normalizedId);
  voicePromptPreset.value = normalizedId;
  sessionVoiceStyle.value = normalizedId;
  sessionVoiceStyleDescription.textContent = preset.description;
  voicePromptName.textContent = `${preset.name}${voicePromptDrafts[normalizedId] !== undefined ? '（編集済み）' : ''}`;
  voicePromptDescription.textContent = preset.description;
  if (!preserveText) voicePromptText.value = voicePromptDrafts[normalizedId] ?? preset.prompt;
  copyVoicePromptButton.disabled = !voicePromptText.value.trim();
  resetVoicePromptButton.disabled = voicePromptDrafts[normalizedId] === undefined;
}

async function initializeVoicePromptControls() {
  const stored = await readLocalSettings(Object.values(VOICE_PROMPT_STORAGE));
  const storedDrafts = stored[VOICE_PROMPT_STORAGE.drafts];
  voicePromptDraftsByLocale = storedDrafts && typeof storedDrafts === 'object'
    && !Array.isArray(storedDrafts) ? storedDrafts : {};
  const legacyDrafts = stored[VOICE_PROMPT_STORAGE.legacyDrafts];
  if (!voicePromptDraftsByLocale.ja && legacyDrafts && typeof legacyDrafts === 'object'
      && !Array.isArray(legacyDrafts)) {
    voicePromptDraftsByLocale.ja = legacyDrafts;
  }
  const revision = Number(stored[VOICE_PROMPT_STORAGE.settingsRevision] ?? 0);
  if (revision < 4) {
    for (const [locale, drafts] of Object.entries(voicePromptDraftsByLocale)) {
      if (!drafts || typeof drafts !== 'object' || Array.isArray(drafts)) continue;
      voicePromptDraftsByLocale[locale] = Object.fromEntries(
        Object.entries(drafts).map(([presetId, draft]) => {
          if (!VOICE_PROMPT_PRESETS[presetId] || presetId === 'custom') return [presetId, draft];
          const defaultPrompt = localizedVoicePromptPreset(presetId, locale).prompt;
          const migratedDraft = revision < 3
            ? replaceWithDefaultVoiceTimingSections(draft, defaultPrompt, ['pacing'])
            : restoreDefaultVoiceTimingSections(draft, defaultPrompt, ['pacing', 'pauses']);
          return [presetId, migratedDraft];
        }));
    }
  }
  const localeDrafts = voicePromptDraftsByLocale[currentLocale()];
  voicePromptDrafts = localeDrafts && typeof localeDrafts === 'object' && !Array.isArray(localeDrafts)
    ? localeDrafts : {};
  voicePromptDraftsByLocale[currentLocale()] = voicePromptDrafts;
  const selected = stored[VOICE_PROMPT_STORAGE.selectedPreset];
  const migratedSelection = revision < 1 && (!selected || selected === 'natural-whisper')
    ? 'deep-whisper'
    : VOICE_PROMPT_PRESETS[selected] ? selected : 'deep-whisper';
  renderVoicePromptEditor(migratedSelection);
  await writeLocalSettings({
    [VOICE_PROMPT_STORAGE.selectedPreset]: migratedSelection,
    [VOICE_PROMPT_STORAGE.drafts]: voicePromptDraftsByLocale,
    [VOICE_PROMPT_STORAGE.settingsRevision]: 4
  });
}

async function copyText(text, sourceTextarea = voicePromptText) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch { /* Fall through to the selection-based copy path. */ }
  }

  const selectionStart = sourceTextarea.selectionStart;
  const selectionEnd = sourceTextarea.selectionEnd;
  sourceTextarea.focus();
  sourceTextarea.select();
  const copied = document.execCommand('copy');
  sourceTextarea.setSelectionRange(selectionStart, selectionEnd);
  if (!copied) throw new Error('ブラウザがクリップボードへの書き込みを拒否しました。');
}

async function copyVoicePrompt(text) {
  return copyText(text, voicePromptText);
}

function selectedSessionMode() {
  return SessionPromptConfig.normalizeMode(sessionMode.value);
}

function selectedSessionLength() {
  return SessionPromptConfig.normalizeLength(sessionLength.value);
}

function populateSessionTemplates(preferredTemplate = null) {
  const modeId = selectedSessionMode();
  const templates = SessionPromptConfig.templateOptions(modeId);
  const defaults = SessionPromptConfig.modeDefaults(modeId);
  sessionTemplate.replaceChildren(...templates.map((template) => {
    const option = document.createElement('option');
    option.value = template.id;
    option.textContent = template.name;
    return option;
  }));
  sessionTemplate.value = templates.some((template) => template.id === preferredTemplate)
    ? preferredTemplate
    : defaults.template;
}

function sessionSettingsSnapshot() {
  return {
    [SESSION_PROMPT_STORAGE.mode]: selectedSessionMode(),
    [SESSION_PROMPT_STORAGE.template]: sessionTemplate.value,
    [SESSION_PROMPT_STORAGE.length]: selectedSessionLength(),
    [SESSION_PROMPT_STORAGE.customInstructions]: sessionCustomInstructions.value,
    [SESSION_PROMPT_STORAGE.avoid]: sessionAvoid.value,
    [SESSION_PROMPT_STORAGE.sourceContent]: sessionSourceContent.value
  };
}

function showSessionPromptStatus(message = '', isError = false) {
  clearTimeout(sessionPromptStatusTimer);
  sessionCopyStatus.textContent = message;
  sessionCopyStatus.classList.toggle('error', isError);
  if (message) {
    sessionPromptStatusTimer = setTimeout(() => {
      sessionCopyStatus.textContent = '';
      sessionCopyStatus.classList.remove('error');
    }, 3200);
  }
}

async function saveSessionSettings() {
  try {
    await writeLocalSettings(sessionSettingsSnapshot());
  } catch (error) {
    showSessionPromptStatus(`設定の保存に失敗: ${error.message}`, true);
  }
}

function scheduleSessionSettingsSave() {
  clearTimeout(sessionSettingsSaveTimer);
  sessionSettingsSaveTimer = setTimeout(saveSessionSettings, 240);
}

function renderSessionPrompt() {
  const modeId = selectedSessionMode();
  const lengthId = selectedSessionLength();
  const template = SessionPromptConfig.templateFor(modeId, sessionTemplate.value);
  const mode = SessionPromptConfig.modeOptions().find((entry) => entry.id === modeId);
  const length = SessionPromptConfig.lengths[lengthId];
  const policy = SessionPromptConfig.modePolicy(modeId, lengthId);
  const voiceStyleId = VOICE_PROMPT_PRESETS[sessionVoiceStyle.value]
    ? sessionVoiceStyle.value
    : 'deep-whisper';
  const voiceStyle = localizedVoicePromptPreset(voiceStyleId);
  const voiceStylePrompt = voicePromptDrafts[voiceStyleId] ?? voiceStyle.prompt;
  const needsSource = modeId === 'brought-content';
  const hasSource = Boolean(sessionSourceContent.value.trim());
  sessionSourceField.hidden = !needsSource;
  sessionLengthField.hidden = !policy.showLength;
  sessionTemplateDescription.textContent = template.description;
  sessionBehaviorName.textContent = policy.behaviorLabel;
  sessionBehaviorDescription.textContent = policy.behaviorDescription;
  sessionOutlineSummary.textContent = SessionPromptConfig.outlineSummary(
    modeId, sessionTemplate.value, lengthId);
  sessionVoiceStyle.value = voiceStyleId;
  sessionVoiceStyleDescription.textContent = voiceStyle.description;
  sessionPrompt.value = SessionPromptConfig.buildPrompt({
    locale: currentLocale(),
    mode: modeId,
    template: sessionTemplate.value,
    length: lengthId,
    voiceStyleName: voiceStyle.name,
    voiceStylePrompt,
    customInstructions: sessionCustomInstructions.value,
    avoid: sessionAvoid.value,
    sourceContent: sessionSourceContent.value
  });
  const promptIsCopied = Boolean(lastCopiedSessionPrompt)
    && sessionPrompt.value === lastCopiedSessionPrompt;
  productPromptReadiness.textContent = promptIsCopied
    ? 'プロンプトコピー済み' : 'プロンプト未コピー';
  productPromptReadiness.classList.toggle('ready', promptIsCopied);
  const copyDisabled = needsSource && !hasSource;
  sessionCopyPrimaryButton.disabled = copyDisabled;
  const summaryText = needsSource && !hasSource
    ? '持ち込みコンテンツを入力するとコピーできます。'
    : `${mode.label} / ${template.name} / ${voiceStyle.name}${
      policy.showLength ? ` / ${length.label}` : ''}`;
  sessionLaunchSummary.textContent = summaryText;
}

async function initializeSessionPromptControls() {
  const stored = await readLocalSettings(Object.values(SESSION_PROMPT_STORAGE));
  const modeId = SessionPromptConfig.normalizeMode(stored[SESSION_PROMPT_STORAGE.mode]);
  sessionMode.value = modeId;
  populateSessionTemplates(stored[SESSION_PROMPT_STORAGE.template]);
  sessionLength.value = SessionPromptConfig.normalizeLength(
    stored[SESSION_PROMPT_STORAGE.length]);
  sessionCustomInstructions.value = String(
    stored[SESSION_PROMPT_STORAGE.customInstructions] || '');
  sessionAvoid.value = String(stored[SESSION_PROMPT_STORAGE.avoid] || '');
  sessionSourceContent.value = String(stored[SESSION_PROMPT_STORAGE.sourceContent] || '');
  renderSessionPrompt();
  await writeLocalSettings(sessionSettingsSnapshot());
}

function formatMatchedPosition(position) {
  if (!position) return '—';
  if (Number.isFinite(position.azimuth)) {
    const measuredDistance = Number(
      position.measuredDistanceMeters ?? position.radius);
    const distanceText = Number.isFinite(measuredDistance)
      ? ` / 実測${formatDistance(measuredDistance)}`
      : '';
    return `${Math.round(position.azimuth)}° / ${Math.round(position.elevation)}°${distanceText}`;
  }
  return `${position.x?.toFixed?.(2)}, ${position.y?.toFixed?.(2)}, ${position.z?.toFixed?.(2)}`;
}

function formatAudioLevel(levels) {
  const peak = Number(levels?.peakDb);
  const rms = Number(levels?.rmsDb);
  if (!Number.isFinite(peak) || !Number.isFinite(rms)) return '—';
  return `ピーク ${peak.toFixed(1)} / 平均 ${rms.toFixed(1)} dBFS`;
}

function formatHrtfOutputGain(gain) {
  const numericGain = Number(gain);
  if (!Number.isFinite(numericGain) || numericGain <= 0) return '—';
  const decibels = 20 * Math.log10(numericGain);
  return `${decibels >= 0 ? '+' : ''}${decibels.toFixed(1)} dB / ${numericGain.toFixed(1)}倍`;
}

function formatSignedDb(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '—';
  return `${numeric >= 0 ? '+' : ''}${numeric.toFixed(1)}dB`;
}

function renderTextureState(texture = {}) {
  const presetId = TEXTURE_PRESETS[texture.presetId] ? texture.presetId : 'custom';
  const preset = TEXTURE_PRESETS[presetId];
  for (const button of texturePresetButtons) {
    button.classList.toggle('active', button.dataset.texturePreset === presetId);
  }
  textureDescription.textContent = preset.description;
  const components = texture.components || { density: 0, body: 0.7, nearEar: 0.7 };
  for (const control of textureComponentControls) {
    const amount = Math.max(0, Math.min(1, Number(components[control.component] ?? 0)));
    if (document.activeElement !== control.input) {
      control.input.value = String(Math.round(amount * 100));
    }
    control.value.textContent = `${Math.round(Number(control.input.value))}%`;
  }
  textureStatus.textContent = preset.name;

  const applied = texture.applied || {};
  textureValues.textContent = presetId === 'raw'
    ? '補正なし'
    : `厚み ${formatSignedDb(applied.bodyDb)} / 口元 ${formatSignedDb(applied.presenceDb)} / 空気 ${formatSignedDb(applied.airDb)} / 圧縮 ${Number(applied.compressorRatio ?? 1).toFixed(1)}:1`;
  const diagnostics = texture.diagnostics || {};
  textureOutputLevel.textContent = formatAudioLevel(diagnostics.output);
  const reduction = Number(diagnostics.compressionReductionDb);
  textureCompressionReduction.textContent = Number.isFinite(reduction)
    ? `${reduction.toFixed(1)} dB`
    : '—';
  textureCompressionReduction.classList.toggle(
    'warning', Boolean(texture.active) && Number.isFinite(reduction) && reduction <= -6);

  const deEsser = texture.deEsser || {};
  const deEsserEnabled = typeof deEsser.enabled === 'boolean' ? deEsser.enabled : true;
  const deEsserAmount = Math.max(0, Math.min(1, Number(deEsser.intensity ?? 0.5)));
  for (const button of deEsserToggleButtons) {
    button.classList.toggle(
      'active', (button.dataset.deesserEnabled === 'true') === deEsserEnabled);
  }
  if (document.activeElement !== deEsserIntensity) {
    deEsserIntensity.value = String(Math.round(deEsserAmount * 100));
  }
  deEsserIntensityValue.textContent = `${Math.round(Number(deEsserIntensity.value))}%`;
  deEsserIntensity.disabled = !deEsserEnabled;
  deEsserStatus.textContent = deEsserEnabled
    ? `有効 / ${formatSignedDb(deEsser.cutDb)}`
    : '無効 / 比較用';
  deEsserStatus.classList.toggle('active', deEsserEnabled);
}

function renderVibrationState(vibration = {}) {
  const enabled = typeof vibration.enabled === 'boolean' ? vibration.enabled : true;
  const intensity = Math.max(0, Math.min(1, Number(vibration.intensity ?? 0.8)));
  for (const button of vibrationToggleButtons) {
    button.classList.toggle(
      'active', (button.dataset.vibrationEnabled === 'true') === enabled);
  }
  if (document.activeElement !== vibrationIntensity) {
    vibrationIntensity.value = String(Math.round(intensity * 100));
  }
  vibrationIntensityValue.textContent = `${Math.round(Number(vibrationIntensity.value))}%`;
  vibrationIntensity.disabled = !enabled;
  vibrationStatus.textContent = enabled ? '有効 / 45〜180Hz' : '無効 / 比較用';
  vibrationStatus.classList.toggle('active', enabled);

  const diagnostics = vibration.diagnostics || {};
  vibrationOutputLevel.textContent = formatAudioLevel(diagnostics.bandOutput);
  const reduction = Number(diagnostics.compressionReductionDb);
  vibrationCompressionReduction.textContent = Number.isFinite(reduction)
    ? `${reduction.toFixed(1)} dB`
    : '—';
  vibrationCompressionReduction.classList.toggle(
    'warning', enabled && Number.isFinite(reduction) && reduction <= -8);
}

function ambienceModeLabel(mode) {
  const option = [...ambienceMode.options].find((candidate) => candidate.value === mode);
  return option?.textContent || mode;
}

function renderAmbienceState(ambience = null, capturing = false) {
  const reportedMode = AMBIENCE_DESCRIPTIONS[ambience?.mode] ? ambience.mode : null;
  const visibleMode = AMBIENCE_DESCRIPTIONS[ambienceMode.value] ? ambienceMode.value : 'off';
  const mode = pendingAmbienceMode || reportedMode || visibleMode;
  ambienceMode.value = mode;
  quickAmbienceMode.value = mode;
  ambienceMode.disabled = Boolean(pendingAmbienceMode);
  quickAmbienceMode.disabled = Boolean(pendingAmbienceMode);
  ambienceModeStatus.textContent = pendingAmbienceMode
    ? `切替中: ${ambienceModeLabel(pendingAmbienceMode)}`
    : reportedMode
      ? `適用中: ${ambienceModeLabel(reportedMode)}`
      : '保存状態を確認中…';
  ambienceModeStatus.classList.toggle('active', Boolean(reportedMode) && !pendingAmbienceMode);
  ambienceDescription.textContent = AMBIENCE_DESCRIPTIONS[mode];
  const reportedLevelDb = Number(ambience?.levelDb);
  const levelDb = Number.isFinite(reportedLevelDb)
    ? Math.max(-48, Math.min(-12, reportedLevelDb))
    : Number(ambienceLevel.value || -34);
  if (Number.isFinite(levelDb) && document.activeElement !== ambienceLevel) {
    ambienceLevel.value = String(Math.round(levelDb));
  }
  if (Number.isFinite(levelDb) && document.activeElement !== quickAmbienceLevel) {
    quickAmbienceLevel.value = String(Math.round(levelDb));
  }
  ambienceLevelValue.textContent = `${Math.round(Number(ambienceLevel.value))} dB`;
  quickAmbienceLevelValue.textContent = `${Math.round(Number(quickAmbienceLevel.value))} dB`;
  ambienceLevel.disabled = mode === 'off' || Boolean(pendingAmbienceMode);
  quickAmbienceLevel.disabled = mode === 'off' || Boolean(pendingAmbienceMode);
  if (ambience) ambienceOutputLevel.textContent = formatAudioLevel(ambience.diagnostics?.output);
  ambiencePreviewButton.disabled = !capturing
    || mode === 'off'
    || Boolean(ambience?.previewing)
    || Boolean(pendingAmbienceMode);
  ambiencePreviewButton.textContent = ambience?.previewing
    ? '環境音を確認中…'
    : '環境音を2秒だけ強調して確認';
}

function renderReflectionState(reflections = {}) {
  const enabled = typeof reflections.enabled === 'boolean' ? reflections.enabled : true;
  const intensity = Math.max(0, Math.min(1, Number(reflections.intensity ?? 0.35)));
  for (const button of reflectionToggleButtons) {
    button.classList.toggle(
      'active', (button.dataset.reflectionEnabled === 'true') === enabled);
  }
  if (document.activeElement !== reflectionIntensity) {
    reflectionIntensity.value = String(Math.round(intensity * 100));
  }
  reflectionIntensityValue.textContent = `${Math.round(Number(reflectionIntensity.value))}%`;
  reflectionIntensity.disabled = !enabled;
  reflectionStatus.textContent = enabled ? '有効 / 7〜15ms' : '無効 / 比較用';
  reflectionStatus.classList.toggle('active', enabled);
}

function formatPassiveTestTime(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

function selectedPassiveTestSceneCount() {
  return PassiveTestConfig.normalizeSceneCount(passiveTestSceneCount.value);
}

function renderPassiveTestConfiguration() {
  const sceneCount = selectedPassiveTestSceneCount();
  passiveTestSceneCount.value = String(sceneCount);
  passiveTestPrompt.value = PassiveTestConfig.buildPrompt(sceneCount);
  passiveTestStartButton.textContent = `${sceneCount}場面で計測開始`;
  passiveTestHint.textContent = `先に${sceneCount}場面用プロンプトをChatGPT Voice Liveへ貼り付ける。返答開始後に計測し、12秒無音になった時点を通常の応答終了として記録する。`;
}

function renderPassiveTestState(test = {}, capturing = false) {
  const status = test.status || 'idle';
  const statusLabels = {
    idle: '待機中',
    'waiting-for-speech': '音声開始待ち',
    running: '計測中',
    completed: '計測終了',
    failed: '計測失敗',
    stopped: '停止'
  };
  const reasonLabels = {
    'response-ended': '12秒無音で応答終了を確定',
    'observation-limit': '観測上限30分まで継続',
    'duration-complete': '設定時間まで継続',
    'early-silence': '12秒以上の無音を検出',
    'no-speech': '音声が開始されなかった',
    'motion-stopped': '自動モーションが停止した',
    'user-stopped': 'ユーザーが停止',
    'capture-stopped': 'タブ音声取得が終了',
    restarted: '新しいテストで置換'
  };
  const reasonCode = PassiveTestConfig.reasonCode(test.reason);
  let resultLabel = reasonLabels[reasonCode];
  if (!resultLabel && reasonCode) resultLabel = reasonCode;
  if (!resultLabel && status === 'completed') {
    resultLabel = reasonLabels[test.completionMode === 'response-end'
      ? 'response-ended'
      : 'duration-complete'];
  }
  if (!resultLabel && status === 'failed') {
    const currentSilenceSeconds = Number(test.currentSilenceSeconds || 0);
    const silenceLimitSeconds = Number(test.silenceLimitSeconds || 12);
    resultLabel = currentSilenceSeconds >= silenceLimitSeconds
      ? reasonLabels[test.completionMode === 'response-end'
        ? 'response-ended'
        : 'early-silence']
      : (!test.detectedSpeech ? reasonLabels['no-speech'] : '途中終了（詳細不明）');
  }
  const active = Boolean(test.active);
  passiveTestStatus.textContent = statusLabels[status] || status;
  passiveTestStatus.classList.toggle('active', active || status === 'completed');
  passiveTestElapsed.textContent = formatPassiveTestTime(test.elapsedSeconds);
  passiveTestResponseDuration.textContent = formatPassiveTestTime(test.estimatedResponseSeconds);
  passiveTestSpeech.textContent = test.detectedSpeech
    ? `検出済み / 累計 ${formatPassiveTestTime(test.totalSpeechSeconds)}`
    : '未検出';
  passiveTestSilence.textContent = `${Number(test.currentSilenceSeconds || 0).toFixed(1)}秒`;
  passiveTestLongestSilence.textContent = `${Number(test.longestSilenceSeconds || 0).toFixed(1)}秒`;
  passiveTestResult.textContent = resultLabel || (active ? '計測中' : '—');
  passiveTestResult.classList.toggle('warning', status === 'failed');
  passiveTestStartButton.disabled = !capturing || active;
  passiveTestStopButton.disabled = !active;
  passiveTestSceneCount.disabled = active;
  passiveTestRegenerateButton.disabled = active;
}

function formatDistance(distanceMeters) {
  const distance = Number(distanceMeters);
  if (!Number.isFinite(distance)) return '—';
  return distance < 1 ? `${Math.round(distance * 100)}cm` : `${distance.toFixed(2)}m`;
}

function directionName(azimuth) {
  const angle = ((Number(azimuth) + 180) % 360 + 360) % 360 - 180;
  const absolute = Math.abs(angle);
  if (absolute <= 22.5) return '前';
  if (absolute <= 67.5) return angle < 0 ? '左前' : '右前';
  if (absolute <= 112.5) return angle < 0 ? '左' : '右';
  if (absolute <= 157.5) return angle < 0 ? '左後ろ' : '右後ろ';
  return '後ろ';
}

function distanceToVisualRadius(distance, minimum, reference) {
  const ratio = Math.max(0, Math.min(1, (distance - minimum) / (reference - minimum)));
  return Math.sqrt(ratio);
}

function renderSpatialMarker(azimuth, distance, minimum, reference) {
  const size = spatialMap.clientWidth || 260;
  const maximumRadius = size * 0.39;
  const visualRadius = distanceToVisualRadius(distance, minimum, reference) * maximumRadius;
  const radians = Number(azimuth) * Math.PI / 180;
  voiceSourceDot.style.left = `${size / 2 + Math.sin(radians) * visualRadius}px`;
  voiceSourceDot.style.top = `${size / 2 - Math.cos(radians) * visualRadius}px`;
}

function formatSpatialDistance(distance) {
  return `${formatDistance(distance)}${Number(distance) < 0.2 ? '（推定）' : ''}`;
}

function renderSpatialState(hrtf, capturing) {
  const azimuth = Number(hrtf.azimuth ?? 0);
  const distance = Number(hrtf.distanceMeters ?? 0.1);
  const minimum = Number(hrtf.minimumDistanceMeters ?? 0);
  const reference = Number(hrtf.referenceDistanceMeters ?? 2.06);
  if (spatialPointerId === null) {
    renderSpatialMarker(azimuth, distance, minimum, reference);
    spatialPosition.textContent = `${directionName(azimuth)} ${Math.round(azimuth)}° / ${formatSpatialDistance(distance)}`;
  }
  spatialMap.classList.toggle('disabled', !capturing);
  parallaxPosition.textContent = Number.isFinite(hrtf.leftEarAzimuth) && Number.isFinite(hrtf.rightEarAzimuth)
    ? `左耳 ${Math.round(hrtf.leftEarAzimuth)}° / 右耳 ${Math.round(hrtf.rightEarAzimuth)}°`
    : '—';
  nearFieldGains.textContent = Number.isFinite(hrtf.leftSpatialGain) && Number.isFinite(hrtf.rightSpatialGain)
    ? `左 ${hrtf.leftSpatialGain.toFixed(2)} / 右 ${hrtf.rightSpatialGain.toFixed(2)}`
    : '—';
}

function selectedMotionPattern() {
  return MOTION_PATTERNS[motionPattern.value] ? motionPattern.value : 'behind-sweep';
}

function renderMotionDescription() {
  motionDescription.textContent = MOTION_PATTERNS[selectedMotionPattern()].description;
}

function usesTransitionTiming(pattern = selectedMotionPattern()) {
  return pattern === 'behind-sweep' || pattern === 'ear-alternating'
    || pattern === 'left-pullback' || pattern === 'right-pullback';
}

function renderMotionTiming() {
  const pattern = selectedMotionPattern();
  const duration = Number(motionDuration.value);
  const maximumTransition = Math.min(5, Math.max(0.6, duration / 2 - 0.4));
  rearTransitionDuration.max = String(maximumTransition);
  if (Number(rearTransitionDuration.value) > maximumTransition) {
    rearTransitionDuration.value = String(maximumTransition);
  }
  const transition = Number(rearTransitionDuration.value);
  motionDurationValue.textContent = `1サイクル ${Math.round(duration)}秒`;
  rearTransitionDurationValue.textContent = `${transition.toFixed(1)}秒`;
  if (pattern === 'left-pullback' || pattern === 'right-pullback') {
    const farDwell = Math.min(1, Math.max(0.4, duration * 0.04));
    const nearDwell = Math.max(0.4, duration - transition * 2 - farDwell);
    const side = pattern === 'left-pullback' ? '左耳' : '右耳';
    motionTransitionLabel.textContent = '離れる・戻る片道時間';
    motionTimingSummary.textContent = `${side} 約${nearDwell.toFixed(1)}秒 → ${transition.toFixed(1)}秒で離れる → 遠く 約${farDwell.toFixed(1)}秒 → ${transition.toFixed(1)}秒で戻る`;
    return;
  }
  motionTransitionLabel.textContent = '後ろを通る片道時間';
  const dwell = Math.max(0.4, (duration - transition * 2) / 2);
  motionTimingSummary.textContent = `左側 約${dwell.toFixed(1)}秒 → 後ろを${transition.toFixed(1)}秒 → 右側 約${dwell.toFixed(1)}秒 → 後ろを${transition.toFixed(1)}秒`;
}

function updateMotionUiPolling(active) {
  if (!active) {
    clearTimeout(motionUiPollTimer);
    motionUiPollTimer = null;
    return;
  }
  if (motionUiPollTimer !== null) return;
  motionUiPollTimer = setTimeout(async () => {
    motionUiPollTimer = null;
    try {
      renderState(await sendToAudioEngine('get-state'));
    } catch (error) {
      showError(`モーション状態の確認: ${error.message}`);
    }
    if (latestState?.hrtf?.motion?.active) updateMotionUiPolling(true);
  }, 160);
}

function updateAudioDiagnosticsPolling(active) {
  if (!active) {
    clearTimeout(audioDiagnosticsPollTimer);
    audioDiagnosticsPollTimer = null;
    return;
  }
  if (audioDiagnosticsPollTimer !== null) return;
  audioDiagnosticsPollTimer = setTimeout(async () => {
    audioDiagnosticsPollTimer = null;
    try {
      renderState(await sendToAudioEngine('get-state'));
    } catch { /* The slower general status refresh reports persistent errors. */ }
    const motionActive = Boolean(latestState?.hrtf?.motion?.active);
    if (latestState?.capturing && !motionActive) updateAudioDiagnosticsPolling(true);
  }, 320);
}

function renderMotionState(hrtf, capturing) {
  const motion = hrtf.motion || {};
  const active = Boolean(motion.active);
  const activePattern = MOTION_PATTERNS[motion.pattern] ? motion.pattern : selectedMotionPattern();
  if (active) {
    motionPattern.value = activePattern;
    if (Number.isFinite(Number(motion.durationSeconds))) {
      motionDuration.value = String(motion.durationSeconds);
    }
    if (Number.isFinite(Number(motion.rearTransitionSeconds))) {
      rearTransitionDuration.value = String(motion.rearTransitionSeconds);
    }
  }
  const duration = Number(motionDuration.value);
  quickMotionPattern.value = activePattern;
  renderMotionTiming();
  renderMotionDescription();
  motionStatus.textContent = active
    ? `動作中 / ${MOTION_PATTERNS[activePattern].name}`
    : motion.lastError ? `停止 / ${motion.lastError}` : '停止中';
  motionStatus.classList.toggle('active', active);
  motionPattern.disabled = active || busyHrtf;
  quickMotionPattern.disabled = active || busyHrtf;
  motionDuration.disabled = active || busyHrtf;
  rearTransitionControl.hidden = !usesTransitionTiming(
    active ? activePattern : selectedMotionPattern());
  rearTransitionDuration.disabled = active || busyHrtf;
  motionStartButton.disabled = !capturing || active || busyHrtf;
  motionStopButton.disabled = !active || busyHrtf;
  quickMotionToggle.disabled = !capturing || busyHrtf;
  quickMotionToggle.textContent = active ? '動きを停止' : '動きを開始';
  quickMotionToggle.classList.toggle('active', active);
  spatialMap.classList.toggle('motion-active', active);
  updateMotionUiPolling(active);
}

async function initializeMotionControls() {
  const stored = await readLocalSettings(Object.values(MOTION_UI_STORAGE));
  const storedRevision = Number(stored[MOTION_UI_STORAGE.settingsRevision] ?? 0);
  const storedPattern = stored[MOTION_UI_STORAGE.pattern];
  if (MOTION_PATTERNS[storedPattern]) motionPattern.value = storedPattern;
  const storedDuration = Number(stored[MOTION_UI_STORAGE.durationSeconds]);
  if (Number.isFinite(storedDuration)) {
    motionDuration.value = String(Math.max(8, Math.min(90, storedDuration)));
  }
  const storedRearTransition = Number(stored[MOTION_UI_STORAGE.rearTransitionSeconds]);
  if (storedRevision < 2
      && (!Number.isFinite(storedRearTransition)
        || Math.abs(storedRearTransition - 1.8) < 0.001)) {
    rearTransitionDuration.value = '3';
  } else if (Number.isFinite(storedRearTransition)) {
    rearTransitionDuration.value = String(Math.max(0.6, Math.min(5, storedRearTransition)));
  }
  renderMotionTiming();
  rearTransitionControl.hidden = !usesTransitionTiming();
  renderMotionDescription();
  quickMotionPattern.value = selectedMotionPattern();
  await writeLocalSettings({
    [MOTION_UI_STORAGE.rearTransitionSeconds]: Number(rearTransitionDuration.value),
    [MOTION_UI_STORAGE.settingsRevision]: 2
  });
}

function renderState(state) {
  const requestSequence = Number(state?.[AUDIO_ENGINE_REQUEST_SEQUENCE]);
  if (Number.isFinite(requestSequence)
      && requestSequence < lastRenderedAudioEngineRequestSequence) return;
  if (Number.isFinite(requestSequence)) {
    lastRenderedAudioEngineRequestSequence = requestSequence;
  }
  latestState = state;
  const capturing = Boolean(state?.capturing);
  const muted = Boolean(state?.muted);
  productStatusCard.classList.toggle('connected', capturing);
  productConnectionStatus.textContent = capturing
    ? `接続中 / ${state?.mode === 'hrtf' ? '実測HRTF' : '比較モード'}`
    : 'ChatGPTへ未接続';
  productConnectionHint.textContent = capturing
    ? state?.mode === 'hrtf'
      ? 'ChatGPT Voice Liveの音声を実測HRTFでASMR処理しています。'
      : '開発者向けの左右振り比較で処理しています。上の声の位置を選ぶと実測HRTFへ戻ります。'
    : 'ChatGPTのタブを開き、拡張機能アイコンを押すと音声処理を開始します。';
  productMuteButton.disabled = !capturing;
  productStopButton.disabled = !capturing;
  productMuteButton.textContent = muted ? 'ミュート解除' : 'ミュート';
  productMuteButton.classList.toggle('active-mute', muted);
  engineStatus.textContent = capturing ? `処理中 / ${state.mode === 'hrtf' ? '実測HRTF' : '左右振り'}` : '停止中';
  engineStatus.classList.toggle('ok', capturing);
  stopButton.disabled = !capturing;
  muteButton.disabled = !capturing;
  muteButton.textContent = muted ? '加工後の音をミュート解除' : '加工後の音だけミュート';
  muteButton.classList.toggle('active-mute', muted);
  contextRate.textContent = state?.sampleRate ? `${state.sampleRate} Hz` : '—';

  for (const button of engineButtons) {
    button.disabled = !capturing || busyHrtf;
    button.classList.toggle('active', button.dataset.mode === state?.mode);
  }

  const pan = Number(state?.pan ?? 0);
  for (const button of positionButtons) {
    button.disabled = !capturing;
    button.classList.toggle('active', Number(button.dataset.pan) === pan);
  }
  gainLeft.textContent = Number(state?.outputLeftGain ?? 0).toFixed(3);
  gainRight.textContent = Number(state?.outputRightGain ?? 0).toFixed(3);
  if (state?.texture) renderTextureState(state.texture);
  if (state?.vibration) renderVibrationState(state.vibration);
  if (state?.ambience || pendingAmbienceMode) {
    renderAmbienceState(state?.ambience || null, capturing);
  }
  if (state?.earlyReflections) renderReflectionState(state.earlyReflections);
  renderPassiveTestState(state?.passiveTest || {}, capturing);

  const track = state?.trackInfo;
  if (track) {
    const parts = [track.readyState];
    if (track.channelCount) parts.push(`${track.channelCount}ch`);
    if (track.sampleRate) parts.push(`${track.sampleRate}Hz`);
    trackStatus.textContent = parts.join(' / ');
  } else trackStatus.textContent = '—';

  const hrtf = state?.hrtf || {};
  const datasetId = HRTF_DATASET_DESCRIPTIONS[hrtf.datasetId]
    ? hrtf.datasetId
    : 'aalto-nearfield';
  if (document.activeElement !== hrtfDatasetSelect) hrtfDatasetSelect.value = datasetId;
  hrtfDatasetDescription.textContent = HRTF_DATASET_DESCRIPTIONS[hrtfDatasetSelect.value];
  hrtfDatasetSelect.disabled = busyHrtf;
  hrtfStatus.textContent = hrtf.loading
    ? '読込中…'
    : hrtf.error
      ? 'エラー'
      : hrtf.ready ? `${hrtf.datasetLabel || 'HRTF'} 読込済み` : '未読込';
  hrtfStatus.classList.toggle('ok', Boolean(hrtf.ready));
  hrtfCount.textContent = hrtf.positionCount ? String(hrtf.positionCount) : '—';
  hrtfRate.textContent = hrtf.sourceSampleRate ? `${hrtf.sourceSampleRate} Hz` : '—';
  hrtfMatch.textContent = formatMatchedPosition(hrtf.matchedPosition);
  const diagnostics = hrtf.diagnostics || {};
  hrtfInputLevel.textContent = formatAudioLevel(diagnostics.input);
  hrtfOutputLevel.textContent = formatAudioLevel(diagnostics.hrtfOutput);
  const limiterReduction = Number(diagnostics.limiterReductionDb);
  hrtfLimiterReduction.textContent = Number.isFinite(limiterReduction)
    ? `${limiterReduction.toFixed(1)} dB`
    : '—';
  hrtfLimiterReduction.classList.toggle(
    'warning', Number.isFinite(limiterReduction) && limiterReduction <= -6);
  const outputGain = Number(hrtf.outputGain);
  if (Number.isFinite(outputGain)) {
    if (outputGain < 10) lastSafeOutputGain = outputGain;
    if (document.activeElement !== hrtfOutputGainSlider) hrtfOutputGainSlider.value = String(outputGain);
    if (document.activeElement !== quickOutputGain) quickOutputGain.value = String(outputGain);
    hrtfOutputGain.textContent = formatHrtfOutputGain(
      document.activeElement === hrtfOutputGainSlider ? hrtfOutputGainSlider.value : outputGain);
    quickOutputGainValue.textContent = `${Number(
      document.activeElement === quickOutputGain ? quickOutputGain.value : outputGain).toFixed(1)}倍`;
  } else hrtfOutputGain.textContent = '—';

  const azimuth = Number(hrtf.azimuth ?? 0);
  const distance = Number(hrtf.distanceMeters ?? 0.1);
  for (const button of quickPositionButtons) {
    button.disabled = !capturing || busyHrtf;
    const buttonAzimuth = Number(button.dataset.azimuth);
    const difference = Math.abs((((azimuth - buttonAzimuth) + 540) % 360) - 180);
    button.classList.toggle('active', difference < 1);
  }
  quickDistance.disabled = !capturing || busyHrtf;
  if (document.activeElement !== quickDistance) {
    const choices = [...quickDistance.options].map((option) => Number(option.value));
    quickDistance.value = String(choices.reduce((nearest, choice) => (
      Math.abs(choice - distance) < Math.abs(nearest - distance) ? choice : nearest
    ), choices[0]));
  }
  renderSpatialState(hrtf, capturing);
  renderMotionState(hrtf, capturing);
  updateAudioDiagnosticsPolling(capturing && !hrtf.motion?.active);
  for (const button of hrtfPositionButtons) {
    button.disabled = !capturing || busyHrtf;
    button.classList.toggle('active', Number(button.dataset.azimuth) === azimuth);
  }
}

async function sendToAudioEngine(type, extra = {}) {
  const requestSequence = ++nextAudioEngineRequestSequence;
  const response = await chrome.runtime.sendMessage({ target: 'offscreen', type, ...extra });
  if (!response?.ok) throw new Error(response?.error || '音声処理エンジンから応答がありません。');
  if (response.state && typeof response.state === 'object') {
    Object.defineProperty(response.state, AUDIO_ENGINE_REQUEST_SEQUENCE, {
      value: requestSequence,
      enumerable: false
    });
  }
  return response.state;
}

async function toggleProcessedAudioMute() {
  showError();
  const before = await sendToAudioEngine('get-state');
  renderState(await sendToAudioEngine('set-muted', { value: !before.muted }));
}

function readableTab(tab) {
  if (!tab) return '—';
  const title = String(tab.title || '').trim();
  const host = String(tab.host || '').trim();
  if (title && host) return `${title}（${host}）`;
  return title || host || `タブ ${tab.id}`;
}

function renderProductContext(product) {
  const state = product?.state || {};
  const capturing = Boolean(state.capturing);
  const phase = String(product?.phase || (capturing ? 'active' : 'idle'));
  productCaptureTarget.textContent = capturing
    ? `対象タブ: ${readableTab(product.tab)}`
    : product?.lastAttemptTab && phase === 'error'
      ? `接続失敗: ${readableTab(product.lastAttemptTab)}`
      : '対象タブ: —';
  productReconnectButton.textContent = capturing ? '別のタブへ接続する方法' : '接続方法を確認';
  productAudioReadiness.textContent = capturing ? '音声処理中' : '音声未接続';
  productAudioReadiness.classList.toggle('ready', capturing);

  if (phase === 'starting') {
    productConnectionStatus.textContent = '接続処理中…';
    productConnectionHint.textContent = '対象タブの音声取得とHRTFの準備をしています。';
  } else if (capturing) {
    productConnectionHint.textContent = '選択したタブ音声を端末内で実測HRTF処理しています。';
  }

  const captureState = product?.capture?.status || (capturing ? 'active' : '未報告');
  captureStatus.textContent = captureState === 'active'
    ? '取得中'
    : captureState === 'stopped' ? '停止' : captureState;
  captureStatus.classList.toggle('ok', captureState === 'active');
  if (product?.lastError) showError(product.lastError);
}

async function refreshCaptureStatus(state) {
  try {
    const response = await chrome.runtime.sendMessage({ target: 'background', type: 'get-capture-info', tabId: state?.tabId });
    if (!response?.ok) throw new Error(response?.error || 'タブ音声取得の状態を確認できません。');
    const status = response.capture?.status || '未報告';
    captureStatus.textContent = status === 'active' ? '取得中' : status === 'stopped' ? '停止' : status;
    captureStatus.classList.toggle('ok', status === 'active');
  } catch (error) {
    captureStatus.textContent = '不明';
    showError(error.message);
  }
}

async function refresh() {
  try {
    const response = await chrome.runtime.sendMessage({
      target: 'background', type: 'get-product-state'
    });
    if (!response?.ok || !response.product?.state) {
      throw new Error(response?.error || '製品状態を確認できません。');
    }
    latestProductState = response.product;
    renderState(response.product.state);
    renderProductContext(response.product);
  } catch (error) {
    renderState({ capturing: false, mode: 'hrtf', pan: 0, hrtf: {} });
    captureStatus.textContent = '未報告';
    if (error?.message) showError(error.message);
  }
}

async function chooseHrtfPosition(azimuth, distanceMeters) {
  pendingSpatialPosition = {
    azimuth: Number(azimuth),
    distanceMeters: Number(distanceMeters ?? latestState?.hrtf?.distanceMeters ?? 0.1)
  };
  if (spatialUpdateRunning) return;
  spatialUpdateRunning = true;
  busyHrtf = true;
  showError();
  try {
    while (pendingSpatialPosition) {
      const next = pendingSpatialPosition;
      pendingSpatialPosition = null;
      let state = await sendToAudioEngine('set-spatial-position', {
        azimuth: next.azimuth,
        elevation: 0,
        distanceMeters: next.distanceMeters
      });
      state = await sendToAudioEngine('set-mode', { value: 'hrtf' });
      renderState(state);
    }
  } catch (error) {
    showError(`バイノーラル処理: ${error.message}`);
  } finally {
    spatialUpdateRunning = false;
    busyHrtf = false;
    refresh().catch(() => {});
  }
}

function showReconnectInstructions() {
  showError('ChatGPT Voice Liveのタブを前面にして、ブラウザ右上のLive ASMR Studioアイコンをクリックしてください。');
}

restartButton.addEventListener('click', showReconnectInstructions);
productReconnectButton.addEventListener('click', showReconnectInstructions);

reloadExtensionButton.addEventListener('click', () => {
  reloadExtensionButton.disabled = true;
  reloadExtensionButton.textContent = '再読み込み中…';
  chrome.runtime.reload();
});

async function stopProductCapture() {
  showError();
  try {
    const response = await chrome.runtime.sendMessage({
      target: 'background', type: 'stop-capture'
    });
    if (!response?.ok) throw new Error(response?.error || '音声処理を停止できません。');
    renderState(response.state);
    captureStatus.textContent = '未報告';
    await refresh();
  } catch (error) { showError(error.message); }
}

stopButton.addEventListener('click', stopProductCapture);
productStopButton.addEventListener('click', stopProductCapture);

muteButton.addEventListener('click', async () => {
  try { await toggleProcessedAudioMute(); }
  catch (error) { showError(error.message); }
});

productMuteButton.addEventListener('click', async () => {
  try { await toggleProcessedAudioMute(); }
  catch (error) { showError(error.message); }
});

for (const button of engineButtons) {
  button.addEventListener('click', async () => {
    showError();
    busyHrtf = button.dataset.mode === 'hrtf';
    try {
      renderState(await sendToAudioEngine('set-mode', { value: button.dataset.mode }));
    } catch (error) {
      showError(`音声処理の切替: ${error.message}`);
    } finally {
      busyHrtf = false;
      refresh().catch(() => {});
    }
  });
}

for (const button of hrtfPositionButtons) {
  button.addEventListener('click', () => chooseHrtfPosition(
    Number(button.dataset.azimuth), latestState?.hrtf?.distanceMeters));
}

function spatialPositionFromPointer(event) {
  const rect = spatialMap.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  const maximumRadius = size * 0.39;
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top + rect.height / 2);
  const pointerRadius = Math.hypot(dx, dy);
  const visualRadius = Math.max(0, Math.min(1, pointerRadius / maximumRadius));
  const currentAzimuth = Number(latestState?.hrtf?.azimuth ?? 0);
  const azimuth = pointerRadius < 2 ? currentAzimuth : Math.atan2(dx, -dy) * 180 / Math.PI;
  const minimum = Number(latestState?.hrtf?.minimumDistanceMeters ?? 0);
  const reference = Number(latestState?.hrtf?.referenceDistanceMeters ?? 2.06);
  const distanceRatio = visualRadius;
  const distanceMeters = minimum + distanceRatio * distanceRatio * (reference - minimum);
  return { azimuth, distanceMeters, minimum, reference };
}

function updateSpatialFromPointer(event, commit = false) {
  if (!latestState?.capturing) return;
  event.preventDefault();
  const next = spatialPositionFromPointer(event);
  renderSpatialMarker(next.azimuth, next.distanceMeters, next.minimum, next.reference);
  spatialPosition.textContent = `${directionName(next.azimuth)} ${Math.round(next.azimuth)}° / ${formatSpatialDistance(next.distanceMeters)}`;
  clearTimeout(spatialUpdateTimer);
  if (commit) chooseHrtfPosition(next.azimuth, next.distanceMeters);
  else spatialUpdateTimer = setTimeout(
    () => chooseHrtfPosition(next.azimuth, next.distanceMeters), 70);
}

spatialMap.addEventListener('pointerdown', (event) => {
  if (!latestState?.capturing) return;
  spatialPointerId = event.pointerId;
  spatialMap.setPointerCapture(event.pointerId);
  spatialMap.classList.add('dragging');
  updateSpatialFromPointer(event);
});

spatialMap.addEventListener('pointermove', (event) => {
  if (event.pointerId !== spatialPointerId) return;
  updateSpatialFromPointer(event);
});

function finishSpatialDrag(event) {
  if (event.pointerId !== spatialPointerId) return;
  clearTimeout(spatialUpdateTimer);
  updateSpatialFromPointer(event, true);
  spatialPointerId = null;
  spatialMap.classList.remove('dragging');
  try { spatialMap.releasePointerCapture(event.pointerId); } catch { /* already released */ }
}

spatialMap.addEventListener('pointerup', finishSpatialDrag);
spatialMap.addEventListener('pointercancel', (event) => {
  if (event.pointerId !== spatialPointerId) return;
  clearTimeout(spatialUpdateTimer);
  spatialPointerId = null;
  spatialMap.classList.remove('dragging');
  try { spatialMap.releasePointerCapture(event.pointerId); } catch { /* already released */ }
  if (latestState?.hrtf) renderSpatialState(latestState.hrtf, Boolean(latestState.capturing));
});

spatialMap.addEventListener('keydown', (event) => {
  if (!latestState?.capturing || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  let azimuth = Number(latestState.hrtf?.azimuth ?? 0);
  let distance = Number(latestState.hrtf?.distanceMeters ?? 0.1);
  if (event.key === 'ArrowLeft') azimuth -= 5;
  if (event.key === 'ArrowRight') azimuth += 5;
  if (event.key === 'ArrowUp') distance -= 0.05;
  if (event.key === 'ArrowDown') distance += 0.05;
  if (azimuth < -180) azimuth += 360;
  if (azimuth > 180) azimuth -= 360;
  chooseHrtfPosition(azimuth, distance);
});

for (const button of texturePresetButtons) {
  button.addEventListener('click', async () => {
    showError();
    try {
      renderState(await sendToAudioEngine('set-texture-preset', {
        value: button.dataset.texturePreset
      }));
    } catch (error) {
      showError(`声の質感切替: ${error.message}`);
    }
  });
}

for (const control of textureComponentControls) {
  control.input.addEventListener('input', () => {
    const value = Number(control.input.value) / 100;
    control.value.textContent = `${Math.round(Number(control.input.value))}%`;
    clearTimeout(textureComponentTimers.get(control.component));
    textureComponentTimers.set(control.component, setTimeout(async () => {
      showError();
      try {
        renderState(await sendToAudioEngine('set-texture-component', {
          component: control.component,
          value
        }));
      } catch (error) {
        showError(`声の質感調整: ${error.message}`);
      }
    }, 70));
  });
}

for (const button of deEsserToggleButtons) {
  button.addEventListener('click', async () => {
    showError();
    try {
      renderState(await sendToAudioEngine('set-deesser-enabled', {
        value: button.dataset.deesserEnabled === 'true'
      }));
    } catch (error) {
      showError(`歯擦音抑制の切替: ${error.message}`);
    }
  });
}

deEsserIntensity.addEventListener('input', () => {
  const value = Number(deEsserIntensity.value) / 100;
  deEsserIntensityValue.textContent = `${Math.round(Number(deEsserIntensity.value))}%`;
  clearTimeout(deEsserIntensityTimer);
  deEsserIntensityTimer = setTimeout(async () => {
    showError();
    try {
      renderState(await sendToAudioEngine('set-deesser-intensity', { value }));
    } catch (error) {
      showError(`歯擦音抑制の強度: ${error.message}`);
    }
  }, 70);
});

for (const button of vibrationToggleButtons) {
  button.addEventListener('click', async () => {
    showError();
    try {
      renderState(await sendToAudioEngine('set-vibration-enabled', {
        value: button.dataset.vibrationEnabled === 'true'
      }));
    } catch (error) {
      showError(`低域圧・振動の切替: ${error.message}`);
    }
  });
}

vibrationIntensity.addEventListener('input', () => {
  const value = Number(vibrationIntensity.value) / 100;
  vibrationIntensityValue.textContent = `${Math.round(Number(vibrationIntensity.value))}%`;
  clearTimeout(vibrationIntensityTimer);
  vibrationIntensityTimer = setTimeout(async () => {
    showError();
    try {
      renderState(await sendToAudioEngine('set-vibration-intensity', { value }));
    } catch (error) {
      showError(`低域圧・振動の強度: ${error.message}`);
    }
  }, 70);
});

ambienceMode.addEventListener('change', async () => {
  showError();
  const selectedMode = ambienceMode.value;
  const displayedLevelDb = Number(ambienceLevel.value);
  const requestId = ++ambienceModeRequestId;
  clearTimeout(ambienceLevelTimer);
  ambienceLevelTimer = null;
  pendingAmbienceMode = selectedMode;
  renderAmbienceState({
    ...(latestState?.ambience || {}),
    mode: selectedMode,
    levelDb: displayedLevelDb
  }, Boolean(latestState?.capturing));
  try {
    const state = await sendToAudioEngine('set-ambience-settings', {
      mode: selectedMode,
      levelDb: displayedLevelDb
    });
    if (requestId !== ambienceModeRequestId) return;
    if (state?.ambience?.mode !== selectedMode) {
      throw new Error(`選択値 ${selectedMode} が音声エンジンへ反映されませんでした。`);
    }
    pendingAmbienceMode = null;
    renderAmbienceState(state.ambience, Boolean(state.capturing));
    renderState(state);
  } catch (error) {
    if (requestId === ambienceModeRequestId) {
      pendingAmbienceMode = null;
      ambienceMode.value = selectedMode;
      ambienceMode.disabled = false;
      ambienceModeStatus.textContent = `切替失敗: ${ambienceModeLabel(selectedMode)}`;
      ambienceModeStatus.classList.remove('active');
    }
    showError(`環境音の切替: ${error.message}`);
  }
});

ambienceLevel.addEventListener('input', () => {
  const value = Number(ambienceLevel.value);
  ambienceLevelValue.textContent = `${Math.round(value)} dB`;
  clearTimeout(ambienceLevelTimer);
  ambienceLevelTimer = setTimeout(async () => {
    showError();
    try {
      renderState(await sendToAudioEngine('set-ambience-level', { value }));
    } catch (error) {
      showError(`環境音量の調整: ${error.message}`);
    }
  }, 70);
});

ambiencePreviewButton.addEventListener('click', async () => {
  showError();
  ambiencePreviewButton.disabled = true;
  ambiencePreviewButton.textContent = '環境音を確認中…';
  try {
    renderState(await sendToAudioEngine('preview-ambience'));
    setTimeout(() => refresh().catch(() => {}), 2100);
  } catch (error) {
    showError(`環境音の確認: ${error.message}`);
    if (latestState) renderState(latestState);
  }
});

for (const button of reflectionToggleButtons) {
  button.addEventListener('click', async () => {
    showError();
    try {
      renderState(await sendToAudioEngine('set-early-reflections-enabled', {
        value: button.dataset.reflectionEnabled === 'true'
      }));
    } catch (error) {
      showError(`短い部屋反射の切替: ${error.message}`);
    }
  });
}

reflectionIntensity.addEventListener('input', () => {
  const value = Number(reflectionIntensity.value) / 100;
  reflectionIntensityValue.textContent = `${Math.round(Number(reflectionIntensity.value))}%`;
  clearTimeout(reflectionIntensityTimer);
  reflectionIntensityTimer = setTimeout(async () => {
    showError();
    try {
      renderState(await sendToAudioEngine('set-early-reflections-intensity', { value }));
    } catch (error) {
      showError(`短い部屋反射の強度: ${error.message}`);
    }
  }, 70);
});

hrtfOutputGainSlider.addEventListener('input', () => {
  const value = Number(hrtfOutputGainSlider.value);
  scheduleOutputGain(value);
});

hrtfDatasetSelect.addEventListener('change', async () => {
  busyHrtf = true;
  showError();
  hrtfDatasetDescription.textContent = HRTF_DATASET_DESCRIPTIONS[hrtfDatasetSelect.value];
  if (latestState) renderState(latestState);
  try {
    renderState(await sendToAudioEngine('set-hrtf-dataset', {
      value: hrtfDatasetSelect.value
    }));
  } catch (error) {
    showError(`HRTF測定データの切替: ${error.message}`);
  } finally {
    busyHrtf = false;
    if (latestState) renderState(latestState);
  }
});

motionPattern.addEventListener('change', async () => {
  renderMotionDescription();
  rearTransitionControl.hidden = !usesTransitionTiming();
  renderMotionTiming();
  try {
    await writeLocalSettings({
      [MOTION_UI_STORAGE.pattern]: selectedMotionPattern()
    });
  } catch (error) {
    showError(`モーションパターンの保存: ${error.message}`);
  }
});

motionDuration.addEventListener('input', () => {
  renderMotionTiming();
  clearTimeout(motionDurationSaveTimer);
  motionDurationSaveTimer = setTimeout(async () => {
    try {
      await writeLocalSettings({
        [MOTION_UI_STORAGE.durationSeconds]: Number(motionDuration.value)
      });
    } catch (error) {
      showError(`モーション速度の保存: ${error.message}`);
    }
  }, 180);
});

rearTransitionDuration.addEventListener('input', () => {
  renderMotionTiming();
  clearTimeout(rearTransitionSaveTimer);
  rearTransitionSaveTimer = setTimeout(async () => {
    try {
      await writeLocalSettings({
        [MOTION_UI_STORAGE.rearTransitionSeconds]: Number(rearTransitionDuration.value)
      });
    } catch (error) {
      showError(`後ろを通る時間の保存: ${error.message}`);
    }
  }, 180);
});

motionStartButton.addEventListener('click', async () => {
  busyHrtf = true;
  showError();
  if (latestState) renderState(latestState);
  try {
    const state = await sendToAudioEngine('start-hrtf-motion', {
      pattern: selectedMotionPattern(),
      durationSeconds: Number(motionDuration.value),
      rearTransitionSeconds: Number(rearTransitionDuration.value)
    });
    renderState(state);
  } catch (error) {
    showError(`モーション開始: ${error.message}`);
  } finally {
    busyHrtf = false;
    if (latestState) renderState(latestState);
  }
});

motionStopButton.addEventListener('click', async () => {
  busyHrtf = true;
  showError();
  if (latestState) renderState(latestState);
  try {
    renderState(await sendToAudioEngine('stop-hrtf-motion'));
  } catch (error) {
    showError(`モーション停止: ${error.message}`);
  } finally {
    busyHrtf = false;
    if (latestState) renderState(latestState);
  }
});

advancedSettingsToggle.addEventListener('click', () => {
  const expanded = advancedSettingsToggle.getAttribute('aria-expanded') !== 'true';
  setSectionGroupExpanded(
    advancedSettingsToggle, advancedProductSections, expanded, '詳細設定');
});

developerLabToggle.addEventListener('click', () => {
  const expanded = developerLabToggle.getAttribute('aria-expanded') !== 'true';
  setSectionGroupExpanded(developerLabToggle, developerLabSections, expanded, '開発者ラボ');
});

quickOutputGain.addEventListener('input', () => {
  scheduleOutputGain(Number(quickOutputGain.value));
});

for (const button of quickPositionButtons) {
  button.addEventListener('click', () => chooseHrtfPosition(
    Number(button.dataset.azimuth), Number(quickDistance.value)));
}

quickDistance.addEventListener('change', () => {
  chooseHrtfPosition(
    Number(latestState?.hrtf?.azimuth ?? 0), Number(quickDistance.value));
});

quickMotionPattern.addEventListener('change', () => {
  motionPattern.value = quickMotionPattern.value;
  motionPattern.dispatchEvent(new Event('change'));
});

quickMotionToggle.addEventListener('click', () => {
  const active = Boolean(latestState?.hrtf?.motion?.active);
  (active ? motionStopButton : motionStartButton).click();
});

quickAmbienceMode.addEventListener('change', () => {
  ambienceMode.value = quickAmbienceMode.value;
  ambienceMode.dispatchEvent(new Event('change'));
});

quickAmbienceLevel.addEventListener('input', () => {
  quickAmbienceLevelValue.textContent = `${Math.round(Number(quickAmbienceLevel.value))} dB`;
  ambienceLevel.value = quickAmbienceLevel.value;
  ambienceLevel.dispatchEvent(new Event('input'));
});

quickChannelCheck.addEventListener('click', async () => {
  showError();
  quickChannelCheck.disabled = true;
  const originalLabel = quickChannelCheck.textContent;
  try {
    quickChannelCheck.textContent = '左を確認中…';
    await sendToAudioEngine('test-channel', { side: 'left' });
    await delay(650);
    quickChannelCheck.textContent = '右を確認中…';
    await sendToAudioEngine('test-channel', { side: 'right' });
    await delay(550);
  } catch (error) {
    showError(`左右確認: ${error.message}`);
  } finally {
    quickChannelCheck.textContent = originalLabel;
    quickChannelCheck.disabled = false;
  }
});

sessionMode.addEventListener('change', () => {
  const defaults = SessionPromptConfig.modeDefaults(selectedSessionMode());
  populateSessionTemplates(defaults.template);
  sessionLength.value = defaults.length;
  renderSessionPrompt();
  scheduleSessionSettingsSave();
  showSessionPromptStatus('モードに合う初期テンプレートへ切り替えました。');
});

sessionTemplate.addEventListener('change', () => {
  renderSessionPrompt();
  scheduleSessionSettingsSave();
});

sessionVoiceStyle.addEventListener('change', async () => {
  const presetId = VOICE_PROMPT_PRESETS[sessionVoiceStyle.value]
    ? sessionVoiceStyle.value
    : 'deep-whisper';
  renderVoicePromptEditor(presetId);
  renderSessionPrompt();
  showSessionPromptStatus('発話スタイルをセッションへ反映しました。');
  try {
    await writeLocalSettings({ [VOICE_PROMPT_STORAGE.selectedPreset]: presetId });
  } catch (error) {
    showSessionPromptStatus(`発話スタイルの保存に失敗: ${error.message}`, true);
  }
});

sessionLength.addEventListener('change', () => {
  renderSessionPrompt();
  scheduleSessionSettingsSave();
});

for (const control of [sessionCustomInstructions, sessionAvoid, sessionSourceContent]) {
  control.addEventListener('input', () => {
    renderSessionPrompt();
    scheduleSessionSettingsSave();
  });
}

async function copyCurrentSessionPrompt() {
  if (sessionCopyPrimaryButton.disabled || !sessionPrompt.value.trim()) return;
  sessionCopyPrimaryButton.disabled = true;
  try {
    await copyText(sessionPrompt.value, sessionPrompt);
    lastCopiedSessionPrompt = sessionPrompt.value;
    renderSessionPrompt();
    showSessionPromptStatus('コピーしました。次はChatGPT Voice Liveへ貼り付けてください。');
  } catch (error) {
    showSessionPromptStatus(`コピーに失敗: ${error.message}`, true);
  } finally {
    renderSessionPrompt();
  }
}

sessionCopyPrimaryButton.addEventListener('click', copyCurrentSessionPrompt);

voicePromptPreset.addEventListener('change', async () => {
  const presetId = selectedVoicePromptPreset();
  renderVoicePromptEditor(presetId);
  renderSessionPrompt();
  showVoicePromptStatus();
  try {
    await writeLocalSettings({ [VOICE_PROMPT_STORAGE.selectedPreset]: presetId });
  } catch (error) {
    showVoicePromptStatus(`選択の保存に失敗: ${error.message}`, true);
  }
});

voicePromptText.addEventListener('input', () => {
  const presetId = selectedVoicePromptPreset();
  voicePromptDrafts[presetId] = voicePromptText.value;
  renderVoicePromptEditor(presetId, true);
  renderSessionPrompt();
  showVoicePromptStatus('編集内容を保存中…');
  clearTimeout(voicePromptSaveTimer);
  voicePromptSaveTimer = setTimeout(async () => {
    try {
      await writeLocalSettings({ [VOICE_PROMPT_STORAGE.drafts]: storedVoiceDrafts() });
      showVoicePromptStatus('編集内容をこの端末に保存しました。');
    } catch (error) {
      showVoicePromptStatus(`編集内容の保存に失敗: ${error.message}`, true);
    }
  }, 220);
});

resetVoicePromptButton.addEventListener('click', async () => {
  const presetId = selectedVoicePromptPreset();
  delete voicePromptDrafts[presetId];
  renderVoicePromptEditor(presetId);
  renderSessionPrompt();
  try {
    await writeLocalSettings({ [VOICE_PROMPT_STORAGE.drafts]: storedVoiceDrafts() });
    showVoicePromptStatus('元のプリセットへ戻しました。');
  } catch (error) {
    showVoicePromptStatus(`初期化の保存に失敗: ${error.message}`, true);
  }
});

copyVoicePromptButton.addEventListener('click', async () => {
  const text = voicePromptText.value.trim();
  if (!text) return;
  const previousLabel = copyVoicePromptButton.textContent;
  copyVoicePromptButton.disabled = true;
  try {
    await copyVoicePrompt(text);
    copyVoicePromptButton.textContent = 'コピー済み';
    showVoicePromptStatus('ChatGPT Voice Liveの会話へ貼り付けてください。');
  } catch (error) {
    showVoicePromptStatus(`コピーに失敗: ${error.message}`, true);
  } finally {
    setTimeout(() => {
      copyVoicePromptButton.textContent = previousLabel;
      copyVoicePromptButton.disabled = !voicePromptText.value.trim();
    }, 1400);
  }
});

passiveTestSceneCount.addEventListener('change', () => {
  renderPassiveTestConfiguration();
  passiveTestCopyStatus.textContent = '';
  passiveTestCopyStatus.classList.remove('error');
});

passiveTestRegenerateButton.addEventListener('click', () => {
  renderPassiveTestConfiguration();
  passiveTestCopyStatus.textContent = `${selectedPassiveTestSceneCount()}場面を再抽選しました。`;
  passiveTestCopyStatus.classList.remove('error');
});

passiveTestCopyButton.addEventListener('click', async () => {
  passiveTestCopyButton.disabled = true;
  try {
    const sceneCount = selectedPassiveTestSceneCount();
    await copyText(passiveTestPrompt.value, passiveTestPrompt);
    passiveTestCopyButton.textContent = 'コピー済み';
    passiveTestCopyStatus.textContent = `${sceneCount}場面用。ChatGPT Voice Liveへ貼り付け、返答開始後に計測を開始してください。`;
    passiveTestCopyStatus.classList.remove('error');
  } catch (error) {
    passiveTestCopyStatus.textContent = `コピーに失敗: ${error.message}`;
    passiveTestCopyStatus.classList.add('error');
  } finally {
    setTimeout(() => {
      passiveTestCopyButton.textContent = 'プロンプトをコピー';
      passiveTestCopyButton.disabled = false;
    }, 1400);
  }
});

passiveTestStartButton.addEventListener('click', async () => {
  showError();
  passiveTestStartButton.disabled = true;
  const sceneCount = selectedPassiveTestSceneCount();
  try {
    renderState(await sendToAudioEngine('start-passive-test', {
      durationSeconds: 30 * 60,
      completionMode: 'response-end',
      sceneCount
    }));
  } catch (error) {
    showError(`${sceneCount}場面テストの開始: ${error.message}`);
    if (latestState) renderState(latestState);
  }
});

passiveTestStopButton.addEventListener('click', async () => {
  showError();
  passiveTestStopButton.disabled = true;
  try {
    renderState(await sendToAudioEngine('stop-passive-test'));
  } catch (error) {
    showError(`場面量テストの停止: ${error.message}`);
    if (latestState) renderState(latestState);
  }
});

for (const button of positionButtons) {
  button.addEventListener('click', async () => {
    showError();
    try {
      let state = await sendToAudioEngine('set-pan', { value: Number(button.dataset.pan) });
      state = await sendToAudioEngine('set-mode', { value: 'pan' });
      renderState(state);
    } catch (error) { showError(error.message); }
  });
}

for (const [button, side] of [[testLeftButton, 'left'], [testRightButton, 'right']]) {
  button.addEventListener('click', async () => {
    showError();
    button.disabled = true;
    try { await sendToAudioEngine('test-channel', { side }); }
    catch (error) { showError(error.message); }
    finally { setTimeout(() => { button.disabled = false; }, 550); }
  });
}

highGainCancelButton.addEventListener('click', () => resolveHighGainDecision(false));
highGainConfirmButton.addEventListener('click', () => resolveHighGainDecision(true));
highGainDialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  resolveHighGainDecision(false);
});

settingsExportButton.addEventListener('click', async () => {
  showSettingsStatus();
  try {
    await exportProductSettings();
    showSettingsStatus('設定を書き出しました。持ち込み文章を含む場合はファイルの扱いに注意してください。');
  } catch (error) {
    showSettingsStatus(`書き出しに失敗: ${error.message}`, true);
  }
});

settingsImportButton.addEventListener('click', () => settingsImportFile.click());
settingsImportFile.addEventListener('change', async () => {
  showSettingsStatus();
  try {
    await importProductSettings(settingsImportFile.files?.[0]);
    showSettingsStatus('設定を読み込みました。反映のため再読み込みします。');
    setTimeout(() => chrome.runtime.reload(), 700);
  } catch (error) {
    showSettingsStatus(`読み込みに失敗: ${error.message}`, true);
  } finally {
    settingsImportFile.value = '';
  }
});

settingsResetButton.addEventListener('click', async () => {
  const confirmed = globalThis.confirm('音響設定、セッション設定、編集したプロンプトを初期値へ戻しますか？');
  if (!confirmed) return;
  showSettingsStatus();
  try {
    await resetProductSettings();
    showSettingsStatus('初期値へ戻しました。再読み込みします。');
    setTimeout(() => chrome.runtime.reload(), 700);
  } catch (error) {
    showSettingsStatus(`初期化に失敗: ${error.message}`, true);
  }
});

async function initializePromptControls() {
  try {
    await initializeVoicePromptControls();
  } catch (error) {
    renderVoicePromptEditor('deep-whisper');
    showVoicePromptStatus(`プロンプト設定の読込に失敗: ${error.message}`, true);
  }
  try {
    await initializeSessionPromptControls();
  } catch (error) {
    sessionMode.value = 'relax';
    populateSessionTemplates('co-sleep');
    sessionLength.value = 'medium';
    renderSessionPrompt();
    showSessionPromptStatus(`セッション設定の読込に失敗: ${error.message}`, true);
  }
}

async function initializeApplication() {
  await (globalThis.UiI18n?.ready || Promise.resolve('en'));
  renderPassiveTestConfiguration();
  setSectionGroupExpanded(advancedSettingsToggle, advancedProductSections, false, '詳細設定');
  setSectionGroupExpanded(developerLabToggle, developerLabSections, false, '開発者ラボ');
  await initializePromptControls();
  initializeProductPreferences().catch((error) => {
    showError(`製品設定の読込: ${error.message}`);
  });
  initializeMotionControls().catch((error) => {
    renderMotionDescription();
    showError(`モーション設定の読込: ${error.message}`);
  });
  refresh();
  setInterval(refresh, 1500);
}

initializeApplication();
window.addEventListener('resize', () => {
  if (latestState?.hrtf) renderSpatialState(latestState.hrtf, Boolean(latestState.capturing));
});
