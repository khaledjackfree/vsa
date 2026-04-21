// ===== XO Game Logic v4.0 =====

// ===== عناصر DOM =====
let cells = document.querySelectorAll('.cell'); // يُعاد بناؤها مع كل تغيير حجم لوحة
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const resetBtn = document.getElementById('resetBtn');
const undoBtn = document.getElementById('undoBtn');
const hintBtn = document.getElementById('hintBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const timerBtns = document.querySelectorAll('.timer-btn');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDEl = document.getElementById('scoreD');
const scoreItemX = document.getElementById('scoreItemX');
const scoreItemO = document.getElementById('scoreItemO');
const scoreItemD = document.getElementById('scoreItemD');
const labelX = document.getElementById('labelX');
const labelO = document.getElementById('labelO');
const playerXName = document.getElementById('playerXName');
const playerOName = document.getElementById('playerOName');

const themeToggle = document.getElementById('themeToggle');
const soundToggle = document.getElementById('soundToggle');
const paletteToggle = document.getElementById('paletteToggle');
const paletteMenu = document.getElementById('paletteMenu');
const statsBtn = document.getElementById('statsBtn');
const achievementsBtn = document.getElementById('achievementsBtn');
const helpBtn = document.getElementById('helpBtn');

const historyToggle = document.getElementById('historyToggle');
const historyList = document.getElementById('historyList');

const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalPlayAgain = document.getElementById('modalPlayAgain');
const modalShare = document.getElementById('modalShare');
const modalClose = document.getElementById('modalClose');
const modalAchievementUnlock = document.getElementById('modalAchievementUnlock');

const statsModalOverlay = document.getElementById('statsModalOverlay');
const statsGrid = document.getElementById('statsGrid');
const statsCloseBtn = document.getElementById('statsCloseBtn');
const statsClearBtn = document.getElementById('statsClearBtn');

const achievementsModalOverlay = document.getElementById('achievementsModalOverlay');
const achievementsList = document.getElementById('achievementsList');
const achievementsProgress = document.getElementById('achievementsProgress');
const achievementsCloseBtn = document.getElementById('achievementsCloseBtn');

const helpModalOverlay = document.getElementById('helpModalOverlay');
const helpCloseBtn = document.getElementById('helpCloseBtn');

const timerBarWrapper = document.getElementById('timerBarWrapper');
const timerBar = document.getElementById('timerBar');
const timerText = document.getElementById('timerText');

const toast = document.getElementById('toast');

// ===== عناصر DOM v4.0 الجديدة =====
const boardSizeBtns = document.querySelectorAll('.board-size-btn');
const avatarXBtn = document.getElementById('avatarXBtn');
const avatarOBtn = document.getElementById('avatarOBtn');
const avatarModalOverlay = document.getElementById('avatarModalOverlay');
const avatarGrid = document.getElementById('avatarGrid');
const avatarCloseBtn = document.getElementById('avatarCloseBtn');
const avatarModalSubtitle = document.getElementById('avatarModalSubtitle');

const dailyChallengeBtn = document.getElementById('dailyChallengeBtn');
const dailyChallengeBadge = document.getElementById('dailyChallengeBadge');
const dailyModalOverlay = document.getElementById('dailyModalOverlay');
const dailyModalDate = document.getElementById('dailyModalDate');
const dailyChallengeInfo = document.getElementById('dailyChallengeInfo');
const dailyStartBtn = document.getElementById('dailyStartBtn');
const dailyCloseBtn = document.getElementById('dailyCloseBtn');

const replayBtn = document.getElementById('replayBtn');
const replayModalOverlay = document.getElementById('replayModalOverlay');
const replayBoardEl = document.getElementById('replayBoard');
const replayInfo = document.getElementById('replayInfo');
const replayPlayBtn = document.getElementById('replayPlayBtn');
const replayPrevBtn = document.getElementById('replayPrevBtn');
const replayNextBtn = document.getElementById('replayNextBtn');
const replayCloseBtn = document.getElementById('replayCloseBtn');

const rankIcon = document.getElementById('rankIcon');
const rankName = document.getElementById('rankName');
const rankXPEl = document.getElementById('rankXP');
const rankProgressFill = document.getElementById('rankProgressFill');
const rankBadgeWrapper = document.getElementById('rankBadgeWrapper');

// ===== حالة اللعبة =====
// حجم اللوحة: 3 (3x3), 4 (4x4), 5 (5x5)
let boardSize = 3;
let winLength = 3; // عدد الخلايا المتتالية للفوز (3 للوحة 3x3، 4 للبقية)
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let startingPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // pvp | easy | medium | hard
let scores = { X: 0, O: 0, D: 0 };
let moveHistory = [];
let soundEnabled = true;
let names = { X: 'اللاعب X', O: 'اللاعب O' };
let currentPalette = 'purple';

// أفاتار اللاعبين
let avatars = { X: '🦊', O: '🐼' };
const AVATAR_OPTIONS = [
  '🦊','🐼','🦁','🐯','🐺','🦄','🐲','🦖','🐸','🐵',
  '🦉','🦅','🐙','🦈','🐢','🦋','🐞','👾','🤖','🥷',
  '🧙','🧚','🧛','🦸','🦹','👑','⚡','🔥','❄️','🌟',
  '💎','🎮','🎯','🏆','⚽','🎲','🎭','🎨','🚀','🛸'
];

// نظام الرتب (XP و Ranks)
let playerXP = 0;
const RANKS = [
  { minXP: 0,    icon: '🥉', name: 'مبتدئ' },
  { minXP: 50,   icon: '🥈', name: 'هاوٍ' },
  { minXP: 150,  icon: '🥇', name: 'محترف' },
  { minXP: 300,  icon: '🏅', name: 'خبير' },
  { minXP: 500,  icon: '🎖️', name: 'نخبة' },
  { minXP: 800,  icon: '🏆', name: 'أسطورة' },
  { minXP: 1200, icon: '👑', name: 'ملك XO' },
  { minXP: 2000, icon: '💎', name: 'جراند ماستر' },
];
let lastRankIndex = 0;

// سجل المباراة الأخيرة (للإعادة)
let lastGameReplay = null;
let replayState = {
  currentStep: 0,
  playing: false,
  interval: null,
  size: 3,
};

// التحدي اليومي
let dailyChallenge = null;
let isDailyChallenge = false;
let dailyChallengeCompleted = false;

// إحصائيات تفصيلية
let stats = {
  totalGames: 0,
  gamesByMode: { pvp: 0, easy: 0, medium: 0, hard: 0 },
  winsByMode: { easy: 0, medium: 0, hard: 0 },
  totalMoves: 0,
  fastestWin: null,        // أقل عدد حركات للفوز
  currentStreak: 0,        // سلسلة الانتصارات الحالية للاعب X
  longestStreak: 0,        // أطول سلسلة انتصارات للاعب X
  hintsUsed: 0,
  undosUsed: 0,
};

// Timer
let timerLimit = 0;  // 0 = disabled, 10, 30
let timerRemaining = 0;
let timerInterval = null;

// لتتبع استخدام التراجع في اللعبة الحالية
let currentGameUsedUndo = false;

// ===== خطوط الفوز (يتم توليدها ديناميكياً حسب حجم اللوحة) =====
let winPatterns = [];

function generateWinPatterns(size, length) {
  const patterns = [];
  // صفوف (أفقي)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - length; c++) {
      const pattern = [];
      for (let k = 0; k < length; k++) pattern.push(r * size + c + k);
      patterns.push(pattern);
    }
  }
  // أعمدة (عمودي)
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - length; r++) {
      const pattern = [];
      for (let k = 0; k < length; k++) pattern.push((r + k) * size + c);
      patterns.push(pattern);
    }
  }
  // قطر نزولي (يمين)
  for (let r = 0; r <= size - length; r++) {
    for (let c = 0; c <= size - length; c++) {
      const pattern = [];
      for (let k = 0; k < length; k++) pattern.push((r + k) * size + (c + k));
      patterns.push(pattern);
    }
  }
  // قطر صاعد (يسار)
  for (let r = 0; r <= size - length; r++) {
    for (let c = length - 1; c < size; c++) {
      const pattern = [];
      for (let k = 0; k < length; k++) pattern.push((r + k) * size + (c - k));
      patterns.push(pattern);
    }
  }
  return patterns;
}
winPatterns = generateWinPatterns(3, 3);

