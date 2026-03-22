import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from "./models/index.js";
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import noticeRoutes from "./routes/notice.routes.js";
import eventRoutes from "./routes/event.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import parentRoutes from "./routes/parent.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"],
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io connection
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
  });
});

// Make io accessible to routes
app.set('socketio', io);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Force: true to drop existing tables and re-sync database (only for dev)
// Use db.sequelize.sync() for production
db.sequelize.sync({ alter: true }).then(() => {
  console.log("[DATABASE] Synced successfully");
}).catch(err => {
  console.error("[DATABASE] Sync failed:", err);
  process.exit(1);
});

// Routes initialization
authRoutes(app);
adminRoutes(app);
teacherRoutes(app);
studentRoutes(app);
noticeRoutes(app);
eventRoutes(app);
assignmentRoutes(app);
notificationRoutes(app);
parentRoutes(app);
attendanceRoutes(app);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to Smart School Attendance API' });
});

server.listen(port, () => {
  console.log(`[SERVER] Running on http://localhost:${port}`);
});
