const AutoStart = {
  NONE: 0,
  AT_TIME: 1,
  AFTER_PREVIOUS: 2,
  EITHER: 3,
};

const MS_IN_DAY = 864e5;

function getMsSinceMidnight() {
  var now = new Date();
  var then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  return now.getTime() - then.getTime();
}

class Timer {
  constructor(name, duration) {
    this.start = null; //Time at which timer will start
    this.autoStart = AutoStart.NONE;
    this.hasStartedToday = true;
    this.duration = duration;
    this.name = name;
  }
}

class TimeMaster {
  constructor() {
    this.currentTimer = 0; //Index of orderedTimers
    this.orderedTimerIds = [0]; //maps the order to the id
    this.timers = {0: new Timer("Timer 1", 3e5)}; //maps the id to a timer
  }

  get timerCount() {
    return this.orderedTimerIds.length;
  }

  setCurrentTimerClass() {
    const id = this.orderedTimerIds[this.currentTimer];
    const timerElement = list.querySelector(`[data-id="${id}"]`);

    if (timerElement) {
      timerElement.classList.add("currentTimer");
    }
  }
  clearCurrentTimerClass() {
    const id = this.orderedTimerIds[this.currentTimer];
    const timerElement = list.querySelector(`[data-id="${id}"]`);

    if (timerElement) {
      timerElement.classList.remove("currentTimer");
    }
  }

  /**
   * Adds a new timer to the TimeMaster
   * @param {Timer} timer the timer to add
   * @param {Number} id the id of the timer's "owner"
   * @returns the last timerCount before adding
   */
  pushTimer(timer, id) {
    this.orderedTimerIds.push(id);
    this.timers[id] = timer;
    save();
  }

  deleteTimer(id) {
    this.clearCurrentTimerClass();
    delete this.timers[id];
    const index = this.getIndexOf(id);
    this.orderedTimerIds.splice(index, 1);

    //shift the current timer if it was at the end to prevent edgecases
    if (this.currentTimer >= this.timerCount) this.currentTimer = this.timerCount - 1;
    else if (index < this.currentTimer) this.currentTimer--;
    this.setCurrentTimerClass();
    save();
  }

  /**
   * Shifts a timer's position
   * @param {Number} oldIndex old position
   * @param {Number} newIndex new position
   */
  shiftTimers(oldIndex, newIndex) {
    if (newIndex == oldIndex) return;
    if (oldIndex == this.currentTimer) this.currentTimer = newIndex;

    const deletedTimer = this.orderedTimerIds.splice(oldIndex, 1)[0];
    if (newIndex > oldIndex) this.orderedTimerIds.splice(newIndex - 1, 0, deletedTimer);
    else this.orderedTimerIds.splice(newIndex, 0, deletedTimer);
  }

  getTimerFromIndex(index) {
    return this.timers[this.orderedTimerIds[index]];
  }

  getIndexOf(id) {
    const result = this.orderedTimerIds.indexOf(id);
    if (result == -1) console.error("the index of an element could not be found");
    else return result;
  }

  getTimerFromId(id) {
    return this.timers[id];
  }

  getCurrentTimer() {
    return this.timers[this.orderedTimerIds[this.currentTimer]];
  }

  setNewTimer(index) {
    if (typeof index != "number") console.error("can't assing timer to string");
    if (this.timerCount <= index || index < 0) {
      console.error("tried to set new timer to invalid index.");
      return false;
    }
    this.clearCurrentTimerClass();
    this.currentTimer = index;
    this.setCurrentTimerClass();
    counter.milliseconds = this.getTimerFromIndex(index).duration;

    if (typeof postMessage == "function") {
      postMessage({
        id: CommandType.NEW_TIMER,
        value: this.getCurrentTimer(),
      });
    }
    return true;
  }

  setNextTimer() {
    if (this.timerCount <= this.currentTimer) return false;
    return this.setNewTimer(this.currentTimer + 1);
  }

  resetCurrentTimer() {
    return this.setNewTimer(this.currentTimer);
  }

  /**
   * This function checks whether another timer needs to be started right now.
   */
  updateTimers() {
    //check if the next timer's autostart is on and current timer is finished
    if (
      counter.finished &&
      this.currentTimer + 1 < this.timerCount &&
      Number(this.getTimerFromIndex(this.currentTimer + 1).autoStart) >= 2 //if autostart is on
    ) {
      this.setNextTimer();
      const currentTimer = this.getCurrentTimer();
      currentTimer.hasStartedToday = true;
      return;
    }

    let d = new Date();
    const timeNow = msFromTime(d.getHours(), d.getMinutes(), d.getSeconds());
    //Loop through all the timers and check if one has a start time that's passed
    for (let i in this.orderedTimerIds) {
      const index = Number(i);
      const timer = this.timers[this.orderedTimerIds[index]];

      //if there is no timer or if the timer doesn' thave autostart
      if (!timer || !timer.autoStart) continue;

      if (timer.hasStartedToday) {
        //If current time is less than startTime, that means it can trigger again.
        if (timeNow < timer.start) timer.hasStartedToday = false;
      } else {
        //Start a timer?
        if (timeNow < timer.start) continue;
        timer.hasStartedToday = true;
        this.setNewTimer(index);

        counter.milliseconds = Math.max(
          0,
          timer.duration - (getMsSinceMidnight() - timer.start),
        );
        return;
      }
    }
  }
}

