/**
 * Outfit catalog + unlock/progression for James & Yifan closets.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'neovelvet_outfits_v1';
  const JAMES_BIRTHDAY = Object.freeze({ month: 4, day: 19 });
  const YIFAN_BIRTHDAY = Object.freeze({ month: 5, day: 29 });

  const DEFAULT_COUPLE_PALETTE = Object.freeze({
    base: '#e8a8c0',
    hi: '#ffe8f2',
    lo: '#c87898',
    belly: '#fff0f6',
    sole: '#d898b0',
    pad: '#c88098',
    hoodLo: '#b86888',
    earIn: '#ffd0e4',
    mitten: '#dea0b8',
    rim: '#f0b8d0',
  });

  function tintPalette(baseHex, shifts) {
    const p = { ...DEFAULT_COUPLE_PALETTE };
    if (baseHex) {
      p.base = baseHex;
      p.hi = shifts?.hi || baseHex;
      p.lo = shifts?.lo || baseHex;
      p.belly = shifts?.belly || '#fff0f6';
      p.sole = shifts?.sole || baseHex;
      p.pad = shifts?.pad || baseHex;
      p.hoodLo = shifts?.hoodLo || baseHex;
      p.earIn = shifts?.earIn || '#ffd0e4';
      p.mitten = shifts?.mitten || baseHex;
      p.rim = shifts?.rim || baseHex;
    }
    return Object.freeze(p);
  }

  /** @type {ReadonlyArray<object>} */
  const CATALOG = Object.freeze([
    // ── James base / seasons / birthday ──
    {
      id: 'default_teal', who: 'james', tier: 'permanent',
      label: { en: 'Default teal', zh: '默认青绿' },
      shirt: '#5ce1ff', pants: '#3a4858', shoe: '#2a3040',
      unlock: { type: 'always' },
    },
    {
      id: 'season_spring', who: 'james', tier: 'seasonal', season: 'spring',
      label: { en: 'Spring light', zh: '春日浅色' },
      shirt: '#b8f0c8', pants: '#5a7060', shoe: '#3a4840',
      unlock: { type: 'season', season: 'spring' },
    },
    {
      id: 'season_summer', who: 'james', tier: 'seasonal', season: 'summer',
      label: { en: 'Summer bright', zh: '夏日亮色' },
      shirt: '#ffe08a', pants: '#3a5a80', shoe: '#f5f5f5',
      unlock: { type: 'season', season: 'summer' },
    },
    {
      id: 'season_autumn', who: 'james', tier: 'seasonal', season: 'autumn',
      label: { en: 'Autumn warm', zh: '秋日暖色' },
      shirt: '#e89860', pants: '#4a3020', shoe: '#2a1810',
      unlock: { type: 'season', season: 'autumn' },
    },
    {
      id: 'season_winter', who: 'james', tier: 'seasonal', season: 'winter',
      label: { en: 'Winter coat tone', zh: '冬日外套色' },
      shirt: '#d8e8f8', pants: '#2a3048', shoe: '#1a2030',
      unlock: { type: 'season', season: 'winter' },
    },
    {
      id: 'event_birthday_james', who: 'james', tier: 'event',
      label: { en: 'Birthday (James)', zh: '生日（James）' },
      shirt: '#ffe566', pants: '#2a2040', shoe: '#1a1528',
      unlock: { type: 'birthday', who: 'james', month: 4, day: 19 },
    },
    {
      id: 'event_founding', who: 'james', tier: 'event',
      label: { en: 'Architect (Founding Day)', zh: '建城日 · 建筑师' },
      shirt: '#1e5a68', pants: '#142838', shoe: '#0a1218', accent: '#5ce1ff',
      collar: '#c8f4ff', tie: '#40b8f0', cut: 'long', hem: 'long', fabric: 'gloss',
      pattern: 'circuit', props: ['blueprint'], hairStyle: 'sidePart',
      unlock: { type: 'festival', festival: 'founding' },
    },

    // ── Work ──
    {
      id: 'work_clerk', who: 'james', tier: 'permanent',
      label: { en: 'Work clerk', zh: '职员装' },
      draw: 'work',
      unlock: { type: 'gameplay', world: 'work', clear: 'signed' },
      hideInCloset: true,
    },
    {
      id: 'work_uniform', who: 'james', tier: 'permanent',
      label: { en: 'Work uniform', zh: '工装' },
      draw: 'work',
      unlock: { type: 'gameplay', world: 'work', clear: 'signed' },
    },
    {
      id: 'work_manager', who: 'james', tier: 'permanent',
      label: { en: 'Manager shirt', zh: '经理衬衫' },
      shirt: '#f2f2ee', pants: '#121212', shoe: '#101018', accent: '#3a3a3a',
      collar: '#f2f2ee', tie: '#121212', cut: 'short', hem: 'long', fabric: 'matte',
      draw: 'workShirt', props: ['phone', 'notebook'], hairStyle: 'default',
      unlock: { type: 'stat', path: 'clears.workSign', min: 5 },
    },
    {
      id: 'work_ceo', who: 'james', tier: 'permanent',
      label: { en: 'CEO look', zh: 'CEO 装' },
      shirt: '#1c2438', pants: '#121826', shoe: '#0a0e16',
      accent: '#c8d0dc', collar: '#f2f4f8', tie: '#1a1a28',
      unlock: { type: 'stat', path: 'clears.workSign', min: 12, orPath: 'clears.empireWin', orMin: 1 },
      tripUnlock: true,
    },
    {
      id: 'work_pet_care', who: 'james', tier: 'permanent',
      label: { en: 'Pet-care smock', zh: '宠物路线罩衫' },
      shirt: '#1a3a68', pants: '#162848', shoe: '#0e1830', accent: '#8ec8f0',
      cut: 'long', hem: 'long', fabric: 'knit', pattern: 'knit',
      props: ['dogHead', 'leashTinkerbell'], hairStyle: 'default',
      unlock: { type: 'stat', path: 'clears.workPetClear', min: 1 },
    },

    // ── Football ──
    {
      id: 'sport_kit', who: 'james', tier: 'permanent',
      label: { en: 'Sport kit', zh: '运动服' },
      draw: 'sport', shirt: '#f2f6fa', pants: '#1a3060', shoe: '#f5f5f5', accent: '#c02040',
      worldFamily: ['football'], worldRole: 'kit',
      unlock: { type: 'gameplay', world: 'football', clear: 'match' },
    },
    {
      id: 'sport_champion', who: 'james', tier: 'permanent',
      label: { en: 'Champion stripes', zh: '冠军条纹' },
      draw: 'sport', shirt: '#c02040', pants: '#0a1020', shoe: '#f5f5f5', accent: '#2040a0',
      pattern: 'rbStripe', props: ['trophy', 'garland'],
      worldFamily: ['football'], worldRole: 'champion',
      unlock: { type: 'stat', path: 'clears.footballWin', min: 3 },
    },

    // ── Drake ──
    {
      id: 'drake_jacket', who: 'james', tier: 'permanent',
      label: { en: 'Stage jacket', zh: '舞台夹克' },
      shirt: '#ff6ec7', pants: '#1a1028', shoe: '#2a1520', accent: '#ffe566',
      fabric: 'gloss', cut: 'long', hem: 'long', pattern: 'sequin',
      unlock: { type: 'gameplay', world: 'drake', clear: 'leave' },
    },
    {
      id: 'party_lounge_jacket', who: 'james', tier: 'permanent',
      label: { en: 'Party lounge jacket', zh: '派对休闲夹克' },
      shirt: '#40c8e8', pants: '#a8b0b8', shoe: '#f5f5f5', accent: '#e03040',
      cut: 'short', hem: 'long', fabric: 'gloss', pattern: 'discoStripe',
      props: ['suspenders'], hairStyle: 'afro',
      unlock: { type: 'stat', path: 'clears.drakeLeave', min: 1 },
      hideInCloset: true,
    },
    {
      id: 'party_encore', who: 'james', tier: 'permanent',
      label: { en: 'Encore gloss', zh: '返场亮面' },
      shirt: '#2db86a', pants: '#201028', shoe: '#c8d0e0', accent: '#ff6ec7',
      fabric: 'gloss', cut: 'long', hem: 'long', pattern: 'sequin',
      props: ['rimGlasses', 'goldMic', 'pinkGems', 'partyBlush', 'hairHighlights', 'pantsSequin'],
      faceAcc: 'rimGlasses', hairStyle: 'wavy',
      unlock: { type: 'stat', path: 'clears.drakeLeave', min: 5 },
    },

    // ── Relax ──
    {
      id: 'relax_spa_soft', who: 'james', tier: 'permanent',
      label: { en: 'Spa soft', zh: '水疗软装' },
      shirt: '#1a3d5c', pants: '#1a3d5c', shoe: '#ffcb9a', cut: 'long', hem: 'long', fabric: 'matte',
      draw: 'spaTowel', props: ['spaHeadTowel'],
      worldFamily: ['relax'], worldRole: 'spa',
      unlock: { type: 'stat', path: 'clears.relaxLeave', min: 1 },
    },

    // ── Love ──
    {
      id: 'couple_glow', who: 'james', tier: 'event',
      label: { en: 'Couple glow', zh: '情侣发光' },
      shirt: '#ffe566', pants: '#e0c040', shoe: '#fff0a0', accent: '#ff9a40',
      draw: 'onesie', pattern: 'chick', onesieForm: 'chick', fabric: 'gloss',
      onesiePalette: tintPalette('#ffe566', { hi: '#fff6b0', lo: '#d0a820', belly: '#fff8c8', earIn: '#ffc070' }),
      props: ['heartPatch'],
      worldFamily: ['love'], worldRole: 'glow',
      unlock: { type: 'stat', path: 'clears.loveComplete', min: 1 },
    },
    {
      id: 'couple_festival', who: 'james', tier: 'event',
      label: { en: 'Festival couple', zh: '节日情侣' },
      shirt: '#f5f5f5', pants: '#1a1a1a', shoe: '#f0f0f0', accent: '#c04050', props: ['scarf'],
      draw: 'onesie', pattern: 'panda',
      onesiePalette: tintPalette('#f5f5f5', { hi: '#ffffff', lo: '#1a1a1a', belly: '#ffffff', earIn: '#101010', hoodLo: '#1a1a1a', rim: '#e8e8e8', mitten: '#1a1a1a', sole: '#101010', pad: '#303030' }),
      worldFamily: ['love'], worldRole: 'festival',
      unlock: { type: 'stat', path: 'clears.loveComplete', min: 3 },
    },

    // ── Flip / Empire / Gene / Join ──
    {
      id: 'flip_invert_tee', who: 'james', tier: 'permanent',
      label: { en: 'Invert femme', zh: '翻转女装' },
      shirt: '#c8a0e8', pants: '#3a2048', shoe: '#f0b0c8', accent: '#ff90b8',
      cut: 'short', hem: 'skirt', pattern: 'invertCity', draw: 'femmeTee',
      hairStyle: 'longFeminine', props: ['partyBlush', 'ribbonClip'],
      unlock: { type: 'stat', path: 'clears.flipSurvive', min: 1 },
    },
    {
      id: 'flip_tree_coat', who: 'james', tier: 'permanent',
      label: { en: 'Tree-end coat', zh: '圣诞树结局外套' },
      shirt: '#2a6030', pants: '#1a3020', shoe: '#101810', accent: '#c04040',
      pattern: 'treeOrnament',
      props: ['treeHat', 'treeStar', 'pompom'], hairStyle: 'wavy',
      unlock: { type: 'stat', path: 'clears.flipTreeEnd', min: 1 },
    },
    {
      id: 'flip_vampire_count', who: 'james', tier: 'permanent',
      label: { en: 'Vampire Count', zh: '吸血鬼伯爵' },
      shirt: '#1a0810', pants: '#10060c', shoe: '#080408', accent: '#5a0c18',
      collar: '#f0e8e0', cut: 'long', hem: 'long', fabric: 'gloss',
      draw: 'vampireTails', props: ['cravat'], hairStyle: 'slick', hairColor: '#1a1018',
      unlock: { type: 'stat', path: 'clears.flipHalloweenSwallow', min: 1 },
    },
    {
      id: 'flip_apple_onesie', who: 'james', tier: 'permanent',
      label: { en: 'Apple onesie', zh: '苹果圆润连体衣' },
      shirt: '#d02828', pants: '#b02020', shoe: '#8a1818', accent: '#5a8828',
      draw: 'onesie', pattern: 'apple', onesieForm: 'apple',
      onesiePalette: tintPalette('#d02828', {
        hi: '#e84838', lo: '#9a1818', belly: '#ffe0d0',
        earIn: '#ffb0a0', hoodLo: '#b02020', rim: '#e06050',
        mitten: '#c02828', sole: '#8a1818', pad: '#a02020',
      }),
      unlock: { type: 'stat', path: 'clears.flipAppleCalm', min: 1 },
    },
    {
      id: 'empire_suit_echo', who: 'james', tier: 'permanent',
      label: { en: 'IPO suit echo', zh: '上市西装回声' },
      shirt: '#7a2030', pants: '#501018', shoe: '#080808', accent: '#f4f6fb',
      collar: '#ffffff', tie: '#243858', props: ['ceoTie', 'pocketSquare'],
      hairStyle: 'sidePart', hairColor: '#c86840', fabric: 'gloss', cut: 'long', hem: 'long',
      unlock: { type: 'stat', path: 'clears.empireWin', min: 1 },
    },
    {
      id: 'empire_beggar', who: 'james', tier: 'permanent',
      label: { en: "Beggar's last stand", zh: '失意者的最后一搏' },
      shirt: '#6a5848', pants: '#4a4030', shoe: '#2a2018',
      cut: 'long', hem: 'long', fabric: 'matte', pattern: 'ragged',
      props: ['bandage', 'bread', 'hairDebris'], hairStyle: 'messy', faceAcc: 'bandage',
      unlock: { type: 'stat', path: 'clears.empireFail', min: 1 },
    },
    {
      id: 'genewar_lab', who: 'james', tier: 'permanent',
      label: { en: 'Lab coat vibe', zh: '实验室风' },
      shirt: '#f4f8fc', pants: '#3a4858', shoe: '#2a3040', accent: '#2a3048',
      draw: 'lab', cut: 'long', hem: 'long',
      props: ['infinityTie', 'beaker'],
      unlock: { type: 'stat', path: 'clears.genewarClear', min: 1 },
    },
    {
      id: 'joinus_welcome', who: 'james', tier: 'permanent',
      label: { en: 'Welcome tee', zh: '欢迎衫' },
      shirt: '#101018', pants: '#0a0a10', shoe: '#08080c', accent: '#2db86a',
      draw: 'tuxedo', cut: 'long', hem: 'long', fabric: 'gloss',
      props: ['topHat', 'greenBowtie', 'cane'], hairStyle: 'sidePart',
      unlock: { type: 'stat', path: 'clears.joinusClear', min: 1 },
    },

    // ── City ──
    {
      id: 'gym_training', who: 'james', tier: 'permanent',
      label: { en: 'Training kit', zh: '训练装' },
      shirt: '#121212', pants: '#0c0c0c', shoe: '#f5f5f5',
      cut: 'sleeveless', hem: 'shorts', props: ['tallSocks', 'waterBottle', 'banana'], hairStyle: 'quiff',
      unlock: { type: 'stat', path: 'clears.gymSet', min: 1 },
    },
    {
      id: 'gym_pro', who: 'james', tier: 'permanent',
      label: { en: 'Pro training', zh: '进阶训练' },
      shirt: '#141414', pants: '#101010', shoe: '#e8e8e8', accent: '#c0c0c0',
      draw: 'gymVest', cut: 'sleeveless', hem: 'shorts',
      props: ['tallSocks', 'dumbbell'], hairStyle: 'quiff',
      unlock: { type: 'stat', path: 'clears.gymSet', min: 5, orPath: 'clears.gymPerfect', orMin: 1 },
    },
    {
      id: 'vacation_breeze', who: 'james', tier: 'permanent',
      label: { en: 'Vacation breeze', zh: '度假装' },
      shirt: '#f07090', pants: '#f0e8d0', shoe: '#d8a860',
      cut: 'short', hem: 'shorts', fabric: 'matte', pattern: 'floral',
      props: ['yellowShades'], hairStyle: 'wavy', faceAcc: 'yellowShades',
      unlock: { type: 'stat', path: 'clears.vacationLeave', min: 1 },
    },
    {
      id: 'event_vacation', who: 'james', tier: 'event',
      label: { en: 'Vacation', zh: '度假' },
      shirt: '#f07090', pants: '#f0e8d0', shoe: '#d8a860',
      cut: 'short', hem: 'shorts', pattern: 'floral',
      props: ['yellowShades'], hairStyle: 'wavy', faceAcc: 'yellowShades',
      unlock: { type: 'stat', path: 'clears.vacationLeave', min: 1 },
      hideInCloset: true,
    },
    {
      id: 'city_lucky_angel', who: 'james', tier: 'permanent',
      label: { en: 'Lucky angel', zh: '神使装' },
      shirt: '#fff8e0', pants: '#e8d090', shoe: '#f5f0d8', accent: '#ffe566',
      props: ['halo', 'angelWings'],
      unlock: { type: 'stat', path: 'clears.citySuperLucky', min: 1 },
    },
    {
      id: 'hermes_ribbon', who: 'james', tier: 'permanent',
      label: { en: 'Messenger ribbon', zh: '信使丝带装' },
      shirt: '#c86838', pants: '#4a3020', shoe: '#2a1810', accent: '#f0d090',
      cut: 'short', hem: 'long', fabric: 'matte', props: ['ribbon'], hairStyle: 'sidePart',
      unlock: { type: 'stat', path: 'clears.cityFortuneAlbum', min: 16 },
    },
    {
      id: 'city_explorer', who: 'james', tier: 'permanent',
      label: { en: 'City explorer', zh: '城市探索者' },
      shirt: '#1a3a68', pants: '#7a9ab8', shoe: '#3a3028',
      pattern: 'fairisle', props: ['backpack'], hairStyle: 'quiff',
      unlock: { type: 'stat', path: 'clears.cityBuildingClicks', min: 100 },
    },

    // ── Event shadows still pending concrete parents ──
    {
      id: 'event_cooking', who: 'james', tier: 'event',
      label: { en: 'Cooking', zh: '烹饪' },
      shirt: '#f5f0e8', pants: '#4a4038', shoe: '#2a2420',
      unlock: { type: 'event_shadow', parent: 'cooking' },
    },
    {
      id: 'event_garden', who: 'james', tier: 'event',
      label: { en: 'Garden', zh: '园艺' },
      shirt: '#8bc878', pants: '#5a4838', shoe: '#3a3028',
      unlock: { type: 'event_shadow', parent: 'garden' },
    },
    {
      id: 'event_camo', who: 'james', tier: 'event',
      label: { en: 'Camo', zh: '迷彩' },
      shirt: '#6a7850', pants: '#4a5038', shoe: '#2a3020',
      unlock: { type: 'event_shadow', parent: 'camo' },
    },
    {
      id: 'gather_xmas_knit', who: 'james', tier: 'event',
      label: { en: 'Santa suit', zh: '圣诞老人套装' },
      shirt: '#c02828', pants: '#a01818', shoe: '#101010', accent: '#f5f5f5',
      cut: 'long', hem: 'long', fabric: 'knit', draw: 'santa',
      props: ['santaHat', 'santaBeard'], hairStyle: 'messy',
      unlock: { type: 'stat', path: 'clears.gatherXmas', min: 1 },
    },
    {
      id: 'gather_friends_night', who: 'james', tier: 'event',
      label: { en: 'Friends night', zh: '朋友夜装' },
      shirt: '#40c8e8', pants: '#a8b0b8', shoe: '#f5f5f5', accent: '#e03040',
      pattern: 'discoStripe', hairStyle: 'afro', props: ['suspenders'], fabric: 'gloss',
      unlock: { type: 'stat', path: 'clears.gatherFriends', min: 1 },
    },
    {
      id: 'halloween_pumpkin', who: 'james', tier: 'event',
      label: { en: 'Pumpkin suit', zh: '万圣节南瓜套' },
      shirt: '#e87828', pants: '#2a1810', shoe: '#1a1008', accent: '#3a6820',
      cut: 'long', hem: 'long', fabric: 'matte',
      props: ['pumpkinHead'], hairStyle: 'messy',
      unlock: { type: 'festival', festival: 'halloween' },
    },
    {
      id: 'login_linger', who: 'james', tier: 'permanent',
      label: { en: 'Linger tee', zh: '停留短袖' },
      shirt: '#b8a0e8', pants: '#3a3050', shoe: '#2a2038', cut: 'short', hem: 'long', fabric: 'matte', pattern: 'stripe',
      unlock: { type: 'stat', path: 'clears.sessionMinutes', min: 30 },
    },
    {
      id: 'diary_hours', who: 'james', tier: 'permanent',
      label: { en: 'Diary knit', zh: '日记针织' },
      shirt: '#c8b898', pants: '#4a4038', shoe: '#2a2420', cut: 'long', hem: 'long', fabric: 'knit', pattern: 'knit',
      unlock: { type: 'stat', path: 'clears.diaryNotes', min: 5 },
    },
    {
      id: 'genewar_bald', who: 'james', tier: 'permanent',
      label: { en: "Dad's Love", zh: '爸爸的爱' },
      shirt: '#7ec8f0', pants: '#ffe566', shoe: '#fff8e0', accent: '#ffe080',
      cut: 'short', hem: 'shorts', draw: 'babySet',
      props: ['baldCap', 'laceBib'],
      unlock: { type: 'stat', path: 'clears.genewarFail', min: 1 },
    },
    {
      id: 'nude_duck', who: 'james', tier: 'permanent',
      label: { en: 'Duck memorial', zh: '全裸纪念装' },
      shirt: '#ffcb9a', pants: '#ffcb9a', shoe: '#ffcb9a', draw: 'nudeDuck',
      props: ['duck'],
      worldFamily: ['relax'], worldRole: 'duck',
      unlock: { type: 'stat', path: 'clears.relaxSleep', min: 3 },
    },
    {
      id: 'pet_plush_pajama', who: 'james', tier: 'permanent',
      label: { en: 'Dog plush pajama', zh: '狗狗毛绒睡衣' },
      shirt: '#e8e0d4', pants: '#c8c0b4', shoe: '#e8e0d4', draw: 'plushPajama', pattern: 'plushFur',
      props: ['dogEarSleepCap'], hairStyle: 'messy',
      unlock: { type: 'stat', path: 'clears.workPetClear', min: 1 },
    },
    {
      id: 'joinus_mj_host', who: 'james', tier: 'permanent',
      label: { en: 'Mayor suit', zh: '市长装' },
      shirt: '#1a3058', pants: '#121828', shoe: '#08080c', accent: '#d4b060',
      draw: 'mjHost', cut: 'long', hem: 'long', fabric: 'gloss',
      props: ['hostTie', 'sash', 'pocketSquare'], hairStyle: 'sidePart',
      unlock: { type: 'stat', path: 'clears.joinusClear', min: 10 },
    },
    {
      id: 'work_smudge_shirt', who: 'james', tier: 'permanent',
      label: { en: 'Muddy pet workwear', zh: '沾泥宠物工装' },
      shirt: '#1a1a22', pants: '#121218', shoe: '#0e0e14', accent: '#5a4830',
      cut: 'short', hem: 'long', fabric: 'matte', pattern: 'mudSmudge',
      unlock: { type: 'stat', path: 'clears.workPetFail', min: 1 },
    },
    {
      id: 'couple_pout', who: 'james', tier: 'permanent',
      label: { en: 'Pout soft', zh: '闷闷软装' },
      shirt: '#5a8870', pants: '#3a6850', shoe: '#4a7860', accent: '#c04050',
      draw: 'onesie', pattern: 'snake', onesieForm: 'snake',
      onesiePalette: tintPalette('#5a8870', { hi: '#88b898', lo: '#3a5848', belly: '#c8e0b0', earIn: '#88a878', hoodLo: '#3a5848', rim: '#6a9878', mitten: '#4a7860', sole: '#2a4838', pad: '#3a5848' }),
      props: ['heartPatch'],
      worldFamily: ['love'], worldRole: 'pout',
      unlock: { type: 'stat', path: 'clears.loveMiss', min: 1 },
    },
    {
      id: 'business_trip_blazer', who: 'james', tier: 'permanent',
      label: { en: 'Trip blazer', zh: '出差西装' },
      shirt: '#8a6048', pants: '#4a3028', shoe: '#1a1008', accent: '#e8d0b0',
      collar: '#f8f0e8', tie: '#5a3020', cut: 'long', hem: 'long', fabric: 'matte',
      props: ['suitcase'], hairStyle: 'quiff',
      unlock: { type: 'stat', path: 'clears.businessTrip', min: 1 },
    },
    {
      id: 'trip_honor_sash', who: 'james', tier: 'permanent',
      label: { en: 'Honor sash', zh: '荣誉绶带装' },
      shirt: '#8b6914', pants: '#3d2a10', shoe: '#1a1008', accent: '#c04050',
      cut: 'long', hem: 'long', fabric: 'gloss', props: ['sash'], hairStyle: 'sidePart',
      unlock: { type: 'stat', path: 'clears.businessTrip', min: 3 },
    },

    // ── Yifan base ──
    {
      id: 'yifan_default', who: 'yifan', tier: 'permanent',
      label: { en: 'Onesie default', zh: '默认连体衣' },
      onesiePalette: DEFAULT_COUPLE_PALETTE,
      unlock: { type: 'always' },
    },
    {
      id: 'yifan_birthday', who: 'yifan', tier: 'event',
      label: { en: 'Birthday hat', zh: '生日帽' },
      onesiePalette: tintPalette('#e8e0f0', { hi: '#f8f4fc', lo: '#c8b8d8', belly: '#f0e8f8', earIn: '#e0d0e8', hoodLo: '#b8a8c8', rim: '#f0e8f8', mitten: '#d0c0e0' }),
      accent: '#c0c8d8', props: ['birthdayHat'],
      unlock: { type: 'birthday', who: 'yifan', month: 5, day: 29 },
    },
    {
      id: 'yifan_season_spring', who: 'yifan', tier: 'seasonal', season: 'spring',
      label: { en: 'Spring onesie', zh: '春日连体衣' },
      onesiePalette: tintPalette('#b8f0c8', { hi: '#e0ffe8', lo: '#78c090' }),
      hairAcc: 'leafPin', hairpinBase: '#3a8828', hairpinInk: '#6a9850', hairpinAccent: '#c8e878',
      unlock: { type: 'season', season: 'spring' },
    },
    {
      id: 'yifan_season_summer', who: 'yifan', tier: 'seasonal', season: 'summer',
      label: { en: 'Summer onesie', zh: '夏日连体衣' },
      onesiePalette: tintPalette('#ffe08a', { hi: '#fff4c8', lo: '#e0b050' }),
      limbMesh: true,
      unlock: { type: 'season', season: 'summer' },
    },
    {
      id: 'yifan_season_autumn', who: 'yifan', tier: 'seasonal', season: 'autumn',
      label: { en: 'Autumn onesie', zh: '秋日连体衣' },
      onesiePalette: tintPalette('#e89860', { hi: '#ffd0a0', lo: '#c07040' }),
      hairAcc: 'maplePin', hairpinBase: '#c04020', hairpinInk: '#e87828', hairpinAccent: '#ffe080',
      unlock: { type: 'season', season: 'autumn' },
    },
    {
      id: 'yifan_season_winter', who: 'yifan', tier: 'seasonal', season: 'winter',
      label: { en: 'Winter onesie', zh: '冬日连体衣' },
      onesiePalette: tintPalette('#c8d8f0', { hi: '#e8f0ff', lo: '#98a8c8' }),
      unlock: { type: 'season', season: 'winter' },
    },

    // ── Yifan room growth ──
    {
      id: 'yifan_note_soft', who: 'yifan', tier: 'permanent',
      label: { en: 'Note soft', zh: '便签软粉' },
      onesiePalette: tintPalette('#f0b8d0', { hi: '#ffe0f0', lo: '#d088a8' }),
      unlock: { type: 'stat', path: 'yifanUse.notes', min: 3 },
    },
    {
      id: 'yifan_photo_pastel', who: 'yifan', tier: 'permanent',
      label: { en: 'Photo pastel', zh: '相册淡彩' },
      onesiePalette: tintPalette('#c8b8e8', { hi: '#e8e0ff', lo: '#9880c8' }),
      unlock: { type: 'stat', path: 'yifanUse.photos', min: 3 },
    },
    {
      id: 'yifan_care_knit', who: 'yifan', tier: 'permanent',
      label: { en: 'Care knit', zh: '照料针织' },
      onesiePalette: tintPalette('#68b878', { hi: '#b8e8c0', lo: '#2a6840', belly: '#88d098' }),
      pattern: 'wave', accent: '#3a8850',
      unlock: { type: 'stat', path: 'yifanUse.care', min: 5 },
    },
    {
      id: 'yifan_game_play', who: 'yifan', tier: 'permanent',
      label: { en: 'Game play', zh: '房间游戏装' },
      onesiePalette: tintPalette('#68c0e8', { hi: '#b0e8ff', lo: '#4090c0' }),
      props: ['chessQueen', 'letterA'],
      unlock: { type: 'stat', path: 'yifanUse.games', min: 3 },
    },
    {
      id: 'yifan_mail_ribbon', who: 'yifan', tier: 'permanent',
      label: { en: 'Mail ribbon', zh: '信箱丝带' },
      onesiePalette: tintPalette('#e8a0b8', { hi: '#ffd0e0', lo: '#c07090' }),
      props: ['ribbon'],
      unlock: { type: 'stat', path: 'yifanUse.mailbox', min: 3 },
    },
    {
      id: 'yifan_calendar_day', who: 'yifan', tier: 'permanent',
      label: { en: 'Calendar day', zh: '日历日常装' },
      onesiePalette: tintPalette('#a8d0c8', { hi: '#d8f0e8', lo: '#78a898' }),
      unlock: { type: 'stat', path: 'yifanUse.calendar', min: 3 },
    },
    {
      id: 'yifan_pet_paw', who: 'yifan', tier: 'permanent',
      label: { en: 'Pet paw', zh: '宠物爪印装' },
      onesiePalette: tintPalette('#f0c8a0', {
        hi: '#ffe8d0', lo: '#d09870', belly: '#fff0e0', earIn: '#ffb090',
      }),
      pattern: 'paw', onesieForm: 'cat',
      props: ['dogHairTies'],
      unlock: { type: 'stat', path: 'yifanUse.pet', min: 5 },
    },
    {
      id: 'yifan_board_pin', who: 'yifan', tier: 'permanent',
      label: { en: 'Board pin', zh: '看板别针装' },
      onesiePalette: tintPalette('#d0b8e0', { hi: '#f0e0ff', lo: '#a888c0' }),
      props: ['pin'],
      unlock: { type: 'stat', path: 'yifanUse.board', min: 3 },
    },

    // ── Yifan love ──
    {
      id: 'yifan_couple_glow', who: 'yifan', tier: 'event',
      label: { en: 'Couple glow', zh: '情侣发光' },
      onesiePalette: tintPalette('#ffe566', { hi: '#fff6b0', lo: '#d0a820', belly: '#fff8c8', earIn: '#ffc070' }),
      accent: '#ff9a40', pattern: 'chick', onesieForm: 'chick',
      worldFamily: ['love'], worldRole: 'glow',
      unlock: { type: 'stat', path: 'clears.loveComplete', min: 1 },
    },
    {
      id: 'yifan_couple_festival', who: 'yifan', tier: 'event',
      label: { en: 'Festival couple', zh: '节日情侣' },
      onesiePalette: tintPalette('#f5f5f5', { hi: '#ffffff', lo: '#1a1a1a', belly: '#ffffff', earIn: '#101010', hoodLo: '#1a1a1a', rim: '#e8e8e8', mitten: '#1a1a1a', sole: '#101010', pad: '#303030' }),
      props: ['scarf'], accent: '#2040a0', pattern: 'panda',
      worldFamily: ['love'], worldRole: 'festival',
      unlock: { type: 'stat', path: 'clears.loveComplete', min: 3 },
    },
    {
      id: 'yifan_halloween_pumpkin', who: 'yifan', tier: 'event',
      label: { en: 'Pumpkin onesie', zh: '万圣节南瓜套' },
      onesiePalette: tintPalette('#e87828', {
        hi: '#ffb060', lo: '#b05018', belly: '#ffe0a8', earIn: '#ffc070',
        hoodLo: '#c06018', rim: '#3a6820',
      }),
      props: ['pumpkin'], accent: '#3a6820', pattern: 'pumpkin',
      unlock: { type: 'festival', festival: 'halloween' },
    },
    {
      id: 'yifan_halloween_bat', who: 'yifan', tier: 'event',
      label: { en: 'Vampire Hunter', zh: '吸血鬼猎人' },
      // Readable wine body; skirt draws one step deeper in pattern (not near-black mush).
      onesiePalette: tintPalette('#6a2030', {
        hi: '#8a3040', lo: '#3a1520', belly: '#7a2838', earIn: '#c8d0d8',
        hoodLo: '#2a1018', rim: '#8a9098', mitten: '#5a2030', sole: '#1a1014', pad: '#2a1418',
      }),
      // hood must be down or hairAcc never draws (getYifanOnesieDrawCfg defaults hood→up).
      hood: 'down', fabric: 'gloss',
      pattern: 'bat', onesieForm: 'bat',
      patternInk: '#8a2030', patternAccent: '#c8d0d8',
      accent: '#c8d0d8',
      hairAcc: 'batBow', hairpinBase: '#8a2030', hairpinInk: '#2a1018', hairpinAccent: '#c8d0d8',
      unlock: { type: 'festival', festival: 'halloween' },
    },
    {
      id: 'yifan_event_founding', who: 'yifan', tier: 'event',
      label: { en: 'Architect (Founding Day)', zh: '建城日 · 建筑师' },
      onesiePalette: tintPalette('#1e5a68', {
        hi: '#4a98a8', lo: '#142838', belly: '#3a8898', earIn: '#5ce1ff',
        hoodLo: '#143848', rim: '#c8f4ff', mitten: '#2a7080',
      }),
      accent: '#5ce1ff',
      pattern: 'circuit',
      hairAcc: 'contractPin',
      hairpinBase: '#5ce1ff', hairpinInk: '#1a4050', hairpinAccent: '#c8f4ff',
      unlock: { type: 'festival', festival: 'founding' },
    },

    // ── Yifan world scenes (own roles — not James mirrors) ──
    {
      id: 'yifan_football_sideline', who: 'yifan', tier: 'permanent',
      label: { en: 'Pitch sideline', zh: '球场边线' },
      onesiePalette: tintPalette('#1a5030', {
        hi: '#3a8050', lo: '#0c2818', belly: '#2a6840', earIn: '#c8f0d0',
      }),
      accent: '#f5f5f5',
      pattern: 'pitch',
      worldFamily: ['football'], worldRole: 'sideline',
      unlock: { type: 'gameplay', world: 'football', clear: 'match' },
    },
    {
      id: 'yifan_event_christmas', who: 'yifan', tier: 'event',
      label: { en: 'Winter table soft', zh: '圣诞同桌软装' },
      onesiePalette: tintPalette('#c02838', {
        hi: '#e85868', lo: '#801820', belly: '#fff0f2', earIn: '#ffe0e4',
        hoodLo: '#901828', rim: '#f5f5f5',
      }),
      accent: '#f5f5f5',
      pattern: 'snowflake',
      props: ['scarf'],
      hairAcc: 'mistletoePin',
      worldFamily: ['christmas'],
      unlock: { type: 'stat', path: 'clears.gatherXmas', min: 1 },
    },
    {
      id: 'yifan_genewar_lab', who: 'yifan', tier: 'permanent',
      label: { en: 'Lab partner', zh: '实验搭档' },
      onesiePalette: tintPalette('#d8e4f0', {
        hi: '#f0f6fc', lo: '#98a8b8', belly: '#e8f0f8', earIn: '#5ce1ff',
      }),
      accent: '#2a5088',
      pattern: 'circuit',
      worldFamily: ['genewar'], worldRole: 'partner',
      unlock: { type: 'stat', path: 'clears.genewarClear', min: 1 },
    },
    {
      id: 'yifan_joinus_cohero', who: 'yifan', tier: 'permanent',
      label: { en: 'Parade co-hero', zh: '游行并肩' },
      onesiePalette: tintPalette('#1a2848', {
        hi: '#3a4868', lo: '#0c1428', belly: '#f0e8d8', earIn: '#d4b060',
        rim: '#d4b060', mitten: '#121828',
      }),
      accent: '#d4b060',
      pattern: 'fauxSuit',
      worldFamily: ['joinus'], worldRole: 'cohero',
      unlock: { type: 'stat', path: 'clears.joinusClear', min: 1 },
    },
    {
      id: 'yifan_relax_soft', who: 'yifan', tier: 'permanent',
      label: { en: 'Steam soft', zh: '蒸汽软装' },
      onesiePalette: tintPalette('#e8d8c0', {
        hi: '#f8efe0', lo: '#c0a888', belly: '#fff4e8', earIn: '#f0d0b0',
      }),
      accent: '#a88868',
      pattern: 'knit',
      worldFamily: ['relax'], worldRole: 'robe',
      unlock: { type: 'gameplay', world: 'relax', clear: 'left' },
    },

    // ── Yifan link to James ──
    {
      id: 'yifan_link_work_ceo', who: 'yifan', tier: 'permanent',
      label: { en: 'Boss-match soft', zh: '老板同款软肩' },
      onesiePalette: tintPalette('#1c2438', { hi: '#3a4860', lo: '#0c1018', belly: '#2a3448' }),
      accent: '#c8d0dc',
      hairAcc: 'contractPin',
      hairpinBase: '#f2f4f8', hairpinInk: '#2a3548', hairpinAccent: '#ffb0c8',
      unlock: { type: 'link', outfitId: 'work_ceo' },
    },
    {
      id: 'yifan_link_gym', who: 'yifan', tier: 'permanent',
      label: { en: 'Gym buddy', zh: '陪练卫衣' },
      onesiePalette: tintPalette('#6a7a8a', {
        hi: '#98a8b8', lo: '#3a4858', belly: '#8898a8', earIn: '#c8d0d8',
        mitten: '#5a6a7a', sole: '#2a3440',
      }),
      accent: '#9a9aa0',
      pattern: 'stripe',
      unlock: { type: 'link', outfitId: 'gym_training' },
    },
    {
      id: 'yifan_link_angel', who: 'yifan', tier: 'permanent',
      label: { en: 'Angel echo', zh: '神使呼应' },
      onesiePalette: tintPalette('#fff8e0', { hi: '#fffff0', lo: '#e8d090' }),
      props: ['halo'],
      unlock: { type: 'link', outfitId: 'city_lucky_angel' },
    },
    {
      id: 'yifan_flip_tree', who: 'yifan', tier: 'permanent',
      label: { en: 'Tree-end twin', zh: '树尽头同框' },
      onesiePalette: tintPalette('#6a3a88', {
        hi: '#9a68b8', lo: '#3a1850', belly: '#8a58a0',
        earIn: '#c8a0e0', hoodLo: '#4a2468', rim: '#b878d0',
        mitten: '#5a2a78', sole: '#2a1038', pad: '#7a48a0',
      }),
      accent: '#b8e848',
      pattern: 'treeOrnament',
      patternInk: '#b8e848',
      patternAccent: '#ffe566',
      props: ['treeHat', 'treeStar', 'pompom'],
      unlock: { type: 'link', outfitId: 'flip_tree_coat' },
    },
    {
      id: 'yifan_link_party', who: 'yifan', tier: 'permanent',
      label: { en: 'Party twin', zh: '派对同框' },
      onesiePalette: tintPalette('#40c8e8', {
        hi: '#c8f4ff', lo: '#2088a8', belly: '#88e0f0', earIn: '#ffb0d8', rim: '#a0e8f8',
      }),
      accent: '#ff6ec7',
      fabric: 'gloss',
      pattern: 'sequinDots',
      props: ['pinkGems', 'hairHighlights', 'partyBlush', 'rimGlasses'],
      unlock: { type: 'link', outfitId: 'party_lounge_jacket' },
    },
    {
      id: 'yifan_link_vacation', who: 'yifan', tier: 'permanent',
      label: { en: 'Vacation echo', zh: '度假呼应' },
      onesiePalette: tintPalette('#e878a0', { hi: '#ffc8d8', lo: '#c85078', belly: '#ffe0ea', earIn: '#ffb0c8' }),
      unlock: { type: 'link', outfitId: 'vacation_breeze' },
    },
    {
      id: 'yifan_login_linger', who: 'yifan', tier: 'permanent',
      label: { en: 'Linger onesie', zh: '停留连体衣' },
      onesiePalette: tintPalette('#7ad0e8', { hi: '#c8f0ff', lo: '#48a0c0' }),
      pattern: 'stripe', hairStyle: 'bangs',
      hairAcc: 'clockPin', hairpinBase: '#204060', hairpinInk: '#f0f4f8', hairpinAccent: '#5ce1ff',
      unlock: { type: 'stat', path: 'clears.sessionMinutes', min: 30 },
    },
    {
      id: 'yifan_diary_soft', who: 'yifan', tier: 'permanent',
      label: { en: 'Diary ribbon', zh: '日记丝带' },
      onesiePalette: tintPalette('#c8b898', { hi: '#efe4d0', lo: '#a08870' }),
      pattern: 'knit', hairAcc: 'ribbon', hairStyle: 'bun',
      unlock: { type: 'stat', path: 'clears.diaryNotes', min: 5 },
    },
    {
      id: 'yifan_sulk_ribbon', who: 'yifan', tier: 'permanent',
      label: { en: 'Sulk ribbon', zh: '黑脸丝带' },
      onesiePalette: tintPalette('#5a8870', { hi: '#88b898', lo: '#3a5848', belly: '#c8e0b0', earIn: '#88a878', hoodLo: '#3a5848', rim: '#6a9878' }),
      pattern: 'snake', onesieForm: 'snake', hairAcc: 'ribbon', hairStyle: 'bun', accent: '#c04060',
      worldFamily: ['love'], worldRole: 'pout',
      unlock: { type: 'stat', path: 'clears.loveMiss', min: 3 },
    },
  ]);

  const OUTFIT_VARIETY = {
    default_teal: { cut: 'short', hem: 'long', fabric: 'matte' },
    season_spring: { cut: 'long', hem: 'long', fabric: 'matte', pattern: 'leaf' },
    season_summer: { cut: 'sleeveless', hem: 'shorts', fabric: 'matte', props: ['sunglasses'] },
    season_autumn: { cut: 'long', hem: 'long', fabric: 'knit', pattern: 'knit', props: ['scarf'] },
    season_winter: { cut: 'long', hem: 'long', fabric: 'matte', props: ['winterHat'] },
    event_birthday_james: { cut: 'short', hem: 'long', fabric: 'gloss', props: ['bowtie', 'birthdayHat'] },
    event_founding: {
      cut: 'long', hem: 'long', fabric: 'gloss', pattern: 'circuit',
      props: ['blueprint'], hairStyle: 'sidePart',
    },
    work_manager: { cut: 'short', hem: 'long', fabric: 'matte', draw: 'workShirt', props: ['phone', 'notebook'], hairStyle: 'default', worldFamily: ['work'] },
    work_ceo: { cut: 'long', hem: 'long', fabric: 'gloss', draw: 'ceo', props: ['ceoTie', 'suitcase'], hairStyle: 'sidePart', worldFamily: ['work'] },
    sport_kit: { cut: 'short', hem: 'shorts', fabric: 'matte', draw: 'sport', worldFamily: ['football'], worldRole: 'kit' },
    sport_champion: { cut: 'short', hem: 'shorts', fabric: 'matte', draw: 'sport', pattern: 'rbStripe', props: ['trophy', 'garland'], worldFamily: ['football'], worldRole: 'champion' },
    work_pet_care: { cut: 'long', hem: 'long', fabric: 'knit', pattern: 'knit', props: ['dogHead', 'leashTinkerbell'] },
    drake_jacket: { cut: 'long', hem: 'long', fabric: 'gloss', pattern: 'sequin', worldFamily: ['drake'] },
    party_lounge_jacket: { cut: 'short', hem: 'long', fabric: 'gloss', pattern: 'discoStripe', props: ['suspenders'], hairStyle: 'afro', worldFamily: ['drake'] },
    party_encore: { cut: 'long', hem: 'long', fabric: 'gloss', pattern: 'sequin', props: ['rimGlasses', 'goldMic', 'pinkGems', 'partyBlush', 'hairHighlights', 'pantsSequin'], faceAcc: 'rimGlasses', hairStyle: 'wavy', worldFamily: ['drake'] },
    relax_spa_soft: { cut: 'long', hem: 'long', fabric: 'matte', draw: 'spaTowel', props: ['spaHeadTowel'], worldFamily: ['relax'], worldRole: 'spa' },
    couple_glow: { pairId: 'couple_glow', draw: 'onesie', fabric: 'gloss', pattern: 'chick', onesieForm: 'chick', worldFamily: ['love'], worldRole: 'glow' },
    couple_festival: { pairId: 'couple_festival', draw: 'onesie', pattern: 'panda', props: ['scarf'], worldFamily: ['love'], worldRole: 'festival' },
    flip_invert_tee: {
      cut: 'short', hem: 'skirt', fabric: 'matte', pattern: 'invertCity', draw: 'femmeTee',
      hairStyle: 'longFeminine', props: ['partyBlush', 'ribbonClip'], worldFamily: ['flip'],
    },
    genewar_bald: {
      cut: 'short', hem: 'shorts', draw: 'babySet',
      props: ['baldCap', 'laceBib'],
    },
    flip_tree_coat: { cut: 'long', hem: 'long', fabric: 'knit', pattern: 'treeOrnament', props: ['treeHat', 'treeStar', 'pompom'], hairStyle: 'wavy', worldFamily: ['flip'] },
    flip_vampire_count: {
      cut: 'long', hem: 'long', fabric: 'gloss', draw: 'vampireTails',
      props: ['cravat'], hairStyle: 'slick', hairColor: '#1a1018', worldFamily: ['flip'],
    },
    flip_apple_onesie: { draw: 'onesie', pattern: 'apple', onesieForm: 'apple', worldFamily: ['flip'] },
    empire_suit_echo: { cut: 'long', hem: 'long', fabric: 'gloss', props: ['ceoTie', 'pocketSquare'], hairStyle: 'sidePart', hairColor: '#c86840', worldFamily: ['empire'] },
    genewar_lab: { cut: 'long', hem: 'long', fabric: 'matte', draw: 'lab', props: ['infinityTie', 'beaker'], worldFamily: ['genewar'] },
    joinus_welcome: { cut: 'long', hem: 'long', fabric: 'gloss', draw: 'tuxedo', props: ['topHat', 'greenBowtie', 'cane'], hairStyle: 'sidePart', worldFamily: ['joinus'] },
    gym_training: { cut: 'sleeveless', hem: 'shorts', fabric: 'matte', props: ['tallSocks', 'waterBottle', 'banana'], hairStyle: 'quiff', worldFamily: ['gym'] },
    gym_pro: { cut: 'sleeveless', hem: 'shorts', fabric: 'matte', draw: 'gymVest', props: ['tallSocks', 'dumbbell'], hairStyle: 'quiff', worldFamily: ['gym'] },
    vacation_breeze: { pairId: 'vacation', cut: 'short', hem: 'shorts', fabric: 'matte', pattern: 'floral', props: ['yellowShades'], hairStyle: 'wavy', faceAcc: 'yellowShades', worldFamily: ['vacation'] },
    event_vacation: { pairId: 'vacation', cut: 'short', hem: 'shorts', pattern: 'floral', props: ['yellowShades'], hairStyle: 'wavy', faceAcc: 'yellowShades', worldFamily: ['vacation'] },
    city_lucky_angel: { pairId: 'angel', cut: 'short', hem: 'long', fabric: 'gloss', props: ['halo', 'angelWings'] },
    hermes_ribbon: { cut: 'short', hem: 'long', fabric: 'matte', props: ['ribbon'] },
    city_explorer: { cut: 'long', hem: 'long', fabric: 'knit', pattern: 'fairisle', props: ['backpack'], hairStyle: 'quiff' },
    gather_xmas_knit: { cut: 'long', hem: 'long', fabric: 'knit', draw: 'santa', props: ['santaHat', 'santaBeard'], hairStyle: 'messy' },
    gather_friends_night: { cut: 'short', hem: 'long', fabric: 'gloss', pattern: 'discoStripe', props: ['suspenders'], hairStyle: 'afro' },
    halloween_pumpkin: { cut: 'long', hem: 'long', fabric: 'matte', props: ['pumpkinHead'], hairStyle: 'messy' },
    yifan_halloween_pumpkin: {
      hairStyle: 'default', hood: 'up', pattern: 'pumpkin', hoodHairLong: true,
      props: ['pumpkin'],
      patternInk: '#c06020', patternAccent: '#3a6820',
    },
    yifan_halloween_bat: {
      hairStyle: 'default', hood: 'down', pattern: 'bat', onesieForm: 'bat', fabric: 'gloss',
      hairAcc: 'batBow', hairpinBase: '#8a2030', hairpinInk: '#2a1018', hairpinAccent: '#c8d0d8',
      patternInk: '#8a2030', patternAccent: '#c8d0d8',
    },
    work_smudge_shirt: { cut: 'short', hem: 'long', fabric: 'matte', pattern: 'mudSmudge' },
    pet_plush_pajama: {
      cut: 'long', hem: 'long', fabric: 'knit', draw: 'plushPajama', pattern: 'plushFur',
      props: ['dogEarSleepCap'], hairStyle: 'messy',
    },
    joinus_mj_host: { cut: 'long', hem: 'long', fabric: 'gloss', draw: 'mjHost', props: ['hostTie', 'sash', 'pocketSquare'], hairStyle: 'sidePart' },
    couple_pout: { pairId: 'couple_pout', draw: 'onesie', pattern: 'snake', onesieForm: 'snake', worldFamily: ['love'], worldRole: 'pout' },
    nude_duck: { draw: 'nudeDuck', props: ['duck'], worldFamily: ['relax'], worldRole: 'duck' },
    business_trip_blazer: { cut: 'long', hem: 'long', fabric: 'gloss', props: ['suitcase'], hairStyle: 'quiff' },
    trip_honor_sash: { cut: 'long', hem: 'long', fabric: 'gloss', props: ['sash'], hairStyle: 'sidePart' },
    empire_beggar: { cut: 'long', hem: 'long', fabric: 'matte', pattern: 'ragged', props: ['bandage', 'bread', 'hairDebris'], hairStyle: 'messy' },
    yifan_default: { pattern: 'ears', hairStyle: 'default', hood: 'up' },
    yifan_birthday: {
      hairStyle: 'doubleBun', hairAcc: 'classicBow', pattern: 'sparkle', hood: 'down',
      props: ['birthdayHat'], hairpinBase: '#c0c8d8', hairpinInk: '#f8f4fc', hairpinAccent: '#ffe566',
    },
    yifan_season_spring: {
      hairStyle: 'hairDown', hairAcc: 'leafPin', pattern: 'vine', hood: 'down',
      patternInk: '#6a9850', patternAccent: '#ffb0c8',
      hairpinBase: '#3a8828', hairpinInk: '#6a9850', hairpinAccent: '#c8e878',
    },
    yifan_season_summer: {
      hairStyle: 'shortBob', pattern: 'clouds', hood: 'up', limbMesh: true,
      patternInk: '#ffffff', patternAccent: '#a0d8f0',
    },
    yifan_season_autumn: {
      hairStyle: 'ponytail', hairAcc: 'maplePin', pattern: 'check', hood: 'down',
      hairpinBase: '#c04020', hairpinInk: '#e87828', hairpinAccent: '#ffe080',
      // Warm fabric check — avoid deep brown that reads as a hair blotch on the belly.
      patternInk: 'rgba(180,120,70,0.28)',
    },
    yifan_season_winter: { hairStyle: 'longTiedBack', hairAcc: 'earBand', pattern: 'snowflake', hood: 'up', hairpinBase: '#c8e0f0', patternInk: '#ffffff' },
    yifan_note_soft: { hairStyle: 'braidedPigtails', hairAcc: 'classicBow', pattern: 'dots', hood: 'down', hairpinBase: '#ffb0c8' },
    yifan_photo_pastel: { hairStyle: 'bun', hairAcc: 'themeBow', pattern: 'bowScatter', hood: 'down', hairpinBase: '#e8a0c0', patternInk: '#ffd0e4' },
    yifan_care_knit: {
      hairStyle: 'default', pattern: 'wave', hood: 'up',
      patternInk: 'rgba(40,100,60,0.4)', patternAccent: 'rgba(180,240,190,0.45)',
    },
    yifan_game_play: {
      hairStyle: 'twinTails', hairAcc: 'motifClip', pattern: 'diamond', hood: 'up',
      hairpinBase: '#7df9ff', props: ['chessQueen', 'letterA'],
    },
    yifan_mail_ribbon: { hairStyle: 'bun', hairAcc: 'classicBow', pattern: 'dash', hood: 'down', hairpinBase: '#c04050' },
    yifan_calendar_day: { hairStyle: 'default', pattern: 'vertStripe', hood: 'up', patternInk: 'rgba(255,255,255,0.35)' },
    yifan_pet_paw: {
      hairStyle: 'chestLowTail', onesieForm: 'cat', pattern: 'paw', hood: 'up',
      props: ['dogHairTies'], patternInk: 'rgba(80,40,20,0.4)',
      hoodHairLong: false,
    },
    yifan_board_pin: { hairStyle: 'shortBob', hairAcc: 'metalSnap', pattern: 'zigzag', hood: 'down', hairpinBase: '#ffe8f2', hairpinInk: '#c04070' },
    yifan_couple_glow: { pairId: 'couple_glow', hairStyle: 'bun', hairAcc: 'clip', hood: 'up', pattern: 'chick', onesieForm: 'chick', worldFamily: ['love'], worldRole: 'glow' },
    yifan_couple_festival: {
      pairId: 'couple_festival', hairStyle: 'bun', hairAcc: 'classicBow', hood: 'up', pattern: 'panda',
      props: ['scarf'], worldFamily: ['love'], worldRole: 'festival',
      hairpinBase: '#2040a0', hairpinInk: '#f0f4ff', hairpinAccent: '#ffffff',
    },
    yifan_event_founding: {
      hairStyle: 'bun', pattern: 'circuit', hood: 'down', hairAcc: 'contractPin',
      hairpinBase: '#5ce1ff', hairpinInk: '#1a4050', hairpinAccent: '#c8f4ff',
      patternInk: 'rgba(92, 225, 255, 0.55)', patternAccent: 'rgba(200, 244, 255, 0.65)',
    },
    yifan_football_sideline: {
      hairStyle: 'twinTails', hairAcc: 'footballPin', hood: 'down', pattern: 'pitch',
      hairpinBase: '#f5f5f5', hairpinInk: '#1a5030', hairpinAccent: '#c02040',
      patternInk: 'rgba(255,255,255,0.45)', patternAccent: 'rgba(200,240,210,0.35)',
      worldFamily: ['football'], worldRole: 'sideline',
    },
    yifan_event_christmas: {
      hairStyle: 'doubleBun', hairAcc: 'mistletoePin', hood: 'down', pattern: 'snowflake',
      props: ['scarf'],
      hairpinBase: '#3a8828', hairpinInk: '#ffffff', hairpinAccent: '#c02838',
      patternInk: '#ffffff', patternAccent: 'rgba(255,240,200,0.65)',
      worldFamily: ['christmas'],
    },
    yifan_genewar_lab: {
      hairStyle: 'shortBob', hairAcc: 'contractPin', hood: 'down', pattern: 'circuit',
      hairpinBase: '#5ce1ff', hairpinInk: '#1a4050', hairpinAccent: '#c8f4ff',
      patternInk: 'rgba(42, 80, 136, 0.45)', patternAccent: 'rgba(92, 225, 255, 0.55)',
      worldFamily: ['genewar'], worldRole: 'partner',
    },
    yifan_joinus_cohero: {
      hairStyle: 'ponytail', hairAcc: 'coinPin', hood: 'down', pattern: 'fauxSuit',
      hairpinBase: '#ffe080', hairpinInk: '#c09020', hairpinAccent: '#fff8c8',
      patternInk: 'rgba(212, 176, 96, 0.55)', patternAccent: '#f0e8d8',
      worldFamily: ['joinus'], worldRole: 'cohero',
    },
    yifan_relax_soft: {
      hairStyle: 'hairDown', hairAcc: 'earBand', hood: 'down', pattern: 'knit',
      hairpinBase: '#e8d8c0', hairpinInk: '#a88868', hairpinAccent: '#fff4e8',
      patternInk: 'rgba(120, 90, 70, 0.28)',
      worldFamily: ['relax'], worldRole: 'robe',
    },
    yifan_link_work_ceo: {
      hairStyle: 'bun', pattern: 'stripe', hood: 'down', hairAcc: 'contractPin',
      hairpinBase: '#f2f4f8', hairpinInk: '#2a3548', hairpinAccent: '#ffb0c8',
    },
    yifan_link_gym: {
      hairStyle: 'sideBun', pattern: 'stripe', hood: 'down',
      hairAcc: 'sportHeadband',
      hairpinBase: '#7a8490', hairpinInk: '#c8d0d8', hairpinAccent: '#ffe566',
      patternInk: 'rgba(40,50,60,0.35)', patternAccent: 'rgba(200,210,220,0.35)',
      props: [],
    },
    yifan_link_angel: { pairId: 'angel', hairStyle: 'default', hood: 'down', hairAcc: 'halo' },
    yifan_flip_tree: {
      // Hood down so the tree hat sits on hair like James (star lives on the tip).
      hairStyle: 'wavy', hood: 'down', pattern: 'treeOrnament',
      fabric: 'knit',
      hairpinBase: '#b8e848', hairpinInk: '#6a3a88', hairpinAccent: '#ffe566',
      patternInk: '#b8e848', patternAccent: '#ffe566',
      props: ['treeHat', 'treeStar', 'pompom'],
      worldFamily: ['flip'], worldRole: 'tree',
    },
    yifan_link_party: {
      hairStyle: 'bun', pattern: 'sequinDots', hood: 'up', fabric: 'gloss',
      props: ['pinkGems', 'hairHighlights', 'partyBlush', 'rimGlasses'],
      patternInk: '#ffffff', patternAccent: '#ff6ec7',
    },
    yifan_link_vacation: {
      pairId: 'vacation', hairStyle: 'longBraid', pattern: 'floral', hood: 'down',
      hairAcc: 'flowerPin',
      hairpinBase: '#ff90b0', hairpinInk: '#ffe8f0', hairpinAccent: '#ffe566',
      patternInk: 'rgba(255,180,200,0.55)', patternAccent: 'rgba(255,230,140,0.65)',
    },
    yifan_login_linger: {
      hairStyle: 'bangs', pattern: 'stripe', hood: 'down', hairAcc: 'clockPin',
      hairpinBase: '#204060', hairpinInk: '#f0f4f8', hairpinAccent: '#5ce1ff',
    },
    yifan_diary_soft: { hairStyle: 'bun', hairAcc: 'ribbon', pattern: 'knit', hood: 'down' },
    yifan_sulk_ribbon: { pairId: 'couple_pout', hairStyle: 'bun', hairAcc: 'ribbon', pattern: 'snake', onesieForm: 'snake', hood: 'up', worldFamily: ['love'], worldRole: 'pout' },
  };

  function loreFor(o) {
    const u = o.unlock || {};
    let howEn = 'Always in the closet.';
    let howZh = '一开始就在衣橱里。';
    if (u.type === 'season') {
      const sn = { spring: ['Spring limited.', '春天限定。'], summer: ['Summer limited.', '夏天限定。'], autumn: ['Autumn limited.', '秋天限定。'], winter: ['Winter limited.', '冬天限定。'] };
      const s = sn[u.season] || ['Season limited.', '当季限定。'];
      howEn = s[0]; howZh = s[1];
    } else if (u.type === 'birthday') {
      howEn = u.who === 'yifan' ? 'Her birthday · once' : 'His birthday · once';
      howZh = u.who === 'yifan' ? '她的生日 · 一次' : '他的生日 · 一次';
    } else if (u.type === 'festival') {
      if (u.festival === 'halloween') {
        howEn = 'Halloween week · once';
        howZh = '万圣周 · 一次';
      } else if (u.festival === 'christmas') {
        howEn = 'Christmas · once';
        howZh = '圣诞 · 一次';
      } else if (u.festival === 'founding') {
        howEn = 'Founding Day · once';
        howZh = '建城日 · 一次';
      } else {
        howEn = 'Festival · once';
        howZh = '节日 · 一次';
      }
    } else if (u.type === 'gameplay') {
      howEn = 'Clear that world once.'; howZh = '通关对应世界一次。';
    } else if (u.type === 'link') {
      howEn = 'Unlock James\' matching look first.'; howZh = '先解锁 James 对应服装。';
    } else if (u.type === 'event_shadow') {
      howEn = 'A story not written yet.'; howZh = '故事还没写到。';
    } else if (u.type === 'stat') {
      howEn = 'Earn it by living a little.'; howZh = '多过几天就会出现。';
    }
    const SPEC = {
      default_teal: ['Always in the closet.', '一开始就在衣橱里。', 'The teal he already was — before anyone asked him to dress up.', '他还没被要求打扮之前，就已经是这身青绿。'],
      season_spring: ['Spring limited.', '春天限定。', 'The first warm wind found him before the calendar did.', '暖风比日历先找到他。'],
      season_summer: ['Summer limited.', '夏天限定。', 'Long evenings that refuse to end, and he refuses to squint.', '不肯结束的夏夜，他也懒得眯眼。'],
      season_autumn: ['Autumn limited.', '秋天限定。', 'He wears autumn the way the trees do — like he meant it.', '他穿秋天的方式，像树一样认真。'],
      season_winter: ['Winter limited.', '冬天限定。', 'Quiet cold mornings that asked him to stay soft.', '安静的冷早晨，请他柔软一点。'],
      event_birthday_james: ['His birthday · once', '他的生日 · 一次', 'One day a year the city admits it is his.', '一年里有一天，城市承认这是他的。'],
      event_founding: ['Founding Day · once', '建城日 · 一次', 'He still carries the blueprint of the day the city began.', '建城那天的蓝图，他还揣在身上。'],
      yifan_event_founding: ['Founding Day · once', '建城日 · 一次', 'She dressed like she helped draw the first street.', '她穿得像亲手画过第一条街。'],
      work_clerk: ['Clear Work once.', '完成一次工作签字。', 'First day nerves that somehow never failed him.', '第一天的紧张，居然没让他出错。'],
      work_uniform: ['Clear Work once.', '完成一次工作签字。', 'First day nerves that somehow never failed him.', '第一天的紧张，居然没让他出错。'],
      work_manager: ['Sign five work clears.', '工作签字满 5 次。', 'The phone learned his pocket before he learned the title.', '电话先学会了他的口袋，他才学会那个头衔。'],
      work_ceo: ['Sign twelve times, or win Empire. Opens City business trip.', '签字 12 次，或赢一次 Empire。可开启城市出差。', 'The suitcase waits by his ankle like it already knows the route.', '行李箱停在脚踝边，像已经知道路线。'],
      work_pet_care: ['Finish the pet-care work route.', '完成宠物工装路线。', 'Tinkerbell decided the leash was a promise, not a tool.', 'Tinkerbell 认定牵引绳是承诺，不是工具。'],
      sport_kit: ['Clear a Football match once.', '完成一场足球比赛。', 'Grass still hiding in the cuffs from a match he finished.', '袖口还藏着那场踢完的草屑。'],
      sport_champion: ['Win Football three times.', '赢三场足球。', 'Three wins later, the cup still feels heavier than the crowd.', '赢了三场，奖杯仍比人群更沉。'],
      work_smudge_shirt: ['Fail the pet-care work route.', '宠物工装路线失败一次。', 'The mud kept every mistake so he would not have to.', '泥点替他记住每一次失手。'],
      business_trip_blazer: ['Take a City business trip once.', '从城市出发廊出一次差。', 'Packed light, looked serious, left a little of himself at the gate.', '行李很轻，表情很认真，在门口留了一点自己。'],
      trip_honor_sash: ['Shake on a deal three times.', '握手达成合作三次。', 'The sash still remembers that nod.', '绶带还记着点头的重量。'],
      drake_jacket: ['Leave Drake Party once.', '离开 Drake 派对一次。', 'Neon still stuck to the collar like a night that would not let go.', '霓虹还粘在领子上，像不肯放手的一夜。'],
      party_lounge_jacket: ['Pose lean in Drake.', '在 Drake 摆 lean。', 'Sofa light that followed him out of the lounge.', '沙发灯光跟他走出了休息室。'],
      party_encore: ['Leave Drake five times.', '离开 Drake 5 次。', 'Five exits later, the glitter still applauds.', '离开五次之后，亮片还在鼓掌。'],
      relax_spa_soft: ['Leave Relax once.', '离开 Relax 一次。', 'Steam wrapped his head so the day could not find him.', '蒸汽裹住他的头，好让今天找不到他。'],
      couple_glow: ['Finish Love once.', '完成 Love 一次。', 'Two yellow chicks — the night they decided to match on purpose.', '两只小鸡——他们决定故意穿成一对的那晚。'],
      couple_festival: ['Finish Love three times.', '完成 Love 三次。', 'Scarves that argue gently about which color loves harder.', '围巾轻轻争论：哪种颜色爱得更深。'],
      couple_pout: ['Make her dark-faced once in Love.', 'Love 里惹她黑脸一次。', 'A quiet apology that learned to wear scales.', '学会穿上鳞片的小声道歉。'],
      flip_invert_tee: ['Survive Flip once.', '在 Flip 活过一次。', 'The city flipped; so did he — and somehow he walked out smiling.', '城市翻转了，他也翻转了——居然还能笑着走出来。'],
      flip_tree_coat: ['Reach the Flip tree end.', '走到 Flip 树尽头。', 'At the end of the tree, a star finally sat on his hat.', '走到树的尽头，星星终于肯落在他帽上。'],
      flip_vampire_count: ['Be swallowed in Halloween Flip overload.', '万圣 Flip 过载中被吞噬。', 'The pumpkin flood swallowed him; he walked out in a black tailcoat that still remembered the red.', '南瓜蝠群把他吞进去；出来时是一件还记着红的黑燕尾服。'],
      flip_apple_onesie: ['Calm Christmas Flip rage into an apple, then leave with enough taps.', '圣诞 Flip 怒满变苹果后，点够次数离开。', 'Christmas pressed pause mid-storm — and left him round and red.', '圣诞在暴怒中途按下暂停，留他圆滚滚地红着。'],
      empire_suit_echo: ['Win Empire once.', '赢一次 Empire。', 'Paris lawn still in his stride after the win.', '赢了之后，步子里还留着巴黎草坪。'],
      empire_beggar: ['Fail Empire once.', 'Empire 失败一次。', 'He lost the empire and kept the bread — priorities.', '帝国没了，面包还在——分得清轻重。'],
      genewar_lab: ['Clear Gene War once.', '通关 Gene War 一次。', 'The beaker remembers which hypothesis almost worked.', '烧杯还记得哪个假说差点成功。'],
      genewar_bald: ['Lose Gene War once.', 'Gene War 失败一次。', "Didn't lose — won Dad's \"love\" completely.", '没输，赢得了爸爸的「爱」。'],
      joinus_welcome: ['Finish Join Us once.', '完成 Join Us 一次。', 'Top hat tipped like the city had just said his name.', '礼帽一掀，像城市刚喊了他的名字。'],
      joinus_mj_host: ['Finish Join Us ten times.', '完成 Join Us 10 次。', 'Ten welcomes later, the sash made him mayor of the moment.', '欢迎十次之后，绶带让他当上了这一刻的市长。'],
      event_cooking: ['A story not written yet.', '故事还没写到。', 'Waiting for a kitchen that has not opened its door.', '还在等那扇没开的厨房门。'],
      event_garden: ['A story not written yet.', '故事还没写到。', 'Wants dirt under the nails and a season to grow into.', '想让指甲缝进土，再等一个季节长开。'],
      event_camo: ['A story not written yet.', '故事还没写到。', 'A quieter plan wearing a quieter pattern.', '更安静的计划，穿着更安静的花纹。'],
      gym_training: ['Finish a gym set.', '完成一组健身。', 'Water in one hand, banana in the other — recovery as ritual.', '一手水一手香蕉，把恢复过成仪式。'],
      gym_pro: ['Hit a perfect gym set.', '打出完美健身组。', 'The set that finally felt honest.', '终于打得老实的那一组。'],
      vacation_breeze: ['Leave Vacation once.', '离开度假一次。', 'Yellow shades big enough to hide a whole holiday secret.', '黄墨镜够大，能藏住整个假期的秘密。'],
      event_vacation: ['Leave Vacation once.', '离开度假一次。', 'Sand still telling the pocket what the beach said.', '沙子还在口袋里复述海滩的话。'],
      city_lucky_angel: ['Find Super Lucky in the city.', '在城市里抽到超级幸运。', 'The day luck asked him to wear wings for a while.', '幸运请他暂时装上翅膀的那天。'],
      hermes_ribbon: ['Collect 16 fortune slips in the Clock Tower.', '在钟楼集齐 16 签。', 'A ribbon the messenger left behind.', '信使落下的一条丝带。'],
      city_explorer: ['Click any City building 100 times.', '点击任意城市建筑累计 100 次。', 'A hundred doors later, the sleeves still smelled like street wind.', '推开一百扇门之后，袖口还留着街风。'],
      gather_xmas_knit: ['Host Christmas gathering.', '办一次圣诞聚会。', 'He hosted Christmas and came home looking like the host.', '办完圣诞回家，人已经长成了主人的样子。'],
      gather_friends_night: ['Host Friends Night.', '办一次朋友夜。', 'Loud rooms taught him a black that could laugh back.', '吵房间教会他一件会回笑的黑。'],
      halloween_pumpkin: ['Halloween week · once', '万圣周 · 一次', 'He borrowed a grin from the porch and forgot to give it back.', '他从门廊借来一个笑，忘了还。'],
      yifan_halloween_pumpkin: ['Halloween week · once', '万圣周 · 一次', 'Hood up, stem proud — she decided to be the porch joke.', '帽子戴好、蒂朝天——她决定当今晚的门廊笑话。'],
      yifan_halloween_bat: ['Halloween week · once', '万圣周 · 一次', 'Not his bat wings — her hunter kit, worn to bring him home.', '不是陪他的蝙蝠翼，是来把他带回来的猎人装。'],
      login_linger: ['Stay online 30 minutes.', '累计在线 30 分钟。', 'Time sat on the collar until he noticed it was company.', '时间坐在领口上，直到他发现那是陪伴。'],
      diary_hours: ['Write 5 diary pages.', '写下 5 篇日记。', 'Five pages later, the knit still held the ink.', '五页之后，针脚里还留着墨。'],
      nude_duck: ['Sleep in the bath 3 times.', '泡澡睡去 3 次。', 'If he dozes in the bath, the duck keeps the secret.', '要是他在浴缸打盹，小鸭会守着秘密。'],
      pet_plush_pajama: ['Finish pet-care work.', '完成宠物工装路线。', 'Work ended; the triangle ears stayed for bedtime.', '工作结束了，三角耳留下来陪睡觉。'],
      yifan_default: ['Always in her closet.', '一开始就在衣橱里。', 'A little teal still lives in the hood — like his hello.', '帽子里还留着一点青绿，像他的招呼。'],
      yifan_birthday: ['Her birthday · once', '她的生日 · 一次', 'The day the room admits it is hers.', '房间承认这一天是她的。'],
      yifan_season_spring: ['Spring limited.', '春天限定。', 'A leaf pin for days the wind writes first.', '软风先动笔的日子，别着一片叶子。'],
      yifan_season_summer: ['Summer limited.', '夏天限定。', 'Hot light that still lets her breathe.', '再烫的光也肯让她透气。'],
      yifan_season_autumn: ['Autumn limited.', '秋天限定。', 'A maple pin catching the light as it falls.', '枫叶别针接住正在落下的光。'],
      yifan_season_winter: ['Winter limited.', '冬天限定。', 'A clip that keeps the warmth from wandering off.', '夹子不让暖意走丢。'],
      yifan_note_soft: ['Leave notes for her.', '给她写便条。', 'Pastel that still reads like his handwriting.', '浅色里还读得出他的字迹。'],
      yifan_photo_pastel: ['Look at her photos.', '看她的照片。', 'Hair ready — she was already posing for the memory.', '头发扎好了，她已经在为记忆摆姿势。'],
      yifan_care_knit: ['Tend her plant 5 times.', '照料她的植物 5 次。', 'Five waterings later, green learned her name.', '浇了五次水，绿色学会了她的名字。'],
      yifan_game_play: ['Play her quiet games 3 times.', '玩她的安静游戏 3 次。', 'Queen in one hand, letter A in the other — she plays to stay close.', '一手棋后一手字母 A——她用玩法挨近你。'],
      yifan_mail_ribbon: ['Open her mailbox.', '打开她的信箱。', 'A ribbon waiting for a letter that might be from him.', '丝带等着一封也许是他的信。'],
      yifan_calendar_day: ['Check her calendar.', '看她的日历。', 'Stripes for a day she already planned to keep.', '条纹属于她打算留住的那天。'],
      yifan_pet_paw: ['Play with her pet 5 times.', '和她的宠物玩 5 次。', 'Paw prints after five games — proof she stayed on the floor with them.', '玩了五次留下的爪印——她真的趴到了地板上。'],
      yifan_board_pin: ['Open her memory board 3 times.', '打开记忆展板 3 次。', 'A clip that never loses the note she meant to keep.', '从不丢掉她想留住的那张纸条。'],
      yifan_couple_glow: ['Finish Love once.', '完成 Love 一次。', 'She matched his chick on purpose — soft armor for a soft night.', '她故意穿成他的小鸡——柔软夜里的柔软盔甲。'],
      yifan_couple_festival: ['Finish Love three times.', '完成 Love 三次。', 'Blue scarf answering his red without raising her voice.', '蓝围巾应和他的红，却不必提高音量。'],
      yifan_football_sideline: ['Clear a football match.', '通关一场足球。', 'Sideline green — she watched him finish what he started.', '场边那点绿，是她看他踢完了开场的球。'],
      yifan_event_christmas: ['Host Christmas gathering.', '办一次圣诞聚会。', 'Mistletoe in her hair because she hosted the warmth.', '槲寄生别在发间，因为暖意是她张罗的。'],
      yifan_genewar_lab: ['Clear Gene War once.', '通关 Gene War 一次。', 'A folded contract pin — she stood through the hypothesis with him.', '折纸合同别针——假说一路，她都在。'],
      yifan_joinus_cohero: ['Finish Join Us once.', '完成 Join Us 一次。', 'Gold coins in her hair for the welcome that said both names.', '发间的金币，记着那次把两人都喊出来的欢迎。'],
      yifan_relax_soft: ['Leave Relax once.', '离开 Relax 一次。', 'Steam asked her hair to stay down a little longer.', '蒸汽请她的头发再垂一会儿。'],
      yifan_link_work_ceo: ['Unlock James\' CEO look first.', '先解锁 James 的 CEO 装。', 'She borrowed his seriousness and made it softer.', '她借走他的认真，再把它揉软一点。'],
      yifan_link_gym: ['Unlock James\' gym look first.', '先解锁 James 的健身装。', 'Side bun and a banana — training as a shared joke.', '单侧丸子配香蕉，把训练变成两人的笑话。'],
      yifan_link_angel: ['Unlock James\' lucky angel first.', '先解锁 James 的幸运天使装。', 'A halo soft enough to rest in her hair without waking the day.', '够软的光环，搁在发上也不会吵醒这一天。'],
      yifan_flip_tree: ['Unlock James\' tree-end coat first.', '先解锁 James 的树尽头外套。', 'Purple knit answering his green — a lime star for the same tree tip.', '紫针织应和他的绿——同一树尖，一颗青柠星。'],
      yifan_link_party: ['Unlock James\' party look first.', '先解锁 James 的派对装。', 'Dots that still hear the music after the room goes quiet.', '点点在房间安静后，还听得见音乐。'],
      yifan_link_vacation: ['Unlock James\' vacation look first.', '先解锁 James 的度假装。', 'A flower in the braid for the beach that kept their secret.', '辫子里的小花，记着海滩替他们守过的秘密。'],
      yifan_login_linger: ['Stay online 30 minutes.', '累计在线 30 分钟。', 'A tiny clock pin while she waits — time kept her company too.', '等待时别着小时钟——时间也陪着她。'],
      yifan_diary_soft: ['Write 5 diary pages.', '写下 5 篇日记。', 'A ribbon that slipped out of a page she meant to keep closed.', '丝带从她想合上的那一页里溜出来。'],
      yifan_sulk_ribbon: ['Make her dark-faced 3 times in Love.', 'Love 里惹她黑脸 3 次。', 'Ribbon still knotted shut — three sulks that have not forgiven yet.', '丝带还打着结，三次黑脸还没打算原谅。'],
    };
    const s = SPEC[o.id];
    let storyEn = (o.label?.en || o.id) + ' kept a soft day.';
    let storyZh = (o.label?.zh || o.id) + '。那天留得很轻。';
    if (o.who === 'yifan' && !s) {
      storyEn = 'Soft fabric with her kind of quiet.';
      storyZh = '她那种安静的布料感。';
    }
    return {
      how: { en: s ? s[0] : howEn, zh: s ? s[1] : howZh },
      story: { en: s ? s[2] : storyEn, zh: s ? s[3] : storyZh },
    };
  }

  CATALOG.forEach((o) => {
    const extra = OUTFIT_VARIETY[o.id] || {};
    if (extra.cut) o.cut = extra.cut;
    if (extra.hem) o.hem = extra.hem;
    if (extra.fabric) o.fabric = extra.fabric;
    if (extra.pattern && !o.pattern) o.pattern = extra.pattern;
    if (extra.props && !o.props) o.props = extra.props;
    if (extra.pairId) o.pairId = extra.pairId;
    if (extra.hairStyle) o.hairStyle = extra.hairStyle;
    if (extra.hairAcc) o.hairAcc = extra.hairAcc;
    if (extra.hood) o.hood = extra.hood;
    if (extra.hoodHairLong) o.hoodHairLong = true;
    if (extra.onesieForm && !o.onesieForm) o.onesieForm = extra.onesieForm;
    if (extra.hairStyle && !o.hairStyle) o.hairStyle = extra.hairStyle;
    if (extra.draw && !o.draw) o.draw = extra.draw;
    if (extra.faceAcc && !o.faceAcc) o.faceAcc = extra.faceAcc;
    if (extra.hairColor && !o.hairColor) o.hairColor = extra.hairColor;
    if (extra.onesieForm && !o.onesieForm) o.onesieForm = extra.onesieForm;
    if (extra.worldFamily && !o.worldFamily) o.worldFamily = extra.worldFamily;
    if (extra.worldRole && !o.worldRole) o.worldRole = extra.worldRole;
    if (extra.hairpinBase) o.hairpinBase = extra.hairpinBase;
    if (extra.hairpinInk) o.hairpinInk = extra.hairpinInk;
    if (extra.hairpinAccent) o.hairpinAccent = extra.hairpinAccent;
    if (extra.patternBase) o.patternBase = extra.patternBase;
    if (extra.patternInk) o.patternInk = extra.patternInk;
    if (extra.patternAccent) o.patternAccent = extra.patternAccent;
    if (extra.limbMesh) o.limbMesh = true;
    if (extra.props && o.props) {
      const merged = o.props.slice();
      extra.props.forEach((p) => { if (merged.indexOf(p) < 0) merged.push(p); });
      o.props = merged;
    }
    const L = loreFor(o);
    o.how = L.how;
    o.story = L.story;
  });

  const RETIRED_OUTFIT_IDS = Object.freeze({
    sport_star: 'sport_kit',
    couple_soft: 'couple_glow',
    event_couple: 'couple_glow',
    yifan_couple: 'yifan_couple_glow',
    relax_echo_robe: 'relax_spa_soft',
    work_burnout: 'work_smudge_shirt',
    party_neon_trim: 'party_encore',
    // Workout twin folded into Gym buddy (same athletic onesie lane).
    yifan_link_sport: 'yifan_link_gym',
    // Empty Empire echo removed — fall back to default onesie.
    yifan_link_empire: 'yifan_default',
  });

  function migrateEquippedId(id, fallback) {
    if (!id) return fallback;
    if (RETIRED_OUTFIT_IDS[id]) return RETIRED_OUTFIT_IDS[id];
    if (!getById(id)) return fallback;
    return id;
  }

  const FESTIVAL_OVERLAY = Object.freeze({
    christmas: {
      // Keep base outfits; accent with props only so characters stay recognizable.
      anonHuman: null,
      namedHuman: {
        fraser: { prop: 'mug' },
        gym: { prop: 'dumbbell_bow' },
        holiday: { prop: 'scarf' },
        steve: { prop: 'gift' },
        donna: { prop: 'earrings' },
        riley: { prop: 'phone' },
      },
      namedPet: {
        Tinkerbell: { bow: '#c04040', boots: false },
      },
    },
  });


  /** Halloween week: Oct 25–31 (inclusive). */
  function isHalloweenWeek(d = new Date()) {
    const m = d.getMonth();
    const day = d.getDate();
    return m === 9 && day >= 25 && day <= 31;
  }

  /** Christmas week: Dec 20–26. Late Dec / early Jan is New Year. */
  function isChristmasFestivalWindow(d = new Date()) {
    const m = d.getMonth();
    const day = d.getDate();
    return m === 11 && day >= 20 && day <= 26;
  }

  /** Sub-day title for Christmas Flip countdown. */
  function getChristmasFlipOccasion(d = new Date()) {
    const m = d.getMonth();
    const day = d.getDate();
    if (m === 11 && day === 24) return 'eve';
    if (m === 11 && day === 25) return 'day';
    if (m === 11 && day === 26) return 'boxing';
    return 'season';
  }

  function isFoundingDay(d = new Date()) {
    try {
      if (global.__holidayDebug && global.__holidayDebug.foundingForced) return true;
    } catch (_) { /* ignore */ }
    try {
      const flags = global.NVC_GATHERINGS && global.NVC_GATHERINGS.getDebugFlags && global.NVC_GATHERINGS.getDebugFlags();
      if (flags && flags.founding) return true;
    } catch (_) { /* ignore */ }
    return d.getMonth() === 4 && d.getDate() === 20;
  }

  function isFestivalActive(festId, d = new Date()) {
    if (festId === 'halloween') return isHalloweenWeek(d);
    if (festId === 'christmas') return isChristmasFestivalWindow(d);
    if (festId === 'founding') return isFoundingDay(d);
    return false;
  }

  function seasonOfDate(d) {
    const m = d.getMonth();
    if (m === 11 || m <= 1) return 'winter';
    if (m <= 4) return 'spring';
    if (m <= 7) return 'summer';
    return 'autumn';
  }

  function freshStats() {
    return {
      logins: 0,
      activeDays: {},
      clears: {
        workSign: 0, workPetClear: 0, workPetFail: 0, empireWin: 0, empireFail: 0,
        footballMatch: 0, footballWin: 0,
        drakeLeave: 0, drakePoseLean: 0, drakePoseArch: 0, drakePoseInvert: 0, drakePoseAll: 0,
        relaxLeave: 0,
        loveEnter: 0, loveComplete: 0,
        flipSurvive: 0, flipTreeEnd: 0, flipHalloweenSwallow: 0, flipAppleCalm: 0,
        genewarClear: 0, joinusClear: 0,
        gymSet: 0, gymPerfect: 0,
        vacationLeave: 0, cityDiscover: 0, cityBuildingClicks: 0, citySuperLucky: 0, cityFortuneAlbum: 0,
        gatherXmas: 0, gatherFriends: 0,
        sessionMinutes: 0, diaryNotes: 0, genewarFail: 0, relaxSleep: 0,
        workFail: 0, loveMiss: 0, businessTrip: 0,
      },
      yifanUse: {
        notes: 0, photos: 0, care: 0, games: 0,
        mailbox: 0, calendar: 0, pet: 0, board: 0,
      },
    };
  }

  function mergeStats(raw) {
    const base = freshStats();
    if (!raw || typeof raw !== 'object') return base;
    base.logins = Math.max(0, raw.logins | 0);
    base.activeDays = raw.activeDays && typeof raw.activeDays === 'object' ? raw.activeDays : {};
    Object.keys(base.clears).forEach((k) => {
      if (raw.clears && raw.clears[k] != null) base.clears[k] = Math.max(0, raw.clears[k] | 0);
    });
    Object.keys(base.yifanUse).forEach((k) => {
      if (raw.yifanUse && raw.yifanUse[k] != null) base.yifanUse[k] = Math.max(0, raw.yifanUse[k] | 0);
    });
    return base;
  }

  /**
   * One-shot migration marker. v3 wiped festival / gather / apple unlocks and clears —
   * too aggressive for live saves. v4 only drops tree coat without a supporting clear,
   * never zeros clears, and never strips festival/birthday/gather/apple outfits.
   */
  const PREVIEW_UNLOCK_PURGE_KEY = 'neovelvet_outfits_preview_purge_v4';
  const PREVIEW_UNLOCK_PURGE_LEGACY_V3 = 'neovelvet_outfits_preview_purge_v3';

  function purgePreviewUnlockPollution(unlocked, equipped, yifanEquipped, stats) {
    try {
      if (localStorage.getItem(PREVIEW_UNLOCK_PURGE_KEY) === '1') {
        return { unlocked, equipped, yifanEquipped, dirty: false };
      }
    } catch (_) { /* ignore */ }
    // v3 already ran once — do not wipe again; just seal v4.
    try {
      if (localStorage.getItem(PREVIEW_UNLOCK_PURGE_LEGACY_V3) === '1') {
        try { localStorage.setItem(PREVIEW_UNLOCK_PURGE_KEY, '1'); } catch (_) { /* ignore */ }
        return { unlocked, equipped, yifanEquipped, dirty: false };
      }
    } catch (_) { /* ignore */ }

    const clears = (stats && stats.clears) || {};
    let eq = equipped;
    let yeq = yifanEquipped;
    let dirty = false;
    // Safe-only: tree coat without flipTreeEnd was preview pollution.
    if (!(clears.flipTreeEnd > 0) && unlocked.flip_tree_coat) {
      delete unlocked.flip_tree_coat;
      dirty = true;
      if (eq === 'flip_tree_coat') { eq = 'default_teal'; dirty = true; }
    }
    try { localStorage.setItem(PREVIEW_UNLOCK_PURGE_KEY, '1'); } catch (_) { /* ignore */ }
    return { unlocked, equipped: eq, yifanEquipped: yeq, dirty };
  }

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw || typeof raw !== 'object') {
        try { localStorage.setItem(PREVIEW_UNLOCK_PURGE_KEY, '1'); } catch (_) { /* ignore */ }
        return {
          unlocked: { default_teal: true, yifan_default: true },
          equipped: 'default_teal',
          yifanEquipped: 'yifan_default',
          parents: {},
          stats: freshStats(),
        };
      }
      const unlocked = raw.unlocked && typeof raw.unlocked === 'object' ? raw.unlocked : {};
      unlocked.default_teal = true;
      unlocked.yifan_default = true;
      // migrate old drake clear → leave alias
      if (unlocked.drake_jacket) unlocked.party_lounge_jacket = true;
      // Workout twin folded into Gym buddy
      if (unlocked.yifan_link_sport) unlocked.yifan_link_gym = true;
      let equipped = typeof raw.equipped === 'string' ? raw.equipped : 'default_teal';
      let yifanEquipped = typeof raw.yifanEquipped === 'string' ? raw.yifanEquipped : 'yifan_default';
      equipped = migrateEquippedId(equipped, 'default_teal');
      yifanEquipped = migrateEquippedId(yifanEquipped, 'yifan_default');
      const stats = mergeStats(raw.stats);
      const purged = purgePreviewUnlockPollution(unlocked, equipped, yifanEquipped, stats);
      equipped = purged.equipped;
      yifanEquipped = purged.yifanEquipped;
      // Wearing an outfit implies it was unlocked; recover if the flag was lost.
      if (equipped) unlocked[equipped] = true;
      if (yifanEquipped) unlocked[yifanEquipped] = true;
      // Drop retired catalog ids from unlock map (keep harmless if missing).
      Object.keys(RETIRED_OUTFIT_IDS).forEach((rid) => { delete unlocked[rid]; });
      return {
        unlocked,
        equipped,
        yifanEquipped,
        parents: raw.parents && typeof raw.parents === 'object' ? raw.parents : {},
        stats,
        _previewPurgeDirty: !!purged.dirty,
      };
    } catch (_) {
      return {
        unlocked: { default_teal: true, yifan_default: true },
        equipped: 'default_teal',
        yifanEquipped: 'yifan_default',
        parents: {},
        stats: freshStats(),
      };
    }
  }

  let state = loadState();
  let onSaveError = null;
  if (state._previewPurgeDirty) {
    delete state._previewPurgeDirty;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* ignore */ }
  } else {
    delete state._previewPurgeDirty;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      try { if (typeof onSaveError === 'function') onSaveError(err); } catch (_) { /* ignore */ }
    }
  }

  function getById(id) {
    return CATALOG.find((o) => o.id === id) || null;
  }

  function isBirthdayToday(who, d = new Date()) {
    const b = who === 'yifan' ? YIFAN_BIRTHDAY : JAMES_BIRTHDAY;
    return d.getMonth() === b.month && d.getDate() === b.day;
  }

  function getStatPath(path) {
    if (!path) return 0;
    const parts = String(path).split('.');
    let cur = state.stats;
    for (let i = 0; i < parts.length; i++) {
      if (!cur || typeof cur !== 'object') return 0;
      cur = cur[parts[i]];
    }
    return Math.max(0, cur | 0);
  }

  function syncDrakePoseAll() {
    const c = state.stats.clears;
    if ((c.drakePoseLean | 0) > 0 && (c.drakePoseArch | 0) > 0 && (c.drakePoseInvert | 0) > 0) {
      c.drakePoseAll = Math.max(1, c.drakePoseAll | 0);
    }
  }

  function outfitStatus(id, d = new Date()) {
    const o = getById(id);
    if (!o) return 'silhouette';
    if (state.unlocked[id] || (o.unlock && o.unlock.type === 'always')) return 'wearable';
    const u = o.unlock || {};
    if (u.type === 'season') {
      return seasonOfDate(d) === u.season ? 'unlockable' : 'silhouette';
    }
    if (u.type === 'festival') {
      return isFestivalActive(u.festival, d) ? 'unlockable' : 'silhouette';
    }
    if (u.type === 'birthday') {
      return isBirthdayToday(u.who, d) ? 'unlockable' : 'silhouette';
    }
    if (u.type === 'event_shadow') {
      return 'silhouette';
    }
    if (u.type === 'gameplay' || u.type === 'stat' || u.type === 'link') {
      return 'silhouette';
    }
    return 'silhouette';
  }

  function canUnlockOutfit(o) {
    if (!o) return false;
    if (state.unlocked[o.id] || o.unlock?.type === 'always') return true;
    const u = o.unlock || {};
    if (u.type === 'event_shadow') return false;
    if (u.type === 'gameplay') return !!state.unlocked[o.id];
    if (u.type === 'stat') return meetsStatUnlock(u);
    if (u.type === 'link') return !!(u.outfitId && state.unlocked[u.outfitId]);
    if (u.type === 'season') return seasonOfDate(new Date()) === u.season;
    if (u.type === 'festival') return isFestivalActive(u.festival);
    if (u.type === 'birthday') return isBirthdayToday(u.who);
    return false;
  }

  function unlockOutfit(id) {
    const o = getById(id);
    if (!o) return false;
    if (o.unlock?.type === 'event_shadow') return false;
    if (state.unlocked[id]) return true;
    if (!canUnlockOutfit(o)) return false;
    state.unlocked[id] = true;
    saveState();
    return true;
  }

  function unlockGameplay(world, clear) {
    // Map legacy song_or_burst → leave
    const clears = clear === 'song_or_burst' ? ['leave', 'song_or_burst'] : [clear];
    if (world === 'drake' && (clear === 'leave' || clear === 'song_or_burst')) {
      bumpClear('drakeLeave', 1);
    }
    if (world === 'work' && clear === 'signed') bumpClear('workSign', 1);
    if (world === 'football' && clear === 'match') bumpClear('footballMatch', 1);
    if (world === 'relax' && clear === 'left') bumpClear('relaxLeave', 1);

    let any = false;
    CATALOG.forEach((o) => {
      if (o.unlock?.type === 'gameplay' && o.unlock.world === world) {
        if (!clear || clears.includes(o.unlock.clear) || clear === 'any') {
          state.unlocked[o.id] = true;
          any = true;
        }
      }
    });
    evaluateUnlocks();
    if (any) saveState();
    return any;
  }

  function markParentEvent(parentId) {
    state.parents[parentId] = true;
    if (parentId === 'couple') bumpClear('loveEnter', 1);
    if (parentId === 'vacation') bumpClear('vacationLeave', 1);
    evaluateUnlocks();
    saveState();
  }

  function bumpClear(key, n = 1) {
    if (!state.stats.clears || typeof state.stats.clears !== 'object') state.stats.clears = freshStats().clears;
    if (state.stats.clears[key] == null) state.stats.clears[key] = 0;
    state.stats.clears[key] = (state.stats.clears[key] | 0) + (n | 0);
    syncDrakePoseAll();
    evaluateUnlocks();
    saveState();
  }

  function bumpYifanUse(key, n = 1) {
    if (!state.stats.yifanUse || typeof state.stats.yifanUse !== 'object') state.stats.yifanUse = freshStats().yifanUse;
    if (state.stats.yifanUse[key] == null) state.stats.yifanUse[key] = 0;
    state.stats.yifanUse[key] = (state.stats.yifanUse[key] | 0) + (n | 0);
    evaluateUnlocks();
    saveState();
  }

  function bumpDrakePose(poseId) {
    if (poseId === 'lean') bumpClear('drakePoseLean', 1);
    else if (poseId === 'arch') bumpClear('drakePoseArch', 1);
    else if (poseId === 'invert') bumpClear('drakePoseInvert', 1);
  }

  function meetsStatUnlock(u) {
    const v = getStatPath(u.path);
    if (v >= (u.min | 0)) return true;
    if (u.orPath) {
      const ov = getStatPath(u.orPath);
      if (ov >= (u.orMin | 0)) return true;
    }
    return false;
  }

  function evaluateUnlocks() {
    syncDrakePoseAll();
    let any = false;
    CATALOG.forEach((o) => {
      if (state.unlocked[o.id]) return;
      const u = o.unlock || {};
      if (u.type === 'always') {
        state.unlocked[o.id] = true;
        any = true;
        return;
      }
      if (u.type === 'stat' && meetsStatUnlock(u)) {
        state.unlocked[o.id] = true;
        any = true;
        return;
      }
      if (u.type === 'link' && u.outfitId && state.unlocked[u.outfitId]) {
        state.unlocked[o.id] = true;
        any = true;
        return;
      }
      if (u.type === 'festival' && isFestivalActive(u.festival)) {
        state.unlocked[o.id] = true;
        any = true;
        return;
      }
      if (u.type === 'birthday' && isBirthdayToday(u.who)) {
        state.unlocked[o.id] = true;
        any = true;
      }
    });
    ['equipped', 'yifanEquipped'].forEach((k) => {
      const id = state[k];
      const o = getById(id);
      if (id && o && o.unlock?.type !== 'event_shadow' && !state.unlocked[id]) {
        state.unlocked[id] = true;
        any = true;
      }
    });
    if (any) saveState();
    return any;
  }

  function equipJames(id) {
    if (outfitStatus(id) !== 'wearable' && !state.unlocked[id] && id !== 'default_teal') return false;
    if (!state.unlocked[id] && id !== 'default_teal') return false;
    state.equipped = id;
    saveState();
    return true;
  }

  function getEquippedJames() {
    const o = getById(state.equipped);
    if (o && (state.unlocked[o.id] || o.unlock?.type === 'always')) return o;
    return getById('default_teal');
  }

  function equipYifan(id) {
    const o = getById(id);
    if (!o || o.who !== 'yifan') return false;
    if (outfitStatus(id) !== 'wearable' && !state.unlocked[id] && id !== 'yifan_default') return false;
    if (!state.unlocked[id] && id !== 'yifan_default') return false;
    state.yifanEquipped = id;
    saveState();
    return true;
  }

  function getEquippedYifan() {
    const o = getById(state.yifanEquipped);
    if (o && o.who === 'yifan' && (state.unlocked[o.id] || o.unlock?.type === 'always')) return o;
    return getById('yifan_default');
  }

  /** Love triad only — vacation/angel pairIds must not trigger Love couple skins. */
  const LOVE_PAIR_IDS = Object.freeze(['couple_glow', 'couple_festival', 'couple_pout']);

  function getLovePairLooks() {
    const james = getEquippedJames();
    const yifan = getEquippedYifan();
    if (
      james && yifan
      && james.pairId && james.pairId === yifan.pairId
      && LOVE_PAIR_IDS.indexOf(james.pairId) >= 0
    ) {
      return { paired: true, pairId: james.pairId, james, yifan };
    }
    return { paired: false, james, yifan };
  }

  function outfitAffectsWorld(outfit, worldId) {
    if (!outfit || !worldId) return false;
    const fam = outfit.worldFamily;
    return Array.isArray(fam) && fam.indexOf(worldId) >= 0;
  }

  /** First unlocked wearable for who with matching worldFamily (prefer equipped). */
  function findUnlockedWorldOutfit(who, worldId) {
    if (!who || !worldId) return null;
    const eq = who === 'yifan' ? getEquippedYifan() : getEquippedJames();
    if (eq && outfitAffectsWorld(eq, worldId) && outfitStatus(eq.id) === 'wearable') return eq;
    for (let i = 0; i < CATALOG.length; i++) {
      const o = CATALOG[i];
      if (o.who !== who) continue;
      if (!outfitAffectsWorld(o, worldId)) continue;
      if (!(state.unlocked[o.id] || o.unlock?.type === 'always')) continue;
      if (outfitStatus(o.id) !== 'wearable') continue;
      return o;
    }
    return null;
  }

  /** World-draw override: equipped functional outfit for this world, or null = use world default skin. */
  function resolveWorldOutfit(who, worldId) {
    const o = who === 'yifan' ? getEquippedYifan() : getEquippedJames();
    if (!o) {
      return who === 'yifan' ? findUnlockedWorldOutfit('yifan', worldId) : null;
    }
    if (who !== 'yifan' && o.id === 'default_teal') return null;
    if (who === 'yifan' && o.id === 'yifan_default') {
      return findUnlockedWorldOutfit('yifan', worldId);
    }
    if (outfitAffectsWorld(o, worldId)) return o;
    // Football fallback: sport kit/champion always map even if worldFamily was stripped.
    if (worldId === 'football' && who !== 'yifan'
      && (o.id === 'sport_champion' || o.id === 'sport_kit'
        || o.worldRole === 'champion' || o.worldRole === 'kit'
        || o.draw === 'sport')) {
      return o;
    }
    // Yifan scene roles: unlocked world outfit when current wear is unrelated.
    if (who === 'yifan') return findUnlockedWorldOutfit('yifan', worldId);
    return null;
  }

  function noteLoginDay() {
    const key = new Date().toISOString().slice(0, 10);
    if (!state.stats.activeDays[key]) {
      state.stats.activeDays[key] = 1;
      state.stats.logins = (state.stats.logins | 0) + 1;
      saveState();
    }
  }
  noteLoginDay();

  let sessionMinuteAt = Date.now();
  function tickSessionMinutes() {
    const now = Date.now();
    const elapsed = now - sessionMinuteAt;
    if (elapsed < 60000) return;
    const n = Math.floor(elapsed / 60000);
    sessionMinuteAt += n * 60000;
    bumpClear('sessionMinutes', n);
  }

  function resolveOnesiePalette(outfit) {
    if (!outfit) return DEFAULT_COUPLE_PALETTE;
    if (outfit.onesiePalette) return outfit.onesiePalette;
    if (outfit.onesie) return tintPalette(outfit.onesie, { hi: outfit.onesie, lo: outfit.onesie });
    return DEFAULT_COUPLE_PALETTE;
  }

  function listForWho(who) {
    return CATALOG.filter((o) => {
      if (o.who !== who) return false;
      if (o.hideInCloset) return false;
      if (o.unlock?.type === 'event_shadow') return false;
      return true;
    });
  }

  function getFestivalOverlay(festId) {
    return FESTIVAL_OVERLAY[festId] || null;
  }

  // Initial evaluate for migrated stats
  evaluateUnlocks();

  global.NVC_OUTFITS = {
    STORAGE_KEY,
    JAMES_BIRTHDAY,
    YIFAN_BIRTHDAY,
    CATALOG,
    FESTIVAL_OVERLAY,
    DEFAULT_COUPLE_PALETTE,
    seasonOfDate,
    isHalloweenWeek,
    isChristmasFestivalWindow,
    getChristmasFlipOccasion,
    isFestivalActive,
    isFoundingDay,
    getById,
    outfitStatus,
    unlockOutfit,
    unlockGameplay,
    markParentEvent,
    equipJames,
    getEquippedJames,
    equipYifan,
    getEquippedYifan,
    resolveOnesiePalette,
    listForWho,
    getFestivalOverlay,
    isBirthdayToday,
    bumpClear,
    bumpYifanUse,
    bumpDrakePose,
    evaluateUnlocks,
    getStatPath,
    getLovePairLooks,
    outfitAffectsWorld,
    resolveWorldOutfit,
    findUnlockedWorldOutfit,
    noteLoginDay,
    tickSessionMinutes,
    getState: () => state,
    reload: () => { state = loadState(); evaluateUnlocks(); },
    setOnSaveError: (fn) => { onSaveError = typeof fn === 'function' ? fn : null; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
