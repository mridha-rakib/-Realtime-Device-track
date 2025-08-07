const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const helmet = require("helmet");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set("view engine", "ejs");
app.set(express.static(path.join(__dirname, "public")));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        imgSrc: ["'self'", "data:", "https://*.tile.openstreetmap.org"],
        connectSrc: ["'self'", "ws://localhost:3000"],
      },
    },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

let connectedUsers = {};

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Real-Time Device Tracker" });
});

io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);

  connectedUsers[socket.id] = {
    id: socket.id,
    latitude: null,
    longitude: null,
    timestamp: new Date(),
  };

  // Broadcast updated user count
  io.emit("userCount", Object.keys(connectedUsers).length);

  socket.on("send-location", (data) => {
    const { latitude, longitude } = data;

    // Update user location
    if (connectedUsers[socket.id]) {
      connectedUsers[socket.id].latitude = latitude;
      connectedUsers[socket.id].longitude = longitude;
      connectedUsers[socket.id].timestamp = new Date();
    }

    // Broadcast location to all clients except sender
    socket.broadcast.emit("receive-location", {
      id: socket.id,
      latitude,
      longitude,
      timestamp: new Date(),
    });

    console.log(`Location update from ${socket.id}: ${latitude}, ${longitude}`);
  });

  // handle user disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete connectedUsers[socket.id];

    socket.broadcast.emit("user-disconnected", socket.id);
    io.emit("userCount", Object.keys(connectedUsers).length);
  });

  // Send current connected users to new client
  socket.emit("existing-users", connectedUsers);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
});
