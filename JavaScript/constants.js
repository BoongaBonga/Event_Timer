const VERSION = 2.0;

const refreshRate = 60; //Hz
const refreshDt = 1000 / refreshRate; //ms

const counterWidth = 80; //vw

const CommandType = {
  NEW_TIME: 0,
  NEW_TIMER: 1,
  SET_HIDDEN: 2,
  SET_SHOW_MS: 3,
  SET_SHOW_PERCENT: 4,
  SET_SHOW_EVENT: 5,
  SET_SHOW_COLOR: 6,
  SET_MESSAGE: 7,
  CLEAR_MESSAGE: 8,
  SET_MAXIMIZE_MESSAGE: 9,
  SET_PAUZE: 10,
};