// ===== تعريف الإنجازات =====
const ACHIEVEMENTS = [
  { id: 'first_game', icon: '🎮', title: 'البداية', desc: 'العب أول مباراة' },
  { id: 'first_win', icon: '🥇', title: 'أول فوز', desc: 'احصل على أول انتصار' },
  { id: 'five_wins', icon: '⭐', title: 'المنتصر', desc: 'افز 5 مرات' },
  { id: 'ten_wins', icon: '🏆', title: 'البطل', desc: 'افز 10 مرات' },
  { id: 'streak_3', icon: '🔥', title: 'ثلاثية', desc: 'افز 3 مرات متتالية' },
  { id: 'streak_5', icon: '🌟', title: 'سلسلة ذهبية', desc: 'افز 5 مرات متتالية' },
  { id: 'beat_easy', icon: '🤖', title: 'محاول مبتدئ', desc: 'اهزم الذكاء السهل' },
  { id: 'beat_medium', icon: '⚡', title: 'محارب متوسط', desc: 'اهزم الذكاء المتوسط' },
  { id: 'beat_hard', icon: '🧠', title: 'عبقري', desc: 'اهزم الذكاء الصعب (أو تعادل)' },
  { id: 'fast_win', icon: '⚡', title: 'سريع البرق', desc: 'افز في 3 حركات فقط' },
  { id: 'draw_master', icon: '🤝', title: 'سيد التعادل', desc: 'احصل على 5 تعادلات' },
  { id: 'use_hint', icon: '💡', title: 'مستخدم التلميحات', desc: 'استخدم التلميح لأول مرة' },
  { id: 'no_undo_win', icon: '🎯', title: 'بلا تراجع', desc: 'افز دون استخدام التراجع (10 مرات)' },
  { id: 'total_10', icon: '🎲', title: 'محترف', desc: 'العب 10 مباريات' },
  { id: 'total_25', icon: '💎', title: 'خبير', desc: 'العب 25 مباراة' },
  { id: 'theme_explorer', icon: '🎨', title: 'مستكشف الألوان', desc: 'جرب 3 ثيمات مختلفة' },
  // إنجازات v4.0 الجديدة
  { id: 'play_4x4', icon: '🎲', title: 'محارب الـ 4×4', desc: 'العب على لوحة 4×4' },
  { id: 'play_5x5', icon: '🌐', title: 'سيد الـ 5×5', desc: 'العب على لوحة 5×5' },
  { id: 'win_4x4', icon: '🏅', title: 'بطل 4×4', desc: 'افز على لوحة 4×4' },
  { id: 'daily_win', icon: '🌟', title: 'بطل اليوم', desc: 'اكمل التحدي اليومي بنجاح' },
  { id: 'rank_up', icon: '📈', title: 'الصعود', desc: 'ارتقِ إلى الرتبة الثانية' },
  { id: 'elite_rank', icon: '💎', title: 'نخبوي', desc: 'الوصول لرتبة النخبة' },
  { id: 'avatar_picker', icon: '🎭', title: 'متأنق', desc: 'غيّر الأفاتار الخاص بك' },
];

let achievements = {};        // { id: true/false }
let unlockedAchievements = new Set();
let triedPalettes = new Set();
let noUndoWins = 0;

// ===== نظام الصوت (Web Audio API) =====
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API غير مدعوم');
    }
  }
  return audioCtx;
}

function playTone(frequency, duration = 0.15, type = 'sine', volume = 0.15) {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* ignore */ }
}

function playClickSound() { playTone(440, 0.08, 'square', 0.08); }
function playWinSound() {
  playTone(523, 0.15, 'sine', 0.15);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.15), 120);
  setTimeout(() => playTone(784, 0.3, 'sine', 0.15), 240);
}
function playDrawSound() { playTone(300, 0.3, 'triangle', 0.1); }
function playUndoSound() { playTone(350, 0.1, 'sawtooth', 0.08); }
function playHintSound() { playTone(880, 0.12, 'sine', 0.1); setTimeout(() => playTone(1100, 0.12, 'sine', 0.1), 100); }
function playAchievementSound() {
  playTone(523, 0.1, 'triangle', 0.12);
  setTimeout(() => playTone(659, 0.1, 'triangle', 0.12), 90);
  setTimeout(() => playTone(784, 0.1, 'triangle', 0.12), 180);
  setTimeout(() => playTone(1047, 0.25, 'triangle', 0.14), 270);
}
function playTimerTickSound() { playTone(1200, 0.04, 'square', 0.05); }
function playTimeoutSound() {
  playTone(200, 0.2, 'sawtooth', 0.15);
  setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.15), 180);
}

