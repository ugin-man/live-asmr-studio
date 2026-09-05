let creatingOffscreen = null;
let captureQueue = Promise.resolve();
let latestCaptureGeneration = 0;
let capturePhase = 'idle';
let lastCaptureError = null;
let lastCaptureAttemptTab = null;

function enqueueCapture(operation) {
  const pending = captureQueue.catch(() => {}).then(operation);
  captureQueue = pending.catch(() => {});
  return pending;
}

async function hasOffscreenDocument() {
  const contexts = await chrome.runtime.getContexts({});
  return contexts.some((context) => context.contextType === 'OFFSCREEN_DOCUMENT');
}

async function ensureOffscreenDocument() {
  if (await hasOffscreenDocument()) return;

  if (!creatingOffscreen) {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA', 'AUDIO_PLAYBACK'],
      justification: 'Capture the active tab audio and route it through local Web Audio binaural processing.'
    }).finally(() => {
      creatingOffscreen = null;
    });
  }

  await creatingOffscreen;
}

async function sendToAudioEngine(message) {
  await ensureOffscreenDocument();
  const response = await chrome.runtime.sendMessage({ target: 'offscreen', ...message });
  if (!response?.ok) throw new Error(response?.error || 'Audio engine did not respond.');
  return response.state;
}

async function getCaptureInfo(tabId) {
  const captures = await chrome.tabCapture.getCapturedTabs();
  return captures.find((item) => item.tabId === tabId) || null;
}

function hostForUrl(url) {
  try { return new URL(url).host; } catch { return ''; }
}

function isSupportedChatGptUrl(url) {
  const host = hostForUrl(url).toLowerCase();
  return host === 'chatgpt.com' || host.endsWith('.chatgpt.com')
    || host === 'chat.openai.com';
}

async function tabMetadata(tabOrId) {
  let tab = typeof tabOrId === 'object' ? tabOrId : null;
  const tabId = Number(tab?.id ?? tabOrId);
  if (!tab?.id && Number.isInteger(tabId)) {
    try { tab = await chrome.tabs.get(tabId); } catch { tab = { id: tabId }; }
  }
  if (!tab?.id) return null;
  return {
    id: tab.id,
    title: tab.title || '',
    url: tab.url || '',
    host: hostForUrl(tab.url || '')
  };
}

async function setBadge(tabId, text) {
  if (!tabId) return;
  try {
    await chrome.action.setBadgeText({ tabId, text });
    if (text) {
      await chrome.action.setBadgeBackgroundColor({
        tabId,
        color: text === 'ON' ? '#34785b' : text === '!' ? '#a63f50' : '#555b63'
      });
    }
  } catch (error) {
    console.warn('Could not update capture badge:', error);
  }
}

async function stopCurrentCapture() {
  const before = await sendToAudioEngine({ type: 'get-state' });
  const previousTabId = before?.tabId;
  const state = before?.capturing || previousTabId
    ? await sendToAudioEngine({ type: 'stop-capture' })
    : before;
  if (previousTabId) await setBadge(previousTabId, '');
  capturePhase = 'idle';
  return state;
}

async function captureInvokedTab(tab, streamIdPromise) {
  if (!tab?.id) throw new Error('Could not identify the active tab.');

  const generation = ++latestCaptureGeneration;
  const previousAttemptTabId = lastCaptureAttemptTab?.id;
  lastCaptureAttemptTab = { id: tab.id, title: tab.title || '', url: tab.url || '', host: hostForUrl(tab.url || '') };
  lastCaptureError = null;
  capturePhase = 'starting';

  // Handle rejection immediately, including while an older capture is starting.
  const operation = Promise.resolve(streamIdPromise)
    .then((streamId) => ({ streamId }), (error) => ({ error }))
    .then(({ streamId, error }) => enqueueCapture(async () => {
    if (generation !== latestCaptureGeneration) return { cancelled: true };

    if (previousAttemptTabId && previousAttemptTabId !== tab.id) {
      await setBadge(previousAttemptTabId, '');
    }
    await setBadge(tab.id, '…');
    await ensureOffscreenDocument();
    if (generation !== latestCaptureGeneration) {
      await setBadge(tab.id, '');
      return { cancelled: true };
    }

    const existing = await sendToAudioEngine({ type: 'get-state' });
    if (generation !== latestCaptureGeneration) return { cancelled: true };
    const previousTabId = existing?.tabId;
    // Opening the panel on the already captured tab must not restart audio.
    // Chrome may reject a redundant stream request; the live stream is valid.
    if (existing?.capturing && previousTabId === tab.id) {
      capturePhase = 'active';
      lastCaptureError = null;
      await setBadge(tab.id, 'ON');
      return existing;
    }
    if (error) throw error;
    if (existing?.capturing || previousTabId) {
      await sendToAudioEngine({ type: 'stop-capture' });
      if (previousTabId) await setBadge(previousTabId, '');
    }
    if (generation !== latestCaptureGeneration) {
      await setBadge(tab.id, '');
      return { cancelled: true };
    }

    const state = await sendToAudioEngine({
      type: 'start-capture',
      streamId,
      tabId: tab.id
    });

    if (generation !== latestCaptureGeneration) {
      await sendToAudioEngine({ type: 'stop-capture' });
      await setBadge(tab.id, '');
      return { cancelled: true };
    }

    capturePhase = 'active';
    lastCaptureError = null;
    await setBadge(tab.id, 'ON');
    return state;
    })).catch(async (error) => {
    if (generation === latestCaptureGeneration) {
      capturePhase = 'error';
      lastCaptureError = error?.message || String(error);
      await setBadge(tab.id, '!');
    }
    throw error;
  });

  return operation;
}

