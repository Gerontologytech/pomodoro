let timer;
let timeLeft;
let isBreak = false;
let autoRestart = true;

// Session log structure
const createSessionLog = () => ({
  startTime: new Date().toISOString(),
  endTime: null,
  type: isBreak ? 'break' : 'work',
  duration: isBreak ? 300 : 1500,
  completed: false
});

let currentSession = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === 'startTimer') {
    startTimer();
  } else if (message.command === 'pauseTimer') {
    pauseTimer();
  } else if (message.command === 'resetTimer') {
    resetTimer();
  }
});

function updateBadge(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  chrome.action.setBadgeText({ text: display });
  chrome.action.setBadgeBackgroundColor({ color: isBreak ? '#FF0000' : '#4CAF50' });
}

function startTimer() {
  timeLeft = isBreak ? 300 : 1500; // 5 minutes or 25 minutes in seconds
  
  // Create new session log
  currentSession = createSessionLog();
  
  // Initialize badge
  updateBadge(timeLeft);
  
  timer = setInterval(() => {
    timeLeft--;
    
    // Send time update to popup and update badge
    chrome.runtime.sendMessage({ timeLeft: timeLeft });
    updateBadge(timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      
      // Log completed session
      currentSession.completed = true;
      currentSession.endTime = new Date().toISOString();
      saveSessionLog(currentSession);
      
      if (!isBreak) {
        // Work session ended, start break
        isBreak = true;
        createBreakTab();
      } else {
        // Break ended
        isBreak = false;
        chrome.tabs.query({ url: chrome.runtime.getURL("break.html") }, (tabs) => {
          tabs.forEach(tab => chrome.tabs.remove(tab.id));
        });
        
        // Auto-restart work session if enabled
        if (autoRestart) {
          setTimeout(() => {
            isBreak = false;
            startTimer();
          }, 1000);
        }
      }
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  if (currentSession) {
    currentSession.completed = false;
    currentSession.endTime = new Date().toISOString();
    saveSessionLog(currentSession);
  }
}

function resetTimer() {
  clearInterval(timer);
  if (currentSession) {
    currentSession.completed = false;
    currentSession.endTime = new Date().toISOString();
    saveSessionLog(currentSession);
  }
  timeLeft = 1500;
  isBreak = false;
  chrome.runtime.sendMessage({ timeLeft: timeLeft });
}

// Save session log to chrome storage
function saveSessionLog(session) {
  chrome.storage.local.get(['sessionLogs'], function(result) {
    const logs = result.sessionLogs || [];
    logs.push(session);
    chrome.storage.local.set({ sessionLogs: logs });
  });
}

// Function to get all session logs
function getAllLogs(callback) {
  chrome.storage.local.get(['sessionLogs'], function(result) {
    callback(result.sessionLogs || []);
  });
}

function createBreakTab() {
  chrome.tabs.create({
    url: 'break.html',
    active: true
  });
}