// ===== localStorage =====
function loadState() {
  try {
    const savedScores = localStorage.getItem('xo-scores');
    if (savedScores) scores = JSON.parse(savedScores);

    const savedTheme = localStorage.getItem('xo-theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    }

    const savedSound = localStorage.getItem('xo-sound');
    if (savedSound === 'off') {
      soundEnabled = false;
      soundToggle.textContent = '🔇';
    }

    const savedNames = localStorage.getItem('xo-names');
    if (savedNames) {
      names = JSON.parse(savedNames);
      playerXName.value = names.X;
      playerOName.value = names.O;
    }

    const savedPalette = localStorage.getItem('xo-palette');
    if (savedPalette) {
      currentPalette = savedPalette;
      applyPalette(savedPalette, false);
    }

    const savedStats = localStorage.getItem('xo-stats');
    if (savedStats) stats = { ...stats, ...JSON.parse(savedStats) };

    const savedAchievements = localStorage.getItem('xo-achievements');
    if (savedAchievements) {
      achievements = JSON.parse(savedAchievements);
      Object.keys(achievements).forEach(id => { if (achievements[id]) unlockedAchievements.add(id); });
    }

    const savedTriedPalettes = localStorage.getItem('xo-tried-palettes');
    if (savedTriedPalettes) triedPalettes = new Set(JSON.parse(savedTriedPalettes));
    triedPalettes.add(currentPalette);

    const savedNoUndo = localStorage.getItem('xo-no-undo-wins');
    if (savedNoUndo) noUndoWins = parseInt(savedNoUndo) || 0;

    const savedTimer = localStorage.getItem('xo-timer');
    if (savedTimer) {
      timerLimit = parseInt(savedTimer) || 0;
      timerBtns.forEach(b => b.classList.toggle('active', parseInt(b.dataset.timer) === timerLimit));
    }

    // v4.0 - تحميل حجم اللوحة
    const savedBoardSize = localStorage.getItem('xo-board-size');
    if (savedBoardSize) {
      boardSize = parseInt(savedBoardSize) || 3;
    }

    // v4.0 - تحميل الأفاتار
    const savedAvatars = localStorage.getItem('xo-avatars');
    if (savedAvatars) avatars = { ...avatars, ...JSON.parse(savedAvatars) };

    // v4.0 - تحميل XP والرتبة
    const savedXP = localStorage.getItem('xo-xp');
    if (savedXP) playerXP = parseInt(savedXP) || 0;

    // v4.0 - تحميل آخر مباراة للإعادة
    const savedReplay = localStorage.getItem('xo-last-replay');
    if (savedReplay) {
      try { lastGameReplay = JSON.parse(savedReplay); } catch(e){}
    }

    // v4.0 - تحميل حالة التحدي اليومي
    const savedDaily = localStorage.getItem('xo-daily');
    if (savedDaily) {
      try { dailyChallenge = JSON.parse(savedDaily); } catch(e){}
    }
  } catch (e) {
    console.warn('Error loading state:', e);
  }

  updateScoreDisplay();
  updateLabels();
  updateAvatarDisplay();
  updateRankDisplay();
}

function saveScores() { localStorage.setItem('xo-scores', JSON.stringify(scores)); }
function saveNames() { localStorage.setItem('xo-names', JSON.stringify(names)); }
function saveStats() { localStorage.setItem('xo-stats', JSON.stringify(stats)); }
function saveAchievements() { localStorage.setItem('xo-achievements', JSON.stringify(achievements)); }
function saveTriedPalettes() { localStorage.setItem('xo-tried-palettes', JSON.stringify([...triedPalettes])); }

// ===== تحديث العرض =====
function updateScoreDisplay(animateKey = null) {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;

  if (animateKey) {
    const map = { X: scoreItemX, O: scoreItemO, D: scoreItemD };
    const el = map[animateKey];
    if (el) {
      el.classList.remove('updated');
      void el.offsetWidth;
      el.classList.add('updated');
    }
  }
}

function updateLabels() {
  const nameX = names.X || 'اللاعب X';
  const nameO = gameMode === 'pvp' ? (names.O || 'اللاعب O') : '🤖 الكمبيوتر';
  const avX = avatars.X || '❌';
  const avO = gameMode === 'pvp' ? (avatars.O || '⭕') : '🤖';
  labelX.textContent = `${avX} ${nameX}`;
  labelO.textContent = `${avO} ${nameO}`;

  playerOName.disabled = (gameMode !== 'pvp');
  playerOName.style.opacity = playerOName.disabled ? '0.5' : '1';
  if (avatarOBtn) {
    avatarOBtn.disabled = (gameMode !== 'pvp');
    avatarOBtn.style.opacity = avatarOBtn.disabled ? '0.5' : '1';
  }
}

function updateStatus(text) { statusEl.textContent = text; }

function getPlayerDisplay(player) {
  const avX = avatars.X || '❌';
  const avO = avatars.O || '⭕';
  if (player === 'X') return `${avX} ${names.X || 'اللاعب X'}`;
  return gameMode === 'pvp'
    ? `${avO} ${names.O || 'اللاعب O'}`
    : '🤖 الكمبيوتر';
}

// ===== منطق اللعبة =====
function checkWinner(boardState = board) {
  for (const pattern of winPatterns) {
    const first = boardState[pattern[0]];
    if (!first) continue;
    if (pattern.every(i => boardState[i] === first)) {
      return { winner: first, pattern };
    }
  }
  if (!boardState.includes('')) return { winner: 'draw', pattern: null };
  return null;
}

function highlightWinner(pattern) {
  pattern.forEach(i => cells[i].classList.add('winner'));
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add('taken', player.toLowerCase());

  // إزالة تلميحات سابقة
  cells.forEach(c => c.classList.remove('hint'));

  moveHistory.push({
    index,
    player,
    moveNumber: moveHistory.length + 1
  });
  renderHistory();
  updateUndoButton();
  updateReplayButton();
}

function handleCellClick(e) {
  const index = parseInt(e.currentTarget.dataset.index);
  if (!gameActive || board[index] !== '') return;
  if (gameMode !== 'pvp' && currentPlayer === 'O') return;

  stopTimer();
  playClickSound();
  makeMove(index, currentPlayer);

  const result = checkWinner();
  if (result) return endGame(result);

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);

  if (gameActive && gameMode !== 'pvp' && currentPlayer === 'O') {
    setTimeout(computerMove, 450);
  } else {
    startTimer();
  }
}

// ===== حركات الكمبيوتر =====
function computerMove() {
  if (!gameActive) return;

  let index;
  if (gameMode === 'easy') {
    index = getRandomMove();
  } else if (gameMode === 'medium') {
    index = Math.random() < 0.5 ? getBestMove('O') : getRandomMove();
  } else {
    index = getBestMove('O');
  }

  playClickSound();
  makeMove(index, 'O');

  const result = checkWinner();
  if (result) return endGame(result);

  currentPlayer = 'X';
  updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);
  startTimer();
}

function getRandomMove() {
  const empty = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getBestMove(forPlayer = 'O') {
  const opponent = forPlayer === 'O' ? 'X' : 'O';

  // للوحة 3×3: Minimax الكامل (مثالي)
  if (boardSize === 3) {
    let bestScore = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = forPlayer;
        const score = minimax(board, 0, false, forPlayer, opponent, -Infinity, Infinity);
        board[i] = '';
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  // للوحات الأكبر: Heuristic + Minimax عمق محدود
  return getHeuristicMove(forPlayer);
}

function minimax(boardState, depth, isMaximizing, maxPlayer, minPlayer, alpha, beta) {
  const result = checkWinner(boardState);
  if (result) {
    if (result.winner === maxPlayer) return 100 - depth;
    if (result.winner === minPlayer) return depth - 100;
    if (result.winner === 'draw') return 0;
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === '') {
        boardState[i] = maxPlayer;
        best = Math.max(best, minimax(boardState, depth + 1, false, maxPlayer, minPlayer, alpha, beta));
        boardState[i] = '';
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === '') {
        boardState[i] = minPlayer;
        best = Math.min(best, minimax(boardState, depth + 1, true, maxPlayer, minPlayer, alpha, beta));
        boardState[i] = '';
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

// ===== Heuristic للوحات الكبيرة =====
function getHeuristicMove(forPlayer) {
  const opponent = forPlayer === 'O' ? 'X' : 'O';

  // 1) فوز فوري إن أمكن
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = forPlayer;
      if (checkWinner(board)?.winner === forPlayer) { board[i] = ''; return i; }
      board[i] = '';
    }
  }
  // 2) منع خسارة فورية
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = opponent;
      if (checkWinner(board)?.winner === opponent) { board[i] = ''; return i; }
      board[i] = '';
    }
  }
  // 3) اختيار أفضل خلية بناءً على تقييم الأنماط المحتملة
  let bestScore = -Infinity;
  let bestMove = -1;
  const candidates = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      const score = evaluateMove(i, forPlayer);
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
        candidates.length = 0;
        candidates.push(i);
      } else if (score === bestScore) {
        candidates.push(i);
      }
    }
  }
  // إضافة عشوائية بسيطة بين الخيارات المتكافئة
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function evaluateMove(index, player) {
  const opponent = player === 'O' ? 'X' : 'O';
  let score = 0;
  const center = Math.floor(boardSize / 2);
  const r = Math.floor(index / boardSize);
  const c = index % boardSize;

  // الخلايا المركزية أفضل
  const distFromCenter = Math.abs(r - center) + Math.abs(c - center);
  score += (boardSize - distFromCenter) * 2;

  // فحص كل نمط فوز يمر بهذه الخلية
  for (const pattern of winPatterns) {
    if (!pattern.includes(index)) continue;
    let playerCount = 0;
    let opponentCount = 0;
    for (const i of pattern) {
      if (board[i] === player) playerCount++;
      else if (board[i] === opponent) opponentCount++;
    }
    // لا نستطيع الفوز بهذا النمط إذا احتوى على الخصم
    if (opponentCount === 0) {
      // كلما زاد عدد قطعنا في النمط زادت القيمة بشكل أسي
      score += Math.pow(10, playerCount);
    }
    // دفاع: هذا النمط لدى الخصم قطع كثيرة
    if (playerCount === 0) {
      score += Math.pow(8, opponentCount);
    }
  }
  return score;
}

