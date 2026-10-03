let counterHidden = false;
let showingMs = false;
let showingPercent = true;
let showingEvent = true;
let currentEvent = "Worship";
let showingColor = true;
let paused = false;
let showingMessage = false;
let maximized = false;

let currentTimerDuration = 3e5;

function setMaximized(isMaximized) {
  if (isMaximized) {
    el_message.classList.add("maximized");
    el_counter.style.display = "none";
  } else {
    el_message.classList.remove("maximized");
    el_counter.style.display = "block";
  }
}

/////////////////////////////////////////////////////////////////
//                            Timer                            //
/////////////////////////////////////////////////////////////////
let counter = new Counter();

function updateProgressBar() {
  if (counter.milliseconds < 0) {
    div_progressBar.style.width = "100vw";
  } else {
    if (!counter.milliseconds || !currentTimerDuration) return;
    const barVw = 100 - (counter.milliseconds / currentTimerDuration) * 100;

    if (!barVw) return;
    div_progressBar.style.width = "clamp(" + barVw + "vw, 0vw, 100vw)";
  }
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
  updateProgressBar();
}, refreshDt);

//Less performance-critical parts
window.setInterval(() => {
  if (showingMessage) {
    setMessageFontSize();
  }
  setCounterFontSize();
}, 200);
