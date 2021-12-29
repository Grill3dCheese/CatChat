const chatForm = document.getElementById("chat-form");
const chatFormInput = document.getElementById("msg");
const typingFeedback = document.getElementById("typing-feedback");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
let timeout;

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
  outputMessage(message);

  // Scroll down when new message received
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// User is typing indication
function timeoutFunction() {
  socket.emit("is typing", false);
}

chatFormInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter" || event.key === "Backspace") {
    event.preventDefault();
  } else {
    socket.emit("is typing");
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction, 2000);
  }
});

socket.on("typing", (data) => {
  if (data) {
    typingFeedback.textContent = `${data.username} is typing...`;
    typingFeedback.classList.add("show");
  } else {
    typingFeedback.classList.remove("show");
  }
});

// Message submitted
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emitting message to server
  socket.emit("chatMessage", msg);
  socket.emit("is typing", false);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
<p class ="text">
${message.text}
</p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
	${users.map((user) => `<li>${user.username}</li>`).join("")}`;
}
