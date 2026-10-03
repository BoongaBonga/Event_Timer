const VERSION = 2.0;

const refreshRate = 60; //Hz
const refreshDt = 1000 / refreshRate; //ms

const counterWidth = 80; //vw

const CommandType = {
  NEW_TIME: 1,
  NEW_TIMER: 2,
  SET_HIDDEN: 3,
  SET_SHOW_MS: 4,
  SET_SHOW_PERCENT: 5,
  SET_SHOW_EVENT: 6,
  SET_SHOW_COLOR: 7,
  SET_MESSAGE: 8,
  CLEAR_MESSAGE: 9,
  SET_MAXIMIZE_MESSAGE: 10,
  SET_PAUZE: 11,
};
