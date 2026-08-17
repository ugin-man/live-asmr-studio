const AALTO_NEARFIELD_HRTF_URL = 'assets/NF_LIB_HRTF_LFE.compact.json';
const DEFAULT_HRTF_DATASET_ID = 'aalto-nearfield';
const HRTF_DATASET_DEFINITIONS = Object.freeze({
  'aalto-nearfield': {
    label: 'Aalto近距離実測（20cm）',
    url: AALTO_NEARFIELD_HRTF_URL,
    sourceUrl: 'https://zenodo.org/records/7316545',
    distanceAware: true,
    measuredDistancesMeters: [0.2, 0.3, 0.4, 0.5]
  }
});
const DEFAULT_HRTF_OUTPUT_GAIN = 1;
const MIN_HRTF_OUTPUT_GAIN = 0.5;
const MAX_HRTF_OUTPUT_GAIN = 15;
const DEFAULT_SOURCE_DISTANCE_METERS = 0.1;
const MIN_SOURCE_DISTANCE_METERS = 0;
const HRTF_REFERENCE_DISTANCE_METERS = 2.06;
const HALF_INTERAURAL_DISTANCE_METERS = 0.0875;
const MIN_EAR_DISTANCE_METERS = 0.01;
const HRTF_SETTINGS_REVISION = 7;
const HRTF_MOTION_UPDATE_MS = 120;
const MIN_HRTF_MOTION_DURATION_SECONDS = 8;
const MAX_HRTF_MOTION_DURATION_SECONDS = 90;
const DEFAULT_HRTF_MOTION_DURATION_SECONDS = 24;
const MIN_HRTF_REAR_TRANSITION_SECONDS = 0.6;
const MAX_HRTF_REAR_TRANSITION_SECONDS = 5;
const DEFAULT_HRTF_REAR_TRANSITION_SECONDS = 3;
const ASMR_SIDE_AZIMUTH_DEGREES = 110;
const PASSIVE_TEST_DEFAULT_DURATION_SECONDS = 1800;
const PASSIVE_TEST_MAX_DURATION_SECONDS = 3600;
const PASSIVE_TEST_DEFAULT_SILENCE_LIMIT_SECONDS = 12;
const PASSIVE_TEST_DEFAULT_START_TIMEOUT_SECONDS = 30;
const PASSIVE_TEST_DEFAULT_SAMPLE_INTERVAL_MS = 250;
const PASSIVE_TEST_SPEECH_THRESHOLD_DB = -50;
const MIN_HRTF_MOTION_DISTANCE_METERS = 0.08;
const MAX_HRTF_MOTION_DISTANCE_METERS = 0.5;
const HRTF_MOTION_PATTERNS = new Set([
  'behind-sweep', 'front-sweep', 'slow-orbit', 'ear-alternating',
  'left-pullback', 'right-pullback', 'random-drift'
]);
const DEFAULT_TEXTURE_PRESET_ID = 'recommended';
const DEFAULT_TEXTURE_DENSITY = 0;
const DEFAULT_TEXTURE_BODY = 0.7;
const DEFAULT_TEXTURE_NEAR_EAR = 0.7;
const TEXTURE_SETTINGS_REVISION = 3;
const TEXTURE_COMPRESSOR_LOOKAHEAD_SECONDS = 0.006;
const DEFAULT_VIBRATION_ENABLED = true;
const DEFAULT_VIBRATION_INTENSITY = 0.8;
const MAX_VIBRATION_BAND_GAIN = 0.65;
const MAX_VIBRATION_OUTPUT_TRIM_DB = -0.8;
const DEFAULT_DEESSER_ENABLED = true;
const DEFAULT_DEESSER_INTENSITY = 0.5;
const MAX_DEESSER_CUT_DB = -3;
const DEFAULT_EARLY_REFLECTIONS_ENABLED = true;
const DEFAULT_EARLY_REFLECTIONS_INTENSITY = 0.35;
const MAX_EARLY_REFLECTIONS_GAIN = 0.1;
const AMBIENCE_MODES = new Set(['off', 'quiet-room', 'air-conditioner', 'night-room', 'distant-rain']);
const DEFAULT_AMBIENCE_MODE = 'off';
const DEFAULT_AMBIENCE_LEVEL_DB = -34;
const MIN_AMBIENCE_LEVEL_DB = -48;
const MAX_AMBIENCE_LEVEL_DB = -12;
const AMBIENCE_PREVIEW_LEVEL_DB = -12;
const AMBIENCE_SETTINGS_REVISION = 3;
const TEXTURE_PRESET_DEFINITIONS = Object.freeze({
  raw: { label: '原音（基準）', density: 0, body: 0, nearEar: 0 },
  density: { label: '密度', density: 1, body: 0, nearEar: 0 },
  body: { label: '厚み', density: 0, body: 1, nearEar: 0 },
  'near-ear': { label: '耳元', density: 0, body: 0, nearEar: 1 },
  'balanced-asmr': { label: 'バランスASMR', density: 0.35, body: 0.55, nearEar: 0.55 },
  recommended: { label: '推奨 70/70', density: 0, body: 0.7, nearEar: 0.7 }
});

let stream = null;
let audioContext = null;
let sourceNode = null;
let monoNode = null;
let masterGain = null;
let inputAnalyser = null;
let hrtfOutputAnalyser = null;

// Voice-texture path. The dry and processed branches are mixed before either
// spatial renderer, so the selected timbre does not alter the HRTF geometry.
let textureDryGain = null;
let textureDryDelay = null;
let textureHighpass = null;
let textureBodyFilter = null;
let texturePresenceFilter = null;
let textureAirFilter = null;
let textureCompressor = null;
let textureWetGain = null;
let textureOutputGain = null;
let deEsserFilter = null;
let textureOutputAnalyser = null;
let texturePresetId = DEFAULT_TEXTURE_PRESET_ID;
let textureDensity = DEFAULT_TEXTURE_DENSITY;
let textureBody = DEFAULT_TEXTURE_BODY;
let textureNearEar = DEFAULT_TEXTURE_NEAR_EAR;
let deEsserEnabled = DEFAULT_DEESSER_ENABLED;
let deEsserIntensity = DEFAULT_DEESSER_INTENSITY;
let textureSettingsLoaded = false;
let textureSettingsLoadPromise = null;

// HRTF-only, voice-synchronised low-band pressure. This does not generate a
// fixed bass tone: it adds only the 45-180 Hz content already in the voice.
let vibrationDryDelay = null;
let vibrationHighpass = null;
let vibrationLowpass = null;
let vibrationCompressor = null;
let vibrationBandGain = null;
let vibrationBandAnalyser = null;
let vibrationMixer = null;
let vibrationOutputTrim = null;
let vibrationEnabled = DEFAULT_VIBRATION_ENABLED;
let vibrationIntensity = DEFAULT_VIBRATION_INTENSITY;

// Short, low-level HRTF reflections. The generated stereo impulse has only
// several taps between 7 and 15 ms, so it adds room air without a long tail.
let earlyReflectionConvolver = null;
let earlyReflectionGain = null;
let hrtfPreLimiterMixer = null;
let earlyReflectionsEnabled = DEFAULT_EARLY_REFLECTIONS_ENABLED;
let earlyReflectionsIntensity = DEFAULT_EARLY_REFLECTIONS_INTENSITY;

// Procedural diffuse ambience is mixed after both spatial modes and never
// follows the moving voice source.
let ambienceSource = null;
let ambienceHighpass = null;
let ambienceLowpass = null;
let ambienceGain = null;
let ambienceAnalyser = null;
let ambienceMode = DEFAULT_AMBIENCE_MODE;
let ambienceLevelDb = DEFAULT_AMBIENCE_LEVEL_DB;
let ambienceSettingsLoaded = false;
let ambienceSettingsLoadPromise = null;
let ambiencePreviewTimer = null;
let ambienceBufferCache = new Map();

// Diagnostic / fallback pan path.
let panLeftGain = null;
let panRightGain = null;
let panMerger = null;
let panModeGain = null;
let currentPan = 0;

// True HRTF path. Two convolvers are cross-faded so changing direction does
// not hard-switch an impulse response in the middle of speech.
let hrtfConvolverA = null;
let hrtfConvolverB = null;
let hrtfGainA = null;
let hrtfGainB = null;
let hrtfModeGain = null;
let hrtfSplitter = null;
let hrtfLeftSpatialGain = null;
let hrtfRightSpatialGain = null;
let hrtfMerger = null;
let hrtfProximityGain = null;
let hrtfOutputGainNode = null;
let hrtfLimiter = null;
let activeHrtfSlot = 'A';
let hrtfDataset = null;
let hrtfDatasetId = DEFAULT_HRTF_DATASET_ID;
let hrtfLoadPromise = null;
let hrtfLoadGeneration = 0;
let hrtfBufferCache = new Map();
let hrtfLoading = false;
let hrtfError = null;
let hrtfMatchedPosition = null;
let hrtfMatchedIndex = null;
let hrtfFilterLength = null;
let currentAzimuth = -ASMR_SIDE_AZIMUTH_DEGREES;  // user convention: - = left, + = right
let currentElevation = 0;
let currentDistanceMeters = DEFAULT_SOURCE_DISTANCE_METERS;
let hrtfOutputGain = DEFAULT_HRTF_OUTPUT_GAIN;
let hrtfSettingsLoaded = false;
let hrtfSettingsLoadPromise = null;
let hrtfPositionRequestId = 0;
let hrtfMotionGeneration = 0;
let hrtfMotionTimer = null;
let hrtfMotion = createStoppedHrtfMotion();
let passiveTestGeneration = 0;
let passiveTestTimer = null;
let passiveTest = createIdlePassiveTest();

let processingMode = 'hrtf';
let outputMuted = false;
let capturedTabId = null;
let trackInfo = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function normalizeAzimuth(value) {
  const normalized = ((Number(value) + 180) % 360 + 360) % 360 - 180;
  return normalized === -180 && Number(value) > 0 ? 180 : normalized;
}

function shortestAzimuthDelta(from, to) {
  return normalizeAzimuth(Number(to) - Number(from));
}

