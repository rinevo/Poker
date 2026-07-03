const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const ranks = ['a', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];
const dealBtn = document.getElementById('dealBtn');
const drawBtn = document.getElementById('drawBtn');
const resetBtn = document.getElementById('resetBtn');
const deckCountEl = document.getElementById('deckCount');
const holdCountEl = document.getElementById('holdCount');
const handRankEl = document.getElementById('handRank');
const gameStateEl = document.getElementById('gameState');
const cardsEl = document.getElementById('cards');
const resultText = document.getElementById('resultText');

let deck = [];
let hand = [];
let holds = [false, false, false, false, false];
let roundStarted = false;
let drawUsed = false;

function createDeck() {
  const d = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      d.push({ suit, rank, image: `cards/${suit}_${rank}.svg`, value: getCardValue(rank) });
    });
  });
  return d;
}

function getCardValue(rank) {
  if (rank === 'a') return 14;
  if (rank === 'k') return 13;
  if (rank === 'q') return 12;
  if (rank === 'j') return 11;
  return Number(rank);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function deal() {
  deck = createDeck();
  shuffle(deck);
  hand = [];
  holds = [false, false, false, false, false];
  drawUsed = false;
  roundStarted = true;
  for (let i = 0; i < 5; i += 1) {
    hand.push(deck.pop());
  }
  updateUI('配られました。カードをクリックしてホールドし、ドローしてください。');
  drawBtn.disabled = false;
  resetBtn.disabled = false;
  updateHand();
}

function draw() {
  if (!roundStarted || drawUsed) return;
  for (let i = 0; i < 5; i += 1) {
    if (!holds[i]) {
      hand[i] = deck.pop();
    }
  }
  drawUsed = true;
  updateHand();
  const rankName = evaluateHand(hand).name;
  updateUI(`ドロー完了。あなたの役は「${rankName}」です。`);
  drawBtn.disabled = true;
  if (rankName === 'ロイヤルフラッシュ' || rankName === 'ストレートフラッシュ' || rankName === 'フォーカード') {
    resultText.innerHTML += '<br><strong>強い役が出ました！</strong>';
  }
}

function resetGame() {
  deck = [];
  hand = [];
  holds = [false, false, false, false, false];
  roundStarted = false;
  drawUsed = false;
  drawBtn.disabled = true;
  resetBtn.disabled = true;
  handRankEl.textContent = '-';
  gameStateEl.textContent = '待機中';
  deckCountEl.textContent = 52;
  holdCountEl.textContent = 0;
  cardsEl.innerHTML = '';
  resultText.textContent = 'まず「配る」を押してください。';
}

function toggleHold(index) {
  if (!roundStarted || drawUsed) return;
  holds[index] = !holds[index];
  updateHand();
}

function updateHand() {
  cardsEl.innerHTML = '';
  hand.forEach((card, index) => {
    const slot = document.createElement('label');
    slot.className = 'card-slot';
    if (holds[index]) slot.classList.add('selected');

    const img = document.createElement('img');
    img.src = card.image;
    img.alt = `${card.rank} of ${card.suit}`;
    slot.appendChild(img);

    const tag = document.createElement('span');
    tag.className = 'label';
    tag.textContent = holds[index] ? '保持中' : 'クリックで保持';
    slot.appendChild(tag);

    slot.addEventListener('click', () => toggleHold(index));
    cardsEl.appendChild(slot);
  });

  const handRank = evaluateHand(hand);
  handRankEl.textContent = handRank.name;
  deckCountEl.textContent = deck.length;
  holdCountEl.textContent = holds.filter(Boolean).length;
}

function updateUI(message) {
  resultText.textContent = message;
  gameStateEl.textContent = drawUsed ? 'ドロー済み' : 'ドロー待ち';
  if (!roundStarted) gameStateEl.textContent = '待機中';
}

function evaluateHand(cards) {
  const values = cards.map(card => card.value).sort((a, b) => a - b);
  const suits = cards.map(card => card.suit);
  const counts = {};
  values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  const uniqueValues = Object.keys(counts).map(Number).sort((a,b)=>a-b);
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = isSequential(values);
  const countsArr = Object.values(counts).sort((a,b)=>b-a);
  const highCard = Math.max(...values);
  const lowCard = Math.min(...values);

  if (isStraight && isFlush && values[0] === 10) return { name: 'ロイヤルフラッシュ', rank: 10 };
  if (isStraight && isFlush) return { name: 'ストレートフラッシュ', rank: 9 };
  if (countsArr[0] === 4) return { name: 'フォーカード', rank: 8 };
  if (countsArr[0] === 3 && countsArr[1] === 2) return { name: 'フルハウス', rank: 7 };
  if (isFlush) return { name: 'フラッシュ', rank: 6 };
  if (isStraight) return { name: 'ストレート', rank: 5 };
  if (countsArr[0] === 3) return { name: 'スリーカード', rank: 4 };
  if (countsArr[0] === 2 && countsArr[1] === 2) return { name: 'ツーペア', rank: 3 };
  if (countsArr[0] === 2) return { name: 'ワンペア', rank: 2 };
  return { name: 'ハイカード', rank: 1, highCard };
}

function isSequential(values) {
  const unique = [...new Set(values)];
  if (unique.length !== 5) return false;
  const sorted = unique.slice().sort((a, b) => a - b);
  const regular = sorted.every((value, index) => index === 0 || value === sorted[index - 1] + 1);
  const wheel = sorted.join(',') === '2,3,4,5,14';
  return regular || wheel;
}

dealBtn.addEventListener('click', deal);
drawBtn.addEventListener('click', draw);
resetBtn.addEventListener('click', resetGame);

resetGame();
