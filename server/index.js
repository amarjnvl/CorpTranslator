require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Translation = require('./models/Translation');
const Team = require('./models/Team');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'x-gemini-api-key']
}));
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

// GET /api/team - Get team settings
app.get('/api/team', async (req, res) => {
    try {
        let team = await Team.findOne();
        if (!team) {
            team = new Team({ name: 'My Team', bannedWords: [], requiredPhrases: [] });
            await team.save();
        }
        res.json(team);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Failed to fetch team settings' });
    }
});

// POST /api/team - Update team settings
app.post('/api/team', async (req, res) => {
    const { bannedWords, requiredPhrases } = req.body;
    try {
        let team = await Team.findOne();
        if (!team) {
            team = new Team({ name: 'My Team', bannedWords: [], requiredPhrases: [] });
        }
        if (bannedWords) team.bannedWords = bannedWords;
        if (requiredPhrases) team.requiredPhrases = requiredPhrases;

        await team.save();
        res.json(team);
    } catch (error) {
        console.error('Error saving team:', error);
        res.status(500).json({ error: 'Failed to save team settings' });
    }
});

// POST /api/translate - Create translation using Gemini AI
app.post('/api/translate', async (req, res) => {
    const { text, tone, context, audience, reverseMode } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const selectedTone = tone || 'Neutral';
    const selectedContext = context || 'Email';
    const selectedAudience = audience || 'Peer';

    // Fetch Team Rules
    let teamRules = "";
    try {
        const team = await Team.findOne();
        if (team) {
            if (team.bannedWords.length > 0) {
                teamRules += `\n    - STRICTLY AVOID these words: ${team.bannedWords.join(', ')}.`;
            }
            if (team.requiredPhrases.length > 0) {
                teamRules += `\n    - TRY TO INCLUDE these phrases: ${team.requiredPhrases.join(', ')}.`;
            }
        }
    } catch (err) {
        console.warn("Failed to fetch team rules", err);
    }

    // --- GEMINI AI TRANSLATION ---
    const customApiKey = req.headers['x-gemini-api-key'];
    let aiClient = genAI; // Default client using .env key

    // If custom key provided (BYOK), create temporary client instance
    if (customApiKey) {
        aiClient = new GoogleGenerativeAI(customApiKey);
    }

    let systemPrompt;

    if (reverseMode) {
        // Reverse Translator: Decode corporate jargon into plain English
        systemPrompt = `You are a corporate jargon decoder helping junior employees understand cryptic workplace communication.
        
        Task: Translate the corporate-speak input into plain, simple English that anyone can understand.
        
        Guidelines:
        - Decode buzzwords and corporate phrases into their real meaning
        - Explain what the speaker ACTUALLY wants or means
        - Keep the tone friendly and helpful
        - If there's a hidden agenda or subtext, expose it gently
        - Add a one-line "Translation Summary" at the end
        
        Examples:
        - "Let's circle back" → "We'll discuss this later (maybe never)"
        - "I'll take this offline" → "I want to discuss this privately, not in this meeting"
        - "We need to align on synergies" → "We need to agree on how to work together"
        
        Input Text: '${text}'
        Output: Return the plain English translation. Be helpful and slightly humorous but professional.`;
    } else {
        // Standard Corporate Translator
        systemPrompt = `You are an elite corporate communication strategist for Fortune 500 executives and high-growth startups.
    
    Task: Rewrite the input text into professional corporate language.
    
    Target Tone: ${selectedTone}
    Target Audience: ${selectedAudience}
    Context: ${selectedContext}
    
    Brand Guidelines (MUST FOLLOW):${teamRules}
    
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
    }

    let translatedText = '';

    try {
        // Check if API key is configured (either env or custom)
        const hasKey = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') || customApiKey;

        if (!hasKey) {
            // Fallback to mock logic if no API key
            console.warn('GEMINI_API_KEY not configured, using mock logic.');
            translatedText = `[Mock - ${selectedTone}] ${text}`;
        } else {
            // Call Gemini AI using the appropriate client
            const model = aiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

// POST /api/feedback - Add feedback to a translation
app.post('/api/feedback', async (req, res) => {
    const { translationId, rating } = req.body;

    if (!translationId || !rating) {
        return res.status(400).json({ error: 'Missing translationId or rating' });
    }

    try {
        await Translation.findByIdAndUpdate(translationId, { feedback: rating });
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});