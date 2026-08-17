globalThis.UiI18n = (() => {
  const DEFAULT_LOCALE = 'en';
  const STORAGE_KEY = 'productLocaleV1';
  const LANGUAGE_OPTIONS = Object.freeze([
    { id: 'en', label: 'English' },
    { id: 'ja', label: '日本語' },
    { id: 'zh-CN', label: '简体中文' },
    { id: 'ko', label: '한국어' },
    { id: 'es', label: 'Español' }
  ]);
  const supported = new Set(LANGUAGE_OPTIONS.map((option) => option.id));
  const postTranslationFixes = Object.freeze({
    en: Object.freeze([
      ['sharp kisses', 'sharp interjections'],
      ['contrived secret story tone', 'affected secretive tone']
    ])
  });
  let currentLocale = DEFAULT_LOCALE;
  let observer = null;
  const replacementCache = new Map();
  const templateCache = new Map();

  function normalizeLocale(value) {
    return supported.has(value) ? value : DEFAULT_LOCALE;
  }

  function messages(locale = currentLocale) {
    return globalThis.UiLocaleMessages?.[normalizeLocale(locale)] || {};
  }

  function replacementEntries(locale = currentLocale) {
    const normalized = normalizeLocale(locale);
    if (!replacementCache.has(normalized)) {
      replacementCache.set(normalized, Object.entries(messages(normalized))
        .filter(([source, translated]) => source && translated && source !== translated)
        .sort(([left], [right]) => right.length - left.length));
    }
    return replacementCache.get(normalized);
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function templateEntries(locale = currentLocale) {
    const normalized = normalizeLocale(locale);
    if (!templateCache.has(normalized)) {
      const entries = Object.entries(messages(normalized)).flatMap(([source, translated]) => {
        const matches = [...source.matchAll(/\{(\d+)\}/g)];
        const fixedCharacters = source.replace(/\{\d+\}/g, '').length;
        if (!matches.length || fixedCharacters < 10 || source === translated) return [];
        const parts = source.split(/\{\d+\}/g).map(escapeRegExp);
        const pattern = parts.map((part, index) =>
          index < parts.length - 1 ? `${part}([\\s\\S]*?)` : part).join('');
        return [{ source, translated, regex: new RegExp(pattern, 'g') }];
      }).sort((left, right) => right.source.length - left.source.length);
      templateCache.set(normalized, entries);
    }
    return templateCache.get(normalized);
  }

  function translateTemplates(value, locale, depth) {
    let translated = value;
    for (const entry of templateEntries(locale)) {
      translated = translated.replace(entry.regex, (...args) => {
        const captures = args.slice(1, -2);
        return entry.translated.replace(/\{(\d+)\}/g, (_, index) => {
          const capture = captures[Number(index)] ?? '';
          return depth < 3 ? text(capture, locale, depth + 1) : capture;
        });
      });
    }
    return translated;
  }

  function text(value, locale = currentLocale, depth = 0) {
    const source = String(value ?? '');
    const normalized = normalizeLocale(locale);
    if (normalized === 'ja' || !source) return source;
    const exact = messages(normalized)[source];
    if (exact) return applyPostTranslationFixes(exact, normalized);
    let translated = translateTemplates(source, normalized, depth);
    for (const [candidate, replacement] of replacementEntries(normalized)) {
      if (translated.includes(candidate)) translated = translated.split(candidate).join(replacement);
    }
    return applyPostTranslationFixes(translated, normalized);
  }

  function applyPostTranslationFixes(value, locale) {
    let corrected = value;
    for (const [source, replacement] of postTranslationFixes[locale] || []) {
      corrected = corrected.split(source).join(replacement);
    }
    return corrected;
  }

  function localizeTextNode(node) {
    if (!node?.nodeValue || node.parentElement?.closest('[data-i18n-skip]')) return;
    node.nodeValue = text(node.nodeValue);
  }

  function localizeElement(element) {
    if (!(element instanceof Element) || element.closest('[data-i18n-skip]')) return;
    for (const candidate of [element, ...element.querySelectorAll('*')]) {
      if (candidate.closest('[data-i18n-skip]')) continue;
      for (const attribute of ['aria-label', 'placeholder', 'title']) {
        if (candidate.hasAttribute(attribute)) {
          candidate.setAttribute(attribute, text(candidate.getAttribute(attribute)));
        }
      }
    }
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) localizeTextNode(node);
  }

  function localizeMutation(mutation) {
    if (mutation.type === 'characterData') {
      localizeTextNode(mutation.target);
      return;
    }
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.TEXT_NODE) localizeTextNode(node);
      else if (node.nodeType === Node.ELEMENT_NODE) localizeElement(node);
    }
  }

  function startObserver() {
    observer?.disconnect();
    observer = new MutationObserver((mutations) => {
      observer.disconnect();
      for (const mutation of mutations) localizeMutation(mutation);
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  async function readStoredLocale() {
    const storage = globalThis.chrome?.storage?.local;
    if (!storage) return normalizeLocale(globalThis.sessionStorage?.getItem(STORAGE_KEY));
    const stored = await storage.get([STORAGE_KEY]);
    return normalizeLocale(stored[STORAGE_KEY]);
  }

  async function setLocale(locale) {
    const normalized = normalizeLocale(locale);
    const storage = globalThis.chrome?.storage?.local;
    if (storage) await storage.set({ [STORAGE_KEY]: normalized });
    else globalThis.sessionStorage?.setItem(STORAGE_KEY, normalized);
    currentLocale = normalized;
    globalThis.location.reload();
  }

  async function initialize() {
    try {
      currentLocale = await readStoredLocale();
    } catch {
      currentLocale = DEFAULT_LOCALE;
    }
    document.documentElement.lang = currentLocale;
    const selector = document.getElementById('language-selector');
    if (selector) {
      selector.value = currentLocale;
      selector.addEventListener('change', () => setLocale(selector.value));
    }
    localizeElement(document.body);
    startObserver();
    document.body.classList.remove('i18n-pending');
    return currentLocale;
  }

  const ready = initialize();
  return Object.freeze({
    DEFAULT_LOCALE,
    STORAGE_KEY,
    LANGUAGE_OPTIONS,
    get locale() { return currentLocale; },
    normalizeLocale,
    text,
    setLocale,
    ready
  });
})();
