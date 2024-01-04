var socket = io();
var room = decodeURIComponent(location.search.substring(1));
var myName;
var myColor = "";
var hex = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
];
var lastStreamedTime = 0;
var stream;
var sint;
var ist = -1;
for (var i = 0; i < 6; i++) {
  myColor += hex[Math.floor(Math.random() * 16)];
}
document.title = room;
function $(s) {
  return document.querySelector(s);
}
$("#name-enter-room").textContent = room;
$("#meet-top").textContent = room;
$("#name-enter-name").addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    $("#name-enter-join").click();
  }
});
$("#name-enter-join").onclick = () => {
  var n = $("#name-enter-name").value;
  if (n != "") {
    $("#name-enter").remove();
    myName = n;
    $("#meet").hidden = false;
    socket.emit("m", {
      m: `${myName} joined the room.`,
      r: room,
    });
  }
};
$("#meet-top").onclick = () => {
  const divElement = $("#meet-top");
  const range = document.createRange();
  range.selectNodeContents(divElement);
  const selection = getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};
$("#co-chat").onclick = () => {
  $("#chat").hidden = !$("#chat").hidden;
  $("#co-chat").textContent = $("#chat").hidden ? "Show Chat" : "Hide Chat";
  $("#streaming").className = $("#chat").hidden ? "chat-hidden" : "";
};
$("#chat-input").addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    $("#chat-send").click();
  }
});
$("#chat-send").onclick = () => {
  if (myName != undefined) {
    var m = $("#chat-input").value;
    if (m != "") {
      $("#chat-input").value = "";
      socket.emit("m", {
        n: myName,
        c: myColor,
        m: m,
        r: room,
      });
    }
  }
};
socket.on("m" + room, function (data) {
  try {
    var message = document.createElement("div");
    var username = document.createElement("b");
    var messageSpan = document.createElement("span");
    username.style.color = data.c != undefined ? "#" + data.c : "white";
    username.textContent = data.n != undefined ? data.n + ": " : "";
    messageSpan.textContent = data.m;
    message.appendChild(username);
    message.appendChild(messageSpan);
    $("#msg").appendChild(message);
    $("#msg").scrollTop = $("#msg").scrollHeight;
  } catch (error) {}
});
onbeforeunload = () => {
  if (myName != undefined) {
    socket.emit("m", {
      m: `${myName} left the room.`,
      r: room,
    });
  }
};
setInterval(function () {
  if (Date.now() - lastStreamedTime >= 1000) {
    $("#stream-img").src = "/assets/waiting.png";
    $("#stream-name").textContent = "";
    $("#stream-video").hidden = false;
    $("#share-screen").hidden = false;
    $("#stop-video").hidden = true;
    $("#stop-screen").hidden = true;
  } else {
    $("#stream-video").hidden = true;
    $("#share-screen").hidden = true;
    if (ist != -1) {
      if (ist == 0) {
        $("#stop-video").hidden = false;
      } else if (ist == 1) {
        $("#stop-screen").hidden = false;
      }
    }
  }
}, 100);
socket.on("s" + room, function (data) {
  try {
    $("#stream-img").src = data.i;
    $("#stream-name").textContent = data.n;
    $("#stream-name").style.color = "#" + data.c;
    lastStreamedTime = Date.now();
  } catch (error) {}
});
$("#stream-video").onclick = () => {
  startStream(
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }),
    "\nPlease turn on the camera by clicking the lock icon on the top and enable camera for this site and reload this page.",
    0,
  );
};
$("#share-screen").onclick = () => {
  startStream(
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }),
    "",
    1,
  );
};
$("#stop-video").onclick = () => {
  const tracks = stream.getTracks();
  tracks.forEach(function (track) {
    track.stop();
  });
};
$("#stop-screen").onclick = () => {
  const tracks = stream.getTracks();
  tracks.forEach(function (track) {
    track.stop();
  });
};
function startStream(a, e, t) {
  if (ist == -1) {
    a.then(function (str) {
      if ($("#stream-img").src == location.origin + "/assets/waiting.png" && $("#stream-name").textContent == "") {
        ist = t;
        stream = str;
        $("#local-video").srcObject = stream;
        stream.oninactive = function () {
          ist = -1;
          $("#stop-video").hidden = true;
          $("#stop-screen").hidden = true;
          clearInterval(sint);
        };
        sint = setInterval(() => {
          const video = document.getElementById("local-video");
          const canvas = document.getElementById("local-canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas
            .getContext("2d")
            .drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64Data = canvas.toDataURL("image/jpeg");
          socket.emit("s", { n: myName, c: myColor, i: base64Data, r: room });
        }, 64);
      } else {
        alert(
          "Someone is streaming right now so you cannot stream while other is streaming.",
        );
      }
    }).catch(function (err) {
      alert(`Error: ${err}${e}`);
    });
  } else {
    alert("You are already streaming.");
  }
}
