const DisplayMode = {
  SINGLE_DEVICE: 1,
  CROSS_DEVICE: 2,
};

let DISPLAYMODE = null;
let topicKey = null;
let url = null;

let postMessage;

///Connects to the given topic
function webSocketConnect(topic) {
  const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
  const statusEl = document.getElementById("connectingStatus");

  client.on("connect", () => {
    client.subscribe(topic);
    statusEl.textContent = "Connected! Ready to send commands.";
    statusEl.style.color = "green";
    updateDisplay();
  });

  client.on("message", (receivedTopic, message) => {
    const raw = message.toString();

    console.log("received message: " + raw);
    if (raw === "request_update") {
      updateDisplay();
    }
  });

  client.on("error", (err) => {
    statusEl.innerText = "Connection error: " + err.message;
    statusEl.style.color = "red";
  });

  postMessage = function (msg) {
    const payload = typeof msg === "object" ? JSON.stringify(msg) : msg;
    client.publish(topic, payload);
  };
}

function broadCastChannelConnect() {
  const channel = new BroadcastChannel("EventTimerDisplay");
  channel.onmessage = (event) => {
    if (event.data === "request_update" || event.data?.data === "request_update") {
      updateDisplay();
      console.log("sending update");
    }
  };

  postMessage = function (msg) {
    channel.postMessage(msg);
  };

  updateDisplay();
}

//Function for making a custom topic
function makeid(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//Window Opening
const el_deviceOptions = document.getElementById("deviceOptionsContainer");
document.getElementById("btnOpenDisplay").onclick = () => {
  el_deviceOptions.style.display = "grid";
};

document.getElementById("cancelDeviceButton").onclick = () => {
  el_deviceOptions.style.display = "none";
};

document.getElementById("singleDeviceButton").onclick = () => {
  DISPLAYMODE = DisplayMode.SINGLE_DEVICE;

  window.open("display.html", "counterDisplay", "width=800,height=600");
  el_deviceOptions.style.display = "none";
  urlContainer.style.display = "none";
  broadCastChannelConnect();
};

const urlContainer = document.getElementById("displayUrlContainer");
const urlSpan = document.getElementById("displayUrl");

document.getElementById("crossDeviceButton").onclick = () => {
  DISPLAYMODE = DisplayMode.CROSS_DEVICE;
  //give an unique url with as argument the topic of the websocket
  if (!topicKey) {
    topicKey = makeid(16);
  }

  const baseUrl = window.location.href.substring(
    0,
    window.location.href.lastIndexOf("/") + 1,
  );
  url = baseUrl + "display.html?connection=" + topicKey;

  //Show the user the url
  urlContainer.style.display = "grid";
  urlSpan.textContent = url;

  //Try connecting
  const topic = `VineyardEventCounter:${topicKey}`;
  webSocketConnect(topic);
};

urlSpan.addEventListener("click", () => {
  window.setTimeout(() => {
    urlSpan.textContent = url;
  }, 1500);
  urlSpan.textContent = "Copied to clipboard!";
  navigator.clipboard.writeText(url);
});
