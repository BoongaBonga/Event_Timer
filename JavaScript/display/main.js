const el_counter = document.getElementById("counter");
const el_testCounter = document.getElementById("testCounter");
const div_show = document.getElementById("showCounter");
const div_hide = document.getElementById("hideCounter");
const div_progressBar = document.getElementById("progressBar");
const el_event = document.getElementById("event");
const el_message = document.getElementById("message");
const el_testChar = document.getElementById("testChar");

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

function setMessageFontSize() {
  const containerRect = el_message.getBoundingClientRect();
  const charRect = el_testChar.getBoundingClientRect();
  const characterCount = el_message.textContent.length;

  if (
    characterCount === 0 ||
    !Number.isFinite(containerRect.width) ||
    !Number.isFinite(containerRect.height) ||
    !Number.isFinite(charRect.width) ||
    !Number.isFinite(charRect.height) ||
    charRect.width <= 0 ||
    charRect.height <= 0
  ) {
    return;
  }

  const containerVolume = containerRect.width * containerRect.height;

  const fontSize = Math.sqrt(
    containerVolume / (characterCount * charRect.width * charRect.height),
  );

  if (!Number.isFinite(fontSize)) return;

  el_message.style.fontSize = `min(${containerRect.height}px, ${fontSize}px)`;
}

/////////////////////////////////////////////////////////////////
//                            Timer                            //
/////////////////////////////////////////////////////////////////
let counter = new Counter();

function displayCounter() {
  let text = counter.format_signed(showingMs);
  el_counter.textContent = text;
  el_testCounter.textContent = text;

  //calculate best font size to fill 80vw.

  let desiredFontSize;
  if (!maximized) {
    //set timer color based on time left
    if (showingColor) {
      if (counter.milliseconds > 12e4) {
        el_counter.style.color = "white";
        div_progressBar.style.backgroundColor = "white";
      } else if (counter.milliseconds > 20e3) {
        el_counter.style.color = "yellow";
        div_progressBar.style.backgroundColor = "yellow";
      } else {
        el_counter.style.color = "red";
        div_progressBar.style.backgroundColor = "red";
      }
    } else {
      el_counter.style.color = "white";
      div_progressBar.style.backgroundColor = "white";
    }

    //get the width of the string
    let sampleWidth = el_testCounter.getBoundingClientRect().width;
    if (
      !Number.isFinite(counterWidth) ||
      !Number.isFinite(sampleWidth) ||
      sampleWidth <= 0
    )
      return;
    //get the desired font size by dividing 80vw by sampleWidth
    desiredFontSize = `calc(${counterWidth}vw / ${sampleWidth})`;

    document
      .querySelector(":root")
      .style.setProperty("--font-size", `min(45vh, ${desiredFontSize})`);
  }
}

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

  if (showingMessage) {
    setMessageFontSize();
  }

  displayCounter();
  updateProgressBar();
}, refreshDt);
