const FOCUS_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60;  // 5 minutes
let currentMode = 'focus';
let pomodoroDuration = FOCUS_DURATION;
let timeLeft = pomodoroDuration;
let timerInterval = null;
let isRunning = false;

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
				alert('Focus session complete! Time for a break.');
				switchMode('break');
			} else {
				alert('Break session complete! Time to focus.');
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
	if (currentMode === mode) return;
	currentMode = mode;
	pomodoroDuration = (mode === 'focus') ? FOCUS_DURATION : BREAK_DURATION;
	timeLeft = pomodoroDuration;
	updateDisplay();
	pauseTimer();
	if (focusTab && breakTab) {
		focusTab.classList.toggle('active', mode === 'focus');
		breakTab.classList.toggle('active', mode === 'break');
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
