class Timer {
  constructor(startMs, endMs) {
    this.start = startMs; //Time at which timer started
    this.end = endMs; //End of the timer
    this.duration = endMs - startMs;
  }
}

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

  timerCount++;
  root.style.setProperty("--timerCount", timerCount);

  //Add deletion buttons and stuff like that
  newTimer.innerHTML = `
    <span class="timerName">Timer ${timerIdCount}</span>
    <div class="timerButtons"> 
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
  timer.remove();

  timerCount--;
  root.style.setProperty("--timerCount", timerCount);
}

const timerEditor = document.getElementById("timerEditorContainer");
const timerEditorTitle = document.getElementById("timerEditorTitle");

let editingTimer = null;
let editingNameSpan = null;

//Edit this timer
function openTimerEditor(el) {
  editingTimer = el.closest(".orderedTimer");
  editingNameSpan = el.parentNode.parentNode.children[0];

  timerEditor.style.display = "flex";
  timerEditorTitle.value = editingNameSpan.textContent;
}

//close timer editor
function closeTimerEditor() {
  timerEditor.style.display = "none";
  editingTimer = null;
  editingNameSpan = null;
}

//////////////////////////////////////////////////////////
//                     Timer editor                     //
//////////////////////////////////////////////////////////
const el_timerEditorTitle = document.getElementById("timerEditorTitle");
el_timerEditorTitle.addEventListener("input", () => {
  editingNameSpan.textContent = el_timerEditorTitle.value;
});

//////////////////////////////////////////////////////////
//                     Responsive design                //
//////////////////////////////////////////////////////////
window.setInterval(() => {
  const timerBox = document.querySelector(".orderedTimer").getBoundingClientRect();
  root.style.setProperty("--timerHeight", timerBox.height + "px");
}, 200);
