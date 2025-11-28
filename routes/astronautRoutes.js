const express = require("express");
const Astronaut = require("../models/Astronaut");
const router = express.Router();

// ✅ Create astronaut
router.post("/", async (req, res) => {
  try {
    const astronaut = new Astronaut(req.body); // includes photoUrl if sent
    await astronaut.save();
    res.status(201).json(astronaut);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Get all astronauts
router.get("/", async (req, res) => {
  try {
    const astronauts = await Astronaut.find();
    res.json(astronauts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get one astronaut by ID
router.get("/:id", async (req, res) => {
  try {
    const astronaut = await Astronaut.findById(req.params.id);
    if (!astronaut) return res.status(404).json({ error: "Astronaut not found" });
    res.json(astronaut);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update astronaut
router.put("/:id", async (req, res) => {
  try {
    const astronaut = await Astronaut.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!astronaut) return res.status(404).json({ error: "Astronaut not found" });
    res.json(astronaut);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Delete astronaut
router.delete("/:id", async (req, res) => {
  try {
    const astronaut = await Astronaut.findByIdAndDelete(req.params.id);
    if (!astronaut) return res.status(404).json({ error: "Astronaut not found" });
    res.json({ message: "Astronaut deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


module.exports = router;


