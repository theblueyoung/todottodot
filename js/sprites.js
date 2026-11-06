// 토닥토닥 — 레트로 픽셀 렌더러
// 모든 캐릭터·장면은 이미지 없이 코드로 그립니다 (캔버스 80x96 논리 픽셀 → CSS로 확대, pixelated).
// 캐릭터는 성별 구분 없이 피부톤 / 헤어 / 머리색 / 체형 / 옷 / 포인트 조합으로 만듭니다.

const PIX = {
  W: 80,
  H: 96,
  OUT: '#2e2440',
  SKIN: ['#fbe0cc', '#f3c9a0', '#e2ad7c', '#c68a5a', '#9a6440', '#6e452b', '#4a2e1d'],
  HAIR_COLORS: ['#2b2135', '#5a3825', '#a8683a', '#e8c66a', '#c4512f', '#c9c6d6', '#f39ac4', '#6aa8f0', '#9b7be0', '#6fcf9f'],
  TOPS: ['#9fb8d8', '#e88fb0', '#f5d36b', '#8fd1b5', '#b59be8', '#f0a070', '#5f6b8a', '#f4f1fa'],
  HAIRS: ['short', 'buzz', 'long', 'bob', 'curly', 'bun', 'mohawk', 'hijab', 'beanie'],
  BODIES: ['slim', 'mid', 'round'],
  EXTRAS: ['glasses', 'freckles', 'earring', 'pin', 'headphones', 'blush'],
  PANTS: '#4b4f78',
  SHOE: '#ecebf5',
};

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  return '#' + [f(r), f(g), f(b)].map((c) => c.toString(16).padStart(2, '0')).join('');
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomChar(seed) {
  const r = seed == null ? Math.random : rng(seed);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const extras = PIX.EXTRAS.filter(() => r() < 0.22);
  return {
    skin: Math.floor(r() * PIX.SKIN.length),
    hair: pick(PIX.HAIRS),
    hairColor: Math.floor(r() * PIX.HAIR_COLORS.length),
    body: pick(PIX.BODIES),
    top: Math.floor(r() * PIX.TOPS.length),
    extras,
  };
}