function cosineEase(value) {
  const t = clamp(value, 0, 1);
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

function createStoppedHrtfMotion() {
  return {
    active: false,
    pattern: 'behind-sweep',
    durationSeconds: DEFAULT_HRTF_MOTION_DURATION_SECONDS,
    rearTransitionSeconds: DEFAULT_HRTF_REAR_TRANSITION_SECONDS,
    startedAtMs: null,
    entryDurationMs: 0,
    entryFrom: null,
    entryTo: null,
    baseDistanceMeters: DEFAULT_SOURCE_DISTANCE_METERS,
    randomSegmentStartedAtMs: null,
    randomSegmentDurationMs: 0,
    randomFrom: null,
    randomTo: null,
    lastError: null
  };
}

function createIdlePassiveTest() {
  return {
    status: 'idle',
    reason: null,
    active: false,
    detectedSpeech: false,
    ownsMotion: false,
    completionMode: 'duration',
    sceneCount: null,
    startedAtMs: null,
    finishedAtMs: null,
    lastSampleAtMs: null,
    lastSpeechAtMs: null,
    totalSpeechMs: 0,
    longestSilenceMs: 0,
    currentSilenceMs: 0,
    durationMs: PASSIVE_TEST_DEFAULT_DURATION_SECONDS * 1000,
    silenceLimitMs: PASSIVE_TEST_DEFAULT_SILENCE_LIMIT_SECONDS * 1000,
    startTimeoutMs: PASSIVE_TEST_DEFAULT_START_TIMEOUT_SECONDS * 1000,
    sampleIntervalMs: PASSIVE_TEST_DEFAULT_SAMPLE_INTERVAL_MS,
    speechThresholdDb: PASSIVE_TEST_SPEECH_THRESHOLD_DB,
    latestInputRmsDb: null
  };
}

function currentHrtfDatasetDefinition() {
  return HRTF_DATASET_DEFINITIONS[hrtfDatasetId]
    || HRTF_DATASET_DEFINITIONS[DEFAULT_HRTF_DATASET_ID];
}

function currentTexturePresetDefinition() {
  return TEXTURE_PRESET_DEFINITIONS[texturePresetId]
    || { label: 'カスタム' };
}

function decibelsToLinear(value) {
  return 10 ** (Number(value) / 20);
}

function currentTextureTargets() {
  const density = clamp(textureDensity, 0, 1);
  const body = clamp(textureBody, 0, 1);
  const nearEar = clamp(textureNearEar, 0, 1);
  const wetMix = 1 - ((1 - 0.42 * density) * (1 - 0.62 * body) * (1 - 0.55 * nearEar));
  return {
    dryMix: 1 - wetMix,
    wetMix,
    bodyDb: 0.6 * density + 3 * body + 0.8 * nearEar,
    presenceDb: 0.8 * density + 2.2 * nearEar,
    airDb: 0.4 * density - 0.2 * body + 1.6 * nearEar,
    compressorThresholdDb: -24 - Math.max(6 * density, 2 * body, 5 * nearEar),
    compressorKneeDb: Math.max(18 * density, 12 * body, 16 * nearEar),
    compressorRatio: 1 + Math.max(2 * density, 0.6 * body, 1.2 * nearEar),
    compressorAttackSeconds: clamp(0.018 - 0.006 * density - 0.01 * nearEar, 0.008, 0.018),
    compressorReleaseSeconds: clamp(0.16 + 0.02 * density + 0.04 * body - 0.02 * nearEar, 0.12, 0.22),
    outputTrimDb: -0.3 * density - 0.6 * body - 0.5 * nearEar
  };
}

function currentDeEsserCutDb() {
  return deEsserEnabled ? MAX_DEESSER_CUT_DB * clamp(deEsserIntensity, 0, 1) : 0;
}

function currentVibrationTargets() {
  const intensity = clamp(vibrationIntensity, 0, 1);
  return {
    bandGain: vibrationEnabled ? MAX_VIBRATION_BAND_GAIN * intensity : 0,
    outputTrimDb: vibrationEnabled ? MAX_VIBRATION_OUTPUT_TRIM_DB * intensity : 0
  };
}

function decibelsForLinear(value) {
  return value > 0 ? 20 * Math.log10(value) : -100;
}

function analyserLevels(analyser) {
  if (!analyser) return { peakDb: null, rmsDb: null };
  const samples = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(samples);
  let peak = 0;
  let squareSum = 0;
  for (const sample of samples) {
    const magnitude = Math.abs(sample);
    if (magnitude > peak) peak = magnitude;
    squareSum += sample * sample;
  }
  return {
    peakDb: decibelsForLinear(peak),
    rmsDb: decibelsForLinear(Math.sqrt(squareSum / samples.length))
  };
}

function currentAudioDiagnostics() {
  const textureActive = textureDensity > 0 || textureBody > 0 || textureNearEar > 0;
  return {
    input: analyserLevels(inputAnalyser),
    textureOutput: analyserLevels(textureOutputAnalyser),
    textureCompressionReductionDb: !textureActive
      ? 0
      : Number.isFinite(Number(textureCompressor?.reduction))
        ? Number(textureCompressor.reduction)
        : null,
    vibrationBandOutput: analyserLevels(vibrationBandAnalyser),
    vibrationCompressionReductionDb: vibrationEnabled
      ? Number.isFinite(Number(vibrationCompressor?.reduction))
        ? Number(vibrationCompressor.reduction)
        : null
      : 0,
    hrtfOutput: analyserLevels(hrtfOutputAnalyser),
    ambienceOutput: analyserLevels(ambienceAnalyser),
    limiterReductionDb: Number.isFinite(Number(hrtfLimiter?.reduction))
      ? Number(hrtfLimiter.reduction)
      : null
  };
}

function publicTextureState(diagnostics = currentAudioDiagnostics()) {
  const preset = currentTexturePresetDefinition();
  const targets = currentTextureTargets();
  return {
    presetId: texturePresetId,
    presetLabel: preset.label,
    components: {
      density: textureDensity,
      body: textureBody,
      nearEar: textureNearEar
    },
    active: textureDensity > 0 || textureBody > 0 || textureNearEar > 0,
    applied: {
      dryMix: targets.dryMix,
      wetMix: targets.wetMix,
      bodyDb: targets.bodyDb,
      presenceDb: targets.presenceDb,
      airDb: targets.airDb,
      compressorRatio: targets.compressorRatio,
      outputTrimDb: targets.outputTrimDb
    },
    deEsser: {
      enabled: deEsserEnabled,
      intensity: deEsserIntensity,
      cutDb: currentDeEsserCutDb(),
      frequencyHz: 6500
    },
    diagnostics: {
      output: diagnostics.textureOutput,
      compressionReductionDb: diagnostics.textureCompressionReductionDb
    }
  };
}

function publicEarlyReflectionsState() {
  return {
    enabled: earlyReflectionsEnabled,
    intensity: earlyReflectionsIntensity,
    active: earlyReflectionsEnabled && earlyReflectionsIntensity > 0,
    tapMilliseconds: [7, 11, 15],
    wetGain: earlyReflectionsEnabled
      ? MAX_EARLY_REFLECTIONS_GAIN * clamp(earlyReflectionsIntensity, 0, 1)
      : 0
  };
}

function publicAmbienceState(diagnostics = currentAudioDiagnostics()) {
  return {
    mode: ambienceMode,
    levelDb: ambienceLevelDb,
    active: ambienceMode !== 'off',
    previewing: Boolean(ambiencePreviewTimer),
    procedural: true,
    diagnostics: { output: diagnostics.ambienceOutput }
  };
}

function publicVibrationState(diagnostics = currentAudioDiagnostics()) {
  const targets = currentVibrationTargets();
  return {
    enabled: vibrationEnabled,
    intensity: vibrationIntensity,
    active: vibrationEnabled && vibrationIntensity > 0,
    frequencyRangeHz: [45, 180],
    applied: {
      bandGain: targets.bandGain,
      outputTrimDb: targets.outputTrimDb
    },
    diagnostics: {
      bandOutput: diagnostics.vibrationBandOutput,
      compressionReductionDb: diagnostics.vibrationCompressionReductionDb
    }
  };
}

function publicHrtfMotionState() {
  return {
    active: hrtfMotion.active,
    pattern: hrtfMotion.pattern,
    durationSeconds: hrtfMotion.durationSeconds,
    rearTransitionSeconds: hrtfMotion.rearTransitionSeconds,
    baseDistanceMeters: hrtfMotion.baseDistanceMeters,
    elapsedSeconds: hrtfMotion.active && Number.isFinite(hrtfMotion.startedAtMs)
      ? Math.max(0, (performance.now() - hrtfMotion.startedAtMs) / 1000)
      : 0,
    lastError: hrtfMotion.lastError
  };
}

function publicPassiveTestState() {
  const endAtMs = passiveTest.finishedAtMs
    ?? (passiveTest.active ? performance.now() : passiveTest.startedAtMs);
  const elapsedMs = passiveTest.startedAtMs === null || endAtMs === null
    ? 0
    : Math.max(0, endAtMs - passiveTest.startedAtMs);
  const estimatedResponseMs = passiveTest.startedAtMs === null
      || passiveTest.lastSpeechAtMs === null
    ? 0
    : Math.max(0, passiveTest.lastSpeechAtMs - passiveTest.startedAtMs);
  return {
    status: passiveTest.status,
    reason: passiveTest.reason,
    active: passiveTest.active,
    detectedSpeech: passiveTest.detectedSpeech,
    completionMode: passiveTest.completionMode,
    sceneCount: passiveTest.sceneCount,
    elapsedSeconds: elapsedMs / 1000,
    estimatedResponseSeconds: estimatedResponseMs / 1000,
    remainingSeconds: Math.max(0, passiveTest.durationMs - elapsedMs) / 1000,
    durationSeconds: passiveTest.durationMs / 1000,
    totalSpeechSeconds: passiveTest.totalSpeechMs / 1000,
    currentSilenceSeconds: passiveTest.currentSilenceMs / 1000,
    longestSilenceSeconds: passiveTest.longestSilenceMs / 1000,
    startTimeoutSeconds: passiveTest.startTimeoutMs / 1000,
    silenceLimitSeconds: passiveTest.silenceLimitMs / 1000,
    speechThresholdDb: passiveTest.speechThresholdDb,
    latestInputRmsDb: passiveTest.latestInputRmsDb
  };
}

function outputGainsForPan(pan) {
  const clamped = clamp(pan, -1, 1);
  const angle = ((clamped + 1) * Math.PI) / 4;
  return { left: Math.cos(angle), right: Math.sin(angle) };
}

function state() {
  const gains = outputGainsForPan(currentPan);
  const spatial = spatialRenderingGeometry(currentAzimuth, currentDistanceMeters);
  const datasetDefinition = currentHrtfDatasetDefinition();
  const diagnostics = currentAudioDiagnostics();
  return {
    capturing: Boolean(stream && audioContext && audioContext.state !== 'closed'),
    mode: processingMode,
    pan: currentPan,
    muted: outputMuted,
    tabId: capturedTabId,
    audioState: audioContext?.state ?? 'closed',
    sampleRate: audioContext?.sampleRate ?? null,
    outputLeftGain: gains.left,
    outputRightGain: gains.right,
    trackInfo,
    texture: publicTextureState(diagnostics),
    vibration: publicVibrationState(diagnostics),
    earlyReflections: publicEarlyReflectionsState(),
    ambience: publicAmbienceState(diagnostics),
    passiveTest: publicPassiveTestState(),
    hrtf: {
      ready: Boolean(hrtfDataset),
      loading: hrtfLoading,
      error: hrtfError,
      datasetId: hrtfDatasetId,
      datasetLabel: datasetDefinition.label,
      datasetName: hrtfDataset?.name ?? null,
      sourceUrl: hrtfDataset?.sourceUrl ?? datasetDefinition.sourceUrl,
      distanceAware: hrtfDataset?.distanceAware ?? datasetDefinition.distanceAware,
      measuredDistancesMeters: hrtfDataset?.measuredDistancesMeters
        ?? datasetDefinition.measuredDistancesMeters,
      sourceSampleRate: hrtfDataset?.sampleRate ?? null,
      positionCount: hrtfDataset?.positions?.length ?? null,
      azimuth: currentAzimuth,
      elevation: currentElevation,
      distanceMeters: currentDistanceMeters,
      minimumDistanceMeters: MIN_SOURCE_DISTANCE_METERS,
      referenceDistanceMeters: HRTF_REFERENCE_DISTANCE_METERS,
      leftEarAzimuth: spatial.leftEarAzimuth,
      rightEarAzimuth: spatial.rightEarAzimuth,
      leftEarDistanceMeters: spatial.leftEarDistance,
      rightEarDistanceMeters: spatial.rightEarDistance,
      leftSpatialGain: spatial.leftGain,
      rightSpatialGain: spatial.rightGain,
      proximityGain: spatial.proximityGain,
      matchedPosition: hrtfMatchedPosition,
      matchedIndex: hrtfMatchedIndex,
      filterLength: hrtfFilterLength,
      outputGain: hrtfOutputGain,
      outputGainDb: 20 * Math.log10(hrtfOutputGain),
      diagnostics,
      motion: publicHrtfMotionState()
    }
  };
}

function disconnectNode(node) {
  try { node?.disconnect(); } catch { /* already disconnected */ }
}

async function stopCapture() {
  if (passiveTest.active) markPassiveTestEnded('stopped', 'capture-stopped');
  else clearPassiveTestTimer();
  await stopHrtfMotion(false);
  if (ambiencePreviewTimer) {
    clearTimeout(ambiencePreviewTimer);
    ambiencePreviewTimer = null;
  }
  if (ambienceSource) {
    try { ambienceSource.stop(); } catch { /* already stopped */ }
  }
  if (stream) {
    for (const track of stream.getTracks()) {
      track.onended = null;
      track.stop();
    }
  }

  [sourceNode, monoNode, inputAnalyser,
   textureDryGain, textureDryDelay, textureHighpass, textureBodyFilter, texturePresenceFilter,
   textureAirFilter, textureCompressor, textureWetGain, textureOutputGain,
   deEsserFilter, textureOutputAnalyser,
   vibrationDryDelay, vibrationHighpass, vibrationLowpass, vibrationCompressor,
   vibrationBandGain, vibrationBandAnalyser, vibrationMixer, vibrationOutputTrim,
   earlyReflectionConvolver, earlyReflectionGain, hrtfPreLimiterMixer,
   ambienceSource, ambienceHighpass, ambienceLowpass, ambienceGain, ambienceAnalyser,
   panLeftGain, panRightGain, panMerger, panModeGain,
   hrtfConvolverA, hrtfConvolverB, hrtfGainA, hrtfGainB, hrtfModeGain,
   hrtfSplitter, hrtfLeftSpatialGain, hrtfRightSpatialGain, hrtfMerger,
   hrtfProximityGain, hrtfOutputGainNode, hrtfLimiter, hrtfOutputAnalyser,
   masterGain].forEach(disconnectNode);

  if (audioContext && audioContext.state !== 'closed') await audioContext.close();

  stream = null;
  audioContext = null;
  sourceNode = null;
  monoNode = null;
  masterGain = null;
  inputAnalyser = null;
  hrtfOutputAnalyser = null;
  textureDryGain = null;
  textureDryDelay = null;
  textureHighpass = null;
  textureBodyFilter = null;
  texturePresenceFilter = null;
  textureAirFilter = null;
  textureCompressor = null;
  textureWetGain = null;
  textureOutputGain = null;
  deEsserFilter = null;
  textureOutputAnalyser = null;
  vibrationDryDelay = null;
  vibrationHighpass = null;
  vibrationLowpass = null;
  vibrationCompressor = null;
  vibrationBandGain = null;
  vibrationBandAnalyser = null;
  vibrationMixer = null;
  vibrationOutputTrim = null;
  earlyReflectionConvolver = null;
  earlyReflectionGain = null;
  hrtfPreLimiterMixer = null;
  ambienceSource = null;
  ambienceHighpass = null;
  ambienceLowpass = null;
  ambienceGain = null;
  ambienceAnalyser = null;
  ambienceBufferCache = new Map();
  panLeftGain = null;
  panRightGain = null;
  panMerger = null;
  panModeGain = null;
  hrtfConvolverA = null;
  hrtfConvolverB = null;
  hrtfGainA = null;
  hrtfGainB = null;
  hrtfModeGain = null;
  hrtfSplitter = null;
  hrtfLeftSpatialGain = null;
  hrtfRightSpatialGain = null;
  hrtfMerger = null;
  hrtfProximityGain = null;
  hrtfOutputGainNode = null;
  hrtfLimiter = null;
  activeHrtfSlot = 'A';
  hrtfBufferCache = new Map();
  hrtfMatchedPosition = null;
  hrtfMatchedIndex = null;
  hrtfFilterLength = null;
  capturedTabId = null;
  trackInfo = null;
  outputMuted = false;
}

function applyPan(immediate = false) {
  if (!audioContext || !panLeftGain || !panRightGain) return;
  const { left, right } = outputGainsForPan(currentPan);
  const now = audioContext.currentTime;
  for (const [node, target] of [[panLeftGain, left], [panRightGain, right]]) {
    node.gain.cancelScheduledValues(now);
    if (immediate) node.gain.setValueAtTime(target, now);
    else {
      node.gain.setValueAtTime(node.gain.value, now);
      node.gain.linearRampToValueAtTime(target, now + 0.025);
    }
  }
}

function applyMode(immediate = false) {
  if (!audioContext || !panModeGain || !hrtfModeGain) return;
  const now = audioContext.currentTime;
  const duration = immediate ? 0 : 0.035;
  const panTarget = processingMode === 'pan' ? 1 : 0;
  const hrtfTarget = processingMode === 'hrtf' ? 1 : 0;
  for (const [node, target] of [[panModeGain, panTarget], [hrtfModeGain, hrtfTarget]]) {
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(node.gain.value, now);
    if (duration === 0) node.gain.setValueAtTime(target, now);
    else node.gain.linearRampToValueAtTime(target, now + duration);
  }
}

function applyAudioParam(param, target, immediate = false, duration = 0.045) {
  if (!audioContext || !param) return;
  const now = audioContext.currentTime;
  param.cancelScheduledValues(now);
  if (immediate) {
    param.setValueAtTime(target, now);
    return;
  }
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(target, now + duration);
}

function applyTexture(immediate = false) {
  if (!audioContext || !textureDryGain || !textureWetGain || !textureOutputGain) return;
  const targets = currentTextureTargets();
  applyAudioParam(textureDryGain.gain, targets.dryMix, immediate);
  applyAudioParam(textureWetGain.gain, targets.wetMix, immediate);
  applyAudioParam(textureBodyFilter?.gain, targets.bodyDb, immediate);
  applyAudioParam(texturePresenceFilter?.gain, targets.presenceDb, immediate);
  applyAudioParam(textureAirFilter?.gain, targets.airDb, immediate);
  applyAudioParam(textureCompressor?.threshold, targets.compressorThresholdDb, immediate);
  applyAudioParam(textureCompressor?.knee, targets.compressorKneeDb, immediate);
  applyAudioParam(textureCompressor?.ratio, targets.compressorRatio, immediate);
  applyAudioParam(textureCompressor?.attack, targets.compressorAttackSeconds, immediate);
  applyAudioParam(textureCompressor?.release, targets.compressorReleaseSeconds, immediate);
  applyAudioParam(textureOutputGain.gain, decibelsToLinear(targets.outputTrimDb), immediate);
  applyAudioParam(deEsserFilter?.gain, currentDeEsserCutDb(), immediate);
}

function applyVibration(immediate = false) {
  if (!audioContext || !vibrationBandGain || !vibrationOutputTrim) return;
  const targets = currentVibrationTargets();
  applyAudioParam(vibrationBandGain.gain, targets.bandGain, immediate);
  applyAudioParam(
    vibrationOutputTrim.gain, decibelsToLinear(targets.outputTrimDb), immediate);
}

function applyEarlyReflections(immediate = false) {
  if (!audioContext || !earlyReflectionGain) return;
  const target = earlyReflectionsEnabled
    ? MAX_EARLY_REFLECTIONS_GAIN * clamp(earlyReflectionsIntensity, 0, 1)
    : 0;
  applyAudioParam(earlyReflectionGain.gain, target, immediate);
}

function createEarlyReflectionBuffer() {
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(2, Math.ceil(sampleRate * 0.018), sampleRate);
  const taps = [
    [[7, 1], [13, 0.38]],
    [[9, 0.92], [15, 0.34]]
  ];
  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (const [milliseconds, amplitude] of taps[channel]) {
      data[Math.round(sampleRate * milliseconds / 1000)] = amplitude;
    }
  }
  return buffer;
}

