require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());  // allow frontend fetch requests

const PORT = 3000;

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/myprojectdb")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Serve static frontend files
app.use(express.static("astronaut-frontend")); // <-- folder name

// Routes
const astronautRoutes = require("./routes/astronautRoutes");
app.use("/api/astronauts", astronautRoutes);

const missionRoutes = require("./routes/missionRoutes");
app.use("/api/missions", missionRoutes);

const missionAssignmentRoutes = require("./routes/missionAssignmentRoutes");
app.use("/api/assignments", missionAssignmentRoutes);

const vitalLogRoutes = require("./routes/vitalLogRoutes");
app.use("/api/vitals", vitalLogRoutes);    // ✅ CORRECT: Matches frontend URL

const anomalyRoutes = require("./routes/anomalyRoutes");
app.use("/api/anomalies", anomalyRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// You can add other routes here (missions, tasks, vitals, etc.)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
