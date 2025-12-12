# Taskoscope MCP Configuration

This document describes how to configure and connect a Playwright MCP (Model Context Protocol) server to extend Taskoscope's capabilities with real web scraping and content extraction.

## Overview

The MCP server acts as a bridge between Taskoscope and external web content. When connected, it enables:
- Real-time web page content extraction
- Automated citation generation from live pages
- PDF content parsing
- Screenshot capture for research documentation

## Prerequisites

- Node.js 18+ or Bun runtime
- Playwright installed (`npm install playwright`)
- Network access to target websites

## Setting Up the MCP Server

### Option 1: Minimal Express Wrapper

Create a simple Express server that wraps Playwright:

```javascript
// mcp-server/index.js
const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

let browser;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

// Extract endpoint - matches POST /api/extract
app.post('/api/extract', async (req, res) => {
  const { url } = req.body;
  
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const title = await page.title();
    const text = await page.evaluate(() => document.body.innerText.slice(0, 5000));
    
    // Extract metadata
    const metaAuthors = await page.evaluate(() => {
      const authorMeta = document.querySelector('meta[name="author"]');
      const dcCreator = document.querySelector('meta[name="DC.creator"]');
      return authorMeta?.content || dcCreator?.content || '';
    });
    
    const year = await page.evaluate(() => {
      const dateMeta = document.querySelector('meta[name="date"]');
      const dcDate = document.querySelector('meta[name="DC.date"]');
      const dateStr = dateMeta?.content || dcDate?.content;
      return dateStr ? new Date(dateStr).getFullYear().toString() : new Date().getFullYear().toString();
    });
    
    await page.close();
    
    // Generate citations
    const authors = metaAuthors ? metaAuthors.split(',').map(a => a.trim()) : ['Unknown'];
    const citationAPA = `${authors.join(', ')}. (${year}). ${title}. Retrieved from ${url}`;
    const bibtex = `@misc{${title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20)},
  author = {${authors.join(' and ')}},
  title = {${title}},
  year = {${year}},
  url = {${url}},
  note = {Accessed: ${new Date().toISOString().split('T')[0]}}
}`;
    
    res.json({
      title,
      authors,
      year,
      doi: null,
      text,
      citationAPA,
      bibtex
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crawl endpoint - for batch ingestion
app.post('/api/crawl', async (req, res) => {
  const { urls } = req.body;
  
  try {
    const browser = await getBrowser();
    const results = [];
    
    for (const url of urls) {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      const title = await page.title();
      const preview = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="description"]');
        return meta?.content || document.body.innerText.slice(0, 200);
      });
      
      results.push({
        sourceId: `src-${Date.now()}-${results.length}`,
        url,
        title,
        type: 'web',
        preview
      });
      
      await page.close();
    }
    
    res.json({ status: 'ok', sources: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Screenshot endpoint
app.post('/api/screenshot', async (req, res) => {
  const { url } = req.body;
  
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    const screenshot = await page.screenshot({ type: 'png', fullPage: false });
    await page.close();
    
    res.set('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.MCP_PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit();
});
```

### Option 2: Official Playwright MCP

Use the official Playwright MCP server from:
https://github.com/anthropics/anthropic-cookbook/tree/main/mcp/servers/playwright

## API Contract Reference

### POST /api/extract

Request:
```json
{
  "url": "https://example.com/article"
}
```

Response:
```json
{
  "title": "Article Title",
  "authors": ["Author Name"],
  "year": "2024",
  "doi": null,
  "text": "Extracted page content...",
  "citationAPA": "Author Name. (2024). Article Title. Retrieved from https://example.com/article",
  "bibtex": "@misc{article_title,...}"
}
```

### POST /api/crawl

Request:
```json
{
  "urls": [
    "https://example.com/page1",
    "https://example.com/page2"
  ]
}
```

Response:
```json
{
  "status": "ok",
  "sources": [
    {
      "sourceId": "src-1234567890-0",
      "url": "https://example.com/page1",
      "title": "Page 1 Title",
      "type": "web",
      "preview": "Page description..."
    }
  ]
}
```

## Connecting to Taskoscope

### 1. Environment Configuration

Set the MCP server URL in your environment:

```bash
VITE_MCP_SERVER_URL=http://localhost:3001
```

### 2. Update API Service

Modify `src/services/api.ts` to use MCP when available:

```typescript
const MCP_URL = import.meta.env.VITE_MCP_SERVER_URL;

export async function extract(url: string) {
  if (MCP_URL) {
    const response = await fetch(`${MCP_URL}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return response.json();
  }
  // Fall back to mockApi
  return mockApi.extract(url);
}
```

### 3. Lovable MCP Configuration

If using Lovable's built-in MCP support, add to your project settings:

```json
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:3001",
      "endpoints": [
        "/api/extract",
        "/api/crawl",
        "/api/screenshot"
      ]
    }
  }
}
```

## Fallback Behavior

The prototype is designed to work without MCP:
- All endpoints have mock implementations in `src/services/mockApi.ts`
- The UI functions identically with demo data
- MCP is optional and enhances the experience with live data

## Testing the MCP Connection

1. Start the MCP server: `node mcp-server/index.js`
2. Test the extract endpoint:
   ```bash
   curl -X POST http://localhost:3001/api/extract \
     -H "Content-Type: application/json" \
     -d '{"url": "https://en.wikipedia.org/wiki/Quantum_computing"}'
   ```
3. Verify the response matches the expected format

## Security Notes

- The MCP server should only be accessible from trusted origins
- Consider adding CORS restrictions for production
- Rate limit requests to prevent abuse
- Sanitize extracted content before rendering

## Troubleshooting

**Connection refused**: Ensure MCP server is running on the expected port

**Timeout errors**: Some pages may take longer to load; adjust timeout values

**Empty content**: The page may use JavaScript rendering; try waitUntil: 'networkidle'

**CORS errors**: Add appropriate CORS headers to the MCP server response
