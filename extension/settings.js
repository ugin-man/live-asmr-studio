// Explicit backup schema. Unknown keys and consent flags are never imported.
globalThis.ProductSettings = (() => {
  const number = (min, max) => (value) => typeof value === 'number'
    && Number.isFinite(value) && value >= min && value <= max;
  const boolean = (value) => typeof value === 'boolean';
  const text = (value) => typeof value === 'string';
  const choice = (...values) => (value) => values.includes(value);
  const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const presetIds = ['soft-spoken', 'natural-whisper', 'deep-whisper', 'sleep-relaxation', 'custom'];
  const drafts = (value) => record(value) && Object.entries(value)
    .every(([key, draft]) => presetIds.includes(key) && text(draft));
  const localizedDrafts = (value) => record(value) && Object.entries(value)
    .every(([locale, entries]) => ['en', 'ja', 'zh-CN', 'ko', 'es'].includes(locale) && drafts(entries));
  const revision = (value) => Number.isInteger(value) && value >= 0 && value <= 100;
  const fields = {
    hrtfOutputGain: number(0.5, 15),
    hrtfAzimuth: number(-180, 180),
    hrtfDistanceMeters: number(0, 2.06),
    hrtfDatasetId: choice('aalto-nearfield'),
    hrtfSettingsRevision: revision,
    hrtfMotionEnabled: boolean,
    hrtfMotionPattern: choice('behind-sweep', 'front-sweep', 'slow-orbit', 'ear-alternating',
      'random-drift', 'left-pullback', 'right-pullback'),
    hrtfMotionDurationSeconds: number(8, 90),
    hrtfRearTransitionSeconds: number(0.6, 5),
    hrtfMotionUiRevision: revision,
    texturePresetId: choice('raw', 'density', 'body', 'near-ear', 'balanced-asmr', 'recommended', 'custom'),
    textureIntensity: number(0, 1),
    textureDensity: number(0, 1),
    textureBody: number(0, 1),
    textureNearEar: number(0, 1),
    textureSettingsRevision: revision,
    vibrationEnabled: boolean,
    vibrationIntensity: number(0, 1),
    deEsserEnabled: boolean,
    deEsserIntensity: number(0, 1),
    earlyReflectionsEnabled: boolean,
    earlyReflectionsIntensity: number(0, 1),
    ambienceMode: choice('off', 'quiet-room', 'air-conditioner', 'night-room', 'distant-rain'),
    ambienceLevelDb: number(-48, -12),
    ambienceSettingsRevision: revision,
    voicePromptSelectedPreset: choice(...presetIds),
    voicePromptDrafts: drafts,
    voicePromptDraftsByLocaleV1: localizedDrafts,
    voicePromptSettingsRevision: revision,
    sessionPromptMode: choice('conversation', 'relax', 'focus', 'roleplay', 'onomatopoeia', 'brought-content'),
    sessionPromptTemplate: text,
    sessionPromptLength: choice('short', 'medium', 'long'),
    sessionPromptCustomInstructions: text,
    sessionPromptAvoid: text,
    sessionPromptSourceContent: text
  };
  function pick(values) {
    return Object.fromEntries(Object.entries(values || {})
      .filter(([key]) => Object.hasOwn(fields, key)));
  }
  function validate(values) {
    if (!record(values)) throw new Error('Live ASMR Studioの設定ファイルではありません。');
    const settings = pick(values);
    if (Object.entries(settings).some(([key, value]) => !fields[key](value))) {
      throw new Error('Live ASMR Studioの設定ファイルではありません。');
    }
    return settings;
  }
  return Object.freeze({ pick, validate });
})();
