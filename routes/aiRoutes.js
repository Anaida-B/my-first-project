// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Initialize the AI client (it will automatically use GEMINI_API_KEY from .env)
const ai = new GoogleGenAI({});

// Define the system instruction for the user-facing assistant
const systemInstruction = `You are a highly knowledgeable and supportive AI Health Assistant specializing in aerospace medicine and astronaut health protocols. When a user asks a health or procedure-related question, provide a detailed, accurate, and concise answer. Structure your response clearly with headings or bullet points. Always prioritize safety and established NASA/ESA/Roscosmos protocols, and remind the user that all actions must be confirmed by Mission Control.`;

// POST route for handling user health queries
router.post('/query', async (req, res) => {
    const { astronautId, userQuery } = req.body;

    if (!userQuery) {
        return res.status(400).json({ message: "Query text is required." });
    }

    const fullPrompt = `Astronaut ID: ${astronautId}. User Query: "${userQuery}". Provide a detailed and safe response suitable for use by mission control or the astronaut.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5, // Slightly higher for more detailed answers
            }
        });

        // Send the AI's generated response text back to the frontend
        const aiResponseText = response.text.trim();
        res.json({ result: aiResponseText });

    } catch (error) {
        console.error("AI Query Route Error:", error);
        res.status(500).json({ 
            message: "AI Health Assistant is offline. Please consult standard procedure manuals." 
        });
    }
});

module.exports = router;