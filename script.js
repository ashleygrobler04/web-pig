// Sound elements
const sfx = {
  roll: document.getElementById("sound-roll"),
  pigout: document.getElementById("sound-pigout"),
  hold: document.getElementById("sound-hold"),
  win: document.getElementById("sound-win"),
};

function playSound(name) {
  const audio = sfx[name];
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}

const WINNING_SCORE = 100;

let players = [];
let scores = [];
let currentPlayer = 0;
let turnPoints = 0;
let isGameOver = false;

const playerInput = document.getElementById("player-names");
const addBotCheckbox = document.getElementById("add-bot");

const scoresDiv = document.getElementById("scores");
const statusText = document.getElementById("status-text");
const turnPointsEl = document.getElementById("turn-points");
const winnerMessage = document.getElementById("winner-message");

document.getElementById("roll-btn").addEventListener("click", handleRoll);
document.getElementById("hold-btn").addEventListener("click", handleHold);

function startGame() {
  const input = playerInput.value.trim();
  if (!input) return alert("Please enter at least one player name.");

  players = input.split(",").map(p => p.trim()).filter(Boolean);
  if (addBotCheckbox.checked) {
    players.push("SmartBot");
  }

  scores = new Array(players.length).fill(0);
  currentPlayer = 0;
  turnPoints = 0;
  isGameOver = false;

  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "block";
  updateScores();
  updateStatus();

  if (players[currentPlayer] === "SmartBot") {
    botTurn();
  }
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function updateScores() {
  scoresDiv.innerHTML = "";
  players.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "score-block";
    div.innerHTML = `<strong>${p}</strong><br/>Score: ${scores[i]}`;
    scoresDiv.appendChild(div);
  });
}

function updateStatus() {
  if (isGameOver) return;
  statusText.textContent = `${players[currentPlayer]}'s turn`;
  turnPointsEl.textContent = `Turn points: ${turnPoints}`;
}

function nextPlayer() {
  currentPlayer = (currentPlayer + 1) % players.length;
  turnPoints = 0;
  updateStatus();

  if (players[currentPlayer] === "SmartBot") {
    setTimeout(botTurn, 1000);
  }
}

function handleRoll() {
  if (players[currentPlayer] === "SmartBot" || isGameOver) return;

  const roll = rollDice();
  playSound("roll");
  statusText.textContent = `${players[currentPlayer]} rolled a ${roll}`;
  if (roll === 1) {
    playSound("pigout");
    turnPoints = 0;
    updateStatus();
    setTimeout(nextPlayer, 1000);
  } else {
    turnPoints += roll;
    updateStatus();
  }
}

function handleHold() {
  if (players[currentPlayer] === "SmartBot" || isGameOver) return;

  playSound("hold");

  scores[currentPlayer] += turnPoints;
  if (scores[currentPlayer] >= WINNING_SCORE) {
    endGame(players[currentPlayer]);
    return;
  }

  updateScores();
  nextPlayer();
}


function endGame(winner) {
  playSound("win");
  isGameOver = true;
  statusText.textContent = "";
  turnPointsEl.textContent = "";
  winnerMessage.textContent = `🎉 ${winner} wins the game! 🎉`;
}

function botTurn() {
  statusText.textContent = "SmartBot is thinking...";
  let botPoints = 0;

  const interval = setInterval(() => {
    const roll = rollDice();
    playSound("roll");
    statusText.textContent = `SmartBot rolled a ${roll}`;
    if (roll === 1) {
      playSound("pigout")
      botPoints = 0;
      clearInterval(interval);
      updateStatus();
      setTimeout(nextPlayer, 1000);
    } else {
      botPoints += roll;
      let lead = scores[currentPlayer] - Math.max(...scores.filter((_, i) => i !== currentPlayer));
      let projected = scores[currentPlayer] + botPoints;

      if (
        projected >= WINNING_SCORE ||
        (lead >= 15 && botPoints >= 15) ||
        (lead < 0 && botPoints >= 25) ||
        (botPoints >= 20)
      ) {
        scores[currentPlayer] += botPoints;
        updateScores();
        clearInterval(interval);
        if (scores[currentPlayer] >= WINNING_SCORE) {
          endGame("SmartBot");
        } else {
          setTimeout(nextPlayer, 1000);
        }
      } else {
        updateStatus();
      }
    }
  }, 1000);
}
