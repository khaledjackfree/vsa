// ===== XO Game Logic v2.0 =====

// ===== عناصر DOM =====
const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const resetBtn = document.getElementById('resetBtn');
const undoBtn = document.getElementById('undoBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
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
const historyToggle = document.getElementById('historyToggle');
const historyList = document.getElementById('historyList');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalPlayAgain = document.getElementById('modalPlayAgain');
const modalClose = document.getElementById('modalClose');

// ===== حالة اللعبة =====
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let startingPlayer = 'X'; // يتبادل كل جولة
let gameActive = true;
let gameMode = 'pvp'; // pvp | easy | medium | hard
let scores = { X: 0, O: 0, D: 0 };
let moveHistory = []; // { index, player, moveNumber }
let soundEnabled = true;
let names = { X: 'اللاعب X', O: 'اللاعب O' };

// ===== خطوط الفوز =====
const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // أفقي
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // عمودي
  [0, 4, 8], [2, 4, 6]             // قطري
];

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
  // ثلاث نوتات صاعدة
  playTone(523, 0.15, 'sine', 0.15);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.15), 120);
  setTimeout(() => playTone(784, 0.3, 'sine', 0.15), 240);
}
function playDrawSound() { playTone(300, 0.3, 'triangle', 0.1); }
function playUndoSound() { playTone(350, 0.1, 'sawtooth', 0.08); }

// ===== localStorage =====
function loadState() {
  const savedScores = localStorage.getItem('xo-scores');
  if (savedScores) {
    try { scores = JSON.parse(savedScores); } catch(e) {}
  }

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
    try {
      names = JSON.parse(savedNames);
      playerXName.value = names.X;
      playerOName.value = names.O;
    } catch(e) {}
  }

  updateScoreDisplay();
  updateLabels();
}

function saveScores() {
  localStorage.setItem('xo-scores', JSON.stringify(scores));
}

function saveNames() {
  localStorage.setItem('xo-names', JSON.stringify(names));
}

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
      void el.offsetWidth; // إعادة تشغيل الأنيميشن
      el.classList.add('updated');
    }
  }
}

function updateLabels() {
  const nameX = names.X || 'اللاعب X';
  const nameO = gameMode === 'pvp' ? (names.O || 'اللاعب O') : '🤖 الكمبيوتر';
  labelX.textContent = `❌ ${nameX}`;
  labelO.textContent = `⭕ ${nameO}`;

  // تعطيل إدخال اسم اللاعب O عند اللعب ضد الكمبيوتر
  playerOName.disabled = (gameMode !== 'pvp');
  playerOName.style.opacity = playerOName.disabled ? '0.5' : '1';
}

function updateStatus(text) {
  statusEl.textContent = text;
}

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

  // إضافة إلى السجل
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

  // منع الضغط وقت دور الكمبيوتر
  if (gameMode !== 'pvp' && currentPlayer === 'O') return;

  playClickSound();
  makeMove(index, currentPlayer);

  const result = checkWinner();
  if (result) return endGame(result);

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);

  if (gameActive && gameMode !== 'pvp' && currentPlayer === 'O') {
    setTimeout(computerMove, 450);
  }
}

// ===== حركات الكمبيوتر =====
function computerMove() {
  if (!gameActive) return;

  let index;
  if (gameMode === 'easy') {
    index = getRandomMove();
  } else if (gameMode === 'medium') {
    // متوسط: 50% ذكي - 50% عشوائي
    index = Math.random() < 0.5 ? getBestMove() : getRandomMove();
  } else {
    // صعب - Minimax
    index = getBestMove();
  }

  playClickSound();
  makeMove(index, 'O');

  const result = checkWinner();
  if (result) return endGame(result);

  currentPlayer = 'X';
  updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);
}

function getRandomMove() {
  const empty = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getBestMove() {
  let bestScore = -Infinity;
  let bestMove = 0;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function minimax(boardState, depth, isMaximizing) {
  const result = checkWinner(boardState);
  if (result) {
    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.winner === 'draw') return 0;
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === '') {
        boardState[i] = 'O';
        best = Math.max(best, minimax(boardState, depth + 1, false));
        boardState[i] = '';
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === '') {
        boardState[i] = 'X';
        best = Math.min(best, minimax(boardState, depth + 1, true));
        boardState[i] = '';
      }
    }
    return best;
  }
}

// ===== انتهاء اللعبة =====
function endGame(result) {
  gameActive = false;
  let modalTitleText, modalMsg;

  if (result.winner === 'draw') {
    updateStatus('🤝 تعادل!');
    scores.D++;
    modalTitleText = '🤝 تعادل!';
    modalMsg = 'لعبة متكافئة! جربوا مرة أخرى.';
    playDrawSound();
    updateScoreDisplay('D');
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
  }
  saveScores();
  updateUndoButton();

  // عرض المودال بعد فترة قصيرة
  setTimeout(() => showModal(modalTitleText, modalMsg), 800);
}