function ambienceFilterSettings(mode = ambienceMode) {
  if (mode === 'air-conditioner') return { highpassHz: 35, lowpassHz: 1600 };
  if (mode === 'night-room') return { highpassHz: 45, lowpassHz: 900 };
  if (mode === 'distant-rain') return { highpassHz: 180, lowpassHz: 8000 };
  return { highpassHz: 90, lowpassHz: 6000 };
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function createAmbienceBuffer(mode) {
  const cached = ambienceBufferCache.get(mode);
  if (cached) return cached;
  const sampleRate = audioContext.sampleRate;
  const length = Math.round(sampleRate * 12);
  const buffer = audioContext.createBuffer(2, length, sampleRate);
  const modeSeed = [...mode].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const targetRms = {
    'quiet-room': 0.14,
    'air-conditioner': 0.17,
    'night-room': 0.15,
    'distant-rain': 0.2
  }[mode] ?? 0.14;
  for (let channel = 0; channel < 2; channel += 1) {
    const output = buffer.getChannelData(channel);
    const random = seededRandom(0xA51C3 + modeSeed * 97 + channel * 7919);
    let pink = 0;
    let brown = 0;
    let rainDrop = 0;
    const phase = random() * Math.PI * 2;
    for (let index = 0; index < length; index += 1) {
      const white = random() * 2 - 1;
      pink = 0.965 * pink + 0.035 * white;
      brown = Math.max(-1, Math.min(1, 0.997 * brown + 0.018 * white));
      const seconds = index / sampleRate;
      let sample;
      if (mode === 'air-conditioner') {
        const fan = Math.sin(2 * Math.PI * 96 * seconds + phase) * 0.035;
        const breathing = 0.86 + 0.14 * Math.sin(2 * Math.PI * 0.17 * seconds + phase);
        sample = (0.58 * brown + 0.3 * pink + fan) * breathing;
      } else if (mode === 'night-room') {
        const slow = 0.9 + 0.1 * Math.sin(2 * Math.PI * 0.08 * seconds + phase);
        sample = (0.7 * brown + 0.18 * pink) * slow;
      } else if (mode === 'distant-rain') {
        if (random() < 0.00022) rainDrop = 0.55 + random() * 0.45;
        rainDrop *= 0.994;
        sample = 0.34 * white + 0.4 * pink + rainDrop * (random() * 2 - 1) * 0.25;
      } else {
        sample = 0.28 * white + 0.48 * pink + 0.16 * brown;
      }
      output[index] = Math.max(-1, Math.min(1, sample * 0.45));
    }

    // The synthesis formulas have very different raw RMS values. Normalize
    // them before applying the user's dB control so a mode change does not
    // unexpectedly become almost silent. Peak limiting keeps the loudest
    // preview setting safely below full scale.
    let squareSum = 0;
    let peak = 0;
    for (const sample of output) {
      squareSum += sample * sample;
      peak = Math.max(peak, Math.abs(sample));
    }
    const rms = Math.sqrt(squareSum / output.length);
    const rmsScale = targetRms / Math.max(rms, 0.000001);
    const peakScale = 0.88 / Math.max(peak, 0.000001);
    const normalizationScale = Math.min(rmsScale, peakScale);
    for (let index = 0; index < output.length; index += 1) {
      output[index] *= normalizationScale;
    }
  }
  ambienceBufferCache.set(mode, buffer);
  return buffer;
}

function rebuildAmbienceSource() {
  if (!audioContext || !ambienceHighpass) return;
  if (ambienceSource) {
    try { ambienceSource.stop(); } catch { /* already stopped */ }
    disconnectNode(ambienceSource);
    ambienceSource = null;
  }
  if (ambienceMode === 'off') return;
  ambienceSource = audioContext.createBufferSource();
  ambienceSource.buffer = createAmbienceBuffer(ambienceMode);
  ambienceSource.loop = true;
  ambienceSource.connect(ambienceHighpass);
  ambienceSource.start();
}

function applyAmbience(immediate = false) {
  if (!audioContext || !ambienceGain || !ambienceHighpass || !ambienceLowpass) return;
  const filters = ambienceFilterSettings();
  applyAudioParam(ambienceHighpass.frequency, filters.highpassHz, immediate);
  applyAudioParam(ambienceLowpass.frequency, filters.lowpassHz, immediate);
  applyAudioParam(
    ambienceGain.gain,
    ambienceMode === 'off' ? 0 : decibelsToLinear(ambienceLevelDb),
    immediate,
    0.08);
}

function cancelAmbiencePreview() {
  if (!ambiencePreviewTimer) return;
  clearTimeout(ambiencePreviewTimer);
  ambiencePreviewTimer = null;
}

function previewAmbience() {
  if (!audioContext || !ambienceGain || !ambienceSource) {
    throw new Error('先にタブ音声を取得し、環境音を無音以外にしてください。');
  }
  cancelAmbiencePreview();
  applyAudioParam(
    ambienceGain.gain,
    decibelsToLinear(AMBIENCE_PREVIEW_LEVEL_DB),
    false,
    0.04);
  ambiencePreviewTimer = setTimeout(() => {
    ambiencePreviewTimer = null;
    applyAmbience(false);
  }, 2000);
  return state();
}

function spatialGeometry(azimuth, distanceMeters) {
  const distance = clamp(distanceMeters, MIN_SOURCE_DISTANCE_METERS, HRTF_REFERENCE_DISTANCE_METERS);
  const radians = degreesToRadians(azimuth);
  const sourceX = Math.sin(radians) * distance;
  const sourceY = Math.cos(radians) * distance;
  const leftEarX = -HALF_INTERAURAL_DISTANCE_METERS;
  const rightEarX = HALF_INTERAURAL_DISTANCE_METERS;
  const leftEarDistance = Math.hypot(sourceX - leftEarX, sourceY);
  const rightEarDistance = Math.hypot(sourceX - rightEarX, sourceY);
  const leftEarAzimuth = leftEarDistance < MIN_EAR_DISTANCE_METERS
    ? Number(azimuth)
    : Math.atan2(sourceX - leftEarX, sourceY) * 180 / Math.PI;
  const rightEarAzimuth = rightEarDistance < MIN_EAR_DISTANCE_METERS
    ? Number(azimuth)
    : Math.atan2(sourceX - rightEarX, sourceY) * 180 / Math.PI;

  const referenceX = Math.sin(radians) * HRTF_REFERENCE_DISTANCE_METERS;
  const referenceY = Math.cos(radians) * HRTF_REFERENCE_DISTANCE_METERS;
  const referenceLeftDistance = Math.hypot(referenceX - leftEarX, referenceY);
  const referenceRightDistance = Math.hypot(referenceX - rightEarX, referenceY);
  const distanceScale = Math.max(distance, MIN_EAR_DISTANCE_METERS) / HRTF_REFERENCE_DISTANCE_METERS;
  const rawLeftGain = referenceLeftDistance
    / Math.max(leftEarDistance, MIN_EAR_DISTANCE_METERS) * distanceScale;
  const rawRightGain = referenceRightDistance
    / Math.max(rightEarDistance, MIN_EAR_DISTANCE_METERS) * distanceScale;

  // Near-field effects matter most inside roughly one metre. Limit the peak
  // correction so the approximation remains useful for listening tests.
  const nearAmount = clamp((1 - distance) / (1 - MIN_SOURCE_DISTANCE_METERS), 0, 1);
  const maximumEarGain = 1 + 0.85 * nearAmount;
  const correctionScale = Math.max(rawLeftGain, rawRightGain) > maximumEarGain
    ? maximumEarGain / Math.max(rawLeftGain, rawRightGain)
    : 1;
  const leftGain = clamp(rawLeftGain * correctionScale, 0.45, maximumEarGain);
  const rightGain = clamp(rawRightGain * correctionScale, 0.45, maximumEarGain);
  const proximityGain = 1 + 0.55 * nearAmount;

  return {
    distance,
    sourceX,
    sourceY,
    leftEarDistance,
    rightEarDistance,
    leftEarAzimuth,
    rightEarAzimuth,
    leftGain,
    rightGain,
    proximityGain
  };
}

function spatialRenderingGeometry(azimuth, distanceMeters) {
  const spatial = spatialGeometry(azimuth, distanceMeters);
  const definition = currentHrtfDatasetDefinition();
  const distanceAware = hrtfDataset?.distanceAware ?? definition.distanceAware;
  if (!distanceAware) return spatial;

  // A near-field HRIR pair already contains the measured left/right level and
  // time differences. Applying the old far-field parallax gains again would
  // double-count those cues. Below the shortest 20 cm measurement, add only a
  // small bounded proximity lift while keeping the measured binaural pair.
  const measuredDistances = hrtfDataset?.measuredDistancesMeters
    ?? definition.measuredDistancesMeters;
  const minimumMeasuredDistance = Math.min(...measuredDistances);
  const belowMeasurementAmount = clamp(
    (minimumMeasuredDistance - spatial.distance) / minimumMeasuredDistance, 0, 1);
  return {
    ...spatial,
    leftGain: 1,
    rightGain: 1,
    proximityGain: 1 + 0.25 * belowMeasurementAmount
  };
}

function rampGain(node, target, immediate = false, duration = 0.035) {
  if (!audioContext || !node) return;
  const now = audioContext.currentTime;
  node.gain.cancelScheduledValues(now);
  node.gain.setValueAtTime(node.gain.value, now);
  if (immediate) node.gain.setValueAtTime(target, now);
  else node.gain.linearRampToValueAtTime(target, now + duration);
}

function applySpatialDistance(immediate = false, duration = 0.035) {
  const spatial = spatialRenderingGeometry(currentAzimuth, currentDistanceMeters);
  rampGain(hrtfLeftSpatialGain, spatial.leftGain, immediate, duration);
  rampGain(hrtfRightSpatialGain, spatial.rightGain, immediate, duration);
  rampGain(hrtfProximityGain, spatial.proximityGain, immediate, duration);
}

function applyHrtfOutputGain(immediate = false) {
  rampGain(hrtfOutputGainNode, hrtfOutputGain, immediate, 0.02);
}

function rearAlternatingMotionPosition(
  pattern, phase, baseDistanceMeters, durationSeconds, rearTransitionSeconds) {
  const cycleDuration = clamp(
    durationSeconds, MIN_HRTF_MOTION_DURATION_SECONDS, MAX_HRTF_MOTION_DURATION_SECONDS);
  const maximumTransition = Math.max(
    MIN_HRTF_REAR_TRANSITION_SECONDS, cycleDuration / 2 - 0.4);
  const transitionDuration = clamp(
    rearTransitionSeconds,
    MIN_HRTF_REAR_TRANSITION_SECONDS,
    Math.min(MAX_HRTF_REAR_TRANSITION_SECONDS, maximumTransition));
  const dwellDuration = Math.max(0.4, (cycleDuration - transitionDuration * 2) / 2);
  const cycleTime = ((Number(phase) % 1) + 1) % 1 * cycleDuration;
  const baseDistance = clamp(
    baseDistanceMeters, MIN_HRTF_MOTION_DISTANCE_METERS, MAX_HRTF_MOTION_DISTANCE_METERS);
  const earDistance = pattern === 'ear-alternating' ? 0.11 : baseDistance;
  const rearDistance = pattern === 'ear-alternating'
    ? Math.max(0.24, baseDistance)
    : Math.min(0.5, baseDistance + 0.035);

  if (cycleTime < dwellDuration) {
    return { azimuth: -ASMR_SIDE_AZIMUTH_DEGREES, distanceMeters: earDistance };
  }

  if (cycleTime < dwellDuration + transitionDuration) {
    const progress = (cycleTime - dwellDuration) / transitionDuration;
    const eased = cosineEase(progress);
    return {
      azimuth: normalizeAzimuth(
        -ASMR_SIDE_AZIMUTH_DEGREES
        - (360 - ASMR_SIDE_AZIMUTH_DEGREES * 2) * eased),
      distanceMeters: earDistance
        + (rearDistance - earDistance) * Math.sin(Math.PI * eased) ** 2
    };
  }

  if (cycleTime < dwellDuration * 2 + transitionDuration) {
    return { azimuth: ASMR_SIDE_AZIMUTH_DEGREES, distanceMeters: earDistance };
  }

  const progress = (cycleTime - dwellDuration * 2 - transitionDuration)
    / transitionDuration;
  const eased = cosineEase(progress);
  return {
    azimuth: normalizeAzimuth(
      ASMR_SIDE_AZIMUTH_DEGREES
      + (360 - ASMR_SIDE_AZIMUTH_DEGREES * 2) * eased),
    distanceMeters: earDistance
      + (rearDistance - earDistance) * Math.sin(Math.PI * eased) ** 2
  };
}

function nearFarReturnMotionPosition(
  pattern, phase, baseDistanceMeters, durationSeconds, transitionSeconds) {
  const cycleDuration = clamp(
    durationSeconds, MIN_HRTF_MOTION_DURATION_SECONDS, MAX_HRTF_MOTION_DURATION_SECONDS);
  const farDwellDuration = Math.min(1, Math.max(0.4, cycleDuration * 0.04));
  const maximumTransition = Math.max(
    MIN_HRTF_REAR_TRANSITION_SECONDS,
    (cycleDuration - farDwellDuration - 0.4) / 2);
  const transitionDuration = clamp(
    transitionSeconds,
    MIN_HRTF_REAR_TRANSITION_SECONDS,
    Math.min(MAX_HRTF_REAR_TRANSITION_SECONDS, maximumTransition));
  const nearDwellDuration = Math.max(
    0.4, cycleDuration - transitionDuration * 2 - farDwellDuration);
  const cycleTime = ((Number(phase) % 1) + 1) % 1 * cycleDuration;
  const nearDistance = clamp(
    baseDistanceMeters, MIN_HRTF_MOTION_DISTANCE_METERS, MAX_HRTF_MOTION_DISTANCE_METERS);
  const farDistance = clamp(
    Math.max(0.32, nearDistance + 0.18, nearDistance * 2.8),
    MIN_HRTF_MOTION_DISTANCE_METERS,
    MAX_HRTF_MOTION_DISTANCE_METERS);
  const azimuth = pattern === 'right-pullback'
    ? ASMR_SIDE_AZIMUTH_DEGREES
    : -ASMR_SIDE_AZIMUTH_DEGREES;

  if (cycleTime < nearDwellDuration) {
    return { azimuth, distanceMeters: nearDistance };
  }
  if (cycleTime < nearDwellDuration + transitionDuration) {
    const progress = cosineEase((cycleTime - nearDwellDuration) / transitionDuration);
    return {
      azimuth,
      distanceMeters: nearDistance + (farDistance - nearDistance) * progress
    };
  }
  if (cycleTime < nearDwellDuration + transitionDuration + farDwellDuration) {
    return { azimuth, distanceMeters: farDistance };
  }
  const progress = cosineEase(
    (cycleTime - nearDwellDuration - transitionDuration - farDwellDuration)
      / transitionDuration);
  return {
    azimuth,
    distanceMeters: farDistance + (nearDistance - farDistance) * progress
  };
}

function periodicHrtfMotionPosition(
  pattern, phase, baseDistanceMeters,
  durationSeconds = DEFAULT_HRTF_MOTION_DURATION_SECONDS,
  rearTransitionSeconds = DEFAULT_HRTF_REAR_TRANSITION_SECONDS) {
  const normalizedPhase = ((Number(phase) % 1) + 1) % 1;
  const pingPong = 0.5 - 0.5 * Math.cos(normalizedPhase * Math.PI * 2);
  const baseDistance = clamp(
    baseDistanceMeters, MIN_HRTF_MOTION_DISTANCE_METERS, MAX_HRTF_MOTION_DISTANCE_METERS);

  if (pattern === 'behind-sweep' || pattern === 'ear-alternating') {
    return rearAlternatingMotionPosition(
      pattern, normalizedPhase, baseDistance, durationSeconds, rearTransitionSeconds);
  }

  if (pattern === 'left-pullback' || pattern === 'right-pullback') {
    return nearFarReturnMotionPosition(
      pattern, normalizedPhase, baseDistance, durationSeconds, rearTransitionSeconds);
  }

  if (pattern === 'front-sweep') {
    return {
      azimuth: -ASMR_SIDE_AZIMUTH_DEGREES
        + ASMR_SIDE_AZIMUTH_DEGREES * 2 * pingPong,
      distanceMeters: baseDistance
    };
  }

  if (pattern === 'slow-orbit') {
    return {
      azimuth: normalizeAzimuth(-ASMR_SIDE_AZIMUTH_DEGREES + 360 * normalizedPhase),
      distanceMeters: clamp(
        baseDistance + Math.sin(normalizedPhase * Math.PI * 2) * 0.025,
        MIN_HRTF_MOTION_DISTANCE_METERS,
        MAX_HRTF_MOTION_DISTANCE_METERS)
    };
  }

  return { azimuth: -ASMR_SIDE_AZIMUTH_DEGREES, distanceMeters: baseDistance };
}

function interpolateMotionPosition(from, to, progress) {
  const eased = cosineEase(progress);
  return {
    azimuth: normalizeAzimuth(
      Number(from.azimuth) + shortestAzimuthDelta(from.azimuth, to.azimuth) * eased),
    distanceMeters: Number(from.distanceMeters)
      + (Number(to.distanceMeters) - Number(from.distanceMeters)) * eased
  };
}

function randomHrtfMotionTarget(from, baseDistanceMeters) {
  let azimuthDelta = (Math.random() * 2 - 1) * 130;
  if (Math.abs(azimuthDelta) < 35) azimuthDelta = azimuthDelta < 0 ? -35 : 35;
  const baseDistance = clamp(
    baseDistanceMeters, MIN_HRTF_MOTION_DISTANCE_METERS, MAX_HRTF_MOTION_DISTANCE_METERS);
  const minimumDistance = Math.max(0.09, baseDistance * 0.62);
  const maximumDistance = Math.min(0.48, Math.max(minimumDistance + 0.06, baseDistance * 1.55));
  return {
    azimuth: normalizeAzimuth(Number(from.azimuth) + azimuthDelta),
    distanceMeters: minimumDistance + Math.random() * (maximumDistance - minimumDistance)
  };
}

function hrtfMotionPositionAt(nowMs) {
  if (hrtfMotion.pattern === 'random-drift') {
    while (nowMs - hrtfMotion.randomSegmentStartedAtMs >= hrtfMotion.randomSegmentDurationMs) {
      hrtfMotion.randomSegmentStartedAtMs += hrtfMotion.randomSegmentDurationMs;
      hrtfMotion.randomFrom = hrtfMotion.randomTo;
      hrtfMotion.randomTo = randomHrtfMotionTarget(
        hrtfMotion.randomFrom, hrtfMotion.baseDistanceMeters);
    }
    const progress = (nowMs - hrtfMotion.randomSegmentStartedAtMs)
      / hrtfMotion.randomSegmentDurationMs;
    return interpolateMotionPosition(hrtfMotion.randomFrom, hrtfMotion.randomTo, progress);
  }

  const entryElapsed = nowMs - hrtfMotion.startedAtMs;
  if (entryElapsed < hrtfMotion.entryDurationMs) {
    return interpolateMotionPosition(
      hrtfMotion.entryFrom, hrtfMotion.entryTo, entryElapsed / hrtfMotion.entryDurationMs);
  }

  const loopElapsed = Math.max(0, entryElapsed - hrtfMotion.entryDurationMs);
  const phase = (loopElapsed / (hrtfMotion.durationSeconds * 1000)) % 1;
  return periodicHrtfMotionPosition(
    hrtfMotion.pattern,
    phase,
    hrtfMotion.baseDistanceMeters,
    hrtfMotion.durationSeconds,
    hrtfMotion.rearTransitionSeconds);
}

function scheduleHrtfMotionTick(generation, delay = HRTF_MOTION_UPDATE_MS) {
  clearTimeout(hrtfMotionTimer);
  hrtfMotionTimer = setTimeout(() => runHrtfMotionTick(generation), delay);
}

async function runHrtfMotionTick(generation) {
  if (!hrtfMotion.active || generation !== hrtfMotionGeneration) return;
  const next = hrtfMotionPositionAt(performance.now());
  try {
    await setHrtfPosition(next.azimuth, 0, next.distanceMeters, {
      persist: false,
      fadeSeconds: 0.11,
      gainRampSeconds: HRTF_MOTION_UPDATE_MS / 1000
    });
  } catch (error) {
    if (generation !== hrtfMotionGeneration) return;
    hrtfMotion.active = false;
    hrtfMotion.lastError = error.message;
    clearTimeout(hrtfMotionTimer);
    hrtfMotionTimer = null;
    return;
  }
  if (hrtfMotion.active && generation === hrtfMotionGeneration) {
    scheduleHrtfMotionTick(generation);
  }
}

async function startHrtfMotion(pattern, durationSeconds, rearTransitionSeconds) {
  const normalizedPattern = HRTF_MOTION_PATTERNS.has(pattern) ? pattern : 'behind-sweep';
  const normalizedDuration = clamp(
    durationSeconds, MIN_HRTF_MOTION_DURATION_SECONDS, MAX_HRTF_MOTION_DURATION_SECONDS);
  const normalizedRearTransition = clamp(
    rearTransitionSeconds ?? DEFAULT_HRTF_REAR_TRANSITION_SECONDS,
    MIN_HRTF_REAR_TRANSITION_SECONDS,
    Math.min(MAX_HRTF_REAR_TRANSITION_SECONDS, normalizedDuration / 2 - 0.4));
  await stopHrtfMotion(false);
  await setMode('hrtf');

  const now = performance.now();
  const baseDistance = clamp(
    currentDistanceMeters, MIN_HRTF_MOTION_DISTANCE_METERS, MAX_HRTF_MOTION_DISTANCE_METERS);
  const startPosition = {
    azimuth: currentAzimuth,
    distanceMeters: currentDistanceMeters
  };
  const entryTarget = normalizedPattern === 'random-drift'
    ? startPosition
    : periodicHrtfMotionPosition(
      normalizedPattern, 0, baseDistance, normalizedDuration, normalizedRearTransition);
  const generation = ++hrtfMotionGeneration;
  hrtfMotion = {
    active: true,
    pattern: normalizedPattern,
    durationSeconds: normalizedDuration,
    rearTransitionSeconds: normalizedRearTransition,
    startedAtMs: now,
    entryDurationMs: Math.min(3000, Math.max(1200, normalizedDuration * 120)),
    entryFrom: startPosition,
    entryTo: entryTarget,
    baseDistanceMeters: baseDistance,
    randomSegmentStartedAtMs: now,
    randomSegmentDurationMs: Math.max(4000, normalizedDuration * 400),
    randomFrom: startPosition,
    randomTo: randomHrtfMotionTarget(startPosition, baseDistance),
    lastError: null
  };
  scheduleHrtfMotionTick(generation, 0);
  return state();
}

async function stopHrtfMotion(persistPosition = true) {
  const wasActive = hrtfMotion.active;
  hrtfMotionGeneration += 1;
  hrtfPositionRequestId += 1;
  clearTimeout(hrtfMotionTimer);
  hrtfMotionTimer = null;
  hrtfMotion.active = false;
  hrtfMotion.startedAtMs = null;
  if (persistPosition && wasActive) {
    await persistHrtfPosition();
  }
  return state();
}

async function persistHrtfPosition() {
  try {
    const storageArea = globalThis.chrome?.storage?.local;
    if (!storageArea) return false;
    await storageArea.set({
      hrtfAzimuth: currentAzimuth,
      hrtfDistanceMeters: currentDistanceMeters
    });
    return true;
  } catch (error) {
    console.warn('HRTF position could not be persisted.', error);
    return false;
  }
}

function clearPassiveTestTimer() {
  passiveTestGeneration += 1;
  clearTimeout(passiveTestTimer);
  passiveTestTimer = null;
}

function markPassiveTestEnded(status, reason, nowMs = performance.now()) {
  clearPassiveTestTimer();
  passiveTest.active = false;
  passiveTest.status = status;
  passiveTest.reason = reason;
  passiveTest.finishedAtMs = nowMs;
}

function schedulePassiveTestTick(generation) {
  clearTimeout(passiveTestTimer);
  passiveTestTimer = setTimeout(
    () => runPassiveTestTick(generation), passiveTest.sampleIntervalMs);
}

async function finishPassiveTest(status, reason, nowMs = performance.now()) {
  if (!passiveTest.active) return state();
  const ownsMotion = passiveTest.ownsMotion;
  markPassiveTestEnded(status, reason, nowMs);
  if (ownsMotion) {
    try {
      await stopHrtfMotion(true);
    } catch (error) {
      passiveTest.reason = `${reason}; motion-stop: ${error.message}`;
    }
  }
  return state();
}

async function runPassiveTestTick(generation) {
  if (!passiveTest.active || generation !== passiveTestGeneration) return;
  const nowMs = performance.now();
  const elapsedMs = nowMs - passiveTest.startedAtMs;
  const sampleDeltaMs = Math.max(0, Math.min(
    nowMs - passiveTest.lastSampleAtMs,
    passiveTest.sampleIntervalMs * 2));
  passiveTest.lastSampleAtMs = nowMs;

  if (passiveTest.ownsMotion && !hrtfMotion.active) {
    await finishPassiveTest('failed', 'motion-stopped', nowMs);
    return;
  }

  const inputLevel = analyserLevels(inputAnalyser);
  passiveTest.latestInputRmsDb = inputLevel.rmsDb;
  const speechActive = Number.isFinite(inputLevel.rmsDb)
    && inputLevel.rmsDb >= passiveTest.speechThresholdDb;

  if (speechActive) {
    passiveTest.detectedSpeech = true;
    passiveTest.status = 'running';
    passiveTest.totalSpeechMs += sampleDeltaMs;
    passiveTest.lastSpeechAtMs = nowMs;
    passiveTest.currentSilenceMs = 0;
  } else if (passiveTest.detectedSpeech) {
    passiveTest.currentSilenceMs = Math.max(0, nowMs - passiveTest.lastSpeechAtMs);
    passiveTest.longestSilenceMs = Math.max(
      passiveTest.longestSilenceMs, passiveTest.currentSilenceMs);
    if (passiveTest.currentSilenceMs >= passiveTest.silenceLimitMs) {
      await finishPassiveTest(
        passiveTest.completionMode === 'response-end' ? 'completed' : 'failed',
        passiveTest.completionMode === 'response-end' ? 'response-ended' : 'early-silence',
        nowMs);
      return;
    }
  } else if (elapsedMs >= passiveTest.startTimeoutMs) {
    await finishPassiveTest('failed', 'no-speech', nowMs);
    return;
  }

  if (elapsedMs >= passiveTest.durationMs) {
    await finishPassiveTest(
      passiveTest.detectedSpeech ? 'completed' : 'failed',
      passiveTest.detectedSpeech
        ? (passiveTest.completionMode === 'response-end'
          ? 'observation-limit'
          : 'duration-complete')
        : 'no-speech',
      nowMs);
    return;
  }

  if (passiveTest.active && generation === passiveTestGeneration) {
    schedulePassiveTestTick(generation);
  }
}

function beginPassiveTestMonitoring(options = {}) {
  clearPassiveTestTimer();
  const nowMs = performance.now();
  const durationSeconds = clamp(
    options.durationSeconds ?? PASSIVE_TEST_DEFAULT_DURATION_SECONDS,
    0.25, PASSIVE_TEST_MAX_DURATION_SECONDS);
  const silenceLimitSeconds = clamp(
    options.silenceLimitSeconds ?? PASSIVE_TEST_DEFAULT_SILENCE_LIMIT_SECONDS,
    0.1, 30);
  const startTimeoutSeconds = clamp(
    options.startTimeoutSeconds ?? PASSIVE_TEST_DEFAULT_START_TIMEOUT_SECONDS,
    0.1, 60);
  const sampleIntervalMs = clamp(
    options.sampleIntervalMs ?? PASSIVE_TEST_DEFAULT_SAMPLE_INTERVAL_MS, 25, 250);
  passiveTest = {
    ...createIdlePassiveTest(),
    status: 'waiting-for-speech',
    active: true,
    ownsMotion: Boolean(options.ownsMotion),
    completionMode: options.completionMode === 'response-end'
      ? 'response-end'
      : 'duration',
    sceneCount: Number.isFinite(Number(options.sceneCount))
      ? clamp(Math.round(Number(options.sceneCount)), 1, 20)
      : null,
    startedAtMs: nowMs,
    lastSampleAtMs: nowMs,
    durationMs: durationSeconds * 1000,
    silenceLimitMs: silenceLimitSeconds * 1000,
    startTimeoutMs: startTimeoutSeconds * 1000,
    sampleIntervalMs,
    speechThresholdDb: Number.isFinite(Number(options.speechThresholdDb))
      ? Number(options.speechThresholdDb)
      : PASSIVE_TEST_SPEECH_THRESHOLD_DB
  };
  const generation = passiveTestGeneration;
  schedulePassiveTestTick(generation);
  return state();
}

async function startPassiveTest(options = {}) {
  if (!stream || !audioContext || audioContext.state === 'closed') {
    throw new Error('先にChatGPTタブの音声を取得してください。');
  }
  if (passiveTest.active) await finishPassiveTest('stopped', 'restarted');
  await startHrtfMotion('behind-sweep', 24, 3);
  return beginPassiveTestMonitoring({
    ...options,
    ownsMotion: true
  });
}

async function stopPassiveTest() {
  if (!passiveTest.active) return state();
  return finishPassiveTest('stopped', 'user-stopped');
}

async function startCapture(streamId, tabId) {
  await stopCapture();
  await Promise.all([
    loadHrtfSettings(), loadTextureSettings(), loadAmbienceSettings()
  ]);

  try {

  stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    video: false
  });

  // Let the browser pick the device/context rate. Bundled HRIRs are resampled
  // to this rate before entering ConvolverNode, as required by Web Audio.
  audioContext = new AudioContext({ latencyHint: 'interactive' });
  sourceNode = audioContext.createMediaStreamSource(stream);

  // A point-source binaural renderer expects one source signal. ChatGPT's tab
  // output is therefore intentionally folded to mono before spatialisation.
  monoNode = audioContext.createGain();
  monoNode.channelCount = 1;
  monoNode.channelCountMode = 'explicit';
  monoNode.channelInterpretation = 'speakers';
  inputAnalyser = audioContext.createAnalyser();
  inputAnalyser.fftSize = 1024;
  inputAnalyser.smoothingTimeConstant = 0.65;

  // Parallel texture processing. The wet path removes only sub-bass rumble,
  // then adds modest body/detail EQ and compression. Dry/wet gains always sum
  // to one before the small preset-specific level trim.
  textureDryGain = audioContext.createGain();
  textureDryDelay = audioContext.createDelay(0.02);
  // DynamicsCompressorNode has a normative 6 ms look-ahead. Delay the dry
  // branch by the same amount so parallel mixing does not create combing.
  textureDryDelay.delayTime.value = TEXTURE_COMPRESSOR_LOOKAHEAD_SECONDS;
  textureHighpass = audioContext.createBiquadFilter();
  textureHighpass.type = 'highpass';
  textureHighpass.frequency.value = 55;
  textureHighpass.Q.value = 0.7;
  textureBodyFilter = audioContext.createBiquadFilter();
  textureBodyFilter.type = 'peaking';
  textureBodyFilter.frequency.value = 220;
  textureBodyFilter.Q.value = 0.75;
  texturePresenceFilter = audioContext.createBiquadFilter();
  texturePresenceFilter.type = 'peaking';
  texturePresenceFilter.frequency.value = 3800;
  texturePresenceFilter.Q.value = 0.8;
  textureAirFilter = audioContext.createBiquadFilter();
  textureAirFilter.type = 'highshelf';
  textureAirFilter.frequency.value = 7500;
  textureCompressor = audioContext.createDynamicsCompressor();
  textureWetGain = audioContext.createGain();
  textureOutputGain = audioContext.createGain();
  deEsserFilter = audioContext.createBiquadFilter();
  deEsserFilter.type = 'peaking';
  deEsserFilter.frequency.value = 6500;
  deEsserFilter.Q.value = 1.25;
  textureOutputAnalyser = audioContext.createAnalyser();
  textureOutputAnalyser.fftSize = 1024;
  textureOutputAnalyser.smoothingTimeConstant = 0.65;

  // Low-band pressure is an independent HRTF-only parallel branch. The dry
  // side is delayed by the compressor's 6 ms look-ahead so enabling the band
  // does not hollow out the voice through timing mismatch.
  vibrationDryDelay = audioContext.createDelay(0.02);
  vibrationDryDelay.delayTime.value = TEXTURE_COMPRESSOR_LOOKAHEAD_SECONDS;
  vibrationHighpass = audioContext.createBiquadFilter();
  vibrationHighpass.type = 'highpass';
  vibrationHighpass.frequency.value = 45;
  vibrationHighpass.Q.value = 0.7;
  vibrationLowpass = audioContext.createBiquadFilter();
  vibrationLowpass.type = 'lowpass';
  vibrationLowpass.frequency.value = 180;
  vibrationLowpass.Q.value = 0.7;
  vibrationCompressor = audioContext.createDynamicsCompressor();
  vibrationCompressor.threshold.value = -32;
  vibrationCompressor.knee.value = 18;
  vibrationCompressor.ratio.value = 4;
  vibrationCompressor.attack.value = 0.015;
  vibrationCompressor.release.value = 0.18;
  vibrationBandGain = audioContext.createGain();
  vibrationBandAnalyser = audioContext.createAnalyser();
  vibrationBandAnalyser.fftSize = 1024;
  vibrationBandAnalyser.smoothingTimeConstant = 0.7;
  vibrationMixer = audioContext.createGain();
  vibrationOutputTrim = audioContext.createGain();

  // Fallback/diagnostic pan path.
  panLeftGain = audioContext.createGain();
  panRightGain = audioContext.createGain();
  panMerger = audioContext.createChannelMerger(2);
  panModeGain = audioContext.createGain();

  // HRTF convolution path.
  hrtfConvolverA = audioContext.createConvolver();
  hrtfConvolverB = audioContext.createConvolver();
  // Equal-power normalization keeps the A/B test at a sane listening level
  // while preserving left/right spectral and level differences inside each IR.
  hrtfConvolverA.normalize = true;
  hrtfConvolverB.normalize = true;
  hrtfGainA = audioContext.createGain();
  hrtfGainB = audioContext.createGain();
  hrtfModeGain = audioContext.createGain();
  hrtfSplitter = audioContext.createChannelSplitter(2);
  hrtfLeftSpatialGain = audioContext.createGain();
  hrtfRightSpatialGain = audioContext.createGain();
  hrtfMerger = audioContext.createChannelMerger(2);
  hrtfProximityGain = audioContext.createGain();
  hrtfOutputGainNode = audioContext.createGain();
  earlyReflectionConvolver = audioContext.createConvolver();
  earlyReflectionConvolver.normalize = false;
  earlyReflectionConvolver.buffer = createEarlyReflectionBuffer();
  earlyReflectionGain = audioContext.createGain();
  hrtfPreLimiterMixer = audioContext.createGain();
  hrtfLimiter = audioContext.createDynamicsCompressor();
  hrtfGainA.gain.value = 1;
  hrtfGainB.gain.value = 0;
  hrtfLimiter.threshold.value = -3;
  hrtfLimiter.knee.value = 0;
  hrtfLimiter.ratio.value = 20;
  hrtfLimiter.attack.value = 0.003;
  hrtfLimiter.release.value = 0.1;
  hrtfOutputAnalyser = audioContext.createAnalyser();
  hrtfOutputAnalyser.fftSize = 1024;
  hrtfOutputAnalyser.smoothingTimeConstant = 0.65;

  ambienceHighpass = audioContext.createBiquadFilter();
  ambienceHighpass.type = 'highpass';
  ambienceHighpass.Q.value = 0.7;
  ambienceLowpass = audioContext.createBiquadFilter();
  ambienceLowpass.type = 'lowpass';
  ambienceLowpass.Q.value = 0.7;
  ambienceGain = audioContext.createGain();
  ambienceAnalyser = audioContext.createAnalyser();
  ambienceAnalyser.fftSize = 1024;
  ambienceAnalyser.smoothingTimeConstant = 0.72;

  masterGain = audioContext.createGain();

  sourceNode.connect(monoNode);

  monoNode.connect(inputAnalyser);

  inputAnalyser.connect(textureDryDelay);
  textureDryDelay.connect(textureDryGain);
  inputAnalyser.connect(textureHighpass);
  textureHighpass.connect(textureBodyFilter);
  textureBodyFilter.connect(texturePresenceFilter);
  texturePresenceFilter.connect(textureAirFilter);
  textureAirFilter.connect(textureCompressor);
  textureCompressor.connect(textureWetGain);
  textureDryGain.connect(textureOutputGain);
  textureWetGain.connect(textureOutputGain);
  textureOutputGain.connect(deEsserFilter);
  deEsserFilter.connect(textureOutputAnalyser);

  textureOutputAnalyser.connect(panLeftGain);
  textureOutputAnalyser.connect(panRightGain);
  panLeftGain.connect(panMerger, 0, 0);
  panRightGain.connect(panMerger, 0, 1);
  panMerger.connect(panModeGain);
  panModeGain.connect(masterGain);

  textureOutputAnalyser.connect(vibrationDryDelay);
  vibrationDryDelay.connect(vibrationMixer);
  textureOutputAnalyser.connect(vibrationHighpass);
  vibrationHighpass.connect(vibrationLowpass);
  vibrationLowpass.connect(vibrationCompressor);
  vibrationCompressor.connect(vibrationBandGain);
  vibrationBandGain.connect(vibrationBandAnalyser);
  vibrationBandAnalyser.connect(vibrationMixer);
  vibrationMixer.connect(vibrationOutputTrim);
  vibrationOutputTrim.connect(hrtfConvolverA);
  vibrationOutputTrim.connect(hrtfConvolverB);
  hrtfConvolverA.connect(hrtfGainA);
  hrtfConvolverB.connect(hrtfGainB);
  hrtfGainA.connect(hrtfModeGain);
  hrtfGainB.connect(hrtfModeGain);
  hrtfModeGain.connect(hrtfSplitter);
  hrtfSplitter.connect(hrtfLeftSpatialGain, 0);
  hrtfSplitter.connect(hrtfRightSpatialGain, 1);
  hrtfLeftSpatialGain.connect(hrtfMerger, 0, 0);
  hrtfRightSpatialGain.connect(hrtfMerger, 0, 1);
  hrtfMerger.connect(hrtfProximityGain);
  hrtfProximityGain.connect(hrtfOutputGainNode);
  hrtfOutputGainNode.connect(hrtfPreLimiterMixer);
  hrtfOutputGainNode.connect(earlyReflectionConvolver);
  earlyReflectionConvolver.connect(earlyReflectionGain);
  earlyReflectionGain.connect(hrtfPreLimiterMixer);
  hrtfPreLimiterMixer.connect(hrtfLimiter);
  hrtfLimiter.connect(hrtfOutputAnalyser);
  hrtfOutputAnalyser.connect(masterGain);

  ambienceHighpass.connect(ambienceLowpass);
  ambienceLowpass.connect(ambienceGain);
  ambienceGain.connect(ambienceAnalyser);
  ambienceAnalyser.connect(masterGain);

  masterGain.connect(audioContext.destination);

  capturedTabId = tabId;
  outputMuted = false;
  masterGain.gain.value = 1;
  // Keep the fallback audible while the first FIR is prepared, then finish
  // capture startup in the product's normal HRTF mode.
  processingMode = 'pan';
  applyTexture(true);
  applyVibration(true);
  applyEarlyReflections(true);
  applyAmbience(true);
  rebuildAmbienceSource();
  applyPan(true);
  applyMode(true);
  applySpatialDistance(true);
  applyHrtfOutputGain(true);

  const audioTrack = stream.getAudioTracks()[0];
  if (audioTrack) {
    const settings = audioTrack.getSettings?.() || {};
    trackInfo = {
      label: audioTrack.label || 'tab audio',
      readyState: audioTrack.readyState,
      muted: audioTrack.muted,
      enabled: audioTrack.enabled,
      channelCount: settings.channelCount ?? null,
      sampleRate: settings.sampleRate ?? null,
      sampleSize: settings.sampleSize ?? null
    };
    audioTrack.onended = () => {
      const endedTabId = capturedTabId;
      stopCapture()
        .catch(console.error)
        .finally(() => chrome.runtime.sendMessage({
          target: 'background',
          type: 'capture-ended',
          tabId: endedTabId,
          reason: 'track-ended'
        }).catch(console.error));
    };
  }

  await audioContext.resume();
  await setMode('hrtf');
  await startHrtfMotion(
    'behind-sweep', DEFAULT_HRTF_MOTION_DURATION_SECONDS,
    DEFAULT_HRTF_REAR_TRANSITION_SECONDS);
  return state();
  } catch (error) {
    await stopCapture().catch((cleanupError) => {
      console.warn('Capture startup cleanup failed.', cleanupError);
    });
    throw error;
  }
}

