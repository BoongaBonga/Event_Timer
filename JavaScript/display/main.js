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
  //get the volume to be filled
  const containerRect = el_message.getBoundingClientRect();
  const containerVolume = containerRect.width * containerRect.height;
  //Vbox = w * h
  //Vtext = characterCount * Vchar
  const charRect = el_testChar.getBoundingClientRect();
  //Vchar = height (charH * font-size) * width (charW * font-size)
  //Vtext = Vbox <=> Vbox = characterCount * font-size² * charW * charH
  //<=> font-size = Math.sqrt(Vbox / (characterCount * charW * charH))
  const characterCount = el_message.textContent.length;
  const fontSize = Math.sqrt(
    containerVolume / (characterCount * charRect.width * charRect.height),
  );

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
      } else if (counter.milliseconds > 20e3) {
        el_counter.style.color = "yellow";
      } else {
        el_counter.style.color = "red";
      }
    } else {
      el_counter.style.color = "white";
    }

    //get the width of the string
    let sampleWidth = el_testCounter.getBoundingClientRect().width;
    //get the desired font size by dividing 80vw by sampleWidth
    desiredFontSize = `calc(${counterWidth}vw / ${sampleWidth})`;

    document
      .querySelector(":root")
      .style.setProperty("--font-size", `min(45vh, ${desiredFontSize})`);
  }
}

/////////////////////////////////////////////////////////////////
//                         Broadcasting                        //
/////////////////////////////////////////////////////////////////

const channel = new BroadcastChannel("display");

channel.onmessage = (msg) => {
  console.log(msg.data.id);
  switch (msg.data.id) {
    case "new_time": {
      //set this counter to be synced with the main one.
      counter.milliseconds = msg.data.value.ms;
      counter.finished = msg.data.value.finished;
      break;
    }
    case "set_hidden": {
      counterHidden = msg.data.value;

      if (counterHidden) {
        div_show.style.display = "none";
        div_hide.style.display = "block";
      } else {
        div_show.style.display = "block";
        div_hide.style.display = "none";
      }
      break;
    }
    case "set_show_ms": {
      showingMs = msg.data.value;
      break;
    }
    case "set_show_percent": {
      showingPercent = msg.data.value;
      if (showingPercent) {
        div_progressBar.style.display = "block";
      } else {
        div_progressBar.style.display = "none";
      }
      break;
    }
    case "set_show_event": {
      showingEvent = msg.data.value;
      if (showingEvent) {
        el_event.style.display = "block";
      } else {
        el_event.style.display = "none";
      }
      break;
    }
    case "set_show_color": {
      showingColor = msg.data.value;
      break;
    }
    case "set_message": {
      showingMessage = true;
      el_event.style.display = "none";
      el_message.style.display = "block";
      el_message.textContent = msg.data.value;
      break;
    }
    case "clear_message": {
      showingMessage = false;
      maximized = false;
      if (showingEvent) el_event.style.display = "block";
      el_message.style.display = "none";
      el_counter.style.display = "block";
      break;
    }
    case "maximize_message": {
      maximized = msg.data.value;
      setMaximized(maximized);

      break;
    }
    case "pause": {
      paused = msg.data.value;
      break;
    }
  }
};

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
}, refreshDt);