let timeMaster = new TimeMaster();

let timerIdCount = 1; //for timer id's

const root = document.querySelector(":root");

/////////////////////////////////////////////////////////////////
//                      Timer Dragging                         //
/////////////////////////////////////////////////////////////////

const list = document.querySelector("#timerOrdering");
let draggingItem = null;

list.addEventListener("dragstart", (e) => {
  const item = e.target.closest(".orderedTimer");
  if (!item) return;
  draggingItem = item;
  setTimeout(() => item.classList.add("dragging"), 0);
});

list.addEventListener("dragend", (e) => {
  const item = e.target.closest(".orderedTimer");
  if (!item) return;

  item.classList.remove("dragging");
  draggingItem = null;

  const oldCurrentID = timeMaster.orderedTimerIds[timeMaster.currentTimer];
  timeMaster.orderedTimerIds = Array.from(list.children).map((child) =>
    Number(child.dataset.id),
  );
  timeMaster.currentTimer = timeMaster.getIndexOf(oldCurrentID);
  save();
});

list.addEventListener("dragover", (e) => {
  e.preventDefault();

  //Find closest item to cursor (the [...] forces it into an array from a nodelist)
  const siblings = [...list.querySelectorAll(".orderedTimer:not(.dragging)")];

  const nextSibling = siblings.find((sibling) => {
    const box = sibling.getBoundingClientRect();
    //check if cursor is above vertical midpoint of sibling
    return e.clientY <= box.top + box.height / 2;
  });

  //insert the item before the closest sibling, or at the end if none
  if (nextSibling) {
    list.insertBefore(draggingItem, nextSibling);
  } else {
    list.appendChild(draggingItem);
  }
});

/////////////////////////////////////////////////////////////////
//                      Event Handlers                         //
/////////////////////////////////////////////////////////////////

//Next timer
const el_nextTimer = document.getElementById("nextTimer");
el_nextTimer.onclick = () => {
  timeMaster.setNextTimer();
};

const el_resetTimer = document.getElementById("resetTimer");
el_resetTimer.onclick = () => {
  timeMaster.resetCurrentTimer();
};

//Add timer
const el_addTimer = document.getElementById("addTimer");
el_addTimer.onclick = () => {
  //Create timer
  let newTimer = document.createElement("div");
  newTimer.draggable = true;
  newTimer.classList.add("orderedTimer");

  //Start out at 0 (which is the default timer) and then increment
  const timerID = timerIdCount++;
  newTimer.dataset.id = timerID;

  timeMaster.pushTimer(new Timer(`Timer ${timerID + 1}`, 3e5), timerID);

  root.style.setProperty("--timerCount", timeMaster.timerCount);

  //Add deletion buttons and stuff like that
  newTimer.innerHTML = `
    <span class="timerName">Timer ${timerID + 1}</span>
    <span class="timerTime">5m</span>
    <div class="timerButtons"> 
      <button class="timerStartBtn timerSetting" onclick="startTimer(this)">▶</button>
      <button class="timerEditBtn timerSetting" onclick="openTimerEditor(this)">✎</button> 
      <button class="timerDeleteBtn timerSetting" onclick="deleteTimer(this)"><img class="timerDeleteIcon" src="Images/bin.png"></button> 
    </div>`;

  list.appendChild(newTimer);
};

function getListIndex(el) {
  return Array.from(list.children).findIndex(
    (child) => child.dataset.id === el.dataset.id,
  );
}

//delete this timer
function deleteTimer(el) {
  const timer = el.closest(".orderedTimer");
  timeMaster.deleteTimer(Number(timer.dataset.id));
  timer.remove();

  root.style.setProperty("--timerCount", timeMaster.timerCount);
}

//Start this timer
function startTimer(el) {
  const timer = el.closest(".orderedTimer");
  timeMaster.setNewTimer(timeMaster.getIndexOf(Number(timer.dataset.id)));
}
window.startTimer = startTimer;

//TIMER EDITOR
const timerEditor = document.getElementById("timerEditorContainer");
const timerEditorTitle = document.getElementById("timerEditorTitle");
const editorAutoStart = document.getElementById("autoStartingType");
editorAutoStart.value = "0";
const editorStartTime = document.getElementById("timerEditorStartTime");
const editorStartTimeContainer = document.getElementById("editorStartTimeContainer");

