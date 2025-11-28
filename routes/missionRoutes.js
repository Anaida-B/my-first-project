const express = require("express");
const router = express.Router();
const Mission = require("../models/mission");

// Create a new mission
// Create a new mission
router.post("/", async (req, res) => {
  try {
    const mission = new Mission(req.body);
    await mission.save();
    res.status(201).json(mission);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({ error: "Mission ID already exists. Please use a unique Mission ID." });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});


// Get all missions
router.get("/", async (req, res) => {
  try {
    const missions = await Mission.find();
    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get a single mission by ID
router.get("/:id", async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ error: "Mission not found" });
    res.json(mission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a mission
router.put("/:id", async (req, res) => {
  try {
    const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!mission) return res.status(404).json({ error: "Mission not found" });
    res.json(mission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a mission
router.delete("/:id", async (req, res) => {
  try {
    const mission = await Mission.findByIdAndDelete(req.params.id);
    if (!mission) return res.status(404).json({ error: "Mission not found" });
    res.json({ message: "Mission deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
