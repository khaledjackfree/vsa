// ===== XO Game Logic v3.0 =====

// ===== عناصر DOM =====
const cells = document.querySelectorAll('.cell');
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

// ===== حالة اللعبة =====
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

// ===== خطوط الفوز =====
const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // أفقي
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // عمودي
  [0, 4, 8], [2, 4, 6]             // قطري
];

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
  } catch (e) {
    console.warn('Error loading state:', e);
  }

  updateScoreDisplay();
  updateLabels();
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
  labelX.textContent = `❌ ${nameX}`;
  labelO.textContent = `⭕ ${nameO}`;

  playerOName.disabled = (gameMode !== 'pvp');
  playerOName.style.opacity = playerOName.disabled ? '0.5' : '1';
}

function updateStatus(text) { statusEl.textContent = text; }

function getPlayerDisplay(player) {
  if (player === 'X') return `❌ ${names.X || 'اللاعب X'}`;
  return gameMode === 'pvp'
    ? `⭕ ${names.O || 'اللاعب O'}`
    : '⭕ 🤖 الكمبيوتر';
}

// ===== منطق اللعبة =====
function checkWinner(boardState = board) {
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return { winner: boardState[a], pattern };
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
  // Minimax حيث forPlayer هو الذي يحاول التعظيم
  const opponent = forPlayer === 'O' ? 'X' : 'O';
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = forPlayer;
      const score = minimax(board, 0, false, forPlayer, opponent);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function minimax(boardState, depth, isMaximizing, maxPlayer, minPlayer) {
  const result = checkWinner(boardState);
  if (result) {
    if (result.winner === maxPlayer) return 10 - depth;
    if (result.winner === minPlayer) return depth - 10;
    if (result.winner === 'draw') return 0;
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === '') {
        boardState[i] = maxPlayer;
        best = Math.max(best, minimax(boardState, depth + 1, false, maxPlayer, minPlayer));
        boardState[i] = '';
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === '') {
        boardState[i] = minPlayer;
        best = Math.min(best, minimax(boardState, depth + 1, true, maxPlayer, minPlayer));
        boardState[i] = '';
      }
    }
    return best;
  }
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
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = startingPlayer;
  gameActive = true;
  moveHistory = [];
  currentGameUsedUndo = false;

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

// ===== Event Listeners =====
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

// ===== Initialize =====
loadState();
updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);
renderHistory();
updateUndoButton();
// Start timer if enabled
if (timerLimit > 0) startTimer();

console.log('🎮 XO Game v3.0 Loaded');
console.log('⌨️ اختصارات: 1-9 (لعب), R (جولة جديدة), U (تراجع), H (تلميح), T (ثيم), S (صوت), Esc (إغلاق)');
console.log(`🏆 الإنجازات المفتوحة: ${unlockedAchievements.size}/${ACHIEVEMENTS.length}`);