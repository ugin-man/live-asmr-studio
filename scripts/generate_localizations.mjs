import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const projectRoot = path.resolve(import.meta.dirname, '..');
const extensionRoot = path.join(projectRoot, 'extension');
const sourceFiles = [
  'sidepanel.html',
  'sidepanel.js',
  'session-prompt-config.js',
  'passive-test-config.js'
];
const targetLanguages = Object.freeze({
  en: 'en',
  'zh-CN': 'zh-CN',
  ko: 'ko',
  es: 'es'
});
const manualOverrides = Object.freeze({
  en: {
    'コピーしました。次はChatGPT Voice Liveへ貼り付けてください。': 'Copied. Next, paste it into ChatGPT Voice Live.',
    '好きなセッションを選び、ChatGPT Voice Liveの声を立体的なASMRとして聴く。': 'Choose a session and turn ChatGPT Voice Live into spatial ASMR.',
    '内容、テンプレート、会話方式、長さを選ぶ。細かく決めなくても、そのままコピーできるプロンプトを作る。': 'Choose a session type, template, interaction, and length. The generated prompt is ready to copy as-is.',
    '内容モード': 'Session type',
    'テンプレート': 'Template',
    '発話スタイル': 'Voice style',
    '進行方式': 'Session behavior',
    '進行概要': 'Session outline',
    '内容量': 'Content depth',
    'コンパクト': 'Compact',
    '標準': 'Standard',
    'じっくり': 'Extended',
    '対話型の継続会話': 'Ongoing conversation',
    '受動セッション': 'Passive session',
    '低密度の受動セッション': 'Low-density passive session',
    '割り込み対応型ロールプレイ': 'Interruptible role-play',
    '元文章に沿った読み上げ': 'Source-led reading',
    '場面数を消化せず、ユーザーの発言へ柔軟に応答する。質問は必要なときだけ行う。': 'Respond flexibly to the user instead of completing a scene count. Ask only when it helps the conversation.',
    '質問せず一度の返答で進む。ユーザーが割り込んだ場合だけ短く応答し、中断地点の次へ戻る。': 'Continue in one response without questions. If the user interrupts, respond briefly and resume from the next beat.',
    '作業を止める質問をせず進む。割り込みには応答してから、現在の作業支援へ戻る。': 'Continue without questions that stop the work. Respond to interruptions, then return to the current work support.',
    '物語を止めずに進め、ユーザーが話した場合は役のまま応答して次の場面へ戻る。': 'Keep the story moving. If the user speaks, answer in character and return to the next beat.',
    '固定の場面数で水増しせず、元文章を先頭から順番に扱い、終わった場所で終了する。': 'Follow the source from the beginning without padding it to a fixed scene count, and stop when the source ends.',
    '会話方式': 'Interaction',
    '長さ': 'Length',
    'カスタマイズ': 'Customize',
    '生成されたプロンプトを確認': 'Preview generated prompt',
    'プロンプトをコピー': 'Copy prompt',
    '人物設定を固定せず、すぐ隣に誰かがいる安心感と寝具の近さを中心にする。': 'Focus on the comfort of someone resting nearby without forcing a fixed character or relationship.',
    '息と囁きの成分を強く残し、聞き取りやすさより近いASMR感を優先する。': 'Keeps the breath and whisper close, prioritizing an intimate ASMR feel over maximum clarity.',
    '普段使う音量、声の位置、動き、環境音だけをまとめる。': 'Keep the controls you use most—volume, voice position, motion, and ambience—in one place.',
    '声の音量': 'Voice volume',
    '声の位置と距離': 'Voice position and distance',
    '後ろ': 'Rear',
    '左': 'Left',
    '右': 'Right',
    '自分': 'Listener',
    '声': 'Voice',
    '中心 超近接・推定': 'Center: ultra-close estimate',
    '実測 20〜50cm': 'Measured: 20–50 cm',
    '表示上限 2.06m': 'Display limit: 2.06 m',
    '現在の声': 'Current voice',
    '固定位置': 'Fixed position',
    '声の距離': 'Voice distance',
    '声の動き': 'Voice motion',
    '環境音': 'Ambience',
    '環境音量': 'Ambience level',
    '密度・厚み・耳元を独立して混ぜる。推奨初期値は、検証結果に合わせて密度0%、厚み70%、耳元70%。': 'Blend Density, Body, and Near-ear independently. Recommended defaults: Density 0%, Body 70%, Near-ear 70%.',
    '原音': 'Original',
    '密度': 'Density',
    '厚み': 'Body',
    '耳元': 'Near-ear',
    'バランス': 'Balanced',
    '推奨 70/70': 'Recommended 70/70',
    '密度0%、厚み70%、耳元70%の推奨ミックス。': 'Recommended mix: Density 0%, Body 70%, Near-ear 70%.',
    '現在の質感': 'Current texture',
    '実際の補正': 'Active processing',
    '質感加工後': 'After texture processing',
    '密度圧縮の抑制': 'Density compression reduction',
    '弱い歯擦音抑制': 'Gentle sibilance control',
    '有効': 'On',
    '抑制の強さ': 'Reduction strength',
    '6.5kHz付近を最大3dBだけ抑える。耳元70%でサ行が刺さる場合の弱い静的補正。': 'Applies up to 3 dB of gentle reduction near 6.5 kHz when close sibilants sound sharp.',
    '最初に確認': 'Before you start',
    'すぐ触れる音': 'Quick sound controls',
    '睡眠・リラックス': 'Sleep & relaxation',
    '作業・読書': 'Focus & reading',
    '物語・ロールプレイ': 'Story & role-play',
    'オノマトペ': 'Onomatopoeia',
    '連続オノマトペセッション': 'Continuous onomatopoeia session',
    '耳元の音あそび': 'Close-up sound play',
    '説明よりも声に出した音を中心に、質感の違うオノマトペを連続して聞く。': 'Listen to a continuous flow of spoken onomatopoeia with changing textures and very little explanation.',
    '固定された音系統を順に進み、各系統の具体的な表現と自然な反復だけをAIが決める。': 'Follow a fixed sequence of sound families while the AI chooses the exact vocalizations and natural repetitions within each family.',
    '息、打音、布、水、泡などの質感を、説明せず滑らかにつなぐ。': 'Move smoothly through breath, tapping, cloth, water, bubbles, and other textures without explaining them.',
    '静かな耳元で、声そのものを使って小さな音の質感を作る。': 'At a quiet, close-up position, use the voice itself to create the texture of tiny sounds.',
    '語彙数を競わず、一つの音を自然なまとまりで反復してから、決められた次の音系統へ移る。': 'Do not chase a large word count. Repeat one sound in a natural phrase, then move to the next specified sound family.',
    '息に近い柔らかな音から始める': 'Begin with breath-soft sounds',
    '丸い打音の響きへ移る': 'Move into rounded tapping sounds',
    '布とブラシの質感を声で描く': 'Voice soft cloth and brushing textures',
    '紙と薄い葉の軽い音へ進む': 'Shift to light paper and leaf sounds',
    '小さな水滴の間を作る': 'Leave space between tiny water drops',
    '泡と微かな弾け方を加える': 'Add bubbles and a faint fizz',
    '木とガラスの小さな響きを置く': 'Place tiny wood and glass tones',
    '小さな足取りのリズムを作る': 'Create a tiny footstep rhythm',
    '光と揺らぎの感覚へ広げる': 'Open into light and swaying textures',
    '同じ音の近さを少し変える': 'Let one familiar sound pull slightly away and return',
    '二つの音系統を交互につなぐ': 'Alternate between two sound families',
    '最初の柔らかさへ戻って終える': 'Return to the opening softness and fade out',
    '説明をせず、耳元で無理なく続く柔らかなオノマトペへ入る。': 'Begin directly with soft spoken sounds that can continue comfortably near the ear, without explanation.',
    '鋭くない一定のリズムを作り、音の輪郭を少しだけ明確にする。': 'Create a steady, non-sharp rhythm and give the sounds a slightly clearer outline.',
    '摩擦の柔らかさを、耳障りにならない連続音として表す。': 'Express soft friction as a continuous vocal texture that is gentle on the ear.',
    '軽い素材が重なる気配を、刺激の少ない声で作る。': 'Suggest thin, overlapping materials with a low-stimulation voice.',
    '音と音の間に余白を残し、丸い水滴の感覚を作る。': 'Leave space between sounds and create the feel of rounded water drops.',
    '水滴とは違う細かな連続感を作り、単調さを減らす。': 'Create a fine continuous texture distinct from water drops, reducing monotony.',
    '硬い素材でも刺激を上げず、静かな音色の違いを作る。': 'Create quiet tonal contrast from harder materials without increasing intensity.',
    '物語を始めず、往復する穏やかなリズムだけを音として使う。': 'Use only a gentle back-and-forth rhythm without starting a story.',
    '実音だけでなく、柔らかな感覚語を混ぜて声の質感を変える。': 'Mix in soft mimetic words as well as sound effects to vary the vocal texture.',
    '新しい語を増やさず、既に使った音を近い声と少し引いた声で対比する。': 'Without adding new words, contrast one earlier sound at close range and slightly farther away.',
    '異なる質感を重ねすぎず、交互に戻ることでまとまりを作る。': 'Keep two textures separate and create cohesion by returning to them in alternation.',
    '新しい音を追加せず、反復の密度を自然に下げて余韻を残す。': 'Add no new sounds; naturally reduce the density of repetition and leave a soft afterglow.',
    '見出しや箇条書きを読み上げず、説明文を増やさず、声に出したオノマトペと自然な間として十分に展開する。': 'Do not read headings or bullets and do not add explanatory narration. Fully develop the scene through spoken onomatopoeia and natural pauses.',
    '左耳：離れて戻る': 'Left ear: pull away and return',
    '右耳：離れて戻る': 'Right ear: pull away and return',
    '動き全体の長さ': 'Full motion cycle',
    '離れる・戻る片道時間': 'One-way pullback time',
    '「ふう」「すう」「ほわほわ」など、息と声が自然につながる音の系統。': 'A family of breath-to-voice sounds such as “hoo,” “shoo,” and “hush-hush.”',
    '「とんとん」「ことこと」「こつん」など、丸く小さい打音の系統。': 'A family of small rounded taps such as “tap-tap,” “tok-tok,” and “tup.”',
    '「さらさら」「すりすり」「ふわふわ」など、布や毛先を思わせる音の系統。': 'A family of cloth and brush sounds such as “swish-swish,” “brush-brush,” and “fluff-fluff.”',
    '「かさかさ」「ぱらぱら」「はらはら」など、薄いものが動く音の系統。': 'A family of light-material sounds such as “rustle-rustle,” “flutter-flutter,” and “flick-flick.”',
    '「ぽたぽた」「ぴちょん」「しとしと」など、小さな水の音の系統。': 'A family of small water sounds such as “drip-drop,” “plink,” and “pitter-patter.”',
    '「ぷくぷく」「しゅわしゅわ」「ぽこぽこ」など、泡や微かな発泡の音の系統。': 'A family of bubble and fizz sounds such as “bloop-bloop,” “fizz-fizz,” and “pop-pop.”',
    '「ころころ」「こつこつ」「ちりん」など、小さな物が触れる音の系統。': 'A family of tiny object sounds such as “roll-roll,” “tok-tok,” and “ting.”',
    '「てくてく」「とことこ」「ちょこちょこ」など、小さな足取りの音の系統。': 'A family of tiny footstep sounds such as “tip-tap,” “pitter-patter,” and “trot-trot.”',
    '「きらきら」「ゆらゆら」「ふわり」など、光や動きの感覚を表す系統。': 'A family of light and motion words such as “twinkle-twinkle,” “sway-sway,” and “float-float.”',
    '持ち込みコンテンツ': 'Imported content',
    '短め': 'Short',
    '長め': 'Long',
    '前': 'Front',
    '左後方': 'Left rear',
    '右後方': 'Right rear',
    '10倍': '10×',
    '1.0倍': '1.0×',
    'ミュート': 'Mute',
    '停止': 'Stop',
    '添い寝・安心': 'Bedside comfort',
    '添い寝パートナー': 'Bedside companion',
    '強めの囁き': 'Deep whisper',
    '受動': 'Passive',
    '対話': 'Interactive',
    '中ぐらい': 'Medium'
  },
  'zh-CN': {
    '最初に確認': '开始之前',
    'すぐ触れる音': '快捷声音控制',
    '睡眠・リラックス': '睡眠与放松',
    '作業・読書': '专注与阅读',
    '物語・ロールプレイ': '故事与角色扮演',
    'オノマトペ': '拟声・拟态词',
    '耳元の音あそび': '耳边声音游戏',
    '左耳：離れて戻る': '左耳：远离后返回',
    '右耳：離れて戻る': '右耳：远离后返回',
    '持ち込みコンテンツ': '导入内容',
    '短め': '短',
    '長め': '长',
    '前': '前方',
    '左後方': '左后方',
    '右後方': '右后方',
    '右': '右',
    'ハイブリッド': '混合',
    '内容を再抽選': '重新生成内容',
    '環境音量': '环境音量',
    '添い寝・安心': '陪睡・安心',
    '添い寝パートナー': '陪睡伙伴',
    '強めの囁き': '深度耳语',
    '受動': '被动聆听',
    '対話': '互动',
    '中ぐらい': '中等'
  },
  ko: {
    '最初に確認': '시작하기 전에',
    'すぐ触れる音': '빠른 사운드 조절',
    '睡眠・リラックス': '수면・휴식',
    '作業・読書': '집중・독서',
    '物語・ロールプレイ': '이야기・역할극',
    'オノマトペ': '의성어・의태어',
    '耳元の音あそび': '귓가 소리 놀이',
    '左耳：離れて戻る': '왼쪽 귀: 멀어졌다 돌아오기',
    '右耳：離れて戻る': '오른쪽 귀: 멀어졌다 돌아오기',
    '持ち込みコンテンツ': '가져온 콘텐츠',
    '短め': '짧게',
    '長め': '길게',
    '前': '앞',
    '左後方': '왼쪽 뒤',
    '右後方': '오른쪽 뒤',
    '雨の寝室': '비 오는 침실',
    '耳元ケア': '귀 주변 케어',
    '内容を再抽選': '내용 다시 생성',
    '添い寝・安心': '곁잠・안심',
    '添い寝パートナー': '곁잠 파트너',
    '強めの囁き': '깊은 속삭임',
    '受動': '수동 감상',
    '対話': '대화형',
    '中ぐらい': '보통'
  },
  es: {
    '最初に確認': 'Antes de empezar',
    'すぐ触れる音': 'Controles rápidos de sonido',
    '睡眠・リラックス': 'Sueño y relajación',
    '作業・読書': 'Concentración y lectura',
    '物語・ロールプレイ': 'Historia y rol',
    'オノマトペ': 'Onomatopeyas',
    '耳元の音あそび': 'Juego de sonidos al oído',
    '左耳：離れて戻る': 'Oído izquierdo: alejarse y volver',
    '右耳：離れて戻る': 'Oído derecho: alejarse y volver',
    '持ち込みコンテンツ': 'Contenido importado',
    '短め': 'Corto',
    '長め': 'Largo',
    '前': 'Frente',
    '左後方': 'Trasera izquierda',
    '右後方': 'Trasera derecha',
    '内容を再抽選': 'Regenerar contenido',
    '添い寝・安心': 'Descanso acompañado',
    '添い寝パートナー': 'Compañía para dormir',
    '強めの囁き': 'Susurro profundo',
    '受動': 'Pasivo',
    '対話': 'Interactivo',
    '中ぐらい': 'Medio'
  }
});
const japanesePattern = /[\u3040-\u30ff\u3400-\u9fff]/;

