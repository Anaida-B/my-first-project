const express = require("express");
const router = express.Router();
const MissionAssignment = require("../models/MissionAssignment");

// Get all assignments
router.get("/", async (req, res) => {
  try {
    const assignments = await MissionAssignment.find();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one assignment
router.get("/:id", async (req, res) => {
  try {
    const assignment = await MissionAssignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Not found" });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new assignment
// Create new assignment
router.post("/", async (req, res) => {
  try {
    console.log("Incoming assignment data:", req.body); // 👀 Debug input
    const newAssignment = new MissionAssignment(req.body);
    const saved = await newAssignment.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Save error:", err); // 👀 This will print the actual cause
    res.status(400).json({ message: "Failed to save assignment", error: err.message });
  }
});


// Update assignment
router.put("/:id", async (req, res) => {
  try {
    const updated = await MissionAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete assignment
router.delete("/:id", async (req, res) => {
  try {
    await MissionAssignment.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


