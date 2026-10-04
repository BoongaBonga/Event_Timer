const DisplayMode = {
  SINGLE_DEVICE: 1,
  CROSS_DEVICE: 2,
};

let DISPLAYMODE = null;
let topicKey = null;
let url = null;

let postMessage;

let mqttClient = null;
let mqttTopic = null;
///Connects to the given topic
function webSocketConnect(topic) {
  mqttTopic = topic;

  if (mqttClient) {
    mqttClient.end(true);
    mqttClient = null;
  }

  mqttClient = mqtt.connect("wss://broker.hivemq.com:8884/mqtt", {
    reconnectPeriod: 1000,
    connectTimeout: 10000,
    keepalive: 30,
  });

  const statusEl = document.getElementById("connectingStatus");

  mqttClient.on("connect", () => {
    mqttClient.subscribe(mqttTopic, (err) => {
      if (err) {
        console.error("MQTT subscribe failed:", err);
        return;
      }

      statusEl.textContent = "Connected! Ready to send commands.";
      statusEl.style.color = "green";
      updateDisplay();
    });
  });

  mqttClient.on("reconnect", () => {
    console.log("MQTT reconnecting...");
    statusEl.textContent = "Reconnecting...";
    statusEl.style.color = "orange";
  });

  mqttClient.on("close", () => {
    console.warn("MQTT connection closed");
  });

  mqttClient.on("message", (receivedTopic, message) => {
    const raw = message.toString();

    if (raw === "request_update") {
      updateDisplay();
    }
  });

  mqttClient.on("error", (err) => {
    console.error("MQTT error: " + err);
    statusEl.innerText = "Connection error: " + err.message;
    statusEl.style.color = "red";
  });

  postMessage = function (msg) {
    if (!mqttClient || !mqttClient.connected) {
      console.warn("Tried to send MQTT message while disconnected");
      return false;
    }

    const payload = typeof msg === "object" ? JSON.stringify(msg) : msg;
    mqttClient.publish(topic, payload);

    return true;
  };
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;

  if (DISPLAYMODE === DisplayMode.CROSS_DEVICE && mqttClient && !mqttClient.connected) {
    console.log("Page visible again, reconnecting MQTT...");
    mqttClient.reconnect();
  }
});

//This function handles everything to connect once again to the websocketchannel
function handleWebsocketConnect() {
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

  //show the user the url
  urlContainer.style.display = "grid";
  urlSpan.textContent = url;

  //Try connecting
  const topic = `VineyardEventCounter:${topicKey}`;
  webSocketConnect(topic);
}

function broadCastChannelConnect() {
  DISPLAYMODE = DisplayMode.SINGLE_DEVICE;

  if (mqttClient) {
    mqttClient.end(true);
    mqttClient = null;
  }

  window.open("display.html", "counterDisplay", "width=800,height=600");

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

/////////////////////////////////////////////////////////////////
//                      Event Handlers                         //
/////////////////////////////////////////////////////////////////

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
  el_deviceOptions.style.display = "none";
  urlContainer.style.display = "none";
  broadCastChannelConnect();
};

const urlContainer = document.getElementById("displayUrlContainer");
const urlSpan = document.getElementById("displayUrl");

document.getElementById("crossDeviceButton").onclick = () => {
  handleWebsocketConnect();
};

urlSpan.addEventListener("click", () => {
  window.setTimeout(() => {
    urlSpan.textContent = url;
  }, 1500);
  urlSpan.textContent = "Copied to clipboard!";
  navigator.clipboard.writeText(url);
});
