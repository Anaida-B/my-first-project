const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
    // MongoDB auto-generates _id

    // Link to the Vital Log record that caused the anomaly (or "N/A" for manual)
    logId: {
        type: String,
        required: true,
        // Often you might use an ObjectId here, but using String to match the logId 
        // structure and manual entry placeholder we used in the front-end form.
    },

    // ⭐️ NEW FIELD: Link to the astronaut involved ⭐️
    astronautId: {
        type: String,
        required: true,
        // This is crucial for tracking and filtering in the dashboard
    },

    detectionSource: {
        type: String,
        required: true,
        trim: true,
    },

    anomalyType: {
        type: String,
        required: true,
        trim: true,
    },

    severityLevel: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High', 'Critical'],
    },

    responseAction: {
        type: String,
        required: true,
        trim: true,
    },

    detectionTime: {
        type: Date,
        required: true,
        default: Date.now,
    },

    // You could optionally add a timestamp here for when the record was created/updated
    // createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Anomaly', anomalySchema);

