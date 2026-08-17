const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const extensionRoot = path.resolve(__dirname, '..', 'extension');
const source = fs.readFileSync(path.join(extensionRoot, 'background.js'), 'utf8');

let actionClickListener = null;
let backgroundMessageListener = null;
let engineState = { capturing: false, tabId: null, mode: 'hrtf' };
let streamIdFactory = (tabId) => Promise.resolve(`stream-${tabId}`);
let streamRequestCount = 0;
const failedStartTabs = new Set();
const badges = new Map();
const badgeHistory = [];
const tabs = new Map([
  [1, { id: 1, title: 'ChatGPT A', url: 'https://chatgpt.com/c/a' }],
  [2, { id: 2, title: 'ChatGPT B', url: 'https://chatgpt.com/c/b' }],
  [3, { id: 3, title: 'Unrelated tab', url: 'https://example.com/' }]
]);

const chrome = {
  runtime: {
    getContexts: async () => [{ contextType: 'OFFSCREEN_DOCUMENT' }],
    sendMessage: async (message) => {
      assert.equal(message.target, 'offscreen');
      if (message.type === 'get-state') return { ok: true, state: { ...engineState } };
      if (message.type === 'stop-capture') {
        engineState = { capturing: false, tabId: null, mode: 'hrtf' };
        return { ok: true, state: { ...engineState } };
      }
      if (message.type === 'start-capture') {
        if (failedStartTabs.has(message.tabId)) {
          return { ok: false, error: `start failed for ${message.tabId}` };
        }
        engineState = { capturing: true, tabId: message.tabId, mode: 'hrtf' };
        return { ok: true, state: { ...engineState } };
      }
      throw new Error(`Unexpected offscreen message: ${message.type}`);
    },
    onMessage: {
      addListener(listener) { backgroundMessageListener = listener; }
    }
  },
  offscreen: { createDocument: async () => {} },
  tabCapture: {
    getMediaStreamId: ({ targetTabId }) => {
      streamRequestCount += 1;
      return streamIdFactory(targetTabId);
    },
    getCapturedTabs: async () => engineState.capturing
      ? [{ tabId: engineState.tabId, status: 'active' }]
      : []
  },
  action: {
    onClicked: { addListener(listener) { actionClickListener = listener; } },
    async setBadgeText({ tabId, text }) {
      badges.set(tabId, text);
      badgeHistory.push({ tabId, text });
    },
    async setBadgeBackgroundColor() {}
  },
  sidePanel: { open: async () => {} },
  tabs: { get: async (tabId) => tabs.get(tabId) || { id: tabId } }
};

vm.runInContext(source, vm.createContext({ chrome, URL, console, setTimeout, clearTimeout }), {
  filename: 'background.js'
});
assert.equal(typeof actionClickListener, 'function');
assert.equal(typeof backgroundMessageListener, 'function');

function waitFor(predicate, label, timeoutMs = 1000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (predicate()) return resolve();
      if (Date.now() - started >= timeoutMs) return reject(new Error(`Timed out: ${label}`));
      setTimeout(check, 5);
    };
    check();
  });
}

function sendBackground(message) {
  return new Promise((resolve, reject) => {
    try {
      const keepAlive = backgroundMessageListener(message, {}, resolve);
      assert.equal(keepAlive, true);
    } catch (error) { reject(error); }
  });
}

(async () => {
  actionClickListener(tabs.get(1));
  await waitFor(() => badges.get(1) === 'ON', 'tab 1 capture');
  assert.equal(engineState.tabId, 1);

  actionClickListener(tabs.get(2));
  await waitFor(() => badges.get(2) === 'ON', 'tab 2 capture');
  assert.equal(engineState.tabId, 2);
  assert.equal(badges.get(1), '');
  assert.ok(badgeHistory.findIndex((item) => item.tabId === 1 && item.text === '')
    < badgeHistory.findIndex((item) => item.tabId === 2 && item.text === 'ON'));

  await sendBackground({ target: 'background', type: 'capture-ended', tabId: 2, reason: 'track-ended' });
  engineState = { capturing: false, tabId: null, mode: 'hrtf' };
  assert.equal(badges.get(2), '');
  const endedState = await sendBackground({ target: 'background', type: 'get-product-state' });
  assert.equal(endedState.product.phase, 'idle');
  assert.match(endedState.product.lastError, /終了/);

  let resolveSlowStream;
  streamIdFactory = (tabId) => tabId === 1
    ? new Promise((resolve) => { resolveSlowStream = resolve; })
    : Promise.resolve(`stream-${tabId}`);
  actionClickListener(tabs.get(1));
  actionClickListener(tabs.get(2));
  await waitFor(() => badges.get(2) === 'ON', 'newer tab must not wait for stale stream');
  assert.equal(engineState.tabId, 2);
  resolveSlowStream('stream-1');
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(engineState.tabId, 2);
  assert.notEqual(badges.get(1), 'ON');

  streamIdFactory = (tabId) => Promise.resolve(`stream-${tabId}`);
  failedStartTabs.add(2);
  actionClickListener(tabs.get(2));
  await waitFor(() => badges.get(2) === '!', 'failed restart badge');
  assert.equal(engineState.capturing, false);
  const failedState = await sendBackground({ target: 'background', type: 'get-product-state' });
  assert.equal(failedState.product.phase, 'error');
  assert.match(failedState.product.lastError, /start failed/);

  const requestsBeforeUnsupportedTab = streamRequestCount;
  actionClickListener(tabs.get(3));
  await waitFor(() => badges.get(3) === '!', 'unsupported tab badge');
  assert.equal(streamRequestCount, requestsBeforeUnsupportedTab);
  const unsupportedState = await sendBackground({ target: 'background', type: 'get-product-state' });
  assert.match(unsupportedState.product.lastError, /ChatGPT Voice Live/);

  console.log('v0.15.0 capture ownership and badge lifecycle test passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