// ===== التلميح (Hint) =====
function showHint() {
  if (!gameActive) {
    showToast('⚠️ اللعبة غير نشطة');
    return;
  }
  if (gameMode !== 'pvp' && currentPlayer === 'O') {
    showToast('⚠️ انتظر دورك');
    return;
  }
  const bestMove = getBestMove(currentPlayer);
  if (bestMove === -1) return;

  // أزل أي تلميحات سابقة
  cells.forEach(c => c.classList.remove('hint'));
  cells[bestMove].classList.add('hint');

  playHintSound();
  showToast(`💡 أفضل حركة: الخانة ${bestMove + 1}`);

  stats.hintsUsed++;
  currentGameUsedHint = true;  // v4.0 - تتبع استخدام التلميح في المباراة
  saveStats();
  checkAchievement('use_hint');

  // إزالة التلميح بعد 2.5 ثانية
  setTimeout(() => cells[bestMove].classList.remove('hint'), 2500);
}

// ===== Timer =====
function startTimer() {
  if (!timerLimit || !gameActive) return;
  stopTimer();
  timerRemaining = timerLimit;
  timerBarWrapper.style.display = 'block';
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timerRemaining--;
    updateTimerDisplay();

    if (timerRemaining <= 3 && timerRemaining > 0) {
      playTimerTickSound();
    }

    if (timerRemaining <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const percent = (timerRemaining / timerLimit) * 100;
  timerBar.style.width = percent + '%';
  timerText.textContent = `${timerRemaining} ث`;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerBarWrapper.style.display = 'none';
}

function handleTimeout() {
  if (!gameActive) return;
  playTimeoutSound();
  // اللاعب الحالي خسر الدور → الآخر يفوز
  const winner = currentPlayer === 'X' ? 'O' : 'X';
  gameActive = false;
  showToast(`⏰ انتهى الوقت! فاز ${getPlayerDisplay(winner)}`);
  scores[winner]++;
  saveScores();
  updateScoreDisplay(winner);

  stats.totalGames++;
  stats.gamesByMode[gameMode] = (stats.gamesByMode[gameMode] || 0) + 1;
  if (winner === 'X') {
    stats.currentStreak++;
    if (stats.currentStreak > stats.longestStreak) stats.longestStreak = stats.currentStreak;
  } else {
    stats.currentStreak = 0;
  }
  saveStats();

  setTimeout(() => showModal(`⏰ انتهى الوقت!`, `فاز ${getPlayerDisplay(winner)} بسبب انتهاء وقت الخصم`), 600);
}

// ===== انتهاء اللعبة =====
function endGame(result) {
  gameActive = false;
  stopTimer();
  let modalTitleText, modalMsg;
  let unlockedNow = [];

  // تحديث الإحصائيات العامة
  stats.totalGames++;
  stats.gamesByMode[gameMode] = (stats.gamesByMode[gameMode] || 0) + 1;
  stats.totalMoves += moveHistory.length;

  if (result.winner === 'draw') {
    updateStatus('🤝 تعادل!');
    scores.D++;
    modalTitleText = '🤝 تعادل!';
    modalMsg = 'لعبة متكافئة! جربوا مرة أخرى.';
    playDrawSound();
    updateScoreDisplay('D');
    stats.currentStreak = 0;

    // إنجاز: 5 تعادلات
    if (scores.D >= 5) unlockedNow.push(checkAchievement('draw_master'));
    // إنجاز خاص: إذا كنا ضد المستوى الصعب والنتيجة تعادل
    if (gameMode === 'hard') unlockedNow.push(checkAchievement('beat_hard'));
  } else {
    const winnerDisplay = getPlayerDisplay(result.winner);
    updateStatus(`🎉 فاز ${winnerDisplay}!`);
    scores[result.winner]++;
    highlightWinner(result.pattern);
    modalTitleText = `🎉 فاز ${winnerDisplay}!`;
    modalMsg = 'مبروك الفوز! 🏆';
    playWinSound();
    launchConfetti();
    updateScoreDisplay(result.winner);

    // تحديث الإحصائيات الخاصة بالفوز
    if (result.winner === 'X') {
      stats.currentStreak++;
      if (stats.currentStreak > stats.longestStreak) stats.longestStreak = stats.currentStreak;

      // Fastest win (عد حركات X فقط)
      const xMoves = moveHistory.filter(m => m.player === 'X').length;
      if (stats.fastestWin === null || xMoves < stats.fastestWin) {
        stats.fastestWin = xMoves;
      }

      // تحديث إحصائيات هزيمة الـ AI
      if (gameMode !== 'pvp') {
        stats.winsByMode[gameMode] = (stats.winsByMode[gameMode] || 0) + 1;
      }

      // إنجازات الفوز
      unlockedNow.push(checkAchievement('first_win'));
      if (scores.X >= 5) unlockedNow.push(checkAchievement('five_wins'));
      if (scores.X >= 10) unlockedNow.push(checkAchievement('ten_wins'));
      if (stats.currentStreak >= 3) unlockedNow.push(checkAchievement('streak_3'));
      if (stats.currentStreak >= 5) unlockedNow.push(checkAchievement('streak_5'));
      if (xMoves <= 3) unlockedNow.push(checkAchievement('fast_win'));

      if (gameMode === 'easy') unlockedNow.push(checkAchievement('beat_easy'));
      if (gameMode === 'medium') unlockedNow.push(checkAchievement('beat_medium'));
      if (gameMode === 'hard') unlockedNow.push(checkAchievement('beat_hard'));

      // إنجاز: الفوز بدون تراجع
      if (!currentGameUsedUndo) {
        noUndoWins++;
        localStorage.setItem('xo-no-undo-wins', noUndoWins.toString());
        if (noUndoWins >= 10) unlockedNow.push(checkAchievement('no_undo_win'));
      }
    } else {
      // O فاز - سلسلة X تنكسر
      stats.currentStreak = 0;
    }
  }

  // إنجازات عامة
  unlockedNow.push(checkAchievement('first_game'));
  if (stats.totalGames >= 10) unlockedNow.push(checkAchievement('total_10'));
  if (stats.totalGames >= 25) unlockedNow.push(checkAchievement('total_25'));
  if (triedPalettes.size >= 3) unlockedNow.push(checkAchievement('theme_explorer'));

  // v4.0 - إنجاز الفوز على لوحة 4×4
  if (result.winner === 'X' && boardSize === 4) unlockedNow.push(checkAchievement('win_4x4'));

  // v4.0 - منح XP
  let xpEarned = 0;
  let xpReason = '';
  if (result.winner === 'X') {
    xpEarned = 10;
    xpReason = '(فوز)';
    if (gameMode === 'medium') xpEarned = 15;
    if (gameMode === 'hard') xpEarned = 25;
    if (boardSize === 4) xpEarned += 5;
    if (boardSize === 5) xpEarned += 10;
    xpReason = `(فوز ${gameMode === 'pvp' ? 'PvP' : gameMode})`;
  } else if (result.winner === 'draw') {
    xpEarned = 5;
    xpReason = '(تعادل)';
    if (gameMode === 'hard') xpEarned = 15;
  } else if (result.winner === 'O') {
    xpEarned = 2;
    xpReason = '(مشاركة)';
  }
  if (xpEarned > 0) addXP(xpEarned, xpReason);

  // v4.0 - حفظ المباراة للإعادة
  saveLastGameForReplay(result);

  // v4.0 - فحص التحدي اليومي
  checkDailyCompletion(result);

  saveScores();
  saveStats();
  saveAchievements();
  updateUndoButton();

  // تصفية الإنجازات المفتوحة حديثاً
  const freshAchievements = unlockedNow.filter(a => a !== null);

  setTimeout(() => {
    showModal(modalTitleText, modalMsg);
    if (freshAchievements.length > 0) {
      const achText = freshAchievements.map(a => `${a.icon} ${a.title}`).join(' · ');
      modalAchievementUnlock.innerHTML = `🏆 <strong>إنجاز جديد!</strong><br>${achText}`;
      modalAchievementUnlock.classList.add('show');
      setTimeout(() => playAchievementSound(), 300);
    } else {
      modalAchievementUnlock.classList.remove('show');
      modalAchievementUnlock.innerHTML = '';
    }
  }, 800);
}

// ===== نظام الإنجازات =====
function checkAchievement(id) {
  if (achievements[id]) return null;  // تم فتحه مسبقاً
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach) return null;
  achievements[id] = true;
  unlockedAchievements.add(id);
  saveAchievements();
  return ach;
}

