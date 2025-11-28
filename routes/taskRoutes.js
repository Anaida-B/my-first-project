const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const mongoose = require('mongoose');

// GET all tasks (Existing)
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new task (Existing)
router.post('/', async (req, res) => {
  const task = new Task({
    taskID: req.body.taskID,
    taskName: req.body.taskName,
    taskType: req.body.taskType,
    scheduledStartTime: req.body.scheduledStartTime,
    estimatedDuration: req.body.estimatedDuration
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ⭐️ NEW: GET a single task by ID or taskID (Helpful for frontend to pre-fill form)
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const conditions = [];
    if (mongoose.Types.ObjectId.isValid(id)) {
        conditions.push({ _id: id });
    }
    conditions.push({ taskID: id });

    try {
        const task = await Task.findOne({ $or: conditions });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ⭐️ NEW: PATCH/UPDATE an existing task by ID or taskID
router.patch('/:id', async (req, res) => {
  const id = req.params.id;
  const conditions = [];

  if (mongoose.Types.ObjectId.isValid(id)) {
    conditions.push({ _id: id });
  }
  conditions.push({ taskID: id });

  try {
    // Find the task using the combined query logic
    const task = await Task.findOne({ $or: conditions });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the properties only if they are present in the request body
    if (req.body.taskID != null) task.taskID = req.body.taskID;
    if (req.body.taskName != null) task.taskName = req.body.taskName;
    if (req.body.taskType != null) task.taskType = req.body.taskType;
    if (req.body.scheduledStartTime != null) task.scheduledStartTime = req.body.scheduledStartTime;
    if (req.body.estimatedDuration != null) task.estimatedDuration = req.body.estimatedDuration;

    const updatedTask = await task.save(); // Save the updated document
    res.json(updatedTask);

  } catch (err) {
    // 400 for validation errors during save, 500 for other server errors
    res.status(400).json({ message: err.message });
  }
});

// DELETE a task by ID or taskID (Existing, with your fixed logic)
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const conditions = [];
  if (mongoose.Types.ObjectId.isValid(id)) {
    conditions.push({ _id: id });
  }
  conditions.push({ taskID: id });

  try {
    const deletedTask = await Task.findOneAndDelete({ $or: conditions });

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;