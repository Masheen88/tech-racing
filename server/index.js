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
    origin: allowedOrigins,
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
  users.push(socket.id); // Add new user to list
  console.log("users", users);
  // Broadcast updated user list to all clients
  io.emit("users", users);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    users = users.filter((user) => user !== socket.id); // Remove disconnected user
    io.emit("users", users); // Update all clients
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