let editingTimerId = null;
let editingTimerElement = null;
let editingTimer = null;
let editingNameSpan = null;

function getTimeFromMs(ms) {
  return {
    h: Math.floor(ms / 36e5),
    m: Math.floor(ms / 6e4) % 60,
    s: Math.floor(ms / 1e3) % 60,
  };
}

function formatToTimeValue(ms, includeSeconds) {
  if (!ms) {
    if (includeSeconds) return "00:00:00";
    return "00:00";
  }
  let str =
    String(Math.floor(ms / 36e5)).padStart(2, "0") +
    ":" +
    String(Math.floor(ms / 6e4) % 60).padStart(2, "0");
  if (includeSeconds) {
    str += ":" + String(Math.floor(ms / 1e3) % 60).padStart(2, "0");
  }
  return str;
}

//Edit this timer
function openTimerEditor(el) {
  editingTimerElement = el.closest(".orderedTimer");
  editingTimerId = Number(editingTimerElement.dataset.id);
  editingTimer = timeMaster.timers[editingTimerId];
  editingNameSpan = el.parentNode.parentNode.children[0];

  timerEditor.style.display = "flex";
  timerEditorTitle.value = editingNameSpan.textContent;
  editorStartTime.value = formatToTimeValue(editingTimer.start, false);
  editorAutoStart.value = editingTimer.autoStart;

  //possibly open starttime
  if (editorAutoStart.value == "1" || editorAutoStart.value == "3") {
    editorStartTimeContainer.style.display = "block";
  } else {
    editorStartTimeContainer.style.display = "none";
  }

  const duration = editingTimer.duration;
  el_timerEditorDuration.value = formatToTimeValue(duration, true);
}

//close timer editor
function closeTimerEditor() {
  timerEditor.style.display = "none";
  editingTimerId = null;
  editingTimerElement = null;
  editingTimer = null;
  editingNameSpan = null;
}

//////////////////////////////////////////////////////////
//                     Timer editor                     //
//////////////////////////////////////////////////////////
function formatTime(h, m, s) {
  if (h > 0) {
    if (s > 0) return h + "h " + m + "m " + s + "s";
    return h + "h " + m + "m";
  }
  if (m > 0) {
    if (s > 0) return m + "m " + s + "s";
    return m + "m";
  }
  return s + "s";
}

function msFromTime(h, m, s) {
  return h * 36e5 + m * 6e4 + s * 1e3;
}

const el_timerEditorTitle = document.getElementById("timerEditorTitle");
el_timerEditorTitle.addEventListener("input", () => {
  editingNameSpan.textContent = el_timerEditorTitle.value;
  timeMaster.getTimerFromId(editingTimerId).name = el_timerEditorTitle.value;
});

const el_timerEditorDuration = document.getElementById("timerEditorDuration");
el_timerEditorDuration.addEventListener("input", () => {
  const value = el_timerEditorDuration.value;
  if (!value) return;

  const newTimes = value.split(":");
  let h = 0;
  let m = 0;
  let s = 0;

  if (newTimes.length === 3) {
    h = Number(newTimes[0]) || 0;
    m = Number(newTimes[1]) || 0;
    s = Number(newTimes[2]) || 0;
  } else if (newTimes.length === 2) {
    // If the browser omits seconds, treat it as hours:minutes
    h = Number(newTimes[0]) || 0;
    m = Number(newTimes[1]) || 0;
  }

  //change the timer
  editingTimer.duration = msFromTime(h, m, s);
  editingTimerElement.children[1].textContent = formatTime(h, m, s);
});

//Auto starting enabling
editorAutoStart.addEventListener("input", () => {
  editingTimer.autoStart = Number(editorAutoStart.value) || 0;

  if (editorAutoStart.value == "1" || editorAutoStart.value == "3") {
    editorStartTimeContainer.style.display = "block";
  } else {
    editorStartTimeContainer.style.display = "none";
  }
});

//Auto start time
editorStartTime.addEventListener("input", () => {
  const value = editorStartTime.value;
  if (!value) return;
  const times = value.split(":");
  const h = Number(times[0]) || 0;
  const m = Number(times[1]) || 0;
  editingTimer.start = msFromTime(h, m, 0);
  //editingTimer.hasStartedToday = false;
});

//////////////////////////////////////////////////////////
//                     Responsive design                //
//////////////////////////////////////////////////////////
window.setInterval(() => {
  const timer = document.querySelector(".orderedTimer");
  if (timer != null) {
    const timerBox = timer.getBoundingClientRect();
    root.style.setProperty("--timerHeight", timerBox.height + "px");
  }
}, 200);
