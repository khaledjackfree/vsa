// ===== XO Game Logic =====

// عناصر DOM
const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const resetBtn = document.getElementById('resetBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDEl = document.getElementById('scoreD');

// حالة اللعبة
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // pvp | easy | hard
let scores = { X: 0, O: 0, D: 0 };

// تحميل النتائج من localStorage
function loadScores() {
  const saved = localStorage.getItem('xo-scores');
  if (saved) {
    scores = JSON.parse(saved);
    updateScoreDisplay();
  }
}

function saveScores() {
  localStorage.setItem('xo-scores', JSON.stringify(scores));
}

function updateScoreDisplay() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;
}

// خطوط الفوز الممكنة
const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // أفقي
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // عمودي
  [0, 4, 8], [2, 4, 6]             // قطري
];

// التحقق من الفوز
function checkWinner(boardState = board) {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return { winner: boardState[a], pattern };
    }
  }
  if (!boardState.includes('')) {
    return { winner: 'draw', pattern: null };
  }
  return null;
}

// تحديث حالة اللعبة النصية
function updateStatus(text) {
  statusEl.textContent = text;
}

// تمييز خلايا الفوز
function highlightWinner(pattern) {
  pattern.forEach(i => cells[i].classList.add('winner'));
}

// معالجة النقر على الخلية
function handleCellClick(e) {
  const index = parseInt(e.target.dataset.index);

  if (!gameActive || board[index] !== '') return;

  makeMove(index, currentPlayer);

  const result = checkWinner();
  if (result) {
    endGame(result);
    return;
  }

  // تبديل الدور
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`دور اللاعب: ${currentPlayer === 'X' ? '❌ X' : '⭕ O'}`);

  // إذا كان ضد الكمبيوتر، يلعب الكمبيوتر
  if (gameActive && gameMode !== 'pvp' && currentPlayer === 'O') {
    setTimeout(computerMove, 500);
  }
}

// تنفيذ حركة
function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add('taken', player.toLowerCase());
}

// حركة الكمبيوتر
function computerMove() {
  if (!gameActive) return;

  let index;
  if (gameMode === 'easy') {
    index = getRandomMove();
  } else {
    // صعب - استخدام Minimax
    index = getBestMove();
  }

  makeMove(index, 'O');

  const result = checkWinner();
  if (result) {
    endGame(result);
    return;
  }

  currentPlayer = 'X';
  updateStatus(`دور اللاعب: ❌ X`);
}

// حركة عشوائية (مستوى سهل)
function getRandomMove() {
  const empty = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

// الحركة الأفضل باستخدام خوارزمية Minimax (مستوى صعب)
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

// انتهاء اللعبة
function endGame(result) {
  gameActive = false;
  if (result.winner === 'draw') {
    updateStatus('🤝 تعادل!');
    scores.D++;
  } else {
    const winnerName = result.winner === 'X' ? '❌ X' : '⭕ O';
    updateStatus(`🎉 فاز ${winnerName}!`);
    scores[result.winner]++;
    highlightWinner(result.pattern);
  }
  updateScoreDisplay();
  saveScores();
}

// إعادة الجولة
function restartGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('taken', 'x', 'o', 'winner');
  });
  updateStatus('دور اللاعب: ❌ X');
}

// مسح النتائج
function resetScores() {
  scores = { X: 0, O: 0, D: 0 };
  updateScoreDisplay();
  saveScores();
  restartGame();
}

// تغيير وضع اللعب
function changeMode(mode) {
  gameMode = mode;
  modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  restartGame();
}

// ===== Event Listeners =====
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
resetBtn.addEventListener('click', () => {
  if (confirm('هل تريد مسح كل النتائج؟')) resetScores();
});
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => changeMode(btn.dataset.mode));
});

// تشغيل اللعبة
loadScores();