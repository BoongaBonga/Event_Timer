function handleMessage(msg) {
  console.log("handling message" + typeof msg + ", id: " + typeof msg.id);
  if (!msg || typeof msg !== "object" || !msg.id) return;

  console.log(msg.id);
  switch (msg.id) {
    case "new_time": {
      //set this counter to be synced with the main one.
      counter.milliseconds = msg.value.ms;
      counter.finished = msg.value.finished;
      break;
    }
    case "new_timer": {
      el_event.textContent = msg.value.name;
      counter.milliseconds = currentTimerDuration = msg.value.duration;
      counter.finished = false;
      break;
    }
    case "set_hidden": {
      counterHidden = msg.value;

      if (counterHidden) {
        div_show.style.display = "none";
        div_hide.style.display = "block";
        el_event.style.top = "calc(50vh + 13vmin)";
        el_event.style.fontSize = "15vmin";
      } else {
        div_show.style.display = "block";
        div_hide.style.display = "none";
        el_event.style.top = "calc(var(--logo-bottom) + var(--font-size) + 2vh)";
        el_event.style.fontSize = "calc(var(--font-size) / 10 * 3)";
      }
      break;
    }
    case "set_show_ms": {
      showingMs = msg.value;
      break;
    }
    case "set_show_percent": {
      showingPercent = msg.value;
      if (showingPercent) {
        div_progressBar.style.display = "block";
      } else {
        div_progressBar.style.display = "none";
      }
      break;
    }
    case "set_show_event": {
      showingEvent = msg.value;
      if (showingEvent && !showingMessage) {
        el_event.style.display = "block";
      } else {
        el_event.style.display = "none";
      }
      break;
    }
    case "set_show_color": {
      showingColor = msg.value;
      break;
    }
    case "set_message": {
      showingMessage = true;
      el_event.style.display = "none";
      el_message.style.display = "block";
      el_message.textContent = msg.value;
      break;
    }
    case "clear_message": {
      showingMessage = false;
      maximized = false;
      if (showingEvent) el_event.style.display = "block";
      el_message.style.display = "none";
      el_counter.style.display = "block";
      break;
    }
    case "maximize_message": {
      maximized = msg.value;
      setMaximized(maximized);

      break;
    }
    case "pause": {
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

    //console.log("Received message: " + raw);

    // Ignore plain text commands like 'request_update' sent by clients
    if (raw === "request_update") {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      console.log(parsed);
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