function renderAchievements() {
  const total = ACHIEVEMENTS.length;
  const unlocked = unlockedAchievements.size;
  achievementsProgress.textContent = `${unlocked} / ${total}  (${Math.round(unlocked/total*100)}%)`;

  achievementsList.innerHTML = ACHIEVEMENTS.map(a => {
    const isUnlocked = unlockedAchievements.has(a.id);
    return `<div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
      <div class="achievement-icon">${isUnlocked ? a.icon : '🔒'}</div>
      <div class="achievement-info">
        <div class="achievement-title">${a.title}</div>
        <div class="achievement-desc">${a.desc}</div>
      </div>
      <div class="achievement-check">${isUnlocked ? '✅' : ''}</div>
    </div>`;
  }).join('');
}

// ===== الإحصائيات =====
function renderStats() {
  const totalWins = scores.X;
  const winRate = stats.totalGames > 0 ? Math.round((totalWins / stats.totalGames) * 100) : 0;
  const avgMoves = stats.totalGames > 0 ? (stats.totalMoves / stats.totalGames).toFixed(1) : '0';

  const cards = [
    { icon: '🎮', value: stats.totalGames, label: 'إجمالي المباريات' },
    { icon: '🏆', value: scores.X, label: 'انتصارات X' },
    { icon: '⭕', value: scores.O, label: 'انتصارات O' },
    { icon: '🤝', value: scores.D, label: 'التعادلات' },
    { icon: '📈', value: winRate + '%', label: 'نسبة فوز X' },
    { icon: '🔥', value: stats.longestStreak, label: 'أطول سلسلة' },
    { icon: '⚡', value: stats.fastestWin || '—', label: 'أسرع فوز (حركات)' },
    { icon: '🎯', value: avgMoves, label: 'متوسط الحركات' },
    { icon: '💡', value: stats.hintsUsed, label: 'التلميحات المستخدمة' },
    { icon: '↩️', value: stats.undosUsed, label: 'مرات التراجع' },
    { icon: '🤖', value: stats.winsByMode.easy || 0, label: 'فوز ضد السهل' },
    { icon: '🧠', value: stats.winsByMode.hard || 0, label: 'فوز ضد الصعب' },
  ];

  statsGrid.innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="stat-icon">${c.icon}</div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
    </div>
  `).join('');
}

function clearStats() {
  if (!confirm('هل تريد مسح كل الإحصائيات والإنجازات؟')) return;
  stats = {
    totalGames: 0,
    gamesByMode: { pvp: 0, easy: 0, medium: 0, hard: 0 },
    winsByMode: { easy: 0, medium: 0, hard: 0 },
    totalMoves: 0,
    fastestWin: null,
    currentStreak: 0,
    longestStreak: 0,
    hintsUsed: 0,
    undosUsed: 0,
  };
  achievements = {};
  unlockedAchievements.clear();
  noUndoWins = 0;
  localStorage.removeItem('xo-no-undo-wins');
  saveStats();
  saveAchievements();
  renderStats();
  renderAchievements();
  showToast('🗑️ تم مسح الإحصائيات');
}

// ===== Modals =====
function showModal(title, message) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalOverlay.classList.add('show');
}
function hideModal() {
  modalOverlay.classList.remove('show');
  modalAchievementUnlock.classList.remove('show');
}
function showStatsModal() { renderStats(); statsModalOverlay.classList.add('show'); }
function hideStatsModal() { statsModalOverlay.classList.remove('show'); }
function showAchievementsModal() { renderAchievements(); achievementsModalOverlay.classList.add('show'); }
function hideAchievementsModal() { achievementsModalOverlay.classList.remove('show'); }
function showHelpModal() { helpModalOverlay.classList.add('show'); }
function hideHelpModal() { helpModalOverlay.classList.remove('show'); }

function hideAllModals() {
  hideModal();
  hideStatsModal();
  hideAchievementsModal();
  hideHelpModal();
}

// ===== Toast =====
let toastTimeout = null;
function showToast(message, duration = 2200) {
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== Confetti =====
function launchConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#c5a3ff'];
  const count = 60;
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    confetti.style.animationDelay = (Math.random() * 0.5) + 's';
    confetti.style.width = confetti.style.height = (Math.random() * 8 + 6) + 'px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4500);
  }
}

// ===== Undo =====
function updateUndoButton() {
  undoBtn.disabled = moveHistory.length === 0 || !gameActive;
}

function undoMove() {
  if (moveHistory.length === 0) return;
  stopTimer();

  const stepsBack = (gameMode !== 'pvp' && moveHistory.length >= 2) ? 2 : 1;

  for (let s = 0; s < stepsBack && moveHistory.length > 0; s++) {
    const last = moveHistory.pop();
    board[last.index] = '';
    cells[last.index].textContent = '';
    cells[last.index].classList.remove('taken', 'x', 'o', 'winner', 'hint');
  }

  if (moveHistory.length === 0) {
    currentPlayer = startingPlayer;
  } else {
    const lastMove = moveHistory[moveHistory.length - 1];
    currentPlayer = lastMove.player === 'X' ? 'O' : 'X';
  }

  gameActive = true;
  currentGameUsedUndo = true;
  stats.undosUsed++;
  saveStats();

  cells.forEach(c => c.classList.remove('winner'));
  updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);
  playUndoSound();
  renderHistory();
  updateUndoButton();
  startTimer();
}

// ===== History =====
function renderHistory() {
  if (moveHistory.length === 0) {
    historyList.innerHTML = '';
    return;
  }
  historyList.innerHTML = moveHistory.map(m => {
    const playerDisplay = getPlayerDisplay(m.player);
    const row = Math.floor(m.index / 3) + 1;
    const col = (m.index % 3) + 1;
    return `<div class="history-item">
      <strong>${m.moveNumber}.</strong> ${playerDisplay}
      → الخانة ${m.index + 1} (صف ${row}, عمود ${col})
    </div>`;
  }).join('');
}

function toggleHistory() {
  historyList.classList.toggle('open');
  const isOpen = historyList.classList.contains('open');
  historyToggle.textContent = isOpen ? '📜 إخفاء سجل الحركات' : '📜 عرض سجل الحركات';
}

// ===== Restart =====
function restartGame() {
  stopTimer();
  startingPlayer = startingPlayer === 'X' ? 'O' : 'X';
  board = new Array(boardSize * boardSize).fill('');
  currentPlayer = startingPlayer;
  gameActive = true;
  moveHistory = [];
  currentGameUsedUndo = false;
  currentGameUsedHint = false; // v4.0

  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('taken', 'x', 'o', 'winner', 'hint');
  });

  updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);
  renderHistory();
  updateUndoButton();
  hideModal();

  if (gameMode !== 'pvp' && currentPlayer === 'O') {
    setTimeout(computerMove, 500);
  } else {
    startTimer();
  }
}

function resetScores() {
  scores = { X: 0, O: 0, D: 0 };
  updateScoreDisplay();
  saveScores();
  startingPlayer = 'O';
  restartGame();
  showToast('🗑️ تم مسح النتائج');
}

// ===== Change Mode =====
function changeMode(mode) {
  gameMode = mode;
  modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  updateLabels();
  startingPlayer = 'O';
  isDailyChallenge = false; // إلغاء التحدي عند تغيير الوضع يدوياً
  restartGame();
}

// ===== Timer settings =====
function changeTimer(seconds) {
  timerLimit = seconds;
  timerBtns.forEach(b => b.classList.toggle('active', parseInt(b.dataset.timer) === seconds));
  localStorage.setItem('xo-timer', seconds.toString());
  stopTimer();
  if (gameActive) startTimer();
}

// ===== Theme (Light/Dark) =====
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  if (current === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
    localStorage.setItem('xo-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
    localStorage.setItem('xo-theme', 'dark');
  }
  playClickSound();
}

// ===== Palette =====
function applyPalette(palette, save = true) {
  // Remove old palette
  const allPalettes = ['purple', 'ocean', 'sunset', 'forest', 'neon', 'rose'];
  allPalettes.forEach(p => document.documentElement.removeAttribute('data-palette'));
  if (palette !== 'purple') {
    document.documentElement.setAttribute('data-palette', palette);
  }
  currentPalette = palette;
  if (save) localStorage.setItem('xo-palette', palette);
  triedPalettes.add(palette);
  saveTriedPalettes();

  // Update active state on palette options
  document.querySelectorAll('.palette-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.palette === palette);
  });

  // Check achievement
  if (triedPalettes.size >= 3) {
    const a = checkAchievement('theme_explorer');
    if (a) { showToast(`🏆 إنجاز: ${a.title}`); playAchievementSound(); }
  }
}

function togglePaletteMenu() {
  paletteMenu.classList.toggle('show');
  playClickSound();
}

// ===== Sound =====
function toggleSound() {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
  localStorage.setItem('xo-sound', soundEnabled ? 'on' : 'off');
  if (soundEnabled) playClickSound();
}

// ===== Player Names =====
function updatePlayerName(player, value) {
  names[player] = value.trim() || (player === 'X' ? 'اللاعب X' : 'اللاعب O');
  saveNames();
  updateLabels();
  if (gameActive) updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);
}

// ===== Share =====
function shareResult() {
  const resultText = `🎮 لعبة XO v3.0\n📊 النتائج:\n❌ ${names.X}: ${scores.X}\n⭕ ${names.O}: ${scores.O}\n🤝 تعادل: ${scores.D}\n\nجربها هنا: https://github.com/khaledjackfree/vsa`;

  if (navigator.share) {
    navigator.share({
      title: 'لعبة XO',
      text: resultText,
    }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(resultText).then(() => {
      showToast('📋 تم نسخ النتيجة للحافظة');
    }).catch(() => showToast('❌ فشل النسخ'));
  } else {
    showToast('⚠️ المشاركة غير مدعومة');
  }
}

// ===== Keyboard =====
function handleKeyPress(e) {
  // Close any modal
  if (modalOverlay.classList.contains('show') ||
      statsModalOverlay.classList.contains('show') ||
      achievementsModalOverlay.classList.contains('show') ||
      helpModalOverlay.classList.contains('show')) {
    if (e.key === 'Escape') { e.preventDefault(); hideAllModals(); return; }
    if (e.key === 'Enter' && modalOverlay.classList.contains('show')) {
      e.preventDefault();
      restartGame();
      return;
    }
    return;
  }

  if (document.activeElement.tagName === 'INPUT') return;

  const key = e.key;
  if (key >= '1' && key <= '9') {
    const index = parseInt(key) - 1;
    if (gameActive && board[index] === '' &&
        !(gameMode !== 'pvp' && currentPlayer === 'O')) {
      cells[index].click();
    }
  } else if (key.toLowerCase() === 'r') {
    restartGame();
  } else if (key.toLowerCase() === 'u') {
    if (!undoBtn.disabled) undoMove();
  } else if (key.toLowerCase() === 'h') {
    showHint();
  } else if (key.toLowerCase() === 't') {
    toggleTheme();
  } else if (key.toLowerCase() === 's') {
    toggleSound();
  }
}

// =====================================================
// ===== v4.0 New Features: Board Size / Avatar / Rank / Daily / Replay =====
// =====================================================

// ----- بناء لوحة اللعب ديناميكياً -----
function rebuildBoard() {
  boardEl.innerHTML = '';
  boardEl.classList.remove('board-3', 'board-4', 'board-5');
  boardEl.classList.add(`board-${boardSize}`);
  const total = boardSize * boardSize;
  for (let i = 0; i < total; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    if (i < 9) cell.dataset.key = (i + 1).toString();
    boardEl.appendChild(cell);
  }
  cells = document.querySelectorAll('.cell');
  cells.forEach(cell => cell.addEventListener('click', handleCellClick));
}

// ----- تغيير حجم اللوحة -----
function changeBoardSize(size) {
  boardSize = size;
  winLength = size === 3 ? 3 : 4; // 4 متتالية في اللوحات الأكبر
  winPatterns = generateWinPatterns(boardSize, winLength);
  board = new Array(boardSize * boardSize).fill('');
  localStorage.setItem('xo-board-size', boardSize.toString());

  boardSizeBtns.forEach(b => b.classList.toggle('active', parseInt(b.dataset.size) === size));
  rebuildBoard();
  restartGame();

  if (size === 4) checkAchievement('play_4x4');
  if (size === 5) checkAchievement('play_5x5');
  saveAchievements();

  showToast(`🎲 تم التبديل إلى لوحة ${size}×${size} (${winLength} متتالية للفوز)`);
}

// ----- Avatar System -----
function updateAvatarDisplay() {
  if (avatarXBtn) avatarXBtn.textContent = avatars.X;
  if (avatarOBtn) avatarOBtn.textContent = avatars.O;
}

function openAvatarModal(forPlayer) {
  avatarModalSubtitle.textContent = `اختر أفاتار ${forPlayer === 'X' ? '❌ اللاعب X' : '⭕ اللاعب O'}`;
  avatarGrid.innerHTML = '';
  AVATAR_OPTIONS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'avatar-option';
    btn.textContent = emoji;
    if (emoji === avatars[forPlayer]) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      avatars[forPlayer] = emoji;
      localStorage.setItem('xo-avatars', JSON.stringify(avatars));
      updateAvatarDisplay();
      updateLabels();
      avatarModalOverlay.classList.remove('show');
      playClickSound();
      checkAchievement('avatar_picker');
      saveAchievements();
      showToast(`✨ تم تغيير الأفاتار إلى ${emoji}`);
    });
    avatarGrid.appendChild(btn);
  });
  avatarModalOverlay.classList.add('show');
  playClickSound();
}