// ---------- 기본 그리기 도구 ----------
function R(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
function OB(ctx, x, y, w, h, c, o = PIX.OUT) { R(ctx, x - 1, y - 1, w + 2, h + 2, o); R(ctx, x, y, w, h, c); }
function line(ctx, x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  ctx.fillStyle = c;
  for (;;) {
    ctx.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
}
function heart(ctx, x, y, c) {
  R(ctx, x, y, 2, 1, c); R(ctx, x + 3, y, 2, 1, c);
  R(ctx, x - 1 + 1, y + 1, 5, 1, c); R(ctx, x + 1, y + 2, 3, 1, c); R(ctx, x + 2, y + 3, 1, 1, c);
}
function sparkle(ctx, x, y, c, big) {
  R(ctx, x, y - 1, 1, 3, c); R(ctx, x - 1, y, 3, 1, c);
  if (big) { R(ctx, x, y - 2, 1, 5, c); R(ctx, x - 2, y, 5, 1, c); }
}
function note(ctx, x, y, c) { R(ctx, x + 2, y, 1, 4, c); R(ctx, x + 2, y, 2, 1, c); R(ctx, x, y + 3, 2, 2, c); }

// ---------- 캐릭터 ----------
// cx: 몸 중심 x, fy: 발바닥 y
// opts: { pose, mood, frame, flip }
// pose: stand | crouch | sweep | cheer | stretch | drink | walk | sit | phone | wave
// mood: sad | neutral | smile | big | calm
function drawChar(ctx, ch, cx, fy, opts = {}) {
  const pose = opts.pose || 'stand';
  const mood = opts.mood || 'neutral';
  const f = opts.frame || 0;
  const skin = PIX.SKIN[ch.skin] || PIX.SKIN[1];
  const hairC = PIX.HAIR_COLORS[ch.hairColor] || PIX.HAIR_COLORS[0];
  const top = PIX.TOPS[ch.top] || PIX.TOPS[0];
  const topD = shade(top, -0.18);
  const b = ch.body === 'slim' ? -1 : ch.body === 'round' ? 1 : 0;
  const ex = new Set(ch.extras || []);

  ctx.save();
  if (opts.flip) { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }

  const parts = [];
  const hands = [];
  const add = (x, y, w, h, c) => parts.push([x, y, w, h, c]);
  let hx, hy; // 머리 상자 좌상단 (12x12)
  let broom = null;
  let prop = null;

  if (pose === 'crouch') {
    hx = cx - 6; hy = fy - 23;
    add(cx - 6 - b, fy - 15, 12 + 2 * b, 11, top); // 몸통 (무릎 뒤)
    add(cx - 5, fy - 11, 10, 9, PIX.PANTS); // 세운 무릎
    add(cx - 5, fy - 2, 4, 2, PIX.SHOE); add(cx + 1, fy - 2, 4, 2, PIX.SHOE);
    add(cx - 7 - b, fy - 10, 14 + 2 * b, 3, top); // 무릎을 감싼 팔
    hands.push([cx - 2, fy - 10, 2, 2], [cx, fy - 10, 2, 2]);
  } else if (pose === 'sit') {
    const bob = f % 2;
    hx = cx - 6; hy = fy - 25 - bob;
    add(cx - 5 - b, fy - 13 - bob, 10 + 2 * b, 9 + bob, top);
    add(cx - 9, fy - 5, 18, 4, PIX.PANTS); // 양반다리
    add(cx - 10, fy - 3, 3, 2, PIX.SHOE); add(cx + 7, fy - 3, 3, 2, PIX.SHOE);
    add(cx - 7 - b, fy - 12 - bob, 2, 7, top); add(cx + 5 + b, fy - 12 - bob, 2, 7, top);
    hands.push([cx - 8 - b, fy - 6, 2, 2], [cx + 6 + b, fy - 6, 2, 2]);
  } else {
    const walking = pose === 'walk';
    const bob = (pose === 'sweep' || walking || pose === 'cheer') && f % 2 ? 1 : 0;
    const oy = fy - 28 + bob;
    hx = cx - 6; hy = oy;
    // 다리
    if (walking && f % 2) {
      add(cx - 5, fy - 8, 3, 6, PIX.PANTS); add(cx + 2, fy - 8, 3, 5, PIX.PANTS);
      add(cx - 6, fy - 2, 4, 2, PIX.SHOE); add(cx + 2, fy - 3, 4, 2, PIX.SHOE);
    } else {
      add(cx - 4, fy - 8, 3, 6, PIX.PANTS); add(cx + 1, fy - 8, 3, 6, PIX.PANTS);
      add(cx - 5, fy - 2, 4, 2, PIX.SHOE); add(cx + 1, fy - 2, 4, 2, PIX.SHOE);
    }
    // 몸통
    add(cx - 5 - b, oy + 12, 10 + 2 * b, 9, top);
    const L = cx - 7 - b, Rx = cx + 5 + b;
    // 팔
    if (pose === 'cheer' || pose === 'wave') {
      add(L, oy + 13, 2, 7, top); hands.push([L, oy + 20, 2, 2]);
      const up = pose === 'wave' && f % 2 ? 1 : 0;
      add(Rx + up, oy + 5, 2, 8, top); hands.push([Rx + up, oy + 3, 2, 2]);
      if (pose === 'cheer') prop = 'thumb';
    } else if (pose === 'stretch') {
      if (f % 2) {
        add(L, oy + 1, 2, 12, top); add(Rx, oy + 1, 2, 12, top);
        hands.push([L, oy - 1, 2, 2], [Rx, oy - 1, 2, 2]);
      } else {
        add(L - 4, oy + 13, 6, 2, top); add(Rx, oy + 13, 6, 2, top);
        hands.push([L - 6, oy + 13, 2, 2], [Rx + 6, oy + 13, 2, 2]);
      }
    } else if (pose === 'sweep') {
      add(L, oy + 13, 2, 4, top); add(L + 1, oy + 16, 5, 2, top);
      add(Rx, oy + 13, 2, 3, top); add(Rx - 3, oy + 14, 3, 2, top);
      const sx = f % 2 ? -3 : -7;
      broom = [cx + 8, oy + 4, cx + sx, fy - 1];
      hands.push([cx + 1, oy + 14, 2, 2], [cx - 2 - (f % 2 ? 0 : 1), oy + 17, 2, 2]);
    } else if (pose === 'drink') {
      add(L, oy + 13, 2, 7, top); hands.push([L, oy + 20, 2, 2]);
      add(Rx, oy + 13, 2, 3, top); add(Rx - 2, oy + 9, 2, 5, top);
      hands.push([Rx - 3, oy + 8, 2, 2]);
      prop = 'cup';
    } else if (pose === 'phone') {
      add(L, oy + 13, 2, 7, top); hands.push([L, oy + 20, 2, 2]);
      add(Rx, oy + 13, 2, 3, top); add(Rx - 3, oy + 15, 4, 2, top);
      hands.push([Rx - 4, oy + 14, 2, 2]);
      prop = 'phone';
    } else if (walking) {
      add(L, oy + 13 + (f % 2), 2, 6, top); add(Rx, oy + 14 - (f % 2), 2, 6, top);
      hands.push([L, oy + 19 + (f % 2), 2, 2], [Rx, oy + 20 - (f % 2), 2, 2]);
    } else {
      add(L, oy + 13, 2, 7, top); add(Rx, oy + 13, 2, 7, top);
      hands.push([L, oy + 20, 2, 2], [Rx, oy + 20, 2, 2]);
    }
  }

  // 머리
  add(hx + 1, hy, 10, 12, skin);
  add(hx, hy + 1, 12, 10, skin);
  const hairParts = hairShape(ch.hair, hx, hy, cx);
  hairParts.back.forEach((p) => parts.unshift([...p, hairC]));
  hairParts.front.forEach((p) => add(...p, hairC));
  if (ch.hair === 'hijab') {
    add(hx + 2, hy + 3, 8, 8, skin); // 얼굴 부분
  }
  hands.forEach((h) => add(h[0], h[1], h[2], h[3], skin));

  // 외곽선 → 채우기
  ctx.fillStyle = PIX.OUT;
  parts.forEach((p) => ctx.fillRect(p[0] - 1, p[1] - 1, p[2] + 2, p[3] + 2));
  parts.forEach((p) => { ctx.fillStyle = p[4]; ctx.fillRect(p[0], p[1], p[2], p[3]); });

  // 음영 & 디테일
  if (pose !== 'crouch' && pose !== 'sit') {
    const oy = hy;
    R(ctx, cx - 5 - b, oy + 20, 10 + 2 * b, 1, topD);
    R(ctx, cx + 4 + b, oy + 13, 1, 7, topD);
    R(ctx, cx - 3, oy + 12, 6, 1, topD); // 후드 목
    R(ctx, cx - 2, oy + 13, 1, 2, shade(top, 0.5)); R(ctx, cx + 1, oy + 13, 1, 2, shade(top, 0.5));
    R(ctx, cx - 3, oy + 17, 6, 2, topD); // 주머니
    if (ex.has('pin')) {
      R(ctx, cx - 4 - b, oy + 14, 1, 1, '#e8505f'); R(ctx, cx - 3 - b, oy + 14, 1, 1, '#f5a14a');
      R(ctx, cx - 4 - b, oy + 15, 1, 1, '#f5d65a'); R(ctx, cx - 3 - b, oy + 15, 1, 1, '#5fc48a');
      R(ctx, cx - 4 - b, oy + 16, 1, 1, '#5fa0e8'); R(ctx, cx - 3 - b, oy + 16, 1, 1, '#a070e0');
    }
  } else if (pose === 'crouch') {
    R(ctx, cx - 5, fy - 4, 10, 1, shade(PIX.PANTS, -0.25));
    R(ctx, cx - 7 - b, fy - 8, 14 + 2 * b, 1, topD);
  }
  R(ctx, hx + 10, hy + 2, 1, 8, shade(skin, -0.1));

  if (broom) {
    line(ctx, broom[0], broom[1], broom[2], broom[3] - 3, '#8a5a34');
    OB(ctx, broom[2] - 3, broom[3] - 3, 7, 3, '#e8c06a');
    R(ctx, broom[2] - 3, broom[3] - 1, 7, 1, '#c89a4a');
    hands.forEach((h) => R(ctx, h[0], h[1], h[2], h[3], skin));
  }
  if (prop === 'cup') { OB(ctx, hx + 9, hy + 8, 3, 4, '#8fd0f0'); R(ctx, hx + 9, hy + 8, 3, 1, '#e8f8ff'); }
  if (prop === 'phone') { OB(ctx, cx + 1, hy + 12, 3, 5, '#3a3550'); R(ctx, cx + 2, hy + 13, 1, 3, '#9fe0ff'); }
  if (prop === 'thumb') { R(ctx, cx + 6 + b, hy + 2, 1, 1, skin); }

  drawFace(ctx, ch, hx, hy, cx, pose === 'crouch' ? 'sad' : mood, ex, skin);

  // 머리 위 액세서리
  if (ex.has('headphones') && ch.hair !== 'hijab') {
    R(ctx, hx - 1, hy - 2, 14, 1, '#e86a8a');
    OB(ctx, hx - 2, hy + 4, 2, 4, '#e86a8a'); OB(ctx, hx + 12, hy + 4, 2, 4, '#e86a8a');
  }
  ctx.restore();
}

function hairShape(style, hx, hy, cx) {
  const back = [], front = [];
  switch (style) {
    case 'buzz':
      front.push([hx + 1, hy - 1, 10, 3]);
      break;
    case 'long':
      back.push([hx - 1, hy + 2, 3, 13], [hx + 10, hy + 2, 3, 13]);
      front.push([hx, hy - 1, 12, 4], [hx, hy + 3, 2, 4], [hx + 10, hy + 3, 2, 4], [hx + 6, hy + 3, 3, 1]);
      break;
    case 'bob':
      front.push([hx - 1, hy - 1, 14, 4], [hx - 1, hy + 3, 3, 7], [hx + 10, hy + 3, 3, 7], [hx + 2, hy + 3, 8, 1]);
      break;
    case 'curly':
      front.push([hx - 2, hy - 3, 16, 6], [hx - 3, hy - 1, 18, 4], [hx - 2, hy + 3, 3, 6], [hx + 11, hy + 3, 3, 6], [hx + 3, hy + 3, 2, 1], [hx + 7, hy + 3, 2, 1]);
      break;
    case 'bun':
      front.push([cx - 2, hy - 5, 5, 4], [hx, hy - 1, 12, 4], [hx, hy + 3, 2, 3], [hx + 10, hy + 3, 2, 3]);
      break;
    case 'mohawk':
      front.push([cx - 1, hy - 5, 3, 7]);
      break;
    case 'hijab':
      back.push([hx - 2, hy + 9, 16, 5]);
      front.push([hx - 1, hy - 2, 14, 14]);
      break;
    case 'beanie':
      front.push([hx - 1, hy - 3, 14, 6], [cx - 1, hy - 5, 3, 2], [hx, hy + 3, 2, 3], [hx + 10, hy + 3, 2, 3]);
      break;
    case 'short':
    default:
      front.push([hx, hy - 1, 12, 4], [hx, hy + 3, 2, 3], [hx + 10, hy + 3, 2, 3], [hx + 2, hy + 3, 3, 1]);
  }
  return { back, front };
}

function drawFace(ctx, ch, hx, hy, cx, mood, ex, skin) {
  const E = '#2a2238';
  const ey = mood === 'sad' ? hy + 7 : hy + 6;
  if (ch.hair === 'beanie') R(ctx, hx - 1, hy + 2, 14, 1, shade(PIX.HAIR_COLORS[ch.hairColor] || '#555', 0.35));
  if (ch.hair === 'curly') { R(ctx, hx + 1, hy - 1, 1, 1, shade(PIX.HAIR_COLORS[ch.hairColor], 0.25)); R(ctx, hx + 6, hy - 2, 1, 1, shade(PIX.HAIR_COLORS[ch.hairColor], 0.25)); R(ctx, hx + 10, hy, 1, 1, shade(PIX.HAIR_COLORS[ch.hairColor], 0.25)); }
  if (mood === 'big') {
    R(ctx, cx - 4, ey, 1, 1, E); R(ctx, cx - 3, ey - 1, 1, 1, E); R(ctx, cx - 2, ey, 1, 1, E);
    R(ctx, cx + 1, ey, 1, 1, E); R(ctx, cx + 2, ey - 1, 1, 1, E); R(ctx, cx + 3, ey, 1, 1, E);
  } else if (mood === 'calm') {
    R(ctx, cx - 4, ey + 1, 2, 1, E); R(ctx, cx + 2, ey + 1, 2, 1, E);
  } else if (mood === 'down') {
    R(ctx, cx - 3, ey + 1, 1, 1, E); R(ctx, cx + 2, ey + 1, 1, 1, E);
  } else if (mood === 'sad') {
    R(ctx, cx - 3, ey, 1, 1, E); R(ctx, cx + 2, ey, 1, 1, E);
    R(ctx, cx - 4, ey - 1, 1, 1, E); R(ctx, cx - 3, ey - 2, 1, 1, E);
    R(ctx, cx + 2, ey - 2, 1, 1, E); R(ctx, cx + 3, ey - 1, 1, 1, E);
    R(ctx, cx + 3, ey + 1, 1, 1, '#8fd0f0'); // 눈물 한 방울
  } else {
    R(ctx, cx - 3, ey, 1, 2, E); R(ctx, cx + 2, ey, 1, 2, E);
  }
  const my = hy + 9;
  if (mood === 'sad') { R(ctx, cx - 1, my + 1, 2, 1, E); R(ctx, cx - 2, my + 2, 1, 1, E); R(ctx, cx + 1, my + 2, 1, 1, E); }
  else if (mood === 'smile' || mood === 'calm') { R(ctx, cx - 2, my, 1, 1, E); R(ctx, cx + 1, my, 1, 1, E); R(ctx, cx - 1, my + 1, 2, 1, E); }
  else if (mood === 'big') { R(ctx, cx - 2, my, 4, 2, E); R(ctx, cx - 1, my + 1, 2, 1, '#f07890'); }
  else R(ctx, cx - 1, my, 2, 1, E);

  if (ex.has('blush') || mood === 'big' || mood === 'smile') {
    R(ctx, cx - 5, hy + 8, 2, 1, '#f4a0b0'); R(ctx, cx + 3, hy + 8, 2, 1, '#f4a0b0');
  }
  if (ex.has('freckles')) {
    const fc = shade(skin, -0.3);
    R(ctx, cx - 4, hy + 8, 1, 1, fc); R(ctx, cx - 3, hy + 9, 1, 1, fc); R(ctx, cx + 3, hy + 8, 1, 1, fc); R(ctx, cx + 2, hy + 9, 1, 1, fc);
  }
  if (ex.has('glasses')) {
    const g = '#3a3050';
    const fr = (x, y) => { R(ctx, x, y, 4, 1, g); R(ctx, x, y + 3, 4, 1, g); R(ctx, x, y, 1, 4, g); R(ctx, x + 3, y, 1, 4, g); };
    fr(cx - 5, hy + 5); fr(cx + 1, hy + 5); R(ctx, cx - 1, hy + 6, 2, 1, g);
  }
  if (ex.has('earring') && ch.hair !== 'hijab') R(ctx, hx - 1, hy + 8, 1, 2, '#f5d36b');
}

// ---------- 장면 ----------
const ROOM = {
  wall: ['#4d4f7e', '#6a6f9e', '#93a0d2', '#c4b3e2'],
  wallLine: ['#45467228', '#ffffff14', '#ffffff1c', '#ffffff26'],
  floor: ['#5f4f72', '#7a6888', '#b49ab4', '#e0b2c2'],
};

const CLUTTER = [
  ['bag', 3, 66], ['paper', 30, 86], ['clothes', 56, 80], ['paper', 10, 88], ['can', 48, 88],
  ['bag', 68, 70], ['paper', 62, 90], ['box', 64, 56], ['paper', 22, 78], ['clothes', 4, 82],
  ['paper', 44, 78], ['can', 18, 92],
];

function drawClutter(ctx, mess) {
  const n = Math.round(CLUTTER.length * Math.max(0, Math.min(1, mess)));
  for (let i = CLUTTER.length - 1; i >= CLUTTER.length - n; i--) {
    const [type, x, y] = CLUTTER[i];
    if (type === 'paper') { OB(ctx, x, y, 6, 3, '#f2eef8'); R(ctx, x + 1, y + 1, 3, 1, '#c8c0d8'); }
    else if (type === 'bag') { OB(ctx, x, y, 10, 9, '#3f3c58'); R(ctx, x + 1, y - 1, 8, 1, '#3f3c58'); OB(ctx, x + 3, y - 4, 4, 2, '#3f3c58'); R(ctx, x + 2, y + 1, 2, 3, '#5d5a7c'); }
    else if (type === 'clothes') { OB(ctx, x, y, 10, 3, '#c86a8a'); OB(ctx, x + 2, y - 2, 6, 2, '#7fb0d8'); }
    else if (type === 'can') { OB(ctx, x, y, 2, 3, '#c8d0e0'); R(ctx, x, y, 2, 1, '#e86a6a'); }
    else if (type === 'box') { OB(ctx, x, y, 12, 8, '#c89a6a'); R(ctx, x, y + 3, 12, 1, '#a87a4a'); }
  }
}

function drawRoom(ctx, stage, t, o = {}) {
  const s = Math.min(stage, 3);
  const W = PIX.W, H = PIX.H, fl = 62;
  R(ctx, 0, 0, W, fl, ROOM.wall[s]);
  for (let x = 4; x < W; x += 8) R(ctx, x, 0, 1, fl, ROOM.wallLine[s]);
  R(ctx, 0, 0, 4, fl, shade(ROOM.wall[s], -0.15)); // 구석
  R(ctx, 0, fl, W, H - fl, ROOM.floor[s]);
  for (let y = fl + 6; y < H; y += 7) R(ctx, 0, y, W, 1, shade(ROOM.floor[s], -0.08));
  R(ctx, 0, fl - 2, W, 2, shade(ROOM.wall[s], -0.25));

  // 창문
  const wx = 42, wy = 10, ww = 28, wh = 26;
  const sky = s === 0 ? '#3b3f6a' : s === 1 ? '#8fb4e0' : s === 2 ? '#a8d0f4' : '#f6c4d4';
  OB(ctx, wx, wy, ww, wh, '#e8e4f0');
  R(ctx, wx + 2, wy + 2, ww - 4, wh - 4, sky);
  if (s >= 3) { R(ctx, wx + 2, wy + 12, ww - 4, 5, '#f8d8b0'); R(ctx, wx + 2, wy + 17, ww - 4, 5, '#d8b4e0'); }
  if (s >= 2) { R(ctx, wx + 5, wy + 16, 5, 3, '#ffffff'); R(ctx, wx + 7, wy + 15, 4, 1, '#ffffff'); }
  if (s <= 1) { R(ctx, wx + ww / 2 - 1, wy + 2, 2, wh - 4, '#e8e4f0'); R(ctx, wx + 2, wy + wh / 2 - 1, ww - 4, 2, '#e8e4f0'); }
  // 커튼
  const cur = s === 0 ? '#3f3462' : s === 1 ? '#7a6aa8' : '#f0b8cc';
  const gap = s === 0 ? 0 : s === 1 ? 8 : 18;
  const cw = (ww + 4 - gap) / 2;
  OB(ctx, wx - 2, wy - 2, cw, wh + 6, cur); OB(ctx, wx + ww + 2 - cw, wy - 2, cw, wh + 6, cur);
  for (let i = 2; i < cw - 1; i += 3) { R(ctx, wx - 2 + i, wy - 2, 1, wh + 6, shade(cur, -0.15)); R(ctx, wx + ww + 2 - cw + i, wy - 2, 1, wh + 6, shade(cur, -0.15)); }
  R(ctx, wx - 4, wy - 4, ww + 8, 2, '#8a7aa0');
  if (s >= 2) { // 창틀 화분
    OB(ctx, wx + 3, wy + wh - 4, 4, 3, '#d8805a'); R(ctx, wx + 3, wy + wh - 8, 1, 4, '#5fb07a'); R(ctx, wx + 5, wy + wh - 9, 2, 5, '#6fc48a');
    if (s >= 3) { OB(ctx, wx + 20, wy + wh - 4, 4, 3, '#e0a0c0'); R(ctx, wx + 21, wy + wh - 8, 2, 4, '#7fcf9a'); }
  }

  // 벽 포스터 / 선반
  if (s === 0) { OB(ctx, 9, 12, 11, 14, '#7a7098'); R(ctx, 16, 22, 4, 4, ROOM.wall[0]); }
  else if (s < 3) { OB(ctx, 9, 12, 12, 15, '#e8c8d8'); R(ctx, 11, 15, 8, 6, '#9ab8e8'); sparkle(ctx, 15, 18, '#fff4b0'); }
  else {
    OB(ctx, 6, 10, 12, 14, '#ffe6a8'); R(ctx, 8, 12, 8, 8, '#f8a8c0'); heart(ctx, 9, 14, '#ffffff');
    OB(ctx, 2, 32, 26, 2, '#b07a58');
    const bc = ['#e86a8a', '#6aa8f0', '#f5d36b', '#8fd1b5', '#b59be8'];
    bc.forEach((c, i) => OB(ctx, 4 + i * 3, 25, 2, 7, c));
    OB(ctx, 21, 28, 4, 4, '#d8805a'); R(ctx, 22, 24, 2, 4, '#6fc48a');
  }

  // 침대 / 매트리스
  if (s <= 1) { OB(ctx, 54, 74, 26, 8, '#585478'); OB(ctx, 58, 71, 12, 4, '#7a74a0'); }
  else { OB(ctx, 52, 62, 30, 14, '#c89a7a'); OB(ctx, 52, 60, 30, 7, s >= 3 ? '#f4d8e8' : '#c8c8e8'); OB(ctx, 72, 56, 9, 5, '#ffffff'); R(ctx, 52, 70, 30, 2, '#a87a5a'); }
  if (s >= 3) { OB(ctx, 26, 82, 26, 7, '#f8c8d8'); R(ctx, 28, 84, 22, 1, '#ffe0ea'); R(ctx, 28, 86, 22, 1, '#ffe0ea'); }

  // 햇살
  if (s >= 1) {
    const a = [0, 0.1, 0.16, 0.18][s];
    ctx.fillStyle = `rgba(255,244,210,${a})`;
    for (let y = wy + wh; y < H; y++) {
      const k = (y - wy - wh) / (H - wy - wh);
      const x0 = Math.round(wx + 2 - k * 18), x1 = Math.round(wx + ww - 2 - k * 6);
      ctx.fillRect(x0, y, x1 - x0, 1);
    }
  }

  drawClutter(ctx, o.mess != null ? o.mess : [1, 0.75, 0.4, 0][s]);

  // 먼지 / 반짝이
  if (s >= 1) {
    const r = rng(7);
    for (let i = 0; i < 6 + s * 3; i++) {
      const x = (r() * 40 + 24 + Math.sin(t / 900 + i) * 3) | 0;
      const y = (((r() * 60 + t / (60 + i * 7)) % 60) + 36) | 0;
      R(ctx, x, y, 1, 1, s >= 2 ? '#fff6c8' : '#c8c8f0');
    }
  }
  if (s >= 3 && o.notes !== false) {
    const k = (t / 1200) % 1;
    note(ctx, 30 + Math.sin(t / 500) * 2, 40 - k * 14, '#ffffff');
    note(ctx, 70 - Math.sin(t / 600) * 2, 44 - ((k + 0.5) % 1) * 14, '#f8a8d0');
  }
}

function drawOutdoor(ctx, t, o = {}) {
  const W = PIX.W, H = PIX.H;
  const bands = ['#9cc4f0', '#a8c8f2', '#b8c8f0', '#c8c4ee', '#d8c0e8', '#ecc4dc', '#f6cad6'];
  bands.forEach((c, i) => R(ctx, 0, i * 7, W, 7, c));
  // 해
  OB(ctx, 58, 8, 8, 8, '#fff2b0', '#f8d890'); R(ctx, 57, 10, 10, 4, '#fff2b0');
  // 구름
  const scroll = o.scroll || 0;
  const cloud = (x, y) => { x = ((x - t / 140 - scroll * 0.2) % (W + 30) + W + 30) % (W + 30) - 20; R(ctx, x, y, 14, 3, '#ffffff'); R(ctx, x + 3, y - 2, 7, 2, '#ffffff'); };
  cloud(10, 12); cloud(50, 22); cloud(80, 6);
  // 건물
  const bx = -((scroll * 0.4) % 80);
  [0, 80].forEach((off) => {
    [[2, 30, 10], [14, 24, 12], [28, 34, 9], [40, 28, 11], [54, 22, 10], [66, 32, 12]].forEach(([x, y, w]) => {
      R(ctx, bx + off + x, y, w, 50 - y, '#b4a8dc');
      for (let yy = y + 3; yy < 46; yy += 4) for (let xx = 2; xx < w - 1; xx += 3) R(ctx, bx + off + x + xx, yy, 1, 2, '#d8d0f4');
    });
  });
  // 나무
  const tx = -((scroll * 0.8) % 80);
  [0, 80].forEach((off) => {
    [[6, 46], [30, 44], [56, 47], [74, 45]].forEach(([x, y]) => {
      R(ctx, tx + off + x + 3, y + 6, 2, 6, '#8a6a5a');
      OB(ctx, tx + off + x, y, 8, 7, '#7cc4a0'); R(ctx, tx + off + x + 1, y - 2, 6, 2, '#7cc4a0'); R(ctx, tx + off + x + 1, y + 1, 2, 2, '#a0dcbc');
    });
  });
  // 잔디 / 길
  R(ctx, 0, 56, W, H - 56, '#a8dca8');
  for (let y = 60; y < H; y += 6) for (let x = (y % 12 === 0 ? 0 : 3) - ((scroll | 0) % 6); x < W; x += 6) R(ctx, x, y, 1, 2, '#8cc890');
  R(ctx, 0, 74, W, 10, '#eadcd0'); R(ctx, 0, 74, W, 1, '#d4c4b8'); R(ctx, 0, 83, W, 1, '#d4c4b8');
  // 꽃
  for (let i = 0; i < 8; i++) { const x = ((i * 23 + 7 - scroll) % W + W) % W; R(ctx, x, 62 + (i % 3) * 4, 1, 1, ['#f8a8c8', '#fff2a0', '#ffffff'][i % 3]); }
  if (!o.noBench) { const x = 4; OB(ctx, x, 62, 16, 2, '#c89a7a'); R(ctx, x + 1, 64, 1, 4, '#8a6a5a'); R(ctx, x + 14, 64, 1, 4, '#8a6a5a'); OB(ctx, x, 58, 16, 2, '#c89a7a'); }
}

const NPCS = [randomChar(11), randomChar(23), randomChar(37), randomChar(41), randomChar(58), randomChar(64)];
NPCS[1].hair = 'hijab'; NPCS[2].hair = 'curly'; NPCS[3].extras = ['pin', 'glasses']; NPCS[4].hair = 'mohawk';
NPCS[0].skin = 5; NPCS[2].skin = 6; NPCS[4].skin = 0; NPCS[5].skin = 3;

function bubble(ctx, x, y, kind) {
  OB(ctx, x, y, 9, 6, '#ffffff'); R(ctx, x + 2, y + 6, 2, 1, PIX.OUT); R(ctx, x + 2, y + 5, 2, 1, '#ffffff');
  if (kind === 'heart') heart(ctx, x + 2, y + 1, '#f07890');
  else { R(ctx, x + 2, y + 2, 1, 1, PIX.OUT); R(ctx, x + 4, y + 2, 1, 1, PIX.OUT); R(ctx, x + 6, y + 2, 1, 1, PIX.OUT); }
}

// ---------- 장면 컨트롤러 ----------
// cfg(): { char, stage, scene, pose, mood, mess, celebrate, progress }
class Scene {
  constructor(canvas, cfg) {
    this.c = canvas; this.ctx = canvas.getContext('2d'); this.cfg = cfg;
    canvas.width = PIX.W; canvas.height = PIX.H;
    this.confetti = [];
  }
  draw(t) {
    const ctx = this.ctx, c = this.cfg();
    if (!c || !c.char) return;
    const f = Math.floor(t / 380) % 2;
    ctx.clearRect(0, 0, PIX.W, PIX.H);
    const ch = c.char;
    const scene = c.scene || (c.stage >= 4 ? 'outdoor' : 'room');

    if (scene === 'room' || scene === 'mirror' || scene === 'window') {
      drawRoom(ctx, c.stage, t, { mess: c.mess });
      if (scene === 'mirror') {
        OB(ctx, 6, 30, 18, 32, '#e8d8a8');
        R(ctx, 8, 32, 14, 28, '#cfe4f4'); R(ctx, 9, 33, 2, 8, '#ffffff');
        ctx.save(); ctx.beginPath(); ctx.rect(8, 32, 14, 28); ctx.clip();
        ctx.globalAlpha = 0.75; drawChar(ctx, ch, 15, 66, { pose: 'stand', mood: c.mood, frame: 0, flip: true }); ctx.globalAlpha = 1;
        ctx.restore();
        drawChar(ctx, ch, 40, 88, { pose: c.pose || 'stand', mood: c.mood, frame: f });
        if (c.celebrate !== false) sparkle(ctx, 30, 40 + (f ? 1 : 0), '#fff4b0', true);
      } else {
        const pose = c.pose || (c.stage === 0 ? 'crouch' : 'stand');
        const cx = pose === 'crouch' ? 18 : scene === 'window' ? 52 : 36;
        const fy = pose === 'crouch' ? 76 : scene === 'window' ? 84 : 88;
        drawChar(ctx, ch, cx, fy, { pose, mood: c.mood, frame: f });
        if (pose === 'sweep') {
          for (let i = 0; i < 3; i++) { const k = ((t / 300 + i * 0.33) % 1); R(ctx, cx - 10 - k * 6, 86 - k * 5, 1, 1, '#ffffffaa'); }
        }
      }
      if (c.stage === 0 && !c.scene) { // 어두운 비네팅
        ctx.fillStyle = 'rgba(20,12,40,0.22)'; ctx.fillRect(0, 0, PIX.W, PIX.H);
      }
    } else if (scene === 'walk') {
      drawOutdoor(ctx, t, { scroll: t / 40 });
      drawChar(ctx, NPCS[0], 66, 88, { pose: 'walk', mood: 'smile', frame: f });
      drawChar(ctx, ch, 34, 84, { pose: 'walk', mood: 'smile', frame: f });
    } else { // outdoor / meetup
      drawOutdoor(ctx, t, {});
      const meet = scene === 'meetup';
      const jx = ((t / 70) % 120) - 20;
      if (!meet) {
        drawChar(ctx, NPCS[0], jx, 84, { pose: 'walk', mood: 'smile', frame: f });
        drawChar(ctx, NPCS[1], 8, 70, { pose: 'stand', mood: 'smile', frame: f });
        drawChar(ctx, NPCS[2], 19, 71, { pose: 'wave', mood: 'big', frame: f, flip: true });
        bubble(ctx, 3, 36, 'heart');
        drawChar(ctx, NPCS[3], 68, 70, { pose: 'stretch', mood: 'smile', frame: f });
        drawChar(ctx, ch, 40, 92, { pose: c.pose || 'cheer', mood: c.mood || 'big', frame: f });
      } else {
        const ring = [[14, 72, 1], [28, 68, 2], [52, 68, 3], [66, 72, 4], [10, 90, 5]];
        ring.forEach(([x, y, i], k) => drawChar(ctx, NPCS[i], x, y, { pose: k % 2 ? 'wave' : 'cheer', mood: 'big', frame: (f + k) % 2, flip: x > 40 }));
        drawChar(ctx, ch, 40, 90, { pose: 'wave', mood: 'big', frame: f });
        bubble(ctx, 32 + (f ? 1 : 0), 52, 'heart'); bubble(ctx, 56, 36, 'dots');
      }
    }

    // 축하 효과
    if (c.celebrate === true) {
      if (this.confetti.length < 40) {
        const r = Math.random;
        this.confetti.push({ x: r() * PIX.W, y: -4, v: 0.15 + r() * 0.25, c: ['#f8a8c8', '#fff2a0', '#a8d8ff', '#c8a8f8', '#a8f0c8'][Math.floor(r() * 5)], k: r() < 0.25 ? 'note' : r() < 0.4 ? 'star' : 'bit' });
      }
      this.confetti.forEach((p) => {
        p.y += p.v * 2; p.x += Math.sin((t + p.y * 40) / 400) * 0.2;
        if (p.k === 'note') note(ctx, p.x, p.y, p.c); else if (p.k === 'star') sparkle(ctx, p.x | 0, p.y | 0, p.c); else R(ctx, p.x, p.y, 2, 1, p.c);
      });
      this.confetti = this.confetti.filter((p) => p.y < PIX.H + 4);
    }
  }
}

// 얼굴 아이콘 (기분 체크용)
function drawFaceIcon(canvas, ch, mood) {
  const ctx = canvas.getContext('2d');
  canvas.width = 18; canvas.height = 18;
  drawChar(ctx, ch, 9, 32, { pose: 'stand', mood, frame: 0 });
}

// 캐릭터만 단독으로 그리는 미리보기 (캐릭터 만들기 화면)
function drawPreview(canvas, ch, t, mood = 'smile') {
  const ctx = canvas.getContext('2d');
  canvas.width = 40; canvas.height = 40;
  ctx.clearRect(0, 0, 40, 40);
  R(ctx, 6, 36, 28, 2, 'rgba(46,36,64,0.18)');
  drawChar(ctx, ch, 20, 37, { pose: 'wave', mood, frame: Math.floor(t / 500) % 2 });
}
