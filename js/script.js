const FOCUS_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60;  // 5 minutes
const LONG_BREAK_DURATION = 30 * 30; // 30 minutes

let currentMode = 'focus';
let pomodoroDuration = FOCUS_DURATION;
let timeLeft = pomodoroDuration;
let timerInterval = null;
let isRunning = false;
let pomodoroCount = 0;
let inLongBreak = false;

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const focusTab = document.getElementById('focus-tab');
const breakTab = document.getElementById('break-tab');

function updateDisplay() {
	const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
	const seconds = String(timeLeft % 60).padStart(2, '0');
	timerDisplay.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
	if (isRunning) return;
	isRunning = true;
	timerInterval = setInterval(() => {
		if (timeLeft > 0) {
			timeLeft--;
			updateDisplay();
		} else {
			clearInterval(timerInterval);
			isRunning = false;
			if (currentMode === 'focus') {
				pomodoroCount++;
				alert('Focus session complete! Time for a break.');
				switchMode('break');
			} else if (currentMode === 'break' && !inLongBreak) {
				if (pomodoroCount % 4 === 0) {
					alert('Short break complete! Time for a long break.');
					inLongBreak = true;
					switchToLongBreak();
				} else {
					alert('Break session complete! Time to focus.');
					switchMode('focus');
				}
			} else if (inLongBreak) {
				alert('Long break complete! Time to focus.');
				inLongBreak = false;
				switchMode('focus');
			}
		}
	}, 1000);
}

function pauseTimer() {
	clearInterval(timerInterval);
	isRunning = false;
}

function resetTimer() {
	clearInterval(timerInterval);
	isRunning = false;
	timeLeft = pomodoroDuration;
	updateDisplay();
}

function switchMode(mode) {
	if (currentMode === mode && !inLongBreak) return;
	currentMode = mode;
	if (inLongBreak && mode === 'break') {
		pomodoroDuration = LONG_BREAK_DURATION;
	} else {
		pomodoroDuration = (mode === 'focus') ? FOCUS_DURATION : BREAK_DURATION;
	}
	timeLeft = pomodoroDuration;
	updateDisplay();
	pauseTimer();
	if (focusTab && breakTab) {
		focusTab.classList.toggle('active', mode === 'focus');
		breakTab.classList.toggle('active', mode === 'break');
	}
}

function switchToLongBreak() {
	currentMode = 'break';
	pomodoroDuration = LONG_BREAK_DURATION;
	timeLeft = pomodoroDuration;
	updateDisplay();
	pauseTimer();
	if (focusTab && breakTab) {
		focusTab.classList.remove('active');
		breakTab.classList.add('active');
	}
}

if (timerDisplay && startBtn && pauseBtn && resetBtn && focusTab && breakTab) {
	updateDisplay();
	startBtn.addEventListener('click', startTimer);
	pauseBtn.addEventListener('click', pauseTimer);
	resetBtn.addEventListener('click', resetTimer);
	focusTab.addEventListener('click', () => switchMode('focus'));
	breakTab.addEventListener('click', () => switchMode('break'));
}
