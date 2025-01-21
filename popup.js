let timer;
let timeLeft;
let isRunning = false;
let isBreak = false;

// Function to update timer display
function updateDisplay(time, isBreak) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerElement = document.getElementById('timer');
    timerElement.textContent = display;
    
    // Update timer color based on session type
    timerElement.style.color = isBreak ? '#FF4444' : '#4CAF50';
    
    // Update start button text
    const startBtn = document.getElementById('startBtn');
    if (startBtn.textContent !== 'Pause') {
        startBtn.textContent = isBreak ? 'Break' : 'Start';
    }
}

// Initialize auto-restart checkbox state
chrome.storage.local.get(['autoRestart'], function(result) {
    const autoRestartCheckbox = document.getElementById('autoRestartCheckbox');
    autoRestartCheckbox.checked = result.autoRestart !== false; // Default to true
});

// Add event listener for auto-restart checkbox
document.getElementById('autoRestartCheckbox').addEventListener('change', (e) => {
    chrome.storage.local.set({ autoRestart: e.target.checked });
    chrome.runtime.sendMessage({ command: 'setAutoRestart', value: e.target.checked });
});

// Add event listener for view logs button
document.getElementById('viewLogsBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'logs.html' });
});

document.getElementById('startBtn').addEventListener('click', () => {
  if (!isRunning) {
    isRunning = true;
    chrome.runtime.sendMessage({ command: 'startTimer' });
    document.getElementById('startBtn').textContent = 'Pause';
  } else {
    isRunning = false;
    chrome.runtime.sendMessage({ command: 'pauseTimer' });
    document.getElementById('startBtn').textContent = 'Start';
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: 'resetTimer' });
  isRunning = false;
  document.getElementById('startBtn').textContent = 'Start';
  document.getElementById('timer').textContent = '25:00';
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.timeLeft !== undefined) {
    isBreak = message.isBreak;
    updateDisplay(message.timeLeft, message.isBreak);
    if (message.timeLeft > 0) {
      isRunning = true;
      document.getElementById('startBtn').textContent = 'Pause';
    }
  }
});