// ----- Rank System -----
function getCurrentRank() {
  let rankIdx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (playerXP >= RANKS[i].minXP) { rankIdx = i; break; }
  }
  return { index: rankIdx, rank: RANKS[rankIdx] };
}

function updateRankDisplay() {
  if (!rankIcon) return;
  const { index, rank } = getCurrentRank();
  const nextRank = RANKS[index + 1];
  rankIcon.textContent = rank.icon;
  rankName.textContent = rank.name;
  rankXPEl.textContent = `${playerXP} XP`;

  let progressPct = 100;
  if (nextRank) {
    const rangeXP = nextRank.minXP - rank.minXP;
    const earnedXP = playerXP - rank.minXP;
    progressPct = Math.min(100, (earnedXP / rangeXP) * 100);
  }
  rankProgressFill.style.width = `${progressPct}%`;
}

function addXP(amount, reason = '') {
  const oldRank = getCurrentRank();
  playerXP += amount;
  localStorage.setItem('xo-xp', playerXP.toString());
  updateRankDisplay();
  const newRank = getCurrentRank();

  if (newRank.index > oldRank.index) {
    // level up!
    rankBadgeWrapper.classList.add('leveled-up');
    setTimeout(() => rankBadgeWrapper.classList.remove('leveled-up'), 1200);
    playAchievementSound();
    showToast(`🎉 ارتقيت إلى رتبة: ${newRank.rank.icon} ${newRank.rank.name}!`, 3500);
    if (newRank.index >= 1) checkAchievement('rank_up');
    if (newRank.index >= 4) checkAchievement('elite_rank');
    saveAchievements();
  } else if (amount > 0 && reason) {
    showToast(`+${amount} XP ${reason}`, 1800);
  }
}

