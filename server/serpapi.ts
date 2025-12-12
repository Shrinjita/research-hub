import express from "express";
import fetch from "node-fetch"; // install if not already: npm install node-fetch
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// POST /api/serpapi/search_scholar
router.post("/search_scholar", async (req, res) => {
  try {
    const { q } = req.body;
    if (!q) return res.status(400).json({ error: "Query is required" });

    const params = new URLSearchParams({
      engine: "google_scholar",
      q,
      api_key: process.env.SERPAPI_KEY || "",
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    // Send only top 5 results to frontend
    const results = (data?.organic_results || []).slice(0, 5).map((r: any) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet,
      authors: r.publication_info?.summary || "",
    }));

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "SerpApi request failed" });
  }
});

export default router;
