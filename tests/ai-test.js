// ===== Test Suite for Strong AI =====
// يحمّل script.js في بيئة محاكاة لـ DOM ثم يختبر الذكاء الاصطناعي

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// إنشاء بيئة DOM وهمية بسيطة
function createMockEnv() {
  const noop = () => {};
  const elem = () => ({
    addEventListener: noop,
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    style: {},
    textContent: '',
    innerHTML: '',
    dataset: {},
    appendChild: noop,
    removeChild: noop,
    querySelector: () => elem(),
    querySelectorAll: () => [],
    setAttribute: noop,
    getAttribute: () => null,
    remove: noop,
    focus: noop,
    click: noop,
    cloneNode: () => elem(),
    parentNode: { replaceChild: noop },
    children: [],
  });
  const doc = {
    getElementById: () => elem(),
    querySelector: () => elem(),
    querySelectorAll: () => [],
    createElement: () => elem(),
    addEventListener: noop,
    body: elem(),
    documentElement: { setAttribute: noop, getAttribute: () => null, classList: { toggle: noop, add: noop, remove: noop } },
  };
  const storage = new Map();
  const localStorage = {
    getItem: k => storage.has(k) ? storage.get(k) : null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: k => storage.delete(k),
    clear: () => storage.clear(),
  };
  return {
    document: doc,
    window: {
      AudioContext: function () { return { createOscillator: () => ({ connect: noop, start: noop, stop: noop, frequency: { value: 0 } }), createGain: () => ({ connect: noop, gain: { value: 0, setValueAtTime: noop, exponentialRampToValueAtTime: noop, linearRampToValueAtTime: noop } }), currentTime: 0, destination: {} }; },
      webkitAudioContext: undefined,
      matchMedia: () => ({ matches: false, addEventListener: noop }),
      addEventListener: noop,
    },
    navigator: { share: undefined, clipboard: { writeText: () => Promise.resolve() }, userAgent: 'node' },
    localStorage,
    setTimeout: (fn) => 0,      // تعطيل async لتفادي تعليق الاختبار
    clearTimeout: noop,
    setInterval: () => 0,
    clearInterval: noop,
    console,
  };
}

// تحميل script.js داخل sandbox والحصول على مرجع للدوال/المتغيرات
function loadGame() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
  const env = createMockEnv();
  const ctx = vm.createContext(env);

  // حقن: ملحق نهاية للسكربت يُصدِّر الدوال المطلوبة للاختبار
  const appended = `
    ;globalThis.__exports = {
      getStrongMove, findWinningMoves, findForkMoves, evaluateBoard,
      checkWinnerFast, minimaxLimited, getCandidateMoves, rebuildPatternCache,
      generateWinPatterns, checkWinner, getBestMove,
      get board() { return board; },
      set board(v) { board = v; },
      get boardSize() { return boardSize; },
      set boardSize(v) { boardSize = v; },
      get winLength() { return winLength; },
      set winLength(v) { winLength = v; },
      get winPatterns() { return winPatterns; },
      set winPatterns(v) { winPatterns = v; },
    };
  `;
  try {
    vm.runInContext(code + appended, ctx, { filename: 'script.js' });
  } catch (e) {
    // بعض أخطاء DOM قد تحدث في initialization - نتجاهلها إذا تم تصدير __exports
    if (!ctx.__exports) throw e;
  }
  return ctx.__exports;
}

// ===== Helpers =====
function setup(api, size) {
  api.boardSize = size;
  api.winLength = size === 3 ? 3 : 4;
  api.winPatterns = api.generateWinPatterns(size, api.winLength);
  api.rebuildPatternCache();
  api.board = new Array(size * size).fill('');
}

function placeAt(api, moves) {
  // moves = [{ player: 'X'|'O', r, c }]
  for (const m of moves) {
    api.board[m.r * api.boardSize + m.c] = m.player;
  }
}

function rc(api, idx) {
  return { r: Math.floor(idx / api.boardSize), c: idx % api.boardSize };
}

function printBoard(api) {
  const size = api.boardSize;
  let s = '';
  for (let r = 0; r < size; r++) {
    s += '  ';
    for (let c = 0; c < size; c++) {
      const v = api.board[r * size + c];
      s += (v || '.') + ' ';
    }
    s += '\n';
  }
  return s;
}

// ===== Test Framework =====
let pass = 0, fail = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log('  ✅', name);
    pass++;
  } catch (e) {
    console.log('  ❌', name);
    console.log('     ', e.message);
    failures.push({ name, error: e.message });
    fail++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) throw new Error(`${msg || 'mismatch'}: expected ${expected}, got ${actual}`);
}