async function loadTextureSettings() {
  if (textureSettingsLoaded) return;
  if (textureSettingsLoadPromise) return textureSettingsLoadPromise;
  textureSettingsLoadPromise = (async () => {
    try {
    const stored = await chrome.storage.local.get([
      'texturePresetId', 'textureIntensity', 'textureDensity', 'textureBody',
      'textureNearEar', 'textureSettingsRevision', 'vibrationEnabled',
      'vibrationIntensity', 'deEsserEnabled', 'deEsserIntensity',
      'earlyReflectionsEnabled', 'earlyReflectionsIntensity'
    ]);
    const storedRevision = Number(stored.textureSettingsRevision ?? 0);
    if (storedRevision >= 3) {
      texturePresetId = TEXTURE_PRESET_DEFINITIONS[stored.texturePresetId]
        ? stored.texturePresetId
        : 'custom';
      if (Number.isFinite(Number(stored.textureDensity))) {
        textureDensity = clamp(stored.textureDensity, 0, 1);
      }
      if (Number.isFinite(Number(stored.textureBody))) {
        textureBody = clamp(stored.textureBody, 0, 1);
      }
      if (Number.isFinite(Number(stored.textureNearEar))) {
        textureNearEar = clamp(stored.textureNearEar, 0, 1);
      }
    } else {
      texturePresetId = DEFAULT_TEXTURE_PRESET_ID;
      textureDensity = DEFAULT_TEXTURE_DENSITY;
      textureBody = DEFAULT_TEXTURE_BODY;
      textureNearEar = DEFAULT_TEXTURE_NEAR_EAR;
    }
    if (typeof stored.vibrationEnabled === 'boolean') {
      vibrationEnabled = stored.vibrationEnabled;
    }
    const storedVibrationIntensity = Number(stored.vibrationIntensity);
    if (storedRevision < 3
        && (!Number.isFinite(storedVibrationIntensity)
          || Math.abs(storedVibrationIntensity - 0.45) < 0.001)) {
      vibrationIntensity = DEFAULT_VIBRATION_INTENSITY;
    } else if (Number.isFinite(storedVibrationIntensity)) {
      vibrationIntensity = clamp(stored.vibrationIntensity, 0, 1);
    }
    if (typeof stored.deEsserEnabled === 'boolean') deEsserEnabled = stored.deEsserEnabled;
    if (Number.isFinite(Number(stored.deEsserIntensity))) {
      deEsserIntensity = clamp(stored.deEsserIntensity, 0, 1);
    }
    if (typeof stored.earlyReflectionsEnabled === 'boolean') {
      earlyReflectionsEnabled = stored.earlyReflectionsEnabled;
    }
    if (Number.isFinite(Number(stored.earlyReflectionsIntensity))) {
      earlyReflectionsIntensity = clamp(stored.earlyReflectionsIntensity, 0, 1);
    }
    await chrome.storage.local.set({
      texturePresetId,
      textureDensity,
      textureBody,
      textureNearEar,
      vibrationEnabled,
      vibrationIntensity,
      deEsserEnabled,
      deEsserIntensity,
      earlyReflectionsEnabled,
      earlyReflectionsIntensity,
      textureSettingsRevision: TEXTURE_SETTINGS_REVISION
    });
    } catch (error) {
      console.warn('Voice texture settings could not be loaded.', error);
    } finally {
      textureSettingsLoaded = true;
    }
  })();
  try {
    await textureSettingsLoadPromise;
  } finally {
    textureSettingsLoadPromise = null;
  }
}

