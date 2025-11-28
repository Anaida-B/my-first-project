const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
  taskID: {
    type: String,
    required: true,
    unique: true // Primary Key
  },
  taskName: {
    type: String,
    required: true
  },
  taskType: {
    type: String,
    required: true
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  estimatedDuration: {
    type: Number, // duration in minutes or hours
    required: true
  }
});

module.exports = mongoose.model('Task', taskSchema);
