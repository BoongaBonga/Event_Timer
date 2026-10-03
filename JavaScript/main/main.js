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
    id: "set_hidden",
    value: displayHidden,
  });

  if (displayHidden) {
    showingMessage = false;
    postMessage({
      id: "clear_message",
      value: null,
    });
    maximized = false;
    postMessage({
      id: "maximize_message",
      value: maximized,
    });
  }

  clickDispayButton(el_maximizeMsg, maximized);
  clickDispayButton(el_displaySetting_hide, displayHidden);
};

el_displaySetting_show_ms.onclick = () => {
  showMs = !showMs;
  postMessage({
    id: "set_show_ms",
    value: showMs,
  });

  clickDispayButton(el_displaySetting_show_ms, showMs);
};

el_displaySetting_show_percent.onclick = () => {
  showPercent = !showPercent;
  postMessage({
    id: "set_show_percent",
    value: showPercent,
  });

  clickDispayButton(el_displaySetting_show_percent, showPercent);
};

el_displaySetting_show_event.onclick = () => {
  showEvent = !showEvent;
  postMessage({
    id: "set_show_event",
    value: showEvent,
  });

  clickDispayButton(el_displaySetting_show_event, showEvent);
};

el_displaySetting_show_color.onclick = () => {
  showColor = !showColor;
  postMessage({
    id: "set_show_color",
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
    id: "pause",
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
    id: "set_message",
    value: el_messageText.value,
  });
};

el_clearMsg.onclick = () => {
  showingMessage = false;
  messageText = null;
  maximized = false;
  clickDispayButton(el_maximizeMsg, maximized);
  postMessage({
    id: "clear_message",
    value: null,
  });
  postMessage({
    id: "maximize_message",
    value: maximized,
  });
};

el_maximizeMsg.onclick = () => {
  if (!showingMessage || displayHidden) return;
  maximized = !maximized;
  postMessage({
    id: "maximize_message",
    value: maximized,
  });

  clickDispayButton(el_maximizeMsg, maximized);
};

/////////////////////////////////////////////////////////////////
//                         Broadcasting                        //
/////////////////////////////////////////////////////////////////

function syncDisplayTimer() {
  postMessage({
    id: "new_time",
    value: {
      ms: counter.milliseconds,
      finished: counter.finished,
    },
  });
}

/////////////////////////////////////////////////////////////////
//                       SAVING & LOADING                      //
/////////////////////////////////////////////////////////////////

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

function save() {
  localStorage.setItem("Event_Timer_Save", JSON.stringify(getSave()));
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
}

function updateDisplay() {
  console.log("display updating");
  postMessage({
    id: "new_time",
    value: {
      ms: counter.ms,
      finished: counter.finished,
    },
  });
  postMessage({id: "new_timer", value: timeMaster.getCurrentTimer()});
  postMessage({id: "set_hidden", value: displayHidden});
  postMessage({id: "set_show_ms", value: showMs});
  postMessage({id: "set_show_percent", value: showPercent});
  postMessage({id: "set_show_event", value: showEvent});
  postMessage({id: "set_show_color", value: showColor});
  if (showingMessage) postMessage({id: "set_message", value: messageText});
  if (showingMessage) postMessage({id: "maximize_message", value: maximized});
  postMessage({id: "pause", value: paused});
}

const cover = document.getElementById("cover");

function load() {
  const save = localStorage.getItem("Event_Timer_Save");
  cover.style.opacity = 0;
  if (!save) return;

  //wait until the other things have loaded in
  window.setTimeout(() => {
    loadSave(JSON.parse(save));
    updateUI();
  }, 50);
}

function reset() {
  localStorage.removeItem("Event_Timer_Save");
  location.reload();
}

/////////////////////////////////////////////////////////////////
//                          MAIN LOOP                          //
/////////////////////////////////////////////////////////////////

window.setInterval(() => {
  if (!paused) {
    counter.updateCounter();
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