function decodeLiteral(literal) {
  try {
    return vm.runInNewContext(literal, Object.create(null), { timeout: 100 });
  } catch {
    return null;
  }
}

function collectStrings(source, extension) {
  const found = [];
  if (extension === '.html') {
    for (const match of source.matchAll(/>([^<>]+)</g)) found.push(match[1].trim());
    for (const match of source.matchAll(/(?:aria-label|placeholder|title)="([^"]+)"/g)) {
      found.push(match[1]);
    }
    return found;
  }

  const literalPattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  for (const match of source.matchAll(literalPattern)) {
    const literal = match[0];
    const body = match[2];
    if (match[1] === '`' && body.includes('${')) {
      let placeholderIndex = 0;
      found.push(body.replace(/\$\{[\s\S]*?\}/g, () => `{${placeholderIndex++}}`)
        .replaceAll('\\n', '\n'));
      for (const segment of body.split(/\$\{[\s\S]*?\}/g)) {
        found.push(segment.replaceAll('\\n', '\n'));
      }
      continue;
    }
    const decoded = decodeLiteral(literal);
    if (typeof decoded === 'string') found.push(decoded);
  }
  for (const interpolation of source.matchAll(/\$\{([\s\S]*?)\}/g)) {
    for (const nested of interpolation[1].matchAll(/(['"])((?:\\.|(?!\1)[\s\S])*?)\1/g)) {
      const decoded = decodeLiteral(nested[0]);
      if (typeof decoded === 'string') found.push(decoded);
    }
  }
  return found;
}

async function collectJapaneseStrings() {
  const all = new Set();
  for (const relativePath of sourceFiles) {
    const source = await fs.readFile(path.join(extensionRoot, relativePath), 'utf8');
    for (const value of collectStrings(source, path.extname(relativePath))) {
      const normalized = String(value || '').trim();
      if (normalized && japanesePattern.test(normalized)) all.add(normalized);
    }
  }
  return [...all].sort((a, b) => b.length - a.length || a.localeCompare(b, 'ja'));
}

function createBatches(strings, maxCharacters = 850) {
  const batches = [];
  let current = [];
  let currentLength = 0;
  for (const source of strings) {
    const addition = source.length + 40;
    if (current.length && currentLength + addition > maxCharacters) {
      batches.push(current);
      current = [];
      currentLength = 0;
    }
    current.push(source);
    currentLength += addition;
  }
  if (current.length) batches.push(current);
  return batches;
}

async function translateBatch(batch, targetLanguage, offset) {
  const tagged = batch.map((source, index) =>
    `[[[I18N_${offset + index}]]]\n${source}`).join('\n') + '\n[[[I18N_END]]]';
  const query = new URLSearchParams({
    client: 'gtx', sl: 'ja', tl: targetLanguage, dt: 't', q: tagged
  });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${query}`);
  if (!response.ok) throw new Error(`Translation request failed: ${response.status}`);
  const payload = await response.json();
  const translated = payload[0].map((part) => part[0]).join('');
  const values = new Map();
  for (const match of translated.matchAll(
    /\[\[\[I18N_(\d+)\]\]\]\s*\n([\s\S]*?)(?=\n\[\[\[I18N_(?:\d+|END)\]\]\])/g)) {
    values.set(Number(match[1]), match[2].trim());
  }
  if (values.size !== batch.length) {
    for (let index = 0; index < batch.length; index += 1) {
      const id = offset + index;
      if (values.has(id)) continue;
      const singleQuery = new URLSearchParams({
        client: 'gtx', sl: 'ja', tl: targetLanguage, dt: 't', q: batch[index]
      });
      const singleResponse = await fetch(
        `https://translate.googleapis.com/translate_a/single?${singleQuery}`);
      if (!singleResponse.ok) {
        throw new Error(`Single translation request failed: ${singleResponse.status}`);
      }
      const singlePayload = await singleResponse.json();
      values.set(id, singlePayload[0].map((part) => part[0]).join('').trim());
    }
  }
  return values;
}

