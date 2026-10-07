//Boring copyright stuff or smthing
console.log(
  "I got this cool trash icon from https://www.flaticon.com/free-icon/bin_484611?term=delete&page=1&position=2&origin=tag&related_id=484611",
);

const el_btnOpenDisplay = document.getElementById("btnOpenDisplay");
const el_counterDisplay = document.getElementById("counter");

/////////////////////////////////////////////////////////////////
//                     Helper FUnctions                        //
/////////////////////////////////////////////////////////////////

function clickDispayButton(buttonElement, newValue) {
  if (newValue == true) {
    buttonElement.style.backgroundColor = "blue";
    buttonElement.style.color = "white";
  } else {
    buttonElement.style.backgroundColor = "white";
    buttonElement.style.color = "black";
  }
}

/////////////////////////////////////////////////////////////////
//                            COUNTER                          //
/////////////////////////////////////////////////////////////////

let counter = new Counter();
counter.setTime(0, 5, 0, 0);

function displayCounter() {
  el_counterDisplay.textContent = counter.format_signed(showMs);
}

/////////////////////////////////////////////////////////////////
//                      Event Handlers                         //
/////////////////////////////////////////////////////////////////

//Display Settings buttons
const el_displaySetting_hide = document.getElementById("hide");
const el_displaySetting_show_ms = document.getElementById("showMs");
const el_displaySetting_show_percent = document.getElementById("show%");
const el_displaySetting_show_event = document.getElementById("showEvent");
const el_displaySetting_show_color = document.getElementById("showColor");

let displayHidden = false;
let showMs = false;
let showPercent = true;
let showEvent = true;
let showColor = true;

el_displaySetting_hide.onclick = () => {
  displayHidden = !displayHidden;

  postMessage({
    id: CommandType.SET_HIDDEN,
    value: displayHidden,
  });

  if (displayHidden) {
    showingMessage = false;
    postMessage({
      id: CommandType.CLEAR_MESSAGE,
      value: null,
    });
    maximized = false;
    postMessage({
      id: CommandType.SET_MAXIMIZE_MESSAGE,
      value: maximized,
    });
  }

  clickDispayButton(el_maximizeMsg, maximized);
  clickDispayButton(el_displaySetting_hide, displayHidden);
};

el_displaySetting_show_ms.onclick = () => {
  showMs = !showMs;
  postMessage({
    id: CommandType.SET_SHOW_MS,
    value: showMs,
  });

  clickDispayButton(el_displaySetting_show_ms, showMs);
};

el_displaySetting_show_percent.onclick = () => {
  showPercent = !showPercent;
  postMessage({
    id: CommandType.SET_SHOW_PERCENT,
    value: showPercent,
  });

  clickDispayButton(el_displaySetting_show_percent, showPercent);
};

el_displaySetting_show_event.onclick = () => {
  showEvent = !showEvent;
  postMessage({
    id: CommandType.SET_SHOW_EVENT,
    value: showEvent,
  });

  clickDispayButton(el_displaySetting_show_event, showEvent);
};

el_displaySetting_show_color.onclick = () => {
  showColor = !showColor;
  postMessage({
    id: CommandType.SET_SHOW_COLOR,
    value: showColor,
  });

  clickDispayButton(el_displaySetting_show_color, showColor);
};

//counter controls buttons
const el_pauseTimer = document.getElementById("pauseTimer");
const el_addMinute = document.getElementById("addMinute");
const el_subMinute = document.getElementById("subMinute");
const el_setNewTime = document.getElementById("setNewTime");

let paused = false;

el_pauseTimer.onclick = () => {
  paused = !paused;
  if (paused) {
    el_pauseTimer.textContent = "▶";
  } else {
    el_pauseTimer.textContent = "❚❚";
  }
  postMessage({
    id: CommandType.SET_PAUZE,
    value: paused,
  });
};

el_addMinute.onclick = () => {
  counter.milliseconds += 6e4;
  syncDisplayTimer();
};
el_subMinute.onclick = () => {
  counter.milliseconds -= 6e4;
  syncDisplayTimer();
};

el_setNewTime.onclick = () => {
  const replyH = window.prompt("Enter new hours", 0);
  if (replyH == null) return;
  const replyM = window.prompt("Enter new minutes", 0);
  if (replyH == null) return;
  const replyS = window.prompt("Enter new seconds", 0);
  if (replyS == null) return;

  counter.milliseconds = replyS * 1000 + replyM * 6e4 + replyH * 36e5;
  counter.lastUpdate = Date.now();
};

//MESSAGES
const el_messageText = document.getElementById("messageText");
const el_setMsg = document.getElementById("messageSet");
const el_clearMsg = document.getElementById("messageClear");
const el_maximizeMsg = document.getElementById("messageMaximize");

let maximized = false;
let showingMessage = false;
let messageText = null;

