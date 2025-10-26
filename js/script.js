
const FOCUS_DURATION = 25 * 60; // DEFAULT: 25 minutes
const BREAK_DURATION = 5 * 60;  // DEFAULT: 5 minutes
const LONG_BREAK_DURATION = 30 * 60; // DEFAULT: 30 minutes

let alarmAudio;
window.addEventListener('DOMContentLoaded', () => {
	alarmAudio = new Audio('assets/alarm.mp3');
});

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
			if (alarmAudio) {
				alarmAudio.currentTime = 0;
				alarmAudio.play();
			}
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

const sessionLengthSelect = document.getElementById('session-length');
const examDistanceSelect = document.getElementById('exam-distance');

function sendDurationsToAPI() {
    const sessionLength = sessionLengthSelect.value;
    const examDistance = examDistanceSelect.value;
    fetch('http://localhost:5000/api/durations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_length: sessionLength,
            exam_distance: examDistance
        })
    })
    .then(response => response.json())
    .then(data => {
        if (typeof data.focus_duration === 'number' && typeof data.break_duration === 'number' && typeof data.long_break_duration === 'number') {

            window.FOCUS_DURATION = data.focus_duration * 60;
            window.BREAK_DURATION = data.break_duration * 60;
            window.LONG_BREAK_DURATION = data.long_break_duration * 60;

            alert(`Study Schedule Generated!
				\nFocus Sessions: ${data.focus_duration} minutes
				\nShort Breaks: ${data.break_duration} minutes
				\nLong Breaks: ${data.long_break_duration} minutes`);

            if (currentMode === 'focus') {
                pomodoroDuration = window.FOCUS_DURATION;
            } else if (inLongBreak && currentMode === 'break') {
                pomodoroDuration = window.LONG_BREAK_DURATION;
            } else {
                pomodoroDuration = window.BREAK_DURATION;
            }
            timeLeft = pomodoroDuration;
            updateDisplay();
            pauseTimer();
        }
        console.log('API durations:', data);
    })
    .catch(error => {
        console.error('Error fetching durations:', error);
    });
}

if (sessionLengthSelect && examDistanceSelect) {
}

const pomodoroSetupForm = document.getElementById('pomodoro-setup-form');
if (pomodoroSetupForm) {
	pomodoroSetupForm.addEventListener('submit', function(e) {
		e.preventDefault();
		sendDurationsToAPI();
	});
}

let backgroundAudio;
let isPlaying = false;

window.addEventListener('DOMContentLoaded', () => {
	backgroundAudio = document.getElementById('background-audio');
	
	const playPauseBtn = document.getElementById('play-pause-btn');
	const volumeBtn = document.getElementById('volume-btn');
	const volumeSlider = document.getElementById('volume-slider');
	const playIcon = document.querySelector('.play-icon');
	const pauseIcon = document.querySelector('.pause-icon');
	const volumeIcon = document.querySelector('.volume-icon');
	
	if (backgroundAudio && volumeSlider) {
		backgroundAudio.volume = volumeSlider.value / 100;
	}
	
	if (playPauseBtn && backgroundAudio) {
		playPauseBtn.addEventListener('click', () => {
			if (isPlaying) {
				backgroundAudio.pause();
				isPlaying = false;
				playIcon.style.display = 'inline';
				pauseIcon.style.display = 'none';
			} else {
				backgroundAudio.play().catch(error => {
					console.log('Audio play failed:', error);
					alert('Please click the play button to start the background music.');
				});
				isPlaying = true;
				playIcon.style.display = 'none';
				pauseIcon.style.display = 'inline';
			}
		});
	}
	
	if (volumeSlider && backgroundAudio) {
		volumeSlider.addEventListener('input', () => {
			const volume = volumeSlider.value / 100;
			backgroundAudio.volume = volume;
			
			if (volumeIcon) {
				if (volume === 0) {
					volumeIcon.textContent = '🔇';
				} else if (volume < 0.5) {
					volumeIcon.textContent = '🔉';
				} else {
					volumeIcon.textContent = '🔊';
				}
			}
		});
	}
	
	if (volumeBtn && backgroundAudio && volumeSlider) {
		volumeBtn.addEventListener('click', () => {
			if (backgroundAudio.volume > 0) {
				backgroundAudio.volume = 0;
				volumeSlider.value = 0;
				volumeIcon.textContent = '🔇';
			} else {
				backgroundAudio.volume = 0.5;
				volumeSlider.value = 50;
				volumeIcon.textContent = '🔊';
			}
		});
	}
});