async function setTexturePreset(value) {
  await loadTextureSettings();
  texturePresetId = TEXTURE_PRESET_DEFINITIONS[value]
    ? value
    : DEFAULT_TEXTURE_PRESET_ID;
  const preset = currentTexturePresetDefinition();
  textureDensity = preset.density;
  textureBody = preset.body;
  textureNearEar = preset.nearEar;
  textureSettingsLoaded = true;
  applyTexture(false);
  await chrome.storage.local.set({
    texturePresetId,
    textureDensity,
    textureBody,
    textureNearEar,
    textureSettingsRevision: TEXTURE_SETTINGS_REVISION
  });
  return state();
}

async function setTextureComponent(component, value) {
  await loadTextureSettings();
  if (!['density', 'body', 'nearEar'].includes(component)) {
    throw new Error(`Unknown texture component: ${component}`);
  }
  const amount = clamp(value, 0, 1);
  if (component === 'density') textureDensity = amount;
  if (component === 'body') textureBody = amount;
  if (component === 'nearEar') textureNearEar = amount;
  texturePresetId = 'custom';
  textureSettingsLoaded = true;
  applyTexture(false);
  await chrome.storage.local.set({
    texturePresetId,
    textureDensity,
    textureBody,
    textureNearEar,
    textureSettingsRevision: TEXTURE_SETTINGS_REVISION
  });
  return state();
}

