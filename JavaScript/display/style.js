const el_testCounter = document.getElementById("testCounter");
const el_counter = document.getElementById("counter");
const div_show = document.getElementById("showCounter");
const div_hide = document.getElementById("hideCounter");
const div_progressBar = document.getElementById("progressBar");
const el_event = document.getElementById("event");
const el_message = document.getElementById("message");
const el_testChar = document.getElementById("testChar");
const root = document.querySelector(":root");

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

function setCounterFontSize() {
  if (maximized) return;

  let desiredFontSize;

  //get the width of the string
  let sampleWidth = el_testCounter.getBoundingClientRect().width;
  if (!Number.isFinite(counterWidth) || !Number.isFinite(sampleWidth) || sampleWidth <= 0)
    return;
  //get the desired font size by dividing 80vw by sampleWidth
  desiredFontSize = `calc(${counterWidth}vw / ${sampleWidth})`;

  //Check if with that font size the message/Event can still appear on screen

  root.style.setProperty("--font-size", `min(45vh, ${desiredFontSize})`);
}

function displayCounter() {
  let text = counter.format_signed(showingMs);
  el_counter.textContent = text;
  el_testCounter.textContent = text;

  if (maximized) return;

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
}
