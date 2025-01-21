let timer;
let timeLeft;
let isRunning = false;
let isBreak = false;

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
  if (message.timeLeft) {
    const minutes = Math.floor(message.timeLeft / 60);
    const seconds = message.timeLeft % 60;
    document.getElementById('timer').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
});