async function setVibrationEnabled(value) {
  await loadTextureSettings();
  vibrationEnabled = Boolean(value);
  textureSettingsLoaded = true;
  applyVibration(false);
  await chrome.storage.local.set({
    vibrationEnabled,
    vibrationIntensity,
    textureSettingsRevision: TEXTURE_SETTINGS_REVISION
  });
  return state();
}

async function setVibrationIntensity(value) {
  await loadTextureSettings();
  vibrationIntensity = clamp(value, 0, 1);
  textureSettingsLoaded = true;
  applyVibration(false);
  await chrome.storage.local.set({
    vibrationEnabled,
    vibrationIntensity,
    textureSettingsRevision: TEXTURE_SETTINGS_REVISION
  });
  return state();
}

async function setDeEsserEnabled(value) {
  await loadTextureSettings();
  deEsserEnabled = Boolean(value);
  textureSettingsLoaded = true;
  applyTexture(false);
  await chrome.storage.local.set({
    deEsserEnabled,
    deEsserIntensity,
    textureSettingsRevision: TEXTURE_SETTINGS_REVISION
  });
  return state();
}

async function setDeEsserIntensity(value) {
  await loadTextureSettings();
  deEsserIntensity = clamp(value, 0, 1);
  textureSettingsLoaded = true;
  applyTexture(false);
  await chrome.storage.local.set({
    deEsserEnabled,
    deEsserIntensity,
    textureSettingsRevision: TEXTURE_SETTINGS_REVISION
  });
  return state();
}

async function setEarlyReflectionsEnabled(value) {
  await loadTextureSettings();
  earlyReflectionsEnabled = Boolean(value);
  textureSettingsLoaded = true;
  applyEarlyReflections(false);
  await chrome.storage.local.set({
    earlyReflectionsEnabled,
    earlyReflectionsIntensity,
    textureSettingsRevision: TEXTURE_SETTINGS_REVISION
  });
  return state();
}

async function setEarlyReflectionsIntensity(value) {
  await loadTextureSettings();
  earlyReflectionsIntensity = clamp(value, 0, 1);
  textureSettingsLoaded = true;
  applyEarlyReflections(false);
  await chrome.storage.local.set({
    earlyReflectionsEnabled,
    earlyReflectionsIntensity,
    textureSettingsRevision: TEXTURE_SETTINGS_REVISION
  });
  return state();
}

async function loadAmbienceSettings() {
  if (ambienceSettingsLoaded) return;
  if (ambienceSettingsLoadPromise) return ambienceSettingsLoadPromise;
  ambienceSettingsLoadPromise = (async () => {
    try {
      const storageArea = globalThis.chrome?.storage?.local;
      const stored = storageArea ? await storageArea.get([
        'ambienceMode', 'ambienceLevelDb', 'ambienceSettingsRevision'
      ]) : {};
      const storedRevision = Number(stored.ambienceSettingsRevision ?? 0);
      const storedLevelDb = Number(stored.ambienceLevelDb);
      if (storedRevision < 3 && stored.ambienceMode === 'quiet-room') {
        ambienceMode = DEFAULT_AMBIENCE_MODE;
      } else if (AMBIENCE_MODES.has(stored.ambienceMode)) {
        ambienceMode = stored.ambienceMode;
      }
      if (storedRevision < 3
          && (!Number.isFinite(storedLevelDb)
            || Math.abs(storedLevelDb + 42) < 0.001
            || Math.abs(storedLevelDb + 24) < 0.001)) {
        ambienceLevelDb = DEFAULT_AMBIENCE_LEVEL_DB;
      } else if (Number.isFinite(storedLevelDb)) {
        ambienceLevelDb = clamp(storedLevelDb, MIN_AMBIENCE_LEVEL_DB, MAX_AMBIENCE_LEVEL_DB);
      }
      await persistAmbienceSettings();
    } catch (error) {
      console.warn('Ambience settings could not be loaded.', error);
    } finally {
      ambienceSettingsLoaded = true;
    }
  })();
  try {
    await ambienceSettingsLoadPromise;
  } finally {
    ambienceSettingsLoadPromise = null;
  }
}

async function persistAmbienceSettings() {
  const storageArea = globalThis.chrome?.storage?.local;
  if (!storageArea) return false;
  await storageArea.set({
    ambienceMode,
    ambienceLevelDb,
    ambienceSettingsRevision: AMBIENCE_SETTINGS_REVISION
  });
  return true;
}

async function setAmbienceSettings(mode, levelDb) {
  await loadAmbienceSettings();
  cancelAmbiencePreview();
  ambienceMode = AMBIENCE_MODES.has(mode) ? mode : 'off';
  ambienceLevelDb = clamp(levelDb, MIN_AMBIENCE_LEVEL_DB, MAX_AMBIENCE_LEVEL_DB);
  ambienceSettingsLoaded = true;
  if (audioContext) {
    applyAmbience(false);
    rebuildAmbienceSource();
  }
  await persistAmbienceSettings();
  return state();
}