el_setMsg.onclick = () => {
  showingMessage = true;
  messageText = el_messageText.value;
  postMessage({
    id: CommandType.SET_MESSAGE,
    value: el_messageText.value,
  });
};

el_clearMsg.onclick = () => {
  showingMessage = false;
  messageText = null;
  maximized = false;
  clickDispayButton(el_maximizeMsg, maximized);
  postMessage({
    id: CommandType.CLEAR_MESSAGE,
    value: null,
  });
  postMessage({
    id: CommandType.SET_MAXIMIZE_MESSAGE,
    value: maximized,
  });
};

el_maximizeMsg.onclick = () => {
  if (!showingMessage || displayHidden) return;
  maximized = !maximized;
  postMessage({
    id: CommandType.SET_MAXIMIZE_MESSAGE,
    value: maximized,
  });

  clickDispayButton(el_maximizeMsg, maximized);
};

const el_saveFilesOption = document.getElementById("saveFilesOption");
const el_savesContainer = document.getElementById("saves");
el_saveFilesOption.onmouseover = () => {
  el_savesContainer.style.display = "flex";
};
function checkSaveHover() {
  window.setTimeout(() => {
    if (
      document.querySelector("saves:hover") ||
      document.querySelector(".savefile:hover")
    )
      return;
    else el_savesContainer.style.display = "none";
  }, 500);
}
el_saveFilesOption.onmouseout = checkSaveHover;
el_savesContainer.onmouseout = checkSaveHover;

function addSaveFile() {
  cover.style.opacity = 1;

  window.setTimeout(() => {
    saves.push({
      version: VERSION,
      topicKey: topicKey,
      DISPLAYMODE: DISPLAYMODE,
      counter: new Counter(),
      timeMaster: new TimeMaster(),
      timerIdCount: 1,
      displayHidden: false,
      showMs: false,
      showPercent: true,
      showEvent: true,
      showColor: true,
      paused: false,
      maximized: false,
      showingMessage: false,
      messageText: null,
    });
    currentSave = saves.length - 1;

    loadSave(saves[saves.length - 1]);
    updateUI(); //Already takes care of added button
    cover.style.opacity = 0;
  }, 1500);
}

/////////////////////////////////////////////////////////////////
//                         Broadcasting                        //
/////////////////////////////////////////////////////////////////

function syncDisplayTimer() {
  postMessage({
    id: CommandType.NEW_TIME,
    value: {
      ms: counter.milliseconds,
      finished: counter.finished,
    },
  });
}

/////////////////////////////////////////////////////////////////
//                       SAVING & LOADING                      //
/////////////////////////////////////////////////////////////////

let saves = [getSave()];
let currentSave = 0;

function loadAs(obj, Class) {
  Object.setPrototypeOf(obj, Class);
}

function getSave() {
  return {
    version: VERSION,
    topicKey: topicKey,
    DISPLAYMODE: DISPLAYMODE,
    counter: counter,
    timeMaster: timeMaster,
    timerIdCount: timerIdCount,
    displayHidden: displayHidden,
    showMs: showMs,
    showPercent: showPercent,
    showEvent: showEvent,
    showColor: showColor,
    paused: paused,
    maximized: maximized,
    showingMessage: showingMessage,
    messageText: messageText,
  };
}
function loadSave(save) {
  if (save.version != VERSION)
    alert("You're loading a deprecated save. Continue at your own risk :)");

  counter = save.counter;
  loadAs(counter, Counter.prototype);
  timeMaster = save.timeMaster;
  loadAs(timeMaster, TimeMaster.prototype);

  topicKey = save.topicKey;
  DISPLAYMODE = save.DISPLAYMODE;

  if (DISPLAYMODE == DisplayMode.SINGLE_DEVICE) {
    broadCastChannelConnect();
  } else if (DISPLAYMODE == DisplayMode.CROSS_DEVICE) {
    handleWebsocketConnect();
  }

  timerIdCount = save.timerIdCount;
  displayHidden = save.displayHidden;
  showMs = save.showMs;
  showPercent = save.showPercent;
  showEvent = save.showEvent;
  showColor = save.showColor;
  paused = save.paused;
  maximized = save.maximized;
  showingMessage = save.showingMessage;
  messageText = save.messageText;

  return true;
}

function loadSavefile(index) {
  console.log("Loading save " + index);
  currentSave = Number(index) || 0;
  resetting = true;
  loadSave(saves[index]);
  cover.style.opacity = 1;
  window.setTimeout(() => {
    updateUI();
    cover.style.opacity = 0;
    resetting = false;
  }, 1500);
}

function save() {
  if (resetting) return;

  saves[currentSave] = getSave();
  localStorage.setItem(
    "Event_Timer_Save",
    JSON.stringify({saves: saves, currentSave: currentSave}),
  );
}

