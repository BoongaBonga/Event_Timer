function handleMessage(msg) {
  if (!msg || typeof msg !== "object" || !msg.id) return;

  console.log(msg.id);
  switch (msg.id) {
    case CommandType.NEW_TIME: {
      //set this counter to be synced with the main one.
      counter.milliseconds = msg.value.ms;
      counter.finished = msg.value.finished;
      break;
    }
    case CommandType.NEW_TIMER: {
      el_event.textContent = msg.value.name;
      el_testEvent.textContent = msg.value.name;
      counter.milliseconds = currentTimerDuration = msg.value.duration;
      counter.finished = false;
      break;
    }
    case CommandType.SET_HIDDEN: {
      counterHidden = msg.value;

      if (counterHidden) {
        div_show.style.display = "none";
        div_hide.style.display = "block";
        el_event.style.top = "calc(50vh + 13vmin)";
        el_event.style.fontSize = "15vmin";
      } else {
        div_show.style.display = "block";
        div_hide.style.display = "none";
        el_event.style.top = "var(--counter-bottom)";
        el_event.style.fontSize = "calc(var(--font-size) / 10 * 3)";
      }
      break;
    }
    case CommandType.SET_SHOW_MS: {
      showingMs = msg.value;
      break;
    }
    case CommandType.SET_SHOW_PERCENT: {
      showingPercent = msg.value;
      if (showingPercent) {
        div_progressBar.style.display = "block";
      } else {
        div_progressBar.style.display = "none";
      }
      break;
    }
    case CommandType.SET_SHOW_EVENT: {
      showingEvent = msg.value;
      if (showingEvent && !showingMessage) {
        el_event.style.display = "block";
      } else {
        el_event.style.display = "none";
      }
      break;
    }
    case CommandType.SET_SHOW_COLOR: {
      showingColor = msg.value;
      break;
    }
    case CommandType.SET_MESSAGE: {
      showingMessage = true;
      el_event.style.display = "none";
      el_message.style.display = "block";
      el_message.textContent = msg.value;
      break;
    }
    case CommandType.CLEAR_MESSAGE: {
      showingMessage = false;
      maximized = false;
      if (showingEvent) el_event.style.display = "block";
      el_message.style.display = "none";
      el_counter.style.display = "block";
      break;
    }
    case CommandType.SET_MAXIMIZE_MESSAGE: {
      maximized = msg.value;
      setMaximized(maximized);

      break;
    }
    case CommandType.SET_PAUZE: {
      paused = msg.value;
      break;
    }
  }
}

///////////////////////////
//    Connections        //
///////////////////////////

let postMessage;

function webSocketConnect(topicKey) {
  const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
  const topic = "VineyardEventCounter:" + topicKey;

  client.on("connect", () => {
    client.subscribe(topic);
    console.log("subscribed to topic.");
  });

  client.on("message", (receivedTopic, message) => {
    const raw = message.toString();

    // Ignore plain text commands like 'request_update' sent by clients
    if (raw === "request_update") {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      //make an object of it so it works the same as broadcastchannel
      handleMessage(parsed);
    } catch (e) {
      console.error("Failed to parse incoming MQTT message as JSON:", raw);
    }
  });

  postMessage = function (msg) {
    const payload = typeof msg === "object" ? JSON.stringify(msg) : msg;

    if (client && client.connected) {
      client.publish(topic, payload, (err) => {
        if (err) {
          console.error("Failed to publish message:", err);
          //retry
        } else {
          console.log(`Successfully sent: ${msg}`);
        }
      });
    } else {
      console.warn("MQTT client is not connected yet.");
      window.setTimeout(() => {
        postMessage(msg);
      }, 1000);
    }
  };
}

function broadCastChannelConnect() {
  const channel = new BroadcastChannel("EventTimerDisplay");
  channel.onmessage = (msg) => {
    handleMessage(msg.data);
  };

  postMessage = function (msg) {
    channel.postMessage(msg);
  };
}

function load() {
  //Check whether we're in single/cross-device mode
  const urlParams = new URLSearchParams(document.location.search);
  const connectionParam = urlParams.get("connection");

  if (connectionParam) {
    //Start in cross-device mode
    webSocketConnect(connectionParam);
  } else {
    //Start in single-device mode
    broadCastChannelConnect();
  }

  postMessage("request_update");
}