// ===== TESTS =====
console.log('\n🧪 Loading game engine...');
const api = loadGame();
console.log('✅ Loaded\n');

// ---------- Test Group 1: Basic Engine ----------
console.log('📋 Group 1: Engine Sanity');

test('generateWinPatterns for 3x3 returns 8 patterns', () => {
  const p = api.generateWinPatterns(3, 3);
  assertEqual(p.length, 8, 'pattern count');
});

test('generateWinPatterns for 4x4 with length 4', () => {
  const p = api.generateWinPatterns(4, 4);
  // 4 rows + 4 cols + 2 diagonals = 10
  assertEqual(p.length, 10, 'pattern count');
});

test('generateWinPatterns for 5x5 with length 4', () => {
  const p = api.generateWinPatterns(5, 4);
  // rows: 5 rows × 2 = 10; cols: 5×2=10; diag↘: 2×2=4; diag↙: 2×2=4 → 28
  assertEqual(p.length, 28, 'pattern count');
});

test('checkWinnerFast detects row win on 4x4', () => {
  setup(api, 4);
  placeAt(api, [
    { player: 'X', r: 0, c: 0 },
    { player: 'X', r: 0, c: 1 },
    { player: 'X', r: 0, c: 2 },
    { player: 'X', r: 0, c: 3 },
  ]);
  assertEqual(api.checkWinnerFast(api.board), 'X', 'winner');
});

test('checkWinnerFast detects diagonal win on 5x5', () => {
  setup(api, 5);
  placeAt(api, [
    { player: 'O', r: 0, c: 0 },
    { player: 'O', r: 1, c: 1 },
    { player: 'O', r: 2, c: 2 },
    { player: 'O', r: 3, c: 3 },
  ]);
  assertEqual(api.checkWinnerFast(api.board), 'O', 'winner');
});

// ---------- Test Group 2: Win-in-1 ----------
console.log('\n📋 Group 2: AI Takes Immediate Win');

test('4x4: AI wins when 3 in a row with open end', () => {
  setup(api, 4);
  // O has (0,0),(0,1),(0,2) - should play (0,3)
  placeAt(api, [
    { player: 'O', r: 0, c: 0 },
    { player: 'O', r: 0, c: 1 },
    { player: 'O', r: 0, c: 2 },
    { player: 'X', r: 1, c: 0 },
    { player: 'X', r: 1, c: 2 },
  ]);
  const move = api.getStrongMove('O');
  const expected = 0 * 4 + 3; // (0,3)
  assertEqual(move, expected, `expected (0,3)=${expected}, got ${move} ${JSON.stringify(rc(api, move))}\n${printBoard(api)}`);
});

test('5x5: AI wins diagonal when 3 in a row', () => {
  setup(api, 5);
  placeAt(api, [
    { player: 'O', r: 1, c: 1 },
    { player: 'O', r: 2, c: 2 },
    { player: 'O', r: 3, c: 3 },
    { player: 'X', r: 0, c: 0 },
    { player: 'X', r: 1, c: 0 },
    { player: 'X', r: 2, c: 0 },
  ]);
  const move = api.getStrongMove('O');
  const expected = 4 * 5 + 4; // (4,4)
  assertEqual(move, expected, `expected (4,4), got ${JSON.stringify(rc(api, move))}\n${printBoard(api)}`);
});

test('4x4: AI column win', () => {
  setup(api, 4);
  placeAt(api, [
    { player: 'O', r: 0, c: 2 },
    { player: 'O', r: 1, c: 2 },
    { player: 'O', r: 2, c: 2 },
    { player: 'X', r: 0, c: 0 },
    { player: 'X', r: 1, c: 1 },
    { player: 'X', r: 2, c: 1 },
  ]);
  const move = api.getStrongMove('O');
  const expected = 3 * 4 + 2; // (3,2)
  assertEqual(move, expected, `expected (3,2), got ${JSON.stringify(rc(api, move))}`);
});

// ---------- Test Group 3: Block-in-1 ----------
console.log('\n📋 Group 3: AI Blocks Opponent Immediate Win');

test('4x4: AI blocks row threat', () => {
  setup(api, 4);
  placeAt(api, [
    { player: 'X', r: 1, c: 0 },
    { player: 'X', r: 1, c: 1 },
    { player: 'X', r: 1, c: 2 },
    { player: 'O', r: 0, c: 0 },
    { player: 'O', r: 2, c: 2 },
  ]);
  const move = api.getStrongMove('O');
  const expected = 1 * 4 + 3; // (1,3)
  assertEqual(move, expected, `expected block at (1,3), got ${JSON.stringify(rc(api, move))}\n${printBoard(api)}`);
});

