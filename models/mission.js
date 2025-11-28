const mongoose = require("mongoose");

const missionSchema = new mongoose.Schema({
  missionId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  missionType: { type: String, required: true }, // e.g., ISS, Mars, Lunar
  spacecraftName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ["Scheduled", "Active", "Completed"], required: true }
}, { timestamps: true });

module.exports = mongoose.model("Mission", missionSchema);
