import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import serpapiRoutes from "./serpapi";

// Load env FIRST
dotenv.config({
  path: "/mnt/c/Users/Shrinjita Paul/Documents/GitHub/research-hub/.env",
});

// Single server instance
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mount SerpAPI backend
app.use("/api/serpapi", serpapiRoutes);

// Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.VITE_GEMINI_API_KEY,
});

// --------- Gemini Routes --------- //

app.post("/api/gemini/summarize", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const r = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text }] }],
    });

    res.json({ summary: r.text || "No summary generated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ summary: "Fallback summary due to API failure" });
  }
});

app.post("/api/gemini/extract_citations", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const r = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: `Extract citations:\n${text}` }] }],
    });

    const citations =
      r.text?.split("\n").filter(Boolean) ||
      ["Fallback citation 1", "Fallback citation 2"];

    res.json(citations);
  } catch (err) {
    console.error(err);
    res.json(["Fallback citation 1", "Fallback citation 2"]);
  }
});

app.post("/api/gemini/combine_sources", async (req, res) => {
  try {
    const { sources } = req.body;
    if (!Array.isArray(sources))
      return res.status(400).json({ error: "Sources required" });

    const combined = sources
      .map((s: any) => `${s.title}\n${s.content}`)
      .join("\n\n");

    const r = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        { parts: [{ text: `Create literature survey from:\n${combined}` }] },
      ],
    });

    res.json({
      introduction: "Generated Introduction",
      keyFindings: "Generated Key Findings",
      comparativeAnalysis: "Generated Comparative Analysis",
      gaps: "Generated Research Gaps",
      conclusion: r.text || "Generated Conclusion",
    });
  } catch (err) {
    console.error(err);
    res.json({
      introduction: "Fallback Introduction",
      keyFindings: "Fallback Key Findings",
      comparativeAnalysis: "Fallback Comparative Analysis",
      gaps: "Fallback Gaps",
      conclusion: "Fallback Conclusion",
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