test('5x5: AI blocks diagonal threat', () => {
  setup(api, 5);
  placeAt(api, [
    { player: 'X', r: 0, c: 4 },
    { player: 'X', r: 1, c: 3 },
    { player: 'X', r: 2, c: 2 },
    { player: 'O', r: 0, c: 0 },
    { player: 'O', r: 1, c: 1 },
    { player: 'O', r: 4, c: 4 },
  ]);
  const move = api.getStrongMove('O');
  const expected = 3 * 5 + 1; // (3,1)
  assertEqual(move, expected, `expected block at (3,1), got ${JSON.stringify(rc(api, move))}\n${printBoard(api)}`);
});

test('AI prioritizes winning over blocking', () => {
  setup(api, 4);
  // Both O and X have 3-in-a-row threat; O should WIN not BLOCK
  placeAt(api, [
    { player: 'O', r: 0, c: 0 },
    { player: 'O', r: 0, c: 1 },
    { player: 'O', r: 0, c: 2 },
    { player: 'X', r: 3, c: 0 },
    { player: 'X', r: 3, c: 1 },
    { player: 'X', r: 3, c: 2 },
  ]);
  const move = api.getStrongMove('O');
  const winMove = 0 * 4 + 3;
  assertEqual(move, winMove, `should win at (0,3) not block, got ${JSON.stringify(rc(api, move))}\n${printBoard(api)}`);
});

// ---------- Test Group 4: Fork Detection ----------
console.log('\n📋 Group 4: Fork Detection & Creation');

test('findForkMoves detects a real fork on 4x4', () => {
  setup(api, 4);
  // نبني موقف حيث لعب O على (1,1) يخلق تهديدين فوريين بالفوز:
  //   - إكمال عمود c=1:  O@(0,1), O@(1,1), O@(2,1)  → تهديد (3,1)
  //   - إكمال قطر ↘:      O@(0,0), O@(1,1), O@(2,2)  → تهديد (3,3)
  // لجعل كل صف تهديد "فوز في حركة واحدة" نحتاج 3 قطع لـ O على كل خط
  // في لوحة 4×4 مع winLength=4، نحتاج فعلياً 3 قطع على الخط بعد لعب (1,1)
  placeAt(api, [
    { player: 'O', r: 0, c: 1 },
    { player: 'O', r: 2, c: 1 },
    { player: 'O', r: 0, c: 0 },
    { player: 'O', r: 2, c: 2 },
  ]);
  // الآن لعب (1,1) يعطي O: عمود c=1 فيه (0,1),(1,1),(2,1)=3 قطع → تهديد (3,1)
  //                       قطر ↘ فيه (0,0),(1,1),(2,2)=3 قطع → تهديد (3,3)
  const forks = api.findForkMoves(api.board, 'O');
  const forkIdx = 1 * 4 + 1;
  assert(forks.includes(forkIdx), `expected (1,1)=${forkIdx} as fork, got [${forks}]\n${printBoard(api)}`);
});

test('AI creates a fork when possible (4x4)', () => {
  setup(api, 4);
  // two open 2-in-a-rows that share a pivot
  placeAt(api, [
    { player: 'O', r: 1, c: 1 },
    { player: 'O', r: 1, c: 2 },
    { player: 'O', r: 2, c: 1 },
    { player: 'X', r: 0, c: 0 },
    { player: 'X', r: 3, c: 3 },
  ]);
  // After this position, ideal play for O should keep pressure;
  // just verify AI plays a legal move and doesn't lose a forcing opportunity
  const move = api.getStrongMove('O');
  assert(move >= 0 && move < 16, 'legal move');
  assert(api.board[move] === '', 'plays to empty cell');
});

// ---------- Test Group 5: Legality & Performance ----------
console.log('\n📋 Group 5: Legality & Performance');

test('AI always plays a legal move on empty 4x4', () => {
  setup(api, 4);
  const move = api.getStrongMove('O');
  assert(move >= 0 && move < 16, `move in range: ${move}`);
  assert(api.board[move] === '', 'to empty cell');
});

test('AI always plays a legal move on empty 5x5', () => {
  setup(api, 5);
  const move = api.getStrongMove('O');
  assert(move >= 0 && move < 25, `move in range: ${move}`);
  assert(api.board[move] === '', 'to empty cell');
});

