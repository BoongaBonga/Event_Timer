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
      document.querySelector(".savefile:hover") ||
      document.querySelector("#saveFilesOption:hover")
    )
      return;
    else el_savesContainer.style.display = "none";
  }, 500);
}
el_saveFilesOption.onmouseout = checkSaveHover;
el_savesContainer.onmouseout = checkSaveHover;

function addSaveFile() {
  if (!window.confirm("Do you want to add a new save file?")) return;

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
    const saveId = saves.length - 1;
    saveNames.push(`savefile ${saveId}`);
    currentSave = saveId;

    loadSave(saves[saveId]);
    updateUI(); //Already takes care of added button
    cover.style.opacity = 0;
  }, 1500);
}

let saveFileClickTimer = 0;
let preventSaveFileClick = false;
function handleSaveFileClick(index) {
  timer = window.setTimeout(() => {
    if (!preventSaveFileClick) {
      loadSavefile(Number(index));
    }
    preventSaveFileClick = false;
  }, 300);
}
function handleSaveFileDblclick(index) {
  clearTimeout(timer);
  preventSaveFileClick = true;

  const newName = window.prompt("Enter new savefile name", saveNames[index]);
  if (!newName) return;
  el_savesContainer.children[1 + Number(index)].textContent = newName;
  saveNames[index] = newName;
}

document.getElementById("savefile0").addEventListener("click", (el) => {
  handleSaveFileClick(el.explicitOriginalTarget.dataset.id);
});
document.getElementById("savefile0").addEventListener("dblclick", (el) => {
  handleSaveFileDblclick(el.explicitOriginalTarget.dataset.id);
});

//Exporting
document.getElementById("exportSave").addEventListener("click", () => {
  const data = getSave();

  const jsonString = JSON.stringify(data, null, 2);
  const encodedString = btoa(jsonString);

  const blob = new Blob([encodedString], {type: "application/json"});

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "data.json";

  link.click();

  URL.revokeObjectURL(url);
});

// Check if the content is Base64 encoded
function isBase64(str) {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

//Importingg
document.getElementById("importSave").addEventListener("click", () => {
  // Create a hidden file input dynamically
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json"; // Only accept .json files

  // Listen for file selection
  fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (!file) {
      console.error("No file selected.");
      return;
    }

    const reader = new FileReader();

    // Read the file as text
    reader.onload = function (event) {
      try {
        // Get the file content as text
        const fileContent = event.target.result;

        // Check if the file content is Base64 encoded (optional, you can skip this part if not needed)
        let decodedData = fileContent;
        if (isBase64(fileContent)) {
          decodedData = atob(fileContent); // Decode Base64
        }

        // load the new save
        resetting = true;
        const save = JSON.parse(decodedData);

        saves.push(save);
        const saveId = saves.length - 1;
        saveNames.push(`import ${saveId}`);
        currentSave = saveId;

        loadSave(save);
        updateUI();

        // Log success
        console.log("Savegame loaded successfully!");
      } catch (error) {
        console.error("Error loading savegame:", error);
      }
    };

    // Read the file content as a text
    reader.readAsText(file);
  });

  // Programmatically click the file input to trigger the upload dialog
  fileInput.click();
});

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
let saveNames = ["savefile 0"];
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
  if (!confirm(`Do you want to load ${saveNames[index]}?`)) return;
  console.log("Loading save " + index);
  currentSave = Number(index) || 0;
  resetting = true;

  cover.style.opacity = 1;
  window.setTimeout(() => {
    loadSave(saves[index]);
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
    JSON.stringify({saves: saves, saveNames: saveNames, currentSave: currentSave}),
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

    newSave.textContent = saveNames[i];

    el_savesContainer.appendChild(newSave);
    newSave.addEventListener("click", (el) => {
      handleSaveFileClick(el.explicitOriginalTarget.dataset.id);
    });
    newSave.addEventListener("dblclick", (el) => {
      handleSaveFileDblclick(el.explicitOriginalTarget.dataset.id);
    });
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
  saveNames = saveFiles.saveNames;
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
  //if (!window.confirm("Are you sure you want to reset ALL YOUR SAVEFILES?")) return;
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
