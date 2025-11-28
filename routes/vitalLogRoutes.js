// At the top of routes/vitalLogRoutes.js
const { generateResponseAction } = require('../services/aiService'); // <-- Corrected path to go up one level (..)
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables (like GEMINI_API_KEY)

// ... rest of the requires (express, router, VitalLog, Anomaly, Astronaut)
const express = require("express");
const router = express.Router();
const VitalLog = require("../models/vitalLog");
const Astronaut = require("../models/Astronaut");
// ⭐️ 1. IMPORT ANOMALY MODEL ⭐️
const Anomaly = require("../models/Anomaly"); // ASSUMPTION: Anomaly model path is correct
const mongoose = require('mongoose');

// Middleware to find log by ID (for DRY code - assuming this is for MongoDB _id)
async function getLog(req, res, next) {
    // ... (Your getLog function remains unchanged)
    let log;
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid Log ID format. Must be a 24-character hex string.' });
        }
        log = await VitalLog.findById(req.params.id);
        if (log == null) {
            return res.status(404).json({ error: 'Vital Log not found' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
    res.log = log;
    next();
}

// ----------------------------------------------------------------------
// GET ALL VITAL LOGS
// ----------------------------------------------------------------------
router.get("/", async (req, res) => {
    try {
        const logs = await VitalLog.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------------------------------------------------------
// POST → ADD NEW VITAL LOG (WITH ANOMALY DETECTION)
// ----------------------------------------------------------------------
router.post("/", async (req, res) => {
    try {
        // Check if Astronaut exists
        const astronautExists = await Astronaut.findOne({ 
            astronautId: req.body.astronautId 
        });
        
        if (!astronautExists) {
            return res.status(404).json({ error: `Astronaut with ID ${req.body.astronautId} not found. Vitals cannot be logged.` });
        }
        
        // 1. Proceed with saving the vital log
        const vitalLog = new VitalLog(req.body);
        const savedLog = await vitalLog.save();

        // -----------------------------------------------------
        // ⭐️ 2. ANOMALY DETECTION LOGIC ⭐️
        // (Using simplified numbers. Adjust these thresholds for your application)
        const thresholds = {
            // Assuming heartRate is just a number
            heartRate: { high: 120, low: 40 }, // Beats Per Minute (BPM)
            // Assuming temperature is just a number (e.g., in Celsius)
            temperature: { high: 38.5 }, // °C
            // Assuming bloodPressure is an object/string, but your PATCH suggests it's a property itself. 
            // We'll skip BP detection for now unless your model shows systolic/diastolic fields.
            oxygenLevel: { low: 90 }, // SpO2 %
            stressLevel: { high: 8 } // Scale 1-10
        };
        
        const anomalies = [];
        const { heartRate, temperature, oxygenLevel, stressLevel } = savedLog;
        const logId = savedLog._id; // The ID of the newly saved Vital Log

        // --- Detection Rules ---
        
        // Rule: Heart Rate Spike/Dip
        if (heartRate > thresholds.heartRate.high) {
            anomalies.push({
                logId: logId,
                detectionSource: "HR Sensor",
                anomalyType: "Heart Rate Spike (Tachycardia)",
                severityLevel: "High",
                responseAction: `HR > ${thresholds.heartRate.high}. Review activity log.`,
                detectionTime: new Date()
            });
        } else if (heartRate < thresholds.heartRate.low) {
             anomalies.push({
                logId: logId,
                detectionSource: "HR Sensor",
                anomalyType: "Heart Rate Dip (Bradycardia)",
                severityLevel: "High",
                responseAction: `HR < ${thresholds.heartRate.low}. Check for sleep/syncope.`,
                detectionTime: new Date()
            });
        }

        // Rule: High Temperature
        if (temperature > thresholds.temperature.high) {
            anomalies.push({
                logId: logId,
                detectionSource: "Temp Sensor",
                anomalyType: "Hyperthermia",
                severityLevel: "Medium",
                responseAction: `Temp > ${thresholds.temperature.high}°C. Monitor cooling system.`,
                detectionTime: new Date()
            });
        }
        
        // Rule: Low Oxygen Level
        if (oxygenLevel < thresholds.oxygenLevel.low) {
            anomalies.push({
                logId: logId,
                detectionSource: "Pulse Oximeter",
                anomalyType: "Hypoxia (Low Oxygen)",
                severityLevel: "Critical",
                responseAction: `O2 < ${thresholds.oxygenLevel.low}%. Immediate cabin air check.`,
                detectionTime: new Date()
            });
        }
        
        // Rule: Extreme Stress Level
        if (stressLevel >= thresholds.stressLevel.high) {
             anomalies.push({
                logId: logId,
                detectionSource: "EEG/Activity Log",
                anomalyType: "Extreme Stress Event",
                severityLevel: "Medium",
                responseAction: `Stress Level ${stressLevel}. Check mission task load.`,
                detectionTime: new Date()
            });
        }

        // 3. Save any detected anomalies to the database
        if (anomalies.length > 0) {
            await Anomaly.insertMany(anomalies);
            console.log(`[Anomaly Detection] ${anomalies.length} anomaly/anomalies created for Vital Log: ${logId}`);
        }

        // -----------------------------------------------------

        res.status(201).json(savedLog);
    } catch (err) {
        res.status(400).json({ error: err.message }); 
    }
});

// ----------------------------------------------------------------------
// ... (The rest of your routes: GET /:id, PATCH /:id, DELETE /:id remain unchanged)
// ----------------------------------------------------------------------

router.get("/:id", getLog, (req, res) => {
    res.json(res.log);
});

router.patch("/:id", getLog, async (req, res) => {
    // Only update fields that are provided in the request body
    if (req.body.heartRate != null) {
        res.log.heartRate = req.body.heartRate;
    }
    if (req.body.bloodPressure != null) {
        res.log.bloodPressure = req.body.bloodPressure;
    }
    if (req.body.temperature != null) {
        res.log.temperature = req.body.temperature;
    }
    if (req.body.oxygenLevel != null) {
        res.log.oxygenLevel = req.body.oxygenLevel;
    }
    if (req.body.stressLevel != null) {
        res.log.stressLevel = req.body.stressLevel;
    }

    // You should re-validate the astronautId/missionId if they are provided

    try {
        const updatedLog = await res.log.save();
        res.json(updatedLog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete("/:id", getLog, async (req, res) => {
    try {
        await VitalLog.deleteOne({ _id: res.log._id }); 
        res.json({ message: 'Vital Log deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;