const socket = io();

//Element
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const sendLocationBtn = document.getElementById("sendLocationBtn");
const $messages = document.getElementById("messages");
const $sidebar = document.getElementById("sidebar");

// Templete
const messageTemplete = document.getElementById("message-templete").innerHTML;
const locationTemplete = document.getElementById("location-templete").innerHTML;
const sidebarTemplete = document.getElementById("sidebar-templete").innerHTML;

// Option
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  $messages.scrollTop = $messages.scrollHeight;
};

socket.on("message", (message) => {
  console.log(message);

  const html = Mustache.render(messageTemplete, {
    username: message.username,
    message: message.text,
    createAt: moment(message.createAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (message) => {
  console.log(message);

  const html = Mustache.render(locationTemplete, {
    username: message.username,
    url: message.url,
    createAt: moment(message.createAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  console.log(room);
  console.log(users);

  const html = Mustache.render(sidebarTemplete, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessageBtn.setAttribute("disabled", "disabled");
  const text = messageInput.value;
  messageInput.value = "";

  socket.emit("sendMessage", text, () => {
    console.log("Message delevered!");
    sendMessageBtn.removeAttribute("disabled");
  });
});

sendLocationBtn.addEventListener("click", () => {
  sendLocationBtn.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("GeoLocation not suppert by your browser!!");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);

    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log("location shered!");
        sendLocationBtn.removeAttribute("disabled");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