// ===== المودال =====
function showModal(title, message) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalOverlay.classList.add('show');
}

function hideModal() {
  modalOverlay.classList.remove('show');
}

// ===== الكونفيتي =====
function launchConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#c5a3ff'];
  const count = 50;
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

// ===== زر التراجع (Undo) =====
function updateUndoButton() {
  undoBtn.disabled = moveHistory.length === 0 || !gameActive;
}

function undoMove() {
  if (moveHistory.length === 0) return;

  // في وضع الكمبيوتر، نتراجع حركتين (حركة اللاعب + حركة الكمبيوتر)
  const stepsBack = (gameMode !== 'pvp' && moveHistory.length >= 2) ? 2 : 1;

  for (let s = 0; s < stepsBack && moveHistory.length > 0; s++) {
    const last = moveHistory.pop();
    board[last.index] = '';
    cells[last.index].textContent = '';
    cells[last.index].classList.remove('taken', 'x', 'o', 'winner');
  }

  // تحديث الدور الحالي
  if (moveHistory.length === 0) {
    currentPlayer = startingPlayer;
  } else {
    const lastMove = moveHistory[moveHistory.length - 1];
    currentPlayer = lastMove.player === 'X' ? 'O' : 'X';
  }

  // إعادة تمكين اللعبة إذا كانت منتهية
  gameActive = true;
  cells.forEach(c => c.classList.remove('winner'));
  updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);
  playUndoSound();
  renderHistory();
  updateUndoButton();
}

// ===== سجل الحركات =====
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

// ===== إعادة الجولة =====
function restartGame() {
  // تبديل من يبدأ
  startingPlayer = startingPlayer === 'X' ? 'O' : 'X';
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = startingPlayer;
  gameActive = true;
  moveHistory = [];

  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('taken', 'x', 'o', 'winner');
  });

  updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);
  renderHistory();
  updateUndoButton();
  hideModal();

  // إذا كان الكمبيوتر يبدأ
  if (gameMode !== 'pvp' && currentPlayer === 'O') {
    setTimeout(computerMove, 500);
  }
}

// ===== مسح النتائج =====
function resetScores() {
  scores = { X: 0, O: 0, D: 0 };
  updateScoreDisplay();
  saveScores();
  startingPlayer = 'O'; // restartGame ستقلبها إلى X
  restartGame();
}

// ===== تغيير وضع اللعب =====
function changeMode(mode) {
  gameMode = mode;
  modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  updateLabels();
  startingPlayer = 'O'; // restartGame ستقلبها إلى X
  restartGame();
}

// ===== الثيم =====
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

// ===== الصوت =====
function toggleSound() {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
  localStorage.setItem('xo-sound', soundEnabled ? 'on' : 'off');
  if (soundEnabled) playClickSound();
}

// ===== أسماء اللاعبين =====
function updatePlayerName(player, value) {
  names[player] = value.trim() || (player === 'X' ? 'اللاعب X' : 'اللاعب O');
  saveNames();
  updateLabels();
  if (gameActive) {
    updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);
  }
}

// ===== التحكم بلوحة المفاتيح =====
function handleKeyPress(e) {
  if (modalOverlay.classList.contains('show')) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      restartGame();
    } else if (e.key === 'Escape') {
      hideModal();
    }
    return;
  }

  // تجاهل إذا كان المستخدم يكتب في حقل إدخال
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
  } else if (key.toLowerCase() === 't') {
    toggleTheme();
  } else if (key.toLowerCase() === 's') {
    toggleSound();
  }
}

// ===== مستمعي الأحداث =====
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
undoBtn.addEventListener('click', undoMove);
resetBtn.addEventListener('click', () => {
  if (confirm('هل تريد مسح كل النتائج؟')) resetScores();
});
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => changeMode(btn.dataset.mode));
});

themeToggle.addEventListener('click', toggleTheme);
soundToggle.addEventListener('click', toggleSound);
historyToggle.addEventListener('click', toggleHistory);

playerXName.addEventListener('input', (e) => updatePlayerName('X', e.target.value));
playerOName.addEventListener('input', (e) => updatePlayerName('O', e.target.value));

modalPlayAgain.addEventListener('click', restartGame);
modalClose.addEventListener('click', hideModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) hideModal();
});

document.addEventListener('keydown', handleKeyPress);

// ===== تشغيل اللعبة =====
loadState();
updateStatus(`دور: ${getPlayerDisplay(currentPlayer)}`);
renderHistory();
updateUndoButton();

console.log('🎮 XO Game v2.0 Loaded');
console.log('⌨️ اختصارات: 1-9 (لعب), R (إعادة), U (تراجع), T (ثيم), S (صوت)');