/**
 * Limited Family / Friends gathering registry for James Space.
 * Each entry can be opened by date; Christmas / friends night are starters.
 */
(function (global) {
  'use strict';

  let debugForceFamily = false;
  let debugForceFriends = false;
  let debugForceBirthdayJames = false;
  let debugForceBirthdayYifan = false;
  let debugForceFounding = false;

  const GATHERINGS = Object.freeze([
    {
      id: 'christmas_family_table',
      cast: 'family',
      festivalOverlay: 'christmas',
      guests: ['steve', 'donna', 'riley'],
      furniture: {
        id: 'family_table',
        label: { en: 'Family table', zh: '家庭餐桌' },
        nx: 0.72,
        ny: 0.62,
        w: 0.14,
        h: 0.08,
      },
      beat: {
        kind: 'dialogue',
        durationMs: 28000,
        lines: {
          en: [
            { who: 'donna', text: 'Sit. The roast is still warm.' },
            { who: 'steve', text: 'Lights look good this year.' },
            { who: 'riley', text: 'You are my superstar!!! Pass the potatoes.' },
            { who: 'donna', text: 'Holiday Guy is out. Tonight is ours.' },
            { who: 'james', text: '…mm. Thanks for cooking.' },
            { who: 'steve', text: 'Eat. Talk later.' },
          ],
          zh: [
            { who: 'donna', text: '坐。烤肉还热着。' },
            { who: 'steve', text: '今年的灯不错。' },
            { who: 'riley', text: '你是我的超级明星！！！把土豆递过来。' },
            { who: 'donna', text: 'Holiday Guy 不在。今晚是家里的。' },
            { who: 'james', text: '……嗯。谢谢做饭。' },
            { who: 'steve', text: '先吃。一会儿再聊。' },
          ],
        },
      },
      diary: {
        en: { title: 'Christmas table', body: 'Christmas dinner at home. Holiday Guy isn\'t here. Family time.' },
        zh: { title: '圣诞桌', body: '圣诞在家里吃饭。Holiday Guy 不在。这是家庭时间。' },
      },
      outfitShadow: null,
      isOpen(d) {
        if (debugForceFamily) return true;
        const month = d.getMonth();
        const day = d.getDate();
        const hour = d.getHours();
        // Season gate: Christmas week Dec 20–26
        const inSeason = month === 11 && day >= 20 && day <= 26;
        if (!inSeason) return false;
        // Night gate: Christmas Eve evening + Christmas Day, or forced debug
        if (month === 11 && day === 25) return true;
        if (month === 11 && day === 24 && hour >= 16) return true;
        // Other nights in window: ~35% by year-day hash so it feels irregular
        const key = d.getFullYear() * 400 + month * 32 + day;
        return (key % 10) < 3.5;
      },
    },
    {
      id: 'friends_night_party',
      cast: 'friends',
      festivalOverlay: 'friends_night',
      guests: ['fraser', 'gym', 'holiday'],
      furniture: {
        id: 'friends_speaker',
        label: { en: 'Speaker', zh: '音箱' },
        nx: 0.28,
        ny: 0.58,
        w: 0.08,
        h: 0.1,
      },
      beat: {
        kind: 'clap',
        durationMs: 18000,
        goal: 8,
        lines: {
          en: [
            { who: 'fraser', text: 'Bass up. Come on.' },
            { who: 'gym', text: 'Fucking good.' },
            { who: 'holiday', text: 'I brought the lights. Obviously.' },
            { who: 'fraser', text: 'Clap on the drop — keep it alive.' },
            { who: 'james', text: '…ok. One more.' },
          ],
          zh: [
            { who: 'fraser', text: '贝斯拉高。来。' },
            { who: 'gym', text: 'Fucking good。' },
            { who: 'holiday', text: '灯我带了。当然。' },
            { who: 'fraser', text: '跟着拍——别掉。' },
            { who: 'james', text: '……行。再来一次。' },
          ],
        },
      },
      diary: {
        en: { title: 'Friends night', body: 'Fraser brought the speaker. We stayed up a little.' },
        zh: { title: '朋友夜', body: 'Fraser 带来了音箱。我们多待了一会儿。' },
      },
      outfitShadow: null,
      isOpen(d) {
        if (debugForceFriends) return true;
        if (typeof global.isChristmasFamilyLock === 'function' && global.isChristmasFamilyLock(d)) {
          return false;
        }
        const month = d.getMonth();
        // Music season Mar–May or summer Jun–Aug, weekend evenings only-ish
        const music = month >= 2 && month <= 4;
        const summer = month >= 5 && month <= 7;
        if (!music && !summer) return false;
        // Evening + late-night window only (18:00–02:59).
        const hour = d.getHours();
        const evening = hour >= 18 || hour <= 2;
        if (!evening) return false;
        const dow = d.getDay();
        const weekend = dow === 5 || dow === 6 || dow === 0;
        if (!weekend) return false;
        const key = d.getFullYear() * 400 + month * 32 + d.getDate();
        return (key % 7) < 3;
      },
    },
  ]);

  function getOpenGatherings(d = new Date()) {
    return GATHERINGS.filter((g) => {
      try {
        return !!g.isOpen(d);
      } catch (_) {
        return false;
      }
    });
  }

  function getGatheringById(id) {
    return GATHERINGS.find((g) => g.id === id) || null;
  }

  function setDebugFlags(flags) {
    if (!flags || typeof flags !== 'object') return;
    if (flags.family != null) debugForceFamily = !!flags.family;
    if (flags.friends != null) debugForceFriends = !!flags.friends;
    if (flags.birthdayJames != null) debugForceBirthdayJames = !!flags.birthdayJames;
    if (flags.birthdayYifan != null) debugForceBirthdayYifan = !!flags.birthdayYifan;
    if (flags.founding != null) debugForceFounding = !!flags.founding;
  }

  function getDebugFlags() {
    return {
      family: debugForceFamily,
      friends: debugForceFriends,
      birthdayJames: debugForceBirthdayJames,
      birthdayYifan: debugForceBirthdayYifan,
      founding: debugForceFounding,
    };
  }

  global.NVC_GATHERINGS = {
    GATHERINGS,
    getOpenGatherings,
    getGatheringById,
    setDebugFlags,
    getDebugFlags,
  };
})(typeof window !== 'undefined' ? window : globalThis);