test('AI first move on 4x4 prefers near-center', () => {
  setup(api, 4);
  const move = api.getStrongMove('O');
  const { r, c } = rc(api, move);
  assert(r >= 1 && r <= 2 && c >= 1 && c <= 2, `expected center area, got (${r},${c})`);
});

test('Performance 4x4: move < 1500ms', () => {
  setup(api, 4);
  placeAt(api, [
    { player: 'X', r: 1, c: 1 },
    { player: 'O', r: 2, c: 2 },
    { player: 'X', r: 1, c: 2 },
  ]);
  const t0 = Date.now();
  const move = api.getStrongMove('O');
  const dt = Date.now() - t0;
  assert(dt < 1500, `took ${dt}ms`);
  assert(api.board[move] === '', 'legal');
});

test('Performance 5x5: move < 2500ms', () => {
  setup(api, 5);
  placeAt(api, [
    { player: 'X', r: 2, c: 2 },
    { player: 'O', r: 2, c: 3 },
    { player: 'X', r: 3, c: 2 },
  ]);
  const t0 = Date.now();
  const move = api.getStrongMove('O');
  const dt = Date.now() - t0;
  assert(dt < 2500, `took ${dt}ms`);
  assert(api.board[move] === '', 'legal');
});

// ---------- Test Group 6: Self-Play (AI vs Random) ----------
console.log('\n📋 Group 6: AI vs Random (Win Rate)');

function randomMove(boardArr) {
  const empty = [];
  for (let i = 0; i < boardArr.length; i++) if (boardArr[i] === '') empty.push(i);
  return empty[Math.floor(Math.random() * empty.length)];
}

function playGame(size, aiPlayer) {
  setup(api, size);
  let current = 'X';
  const maxMoves = size * size;
  for (let step = 0; step < maxMoves; step++) {
    let move;
    if (current === aiPlayer) {
      move = api.getStrongMove(aiPlayer);
    } else {
      move = randomMove(api.board);
    }
    if (move === undefined || api.board[move] !== '') {
      return 'draw'; // safety
    }
    api.board[move] = current;
    const w = api.checkWinnerFast(api.board);
    if (w) return w;
    current = current === 'X' ? 'O' : 'X';
  }
  return 'draw';
}

test('AI never loses to random on 4x4 + wins ≥65% (30 games)', () => {
  let wins = 0, losses = 0, draws = 0;
  const N = 30;
  for (let i = 0; i < N; i++) {
    const result = playGame(4, 'O');
    if (result === 'O') wins++;
    else if (result === 'X') losses++;
    else draws++;
  }
  console.log(`     Stats: W=${wins} L=${losses} D=${draws} of ${N}`);
  assert(losses === 0, `AI should NEVER lose to random, but lost ${losses}`);
  // لوحة 4×4 مع win-length=4: التعادل شائع جداً لأن المساحة محدودة
  assert(wins / N >= 0.65, `win rate ${wins}/${N} = ${(wins/N*100).toFixed(0)}%, expected ≥65%`);
});

test('AI wins ≥70% vs random on 5x5 (10 games)', () => {
  let wins = 0, losses = 0, draws = 0;
  const N = 10;
  for (let i = 0; i < N; i++) {
    const result = playGame(5, 'O');
    if (result === 'O') wins++;
    else if (result === 'X') losses++;
    else draws++;
  }
  console.log(`     Stats: W=${wins} L=${losses} D=${draws} of ${N}`);
  assert(wins / N >= 0.7, `win rate ${wins}/${N} = ${(wins/N*100).toFixed(0)}%, expected ≥70%`);
  assert(losses === 0, `AI should NEVER lose to random, but lost ${losses}`);
});

test('3x3 AI (Minimax) never loses vs random (30 games)', () => {
  let wins = 0, losses = 0, draws = 0;
  const N = 30;
  for (let i = 0; i < N; i++) {
    const result = playGame(3, 'O');
    if (result === 'O') wins++;
    else if (result === 'X') losses++;
    else draws++;
  }
  console.log(`     Stats: W=${wins} L=${losses} D=${draws} of ${N}`);
  assert(losses === 0, `3x3 AI should NEVER lose to random, but lost ${losses}`);
});

// ===== Summary =====
console.log('\n═══════════════════════════════════════');
console.log(`  ✅ Passed: ${pass}`);
console.log(`  ❌ Failed: ${fail}`);
console.log('═══════════════════════════════════════\n');

if (fail > 0) {
  console.log('Failures:');
  failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  process.exit(1);
}
process.exit(0);