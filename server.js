import express from "express";
import router from "./src/routes/index.routes.js";
import connectDB from "./src/config/db.js";
import path from "path";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE"],
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api", router);

// Error handling middleware

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File is too large. Maximum size is 5MB",
      });
    }
    return res.status(400).json({
      message: "File upload error",
    });
  }

  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
  });
});

// Add your socket.io event handlers here
io.on("connection", (socket) => {
  console.log("a user connected");
  io.emit("connection notification", socket.handshake.query.name);

  socket.on("new_message", (data) => {
    socket.broadcast.emit("new_message", {
      user: socket.userId,
      message: data,
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Replace app.listen with server.listen
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
