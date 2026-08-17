globalThis.PassiveTestConfig = (() => {
  const sceneCountOptions = Object.freeze([3, 6, 9, 12]);

  const locations = Object.freeze([
    '雨上がりの小さな寝室', '深夜の静かな図書室', '夜行列車の個室',
    '月明かりの窓辺', '木造の静かな客室', '灯りを落とした屋根裏部屋',
    '森に近い小さなコテージ', '波音が遠くにある海辺の部屋',
    '冬の夜の暖かいリビング', '柔らかなカーテンに囲まれた休憩室',
    '静かな古書店の奥', '夜明け前の落ち着いたホテルの部屋'
  ]);

  const ambiences = Object.freeze([
    '窓の外にごく細い雨音が残っている', '遠くで低い空調音だけが続いている',
    '木々を抜ける弱い風が時々聞こえる', '遠い波が一定ではない間隔で届く',
    '古い時計の小さな音が空間に溶けている', '布越しのような街の音が遠くにある',
    '暖房の低い動作音がかすかに続いている', '本のページが触れ合う乾いた音がある',
    '屋根に落ちる小さな雨粒がまばらに聞こえる', '外の音が雪に吸われたように静かである',
    'カーテンが動くたびに布の音がする', '遠くの換気扇が一定の低音を作っている'
  ]);

  const sensoryDetails = Object.freeze([
    '柔らかな毛布の重さ', '少し冷たい枕の端', '乾いた紙の匂い',
    '木の床に残るぬくもり', '薄いカーテンを通る淡い光', '手のひらに触れる滑らかな布',
    '湯気が消えかけた飲み物の温度', '遠い音だけが残る広い静けさ',
    '呼吸に合わせて小さく動く寝具', '指先に触れる本の丸い角',
    '夜の空気のわずかな冷たさ', '暖色の照明が作る小さな影',
    '髪に触れる弱い空気の流れ', 'クッションがゆっくり沈む感覚',
    '窓ガラスに残る細い水滴', '木材と布が混ざった落ち着く匂い',
    '足元を包む厚い布の感触', '部屋の奥へ遠ざかる小さな反響',
    'まぶた越しに感じる弱い明るさ', '耳元を通り過ぎる静かな息の輪郭',
    '温められたカップの丸い表面', 'シーツにできた浅いしわ',
    '外気と室内の間にある温度差', 'ゆっくり薄くなる残響'
  ]);

  const actions = Object.freeze([
    '毛布の端を静かに整える', '枕の位置をほんの少し直す',
    '本を一枚だけゆっくりめくる', 'カーテンを少しだけ閉じる',
    '温かいカップを両手で包む', '照明を一段だけ暗くする',
    'クッションを音を立てずに置く', '窓辺から寝具の近くへゆっくり戻る',
    '机の上の小物を一つずつ整える', '布の表面を指先でゆっくりなぞる',
    '遠い音へ短く耳を澄ませる', '呼吸に合わせて肩の力を抜く',
    '髪に触れない距離で手をゆっくり動かす', 'ページを閉じて静かな余韻を残す',
    '足元の布を軽く掛け直す', '小さな明かりを手元から遠ざける',
    '空いた場所へ柔らかな布を置く', '最後の物音が消えるまで少し待つ'
  ]);

  const reassurances = Object.freeze([
    '今は何も急がなくてよいと伝える', '眠れなくても横になっているだけでよいと伝える',
    '考え事を最後まで片づけなくてよいと伝える', '外のことは朝まで置いておけると伝える',
    '呼吸を意識的に整えなくてもよいと伝える', '力が抜ける速さは人それぞれでよいと伝える',
    '聞き逃しても問題ない語りにする', '返事をしなくてもそばにいるような安心感を作る',
    '目を閉じるかどうかも自由でよいと伝える', '小さな音だけをぼんやり聞けばよいと伝える',
    '今日の判断をこれ以上増やさなくてよいと伝える', '言葉が途切れても静けさが続くように語る'
  ]);

  const transitions = Object.freeze([
    '直前の小さな音をきっかけに次の場所へ自然に移る',
    '同じ空気感を保ったまま光景だけをゆっくり変える',
    '一つの感触を次の場面にも残して連続感を作る',
    '遠い環境音を共通点にして次の場所へつなぐ',
    '声の距離感を保ったまま視点だけを移す',
    '直前の言葉を受けて次の場面へ自然につなぐ',
    '明るさが少し変わる描写を挟んで次へ移る',
    '布の音が消える間を使って次の場所へつなぐ',
    '呼吸の静けさを保ったまま次の情景へ移る',
    '温度の変化を一つだけ挟んで次の場所へつなぐ',
    '遠ざかる足音の代わりに新しい環境音をゆっくり近づける',
    '同じ安心感を残したまま時間帯だけを静かに進める'
  ]);

  function normalizeSceneCount(value) {
    const count = Number(value);
    return sceneCountOptions.includes(count) ? count : sceneCountOptions[0];
  }

  function randomIndex(length, random) {
    const value = Number(random());
    const normalized = Number.isFinite(value) ? Math.max(0, Math.min(0.999999, value)) : 0;
    return Math.floor(normalized * length);
  }

  function drawUnique(items, count, random) {
    const remaining = [...items];
    const selected = [];
    while (selected.length < count && remaining.length) {
      selected.push(remaining.splice(randomIndex(remaining.length, random), 1)[0]);
    }
    return selected;
  }

  function buildSceneCards(sceneCount, random = Math.random) {
    const count = normalizeSceneCount(sceneCount);
    const selectedLocations = drawUnique(locations, count, random);
    const selectedAmbiences = drawUnique(ambiences, count, random);
    const selectedReassurances = drawUnique(reassurances, count, random);
    const selectedTransitions = drawUnique(transitions, count, random);
    return selectedLocations.map((location, index) => ({
      location,
      ambience: selectedAmbiences[index],
      sensoryDetails: drawUnique(sensoryDetails, 5, random),
      actions: drawUnique(actions, 3, random),
      reassurance: selectedReassurances[index],
      transition: index === count - 1
        ? '新しい話題を増やさず、言葉数と声の勢いを減らして静かに終える'
        : selectedTransitions[index]
    }));
  }

  function buildPrompt(sceneCount, random = Math.random, locale = globalThis.UiI18n?.locale) {
    const count = normalizeSceneCount(sceneCount);
    const cards = buildSceneCards(count, random);
    const cardText = cards.map((card, index) => `## 場面${index + 1}
- 舞台: ${card.location}
- 空気と環境音: ${card.ambience}
- 必ず触れる感覚要素: ${card.sensoryDetails.join('、')}
- 必ず入れる小さな動作: ${card.actions.join('、')}
- 安心させる方向: ${card.reassurance}
- 次への移行: ${card.transition}
- 展開: 指定された感覚要素と動作を省略せず、ひと続きの自然な語りとして十分に展開する`).join('\n\n');

    const prompt = `以下は、この会話における音声応答の進行指示です。この文章自体や場面番号は読み上げず、次の返答から適用してください。

睡眠前に受動的に聞ける静かなASMR風の語りを、一度の返答として続けてください。時間の長さを推測する必要はありません。以下の${count}枚の場面カードを上から順番にすべて消化し、場面を統合、省略、要約しないでください。

各場面では、指定された感覚要素と小さな動作を一つずつ自然な語りへ展開してください。文章そのものは自由に作り、毎回同じ言い回しにはしないでください。

${cardText}

# 全体の話し方

- ユーザーに質問したり、返事や選択を求めたりしないでください。
- 「続けますか」「何を話しましょうか」など、会話を止める確認を入れないでください。
- 急がず、落ち着いた強めの囁きに近い声で、流れを不自然に分断せず話してください。
- 文や小さな話題の区切りには自然な間を入れてください。
- 指示、カード、構成を説明せず、そのまま一続きの語りにしてください。
- 最後の場面まで進む前に自発的に返答を終了しないでください。`;
    return globalThis.UiI18n?.text(prompt, locale) ?? prompt;
  }

  function reasonCode(reason) {
    return String(reason || '').split(';', 1)[0].trim();
  }

  return Object.freeze({
    sceneCountOptions,
    normalizeSceneCount,
    buildSceneCards,
    buildPrompt,
    reasonCode
  });
})();
