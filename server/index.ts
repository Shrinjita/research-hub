// File: /mnt/c/Users/Shrinjita Paul/Documents/GitHub/research-hub/server/index.ts

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '/mnt/c/Users/Shrinjita Paul/Documents/GitHub/research-hub/.env' });

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.VITE_GEMINI_API_KEY
});

// -------------------- Endpoints -------------------- //

// Generate summary for a given text
// POST /api/gemini/summarize
app.post('/api/gemini/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text }] }]
    });

    res.json({ summary: response.text || 'No summary generated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ summary: 'Fallback summary due to API failure' });
  }
});

// Extract citations (mock or Gemini-based)
// POST /api/gemini/extract_citations
app.post('/api/gemini/extract_citations', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: `Extract citations from:\n${text}` }] }]
    });

    // For MVP fallback
    const citations = response.text
      ? response.text.split('\n').filter(Boolean)
      : ['Citation 1 (Fallback)', 'Citation 2 (Fallback)'];

    res.json(citations);
  } catch (err) {
    console.error(err);
    res.json(['Fallback citation 1', 'Fallback citation 2']);
  }
});

// Combine multiple sources into literature survey
// POST /api/gemini/combine_sources
app.post('/api/gemini/combine_sources', async (req, res) => {
  try {
    const { sources } = req.body;
    if (!sources || !Array.isArray(sources)) return res.status(400).json({ error: 'Sources required' });

    const combinedText = sources.map((s: any) => `${s.title}\n${s.content}`).join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: `Create a literature survey from the following:\n${combinedText}` }] }]
    });

    res.json({
      introduction: 'Generated Introduction',
      keyFindings: 'Generated Key Findings',
      comparativeAnalysis: 'Generated Comparative Analysis',
      gaps: 'Generated Research Gaps',
      conclusion: response.text || 'Generated Conclusion'
    });
  } catch (err) {
    console.error(err);
    res.json({
      introduction: 'Fallback Introduction',
      keyFindings: 'Fallback Key Findings',
      comparativeAnalysis: 'Fallback Comparative Analysis',
      gaps: 'Fallback Gaps',
      conclusion: 'Fallback Conclusion'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Gemini proxy server running at http://localhost:${port}`);
});
