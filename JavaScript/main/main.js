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

let timers = [new Timer(Date.now() + 2000, 3 * 6e4)];

let counter = new Counter();
counter.setTime(1, 2, 3, 4);

//We count down the current counter unconditionally (except while pauzed)

function displayCounter() {
  el_counterDisplay.textContent = counter.format_signed(showMs);
}

/////////////////////////////////////////////////////////////////
//                      Event Handlers                         //
/////////////////////////////////////////////////////////////////

//Window Opening
el_btnOpenDisplay.onclick = () => {
  window.open("display.html", "counterDisplay", "width=800,height=600");
};

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

el_displaySetting_hide.onclick = () => {
  displayHidden = !displayHidden;
  channel.postMessage({
    id: "set_hidden",
    value: displayHidden,
  });

  clickDispayButton(el_displaySetting_hide, displayHidden);
};

el_displaySetting_show_ms.onclick = () => {
  showMs = !showMs;
  channel.postMessage({
    id: "set_show_ms",
    value: showMs,
  });

  clickDispayButton(el_displaySetting_show_ms, showMs);
};

el_displaySetting_show_percent.onclick = () => {
  showPercent = !showPercent;
  channel.postMessage({
    id: "set_show_percent",
    value: showPercent,
  });

  clickDispayButton(el_displaySetting_show_percent, showPercent);
};

el_displaySetting_show_event.onclick = () => {
  showEvent = !showEvent;
  channel.postMessage({
    id: "set_show_event",
    value: showEvent,
  });

  clickDispayButton(el_displaySetting_show_event, showEvent);
};

//counter controls buttons
const el_pauseTimer = document.getElementById("pauseTimer");
const el_addMinute = document.getElementById("addMinute");
const el_subMinute = document.getElementById("subMinute");
const el_resetTimer = document.getElementById("resetTimer");
const el_nextTimer = document.getElementById("nextTimer");
const el_setNewTime = document.getElementById("setNewTime");

let paused = false;

el_pauseTimer.onclick = () => {
  paused = !paused;
  if (paused) {
    el_pauseTimer.textContent = "▶";
  } else {
    el_pauseTimer.textContent = "❚❚";
  }
  channel.postMessage({
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

el_setMsg.onclick = () => {
  showingMessage = true;
  channel.postMessage({
    id: "set_message",
    value: el_messageText.value,
  });
};

el_clearMsg.onclick = () => {
  showingMessage = false;
  maximized = false;
  clickDispayButton(el_maximizeMsg, maximized);
  channel.postMessage({
    id: "clear_message",
    value: null,
  });
  channel.postMessage({
    id: "maximize_message",
    value: maximized,
  });
};

el_maximizeMsg.onclick = () => {
  if (!showingMessage) return;
  maximized = !maximized;
  channel.postMessage({
    id: "maximize_message",
    value: maximized,
  });

  clickDispayButton(el_maximizeMsg, maximized);
};

/////////////////////////////////////////////////////////////////
//                         Broadcasting                        //
/////////////////////////////////////////////////////////////////

const channel = new BroadcastChannel("display");

function syncDisplayTimer() {
  channel.postMessage({
    id: "new_time",
    value: {
      ms: counter.milliseconds,
      finished: counter.finished,
    },
  });
}

/////////////////////////////////////////////////////////////////
//                          MAIN LOOP                          //
/////////////////////////////////////////////////////////////////

window.setInterval(() => {
  if (!paused) {
    counter.updateCounter();
  } else {
    counter.lastUpdate = Date.now();
  }
  displayCounter();
}, refreshDt);

window.setInterval(() => {
  syncDisplayTimer();
}, 500);
