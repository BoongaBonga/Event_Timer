class Timer {
  constructor(duration, start) {
    this.start = start; //Time at which timer started
    this.duration = duration;
  }
}

class TimeMaster {
  constructor() {
    this.currentTimer = 0;
    this.timers = {0: new Timer(3e5, null)};
  }
}

let timeMaster = new TimeMaster();

let timerIdCount = 1; //for timer id's
let timerCount = 1;

const root = document.querySelector(":root");

/////////////////////////////////////////////////////////////////
//                      Timer Dragging                         //
/////////////////////////////////////////////////////////////////

const list = document.querySelector("#timerOrdering");
let draggingItem = null;

list.querySelectorAll(".orderedTimer").forEach((item) => {
  item.addEventListener("dragstart", () => {
    draggingItem = item;
    // Delay adding the class so the drag "ghost image" retains full opacity
    setTimeout(() => item.classList.add("dragging"), 0);
  });

  item.addEventListener("dragend", () => {
    draggingItem = null;
    item.classList.remove("dragging");
  });
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

//Add timer
const el_addTimer = document.getElementById("addTimer");
el_addTimer.onclick = () => {
  //Create timer
  let newTimer = document.createElement("div");
  newTimer.draggable = true;
  newTimer.classList.add("orderedTimer");
  newTimer.dataset.id = timerIdCount++;

  timeMaster.timers[newTimer.dataset.id] = new Timer(5 * 6e4, null);

  timerCount++;
  root.style.setProperty("--timerCount", timerCount);

  //Add deletion buttons and stuff like that
  newTimer.innerHTML = `
    <span class="timerName">Timer ${timerIdCount}</span>
    <span class="timerTime">5m</span>
    <div class="timerButtons"> 
      <button class="timerStartBtn timerSetting" onclick="startTimer(this)">▶</button>
      <button class="timerEditBtn timerSetting" onclick="openTimerEditor(this)">✎</button> 
      <button class="timerDeleteBtn timerSetting" onclick="deleteTimer(this)"><img class="timerDeleteIcon" src="Images/bin.png"></button> 
    </div>`;

  //event listeners for dragging
  newTimer.addEventListener("dragstart", () => {
    draggingItem = newTimer;
    // Delay adding the class so the drag "ghost image" retains full opacity
    setTimeout(() => newTimer.classList.add("dragging"), 0);
  });

  newTimer.addEventListener("dragend", () => {
    draggingItem = null;
    newTimer.classList.remove("dragging");
  });

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
  delete timeMaster.timers[timer.dataset.id];
  timer.remove();

  timerCount--;
  root.style.setProperty("--timerCount", timerCount);
}

//Start this timer
function startTimer(el) {
  const timer = el.closest(".orderedTimer");
  counter.milliseconds = timeMaster.timers[timer.dataset.id].duration;
}
window.startTimer = startTimer;

//TIMER EDITOR
const timerEditor = document.getElementById("timerEditorContainer");
const timerEditorTitle = document.getElementById("timerEditorTitle");

let editingTimerId = null;
let editingTimer = null;
let editingNameSpan = null;

//Edit this timer
function openTimerEditor(el) {
  editingTimer = el.closest(".orderedTimer");
  editingTimerId = editingTimer.dataset.id;
  editingNameSpan = el.parentNode.parentNode.children[0];

  timerEditor.style.display = "flex";
  timerEditorTitle.value = editingNameSpan.textContent;
}

//close timer editor
function closeTimerEditor() {
  timerEditor.style.display = "none";
  editingTimerId = null;
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

const el_timerEditorTitle = document.getElementById("timerEditorTitle");
el_timerEditorTitle.addEventListener("input", () => {
  editingNameSpan.textContent = el_timerEditorTitle.value;
});

const el_timerEditorDuration = document.getElementById("timerEditorDuration");
el_timerEditorDuration.addEventListener("input", () => {
  console.log("input");
  const newTimes = el_timerEditorDuration.value.split(":");
  let h = Number(newTimes[0]);
  let m = Number(newTimes[1]);
  let s = Number(newTimes[2]);

  if (h == undefined) h = 0;
  if (m == undefined) h = 0;
  if (s == undefined) s = 0;

  //change the timer
  timeMaster.timers[editingTimerId].duration = h * 36e5 + m * 6e4 + s * 1e3;
  editingTimer.children[1].textContent = formatTime(h, m, s);
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
