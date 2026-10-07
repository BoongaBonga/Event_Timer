class Counter {
  constructor() {
    this.milliseconds = 3e5;

    this.finished = false;

    this.lastUpdate = Date.now();
  }

  setTime(h, m, s, ms) {
    this.milliseconds = ms + 1000 * s + 6e4 * m + 36e5 * h;
    this.lastUpdate = Date.now();
  }

  format(showMs) {
    let str = "";

    let time = Math.abs(this.milliseconds); //ms

    //optionally show ms
    if (showMs) {
      str = ":" + String(time % 1000).padStart(3, "0"); //":ms"
    }
    time = Math.floor(time / 1000); //s

    //show seconds
    str = String(time % 60).padStart(2, "0") + str; //"s:ms"
    time = Math.floor(time / 60); //m

    //optionally show minutes
    if (time == 0) return str; //"s:ms"
    str = String(time % 60).padStart(2, "0") + ":" + str; //"m:s:ms"
    time = Math.floor(time / 60); //h

    //optionallt show hours
    if (time == 0) return str; //"m:s:ms"
    str = String(time).padStart(2, "0") + ":" + str; //"h:m:s:ms"

    return str;
  }
  format_signed(showMs) {
    let str = this.format(showMs);
    if (this.milliseconds < 0) {
      str = "+" + str;
    }
    return str;
  }

  countDown(deltaTime_ms) {
    this.milliseconds -= deltaTime_ms;

    if (this.milliseconds > 0) this.finished = false;
    else this.finished = true;
  }

  countUp(deltaTime_ms) {
    this.milliseconds += deltaTime_ms;
  }

  /**
   * @description progresses this counter based on current time (counting down)
   */
  updateCounter() {
    const now = Date.now();
    const deltaTime = now - this.lastUpdate;
    this.lastUpdate = now;

    this.countDown(deltaTime);
  }
}