function updateUI() {
  if (paused) el_pauseTimer.textContent = "▶";
  clickDispayButton(el_displaySetting_hide, displayHidden);
  clickDispayButton(el_displaySetting_show_ms, showMs);
  clickDispayButton(el_displaySetting_show_percent, showPercent);
  clickDispayButton(el_displaySetting_show_event, showEvent);
  clickDispayButton(el_displaySetting_show_color, showColor);
  clickDispayButton(el_maximizeMsg, maximized);

  //Get timeMaster working again
  list.innerHTML = "";
  for (let i = 0; i < timeMaster.timerCount; i++) {
    let newTimer = document.createElement("div");
    newTimer.draggable = true;
    newTimer.classList.add("orderedTimer");

    const timerID = timeMaster.orderedTimerIds[i];
    newTimer.dataset.id = timerID;

    const timer = timeMaster.timers[timerID];
    const timerDuration = timer.duration;
    const durationTime = getTimeFromMs(timerDuration);
    const timerTime = formatTime(durationTime.h, durationTime.m, durationTime.s);

    newTimer.innerHTML = `
    <span class="timerName">${timer.name}</span>
    <span class="timerTime">${timerTime}</span>
    <div class="timerButtons"> 
      <button class="timerStartBtn timerSetting" onclick="startTimer(this)">▶</button>
      <button class="timerEditBtn timerSetting" onclick="openTimerEditor(this)">✎</button> 
      <button class="timerDeleteBtn timerSetting" onclick="deleteTimer(this)"><img class="timerDeleteIcon" src="Images/bin.png"></button> 
    </div>`;

    list.appendChild(newTimer);
  }
  root.style.setProperty("--timerCount", timeMaster.timerCount);
  timeMaster.setCurrentTimerClass();

  //Show the saves list in the saves container
  //Only leave the addSavebutton
  el_savesContainer.innerHTML =
    '<button class="savefile" id="addSaveButton" onclick="addSaveFile()">Add new save</button>';
  for (i in saves) {
    let index = Number(i);
    let newSave = document.createElement("button");
    newSave.classList.add("savefile");
    newSave.dataset.id = index;
    newSave.id = "savefile" + index;

    newSave.textContent = "savefile " + index;

    el_savesContainer.appendChild(newSave);
    newSave.onclick = () => {
      loadSavefile(index);
    };
  }
  el_savesContainer.children[1 + currentSave].style.backgroundColor = "#4a7a8a";
}

function updateDisplay() {
  console.log("display updating");
  postMessage({
    id: CommandType.NEW_TIME,
    value: {
      ms: counter.milliseconds,
      finished: counter.finished,
    },
  });
  postMessage({id: CommandType.NEW_TIMER, value: timeMaster.getCurrentTimer()});
  postMessage({id: CommandType.SET_HIDDEN, value: displayHidden});
  postMessage({id: CommandType.SET_SHOW_MS, value: showMs});
  postMessage({id: CommandType.SET_SHOW_PERCENT, value: showPercent});
  postMessage({id: CommandType.SET_SHOW_EVENT, value: showEvent});
  postMessage({id: CommandType.SET_SHOW_COLOR, value: showColor});
  if (showingMessage) postMessage({id: CommandType.SET_MESSAGE, value: messageText});
  if (showingMessage)
    postMessage({id: CommandType.SET_MAXIMIZE_MESSAGE, value: maximized});
  postMessage({id: CommandType.SET_PAUZE, value: paused});
}

const cover = document.getElementById("cover");

function load() {
  const save = localStorage.getItem("Event_Timer_Save");
  cover.style.opacity = 0;
  if (!save) return;

  const saveFiles = JSON.parse(save);
  console.log(saveFiles);
  saves = saveFiles.saves;
  currentSave = saveFiles.currentSave;

  const saveFile = saves[currentSave];
  if (!saveFile) return;

  //wait until the other things have loaded in
  window.setTimeout(() => {
    loadSave(saveFile);
    updateUI();
  }, 50);
}

let resetting = false;
function reset() {
  localStorage.removeItem("Event_Timer_Save");
  resetting = true;
  location.reload();
}

/////////////////////////////////////////////////////////////////
//                          MAIN LOOP                          //
/////////////////////////////////////////////////////////////////

function applyCounterColor() {
  if (showColor) {
    if (counter.milliseconds > 12e4) {
      el_counterDisplay.style.color = "white";
    } else if (counter.milliseconds > 0) {
      el_counterDisplay.style.color = "yellow";
    } else {
      el_counterDisplay.style.color = "red";
    }
  } else {
    el_counterDisplay.style.color = "white";
  }
}

window.setInterval(() => {
  if (!paused) {
    counter.updateCounter();
    applyCounterColor();
    timeMaster.updateTimers();
  } else {
    counter.lastUpdate = Date.now();
  }
  displayCounter();
}, refreshDt);

window.setInterval(() => {
  if (typeof postMessage == "function") syncDisplayTimer();
  save();
}, 1000);

window.addEventListener("beforeunload", () => {
  save();
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    save();
  }
});
window.addEventListener("pagehide", () => {
  save();
});
