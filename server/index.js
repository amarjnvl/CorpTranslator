require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Translation = require('./models/Translation');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/corporate-translator')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes

// GET /api/history - Retrieve last 10 translations
app.get('/api/history', async (req, res) => {
    try {
        const history = await Translation.find().sort({ timestamp: -1 }).limit(10);
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// POST /api/translate - Create translation using Gemini AI
app.post('/api/translate', async (req, res) => {
    const { text, tone, context, audience } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const selectedTone = tone || 'Neutral';
    const selectedContext = context || 'Email';
    const selectedAudience = audience || 'Peer';

    // --- GEMINI AI TRANSLATION ---
    const systemPrompt = `You are an elite corporate communication strategist for Fortune 500 executives and high-growth startups.
    
    Task: Rewrite the input text into professional corporate language.
    
    Target Tone: ${selectedTone}
    Target Audience: ${selectedAudience}
    Context: ${selectedContext}
    
    Guidelines based on Tone:
    - Helpful: Use collaborative language ("we", "us"), focus on support and unblocking.
    - Neutral: Be objective, remove emotion, state facts clearly.
    - Firm: Use active voice, set clear boundaries, no hedging words (e.g., delete "maybe", "I think").
    - Ruthless: Extreme brevity. Focus purely on outcome. If communicating upwards, focus on risk/cost. If downwards, focus on speed/execution.
    - C-Level: Think in terms of ROI, Scalability, and OKRs. Bottom line up front (BLUF). Max 2 sentences.
    
    Guidelines based on Context:
    - Slack: Conversational but professional. Use industry buzzwords sparingly (e.g., "sync", "bandwidth").
    - Jira: Technical and precise. Focus on "blockers", "dependencies", and "deliverables".
    - Email: Standard formal business structure.
    
    Input Text: '${text}'
    Output: Return ONLY the polished rewrite. Do not add quotes or intros.`;

    let translatedText = '';

    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            // Fallback to mock logic if no API key
            console.warn('GEMINI_API_KEY not configured, using mock logic.');
            translatedText = `[Mock - ${selectedTone}] ${text}`;
        } else {
            // Call Gemini AI
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            translatedText = response.text().trim();
        }
    } catch (aiError) {
        console.error('Gemini AI Error Details:', JSON.stringify(aiError, null, 2));
        console.error('Gemini AI Error Message:', aiError.message);
        // Return specific error for client-side handling
        return res.status(503).json({
            error: 'AI service unavailable. Please check your API key or try again later.',
            details: aiError.message
        });
    }
    // -----------------------------

    try {
        const newTranslation = new Translation({
            originalText: text,
            translatedText,
            tone: selectedTone,
            context: selectedContext,
            audience: selectedAudience
        });

        const savedTranslation = await newTranslation.save();
        res.json({ translation: translatedText, id: savedTranslation._id });
    } catch (error) {
        console.error('Error saving translation:', error);
        res.status(500).json({ error: 'Failed to save translation' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});