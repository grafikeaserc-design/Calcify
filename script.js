const splash_screen = document.getElementsByClassName('splash-screen');
const game_screen = document.getElementsByClassName('game-screen');

const question_expression = document.getElementById('question-expression');
const user_input = document.getElementById('answer-input');

const feedbackScreen = document.getElementById('feedback-screen');
const feedbackText = document.getElementById('feedback-text');

var current_answer = 0;
function getRandomInt(min,max){
    return Math.floor(Math.random() * (max - min +1))+min;
}

function getNumberByDigits(digits) {
    if (digits === 1) {
        return getRandomInt(0, 9);
    }
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return getRandomInt(min, max);
}

function generateQuestion(){
    const operators = ['+','-','*','/'];
    const operator = operators[getRandomInt(0,operators.length-1)];

    let num1 , num2 ;

    switch (operator) {
        case '+':
            num1 = getNumberByDigits(selectedDigits);
            num2 = getNumberByDigits(selectedDigits);
            current_answer = num1 + num2;
            break;
        case '-':
            num1 = getNumberByDigits(selectedDigits);
            num2 = getNumberByDigits(selectedDigits);
            current_answer = num1 - num2;
            break;
        case '*':
            num1 = getNumberByDigits(selectedDigits);
            num2 = getNumberByDigits(selectedDigits);
            current_answer = num1 * num2;
            break;
        case '/':
            //i will try to not make division messy with decimal numbers for now.
            num2 = getRandomInt(2,12);
            current_answer = getRandomInt(1,12);
            num1 = num2 * current_answer;
            break;
        default:
            break;
    }

    question_expression.textContent =`${num1} ${operator} ${num2} ?`;

}
//generateQuestion();

//modes
let selectedTime = 15;
let selectedDigits = 1;
let timeLeft = 15;
let elapsedTime = 0;
let timerInterval = null;
let gameActive = false;
let score = 0;

// Session Metrics
let totalAttempted = 0;
let wrongCount = 0;
let questionTimes = [];
let questionStartTime = null;

const timerDisplay = document.getElementById('timer-display');
const modeBtns = document.querySelectorAll('.mode-btn');
const digitBtns = document.querySelectorAll('.digit-btn');
const summaryOverlay = document.getElementById('summary-overlay');
const finishBtn = document.getElementById('finish-btn');
const summaryTitle = document.getElementById('summary-title');

//mode selector
modeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const modeVal = btn.dataset.time;
    selectedTime = modeVal === 'infinite' ? 'infinite' : parseInt(modeVal, 10);
    resetGame();
  });
});

//digit selector
digitBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    digitBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDigits = parseInt(btn.dataset.digits, 10);
    resetGame();
  });
});

function generateNextQuestion() {
  generateQuestion();
  questionStartTime = performance.now();
}

// timer starts on first typed character
function startGameTimer() {
  if (gameActive) return;
  gameActive = true;

  timerInterval = setInterval(() => {
    if (selectedTime === 'infinite') {
      elapsedTime++;
      timerDisplay.textContent = `${elapsedTime}s`;
    } else {
      timeLeft--;
      timerDisplay.textContent = timeLeft;
      if (timeLeft <= 0) {
        endGame();
      }
    }
  }, 1000);
}
//end game
function endGame() {
  clearInterval(timerInterval);
  gameActive = false;
  user_input.disabled = true;
  //timerDisplay.textContent = '0';
  let avgTime = 0;
  if (questionTimes.length > 0) {
    const totalDuration = questionTimes.reduce((acc, curr) => acc + curr, 0);
    avgTime = (totalDuration / questionTimes.length).toFixed(2);
  }
  summaryTitle.textContent = selectedTime === 'infinite' ? 'Session Complete!' : "Time's Up!";

  document.getElementById('stat-attempted').textContent = totalAttempted;
  document.getElementById('stat-wrong').textContent = wrongCount;
  document.getElementById('stat-avg-time').textContent = `${avgTime}s`;

  summaryOverlay.classList.remove('hidden');
}
//reset game
function resetGame() {
  clearInterval(timerInterval);
  gameActive = false;
  timeLeft = selectedTime;
  elapsedTime = 0;
  //score = 0;
  // stats 
  totalAttempted = 0;
  wrongCount = 0;
  questionTimes = [];
  questionStartTime = null;

  if (selectedTime === 'infinite') {
    timerDisplay.textContent = '0s';
    finishBtn.classList.remove('hidden');
  } else {
    timeLeft = selectedTime;
    timerDisplay.textContent = timeLeft;
    finishBtn.classList.add('hidden');
  }

  timerDisplay.textContent = timeLeft;
  user_input.disabled = false;
  user_input.value = '';
  user_input.focus();
  summaryOverlay.classList.add('hidden');
  generateQuestion();
}


//feedback
function showFeedbackScreen(isCorrect, callback) {
  if (isCorrect) {
    feedbackText.textContent = 'CORRECT!';
    feedbackScreen.className = 'show correct-bg';
  } else {
    feedbackText.textContent = 'WRONG!';
    feedbackScreen.className = 'show wrong-bg';
  }
  setTimeout(() => {
    feedbackScreen.classList.remove('show');
    user_input.value = '';
    user_input.focus();
    if (callback) callback();
  }, 450);
}

//user inputs

user_input.addEventListener('input',(e)=>{
    const value = e.target.value.trim();
    if (value === '')return;

    if (!gameActive && timeLeft === selectedTime) {
        startGameTimer();
    }

    if (parseInt(value,10) === current_answer){
        //console.log("correct"); 
        // score++;
        const elapsedSeconds = (performance.now() - questionStartTime) / 1000;
        questionTimes.push(elapsedSeconds);
        totalAttempted++;
        showFeedbackScreen(true,generateQuestion)
    }
});
user_input.addEventListener('keydown',(e)=>{
    if (e.key === 'Enter') {
    const value = user_input.value.trim();
    if (value === '' ) {
      user_input.classList.add('shake');
      setTimeout(() => user_input.classList.remove('shake'), 300);
    }else if(value !== '' && parseInt(value, 10) !== current_answer){
        showFeedbackScreen(false);
    }
  }
});
//keybinding to reset 
window.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    resetGame();
  }
});
document.getElementById('restart-btn').addEventListener('click', () => {
  resetGame();
});
document.getElementById('summary-restart-btn').addEventListener('click', () => {
  resetGame();
});
finishBtn.addEventListener('click', endGame);

resetGame();