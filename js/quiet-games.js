/**
 * Yifan room quiet games: Chess endgame map + Velvet Scrabble (local AI).
 * Word bank is game-universe themed (spaces / buttons), not textbook packs.
 */
(function (global) {
  'use strict';

  const CHESS_STORAGE = 'neovelvet_quiet_chess_v2';
  const SCRABBLE_STORAGE = 'neovelvet_quiet_scrabble_v1';
  const FILES = 'abcdefgh';
  // In-memory fallback if localStorage is unavailable / flaky.
  let chessProgressMem = null;


  // ── Word bank: game-world packs (in-universe examples) ─────────────
  // Board play uses en with spaces stripped; prefer 3–7 letter tokens.
  const WORD_THEMES = [
    {
      id: 'yifan_room',
      label: { en: 'Her Room', zh: '她的房间' },
      hint: { en: 'Bookshelf, mailbox, plants', zh: '书架、信箱、植物' },
      words: [
        { en: 'shelf', zh: '书架', level: 'B1', example: { who: 'yifan', en: 'The shelf keeps our quieter games in Her Room.', zh: '她房间的书架上放着更安静的游戏。' } },
        { en: 'mail', zh: '信件', level: 'B1', example: { who: 'yifan', en: 'Check the mailbox — something kind may wait.', zh: '看看信箱，也许有温柔的东西。' } },
        { en: 'pin', zh: '别针', level: 'B1', example: { who: 'james', en: 'I pin it on her board before I forget.', zh: '我怕忘，先钉到她的记事板上。' } },
        { en: 'lamp', zh: '暖灯', level: 'B1', example: { who: 'yifan', en: 'Keep the soft lamp on — the room likes it.', zh: '暖灯开着，房间会舒服些。' } },
        { en: 'plant', zh: '植物', level: 'B1', example: { who: 'james', en: 'She hands me the mister like a tiny plant quest.', zh: '她把喷壶递给我，像发了植物小任务。' } },
        { en: 'note', zh: '便条', level: 'B1', example: { who: 'yifan', en: 'Leave the note on the nightstand in my room.', zh: '把便条放在我房间床头柜上。' } },
        { en: 'cozy', zh: '惬意', level: 'B2', example: { who: 'james', en: 'Her Room stays cozy even when the city is loud.', zh: '哪怕城市很吵，她的房间仍很惬意。' } },
        { en: 'cushion', zh: '坐垫', level: 'B2', example: { who: 'yifan', en: 'We end up on the floor cushion for Scrabble.', zh: '玩拼词时总会坐到落地坐垫上。' } },
        { en: 'screen', zh: '纱窗', level: 'B2', example: { who: 'james', en: 'The window screen softens the city glow outside.', zh: '纱窗把外面的城市光滤软了。' } },
        { en: 'keepsake', zh: '小纪念', level: 'B2', example: { who: 'yifan', en: 'That photo is a keepsake on my pinboard.', zh: '那张照片是记事板上的小纪念。' } },
        { en: 'quiet', zh: '安静', level: 'B1', example: { who: 'james', en: 'Quiet is the house rule in Her Room.', zh: '在她房间，安静是家规。' } },
        { en: 'ribbon', zh: '丝带', level: 'B1', example: { who: 'yifan', en: 'A ribbon marks the page we stopped on.', zh: '丝带标着我们停下来的那一页。' } },
      ],
    },
    {
      id: 'work',
      label: { en: 'Work Desk', zh: '工作桌' },
      hint: { en: 'Contracts, pet route, stamps', zh: '合同、宠物路线、印章' },
      words: [
        { en: 'deal', zh: '成交', level: 'B1', example: { who: 'james', en: 'One clean signature and the Work deal is done.', zh: '干干净净签完，Work 就成交了。' } },
        { en: 'sign', zh: '签字', level: 'B1', example: { who: 'yifan', en: 'His shoulders drop after a good Work sign.', zh: 'Work 签好后，他肩会松下来。' } },
        { en: 'leash', zh: '牵引绳', level: 'B1', example: { who: 'james', en: 'On the pet route, the leash is half the plan.', zh: '宠物路线里，牵引绳是半个计划。' } },
        { en: 'kennel', zh: '狗窝', level: 'B2', example: { who: 'yifan', en: 'Get the pack to the kennel before the timer bites.', zh: '在计时咬人前把队伍带回狗窝。' } },
        { en: 'stamp', zh: '印章', level: 'B1', example: { who: 'james', en: 'When the Work stamp lands, the office exhales.', zh: 'Work 印章落下时，办公室会松口气。' } },
        { en: 'smudge', zh: '污渍', level: 'B2', example: { who: 'james', en: 'Pet-route mud left a smudge before I noticed.', zh: '宠物路线的泥先留下了污渍。' } },
        { en: 'inbox', zh: '收件箱', level: 'B1', example: { who: 'yifan', en: 'His Work inbox looks like a second city.', zh: '他的 Work 收件箱像第二座城。' } },
        { en: 'shift', zh: '班次', level: 'B1', example: { who: 'james', en: 'Another Work shift, another careful page.', zh: '又一个 Work 班次，又一页小心翼翼。' } },
        { en: 'pack', zh: '宠物队', level: 'B2', example: { who: 'yifan', en: 'Chain ten pets — the pack has to come home.', zh: '串起十只，宠物队得回家。' } },
        { en: 'fail', zh: '失败', level: 'B1', example: { who: 'james', en: 'A Work fail still counts as a story we keep.', zh: 'Work 失败也算我们留下的故事。' } },
        { en: 'desk', zh: '办公桌', level: 'B1', example: { who: 'yifan', en: 'His Work desk keeps the stapler and the storm.', zh: '他的 Work 桌既放订书机也放风暴。' } },
        { en: 'suit', zh: '西装', level: 'B1', example: { who: 'james', en: 'The Work suit waits for trip days by the door.', zh: '出差那天，Work 西装在门口等着。' } },
      ],
    },
    {
      id: 'relax',
      label: { en: 'Relax Spa', zh: 'Relax 水疗' },
      hint: { en: 'Steam, robe, soft towels', zh: '蒸汽、浴袍、软毛巾' },
      words: [
        { en: 'steam', zh: '蒸汽', level: 'B1', example: { who: 'james', en: 'Relax fills the room with quiet steam.', zh: 'Relax 让房间装满安静的蒸汽。' } },
        { en: 'robe', zh: '浴袍', level: 'B1', example: { who: 'yifan', en: 'His bathrobe still smells like Relax.', zh: '他的浴袍上还留着 Relax 的味道。' } },
        { en: 'soak', zh: '浸泡', level: 'B2', example: { who: 'james', en: 'I soak until the Work noise goes soft.', zh: '我泡到 Work 的噪音变软。' } },
        { en: 'towel', zh: '毛巾', level: 'B1', example: { who: 'yifan', en: 'Navy towel to the ankles — classic Relax.', zh: '深蓝浴巾到脚踝，标准 Relax。' } },
        { en: 'doze', zh: '打盹', level: 'B2', example: { who: 'james', en: 'If I doze in the bath, the duck keeps watch.', zh: '要是我在浴缸打盹，小鸭会守着。' } },
        { en: 'bath', zh: '泡澡', level: 'B1', example: { who: 'yifan', en: 'Relax is a bath that forgives the day.', zh: 'Relax 是原谅这一天的泡澡。' } },
        { en: 'foam', zh: '泡沫', level: 'B1', example: { who: 'james', en: 'Foam hides my phone face-down on purpose.', zh: '泡沫故意遮住我朝下的手机。' } },
        { en: 'warm', zh: '温暖', level: 'B1', example: { who: 'yifan', en: 'Stay warm — Relax is not a race.', zh: '保持温暖，Relax 不是赛跑。' } },
        { en: 'spa', zh: '水疗', level: 'B1', example: { who: 'james', en: 'Spa soft means bare shoulders and quiet.', zh: '水疗软装是裸肩和安静。' } },
        { en: 'nap', zh: '小睡', level: 'B1', example: { who: 'yifan', en: 'A nap in Relax still counts as care.', zh: '在 Relax 小睡也算一种照顾。' } },
        { en: 'soft', zh: '柔软', level: 'B1', example: { who: 'james', en: 'Everything in Relax is soft on purpose.', zh: 'Relax 里的一切都故意很软。' } },
        { en: 'calm', zh: '平静', level: 'B1', example: { who: 'yifan', en: 'Come back with calm from the spa.', zh: '从水疗带着平静回来。' } },
      ],
    },
    {
      id: 'empire',
      label: { en: 'Empire', zh: 'Empire' },
      hint: { en: 'Bids, debt slips, audits', zh: '出价、欠账单、审计' },
      words: [
        { en: 'debt', zh: '债务', level: 'B2', example: { who: 'james', en: 'In Empire, a red debt slip means dodge.', zh: '在 Empire，红色欠账单要躲开。' } },
        { en: 'audit', zh: '审计', level: 'C1', example: { who: 'yifan', en: 'Audit arrives like bad weather in Empire.', zh: '审计在 Empire 里像坏天气一样来。' } },
        { en: 'bid', zh: '出价', level: 'B2', example: { who: 'james', en: 'One clean bid can own the lawn.', zh: '一次干净出价就能拿下草坪。' } },
        { en: 'gold', zh: '金币', level: 'B1', example: { who: 'yifan', en: 'Gold is loud in Empire — collect carefully.', zh: 'Empire 里金币很吵，收的时候要小心。' } },
        { en: 'ledger', zh: '账本', level: 'C1', example: { who: 'james', en: 'The ledger never forgets an Empire night.', zh: '账本从不忘记 Empire 的夜晚。' } },
        { en: 'stock', zh: '股份', level: 'B2', example: { who: 'yifan', en: 'IPO stock still smells like champagne nerves.', zh: '上市股份还带着香槟紧张味。' } },
        { en: 'crown', zh: '皇冠', level: 'B1', example: { who: 'james', en: 'Empire crown sits heavier than it looks.', zh: 'Empire 皇冠比看起来沉。' } },
        { en: 'fail', zh: '失败', level: 'B1', example: { who: 'james', en: 'Empire fail leaves bread in my hand anyway.', zh: 'Empire 失败后，手里还攥着面包。' } },
        { en: 'suit', zh: '西装', level: 'B1', example: { who: 'yifan', en: 'Burgundy Empire suit for the Paris lawn.', zh: '酒红 Empire 西装，像站在巴黎草坪。' } },
        { en: 'risk', zh: '风险', level: 'B2', example: { who: 'james', en: 'Every Empire turn is a polite risk.', zh: 'Empire 每一回合都是礼貌的风险。' } },
        { en: 'claim', zh: '声称', level: 'B2', example: { who: 'yifan', en: 'Claim the gold before the audit finds you.', zh: '在审计找到你之前先收金币。' } },
        { en: 'stand', zh: '立场', level: 'B2', example: { who: 'james', en: 'Beggar\'s last stand is still a stand.', zh: '失意者的最后一搏，仍是一种立场。' } },
      ],
    },
    {
      id: 'genewar',
      label: { en: 'Gene War', zh: 'Gene War' },
      hint: { en: 'Labs, samples, glow', zh: '实验室、样本、荧光' },
      words: [
        { en: 'gene', zh: '基因', level: 'B2', example: { who: 'james', en: 'Gene War starts with a careful sample.', zh: 'Gene War 从一份小心的样本开始。' } },
        { en: 'lab', zh: '实验室', level: 'B1', example: { who: 'yifan', en: 'His lab coat reaches the calves after Gene War.', zh: 'Gene War 之后，他的实验风衣到小腿。' } },
        { en: 'vial', zh: '小瓶', level: 'B2', example: { who: 'james', en: 'Do not shake the vial — Gene War taught me.', zh: '别摇小瓶，Gene War 教过我。' } },
        { en: 'glow', zh: '荧光', level: 'B1', example: { who: 'yifan', en: 'That petri glow is prettier than it should be.', zh: '培养皿的荧光美得不该这么美。' } },
        { en: 'sample', zh: '样本', level: 'B2', example: { who: 'james', en: 'Protect the sample; Gene War is impatient.', zh: '护好样本，Gene War 很没耐心。' } },
        { en: 'beaker', zh: '烧杯', level: 'B2', example: { who: 'yifan', en: 'Infinity tie, beaker in hand — lab coat vibe.', zh: '无穷领结，手持烧杯——实验室风。' } },
        { en: 'petri', zh: '培养皿', level: 'C1', example: { who: 'james', en: 'A cracked petri dish ends the run quietly.', zh: '培养皿裂了，这局就安静结束。' } },
        { en: 'mutate', zh: '突变', level: 'C1', example: { who: 'yifan', en: 'If it mutates, rewrite the plan — not the love.', zh: '若突变了，改计划，别改爱意。' } },
        { en: 'coat', zh: '外套', level: 'B1', example: { who: 'james', en: 'White coat to the calves after clearing Gene War.', zh: '通关 Gene War 后，白风衣到小腿。' } },
        { en: 'glowup', zh: '焕新', level: 'B2', example: { who: 'yifan', en: 'Not a glow-up — just Gene War lighting.', zh: '不是焕新，只是 Gene War 的光。' } },
        { en: 'risk', zh: '风险', level: 'B2', example: { who: 'james', en: 'Gene War risk smells like clean glass.', zh: 'Gene War 的风险闻起来像干净玻璃。' } },
        { en: 'win', zh: '胜利', level: 'B1', example: { who: 'yifan', en: 'A Gene War win still needs a soft landing home.', zh: 'Gene War 赢了，回家仍要软着陆。' } },
      ],
    },
    {
      id: 'love',
      label: { en: 'Love Lane', zh: '恋爱小径' },
      hint: { en: 'Onesies, pout, soft landings', zh: '连体衣、闷气、软着陆' },
      words: [
        { en: 'onesie', zh: '连体衣', level: 'B2', example: { who: 'yifan', en: 'Matching onesies on Love Lane are a promise.', zh: 'Love Lane 上的同款连体衣是一种约定。' } },
        { en: 'pout', zh: '闷气', level: 'B2', example: { who: 'james', en: 'Her Love Lane pout means softer words now.', zh: '她在 Love Lane 闷气，意思是现在要说软话。' } },
        { en: 'blush', zh: '脸红', level: 'B1', example: { who: 'yifan', en: 'His blush arrives before the sentence does.', zh: '他的脸红比句子先到。' } },
        { en: 'hug', zh: '拥抱', level: 'B1', example: { who: 'james', en: 'A Love Lane hug restarts the walk.', zh: 'Love Lane 上的拥抱能重启散步。' } },
        { en: 'lane', zh: '小径', level: 'B1', example: { who: 'yifan', en: 'The lane remembers every miss and repair.', zh: '小径记得每一次错过和修好。' } },
        { en: 'miss', zh: '错过', level: 'B1', example: { who: 'james', en: 'A Love miss still unlocks the quiet onesie.', zh: 'Love 错过仍会解锁安静连体衣。' } },
        { en: 'kiss', zh: '吻', level: 'B1', example: { who: 'yifan', en: 'A cheek kiss can fix more than speeches.', zh: '贴颊吻比演讲管用。' } },
        { en: 'heart', zh: '心', level: 'B1', example: { who: 'james', en: 'Heart patch sits where hugs land.', zh: '心形补丁正好在拥抱落点。' } },
        { en: 'pair', zh: '成对', level: 'B1', example: { who: 'yifan', en: 'We pair rabbit and chick for soft days.', zh: '柔软的日子我们配对兔子和小鸡。' } },
        { en: 'soft', zh: '柔软', level: 'B1', example: { who: 'james', en: 'Soft landing after a sulk on Love Lane.', zh: 'Love Lane 闷过之后，练习软着陆。' } },
        { en: 'hold', zh: '牵住', level: 'B1', example: { who: 'yifan', en: 'Hold my hand tighter after a miss.', zh: '错过之后，牵手更紧一点。' } },
        { en: 'sorry', zh: '抱歉', level: 'B1', example: { who: 'james', en: 'The snake onesie is my quiet sorry.', zh: '蛇塑连体衣是我安静的抱歉。' } },
      ],
    },
  ];

  // ── Chess puzzles (single-solution lines only) ────────────────────────
  // Board keys: algebraic. Uppercase = white (player), lowercase = black.
  // Boards verified as real checkmates (black to move after the line).
  const CHESS_LEVELS = [
    {
      id: 'c01', title: { en: 'Back-rank whisper', zh: '底线轻声' },
      goal: { en: 'Mate in 1', zh: '一步将死' },
      mateIn: 1, side: 'w',
      map: { x: 0.18, y: 0.55 },
      board: { e1: 'K', a1: 'R', e8: 'k', b7: 'p', c7: 'p', d7: 'p', e7: 'p', f7: 'p', g7: 'p', h7: 'p' },
      solution: [{ from: 'a1', to: 'a8' }],
      lineNote: { en: 'Rook down the open a-file — black pawns seal the king.', zh: '车沿开放 a 线到底，黑兵堵住退路。' },
    },
    {
      id: 'c02', title: { en: 'Queen’s quiet door', zh: '后的静门' },
      goal: { en: 'Mate in 1', zh: '一步将死' },
      mateIn: 1, side: 'w',
      map: { x: 0.34, y: 0.42 },
      board: { e1: 'K', d1: 'Q', a8: 'k', a7: 'p', b7: 'p' },
      solution: [{ from: 'd1', to: 'd8' }],
      lineNote: { en: 'Queen to the back rank; the corner has no air.', zh: '后来到底线，角落无路。' },
    },
    {
      id: 'c03', title: { en: 'Ladder first rung', zh: '梯子第一级' },
      goal: { en: 'Mate in 1', zh: '一步将死' },
      mateIn: 1, side: 'w',
      map: { x: 0.50, y: 0.30 },
      board: { e1: 'K', a7: 'R', h1: 'R', g6: 'N', g8: 'k', f8: 'p', g7: 'p' },
      solution: [{ from: 'h1', to: 'h8' }],
      lineNote: { en: 'Rook to h8 — knight guards the capture.', zh: '车到 h8，马看住吃车。' },
    },
    {
      id: 'c04', title: { en: 'Queen on the file', zh: '后占直线' },
      goal: { en: 'Mate in 1', zh: '一步将死' },
      mateIn: 1, side: 'w',
      map: { x: 0.66, y: 0.42 },
      board: { e1: 'K', f6: 'Q', h8: 'k', g7: 'p', h7: 'p' },
      solution: [{ from: 'f6', to: 'f8' }],
      lineNote: { en: 'Queen to f8 — corner king, pawns block the side.', zh: '后到 f8，角王被兵挡住。' },
    },
    {
      id: 'c05', title: { en: 'Arabian hush', zh: '阿拉伯静将' },
      goal: { en: 'Mate in 1', zh: '一步将死' },
      mateIn: 1, side: 'w',
      map: { x: 0.82, y: 0.55 },
      board: { e1: 'K', h6: 'R', f6: 'N', h8: 'k' },
      solution: [{ from: 'h6', to: 'h7' }],
      lineNote: { en: 'Rook checks; knight guards the escape and the capture.', zh: '车将军，马看住逃格与吃车。' },
    },
    {
      id: 'c06', title: { en: 'Two-step corridor', zh: '两步走廊' },
      goal: { en: 'Mate in 2', zh: '两步将死' },
      mateIn: 2, side: 'w',
      map: { x: 0.26, y: 0.72 },
      board: { e1: 'K', d5: 'B', d6: 'P', b5: 'R', h1: 'R', a8: 'k', a6: 'p', b7: 'p' },
      solution: [
        { from: 'h1', to: 'h8' },
        { reply: { from: 'a8', to: 'a7' } },
        { from: 'b5', to: 'b7' },
      ],
      lineNote: { en: 'Check on the eighth, then capture on b7 for mate.', zh: '八线将军，再吃 b7 将死。' },
    },
    {
      id: 'c07', title: { en: 'Ladder climb', zh: '爬梯' },
      goal: { en: 'Mate in 2', zh: '两步将死' },
      mateIn: 2, side: 'w',
      map: { x: 0.50, y: 0.78 },
      board: { e1: 'K', e5: 'B', e6: 'P', g5: 'R', a1: 'R', h8: 'k', h6: 'p', g7: 'p' },
      solution: [
        { from: 'a1', to: 'a8' },
        { reply: { from: 'h8', to: 'h7' } },
        { from: 'g5', to: 'g7' },
      ],
      lineNote: { en: 'Mirror corridor — check, then capture on g7 for mate.', zh: '镜像走廊：将军后再吃 g7 将死。' },
    },
    {
      id: 'c08', title: { en: 'Rook and roll', zh: '双车收束' },
      goal: { en: 'Mate in 2', zh: '两步将死' },
      mateIn: 2, side: 'w',
      map: { x: 0.74, y: 0.72 },
      board: { e1: 'K', d5: 'Q', b5: 'R', h1: 'R', a8: 'k', a6: 'p', b7: 'p', c7: 'p' },
      solution: [
        { from: 'h1', to: 'h8' },
        { reply: { from: 'a8', to: 'a7' } },
        { from: 'b5', to: 'b7' },
      ],
      lineNote: { en: 'Check, then capture on b7 — queen guards the rook.', zh: '将军再吃 b7，后护住车。' },
    },
  ];

  // ── Word defs (EN gloss for wordbook) ─────────────────────────────────
  const WORD_DEFS = {
    shelf: 'a board for holding books', mail: 'letters and packages', pin: 'a small fastener',
    lamp: 'a light that softens a room', plant: 'a living green thing you water', note: 'a short written message',
    cozy: 'warm and comfortably soft', cushion: 'a soft pad to sit on', screen: 'a mesh that softens outside light',
    keepsake: 'a small treasure kept for memory', quiet: 'calm with little noise', ribbon: 'a thin strip that marks a page',
    deal: 'an agreement to finish work', sign: 'to write your name to agree', leash: 'a strap for walking a pet',
    kennel: 'a shelter where pets stay', stamp: 'an official mark of approval', smudge: 'a dirty mark left behind',
    inbox: 'where new messages arrive', shift: 'a scheduled work period', pack: 'a group of pets on a route',
    fail: 'to not succeed this round', desk: 'a table for office work', suit: 'formal clothing for work',
    steam: 'hot mist in the air', robe: 'a soft wrap worn after bathing', soak: 'to rest in warm water',
    towel: 'cloth for drying skin', doze: 'to sleep lightly for a moment', bath: 'washing in a tub of water',
    foam: 'soft bubbles on water', warm: 'pleasantly heated', spa: 'a place for rest and care',
    nap: 'a short sleep', soft: 'gentle to touch', calm: 'peaceful and steady',
    debt: 'money owed', audit: 'a careful check of records', bid: 'an offer of a price',
    gold: 'valuable yellow metal or coins', ledger: 'a book of money records', stock: 'shares in a company',
    crown: 'a symbol worn by a ruler', claim: 'to take as yours', stand: 'a firm position or stance',
    gene: 'a unit of living code', lab: 'a place for science work', vial: 'a small bottle for liquid',
    glow: 'soft light that shines', sample: 'a small piece taken to test', beaker: 'a glass cup for experiments',
    petri: 'a shallow dish for cultures', mutate: 'to change form suddenly', coat: 'an outer layer of clothing',
    glowup: 'a bright refreshed look', risk: 'a chance that something fails', win: 'to succeed in a challenge',
    onesie: 'a one-piece soft outfit', pout: 'a sulky look that asks for care', blush: 'a warm red on the cheeks',
    hug: 'holding someone close', lane: 'a narrow path for walking', miss: 'to fail to meet or catch',
    kiss: 'a soft touch with the lips', heart: 'the center of feeling', pair: 'two things that match',
    hold: 'to keep something in hand', sorry: 'a word that mends a hurt',
  };

  function wordDef(w) {
    const key = String(w.en || '').toLowerCase().replace(/\s+/g, '');
    return w.def || WORD_DEFS[key] || ('a word from the room dictionary: ' + w.en);
  }

  // ── Scrabble / crossword helpers ──────────────────────────────────────
  const LETTER_POINTS = {
    A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
    K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
    U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
  };

  function zh() {
    try { return typeof getLocale === 'function' && getLocale() === 'zh'; } catch (_) { return false; }
  }

  function L(obj, fallback) {
    if (!obj) return fallback || '';
    return zh() ? (obj.zh || obj.en || fallback || '') : (obj.en || obj.zh || fallback || '');
  }

  function cloneBoard(b) {
    return Object.assign({}, b);
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const v = JSON.parse(raw);
      return v && typeof v === 'object' ? v : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function saveJson(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (_) { /* ignore */ }
  }

  function loadChessProgress() {
    const p = loadJson(CHESS_STORAGE, null);
    let cleared = [];
    if (p && Array.isArray(p.cleared)) cleared = p.cleared.slice();
    // migrate v1 if present
    if (!cleared.length) {
      const old = loadJson('neovelvet_quiet_chess_v1', null);
      if (old && Array.isArray(old.cleared) && old.cleared.length) {
        cleared = old.cleared.slice();
      }
    }
    if (chessProgressMem && Array.isArray(chessProgressMem.cleared)) {
      chessProgressMem.cleared.forEach((id) => {
        if (!cleared.includes(id)) cleared.push(id);
      });
    }
    const out = { cleared };
    chessProgressMem = out;
    return { cleared: cleared.slice() };
  }

  function saveChessProgress(p) {
    const cleared = Array.isArray(p?.cleared) ? p.cleared.slice() : [];
    chessProgressMem = { cleared };
    saveJson(CHESS_STORAGE, chessProgressMem);
    // also write v1 for older readers
    saveJson('neovelvet_quiet_chess_v1', chessProgressMem);
  }

  function findKingSq(board, whiteKing) {
    const want = whiteKing ? 'K' : 'k';
    const keys = Object.keys(board || {});
    for (let i = 0; i < keys.length; i++) {
      if (board[keys[i]] === want) return keys[i];
    }
    return null;
  }

  function formatChessMove(from, to) {
    return String(from || '').toUpperCase() + ' → ' + String(to || '').toUpperCase();
  }

  function mateExplainLines(chess) {
    const lv = chess?.level;
    if (!lv) return [];
    const moves = (lv.solution || []).filter((s) => s.from && s.to);
    const moveStr = moves.map((m) => formatChessMove(m.from, m.to)).join(zh() ? '，然后 ' : ', then ');
    if (zh()) {
      return [
        '目标：' + L(lv.goal),
        '正解：' + (moveStr || '—'),
        L(lv.lineNote) || '黑王无路可逃，被将死。',
        '浅色棋子是你；通关后地图下一关会点亮。',
      ];
    }
    return [
      'Goal: ' + L(lv.goal),
      'Line: ' + (moveStr || '—'),
      L(lv.lineNote) || 'The black king has no escape — checkmate.',
      'Light pieces are yours; clearing lights the next map node.',
    ];
  }

  function loadScrabblePrefs() {
    const valid = new Set(WORD_THEMES.map((t) => t.id));
    const p = loadJson(SCRABBLE_STORAGE, { themes: ['yifan_room', 'work'], seen: {} });
    let themes = Array.isArray(p.themes) ? p.themes.filter((id) => valid.has(id)) : [];
    if (!themes.length) themes = ['yifan_room', 'work'];
    p.themes = themes;
    if (!p.seen || typeof p.seen !== 'object') p.seen = {};
    return p;
  }

  function saveScrabblePrefs(p) {
    saveJson(SCRABBLE_STORAGE, p);
  }

  function wordsForThemes(themeIds) {
    const set = new Set(themeIds || []);
    const out = [];
    WORD_THEMES.forEach((t) => {
      if (!set.has(t.id)) return;
      t.words.forEach((w) => out.push({ ...w, theme: t.id, def: wordDef(w) }));
    });
    return out;
  }

  // ── Chess helpers ─────────────────────────────────────────────────────
  function sqToRc(sq) {
    const f = FILES.indexOf(sq[0]);
    const r = 8 - parseInt(sq[1], 10);
    return { c: f, r };
  }

  function rcToSq(r, c) {
    if (r < 0 || r > 7 || c < 0 || c > 7) return null;
    return FILES[c] + String(8 - r);
  }

  function applyChessMove(board, from, to) {
    const next = cloneBoard(board);
    if (!next[from]) return next;
    next[to] = next[from];
    delete next[from];
    return next;
  }

  function isLevelUnlocked(levelId, cleared) {
    const idx = CHESS_LEVELS.findIndex((l) => l.id === levelId);
    if (idx <= 0) return true;
    if (!Array.isArray(cleared)) return false;
    // Unlock when the previous node is cleared (sequential map).
    return cleared.includes(CHESS_LEVELS[idx - 1].id);
  }

  function nextChessLevelId(levelId) {
    const idx = CHESS_LEVELS.findIndex((l) => l.id === levelId);
    if (idx < 0 || idx >= CHESS_LEVELS.length - 1) return null;
    return CHESS_LEVELS[idx + 1].id;
  }

  /** Pseudo-legal landing squares for movement guides (not the puzzle solution). */
  function chessLegalTargets(board, from) {
    const piece = board[from];
    if (!piece) return [];
    const white = piece === piece.toUpperCase();
    const kind = piece.toUpperCase();
    const { r, c } = sqToRc(from);
    const out = [];
    const at = (rr, cc) => (rr < 0 || rr > 7 || cc < 0 || cc > 7 ? null : board[rcToSq(rr, cc)]);
    const isFriend = (p) => p && (white ? p === p.toUpperCase() : p === p.toLowerCase());
    const isEnemy = (p) => p && (white ? p === p.toLowerCase() : p === p.toUpperCase());
    const push = (rr, cc) => {
      if (rr < 0 || rr > 7 || cc < 0 || cc > 7) return false;
      const p = at(rr, cc);
      if (isFriend(p)) return false;
      out.push(rcToSq(rr, cc));
      return !isEnemy(p);
    };
    const slide = (dirs) => {
      dirs.forEach(([dr, dc]) => {
        let rr = r + dr;
        let cc = c + dc;
        while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
          if (!push(rr, cc)) break;
          rr += dr;
          cc += dc;
        }
      });
    };
    if (kind === 'R') slide([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    else if (kind === 'B') slide([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    else if (kind === 'Q') slide([[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
    else if (kind === 'K') {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr || dc) push(r + dr, c + dc);
      }
    } else if (kind === 'N') {
      [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || rr > 7 || cc < 0 || cc > 7) return;
        const p = at(rr, cc);
        if (!isFriend(p)) out.push(rcToSq(rr, cc));
      });
    } else if (kind === 'P') {
      const dir = white ? -1 : 1;
      if (!at(r + dir, c)) {
        out.push(rcToSq(r + dir, c));
        const startRow = white ? 6 : 1;
        if (r === startRow && !at(r + dir * 2, c)) out.push(rcToSq(r + dir * 2, c));
      }
      [-1, 1].forEach((dc) => {
        const p = at(r + dir, c + dc);
        if (isEnemy(p)) out.push(rcToSq(r + dir, c + dc));
      });
    }
    return out;
  }

  const CLUE_PALETTE = ['#c04060', '#6a9870', '#c89060', '#6a80c0', '#b070a0', '#8a7060', '#d08050', '#5a9088'];
  function clueColor(num) {
    return CLUE_PALETTE[(((num || 1) - 1) % CLUE_PALETTE.length + CLUE_PALETTE.length) % CLUE_PALETTE.length];
  }

  function seedChessMap(quietGame) {
    const progress = loadChessProgress();
    quietGame.open = true;
    quietGame.mode = 'chess_map';
    quietGame.chess = {
      view: 'map',
      levelId: null,
      progress,
      board: null,
      selected: null,
      step: 0,
      status: '',
      flashWrongUntil: 0,
      returnMode: 'picker',
    };
    quietGame.complete = false;
    quietGame.completeAt = 0;
    quietGame.t0 = performance.now();
  }

  function seedChessHelp(quietGame, returnMode) {
    quietGame.mode = 'chess_help';
    quietGame.chess = quietGame.chess || {};
    quietGame.chess.returnMode = returnMode || 'chess_map';
    quietGame.chess.helpPage = 0;
  }

  function seedChessLevel(quietGame, levelId) {
    const level = CHESS_LEVELS.find((l) => l.id === levelId);
    if (!level) return;
    const progress = loadChessProgress();
    if (!isLevelUnlocked(levelId, progress.cleared) && !progress.cleared.includes(levelId)) return;
    quietGame.mode = 'chess_play';
    quietGame.chess = {
      view: 'play',
      levelId,
      level,
      progress,
      board: cloneBoard(level.board),
      selected: null,
      step: 0,
      status: zh() ? '点己方棋子 · 看走法线' : 'Tap your piece · see move lines',
      flashWrongUntil: 0,
      replay: progress.cleared.includes(levelId),
      returnMode: 'chess_map',
      goalText: L(level.goal),
      hintStage: 0,
    };
    quietGame.complete = false;
    quietGame.completeAt = 0;
  }

  function chessExpectedPlayerMove(chess) {
    const sol = chess.level.solution;
    let playerMoves = 0;
    for (let i = 0; i < sol.length; i++) {
      if (sol[i].from && sol[i].to) {
        if (playerMoves === chess.step) return sol[i];
        playerMoves += 1;
      }
    }
    return null;
  }

  function chessAdvanceAfterPlayer(quietGame, now) {
    const chess = quietGame.chess;
    const sol = chess.level.solution;
    let seen = 0;
    let idx = -1;
    for (let i = 0; i < sol.length; i++) {
      if (sol[i].from && sol[i].to) {
        if (seen === chess.step - 1) { idx = i; break; }
        seen += 1;
      }
    }
    if (idx < 0) return;
    const next = sol[idx + 1];
    if (next && next.reply) {
      chess.board = applyChessMove(chess.board, next.reply.from, next.reply.to);
      const more = chessExpectedPlayerMove(chess);
      if (!more) completeChessLevel(quietGame, now);
      else chess.status = zh() ? '轮到你继续 · 点棋子看引导' : 'Your move · tap a piece for guides';
    } else {
      const more = chessExpectedPlayerMove(chess);
      if (!more) completeChessLevel(quietGame, now);
      else chess.status = zh() ? '很好，下一步 · 点棋子看引导' : 'Good — next · tap for guides';
    }
  }

  function completeChessLevel(quietGame, now) {
    const chess = quietGame.chess;
    if (!chess) return;
    quietGame.complete = true;
    quietGame.completeAt = now;
    const progress = loadChessProgress();
    if (chess.levelId && !progress.cleared.includes(chess.levelId)) {
      progress.cleared.push(chess.levelId);
    }
    saveChessProgress(progress);
    chess.progress = loadChessProgress();
    chess.replay = true;
    chess.selected = null;
    const played = [];
    (chess.level?.solution || []).forEach((s) => { if (s.from && s.to) played.push(s); });
    chess.mateFx = {
      t0: now,
      kingSq: findKingSq(chess.board, false),
      lastMove: played[Math.max(0, (chess.step || 1) - 1)] || played[played.length - 1] || null,
    };
    const nextId = nextChessLevelId(chess.levelId);
    chess.status = nextId
      ? (zh() ? '将死！下一关已解锁' : 'Checkmate! Next level unlocked')
      : (zh() ? '将死！全部通关' : 'Checkmate! All cleared');
    try {
      if (typeof yifanSpace !== 'undefined') {
        yifanSpace.clickBubble = zh() ? '将死。' : 'Checkmate.';
        yifanSpace.clickBubbleIcon = 'K';
        yifanSpace.clickBubbleUntil = now + 3200;
      }
    } catch (_) { /* ignore */ }
    try { if (typeof SFX !== 'undefined') SFX.pet(); } catch (_) { /* ignore */ }
  }

  function tryChessPlayerMove(quietGame, from, to, now) {
    const chess = quietGame.chess;
    if (!chess || quietGame.complete) return;
    const expected = chessExpectedPlayerMove(chess);
    if (!expected) return;
    if (from === expected.from && to === expected.to) {
      chess.board = applyChessMove(chess.board, from, to);
      chess.selected = null;
      chess.hintStage = 0;
      chess.step += 1;
      chessAdvanceAfterPlayer(quietGame, now);
      try { if (typeof SFX !== 'undefined') SFX.ui(); } catch (_) { /* ignore */ }
    } else {
      chess.selected = null;
      chess.flashWrongUntil = now + 700;
      chess.status = zh() ? '不是这条解线。' : 'Not this line.';
      try { if (typeof SFX !== 'undefined') SFX.ui(); } catch (_) { /* ignore */ }
    }
  }

  // ── Crossword (fill-in) ───────────────────────────────────────────────
  function normalizePlayWord(w) {
    return String(w.en || '').toUpperCase().replace(/\s+/g, '').replace(/[^A-Z]/g, '');
  }

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function dedupeWordPool(wordEntries) {
    const seen = new Set();
    const pool = [];
    (wordEntries || []).forEach((w) => {
      const word = normalizePlayWord(w);
      if (word.length < 3 || word.length > 7) return;
      if (seen.has(word)) return;
      seen.add(word);
      pool.push({ raw: w, word });
    });
    return pool;
  }

  function finalizeCrosswordGrid(grid, placements, size) {
    let minR = size, maxR = 0, minC = size, maxC = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c]) continue;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
    if (maxR < minR) return null;
    const rows = maxR - minR + 1;
    const cols = maxC - minC + 1;
    const solution = Array.from({ length: rows }, () => Array(cols).fill(null));
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        solution[r - minR][c - minC] = grid[r][c];
      }
    }
    const placed = placements.map((p) => ({
      word: p.word, r: p.r - minR, c: p.c - minC, horiz: p.horiz, entry: p.entry, num: 0,
    }));
    const startKey = new Map();
    let num = 1;
    placed.slice().sort((a, b) => (a.r === b.r ? a.c - b.c : a.r - b.r)).forEach((p) => {
      const key = p.r + ',' + p.c;
      if (!startKey.has(key)) startKey.set(key, num++);
      p.num = startKey.get(key);
    });
    return { rows, cols, solution, placements: placed };
  }

  function buildCrosswordOnce(basePool, targetCount) {
    const size = 13;
    const grid = Array.from({ length: size }, () => Array(size).fill(null));
    const placements = [];
    const used = new Set();
    const pool = basePool.slice();
    shuffleInPlace(pool);
    // Mix lengths: start with a medium/short anchor for denser crosses
    pool.sort((a, b) => a.word.length - b.word.length);

    function canPlace(word, r, c, horiz) {
      if (horiz) {
        if (c < 0 || c + word.length > size || r < 0 || r >= size) return false;
        if (c > 0 && grid[r][c - 1]) return false;
        if (c + word.length < size && grid[r][c + word.length]) return false;
        for (let i = 0; i < word.length; i++) {
          const cell = grid[r][c + i];
          if (cell && cell !== word[i]) return false;
          if (!cell) {
            if (r > 0 && grid[r - 1][c + i]) return false;
            if (r < size - 1 && grid[r + 1][c + i]) return false;
          }
        }
        return true;
      }
      if (r < 0 || r + word.length > size || c < 0 || c >= size) return false;
      if (r > 0 && grid[r - 1][c]) return false;
      if (r + word.length < size && grid[r + word.length][c]) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[r + i][c];
        if (cell && cell !== word[i]) return false;
        if (!cell) {
          if (c > 0 && grid[r + i][c - 1]) return false;
          if (c < size - 1 && grid[r + i][c + 1]) return false;
        }
      }
      return true;
    }

    function place(word, r, c, horiz, entry) {
      for (let i = 0; i < word.length; i++) {
        if (horiz) grid[r][c + i] = word[i];
        else grid[r + i][c] = word[i];
      }
      placements.push({ word, r, c, horiz, entry, num: 0 });
      used.add(word);
    }

    function tryPlaceCand(cand) {
      const options = [];
      for (let oi = 0; oi < placements.length; oi++) {
        const other = placements[oi];
        for (let i = 0; i < cand.word.length; i++) {
          for (let j = 0; j < other.word.length; j++) {
            if (cand.word[i] !== other.word[j]) continue;
            if (other.horiz) {
              const r = other.r - i;
              const c = other.c + j;
              if (canPlace(cand.word, r, c, false)) options.push({ r, c, horiz: false });
            } else {
              const r = other.r + j;
              const c = other.c - i;
              if (canPlace(cand.word, r, c, true)) options.push({ r, c, horiz: true });
            }
          }
        }
      }
      if (!options.length) return false;
      const pick = options[(Math.random() * options.length) | 0];
      place(cand.word, pick.r, pick.c, pick.horiz, cand.raw);
      return true;
    }

    if (!pool.length) return null;
    const first = pool[(Math.random() * Math.min(4, pool.length)) | 0];
    const fr = (size / 2) | 0;
    const fc = Math.max(0, ((size - first.word.length) / 2) | 0);
    place(first.word, fr, fc, true, first.raw);

    // Multi-pass: revisit leftovers after new crosses appear
    const maxWords = Math.min(targetCount || 7, pool.length);
    for (let pass = 0; pass < 6 && placements.length < maxWords; pass++) {
      const remaining = pool.filter((p) => !used.has(p.word));
      shuffleInPlace(remaining);
      // Prefer words that share letters with current grid
      remaining.sort((a, b) => {
        const score = (w) => {
          let s = 0;
          for (let i = 0; i < w.length; i++) {
            for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (grid[r][c] === w[i]) s += 1;
          }
          return s;
        };
        return score(b.word) - score(a.word);
      });
      let gained = false;
      for (let i = 0; i < remaining.length && placements.length < maxWords; i++) {
        if (tryPlaceCand(remaining[i])) gained = true;
      }
      if (!gained) break;
    }

    return finalizeCrosswordGrid(grid, placements, size);
  }

  function buildCrossword(wordEntries) {
    const pool = dedupeWordPool(wordEntries);
    if (!pool.length) return null;

    let best = null;
    const attempts = Math.min(18, 6 + pool.length);
    for (let a = 0; a < attempts; a++) {
      const result = buildCrosswordOnce(pool, 7);
      if (!result || !result.placements.length) continue;
      if (!best || result.placements.length > best.placements.length) best = result;
      if (best.placements.length >= 6) break;
    }

    if (best && best.placements.length >= 4) return best;

    if (best && best.placements.length >= 2) return best;
    return buildSimpleCrossword(pool.slice(0, Math.min(6, pool.length)));
  }

  function buildSimpleCrossword(pool) {
    if (!pool.length) return null;
    // Prefer a crossed spine: one vertical + several horizontals through shared letters
    const size = 13;
    const grid = Array.from({ length: size }, () => Array(size).fill(null));
    const words = pool.slice();
    shuffleInPlace(words);
    words.sort((a, b) => b.word.length - a.word.length);
    const spine = words[0];
    const sc = (size / 2) | 0;
    const sr = Math.max(0, ((size - spine.word.length) / 2) | 0);
    for (let i = 0; i < spine.word.length; i++) grid[sr + i][sc] = spine.word[i];
    const placements = [{ word: spine.word, r: sr, c: sc, horiz: false, entry: spine.raw, num: 0 }];
    const used = new Set([spine.word]);

    for (let wi = 1; wi < words.length && placements.length < 6; wi++) {
      const cand = words[wi];
      if (used.has(cand.word)) continue;
      let placed = false;
      for (let i = 0; i < cand.word.length && !placed; i++) {
        for (let j = 0; j < spine.word.length && !placed; j++) {
          if (cand.word[i] !== spine.word[j]) continue;
          const r = sr + j;
          const c = sc - i;
          if (c < 0 || c + cand.word.length > size) continue;
          let ok = true;
          for (let k = 0; k < cand.word.length; k++) {
            const cell = grid[r][c + k];
            if (cell && cell !== cand.word[k]) { ok = false; break; }
            if (!cell) {
              if (r > 0 && grid[r - 1][c + k]) { ok = false; break; }
              if (r < size - 1 && grid[r + 1][c + k]) { ok = false; break; }
            }
          }
          if (c > 0 && grid[r][c - 1]) ok = false;
          if (c + cand.word.length < size && grid[r][c + cand.word.length]) ok = false;
          if (!ok) continue;
          for (let k = 0; k < cand.word.length; k++) grid[r][c + k] = cand.word[k];
          placements.push({ word: cand.word, r, c, horiz: true, entry: cand.raw, num: 0 });
          used.add(cand.word);
          placed = true;
        }
      }
    }

    const finalized = finalizeCrosswordGrid(grid, placements, size);
    if (finalized && finalized.placements.length >= 2) return finalized;

    // last resort: spaced rows (still unique words)
    const list = words.filter((w, idx, arr) => arr.findIndex((x) => x.word === w.word) === idx).slice(0, 5);
    const cols = Math.max(...list.map((w) => w.word.length));
    const rows = list.length * 2 - 1;
    const solution = Array.from({ length: rows }, () => Array(cols).fill(null));
    const plain = [];
    list.forEach((w, i) => {
      const r = i * 2;
      for (let k = 0; k < w.word.length; k++) solution[r][k] = w.word[k];
      plain.push({ word: w.word, r, c: 0, horiz: true, entry: w.raw, num: i + 1 });
    });
    return { rows, cols, solution, placements: plain };
  }

  function seedScrabbleThemes(quietGame) {
    const prefs = loadScrabblePrefs();
    quietGame.open = true;
    quietGame.mode = 'scrabble_themes';
    quietGame.scrabble = {
      view: 'themes',
      prefs,
      selected: prefs.themes.slice(),
      status: '',
    };
    quietGame.complete = false;
    quietGame.t0 = performance.now();
  }

  function seedScrabbleHelp(quietGame, returnMode) {
    quietGame.mode = 'scrabble_help';
    quietGame.scrabble = quietGame.scrabble || {};
    quietGame.scrabble.returnMode = returnMode || 'scrabble_themes';
  }

  function seedScrabblePlay(quietGame, themeIds) {
    const words = wordsForThemes(themeIds);
    const puzzle = buildCrossword(words);
    if (!puzzle) {
      quietGame.mode = 'scrabble_themes';
      quietGame.scrabble = quietGame.scrabble || {};
      quietGame.scrabble.status = zh() ? '这组词搭不成交叉，换主题试试。' : 'Could not weave these words — try other themes.';
      return;
    }
    const prefs = loadScrabblePrefs();
    prefs.themes = themeIds.slice();
    saveScrabblePrefs(prefs);

    const { rows, cols, solution, placements } = puzzle;
    // Given letters: about 35% of cells, prefer vowels lightly mixed
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (solution[r][c]) cells.push({ r, c, letter: solution[r][c] });
      }
    }
    shuffleInPlace(cells);
    const givenCount = Math.max(2, Math.floor(cells.length * 0.35));
    const givenSet = new Set(cells.slice(0, givenCount).map((x) => x.r + ',' + x.c));
    const fill = Array.from({ length: rows }, () => Array(cols).fill(null));
    const allLetters = [];
    cells.forEach(({ r, c, letter }) => {
      if (givenSet.has(r + ',' + c)) fill[r][c] = { letter, given: true };
      else allLetters.push(letter);
    });
    shuffleInPlace(allLetters);
    const rackPageSize = 7;
    const rack = allLetters.splice(0, rackPageSize);
    const rackReserve = allLetters;

    quietGame.mode = 'scrabble';
    quietGame.scrabble = {
      view: 'play',
      rows,
      cols,
      solution,
      fill,
      placements,
      rack,
      rackReserve,
      rackPageSize,
      themes: themeIds.slice(),
      words,
      selectedRack: -1,
      selectedCell: null, // {r,c}
      status: zh()
        ? '点字母，再点空格填入 · 词表可查释义'
        : 'Tap a letter, then an empty cell · use Wordbook',
      prefs,
      studyIndex: 0,
      studyFocus: null, // placement num or word
      hintPulseUntil: performance.now() + 4000,
    };
    quietGame.complete = false;
    quietGame.completeAt = 0;
  }

  function crosswordFilledCount(s) {
    let n = 0;
    for (let r = 0; r < s.rows; r++) {
      for (let c = 0; c < s.cols; c++) {
        if (s.solution[r][c] && s.fill[r][c] && s.fill[r][c].letter) n += 1;
      }
    }
    return n;
  }

  function crosswordTotalCells(s) {
    let n = 0;
    for (let r = 0; r < s.rows; r++) {
      for (let c = 0; c < s.cols; c++) if (s.solution[r][c]) n += 1;
    }
    return n;
  }

  function crosswordAllCorrect(s) {
    for (let r = 0; r < s.rows; r++) {
      for (let c = 0; c < s.cols; c++) {
        const sol = s.solution[r][c];
        if (!sol) continue;
        const f = s.fill[r][c];
        if (!f || f.letter !== sol) return false;
      }
    }
    return true;
  }

  function rackLettersLeft(s) {
    return (s.rack?.length || 0) + (s.rackReserve?.length || 0);
  }

  function refillRackPage(s) {
    if (!s) return;
    const page = s.rackPageSize || 7;
    if (!Array.isArray(s.rackReserve)) s.rackReserve = [];
    if (!Array.isArray(s.rack)) s.rack = [];
    if (s.rack.length === 0 && s.rackReserve.length) {
      s.rack = s.rackReserve.splice(0, page);
      s.selectedRack = -1;
    }
  }

  /** Keep active page ≤ page size; extras go back to the reserve queue. */
  function normalizeRackPage(s) {
    if (!s) return;
    const page = s.rackPageSize || 7;
    if (!Array.isArray(s.rackReserve)) s.rackReserve = [];
    if (!Array.isArray(s.rack)) s.rack = [];
    if (s.rack.length > page) {
      const extra = s.rack.splice(page);
      s.rackReserve = extra.concat(s.rackReserve);
    }
    refillRackPage(s);
  }

  function placeRackOnCell(s, rackIndex, r, c) {
    if (!s.solution[r][c]) return false;
    const cur = s.fill[r][c];
    if (cur && cur.given) return false;
    const letter = s.rack[rackIndex];
    if (!letter) return false;
    // return previous staged letter to rack
    if (cur && cur.letter && !cur.given) s.rack.push(cur.letter);
    s.fill[r][c] = { letter, given: false };
    s.rack.splice(rackIndex, 1);
    s.selectedRack = -1;
    s.selectedCell = null;
    normalizeRackPage(s);
    if (crosswordAllCorrect(s) && rackLettersLeft(s) === 0) {
      return 'complete';
    }
    if (crosswordFilledCount(s) === crosswordTotalCells(s) && !crosswordAllCorrect(s)) {
      s.status = zh() ? '格子满了，但有错字 · 点错格收回' : 'Board full but some letters wrong · tap to take back';
    } else {
      const left = rackLettersLeft(s);
      const pageN = s.rack.length;
      s.status = zh()
        ? ('本页 ' + pageN + ' · 剩余 ' + left + ' · 点词表看提示')
        : ('Page ' + pageN + ' · ' + left + ' left · open Wordbook');
    }
    return true;
  }

  function clearFillCell(s, r, c) {
    const cur = s.fill[r][c];
    if (!cur || cur.given) return false;
    if (cur.letter) s.rack.push(cur.letter);
    s.fill[r][c] = null;
    s.selectedCell = null;
    normalizeRackPage(s);
    return true;
  }

  function endCrossword(quietGame) {
    const s = quietGame.scrabble;
    quietGame.complete = true;
    quietGame.completeAt = performance.now();
    s.status = zh() ? '交叉词填完了 · 去词表复习例句' : 'Crossword complete · review Wordbook lines';
    (s.placements || []).forEach((p) => {
      const key = String(p.entry.en).toLowerCase();
      const prefs = loadScrabblePrefs();
      prefs.seen[key] = (prefs.seen[key] || 0) + 1;
      saveScrabblePrefs(prefs);
      s.prefs = prefs;
    });
    try {
      if (typeof yifanSpace !== 'undefined') {
        yifanSpace.clickBubble = zh() ? '词都接上了。' : 'Every word linked.';
        yifanSpace.clickBubbleIcon = 'Aa';
        yifanSpace.clickBubbleUntil = performance.now() + 2800;
      }
    } catch (_) { /* ignore */ }
    try { if (typeof SFX !== 'undefined') SFX.pet(); } catch (_) { /* ignore */ }
  }

  // ── Layout / hit / draw (canvas) ──────────────────────────────────────
  function panelBox(W, H, scale) {
    const sc = scale || 1;
    const w = Math.min(W * 0.78 * sc, 620 * sc);
    const h = Math.min(H * 0.82 * sc, 560 * sc);
    return { x: W * 0.5 - w * 0.5, y: H * 0.08, w, h };
  }

  function footerButtons(box, specs) {
    // Place actions along the bottom edge — never over the title.
    const btnH = 26;
    const y = box.y + box.h - 36;
    let x = box.x + 14;
    return specs.map((s) => {
      const w = s.w || 72;
      const b = { id: s.id, label: s.label, x, y, w, h: btnH };
      x += w + 8;
      return b;
    });
  }

  function getLayout(g, W, H) {
    if (!g) return null;
    const closeFor = (box) => ({ x: box.x + box.w - 70, y: box.y + 12, w: 56, h: 22 });

    if (g.mode === 'picker') {
      const box = panelBox(W, H, 0.75);
      const pad = 20;
      const gap = 14;
      const choiceW = (box.w - pad * 2 - gap) / 2;
      const choiceH = Math.min(130, box.h - 120);
      const choices = (g.choices || []).map((choice, i) => ({
        ...choice,
        x: box.x + pad + i * (choiceW + gap),
        y: box.y + 78,
        w: choiceW,
        h: choiceH,
        index: i,
      }));
      return { ...box, close: closeFor(box), choices, cards: [], nodes: [], squares: [], rack: [], buttons: [], clues: [] };
    }

    if (g.mode === 'chess_help' || g.mode === 'scrabble_help' || g.mode === 'chess_why') {
      const box = panelBox(W, H, 0.85);
      const backId = g.mode === 'scrabble_help' ? 'scrabble_help_back'
        : (g.mode === 'chess_why' ? 'chess_why_back' : 'chess_help_back');
      return {
        ...box,
        close: closeFor(box),
        choices: [], cards: [], nodes: [], squares: [], rack: [], clues: [],
        buttons: footerButtons(box, [{ id: backId, label: zh() ? '← 返回' : '← Back', w: 88 }]),
      };
    }

    if (g.mode === 'chess_map') {
      const box = panelBox(W, H, 0.95);
      const progress = loadChessProgress();
      if (g.chess) g.chess.progress = progress;
      const nodes = CHESS_LEVELS.map((lv, i) => {
        const cleared = progress.cleared.includes(lv.id);
        const unlocked = cleared || isLevelUnlocked(lv.id, progress.cleared);
        return {
          id: lv.id, index: i,
          x: box.x + box.w * lv.map.x - 22,
          y: box.y + box.h * lv.map.y - 22,
          w: 44, h: 44, cleared, unlocked, title: L(lv.title),
        };
      });
      return {
        ...box,
        close: closeFor(box),
        choices: [], cards: [], nodes, squares: [], rack: [], clues: [],
        buttons: footerButtons(box, [
          { id: 'back_picker', label: zh() ? '← 返回' : '← Back', w: 88 },
          { id: 'chess_help', label: zh() ? '说明' : 'How to', w: 72 },
        ]),
      };
    }

    if (g.mode === 'chess_play') {
      const box = panelBox(W, H, 0.95);
      const boardSize = Math.min(box.w - 40, box.h - 168);
      const bx = box.x + (box.w - boardSize) * 0.5;
      const by = box.y + 72;
      const cell = boardSize / 8;
      const squares = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          squares.push({ r, c, sq: rcToSq(r, c), x: bx + c * cell, y: by + r * cell, w: cell, h: cell });
        }
      }
      const btns = [
        { id: 'back_map', label: zh() ? '← 地图' : '← Map', w: 72 },
        { id: 'chess_help', label: zh() ? '说明' : 'How to', w: 64 },
      ];
      if (!g.complete) {
        btns.push({ id: 'chess_hint', label: zh() ? '提示' : 'Hint', w: 64 });
        btns.push({ id: 'reset_level', label: zh() ? '重来' : 'Reset', w: 56 });
      } else {
        btns.push({ id: 'reset_level', label: zh() ? '重来' : 'Reset', w: 56 });
        btns.push({ id: 'why_mate', label: zh() ? '为何将死' : 'Why mate?', w: 84 });
        if (nextChessLevelId(g.chess?.levelId)) {
          btns.push({ id: 'next_level', label: zh() ? '下一关 →' : 'Next →', w: 84 });
        }
      }
      return {
        ...box,
        board: { x: bx, y: by, w: boardSize, h: boardSize, cell },
        close: closeFor(box),
        choices: [], cards: [], nodes: [], squares, rack: [], clues: [],
        buttons: footerButtons(box, btns),
      };
    }

    if (g.mode === 'scrabble_themes') {
      const box = panelBox(W, H, 0.9);
      const pad = 18;
      const cols = 2;
      const gap = 10;
      const tw = (box.w - pad * 2 - gap) / cols;
      const th = 50;
      const choices = WORD_THEMES.map((t, i) => {
        const c = i % cols;
        const r = (i / cols) | 0;
        return {
          id: t.id, index: i, label: L(t.label), hint: L(t.hint),
          x: box.x + pad + c * (tw + gap),
          y: box.y + 70 + r * (th + 8),
          w: tw, h: th,
        };
      });
      return {
        ...box,
        close: closeFor(box),
        choices, cards: [], nodes: [], squares: [], rack: [], clues: [],
        buttons: footerButtons(box, [
          { id: 'back_picker', label: zh() ? '← 返回' : '← Back', w: 88 },
          { id: 'scrabble_help', label: zh() ? '说明' : 'How to', w: 72 },
          { id: 'start_scrabble', label: zh() ? '开始填字' : 'Start fill', w: 96 },
        ]),
      };
    }

    if (g.mode === 'scrabble') {
      const box = panelBox(W, H, 1);
      const s = g.scrabble;
      const boardMax = Math.min(box.w * 0.56, box.h - 168);
      const cell = boardMax / Math.max(s.rows, s.cols);
      const bw = cell * s.cols;
      const bh = cell * s.rows;
      const bx = box.x + 16;
      const by = box.y + 56;
      const squares = [];
      for (let r = 0; r < s.rows; r++) {
        for (let c = 0; c < s.cols; c++) {
          if (!s.solution[r][c]) continue;
          squares.push({ r, c, x: bx + c * cell, y: by + r * cell, w: cell, h: cell });
        }
      }
      const clueX = bx + bw + 12;
      const clueW = box.x + box.w - clueX - 14;
      const clues = sortedPlacements(s.placements).map((p, i) => ({
        index: i,
        num: p.num,
        horiz: !!p.horiz,
        color: clueColor(p.num),
        id: 'clue_' + p.num + '_' + (p.horiz ? 'h' : 'v'),
        word: p.word,
        entry: p.entry,
        r: p.r,
        c: p.c,
        len: p.word.length,
        x: clueX,
        y: by + i * 30,
        w: clueW,
        h: 28,
      }));
      const rackY = by + bh + 10;
      const pageLetters = s.rack || [];
      const n = Math.max(1, pageLetters.length);
      const gap = 6;
      const sidePad = 16;
      const avail = Math.max(80, box.w - sidePad * 2);
      const tileW = Math.min(36, Math.floor((avail - gap * (n - 1)) / n));
      const totalW = n * tileW + (n - 1) * gap;
      const rackStartX = box.x + sidePad + Math.max(0, (avail - totalW) * 0.5);
      const rack = pageLetters.map((letter, i) => ({
        index: i, letter,
        x: rackStartX + i * (tileW + gap),
        y: rackY,
        w: tileW, h: tileW,
      }));
      const reserveN = (s.rackReserve || []).length;
      return {
        ...box,
        board: { x: bx, y: by, w: bw, h: bh, cell },
        close: closeFor(box),
        choices: [], cards: [], nodes: [], squares, rack, clues,
        rackMeta: { reserveN, pageN: pageLetters.length },
        buttons: footerButtons(box, [
          { id: 'back_themes', label: zh() ? '← 主题' : '← Themes', w: 88 },
          { id: 'scrabble_help', label: zh() ? '说明' : 'How to', w: 72 },
          { id: 'study_toggle', label: zh() ? '词表' : 'Wordbook', w: 84 },
          { id: 'clear_staged', label: zh() ? '清空自填' : 'Clear mine', w: 88 },
        ]),
      };
    }

    if (g.mode === 'scrabble_study') {
      const box = panelBox(W, H, 0.88);
      return {
        ...box,
        close: closeFor(box),
        choices: [], cards: [], nodes: [], squares: [], rack: [], clues: [],
        buttons: footerButtons(box, [
          { id: 'study_back', label: zh() ? '← 棋盘' : '← Board', w: 88 },
          { id: 'study_prev', label: '‹', w: 40 },
          { id: 'study_next', label: '›', w: 40 },
        ]),
      };
    }

    return { ...panelBox(W, H, 0.8), close: closeFor(panelBox(W, H, 0.8)), buttons: [], choices: [], cards: [], nodes: [], squares: [], rack: [], clues: [] };
  }

  function hitRect(cx, cy, r) {
    return r && cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h;
  }

  function fillPx(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function sortedPlacements(list) {
    return (list || []).slice().sort((a, b) => {
      if (a.num !== b.num) return a.num - b.num;
      if (a.horiz === b.horiz) return 0;
      return a.horiz ? -1 : 1;
    });
  }

  function drawMiniChessBoardIcon(ctx, x, y, w, h, now) {
    const pad = 8;
    const bw = w - pad * 2;
    const bh = h * 0.42;
    const bx = x + pad;
    const by = y + h * 0.42;
    const n = 4;
    const cell = Math.min(bw, bh) / n;
    const ox = bx + (bw - cell * n) * 0.5;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        ctx.fillStyle = (r + c) % 2 ? 'rgba(180,140,110,0.9)' : 'rgba(245,228,200,0.95)';
        ctx.fillRect(ox + c * cell, by + r * cell, cell, cell);
      }
    }
    ctx.strokeStyle = 'rgba(140,100,80,0.4)';
    ctx.strokeRect(ox, by, cell * n, cell * n);
    // falling pieces
    const kinds = ['K', 'Q', 'R', 'N'];
    kinds.forEach((k, i) => {
      const t = (now * 0.0011 + i * 1.7) % 1;
      const px = x + pad + 6 + i * ((w - pad * 2 - 20) / 3);
      const py = y + 10 + t * (by - y - 28);
      const alpha = 0.35 + (1 - t) * 0.55;
      ctx.globalAlpha = alpha;
      drawQuietChessPiece(ctx, k, px, py, 22, 22);
      ctx.globalAlpha = 1;
    });
  }

  function drawMiniScrabbleIcon(ctx, x, y, w, h, now, drawText) {
    const pad = 8;
    const bw = w - pad * 2;
    const bh = h * 0.4;
    const bx = x + pad;
    const by = y + h * 0.44;
    const n = 5;
    const cell = Math.min(bw, bh) / n;
    const ox = bx + (bw - cell * n) * 0.5;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        ctx.fillStyle = (r + c) % 2 ? 'rgba(245,232,218,0.95)' : 'rgba(252,244,232,0.96)';
        ctx.fillRect(ox + c * cell, by + r * cell, cell - 0.5, cell - 0.5);
        ctx.strokeStyle = 'rgba(170,140,110,0.35)';
        ctx.strokeRect(ox + c * cell, by + r * cell, cell - 0.5, cell - 0.5);
      }
    }
    // a few placed letters on board
    const placed = [{ r: 2, c: 1, ch: 'S' }, { r: 2, c: 2, ch: 'H' }, { r: 2, c: 3, ch: 'E' }];
    placed.forEach((p) => {
      drawText(p.ch, ox + (p.c + 0.5) * cell, by + (p.r + 0.62) * cell, {
        font: `bold ${Math.max(9, cell * 0.45)}px Georgia, serif`,
        fill: 'rgba(70,45,40,0.9)',
        align: 'center',
      });
    });
    // falling letters — 5 columns, no wrap overlap
    const letters = ['A', 'B', 'L', 'E', 'T'];
    const span = Math.max(1, letters.length - 1);
    letters.forEach((ch, i) => {
      const t = (now * 0.0009 + i * 0.17) % 1;
      const px = x + pad + 4 + i * ((w - pad * 2 - 22) / span);
      const py = y + 8 + t * (by - y - 26);
      const tw = 18;
      ctx.globalAlpha = 0.4 + (1 - t) * 0.5;
      ctx.fillStyle = 'rgba(255,248,230,0.95)';
      ctx.strokeStyle = 'rgba(140,110,70,0.5)';
      ctx.fillRect(px, py, tw, tw);
      ctx.strokeRect(px, py, tw, tw);
      ctx.globalAlpha = 1;
      drawText(ch, px + tw * 0.5, py + tw * 0.62, {
        font: 'bold 11px Georgia, serif', fill: 'rgba(70,45,40,0.9)', align: 'center',
      });
    });
  }

  function drawMateCelebration(ctx, layout, chess, now, drawText) {
    const fx = chess.mateFx;
    if (!fx) return;
    const age = Math.max(0, now - (fx.t0 || now));
    const pulse = 0.5 + 0.5 * Math.sin(age * 0.006);
    // banner above board
    const bx = layout.board.x + layout.board.w * 0.5;
    const by = layout.board.y - 8;
    ctx.fillStyle = `rgba(255, 236, 230, ${0.88 + pulse * 0.1})`;
    ctx.strokeStyle = 'rgba(180, 100, 120, 0.55)';
    const bw = Math.min(220, layout.board.w * 0.7);
    ctx.fillRect(bx - bw * 0.5, by - 28, bw, 26);
    ctx.strokeRect(bx - bw * 0.5, by - 28, bw, 26);
    drawText(zh() ? '✦ 将死 Checkmate' : '✦ Checkmate', bx, by - 10, {
      font: 'italic 13px Georgia, serif', fill: 'rgba(160,70,100,0.95)', align: 'center',
    });
    // lock rings around black king
    const kingSq = fx.kingSq && layout.squares.find((s) => s.sq === fx.kingSq);
    if (kingSq) {
      const cx = kingSq.x + kingSq.w * 0.5;
      const cy = kingSq.y + kingSq.h * 0.5;
      const rad = kingSq.w * (0.42 + pulse * 0.08);
      ctx.strokeStyle = `rgba(192, 64, 96, ${0.45 + pulse * 0.35})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 1.22, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 110, 199, ${0.25 + pulse * 0.25})`;
      ctx.stroke();
      // soft lock bars
      ctx.strokeStyle = `rgba(90, 50, 70, ${0.35 + pulse * 0.25})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - rad * 0.7, cy - rad * 0.15);
      ctx.lineTo(cx + rad * 0.7, cy - rad * 0.15);
      ctx.moveTo(cx - rad * 0.7, cy + rad * 0.2);
      ctx.lineTo(cx + rad * 0.7, cy + rad * 0.2);
      ctx.stroke();
      // heart motes
      for (let i = 0; i < 6; i++) {
        const ang = age * 0.002 + i * (Math.PI * 2 / 6);
        const rr = rad * (1.35 + 0.15 * Math.sin(age * 0.005 + i));
        const hx = cx + Math.cos(ang) * rr;
        const hy = cy + Math.sin(ang) * rr * 0.7;
        ctx.fillStyle = `rgba(255, 110, 199, ${0.35 + pulse * 0.35})`;
        ctx.beginPath();
        ctx.arc(hx, hy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // highlight last move destination
    if (fx.lastMove?.to) {
      const toSq = layout.squares.find((s) => s.sq === fx.lastMove.to);
      if (toSq) {
        ctx.strokeStyle = `rgba(100, 160, 110, ${0.5 + pulse * 0.4})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(toSq.x + 2, toSq.y + 2, toSq.w - 4, toSq.h - 4);
      }
    }
  }

  /** Soft pixel room-style pieces (Yifan palette) + letter badge. */
  function drawQuietChessPiece(ctx, piece, x, y, w, h) {
    const white = piece === piece.toUpperCase();
    const kind = piece.toUpperCase();
    const skin = white ? '#ffcb9a' : '#c89078';
    const hair = white ? '#3d2817' : '#2a1520';
    const cloth = white ? '#f2e6d8' : '#3a3048';
    const accent = white ? '#ff6ec7' : '#9ecfff';
    const ink = white ? 'rgba(40,30,25,0.9)' : 'rgba(20,16,28,0.92)';
    const wood = white ? '#c89060' : '#4a3020';
    const leaf = white ? '#6a9870' : '#2a4838';
    const fur = white ? '#c4a574' : '#6a5040';
    const cx = x + w * 0.5;
    const cy = y + h * 0.52;
    const u = Math.min(w, h) / 8;

    // soft base plate like room props
    fillPx(ctx, cx - u * 2.4, cy + u * 2.2, u * 4.8, u * 0.7, white ? 'rgba(255,248,240,0.55)' : 'rgba(40,30,50,0.45)');

    if (kind === 'K' || kind === 'Q') {
      fillPx(ctx, cx - u * 1.6, cy - u * 1.1, u * 3.2, u * 3.2, skin);
      fillPx(ctx, cx - u * 1.7, cy - u * 2.15, u * 3.4, u * 1.45, hair);
      if (kind === 'Q') {
        fillPx(ctx, cx - u * 1.9, cy - u * 2.55, u * 3.8, u * 0.55, accent);
        fillPx(ctx, cx - u * 0.35, cy - u * 3.05, u * 0.7, u * 0.7, '#ffe566');
        fillPx(ctx, cx - u * 1.5, cy - u * 2.85, u * 0.45, u * 0.45, '#ffe566');
        fillPx(ctx, cx + u * 1.05, cy - u * 2.85, u * 0.45, u * 0.45, '#ffe566');
      } else {
        fillPx(ctx, cx - u * 0.25, cy - u * 2.85, u * 0.5, u * 0.75, '#ffe566');
        fillPx(ctx, cx - u * 0.95, cy - u * 2.55, u * 1.9, u * 0.35, '#ffe566');
      }
      fillPx(ctx, cx - u * 0.9, cy - u * 0.1, u * 0.45, u * 0.45, ink);
      fillPx(ctx, cx + u * 0.4, cy - u * 0.1, u * 0.45, u * 0.45, ink);
      fillPx(ctx, cx - u * 1.5, cy + u * 1.55, u * 3.0, u * 1.5, cloth);
    } else if (kind === 'N') {
      fillPx(ctx, cx - u * 1.9, cy - u * 0.5, u * 3.8, u * 2.8, fur);
      fillPx(ctx, cx - u * 2.2, cy - u * 2.0, u * 1.35, u * 1.55, fur);
      fillPx(ctx, cx + u * 0.85, cy - u * 2.0, u * 1.35, u * 1.55, fur);
      fillPx(ctx, cx - u * 1.9, cy - u * 1.55, u * 0.7, u * 0.7, white ? '#f5f0e8' : '#4a3830');
      fillPx(ctx, cx + u * 1.2, cy - u * 1.55, u * 0.7, u * 0.7, white ? '#f5f0e8' : '#4a3830');
      fillPx(ctx, cx - u * 0.7, cy + u * 0.15, u * 0.4, u * 0.4, ink);
      fillPx(ctx, cx + u * 0.35, cy + u * 0.15, u * 0.4, u * 0.4, ink);
      fillPx(ctx, cx - u * 0.4, cy + u * 1.05, u * 0.9, u * 0.4, skin);
    } else if (kind === 'R') {
      fillPx(ctx, cx - u * 1.9, cy - u * 2.1, u * 3.8, u * 4.5, wood);
      fillPx(ctx, cx - u * 1.55, cy - u * 1.5, u * 3.1, u * 0.45, '#ffe8d0');
      fillPx(ctx, cx - u * 1.55, cy - u * 0.35, u * 3.1, u * 0.45, accent);
      fillPx(ctx, cx - u * 1.55, cy + u * 0.8, u * 3.1, u * 0.45, '#ffe8d0');
      fillPx(ctx, cx - u * 2.1, cy - u * 2.35, u * 4.2, u * 0.55, wood);
    } else if (kind === 'B') {
      fillPx(ctx, cx - u * 0.35, cy + u * 0.5, u * 0.7, u * 2.1, '#8a7060');
      fillPx(ctx, cx - u * 1.7, cy - u * 1.9, u * 3.4, u * 2.5, leaf);
      fillPx(ctx, cx - u * 1.0, cy - u * 2.55, u * 2.0, u * 1.2, leaf);
      fillPx(ctx, cx - u * 0.25, cy - u * 0.5, u * 0.55, u * 1.15, '#ffe566');
    } else {
      // pawn — soft heart keepsake
      fillPx(ctx, cx - u * 1.15, cy - u * 0.15, u * 2.3, u * 2.0, accent);
      fillPx(ctx, cx - u * 1.35, cy - u * 1.05, u * 1.25, u * 1.2, accent);
      fillPx(ctx, cx + u * 0.1, cy - u * 1.05, u * 1.25, u * 1.2, accent);
      fillPx(ctx, cx - u * 0.95, cy + u * 1.55, u * 1.9, u * 1.25, cloth);
    }

    const bx = x + w - u * 2.9;
    const by = y + u * 0.25;
    fillPx(ctx, bx, by, u * 2.5, u * 2.0, white ? 'rgba(255,248,240,0.95)' : 'rgba(36,28,48,0.95)');
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, u * 2.5, u * 2.0);
    ctx.fillStyle = accent;
    ctx.font = 'bold ' + Math.max(9, u * 1.45) + 'px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(kind, bx + u * 1.25, by + u * 1.05);
  }

  function drawPanelChrome(ctx, layout, title, sub, drawText) {
    ctx.save();
    const panel = ctx.createLinearGradient(layout.x, layout.y, layout.x, layout.y + layout.h);
    panel.addColorStop(0, 'rgba(255, 248, 240, 0.97)');
    panel.addColorStop(1, 'rgba(245, 228, 215, 0.96)');
    ctx.fillStyle = panel;
    ctx.strokeStyle = 'rgba(170, 125, 100, 0.45)';
    ctx.lineWidth = 1.3;
    ctx.shadowColor = 'rgba(30, 10, 28, 0.32)';
    ctx.shadowBlur = 22;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(layout.x, layout.y, layout.w, layout.h, 12);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();
    } else {
      ctx.fillRect(layout.x, layout.y, layout.w, layout.h);
      ctx.shadowBlur = 0;
      ctx.strokeRect(layout.x, layout.y, layout.w, layout.h);
    }
    ctx.shadowBlur = 0;
    // Title area — leave left clear; no action buttons here
    drawText(title, layout.x + 18, layout.y + 28, { font: 'italic 15px Georgia, serif', fill: 'rgba(70,45,40,0.92)', align: 'left' });
    if (sub) {
      drawText(sub, layout.x + 18, layout.y + 46, { font: '11px Georgia, serif', fill: 'rgba(110,80,70,0.7)', align: 'left' });
    }
    ctx.fillStyle = 'rgba(230, 210, 190, 0.85)';
    ctx.strokeStyle = 'rgba(150, 120, 90, 0.4)';
    ctx.fillRect(layout.close.x, layout.close.y, layout.close.w, layout.close.h);
    ctx.strokeRect(layout.close.x, layout.close.y, layout.close.w, layout.close.h);
    drawText(zh() ? '关闭' : 'Close', layout.close.x + layout.close.w * 0.5, layout.close.y + 15, {
      font: '10px Georgia, serif', fill: 'rgba(70,50,40,0.88)', align: 'center',
    });

    // Footer strip so buttons never cover content
    if ((layout.buttons || []).length) {
      ctx.fillStyle = 'rgba(240, 228, 214, 0.92)';
      ctx.fillRect(layout.x + 1, layout.y + layout.h - 44, layout.w - 2, 43);
      ctx.strokeStyle = 'rgba(170, 125, 100, 0.25)';
      ctx.beginPath();
      ctx.moveTo(layout.x + 8, layout.y + layout.h - 44);
      ctx.lineTo(layout.x + layout.w - 8, layout.y + layout.h - 44);
      ctx.stroke();
    }
    (layout.buttons || []).forEach((b) => {
      const isBack = String(b.id).indexOf('back') >= 0 || String(b.label).indexOf('←') >= 0;
      ctx.fillStyle = isBack ? 'rgba(255, 236, 220, 0.98)' : 'rgba(235, 220, 205, 0.92)';
      ctx.strokeStyle = isBack ? 'rgba(180, 110, 100, 0.55)' : 'rgba(150, 120, 90, 0.4)';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      drawText(b.label, b.x + b.w * 0.5, b.y + b.h * 0.65, {
        font: '10px Georgia, serif', fill: 'rgba(70,50,40,0.88)', align: 'center',
      });
    });
    ctx.restore();
  }

  function drawHelpLines(ctx, layout, lines, drawText) {
    lines.forEach((line, i) => {
      drawText(line, layout.x + 24, layout.y + 78 + i * 26, {
        font: '13px Georgia, serif', fill: 'rgba(70,45,40,0.88)', align: 'left',
      });
    });
  }

  function draw(g, ctx, W, H, now, helpers) {
    if (!g || !g.open) return;
    const drawText = helpers.drawText;
    const hoverIndex = helpers.hoverIndex;
    const hoverType = helpers.hoverType || null;
    const isHover = (type, index) => hoverType === type && hoverIndex === index;
    const layout = getLayout(g, W, H);
    ctx.save();
    ctx.fillStyle = 'rgba(20, 8, 24, 0.28)';
    ctx.fillRect(0, 0, W, H);

    if (g.mode === 'picker') {
      drawPanelChrome(ctx, layout, zh() ? '安静游戏' : 'Quiet Games', zh() ? '选一个，不着急。' : 'Choose a game. No rush.', drawText);
      (layout.choices || []).forEach((choice, i) => {
        const hover = isHover('choice', i);
        ctx.fillStyle = hover ? 'rgba(255, 236, 230, 0.98)' : 'rgba(255, 248, 242, 0.95)';
        ctx.strokeStyle = hover ? 'rgba(180, 110, 130, 0.55)' : 'rgba(160, 120, 100, 0.4)';
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(choice.x, choice.y, choice.w, choice.h, 10);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(choice.x, choice.y, choice.w, choice.h);
          ctx.strokeRect(choice.x, choice.y, choice.w, choice.h);
        }
        if (choice.id === 'chess') drawMiniChessBoardIcon(ctx, choice.x, choice.y, choice.w, choice.h * 0.72, now);
        else drawMiniScrabbleIcon(ctx, choice.x, choice.y, choice.w, choice.h * 0.72, now, drawText);
        drawText(choice.label, choice.x + choice.w * 0.5, choice.y + choice.h * 0.78, {
          font: 'italic 13px Georgia, serif', fill: 'rgba(70,45,40,0.9)', align: 'center',
        });
        drawText(choice.hint, choice.x + choice.w * 0.5, choice.y + choice.h * 0.92, {
          font: '10px Georgia, serif', fill: 'rgba(110,80,70,0.65)', align: 'center',
        });
      });
      ctx.restore();
      return;
    }

    if (g.mode === 'chess_why') {
      drawPanelChrome(ctx, layout, zh() ? '为何将死？' : 'Why checkmate?',
        L(g.chess?.level?.title) || '', drawText);
      drawHelpLines(ctx, layout, mateExplainLines(g.chess), drawText);
      ctx.restore();
      return;
    }

    if (g.mode === 'chess_help') {
      drawPanelChrome(ctx, layout, zh() ? '象棋残局 · 说明' : 'Chess Endgames · How to',
        zh() ? '你走白方 · 只有一条正解' : 'You play White · one correct line', drawText);
      const lines = zh() ? [
        '1. 地图点亮的关可进；通关后下一关自动解锁。',
        '2. 标题下「目标」写明一步/两步将死。',
        '3. 棋子：K 王 · Q 后 · R 车 · B 象 · N 马 · P 兵（房间画风 + 角标）。',
        '4. 点选棋子后显示走法线：车十字、象 X、马 L 落点等。',
        '5. 引导线是棋规走法；需要时点「提示」分步标出棋子/落点。',
        '6. 走错会轻闪红；通关后可点「下一关」或回地图。',
      ] : [
        '1. Lit map nodes are playable; clearing unlocks the next node.',
        '2. The Goal under the title shows mate in 1 / 2.',
        '3. Pieces: K Q R B N P — room-style sprites with letter badges.',
        '4. Select a piece to see move guides: rook +, bishop X, knight L…',
        '5. Guides are legal moves; use Hint for piece, then landing square.',
        '6. Wrong moves flash; after clear, use Next or return to Map.',
      ];
      drawHelpLines(ctx, layout, lines, drawText);
      // legend swatches
      const kinds = ['K', 'Q', 'R', 'B', 'N', 'P'];
      kinds.forEach((k, i) => {
        const x = layout.x + 28 + i * 70;
        const y = layout.y + layout.h - 120;
        drawQuietChessPiece(ctx, k, x, y, 48, 48);
      });
      ctx.restore();
      return;
    }

    if (g.mode === 'scrabble_help') {
      drawPanelChrome(ctx, layout, zh() ? '交叉填字 · 说明' : 'Crossword Fill · How to',
        zh() ? '完整交叉词 · 用尽字母' : 'Full crossed words · use every letter', drawText);
      const lines = zh() ? [
        '1. 选题库主题后开始：盘面已是完整交叉词，部分字母给出。',
        '2. 先点下方字母，再点空格填入（不是自由造词）。',
        '3. 点已填的自填格可收回字母；给出的灰格不可改。',
        '4. 「词表」查看本局词汇：英文释义/中文翻译 + 例句。',
        '5. 右侧线索可点，跳到词表对应词。',
        '6. 字母用尽且全部正确即通关。',
      ] : [
        '1. Pick themes, then play a ready-made crossword (some letters shown).',
        '2. Tap a rack letter, then an empty cell to place it.',
        '3. Tap your own filled cell to take a letter back; grey givens stay.',
        '4. Wordbook shows EN definition or ZH translation + examples.',
        '5. Tap a side clue to jump to that word in the Wordbook.',
        '6. Finish when every letter is used and the grid is correct.',
      ];
      drawHelpLines(ctx, layout, lines, drawText);
      ctx.restore();
      return;
    }

    if (g.mode === 'chess_map') {
      const clearedN = (loadChessProgress().cleared || []).length;
      drawPanelChrome(ctx, layout, zh() ? '残局地图' : 'Endgame Map',
        (zh() ? '已通过 ' : 'Cleared ') + clearedN + '/' + CHESS_LEVELS.length + (zh() ? ' · 通关解锁下一关' : ' · clear to unlock next'), drawText);
      ctx.strokeStyle = 'rgba(160, 120, 100, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      layout.nodes.forEach((n, i) => {
        const cx = n.x + n.w * 0.5;
        const cy = n.y + n.h * 0.5;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
      layout.nodes.forEach((n, i) => {
        const hover = isHover('node', i);
        ctx.fillStyle = !n.unlocked ? 'rgba(180,175,170,0.7)' : n.cleared ? 'rgba(220, 190, 140, 0.95)' : 'rgba(255,245,235,0.96)';
        ctx.strokeStyle = hover ? 'rgba(180,100,120,0.7)' : 'rgba(140,100,80,0.45)';
        ctx.lineWidth = hover ? 2 : 1.2;
        ctx.beginPath();
        ctx.arc(n.x + n.w * 0.5, n.y + n.h * 0.5, n.w * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawText(n.cleared ? '●' : String(i + 1), n.x + n.w * 0.5, n.y + n.h * 0.55, {
          font: '12px Georgia, serif',
          fill: n.unlocked ? 'rgba(70,45,40,0.9)' : 'rgba(120,120,120,0.7)',
          align: 'center',
        });
      });
      ctx.restore();
      return;
    }

    if (g.mode === 'chess_play') {
      const chess = g.chess;
      const lv = chess.level;
      const wrong = now < (chess.flashWrongUntil || 0);
      const guides = (!g.complete && chess.selected)
        ? chessLegalTargets(chess.board, chess.selected)
        : [];
      const expected = (!g.complete) ? chessExpectedPlayerMove(chess) : null;
      const hintStage = chess.hintStage || 0;
      const goalLine = (zh() ? '目标：' : 'Goal: ') + (chess.goalText || L(lv.goal))
        + (chess.replay && !g.complete ? (zh() ? ' · 重刷' : ' · replay') : '');
      drawPanelChrome(ctx, layout, L(lv.title), goalLine, drawText);
      layout.squares.forEach((sq) => {
        const light = (sq.r + sq.c) % 2 === 0;
        ctx.fillStyle = wrong && chess.selected === sq.sq
          ? 'rgba(220,120,120,0.55)'
          : light ? 'rgba(240, 220, 195, 0.95)' : 'rgba(180, 140, 110, 0.9)';
        if (chess.selected === sq.sq) ctx.fillStyle = 'rgba(220, 180, 120, 0.95)';
        if (guides.includes(sq.sq)) ctx.fillStyle = light ? 'rgba(190, 220, 175, 0.92)' : 'rgba(150, 185, 140, 0.9)';
        // Hint stage 1+: soft pulse on the piece to move
        if (hintStage >= 1 && expected && sq.sq === expected.from) {
          ctx.fillStyle = 'rgba(255, 210, 170, 0.95)';
        }
        // Hint stage 2: soft highlight on the mating square (not a solution arrow)
        if (hintStage >= 2 && expected && sq.sq === expected.to) {
          ctx.fillStyle = 'rgba(255, 200, 210, 0.92)';
        }
        ctx.fillRect(sq.x, sq.y, sq.w, sq.h);
      });
      // Movement rays: rook +, bishop X, queen both; knight/king/pawn as dots on targets
      if (guides.length && chess.selected) {
        const fromSq = layout.squares.find((s) => s.sq === chess.selected);
        const piece = chess.board[chess.selected];
        const kind = piece ? piece.toUpperCase() : '';
        if (fromSq && (kind === 'R' || kind === 'B' || kind === 'Q' || kind === 'K')) {
          const x0 = fromSq.x + fromSq.w * 0.5;
          const y0 = fromSq.y + fromSq.h * 0.5;
          ctx.strokeStyle = 'rgba(90, 140, 100, 0.55)';
          ctx.lineWidth = 1.8;
          ctx.setLineDash([5, 4]);
          guides.forEach((to) => {
            const toSq = layout.squares.find((s) => s.sq === to);
            if (!toSq) return;
            // For sliding pieces, only draw along same row/col/diag
            const fr = fromSq.r;
            const fc = fromSq.c;
            const tr = toSq.r;
            const tc = toSq.c;
            const ortho = fr === tr || fc === tc;
            const diag = Math.abs(fr - tr) === Math.abs(fc - tc);
            if (kind === 'R' && !ortho) return;
            if (kind === 'B' && !diag) return;
            if (kind === 'K' && (Math.abs(fr - tr) > 1 || Math.abs(fc - tc) > 1)) return;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(toSq.x + toSq.w * 0.5, toSq.y + toSq.h * 0.5);
            ctx.stroke();
          });
          ctx.setLineDash([]);
        }
        guides.forEach((to) => {
          const toSq = layout.squares.find((s) => s.sq === to);
          if (!toSq) return;
          ctx.beginPath();
          ctx.arc(toSq.x + toSq.w * 0.5, toSq.y + toSq.h * 0.5, Math.min(toSq.w, toSq.h) * 0.14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(70, 130, 90, 0.75)';
          ctx.fill();
        });
      }
      layout.squares.forEach((sq) => {
        const piece = chess.board[sq.sq];
        if (piece) drawQuietChessPiece(ctx, piece, sq.x, sq.y, sq.w, sq.h);
      });
      // Hint rings
      if (!g.complete && expected && hintStage >= 1) {
        const fromSq = layout.squares.find((s) => s.sq === expected.from);
        if (fromSq) {
          ctx.strokeStyle = 'rgba(200, 120, 80, 0.85)';
          ctx.lineWidth = 2;
          ctx.strokeRect(fromSq.x + 2, fromSq.y + 2, fromSq.w - 4, fromSq.h - 4);
        }
      }
      if (!g.complete && expected && hintStage >= 2) {
        const toSq = layout.squares.find((s) => s.sq === expected.to);
        if (toSq) {
          const pulse = 0.5 + 0.5 * Math.sin(now * 0.008);
          ctx.strokeStyle = `rgba(200, 80, 110, ${0.55 + pulse * 0.35})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(toSq.x + toSq.w * 0.5, toSq.y + toSq.h * 0.5, toSq.w * 0.36, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.strokeStyle = 'rgba(120,90,70,0.45)';
      ctx.strokeRect(layout.board.x, layout.board.y, layout.board.w, layout.board.h);
      if (g.complete) {
        if (!chess.mateFx) {
          chess.mateFx = {
            t0: now,
            kingSq: findKingSq(chess.board, false),
            lastMove: null,
          };
        }
        drawMateCelebration(ctx, layout, chess, now, drawText);
        drawText(chess.status || (zh() ? '将死！' : 'Checkmate!'), layout.x + layout.w * 0.5, layout.board.y + layout.board.h + 18, {
          font: 'bold 13px Georgia, serif', fill: 'rgba(160,70,100,0.92)', align: 'center',
        });
      } else {
        drawText(chess.status || '', layout.x + layout.w * 0.5, layout.board.y + layout.board.h + 18, {
          font: '12px Georgia, serif', fill: 'rgba(110,80,70,0.85)', align: 'center',
        });
      }
      ctx.restore();
      return;
    }

    if (g.mode === 'scrabble_themes') {
      drawPanelChrome(ctx, layout, zh() ? '选择词库主题' : 'Choose word themes',
        (g.scrabble && g.scrabble.status) || (zh() ? '交叉填字词袋 · 可多选' : 'Crossword packs · multi-select'), drawText);
      const selected = new Set(g.scrabble.selected || []);
      (layout.choices || []).forEach((choice, i) => {
        const on = selected.has(choice.id);
        const hover = isHover('choice', i);
        ctx.fillStyle = on ? 'rgba(255, 230, 220, 0.98)' : 'rgba(255, 248, 242, 0.95)';
        ctx.strokeStyle = on || hover ? 'rgba(180, 110, 130, 0.55)' : 'rgba(160, 120, 100, 0.35)';
        ctx.fillRect(choice.x, choice.y, choice.w, choice.h);
        ctx.strokeRect(choice.x, choice.y, choice.w, choice.h);
        drawText((on ? '✓ ' : '') + choice.label, choice.x + 12, choice.y + 20, {
          font: 'italic 13px Georgia, serif', fill: 'rgba(70,45,40,0.9)', align: 'left',
        });
        drawText(choice.hint, choice.x + 12, choice.y + 38, {
          font: '10px Georgia, serif', fill: 'rgba(110,80,70,0.65)', align: 'left',
        });
      });
      ctx.restore();
      return;
    }

    if (g.mode === 'scrabble') {
      const s = g.scrabble;
      drawPanelChrome(ctx, layout,
        zh() ? '丝绒交叉填字' : 'Velvet Crossword',
        s.status || '', drawText);
      const hoverClue = (hoverType === 'clue' && layout.clues[hoverIndex]) ? layout.clues[hoverIndex] : null;
      // board
      layout.squares.forEach((sq) => {
        const cell = s.fill[sq.r][sq.c];
        const sel = s.selectedCell && s.selectedCell.r === sq.r && s.selectedCell.c === sq.c;
        const pulse = now < (s.hintPulseUntil || 0) && !cell;
        let onClueWord = false;
        if (hoverClue) {
          if (hoverClue.horiz) {
            onClueWord = sq.r === hoverClue.r && sq.c >= hoverClue.c && sq.c < hoverClue.c + hoverClue.len;
          } else {
            onClueWord = sq.c === hoverClue.c && sq.r >= hoverClue.r && sq.r < hoverClue.r + hoverClue.len;
          }
        }
        ctx.fillStyle = cell && cell.given
          ? 'rgba(230, 220, 210, 0.96)'
          : pulse ? 'rgba(255, 245, 210, 0.98)' : 'rgba(255, 250, 240, 0.96)';
        if (onClueWord) ctx.fillStyle = 'rgba(255, 236, 220, 0.98)';
        if (sel) ctx.fillStyle = 'rgba(255, 230, 190, 0.98)';
        ctx.strokeStyle = 'rgba(140, 110, 90, 0.45)';
        ctx.fillRect(sq.x, sq.y, sq.w, sq.h);
        ctx.strokeRect(sq.x, sq.y, sq.w, sq.h);
        const start = (s.placements || []).find((p) => p.r === sq.r && p.c === sq.c);
        if (start) {
          drawText(String(start.num), sq.x + 3, sq.y + 9, {
            font: 'bold 9px Georgia, serif', fill: clueColor(start.num), align: 'left',
          });
        }
        if (cell && cell.letter) {
          const wrong = !cell.given && cell.letter !== s.solution[sq.r][sq.c] && rackLettersLeft(s) === 0;
          drawText(cell.letter, sq.x + sq.w * 0.5, sq.y + sq.h * 0.58, {
            font: `bold ${Math.max(11, sq.h * 0.45)}px Georgia, serif`,
            fill: wrong ? 'rgba(160,60,60,0.9)' : (cell.given ? 'rgba(90,70,60,0.85)' : 'rgba(60,40,35,0.92)'),
            align: 'center',
          });
        }
      });
      // clues panel — board numbers + color bars (no 1a/2b)
      drawText(zh() ? '线索（编号对齐棋盘）' : 'Clues (numbers match board)', layout.clues[0] ? layout.clues[0].x : layout.x, layout.board.y - 4, {
        font: '10px Georgia, serif', fill: 'rgba(110,80,70,0.7)', align: 'left',
      });
      (layout.clues || []).forEach((cl) => {
        const hover = isHover('clue', cl.index);
        ctx.fillStyle = hover ? 'rgba(255, 236, 230, 0.95)' : 'rgba(255,248,242,0.9)';
        ctx.strokeStyle = 'rgba(160,120,100,0.3)';
        ctx.fillRect(cl.x, cl.y, cl.w, cl.h);
        ctx.strokeRect(cl.x, cl.y, cl.w, cl.h);
        // color bar: horizontal stripe = across, vertical bar = down
        ctx.fillStyle = cl.color;
        if (cl.horiz) ctx.fillRect(cl.x + 2, cl.y + 2, 4, cl.h - 4);
        else {
          ctx.fillRect(cl.x + 2, cl.y + 2, cl.w - 4, 3);
          ctx.fillRect(cl.x + 2, cl.y + 2, 3, cl.h - 4);
        }
        const hint = zh() ? cl.entry.zh : (cl.entry.def || wordDef(cl.entry));
        drawText(String(cl.num), cl.x + 12, cl.y + 18, {
          font: 'bold 12px Georgia, serif', fill: cl.color, align: 'left',
        });
        // Clip clue copy to the clue column so long defs don't spill past the panel.
        ctx.save();
        ctx.beginPath();
        ctx.rect(cl.x + 26, cl.y + 2, Math.max(8, cl.w - 30), cl.h - 4);
        ctx.clip();
        drawText(hint, cl.x + 28, cl.y + 18, {
          font: '10px Georgia, serif', fill: 'rgba(70,45,40,0.88)', align: 'left',
        });
        ctx.restore();
      });
      // rack hint + page meta
      const rackBaseY = (layout.rack[0] && layout.rack[0].y) || (layout.y + layout.h - 90);
      const reserveN = (layout.rackMeta && layout.rackMeta.reserveN) || 0;
      if (s.selectedRack < 0 && now < (s.hintPulseUntil || 0)) {
        drawText(zh() ? '↓ 先点这里的字母（每次一页）' : '↓ Tap a letter here (one page at a time)', layout.x + 16, rackBaseY - 6, {
          font: '10px Georgia, serif', fill: 'rgba(160,90,110,0.85)', align: 'left',
        });
      } else if (s.selectedRack >= 0) {
        drawText(zh() ? '↓ 已选字母 · 再点空格' : '↓ Letter selected · tap an empty cell', layout.x + 16, rackBaseY - 6, {
          font: '10px Georgia, serif', fill: 'rgba(80,120,80,0.9)', align: 'left',
        });
      } else if (reserveN > 0) {
        drawText(zh() ? ('本页用完后自动换下一批 · 后备 ' + reserveN) : ('Next page unlocks when this row is empty · +' + reserveN), layout.x + 16, rackBaseY - 6, {
          font: '9px Georgia, serif', fill: 'rgba(120,90,80,0.7)', align: 'left',
        });
      }
      layout.rack.forEach((tile, i) => {
        const hover = isHover('rack', i);
        const sel = s.selectedRack === i;
        ctx.fillStyle = sel || hover ? 'rgba(255, 230, 180, 0.98)' : 'rgba(255, 248, 230, 0.96)';
        ctx.strokeStyle = sel ? 'rgba(180,100,80,0.7)' : 'rgba(140, 110, 70, 0.5)';
        ctx.lineWidth = sel ? 2 : 1;
        ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
        ctx.strokeRect(tile.x, tile.y, tile.w, tile.h);
        drawText(tile.letter, tile.x + tile.w * 0.5, tile.y + tile.h * 0.55, {
          font: `bold ${Math.max(12, tile.h * 0.45)}px Georgia, serif`,
          fill: 'rgba(60,40,30,0.92)', align: 'center',
        });
      });
      if (g.complete) {
        drawText(s.status, layout.x + layout.w * 0.5, layout.y + layout.h - 56, {
          font: '12px Georgia, serif', fill: 'rgba(160,90,110,0.9)', align: 'center',
        });
      }
      ctx.restore();
      return;
    }

    if (g.mode === 'scrabble_study') {
      const s = g.scrabble;
      const list = sortedPlacements(s.placements).map((p) => p.entry);
      const fallback = s.words || [];
      const book = list.length ? list : fallback;
      const idx = ((s.studyIndex % Math.max(1, book.length)) + Math.max(1, book.length)) % Math.max(1, book.length);
      const w = book[idx];
      drawPanelChrome(ctx, layout, zh() ? '词表 · 释义与例句' : 'Wordbook · sense & lines',
        (idx + 1) + ' / ' + book.length + (zh() ? ' · 与棋盘同一词库' : ' · same puzzle words'), drawText);
      if (w) {
        drawText(w.en, layout.x + layout.w * 0.5, layout.y + 90, {
          font: 'italic 26px Georgia, serif', fill: 'rgba(70,45,40,0.92)', align: 'center',
        });
        if (zh()) {
          drawText(w.zh, layout.x + layout.w * 0.5, layout.y + 122, {
            font: '14px Georgia, serif', fill: 'rgba(110,80,70,0.8)', align: 'center',
          });
          drawText(w.example?.en || '', layout.x + layout.w * 0.5, layout.y + 168, {
            font: '13px Georgia, serif', fill: 'rgba(70,50,45,0.88)', align: 'center',
          });
          drawText(w.example?.zh || '', layout.x + layout.w * 0.5, layout.y + 196, {
            font: '12px Georgia, serif', fill: 'rgba(120,90,80,0.8)', align: 'center',
          });
        } else {
          drawText(wordDef(w), layout.x + layout.w * 0.5, layout.y + 122, {
            font: '14px Georgia, serif', fill: 'rgba(110,80,70,0.85)', align: 'center',
          });
          const who = w.example?.who === 'james' ? 'James' : 'Yifan';
          drawText(who + ': "' + (w.example?.en || '') + '"', layout.x + layout.w * 0.5, layout.y + 168, {
            font: '13px Georgia, serif', fill: 'rgba(70,50,45,0.88)', align: 'center',
          });
        }
        drawText(zh() ? '提示：对照线索编号，把字母填回交叉格。' : 'Tip: match clue numbers, then fill the crossed cells.', layout.x + layout.w * 0.5, layout.y + 250, {
          font: '11px Georgia, serif', fill: 'rgba(140,100,90,0.75)', align: 'center',
        });
      }
      ctx.restore();
      return;
    }

    ctx.restore();
  }

  function hitTest(g, cx, cy, W, H) {
    if (!g || !g.open) return null;
    const layout = getLayout(g, W, H);
    if (!layout) return null;
    if (hitRect(cx, cy, layout.close)) return { type: 'close' };
    for (const b of layout.buttons || []) {
      if (hitRect(cx, cy, b)) return { type: 'button', id: b.id };
    }
    if (g.mode === 'picker' || g.mode === 'scrabble_themes') {
      for (const choice of layout.choices || []) {
        if (hitRect(cx, cy, choice)) return { type: 'choice', index: choice.index, id: choice.id };
      }
    }
    if (g.mode === 'chess_map') {
      for (const n of layout.nodes || []) {
        if (hitRect(cx, cy, n)) return { type: 'node', id: n.id, index: n.index, unlocked: n.unlocked };
      }
    }
    if (g.mode === 'chess_play') {
      for (const sq of layout.squares || []) {
        if (hitRect(cx, cy, sq)) return { type: 'square', sq: sq.sq, r: sq.r, c: sq.c };
      }
    }
    if (g.mode === 'scrabble') {
      for (const cl of layout.clues || []) {
        if (hitRect(cx, cy, cl)) return { type: 'clue', index: cl.index, num: cl.num };
      }
      for (const tile of layout.rack || []) {
        if (hitRect(cx, cy, tile)) return { type: 'rack', index: tile.index };
      }
      for (const sq of layout.squares || []) {
        if (hitRect(cx, cy, sq)) return { type: 'cell', r: sq.r, c: sq.c };
      }
    }
    if (cx >= layout.x && cx <= layout.x + layout.w && cy >= layout.y && cy <= layout.y + layout.h) {
      return { type: 'panel' };
    }
    return { type: 'backdrop' };
  }

  function openPicker(quietRef) {
    quietRef.open = true;
    quietRef.mode = 'picker';
    quietRef.choices = [
      { id: 'chess', label: zh() ? '残局闯关' : 'Chess Endgames', hint: zh() ? '地图 · 单解 · 引导线' : 'Map · one line · guides' },
      { id: 'scrabble', label: zh() ? '丝绒填字' : 'Velvet Crossword', hint: zh() ? '交叉词 · 词表提示' : 'Crossword · wordbook' },
    ];
    quietRef.complete = false;
    quietRef.completeAt = 0;
    quietRef.moves = 0;
    quietRef.t0 = performance.now();
    quietRef.chess = null;
    quietRef.scrabble = null;
  }

  function openMode(quietRef, mode) {
    if (mode === 'chess') seedChessMap(quietRef);
    else if (mode === 'scrabble') seedScrabbleThemes(quietRef);
    else openPicker(quietRef);
  }

  function handleClick(quietRef, cx, cy, now, W, H) {
    if (!quietRef || !quietRef.open) return false;
    const hit = hitTest(quietRef, cx, cy, W, H);
    if (!hit) return false;
    if (hit.type === 'close' || hit.type === 'backdrop') {
      quietRef.open = false;
      try { if (typeof SFX !== 'undefined') SFX.ui(); } catch (_) {}
      return 'close';
    }
    if (hit.type === 'panel') return true;

    if (hit.type === 'button') {
      if (hit.id === 'back_picker') { openPicker(quietRef); return true; }
      if (hit.id === 'back_map') { seedChessMap(quietRef); return true; }
      if (hit.id === 'chess_help') {
        const ret = quietRef.mode === 'chess_play' ? 'chess_play' : 'chess_map';
        quietRef.chess = quietRef.chess || {};
        quietRef.chess.helpReturn = ret;
        if (ret === 'chess_play') quietRef.chess._playSnapshot = {
          levelId: quietRef.chess.levelId,
          board: cloneBoard(quietRef.chess.board || {}),
          step: quietRef.chess.step,
          status: quietRef.chess.status,
          complete: quietRef.complete,
        };
        seedChessHelp(quietRef, ret);
        return true;
      }
      if (hit.id === 'chess_help_back') {
        const ret = quietRef.chess?.helpReturn || 'chess_map';
        if (ret === 'chess_play' && quietRef.chess?._playSnapshot?.levelId) {
          const snap = quietRef.chess._playSnapshot;
          seedChessLevel(quietRef, snap.levelId);
          quietRef.chess.board = snap.board;
          quietRef.chess.step = snap.step;
          quietRef.chess.status = snap.status;
          quietRef.complete = !!snap.complete;
        } else seedChessMap(quietRef);
        return true;
      }
      if (hit.id === 'scrabble_help') {
        quietRef.scrabble = quietRef.scrabble || {};
        quietRef.scrabble.helpReturn = quietRef.mode;
        if (quietRef.mode === 'scrabble' || quietRef.mode === 'scrabble_study') {
          quietRef.scrabble._freeze = true;
        }
        seedScrabbleHelp(quietRef, quietRef.scrabble.helpReturn);
        return true;
      }
      if (hit.id === 'scrabble_help_back') {
        const ret = quietRef.scrabble?.helpReturn || 'scrabble_themes';
        if (ret === 'scrabble' || ret === 'scrabble_study') quietRef.mode = ret;
        else seedScrabbleThemes(quietRef);
        return true;
      }
      if (hit.id === 'reset_level' && quietRef.chess?.levelId) {
        seedChessLevel(quietRef, quietRef.chess.levelId);
        return true;
      }
      if (hit.id === 'chess_hint' && quietRef.chess && !quietRef.complete) {
        const chess = quietRef.chess;
        const expected = chessExpectedPlayerMove(chess);
        if (!expected) {
          chess.status = zh() ? '本步没有更多提示。' : 'No more hints for this step.';
          return true;
        }
        chess.hintStage = Math.min(2, (chess.hintStage || 0) + 1);
        if (chess.hintStage === 1) {
          chess.selected = expected.from;
          chess.status = zh()
            ? '提示：先动这枚高亮棋子（走法线仍是棋规）。'
            : 'Hint: move this highlighted piece (guides are still legal moves).';
        } else {
          chess.selected = expected.from;
          chess.status = zh()
            ? '提示：粉圈是落点 · 走法线仍是棋规。'
            : 'Hint: pink ring is the square · guides stay legal moves.';
        }
        try { if (typeof SFX !== 'undefined') SFX.ui(); } catch (_) {}
        return true;
      }
      if (hit.id === 'next_level' && quietRef.chess?.levelId) {
        // Ensure progress persisted before opening next.
        const progress = loadChessProgress();
        if (quietRef.chess.levelId && !progress.cleared.includes(quietRef.chess.levelId)) {
          progress.cleared.push(quietRef.chess.levelId);
          saveChessProgress(progress);
        }
        const nid = nextChessLevelId(quietRef.chess.levelId);
        if (nid) seedChessLevel(quietRef, nid);
        else seedChessMap(quietRef);
        return true;
      }
      if (hit.id === 'why_mate') {
        quietRef.mode = 'chess_why';
        return true;
      }
      if (hit.id === 'chess_why_back') {
        quietRef.mode = 'chess_play';
        return true;
      }
      if (hit.id === 'start_scrabble') {
        const sel = quietRef.scrabble?.selected || [];
        if (!sel.length) {
          quietRef.scrabble.status = zh() ? '至少选一个主题。' : 'Pick at least one theme.';
          return true;
        }
        seedScrabblePlay(quietRef, sel);
        return true;
      }
      if (hit.id === 'back_themes') { seedScrabbleThemes(quietRef); return true; }
      if (hit.id === 'clear_staged') {
        const s = quietRef.scrabble;
        if (!s || !s.fill) return true;
        for (let r = 0; r < s.rows; r++) {
          for (let c = 0; c < s.cols; c++) {
            const cell = s.fill[r][c];
            if (cell && !cell.given && cell.letter) {
              s.rack.push(cell.letter);
              s.fill[r][c] = null;
            }
          }
        }
        normalizeRackPage(s);
        s.selectedRack = -1;
        s.selectedCell = null;
        s.status = zh() ? '已清空自填字母。' : 'Cleared your letters.';
        return true;
      }
      if (hit.id === 'study_toggle') {
        quietRef.mode = 'scrabble_study';
        quietRef.scrabble.studyIndex = quietRef.scrabble.studyIndex || 0;
        return true;
      }
      if (hit.id === 'study_back') {
        quietRef.mode = 'scrabble';
        return true;
      }
      if (hit.id === 'study_prev') {
        const s = quietRef.scrabble;
        const n = Math.max(1, (s.placements || s.words || []).length);
        s.studyIndex = (s.studyIndex - 1 + n) % n;
        return true;
      }
      if (hit.id === 'study_next') {
        const s = quietRef.scrabble;
        const n = Math.max(1, (s.placements || s.words || []).length);
        s.studyIndex = (s.studyIndex + 1) % n;
        return true;
      }
      return true;
    }

    if (quietRef.mode === 'picker' && hit.type === 'choice') {
      openMode(quietRef, hit.id);
      return true;
    }

    if (quietRef.mode === 'scrabble_themes' && hit.type === 'choice') {
      const sel = quietRef.scrabble.selected || [];
      const i = sel.indexOf(hit.id);
      if (i >= 0) sel.splice(i, 1);
      else sel.push(hit.id);
      quietRef.scrabble.selected = sel;
      return true;
    }

    if (quietRef.mode === 'chess_map' && hit.type === 'node') {
      if (!hit.unlocked) return true;
      seedChessLevel(quietRef, hit.id);
      return true;
    }

    if (quietRef.mode === 'chess_play' && hit.type === 'square') {
      if (quietRef.complete) return true;
      const chess = quietRef.chess;
      const piece = chess.board[hit.sq];
      if (chess.selected) {
        if (chess.selected === hit.sq) {
          chess.selected = null;
          chess.status = zh() ? '点己方棋子 · 看走法线' : 'Tap your piece · see move lines';
          return true;
        }
        if (piece && piece === piece.toUpperCase()) {
          chess.selected = hit.sq;
          chess.status = zh() ? '高亮格是棋规走法（不是通关答案）。' : 'Highlights are legal moves (not the answer).';
          return true;
        }
        const legal = chessLegalTargets(chess.board, chess.selected);
        if (!legal.includes(hit.sq)) return true;
        tryChessPlayerMove(quietRef, chess.selected, hit.sq, now);
        return true;
      }
      if (piece && piece === piece.toUpperCase()) {
        chess.selected = hit.sq;
        chess.status = zh() ? '高亮格是棋规走法（不是通关答案）。' : 'Highlights are legal moves (not the answer).';
      }
      return true;
    }

    if (quietRef.mode === 'scrabble') {
      const s = quietRef.scrabble;
      if (quietRef.complete) return true;
      if (hit.type === 'clue') {
        quietRef.mode = 'scrabble_study';
        s.studyIndex = hit.index || 0;
        return true;
      }
      if (hit.type === 'rack') {
        s.selectedRack = hit.index;
        s.selectedCell = null;
        s.status = zh() ? '已选字母 · 再点空格填入' : 'Letter selected · tap an empty cell';
        return true;
      }
      if (hit.type === 'cell') {
        const cur = s.fill[hit.r][hit.c];
        if (cur && cur.given) {
          s.status = zh() ? '这是给出的字母。' : 'That letter is given.';
          return true;
        }
        if (cur && cur.letter && s.selectedRack < 0) {
          clearFillCell(s, hit.r, hit.c);
          s.status = zh() ? '已收回字母。' : 'Letter returned to rack.';
          return true;
        }
        if (s.selectedRack < 0) {
          s.selectedCell = { r: hit.r, c: hit.c };
          s.status = zh() ? '先点下方字母，再点空格。' : 'Tap a rack letter first, then a cell.';
          return true;
        }
        const res = placeRackOnCell(s, s.selectedRack, hit.r, hit.c);
        if (res === 'complete') endCrossword(quietRef);
        try { if (typeof SFX !== 'undefined') SFX.ui(); } catch (_) {}
        return true;
      }
    }

    return true;
  }

  global.NVC_QUIET_GAMES = {
    WORD_THEMES,
    CHESS_LEVELS,
    openPicker,
    openMode,
    getLayout,
    hitTest,
    handleClick,
    draw,
    loadChessProgress,
    loadScrabblePrefs,
  };
})(typeof window !== 'undefined' ? window : globalThis);
