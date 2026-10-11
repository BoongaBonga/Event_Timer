const el_testCounter = document.getElementById("testCounter");
const el_counter = document.getElementById("counter");
const div_show = document.getElementById("showCounter");
const div_hide = document.getElementById("hideCounter");
const div_progressBar = document.getElementById("progressBar");
const el_event = document.getElementById("event");
const el_testEvent = document.getElementById("testEvent");
const el_message = document.getElementById("message");
const el_testMessage = document.getElementById("testMessage");
const root = document.querySelector(":root");
const el_lyricsCounter = document.getElementById("lyricsCounter");
const el_lyricsText = document.getElementById("lyricsText");
const el_lyrics = document.getElementById("lyrics");
const el_noLyrics = document.getElementById("noLyrics");

function maxFontSize(
  containerRect,
  text,
  testElement,
  {minFontSize = 1, maxFontSize = 2048, precision = 0.1} = {},
) {
  const width = containerRect.width;
  const height = containerRect.height;

  if (!width || !height || !text) {
    return 0;
  }

  // Save the original measurement element state.
  const original = {
    fontSize: testElement.style.fontSize,
    width: testElement.style.width,
    height: testElement.style.height,
    minHeight: testElement.style.minHeight,
    maxHeight: testElement.style.maxHeight,
    boxSizing: testElement.style.boxSizing,
    whiteSpace: testElement.style.whiteSpace,
    position: testElement.style.position,
    visibility: testElement.style.visibility,
    pointerEvents: testElement.style.pointerEvents,
    overflow: testElement.style.overflow,
    margin: testElement.style.margin,
    padding: testElement.style.padding,
    border: testElement.style.border,
  };

  try {
    testElement.textContent = text;

    Object.assign(testElement.style, {
      position: "fixed",
      visibility: "hidden",
      pointerEvents: "none",
      left: "-100000px",
      top: "0",
      width: `${width}px`,
      height: "auto",
      minHeight: "0",
      maxHeight: "none",
      boxSizing: "border-box",
      whiteSpace: "normal",
      overflow: "visible",
      margin: "0",
      padding: "0",
      border: "0",
    });

    // Keep the element's existing font family, weight,
    // letter spacing, line height, and other font properties.
    function fits(size) {
      testElement.style.fontSize = `${size}px`;

      return (
        testElement.scrollWidth <= width + 0.5 && testElement.scrollHeight <= height + 0.5
      );
    }

    // Find a fitting lower bound and a non-fitting upper bound.
    let low = minFontSize;
    let high = maxFontSize;

    if (!fits(low)) {
      return 0;
    }

    while (fits(high) && high < 16384) {
      low = high;
      high *= 2;
    }

    // Binary search for the largest fitting font size.
    while (high - low > precision) {
      const mid = (low + high) / 2;

      if (fits(mid)) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return low;
  } finally {
    // Restore the element exactly as it was.
    testElement.textContent = original.text;

    Object.assign(testElement.style, {
      fontSize: original.fontSize,
      width: original.width,
      height: original.height,
      minHeight: original.minHeight,
      maxHeight: original.maxHeight,
      boxSizing: original.boxSizing,
      whiteSpace: original.whiteSpace,
      position: original.position,
      visibility: original.visibility,
      pointerEvents: original.pointerEvents,
      overflow: original.overflow,
      margin: original.margin,
      padding: original.padding,
      border: original.border,
      left: "",
      top: "",
    });
  }
}

let lastMessageLayout = "";

function setMessageFontSize() {
  if (!showingMessage) return;
  if (getComputedStyle(el_message).display === "none") return;

  const text = el_message.textContent;
  if (!text.trim()) return;

  const rect = el_message.getBoundingClientRect();
  const style = getComputedStyle(el_message);

  const px = (value) => parseFloat(value) || 0;

  const fontSizePx = parseFloat(style.fontSize) || 1;
  const lineHeightPx = parseFloat(style.lineHeight);

  const testLineHeight =
    style.lineHeight !== "normal" && Number.isFinite(lineHeightPx)
      ? `${lineHeightPx / fontSizePx}`
      : "normal";

  const width = Math.floor(
    rect.width -
      px(style.borderLeftWidth) -
      px(style.borderRightWidth) -
      px(style.paddingLeft) -
      px(style.paddingRight),
  );

  const height = Math.floor(
    rect.height -
      px(style.borderTopWidth) -
      px(style.borderBottomWidth) -
      px(style.paddingTop) -
      px(style.paddingBottom),
  );

  const layoutKey = JSON.stringify({
    text,
    width,
    height,
    maximized: el_message.classList.contains("maximized"),
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    wordSpacing: style.wordSpacing,
    whiteSpace: style.whiteSpace,
    overflowWrap: style.overflowWrap,
    wordBreak: style.wordBreak,
  });

  if (layoutKey === lastMessageLayout) return;

  for (const prop of [
    "fontFamily",
    "fontWeight",
    "fontStyle",
    "fontStretch",
    "fontVariant",
    "letterSpacing",
    "wordSpacing",
    "textTransform",
    "textIndent",
    "overflowWrap",
    "wordBreak",
    "whiteSpace",
  ]) {
    el_testMessage.style[prop] = style[prop];
  }

  el_testMessage.style.lineHeight = testLineHeight;

  const size = maxFontSize({width, height}, text, el_testMessage, {
    minFontSize: 1,
    maxFontSize: 2048,
    precision: 0.5,
  });

  if (size > 0) {
    el_message.style.fontSize = `${size}px`;
    lastMessageLayout = layoutKey;
  }

  console.log({
    width,
    height,
    maximized: el_message.classList.contains("maximized"),
    size,
  });
}

function setEventFontSize() {
  const testRect = el_testEvent.getBoundingClientRect();
  const eventRect = el_event.getBoundingClientRect();

  el_event.style.fontSize =
    Math.min(
      0.8 * eventRect.height,
      (eventRect.width / testRect.width / testRect.height) * 0.8,
    ) + "px";
}

function setCounterFontSize() {
  if (maximized) return;

  let desiredFontSize;

  //get the width of the string
  let sample = el_testCounter.getBoundingClientRect();
  if (
    !Number.isFinite(counterWidth) ||
    !Number.isFinite(sample.width) ||
    sample.width <= 0
  )
    return;
  //get the desired font size by dividing 80vw by sampleWidth
  desiredFontSize = `calc(${counterWidth}vw / ${sample.width} / ${sample.height})`;

  let maxFontSize = lyricsMode ? 25 : 45;
  root.style.setProperty("--font-size", `min(${maxFontSize}vh, ${desiredFontSize})`);
}

function displayCounter() {
  let text = counter.format_signed(showingMs);
  el_counter.textContent = text;
  el_testCounter.textContent = text;
  el_lyricsCounter.textContent = text;

  if (maximized) return;

  //set timer color based on time left
  if (showingColor) {
    if (counter.milliseconds > 12e4) {
      el_counter.style.color = "white";
      el_lyricsCounter.style.color = "white";
      div_progressBar.style.backgroundColor = "white";
    } else if (counter.milliseconds > 0) {
      el_counter.style.color = "yellow";
      el_lyricsCounter.style.color = "yellow";
      div_progressBar.style.backgroundColor = "yellow";
    } else {
      el_counter.style.color = "red";
      el_lyricsCounter.style.color = "red";
      div_progressBar.style.backgroundColor = "red";
    }
  } else {
    el_counter.style.color = "white";
    el_lyricsCounter.style.color = "white";
    div_progressBar.style.backgroundColor = "white";
  }
}

function setLyricsFontSize() {
  //Get the longest row in the current "slide"
  let longestRow = 0;
  let longestRowI = null;
  const lyricsRows = el_lyricsText.textContent.split("\n");
  for (let i = 0; i < lyricsRows.length; i++) {
    const row = lyricsRows[i];
    if (!row) continue;

    if (row.length > longestRow) {
      longestRow = row.length;
      longestRowI = i;
    }
  }

  if (longestRowI == null) return;

  //calculate max fontsize to get that one row on one row
  const lyricsTextTest = document.getElementById("lyricsTextTest");

  lyricsTextTest.textContent = lyricsRows[longestRowI];
  const sample = lyricsTextTest.getBoundingClientRect();

  let fontSize = (0.8 * window.innerWidth) / sample.width / sample.height;

  //if fontSize * #rows > containing height
  const totalTextHeight = lyricsRows.length * ((0.8 * window.innerWidth) / sample.width);
  const containerHeight = el_lyricsText.getBoundingClientRect().height;

  if (totalTextHeight * 1.2 > containerHeight) {
    fontSize = containerHeight / (sample.height * lyricsRows.length * 1.2);
  }

  el_lyricsText.style.fontSize = fontSize + "px";
}
