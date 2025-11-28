const express = require('express');
const router = express.Router();
const Anomaly = require('../models/Anomaly');
const mongoose = require('mongoose');

// --- Middleware to find Anomaly by ID (DRY Code) ---
async function getAnomaly(req, res, next) {
    let anomaly;
    try {
        // Basic check for valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Anomaly ID format.' });
        }
        
        // Find the anomaly, populating the logId if it's a valid reference
        anomaly = await Anomaly.findById(req.params.id);
        
        if (anomaly == null) {
            // Server correctly signals 404 if ID is valid but not found
            return res.status(404).json({ message: 'Anomaly not found' });
        }
    } catch (err) {
        // Handles internal server errors (e.g., database connection issues)
        return res.status(500).json({ message: err.message });
    }
    
    // Attach the found anomaly to the response object for the next route handler
    res.anomaly = anomaly;
    next();
}

// ----------------------------------------------------------------------
// POST → Create a new Anomaly (Manual or Auto-generated)
// ----------------------------------------------------------------------
router.post('/', async (req, res) => {
    try {
        const anomaly = new Anomaly(req.body);
        const savedAnomaly = await anomaly.save();
        res.status(201).json(savedAnomaly);
    } catch (error) {
        // 400 for validation errors (e.g., missing required fields)
        res.status(400).json({ message: error.message });
    }
});

// ----------------------------------------------------------------------
// GET → Get all Anomalies
// ----------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        // Note: Removed .populate('logId') as logId is now a simple String in the model, not a reference.
        const anomalies = await Anomaly.find().sort({ detectionTime: -1 }); 
        res.json(anomalies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ----------------------------------------------------------------------
// GET → Get a single Anomaly by ID
// ----------------------------------------------------------------------
router.get('/:id', getAnomaly, (req, res) => {
    // getAnomaly middleware already found and attached the anomaly to res.anomaly
    res.json(res.anomaly);
});

// ----------------------------------------------------------------------
// PATCH → Update an existing Anomaly
// ----------------------------------------------------------------------
router.patch('/:id', getAnomaly, async (req, res) => {
    // Iterate through allowed fields and update the anomaly object only if the field is present
    const allowedUpdates = [
        'astronautId', 'anomalyType', 'logId', 
        'detectionSource', 'severityLevel', 'responseAction', 
        'detectionTime'
    ];
    
    let updated = false;

    allowedUpdates.forEach(key => {
        if (req.body[key] !== undefined) {
            res.anomaly[key] = req.body[key];
            updated = true;
        }
    });

    if (!updated) {
        return res.status(400).json({ message: "No valid fields provided for update." });
    }

    try {
        const updatedAnomaly = await res.anomaly.save();
        res.json(updatedAnomaly);
    } catch (error) {
        // 400 for validation errors (e.g., setting severity to an unallowed value)
        res.status(400).json({ message: error.message });
    }
});

// ----------------------------------------------------------------------
// DELETE → Delete an Anomaly
// ----------------------------------------------------------------------
router.delete('/:id', getAnomaly, async (req, res) => {
    try {
        // Use the instance found by getAnomaly middleware
        await res.anomaly.deleteOne(); 
        res.json({ message: 'Anomaly deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;