async function productState() {
  const state = await sendToAudioEngine({ type: 'get-state' });
  const activeTab = state?.tabId ? await tabMetadata(state.tabId) : null;
  const capture = state?.tabId ? await getCaptureInfo(state.tabId) : null;
  if (state?.capturing && !['starting', 'stopping', 'error'].includes(capturePhase)) capturePhase = 'active';
  else if (capturePhase === 'active') capturePhase = 'idle';
  return {
    state,
    capture,
    tab: activeTab,
    phase: capturePhase,
    lastError: lastCaptureError,
    lastAttemptTab: lastCaptureAttemptTab
  };
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) return;

  chrome.sidePanel.open({ tabId: tab.id }).catch((error) => {
    console.error('Could not open side panel:', error);
  });

  if (!isSupportedChatGptUrl(tab.url || '')) {
    latestCaptureGeneration += 1;
    capturePhase = 'error';
    lastCaptureAttemptTab = {
      id: tab.id,
      title: tab.title || '',
      url: tab.url || '',
      host: hostForUrl(tab.url || '')
    };
    lastCaptureError = 'ChatGPT Voice Liveのタブを前面にしてから、Live ASMR Studioアイコンを押してください。';
    setBadge(tab.id, '!');
    return;
  }

  const streamIdPromise = chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
  captureInvokedTab(tab, streamIdPromise).catch((error) => {
    console.error('Failed to capture invoked tab:', error);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.target !== 'background') return;

  (async () => {
    switch (message.type) {
      case 'audio-settings-get':
      case 'audio-settings-set': {
        if (sender.id !== chrome.runtime.id
            || sender.url !== chrome.runtime.getURL('offscreen.html')) {
          throw new Error('Audio settings requests must come from the audio engine.');
        }
        const keys = message.type === 'audio-settings-get'
          ? message.keys : Object.keys(message.values || {});
        if (!Array.isArray(keys) || !keys.every((key) => typeof key === 'string'
            && /^(hrtf|texture|vibration|deEsser|earlyReflections|ambience)/.test(key))) {
          throw new Error('Invalid audio settings keys.');
        }
        if (message.type === 'audio-settings-get') {
          return { ok: true, values: await chrome.storage.local.get(keys) };
        }
        await chrome.storage.local.set(message.values);
        return { ok: true };
      }
      case 'prepare-engine':
        await ensureOffscreenDocument();
        return { ok: true };
      case 'get-product-state':
        return { ok: true, product: await productState() };
      case 'get-capture-info': {
        const state = await sendToAudioEngine({ type: 'get-state' });
        const tabId = message.tabId || state?.tabId;
        return {
          ok: true,
          capture: tabId ? await getCaptureInfo(tabId) : null
        };
      }
      case 'stop-capture': {
        latestCaptureGeneration += 1;
        lastCaptureError = null;
        capturePhase = 'stopping';
        const attemptTabId = lastCaptureAttemptTab?.id;
        return { ok: true, state: await enqueueCapture(async () => {
          const stopped = await stopCurrentCapture();
          if (attemptTabId) await setBadge(attemptTabId, '');
          return stopped;
        }) };
      }
      case 'capture-ended':
        if (message.tabId) await setBadge(message.tabId, '');
        {
          const current = await sendToAudioEngine({ type: 'get-state' });
          const anotherCaptureIsActive = current?.capturing
            && current?.tabId && current.tabId !== message.tabId;
          capturePhase = anotherCaptureIsActive ? 'active' : 'idle';
          lastCaptureError = anotherCaptureIsActive
            ? null
            : message.reason === 'track-ended'
              ? '取得していたタブ音声が終了しました。必要なら対象タブで拡張機能アイコンを押してください。'
              : null;
        }
        return { ok: true };
      case 'clear-badge':
        if (message.tabId) await setBadge(message.tabId, '');
        return { ok: true };
      default:
        return { ok: false, error: `Unknown message type: ${message.type}` };
    }
  })()
    .then(sendResponse)
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});
