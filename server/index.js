const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const compression = require("compression");
const path = require("path");

const app = express();
app.use(compression());

const allowedOrigins = [
  "*",
  "http://66.128.253.47:5173",
  "http://192.168.50.58:5173",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  next();
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"], // Force WebSocket transport only
});

const users = new Map();

const SERVER_TICK_RATE = 1000 / 60;
// Increase if needed to reduce network load
const CLIENT_UPDATE_RATE = 1000 / 30;

function gameLoop() {
  // Perform game logic, physics calculations, etc.
}

function sendUpdates() {
  const updates = Array.from(users.values()).map((user) => ({
    socketId: user.socketId,
    carPosition: user.carPosition,
    carRotation: user.carRotation,
    speed: user.speed,
    timestamp: user.timestamp,
  }));
  io.emit("gameUpdate", updates);
}

setInterval(gameLoop, SERVER_TICK_RATE);
setInterval(sendUpdates, CLIENT_UPDATE_RATE);

io.on("connection", (socket) => {
  console.log("a user connected with id:", socket.id);
  users.set(socket.id, {
    socketId: socket.id,
    carPosition: { x: 0, y: 0 },
    carRotation: 0,
    speed: 0,
    timestamp: Date.now(),
  });

  console.log("Users:", Array.from(users.values()));
  // Send initial state to the new user
  socket.emit("initialState", Array.from(users.values()));

  // Broadcast updated user list to all clients
  io.emit("users", Array.from(users.values()));

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    users.delete(socket.id);
    io.emit("users", Array.from(users.values()));
  });

  socket.on("updateCarPosition", (userId, position, rotation, speed) => {
    const user = users.get(userId);
    if (user) {
      user.carPosition = position;
      user.carRotation = rotation;
      user.speed = speed;
      user.timestamp = Date.now();
    }

    // Emit individual updates for backward compatibility
    io.emit("carPositionUpdate", {
      carId: userId,
      position,
      rotation,
      speed,
      timestamp: Date.now(),
    });
  });
}); /*INFO */

app.get("/audio/:filename", (req, res) => {
  const filePath = path.join(__dirname, "audio", req.params.filename);
  console.log("Request for audio file:", req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send(err);
    } else {
      console.log("Headers:", res.getHeaders());
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
); // Listen on all network interfaces
