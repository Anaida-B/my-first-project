const mongoose = require('mongoose');

const VitalLogSchema = new mongoose.Schema({
  astronautId: {
    type: String,
    required: true,
  },
  missionId: {   // ✅ NEW (ties log to mission)
    type: String,
    required: true,
  },
  heartRate: {
    type: Number,
    required: true,
  },
  bloodPressure: {
    type: String,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  oxygenLevel: {   // ✅ NEW
    type: Number,
    required: true,
  },
  stressLevel: {   // ✅ NEW
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Critical'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('VitalLog', VitalLogSchema);