async function setAmbienceMode(value) {
  await loadAmbienceSettings();
  cancelAmbiencePreview();
  ambienceMode = AMBIENCE_MODES.has(value) ? value : 'off';
  ambienceSettingsLoaded = true;
  if (audioContext) {
    applyAmbience(false);
    rebuildAmbienceSource();
  }
  await persistAmbienceSettings();
  return state();
}

async function setAmbienceLevelDb(value) {
  await loadAmbienceSettings();
  cancelAmbiencePreview();
  ambienceLevelDb = clamp(value, MIN_AMBIENCE_LEVEL_DB, MAX_AMBIENCE_LEVEL_DB);
  ambienceSettingsLoaded = true;
  applyAmbience(false);
  await persistAmbienceSettings();
  return state();
}

function setPan(value) {
  const parsed = Number(value);
  currentPan = Number.isFinite(parsed) ? clamp(parsed, -1, 1) : 0;
  applyPan(false);
  return state();
}

function setMuted(value) {
  outputMuted = Boolean(value);
  if (masterGain && audioContext) {
    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(outputMuted ? 0 : 1, now + 0.015);
  }
  return state();
}

async function loadHrtfSettings() {
  if (hrtfSettingsLoaded) return;
  if (hrtfSettingsLoadPromise) return hrtfSettingsLoadPromise;
  hrtfSettingsLoadPromise = (async () => {
    try {
    const stored = await chrome.storage.local.get([
      'hrtfOutputGain', 'hrtfAzimuth', 'hrtfDistanceMeters',
      'hrtfDatasetId', 'hrtfSettingsRevision'
    ]);
    const storedRevision = Number(stored.hrtfSettingsRevision ?? 0);
    const storedGain = Number(stored.hrtfOutputGain);
    if (!Number.isFinite(storedGain)
        || (storedRevision < 2 && Math.abs(storedGain - 2) < 0.001)
        || (storedRevision < 6 && Math.abs(storedGain - 3) < 0.001)) {
      hrtfOutputGain = DEFAULT_HRTF_OUTPUT_GAIN;
    } else if (Number.isFinite(storedGain)) {
      hrtfOutputGain = clamp(stored.hrtfOutputGain, MIN_HRTF_OUTPUT_GAIN, MAX_HRTF_OUTPUT_GAIN);
    }
    if (storedRevision < 7) {
      currentAzimuth = -ASMR_SIDE_AZIMUTH_DEGREES;
    } else if (Number.isFinite(Number(stored.hrtfAzimuth))) {
      currentAzimuth = clamp(stored.hrtfAzimuth, -180, 180);
    }
    if (HRTF_DATASET_DEFINITIONS[stored.hrtfDatasetId]) {
      hrtfDatasetId = stored.hrtfDatasetId;
    }
    const storedDistance = Number(stored.hrtfDistanceMeters);
    const distanceIsPriorDefault = storedRevision < 7
      || !Number.isFinite(storedDistance)
      || (storedRevision < 2 && Math.abs(storedDistance - 0.25) < 0.001)
      || (storedRevision < 4 && Math.abs(storedDistance - 0.18) < 0.001);
    if (distanceIsPriorDefault) {
      currentDistanceMeters = DEFAULT_SOURCE_DISTANCE_METERS;
    } else if (Number.isFinite(storedDistance)) {
      currentDistanceMeters = clamp(
        storedDistance, MIN_SOURCE_DISTANCE_METERS, HRTF_REFERENCE_DISTANCE_METERS);
    }
    await chrome.storage.local.set({
      hrtfOutputGain,
      hrtfAzimuth: currentAzimuth,
      hrtfDistanceMeters: currentDistanceMeters,
      hrtfDatasetId,
      hrtfSettingsRevision: HRTF_SETTINGS_REVISION
    });
    } catch (error) {
      console.warn('HRTF settings could not be loaded.', error);
    } finally {
      hrtfSettingsLoaded = true;
    }
  })();
  try {
    await hrtfSettingsLoadPromise;
  } finally {
    hrtfSettingsLoadPromise = null;
  }
}

async function setHrtfOutputGain(value) {
  await loadHrtfSettings();
  hrtfOutputGain = clamp(value, MIN_HRTF_OUTPUT_GAIN, MAX_HRTF_OUTPUT_GAIN);
  hrtfSettingsLoaded = true;
  applyHrtfOutputGain(false);
  await chrome.storage.local.set({
    hrtfOutputGain,
    hrtfSettingsRevision: HRTF_SETTINGS_REVISION
  });
  return state();
}

async function setHrtfDataset(value) {
  await loadHrtfSettings();
  const nextDatasetId = HRTF_DATASET_DEFINITIONS[value]
    ? value
    : DEFAULT_HRTF_DATASET_ID;
  if (nextDatasetId === hrtfDatasetId) return state();

  await stopHrtfMotion(true);
  const previous = {
    datasetId: hrtfDatasetId,
    dataset: hrtfDataset,
    loadPromise: hrtfLoadPromise,
    loading: hrtfLoading,
    error: hrtfError,
    bufferCache: hrtfBufferCache,
    matchedPosition: hrtfMatchedPosition,
    matchedIndex: hrtfMatchedIndex,
    filterLength: hrtfFilterLength,
    azimuth: currentAzimuth,
    elevation: currentElevation,
    distanceMeters: currentDistanceMeters
  };
  let committedToAudio = false;

  try {
    // Prepare and validate the candidate before changing the saved/current ID.
    const preparedDataset = await loadHrtfDatasetById(nextDatasetId);
    hrtfDatasetId = nextDatasetId;
    hrtfLoadGeneration += 1;
    hrtfLoadPromise = null;
    hrtfDataset = preparedDataset;
    hrtfLoading = false;
    hrtfError = null;
    hrtfPositionRequestId += 1;
    hrtfBufferCache = new Map();
    hrtfMatchedPosition = null;
    hrtfMatchedIndex = null;
    hrtfFilterLength = null;

    if (audioContext) {
      await setHrtfPosition(currentAzimuth, currentElevation, currentDistanceMeters, {
        persist: false,
        fadeSeconds: 0.08,
        gainRampSeconds: 0.08
      });
      committedToAudio = true;
    }
    await chrome.storage.local.set({
      hrtfDatasetId,
      hrtfSettingsRevision: HRTF_SETTINGS_REVISION
    });
    return state();
  } catch (error) {
    hrtfLoadGeneration += 1;
    hrtfDatasetId = previous.datasetId;
    hrtfDataset = previous.dataset;
    hrtfLoadPromise = previous.loadPromise;
    hrtfLoading = previous.loading;
    hrtfError = previous.error;
    hrtfBufferCache = previous.bufferCache;
    hrtfPositionRequestId += 1;

    if (committedToAudio && audioContext && previous.dataset) {
      hrtfMatchedPosition = null;
      hrtfMatchedIndex = null;
      hrtfFilterLength = null;
      try {
        await setHrtfPosition(
          previous.azimuth, previous.elevation, previous.distanceMeters,
          { persist: false, fadeSeconds: 0.08, gainRampSeconds: 0.08 });
      } catch (rollbackError) {
        console.warn('Could not restore the previous HRTF filter.', rollbackError);
      }
    } else {
      hrtfMatchedPosition = previous.matchedPosition;
      hrtfMatchedIndex = previous.matchedIndex;
      hrtfFilterLength = previous.filterLength;
    }
    throw error;
  }
}

function findLeaf(sofa, name) {
  return sofa?.leaves?.find((leaf) => leaf.name === name) || null;
}