async function translateAll(strings, targetLanguage) {
  const translated = {};
  const batches = createBatches(strings);
  const work = [];
  let offset = 0;
  for (const batch of batches) {
    work.push({ batch, offset });
    offset += batch.length;
  }
  let nextWorkIndex = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (nextWorkIndex < work.length) {
      const item = work[nextWorkIndex++];
      const values = await translateBatch(item.batch, targetLanguage, item.offset);
      item.batch.forEach((source, index) => {
        translated[source] = values.get(item.offset + index);
      });
    }
  }));
  return translated;
}

const sourceStrings = await collectJapaneseStrings();
const localeMessages = { ja: Object.fromEntries(sourceStrings.map((value) => [value, value])) };
await Promise.all(Object.entries(targetLanguages).map(async ([locale, targetLanguage]) => {
  localeMessages[locale] = await translateAll(sourceStrings, targetLanguage);
  Object.assign(localeMessages[locale], manualOverrides[locale] || {});
  console.log(`Translated ${locale}.`);
}));

const output = `// Generated by scripts/generate_localizations.mjs.\n` +
  `globalThis.UiLocaleMessages = Object.freeze(${JSON.stringify(localeMessages, null, 2)});\n`;
await fs.writeFile(path.join(extensionRoot, 'ui-locales.generated.js'), output, 'utf8');
console.log(`Generated ${sourceStrings.length} strings for ${Object.keys(localeMessages).length} locales.`);
