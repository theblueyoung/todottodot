// 토닥토닥 — 다국어 문자열 (기본: 한국어, 영어 버전 준비)
// 새 언어를 추가하려면 STRINGS에 같은 키로 객체를 추가하면 됩니다.

const STRINGS = {
  ko: {
    appName: '토닥토닥',
    tagline: '오늘의 나에서 시작해요',
    introTitle: '지금 그대로의 나에서\n시작해요.\n조금씩, 같이\n방 밖으로 나가 봐요.',
    introSub: '작은 미션을 하면 내 캐릭터도 함께 자라요',
    introCta: '나의 캐릭터 만들기',

    createTitle: '나를 닮은 캐릭터',
    createSub: '성별 칸은 없어요. 원하는 모습 그대로 골라 주세요.',
    name: '이름',
    namePh: '불리고 싶은 이름',
    pronoun: '어떻게 불러 줄까요?',
    pronouns: { name: '이름으로만', they: '그들 (they)', she: '그녀 (she)', he: '그 (he)', custom: '직접 입력' },
    pronounCustomPh: '예: ze/zir',
    skin: '피부톤',
    hairStyle: '헤어',
    hairColor: '머리색',
    body: '체형',
    bodies: { slim: '마른', mid: '보통', round: '통통' },
    top: '옷 색',
    extras: '포인트',
    extraNames: { glasses: '안경', freckles: '주근깨', earring: '귀걸이', pin: '무지개 핀', headphones: '헤드폰', blush: '볼터치' },
    hairs: { short: '숏컷', buzz: '버즈컷', long: '롱헤어', bob: '단발', curly: '곱슬', bun: '똥머리', mohawk: '모히칸', hijab: '히잡', beanie: '비니' },
    randomize: '랜덤',
    createDone: '이 모습으로 시작하기',

    // stages
    stages: [
      { title: '아직 움츠러든 나', sub: '나의 작은 방 구석' },
      { title: '고개를 드는 나', sub: '커튼 틈으로 빛이 들어와요' },
      { title: '조금씩 자라는 용기', sub: '창문을 열어 봤어요' },
      { title: '내 공간을 아끼는 나', sub: '방도 마음도 정돈되는 중' },
      { title: '세상 밖으로 나아간 나', sub: '함께 걷는 사람들이 생겼어요' },
    ],
    stageSpeech: [
      '...여기 있는 게 편해.\n그래도, 딱 하나만 같이 해 볼래?',
      '어제보다 아주 조금\n덜 무거운 것 같아.',
      '창문 여니까 바람이 좋다!\n오늘도 같이 해 보자.',
      '정돈된 방에 있으니\n나도 꽤 괜찮은 사람 같아.',
      '밖에 나오길 잘했어.\n우리 정말 많이 왔다!',
    ],

    // home
    level: 'Level',
    esteem: '자존감',
    energy: '에너지',
    connect: '연결감',
    streak: '연속 {n}일',
    todayMood: '오늘 마음은 어때요?',
    moods: ['많이 힘듦', '가라앉음', '그럭저럭', '괜찮음', '좋음'],
    moodReply: [
      '힘든 날엔 아주 작은 것 하나면 충분해요. 숨 쉬기부터 해 볼까요?',
      '가라앉은 날이네요. 물 한 잔부터 같이 해요.',
      '그럭저럭인 날도 소중해요. 하나만 해 볼까요?',
      '괜찮은 날! 방 청소로 기분을 더 올려 봐요.',
      '좋은 날이에요! 오늘은 조금 용기 내 볼까요?',
    ],
    recommended: '지금 추천',
    todayMissions: '오늘의 미션',
    done: '완료',
    locked: 'Lv.{n}에 열려요',
    min: '{n}분',
    tabs: { home: '홈', missions: '미션', log: '기록', me: '나' },

    // missions
    missions: {
      mirror: { name: '거울 보고 말하기', desc: '아침에 거울 속 나에게 "나는 할 수 있어" 말해 주기', cta: '거울 앞에 서기', running: '거울 속 나를 보고\n소리 내어 말해 봐요.' },
      clean: { name: '15분 방 청소', desc: '캐릭터와 같이 딱 15분만 방 치우기', cta: '나랑 같이 방 청소하기', running: '지금은 스마트폰을 잠시 내려놓고,\n진짜 내 방의 쓰레기를 줍거나\n옷을 개어 보세요!\n캐릭터가 함께하고 있어요.' },
      breathe: { name: '3분 숨 고르기', desc: '원을 따라 천천히 들이쉬고 내쉬기', cta: '같이 숨 쉬기', running: '원이 커지면 들이쉬고,\n작아지면 내쉬어요.' },
      water: { name: '물 한 잔', desc: '지금 물 한 잔 마시기', cta: '물 마시러 가기', running: '천천히, 한 모금씩.\n몸도 나를 챙겨 주는 걸 느껴 봐요.' },
      sun: { name: '창문 열고 햇볕 쬐기', desc: '5분간 창문 열고 바깥 공기 마시기', cta: '창문 열기', running: '창문을 열고 바깥 공기를\n깊게 들이마셔 봐요.' },
      stretch: { name: '5분 스트레칭', desc: '굳은 몸을 쭉 펴기', cta: '같이 스트레칭', running: '어깨를 돌리고, 팔을 쭉!\n캐릭터를 따라 해 봐요.' },
      praise: { name: '나 칭찬 일기', desc: '오늘 잘한 일 3가지 적기 (아주 작아도 OK)', cta: '칭찬 적기', running: '' },
      walk: { name: '10분 산책', desc: '집 앞까지라도 나가서 걷기', cta: '같이 나가기', running: '폰은 주머니에 넣고,\n하늘 한 번 올려다보기!' },
      hello: { name: '안부 한 줄 보내기', desc: '누군가에게 짧은 안부 메시지 보내기', cta: '용기 내기', running: '"잘 지내?" 한 줄이면 충분해요.\n보내고 나서 완료를 눌러요.' },
      meetup: { name: '작은 모임 가 보기', desc: '동네 모임·운동·수업에 한 번 참여해 보기', cta: '나가 볼래', running: '가서 인사 한 번만 해도 성공이에요.\n다녀와서 완료를 눌러요.' },
    },

    // running
    withMe: '나도 {c}도 같이 하는 중',
    stop: '멈추기',
    pause: '잠깐 쉬기',
    resume: '계속하기',
    finishEarly: '다 했어요!',
    giveUpTitle: '여기까지만 해도 괜찮아요',
    giveUpSub: '시작한 것만으로도 대단해요. 조금이라도 기록할까요?',
    giveUpKeep: '조금 했어요 (+절반)',
    giveUpQuit: '그냥 닫기',

    // mirror
    mirrorPick: '오늘 나에게 해 줄 말',
    affirmations: [
      '나는 할 수 있어.',
      '나는 지금 이대로도 충분해.',
      '오늘 하루도 잘 해낼 거야.',
      '천천히 가도 괜찮아.',
      '나는 사랑받을 자격이 있어.',
      '실수해도 나는 여전히 소중해.',
    ],
    mirrorCustomPh: '내가 듣고 싶은 말 직접 쓰기',
    mirrorCam: '카메라 거울 켜기',
    mirrorCamOff: '카메라 끄기',
    mirrorSpeak: '말해서 인식하기 🎤',
    mirrorListening: '듣고 있어요…',
    mirrorHeard: '들었어요: "{t}"',
    mirrorSaid: '소리 내서 말했어요',
    mirrorCount: '{n} / 3번 말했어요',
    mirrorTip: '3번 반복하면 완료! 작게 말해도 괜찮아요.',
    camDenied: '카메라를 쓸 수 없어요. 진짜 거울을 봐도 좋아요!',

    // praise
    praiseTitle: '오늘 잘한 일 3가지',
    praisePh: ['예: 일어나서 세수했다', '예: 밥을 챙겨 먹었다', '예: 이 앱을 켰다 :)'],
    praiseSave: '저장하고 완료하기',

    // complete
    completeTitle: '완료!',
    completeMsg: [
      '와, 정말 개운해요!\n방도, 내 마음도 한결 깨끗해졌어요.',
      '해냈어요! 작은 한 걸음이\n큰 변화를 만들어요.',
      '오늘의 나, 정말 멋져요.\n캐릭터도 웃고 있어요!',
    ],
    bonus: '보너스 {stat} +{n}%',
    levelUp: 'LEVEL UP!',
    stageUp: '새로운 장면이 열렸어요!',
    completeCta: '개운하게 완료하기',

    // log
    logTitle: '나의 기록',
    logStats: '지금까지',
    totalDone: '완료한 미션',
    bestStreak: '최장 연속',
    days: '{n}일',
    times: '{n}회',
    praiseLog: '칭찬 일기',
    praiseEmpty: '아직 칭찬 일기가 없어요. 미션에서 적어 볼까요?',
    affirmLog: '내가 나에게 한 말',
    week: ['일', '월', '화', '수', '목', '금', '토'],

    // me / settings
    meTitle: '나',
    editChar: '캐릭터 수정',
    language: '언어 / Language',
    reminder: '아침 거울 알림',
    reminderSoon: '앱 버전에서 제공 예정',
    resetAll: '처음부터 다시 시작',
    resetConfirm: '모든 기록이 지워져요. 정말 처음부터 시작할까요?',
    demoLevel: '데모: 레벨 미리보기',
    help: '도움이 필요할 때',
    helpText: '많이 힘들 땐 혼자 버티지 않아도 돼요.\n자살예방상담 109 · 정신건강위기상담 1577-0199',
    save: '저장',
    cancel: '취소',
    friendsSay: ['같이 뛸래?', '안녕!', '오늘 날씨 좋다', '반가워!'],
  },

  en: {
    appName: 'todottodot',
    tagline: 'Start where you are today',
    introTitle: 'Start from who\nyou are right now.\nLittle by little,\nlet\'s step outside.',
    introSub: 'Small missions help your character grow with you',
    introCta: 'Create my character',

    createTitle: 'A character like me',
    createSub: 'No gender box here. Pick whatever feels like you.',
    name: 'Name',
    namePh: 'What should we call you?',
    pronoun: 'Pronouns',
    pronouns: { name: 'Just my name', they: 'they/them', she: 'she/her', he: 'he/him', custom: 'Custom' },
    pronounCustomPh: 'e.g. ze/zir',
    skin: 'Skin tone',
    hairStyle: 'Hair',
    hairColor: 'Hair color',
    body: 'Body',
    bodies: { slim: 'Slim', mid: 'Medium', round: 'Round' },
    top: 'Outfit',
    extras: 'Extras',
    extraNames: { glasses: 'Glasses', freckles: 'Freckles', earring: 'Earring', pin: 'Rainbow pin', headphones: 'Headphones', blush: 'Blush' },
    hairs: { short: 'Short', buzz: 'Buzz', long: 'Long', bob: 'Bob', curly: 'Curly', bun: 'Bun', mohawk: 'Mohawk', hijab: 'Hijab', beanie: 'Beanie' },
    randomize: 'Random',
    createDone: 'Start as this me',

    stages: [
      { title: 'Still curled up', sub: 'A small corner of my room' },
      { title: 'Lifting my head', sub: 'Light through the curtains' },
      { title: 'Courage, growing', sub: 'I opened the window' },
      { title: 'Caring for my space', sub: 'Room and mind, tidying up' },
      { title: 'Out into the world', sub: 'People to walk with' },
    ],
    stageSpeech: [
      '...It feels safe here.\nBut could we try just one thing?',
      'I feel a tiny bit\nlighter than yesterday.',
      'The breeze feels nice!\nLet\'s do it together today.',
      'In a tidy room I feel like\na pretty okay person.',
      'So glad we came out.\nLook how far we\'ve come!',
    ],

    level: 'Level',
    esteem: 'Self-esteem',
    energy: 'Energy',
    connect: 'Connection',
    streak: '{n}-day streak',
    todayMood: 'How is your heart today?',
    moods: ['Really hard', 'Low', 'So-so', 'Okay', 'Good'],
    moodReply: [
      'On hard days one tiny thing is enough. Shall we just breathe?',
      'A low day. Let\'s start with a glass of water.',
      'So-so days count too. Just one thing?',
      'An okay day! A quick tidy might lift it more.',
      'A good day! Maybe try something a little brave?',
    ],
    recommended: 'Try now',
    todayMissions: 'Today\'s missions',
    done: 'Done',
    locked: 'Unlocks at Lv.{n}',
    min: '{n} min',
    tabs: { home: 'Home', missions: 'Missions', log: 'Log', me: 'Me' },

    missions: {
      mirror: { name: 'Mirror talk', desc: 'Tell the you in the mirror "I can do this"', cta: 'Stand at the mirror', running: 'Look at yourself\nand say it out loud.' },
      clean: { name: '15-min room tidy', desc: 'Tidy for just 15 minutes with your character', cta: 'Clean with me', running: 'Put your phone down for a bit,\npick up trash or fold clothes\nin your real room!\nYour character is with you.' },
      breathe: { name: '3-min breathing', desc: 'Breathe slowly with the circle', cta: 'Breathe together', running: 'Breathe in as it grows,\nout as it shrinks.' },
      water: { name: 'A glass of water', desc: 'Drink a glass of water now', cta: 'Go get water', running: 'Slowly, sip by sip.\nFeel yourself being cared for.' },
      sun: { name: 'Open the window', desc: 'Open the window and get fresh air for 5 min', cta: 'Open it', running: 'Open the window and\ntake a deep breath of air.' },
      stretch: { name: '5-min stretch', desc: 'Loosen up a stiff body', cta: 'Stretch together', running: 'Roll your shoulders, reach up!\nFollow your character.' },
      praise: { name: 'Praise journal', desc: 'Write 3 things you did well (tiny is OK)', cta: 'Write it', running: '' },
      walk: { name: '10-min walk', desc: 'Step outside, even just to the door', cta: 'Go out together', running: 'Phone in pocket,\nlook up at the sky once!' },
      hello: { name: 'Send a hello', desc: 'Send someone a short check-in message', cta: 'Be brave', running: '"How are you?" is enough.\nTap done after you send it.' },
      meetup: { name: 'Try a small meetup', desc: 'Join a local group, class or workout once', cta: 'I\'ll go', running: 'Just saying hi counts.\nTap done when you\'re back.' },
    },

    withMe: 'Me & {c}, together',
    stop: 'Stop',
    pause: 'Pause',
    resume: 'Resume',
    finishEarly: 'I did it!',
    giveUpTitle: 'It\'s okay to stop here',
    giveUpSub: 'Starting was already great. Log a little?',
    giveUpKeep: 'I did some (+half)',
    giveUpQuit: 'Just close',

    mirrorPick: 'Words for me today',
    affirmations: [
      'I can do this.',
      'I am enough as I am.',
      'I will get through today.',
      'It\'s okay to go slow.',
      'I deserve to be loved.',
      'Even when I mess up, I matter.',
    ],
    mirrorCustomPh: 'Write the words you want to hear',
    mirrorCam: 'Use camera mirror',
    mirrorCamOff: 'Camera off',
    mirrorSpeak: 'Say it (voice) 🎤',
    mirrorListening: 'Listening…',
    mirrorHeard: 'Heard: "{t}"',
    mirrorSaid: 'I said it out loud',
    mirrorCount: 'Said {n} / 3 times',
    mirrorTip: 'Repeat 3 times to finish. Quietly is fine.',
    camDenied: 'Camera unavailable. A real mirror works too!',

    praiseTitle: '3 things I did well',
    praisePh: ['e.g. I washed my face', 'e.g. I ate a meal', 'e.g. I opened this app :)'],
    praiseSave: 'Save & finish',

    completeTitle: 'Done!',
    completeMsg: [
      'That feels so fresh!\nMy room and my mind are clearer.',
      'You did it! Small steps\nmake big changes.',
      'Today\'s you is amazing.\nYour character is smiling!',
    ],
    bonus: 'Bonus {stat} +{n}%',
    levelUp: 'LEVEL UP!',
    stageUp: 'A new scene unlocked!',
    completeCta: 'Finish feeling fresh',

    logTitle: 'My log',
    logStats: 'So far',
    totalDone: 'Missions done',
    bestStreak: 'Best streak',
    days: '{n} days',
    times: '{n}',
    praiseLog: 'Praise journal',
    praiseEmpty: 'No entries yet. Try it from missions!',
    affirmLog: 'Words I told myself',
    week: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

    meTitle: 'Me',
    editChar: 'Edit character',
    language: 'Language / 언어',
    reminder: 'Morning mirror reminder',
    reminderSoon: 'Coming in the app version',
    resetAll: 'Start over',
    resetConfirm: 'All records will be erased. Start over?',
    demoLevel: 'Demo: preview levels',
    help: 'If you need help',
    helpText: 'You don\'t have to hold on alone.\nPlease reach out to a local crisis line.',
    save: 'Save',
    cancel: 'Cancel',
    friendsSay: ['Wanna jog?', 'Hi!', 'Nice day!', 'Good to see you!'],
  },
};

let LANG = 'ko';

function setLang(l) { LANG = STRINGS[l] ? l : 'ko'; document.documentElement.lang = LANG; }

// t('missions.clean.name', {n: 3})
function t(key, vars) {
  let v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), STRINGS[LANG]);
  if (v == null) v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), STRINGS.ko);
  if (typeof v === 'string' && vars) {
    v = v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : ''));
  }
  return v;
}