function firstFiniteNumber(value) {
  if (Array.isArray(value)) {
    for (const child of value) {
      const result = firstFiniteNumber(child);
      if (Number.isFinite(result)) return result;
    }
    return NaN;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function leafAttribute(leaf, name) {
  const attribute = leaf?.attributes?.find((item) => item.name === name);
  if (!attribute) return null;
  return Array.isArray(attribute.value) ? attribute.value[0] : attribute.value;
}

function parseHrtfJson(value, definition, datasetId) {
  const sofa = typeof value === 'string' ? JSON.parse(value) : value;
  const sourcePosition = findLeaf(sofa, 'SourcePosition');
  const dataIR = findLeaf(sofa, 'Data.IR');
  const samplingRate = findLeaf(sofa, 'Data.SamplingRate');
  const delay = findLeaf(sofa, 'Data.Delay');

  if (!sourcePosition?.data || !dataIR?.data) {
    throw new Error('HRTF JSON is missing SourcePosition or Data.IR.');
  }

  const sampleRate = firstFiniteNumber(samplingRate?.data);
  if (!Number.isFinite(sampleRate)) throw new Error('HRTF sample rate is missing.');
  if (sourcePosition.data.length !== dataIR.data.length) {
    throw new Error('HRTF position and impulse-response counts do not match.');
  }

  const coordinateType = String(leafAttribute(sourcePosition, 'Type') || 'spherical').toLowerCase();
  return {
    id: datasetId,
    name: sofa.name || 'Measured HRIR dataset',
    sourceUrl: definition.sourceUrl,
    positions: sourcePosition.data,
    irs: dataIR.data,
    delays: delay?.data || [[0, 0]],
    sampleRate,
    coordinateType,
    distanceAware: false,
    measuredDistancesMeters: definition.measuredDistancesMeters
  };
}

function decodeBase64Float32(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const view = new DataView(bytes.buffer);
  const floats = new Float32Array(bytes.byteLength / 4);
  for (let index = 0; index < floats.length; index += 1) {
    floats[index] = view.getFloat32(index * 4, true);
  }
  return floats;
}

function parseCompactHrtfJson(compact, definition, datasetId) {
  if (compact?.schemaVersion !== 1
      || compact?.irEncoding !== 'base64-float32-little-endian-position-receiver-sample') {
    throw new Error('Unsupported compact near-field HRTF format.');
  }
  const receiverCount = Number(compact.receiverCount);
  const irLength = Number(compact.irLength);
  const irData = decodeBase64Float32(compact.irsBase64);
  const expectedSamples = compact.positions.length * receiverCount * irLength;
  if (receiverCount !== 2 || irData.length !== expectedSamples) {
    throw new Error('Compact near-field HRTF sample count does not match its metadata.');
  }
  return {
    id: datasetId,
    name: compact.name,
    sourceUrl: compact.source || definition.sourceUrl,
    license: compact.license,
    positions: compact.positions,
    irData,
    irLength,
    receiverCount,
    delays: compact.delays || [[0, 0]],
    sampleRate: Number(compact.sampleRate),
    coordinateType: String(compact.coordinateType || 'spherical').toLowerCase(),
    distanceAware: true,
    measuredDistancesMeters: compact.measuredDistancesMeters.map(Number)
  };
}

async function loadHrtfDatasetById(datasetId) {
  const definition = HRTF_DATASET_DEFINITIONS[datasetId]
    || HRTF_DATASET_DEFINITIONS[DEFAULT_HRTF_DATASET_ID];
  const response = await fetch(definition.url, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`HRTF download failed: HTTP ${response.status}`);
  const json = await response.json();
  return json?.schemaVersion === 1
    ? parseCompactHrtfJson(json, definition, datasetId)
    : parseHrtfJson(json, definition, datasetId);
}

async function ensureHrtfDataset() {
  if (hrtfDataset) return hrtfDataset;
  if (hrtfLoadPromise) return hrtfLoadPromise;

  hrtfLoading = true;
  hrtfError = null;
  const loadingDatasetId = hrtfDatasetId;
  const loadingGeneration = ++hrtfLoadGeneration;
  hrtfLoadPromise = (async () => {
    const parsed = await loadHrtfDatasetById(loadingDatasetId);
    if (hrtfDatasetId === loadingDatasetId && hrtfLoadGeneration === loadingGeneration) {
      hrtfDataset = parsed;
    }
    return parsed;
  })()
    .catch((error) => {
      if (hrtfLoadGeneration === loadingGeneration) hrtfError = error.message;
      throw error;
    })
    .finally(() => {
      if (hrtfLoadGeneration === loadingGeneration) {
        hrtfLoading = false;
        hrtfLoadPromise = null;
      }
    });

  return hrtfLoadPromise;
}

function degreesToRadians(degrees) {
  return Number(degrees) * Math.PI / 180;
}

function sphericalUnitVector(azimuthDeg, elevationDeg) {
  const azimuth = degreesToRadians(azimuthDeg);
  const elevation = degreesToRadians(elevationDeg);
  const cosElevation = Math.cos(elevation);
  return [
    cosElevation * Math.cos(azimuth),
    cosElevation * Math.sin(azimuth),
    Math.sin(elevation)
  ];
}

function normalizeVector(vector) {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function sourcePositionVector(position, coordinateType) {
  if (coordinateType.includes('spherical')) {
    return sphericalUnitVector(Number(position[0]), Number(position[1]));
  }
  return normalizeVector([Number(position[0]), Number(position[1]), Number(position[2])]);
}

function nearestMeasuredDistance(dataset, requestedDistanceMeters) {
  if (!dataset.distanceAware || !dataset.measuredDistancesMeters?.length) return null;
  const requested = Number(requestedDistanceMeters);
  return dataset.measuredDistancesMeters.reduce((best, candidate) => (
    Math.abs(candidate - requested) < Math.abs(best - requested) ? candidate : best
  ));
}

function nearestHrtfPosition(
    dataset, userAzimuth, userElevation, requestedDistanceMeters = null) {
  // SOFA spherical convention uses positive azimuth to the listener's left.
  // The UI uses the more intuitive negative=left / positive=right convention.
  const target = sphericalUnitVector(-userAzimuth, userElevation);
  const measuredDistance = nearestMeasuredDistance(dataset, requestedDistanceMeters);
  let bestIndex = 0;
  let bestDot = -Infinity;

  for (let index = 0; index < dataset.positions.length; index += 1) {
    if (measuredDistance !== null
        && Math.abs(Number(dataset.positions[index][2]) - measuredDistance) > 0.0001) {
      continue;
    }
    const vector = sourcePositionVector(dataset.positions[index], dataset.coordinateType);
    const dot = target[0] * vector[0] + target[1] * vector[1] + target[2] * vector[2];
    if (dot > bestDot) {
      bestDot = dot;
      bestIndex = index;
    }
  }
  return { index: bestIndex, dot: bestDot, radius: measuredDistance };
}

function delayForChannel(dataset, index, channel) {
  const delays = dataset.delays;
  if (!Array.isArray(delays) || !Array.isArray(delays[0])) return 0;
  const pair = Array.isArray(delays[index]) ? delays[index] : delays[0];
  return Math.max(0, Number(pair?.[channel] ?? 0));
}

function applyFractionalSampleDelay(input, delaySamples) {
  const output = new Float32Array(input.length);
  if (!Number.isFinite(delaySamples) || delaySamples <= 0) {
    output.set(input);
    return output;
  }

  // Positive delay: y[n] = x[n-delay]. Linear interpolation is used only for
  // the fractional part. The SOFA datasets used here normally carry short
  // receiver delays; the spectral HRTF itself remains in the FIR samples.
  for (let n = 0; n < output.length; n += 1) {
    const sourceIndex = n - delaySamples;
    if (sourceIndex < 0) continue;
    const i0 = Math.floor(sourceIndex);
    const frac = sourceIndex - i0;
    const a = input[i0] ?? 0;
    const b = input[i0 + 1] ?? 0;
    output[n] = a + (b - a) * frac;
  }
  return output;
}

async function resampleStereoImpulse(channels, inputRate, outputRate) {
  const delayedLeft = channels[0];
  const delayedRight = channels[1];
  if (inputRate === outputRate) {
    const buffer = new AudioBuffer({
      numberOfChannels: 2,
      length: delayedLeft.length,
      sampleRate: outputRate
    });
    buffer.getChannelData(0).set(delayedLeft);
    buffer.getChannelData(1).set(delayedRight);
    return buffer;
  }

  const outputLength = Math.ceil(delayedLeft.length * outputRate / inputRate);
  const offline = new OfflineAudioContext(2, outputLength, outputRate);
  const inputBuffer = new AudioBuffer({
    numberOfChannels: 2,
    length: delayedLeft.length,
    sampleRate: inputRate
  });
  inputBuffer.getChannelData(0).set(delayedLeft);
  inputBuffer.getChannelData(1).set(delayedRight);

  const source = offline.createBufferSource();
  source.buffer = inputBuffer;
  source.connect(offline.destination);
  source.start();
  return offline.startRendering();
}

function impulseChannel(dataset, positionIndex, channel) {
  if (dataset.irData instanceof Float32Array) {
    const offset = (positionIndex * dataset.receiverCount + channel) * dataset.irLength;
    return dataset.irData.subarray(offset, offset + dataset.irLength);
  }
  const positionIR = dataset.irs?.[positionIndex];
  if (!Array.isArray(positionIR) || positionIR.length !== 2) {
    throw new Error('HRTF position is not a two-ear impulse response.');
  }
  return Float32Array.from(positionIR[channel]);
}

async function hrtfBufferForSpatialPosition(
    dataset, spatial, sourceAzimuth, sourceDistanceMeters,
    elevation = currentElevation) {
  if (!audioContext) throw new Error('Start tab capture before enabling binaural mode.');
  const sourceNearest = nearestHrtfPosition(
    dataset, sourceAzimuth, elevation, sourceDistanceMeters);
  const leftNearest = dataset.distanceAware
    ? sourceNearest
    : nearestHrtfPosition(dataset, spatial.leftEarAzimuth, elevation);
  const rightNearest = dataset.distanceAware
    ? sourceNearest
    : nearestHrtfPosition(dataset, spatial.rightEarAzimuth, elevation);
  const cacheKey = `${dataset.id}:${leftNearest.index}:${rightNearest.index}:${audioContext.sampleRate}`;
  if (hrtfBufferCache.has(cacheKey)) return hrtfBufferCache.get(cacheKey);

  const left = applyFractionalSampleDelay(
    impulseChannel(dataset, leftNearest.index, 0),
    delayForChannel(dataset, leftNearest.index, 0));
  const right = applyFractionalSampleDelay(
    impulseChannel(dataset, rightNearest.index, 1),
    delayForChannel(dataset, rightNearest.index, 1));
  const length = Math.max(left.length, right.length);
  const paddedLeft = new Float32Array(length);
  const paddedRight = new Float32Array(length);
  paddedLeft.set(left);
  paddedRight.set(right);
  const buffer = await resampleStereoImpulse(
    [paddedLeft, paddedRight], dataset.sampleRate, audioContext.sampleRate);
  const result = {
    buffer,
    matchedIndex: sourceNearest.index,
    measuredDistanceMeters: sourceNearest.radius,
    leftIndex: leftNearest.index,
    rightIndex: rightNearest.index
  };
  hrtfBufferCache.set(cacheKey, result);
  return result;
}

function readableMatchedPosition(dataset, index) {
  const position = dataset.positions[index];
  if (!position) return null;
  if (dataset.coordinateType.includes('spherical')) {
    return {
      azimuth: normalizeAzimuth(-Number(position[0])),
      elevation: Number(position[1]),
      radius: Number(position[2] ?? 1)
    };
  }
  return { x: Number(position[0]), y: Number(position[1]), z: Number(position[2]) };
}

async function setHrtfPosition(
    azimuth, elevation = 0, distanceMeters = currentDistanceMeters, options = {}) {
  const requestId = ++hrtfPositionRequestId;
  const nextAzimuth = clamp(azimuth, -180, 180);
  const nextElevation = clamp(elevation, -90, 90);
  const nextDistanceMeters = clamp(
    distanceMeters, MIN_SOURCE_DISTANCE_METERS, HRTF_REFERENCE_DISTANCE_METERS);

  const dataset = await ensureHrtfDataset();
  if (!audioContext || !hrtfConvolverA || !hrtfConvolverB) {
    throw new Error('Start tab capture before selecting a binaural position.');
  }

  const spatial = spatialGeometry(nextAzimuth, nextDistanceMeters);
  const bufferResult = await hrtfBufferForSpatialPosition(
    dataset, spatial, nextAzimuth, nextDistanceMeters, nextElevation);
  if (requestId !== hrtfPositionRequestId) return state();

  currentAzimuth = nextAzimuth;
  currentElevation = nextElevation;
  currentDistanceMeters = nextDistanceMeters;
  const filterChanged = hrtfMatchedPosition?.leftIndex !== bufferResult.leftIndex
    || hrtfMatchedPosition?.rightIndex !== bufferResult.rightIndex;
  if (filterChanged) {
    const nextSlot = activeHrtfSlot === 'A' ? 'B' : 'A';
    const nextConvolver = nextSlot === 'A' ? hrtfConvolverA : hrtfConvolverB;
    const nextGain = nextSlot === 'A' ? hrtfGainA : hrtfGainB;
    const oldGain = nextSlot === 'A' ? hrtfGainB : hrtfGainA;
    // Preserve the measured near-field magnitude. Web Audio's automatic IR
    // normalization is retained only for the legacy far-field comparison.
    nextConvolver.normalize = !dataset.distanceAware;
    nextConvolver.buffer = bufferResult.buffer;
    const now = audioContext.currentTime;
    const fade = clamp(options.fadeSeconds ?? 0.035, 0.02, 0.25);
    nextGain.gain.cancelScheduledValues(now);
    oldGain.gain.cancelScheduledValues(now);
    nextGain.gain.setValueAtTime(nextGain.gain.value, now);
    oldGain.gain.setValueAtTime(oldGain.gain.value, now);
    nextGain.gain.linearRampToValueAtTime(1, now + fade);
    oldGain.gain.linearRampToValueAtTime(0, now + fade);
    activeHrtfSlot = nextSlot;
  }
  applySpatialDistance(false, clamp(options.gainRampSeconds ?? 0.035, 0.02, 0.25));

  hrtfMatchedIndex = bufferResult.matchedIndex;
  hrtfMatchedPosition = {
    ...readableMatchedPosition(dataset, bufferResult.matchedIndex),
    measuredDistanceMeters: bufferResult.measuredDistanceMeters,
    leftIndex: bufferResult.leftIndex,
    rightIndex: bufferResult.rightIndex,
    leftEarAzimuth: spatial.leftEarAzimuth,
    rightEarAzimuth: spatial.rightEarAzimuth
  };
  hrtfFilterLength = bufferResult.buffer.length;
  if (options.persist !== false) {
    await persistHrtfPosition();
  }
  return state();
}

async function setMode(mode) {
  if (!['pan', 'hrtf'].includes(mode)) throw new Error(`Unknown mode: ${mode}`);
  if (mode === 'pan' && hrtfMotion.active) await stopHrtfMotion(true);
  if (mode === 'hrtf') {
    if (!audioContext) throw new Error('Start tab capture before enabling binaural mode.');
    // Load a valid FIR before cross-fading into the HRTF path.
    if (hrtfMatchedIndex === null) {
      await setHrtfPosition(currentAzimuth, currentElevation, currentDistanceMeters);
    }
  }
  processingMode = mode;
  applyMode(false);
  return state();
}

async function playChannelTest(side) {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext({ latencyHint: 'interactive' });
    await audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const merger = audioContext.createChannelMerger(2);
  oscillator.type = 'sine';
  oscillator.frequency.value = side === 'left' ? 440 : 660;
  gain.gain.value = 0.055;
  oscillator.connect(gain);
  gain.connect(merger, 0, side === 'left' ? 0 : 1);
  merger.connect(audioContext.destination);

  const now = audioContext.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.055, now + 0.02);
  gain.gain.setValueAtTime(0.055, now + 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
  oscillator.start(now);
  oscillator.stop(now + 0.5);
  oscillator.onended = () => [oscillator, gain, merger].forEach(disconnectNode);
  return state();
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.target !== 'offscreen') return;

  (async () => {
    switch (message.type) {
      case 'start-capture':
        return { ok: true, state: await startCapture(message.streamId, message.tabId) };
      case 'stop-capture':
        await stopCapture();
        return { ok: true, state: state() };
      case 'set-pan':
        return { ok: true, state: setPan(message.value) };
      case 'set-mode':
        return { ok: true, state: await setMode(message.value) };
      case 'set-hrtf-output-gain':
        return { ok: true, state: await setHrtfOutputGain(message.value) };
      case 'set-hrtf-dataset':
        return { ok: true, state: await setHrtfDataset(message.value) };
      case 'set-texture-preset':
        return { ok: true, state: await setTexturePreset(message.value) };
      case 'set-texture-component':
        return { ok: true, state: await setTextureComponent(message.component, message.value) };
      case 'set-vibration-enabled':
        return { ok: true, state: await setVibrationEnabled(message.value) };
      case 'set-vibration-intensity':
        return { ok: true, state: await setVibrationIntensity(message.value) };
      case 'set-deesser-enabled':
        return { ok: true, state: await setDeEsserEnabled(message.value) };
      case 'set-deesser-intensity':
        return { ok: true, state: await setDeEsserIntensity(message.value) };
      case 'set-early-reflections-enabled':
        return { ok: true, state: await setEarlyReflectionsEnabled(message.value) };
      case 'set-early-reflections-intensity':
        return { ok: true, state: await setEarlyReflectionsIntensity(message.value) };
      case 'set-ambience-mode':
        return { ok: true, state: await setAmbienceMode(message.value) };
      case 'set-ambience-level':
        return { ok: true, state: await setAmbienceLevelDb(message.value) };
      case 'set-ambience-settings':
        return { ok: true, state: await setAmbienceSettings(message.mode, message.levelDb) };
      case 'preview-ambience':
        return { ok: true, state: previewAmbience() };
      case 'set-hrtf-position':
      case 'set-spatial-position':
        await stopHrtfMotion(false);
        return { ok: true, state: await setHrtfPosition(
          message.azimuth, message.elevation, message.distanceMeters) };
      case 'start-hrtf-motion':
        return { ok: true, state: await startHrtfMotion(
          message.pattern, message.durationSeconds, message.rearTransitionSeconds) };
      case 'stop-hrtf-motion':
        return { ok: true, state: await stopHrtfMotion(true) };
      case 'start-passive-test':
        return { ok: true, state: await startPassiveTest({
          durationSeconds: message.durationSeconds,
          silenceLimitSeconds: message.silenceLimitSeconds,
          startTimeoutSeconds: message.startTimeoutSeconds,
          sampleIntervalMs: message.sampleIntervalMs,
          completionMode: message.completionMode,
          sceneCount: message.sceneCount
        }) };
      case 'stop-passive-test':
        return { ok: true, state: await stopPassiveTest() };
      case 'preload-hrtf':
        await ensureHrtfDataset();
        return { ok: true, state: state() };
      case 'set-muted':
        return { ok: true, state: setMuted(message.value) };
      case 'test-channel':
        return { ok: true, state: await playChannelTest(message.side) };
      case 'get-state':
        await Promise.all([
          loadHrtfSettings(), loadTextureSettings(), loadAmbienceSettings()
        ]);
        return { ok: true, state: state() };
      default:
        return { ok: false, error: `Unknown message type: ${message.type}` };
    }
  })()
    .then(sendResponse)
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});
