/**
 * Extra phone dialogue pools (daytime SMS vs call scripts kept separate).
 */
(function (global) {
  'use strict';

  const FRASER_SMS_DAY = Object.freeze([
    'Tonight still on?',
    'Lobby later?',
    'You free after work?',
    'GG from last night.',
    'Don\'t disappear today.',
    'Coffee if you\'re up.',
    'One round. Come on.',
    'Queue in five.',
    'That boss again. Help.',
    'Still at work. Tomorrow?',
    'Don\'t start without me.',
    'You alive?',
    'I saved you a lobby slot.',
    'Rage quit. Need a strat.',
    'Midnight queue or sleep?',
    'Bring the old loadout.',
    'I\'m already in. Join.',
    'Coffee then ranked.',
    'You vanished mid-queue.',
    'GG. Again tonight?',
    'Ping me when you\'re off.',
    'One more. Stay.',
    'Can\'t play. Work. Tomorrow.',
    'Left side. You know.',
  ]);

  const FRASER_SMS_DAY_ZH = Object.freeze([
    '今晚还打吗？',
    '晚点大厅见？',
    '下班有空吗？',
    '昨晚 GG。',
    '今天别消失。',
    '醒了来杯咖啡。',
    '就一局。来嘛。',
    '五分钟排队。',
    '又是那个 Boss。帮一下。',
    '还在上班。明天？',
    '别先开。',
    '你还活着吗？',
    '大厅位给你留了。',
    '怒了。要打法。',
    '半夜排还是睡？',
    '带上次那套。',
    '我已经在了。进来。',
    '咖啡，然后排位。',
    '排队中途你没了。',
    'GG。今晚还来？',
    '下了回我。',
    '再一局。别挂。',
    '打不了。加班。明天。',
    '左边。你懂的。',
  ]);

  const FAMILY_MSG_POOL = Object.freeze({
    Steve: [
      { text: 'Need you for a sec.', react: null },
      { text: 'Afternoon\'s no good.', react: null },
      { text: 'Call later.', react: 'liked' },
      { text: 'Can you cover this?', react: null },
      { text: 'You good?', react: null },
      { text: 'Come sign this when you can.', react: null },
    ],
    Donna: [
      { text: 'I\'ll be there in a bit.', react: null },
      { text: 'What do you need?', react: null },
      { text: 'How\'s today going?', react: 'liked' },
      { text: 'Milk or oat?', react: null },
      { text: 'Want fruit on the way?', react: null },
      { text: 'I\'m at the store — anything else?', react: null },
    ],
    Riley: [
      { text: 'Rematch. Now.', react: null },
      { text: 'Bet you can\'t beat this.', react: null },
      { text: 'Gym after? Don\'t flake.', react: null },
      { text: 'I almost had you!!', react: 'liked' },
      { text: 'One more. You\'re on.', react: null },
      { text: 'Come play. I warmed up.', react: null },
    ],
  });

  const FAMILY_NPC_LINES = Object.freeze({
    Steve: [
      'Need you for a sec.',
      'Afternoon\'s no good.',
      'Call later.',
      'Come sign this.',
      'Can you cover today?',
      'I\'m jammed till 4.',
      'You good?',
      'Don\'t overdo it.',
      'Text when you\'re free.',
      'Need a hand with this form.',
      'Morning\'s packed.',
      'Nice. Thanks.',
      'Perfect — later.',
      'On my way. You?',
      'Leave it. I\'ll pick up.',
      'Short call if you have a minute.',
      'Can\'t swing afternoon.',
      'Come by if you\'re around.',
    ],
    Donna: [
      'I\'ll be there in a bit.',
      'What do you need?',
      'How\'s today going?',
      'Milk or oat?',
      'Want fruit on the way?',
      'I\'m at the store.',
      'Eggs too?',
      'Need anything warm?',
      'I can grab dinner stuff.',
      'Which bread?',
      'I\'m downstairs soon.',
      'Text me the list.',
      'Did you eat yet? Just checking.',
      'I\'ll wait by the door.',
      'Snack or real food?',
      'How was the afternoon?',
      'I found the yogurt you like.',
      'Coming up in ten.',
      'Need shampoo or you\'re good?',
      'Today okay?',
    ],
    Riley: [
      'Rematch. Now.',
      'Bet you can\'t beat this.',
      'Gym after? Don\'t flake.',
      'I almost had you!!',
      'One more. You\'re on.',
      'Come play. I warmed up.',
      'You wait. Next round\'s mine.',
      'That was luck. Again.',
      'Queue with me.',
      'Leg day. Keep up.',
      'I\'m not losing twice.',
      'Bring the good controller.',
      'Race you downstairs.',
      'I practiced. You\'re cooked.',
      'One game then food.',
      'Don\'t go easy.',
      'I want the rematch tonight.',
      'Catch this. Outdoor.',
      'You hid last time. Not again.',
      'Winner picks dinner.',
    ],
  });

  const FAMILY_NPC_LINES_ZH = Object.freeze({
    Steve: [
      '来一下。',
      '下午不行。',
      'Call later。',
      '来签一下。',
      '今天能顶一下吗？',
      '四点前都满了。',
      '你还好吗？',
      '别硬撑。',
      '有空回我。',
      '这表帮看一眼。',
      '早上排满了。',
      'Nice。谢了。',
      'Perfect——晚点。',
      '我在路上。你呢？',
      '放下。我来取。',
      '有一分钟就短打。',
      '下午我过不去。',
      '在附近就过来。',
    ],
    Donna: [
      '我一会儿到。',
      '你需要什么？',
      '今天过得如何？',
      '牛奶还是燕麦？',
      '要不要顺路带水果？',
      '我在店里。',
      '鸡蛋也要吗？',
      '要热的吗？',
      '晚餐材料我可以带。',
      '哪种面包？',
      '我很快下楼。',
      '把清单发给我。',
      '吃了吗？问一声。',
      '我在门口等。',
      '零食还是正经吃？',
      '下午怎么样？',
      '找到你爱喝的酸奶了。',
      '十分钟上来。',
      '洗发水还够吗？',
      '今天还行吗？',
    ],
    Riley: [
      '再来。马上。',
      '你赢不了这局。',
      '放学练不练？别逃。',
      '差一点就赢了！！',
      '再一局。算你的。',
      '来打。我热好了。',
      '你等着。下局我的。',
      '那是运气。再来。',
      '跟我排。',
      '腿日。跟不跟。',
      '我不会连输。',
      '带好用的手柄。',
      '比谁先下楼。',
      '我练过了。你完了。',
      '一局然后吃饭。',
      '别放水。',
      '今晚要复赛。',
      '接住。户外。',
      '上次你躲了。这次不行。',
      '赢的人选晚饭。',
    ],
  });

  const QUICK_REPLY_FOLLOWUPS = Object.freeze({
    fraser: [
      { after: 0, en: 'Ok. Lobby.', zh: '行。大厅。' },
      { after: 1, en: 'Five. Don\'t start without me.', zh: '五分钟。别先开。' },
      { after: 2, en: 'Fine. Tomorrow then.', zh: '行。那就明天。' },
    ],
    Fraser: [
      { after: 0, en: 'Ok. Lobby.', zh: '行。大厅。' },
      { after: 1, en: 'Five. Don\'t start without me.', zh: '五分钟。别先开。' },
      { after: 2, en: 'Fine. Tomorrow then.', zh: '行。那就明天。' },
    ],
    steve: [
      { after: 0, en: 'Good. See you then.', zh: '好。到时见。' },
      { after: 1, en: 'Five is fine.', zh: '五分钟就行。' },
      { after: 2, en: 'Ok. Later.', zh: '行。晚点。' },
    ],
    Steve: [
      { after: 0, en: 'Good. See you then.', zh: '好。到时见。' },
      { after: 1, en: 'Five is fine.', zh: '五分钟就行。' },
      { after: 2, en: 'Ok. Later.', zh: '行。晚点。' },
    ],
    donna: [
      { after: 0, en: 'I\'ll wait downstairs.', zh: '我在楼下等。' },
      { after: 1, en: 'Take your time. I\'ll browse.', zh: '不急。我先转转。' },
      { after: 2, en: 'Ok. I\'ll put the extra back.', zh: '好。多余的我放回去。' },
    ],
    Donna: [
      { after: 0, en: 'I\'ll wait downstairs.', zh: '我在楼下等。' },
      { after: 1, en: 'Take your time. I\'ll browse.', zh: '不急。我先转转。' },
      { after: 2, en: 'Ok. I\'ll put the extra back.', zh: '好。多余的我放回去。' },
    ],
    riley: [
      { after: 0, en: 'Finally. Don\'t go easy.', zh: '终于。别放水。' },
      { after: 1, en: 'Five. I\'m warming up.', zh: '五分钟。我先热身。' },
      { after: 2, en: 'Fine. Tomorrow I still win.', zh: '行。明天我还是会赢。' },
    ],
    Riley: [
      { after: 0, en: 'Finally. Don\'t go easy.', zh: '终于。别放水。' },
      { after: 1, en: 'Five. I\'m warming up.', zh: '五分钟。我先热身。' },
      { after: 2, en: 'Fine. Tomorrow I still win.', zh: '行。明天我还是会赢。' },
    ],
    yifan: [
      { after: 0, en: 'Okay. I\'ll wait.', zh: '好。我等你。' },
      { after: 1, en: 'Five is fine. Miss you.', zh: '五分钟也行。想你。' },
      { after: 2, en: 'Rest then. Text later.', zh: '那就休息。晚点回我。' },
    ],
  });

  const FRASER_CALL_ENDINGS = Object.freeze({
    queue_up: {
      a: { who: 'fraser', en: 'Lobby. Don\'t be late.', zh: '大厅。别迟到。' },
      b: { who: 'fraser', en: '…fine. Sleep. Text tomorrow.', zh: '……行。睡。明天短信。' },
      diaryA: {
        en: 'Fraser called. I said one round.',
        zh: 'Fraser 打来。我说就一局。',
      },
      diaryB: {
        en: 'Fraser called. I went back to sleep.',
        zh: 'Fraser 打来。我又睡了。',
      },
    },
    ask_strat: {
      a: { who: 'fraser', en: 'Copy. Logging off.', zh: '收到。下了。' },
      b: { who: 'fraser', en: 'Yeah. Night.', zh: '嗯。晚安。' },
      diaryA: {
        en: 'Fraser asked for a strat. I answered.',
        zh: 'Fraser 问打法。我答了。',
      },
      diaryB: {
        en: 'Fraser asked for a strat. I told him to sleep.',
        zh: 'Fraser 问打法。我让他去睡。',
      },
    },
    work_rant: {
      a: { who: 'fraser', en: 'Tomorrow. Don\'t ghost.', zh: '明天。别消失。' },
      b: { who: 'fraser', en: '…ok. Night.', zh: '……行。晚安。' },
      diaryA: {
        en: 'Fraser ranted about work. Tomorrow night.',
        zh: 'Fraser 吐槽加班。约了明晚。',
      },
      diaryB: {
        en: 'Fraser ranted about work. Short call.',
        zh: 'Fraser 吐槽加班。短聊。',
      },
    },
    play_together: {
      a: { who: 'fraser', en: 'One more. Stay.', zh: '再一局。别挂。' },
      b: { who: 'fraser', en: 'GG. Later.', zh: 'GG。晚点。' },
      diaryA: {
        en: 'Fraser kept me on the line for another round.',
        zh: 'Fraser 拉着我又打了一局。',
      },
      diaryB: {
        en: 'Fraser called mid-match. I hung up after GG.',
        zh: 'Fraser 局中打来。GG 后挂了。',
      },
    },
  });

  const FRASER_VOICEMAIL = Object.freeze({
    queue_up: {
      en: ['You up?', 'Lobby.', 'One round. Come on.'],
      zh: ['醒着吗？', '大厅。', '就一局。来嘛。'],
    },
    ask_strat: {
      en: ['That boss.', 'How do you beat it?', 'Call me back.'],
      zh: ['那个 Boss。', '怎么打？', '回我。'],
    },
    work_rant: {
      en: ['Still at work.', 'Cannot play.', 'Tomorrow.'],
      zh: ['还在上班。', '打不了。', '明天。'],
    },
    play_together: {
      en: ['Already in.', 'Stay on the line.', 'Left — now!'],
      zh: ['我已经在局里了。', '别挂。', '左边——现在！'],
    },
  });

  const JAMES_LINES_BY_STATE = Object.freeze({
    sleep: ['…', 'mm', 'later', '5 more min', 'still in bed', 'not yet', 'gimme a minute', 'half asleep', '…later', 'k tomorrow', 'too early', 'zzz'],
    idle: ['…ok', 'sure', 'mm', 'in a bit', 'yeah', 'alright', 'on it', 'ok wait', 'just sitting', 'fine', 'can do', 'later tonight'],
    work: ['busy', 'later', '…', 'can\'t rn', 'after this', 'in a meeting', 'text after work', 'got it — later', 'swamped', 'leave it', 'ok tonight', 'can\'t swing now'],
    after_drake: ['still loud', '…ok', 'one more', 'ears ringing', 'too bright', 'need water', 'maybe sit', 'ok ok', 'still buzzing', 'not yet', 'give me a sec', 'loud still'],
    after_football: ['tired', 'gg', '…', 'legs dead', 'shower first', 'need water', 'good game', 'can\'t run', 'later', 'ice maybe', 'I\'m cooked', 'sit down first'],
    default: ['mm', '…ok', 'later', 'maybe', 'sure', 'on my way', 'got it', 'yeah', 'in a bit', 'ok', 'fine', 'can do', 'just ate', 'heading out', 'home soon', 'text you'],
  });
  const JAMES_LINES_BY_STATE_ZH = Object.freeze({
    sleep: ['……', '嗯', '晚点', '再五分钟', '还在床上', '还没', '等一下', '半醒', '……晚点', '明天吧', '太早了', 'zzz'],
    idle: ['……行', '好', '嗯', '一会儿', '嗯啊', '行吧', '我弄', '等下', '坐着', '可以', '行', '今晚'],
    work: ['忙', '晚点', '……', '现在不行', '弄完再说', '在开会', '下班回', '知道了——晚点', '堆着', '先放着', '今晚行', '现在过不去'],
    after_drake: ['还很吵', '……行', '再一局', '耳朵还响', '太亮了', '要喝水', '先坐', '好好好', '还在嗡', '还没缓', '等一下', '还吵'],
    after_football: ['累', 'gg', '……', '腿没了', '先冲澡', '要喝水', '踢得行', '跑不动', '晚点', '也许冰一下', '我废了', '先坐下'],
    default: ['嗯', '……行', '晚点', '也许', '好', '在路上', '收到', '嗯啊', '一会儿', '好的', '行', '可以', '刚吃过', '出门了', '快到家', '回你'],
  });
  const JAMES_LINES_BY_NPC = Object.freeze({
    steve: {
      en: ['Got it', 'Afternoon I can', 'Call you after 4', 'On my way', 'I\'ll cover', 'Leave it', 'Need five', 'I can sign'],
      zh: ['收到', '下午我可以', '四点后打给你', '在路上', '我顶一下', '先放着', '要五分钟', '我来签'],
    },
    donna: {
      en: ['Oat is fine', 'Don\'t buy too much', 'Fruit\'s ok', 'I ate', 'Need milk', 'I\'m good', 'See you downstairs', 'List in a sec'],
      zh: ['燕麦就行', '别买太多', '水果可以', '吃过了', '要牛奶', '我够了', '楼下见', '清单马上发'],
    },
    riley: {
      en: ['One game', 'You\'re on', 'Don\'t start yet', 'I\'m coming', 'Warm up first', 'Loser sits', 'Ok rematch', 'Not going easy'],
      zh: ['一局就滚', '算你的', '别先开', '我过来', '先热身', '输的人坐着', '行 再来', '不会放水'],
    },
    fraser: {
      en: ['Lobby in a bit', 'One round', 'Don\'t start', 'GG', 'After this queue', 'Coffee first', 'I\'m in', 'Tomorrow'],
      zh: ['一会儿大厅', '一局', '别先开', 'GG', '排完这把', '先咖啡', '我进了', '明天'],
    },
    yifan: {
      en: ['Miss you too', 'On my way', 'Just ate', 'Home soon', 'Love you', 'Five min', 'I\'m okay', 'Text you later'],
      zh: ['也想你', '在路上', '刚吃过', '快到家', '爱你', '五分钟', '我还好', '晚点回你'],
    },
  });

  /** charId → world label (default head) + phone contact label */
  const NPC_DISPLAY = Object.freeze({
    fraser: { worldName: 'Game Guy', phoneName: 'Fraser' },
    gym: { worldName: 'Gym Guy', phoneName: 'Arthur' },
    holiday: { worldName: 'Holiday Guy', phoneName: 'Scott' },
    steve: { worldName: 'Steve', phoneName: 'Steve' },
    donna: { worldName: 'Donna', phoneName: 'Donna' },
    riley: { worldName: 'Riley', phoneName: 'Riley' },
    accountant: { worldName: 'Accountant', phoneName: 'Mr.Bennett' },
    barista: { worldName: 'Barista', phoneName: 'Barista' },
    yifan: { worldName: 'Yifan', phoneName: '❤️' },
    old_teammate: { worldName: 'Old Teammate', phoneName: 'Old Teammate' },
  });

  /** Legacy display-name / phone-label → charId (save migration) */
  const NPC_DISPLAY_ALIASES = Object.freeze({
    'Game Guy': 'fraser',
    Fraser: 'fraser',
    'Gym Guy': 'gym',
    Arthur: 'gym',
    'Holiday Guy': 'holiday',
    Scott: 'holiday',
    Steve: 'steve',
    'dad^steve': 'steve',
    Donna: 'donna',
    'mom.donna': 'donna',
    Riley: 'riley',
    "brother'riley": 'riley',
    "brothor'riley": 'riley',
    Accountant: 'accountant',
    'Mr.Bennett': 'accountant',
    Barista: 'barista',
    'Barista · Cocafe': 'barista',
    Yifan: 'yifan',
    '❤️': 'yifan',
    'Old Teammate': 'old_teammate',
  });

  global.NVC_PHONE_DATA = {
    FRASER_SMS_DAY,
    FRASER_SMS_DAY_ZH,
    FAMILY_MSG_POOL,
    FAMILY_NPC_LINES,
    FAMILY_NPC_LINES_ZH,
    QUICK_REPLY_FOLLOWUPS,
    FRASER_CALL_ENDINGS,
    FRASER_VOICEMAIL,
    JAMES_LINES_BY_STATE,
    JAMES_LINES_BY_STATE_ZH,
    JAMES_LINES_BY_NPC,
    NPC_DISPLAY,
    NPC_DISPLAY_ALIASES,
  };
})(typeof window !== 'undefined' ? window : globalThis);
