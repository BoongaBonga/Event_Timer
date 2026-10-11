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
