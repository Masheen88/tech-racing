const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Specify allowed origins
const allowedOrigins = [
  "http://104.56.138.27:5173",
  "http://localhost:5173",
  "https://localhost:5173/",
];

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

let users = []; // Track connected users

io.on("connection", (socket) => {
  // console.clear();
  console.log("a user connected with id:", socket.id);
  users.push({
    socketId: socket.id,
    carPosition: { x: 0, y: 0 },
    carRotation: 0,
    speed: 0,
    timestamp: null,
  }); // Add new user to list
  console.log("users", users);
  // Broadcast updated user list to all clients
  io.emit("users", users);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    // Correctly filter out the disconnected user
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("users", users); // Update all clients
  });

  socket.on("updateCarPosition", (userId, position, rotation, speed) => {
    // console.log(
    //   "updateCarPosition",
    //   "user ID:",
    //   userId,
    //   "position DATA:",
    //   position
    // );

    // console.log("car rotation data:", rotation.current);
    // Find the user in the users array and update their car position, this should alter the original users data
    users = users.map((user) => {
      if (user.socketId === userId) {
        // console.log("found user", user.socketId, "updating position");

        user.carPosition = position;
        user.carRotation = rotation.current;
        user.speed = speed;
      }
      return user;
    });
    // console.log("users", users);

    //REVIEW
    io.emit("carPositionUpdate", {
      carId: userId,
      position,
      rotation,
      speed,
      timestamp: Date.now(),
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
