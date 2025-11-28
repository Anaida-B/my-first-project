const mongoose = require("mongoose");

const missionAssignmentSchema = new mongoose.Schema({
  assignmentId: { type: String, required: true, unique: true },
  missionId: { type: String, required: true },      // ✅ String instead of ObjectId
  astronautId: { type: String, required: true },    // ✅ String instead of ObjectId
}, { timestamps: true });

module.exports = mongoose.model("MissionAssignment", missionAssignmentSchema);