// ----- Daily Challenge -----
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// قائمة التحديات اليومية - يتم اختيار واحد بناءً على اليوم
const DAILY_CHALLENGES = [
  { id: 'hard_3x3', icon: '🔥', title: 'تحدي الصعب', desc: 'افز أو تعادل ضد AI صعب على لوحة 3×3', mode: 'hard', size: 3, reward: 50 },
  { id: 'speed', icon: '⚡', title: 'السرعة', desc: 'افز في 4 حركات أو أقل', mode: 'easy', size: 3, reward: 40 },
  { id: 'no_hint', icon: '🎯', title: 'بدون مساعدة', desc: 'افز ضد AI متوسط دون استخدام تلميح', mode: 'medium', size: 3, reward: 35 },
  { id: 'big_board', icon: '🌐', title: 'اللوحة الكبيرة', desc: 'العب مباراة على لوحة 4×4', mode: 'pvp', size: 4, reward: 30 },
  { id: 'perfectionist', icon: '💎', title: 'المثالي', desc: 'افز دون استخدام التراجع', mode: 'medium', size: 3, reward: 40 },
  { id: 'marathon', icon: '🏃', title: 'الماراثون', desc: 'اكمل 3 مباريات اليوم', mode: 'pvp', size: 3, reward: 45, type: 'count' },
  { id: 'streak2', icon: '🔗', title: 'المتتابع', desc: 'احصل على انتصارين متتاليين', mode: 'easy', size: 3, reward: 40 },
];

function getTodayChallenge() {
  const d = new Date();
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(),0,0)) / (1000*60*60*24));
  const idx = dayOfYear % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[idx];
}

function initDailyChallenge() {
  const today = getTodayKey();
  const todayChallenge = getTodayChallenge();
  if (!dailyChallenge || dailyChallenge.date !== today) {
    dailyChallenge = {
      date: today,
      id: todayChallenge.id,
      completed: false,
      progress: 0,
    };
    localStorage.setItem('xo-daily', JSON.stringify(dailyChallenge));
  }
  if (!dailyChallenge.completed) {
    dailyChallengeBadge.style.display = 'inline-block';
  } else {
    dailyChallengeBadge.style.display = 'none';
  }
}

function openDailyModal() {
  const ch = getTodayChallenge();
  dailyModalDate.textContent = `📅 ${getTodayKey()}`;
  const status = dailyChallenge.completed ? '<div style="color:#4ade80;font-weight:700;margin-top:10px;">✅ تم إكماله اليوم!</div>' : '';
  dailyChallengeInfo.innerHTML = `
    <div class="challenge-title">${ch.icon} ${ch.title}</div>
    <div class="challenge-desc">${ch.desc}</div>
    <div class="challenge-reward">🎁 المكافأة: ${ch.reward} XP</div>
    ${status}
  `;
  dailyStartBtn.disabled = dailyChallenge.completed;
  dailyStartBtn.textContent = dailyChallenge.completed ? '✅ مكتمل' : '🎮 ابدأ التحدي';
  dailyModalOverlay.classList.add('show');
  playClickSound();
}

function startDailyChallenge() {
  const ch = getTodayChallenge();
  isDailyChallenge = true;
  if (ch.size !== boardSize) changeBoardSize(ch.size);
  if (ch.mode !== gameMode) changeMode(ch.mode);
  dailyModalOverlay.classList.remove('show');
  showToast(`🌟 بدأ التحدي اليومي: ${ch.title}`, 2500);
}

function checkDailyCompletion(gameResult) {
  if (!isDailyChallenge || dailyChallenge.completed) return;
  const ch = getTodayChallenge();
  let completed = false;

  if (ch.id === 'hard_3x3' && (gameResult.winner === 'X' || gameResult.winner === 'draw')) {
    if (gameMode === 'hard' && boardSize === 3) completed = true;
  } else if (ch.id === 'speed' && gameResult.winner === 'X') {
    const xMoves = moveHistory.filter(m => m.player === 'X').length;
    if (xMoves <= 4) completed = true;
  } else if (ch.id === 'no_hint' && gameResult.winner === 'X' && gameMode === 'medium') {
    // نحتاج تتبع هل استخدم التلميح في هذه المباراة
    if (!currentGameUsedHint) completed = true;
  } else if (ch.id === 'big_board' && boardSize >= 4) {
    completed = true;
  } else if (ch.id === 'perfectionist' && gameResult.winner === 'X' && !currentGameUsedUndo) {
    if (gameMode === 'medium') completed = true;
  } else if (ch.id === 'marathon') {
    dailyChallenge.progress = (dailyChallenge.progress || 0) + 1;
    if (dailyChallenge.progress >= 3) completed = true;
  } else if (ch.id === 'streak2' && gameResult.winner === 'X' && stats.currentStreak >= 2) {
    completed = true;
  }

  if (completed) {
    dailyChallenge.completed = true;
    localStorage.setItem('xo-daily', JSON.stringify(dailyChallenge));
    dailyChallengeBadge.style.display = 'none';
    addXP(ch.reward, `(تحدي يومي: ${ch.title})`);
    checkAchievement('daily_win');
    saveAchievements();
    showToast(`🌟 اكملت التحدي اليومي! +${ch.reward} XP`, 3500);
    isDailyChallenge = false;
  } else {
    localStorage.setItem('xo-daily', JSON.stringify(dailyChallenge));
  }
}

// ----- Replay System -----
function updateReplayButton() {
  replayBtn.disabled = !lastGameReplay || lastGameReplay.moves.length === 0;
}

function saveLastGameForReplay(result) {
  lastGameReplay = {
    size: boardSize,
    moves: [...moveHistory],
    result: result,
    mode: gameMode,
    date: new Date().toLocaleString('ar-EG'),
  };
  localStorage.setItem('xo-last-replay', JSON.stringify(lastGameReplay));
  updateReplayButton();
}

