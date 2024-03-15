const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);
const port = 8080;

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
server.listen(port);

let users = [];
const colors = ["red", "blue", "green", "yellow", "purple", "orange"];

io.on("connection", (socket) => {
  console.log("Client joined: ", socket.id);

  users.push({
    id: socket.id,
    color: colors[Math.floor(Math.random() * colors.length)],
    placedObjects: [],
  });

  socket.on("updateRequest", () => {
    io.emit("update", { users });
  });

  socket.on("disconnect", () => {
    console.log("Client left: ", socket.id);
    users = users.filter((user) => user.id !== socket.id);
  });

  socket.on("placeObjects", (objects) => {
    const index = users.findIndex((user) => user.id === socket.id);
    if (index === -1) {
      throw new Error("User not found!");
    }
    users[index].placedObjects.push(...objects);
  });

  io.emit("update", { users });
});
