const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const scoreEls = {
  X: document.getElementById('score-x'),
  O: document.getElementById('score-o'),
  draw: document.getElementById('score-draw'),
};

let board, current, over, mode = 'pvp';
const score = { X: 0, O: 0, draw: 0 };

const cells = Array.from({ length: 9 }, (_, i) => {
  const btn = document.createElement('button');
  btn.className = 'cell';
  btn.setAttribute('aria-label', `Casa ${i + 1}`);
  btn.addEventListener('click', () => play(i));
  boardEl.appendChild(btn);
  return btn;
});

function winner(b) {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { player: b[a], line };
  }
  return b.every(Boolean) ? { player: null } : null;
}

function newGame() {
  board = Array(9).fill(null);
  current = 'X';
  over = false;
  render();
}

function play(i) {
  if (over || board[i]) return;
  if (mode === 'ai' && current === 'O') return;
  move(i);
  if (!over && mode === 'ai') setTimeout(() => move(bestMove()), 300);
}

function move(i) {
  board[i] = current;
  const result = winner(board);
  if (result) {
    over = true;
    score[result.player ?? 'draw']++;
  } else {
    current = current === 'X' ? 'O' : 'X';
  }
  render(result);
}

// Minimax: o computador (O) nunca perde.
function minimax(b, player) {
  const result = winner(b);
  if (result) return result.player === 'O' ? 1 : result.player === 'X' ? -1 : 0;
  const scores = [];
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = player;
    scores.push(minimax(b, player === 'O' ? 'X' : 'O'));
    b[i] = null;
  }
  return player === 'O' ? Math.max(...scores) : Math.min(...scores);
}

function bestMove() {
  let best = -Infinity, choices = [];
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    board[i] = 'O';
    const s = minimax(board, 'X');
    board[i] = null;
    if (s > best) { best = s; choices = [i]; }
    else if (s === best) choices.push(i);
  }
  return choices[Math.floor(Math.random() * choices.length)];
}

function render(result) {
  cells.forEach((cell, i) => {
    cell.textContent = board[i] ?? '';
    cell.className = 'cell' + (board[i] ? ' ' + board[i].toLowerCase() : '');
    cell.disabled = over || !!board[i];
  });
  if (result?.line) result.line.forEach(i => cells[i].classList.add('win'));

  if (result?.player) statusEl.textContent = `${result.player} ganhou!`;
  else if (result) statusEl.textContent = 'Empate!';
  else if (mode === 'ai' && current === 'O') statusEl.textContent = 'O computador está a pensar…';
  else statusEl.textContent = `Vez do ${current}`;

  scoreEls.X.textContent = score.X;
  scoreEls.O.textContent = score.O;
  scoreEls.draw.textContent = score.draw;
}

document.getElementById('restart').addEventListener('click', newGame);
document.getElementById('reset-score').addEventListener('click', () => {
  score.X = score.O = score.draw = 0;
  newGame();
});
document.querySelectorAll('.mode').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode').forEach(b => b.classList.toggle('active', b === btn));
    mode = btn.dataset.mode;
    score.X = score.O = score.draw = 0;
    newGame();
  });
});

newGame();