function openReplay() {
  if (!lastGameReplay) return;
  replayState.currentStep = 0;
  replayState.playing = false;
  replayState.size = lastGameReplay.size;
  replayBoardEl.classList.remove('replay-3','replay-4','replay-5');
  replayBoardEl.classList.add(`replay-${lastGameReplay.size}`);
  renderReplayBoard();
  replayModalOverlay.classList.add('show');
  playClickSound();
}

function renderReplayBoard() {
  replayBoardEl.innerHTML = '';
  const total = replayState.size * replayState.size;
  const boardState = new Array(total).fill('');
  for (let i = 0; i < replayState.currentStep; i++) {
    const m = lastGameReplay.moves[i];
    boardState[m.index] = m.player;
  }
  for (let i = 0; i < total; i++) {
    const c = document.createElement('div');
    c.className = 'replay-cell';
    if (boardState[i]) {
      c.textContent = boardState[i];
      c.classList.add(boardState[i].toLowerCase());
    }
    if (replayState.currentStep > 0 && lastGameReplay.moves[replayState.currentStep - 1].index === i) {
      c.classList.add('highlight');
    }
    replayBoardEl.appendChild(c);
  }
  replayInfo.textContent = `الحركة ${replayState.currentStep} / ${lastGameReplay.moves.length}`;
}

function replayNext() {
  if (replayState.currentStep < lastGameReplay.moves.length) {
    replayState.currentStep++;
    renderReplayBoard();
    playClickSound();
  }
}

function replayPrev() {
  if (replayState.currentStep > 0) {
    replayState.currentStep--;
    renderReplayBoard();
    playClickSound();
  }
}

function replayTogglePlay() {
  if (replayState.playing) {
    clearInterval(replayState.interval);
    replayState.playing = false;
    replayPlayBtn.textContent = '▶️ تشغيل';
  } else {
    if (replayState.currentStep >= lastGameReplay.moves.length) replayState.currentStep = 0;
    replayState.playing = true;
    replayPlayBtn.textContent = '⏸️ إيقاف';
    replayState.interval = setInterval(() => {
      if (replayState.currentStep >= lastGameReplay.moves.length) {
        clearInterval(replayState.interval);
        replayState.playing = false;
        replayPlayBtn.textContent = '🔄 إعادة';
        return;
      }
      replayState.currentStep++;
      renderReplayBoard();
      playClickSound();
    }, 700);
  }
}

function closeReplay() {
  clearInterval(replayState.interval);
  replayState.playing = false;
  replayModalOverlay.classList.remove('show');
}

// متغير لتتبع استخدام التلميح في المباراة
let currentGameUsedHint = false;

// ===== Event Listeners =====
// إعادة إرفاق أحداث الخلايا (cells متغير)
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
undoBtn.addEventListener('click', undoMove);
hintBtn.addEventListener('click', showHint);
resetBtn.addEventListener('click', () => {
  if (confirm('هل تريد مسح كل النتائج؟')) resetScores();
});

modeBtns.forEach(btn => btn.addEventListener('click', () => changeMode(btn.dataset.mode)));
timerBtns.forEach(btn => btn.addEventListener('click', () => changeTimer(parseInt(btn.dataset.timer))));

themeToggle.addEventListener('click', toggleTheme);
soundToggle.addEventListener('click', toggleSound);
paletteToggle.addEventListener('click', togglePaletteMenu);
statsBtn.addEventListener('click', showStatsModal);
achievementsBtn.addEventListener('click', showAchievementsModal);
helpBtn.addEventListener('click', showHelpModal);

document.querySelectorAll('.palette-option').forEach(btn => {
  btn.addEventListener('click', () => { applyPalette(btn.dataset.palette); playClickSound(); });
});

historyToggle.addEventListener('click', toggleHistory);

playerXName.addEventListener('input', (e) => updatePlayerName('X', e.target.value));
playerOName.addEventListener('input', (e) => updatePlayerName('O', e.target.value));

modalPlayAgain.addEventListener('click', restartGame);
modalClose.addEventListener('click', hideModal);
modalShare.addEventListener('click', shareResult);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hideModal(); });

statsCloseBtn.addEventListener('click', hideStatsModal);
statsClearBtn.addEventListener('click', clearStats);
statsModalOverlay.addEventListener('click', (e) => { if (e.target === statsModalOverlay) hideStatsModal(); });

achievementsCloseBtn.addEventListener('click', hideAchievementsModal);
achievementsModalOverlay.addEventListener('click', (e) => { if (e.target === achievementsModalOverlay) hideAchievementsModal(); });

helpCloseBtn.addEventListener('click', hideHelpModal);
helpModalOverlay.addEventListener('click', (e) => { if (e.target === helpModalOverlay) hideHelpModal(); });

// Close palette menu when clicking outside
document.addEventListener('click', (e) => {
  if (!paletteMenu.contains(e.target) && e.target !== paletteToggle) {
    paletteMenu.classList.remove('show');
  }
});

document.addEventListener('keydown', handleKeyPress);

// ===== v4.0 Event Listeners =====
boardSizeBtns.forEach(btn => btn.addEventListener('click', () => {
  const size = parseInt(btn.dataset.size);
  if (size !== boardSize) changeBoardSize(size);
  playClickSound();
}));

avatarXBtn.addEventListener('click', () => openAvatarModal('X'));
avatarOBtn.addEventListener('click', () => openAvatarModal('O'));
avatarCloseBtn.addEventListener('click', () => avatarModalOverlay.classList.remove('show'));
avatarModalOverlay.addEventListener('click', (e) => { if (e.target === avatarModalOverlay) avatarModalOverlay.classList.remove('show'); });

dailyChallengeBtn.addEventListener('click', openDailyModal);
dailyCloseBtn.addEventListener('click', () => dailyModalOverlay.classList.remove('show'));
dailyStartBtn.addEventListener('click', startDailyChallenge);
dailyModalOverlay.addEventListener('click', (e) => { if (e.target === dailyModalOverlay) dailyModalOverlay.classList.remove('show'); });

replayBtn.addEventListener('click', openReplay);
replayCloseBtn.addEventListener('click', closeReplay);
replayNextBtn.addEventListener('click', replayNext);
replayPrevBtn.addEventListener('click', replayPrev);
replayPlayBtn.addEventListener('click', replayTogglePlay);
replayModalOverlay.addEventListener('click', (e) => { if (e.target === replayModalOverlay) closeReplay(); });

// ===== Initialize =====
loadState();
rebuildBoard(); // بناء اللوحة حسب الحجم المحفوظ
winPatterns = generateWinPatterns(boardSize, boardSize === 3 ? 3 : 4);
winLength = boardSize === 3 ? 3 : 4;
board = new Array(boardSize * boardSize).fill('');
boardSizeBtns.forEach(b => b.classList.toggle('active', parseInt(b.dataset.size) === boardSize));
updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);
renderHistory();
updateUndoButton();
updateReplayButton();
initDailyChallenge();
updateRankDisplay();

// Start timer if enabled
if (timerLimit > 0) startTimer();

console.log('🎮 XO Game v4.0 Loaded');
console.log('⌨️ اختصارات: 1-9 (لعب), R (جولة جديدة), U (تراجع), H (تلميح), T (ثيم), S (صوت), Esc (إغلاق)');
console.log('🆕 v4.0: لوحات 4×4/5×5, نظام الرتب, الأفاتار, التحدي اليومي, إعادة العرض');
console.log(`🏆 الإنجازات المفتوحة: ${unlockedAchievements.size}/${ACHIEVEMENTS.length}`);